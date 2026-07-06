# werewolf 勝利演出の一枚絵化(種明かし盤面の上で勝敗発表→結果モーダル)

## 背景 / 目的

セカンドワンナイト人狼の終了演出は現在3幕構成で、幕ごとに画面が丸ごと切り替わる:

1. **reveal** — 種明かし(センターステージに1人ずつ登場、死亡者は銃声+銃痕): `RoleRevealAct`
2. **verdict** — 勝敗発表(全画面。勝者前出しレイアウト): `VerdictAct`
3. **result** — 巻物風の結果一覧: `ResultScroll`

種明かしの演出は気に入っているが、幕が切り替わるたびに盤面(開示済みの列・銃痕)が消えて目で追えない。そこで**種明かしの最終盤面を残したまま**、その上に勝敗バナー → 詳細モーダルを重ねる一枚絵の流れに変更する。

## 新しい流れ

1. 種明かし: 現状どおり1人ずつ開示(変更なし)
2. 全員開示後: 盤面(全員が開示済みの列に並んだ状態)はそのまま残る
3. 勝敗発表: 同じ画面の中央に「〇〇の勝利」バナーが1文字ずつ出る + 陣営色の花びら(celebration)
4. 4秒後(またはタップ)に詳細モーダルが自動で開く。背面に盤面とバナーが見える
5. モーダル内容は現在の結果一覧(役職・投票先・得票・勝敗)+「ロビーへ戻る」ボタン
6. 「ロビーへ戻る」で演出終了 → ロビー(現状と同じ動線)

## 設計

### 幕の状態機械(victory.ts)

- 幕名 `reveal → verdict → result → closed` と `nextVictoryAct` の advance / return 遷移は維持
- **skip の遷移先を `result` → `verdict` に変更**。全員開示済みの盤面+勝敗バナーを飛ばすと文脈が失われるため。verdict からは従来どおり4秒 or タップで result へ自動進行
- `victory.test.ts` の skip ケースを更新

### VictoryOverlay(レイヤー構成に変更)

- `RoleRevealAct` を **reveal / verdict / result の間ずっとマウントしたまま**にする(現在は reveal 中のみ)
- verdict 中: バナー(VerdictBanner)を盤面の上に重ねる
- result 中: バナーは画面上部に残したまま、結果モーダル(ResultModal)を重ねる。勝敗とモーダルが同時に見える
- SakuraParticles(celebration・陣営 palette)は現状どおり `act !== 'reveal'` で発火
- verdict の4秒自動送り(VERDICT_MS)とタップ送りは現状の実装を維持

### RoleRevealAct(最終盤面の維持)

- `finished: boolean` プロップを追加。true の間は「全員が doneRow に並び、中央ステージは空、ヒント文言は非表示」の最終盤面を静的に表示する
- 進行タイマー・onDone 発火・タップ進行は `finished === false`(reveal 中)のみ動作
- 開示演出そのもの(登場→フリップ→銃撃)には手を入れない

### VerdictAct → VerdictBanner に置き換え

- 勝者前出しの全画面レイアウトは廃止(勝者一覧の役目は詳細モーダルが引き継ぐ)
- 「〇〇の勝利」の1文字ずつアニメーション(既存の char アニメーション)と陣営色スタイルのみをバナーとして移植
- verdict 中は画面中央、result 中は画面上部に縮小して残す(CSS トランジションで移動)

### ResultScroll → ResultModal に置き換え

- 一覧の内容(役職・投票先・得票・勝敗・NPC 行・「散」タグ)は現状のまま
- 見た目をモーダルダイアログ化: 下からスライドイン、背面は薄暗くしつつ盤面とバナーが透けて見える
- 「ロビーへ戻る」ボタンで `return` イベント → `closed`(現状と同じ)

### 変更ファイル

| ファイル | 変更 |
| --- | --- |
| `frontend/src/features/werewolf/victory.ts` | skip 遷移を verdict に変更 |
| `frontend/src/features/werewolf/victory.test.ts` | skip ケース更新 |
| `frontend/src/features/werewolf/components/VictoryOverlay.tsx` | レイヤー構成(RoleRevealAct 常駐+バナー+モーダル) |
| `frontend/src/features/werewolf/components/RoleRevealAct.tsx` | `finished` プロップ追加 |
| `frontend/src/features/werewolf/components/VerdictAct.tsx` | VerdictBanner.tsx に置き換え(git mv + 書き換え) |
| `frontend/src/features/werewolf/components/ResultScroll.tsx` | ResultModal.tsx に置き換え(git mv + 書き換え) |
| `frontend/src/styles/components/werewolf/rolereveal.module.scss` | finished 状態のスタイル |
| `frontend/src/styles/components/werewolf/verdict.module.scss` | バナー化(前出しレイアウト削除・上部縮小移動) |
| `frontend/src/styles/components/werewolf/resultscroll.module.scss` | モーダル化 |

### 触れないもの

- reducer / useWerewolfRoom / 通信契約 / backend — 一切変更しない(表示層のみ)
- `[roomId].tsx` の `victoryVisible` 条件と VictoryOverlay への props — 変更しない
- 種明かしの開示順(`revealOrder`)・死亡判定(`isDeadUser`)— 変更しない

## テスト / 検証

- `victory.test.ts`: skip 遷移の期待値を更新、既存ケースが通ることを確認
- 完了ゲート: `npm test && npm run lint && npm run build`
- 動作確認: `npm run dev` → ブラウザ2タブで「ルーム作成→入室→ゲーム進行→終了演出」を通し、(1) 種明かし後に盤面が残ったままバナーが出る (2) 4秒後にモーダルが自動で開く (3) スキップで verdict に飛ぶ (4) ロビーへ戻れる、を確認
