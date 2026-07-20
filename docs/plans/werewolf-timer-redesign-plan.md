# werewolf 月相タイマー 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** werewolf の議論フェーズ(turn 2)タイマーを、満月が欠け血月へ染まる「月相タイマー」へ刷新する。

**Architecture:** 純ロジック(`moonTimer.ts`)を切り出してユニットテストし、その上に SVG ベースの表示コンポーネント(`MoonTimer.tsx` + `moontimer.module.scss`)を載せる。werewolf の `TurnMessage` だけを差し替え、fakeartist が使い続ける共通 `Countdown` は残す。通信契約(`/app/game-dooverLimit` 送信、`limitTime`/`votingStartFlg` の扱い)は一切変えない。

**Tech Stack:** Next.js 15 / React 19 / TypeScript 5 / SCSS Modules / Vitest。

## Global Constraints

- 通信契約は不変: 送信 destination / payload / 購読 topic を変更しない。UI とローカルの残り時間計算だけを変える。
- 完了ゲート(frontend/AGENTS.md): `npm test && npm run lint && npm run build` が全て成功。lint は **error 0**、新規 warning を増やさない。
- Prettier 設定は変更しない(tabWidth:4 / singleQuote / semi / trailingComma:es5)。インデントは**スペース4**。
- reducer は純粋に保つ。副作用(タイマー等)はコンポーネント/フックの useEffect に閉じる。
- DOM 直接操作(`document.querySelector` 等)・非制御 input は追加しない。表示は state から導出する。
- テスト対象は純ロジックのみ。UI コンポーネントの網羅テストは書かない。
- デザイントークンは [tokens.scss](../../frontend/src/styles/tokens.scss) を正とする。色: 村=`$teal-soft` `#7fd0d6`、人狼=ローズ `#f0949b`(design.md 2.2 陣営カラー)、月の淡色 `#e9f5f4`、白文字 `#f2fbfb`、影 `#11282e`。
- 作業ディレクトリは `frontend/`。コマンドは全て `frontend/` で実行する。
- master へ直接コミットしない。作業ブランチ `feature/werewolf-timer-redesign` で作業する(作成済み)。
- コミットメッセージは日本語の短文。

---

### Task 1: 純ロジックモジュール `moonTimer.ts`

残り時間の整形・月の欠け割合・色補間係数・色補間を、副作用のない純関数として実装する。時間依存のロジックはここに閉じ、テストで境界値を固定する。

**Files:**
- Create: `frontend/src/features/werewolf/moonTimer.ts`
- Test: `frontend/src/features/werewolf/moonTimer.test.ts`

**Interfaces:**
- Consumes: なし(単独)
- Produces(後続 Task 2 が import する):
  - `export const TIMER_TEAL: string`(`'#7fd0d6'`)
  - `export const TIMER_ROSE: string`(`'#f0949b'`)
  - `export function formatTime(seconds: number): string` — `m:ss`
  - `export function phaseProgress(rem: number, total: number): number` — 0〜1
  - `export function warmth(rem: number): number` — 0〜1
  - `export function lerpColor(from: string, to: string, t: number): string` — `rgb(r, g, b)`

- [ ] **Step 1: 失敗するテストを書く**

Create `frontend/src/features/werewolf/moonTimer.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
    formatTime,
    lerpColor,
    phaseProgress,
    warmth,
    TIMER_ROSE,
    TIMER_TEAL,
} from './moonTimer';

describe('formatTime', () => {
    it('分と秒を m:ss で返す(秒はゼロ埋め)', () => {
        expect(formatTime(185)).toBe('3:05');
        expect(formatTime(60)).toBe('1:00');
        expect(formatTime(9)).toBe('0:09');
    });
    it('小数は切り上げる(表示上の残り秒)', () => {
        expect(formatTime(4.2)).toBe('0:05');
    });
    it('0 以下は 0:00', () => {
        expect(formatTime(0)).toBe('0:00');
        expect(formatTime(-3)).toBe('0:00');
    });
});

describe('phaseProgress', () => {
    it('満月(total)で 1、ゼロで 0 を返す', () => {
        expect(phaseProgress(300, 300)).toBe(1);
        expect(phaseProgress(0, 300)).toBe(0);
    });
    it('中間は rem/total', () => {
        expect(phaseProgress(150, 300)).toBeCloseTo(0.5);
    });
    it('範囲外はクランプ、total<=0 は 0', () => {
        expect(phaseProgress(400, 300)).toBe(1);
        expect(phaseProgress(-10, 300)).toBe(0);
        expect(phaseProgress(50, 0)).toBe(0);
    });
});

describe('warmth', () => {
    it('残り60秒で 0、10秒で 1', () => {
        expect(warmth(60)).toBe(0);
        expect(warmth(10)).toBe(1);
    });
    it('60秒超は 0、10秒未満は 1 にクランプ', () => {
        expect(warmth(120)).toBe(0);
        expect(warmth(5)).toBe(1);
    });
    it('中間(35秒)は 0.5', () => {
        expect(warmth(35)).toBeCloseTo(0.5);
    });
});

describe('lerpColor', () => {
    it('t=0 は from、t=1 は to', () => {
        expect(lerpColor('#000000', '#ffffff', 0)).toBe('rgb(0, 0, 0)');
        expect(lerpColor('#000000', '#ffffff', 1)).toBe('rgb(255, 255, 255)');
    });
    it('t=0.5 は中間値', () => {
        expect(lerpColor('#000000', '#ffffff', 0.5)).toBe('rgb(128, 128, 128)');
    });
    it('teal→rose を補間できる', () => {
        expect(lerpColor(TIMER_TEAL, TIMER_ROSE, 0)).toBe('rgb(127, 208, 214)');
        expect(lerpColor(TIMER_TEAL, TIMER_ROSE, 1)).toBe('rgb(240, 148, 155)');
    });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npm test -- moonTimer`
Expected: FAIL(`moonTimer.ts` が存在せず import 解決エラー)

- [ ] **Step 3: 最小実装を書く**

Create `frontend/src/features/werewolf/moonTimer.ts`:

```ts
// werewolf 月相タイマーの純ロジック。副作用なし。
// 色は docs/design.md 2.2 陣営カラーに準拠(村=ティール soft、人狼=ローズ)。
export const TIMER_TEAL = '#7fd0d6';
export const TIMER_ROSE = '#f0949b';

function clamp(v: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, v));
}

function hexToRgb(hex: string): [number, number, number] {
    const h = hex.replace('#', '');
    return [
        parseInt(h.slice(0, 2), 16),
        parseInt(h.slice(2, 4), 16),
        parseInt(h.slice(4, 6), 16),
    ];
}

// 残り秒を m:ss へ。負値は 0:00。小数は切り上げ(表示上の残り)。
export function formatTime(seconds: number): string {
    const s = Math.max(0, Math.ceil(seconds));
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
}

// 満月からの残量割合 p(0〜1)。月の欠けに使う。total<=0 は 0。
export function phaseProgress(rem: number, total: number): number {
    if (total <= 0) return 0;
    return clamp(rem / total, 0, 1);
}

// 色補間係数 t(0〜1)。残り60秒で 0、10秒で 1。範囲外はクランプ。
export function warmth(rem: number): number {
    return clamp((60 - rem) / 50, 0, 1);
}

// #rrggbb 2色を t で線形補間し rgb(r, g, b) を返す。
export function lerpColor(from: string, to: string, t: number): string {
    const a = hexToRgb(from);
    const b = hexToRgb(to);
    const k = clamp(t, 0, 1);
    const mix = (i: number) => Math.round(a[i] + (b[i] - a[i]) * k);
    return `rgb(${mix(0)}, ${mix(1)}, ${mix(2)})`;
}
```

- [ ] **Step 4: テストが通ることを確認**

Run: `npm test -- moonTimer`
Expected: PASS(4 describe / 全 it green)

- [ ] **Step 5: lint**

Run: `npm run lint`
Expected: error 0(新規 warning なし)

- [ ] **Step 6: コミット**

```bash
git add src/features/werewolf/moonTimer.ts src/features/werewolf/moonTimer.test.ts
git commit -m "月相タイマーの純ロジックを追加(整形・欠け割合・色補間)"
```

---

### Task 2: 表示コンポーネント `MoonTimer.tsx` + SCSS

Task 1 の純関数を使い、SVG の月・数字を描画する。残り時間は**終了時刻基準**で計算し drift を防ぐ。0 秒で `onDone` を1回だけ呼ぶ。この時点では単体で import 可能・ビルド可能であればよい(まだ画面には繋がない)。

**Files:**
- Create: `frontend/src/features/werewolf/components/MoonTimer.tsx`
- Create: `frontend/src/styles/components/werewolf/moontimer.module.scss`

**Interfaces:**
- Consumes(Task 1): `formatTime`, `phaseProgress`, `warmth`, `lerpColor`, `TIMER_TEAL`, `TIMER_ROSE`
- Produces(Task 3 が import する): `export default function MoonTimer(props: { timeLimit: number; onDone: () => void }): JSX.Element`

- [ ] **Step 1: SCSS を作成**

Create `frontend/src/styles/components/werewolf/moontimer.module.scss`:

```scss
@use '../../variables' as *;
@use '../../tokens' as *;

.moonTimer {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    font-family: $serif;

    @include mq(md) {
        gap: 8px;
    }
}

.moon {
    width: 44px;
    height: 44px;
    flex: 0 0 auto;
    transform-origin: center;

    @include mq(md) {
        width: 40px;
        height: 40px;
    }

    &.blood {
        filter: drop-shadow(0 0 6px rgba(240, 148, 155, 0.55));
    }

    &.final {
        animation: moonPulse 1s ease-in-out infinite;
    }
}

.readout {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
}

.eyebrow {
    font-family: $sans;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.28em;
    color: rgba(242, 251, 251, 0.6);
}

.digits {
    font-family: $serif;
    font-size: 1.6rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.04em;
    text-shadow: 0 2px 10px rgba(13, 34, 41, 0.6);

    @include mq(md) {
        font-size: 1.4rem;
    }
}

@keyframes moonPulse {
    0%,
    100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.06);
    }
}

@media (prefers-reduced-motion: reduce) {
    .moon.final {
        animation: none;
    }
}
```

- [ ] **Step 2: コンポーネントを作成**

Create `frontend/src/features/werewolf/components/MoonTimer.tsx`:

```tsx
import { useEffect, useRef, useState } from 'react';
import styles from '../../../styles/components/werewolf/moontimer.module.scss';
import {
    formatTime,
    lerpColor,
    phaseProgress,
    warmth,
    TIMER_ROSE,
    TIMER_TEAL,
} from '../moonTimer';

type MoonTimerProps = {
    timeLimit: number; // 秒
    onDone: () => void;
};

const MOON_LIT = '#e9f5f4'; // 満月の淡色(mist 寄り)
const MOON_SHADOW = '#11282e'; // 欠けを作る影円

export default function MoonTimer({ timeLimit, onDone }: MoonTimerProps) {
    const [remaining, setRemaining] = useState(timeLimit);
    const endRef = useRef(0);
    const doneRef = useRef(false);
    const onDoneRef = useRef(onDone);
    onDoneRef.current = onDone;

    // 終了時刻基準で残り時間を計算(setInterval の drift とタブ復帰ずれを防ぐ)。
    useEffect(() => {
        endRef.current = performance.now() + timeLimit * 1000;
        doneRef.current = false;
        setRemaining(timeLimit);
        const id = setInterval(() => {
            const rem = (endRef.current - performance.now()) / 1000;
            setRemaining(rem);
            if (rem <= 0 && !doneRef.current) {
                doneRef.current = true;
                clearInterval(id);
                onDoneRef.current();
            }
        }, 100);
        return () => clearInterval(id);
    }, [timeLimit]);

    const p = phaseProgress(remaining, timeLimit);
    const t = warmth(remaining);
    const litColor = lerpColor(MOON_LIT, TIMER_ROSE, t);
    const digitColor = lerpColor('#f2fbfb', TIMER_ROSE, t);
    const ringColor = lerpColor(TIMER_TEAL, TIMER_ROSE, t);
    const shadowCx = 32 + 54 * p; // p=1で影が右外へ退避(満月)、p=0で中央(新月)
    const isFinal = remaining <= 10 && remaining > 0;
    const isBlood = t >= 0.5;
    const label = `残り ${formatTime(remaining)}`;

    return (
        <div className={styles.moonTimer}>
            <svg
                className={`${styles.moon} ${isFinal ? styles.final : ''} ${
                    isBlood ? styles.blood : ''
                }`}
                width="44"
                height="44"
                viewBox="0 0 64 64"
                role="img"
                aria-label={label}
            >
                <defs>
                    <clipPath id="moonClip">
                        <circle cx="32" cy="32" r="26" />
                    </clipPath>
                </defs>
                <circle cx="32" cy="32" r="26" fill={litColor} />
                <circle
                    cx="24"
                    cy="26"
                    r="4"
                    fill="rgba(20, 47, 55, 0.1)"
                    clipPath="url(#moonClip)"
                />
                <circle
                    cx="38"
                    cy="36"
                    r="6"
                    fill="rgba(20, 47, 55, 0.08)"
                    clipPath="url(#moonClip)"
                />
                <circle
                    cx="30"
                    cy="42"
                    r="3"
                    fill="rgba(20, 47, 55, 0.08)"
                    clipPath="url(#moonClip)"
                />
                <circle
                    cx={shadowCx}
                    cy="32"
                    r="27"
                    fill={MOON_SHADOW}
                    clipPath="url(#moonClip)"
                />
                <circle
                    cx="32"
                    cy="32"
                    r="26.5"
                    fill="none"
                    stroke={ringColor}
                    strokeWidth="1"
                    strokeOpacity="0.5"
                />
            </svg>
            <div className={styles.readout}>
                <span className={styles.eyebrow}>残り時間</span>
                <span className={styles.digits} style={{ color: digitColor }}>
                    {formatTime(remaining)}
                </span>
            </div>
        </div>
    );
}
```

- [ ] **Step 3: 型・ビルドが通ることを確認**

Run: `npm run lint`
Expected: error 0(新規 warning なし)

Run: `npm run build`
Expected: 成功(型エラーなし。`MoonTimer` はまだ未使用だが、コンポーネント単体でコンパイルが通ること)

- [ ] **Step 4: コミット**

```bash
git add src/features/werewolf/components/MoonTimer.tsx src/styles/components/werewolf/moontimer.module.scss
git commit -m "月相タイマー表示コンポーネントとSCSSを追加"
```

---

### Task 3: werewolf `TurnMessage` を月相タイマーへ差し替え

turn 2 の Countdown を MoonTimer に置換する。表示条件・`onDone` は現状維持。fakeartist の `Countdown` は触らない。

**Files:**
- Modify: `frontend/src/features/werewolf/components/TurnMessage.tsx`

**Interfaces:**
- Consumes(Task 2): `MoonTimer`(default export)

- [ ] **Step 1: 差し替え前に fakeartist が Countdown を使い続けていることを確認**

Run: `grep -rn "common/Countdown" src`
Expected: `TurnMessage.tsx`(これから差し替え)と `fakeartist/components/ProgressMessage.tsx`(残す)の2件。fakeartist 側は変更しない。

- [ ] **Step 2: import を差し替える**

In `frontend/src/features/werewolf/components/TurnMessage.tsx`, 1 行目を置換:

```tsx
import MoonTimer from './MoonTimer';
```

(元の `import Countdown from '../../../components/common/Countdown';` を削除)

- [ ] **Step 3: turn 2 の Countdown 呼び出しを MoonTimer に置換**

In `frontend/src/features/werewolf/components/TurnMessage.tsx`, turn 2 ブロック内の以下を:

```tsx
                    {limitTime > 0 && !votingStartFlg && (
                        <Countdown
                            timeLimit={limitTime}
                            limitDone={limittimeDone}
                            variant="night"
                            inline
                        />
                    )}
```

次に置換:

```tsx
                    {limitTime > 0 && !votingStartFlg && (
                        <MoonTimer
                            timeLimit={limitTime}
                            onDone={limittimeDone}
                        />
                    )}
```

- [ ] **Step 4: 型・lint・ビルドが通ることを確認**

Run: `npm run lint`
Expected: error 0(新規 warning なし)

Run: `npm run build`
Expected: 成功(未使用 import `Countdown` が残っていないこと)

- [ ] **Step 5: 既存ユニットテストが壊れていないことを確認**

Run: `npm test`
Expected: PASS(全テスト。reducer / victory / lobby / moonTimer など)

- [ ] **Step 6: コミット**

```bash
git add src/features/werewolf/components/TurnMessage.tsx
git commit -m "werewolf議論タイマーを月相タイマーに差し替え"
```

---

### Task 4: ドキュメント更新と完了ゲート(手動検証込み)

design.md に月相タイマーの項を追記し、完了ゲートを全て通す。ブラウザで実プレイ確認して挙動を証跡化する。

**Files:**
- Modify: `docs/design.md`(「7.2 コンポーネント指針」にタイマー項を追記)

- [ ] **Step 1: design.md にタイマー指針を追記**

In `docs/design.md`, 「### 7.2 コンポーネント指針」の箇条書き末尾に1項追加:

```markdown
- **タイマー(議論フェーズ)**: `MoonTimer`。満月が経過とともに欠け、残り60秒からティール(`$teal-soft`)→ローズ(`#f0949b`)へ色が移ろい、残り10秒で血月化+静かな鼓動パルス(scale 1.06、バウンス無し)。図形で残量・明朝 tabular の数字で正確な残り時間を二重表示する。残り時間は終了時刻基準で計算し drift を防ぐ。reduced-motion ではパルスを止め色・欠けは維持。SVG のみ(月面テクスチャ画像は使わない)。共通 `Countdown` は fakeartist が使うため別途残す
```

- [ ] **Step 2: 完了ゲートを通す**

Run: `npm test && npm run lint && npm run build`
Expected: 3 コマンドすべて成功(test 全 PASS、lint error 0、build 成功)

- [ ] **Step 3: 本番 Heroku 接続で手動検証**

`.env.local` を本番接続(未設定=本番 Heroku)にしたまま `npm run dev` を起動し、ブラウザ2タブで werewolf のルーム作成 → 入室 → 議論フェーズ(turn 2)へ進める。以下を確認:

- 満月が経過とともに欠ける
- 残り 60 秒からティール→ローズへ色が移る
- 残り 10 秒で鼓動パルスが始まる
- 0 秒で自動的に投票フェーズへ遷移する(`/app/game-dooverLimit` 送信、現行と同じ挙動)
- 「議論終了」ボタンでも即座に遷移する
- DevTools の Rendering → `prefers-reduced-motion: reduce` を有効化すると、パルスが止まり色・欠けは残る

スクリーンショットまたは録画で通常・警告(60秒以下)・最終(10秒以下)の3状態を証跡化する。

- [ ] **Step 4: コミット**

```bash
git add docs/design.md
git commit -m "design.mdに月相タイマーの指針を追記"
```

---

## 完了後(このステージのクローズ手順)

frontend/AGENTS.md・ドキュメント運用ルールに従う。実装ブランチのマージ後に:

- 本計画書 `docs/plans/werewolf-timer-redesign-plan.md` と設計書 `docs/plans/werewolf-timer-redesign.md` を削除する。
- 要点を `docs/roadmap.md` の完了履歴へ吸収する。特に**挙動差分**を明記:
  - タイマー刷新(共通 Countdown → werewolf 専用 MoonTimer。fakeartist は Countdown 継続)
  - 残り時間計算を `setInterval` 毎秒減算 → 終了時刻基準へ変更(drift・タブ復帰ずれを解消)
