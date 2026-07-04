# BoardGame backend

Spring Boot で作られたバックエンドです。ルーム作成、SockJS/STOMP のメッセージ受信、ゲームごとの Room 状態更新、topic への配信を担当します。

## 技術スタック

| 種別 | 内容 |
| --- | --- |
| Framework | Spring Boot 2.4 |
| Language | Java 11 |
| Build | Maven Wrapper |
| Realtime | Spring WebSocket / STOMP / SockJS |
| Deploy | Heroku |

## 起動

```bash
./mvnw spring-boot:run
```

ローカルでは http://localhost:8080 で起動します。フロントエンドから接続する場合は `../frontend/.env.local` に以下を設定します。

```env
NEXT_PUBLIC_AP_HOST=http://localhost:8080/
```

## よく使うコマンド

```bash
./mvnw test
./mvnw -q -DskipTests package
```

## 主要ディレクトリ

| パス | 内容 |
| --- | --- |
| `src/main/java/com/boardgame/app/controller/` | REST / STOMP controller |
| `src/main/java/com/boardgame/app/entity/` | Room / User / ゲーム状態 |
| `src/main/java/com/boardgame/app/constclass/` | ゲームごとの定数 |
| `src/main/java/com/boardgame/app/config/` | WebSocket 設定 |
| `src/main/java/com/boardgame/app/component/` | Room のメモリ管理 |

## 実装を読む入口

REST でルームを作る処理は `MainController`、STOMP の共通処理は `GameController`、ゲーム固有操作は各 `*Controller` にあります。実際のゲーム状態は controller ではなく Room entity が持っています。

```text
MainController / *Controller -> ApplicationInfoBeean -> Room entity -> STOMP topic
```

timebomb は古い通信形を残しており、topic が `/topic/{roomId}/timebomb` です。他4ゲームは `/topic/{roomId}` を使います。

| 目的 | ドキュメント |
| --- | --- |
| バックエンド構造 | [../docs/architecture/backend.md](../docs/architecture/backend.md) |
| 通信契約 | [../docs/architecture/communication.md](../docs/architecture/communication.md) |
| ゲーム別状態・status | [../docs/architecture/games/](../docs/architecture/games/) |
| デプロイ | [../docs/architecture/deployment.md](../docs/architecture/deployment.md) |
| 作業時の規約 | [AGENTS.md](AGENTS.md) |
