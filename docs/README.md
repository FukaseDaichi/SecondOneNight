# ドキュメント入口

このディレクトリは BoardGame モノレポの設計・運用ドキュメントを置く場所。

`docs/architecture/` は**現在の実装を説明する文書**として運用する。実装を変えたら同じ PR で更新する。これから行う変更予定は `docs/roadmap.md`、具体的な作業計画は必要に応じて `docs/plans/` に置く。

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
| future 側の未完了タスクを確認する | [roadmap.md](roadmap.md) |
| 進行中の作業計画がある場合に確認する | [plans/](plans/) |

## ドキュメントの分け方

- 横断設計: `architecture/frontend.md`、`architecture/backend.md`、`architecture/communication.md`
- ゲーム固有設計: `architecture/games/<game>.md`
- 未完了タスク: `roadmap.md`
- 作業計画: `plans/<topic>.md`(進行中のものだけ。ファイル名に日付を入れず、完了したら削除)

ゲーム別設計書には、frontend feature、backend controller/entity、状態モデル、STOMP status、主要フローをまとめる。通信 destination の全体一覧は `communication.md` に置き、status ごとの意味や state への反映はゲーム別設計書を正とする。

## リポジトリ運用

この作業ツリーは future 側として扱う。main リポジトリは安定版・本番反映、future リポジトリは次期 UI とモダナイズを進める場所に分ける。future で実装を進めた内容を main に昇格する時は、通信契約と検証結果を確認し、必要な現在仕様を `docs/architecture/` に反映してから取り込む。
