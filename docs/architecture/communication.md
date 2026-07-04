# フロント・バック間 通信契約

フロント(Next.js)とバック(Spring Boot)の間の契約。**どちらか一方だけの変更は不可**。変更時はフロント・バック両方を同時に修正し、この文書を更新する。

ゲーム識別子: `timebomb` / `werewolf` / `hideout` / `decrypt` / `fakeartist`

接続先ホスト(`AP_HOST`)はフロントの `src/const/next.config.ts` で定義(デフォルト `https://boardgameap.herokuapp.com/`、`NEXT_PUBLIC_AP_HOST` で上書き可)。

## REST(ルーム作成)

| ゲーム | リクエスト | レスポンス |
|---|---|---|
| timebomb | `GET {AP_HOST}createroom` | `{ "roomId": string }` |
| 他4ゲーム | `GET {AP_HOST}createroom/{game}` | 同上 |

バックエンド実装: `backend/.../controller/MainController.java`(`@RequestMapping` のためメソッド不問だが、フロントは GET で呼ぶ)。

## WebSocket(SockJS + STOMP)

- エンドポイント: `{AP_HOST}boardgame-endpoint`(SockJS 形式。素の WebSocket ではない)
- フロントは `@stomp/stompjs` v7 + `sockjs-client` を `useGameSocket` フック経由で使用

### 購読 topic(サーバ → クライアント)

| ゲーム | topic |
|---|---|
| timebomb | `/topic/{roomId}/timebomb` ← **timebomb だけ別形式。取り違え注意** |
| werewolf / hideout / decrypt / fakeartist | `/topic/{roomId}` |

受信ペイロードは全ゲーム共通の封筒型(`frontend/src/type/socketInfo.ts`):

```ts
type SocketInfo = {
    status: number;    // 状態遷移コード(reducer が分岐に使う)
    roomId: string;
    userName: string;
    message: string;
    obj: any;          // ゲーム固有データ
};
```

### 送信宛先(クライアント → サーバ、`/app/*`)

ペイロードは JSON(`useGameSocket.send` が stringify する)。宛先の一覧(2026-07 時点):

- 共通系: `/app/roomin` `/app/start` `/app/play` `/app/changeIcon`(timebomb 系)、`/app/game-roomin` `/app/game-chat` `/app/game-changeIcon` `/app/game-removeuser` `/app/game-setlimittime` `/app/game-dooverLimit`(werewolf 等の共通コントローラ)
- timebomb: `/app/timebomb-limittime` `/app/timebomb-setlimittime` `/app/timebomb-changesecret`
- werewolf: `/app/werewolf-init` `/app/werewolf-selectroll` `/app/werewolf-setrollregulation` `/app/werewolf-discussionaction` `/app/werewolf-voting`
- hideout: `/app/hideout-init` `/app/hideout-wait` `/app/hideout-rush`
- decrypt: `/app/decrypt-init` `/app/decrypt-choiceteam` `/app/decrypt-createcodeword` `/app/decrypt-handupcreatecode` `/app/decrypt-decryptcode` `/app/decrypt-resetcode` `/app/decrypt-resetteam` `/app/decrypt-modechange`
- fakeartist: `/app/fakeartist-init` `/app/fakeartist-setpattern` `/app/fakeartist-drawing` `/app/fakeartist-voting`

正確な一覧はバックエンドの `@MessageMapping`(`backend/.../controller/*Controller.java`)が正。フロント側の送信箇所は `frontend/src/features/*/use*Room.ts` に集約されている。

## ゲーム別 status / state 対応

この文書は通信契約の横断仕様を扱う。status ごとの意味、`obj` の中身、frontend reducer state への反映はゲーム別設計書を正とする。

| ゲーム | 設計書 |
|---|---|
| timebomb | [games/timebomb.md](games/timebomb.md) |
| werewolf | [games/werewolf.md](games/werewolf.md) |
| hideout | [games/hideout.md](games/hideout.md) |
| decrypt | [games/decrypt.md](games/decrypt.md) |
| fakeartist | [games/fakeartist.md](games/fakeartist.md) |
