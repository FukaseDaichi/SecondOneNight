# BoardGame Future

ブラウザで遊べるオンラインボードゲーム集(セカンドワンナイト人狼 / タイムボム / ハイドアウト / エセ芸術家ニューヨークへ行く / ディクリプト)。

- 本番サイト: https://board-game-three.vercel.app

## このリポジトリについて

`frontend/` と `backend/` を1つにまとめたモノレポです。この作業ツリーは future 側で、次期 UI、設計整理、モダナイズを進める場所です。安定版・本番反映は main リポジトリ側に分ける前提で運用します。

ゲームごとの画面・状態管理は `frontend/`、ゲーム進行の正本となる Room / User の状態は `backend/` にあります。フロントとバックエンドは REST と SockJS/STOMP で通信します。

## 構成

| ディレクトリ | 内容 | デプロイ先 |
| --- | --- | --- |
| [frontend/](frontend/) | Next.js フロントエンド | Vercel |
| [backend/](backend/) | Spring Boot バックエンド | Heroku |
| [docs/](docs/) | 設計書・未完了タスク | - |

## まず動かす

```bash
# バックエンド: http://localhost:8080
cd backend
./mvnw spring-boot:run

# フロントエンド: http://localhost:3000
cd ../frontend
npm install
npm run dev
```

フロントエンドはデフォルトで本番 Heroku のバックエンドに接続します。ローカルバックエンドへ向ける場合は `frontend/.env.local` に以下を設定します。

```env
NEXT_PUBLIC_AP_HOST=http://localhost:8080/
```

## よく見るドキュメント

| 目的 | ドキュメント |
| --- | --- |
| フロントエンドを触る | [frontend/README.md](frontend/README.md) |
| バックエンドを触る | [backend/README.md](backend/README.md) |
| 設計書を探す | [docs/README.md](docs/README.md) |
| 全体構成を知る | [docs/architecture/overview.md](docs/architecture/overview.md) |
| 通信契約を確認する | [docs/architecture/communication.md](docs/architecture/communication.md) |
| ゲーム別の状態・通信を見る | [docs/architecture/games/](docs/architecture/games/) |
| future 側の未完了タスクを見る | [docs/roadmap.md](docs/roadmap.md) |

## リポジトリ運用

- main: 安定版・本番反映用。Vercel / Heroku の本番接続を持つ。
- future: このリポジトリ。次期 UI やモダナイズを進め、検証後に main へ昇格する。

## 開発ルール

人間向けの概要は README、作業時の細かい規約は [AGENTS.md](AGENTS.md) に分けています。`frontend/` と `backend/` にはそれぞれ配下専用の `AGENTS.md` があります。
