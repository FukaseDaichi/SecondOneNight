# BoardGame モノレポ — エージェント向けガイド

オンラインボードゲーム(5ゲーム)のモノレポ。`frontend/`(Next.js / Vercel)と `backend/`(Spring Boot / Heroku)を1リポジトリで管理する。

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
| [docs/architecture/frontend.md](docs/architecture/frontend.md) | フロントの現在の実装(feature 構造・reducer パターン・useGameSocket・テスト方針) |
| [docs/architecture/communication.md](docs/architecture/communication.md) | フロント・バック間の通信契約の詳細(REST / SockJS / STOMP) |
| [docs/architecture/deployment.md](docs/architecture/deployment.md) | Vercel / Heroku のデプロイ構成 |
| [docs/roadmap.md](docs/roadmap.md) | モダナイズのステージ全体像・完了履歴・残課題バックログ |
| [docs/plans/](docs/plans/) | **進行中・未着手の実装計画のみ**を置く(完了したら roadmap に吸収して削除) |

### ドキュメント運用ルール

- `docs/architecture/` は「常に現在の実装を説明する」文書。**実装を変えたら同じ PR で更新する**
- 実装計画は `docs/plans/stage<N>-<topic>.md`。日付をファイル名に入れない(時系列は git が持つ)
- ステージ完了時: 計画書の検証記録の要点と残課題を `docs/roadmap.md` に吸収し、計画書を削除する

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

- frontend: master への push で Vercel が自動デプロイ
- backend: Heroku ダッシュボードの GitHub 連携でデプロイ

詳細(monorepo buildpack、Root Directory 設定等)は [docs/architecture/deployment.md](docs/architecture/deployment.md)。

## 横断ルール

- **バックエンドの API / WebSocket 仕様の互換性を維持する**。契約を変える場合はフロント・バック両方を同時に修正する
- 意図的な挙動差分(バグ修正・UX 改善)は進行中の計画書の検証記録、なければ PR 説明に記録する
- master には直接コミットしない(作業ブランチ → PR)。push / PR 作成はユーザーの指示があるまで行わない
- コミットメッセージは日本語の短文
