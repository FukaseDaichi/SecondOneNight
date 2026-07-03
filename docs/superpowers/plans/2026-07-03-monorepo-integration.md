# モノレポ統合 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** BoardGame(Java/Spring Boot)を履歴ごと `backend/` に取り込み、フロントエンドを `frontend/` に移動して、Vercel(frontend)+ Heroku(backend)で動くモノレポを完成させる。

**Architecture:** `git filter-repo` で BoardGame の全履歴をパス書き換え(`backend/` 配下化)した一時cloneを作り、`git merge --allow-unrelated-histories` でモノレポに合流させる。フロント一式は `git mv` で `frontend/` へ。デプロイは Vercel の Root Directory 設定と heroku-buildpack-monorepo(`APP_BASE=backend`)で各サブディレクトリに向ける。

**Tech Stack:** git filter-repo / git subtree構造 / Vercel Root Directory / heroku-buildpack-monorepo

**スコープ注記:** 設計書は `docs/superpowers/specs/2026-07-03-monorepo-integration-design.md`。コード変更はゼロ(ファイル移動と新規ドキュメントのみ)。統合完了後の Stage 1 実行は別計画(`2026-07-03-stage1-foundation-upgrade.md`)。

## Global Constraints

- 作業ブランチ: `refactor/frontend-modernization`。master への反映は Task 7 の PR のみ。push / PR 作成 / ダッシュボード操作(Task 7)はユーザー確認の上で実施
- 元リポジトリ `/Users/fukasedaichi/git/BoardGame` には**一切書き込まない**(clone 元として読むだけ)
- フロント・バックエンドのコードは1行も変更しない(移動のみ。挙動完全不変)
- コミットメッセージは日本語の短文。末尾に `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` を付ける
- Heroku アプリ名は `boardgameap`(`boardgameap.herokuapp.com` より推定。Task 7 でダッシュボードの実名を確認してから実行)
- 一時作業ディレクトリ: `/private/tmp/claude-501/-Users-fukasedaichi-git-BoardGameFront/7eff243d-0e04-4a87-9937-67f8aad9e9e3/scratchpad`(以下 `$SCRATCH` と表記。任意の一時ディレクトリで代替可)

---

### Task 1: git-filter-repo 導入と BoardGame 履歴のパス書き換え

**Files:**
- Create: `$SCRATCH/boardgame-rewrite/`(モノレポ外の一時clone。リポジトリへのコミットなし)

**Interfaces:**
- Consumes: `/Users/fukasedaichi/git/BoardGame`(読み取りのみ)
- Produces: 全履歴のパスが `backend/` 配下に書き換わった clone `$SCRATCH/boardgame-rewrite`(Task 2 が merge 元として使う)。元コミット数のメモ(Task 2 の検証で使う)

- [ ] **Step 1: git-filter-repo をインストール**

```bash
brew install git-filter-repo
git filter-repo --version
```

Expected: バージョン文字列が表示される(例: `2.4x.x`)

- [ ] **Step 2: 元リポジトリのコミット数を記録**

```bash
git -C /Users/fukasedaichi/git/BoardGame rev-list --count master
```

Expected: 数値が表示される。**この数値をメモする**(以降「元コミット数」と呼ぶ)

- [ ] **Step 3: 一時ディレクトリに fresh clone を作成**

```bash
git clone --no-local /Users/fukasedaichi/git/BoardGame "$SCRATCH/boardgame-rewrite"
```

`--no-local` は filter-repo が要求する「fresh clone」条件を満たすため(ハードリンク共有を避ける)。

- [ ] **Step 4: 全履歴を backend/ 配下にパス書き換え**

```bash
cd "$SCRATCH/boardgame-rewrite"
git filter-repo --to-subdirectory-filter backend
```

Expected: `Completely finished after X seconds.` と表示される

- [ ] **Step 5: 書き換え結果を検証**

```bash
cd "$SCRATCH/boardgame-rewrite"
git rev-list --count master   # → 元コミット数と一致すること
ls                            # → backend のみ(全ファイルが backend/ 配下に移動済み)
git log --oneline -3 -- backend/pom.xml   # → 旧コミットが backend/ パスで辿れること
```

Expected: コミット数一致・`backend` ディレクトリのみ・pom.xml の履歴が表示される。1つでも不一致なら**先に進まず**原因を調べる(元リポジトリは無傷なので clone からやり直せる)

---

### Task 2: backend 履歴のマージ取り込み

**Files:**
- Create: `backend/`(pom.xml / mvnw / mvnw.cmd / .mvn/ / system.properties / .gitignore / src/ — マージで取り込み)

**Interfaces:**
- Consumes: Task 1 の `$SCRATCH/boardgame-rewrite` と元コミット数メモ
- Produces: `backend/` ディレクトリ(Task 4 の CLAUDE.md、Task 6 の検証、Task 7 の Heroku デプロイが参照)

- [ ] **Step 1: 前提確認**

```bash
cd /Users/fukasedaichi/git/BoardGameFront
git branch --show-current   # → refactor/frontend-modernization
git status --porcelain      # → 出力なし(クリーン)
```

Expected: ブランチ名が一致し、作業ツリーがクリーン。違ったら停止してユーザーに確認

- [ ] **Step 2: 書き換え済み履歴を fetch してマージ**

```bash
cd /Users/fukasedaichi/git/BoardGameFront
git remote add backend-rewrite "$SCRATCH/boardgame-rewrite"
git fetch backend-rewrite
git merge --allow-unrelated-histories backend-rewrite/master -m "$(cat <<'EOF'
バックエンド(BoardGame)を履歴ごとbackend/配下に統合

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
EOF
)"
```

Expected: コンフリクトなしでマージ完了(既存ファイルと `backend/**` はパスが重ならないため)。コンフリクトが出た場合は想定外なので `git merge --abort` して停止

- [ ] **Step 3: 取り込み結果を検証**

```bash
ls backend                             # → pom.xml mvnw mvnw.cmd system.properties src など
git log --oneline -- backend | wc -l   # → 元コミット数と同数(±マージコミット分1程度)
git log --oneline -- backend | tail -3 # → BoardGame の初期のコミットが見えること
```

- [ ] **Step 4: 一時 remote を削除**

```bash
git remote remove backend-rewrite
git remote -v   # → origin のみ
```

---

### Task 3: フロントエンド一式を frontend/ へ移動

**Files:**
- Move: `package.json` `package-lock.json` `src/` `public/` `tsconfig.json` `.eslintrc.js` `.prettierrc.js` `next-env.d.ts` `.gitignore` `README.md` → すべて `frontend/` 配下へ
- 残留(移動しない): `docs/` `backend/` `.git/`

**Interfaces:**
- Consumes: Task 2 完了後のツリー
- Produces: `frontend/` ディレクトリ(Task 4 のドキュメント、Task 5 の計画書更新、Task 7 の Vercel Root Directory 設定が前提とする)

- [ ] **Step 1: 移動対象の確認**

```bash
cd /Users/fukasedaichi/git/BoardGameFront
ls -a
```

Expected: 上記 Move 対象10項目 + `docs` + `backend` + `.git`(+`.DS_Store` 等のゴミ)。**リストにない追跡ファイルがあれば停止してユーザーに確認**

- [ ] **Step 2: git mv で移動**

```bash
mkdir frontend
git mv package.json package-lock.json src public tsconfig.json .eslintrc.js .prettierrc.js next-env.d.ts .gitignore README.md frontend/
```

未追跡のビルド成果物・OSゴミが残っていれば削除(現状は存在しないはずだが念のため。`.gitignore` が `frontend/` へ移った直後はルートの `.DS_Store` が未無視状態になり、Step 4 の `git add -A` に拾われてしまうため):

```bash
rm -rf node_modules .next
rm -f .DS_Store
```

- [ ] **Step 3: 移動結果を検証**

```bash
git status --short | head -20   # → R(rename)のみが並ぶこと
ls                              # → backend docs frontend のみ
git log --follow --oneline frontend/src/pages/index.tsx | tail -3   # → 旧履歴が辿れること
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "フロントエンド一式をfrontend/配下へ移動"
```

---

### Task 4: ルートファイル作成(.gitignore / README.md / CLAUDE.md)

**Files:**
- Create: `.gitignore`(ルート)
- Create: `README.md`(ルート)
- Create: `CLAUDE.md`(ルート)

**Interfaces:**
- Consumes: Task 2 / Task 3 で確定したディレクトリ構造
- Produces: 今後の全セッション・全開発者が参照するモノレポガイド

- [ ] **Step 1: ルート .gitignore を作成**

```
.DS_Store
Thumbs.db
```

(サブプロジェクト固有の無視設定は `frontend/.gitignore` と `backend/.gitignore` が既に持っているため、ルートは OS ゴミのみ)

- [ ] **Step 2: ルート README.md を作成**

```markdown
# BoardGame

ブラウザで遊べるオンラインボードゲーム集(セカンドワンナイト人狼 / タイムボム / ハイドアウト / エセ芸術家ニューヨークへ行く / ディクリプト)。

- 本番サイト: https://board-game-three.vercel.app

## 構成

| ディレクトリ | 内容 | デプロイ先 |
| --- | --- | --- |
| [frontend/](frontend/) | Next.js フロントエンド | Vercel |
| [backend/](backend/) | Spring Boot バックエンド | Heroku |
| [docs/](docs/) | 設計書・実装計画 | - |

開発環境のセットアップ・デプロイ構成の詳細は [CLAUDE.md](CLAUDE.md) を参照。
```

- [ ] **Step 3: ルート CLAUDE.md を作成**

````markdown
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
````

- [ ] **Step 4: Commit**

```bash
git add .gitignore README.md CLAUDE.md
git commit -m "モノレポのルートドキュメントを追加"
```

---

### Task 5: Stage 1 計画書のパス更新

**Files:**
- Modify: `docs/superpowers/plans/2026-07-03-stage1-foundation-upgrade.md`

**Interfaces:**
- Consumes: Task 3 で確定した `frontend/` 構造
- Produces: モノレポ構造で実行可能な Stage 1 計画書

- [ ] **Step 1: 冒頭に実行ディレクトリの注記を追加**

「スコープ注記」の段落の直後に以下を追加:

```markdown
**モノレポ統合済み(2026-07-03):** フロントエンドは `frontend/` 配下に移動した。本計画中のフロントエンド関連の相対パス(`src/...`、`package.json`、`.npmrc`、`next.config.mjs`、`eslint.config.mjs`、`.env.local.example` 等)はすべて `frontend/` 配下を指す。**bash コマンドは `frontend/` をカレントディレクトリにして実行すること。** ただし `docs/...` で始まるパスのみリポジトリルート基準(frontend/ からは `../docs/...`)。
```

- [ ] **Step 2: docs パスを参照する唯一のコマンドを修正**

Task 6「Step 3: 検証結果の記録」内の

```bash
git add docs/superpowers/plans/2026-07-03-stage1-foundation-upgrade.md
```

を

```bash
git add ../docs/superpowers/plans/2026-07-03-stage1-foundation-upgrade.md
```

に変更(カレントが `frontend/` になるため)。

- [ ] **Step 3: 整合性を確認**

Stage 1 計画書を通読し、Step 1 の注記と矛盾する記述(「ルート直下の package.json」のような表現)が残っていないか確認して、あれば修正する。特に確認する箇所: Task 2 の「`next.config.js` は存在しなかった」の記述(→ `frontend/` 配下に作る旨が注記でカバーされること)、Task 6 の URL(`localhost:3000` — 変更不要)。

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/plans/2026-07-03-stage1-foundation-upgrade.md
git commit -m "Stage 1計画書をモノレポ構造に更新"
```

---

### Task 6: 統合の検証

**Files:**
- Modify: `docs/superpowers/plans/2026-07-03-monorepo-integration.md`(本ファイルの検証記録)

**Interfaces:**
- Consumes: Task 1〜5 の全成果物
- Produces: カットオーバー(Task 7)へ進んでよいかの判定

- [ ] **Step 1: 履歴の検証**

```bash
cd /Users/fukasedaichi/git/BoardGameFront
git log --oneline -- backend | tail -3    # → BoardGame 初期のコミットが見える
git log --follow --oneline frontend/src/pages/index.tsx | tail -3   # → フロント初期の履歴が見える
git log --oneline -5                       # → 統合作業のコミットが正しく積まれている
```

- [ ] **Step 2: バックエンドのローカルビルド(JDK 11 がある場合のみ)**

```bash
/usr/libexec/java_home -V 2>&1   # インストール済み JDK の一覧
```

JDK 11 がある場合:

```bash
cd backend
JAVA_HOME=$(/usr/libexec/java_home -v 11) ./mvnw -q -DskipTests package
```

Expected: `BUILD SUCCESS`(target/ に jar が生成される)。JDK 11 がない場合はこのステップをスキップし、Task 7 の Heroku ビルドで検証する(Spring Boot 2.4 系は新しい JDK では Lombok の非互換でビルドできない可能性が高いため、無理に新 JDK で試さない)

- [ ] **Step 3: 構造の最終確認**

```bash
ls                    # → CLAUDE.md README.md backend docs frontend(+ .gitignore)
git status --short    # → 出力なし(クリーン)
ls frontend           # → package.json src public tsconfig.json など10項目
```

- [ ] **Step 4: 検証記録を記入して Commit**

本ファイル末尾の「検証記録」節に結果(履歴検証OK/NG、ローカルビルド実施有無と結果)を記入:

```bash
git add docs/superpowers/plans/2026-07-03-monorepo-integration.md
git commit -m "モノレポ統合の検証結果を記録"
```

---

### Task 7: master へのマージとカットオーバー(ユーザー共同作業)

**このタスクは push・PR・ダッシュボード操作を含むため、開始前にユーザーの承認を得ること。ダッシュボード操作(Vercel / Heroku / GitHub)はユーザーにしかできないため、手順を提示して結果を確認しながら進める。**

**Files:**
- なし(リポジトリ外の設定変更が主)

**Interfaces:**
- Consumes: Task 6 の検証済みブランチ
- Produces: モノレポ master で Vercel / Heroku が稼働している状態(Stage 1 開始の前提)

- [ ] **Step 1: (任意)リポジトリ改名 — ユーザー操作**

モノレポを「BoardGame」等に改名したい場合のみ。**必ず Step 4 の Heroku 再接続より前に行う**(Heroku は接続先をリポジトリ名で保持するため):

1. GitHub で旧 `FukaseDaichi/BoardGame` を改名(例: `BoardGame-backend-archive`)
2. GitHub で `FukaseDaichi/BoardGameFront` を新名に改名(Vercel はリポジトリ ID で追跡するため影響なし)

改名しない場合はスキップ。

- [ ] **Step 2: PR 作成とマージ**

```bash
git push -u origin refactor/frontend-modernization
gh pr create --base master --head refactor/frontend-modernization \
  --title "モノレポ統合(backend取り込み + frontend/移動)" \
  --body "$(cat <<'EOF'
## 概要
- BoardGame(Java)を履歴ごと backend/ 配下に統合
- フロントエンド一式を frontend/ 配下へ移動(コード変更なし)
- ルートに README / CLAUDE.md / .gitignore を追加
- 設計書: docs/superpowers/specs/2026-07-03-monorepo-integration-design.md

## マージ後の作業(このPRだけではデプロイは直らない)
1. Vercel: Root Directory を frontend に設定 → 再デプロイ
2. Heroku: monorepo buildpack + APP_BASE=backend 設定 → 接続先リポジトリ変更 → 手動デプロイ

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

ユーザーが PR を確認してマージする(マージ後、Step 3〜4 を続けて実施する — この間 master の自動デプロイは失敗しうるが、既存の本番デプロイは生きているためサイトは落ちない)。

- [ ] **Step 3: Vercel の Root Directory 設定 — ユーザー操作**

1. Vercel ダッシュボード → 該当プロジェクト → Settings → Build and Deployment → **Root Directory に `frontend` を設定して Save**
2. Deployments → 最新の master デプロイを Redeploy(または空コミットを push)
3. Expected: ビルド成功、`https://board-game-three.vercel.app` が従来どおり表示される

任意: Settings → Git → Ignored Build Step に `git diff --quiet HEAD^ HEAD -- .` を設定すると、frontend に変更のない push でビルドをスキップできる。

- [ ] **Step 4: Heroku の monorepo 設定と再接続 — ユーザー操作**

まずダッシュボードでアプリ名を確認(想定: `boardgameap`)。以下は CLI の例(ダッシュボードの Settings → Buildpacks / Config Vars でも同じことができる):

```bash
heroku buildpacks -a boardgameap                # 現状確認(heroku/java のはず)
heroku buildpacks:add -i 1 https://github.com/lstoll/heroku-buildpack-monorepo -a boardgameap
heroku config:set APP_BASE=backend -a boardgameap
heroku buildpacks -a boardgameap                # → 1. monorepo, 2. heroku/java の順であること
```

次にダッシュボード → Deploy タブ:

1. GitHub 接続を旧 `BoardGame` リポジトリから **モノレポ(BoardGameFront または改名後の名前)に変更**
2. Manual deploy で master をデプロイ
3. Expected: ビルドログに monorepo buildpack(`Copied backend to root of app` 相当のログ)→ Java buildpack の順で流れ、デプロイ成功

- [ ] **Step 5: 本番疎通確認**

本番サイト(`https://board-game-three.vercel.app`)で:

- [ ] トップページから各ゲームの「ルーム作成」が成功する(= Heroku の REST 疎通)
- [ ] timebomb / werewolf / hideout / fakeartist のルームに入室できる(= WebSocket 疎通)。decrypt は導線がないため URL 直打ち(`/decrypt/cutovertest`)
- [ ] 失敗した場合: Heroku 側は Deploy タブで旧 BoardGame リポジトリに接続し直して再デプロイすれば復旧(`heroku rollback` も可)。Vercel 側は Root Directory を空に戻せば復旧

- [ ] **Step 6: 旧リポジトリのアーカイブ — ユーザー操作**

疎通確認が取れたら、GitHub で旧 BoardGame リポジトリを Settings → Danger Zone → **Archive this repository**(読み取り専用化。削除はしない)。ローカルの `/Users/fukasedaichi/git/BoardGame` も当面残す(ロールバック保険)。

- [ ] **Step 7: ブランチの同期**

```bash
cd /Users/fukasedaichi/git/BoardGameFront
git checkout refactor/frontend-modernization
git fetch origin
git merge origin/master   # PRマージ(スカッシュ等)の形態によっては master を取り込む
```

これで Stage 1(`docs/superpowers/plans/2026-07-03-stage1-foundation-upgrade.md`)を開始できる状態になる。

---

## 検証記録

### Task 6(2026-07-03)

- **履歴検証: OK**
  - `git log --oneline -- backend | tail` で BoardGame の初期コミット `71e0e5d firstcommit` まで辿れる(全88コミット分の履歴を保持)
  - `git log --follow --oneline frontend/src/pages/index.tsx` でフロント初期コミット `d917867 fitst commit` まで辿れる
  - 統合コミット列: `13da0b7`(backend統合)→ `f80f80d`(frontend移動)→ `75053db`(ルートドキュメント)→ `5efe24c`(Stage1計画更新)
- **バックエンドローカルビルド: スキップ**(ローカルに JDK 未インストール。計画通り Heroku ビルド(Task 7)で検証する)
- **構造確認: OK** トップレベルは `CLAUDE.md README.md backend docs frontend` のみ、作業ツリーはクリーン。`frontend/` にフロント一式、`backend/` に pom.xml / mvnw / .mvn / system.properties / src 等が揃う
- **判定: カットオーバー(Task 7)へ進んでよい**

### Task 7

- カットオーバー結果: (実行時に記入)
