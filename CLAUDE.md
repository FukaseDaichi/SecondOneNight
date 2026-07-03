# BoardGame モノレポ

オンラインボードゲーム(5ゲーム)のモノレポ。2026-07 に BoardGameFront(フロント)と BoardGame(バック)の2リポジトリを統合した(経緯: `docs/superpowers/specs/2026-07-03-monorepo-integration-design.md`)。

## 構成

| ディレクトリ | 内容 | デプロイ先 |
| --- | --- | --- |
| `frontend/` | Next.js + TypeScript | Vercel(Root Directory: `frontend`) |
| `backend/` | Spring Boot 2.4 / Java 11(Maven) | Heroku(app: `boardgameap`、monorepo buildpack で `APP_BASE=backend`) |
| `docs/` | 設計書(`docs/superpowers/specs/`)・実装計画(`docs/superpowers/plans/`) | - |

## ローカル開発

```bash
# バックエンド(要 JDK 11)
cd backend && ./mvnw spring-boot:run      # localhost:8080

# フロントエンド
cd frontend && npm install && npm run dev  # localhost:3000
```

フロントの接続先は `frontend/src/const/next.config.ts` にハードコードされており、デフォルトで本番 Heroku に接続する(Stage 1 で環境変数化予定)。

## 通信仕様(フロント・バック間の契約。変更時は両方の修正が必要)

- REST: `POST {AP_HOST}createroom`(ルーム作成)
- WebSocket: SockJS エンドポイント `{AP_HOST}boardgame-endpoint`、STOMP 購読先 `/topic/{roomId}/{game}`
- ゲーム識別子: `timebomb` / `werewolf` / `hideout` / `decrypt` / `fakeartist`

## デプロイ

- frontend: master への push で Vercel が自動デプロイ
- backend: Heroku ダッシュボードの GitHub 連携でデプロイ(monorepo buildpack が `backend/` をビルドルートに繰り上げてから Java buildpack が動く)

## 進行中の取り組み

フロントエンド全面モダナイズを実施中。設計: `docs/superpowers/specs/2026-07-03-frontend-modernization-design.md`、Stage 1 計画: `docs/superpowers/plans/2026-07-03-stage1-foundation-upgrade.md`
