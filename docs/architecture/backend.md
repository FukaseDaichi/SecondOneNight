# バックエンド アーキテクチャ

Spring Boot 2.4 / Java 11。ルーム作成 REST と SockJS/STOMP のメッセージハンドラを提供する。

この文書は**現在の実装**を説明する。ゲーム固有の status・状態遷移は [games/](games/) を参照。

## 主要コンポーネント

| ファイル | 役割 |
| --- | --- |
| `config/WebSocketConfig.java` | STOMP broker 設定。`/boardgame-endpoint` を SockJS endpoint として公開し、送信 prefix `/app`、購読 prefix `/topic` を設定 |
| `controller/MainController.java` | ルーム作成/ルームコード検索 REST。ゲームごとの Room を生成して `ApplicationInfoBeean` に登録 |
| `controller/GameController.java` | timebomb 以外で使う共通 STOMP handler。入室、退室、チャット、アイコン変更、制限時間 |
| `controller/*Controller.java` | ゲーム固有 STOMP handler。Room entity のゲーム操作を呼ぶ |
| `controller/common/CommonLogic.java` | Room 存在確認、例外処理、汎用 action handler |
| `component/ApplicationInfoBeean.java` | JVM メモリ上の Room store。`roomList` に作成済み Room を保持し、`createRoomCode()` / `getRoomByCode(String)` を提供 |
| `entity/Room.java` / `entity/User.java` | 全ゲーム共通の Room/User 基底クラス。Room は `roomId`、`roomType`、`roomCode` を持つ |
| `entity/SocketInfo.java` | STOMP 送受信の封筒型。`status`、`roomId`、`userName`、`message`、`obj` |
| `entity/chat/ChatRoom.java` | チャットを持つ Room の基底クラス |
| `entity/enif/LimitTimeInterface.java` | 制限時間変更・時間切れ処理を持つ Room の共通 interface |
| `src/test/java/com/boardgame/app/component/ApplicationInfoBeeanTest.java` | werewolf の6桁ルームコード生成・検索のユニットテスト |

## ルーム作成

`MainController` は `@RequestMapping` で定義されているため HTTP メソッドは限定されていないが、フロントは GET で呼ぶ。

| ゲーム | Path | 生成する Room | `roomCode` |
| --- | --- | --- | --- |
| timebomb | `/createroom` | `TimeBombRoom` | `null` |
| werewolf | `/createroom/werewolf` | `WerewolfRoom` | `ApplicationInfoBeean.createRoomCode()` で生成した6桁コード |
| hideout | `/createroom/hideout` | `HideoutRoom` | `null` |
| decrypt | `/createroom/decrypt` | `DecryptRoom` | `null` |
| fakeartist | `/createroom/fakeartist` | `FakeArtistRoom` | `null` |

Room は `ApplicationInfoBeean.addRoom` によりメモリ上に保持される。永続化はない。`Room.roomCode` は全 Room JSON に含まれるが、現在採番するのは werewolf のみ。

## ルームコード検索

`MainController.getRoomByCode` が `GET /roombycode/{roomCode}` を受け、`ApplicationInfoBeean.getRoomByCode(String)` でメモリ上の Room を検索する。

| 結果 | レスポンス |
| --- | --- |
| 一致する Room あり | 200 + Room JSON |
| 一致する Room なし | 404 |

## WebSocket 設定

- endpoint: `/boardgame-endpoint`
- SockJS: 有効
- application destination prefix: `/app`
- simple broker prefix: `/topic`
- allowed origin: `*`

フロントは `@stomp/stompjs` と `sockjs-client` を `frontend/src/lib/stomp/useGameSocket.ts` 経由で使う。

## 共通メッセージ構造

timebomb 以外の4ゲームは、おおむね `SocketInfo` を送受信する。

```java
public class SocketInfo {
    private int status;
    private String roomId;
    private String userName;
    private String message;
    private Object obj;
}
```

`status` は処理種別・状態遷移種別を表す。`obj` にはゲームごとの Room、ユーザーリスト、チャットリスト、制限時間などが入る。

timebomb は古い実装を維持しており、Room object を直接 publish する経路と、`ErrObj` / `SocketInfo` 相当の status 付き object を publish する経路が混在する。

## 共通 STOMP handler

`GameController` は werewolf / hideout / decrypt / fakeartist で共有される。

| destination | 主な status | obj | 用途 |
| --- | --- | --- | --- |
| `/app/game-roomin` | `100`、例外時 `200` / `404` など | Room | 入室 |
| `/app/game-removeuser` | 呼び出し側指定 | Room | 退室 |
| `/app/game-chat` | `101` | `chatList` | チャット |
| `/app/game-changeIcon` | ゲームごとに `600` または `650` | `userList` | アイコン変更 |
| `/app/game-setlimittime` | `550` | `limitTime` | 制限時間変更 |
| `/app/game-dooverLimit` | `600` | Room | 制限時間超過時の処理 |

`/app/game-setlimittime` と `/app/game-dooverLimit` は Room を `LimitTimeInterface` として扱う。現在この interface を実装しているのは werewolf / fakeartist / timebomb。timebomb は専用 controller を使うため、共通 handler の実利用は werewolf / fakeartist が中心。decrypt の hook には送信口が残っているが、`DecryptRoom` は `LimitTimeInterface` 未実装で、画面からも使っていない。

## 状態の所有者

- サーバ状態の正本は Room entity。
- Room は `ApplicationInfoBeean.roomList` に格納される。
- controller は Room を取得し、Room のメソッドで状態更新してから topic へ publish する。
- フロントは受信データを reducer state に反映する。フロント側 state は UI 表示用のコピーであり、正本ではない。

## エラー status

| status | 定義 | 意味 |
| --- | --- | --- |
| `404` | `HttpsURLConnection.HTTP_NOT_FOUND` | Room がない、またはシステムエラー |
| `997` | `SystemConst.ERR_MSG_NONVIW_STATUS_CODE` | 画面に出さない想定のエラー |
| `998` | `SystemConst.ERR_MSG_OWNVIEW_STATUS_CODE` | 対象ユーザーだけに表示するエラー |
| `999` | `SystemConst.ERR_MSG_ALLVIEW_STATUS_CODE` | 全員に表示するエラー |

一部の古い処理では `ApplicationException(String message)` の default status が `200` になる。フロント reducer はこの互換性を前提にしている箇所がある。
