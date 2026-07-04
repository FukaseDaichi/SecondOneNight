# werewolf 待機画面・終了画面 UI 刷新 設計書

作成日: 2026-07-05 / ブランチ: feature/lp-redesign 系の後続作業

## 背景・課題

セカンドワンナイト人狼(werewolf)の待機画面・終了画面には以下の問題がある。

1. **文字被り**: `turn === 4`(終了)のとき、勝利メッセージ(`Overlays.tsx` の `winmessage`)とルームコードカード(`InvitePanel.tsx`)が両方とも画面上部に独立配置され、重なって読めない
2. **名前の視認性**: プレイヤー名(`UserInfo.tsx`)が小さく読みにくい
3. **ボタンの意匠不統一**: GAME START / HOME / 退出ボタンが灰色 + `Patrick Hand SC`(手書き英字)で、LPから導入した和モダントークン(`tokens.scss`: Shippori Mincho / 深青 / ティール / ローズ)から外れている
4. **演出不足**: LPには桜(葉)が舞う演出があるが、ゲーム画面には雰囲気作りがない

## 決定事項(ユーザー確認済み)

| 論点 | 決定 |
| --- | --- |
| 対象範囲 | **待機画面 + 終了画面のみ**。ゲーム中(役職選択/議論/投票)は次フェーズ |
| 勝利発表 | **全画面演出 → 結果テーブル → ロビー復帰**の3段シーケンス |
| 桜演出 | **待機中は控えめに常時、勝利時は陣営色で盛大に** |
| 実装方式 | **tsparticles**(`@tsparticles/react` + `@tsparticles/slim`、既存依存)で背景にリッチな花びらパーティクル |
| ターゲット | **スマホ優先**(PCでも破綻しない) |

## 設計

### 1. `SakuraParticles` コンポーネント(新規)

- 配置: `frontend/src/components/common/SakuraParticles.tsx`
- 実装: `@tsparticles/react` + `@tsparticles/slim`(`loadSlim`)
- props:
  - `mode: 'ambient' | 'celebration'`
    - `ambient`: まばら(粒子数 ~15、スマホ ~10)、ゆっくり落下、色はローズ/ティール系(`#E88F94, #E9A7BE, #F3B9BC, #8FD0D6`)
    - `celebration`: 大量(粒子数 ~60、スマホ ~35)、速めに舞い散る
  - `palette?: string[]`: 花びら色の上書き(勝利陣営色に使用)
- 花びら表現: tsparticles の `wobble` + `rotate` + `tilt` を組み合わせ、花びら形の SVG(2〜3種)を `shape: image` で使用。ひらひらと風に舞う質感を出す
- パフォーマンス/アクセシビリティ:
  - `next/dynamic` の `ssr: false` で遅延ロード(他ページのバンドルに影響しない)
  - `fpsLimit: 60`、`pauseOnBlur: true`、`window.matchMedia('(max-width: 768px)')` 相当の判定で粒子数を減量
  - `prefers-reduced-motion: reduce` 時は何も描画しない(`null` を返す)
- **LP の `LeafFall.tsx` は今回変更しない**(統一は将来課題としてバックログへ)

### 2. 待機画面レイアウト(スマホ優先・縦3ゾーン)

`pages/werewolf/[roomId].tsx` の `turn === 0`(および終了後にロビーへ戻った `turn === 4`)のレイアウトを再構成する。

```
┌─────────────────────────┐
│ ヘッダーゾーン              │ ルームコードカード(コンパクト化) + 遊び方
├─────────────────────────┤
│ プレイヤーグリッド           │ UserInfo カード群(スマホ2列 / PC4列)
│                         │ 名前を約2倍に拡大(Shippori Mincho)
├─────────────────────────┤
│ フッター操作帯              │ おすすめ役職セット + GAME START + 退出/HOME
└─────────────────────────┘
背景: PhaseBackground + SakuraParticles(ambient)
```

- ヘッダーゾーンは専用領域とし、他要素との重なりを構造的に排除する
- `UserInfo` カード刷新: 名前をカード見出しとして大きく表示、YOU バッジ・退出×ボタン・「写真をアイコンに」をカード内で整理
- `SakuraParticles` は z-index をカード群より下に配置
- 既存の CSS Modules(SCSS)+ `tokens.scss` 参照の構成は維持

### 3. ボタンの和モダン化

- GAME START: `$ink` 地 + 白文字 + `Shippori Mincho`。ホバー/タップで `$teal` の輪郭が灯る
- 退出 / HOME: アウトライン型(枠線のみ)の控えめな意匠
- `Patrick Hand SC` と灰色背景を廃止。角丸はカードと統一。押下時の縮小(`scale`)は維持
- 対象: `room.module.scss` の `btnarea` 一式

### 4. `VictoryOverlay` コンポーネント(新規)

- 配置: `frontend/src/features/werewolf/components/VictoryOverlay.tsx`
- `turn === 4 && winteamList.length > 0` で表示。現状の `winmessage` div と `Result` の同時独立表示を置き換える
- 3段シーケンス(コンポーネント内のローカル state で遷移):
  1. **演出フェーズ**(約3秒): 全画面オーバーレイ。陣営色の背景グラデーション + `SakuraParticles`(celebration, 陣営 palette)。勝利メッセージを `Shippori Mincho` で1文字ずつ表示(LP `charIn` パターン流用)
  2. **結果フェーズ**: 同オーバーレイ内で結果テーブル(既存 `Result` をトークン準拠に再スタイル)を表示
  3. **ロビー復帰**: 「ロビーへ戻る」ボタンでオーバーレイを閉じ、待機画面(ゾーンレイアウト)へ。ルームコードカードはロビーでのみ表示するため重なりは発生しない
- 陣営色 palette:
  - 村人陣営: ティール系(`$teal`, `$teal-soft` ベース)
  - 人狼陣営: ローズ系(`$rose`, `$rose-deep` ベース)
  - 第三陣営: 金/琥珀系(トークンに `$gold` 系を追加)
- 演出フェーズはタップ/クリックでスキップ可能(スキップ時は即結果フェーズへ)

### 5. 変更しないもの

- reducer(`reducer.ts`)・通信契約(status / STOMP topic)には手を入れない。**表示層のみの変更**
- ゲーム中画面(turn 1〜3)、EntryCard の入室フロー、LP

### 6. 品質ゲート・ドキュメント

- 実装後: `fixing-motion-performance` でアニメ監査 → `baseline-ui` で余白・タイポ調整 → `web-design-guidelines` で最終検証 → preview ツールでスマホ/PC 両サイズの動作確認
- `docs/architecture/frontend.md` に共通コンポーネント(`SakuraParticles`)追加を同PRで反映
- 意図的な挙動差分(勝利表示のシーケンス化、退出ボタン位置など)は PR 説明に記録

## テスト方針

- reducer は不変更のため既存テストに影響なし
- 新規コンポーネントはロジック(粒子数決定・陣営 palette 選択・シーケンス遷移)を関数として切り出し、ユニットテスト対象にする
- 見た目は preview(dev サーバー)でスマホ幅(375px)/PC幅(1280px)のスクリーンショット確認
