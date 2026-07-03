# Stage 2: 通信層の刷新 設計書

作成日: 2026-07-04

## 背景

BoardGameFront の5ゲーム(timebomb / werewolf / hideout / decrypt / fakeartist)は、リアルタイム通信に **メンテナンス終了済みの `react-stomp`**(v5.1.0)を各ページで直接使用している。`react-stomp` は内部で旧 `stompjs`(v2)+ `sockjs-client` を抱えており、以下の負債がある。

- ライブラリがメンテ終了。React 19 では peer deps 未宣言のため `legacy-peer-deps` で無理に共存させている(Stage 1 の申し送り)
- 各ゲームページに `SockJsClient` が JSX として埋め込まれ、`clientObj` を `useState` で保持 → 命令的に `sendMessage` を呼ぶ、という React と噛み合わない構造
- 切断時は `console.log('接続が切れました')` のみで、自動再接続もユーザーへの通知もない

Stage 2 はこの通信層を **`@stomp/stompjs` v7 + `sockjs-client`** に置換し、型付きの共通フック `useGameSocket` に集約する。**バックエンド(Spring / SockJS+STOMP)は無変更**で互換を維持する。

## 現状の通信パターン(全5ゲーム、調査済み)

すべてのゲームが `react-stomp` の `SockJsClient` を同一パターンで使用:

- `url` = `SystemConst.Server.AP_HOST + SystemConst.Server.ENDPOINT`
- `topics`: **timebomb のみ `/topic/{roomId}/timebomb`**、他4ゲームは `/topic/{roomId}`
- `ref` で client を `clientObj` state に保持 → `clientObj.sendMessage(destination, JSON.stringify(payload))` で送信(**呼び出し側が JSON.stringify する**)
- `onMessage(msg)` = ゲーム固有の受信ハンドラ(`receve` 等、status コードの巨大 switch)
- `onConnect` → `setIsConnected(true)`(**decrypt のみ isConnected 未使用**)
- `onDisconnect` → `disconnect`(console.log のみ)

## ゴールと非ゴール

### ゴール

1. `react-stomp` を `@stomp/stompjs` v7 + `sockjs-client` に置換し、依存から削除する
2. 型付き共通フック `useGameSocket` を1つ作り、5ゲームで共用する
3. 自動再接続を導入し、切断/再接続を控えめな UI で通知する
4. `useGameSocket` にユニットテストを整備する

### 非ゴール

- バックエンド(Java / SockJS エンドポイント `boardgame-endpoint`、STOMP トピック、宛先 `/app/*`)の変更 — 互換維持
- 各ゲームの受信ハンドラ(`receve` の status switch)の reducer 化 — **Stage 3** で実施
- ゲームのUI・進行・見た目の変更(接続インジケータの追加を除く)

## 決定事項(ヒアリング結果)

| 項目 | 決定 |
|---|---|
| 接続状態のUI | 控えめなインジケータを追加(再接続中/切断時のみ小さく表示、接続中は非表示) |
| Stage 2 の範囲 | 通信層の差し替えに限定(受信ハンドラは無変更、reducer化はStage 3) |
| ライブラリ | @stomp/stompjs v7 + sockjs-client(全体設計で承認済み) |
| ブランチ | master から `refactor/stage2-communication` を新規作成 |
| PR | Stage 2 全体で1本 |

## アーキテクチャ

### ディレクトリ構成(追加)

```
src/lib/stomp/
  useGameSocket.ts   # @stomp/stompjs Client をラップした共通フック ★テスト対象
  types.ts           # ConnectionStatus 等の型
src/components/common/
  ConnectionStatus.tsx   # 控えめな接続状態インジケータ
```

### `useGameSocket` フック

```ts
type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

function useGameSocket(opts: {
  topic: string;                    // 呼び出し側が組み立てる(timebomb: `/topic/${roomId}/timebomb`、他: `/topic/${roomId}`)
  onMessage: (msg: any) => void;    // ゲーム固有の受信ハンドラ(既存の receve をそのまま渡す)
  enabled: boolean;                 // roomId 未確定(router未準備)の間は接続しない
}): {
  status: ConnectionStatus;
  connected: boolean;               // status === 'connected'
  send: (destination: string, payload: unknown) => void;
};
```

内部仕様:
- `new Client({ webSocketFactory: () => new SockJS(AP_HOST + ENDPOINT), reconnectDelay: 5000 })`
- `enabled` が true になったら `activate()`、アンマウント/`enabled` false で `deactivate()`
- 接続確立(`onConnect`)後に `topic` を購読。受信 body を `JSON.parse`(失敗時は生文字列)して `onMessage` に渡す(react-stomp の `_processMessage` と同じ挙動)
- `send(dest, payload)`: `client.publish({ destination: dest, body: JSON.stringify(payload) })`。**未接続時は例外を投げる**(現状の `sendMessage` と同じ挙動 → 既存の try/catch がそのまま機能する)
- 再接続時に既存 subscription を破棄してから再購読(重複購読防止)
- `status` を state として公開。`onWebSocketClose`/`activate` 等のライフサイクルで `connecting`→`connected`→`reconnecting`→... を反映

### 接続インジケータ `ConnectionStatus`

- props: `{ status: ConnectionStatus }`
- `reconnecting` / `disconnected` のときだけ画面端に小さなバナー(例: 「再接続中…」)を表示。`connected` / `connecting`(初回)では何も表示しない
- 各ゲームページに1要素差し込むだけ

### 各ゲームページの変更(差し替えのみ)

Before:
```tsx
const [clientObj, setClientObj] = useState(null);
const [isConnected, setIsConnected] = useState(false);
...
clientObj.sendMessage(url, JSON.stringify(msg));
...
<SockJsClient url={...} topics={['/topic/'+roomId]} ref={c=>setClientObj(c)} onMessage={receve} onConnect={()=>setIsConnected(true)} onDisconnect={disconnect} />
```

After:
```tsx
const { connected, status, send } = useGameSocket({
  topic: `/topic/${roomId}`,          // timebomb だけ `/topic/${roomId}/timebomb`
  onMessage: receve,                   // 受信ハンドラは無変更
  enabled: !!roomId,
});
...
send(url, msg);                        // JSON.stringify はフック内部で行う(呼び出し側からは外す)
...
<ConnectionStatus status={status} />
```

- **受信ロジック(`receve` の status switch)は一切変更しない**
- `isConnected` → `connected` に置換。decrypt は元々未使用なので `connected` を無視
- **送信呼び出しから `JSON.stringify()` を外す**(フックが内部で行うため。二重エンコード防止 — 移行時の必須チェック項目)
- 各ゲームの `disconnect`(console.log 関数)は不要になるため削除

## 移行順

共通フック・インジケータ・テストを先に作り、その後ゲームを1つずつ移行(各移行後に本番接続で動作確認):

1. **hideout**(素直な `/topic/{roomId}`、送信箇所少)= パターン確立
2. **decrypt**(`isConnected` 未使用の特殊ケース)
3. **werewolf**
4. **fakeartist**
5. **timebomb**(唯一 `/topic/{roomId}/timebomb` の別トピック)

全5ゲーム移行後に **`react-stomp` を依存から削除**。

## テスト戦略

- **`useGameSocket` のユニットテスト**(主戦場): `@stomp/stompjs` の `Client` をモックし、
  - `enabled` false の間は接続せず、true で `activate()` される
  - 接続時に指定 `topic` を購読する
  - `send()` が `publish({ destination, body: JSON.stringify(payload) })` を呼ぶ / 未接続時は例外を投げる
  - 受信 body を `JSON.parse` して `onMessage` に渡す(不正JSONは生文字列で渡す)
  - status 遷移(connecting→connected→reconnecting)
  - 再接続時に重複購読しない(古い subscription を破棄)
- `ConnectionStatus`(UI)の網羅テストは書かない(方針通り)

## 検証

- 各ゲーム移行後、本番 Heroku 接続で「入室 → ゲーム進行」を確認(Stage 1 と同じ手法。ブラウザ複数タブ)
- **再接続**: dev サーバ再起動やネットワーク断で `reconnecting` バナーが出て自動復帰することを確認
- 送受信の往復(送信 → バックエンドが `/topic` にブロードキャスト → UI 反映)が全ゲームで成立することを確認

## リスク

| リスク | 対策 |
|---|---|
| 二重 stringify / stringify 外し漏れ | 移行チェックリスト化。1ゲームずつ本番で送受信往復を確認 |
| 接続前 subscribe のタイミング | フック内で `onConnect` 後に購読。ユニットテストで担保 |
| timebomb の別トピック取り違え | timebomb を最後に回し、topic 文字列を明示検証 |
| 再接続時の重複購読 | アンマウント/再接続時に既存 subscription を破棄。ユニットテストで担保 |
| @stomp/stompjs と sockjs-client の peer 整合 | Stage 1 の `.npmrc`(legacy-peer-deps)下で導入。react-stomp 削除後に peer 警告が減る想定 |

## 完了条件

- `react-stomp` が依存から削除され、全5ゲームが `useGameSocket` 経由で本番バックエンドと送受信できる
- `useGameSocket` のユニットテストが通る
- 切断時に自動再接続し、`reconnecting` インジケータが表示される
