# BoardGame モノレポ — エージェント向けガイド

オンラインボードゲーム(5ゲーム)のモノレポ。`frontend/`(Next.js / Vercel)と `backend/`(Spring Boot / Heroku)を1リポジトリで管理する。

このファイルはルートの `CLAUDE.md` から参照される。常時読む前提のため、全体像・横断制約・ドキュメント入口だけを書く。`frontend/` / `backend/` 固有のルールは各ディレクトリの `AGENTS.md` に置く。

## 構成

| ディレクトリ | 内容 | 作業ルール |
| --- | --- | --- |
| `frontend/` | Next.js + TypeScript | [frontend/AGENTS.md](frontend/AGENTS.md) |
| `backend/` | Spring Boot 2.4 / Java 11(Maven) | [backend/AGENTS.md](backend/AGENTS.md) |
| `docs/` | 設計書・計画書(下記ドキュメントマップ) | - |

ゲーム識別子: `timebomb` / `werewolf` / `hideout` / `decrypt` / `fakeartist`

## ドキュメントマップ

| 文書 | 内容 |
| --- | --- |
| [docs/README.md](docs/README.md) | ドキュメント入口・読む順番 |
| [docs/architecture/overview.md](docs/architecture/overview.md) | モノレポ全体像・実行時フロー |
| [docs/architecture/frontend.md](docs/architecture/frontend.md) | フロントの現在の実装(feature 構造・reducer パターン・useGameSocket・テスト方針) |
| [docs/architecture/backend.md](docs/architecture/backend.md) | バックエンドの現在の実装(controller・Room entity・共通処理) |
| [docs/architecture/communication.md](docs/architecture/communication.md) | フロント・バック間の通信契約の詳細(REST / SockJS / STOMP) |
| [docs/architecture/games/](docs/architecture/games/) | ゲーム別の状態・通信 status・frontend/backend 対応 |
| [docs/architecture/deployment.md](docs/architecture/deployment.md) | Vercel / Heroku のデプロイ構成 |
| [docs/roadmap.md](docs/roadmap.md) | future 側の未完了タスク・残課題バックログ |
| [docs/plans/](docs/plans/) | **進行中・未着手の実装計画のみ**を置く(完了したら現在仕様を architecture に反映し、計画書は削除) |

### ドキュメント運用ルール

- `docs/architecture/` は「常に現在の実装を説明する」文書。**実装を変えたら同じ PR で更新する**
- 実装計画は `docs/plans/<topic>.md`。日付をファイル名に入れない(時系列は git が持つ)
- 作業完了時: 完了済みの計画書は削除する。現在仕様は `docs/architecture/`、未完了の残課題は `docs/roadmap.md` に反映する

## 通信契約(フロント・バック間。変更時は両方の修正 + communication.md の更新が必要)

- REST: `GET {AP_HOST}createroom`(timebomb)/ `GET {AP_HOST}createroom/{game}`(他4ゲーム)→ `{ roomId }`
- WebSocket: SockJS エンドポイント `{AP_HOST}boardgame-endpoint`、STOMP 送信宛先 `/app/*`
- 購読 topic: **timebomb のみ** `/topic/{roomId}/timebomb`、他4ゲームは `/topic/{roomId}`

詳細は [docs/architecture/communication.md](docs/architecture/communication.md)。

## ローカル開発

```bash
# バックエンド(要 JDK 11)
cd backend && ./mvnw spring-boot:run      # localhost:8080

# フロントエンド
cd frontend && npm install && npm run dev  # localhost:3000
```

フロントの接続先はデフォルトで本番 Heroku(`https://boardgameap.herokuapp.com/`)。`frontend/.env.local` に `NEXT_PUBLIC_AP_HOST=http://localhost:8080/` を設定するとローカルバックエンドに接続する。

## デプロイ

- main リポジトリ: 本番反映用。frontend は master への push で Vercel が自動デプロイ、backend は Heroku ダッシュボードの GitHub 連携でデプロイ
- future リポジトリ: この作業ツリー。次期 UI・設計整理・モダナイズを進め、main へ昇格する前に検証する

詳細(monorepo buildpack、Root Directory 設定等)は [docs/architecture/deployment.md](docs/architecture/deployment.md)。

## 横断ルール

- 作業対象が `frontend/` または `backend/` の場合は、そのディレクトリの `AGENTS.md` も読む
- **バックエンドの API / WebSocket 仕様の互換性を維持する**。契約を変える場合はフロント・バック両方を同時に修正する
- 通信契約を変える場合は [docs/architecture/communication.md](docs/architecture/communication.md) と該当ゲームの [docs/architecture/games/](docs/architecture/games/) も更新する
- 意図的な挙動差分(バグ修正・UX 改善)は PR 説明に記録し、現在仕様として残す必要がある内容は設計書へ反映する
- master には直接コミットしない(作業ブランチ → PR)。push / PR 作成はユーザーの指示があるまで行わない
- コミットメッセージは日本語の短文
