# werewolf ゲーム中画面のUI統一 — 設計書

roadmap 項目「werewolf のゲーム中画面をデザインシステムへ寄せる」の実装設計。完了したら本書を削除し、現在仕様を `docs/architecture/games/werewolf.md` に反映する。

## 目的とスコープ

待機/終了画面で導入した `tokens.scss` ベースのデザイン(和風・Shippori Mincho・teal / rose / night / gold)を、役職選択・議論・投票の3フェーズと演出系(カットイン・カウントダウン・投票開始オーバーレイ)へ展開する。

**通信契約(destination / topic / status)と reducer のロジックは一切変更しない。** 変更は SCSS と表示層コンポーネントのみ。

### 現状

- トークン化済み SCSS: `room` / `entry` / `start` / `userinfo` / `result` / `victory` / `rule` / `background`
- 未トークン化 SCSS: `rollselectturn` / `rollcard` / `modalrollcard` / `cutin` / `countdown` / `werewolfset`
- `PhaseBackground` の夜背景は役職選択(turn 1)のみで、議論・投票(turn 2〜3)は昼(mist)に戻る
- `rollselectturn.tsx` / `modalrollcard.tsx` に body クラス操作・`getElementById` などの DOM 直接操作が残る

## トーン設計(フェーズ連動)

`PhaseBackground` を拡張し、ゲーム中(turn 1〜3)を夜系で連続させる。

| turn | 現在 | 変更後 |
| --- | --- | --- |
| 0 待機 | day (mist) | 現状維持 |
| 1 役職選択 | night | 現状維持(基準トーン) |
| 2 議論 | day に戻る | 夜系バリエーション(やや明るい藍。提灯的な gold グローを追加) |
| 3 投票 | day | 夜系(緊張感のある deep 藍 + rose-deep のティント) |
| 4 結果 | 陣営色 night | 現状維持 |

- 夜系画面上のカード・ボタン・メッセージ帯は `$night` 系地 + `$paper` / `$gold-soft` 文字の配色に統一する
- フェーズ固有色が必要なら `tokens.scss` に追加する(例: `$night-discussion`、`$night-voting`)
- `prefers-reduced-motion` 対応は `background.module.scss` の既存パターンを踏襲する

## ステップ構成

各ステップ完了ごとに検証ゲート(下記)を通す。途中で止めても壊れない縦切り構成。

### ステップ0 — 基盤

- `tokens.scss` にフェーズ色を追加
- `PhaseBackground` に turn 2 / 3 の夜系クラスを追加
- `TurnMessage`(メッセージ帯)を夜系トーンに合う共通スタイルへ刷新(全フェーズ共通で表示されるため先に行う)

### ステップ1 — 役職選択

- `rollselectturn` / `rollcard` / `modalrollcard` の SCSS トークン化+レイアウト刷新
- DOM 直接操作の除去:
  - body クラス操作(`modal_active_second` 等)→ 共通 `useBodyClass(className, active)` フックを新設して置き換え(`components/modal.tsx` にも同じパターンがあるが、今回触るのは werewolf 側のみ。フックは共通化して置く)
  - `rollviewcb` チェックボックスハック・`getElementById` → React state / ref 化

### ステップ2 — 議論

- `countdown.module.scss` トークン化と `Countdown` 表示刷新
- `UserField` / `userInfo` の議論中スタイル(アクション対象選択の見た目)を夜系に調整
- 「議論終了」ボタンの刷新

### ステップ3 — 投票

- 投票中の `userInfo`(投票ボタン・投票済み表示)の夜系スタイル
- 投票開始オーバーレイ(`Overlays` 内 `roundMessage`)を `WerewolfStart` と同系の演出に刷新

### ステップ4 — 演出系仕上げ

- `cutin` の SCSS トークン化+刷新
- ロビーフッター内で唯一未トークン化の `werewolfset.module.scss` も揃える
- 全フェーズ通しの動作確認

## テスト・検証(各ステップの検証ゲート)

- reducer / hook のロジックは触らないため新規ユニットテストは不要。既存テストが通ることを確認する
- `npm test && npm run lint && npm run build`(lint error 0、warning 新規増加なし)
- フェーズ確認は本番 Heroku 接続 + ブラウザ2〜3タブで該当フェーズまで進行して確認(開始には3人必要)
- モーション追加時は compositor プロパティ(transform / opacity)のみ使い、blur は控えめにする

## 非スコープ

- 他4ゲーム、backend、通信契約、reducer / types
- SCSS の feature 配下への移動(roadmap の CSS 整理項目で判断)
- `components/modal.tsx` 等 werewolf 外の DOM 操作除去(roadmap の DOM 整理項目の残りとして扱う)
