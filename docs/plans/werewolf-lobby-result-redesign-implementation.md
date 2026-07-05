# werewolf 待機・終了画面リデザイン 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 設計書 [werewolf-lobby-result-redesign.md](./werewolf-lobby-result-redesign.md) に基づき、待機画面を「宵の口の集会場(dusk)」、終了画面を「夜明けの種明かし(dawn・3幕構成)」に刷新する。

**Architecture:** 通信契約・reducer の状態遷移は不変。演出はすべて表示層のローカル state。純粋関数(死亡者判定・開示順・幕遷移・開始条件)は `features/werewolf/` 直下に置き Vitest でテストする。UI は SCSS Modules + `tokens.scss` のトークン準拠。

**Tech Stack:** Next.js 15 / React 19 / TypeScript 5 / SCSS Modules / Vitest

## Global Constraints

- 送信 destination / payload / 購読 topic は現状維持(変更禁止)
- reducer は純粋に保つ。副作用(タイマー・Audio 等)はフックの useEffect へ
- DOM 直接操作・非制御 input を追加しない
- Prettier 設定(tabWidth:4 / singleQuote / semi / trailingComma:es5)厳守
- テスト対象は純粋関数と reducer のみ。UI コンポーネントの網羅テストは書かない
- 各タスク完了時: `cd frontend && npm test && npm run lint && npm run build` が全て成功(lint error 0、新規 warning なし)
- コミットメッセージは日本語の短文
- アニメーションは CSS 主体、`prefers-reduced-motion: reduce` で無効化する
- 色は `tokens.scss` のトークン(または本計画で追加する dusk/dawn トークン)のみ使用

**実行前提:** 作業ブランチは `feature/lp-redesign`(または派生ブランチ)。コマンドはすべて `frontend/` で実行する。

---

### Task 1: dusk / dawn トークンと PhaseBackground シーン追加

**Files:**
- Modify: `frontend/src/styles/tokens.scss`
- Modify: `frontend/src/styles/components/werewolf/background.module.scss`
- Modify: `frontend/src/features/werewolf/components/PhaseBackground.tsx`
- Modify: `frontend/src/pages/werewolf/[roomId].tsx`(body 背景色のみ)

**Interfaces:**
- Produces: SCSS トークン `$dusk-sky` `$dusk-horizon` `$dawn-sky` `$dawn-horizon` `$dawn-paper`。背景クラス `styles.dusk` / `styles.dawn`(+陣営ティント `dawnWolf` / `dawnVillage` / `dawnThird`)

- [ ] **Step 1: トークン追加**

`tokens.scss` 末尾に追加:

```scss
/* 待機(夕暮れ)・終了(夜明け)シーン用 */
$dusk-sky: #2b2440; // 宵の藍
$dusk-horizon: #c96f4a; // 茜
$dusk-paper: #f6ede4; // 夕暮れ下の紙色
$dawn-sky: #3a4a63; // 白み始めの空
$dawn-horizon: #f2b98a; // 朝焼け
$dawn-paper: #fdf7ef; // 夜明け下の紙色
```

- [ ] **Step 2: 背景シーン実装**

`background.module.scss` に既存 `.day` 等と同じ構造で追加(既存の `.bg` / glow 構造を踏襲):

```scss
.dusk {
    background: linear-gradient(180deg, $dusk-sky 0%, #4a3550 55%, $dusk-horizon 100%);
    &::after {
        /* 遠景の山並みシルエット+一番星は疑似要素で描く */
        content: '';
        position: absolute;
        inset: auto 0 0 0;
        height: 28vh;
        background:
            radial-gradient(2px 2px at 78% 18%, #fff8, transparent 60%),
            radial-gradient(60% 100% at 30% 100%, #1d1830 60%, transparent 61%),
            radial-gradient(50% 90% at 75% 100%, #241d38 55%, transparent 56%);
    }
}
.dawn {
    background: linear-gradient(180deg, $dawn-sky 0%, #7a6a80 55%, $dawn-horizon 100%);
}
/* 朝焼けに陣営色を「混ぜる」ティント(ベタ塗り resultXxx は廃止) */
.dawnWolf::before,
.dawnVillage::before,
.dawnThird::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0.22;
}
.dawnWolf::before {
    background: linear-gradient(180deg, transparent 40%, $rose 100%);
}
.dawnVillage::before {
    background: linear-gradient(180deg, transparent 40%, $teal 100%);
}
.dawnThird::before {
    background: linear-gradient(180deg, transparent 40%, $gold 100%);
}
.bg {
    transition: background 1.8s $ease; /* 日没・夜明けのシーン間トランジション */
}
```

旧 `.day` `.resultWolf` `.resultVillage` `.resultThird` は削除する(参照も本タスクで消える)。

- [ ] **Step 3: PhaseBackground 切り替え**

`PhaseBackground.tsx` の `phaseClass` を変更。turn 0 → `styles.dusk`、turn 4 → `styles.dawn` + 陣営ティント:

```tsx
const phaseClass = (turn: number, winteamList: number[]): string => {
    if (turn === 1) return styles.night;
    if (turn === 2) return styles.discussion;
    if (turn === 3) return styles.voting;
    if (turn === 4 && winteamList.length > 0) {
        const tint =
            winteamList[0] === 1
                ? styles.dawnWolf
                : winteamList[0] === 2
                  ? styles.dawnVillage
                  : styles.dawnThird;
        return `${styles.dawn} ${tint}`;
    }
    return styles.dusk;
};
```

- [ ] **Step 4: body 背景の追従**

`[roomId].tsx` の `style jsx global` の `background-color: #effdfe;` を `background-color: #2b2440;`($dusk-sky 相当。SCSS 変数は使えないため実値)に変更。

- [ ] **Step 5: 検証・コミット**

Run: `npm test && npm run lint && npm run build` → 全て成功。
`npm run dev` で turn 0 が夕暮れ背景になることを目視確認。

```bash
git add -A && git commit -m "werewolf 背景に dusk/dawn シーンを追加"
```

---

### Task 2: victory.ts 純粋関数(死亡判定・開示順・3幕遷移)

**Files:**
- Modify: `frontend/src/features/werewolf/victory.ts`
- Test: `frontend/src/features/werewolf/victory.test.ts`

**Interfaces:**
- Consumes: `WerewolfUser`(`roll.punishmentFlg` / `roll.teamNo` / `userNo`)
- Produces:
  - `isDeadUser(user: WerewolfUser): boolean`
  - `revealOrder(userList: WerewolfUser[]): WerewolfUser[]`(人狼陣営 teamNo=1 を最後に、他は userNo 昇順)
  - `type VictoryAct = 'reveal' | 'verdict' | 'result' | 'closed'`
  - `nextVictoryAct(act: VictoryAct, event: 'advance' | 'skip' | 'return'): VictoryAct`
  - 既存 `VictoryPhase` / `nextVictoryPhase` は削除(Task 5 で参照が消えるまでは残すのではなく、本タスクで置換し Task 5 まで両立が必要なため **削除は Task 5 で行う**)

- [ ] **Step 1: 失敗するテストを書く**

`victory.test.ts` に追加:

```ts
import {
    isDeadUser,
    nextVictoryAct,
    revealOrder,
} from './victory';
import { WerewolfUser } from '../../type/werewolf';

const user = (userNo: number, teamNo: number, punishmentFlg = false) =>
    ({
        userNo,
        userName: `u${userNo}`,
        roll: { teamNo, punishmentFlg },
    }) as unknown as WerewolfUser;

describe('isDeadUser', () => {
    it('punishmentFlg が true なら死亡', () => {
        expect(isDeadUser(user(1, 2, true))).toBe(true);
    });
    it('punishmentFlg が false なら生存', () => {
        expect(isDeadUser(user(1, 2, false))).toBe(false);
    });
    it('roll が null でも落ちない', () => {
        expect(
            isDeadUser({ userNo: 1, roll: null } as unknown as WerewolfUser)
        ).toBe(false);
    });
});

describe('revealOrder', () => {
    it('人狼陣営(teamNo=1)を最後に回し、他は userNo 昇順', () => {
        const order = revealOrder([
            user(3, 1),
            user(1, 2),
            user(2, 3),
        ]).map((u) => u.userNo);
        expect(order).toEqual([1, 2, 3]);
    });
    it('人狼が複数でも全員最後尾に並ぶ', () => {
        const order = revealOrder([
            user(1, 1),
            user(2, 2),
            user(3, 1),
        ]).map((u) => u.userNo);
        expect(order).toEqual([2, 1, 3]);
    });
});

describe('nextVictoryAct', () => {
    it('reveal → advance → verdict', () => {
        expect(nextVictoryAct('reveal', 'advance')).toBe('verdict');
    });
    it('verdict → advance → result', () => {
        expect(nextVictoryAct('verdict', 'advance')).toBe('result');
    });
    it('reveal → skip → result(種明かし飛ばし)', () => {
        expect(nextVictoryAct('reveal', 'skip')).toBe('result');
    });
    it('result → return → closed', () => {
        expect(nextVictoryAct('result', 'return')).toBe('closed');
    });
    it('無関係なイベントでは遷移しない', () => {
        expect(nextVictoryAct('result', 'advance')).toBe('result');
    });
});
```

- [ ] **Step 2: 失敗確認**

Run: `npm test -- victory` → 新規テストが FAIL(`isDeadUser is not a function` 等)。

- [ ] **Step 3: 実装**

`victory.ts` に追加:

```ts
import { WerewolfUser } from '../../type/werewolf';

// 死亡者(処刑=最多得票 / 暗殺者・独裁者の銃撃)は backend が roll.punishmentFlg を立てる
export const isDeadUser = (user: WerewolfUser): boolean =>
    !!user.roll?.punishmentFlg;

// 種明かしの開示順: 人狼陣営(teamNo=1)を最後に回してタメを作る。他は userNo 昇順
export const revealOrder = (userList: WerewolfUser[]): WerewolfUser[] => {
    const wolves = userList
        .filter((u) => u.roll?.teamNo === 1)
        .sort((a, b) => a.userNo - b.userNo);
    const others = userList
        .filter((u) => u.roll?.teamNo !== 1)
        .sort((a, b) => a.userNo - b.userNo);
    return [...others, ...wolves];
};

// 3幕構成: 種明かし → 勝敗発表 → 結果 → ロビー復帰
export type VictoryAct = 'reveal' | 'verdict' | 'result' | 'closed';
export type VictoryActEvent = 'advance' | 'skip' | 'return';

export const nextVictoryAct = (
    act: VictoryAct,
    event: VictoryActEvent
): VictoryAct => {
    if (event === 'skip' && (act === 'reveal' || act === 'verdict')) {
        return 'result';
    }
    if (event === 'advance' && act === 'reveal') {
        return 'verdict';
    }
    if (event === 'advance' && act === 'verdict') {
        return 'result';
    }
    if (event === 'return' && act === 'result') {
        return 'closed';
    }
    return act;
};
```

- [ ] **Step 4: テスト成功確認**

Run: `npm test -- victory` → PASS(既存の victoryTeam/victoryPalette/nextVictoryPhase テストも壊れていないこと)。

- [ ] **Step 5: コミット**

```bash
git add frontend/src/features/werewolf/victory.ts frontend/src/features/werewolf/victory.test.ts
git commit -m "werewolf 勝利演出3幕用の純粋関数を追加"
```

---

### Task 3: DeadMarker と ResultScroll(第3幕)

**Files:**
- Create: `frontend/src/features/werewolf/components/DeadMarker.tsx`
- Create: `frontend/src/features/werewolf/components/ResultScroll.tsx`
- Create: `frontend/src/styles/components/werewolf/deadmarker.module.scss`
- Create: `frontend/src/styles/components/werewolf/resultscroll.module.scss`

**Interfaces:**
- Consumes: `isDeadUser`(Task 2)、`WerewolfUser`
- Produces:
  - `DeadMarker`: props なし。親要素(`position: relative` のカード)に重ねる表示専用部品
  - `ResultScroll`: `{ userList: WerewolfUser[]; winteamList: number[]; npcuser: WerewolfUser | null; onReturn: () => void }`
- 旧 `result.tsx` の削除は Task 5(VictoryOverlay から参照が外れた後)

- [ ] **Step 1: DeadMarker 実装**

`DeadMarker.tsx`:

```tsx
import React from 'react';
import styles from '../../../styles/components/werewolf/deadmarker.module.scss';

// 死亡者マーカー: モノクロ化は親カード側(styles.dead)、本部品は「散」帯+煙
export default function DeadMarker() {
    return (
        <div className={styles.marker} aria-label="脱落">
            <span className={styles.band}>散</span>
            <span className={styles.smoke} aria-hidden="true"></span>
        </div>
    );
}
```

`deadmarker.module.scss`:

```scss
@use '../../tokens.scss' as *;

.marker {
    position: absolute;
    inset: 0;
    pointer-events: none;
}
.band {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-12deg);
    font-family: $serif;
    font-size: 1.4rem;
    color: $paper;
    background: rgba($ink-deep, 0.82);
    border: 1px solid $gold-soft;
    padding: 0.1em 0.9em;
    letter-spacing: 0.2em;
}
.smoke {
    position: absolute;
    top: -6px;
    left: 50%;
    width: 6px;
    height: 22px;
    border-radius: 50%;
    background: linear-gradient(180deg, transparent, rgba($paper, 0.5));
    filter: blur(2px);
    animation: smokeRise 2.4s $ease infinite;
}
@keyframes smokeRise {
    from {
        transform: translateY(6px) scaleY(0.6);
        opacity: 0;
    }
    50% {
        opacity: 0.7;
    }
    to {
        transform: translateY(-10px) scaleY(1.2);
        opacity: 0;
    }
}
@media (prefers-reduced-motion: reduce) {
    .smoke {
        animation: none;
    }
}
```

- [ ] **Step 2: ResultScroll 実装**

`ResultScroll.tsx`(旧 `result.tsx` のデータ表示を巻物風1行レイアウトに置換。死亡者に `DeadMarker` 系表示+行モノクロ):

```tsx
import React from 'react';
import styles from '../../../styles/components/werewolf/resultscroll.module.scss';
import { WerewolfUser } from '../../../type/werewolf';
import { isDeadUser } from '../victory';

type Props = {
    userList: Array<WerewolfUser>;
    winteamList: number[];
    npcuser: WerewolfUser | null;
    onReturn: () => void;
};

const Row = ({
    user,
    win,
    npc,
}: {
    user: WerewolfUser;
    win: boolean;
    npc?: boolean;
}) => {
    const dead = isDeadUser(user);
    return (
        <li
            className={`${styles.row} ${win ? styles.win : ''} ${
                dead ? styles.dead : ''
            }`}
        >
            <span className={styles.name}>
                {user.userName}
                {dead && <span className={styles.deadTag}>散</span>}
            </span>
            <span className={styles.roll}>{user.roll?.name ?? 'なし'}</span>
            <span className={styles.vote}>
                {npc ? '─' : `→ ${user.votingUserName || 'なし'}`}
            </span>
            <span className={styles.count}>
                {user.roll ? `${user.roll.votingCount}票` : '─'}
            </span>
            <span className={styles.verdict}>{win ? '勝' : '負'}</span>
        </li>
    );
};

// 第3幕: 巻物風の結果一覧
export default function ResultScroll({
    userList,
    winteamList,
    npcuser,
    onReturn,
}: Props) {
    const isWin = (u: WerewolfUser) =>
        !!u.roll && winteamList.includes(u.roll.teamNo);
    return (
        <div className={styles.scroll}>
            <p className={styles.heading}>─ 結果 ─</p>
            <ul className={styles.list}>
                {userList.map((u) => (
                    <Row key={u.userNo} user={u} win={isWin(u)} />
                ))}
                {npcuser && npcuser.roll && (
                    <Row user={npcuser} win={isWin(npcuser)} npc />
                )}
            </ul>
            <button className={styles.returnBtn} onClick={onReturn}>
                ロビーへ戻る
            </button>
        </div>
    );
}
```

`resultscroll.module.scss`(要点: 巻物=上下に飾り罫のある縦長カード、`$dawn-paper` 地、`.dead` は `filter: grayscale(1)` + 打ち消し色、`.win` 行は `$gold-soft` の下線と `$ink` 文字。スマホで横スクロールしない grid 1fr レイアウト):

```scss
@use '../../tokens.scss' as *;

.scroll {
    background: $dawn-paper;
    border-top: 3px double $gold;
    border-bottom: 3px double $gold;
    padding: 20px 16px;
    max-width: 640px;
    margin: 0 auto;
    font-family: $serif;
    color: $ink;
}
.heading {
    text-align: center;
    letter-spacing: 0.4em;
    color: $label;
    margin-bottom: 12px;
}
.list {
    list-style: none;
    margin: 0;
    padding: 0;
}
.row {
    display: grid;
    grid-template-columns: 1fr auto auto auto auto;
    gap: 8px;
    align-items: baseline;
    padding: 8px 4px;
    border-bottom: 1px solid rgba($ink, 0.12);
    font-size: 0.9rem;
}
.win {
    box-shadow: inset 0 -2px 0 $gold-soft;
}
.dead {
    filter: grayscale(1);
    opacity: 0.65;
}
.deadTag {
    margin-left: 6px;
    font-size: 0.7rem;
    color: $paper;
    background: $ink-deep;
    padding: 0 0.4em;
}
.verdict {
    font-weight: 700;
}
.returnBtn {
    display: block;
    margin: 16px auto 0;
    font-family: $sans;
    background: $ink-deep;
    color: $paper;
    border: none;
    border-radius: 999px;
    padding: 10px 32px;
}
```

- [ ] **Step 3: 検証・コミット**

Run: `npm test && npm run lint && npm run build` → 成功(未使用 warning が出る場合は Task 5 で解消されるため、`ResultScroll` を一時的に export しておくだけで新規 warning を出さないこと。lint が未使用を報告する場合は本タスクを Task 5 と同一コミットにせず、`[roomId].tsx` には触れない範囲で warning 0 を保つ)。

```bash
git add -A && git commit -m "werewolf DeadMarker と巻物風 ResultScroll を追加"
```

---

### Task 4: RoleRevealAct(第1幕)と VerdictAct(第2幕)

**Files:**
- Create: `frontend/src/features/werewolf/components/RoleRevealAct.tsx`
- Create: `frontend/src/features/werewolf/components/VerdictAct.tsx`
- Create: `frontend/src/styles/components/werewolf/rolereveal.module.scss`
- Create: `frontend/src/styles/components/werewolf/verdict.module.scss`

**Interfaces:**
- Consumes: `revealOrder` / `isDeadUser`(Task 2)、`DeadMarker`(Task 3)、`victoryTeam` / `victoryPalette`(既存)
- Produces:
  - `RoleRevealAct`: `{ userList: WerewolfUser[]; npcuser: WerewolfUser | null; onDone: () => void }` — 全カード開示完了時に `onDone`
  - `VerdictAct`: `{ winMessage: string; winteamList: number[]; userList: WerewolfUser[] }`

- [ ] **Step 1: RoleRevealAct 実装**

1枚ずつ裏返す進行はローカル state(`revealedCount`)+ `useEffect` のタイマーで行う。タップで次の1枚を即開示、全開示から 1.5 秒後に `onDone`:

```tsx
import React, { useEffect, useMemo, useState } from 'react';
import styles from '../../../styles/components/werewolf/rolereveal.module.scss';
import { WerewolfUser } from '../../../type/werewolf';
import { isDeadUser, revealOrder } from '../victory';
import DeadMarker from './DeadMarker';

type Props = {
    userList: Array<WerewolfUser>;
    npcuser: WerewolfUser | null;
    onDone: () => void;
};

const REVEAL_INTERVAL_MS = 1100;
const DONE_DELAY_MS = 1500;

// 第1幕: 種明かし。人狼系を最後に1枚ずつ役職開示。死亡者マーカーは開示と同時に表示
export default function RoleRevealAct({ userList, npcuser, onDone }: Props) {
    const ordered = useMemo(() => {
        const list = npcuser?.roll ? [...userList, npcuser] : userList;
        return revealOrder(list);
    }, [userList, npcuser]);
    const [revealed, setRevealed] = useState(0);
    const allRevealed = revealed >= ordered.length;

    useEffect(() => {
        const id = window.setTimeout(
            allRevealed ? onDone : () => setRevealed((n) => n + 1),
            allRevealed ? DONE_DELAY_MS : REVEAL_INTERVAL_MS
        );
        return () => window.clearTimeout(id);
    }, [revealed, allRevealed, onDone]);

    return (
        <div
            className={styles.act}
            onClick={() => setRevealed((n) => Math.min(n + 1, ordered.length))}
        >
            <p className={styles.heading}>─ 種明かし ─</p>
            <ul className={styles.grid}>
                {ordered.map((u, i) => {
                    const open = i < revealed;
                    return (
                        <li
                            key={`${u.userNo}-${u.userName}`}
                            className={`${styles.card} ${
                                open ? styles.open : ''
                            } ${open && isDeadUser(u) ? styles.dead : ''}`}
                        >
                            <span className={styles.name}>{u.userName}</span>
                            <span className={styles.face}>
                                {open ? u.roll?.name ?? 'なし' : '？'}
                            </span>
                            {open && (
                                <span className={styles.voteTo}>
                                    → {u.votingUserName || '─'}
                                </span>
                            )}
                            {open && isDeadUser(u) && <DeadMarker />}
                        </li>
                    );
                })}
            </ul>
            <p className={styles.hint}>タップで次へ</p>
        </div>
    );
}
```

- [ ] **Step 2: VerdictAct 実装**

```tsx
import React from 'react';
import styles from '../../../styles/components/werewolf/verdict.module.scss';
import { WerewolfUser } from '../../../type/werewolf';
import { isDeadUser, victoryTeam } from '../victory';
import DeadMarker from './DeadMarker';

type Props = {
    winMessage: string;
    winteamList: number[];
    userList: Array<WerewolfUser>;
};

// 第2幕: 勝敗発表。陣営バナー1文字ずつ+勝者前出し。死亡者マーカー維持
export default function VerdictAct({
    winMessage,
    winteamList,
    userList,
}: Props) {
    const team = victoryTeam(winteamList);
    const chars = Array.from(`${winMessage}の勝利`);
    const winners = userList.filter(
        (u) => !!u.roll && winteamList.includes(u.roll.teamNo)
    );
    const losers = userList.filter(
        (u) => !u.roll || !winteamList.includes(u.roll.teamNo)
    );
    const card = (u: WerewolfUser, winner: boolean) => (
        <li
            key={u.userNo}
            className={`${styles.card} ${winner ? styles.winner : styles.loser} ${
                isDeadUser(u) ? styles.dead : ''
            }`}
        >
            <span className={styles.name}>{u.userName}</span>
            <span className={styles.roll}>{u.roll?.name ?? 'なし'}</span>
            {isDeadUser(u) && <DeadMarker />}
        </li>
    );
    return (
        <div className={`${styles.act} ${styles[team]}`}>
            <p className={styles.banner} role="status">
                {chars.map((ch, i) => (
                    <span
                        key={i}
                        className={styles.char}
                        style={{ animationDelay: `${0.2 + i * 0.14}s` }}
                    >
                        {ch}
                    </span>
                ))}
            </p>
            <ul className={styles.winnerRow}>{winners.map((u) => card(u, true))}</ul>
            <ul className={styles.loserRow}>{losers.map((u) => card(u, false))}</ul>
            <p className={styles.hint}>タップで結果へ</p>
        </div>
    );
}
```

- [ ] **Step 3: SCSS 実装**

`rolereveal.module.scss` 要点(完全なセレクタ一覧。値は下記を初期値としてトーン調整可):

```scss
@use '../../tokens.scss' as *;

.act {
    width: min(680px, 92vw);
    margin: 0 auto;
    text-align: center;
    color: $paper;
    font-family: $serif;
}
.heading {
    letter-spacing: 0.4em;
    color: $gold-soft;
    margin-bottom: 16px;
}
.grid {
    list-style: none;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
    gap: 10px;
}
.card {
    position: relative;
    background: rgba($night-deep, 0.85);
    border: 1px solid rgba($gold-soft, 0.35);
    border-radius: 10px;
    padding: 10px 6px 12px;
    transform: rotateY(180deg);
    transition: transform 0.5s $ease;
    display: grid;
    gap: 4px;
}
.open {
    transform: rotateY(0);
}
.dead {
    filter: grayscale(0.9);
}
.name {
    font-size: 0.75rem;
    color: $teal-soft;
}
.face {
    font-size: 1.05rem;
}
.voteTo {
    font-size: 0.7rem;
    color: $label;
}
.hint {
    margin-top: 14px;
    font-size: 0.75rem;
    color: rgba($paper, 0.7);
}
@media (prefers-reduced-motion: reduce) {
    .card {
        transition: none;
    }
}
```

`verdict.module.scss` 要点(バナー文字アニメは `victory.module.scss` の `.char` と同 keyframes。`.winner` は `translateY(-6px)` + `box-shadow: 0 0 24px rgba($gold-soft, .5)`、`.loser` は `opacity: .55; transform: scale(.92)`。`.wolf/.village/.third` でバナー文字色を `$rose / $teal-soft / $gold-soft` に。`.dead { filter: grayscale(.9); }`、`prefers-reduced-motion` で文字アニメ無効)。

- [ ] **Step 4: 検証・コミット**

Run: `npm test && npm run lint && npm run build` → 成功。

```bash
git add -A && git commit -m "werewolf 種明かし幕と勝敗発表幕を追加"
```

---

### Task 5: VictoryOverlay を3幕オーケストレーターに再編

**Files:**
- Modify: `frontend/src/features/werewolf/components/VictoryOverlay.tsx`(全面書き換え)
- Modify: `frontend/src/styles/components/werewolf/victory.module.scss`
- Modify: `frontend/src/features/werewolf/victory.ts`(旧 `VictoryPhase` / `nextVictoryPhase` 削除)
- Modify: `frontend/src/features/werewolf/victory.test.ts`(旧 phase テスト削除)
- Delete: `frontend/src/features/werewolf/components/result.tsx`、`frontend/src/styles/components/werewolf/result.module.scss`(`git rm`)

**Interfaces:**
- Consumes: `VictoryAct` / `nextVictoryAct`(Task 2)、`RoleRevealAct` / `VerdictAct`(Task 4)、`ResultScroll`(Task 3)
- Produces: `VictoryOverlay` props は現行と同一 `{ winMessage, winteamList, userList, npcuser }`(`[roomId].tsx` 変更不要)

- [ ] **Step 1: VictoryOverlay 書き換え**

```tsx
import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from '../../../styles/components/werewolf/victory.module.scss';
import { WerewolfUser } from '../../../type/werewolf';
import RoleRevealAct from './RoleRevealAct';
import VerdictAct from './VerdictAct';
import ResultScroll from './ResultScroll';
import {
    nextVictoryAct,
    victoryPalette,
    VictoryAct,
} from '../victory';

const SakuraParticles = dynamic(
    () => import('../../../components/common/SakuraParticles'),
    { ssr: false }
);

type Props = {
    winMessage: string;
    winteamList: number[];
    userList: Array<WerewolfUser>;
    npcuser: WerewolfUser | null;
};

// 勝敗発表の自動送り(タップでも送れる)
const VERDICT_MS = 4000;

export default function VictoryOverlay({
    winMessage,
    winteamList,
    userList,
    npcuser,
}: Props) {
    const [act, setAct] = useState<VictoryAct>('reveal');
    const palette = useMemo(() => victoryPalette(winteamList), [winteamList]);

    useEffect(() => {
        if (act !== 'verdict') return;
        const id = window.setTimeout(
            () => setAct((a) => nextVictoryAct(a, 'advance')),
            VERDICT_MS
        );
        return () => window.clearTimeout(id);
    }, [act]);

    if (act === 'closed') {
        return null;
    }

    return (
        <div
            className={`${styles.overlay} ${styles[`act-${act}`]}`}
            onClick={
                act === 'verdict'
                    ? () => setAct((a) => nextVictoryAct(a, 'advance'))
                    : undefined
            }
        >
            {act !== 'reveal' && (
                <SakuraParticles mode="celebration" palette={palette} />
            )}
            <div className={styles.inner}>
                {act === 'reveal' && (
                    <RoleRevealAct
                        userList={userList}
                        npcuser={npcuser}
                        onDone={() => setAct((a) => nextVictoryAct(a, 'advance'))}
                    />
                )}
                {act === 'verdict' && (
                    <VerdictAct
                        winMessage={winMessage}
                        winteamList={winteamList}
                        userList={userList}
                    />
                )}
                {act === 'result' && (
                    <ResultScroll
                        userList={userList}
                        winteamList={winteamList}
                        npcuser={npcuser}
                        onReturn={() =>
                            setAct((a) => nextVictoryAct(a, 'return'))
                        }
                    />
                )}
                {act === 'reveal' && (
                    <button
                        className={styles.skipBtn}
                        onClick={(e) => {
                            e.stopPropagation();
                            setAct((a) => nextVictoryAct(a, 'skip'));
                        }}
                    >
                        スキップ
                    </button>
                )}
            </div>
        </div>
    );
}
```

- [ ] **Step 2: victory.module.scss 更新**

overlay 背景を「深夜 → 白み始め → 朝焼け」の3段階に(幕クラスで切替、`transition: background 1.4s $ease`):

```scss
.overlay {
    /* 既存の position: fixed / inset: 0 / z-index はそのまま */
    transition: background 1.4s $ease;
}
.act-reveal {
    background: rgba($night-deep, 0.96);
}
.act-verdict {
    background: linear-gradient(180deg, $dawn-sky 0%, $dawn-horizon 130%);
}
.act-result {
    background: linear-gradient(180deg, $dawn-sky -30%, $dawn-horizon 100%);
}
.skipBtn {
    position: fixed;
    right: 16px;
    bottom: 16px;
    font-family: $sans;
    font-size: 0.75rem;
    color: rgba($paper, 0.8);
    background: transparent;
    border: 1px solid rgba($paper, 0.4);
    border-radius: 999px;
    padding: 6px 16px;
}
```

旧 `.message` / `.char` / `.skipHint` / `.resultCard` / `.returnBtn` のうち、`.char` keyframes は `verdict.module.scss` が持つため、未参照になったセレクタは削除する。

- [ ] **Step 3: 旧 API・旧部品の削除**

- `victory.ts` から `VictoryPhase` / `VictoryEvent` / `nextVictoryPhase` を削除
- `victory.test.ts` から `nextVictoryPhase` の describe を削除
- `git rm frontend/src/features/werewolf/components/result.tsx frontend/src/styles/components/werewolf/result.module.scss`

- [ ] **Step 4: 検証**

Run: `npm test && npm run lint && npm run build` → 成功。
`npm run dev` + 本番 Heroku 接続でブラウザ3タブ入室 → ゲーム開始 → 投票まで進め、3幕(種明かし→勝敗→巻物)と死亡者マーカー(処刑された人に「散」)を目視確認。

- [ ] **Step 5: コミット**

```bash
git add -A && git commit -m "werewolf 勝利演出を3幕構成に再編"
```

---

### Task 6: 開始条件の純粋関数(lobby.ts)

**Files:**
- Create: `frontend/src/features/werewolf/lobby.ts`
- Test: `frontend/src/features/werewolf/lobby.test.ts`

**Interfaces:**
- Consumes: `counterMap: { [rollNo: number]: number }`(reducer state)、`staticRollList: WerewolfRoll[]`(teamNo 判定用)
- Produces:
  - `type LobbyReadiness = { ready: boolean; messages: string[] }`
  - `lobbyReadiness(userCount: number, counterMap: Record<number, number>, staticRollList: WerewolfRoll[]): LobbyReadiness`
  - 開始条件(architecture 文書より): ①3人以上 ②役職合計 > 参加人数 ③人狼陣営(teamNo=1)の役職を1つ以上含む

- [ ] **Step 1: 失敗するテストを書く**

`lobby.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { lobbyReadiness } from './lobby';
import { WerewolfRoll } from '../../type/werewolf';

const roll = (rollNo: number, teamNo: number) =>
    ({ rollNo, teamNo }) as unknown as WerewolfRoll;
// rollNo 1 = 人狼(teamNo 1)、rollNo 2 = 村人(teamNo 2)
const rolls = [roll(1, 1), roll(2, 2)];

describe('lobbyReadiness', () => {
    it('条件を全て満たすと ready', () => {
        const r = lobbyReadiness(3, { 1: 1, 2: 3 }, rolls);
        expect(r.ready).toBe(true);
        expect(r.messages).toEqual([]);
    });
    it('3人未満は人数メッセージ', () => {
        const r = lobbyReadiness(2, { 1: 1, 2: 2 }, rolls);
        expect(r.ready).toBe(false);
        expect(r.messages).toContain('開始には3人必要です(あと1人)');
    });
    it('役職が参加人数以下なら不足数を出す', () => {
        const r = lobbyReadiness(3, { 1: 1, 2: 2 }, rolls);
        expect(r.ready).toBe(false);
        expect(r.messages).toContain('役職があと1枚足りません');
    });
    it('人狼系ゼロなら専用メッセージ', () => {
        const r = lobbyReadiness(3, { 2: 4 }, rolls);
        expect(r.ready).toBe(false);
        expect(r.messages).toContain('人狼系の役職を1枚以上入れてください');
    });
});
```

- [ ] **Step 2: 失敗確認**

Run: `npm test -- lobby` → FAIL(module not found)。

- [ ] **Step 3: 実装**

`lobby.ts`:

```ts
import { WerewolfRoll } from '../../type/werewolf';

export type LobbyReadiness = { ready: boolean; messages: string[] };

const MIN_PLAYERS = 3;

// 開始条件: 3人以上 / 役職合計 > 参加人数 / 人狼陣営(teamNo=1)を含む
export const lobbyReadiness = (
    userCount: number,
    counterMap: Record<number, number>,
    staticRollList: WerewolfRoll[]
): LobbyReadiness => {
    const messages: string[] = [];
    const total = Object.values(counterMap).reduce((a, b) => a + b, 0);
    const wolfCount = staticRollList
        .filter((r) => r.teamNo === 1)
        .reduce((sum, r) => sum + (counterMap[r.rollNo] ?? 0), 0);

    if (userCount < MIN_PLAYERS) {
        messages.push(
            `開始には${MIN_PLAYERS}人必要です(あと${MIN_PLAYERS - userCount}人)`
        );
    }
    if (total <= userCount) {
        messages.push(`役職があと${userCount - total + 1}枚足りません`);
    }
    if (wolfCount === 0) {
        messages.push('人狼系の役職を1枚以上入れてください');
    }
    return { ready: messages.length === 0, messages };
};
```

- [ ] **Step 4: テスト成功確認**

Run: `npm test -- lobby` → PASS。

- [ ] **Step 5: コミット**

```bash
git add frontend/src/features/werewolf/lobby.ts frontend/src/features/werewolf/lobby.test.ts
git commit -m "werewolf ロビー開始条件の純粋関数を追加"
```

---

### Task 7: LanternRow(提灯列)

**Files:**
- Create: `frontend/src/features/werewolf/components/LanternRow.tsx`
- Create: `frontend/src/styles/components/werewolf/lantern.module.scss`

**Interfaces:**
- Produces: `LanternRow`: `{ count: number; max: number; min: number }`(count=現在人数、max=10、min=3)

- [ ] **Step 1: 実装**

```tsx
import React from 'react';
import styles from '../../../styles/components/werewolf/lantern.module.scss';

type Props = {
    count: number;
    max: number;
    min: number;
};

// 入室人数プログレスを兼ねた提灯列。min 人に達すると列全体が揺れて開始可能を合図
export default function LanternRow({ count, max, min }: Props) {
    const ready = count >= min;
    return (
        <div
            className={`${styles.row} ${ready ? styles.ready : ''}`}
            role="status"
            aria-label={`参加 ${count} / ${max} 人`}
        >
            {Array.from({ length: max }, (_, i) => (
                <span
                    key={i}
                    className={`${styles.lantern} ${
                        i < count ? styles.lit : ''
                    }`}
                    style={{ animationDelay: `${i * 0.12}s` }}
                ></span>
            ))}
            <span className={styles.caption}>
                {ready ? '開始できます' : `あと${min - count}人で開始できます`}
            </span>
        </div>
    );
}
```

`lantern.module.scss` 要点: `.lantern` は 18×24px の角丸長方形+上下の紐/房を疑似要素で描く。未点灯は `rgba($paper,.15)` 枠のみ、`.lit` は `background: radial-gradient(circle at 50% 40%, $gold-soft, $dusk-horizon)` + `box-shadow: 0 0 12px rgba($gold-soft,.6)` に `transition: 0.6s $ease`。`.ready .lit` に `animation: sway 2.2s ease-in-out infinite alternate`(`transform: rotate(±4deg)`、`transform-origin: top center`)。`.caption` は `$sans` 0.75rem `rgba($paper,.85)`。`prefers-reduced-motion` で sway 無効。

- [ ] **Step 2: 検証・コミット**

Run: `npm test && npm run lint && npm run build` → 成功。

```bash
git add -A && git commit -m "werewolf 提灯列コンポーネントを追加"
```

---

### Task 8: MenuPanel(お品書きパネル・設定 UI 統合)

**Files:**
- Create: `frontend/src/features/werewolf/components/MenuPanel.tsx`
- Create: `frontend/src/styles/components/werewolf/menupanel.module.scss`

**Interfaces:**
- Consumes: `lobbyReadiness`(Task 6)。既存部品のロジックを流用するため、以下3部品を**そのまま子として埋め込む**(props は現行どおり): `WerewolfSet`(プリセット)、`RollCustomize`(役職±)、`LimitTimeSelector`(議論時間)
- Produces: `MenuPanel` props:

```ts
type MenuPanelProps = {
    userCount: number;
    counterMap: { [rollNo: number]: number };
    staticRollList: WerewolfRoll[];
    counter: (rollNo: number) => number;
    setRoll: (rollNo: number, diff: number) => void;
    setRollSet: (setNo: number) => void;
    setModalRoll: (roll: WerewolfRoll | null) => void;
    setModalOwnFlg: (flg: boolean) => void;
    limitTime: number;
    changeLimitTime: (t: number) => void;
    turn: number;
};
```

(既存3部品の実 props 名は各ファイルを開いて確認し、そのまま中継する。シグネチャが上と異なる場合は既存側に合わせること)

- [ ] **Step 1: 実装**

```tsx
import React from 'react';
import styles from '../../../styles/components/werewolf/menupanel.module.scss';
import WerewolfSet from './werewolfset';
import RollCustomize from './RollCustomize';
import LimitTimeSelector from './LimitTimeSelector';
import { lobbyReadiness } from '../lobby';

// お品書きパネル: プリセット / 役職構成 / 議論時間を1枚に統合し、開始条件の過不足を表示する
export default function MenuPanel(props: MenuPanelProps) {
    const readiness = lobbyReadiness(
        props.userCount,
        props.counterMap,
        props.staticRollList
    );
    return (
        <section className={styles.panel} aria-label="ゲーム設定">
            <h2 className={styles.title}>お品書き</h2>
            <div className={styles.section}>
                <p className={styles.label}>一、役職の取り合わせ</p>
                <WerewolfSet
                    userSize={props.userCount}
                    changeFnc={props.setRollSet}
                />
                <RollCustomize
                    staticRollList={props.staticRollList}
                    counterMap={props.counterMap}
                    counter={props.counter}
                    setRoll={props.setRoll}
                    setModalRoll={props.setModalRoll}
                    setModalOwnFlg={props.setModalOwnFlg}
                    turn={props.turn}
                />
            </div>
            <div className={styles.section}>
                <p className={styles.label}>二、議論のお時間</p>
                <LimitTimeSelector
                    limitTime={props.limitTime}
                    changeLimitTime={props.changeLimitTime}
                />
            </div>
            {!readiness.ready && (
                <ul className={styles.notice} role="status">
                    {readiness.messages.map((m) => (
                        <li key={m}>{m}</li>
                    ))}
                </ul>
            )}
        </section>
    );
}
```

- [ ] **Step 2: SCSS 実装**

`menupanel.module.scss` 要点: パネルは `$dusk-paper` 地・`border: 1px solid rgba($ink,.15)`・上辺に `border-top: 3px double $gold` の「品書き」感。`.title` は `$serif` 縦書き風中央見出し(`letter-spacing: .5em`)。`.label` は `$label` 色の小見出し。`.notice` は `$rose-deep` 文字+`rgba($rose,.1)` 地の角丸ボックス。`max-width: 640px; margin: 0 auto;`。内包する既存3部品のスタイルはそのまま(崩れた箇所のみ `.panel :global(...)` で微調整可)。

- [ ] **Step 3: 検証・コミット**

Run: `npm test && npm run lint && npm run build` → 成功(MenuPanel は未接続のため、この時点で dev 確認は不要)。

```bash
git add -A && git commit -m "werewolf 設定UIを統合するお品書きパネルを追加"
```

---

### Task 9: 待機画面の入室演出・つつく演出(UserField / userInfo)

**Files:**
- Modify: `frontend/src/features/werewolf/components/userInfo.tsx`
- Modify: `frontend/src/styles/components/werewolf/userinfo.module.scss`

**Interfaces:**
- Consumes: 既存 `userInfo` props(変更しない)。ロビー判定は既存の `turn` prop(0 または 4)で行う
- Produces: 見た目のみの変更。外部 API 変更なし

- [ ] **Step 1: 入室登場アニメ**

`userinfo.module.scss` に追加し、カードのルート要素へロビー時のみ `enter` クラスを付与(turn が 0/4 のとき):

```scss
.enter {
    animation: norenIn 0.6s $ease both;
}
@keyframes norenIn {
    from {
        opacity: 0;
        transform: translateY(14px);
        clip-path: inset(0 0 100% 0);
    }
    to {
        opacity: 1;
        transform: translateY(0);
        clip-path: inset(0 0 0 0);
    }
}
@media (prefers-reduced-motion: reduce) {
    .enter {
        animation: none;
    }
}
```

`userInfo.tsx` 側: ルート要素の className に `` ${turn === 0 || turn === 4 ? styles.enter : ''} `` を追加(既存の className 連結に追記)。key は既存の userList map の key に従うため、入室で新しいカードがマウントされた時のみ再生される。

- [ ] **Step 2: つつく演出(ローカルのみ・通信なし)**

`userInfo.tsx` に poke 用ローカル state を追加。ロビー中、**他人の**アバター部分をクリックしたら 0.5 秒 `poked` クラスを付ける(自分のアバタークリックは既存のアイコン変更のまま):

```tsx
const [poked, setPoked] = useState(false);
const poke = () => {
    setPoked(true);
    window.setTimeout(() => setPoked(false), 500);
};
// アバター要素(他人 && ロビー時のみ): onClick={poke}
// アバター要素の className に poked && styles.poked を追加
```

```scss
.poked {
    animation: pokeWobble 0.5s $ease;
}
@keyframes pokeWobble {
    25% {
        transform: rotate(-6deg) scale(1.06);
    }
    60% {
        transform: rotate(5deg);
    }
}
@media (prefers-reduced-motion: reduce) {
    .poked {
        animation: none;
    }
}
```

※ `setTimeout` は表示演出のためコンポーネント内で完結させる(reducer には触れない)。unmount 時のクリアは `useEffect` の cleanup で行う。

- [ ] **Step 3: 検証・コミット**

Run: `npm test && npm run lint && npm run build` → 成功。
dev で2タブ入室し、入室時のカード登場と他人アイコンのつつき揺れを確認。

```bash
git add -A && git commit -m "werewolf 待機カードに登場・つつき演出を追加"
```

---

### Task 10: SakuraParticles dusk モードと InvitePanel 改修

**Files:**
- Modify: `frontend/src/components/common/sakuraParticlesOptions.ts`(mode 型と palette 分岐)
- Modify: `frontend/src/components/common/SakuraParticles.tsx`(型のみ影響確認)
- Modify: `frontend/src/features/werewolf/components/InvitePanel.tsx`
- Modify: 対応する invite 用 scss(`InvitePanel` が import しているファイル)
- Test: `frontend/src/features/werewolf/victory.test.ts` が import している `particleCount` に影響がないこと

**Interfaces:**
- Consumes: 既存 `SakuraMode`(`'ambient' | 'celebration'` を確認の上)
- Produces: `SakuraMode` に `'dusk'` を追加。`buildSakuraOptions('dusk', ...)` は ambient と同じ粒数で palette を夕暮れ寄り(`['#E9A7BE', '#D3A94F', '#C96F4A', '#F3B9BC']`)に固定

- [ ] **Step 1: dusk モード追加**

`sakuraParticlesOptions.ts` を開き、`SakuraMode` union に `'dusk'` を追加。mode 分岐で `dusk` は `ambient` と同挙動+デフォルト palette を上記4色に差し替える(既存構造に合わせて実装)。既存テスト(`particleCount`)が通ることを確認。

- [ ] **Step 2: InvitePanel 改修**

現行 `InvitePanel.tsx`(36行)を確認し、以下の構成に変更(props `{ roomId, roomCode }` は不変):

- ルームコードを `$serif` の大きめ表示(`font-size: clamp(1.6rem, 6vw, 2.4rem); letter-spacing: .3em;`)で主役に
- コピー用ボタン(既存のコピー実装があれば流用、なければ `navigator.clipboard.writeText(roomCode)` + 「写しました」1.5秒トースト表示のローカル state)
- カード地は `rgba($night-deep, .55)` + `border: 1px solid rgba($gold-soft, .35)`(dusk 背景に浮く行灯風)

- [ ] **Step 3: 検証・コミット**

Run: `npm test && npm run lint && npm run build` → 成功。

```bash
git add -A && git commit -m "werewolf 招待カード刷新と桜の夕暮れモード追加"
```

---

### Task 11: [roomId].tsx 画面構成組み替え(統合)

**Files:**
- Modify: `frontend/src/pages/werewolf/[roomId].tsx`
- Modify: `frontend/src/styles/components/werewolf/room.module.scss`

**Interfaces:**
- Consumes: `LanternRow`(Task 7)、`MenuPanel`(Task 8)、dusk モード(Task 10)
- Produces: 最終画面構成。`lobbyHeader` / `lobbyFooter` は廃止

- [ ] **Step 1: ロビー構成の組み替え**

`[roomId].tsx` の JSX を以下の順に再構成(ロビー時。ゲーム中の構成は不変):

```tsx
{/* 待機ロビー: ヘッダー → 提灯列 → プレイヤー → お品書き → フッター */}
{lobby && (
    <div className={styles.lobbyHead}>
        <InvitePanel roomId={roomId as string} roomCode={roomCode} />
        <button className={styles.ruleLink} onClick={() => setRuleFlg(true)}>
            遊び方
        </button>
    </div>
)}
{lobby && (
    <LanternRow count={userList.length} max={10} min={3} />
)}
{/* UserField は現行位置のまま */}
{/* RollInfo は現行のまま */}
{playerData && lobby ? (
    <>
        <MenuPanel
            userCount={userList.length}
            counterMap={counterMap}
            staticRollList={staticRollList}
            counter={counter}
            setRoll={setRoll}
            setRollSet={setRollSet}
            setModalRoll={setModalRoll}
            setModalOwnFlg={setModalOwnFlg}
            limitTime={limitTime}
            changeLimitTime={changeLimitTime}
            turn={turn}
        />
        {actionButtons}
    </>
) : (
    actionButtons
)}
```

- 旧 `lobbyHeader` / `lobbyFooter` ブロックと、そこにあった `WerewolfSet` / `RollCustomize` / `LimitTimeSelector` の直接配置を削除(import も削除)
- `SakuraParticles` のロビー時 mode を `"ambient"` → `"dusk"` に変更
- GAME START ボタン: `lobbyReadiness` を import し、`!readiness.ready` なら `disabled` + `title={readiness.messages.join(' / ')}`。ready 判定は MenuPanel と同じ引数で page 側でも呼ぶ(純粋関数なので二重呼びで問題ない)

- [ ] **Step 2: room.module.scss 整理**

`lobbyHeader` / `lobbyFooter` のスタイルを削除し、`lobbyHead`(招待カード+遊び方の横並び、スマホは縦積み)を追加。`.btnarea` の GAME START `disabled` 状態(`opacity: .45; cursor: not-allowed;`)を追加。ページ全体のコンテンツ幅を `min(960px, 94vw)` の中央カラムに。

- [ ] **Step 3: 統合検証(完了ゲート)**

Run: `npm test && npm run lint && npm run build` → 全て成功。
`npm run dev` + 本番 Heroku 接続で3タブ手動確認:

1. 入室ごとに提灯が灯る/3人で「開始できます」
2. お品書きパネルで役職±・プリセット・時間変更が動く/不足時メッセージと START 無効
3. GAME START → 夕暮れ→夜のトランジション → ゲーム進行(役職選択・議論・投票)が従来どおり
4. 投票完了 → 3幕演出 → 死亡者マーカー → 巻物結果 → 夜明けロビー復帰
5. 夜明けロビーで時間設定 UI が背景に沈まず読めること(色被り解消の確認)
6. スマホ幅(375px)で横スクロールが出ないこと

- [ ] **Step 4: コミット**

```bash
git add -A && git commit -m "werewolf 待機画面を宵の口構成に組み替え"
```

---

### Task 12: ドキュメント反映・後始末

**Files:**
- Modify: `docs/architecture/games/werewolf.md`(待機・終了画面の現在仕様を反映: dusk/dawn シーン、LanternRow、MenuPanel、3幕勝利演出、DeadMarker、lobbyReadiness)
- Delete: `docs/plans/werewolf-lobby-result-redesign.md`、`docs/plans/werewolf-lobby-result-redesign-implementation.md`(`git rm`。完了した計画書は削除する運用)

- [ ] **Step 1: architecture 更新**

`werewolf.md` の「副作用・UI 表示」「注意点」を実装後の姿に書き換える。最低限: PhaseBackground の行(0=dusk、4=dawn+陣営ティント)、勝利演出の行(3幕構成・`nextVictoryAct`)、待機画面の構成(提灯列・お品書き・開始条件表示)、死亡者マーカー(`roll.punishmentFlg` 由来)。

- [ ] **Step 2: 計画書削除・最終確認**

```bash
git rm docs/plans/werewolf-lobby-result-redesign.md docs/plans/werewolf-lobby-result-redesign-implementation.md
cd frontend && npm test && npm run lint && npm run build
```

- [ ] **Step 3: コミット**

```bash
git add -A && git commit -m "werewolf 待機・終了画面刷新をドキュメントに反映"
```
