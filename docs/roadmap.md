# ロードマップ — フロントエンド全面モダナイズ

> 状態: Stage 3 完了(2026-07-04 時点)。次は Stage 4(未着手)

フロントエンドを段階的にモダナイズする取り組みの全体像。各ステージ完了時点で「ビルドが通り、本番接続で全5ゲームが動く」状態を保つ。バックエンド(Java)は無変更(API / WebSocket 仕様の互換を維持)。

進行中の計画書は [plans/](plans/) に置き、完了したら検証記録の要点をこの文書に吸収して削除する。

## ステージ一覧

| ステージ | 内容 | 状態 |
|---|---|---|
| モノレポ統合 | BoardGameFront + BoardGame を1リポジトリに統合(履歴保持) | ✅ 完了(2026-07-03) |
| Stage 1: 基盤刷新 | Next.js 11→15 / React 17→19 / TS 5 / Vitest 導入 / 接続先の env 化 | ✅ 完了(2026-07-04) |
| Stage 2: 通信層刷新 | react-stomp → @stomp/stompjs v7 + useGameSocket 共通フック | ✅ 完了(2026-07-04、PR #81) |
| Stage 3: 構造リファクタ | 5ゲームの reducer 化 + feature 構造分割 + ページ薄型化 | ✅ 完了(2026-07-04) |
| Stage 4: 仕上げ | App Router 移行 / TS strict / 命名整理 / 残骸削除 | ⬜ 未着手 |

## Stage 4 の内容(全体設計から)

- App Router 移行(ゲームページは実質 SPA のため `'use client'` で機械的に移行)
- TypeScript `strict` 有効化と型エラー解消(サーバペイロードの `any` 排除)
- 重複削除: `components/countdownclock.tsx` と `components/clock/countdownClock.tsx` の統合
- 命名統一: `sosialbtn`→`socialbtn`、`caroucel`→`carousel` 等
- `bootstrap.min.css` の使用実態調査 → 使用クラスが少数なら削除して自前 CSS 化
- 残骸ページ(`gametest.tsx`、`home2.tsx`)の削除判断(削除前にユーザーへ確認)
- scss の feature 構造への移動・命名整理
- 5ゲーム間の reducer 共通化の要否判断

## 残課題バックログ(各ステージからの繰り越し)

### Stage 4 で対応予定

- sass `@import` / グローバル関数の非推奨警告(Dart Sass 3.0 で削除予定)
- dev の `webpack-hmr 404`(Next 15 の Fast Refresh 挙動。実行時・ビルドに影響なし)の調査
- ESLint warning(`no-explicit-any` 等)の削減 — strict 化とセット
- fakeartist のヘッダチェック操作(`.fakeartistcheck` の DOM 操作)— ヘッダが共通コンポーネントのため Stage 3 では現状維持とした
- 送信経路の try/catch 非対称(timebomb の changeLimitTme / changeSecretFlg)の統一検討 — 挙動維持のため据え置き中
- ページ行数の 150 行目標未達(fakeartist 251 / werewolf 240 / timebomb 184)— 受信処理は reducer 化済みで機能問題なし。JSX / フック接続の追加分割は Stage 4 のリファクタ候補

### 手動確認推奨(未実施)

- ライブ再接続ドリル: 実ネットワーク断で `reconnecting` バナー表示 → 自動復帰(ユニットテストでは検証済み。ヘッドレス環境では強制切断できず未実施)
- ConnectionStatus(z-index: 9999)がモーダルと重なるケースの目視確認(一時バナーのみ・低リスク)

## 完了ステージの記録(要点)

### モノレポ統合(2026-07-03)

- git filter-repo で BoardGame の全履歴を `backend/` 配下に書き換えてマージ。`git log backend/` で旧履歴が辿れる
- カットオーバー(Vercel Root Directory / Heroku monorepo buildpack)完了。構成の詳細は [architecture/deployment.md](architecture/deployment.md)

### Stage 1: 基盤刷新(2026-07-04)

- Next.js 15 / React 19 / TS 5.9 / ESLint 9 / Prettier 3 / Vitest へ更新。接続先を `NEXT_PUBLIC_AP_HOST` で上書き可能に
- **react-color は React 19 で正常動作と判定し、置換をスキップ**(fakeartist の TwitterPicker)
- react-tsparticles v1 → @tsparticles/react v3 に置換
- Next 11 dev で発生していたルーム URL 直リンクの接続不成立は Next 15 化で解消
- 意図的な挙動差分なし

### Stage 2: 通信層刷新(2026-07-04、PR #81)

- react-stomp を依存から削除し、全5ゲームが `useGameSocket`(@stomp/stompjs v7 + sockjs-client)経由で送受信。仕様は [architecture/frontend.md](architecture/frontend.md) 参照
- 自動再接続(reconnectDelay 5000)+ 接続インジケータ `ConnectionStatus` を追加(意図的な挙動差分はこれのみ)
- 申し送り「useGameSocket の enabled=false 時に status が disconnected に戻らない」は Stage 3 Task 1 で修正済み

### Stage 3: 構造リファクタ(2026-07-04)

- 全5ゲーム(hideout / decrypt / timebomb / werewolf / fakeartist)を `features/<game>/` 構造に分割。受信処理を純粋な reducer(+ ユニットテスト)へ集約し、副作用は `use<Game>Room` の useEffect に分離、ページは薄い入口(フック呼び出し + レイアウト)に。詳細は [architecture/frontend.md](architecture/frontend.md)
- 完了検証: `npm test` 127件全 PASS / `npm run lint` error 0 / `npm run build` 成功。本番 Heroku 2タブでの全5ゲーム手動確認も問題なし
- 意図的な挙動差分:
  - reducer 化による stale closure 解消(連続受信でメッセージが欠落しない)
  - 入室フォームを `entered` 導出に変更(退室でフォームが再表示される)。decrypt の入室フォームに未接続時 disabled を追加し他4ゲームと統一
  - timebomb のデバッグ用非表示入室ブロック(`false && …`)を削除
  - werewolf 役職カウンターの DOM 直接操作を state 化(見た目・操作は同一)
  - 非制御 input(username)を制御 input 化
  - **アクション拒否時の再配信 obj への防御**(decrypt / fakeartist): バックエンドは `ApplicationException`(デフォルト status=200)で status のみ差し替え `obj` は再設定しないため、room 形状でない obj が届く。`isRoomData` ガードで旧実装の「状態不変」を復元(バックエンド無変更)
- 手動確認中に発見した既存バグ(Stage 3 とは無関係): ホーム画面パララックスの `#main-img` null 参照 → null ガードを追加して修正

### LP + werewolf リデザイン / ルームコード・退出・アイコン(2026-07-05)

- トップページを werewolf 専用 LP として刷新し、`RoomCreateCta` / `RoomJoinByCode` によるルーム作成・6桁あいことば入室を追加。プレイ人数表示は実装の開始条件に合わせて `３人〜` に統一
- werewolf 画面に `styles/tokens.scss` ベースのデザイントークン、turn 連動の `PhaseBackground`、中央入室カード `EntryCard`、招待パネル `InvitePanel`、ルールモーダル刷新、夜の開始演出 `WerewolfStart` を導入
- バックエンドは werewolf ルーム作成時に `roomCode` を採番し、`GET /roombycode/{roomCode}` で Room を検索可能にした。Room JSON には共通フィールドとして `roomCode` を追加
- werewolf に待機中/終了後の退出・キックを追加し、既存 `/app/game-removeuser` を status `130` で利用。自分が `userList` から消えた場合はトップへ戻る
- 写真アップロードを 96px JPEG Data URL に縮小し、既存 `/app/game-changeIcon` status `650` で送信するカスタムアイコン機能を追加
- 完了検証: `npm test` 131件全 PASS / `npm run lint` error 0 / `.next` を削除したクリーン状態で `npm run build` 成功。dev server で `/` と `/werewolf/test-room` の 200 応答を確認
- 未実施: ローカル環境に Java Runtime がなく `backend ./mvnw test` は未実行。`backend/mvnw` は実行権限が無いため、検証時は Java 11 環境で権限付与または `sh mvnw test` が必要
