# モノレポ統合 設計書

作成日: 2026-07-03

## 背景と目的

フロントエンド(BoardGameFront: Next.js / Vercel)とバックエンド(BoardGame: Spring Boot 2.4.4 + Java 11 / Heroku)が別リポジトリで管理されている。今後は両者を一緒に開発していくため、1つのリポジトリ(モノレポ)に統合する。

- フロントエンド: `/Users/fukasedaichi/git/BoardGameFront`(GitHub: `FukaseDaichi/BoardGameFront`、Vercel連携、`board-game-three.vercel.app`)
- バックエンド: `/Users/fukasedaichi/git/BoardGame`(GitHub: `FukaseDaichi/BoardGame`、HerokuのGitHub連携でデプロイ、アプリ名 `boardgameap`、59 Javaファイル)

## 決定事項(要件ヒアリング結果)

| 項目 | 決定 |
|---|---|
| モノレポの本体 | BoardGameFront リポジトリ(Vercel連携を維持できるため) |
| 履歴の扱い | Java側の全履歴を保持して取り込む(git filter-repo でパス書き換え + マージ) |
| Herokuデプロイ | heroku-buildpack-monorepo(`APP_BASE=backend`)で現行のGitHub連携運用を維持 |
| 作業順序 | モノレポ統合 → Stage 1(基盤刷新)。Stage 1計画書のパスは統合後に更新 |
| 作業ブランチ | `refactor/frontend-modernization` 上で実施 |

## 事前調査で確認済みの事実

- BoardGame の `dev` ブランチに master 未マージのコミットは**ない**(master が最新。取り込み対象は master のみ)
- BoardGame に Procfile はない(Heroku Java buildpack が Spring Boot を自動検出。モノレポ化後も同じ)
- `system.properties` で `java.runtime.version=11` を指定
- `git-filter-repo` はローカル未インストール(`brew install git-filter-repo` で導入する)
- BoardGame の `.gitignore` は IDE系(STS/IntelliJ/VSCode)・`target/` を除外済み

## フォルダ構成(To-Be)

```
BoardGameFront/   ← モノレポ本体(GitHubリポジトリ名の変更は任意・切替手順参照)
├── frontend/                # Next.js → Vercel(Root Directory: frontend)
│   ├── package.json         # 現在ルートにあるフロント一式を git mv で移動
│   ├── package-lock.json
│   ├── src/  public/
│   ├── tsconfig.json  .eslintrc.js  .prettierrc.js  next-env.d.ts
│   ├── .gitignore           # 現在のルートのものを移動
│   └── README.md            # 現在のもの(フロントのセットアップ手順)を移動
├── backend/                 # Spring Boot → Heroku(APP_BASE=backend)
│   ├── pom.xml  mvnw  mvnw.cmd  .mvn/
│   ├── system.properties
│   ├── .gitignore           # BoardGame側のものをそのまま
│   └── src/
├── docs/                    # 設計書・計画書(ルート直下のまま=両方に関わるため)
├── .gitignore               # ルート用を新規作成(.DS_Store 等のOS系のみ)
├── CLAUDE.md                # 新規: モノレポ全体のガイド(構成・起動・デプロイ方法)
└── README.md                # 新規: 全体概要(各ディレクトリへの案内)
```

- Eclipse系ファイル(`.classpath` / `.project` / `.settings`)は BoardGame の `.gitignore` で除外済みのため取り込まれない
- `target/` `node_modules/` 等のビルド成果物も同様に除外済み

## 統合手順(履歴保持)

1. `git-filter-repo` を導入(`brew install git-filter-repo`)
2. BoardGame を一時ディレクトリに clone し、`git filter-repo --to-subdirectory-filter backend` で全履歴のパスを `backend/` 配下に書き換え(元リポジトリは無傷)
3. モノレポ側(`refactor/frontend-modernization` ブランチ)で書き換え済みリポジトリを remote 追加 → fetch → `git merge --allow-unrelated-histories`
4. フロント一式を `git mv` で `frontend/` へ移動
5. ルートの `.gitignore` / `README.md` / `CLAUDE.md` を新規作成

結果: `git log backend/` `git blame` で旧 BoardGame の全履歴がそのまま辿れる。

## デプロイ設定の切替(カットオーバー手順)

統合ブランチを master にマージした直後に、以下を連続で実施する。

### Vercel(ダッシュボード)

1. Project Settings → Build & Development Settings → **Root Directory を `frontend` に設定**
2. 再デプロイ。コードは無変更のため成果物は現行と同一

任意: Ignored Build Step に `git diff --quiet HEAD^ HEAD -- .` を設定すると、frontend に変更がない push ではビルドをスキップできる(必須ではない)。

### Heroku(CLI + ダッシュボード)

```bash
heroku buildpacks:add -i 1 https://github.com/lstoll/heroku-buildpack-monorepo -a boardgameap
heroku config:set APP_BASE=backend -a boardgameap
```

その後、Deploy タブで接続先リポジトリを `FukaseDaichi/BoardGame` から `FukaseDaichi/BoardGameFront` に変更し、master を手動デプロイ。buildpack が `backend/` の内容をビルドルートに繰り上げ、以降は従来どおり Java buildpack が動く。

### リポジトリ名の変更(任意)

モノレポを「BoardGame」等に改名したい場合:

1. 旧 BoardGame リポジトリを先に改名(例: `BoardGame-backend-archive`)
2. モノレポ(BoardGameFront)を改名
3. **改名は Heroku の再接続より前に済ませる**(Heroku は接続先をリポジトリ名で保持するため)。Vercel はリポジトリIDで追跡するため改名の影響を受けない

### 切替完了後

- 旧 BoardGame リポジトリを GitHub 上でアーカイブ(読み取り専用化)。ローカルの `/Users/fukasedaichi/git/BoardGame` は当面残す(ロールバック保険)

## 進行中の作業への影響

- **統合部分は Stage 1 の開始を待たずに master へマージし、カットオーバーまで完了させる**(ファイル移動のみでコードは無変更のため低リスク。長期間ブランチに滞留させるとカットオーバーが遅れ、master との乖離も広がる)
- カットオーバー完了後、Stage 1 を `refactor/frontend-modernization` ブランチで継続する
- 承認済みの Stage 1 計画書(`docs/superpowers/plans/2026-07-03-stage1-foundation-upgrade.md`)のファイルパスを `frontend/` プレフィックス付きに更新する(内容は不変。コマンドの実行ディレクトリ注記を追加)
- Stage 1 以降のリファクタリングはすべて統合後の構造で実施する

## ローカル開発(統合後)

```bash
# バックエンド(要 JDK 11)
cd backend && ./mvnw spring-boot:run     # localhost:8080

# フロントエンド
cd frontend && npm run dev               # localhost:3000
# frontend/.env.local に NEXT_PUBLIC_AP_HOST=http://localhost:8080/ を設定するとローカルバックエンドに接続
```

この内容をルートの `CLAUDE.md` に記載し、以後のセッションで両プロジェクトをまとめて扱えるようにする。

## 検証方法

1. 統合コミット後: `git log --oneline backend/ | tail` で旧履歴が辿れること、`git log --follow frontend/src/pages/index.tsx` でフロント履歴が辿れることを確認
2. バックエンドのローカルビルド(JDK 11 が手元にあれば): `cd backend && ./mvnw -q -DskipTests package` が成功すること。なければ Heroku ビルドで確認
3. カットオーバー後: Vercel の本番サイトが表示され、Heroku デプロイ後に全5ゲームがルーム作成〜入室できること

## リスクとロールバック

| リスク | 対策 |
|---|---|
| Heroku 切替後にビルド失敗 | 旧 BoardGame リポジトリは無傷。接続先を戻せば即復旧。`heroku rollback` も可 |
| Vercel の Root Directory 設定までの間、master push でビルド失敗 | 切替手順を「マージ → 即設定 → 再デプロイ」の順で連続実行。失敗しても既存デプロイが生きているためサイトは落ちない |
| filter-repo の書き換えミス | 書き換えは一時ディレクトリの clone に対して行い、元リポジトリには一切触れない |
| モノレポ buildpack の将来的なメンテ停止 | 仕組みが単純(APP_BASE をビルドルートに繰り上げるだけ)なため代替容易。GitHub Actions デプロイへの移行パスもある(設計時に案Bとして検討済み) |

## 非ゴール

- バックエンド(Java)コードの変更・リファクタリング(将来の別プロジェクト)
- CI/CD パイプラインの新規構築(GitHub Actions 等は必要になった時に導入)
- フロントエンドのコード変更(Stage 1 以降の仕事)
