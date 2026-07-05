# フロントエンド アーキテクチャ

Next.js 15(Pages Router)/ React 19 / TypeScript 5 / Vitest。5つのリアルタイムボードゲーム(timebomb / werewolf / hideout / decrypt / fakeartist)を提供する。公開の入口はトップページ(セカンドワンナイト人狼 = werewolf の LP)のみで、他4ゲームは非公開の `/secret` 経由でアクセスする。

この文書は**現在の実装**を説明する。実装を変更したら同じ PR でこの文書を更新すること。今後の変更予定は [../roadmap.md](../roadmap.md) を参照。

## ディレクトリ構造

```
frontend/src/
  features/<game>/       # ゲームごとの実装(5ゲーム同構造)
    reducer.ts           #   メッセージ→状態遷移の純粋関数 ★ユニットテスト対象
    reducer.test.ts
    types.ts             #   State / Action / サーバペイロードの型
    use<Game>Room.ts     #   useReducer + useGameSocket + 副作用(useEffect)を束ねるフック
    components/          #   ゲーム固有 UI
  lib/stomp/
    useGameSocket.ts     # 共通 STOMP 接続フック(全ゲーム共用)★テスト対象
    types.ts             # ConnectionStatus / GameSocket 型
  lib/imageToIconDataUrl.ts # アップロード画像をアイコン用 JPEG Data URL に変換
  components/
    common/              # 2ゲーム以上で使う共通 UI(RoomInForm / ConnectionStatus / Start / Countdown / SakuraParticles 等)
    home/                # /secret 専用の部品(creategamebtn.tsx 等)
    lp/                  # トップページ(LP)専用の部品(useReveal / Reveal / LeafFall / RoomCreateCta / RoomJoinByCode)
    ...                  # レイアウト・チャット・モーダル等の汎用部品
  pages/index.tsx        # トップページ = セカンドワンナイト人狼(werewolf)専用 LP
  pages/secret/index.tsx # 非公開のゲーム一覧(timebomb / hideout / fakeartist。noindex,nofollow)
  pages/<game>/[roomId].tsx  # roomId 取得 → use<Game>Room 呼び出し → レイアウト組み立て
  styles/tokens.scss         # デザイントークンの source of truth
  styles/lp.module.scss      # トップページ(LP)専用スタイル(tokens を @use)
  styles/secret.module.scss  # /secret 専用スタイル
  styles/components/<game>/  # scss モジュール(werewolf 新規/刷新分は tokens を @use)
  const/next.config.ts   # システム定数(接続先ホスト等。NEXT_PUBLIC_AP_HOST で上書き可)
  type/                  # ゲーム横断の型(SocketInfo 等)
```

- ゲーム間で共有するのは `SocketInfo` 型と `useGameSocket` が中心。reducer・型はゲームごとに独立させ、ゲーム間の差異を無理に抽象化しない(共通化の要否は [../roadmap.md](../roadmap.md) で扱う)
- `pages/<game>/[roomId].tsx` は全ゲームとも hook を呼ぶ入口だが、werewolf / fakeartist / timebomb などはページ側に画面組み立てがまだ多く残る。追加分割は [../roadmap.md](../roadmap.md) のページ分割タスクで扱う
- デザイントークンは `styles/tokens.scss` を正とし、`styles/lp.module.scss` と werewolf の `background.module.scss` / `entry.module.scss` / `result.module.scss` / `room.module.scss` / `rule.module.scss` / `start.module.scss` / `userinfo.module.scss` / `victory.module.scss` が `@use` する

## ページ構成

- **トップページ(`pages/index.tsx`)**: セカンドワンナイト人狼(werewolf)専用の LP。部品は `components/lp/`、スタイルは `styles/lp.module.scss`。ヒーローと下部 CTA の `RoomCreateCta` が `GET {AP_HOST}createroom/werewolf` で werewolf のルームを作成し、URL と 6桁のあいことばを表示する。`RoomJoinByCode` は `GET {AP_HOST}roombycode/{roomCode}` で部屋を検索し、見つかった `roomId` へ遷移する。ヒーロー画像は `/images/hero.webp`(jpg フォールバック付き)
- **`/secret`(`pages/secret/index.tsx`)**: 非公開のゲーム一覧(timebomb / hideout / fakeartist。decrypt は非掲載)。`noindex, nofollow` メタを付与し、トップからはリンクしない。ルーム作成ボタンは `/secret` 専用となった `components/home/creategamebtn.tsx` を使用

### werewolf 固有 UI

| 種別 | 実装 |
| --- | --- |
| 入室/招待 | `EntryCard` が未入室時の名前入力、`InvitePanel` が待機中/終了後の URL コピーと `WerewolfState.roomCode` 表示を担当 |
| 背景/開始演出 | `PhaseBackground` が turn / 勝利陣営に応じて背景を切り替え、`WerewolfStart` が開始 overlay を表示 |
| ルール表示 | `rule.tsx` + `rule.module.scss` で遊び方モーダルを再構成 |
| アイコンアップロード | `lib/imageToIconDataUrl.ts` が画像を 96px JPEG Data URL に変換し、werewolf の status `650` で送信 |
| 勝利/結果演出 | `VictoryOverlay` が「勝利演出 → 結果表示 → ロビー復帰」を担当。表示ロジックは `features/werewolf/victory.ts` に分離し、ユニットテスト対象 |

## 状態管理パターン(feature 構造)

各ゲームは「reducer(純粋関数)+ カスタムフック」で構成する。

```ts
// アクションは「サーバ受信」と「ローカルUI操作」の2系統
type HideoutAction =
    | { type: 'message'; payload: SocketInfo }   // サーバ受信(payload.status で分岐)
    | { type: 'dismissStart' }                   // ローカル(タイマー・閉じる等)
    | { type: 'systemMessage'; text: string };   // 通信エラー表示等

const reducer = (state: HideoutState, action: HideoutAction): HideoutState
```

- サーバメッセージは status コード(数値)で分岐し、1メッセージにつき state 更新1回
- 未知の status は state を変更しない(ログはフック側で出す)
- 「受信で立ててタイマーで下ろす」フラグは、受信時に reducer が立て、フック内の useEffect が時間経過後にローカルアクションを dispatch して下ろす
- 「変化時のみ発火」させたい遷移は reducer 内で前回値との比較ガード(例: `obj.rushFlg && !state.rushFlg`)で表現する

### 副作用の分離(reducer は純粋に保つ)

副作用はすべて「state の変化を監視する useEffect」(フック内)に置く。例:

| 副作用 | 実装 |
|---|---|
| チャット欄スクロール | `chatList` を監視する useEffect |
| `scrollTo` / `setTimeout` | 該当フラグを監視する useEffect |
| 効果音再生(werewolf) | 該当 state 変化を監視する useEffect |
| body クラス同期(timebomb のモーダル) | state フラグ + useEffect |
| canvas 描画(fakeartist) | 受信データを state に置き、反映は useEffect |

- DOM 直接操作(`document.querySelector` 等)・非制御 input は追加しない。className や入力値は state から導出する
- 送信エラーの catch は `systemMessage` アクションの dispatch に統一する

## 通信層(useGameSocket)

`@stomp/stompjs` v7 の `Client` を SockJS(`sockjs-client`)でラップした共通フック。バックエンドのエンドポイントが SockJS 形式のため sockjs-client を維持している。

```ts
type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

useGameSocket(opts: {
  topic: string;                  // timebomb: `/topic/${roomId}/timebomb`、他: `/topic/${roomId}`
  onMessage: (msg: any) => void;  // 受信ハンドラ(フック側で dispatch に接続)
  enabled: boolean;               // roomId 未確定(router 未準備)の間は接続しない
}): { status: ConnectionStatus; connected: boolean; send: (destination, payload) => void }
```

内部仕様:

- `reconnectDelay: 5000` で自動再接続。再接続時は既存 subscription を破棄してから再購読(重複購読防止)
- 受信 body は `JSON.parse` して `onMessage` へ(不正 JSON は生文字列のまま渡す)
- `send` は内部で `JSON.stringify` する(**呼び出し側で stringify しない**。二重エンコード注意)。未接続時は例外を投げる
- `enabled` が false に戻ると `deactivate()` し status は `disconnected` に戻る
- 接続状態は `ConnectionStatus` コンポーネント(`components/common/`)が表示(`reconnecting` / `disconnected` のときのみバナー)

通信契約(topic / destination / ペイロード)の詳細は [communication.md](communication.md)。ゲームごとの状態・status・frontend/backend 対応は [games/](games/) を参照。

## SakuraParticles(共通の花びらパーティクル)

`components/common/SakuraParticles.tsx`。tsparticles(`@tsparticles/react` + `@tsparticles/slim` + wobble / tilt updater)で花びらを舞わせる装飾コンポーネント。werewolf の待機画面(`ambient`)と `VictoryOverlay` の勝利演出(`celebration`、`palette` で陣営色指定)で使用。

- オプション生成は `sakuraParticlesOptions.ts` の純関数(粒子数・速度など。ユニットテスト対象は粒子数決定)
- `next/dynamic` の `ssr: false` で読み込むこと(他ページのバンドルに影響させない)
- `prefers-reduced-motion: reduce` 時は何も描画しない。スマホ幅(≤768px)では粒子数を減量

## テスト方針

- **reducer のユニットテスト(主戦場)**: ゲームごとに全 status コード + 全ローカルアクションを網羅する(例: 「status 300 受信 → startFlg が立つ」「未知 status → state 不変」)
- **useGameSocket のテスト**: `Client` をモックし、接続・購読・送信・status 遷移・再購読を検証
- **表示ロジックの小さな純粋関数**: Sakura の粒子数、werewolf 勝利演出の phase / palette など、副作用から切り出したロジックを検証
- フック(`use<Game>Room`)と UI コンポーネントの網羅テストは書かない(方針)
- 挙動に触れる変更は本番 Heroku 接続で手動確認(ブラウザ2タブで複数プレイヤーをシミュレート)
