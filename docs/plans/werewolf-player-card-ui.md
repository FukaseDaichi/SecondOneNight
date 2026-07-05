# werewolf プレイヤーカードUI再設計

**Goal:** プレイヤーカード(userInfo)とフェーズ表示の構造問題を解消する。全カードを同一構造・同一高さにし、議論タイマーとカードの重なりをなくす。

**Scope:** 表示層のみ。通信契約(destination / topic / status / payload)・reducer・types は変更しない。

## 課題(現状)

1. 「写真をアイコンに」ボタンが自分のカードだけ縦に追加され、他プレイヤーとカード内の表示位置がずれる
2. アイコン選択(円形展開UI)とアップロード導線が分離している。アップロードは常に選べる状態にしたい
3. 名前は20文字まで入力できるのに、カード上は実質4〜5文字しか表示されない
4. YOUバッジがカード上端でアバター(-55px 浮き)と干渉し邪魔
5. フェーズ表示(議論中+残り時間+議論終了)が `position: absolute` の浮遊要素のため、ゲーム中はカードと重なり時間が読めず議論終了も押せない

## 設計(決定事項)

### フェーズヘッダー帯

- `TurnMessage` の `.messagearea` を absolute から**通常フローの `position: sticky` 帯**に変更。turn 1〜3 で「フェーズ名+残り時間+議論終了」を1本の帯として表示する
- 帯が自身の高さを持つため、カードは構造上その下から始まり重ならない。スクロールしても帯は上部に固定
- `Countdown` は fakeartist と共用のため、`inline` prop(variant)を追加して werewolf の帯内のみインライン表示。fakeartist の表示は不変
- 夜背景向けに半透明の暗色地(`rgba(13,34,41,0.72)` 系)。blur は使わない(スクロール性能)
- ゲーム中(turn 1〜3)はプレイヤーグリッドに上マージンを追加し、浮遊アバターが帯に食い込まないようにする

### プレイヤーカードの統一構造

- 「写真をアイコンに」ボタンと `upload` ブロックを**削除**(導線は IconPicker に統合)
- 名前: 文字数に応じて段階縮小+最大2行クランプ(`-webkit-line-clamp: 2` + `word-break: break-all`)。名前ゾーンは固定高(全カード共通)で、20文字まで全文表示できる
  - 目安: 〜4文字 2.1rem / 〜8文字 1.4rem / 〜13文字 1.15rem / それ以上 0.95rem(モバイルは一段小さく)
- YOU: 上端バッジを撤去し、**カード下辺中央の小タブ**+カード全体にほのかなティール発光(`box-shadow`)
- 役職スロット・銃撃(処刑)演出・✕キックボタンは現状のまま

### IconPicker(新規共通コンポーネント)

- `frontend/src/components/common/IconPicker.tsx` + `frontend/src/styles/components/common/iconpicker.module.scss`
- 自分のアバターをクリック → アバター直下にポップオーバー
  - プリセットアイコン ランダム6個のグリッド
  - 🔀 シャッフルボタン(6個を引き直し)
  - **「写真をアップロード」タイルを常設**(既存 `imageToIconDataUrl` を使用、エラーはポップオーバー内に表示)
- 外側クリック / Esc で閉じる。React state 駆動(現行 `HideoutIcon` の `document.querySelector` / classList 直接操作は使わない)
- 自分のアバター右下に小さな ✎ バッジを常時表示し「変更できる」ことを示す
- werewolf のみ置き換え。hideout の `HideoutIcon` は今回触らない(後で移行可能)

## 変更ファイル

| 種別 | ファイル |
| --- | --- |
| Modify | `frontend/src/features/werewolf/components/userInfo.tsx` |
| Modify | `frontend/src/features/werewolf/components/TurnMessage.tsx` |
| Modify | `frontend/src/features/werewolf/components/UserField.tsx`(ゲーム中の上マージン用クラス) |
| Modify | `frontend/src/components/common/Countdown.tsx`(`inline` prop 追加) |
| Modify | `frontend/src/styles/components/werewolf/room.module.scss` |
| Modify | `frontend/src/styles/components/werewolf/userinfo.module.scss` |
| Modify | `frontend/src/styles/components/werewolf/countdown.module.scss` |
| New | `frontend/src/components/common/IconPicker.tsx` |
| New | `frontend/src/styles/components/common/iconpicker.module.scss` |

## 検証

1. `cd frontend && npm test && npm run lint && npm run build`(lint error 0、warning 新規増加なし)
2. `npm run dev` + ブラウザ複数タブ: ロビーでカード高さ・名前表示(長短)・YOUタブ・アイコン変更(プリセット/シャッフル/アップロード)を確認。ゲーム進行で議論帯(残り時間・議論終了操作)とカードが重ならないことを確認
3. モバイル幅(カード120px)での名前縮小・ポップオーバーのはみ出し確認

## 完了時

- `docs/architecture/games/werewolf.md` の「副作用・UI 表示」を現在仕様に更新(写真アイコン導線・Countdown variant の記述)し、本計画書を削除する
