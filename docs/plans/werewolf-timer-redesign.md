# werewolf 議論タイマー刷新(月相タイマー)

セカンドワンナイト人狼の議論フェーズ(turn 2)タイマーを、`docs/design.md` の「静かな village mystery」に沿った**月相タイマー**へ刷新する計画。世界観の演出と、残量の視認性・時間精度という使いやすさを両立させる。

- 対象は werewolf のみ。他4ゲーム(timebomb / fakeartist 等)のタイマーや砂時計画像は触らない。
- **通信契約は不変**。送信 destination / payload / 購読 topic は現状維持。UI とローカルの残り時間計算だけを変える。

## 1. 背景・現状

- 現在のタイマーは共通コンポーネント [Countdown.tsx](../../frontend/src/components/common/Countdown.tsx) + [countdown.module.scss](../../frontend/src/styles/components/werewolf/countdown.module.scss)。
- 使用箇所は werewolf の [TurnMessage.tsx](../../frontend/src/features/werewolf/components/TurnMessage.tsx) のみ(turn 2 のフェーズ帯内に `inline` で配置)。SCSS も werewolf 配下にあり、実質 werewolf 専用。
- 表示は「残り時間 + 砂時計 PNG(`sunadokei_black.png` を CSS `invert` で反転)+ X分Y秒」のテキストのみ。
  - **課題1**: 残量の割合が図で分からず、数字を読まないと状況が掴めない。
  - **課題2**: 見た目がデザインシステム(和モダン・2色メタファー)から取り残されている。反転 PNG は暗背景で質感が崩れる。
  - **課題3**: `setInterval` で毎秒 1 ずつ減算するため、タイマー drift とバックグラウンドタブでの遅延で実時間とずれる。

### データフロー(現状・維持する)

- `limitTime`(秒)はサーバから届く state([types.ts](../../frontend/src/features/werewolf/types.ts) / [reducer.ts](../../frontend/src/features/werewolf/reducer.ts))。turn 2 開始時に確定する。
- タイマー表示条件は turn 2 かつ `limitTime > 0 && !votingStartFlg`。
- 0 秒到達または「議論終了」ボタンで `limittimeDone`([useWerewolfRoom.ts](../../frontend/src/features/werewolf/useWerewolfRoom.ts))が発火し、`/app/game-dooverLimit`(status 600)を送信する。**この発火タイミングと送信内容は変えない。**
- 設定できる制限時間は `なし / 3分 / 5分 / 7分`([LimitTimeSelector.tsx](../../frontend/src/features/werewolf/components/LimitTimeSelector.tsx))。

## 2. デザインコンセプト

**満月が議論の時間とともに欠け、終盤は血月(赤い月)へ染まる。**

- 「村の理性(ティール)→ 人狼の疑い(ローズ)」という `docs/design.md` の2色メタファーを、時間経過にそのまま写す。
- 図形(欠けていく月)で残量の割合を、数字(明朝 tabular)で正確な残り時間を示す**二重表示**。
- 動きは「ゆっくり・静か」。バウンスは使わず、終盤のみ静かな鼓動でプレッシャーを表現する。

### 状態遷移(残り時間 → 見た目)

| 残り時間 | 月 | 色 | 数字・演出 |
| --- | --- | --- | --- |
| 60秒超 | 経過に応じて満月が欠ける | ティール系(`$teal-soft` #7fd0d6) | 白(#f2fbfb)tabular |
| 60〜10秒 | 欠けが進む | ティール → ローズへ徐々に補間 | 数字も同じ補間色 |
| 10〜0秒 | 血月(ローズ)化+柔らかいグロー | ローズ(#f0949b) | 1秒周期の静かな鼓動パルス(scale 1.06、バウンス無し) |
| 0秒 | — | — | `onDone` 発火(= 現行 `limittimeDone`) |

- 色補間の基準:残り 60 秒から `t = clamp((60 - rem) / 50, 0, 1)`(rem>60 は 0、rem≤10 は 1)で teal→rose を線形補間。
- 月の欠け:満月からの経過割合 `p = rem / timeLimit` を、SVG clipPath 上の影円 cx オフセットに写して表現する。

## 3. コンポーネント設計

### 3.1 新規ファイル

- `frontend/src/features/werewolf/components/MoonTimer.tsx`
- `frontend/src/styles/components/werewolf/moontimer.module.scss`(`@use '../../tokens'` / `variables` で色・フォント・easing を共有)

規約上、werewolf 固有 UI は feature 配下に置く方針。共通 `Countdown` は werewolf 専用だったため、werewolf feature 側へ実装が移る形になる。

### 3.2 Props

現行の `Countdown` 利用箇所と等価に保つ。

```ts
type MoonTimerProps = {
    timeLimit: number;   // 秒。turn 2 開始時にサーバから確定
    onDone: () => void;  // 0秒到達で1回だけ呼ぶ(現行 limittimeDone)
};
```

- `variant='night'` / `inline` は廃止(月相タイマーは常に夜・inline 前提のため不要)。TurnMessage 側の呼び出しを差し替える。

### 3.3 マークアップ構成(帯内 inline)

```
<div class="moonTimer">           // フェーズ帯内に収まる横並び
  <svg class="moon">...</svg>      // 44px(モバイル 40px)。満月+影円(clipPath)+外周リング
  <div class="readout">
    <span class="eyebrow">残り時間</span>   // 11px ゴシック 700 letter-spacing 0.28em
    <span class="digits">m:ss</span>        // Shippori Mincho 600 tabular-nums
  </div>
</div>
```

- 帯の高さ増は約 +20px に抑える(月 44px 中心配置)。フェーズ帯 `messagearea` の sticky 挙動・z-index は変えない。

### 3.4 純関数の切り出し(テスト対象)

副作用を持たない計算を `frontend/src/features/werewolf/moonTimer.ts` に分離し、`moonTimer.test.ts` でユニットテストする(規約: テスト対象は reducer と純ロジック。UI 網羅テストは書かない)。

- `formatTime(seconds): string` — `m:ss`(秒2桁ゼロ埋め、負値は `0:00`)
- `phaseProgress(rem, total): number` — 月の欠け割合 `p`(0〜1、clamp)
- `warmth(rem): number` — 色補間係数 `t`(0〜1)
- `lerpColor(from, to, t): string` — 2色の線形補間(rgb 文字列)

### 3.5 残り時間計算(挙動改善)

- **終了時刻基準**に変更する。マウント時に `endTime = performance.now() + timeLimit * 1000` を `useRef` で固定し、`requestAnimationFrame`(または 200ms 間隔の interval)で `rem = (endTime - now) / 1000` を再計算して表示に反映する。
- これにより setInterval の drift とバックグラウンドタブ復帰時のずれを解消する。
- `rem <= 0` になった最初のフレームで `onDone` を1回だけ呼ぶ(呼び出し済みフラグを ref で管理)。副作用(rAF・タイマー・onDone 呼び出し)は useEffect 内に閉じる。reducer は純粋なまま。

## 4. アクセシビリティ・レスポンシブ

- `prefers-reduced-motion: reduce`:鼓動パルス・グロー明滅・月の連続アニメーションを無効化。ただし**色の警告と月の欠け(状態表現)は残す**(静止した現在値として表示)。
- 月 SVG は `role="img"` + `aria-label`(例: 「残り 1 分 30 秒」)を持たせ、視覚に依存しない情報を提供。数字テキストは `aria-hidden` にせず読み上げ対象に含める。
- モバイル(`mq(md)`)では月 40px・数字サイズを一段下げる。フェーズ帯の `flex-wrap` に収まることを確認する。
- 色コントラスト:数字は最終的にローズ(#f0949b)でも暗背景(#0d2229)上で AA を満たすことを確認(必要なら text-shadow で担保)。

## 5. 差し替え・削除

- `TurnMessage.tsx`:`Countdown` import を `MoonTimer` に差し替え、`variant`/`inline` を除去。表示条件(`turn === 2 && limitTime > 0 && !votingStartFlg`)と `onDone={limittimeDone}` は現状維持。
- 共通 [Countdown.tsx](../../frontend/src/components/common/Countdown.tsx) と [countdown.module.scss](../../frontend/src/styles/components/werewolf/countdown.module.scss) は werewolf 専用だったため削除する。他ファイルからの参照が無いことを確認済み(TurnMessage のみ)。
- 砂時計画像 `sunadokei_black.png` は fakeartist / timebomb が使用中のため**残す**。

## 6. 検証

完了ゲート(frontend/AGENTS.md)に従う。

1. `npm test && npm run lint && npm run build` が全て成功(lint error 0、新規 warning を増やさない)。
   - `moonTimer.test.ts` で `formatTime` / `phaseProgress` / `warmth` / `lerpColor` の境界値(0秒・timeLimit秒・60秒・10秒・負値)を検証。
2. 本番 Heroku 接続で `npm run dev` → ブラウザ2タブでルーム作成 → 入室 → 議論フェーズ到達を確認:
   - 満月が経過とともに欠ける
   - 残り 60 秒からティール→ローズへ色が移る
   - 残り 10 秒で鼓動パルス
   - 0 秒で自動的に投票へ遷移(`/app/game-dooverLimit` 送信、現行と同じ)
   - 「議論終了」ボタンでも即座に遷移する
3. `prefers-reduced-motion` 有効時にアニメーションが止まり、色・欠けは残ることを確認(DevTools のエミュレーション)。

## 7. ドキュメント更新

- 実装完了後、[docs/design.md](../design.md) 「7. ゲーム画面への適用ガイド」にタイマー(月相)の項を追記する。
- 本計画書は完了時に削除し、要点(挙動差分: setInterval → 終了時刻基準、Countdown 削除)を `docs/roadmap.md` の完了履歴へ吸収する。

## 8. スコープ外(YAGNI)

- 他4ゲームのタイマー刷新。
- LimitTimeSelector の選択肢変更(3/5/7分は維持)。
- 一時停止・時間延長などの新機能。
- 月面テクスチャの画像生成(SVG のクレーター円のみで表現。将来リッチ化する場合は月 SVG を差し替えるだけで済む構造にしておく)。
