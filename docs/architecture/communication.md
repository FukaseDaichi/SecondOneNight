# フロント・バック間 通信契約

フロント(Next.js)とバック(Spring Boot)の間の契約。**どちらか一方だけの変更は不可**。変更時はフロント・バック両方を同時に修正し、この文書を更新する。

ゲーム識別子: `timebomb` / `werewolf` / `hideout` / `decrypt` / `fakeartist`

接続先ホスト(`AP_HOST`)はフロントの `src/const/next.config.ts` で定義(デフォルト `https://boardgameap.herokuapp.com/`、`NEXT_PUBLIC_AP_HOST` で上書き可)。

## REST(ルーム作成 / ルーム検索)

| 用途 | リクエスト | レスポンス |
|---|---|---|
| timebomb ルーム作成 | `GET {AP_HOST}createroom` | Room JSON(`roomCode: null`) |
| werewolf ルーム作成 | `GET {AP_HOST}createroom/werewolf` | Room JSON(`roomCode`: 6桁の数字文字列) |
| hideout / decrypt / fakeartist ルーム作成 | `GET {AP_HOST}createroom/{game}` | Room JSON(`roomCode: null`) |
| ルームコード検索 | `GET {AP_HOST}roombycode/{roomCode}` | 200: Room JSON / 404: 未検出 |

Room JSON は全ゲーム共通の `Room` 基底フィールドとして `roomId`、`roomType`、`roomCode`、`userList` を持つ。`roomCode` は `string | null` で、現在 6桁コードを採番するのは werewolf のみ。

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

ペイロードは JSON(`useGameSocket.send` が stringify する)。画面から使う送信箇所は `frontend/src/features/*/use*Room.ts` に集約されている。

| ゲーム | 画面から使う destination |
| --- | --- |
| timebomb | `/app/roomin`, `/app/start`, `/app/play`, `/app/changeIcon`, `/app/timebomb-limittime`, `/app/timebomb-setlimittime`, `/app/timebomb-changesecret` |
| werewolf | `/app/game-roomin`, `/app/game-removeuser`, `/app/game-chat`, `/app/game-changeIcon`, `/app/game-setlimittime`, `/app/game-dooverLimit`, `/app/werewolf-setrollregulation`, `/app/werewolf-init`, `/app/werewolf-selectroll`, `/app/werewolf-discussionaction`, `/app/werewolf-voting` |
| hideout | `/app/game-roomin`, `/app/game-chat`, `/app/game-changeIcon`, `/app/hideout-init`, `/app/hideout-wait`, `/app/hideout-rush` |
| decrypt | `/app/game-roomin`, `/app/game-chat`, `/app/game-changeIcon`, `/app/decrypt-resetcode`, `/app/decrypt-resetteam`, `/app/decrypt-choiceteam`, `/app/decrypt-modechange`, `/app/decrypt-init`, `/app/decrypt-handupcreatecode`, `/app/decrypt-createcodeword`, `/app/decrypt-decryptcode` |
| fakeartist | `/app/game-roomin`, `/app/game-removeuser`, `/app/game-chat`, `/app/game-changeIcon`, `/app/game-setlimittime`, `/app/game-dooverLimit`, `/app/fakeartist-setpattern`, `/app/fakeartist-init`, `/app/fakeartist-drawing`, `/app/fakeartist-voting` |

バックエンドには互換維持・旧実装用として、現在の画面から直接使わない `/app/ping`、`/app/game-action`、`/app/werewolf-changeturn` も残っている。正確な受信口は `backend/src/main/java/com/boardgame/app/controller/*Controller.java` の `@MessageMapping` を正とする。

`useDecryptRoom` には `/app/game-setlimittime` と `/app/game-dooverLimit` の送信関数が残っているが、現在の decrypt 画面はそれらを呼ばない。`DecryptRoom` は `LimitTimeInterface` 未実装のため、利用する場合は backend 側の対応が必要。

werewolf は退出/キックで `/app/game-removeuser` を status `130` として送る。`obj` は対象 `userName`、バックエンドはそのユーザーを削除した Room 全体を broadcast する。werewolf の `/app/game-changeIcon` は status `650` で、`obj` はプリセットアイコン URL または JPEG Data URL(`data:image/jpeg...`、40,000文字未満)。

## ゲーム別 status / state 対応

この文書は通信契約の横断仕様を扱う。status ごとの意味、`obj` の中身、frontend reducer state への反映はゲーム別設計書を正とする。

| ゲーム | 設計書 |
|---|---|
| timebomb | [games/timebomb.md](games/timebomb.md) |
| werewolf | [games/werewolf.md](games/werewolf.md) |
| hideout | [games/hideout.md](games/hideout.md) |
| decrypt | [games/decrypt.md](games/decrypt.md) |
| fakeartist | [games/fakeartist.md](games/fakeartist.md) |
