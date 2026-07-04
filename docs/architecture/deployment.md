# デプロイ構成

BoardGameFront(フロント)と BoardGame(バック)を統合したモノレポ。旧 BoardGame リポジトリは GitHub 上でアーカイブ済みで、バックエンドの全履歴は `git log backend/` で辿れる。

## リポジトリ運用

- main リポジトリ: 安定版・本番反映用。Vercel / Heroku の本番接続を持つ。
- future リポジトリ: この作業ツリー。次期 UI、設計整理、モダナイズを進める。main へ昇格する前に frontend / backend の検証を行う。

以下の本番デプロイ設定は main 側で保持する前提。

## frontend — Vercel

- 本番: https://board-game-three.vercel.app
- master への push で自動デプロイ
- Project Settings → Build & Development Settings → **Root Directory: `frontend`**
- リポジトリ改名の影響を受けない(Vercel はリポジトリ ID で追跡)

## backend — Heroku(app: `boardgameap`)

- Heroku ダッシュボードの GitHub 連携で master を手動デプロイ
- buildpack 構成(モノレポ対応):
  1. [heroku-buildpack-monorepo](https://github.com/lstoll/heroku-buildpack-monorepo) + 環境変数 `APP_BASE=backend` — `backend/` の内容をビルドルートに繰り上げる
  2. Java buildpack — Spring Boot を自動検出してビルド(Procfile なし)
- Java バージョンは `backend/system.properties`(`java.runtime.version=11`)で指定
- ロールバックは `heroku rollback` または接続先リポジトリの変更で可能

## 注意事項

- **リポジトリを改名する場合**: Heroku は接続先をリポジトリ名で保持するため、改名後に Deploy タブで再接続が必要
- monorepo buildpack がメンテ停止しても、仕組みが単純(APP_BASE をビルドルートに繰り上げるだけ)なため代替は容易。GitHub Actions デプロイへの移行パスもある
