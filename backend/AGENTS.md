# backend — エージェント向け作業ガイド

Spring Boot 2.4 / Java 11(Maven)のバックエンド。Heroku(app: `boardgameap`)で稼働。

## コマンド(このディレクトリで実行。要 JDK 11)

```bash
./mvnw spring-boot:run              # 起動(localhost:8080)
./mvnw -q -DskipTests package       # ビルド確認
./mvnw test                         # テスト
```

Java バージョンは `system.properties`(`java.runtime.version=11`)で固定。

## 最重要の制約

- **API / WebSocket 仕様はフロントとの契約**。REST エンドポイント(`createroom`)、SockJS エンドポイント(`boardgame-endpoint`)、STOMP の宛先(`/app/*`)・topic(`/topic/{roomId}` 系)・ペイロード形式を変える場合は、`frontend/` の対応修正と [docs/architecture/communication.md](../docs/architecture/communication.md) の更新を同時に行う
- 現在進行中のフロントエンドモダナイズ(docs/roadmap.md)ではバックエンドは**無変更が前提**。契約に影響する変更は事前にユーザーへ確認する

## デプロイ

- Heroku ダッシュボードの GitHub 連携でデプロイ(monorepo buildpack が `backend/` をビルドルートに繰り上げてから Java buildpack が動く)
- 詳細は [docs/architecture/deployment.md](../docs/architecture/deployment.md)
