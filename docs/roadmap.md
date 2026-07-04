# ロードマップ — フロントエンド全面モダナイズ

> 状態: Stage 3 進行中(2026-07-04 時点)

フロントエンドを段階的にモダナイズする取り組みの全体像。各ステージ完了時点で「ビルドが通り、本番接続で全5ゲームが動く」状態を保つ。バックエンド(Java)は無変更(API / WebSocket 仕様の互換を維持)。

進行中の計画書は [plans/](plans/) に置き、完了したら検証記録の要点をこの文書に吸収して削除する。

## ステージ一覧

| ステージ | 内容 | 状態 |
|---|---|---|
| モノレポ統合 | BoardGameFront + BoardGame を1リポジトリに統合(履歴保持) | ✅ 完了(2026-07-03) |
| Stage 1: 基盤刷新 | Next.js 11→15 / React 17→19 / TS 5 / Vitest 導入 / 接続先の env 化 | ✅ 完了(2026-07-04) |
| Stage 2: 通信層刷新 | react-stomp → @stomp/stompjs v7 + useGameSocket 共通フック | ✅ 完了(2026-07-04、PR #81) |
| Stage 3: 構造リファクタ | 5ゲームの reducer 化 + feature 構造分割 + ページ薄型化 | 🔄 進行中([plans/stage3-structure.md](plans/stage3-structure.md)) |
| Stage 4: 仕上げ | App Router 移行 / TS strict / 命名整理 / 残骸削除 | ⬜ 未着手 |

## Stage 3 の現況(2026-07-04)

Task 1〜12(useGameSocket 修正、全5ゲームの reducer 化 + テスト + feature 分割 + ページ薄型化)は実装済み。残りは **Task 13: Stage 3 完了検証**(旧構造残骸の確認、全チェック、本番接続での全5ゲーム最終確認、検証記録の記入)。

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
