# ドキュメント入口

このディレクトリは BoardGame モノレポの設計・運用ドキュメントを置く場所。

`docs/architecture/` は**現在の実装を説明する文書**として運用する。実装を変えたら同じ PR で更新する。これから行う変更予定や検証記録は `docs/plans/` または `docs/roadmap.md` に置く。

## 読む順番

| 目的 | 文書 |
| --- | --- |
| 全体像を把握する | [architecture/overview.md](architecture/overview.md) |
| フロント・バック間の通信契約を確認する | [architecture/communication.md](architecture/communication.md) |
| フロントエンドの構造を確認する | [architecture/frontend.md](architecture/frontend.md) |
| バックエンドの構造を確認する | [architecture/backend.md](architecture/backend.md) |
| ゲーム別の状態・通信・実装対応を確認する | [architecture/games/README.md](architecture/games/README.md) |
| デプロイ構成を確認する | [architecture/deployment.md](architecture/deployment.md) |
| セカンドワンナイト人狼のデザインシステムを確認する | [design.md](design.md) |
| モダナイズの進捗・残課題を確認する | [roadmap.md](roadmap.md) |
| 進行中の作業計画を確認する | [plans/](plans/) |

## ドキュメントの分け方

- 横断設計: `architecture/frontend.md`、`architecture/backend.md`、`architecture/communication.md`
- ゲーム固有設計: `architecture/games/<game>.md`
- 作業計画: `plans/stage<N>-<topic>.md`
- 完了済みの大きな変更の記録: `roadmap.md`

ゲーム別設計書には、frontend feature、backend controller/entity、状態モデル、STOMP status、主要フローをまとめる。通信 destination の全体一覧は `communication.md` に置き、status ごとの意味や state への反映はゲーム別設計書を正とする。

