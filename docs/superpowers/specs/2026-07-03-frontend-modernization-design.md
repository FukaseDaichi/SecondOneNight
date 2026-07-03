# BoardGameFront 全面モダナイズ設計書

作成日: 2026-07-03

## 背景と現状

BoardGameFront は5つのリアルタイムボードゲーム(timebomb / werewolf / hideout / decrypt / fakeartist)を提供する Next.js アプリケーション。バックエンドは Java(Spring)で Heroku 上に稼働しており、SockJS + STOMP で通信する。

現状の主な負債:

- **古いスタック**: Next.js 11(Pages Router)/ React 17 / TypeScript 4.3(2021年ごろの構成)
- **メンテ終了ライブラリ**: `react-stomp` を5ゲーム全ページが直接使用。`react-color` もメンテ終了
- **god component**: 各ゲームが1枚の巨大な `pages/<game>/[roomId].tsx`(478〜1089行)に、状態管理・通信・UI・副作用が全て同居
- **テストゼロ**: 自動テストが1本もない
- **アンチパターン**: 15個前後の useState の乱立、巨大な受信 switch 関数、`document.querySelector` による直接DOM操作、stale closure(コールバック内の `messageList.concat` 等)、非制御 input のDOM直読み
- **その他**: バックエンドURLのハードコード(`src/const/next.config.ts`)、重複コンポーネント(countdownclock ×2)、命名の揺れ(`sosialbtn`、`caroucel`)、`bootstrap.min.css` の同梱、用途不明の残骸ページ(`gametest.tsx`、`home2.tsx`)

規模: TS/TSX 約8,400行、約60ファイル。

## ゴールと非ゴール

### ゴール

1. スタックの現代化(Next.js 15 / React 19 / TS 5.x)
2. 通信層の刷新(react-stomp → @stomp/stompjs v7 + sockjs-client、共通フック化)
3. 構造の健全化(god component の分割、状態遷移の reducer 化)
4. ロジック中心の自動テスト整備(Vitest)

### 非ゴール

- Java バックエンドの変更(API / WebSocket 仕様は現状のまま。互換性を維持する)
- UI/UX の全面刷新(見た目・ゲームの流れは概ね維持。明確なバグや細部のUX改善のみ許容)
- UIコンポーネントの網羅的テスト

## 決定事項(要件ヒアリング結果)

| 項目 | 決定 |
|---|---|
| 対象範囲 | フロントエンドのみ(このリポジトリ) |
| 改善の目的 | スタック現代化を含む全面改善 |
| 挙動 | 概ね維持。細部の改善・明確なバグ修正はOK(修正は記録に残す) |
| 検証環境 | 本番 Heroku(`https://boardgameap.herokuapp.com/`)に接続して動作確認 |
| テスト | ロジック中心(reducer・通信層)にユニットテストを整備 |
| 作業ブランチ | `refactor/frontend-modernization`(master には直接コミットしない) |

## アーキテクチャ

### 技術スタック(To-Be)

| 項目 | 現状 | 移行後 |
|---|---|---|
| フレームワーク | Next.js 11 / React 17 | Next.js 15 / React 19(最終的に App Router) |
| TypeScript | 4.3 | 5.x(`strict` 有効化は Stage 4 で実施。Stage 1〜3 は現行設定のままアップグレードのみ) |
| WebSocket | react-stomp | @stomp/stompjs v7 + sockjs-client |
| テスト | なし | Vitest + Testing Library |
| Lint/Format | ESLint 7 / Prettier 2 | ESLint 9 / Prettier 3 |
| バックエンドURL | ハードコード | `.env`(`NEXT_PUBLIC_AP_HOST` 等) |

sockjs-client を残す理由: バックエンド(Spring)のエンドポイント `boardgame-endpoint` が SockJS 形式のため。バックエンド無変更で互換を維持する。

### ディレクトリ構造(To-Be)

ゲームごとに「UI・状態・型」をまとめる feature 構造とする。

```
src/
  features/
    timebomb/
      components/         # 分割されたUI部品
      useTimebombRoom.ts  # 状態管理フック(useReducer + 通信)
      reducer.ts          # メッセージ→状態遷移の純粋関数 ★テスト対象
      types.ts
    werewolf/   ...(5ゲーム同構造)
    hideout/
    decrypt/
    fakeartist/
  lib/
    stomp/
      useGameSocket.ts    # 共通STOMP接続フック(全ゲーム共用)
      types.ts
  components/             # 共通UI(ボタン、モーダル等)
  pages/                  # ページは薄い入り口のみ(Stage 4 で app/ へ移行)
```

### 通信層の設計

- **`useGameSocket(gameName, roomId, onMessage)`** を1つ実装し、5ゲームで共用する
  - @stomp/stompjs の `Client` を生成し、`webSocketFactory` に SockJS を指定
  - `/topic/{roomId}/{gameName}` を購読
  - 型付きの `send(destination, payload)` を返す
  - 自動再接続(`reconnectDelay`)と接続状態の公開(現状は切断時に console.log のみ → 接続状態をUIに表示)
- 各ゲームの受信処理(status コードの巨大 switch)は **reducer(純粋関数)に変換**し、「メッセージ受信 → 状態遷移」をユニットテスト可能にする
- 副作用の分離:
  - `document.querySelector('body').classList` 等の直接DOM操作 → React の状態管理に置換
  - `scrollTo` やタイマー → useEffect に分離

## 段階的移行ステージ

各ステージの完了時点で必ず「ビルドが通り、本番接続で全ゲームが動く」状態を保つ。

### Stage 1: 基盤刷新

- Next.js 15 / React 19 / TS 5.x へアップグレード(Pages Router のまま)
- バックエンドURLの `.env` 化、Vitest 導入、ESLint 9 / Prettier 3 へ更新
- 依存ライブラリの React 19 互換確認。非互換なら置換:
  - `react-color`(fakeartist で使用)→ 動けば継続、非互換なら軽量な自作パレットに置換
  - `react-tsparticles` v1 → `@tsparticles/react` v3(トップページ背景)
  - `react-share` → 最新化、困難ならシェアリンク自作(単純なURL生成のため容易)
  - `interactjs` → 最新化(React 非依存のため影響小)
- 完了条件: ビルドが通り、本番バックエンド接続で5ゲーム全て動作

### Stage 2: 通信層の刷新

- `useGameSocket` を実装し、5ゲームを順に react-stomp から置換
- 置換完了後に react-stomp を依存から削除
- 再接続とエラー表示の改善(「細部の改善OK」の範囲)
- 完了条件: react-stomp が依存から消え、全ゲームが新通信層で動作

### Stage 3: ゲームごとの構造リファクタ

行数の少ない順に1ゲームずつ実施: **hideout(478行)→ decrypt(534行)→ timebomb(653行)→ werewolf(1020行)→ fakeartist(1089行)**

各ゲームで:
1. reducer 抽出 + ユニットテスト作成
2. コンポーネント分割(feature 構造へ移動)
3. 本番接続で動作確認

- stale closure 等の明確なバグはこの段階で修正し、変更点を記録する
- 完了条件: 各ゲームのページが薄い入り口になり、状態遷移がテストされている

### Stage 4: 仕上げ

- App Router 移行(ゲームページは全て実質SPAのため `'use client'` で機械的に移行)
- TypeScript `strict` の有効化と型エラーの解消
- 重複削除: `components/countdownclock.tsx` と `components/clock/countdownClock.tsx` の統合
- 命名統一: `sosialbtn`→`socialbtn`、`caroucel`→`carousel` 等
- `bootstrap.min.css` の使用実態調査 → 使用クラスが少数なら削除して自前CSS化
- 残骸ページ(`gametest.tsx`、`home2.tsx`)の削除判断(削除前にユーザーへ確認する)

## テスト戦略

- **reducer のユニットテスト(主戦場)**: ゲームごとの状態遷移を網羅
  - 例: 「status 200 受信 → 状態更新とメッセージ追加」「winnerTeam=2 → 爆弾チーム勝利表示」「ラウンド進行 → ラウンドメッセージ表示」「status 404 → エラーメッセージのみ」
- **useGameSocket のテスト**: STOMP クライアントをモックし、接続・購読・送信・再接続を検証
- UIコンポーネントの網羅テストは書かない(方針どおり)

## 挙動維持の検証

- 各 Stage 完了時に本番 Heroku 接続で「ルーム作成 → 入室 → ゲーム開始 → 終了」を5ゲーム分手動確認
- ブラウザ2タブで複数プレイヤーをシミュレート
- 意図的な挙動変更(バグ修正・細部UX改善)は都度記録する

## リスク

| リスク | 対策 |
|---|---|
| Next 11→15 の一括アップグレード(Stage 1)が最大の山。styled-jsx の挙動変更、next/router の API 差分など | アプリが小さい(8,400行)ため現実的。ブランチ内で完結させ、動作確認が取れるまでマージしない |
| 依存ライブラリ(react-color 等)の React 19 非互換 | Stage 1 で互換確認し、非互換なら上記の置換方針に従う |
| Heroku 本番が落ちている時間帯は検証が止まる | ローカルで確認できる作業(テスト・ビルド)を先に進める |
| stale closure 修正により挙動が変わる可能性 | 修正は1件ずつ記録し、動作確認で担保 |
