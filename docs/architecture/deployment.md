# デプロイ構成

BoardGame は、`frontend/` と `backend/` を同じリポジトリで管理するモノレポ。単一リポジトリ(`FukaseDaichi/SecondOneNight`)を `master` / `future` の2ブランチで運用する。旧 backend 専用リポジトリは運用対象から外し、履歴はこのモノレポの `git log backend/` で辿る。

## ブランチ運用

- `master`: 安定版・本番反映用。Vercel / Heroku の本番接続はこのブランチを向く。
- `future`: 次期 UI、設計整理、モダナイズを進めるブランチ。作業ブランチはここから切る。本番へは直接デプロイされない。
- `future` の内容を `master` へマージする時は、通信契約、設計書、検証結果を確認してから取り込む。

以下の本番デプロイ設定は `master` を対象とする。

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
