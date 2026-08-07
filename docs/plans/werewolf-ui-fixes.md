# werewolf UI改善 — 診断結果と実装対応計画

2026-08-06 実施のUI診断(コード全読 + 本番Heroku接続で3タブ実プレイ検証)の結果と、その対応計画。
2026-08-08 Codexレビュー(read-only、backend含む)の指摘を反映して改訂。

対象は `frontend/` のみ。**通信契約(宛先・payload構造・購読topic)は一切変更しない**。backend・ゲームロジックも変更しない。

- 想定ユーザー: 初見でも遊べるライトゲーマー
- 主な利用環境: スマホ縦持ち(約5割)
- 診断時に「判断保留」とした項目(役職カードの常時表向き、権限のフラット設計、未投票者の可視化、議論時間デフォルト、特殊役職演出)は**すべて対応不要と決定済み**。本計画に含めない。

## 診断結果(優先度順)

| # | 優先度 | 画面 | 問題(検証方法) | 対応方針 |
|---|---|---|---|---|
| 1 | 高 | ロビー/お品書き | 役職の+/−はローカルstateのみで「設定」押下まで未送信。合計表示・開始判定はローカル値基準のため、**表示と違う役職構成でゲームが開始される**(実プレイで再現: 狂人+1・合計5/必要4表示→実際は旧構成4枚で開始) | **「設定」ボタンを維持**し、未反映(dirty)状態を可視化(設定ボタンの淡い点滅)+ 未反映中はGAME STARTを制御 |
| 2 | 高 | ゲーム中全フェーズ | 「遊び方」ボタンが夜背景にコントラスト1.24〜1.55:1(実測)でほぼ不可視。さらに高さ28pxの下10pxがフェーズ帯(z-index:9)に覆われ実質タップ不能(実測: 帯y48-119、ボタンy30-58) | フェーズ帯内に明色ピルとして移設 |
| 3 | 高 | 投票 | タップ即確定・変更不可なのに、投票済みか・誰に入れたか・あと何人待ちかの表示が一切ない(実プレイで確認) | 自分のカードに「投票済 → ○○」表示を追加 |
| 4 | 高 | ゲーム中下部 | GAME RESETが確認なしで即発動、primaryスタイルで常設。誰でも1タップで全員のゲームを破棄できる | `window.confirm` 追加 + ghost系スタイルへ降格 |
| 5 | 高 | 役職選択 | 「1枚選んで残りを次の人へ渡す」という核心ルールが画面上に皆無。手番表示も金枠アバターの色表現のみ(スクリーンショットで確認) | ガイド文1行 + 「○○さんが選んでいます」を追加 |
| 6 | 中 | ロビー | 3人入室・役職未設定時に「開始できます」(人数のみ判定)+ GAME START無効 + バッジ「参加待ち」が同時表示され矛盾(実機で再現)。不足理由は`title`属性(スマホ不可視)頼み | キャプションを `readiness` 基準に統一し不足理由を表示 |
| 7 | 中 | 議論 | 「議論終了」(実測36px)が確認なしで全員の議論を即終了→投票開始(不可逆) | ボタン経由のみ `window.confirm` 追加 + 44px化(タイマー時間切れの自動終了には confirm を出さない) |
| 8 | 中 | 役職カードモーダル | 背景タップで閉じない(実機で確認)・✕なし・閉じ方のヒントなし。カード面タップのみで閉じる | 背景タップで閉じる + ✕ボタン(遊び方モーダルの実装パターン流用) |
| 9 | 中 | 全画面下部 | 旧Twitter鳥アイコンのまま(実機で表示確認)。`via` propにアカウント名でなく宣伝長文を渡しており投稿文が壊れる。「シェア」の説明文言なし | `XIcon`/`XShareButton`へ差し替え(react-share 5.3.0 でエクスポート確認済み)+ ラベル追加 + `via`修正。**共有部品のため4ゲーム横断で対応** |
| 10 | 中 | ゲーム中/ロビー | 役職一覧の「×1/×3」が色指定なし継承で暗背景に暗文字(スクリーンショットでほぼ視認不能)。開始条件警告 `$rose-deep` は実測3.83:1でAA未達 | 背景コンテキスト別に文字色を明示(ロビー=淡背景/ゲーム中=夜背景で分岐) |
| 11 | 中 | ロビー/ゲーム中 | 44px未満のタップ領域群: 役職+/− 28px、キック✕ 24px、議論終了36px(CSS+実測) | 見た目を変えず当たり判定を44px化 |
| 12 | 低 | 全画面 | エラー通知(status 998/999・通信エラー)が成功色の緑トースト(実測3.13:1)で3秒フェードアウト。読み損ねても再確認手段なし | messageList に種別を持たせ、エラー種別スタイル + 表示延長 + `aria-live` |
| 13 | 低 | 入室 | 名前未入力で「入室する」をタップしても無反応(`roomIn`が黙って早期return) | 未入力時はボタンをdisabled + hook側も `trim()` でガード |
| 14 | 低 | ロビー/招待 | 「コピーしました」表示が永久に戻らない(`copied`にリセットなし) | 2秒後に元へ戻す |

## Codexレビュー(2026-08-08)による主要な設計変更

当初案の「+/−即時送信化」は **wire contract は不変だが timing-only ではない**と判定され却下した。根拠:

- backend には総数15枚超・てるてる/付き人/怪盗の重複禁止などフロント未検証の制約があり(`WerewolfRoom.java:73,102-116`)、違反時の status 998 は Room を返さないため乖離が残る(`reducer.ts:167`)
- `useGameSocket.send` に debounce/ack がなく連打で毎回ブロードキャスト、150受信は counterMap を全置換するため巻き戻り・他プレイヤーとの last-write-wins が発生する
- `setRollRegulation` に turn ガードがなく、GAME START との順序競合で開始後に rollList が差し替わり得る

→ **採用案: 「設定」ボタンを残し、未反映(dirty)状態を可視化して GAME START を制御する。**送信タイミング・頻度・エラー処理は一切変えないため、上記リスクをすべて回避できる。

## 実装フェーズ

依存関係がないため、フェーズごとに1ブランチ→1PRで独立して進められる。上から順に着手する。
各フェーズのPRで `docs/architecture/games/werewolf.md` の該当記述(特に「±はローカル、設定ボタンで送信」の節)を現在仕様に更新する(設計書は同一PRで更新する規約)。

### Phase 1: 破壊的操作の保護 + 小修正(すべてS、まとめて1PR)

対象: #4, #7, #13, #14, #9の`via`除去

1. **GAME RESET確認** — `frontend/src/pages/werewolf/[roomId].tsx` の `actionButtons` 内 `onClick={init}` を、turn>0 のとき `window.confirm('ゲームをリセットして全員をロビーに戻しますか?')` 経由に変更(既存の退出ボタンと同パターン)。スタイルを `styles.ghost` に変更し、ロビー中のGAME STARTは現状維持
2. **議論終了確認** — confirm は `TurnMessage.tsx` の**ボタン onClick 側にのみ**追加する。`limittimeDone` 自体には入れない(`MoonTimer` の時間切れが同じ `onDone` → `limittimeDone` を呼ぶため、そこに入れると自動終了時にも confirm が出てしまう)。`endbtn` に `min-height: 44px`
3. **入室ボタン** — `EntryCard.tsx` で `disabled={!connected || name.trim() === ''}`。Enter送信側も同条件でガード。あわせて `useWerewolfRoom.ts` の `roomIn` も `!userName.trim()` で拒否(UI と hook の二重ガード)
4. **コピー表示リセット** — `InvitePanel.tsx` の `copied` を `useEffect` + `setTimeout(2000)` で元に戻す(クリーンアップ付き)
5. **via修正(4ゲーム横断)** — `Socialbtn` は fakeartist / hideout / timebomb からも使われる共有部品。werewolf だけでなく `fakeartist/[roomId].tsx`・`hideout/[roomId].tsx`・`timebomb/[roomId].tsx` の `via` 長文も同時に整理する(`via` はアカウント名用のprop)

### Phase 2: 役職設定の未反映可視化(#1)+ ロビー表示整合(#6)

**#1 が本計画で最重要。送信の仕組みは一切変えない。**

- **dirty 判定の追加** — reducer の state に「サーバーが最後に受理した構成」を保持する `appliedCounterMap` を追加する。status 100/130/150/700 で `toCounterMap(rollNoList)` を反映する際に `counterMap` と `appliedCounterMap` の両方を更新し、ローカルの `counter` アクションは `counterMap` のみ更新する。`dirty = !等値(counterMap, appliedCounterMap)` を純粋関数(`lobby.ts` か新規 `rollRegulation.ts`)として切り出し、ユニットテストを書く
- **「設定」ボタンの点滅** — dirty 中は `MenuPanel` の「設定」ボタンを**淡く点滅**させる(例: `box-shadow`/`opacity` の 2s ease-in-out infinite alternate、`$gold` 系の柔らかい発光)。`prefers-reduced-motion: reduce` 時はアニメーションを止め、静的な強調(枠色 `$gold` + 「未反映」ラベル)に切り替える
- **未反映中の GAME START 制御** — dirty のとき `readiness.messages` に「役職構成が未反映です。「設定」を押してください」を加え、GAME START(StatusCard・下部バーとも)を disabled にする。判定は `lobbyReadiness` の純粋関数に dirty を引数追加するか、呼び出し側で合成する(テスト可能な形を優先)
- **プリセット選択は現状維持** — `werewolfset.tsx` の即時送信はそのまま。送信後に 150 が返れば `appliedCounterMap` も同期され dirty は解消される
- **#6**: `StatusCard.tsx` のキャプション判定を `count >= min` から `ready && !dirty` に変更し、未達時は不足メッセージの先頭(例「役職があと1枚足りません」「役職構成が未反映です」)を表示。**蝋燭(大小)は「参加人数表示」のまま変更しない**(開始可否はキャプション+ボタンが担う、と役割を明確化)。`title` 属性は残してよいが依存しない
- 動作確認(2〜3タブ): +/−直後に設定ボタンが点滅し GAME START が無効化されること/「設定」押下で点滅解消・開始可能になること/プリセット選択では点滅しないこと/**+/−したまま「設定」を押さず GAME START できない**こと(診断で再現したトラップの再発防止)/backend が 998 を返す構成(重複役職等)で「設定」した場合に点滅が残り続けること

### Phase 3: ゲーム中の導線と情報(#2, #3, #5)

- **#2 遊び方ボタン移設** — `Overlays.tsx` の `rulebtn`(絶対配置)と `showRuleButton` prop を廃止し、`TurnMessage.tsx` に `onShowRule` prop を**新設**してフェーズ帯内に「遊び方」ピルを置く(`endbtn` と同系の明色スタイル)。配線はページ側: `<TurnMessage onShowRule={() => setRuleFlg(true)} …>`。帯はturn 1〜3で常時表示・stickyのため可視性とタップ性が同時に解決する
- **#3 投票済み表示** — `userInfo.tsx` で `ownFlg && turn === 3 && playerData.votingUserName != null` のとき、自分のカードに「投票済 → {votingUserName}」バッジを表示(`you` バッジと同系スタイル)。データは既存 `playerData.votingUserName`(status 700 の Room broadcast で更新されることを backend `WerewolfRoom.java:370` / `reducer.ts dataSet` で確認済み)を使うだけで通信変更なし。**最後の1人が投票すると turn が 4 になり結果画面へ即遷移するため、このバッジは「自分が投票済みで他を待っている間」にのみ見える**(現行仕様と整合、これで意図どおり)
- **#5 役職選択ガイド** — `rollselectturn.tsx` に2点追加:
  - 手札2枚表示時: 「1つ選ぶと、残りは次の人へ渡ります」の一行(`memo` バッジと同系の控えめスタイル)
  - 待機中: 「待機中」の下に「{現在手番のuserName}さんが選んでいます」。手番ユーザーは `userList.find(u => u.handRollList?.length === 2)` で**新たに導出**する(既存の `turnFlg` は map コールバック内のローカル変数のため流用不可)

### Phase 4: モーダル・シェア・コントラスト(#8, #9, #10, #11, #12)

- **#8** — `modalrollcard.tsx`: ラッパー `div.modal` に `onClick={unView}`、内側カードに `stopPropagation`、✕ボタン追加(`rule.tsx` の `close` 実装・スタイルを流用)。あわせて `role="dialog"` / `aria-modal="true"` / Esc キーで閉じる対応も入れる
- **#9** — `sosialbtn.tsx`: `TwitterShareButton`/`TwitterIcon` → `XShareButton`/`XIcon`。**共有部品のため4ゲーム(werewolf/fakeartist/hideout/timebomb)の表示確認を完了ゲートに含める**。エリアに「この部屋をシェア」ラベルを追加。旧綴り `sosialbtn` → `socialbtn` のリネーム(`git mv`)は4ゲームの import 更新を伴う共有部品変更のため、**このPR内で全 import を同時更新する**(規模が膨らむ場合は別PRに分離してよい)
- **#10** — `rollinfo` はロビー(淡背景)とゲーム中(夜背景)の両方で使われるため、無条件の明色指定はしない。ページ側から背景コンテキストを示す class(例 `onDark`)を渡すか、`[roomId].tsx` 側のラッパーで色を切り替える。`menupanel.module.scss` の `.notice` 文字色は濃色化(4.5:1以上を実測確認)
- **#11** — `menupanel.module.scss` の `%card-mini-button`、`userinfo.module.scss` の `.kick` に、**`position: relative` を明示した上で** 44px四方の透明 `::before` を重ねて当たり判定を拡大(`.kick` は `position: absolute` 済みなのでそのまま `::before` 追加可)
- **#12** — `messageList: string[]` のままでは種別判定できないため、`types.ts` の形状を `Array<{ text: string; kind: 'info' | 'error' }>` に変更し、reducer の 404/998/999/`systemMessage` で `kind: 'error'` を付与する(表示専用stateの変更でありサーバーpayloadには触れない)。`chatmessage.tsx` は既存の未使用 `type` prop を活かして error スタイル(赤系・表示8秒)を実装し、コンテナに `role="status"` / `aria-live="polite"` を付与する。reducer テストを形状変更に追随させる

## 完了ゲート(各フェーズ共通)

1. `npm test && npm run lint && npm run build` がすべて成功(lint error 0、warning 増加なし)
2. 本番Heroku接続でブラウザ2タブ以上「ルーム作成→入室→役職設定→役職選択→議論→投票→結果→ロビー復帰」を通し確認
3. スマホ幅(375px)での表示・タップ確認(特に Phase 3, 4)
4. Phase 2 のみ追加: 2〜3タブで「+/−連打」「二人同時編集」「編集直後の GAME START」「backend が拒否する構成(役職の重複等)での『設定』」を手動確認
5. Phase 4 の #9 のみ追加: 4ゲームすべてのシェアボタン表示確認

## テスト方針

- dirty 判定・readiness 合成・counterMap↔intList 変換は純粋関数としてユニットテスト(既存 `lobby.test.ts` の方針に合わせる)
- reducer: `appliedCounterMap` の同期(100/130/150/700)、`messageList` の種別付与をテストに追加
- 送信系は「destination / status / payload 形状が現行と同一であること」をテストで固定する(通信契約の回帰防止)

## ドキュメント反映

- 挙動差分(確認ダイアログ追加、dirty可視化とGAME START制御、ボタン移設)は各PR説明に記録する
- 各フェーズのPRで `docs/architecture/games/werewolf.md`(「±はローカル、設定ボタンで送信」節など)と、必要に応じ `docs/design.md` を同時更新する
- 全フェーズ完了時にこの計画書を削除し、未着手が残れば `docs/roadmap.md` へ移す
