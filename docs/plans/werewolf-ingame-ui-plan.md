# werewolf ゲーム中画面UI統一 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** werewolf の役職選択・議論・投票フェーズと演出系UIを、待機/終了画面で導入済みの `tokens.scss` ベースのデザイン(夜系フェーズ連動)へ統一する。

**Architecture:** SCSS と表示層コンポーネントのみを変更する縦切り構成。`PhaseBackground` を turn 2/3 夜系に拡張した後、フェーズごとに「SCSS トークン化+DOM 直接操作除去」をセットで進める。通信契約と reducer は不変。

**Tech Stack:** Next.js 15 / React 19 / TypeScript 5 / CSS Modules (SCSS) / Vitest

設計書: [werewolf-ingame-ui.md](werewolf-ingame-ui.md)

## Global Constraints

- 通信契約(destination / topic / status / payload)は変更しない
- `frontend/src/features/werewolf/reducer.ts` / `types.ts` / `useWerewolfRoom.ts` のロジックは変更しない
- 各タスク末尾で `cd frontend && npm test && npm run lint && npm run build` が全て成功すること(lint error 0、warning 新規増加なし)
- Prettier 設定(tabWidth:4 / singleQuote / semi / trailingComma:es5)を守る
- コミットメッセージは日本語の短文
- `Countdown` は fakeartist と共用(`ProgressMessage.tsx`)。werewolf 専用の見た目変更は variant prop で行い、fakeartist の表示を変えない
- デザイン語彙は `start.module.scss` / `room.module.scss` の既存パターンに合わせる: `$serif`、`#f2fbfb`(夜系の明色文字)、`$ease`、`border-radius: 999px` のピルボタン、`prefers-reduced-motion` 対応
- 新規アニメーションは transform / opacity のみ(compositor プロパティ)。blur は既存踏襲の範囲に留める

## 手動確認の共通手順

ゲーム開始には3人必要。`cd frontend && npm run dev`(接続先はデフォルトで本番 Heroku)→ ブラウザで `localhost:3000/werewolf` のルームを作成し、**3タブ**で別名入室 → GAME START で対象フェーズまで進める。役職構成はデフォルトのままでよい。

---

### Task 1: フェーズ背景の拡張(議論・投票を夜系に)

**Files:**
- Modify: `frontend/src/styles/components/werewolf/background.module.scss`
- Modify: `frontend/src/features/werewolf/components/PhaseBackground.tsx:9-23`

**Interfaces:**
- Produces: `background.module.scss` に `.discussion` / `.voting` クラス。以降のタスクは「turn 1〜3 は常に夜背景」を前提にスタイルを組む

- [ ] **Step 1: background.module.scss にフェーズクラスを追加**

`.night` の直後に追加:

```scss
/* 夜の顔(議論): 役職選択よりやや明るい藍 + 提灯的な gold の灯 */
.discussion {
    background: radial-gradient(120% 90% at 50% 0%, #245562 0%, #1b3f4a 55%, $night 100%);
}

/* 夜の顔(投票): 緊張感のある深い藍 + rose-deep のティント */
.voting {
    background: radial-gradient(120% 90% at 50% 0%, #35323f 0%, $night 55%, $night-deep 100%);
}
```

`.glowRose` の定義の後に追加(議論中だけ gold の灯を強める):

```scss
.discussion .glowTeal {
    background: radial-gradient(circle, rgba(211, 169, 79, 0.16), transparent 70%);
}
.voting .glowRose {
    background: radial-gradient(circle, rgba(196, 100, 110, 0.16), transparent 70%);
}
```

- [ ] **Step 2: PhaseBackground.tsx の phaseClass を拡張**

```tsx
const phaseClass = (turn: number, winteamList: number[]): string => {
    if (turn === 1) {
        return styles.night;
    }
    if (turn === 2) {
        return styles.discussion;
    }
    if (turn === 3) {
        return styles.voting;
    }
    if (turn === 4 && winteamList.length > 0) {
        if (winteamList[0] === 1) {
            return styles.resultWolf;
        }
        if (winteamList[0] === 2) {
            return styles.resultVillage;
        }
        return styles.resultThird;
    }
    return styles.day;
};
```

- [ ] **Step 3: 検証ゲート**

Run: `cd frontend && npm test && npm run lint && npm run build`
Expected: 全て成功

手動確認: 3タブで議論(turn 2)・投票(turn 3)まで進め、背景が夜系で連続し 1.6s のトランジションで切り替わることを確認。

- [ ] **Step 4: Commit**

```bash
git add frontend/src/styles/components/werewolf/background.module.scss frontend/src/features/werewolf/components/PhaseBackground.tsx
git commit -m "werewolf 議論・投票フェーズの背景を夜系に拡張"
```

---

### Task 2: メッセージ帯(TurnMessage)の夜系刷新

**Files:**
- Modify: `frontend/src/styles/components/werewolf/room.module.scss`(`div.messagearea` ブロック)
- Modify: `frontend/src/features/werewolf/components/TurnMessage.tsx`

**Interfaces:**
- Consumes: Task 1 の「turn 1〜3 は夜背景」
- Produces: `styles.messagearea` は夜背景上で読める明色スタイルになる(`[roomId].tsx` 側の変更は不要)

- [ ] **Step 1: room.module.scss の messagearea を夜系に書き換え**

`div.messagearea` ブロック全体を以下に置換(messagearea は turn 1〜3 のゲーム中のみ表示されるため、夜前提でよい):

```scss
div.messagearea {
    font-family: $serif;
    position: absolute;
    width: 90%;
    text-align: center;
    font-size: 2.6rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    top: 50px;
    left: 50%;
    transform: translateX(-50%);
    color: #f2fbfb;
    text-shadow: 0 2px 12px rgba(13, 34, 41, 0.6);
    @include mq(md) {
        font-size: 2rem;
    }

    > button {
        &.endbtn {
            outline: none;
            margin: auto 0 auto 12px;
            padding: 4px 18px;
            font-family: $serif;
            font-size: 1.1rem;
            letter-spacing: 0.12em;
            border-radius: 999px;
            background: rgba(251, 254, 254, 0.12);
            color: #f2fbfb;
            border: 1px solid rgba(242, 251, 251, 0.45);
            cursor: pointer;
            transition:
                background 0.3s,
                border-color 0.3s,
                transform 0.1s;

            &:hover {
                background: rgba(53, 168, 180, 0.25);
                border-color: $teal-soft;
            }
            &:active {
                transform: scale(0.93);
            }
            &:focus-visible {
                outline: 2px solid $teal;
                outline-offset: 2px;
            }
        }
    }
}
```

- [ ] **Step 2: TurnMessage.tsx の Loadingdod を明色に**

3箇所の `<Loadingdod color={'rgb(17, 17, 17)'} />` を `<Loadingdod color={'#f2fbfb'} />` に変更。

- [ ] **Step 3: 検証ゲート**

Run: `cd frontend && npm test && npm run lint && npm run build`
Expected: 全て成功

手動確認: 「選択中」「議論中(+議論終了ボタン)」「投票中」が夜背景上で読めること。

- [ ] **Step 4: Commit**

```bash
git add frontend/src/styles/components/werewolf/room.module.scss frontend/src/features/werewolf/components/TurnMessage.tsx
git commit -m "werewolf メッセージ帯を夜系トーンに刷新"
```

---

### Task 3: useBodyClass 新設と役職選択まわりの DOM 直接操作除去

**Files:**
- Create: `frontend/src/lib/useBodyClass.ts`
- Modify: `frontend/src/features/werewolf/components/rollselectturn.tsx`
- Modify: `frontend/src/features/werewolf/components/modalrollcard.tsx`

**Interfaces:**
- Produces: `useBodyClass(className: string, active: boolean): void` — active の間だけ `document.body` に className を付与する共通フック(imperative API を helper に閉じ込める)
- rollselectturn は `props.turn !== 1` から `.out` クラスを導出(getElementById 廃止)。modalrollcard は `closing` state から flip-out クラスを導出

- [ ] **Step 1: useBodyClass.ts を作成**

```ts
import { useEffect } from 'react';

/**
 * active の間だけ body に className を付与する。
 * body クラス操作(モーダル時のスクロールロック等)をこのフックに閉じ込め、
 * コンポーネントからの document 直接操作をなくす。
 */
export function useBodyClass(className: string, active: boolean): void {
    useEffect(() => {
        if (!active) {
            return;
        }
        document.body.classList.add(className);
        return () => {
            document.body.classList.remove(className);
        };
    }, [className, active]);
}
```

- [ ] **Step 2: rollselectturn.tsx を state 導出に書き換え**

変更点:
- `view` / `unView` 関数、`useState` による turn ミラーリング、`useEffect` を削除し、`useBodyClass('modal_active_second', props.turn === 1)` に置き換える
- `.out` クラスは `props.turn !== 1` のとき className に付与(id `rollselectturn-area` と `getElementById` を廃止)
- 「他の役職を確認する」の `rollviewcb` チェックボックスハックを `useState` に置き換える

該当部分の新コード:

```tsx
import React, { useState } from 'react';
import styles from '../../../styles/components/werewolf/rollselectturn.module.scss';
import AnimationBtn from '../../../components/button/animationbtn';
import Loadingdod from '../../../components/text/loadingdod';
import { WerewolfRoll, WerewolfUser } from '../../../type/werewolf';
import RollCard from './rollcard';
import RollInfo from './rollinfo';
import { useBodyClass } from '../../../lib/useBodyClass';
```

コンポーネント冒頭:

```tsx
export default function RollSelectTurn(props: RollSelectTurnProps) {
    // 役職一覧の開閉(モバイルのみ。旧チェックボックスハックの置き換え)
    const [rollListOpen, setRollListOpen] = useState(false);
    useBodyClass('modal_active_second', props.turn === 1);

    const handRollFlg: boolean =
        props.user.handRollList && props.user.handRollList.length > 0;
    return (
        <div
            className={`${styles.rollselect} ${
                props.turn !== 1 ? styles.out : ''
            }`}
        >
```

`div.rollinfo` ブロックを以下に置換:

```tsx
                <div className={styles.rollinfo}>
                    <h2>他の役職を確認する</h2>
                    <button
                        type="button"
                        aria-expanded={rollListOpen}
                        className={`${styles.rolltoggle} ${
                            rollListOpen ? styles.open : ''
                        }`}
                        onClick={() => setRollListOpen(!rollListOpen)}
                    >
                        {rollListOpen ? '閉じる' : '役職一覧'}
                    </button>
                    <div
                        className={rollListOpen ? styles.listopen : ''}
                        onClick={() => setRollListOpen(false)}
                    >
                        <RollInfo
                            rollList={props.rollList}
                            setModalRoll={props.setModalRoll}
                            userList={props.userList}
                            turn={props.turn}
                            setModalOwnFlg={props.setModalOwnFlg}
                        />
                    </div>
                </div>
```

注意: 旧実装の `unView` は cleanup 時に `.out` を付けていたが、アンマウント直前のため実質機能していない。turn 由来の導出で「turn 1 終了後もフラグが残っている間に退場アニメーションが再生される」挙動を実現する(SCSS 側の `.out` は Task 4 で維持)。

- [ ] **Step 3: modalrollcard.tsx を state 導出に書き換え**

変更点:
- `view` 関数と `useEffect` を削除し `useBodyClass('modal_active_overflow_view', true)` に置き換え(旧実装の cleanup が誤って `modal_active` を外していたバグも解消される)
- `getElementById('modal-roll-area')` を `closing` state に置き換え

```tsx
import React, { useState } from 'react';
import styles from '../../../styles/components/werewolf/modalrollcard.module.scss';
import { WerewolfRoll } from '../../../type/werewolf';
import { SystemConst } from '../../../const/next.config';
import { useBodyClass } from '../../../lib/useBodyClass';
```

コンポーネント本体(getParam・rollStyle は現状維持):

```tsx
export default function ModalRollCard(props: ModalRollCardProps) {
    const [closing, setClosing] = useState(false);
    useBodyClass('modal_active_overflow_view', true);

    const unView = () => {
        setClosing(true);
        props.hidden();
    };
```

JSX 側は `id="modal-roll-area"` を削除し、className を導出に変更:

```tsx
            <div
                className={closing ? styles['flip-out-hor-top'] : ''}
                style={{ ... /* 現状維持 */ }}
                onClick={unView}
            >
```

- [ ] **Step 4: 検証ゲート**

Run: `cd frontend && npm test && npm run lint && npm run build`
Expected: 全て成功

手動確認: 役職選択で (1) 開幕アニメーション表示、(2) 背面スクロールがロックされる、(3) 役職カードタップでモーダルが開閉(flip-out あり)、(4) モバイル幅で「役職一覧」トグルが開閉、(5) 全員選択後に画面が退場して議論へ進む。

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/useBodyClass.ts frontend/src/features/werewolf/components/rollselectturn.tsx frontend/src/features/werewolf/components/modalrollcard.tsx
git commit -m "werewolf 役職選択の DOM 直接操作を useBodyClass と state 導出に置き換え"
```

---

### Task 4: 役職選択画面の SCSS トークン化・刷新

**Files:**
- Modify: `frontend/src/styles/components/werewolf/rollselectturn.module.scss`(全面書き換え)
- Modify: `frontend/src/styles/components/werewolf/rollcard.module.scss`
- Modify: `frontend/src/styles/components/werewolf/modalrollcard.module.scss`

**Interfaces:**
- Consumes: Task 3 の新クラス `.rolltoggle` / `.open` / `.listopen`、`.out` の turn 導出
- Produces: クラス名 `.rollselect` / `.out` / `.turndata` / `.imgdiv` / `.turn` / `.name` / `.area` / `.handrollarea` / `.memo` / `.slectedroll` / `.none` / `.rollinfo` は tsx から参照されるため名前を維持する

- [ ] **Step 1: rollselectturn.module.scss を全面書き換え**

方針: 旧チェックボックス CSS(`.check-box`、`dotha*check` キーフレーム、`rollviewcb` 関連)を全削除し、`APJapanesefont` → `$serif`、黒ベタ背景 → `$night-deep` 系の半透明、白見出し → `#f2fbfb` + gold アクセントへ。入退場アニメーション(unfoldIn/Out、zoomIn、puff-in-center、tilt-in-tl)と `attention` は挙動維持のため残す。

```scss
@use '../../variables' as *;
@use '../../tokens' as *;

@keyframes unfoldIn {
    0% {
        transform: scaleY(0.005) scaleX(0);
    }
    50% {
        transform: scaleY(0.005) scaleX(1);
    }
    100% {
        transform: scaleY(1) scaleX(1);
    }
}
@keyframes unfoldOut {
    0% {
        transform: scaleY(1) scaleX(1);
    }
    50% {
        transform: scaleY(0.005) scaleX(1);
    }
    100% {
        transform: scaleY(0.005) scaleX(0);
    }
}
@keyframes zoomIn {
    0% {
        transform: scale(0);
    }
    100% {
        transform: scale(1);
    }
}
@keyframes attention {
    0%,
    100% {
        box-shadow: 0 0 9px 7px rgba(211, 169, 79, 0.5);
    }
    50% {
        box-shadow: 0 0 9px 0 rgba(211, 169, 79, 0.5);
    }
}
@keyframes puff-in-center {
    0% {
        transform: scale(2);
        opacity: 0;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}
@keyframes tilt-in-tl {
    0% {
        transform: rotateY(35deg) rotateX(20deg) translate(-250px, -250px)
            skew(12deg, 15deg);
        opacity: 0;
    }
    100% {
        transform: rotateY(0) rotateX(0deg) translate(0, 0) skew(0deg, 0deg);
        opacity: 1;
    }
}
@keyframes listRise {
    0% {
        transform: translateY(24px);
        opacity: 0;
    }
    100% {
        transform: translateY(0);
        opacity: 1;
    }
}

div.rollselect {
    position: fixed;
    display: table;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    z-index: 10;
    transform: scaleY(0.01) scaleX(0);
    animation: unfoldIn 1s $ease forwards;

    &.out {
        transform: scale(1);
        animation: unfoldOut 1s $ease forwards;
        animation-delay: 3s;
    }

    div.rollselect_background {
        display: table-cell;
        background: rgba(13, 34, 41, 0.86);
        vertical-align: middle;

        div.turndata {
            top: 50px;
            position: absolute;
            width: 100%;
            display: flex;
            justify-content: center;
            flex-wrap: wrap;

            > div {
                margin: 0 3px 2px 3px;

                div.imgdiv {
                    margin: 0 auto;
                    width: 75px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 2px solid rgba(242, 251, 251, 0.2);
                    @include mq(md) {
                        width: 50px;
                    }
                    img {
                        display: block;
                        width: 100%;
                        filter: grayscale(1);
                    }
                    &.turn {
                        border-color: $gold-soft;
                        animation: attention 3s infinite;
                        img {
                            filter: grayscale(0);
                        }
                    }
                }

                div.name {
                    font-family: $serif;
                    font-size: 0.9rem;
                    letter-spacing: 0.08em;
                    color: rgba(242, 251, 251, 0.85);
                    white-space: nowrap;
                    text-align: center;
                    @include mq(md) {
                        font-size: 0.7rem;
                    }
                }
            }
        }

        .area {
            text-align: center;
            width: 100%;
            position: relative;
            transform: scale(0);
            animation: zoomIn 0.5s 0.8s $ease forwards;

            > span {
                display: block;
                margin-top: 50px;
                line-height: 4rem;
                font-family: $serif;
                font-size: 1.8rem;
                letter-spacing: 0.2em;
                color: rgba(242, 251, 251, 0.75);

                &.none {
                    visibility: hidden;
                }
            }

            div.handrollarea {
                display: flex;
                justify-content: center;
                height: 300px;

                > div {
                    margin: 0 10px;
                    width: 140px;

                    div.memo {
                        position: absolute;
                        left: 16px;
                        top: 0;
                        font-family: $serif;
                        font-size: 1rem;
                        letter-spacing: 0.12em;
                        color: $gold-soft;
                        text-shadow: 0 2px 8px rgba(13, 34, 41, 0.8);
                    }
                }

                > div:nth-child(2) {
                    animation: tilt-in-tl 0.65s $ease both;
                }
            }

            div.slectedroll {
                display: flex;
                justify-content: center;
                align-items: center;
                flex-flow: column;
                animation: puff-in-center 0.7s $ease both;

                > div {
                    text-align: center;
                    font-family: $serif;
                    font-size: 2rem;
                    letter-spacing: 0.2em;
                    color: #f2fbfb;
                }
            }
        }

        div.rollinfo {
            font-family: $serif;
            color: #f2fbfb;
            width: 100%;
            position: absolute;
            text-align: center;
            bottom: 5px;
            @include mq(md) {
                bottom: 50px;
            }

            > h2 {
                display: none;
                @include mq(md) {
                    display: block;
                    font-weight: 400;
                    font-size: 1rem;
                    letter-spacing: 0.14em;
                    color: rgba(242, 251, 251, 0.7);
                }
            }

            button.rolltoggle {
                display: none;
                @include mq(md) {
                    display: inline-block;
                    padding: 6px 24px;
                    font-family: $serif;
                    font-size: 0.9rem;
                    letter-spacing: 0.16em;
                    border-radius: 999px;
                    background: rgba(251, 254, 254, 0.1);
                    color: #f2fbfb;
                    border: 1px solid rgba(242, 251, 251, 0.4);
                    cursor: pointer;
                    transition:
                        background 0.3s,
                        border-color 0.3s;

                    &.open,
                    &:hover {
                        background: rgba(53, 168, 180, 0.25);
                        border-color: $teal-soft;
                    }
                }
            }

            /* 役職一覧: デスクトップは常時表示、モバイルはトグルで開閉 */
            > div {
                max-width: 36rem;
                padding: 1rem;
                margin: 0 auto;
                z-index: 2;
                border-radius: 12px;

                @include mq(md) {
                    display: none;
                    width: 100%;
                    max-width: 100%;
                    position: absolute;
                    background: rgba(13, 34, 41, 0.96);

                    &.listopen {
                        display: block;
                        animation: listRise 0.4s $ease both;
                    }
                }
            }
        }
    }
}

@media (prefers-reduced-motion: reduce) {
    div.rollselect,
    div.rollselect .area,
    div.rollselect div.handrollarea > div:nth-child(2),
    div.rollselect div.slectedroll,
    div.rollselect div.rollinfo > div.listopen {
        animation: none;
        transform: none;
    }
}
```

注意: 旧 `slide-in-blurred-bottom`(blur(40px) アニメーション)は重いので `listRise`(transform/opacity のみ)へ置き換える。

- [ ] **Step 2: rollcard.module.scss をトークン化**

全体を以下に置換:

```scss
@use '../../tokens' as *;

.rollcard {
    font-family: $serif;
    position: relative;
    overflow: hidden;
    border-radius: 12px;
    box-shadow: 0 12px 24px rgba(13, 34, 41, 0.5);
    cursor: pointer;
    transition:
        transform 0.15s $ease,
        box-shadow 0.15s $ease;

    &:hover {
        box-shadow:
            0 0 0 2px rgba(211, 169, 79, 0.55),
            0 16px 30px rgba(13, 34, 41, 0.55);
        transform: scale(1.06);
    }

    div.imgdiv {
        position: relative;
        width: 100%;
        height: 100%;
        background-size: cover;
        text-align: center;

        span.rollname {
            position: absolute;
            display: block;
            bottom: 0;
            width: 100%;
            text-align: center;
            padding: 2px 0;
            color: #f2fbfb;
            letter-spacing: -0.1rem;
            white-space: nowrap;
            background: linear-gradient(
                transparent,
                rgba(13, 34, 41, 0.85) 45%
            );
        }
    }
}
```

注意: `border: 3px solid TEAM_COLOR` は tsx の inline style(陣営色)なので SCSS では触らない。

- [ ] **Step 3: modalrollcard.module.scss をトークン化**

全体を以下に置換(クラス名 `.modal` / `.flip-out-hor-top` / `.imgdiv` / `.rollname` / `.info` / `.winDescription` は維持):

```scss
@use '../../tokens' as *;

@keyframes first-view {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}
@keyframes flip-out-hor-top {
    0% {
        transform: rotateX(0);
        opacity: 1;
    }
    100% {
        transform: rotateX(70deg);
        opacity: 0;
    }
}

div.modal {
    font-family: $serif;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(13, 34, 41, 0.7);
    z-index: 11;
    display: flex;
    align-items: center;
    justify-content: center;

    > div {
        cursor: pointer;
        z-index: 2;
        width: 300px;
        padding: 1em 1em 0 1em;
        background: $paper;
        border-radius: 16px 16px 12px 12px;
        animation: first-view 0.3s $ease;

        &.flip-out-hor-top {
            animation: flip-out-hor-top 0.35s $ease both;
        }

        > div.imgdiv {
            width: 100%;
            height: 300px;
            background-size: cover;
            background-position: center;
            border-radius: 12px 12px 0 0;
            overflow: hidden;
            position: relative;
            z-index: 1;

            > div {
                width: 100%;
                position: absolute;
                bottom: 0;
                text-align: center;
                padding: 8px 0 4px;
                font-size: 3rem;
                letter-spacing: 0.06em;
                color: #f2fbfb;
                background: linear-gradient(
                    transparent,
                    rgba(13, 34, 41, 0.85) 55%
                );
            }
        }

        div.info {
            position: relative;
            top: -20px;
            background-color: $paper;
            padding: 44px 20px 12px 20px;
            border-radius: 0 0 10px 10px;
            color: $ink;
            font-size: 1rem;
            line-height: 1.7;

            div.winDescription {
                margin-top: -20px;
                display: flex;
                justify-content: center;
                font-size: 1.15rem;
                border-bottom: solid 1px rgba(30, 59, 68, 0.35);
                padding-bottom: 4px;
                margin-bottom: 8px;
                white-space: nowrap;

                span:nth-child(1) {
                    width: 30%;
                    color: $label;
                    letter-spacing: 0.04em;
                }
                span:nth-child(2) {
                    text-align: center;
                    width: 70%;
                }
            }
        }
    }
}

@media (prefers-reduced-motion: reduce) {
    div.modal > div {
        animation: none;
    }
}
```

- [ ] **Step 4: 検証ゲート**

Run: `cd frontend && npm test && npm run lint && npm run build`
Expected: 全て成功

手動確認: 役職選択画面全体(手番表示・手札カード・選択済み役職・役職一覧・役職モーダル)が夜系トーンで統一されていること。モバイル幅(375px)でも崩れないこと。

- [ ] **Step 5: Commit**

```bash
git add frontend/src/styles/components/werewolf/rollselectturn.module.scss frontend/src/styles/components/werewolf/rollcard.module.scss frontend/src/styles/components/werewolf/modalrollcard.module.scss
git commit -m "werewolf 役職選択画面をトークンベースの夜系デザインに刷新"
```

---

### Task 5: 議論フェーズ — Countdown の night variant とアクションボタン調整

**Files:**
- Modify: `frontend/src/components/common/Countdown.tsx`
- Modify: `frontend/src/styles/components/werewolf/countdown.module.scss`
- Modify: `frontend/src/features/werewolf/components/TurnMessage.tsx:28-31`

**Interfaces:**
- Produces: `Countdown` に optional prop `variant?: 'night'`。未指定時は従来表示(fakeartist は無変更で従来どおり)

- [ ] **Step 1: countdown.module.scss をトークン化し night クラスを追加**

`@use '../../tokens' as *;` を追加し、`font-family` を `$serif` に変更。ファイル末尾(`div.clock` の中)に追加:

```scss
    &.night {
        color: #f2fbfb;
        text-shadow: 0 2px 12px rgba(13, 34, 41, 0.6);

        img {
            filter: invert(1) brightness(1.6);
        }
    }
```

- [ ] **Step 2: Countdown.tsx に variant prop を追加**

```tsx
type CountdownProps = {
    timeLimit: number; // 秒
    limitDone: () => void;
    variant?: 'night';
};
```

ルート要素の className を変更(`id="limit-time"` は残置。参照箇所がないことを `grep -rn 'limit-time' src` で確認できれば削除してよい):

```tsx
    return (
        <div
            className={`${styles.clock} ${
                props.variant === 'night' ? styles.night : ''
            }`}
        >
```

- [ ] **Step 3: TurnMessage.tsx から variant を渡す**

```tsx
                        <Countdown
                            timeLimit={limitTime}
                            limitDone={limittimeDone}
                            variant="night"
                        />
```

- [ ] **Step 4: 検証ゲート**

Run: `cd frontend && npm test && npm run lint && npm run build`
Expected: 全て成功

手動確認: (1) werewolf 議論中の残り時間表示が夜背景上で読める、(2) fakeartist(`/secret` から入る)の残り時間表示が従来どおり暗色のまま、(3) 議論中の他プレイヤーカードのアクションボタン(占う等)が視認できる。アクションボタン(`userinfo.module.scss` の `.btn` / CircleBtn)が夜背景で見づらい場合のみ、`.btn` に `filter: drop-shadow(0 4px 10px rgba(13, 34, 41, 0.6));` を追加する。

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/common/Countdown.tsx frontend/src/styles/components/werewolf/countdown.module.scss frontend/src/features/werewolf/components/TurnMessage.tsx frontend/src/styles/components/werewolf/userinfo.module.scss
git commit -m "werewolf 議論の残り時間表示に夜系 variant を追加"
```

(userinfo.module.scss を触らなかった場合は git add から外す)

---

### Task 6: 投票フェーズ — 投票開始演出の刷新

**Files:**
- Create: `frontend/src/features/werewolf/components/VotingStart.tsx`
- Modify: `frontend/src/styles/components/werewolf/start.module.scss`
- Modify: `frontend/src/features/werewolf/components/Overlays.tsx:52-57`
- Modify: `frontend/src/styles/components/werewolf/room.module.scss`(`.roundMessage` 削除)

**Interfaces:**
- Consumes: `start.module.scss` の `.start` / `.moon` / `.ring` / `.inner` / `.eyebrow` / `.title` / `.char` と `WerewolfStart.tsx` の1文字ずつ表示するパターン(実装前に `WerewolfStart.tsx` を読み、同じ構造に合わせる)
- Produces: `<VotingStart />` — props なし。`votingStartFlg` の間だけマウントされ、4s アニメーションで自動フェードアウト(pointer-events: none)

- [ ] **Step 1: start.module.scss に voting モディファイアを追加**

ファイル末尾(`@media` の前)に追加:

```scss
/* 投票開始の演出: 開始演出と同構造で rose のティント */
.voting {
    background: radial-gradient(120% 90% at 50% 0%, #35323f 0%, $night 55%, $night-deep 100%);

    .moon {
        background: radial-gradient(
            circle at 50% 42%,
            rgba(196, 100, 110, 0.3),
            rgba(233, 167, 190, 0.16) 55%,
            transparent 74%
        );
    }
    .ring {
        border-color: rgba(233, 167, 190, 0.3);
    }
}
```

- [ ] **Step 2: VotingStart.tsx を作成**

`WerewolfStart.tsx` を読み、同じ構造(eyebrow + 1文字ずつの title)で作る。文言は eyebrow「VOTING」、title「投票時間」。ルートの className は `${styles.start} ${styles.voting}`。char の `animationDelay` の付け方も WerewolfStart と同じにする。

```tsx
import React from 'react';
import styles from '../../../styles/components/werewolf/start.module.scss';

const TITLE = '投票時間';

export default function VotingStart() {
    return (
        <div className={`${styles.start} ${styles.voting}`} aria-hidden="true">
            <div className={styles.moon}></div>
            <div className={styles.ring}></div>
            <div className={styles.inner}>
                <p className={styles.eyebrow}>VOTING</p>
                <p className={styles.title}>
                    {TITLE.split('').map((char, index) => (
                        <span
                            key={index}
                            className={styles.char}
                            style={{ animationDelay: `${0.4 + index * 0.12}s` }}
                        >
                            {char}
                        </span>
                    ))}
                </p>
            </div>
        </div>
    );
}
```

(WerewolfStart の実装と差異があれば WerewolfStart 側の書き方に合わせる)

- [ ] **Step 3: Overlays.tsx の投票時間モーダルを置き換え**

```tsx
import VotingStart from './VotingStart';
```

```tsx
            {/* 投票時間 */}
            {votingStartFlg && <VotingStart />}
```

`Modal` import が他で未使用になるため削除。`room.module.scss` の `.roundMessage` も参照がなくなるので削除する(`grep -rn 'roundMessage' src` で他に参照がないことを確認してから)。

- [ ] **Step 4: 検証ゲート**

Run: `cd frontend && npm test && npm run lint && npm run build`
Expected: 全て成功

手動確認: 議論終了 → 投票開始時に「投票時間」の演出が表示され、自動で消えて投票操作(相手カードの投票ボタン)ができること。演出中も背面操作を妨げないこと(pointer-events: none)。

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/werewolf/components/VotingStart.tsx frontend/src/styles/components/werewolf/start.module.scss frontend/src/features/werewolf/components/Overlays.tsx frontend/src/styles/components/werewolf/room.module.scss
git commit -m "werewolf 投票開始演出を開始演出と同系のオーバーレイに刷新"
```

---

### Task 7: 演出仕上げ — cutin / werewolfset のトークン化と通し確認

**Files:**
- Modify: `frontend/src/styles/components/werewolf/cutin.module.scss`
- Modify: `frontend/src/styles/components/werewolf/werewolfset.module.scss`

- [ ] **Step 1: cutin.module.scss をトークン化**

`@use '../../tokens' as *;` を追加し、以下を変更(構造・アニメーションタイミングは維持):

- `font-family: 'APJapanesefont', sans-seri;` → 削除(テキストなし)
- `background-color: rgba(0, 0, 0, 0.5);` → `background-color: rgba(13, 34, 41, 0.72);`
- 帯(`> div`)の `background-color: black;` → `background-color: $night-deep;` とし、上下に gold の罫線を追加:

```scss
    > div {
        position: relative;
        width: 100%;
        height: 50%;
        overflow: hidden;
        background-color: $night-deep;
        border-top: 1px solid rgba(211, 169, 79, 0.5);
        border-bottom: 1px solid rgba(211, 169, 79, 0.5);
        /* 以下は現状維持 */
```

- 内側の `background-color: black;` → `background-color: $night-deep;`

- [ ] **Step 2: werewolfset.module.scss をトークン化**

全体を以下に置換(クラス名 `.werewolfset` / `.none` 維持。ロビーは明るいトーンなので paper 系):

```scss
@use '../../variables' as *;
@use '../../tokens' as *;

div.werewolfset {
    margin: 20px 0;
    font-family: $serif;
    text-align: center;
    line-height: 3;
    font-size: 1.3rem;
    color: $ink;
    letter-spacing: 0.06em;

    &.none {
        display: none;
    }

    select {
        padding: 0.5rem 1rem;
        font-family: $serif;
        font-size: 1rem;
        color: $ink;
        background: rgba(255, 255, 255, 0.7);
        border: 1px solid rgba(30, 59, 68, 0.3);
        border-radius: 8px;
        cursor: pointer;
        outline: 0;
        transition: border-color 0.3s;

        &:hover,
        &:focus-visible {
            border-color: $teal;
        }
    }
}
```

- [ ] **Step 3: 通し検証ゲート**

Run: `cd frontend && npm test && npm run lint && npm run build`
Expected: 全て成功

手動確認(3タブでフルプレイ): 待機 → GAME START(開始演出)→ 役職選択(モーダル・役職一覧)→ 議論(残り時間・カットイン発動役職があれば確認・議論終了)→ 投票(投票時間演出・投票)→ 結果(勝利演出・結果テーブル)→ ロビー復帰 → 退出。ロビーの役職セット select が新スタイルであること。

- [ ] **Step 4: Commit**

```bash
git add frontend/src/styles/components/werewolf/cutin.module.scss frontend/src/styles/components/werewolf/werewolfset.module.scss
git commit -m "werewolf カットイン・役職セットをトークンベースに統一"
```

---

### Task 8: ドキュメント反映とクローズ

**Files:**
- Modify: `docs/architecture/games/werewolf.md`
- Modify: `docs/roadmap.md`
- Delete: `docs/plans/werewolf-ingame-ui.md`, `docs/plans/werewolf-ingame-ui-plan.md`

- [ ] **Step 1: werewolf.md の現在仕様を更新**

「副作用・UI 表示」の表に追記・修正:
- `PhaseBackground` の行(なければ追加): turn 0=day、1=night、2=discussion、3=voting、4=陣営色。ゲーム中(1〜3)は夜系で連続
- body クラス操作(役職選択・役職モーダル)は `useBodyClass` フック経由である旨
- `votingStartFlg` の UI: Modal から `VotingStart` オーバーレイに変更

- [ ] **Step 2: roadmap.md を更新**

- 「現在のコード確認」表の werewolf 行: 残タスク「ゲーム中画面の UI 統一」を完了として行を更新(残があれば具体化)
- DOM 直接操作の行から werewolf の該当分(rollselectturn / modalrollcard)を除去し、残り(modal、icon menu、fakeartist canvas、timebomb/hideout)へ更新
- 「今後やること」6 を削除し、番号を詰める

- [ ] **Step 3: 計画書を削除して Commit**

```bash
git rm docs/plans/werewolf-ingame-ui.md docs/plans/werewolf-ingame-ui-plan.md
git add docs/architecture/games/werewolf.md docs/roadmap.md
git commit -m "werewolf ゲーム中画面UI統一の完了をドキュメントに反映"
```
