# backend — エージェント向け作業ガイド

Spring Boot 2.4 / Java 11(Maven)のバックエンド。Heroku(app: `boardgameap`)で稼働。

このファイルは `backend/CLAUDE.md` から参照される。`backend/` 配下を触る時だけ必要な規約を書く。モノレポ全体のルールは [../AGENTS.md](../AGENTS.md) を参照。

## 参照ドキュメント

| 目的 | 文書 |
| --- | --- |
| バックエンド構造 | [../docs/architecture/backend.md](../docs/architecture/backend.md) |
| 通信契約 | [../docs/architecture/communication.md](../docs/architecture/communication.md) |
| ゲーム別 status / state 対応 | [../docs/architecture/games/](../docs/architecture/games/) |
| デプロイ | [../docs/architecture/deployment.md](../docs/architecture/deployment.md) |

## コマンド(このディレクトリで実行。要 JDK 11)

```bash
./mvnw spring-boot:run              # 起動(localhost:8080)
./mvnw -q -DskipTests package       # ビルド確認
./mvnw test                         # テスト
```

Java バージョンは `system.properties`(`java.runtime.version=11`)で固定。

## 最重要の制約

- **API / WebSocket 仕様はフロントとの契約**。REST エンドポイント(`createroom`)、SockJS エンドポイント(`boardgame-endpoint`)、STOMP の宛先(`/app/*`)・topic(`/topic/{roomId}` 系)・ペイロード形式を変える場合は、`frontend/` の対応修正と [docs/architecture/communication.md](../docs/architecture/communication.md) の更新を同時に行う
- status、`SocketInfo.obj` の形、Room entity の JSON 形状を変える場合は、該当ゲームの [docs/architecture/games/](../docs/architecture/games/) と frontend reducer / types も更新する
- 現在進行中のフロントエンドモダナイズ(docs/roadmap.md)ではバックエンドは**無変更が前提**。契約に影響する変更は事前にユーザーへ確認する

## 実装ルール

- Room entity がサーバ側ゲーム状態の正本。controller は Room を更新し、topic へ publish する薄い入口として扱う
- timebomb だけ topic が `/topic/{roomId}/timebomb`。他4ゲームは `/topic/{roomId}`
- timebomb 以外の共通操作(入室・チャット・アイコン・制限時間)は `GameController` の既存経路を優先する
- Room は `ApplicationInfoBeean` のメモリ上に保持される。永続化前提の実装を追加しない

## デプロイ

- Heroku ダッシュボードの GitHub 連携でデプロイ(monorepo buildpack が `backend/` をビルドルートに繰り上げてから Java buildpack が動く)
- 詳細は [docs/architecture/deployment.md](../docs/architecture/deployment.md)
