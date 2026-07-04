# セカンドワンナイト人狼 リデザイン + 入室・退出・アイコン機能 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** werewolf のゲーム画面を LP のデザインシステム(docs/design.md)に揃えて刷新し、6桁ルームコード入室・退出/キック・カスタムアイコンアップロードを追加する。

**Architecture:** デザインは `styles/tokens.scss`(新設)を正として turn 連動のフェーズ背景・入室カード・ルールモーダル・スタート演出を SCSS modules で再実装する。機能追加は既存契約を最大限再利用し、新規契約は「ルームコード解決 REST(`GET roombycode/{code}`)」と「werewolf での `game-removeuser` 利用(status 130)」の2点のみ。reducer は純粋関数のまま拡張し、ユニットテストを追加する。

**Tech Stack:** Next.js 15(pages router)/ React 19 / TypeScript / SCSS modules / Spring Boot 2.4(Java 11)。新規依存なし。

## 設計サマリ(承認済み)

- **番号入室**: 部屋作成時にバックエンドが 6桁数字のルームコードを採番して UUID と紐付け。トップページに「コードで入室」入力欄、待機画面にコード表示。URL 共有も従来どおり併用可
- **アイコンアップロード**: クライアント側で 96px 正方形 JPEG に縮小して Data URL 化し、既存 `game-changeIcon`(status 650)で送信。サーバー・ストレージ変更なし
- **退出**: 待機中(turn 0)とゲーム終了後(turn 4)のみ。自分の退出ボタン + 他プレイヤーのカードからの退出操作(いずれも確認ダイアログ付き)。既存 `game-removeuser` を status 130 で使用。自分が userList から消えたらトップへリダイレクト
- **デザイン**: docs/design.md を正とする。背景は turn 連動(待機/議論=朝の顔、役職選択=夜の顔、結果=勝利陣営色)。入室フォームは中央カード型、ルールモーダルはタイポ階層+セクション再構成、スタート演出は「夜が訪れる」テーマの文字アニメーション
- **進め方**: フェーズ分けした1プラン。Task 1〜9 を順に実施し、区切りごとに PR 分割可能(Task 1-4 デザイン / Task 5-6 ルームコード / Task 7-8 機能 / Task 9 docs)

## Global Constraints

- Prettier 設定を変えない: tabWidth 4 / singleQuote / semi / trailingComma es5
- DOM 直接操作(`document.querySelector` 等)・非制御 input を新規追加しない(offscreen canvas の生成は可)
- reducer は純粋に保つ。副作用(タイマー・Audio・Router)は `useWerewolfRoom` の useEffect に置く
- 既存の WebSocket 契約(destination / topic / status の意味)を変えない。**追加**は本計画の status 130 と REST `roombycode` のみで、Task 9 で docs を同時更新する
- SCSS は `@use` 構文(`@import` 禁止)
- 全アニメーションに `prefers-reduced-motion: reduce` 対応を入れる(アニメ停止 + 最終状態即時表示)
- コミットメッセージは日本語の短文。master に直接コミットしない。push / PR 作成はユーザー指示があるまで行わない
- 完了ゲート(frontend): `npm test && npm run lint && npm run build` 全成功(lint error 0、新規 warning 0)
- 完了ゲート(backend、Task 5 のみ): `./mvnw test` 成功(要 JDK 11)
- 動作確認は `npm run dev` + 本番 Heroku 接続(Task 5 以降のルームコードはローカルバックエンド `NEXT_PUBLIC_AP_HOST=http://localhost:8080/` で確認し、Heroku デプロイ後に本番でも確認)

---

### Task 0: 作業ブランチ作成

**Files:** なし(git 操作のみ)

- [ ] **Step 1: ブランチ作成**

LP 刷新(`feature/lp-redesign`)のデザイントークンに依存するため、そこから分岐する(LP が master にマージ済みなら master から)。

```bash
cd /Users/fukasedaichi/git/BoardGameFront
git checkout feature/lp-redesign && git pull
git checkout -b feature/werewolf-redesign
```

- [ ] **Step 2: 計画書をコミット**

```bash
git add docs/plans/werewolf-redesign.md
git commit -m "セカンドワンナイト人狼リデザインの実装計画を追加"
```

---

### Task 1: デザイントークン共通化 + フェーズ背景

**Files:**

- Create: `frontend/src/styles/tokens.scss`
- Create: `frontend/src/features/werewolf/components/PhaseBackground.tsx`
- Create: `frontend/src/styles/components/werewolf/background.module.scss`
- Modify: `frontend/src/styles/lp.module.scss`(変数定義を tokens.scss の @use に置換)
- Modify: `frontend/src/pages/werewolf/[roomId].tsx`(body:before 背景を削除し PhaseBackground を組み込み)

**Interfaces:**

- Produces: `tokens.scss` の変数(`$ink $ink-deep $teal $teal-soft $rose $rose-soft $rose-deep $mist $paper $night $night-deep $text-sub $label $serif $ease`)— Task 2/3/4 の SCSS が `@use '../../tokens' as *;` で参照する
- Produces: `PhaseBackground`: `{ turn: number; winteamList: number[] }` — 画面全体の背景(z-index: -1 固定層)

- [ ] **Step 1: `tokens.scss` を作成**

docs/design.md のトークンを SCSS 変数として定義する。

```scss
/* デザイントークン(docs/design.md を正とする)。LP・ゲーム画面共通 */
$ink: #1e3b44;
$ink-deep: #17454f;
$teal: #35a8b4;
$teal-soft: #7fd0d6;
$rose: #e88f94;
$rose-soft: #e9a7be;
$rose-deep: #c4646e;
$mist: #effdfe;
$paper: #fbfefe;
$night: #142f37;
$night-deep: #0d2229;
$text-sub: #43626b;
$label: #5a8189;

$serif: 'Shippori Mincho', serif;
$sans: 'Zen Kaku Gothic New', sans-serif;
$ease: cubic-bezier(0.22, 0.61, 0.36, 1);
```

- [ ] **Step 2: `lp.module.scss` を tokens.scss 参照に切り替える**

lp.module.scss 冒頭のローカル変数定義(`$ink:` 〜 `$ease:`)を確認し、tokens.scss と同値であることを見てから削除、先頭に以下を追加する:

```scss
@use '../styles/tokens' as *;
```

※ lp.module.scss は `frontend/src/styles/` 直下なので実際は `@use 'tokens' as *;`。値が design.md と食い違う変数があった場合は **lp 側の値を tokens.scss に採用**する(表示互換優先)。

Run: `cd frontend && npm run build`
Expected: 成功(LP の見た目に影響なし)

- [ ] **Step 3: `background.module.scss` を作成**

```scss
@use '../../tokens' as *;

.bg {
    position: fixed;
    inset: 0;
    z-index: -1;
    overflow: hidden;
    transition: background 1.6s $ease;
}

/* 朝の顔(待機・議論) */
.day {
    background: radial-gradient(120% 90% at 78% 20%, #f7eff2 0%, $mist 55%);
}

/* 夜の顔(役職選択) */
.night {
    background: radial-gradient(120% 90% at 50% 0%, #1d4550 0%, $night 55%, $night-deep 100%);
}

/* 結果(勝利陣営色のティント) */
.resultWolf {
    background: radial-gradient(120% 90% at 50% 10%, #3a2229 0%, $night 60%, $night-deep 100%);
}
.resultVillage {
    background: radial-gradient(120% 90% at 50% 10%, #16404b 0%, $night 60%, $night-deep 100%);
}
.resultThird {
    background: radial-gradient(120% 90% at 50% 10%, #33283a 0%, $night 60%, $night-deep 100%);
}

@keyframes bgBreathe {
    0%,
    100% {
        transform: scale(1);
        opacity: 0.5;
    }
    50% {
        transform: scale(1.07);
        opacity: 0.85;
    }
}

.glowTeal,
.glowRose {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
}
.glowTeal {
    top: -140px;
    right: -100px;
    width: 420px;
    height: 420px;
    background: radial-gradient(circle, rgba(127, 208, 214, 0.14), transparent 70%);
    animation: bgBreathe 12s ease-in-out infinite;
}
.glowRose {
    bottom: -160px;
    left: -120px;
    width: 460px;
    height: 460px;
    background: radial-gradient(circle, rgba(233, 167, 190, 0.12), transparent 70%);
    animation: bgBreathe 14s ease-in-out 3s infinite;
}

@media (prefers-reduced-motion: reduce) {
    .bg,
    .glowTeal,
    .glowRose {
        transition: none;
        animation: none;
    }
}
```

- [ ] **Step 4: `PhaseBackground.tsx` を作成**

```tsx
import React from 'react';
import styles from '../../../styles/components/werewolf/background.module.scss';

type Props = {
    turn: number;
    winteamList: number[];
};

const phaseClass = (turn: number, winteamList: number[]): string => {
    if (turn === 1) {
        return styles.night;
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

export default function PhaseBackground({ turn, winteamList }: Props) {
    return (
        <div
            aria-hidden="true"
            className={`${styles.bg} ${phaseClass(turn, winteamList)}`}
        >
            <div className={styles.glowTeal}></div>
            <div className={styles.glowRose}></div>
        </div>
    );
}
```

- [ ] **Step 5: `[roomId].tsx` に組み込み**

styled-jsx global から `body:before { ... }` ブロック全体を削除し、body は以下だけ残す:

```tsx
<style jsx global>
    {`
        body {
            overflow-x: hidden;
            background-color: #effdfe;
        }
    `}
</style>
```

`<Overlays ... />` の直前に追加:

```tsx
<PhaseBackground turn={turn} winteamList={winteamList} />
```

import を追加: `import PhaseBackground from '../../features/werewolf/components/PhaseBackground';`

- [ ] **Step 6: lint / build / 目視確認**

```bash
cd /Users/fukasedaichi/git/BoardGameFront/frontend
npm test && npm run lint && npm run build
```

`npm run dev` でルーム作成→入室し、待機中は朝の顔、GAME START 後(turn 1)は夜の顔へ 1.6s でクロスフェードすること。夜背景で TurnMessage 等の既存文字が読めない場合はこの Task では触らず、Task 2 のスタイル刷新で対応(メモを残す)。

- [ ] **Step 7: コミット**

```bash
cd /Users/fukasedaichi/git/BoardGameFront
git add frontend/src/styles/tokens.scss frontend/src/styles/lp.module.scss frontend/src/features/werewolf/components/PhaseBackground.tsx frontend/src/styles/components/werewolf/background.module.scss frontend/src/pages/werewolf/\[roomId\].tsx
git commit -m "werewolfにデザイントークンとturn連動フェーズ背景を導入"
```

---

### Task 2: 入室カード + 招待パネル(待機画面刷新)

**Files:**

- Create: `frontend/src/features/werewolf/components/EntryCard.tsx`
- Create: `frontend/src/features/werewolf/components/InvitePanel.tsx`
- Create: `frontend/src/styles/components/werewolf/entry.module.scss`
- Modify: `frontend/src/pages/werewolf/[roomId].tsx`(RoomInForm → EntryCard、InvitePanel 追加)

**Interfaces:**

- Consumes: `useWerewolfRoom` の `connected` / `entered` / `roomIn(userName: string)`(既存)
- Produces: `EntryCard`: `{ connected: boolean; entered: boolean; onRoomIn: (userName: string) => void }` — 未入室時のみ全画面カードを表示
- Produces: `InvitePanel`: `{ roomId: string; roomCode: string | null }` — roomCode は Task 6 まで常に null(null 時はコード行を出さない)
- 注意: `components/common/RoomInForm.tsx` は他4ゲームが使うため**変更しない**。werewolf ページからの参照だけ外す

- [ ] **Step 1: `entry.module.scss` を作成**

```scss
@use '../../tokens' as *;

@keyframes entryFadeUp {
    from {
        opacity: 0;
        transform: translateY(24px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* ---- 入室カード(未入室時の全画面オーバーレイ) ---- */
.entry {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(239, 253, 254, 0.72);
    backdrop-filter: blur(6px);
}
.card {
    width: min(420px, 100%);
    padding: clamp(28px, 5vh, 44px) clamp(22px, 5vw, 40px);
    border: 1px solid rgba(53, 168, 180, 0.25);
    border-radius: 18px;
    background: $paper;
    box-shadow: 0 24px 60px rgba(23, 69, 79, 0.14);
    text-align: center;
    animation: entryFadeUp 0.9s $ease both;
}
.eyebrow {
    margin: 0;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.4em;
    color: $label;
}
.title {
    margin: 12px 0 0;
    font-family: $serif;
    font-weight: 600;
    font-size: 24px;
    letter-spacing: 0.18em;
    color: $ink;
}
.lead {
    margin: 14px 0 0;
    font-size: 12.5px;
    line-height: 2;
    color: $text-sub;
}
.field {
    margin-top: 22px;
    text-align: left;

    label {
        display: block;
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: 0.3em;
        color: $label;
    }
    input {
        width: 100%;
        margin-top: 8px;
        padding: 12px 16px;
        border: 1px solid rgba(30, 59, 68, 0.25);
        border-radius: 10px;
        font-size: 15px;
        color: $ink;
        background: #fff;
        transition: border-color 0.3s;

        &:focus {
            outline: none;
            border-color: $teal;
        }
        &:disabled {
            opacity: 0.6;
        }
    }
}
.submit {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 50px;
    margin-top: 18px;
    padding: 12px 34px;
    border: none;
    border-radius: 999px;
    background: $ink;
    color: #f2fbfb;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.18em;
    cursor: pointer;
    transition:
        transform 0.35s $ease,
        box-shadow 0.35s,
        background 0.35s;

    &:hover:enabled {
        transform: translateY(-3px);
        box-shadow: 0 16px 32px rgba(30, 59, 68, 0.24);
        background: $ink-deep;
    }
    &:disabled {
        opacity: 0.6;
        cursor: default;
    }
}
.connecting {
    margin: 14px 0 0;
    font-size: 11.5px;
    letter-spacing: 0.1em;
    color: $rose-deep;
}

/* ---- 招待パネル(待機中) ---- */
.invite {
    width: min(420px, calc(100% - 24px));
    margin: 14px auto 0;
    padding: 16px 20px;
    border: 1px dashed rgba(53, 168, 180, 0.5);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.72);
    text-align: center;
}
.inviteLabel {
    margin: 0;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.34em;
    color: $label;
}
.code {
    margin: 8px 0 0;
    font-family: $serif;
    font-size: 34px;
    letter-spacing: 0.3em;
    color: $ink;
}
.inviteActions {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 10px;

    button {
        padding: 8px 20px;
        border: 1px solid rgba(30, 59, 68, 0.35);
        border-radius: 999px;
        background: transparent;
        font-size: 11.5px;
        font-weight: 700;
        letter-spacing: 0.14em;
        color: $ink;
        cursor: pointer;
        transition:
            background 0.3s,
            border-color 0.3s;

        &:hover {
            background: rgba(53, 168, 180, 0.1);
            border-color: rgba(53, 168, 180, 0.7);
        }
    }
}

@media (prefers-reduced-motion: reduce) {
    .card {
        animation: none;
    }
}
```

- [ ] **Step 2: `EntryCard.tsx` を作成**

```tsx
import React, { useState } from 'react';
import styles from '../../../styles/components/werewolf/entry.module.scss';

type Props = {
    connected: boolean;
    entered: boolean;
    onRoomIn: (userName: string) => void;
};

export default function EntryCard({ connected, entered, onRoomIn }: Props) {
    const [name, setName] = useState('');

    if (entered) {
        return null;
    }

    return (
        <div className={styles.entry}>
            <div className={styles.card}>
                <p className={styles.eyebrow}>SECOND ONE NIGHT WEREWOLF</p>
                <h1 className={styles.title}>村への入り口</h1>
                <p className={styles.lead}>
                    名前を入れて入室してください。
                    <br />
                    全員そろったら、ゲームを始めましょう。
                </p>
                <div className={styles.field}>
                    <label htmlFor="username">NAME</label>
                    <input
                        disabled={!connected}
                        type="text"
                        id="username"
                        maxLength={20}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                onRoomIn(name);
                            }
                        }}
                    />
                </div>
                <button
                    className={styles.submit}
                    disabled={!connected}
                    onClick={() => onRoomIn(name)}
                >
                    入室する
                </button>
                {!connected && (
                    <p className={styles.connecting}>
                        サーバーに接続しています…(初回は数十秒かかることがあります)
                    </p>
                )}
            </div>
        </div>
    );
}
```

- [ ] **Step 3: `InvitePanel.tsx` を作成**

```tsx
import React, { useState } from 'react';
import styles from '../../../styles/components/werewolf/entry.module.scss';

type Props = {
    roomId: string;
    roomCode: string | null;
};

export default function InvitePanel({ roomId, roomCode }: Props) {
    const [copied, setCopied] = useState(false);
    const roomUrl =
        typeof window !== 'undefined'
            ? `${location.origin}/werewolf/${roomId}`
            : '';

    const copyUrl = async () => {
        try {
            await navigator.clipboard.writeText(roomUrl);
            setCopied(true);
        } catch {
            // クリップボード非対応時は何もしない(URL はアドレスバーから共有可能)
        }
    };

    return (
        <div className={styles.invite}>
            <p className={styles.inviteLabel}>INVITE ─ なかまを招く</p>
            {roomCode && <p className={styles.code}>{roomCode}</p>}
            <div className={styles.inviteActions}>
                <button onClick={copyUrl}>
                    {copied ? 'コピーしました' : '部屋のURLをコピー'}
                </button>
            </div>
        </div>
    );
}
```

- [ ] **Step 4: `[roomId].tsx` を差し替え**

- `RoomInForm` の import と JSX を削除し、`import EntryCard from '../../features/werewolf/components/EntryCard';` と `import InvitePanel from '../../features/werewolf/components/InvitePanel';` を追加
- `<ConnectionStatus status={status} />` の直後に:

```tsx
<EntryCard connected={connected} entered={entered} onRoomIn={roomIn} />
{entered && (turn === 0 || turn === 4) && (
    <InvitePanel roomId={roomId as string} roomCode={null} />
)}
```

※ `state.roomCode` は Task 6 で追加するため、この時点では `roomCode={null}` を直接渡す(Task 6 Step 7 で `roomCode={roomCode}` に差し替える)。

- [ ] **Step 5: lint / build / 目視確認**

```bash
cd /Users/fukasedaichi/git/BoardGameFront/frontend
npm test && npm run lint && npm run build
```

dev で確認: 未入室時に中央カード表示 → 名前入力 → 入室でカードが消え、招待パネル(URLコピー)が出る。2タブ目でも入室でき、ゲーム開始まで進むこと。**意図的な挙動差分**: 未入室時は全画面カードで盤面が見えない(旧: 下部フォームで盤面が見えた)。

- [ ] **Step 6: コミット**

```bash
cd /Users/fukasedaichi/git/BoardGameFront
git add frontend/src/features/werewolf/components/EntryCard.tsx frontend/src/features/werewolf/components/InvitePanel.tsx frontend/src/styles/components/werewolf/entry.module.scss frontend/src/pages/werewolf/\[roomId\].tsx
git commit -m "werewolfの入室フォームを中央カード型に刷新し招待パネルを追加"
```

---

### Task 3: ルールモーダル刷新

**Files:**

- Modify: `frontend/src/features/werewolf/components/rule.tsx`(全面書き換え。props `{ endFnc: () => void }` は不変)
- Modify: `frontend/src/styles/components/werewolf/rule.module.scss`(全面書き換え)

**Interfaces:**

- Consumes: `Overlays.tsx` からの `<Rule endFnc={() => setRuleFlg(false)} />`(呼び出し側変更なし)

- [ ] **Step 1: `rule.module.scss` を全面書き換え**

```scss
@use '../../tokens' as *;

@keyframes ruleFadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}
@keyframes ruleSlideUp {
    from {
        opacity: 0;
        transform: translateY(28px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.overlay {
    position: fixed;
    inset: 0;
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(13, 34, 41, 0.6);
    backdrop-filter: blur(4px);
    animation: ruleFadeIn 0.4s $ease both;
}
.modal {
    display: flex;
    flex-direction: column;
    width: min(680px, 100%);
    max-height: min(82vh, 760px);
    border-radius: 18px;
    background: $paper;
    overflow: hidden;
    box-shadow: 0 30px 80px rgba(13, 34, 41, 0.4);
    animation: ruleSlideUp 0.5s $ease both;
}
.head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 22px 26px 18px;
    border-bottom: 1px solid rgba(53, 168, 180, 0.18);

    div p {
        margin: 0;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.4em;
        color: $teal;
    }
    div h1 {
        margin: 6px 0 0;
        font-family: $serif;
        font-weight: 600;
        font-size: 22px;
        letter-spacing: 0.16em;
        color: $ink;
    }
}
.close {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border: 1px solid rgba(30, 59, 68, 0.25);
    border-radius: 50%;
    background: transparent;
    font-size: 16px;
    color: $ink;
    cursor: pointer;
    transition:
        background 0.3s,
        border-color 0.3s;

    &:hover {
        background: rgba(53, 168, 180, 0.1);
        border-color: rgba(53, 168, 180, 0.7);
    }
}
.body {
    overflow-y: auto;
    padding: 8px 26px 30px;
}
.section {
    margin-top: 24px;

    h2 {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;
        font-family: $serif;
        font-weight: 600;
        font-size: 17px;
        letter-spacing: 0.2em;
        color: $ink;
    }
    p {
        margin: 10px 0 0;
        font-size: 13px;
        line-height: 2.1;
        color: $text-sub;
        text-wrap: pretty;
    }
}
.num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border: 1px solid rgba(53, 168, 180, 0.5);
    border-radius: 50%;
    font-size: 15px;
    color: $teal;
    flex-shrink: 0;
}
.note {
    margin: 10px 0 0;
    padding: 10px 14px;
    border-left: 2px solid $rose-soft;
    background: rgba(233, 167, 190, 0.08);
    font-size: 12px;
    line-height: 2;
    color: $text-sub;
}

@media (prefers-reduced-motion: reduce) {
    .overlay,
    .modal {
        animation: none;
    }
}
```

- [ ] **Step 2: `rule.tsx` を全面書き換え**

内容は現行の文章を「概要 → 4ステップ(準備/役職選択/議論/投票)」に再編集する。オーバーレイクリックで閉じる(モーダル内クリックは伝播停止)+ 閉じるボタンを追加。

```tsx
import React from 'react';
import styles from '../../../styles/components/werewolf/rule.module.scss';

type RuleProps = {
    endFnc: () => void;
};

const SECTIONS = [
    {
        num: '壱',
        title: 'そなえる ─ 準備',
        text: 'このゲームには参加者に加えて「NPC」が1人分参加します。ゲーム開始前に、参加者+1個の役職を設定してください。「おすすめセット」を使うと人数に合った役職配分をすぐに設定できます。議論時間(3分など)もあらかじめ決めておきましょう。',
        note: '役職の数が参加者+1より多い場合、誰にも配られない役職(役欠け)が発生します。すべての人狼が役欠けになることはありません。',
    },
    {
        num: '弐',
        title: 'えらぶ ─ 役職選択',
        text: '順番は自動で決まります。スタートプレイヤーには2つ、他のプレイヤーには1つの役職が届きます。2つの中から好きな役職を選び、残った方を次のプレイヤーへ。最後に残った役職がNPCのものになります。「初めに届いた役職」「渡された役職」「選んだ役職」──この情報が議論の武器です。忘れないように。',
        note: null,
    },
    {
        num: '参',
        title: 'はなす ─ 議論',
        text: '決めた時間内で議論します。名乗り、かまをかけ、嘘を見抜いてください。一部の役職は議論中に特殊能力を使えます。時間が来たら終了ボタンで議論を締めます。',
        note: null,
    },
    {
        num: '肆',
        title: 'ゆびさす ─ 投票',
        text: '議論で得た情報をもとに一斉投票。最多票のプレイヤーが処刑されます。全員に1票ずつ入った場合は、全員が処刑されます。役職ごとの勝利条件にもとづいて勝敗が決まります。',
        note: null,
    },
];

export default function Rule(props: RuleProps) {
    return (
        <div className={styles.overlay} onClick={props.endFnc}>
            <div
                className={styles.modal}
                role="dialog"
                aria-label="遊び方"
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.head}>
                    <div>
                        <p>HOW TO PLAY</p>
                        <h1>遊び方</h1>
                    </div>
                    <button
                        className={styles.close}
                        aria-label="閉じる"
                        onClick={props.endFnc}
                    >
                        ✕
                    </button>
                </div>
                <div className={styles.body}>
                    <div className={styles.section}>
                        <p>
                            自分で役職を選べるワンナイト人狼です。「役職選択」「議論」「投票」の3つの流れで進みます。役職選択で得た情報をもとに話せるので、人狼ゲームで何を話せばいいかわからない人にこそおすすめです。
                        </p>
                    </div>
                    {SECTIONS.map((s) => (
                        <div className={styles.section} key={s.num}>
                            <h2>
                                <span className={styles.num}>{s.num}</span>
                                {s.title}
                            </h2>
                            <p>{s.text}</p>
                            {s.note && <p className={styles.note}>{s.note}</p>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 3: lint / build / 目視確認**

```bash
cd /Users/fukasedaichi/git/BoardGameFront/frontend
npm test && npm run lint && npm run build
```

dev で「遊び方」ボタン → モーダル表示。スクロール・✕ボタン・外側クリックで閉じること。モバイル幅(375px)ではみ出さないこと。

- [ ] **Step 4: コミット**

```bash
cd /Users/fukasedaichi/git/BoardGameFront
git add frontend/src/features/werewolf/components/rule.tsx frontend/src/styles/components/werewolf/rule.module.scss
git commit -m "werewolfのルールモーダルをデザインシステム準拠に刷新"
```

---

### Task 4: ゲームスタート演出刷新

**Files:**

- Create: `frontend/src/features/werewolf/components/WerewolfStart.tsx`
- Create: `frontend/src/styles/components/werewolf/start.module.scss`
- Modify: `frontend/src/features/werewolf/components/Overlays.tsx`(`<Start />` → `<WerewolfStart />`)

**Interfaces:**

- Consumes: `startFlg`(表示は 4 秒後に `dismissStart` で自動解除される — `useWerewolfRoom.ts:185-194` の既存タイマー。**変更しない**。演出は 4 秒以内に収める)
- Produces: `WerewolfStart`: props なしの全画面オーバーレイ
- 注意: `components/common/Start.tsx` は timebomb 系が使うため変更・削除しない

- [ ] **Step 1: `start.module.scss` を作成**

「朝から夜へ沈む」演出。オーバーレイが夜色にフェードイン → 文字が1字ずつ立ち上がる → 全体がフェードアウト(計4秒)。

```scss
@use '../../tokens' as *;

@keyframes startOverlay {
    0% {
        opacity: 0;
    }
    12% {
        opacity: 1;
    }
    82% {
        opacity: 1;
    }
    100% {
        opacity: 0;
    }
}
@keyframes startChar {
    0% {
        opacity: 0;
        transform: translateY(0.55em);
        filter: blur(8px);
        color: $rose-soft;
    }
    100% {
        opacity: 1;
        transform: translateY(0);
        filter: blur(0);
        color: #f2fbfb;
    }
}
@keyframes startEyebrow {
    from {
        opacity: 0;
        letter-spacing: 0.6em;
    }
    to {
        opacity: 1;
        letter-spacing: 0.4em;
    }
}
@keyframes moonGlow {
    0%,
    100% {
        transform: scale(1);
        opacity: 0.55;
    }
    50% {
        transform: scale(1.08);
        opacity: 0.9;
    }
}

.start {
    position: fixed;
    inset: 0;
    z-index: 300;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(120% 90% at 50% 0%, #1d4550 0%, $night 55%, $night-deep 100%);
    animation: startOverlay 4s $ease both;
    pointer-events: none;
}
.moon {
    position: absolute;
    width: min(58vw, 380px);
    height: min(58vw, 380px);
    border-radius: 50%;
    background: radial-gradient(
        circle at 50% 42%,
        rgba(233, 167, 190, 0.28),
        rgba(127, 208, 214, 0.16) 55%,
        transparent 74%
    );
    filter: blur(10px);
    animation: moonGlow 4s ease-in-out both;
}
.ring {
    position: absolute;
    width: min(66vw, 430px);
    height: min(66vw, 430px);
    border-radius: 50%;
    border: 1px solid rgba(127, 208, 214, 0.3);
}
.inner {
    position: relative;
    text-align: center;
}
.eyebrow {
    margin: 0;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.4em;
    color: rgba(242, 251, 251, 0.65);
    animation: startEyebrow 1.2s $ease both 0.3s;
}
.title {
    margin: 16px 0 0;
    font-family: $serif;
    font-weight: 600;
    font-size: clamp(30px, 7vw, 52px);
    letter-spacing: 0.14em;
}
.char {
    display: inline-block;
    animation: startChar 0.9s $ease both;
}

@media (prefers-reduced-motion: reduce) {
    .start {
        animation: startOverlay 4s linear both;
    }
    .moon,
    .eyebrow,
    .char {
        animation: none;
        opacity: 1;
        transform: none;
        filter: none;
        color: #f2fbfb;
    }
}
```

- [ ] **Step 2: `WerewolfStart.tsx` を作成**

```tsx
import React from 'react';
import styles from '../../../styles/components/werewolf/start.module.scss';

const TITLE = ['夜', 'が', '、', 'お', 'と', 'ず', 'れ', 'る', '。'];

export default function WerewolfStart() {
    return (
        <div className={styles.start} aria-hidden="true">
            <div className={styles.moon}></div>
            <div className={styles.ring}></div>
            <div className={styles.inner}>
                <p className={styles.eyebrow}>SECOND ONE NIGHT ─ GAME START</p>
                <p className={styles.title}>
                    {TITLE.map((ch, i) => (
                        <span
                            key={i}
                            className={styles.char}
                            style={{ animationDelay: `${0.5 + i * 0.13}s` }}
                        >
                            {ch}
                        </span>
                    ))}
                </p>
            </div>
        </div>
    );
}
```

- [ ] **Step 3: `Overlays.tsx` を差し替え**

`import Start from '../../../components/common/Start';` を `import WerewolfStart from './WerewolfStart';` に変更し、`{startFlg && <Start />}` を `{startFlg && <WerewolfStart />}` に変更。

- [ ] **Step 4: lint / build / 目視確認**

```bash
cd /Users/fukasedaichi/git/BoardGameFront/frontend
npm test && npm run lint && npm run build
```

dev で 3人入室(3タブ)→ 役職設定 → GAME START。演出が約4秒で自然に消え、役職選択オーバーレイ(RollSelectTurn)が出ること(`Overlays.tsx` の `!startFlg && rollSelectTurnFlg` 条件により演出終了後に表示される)。

- [ ] **Step 5: コミット**

```bash
cd /Users/fukasedaichi/git/BoardGameFront
git add frontend/src/features/werewolf/components/WerewolfStart.tsx frontend/src/styles/components/werewolf/start.module.scss frontend/src/features/werewolf/components/Overlays.tsx
git commit -m "werewolfのゲームスタート演出を夜の訪れテーマに刷新"
```

---

### Task 5: ルームコード(バックエンド)

**Files:**

- Modify: `backend/src/main/java/com/boardgame/app/entity/Room.java`(`roomCode` フィールド追加)
- Modify: `backend/src/main/java/com/boardgame/app/component/ApplicationInfoBeean.java`(`createRoomCode` / `getRoomByCode` 追加)
- Modify: `backend/src/main/java/com/boardgame/app/controller/MainController.java`(werewolf 作成時のコード採番 + 解決エンドポイント)
- Create: `backend/src/test/java/com/boardgame/app/component/ApplicationInfoBeeanTest.java`

**Interfaces:**

- Produces(REST 契約。Task 6 が使用):
  - `GET {AP_HOST}createroom/werewolf` のレスポンス JSON に `roomCode: "042731"`(6桁数字文字列)が追加される(他ゲームは `roomCode: null`)
  - `GET {AP_HOST}roombycode/{roomCode}` → 200 + Room JSON(`{ roomId, roomCode, roomType, ... }`)/ 未存在は 404
- Produces(WS 契約): `game-roomin` 等の broadcast obj(Room)にも `roomCode` が含まれる(既存フィールドは不変。フィールド追加のみで互換)

- [ ] **Step 1: `Room.java` にフィールド追加**

`protected String roomId;` の直後に追加(lombok @Data で getter/setter と JSON 出力が生える):

```java
	protected String roomCode;
```

- [ ] **Step 2: 失敗するテストを書く**

`backend/src/test/java/com/boardgame/app/component/ApplicationInfoBeeanTest.java` を作成:

```java
package com.boardgame.app.component;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

import com.boardgame.app.constclass.werewolf.WereWolfConst;
import com.boardgame.app.entity.Room;
import com.boardgame.app.entity.werewolf.WerewolfRoom;

public class ApplicationInfoBeeanTest {

	private ApplicationInfoBeean newBean() {
		ApplicationInfoBeean bean = new ApplicationInfoBeean();
		bean.setMaxRoomSize(100);
		return bean;
	}

	@Test
	public void createRoomCodeは6桁数字を返す() {
		ApplicationInfoBeean bean = newBean();
		String code = bean.createRoomCode();
		assertNotNull(code);
		assertTrue(code.matches("\\d{6}"), "6桁数字であること: " + code);
	}

	@Test
	public void getRoomByCodeで部屋を引ける() {
		ApplicationInfoBeean bean = newBean();
		Room room = new WerewolfRoom();
		room.setRoomId(bean.createRoomId());
		room.setRoomType(WereWolfConst.ROOM_TYPE);
		room.setRoomCode("123456");
		bean.addRoom(room);

		Room found = bean.getRoomByCode("123456");
		assertNotNull(found);
		assertEquals(room.getRoomId(), found.getRoomId());
	}

	@Test
	public void getRoomByCodeは未存在でnull() {
		ApplicationInfoBeean bean = newBean();
		assertNull(bean.getRoomByCode("000000"));
		assertNull(bean.getRoomByCode(null));
	}
}
```

※ `roomList` は static のためテスト間で共有される。上記テストはコード重複を仮定しない書き方にしてある(既存部屋が混ざっても成立する)。JUnit 4 しか無い場合(`org.junit.jupiter` が解決できない場合)は `org.junit.Test` + `org.junit.Assert.*` に読み替える。

Run: `cd backend && ./mvnw test`
Expected: FAIL(`createRoomCode` / `getRoomByCode` が未定義でコンパイルエラー)

- [ ] **Step 3: `ApplicationInfoBeean.java` に実装**

`createRoomId()` の下に追加(import に `java.util.Random` を追加):

```java
	public String createRoomCode() {

		Random rand = new Random();

		for (int i = 0; i < 100; i++) {
			String code = String.format("%06d", rand.nextInt(1000000));

			if (getRoomByCode(code) == null) {
				return code;
			}
		}
		return String.format("%06d", rand.nextInt(1000000));
	}

	public Room getRoomByCode(String roomCode) {

		if (roomList == null || roomCode == null) {
			return null;
		}

		return roomList.stream().filter(o -> roomCode.equals(o.getRoomCode())).findAny().orElse(null);
	}
```

Run: `cd backend && ./mvnw test`
Expected: PASS

- [ ] **Step 4: `MainController.java` を修正**

`createWerwolfRoom()` に採番を追加:

```java
	@CrossOrigin
	@RequestMapping(value = { "/createroom/werewolf" })
	public Room createWerwolfRoom() {
		String roomId = appInfo.createRoomId();
		Room room = new WerewolfRoom();
		room.setRoomId(roomId);
		room.setRoomType(WereWolfConst.ROOM_TYPE);
		room.setRoomCode(appInfo.createRoomCode());
		appInfo.addRoom(room);
		return room;
	}
```

解決エンドポイントを追加(import に `org.springframework.http.ResponseEntity` と `org.springframework.web.bind.annotation.PathVariable` を追加):

```java
	@CrossOrigin
	@RequestMapping(value = { "/roombycode/{roomCode}" })
	public ResponseEntity<Room> getRoomByCode(@PathVariable String roomCode) {
		Room room = appInfo.getRoomByCode(roomCode);

		if (room == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(room);
	}
```

- [ ] **Step 5: ビルド + 手動確認**

```bash
cd /Users/fukasedaichi/git/BoardGameFront/backend
./mvnw test && ./mvnw -q -DskipTests package
./mvnw spring-boot:run   # 別ターミナルで
```

```bash
curl -s http://localhost:8080/createroom/werewolf
# => {"roomId":"<uuid>","roomCode":"042731",...} を確認
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/roombycode/042731   # 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/roombycode/000000   # 404(未使用コードの場合)
curl -s http://localhost:8080/createroom/hideout
# => roomCode が null(または欠落)であること
```

- [ ] **Step 6: コミット**

```bash
cd /Users/fukasedaichi/git/BoardGameFront
git add backend/src
git commit -m "werewolf部屋に6桁ルームコードを採番しコード解決APIを追加"
```

---

### Task 6: ルームコード(フロントエンド)

**Files:**

- Create: `frontend/src/components/lp/RoomJoinByCode.tsx`
- Modify: `frontend/src/components/lp/RoomCreateCta.tsx`(作成後にルームコードも表示)
- Modify: `frontend/src/styles/lp.module.scss`(コード入室・コード表示のスタイル追加)
- Modify: `frontend/src/pages/index.tsx`(ヒーローと下部CTAに RoomJoinByCode を追加)
- Modify: `frontend/src/features/werewolf/types.ts` / `reducer.ts`(state に `roomCode` を追加)
- Modify: `frontend/src/features/werewolf/reducer.test.ts`(roomCode 取り込みのテスト追加)
- Modify: `frontend/src/pages/werewolf/[roomId].tsx`(InvitePanel に `state.roomCode` を配線)

**Interfaces:**

- Consumes: Task 5 の REST(`createroom/werewolf` の `roomCode`、`roombycode/{code}`)
- Produces: `RoomJoinByCode`: `{ invert?: boolean }`(LP のダーク背景用)
- Produces: `WerewolfState.roomCode: string | null`(status 100/150/200/130 の obj.roomCode から取り込み)

- [ ] **Step 1: reducer テストを追加(失敗確認)**

`reducer.test.ts` の既存テストのパターンに合わせて追加(obj のダミーは既存テストの room 形状ヘルパを流用する。無ければ最小の `{ userList: [], winteamList: [], turn: 0, staticRollList: [], rollList: [], npcuser: null, limitTime: 0, rollNoList: [], roomCode: '123456' }` を使う):

```ts
it('status 100 で roomCode を取り込む', () => {
    const state = werewolfReducer(initialWerewolfState, {
        type: 'message',
        payload: {
            status: 100,
            roomId: 'r',
            userName: 'a',
            message: null,
            obj: {
                userList: [],
                winteamList: [],
                turn: 0,
                staticRollList: [],
                rollList: [],
                npcuser: null,
                limitTime: 0,
                rollNoList: [],
                roomCode: '123456',
            },
        },
    });
    expect(state.roomCode).toBe('123456');
});
```

Run: `cd frontend && npm test`
Expected: FAIL(`roomCode` が state に無い)

- [ ] **Step 2: types.ts / reducer.ts に実装**

`types.ts` の `WerewolfState` に追加:

```ts
    roomCode: string | null;
```

`reducer.ts` の `initialWerewolfState` に `roomCode: null,` を追加。`dataSet` 内の `next` 生成に 1 行追加:

```ts
        npcuser: obj.npcuser,
        roomCode: obj.roomCode ?? state.roomCode,
```

(`dataSet` を通る全 status(100/150/200/300/400/500/600/700)で自然に取り込まれる)

Run: `npm test`
Expected: PASS

- [ ] **Step 3: `RoomJoinByCode.tsx` を作成**

```tsx
import React, { useState } from 'react';
import Router from 'next/router';
import { SystemConst } from '../../const/next.config';
import styles from '../../styles/lp.module.scss';

type Props = {
    /** ダーク背景(CTAセクション)用の白基調スタイル */
    invert?: boolean;
};

export default function RoomJoinByCode({ invert = false }: Props) {
    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [joining, setJoining] = useState(false);

    const join = async () => {
        if (!/^\d{6}$/.test(code) || joining) {
            setError('6桁の数字を入力してください');
            return;
        }
        setJoining(true);
        setError(null);
        try {
            const res = await fetch(
                SystemConst.Server.AP_HOST + 'roombycode/' + code
            );
            if (res.status === 404) {
                setError('部屋が見つかりません。番号を確認してください');
                return;
            }
            if (!res.ok) {
                throw new Error();
            }
            const resJson = await res.json();
            Router.push(`/werewolf/${resJson.roomId}`);
        } catch {
            setError(SystemConst.Message.MSG_SYSTEMERR);
        } finally {
            setJoining(false);
        }
    };

    const rootCls = [styles.joinCode, invert ? styles.joinCodeInvert : '']
        .filter(Boolean)
        .join(' ');

    return (
        <div className={rootCls}>
            <label htmlFor={invert ? 'joincode-cta' : 'joincode-hero'}>
                あいことば(6桁)で入室
            </label>
            <div className={styles.joinCodeRow}>
                <input
                    id={invert ? 'joincode-cta' : 'joincode-hero'}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={code}
                    onChange={(e) =>
                        setCode(e.target.value.replace(/\D/g, ''))
                    }
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            join();
                        }
                    }}
                />
                <button type="button" onClick={join} disabled={joining}>
                    {joining ? '確認中…' : '入室'}
                </button>
            </div>
            {error && <p className={styles.joinCodeError}>{error}</p>}
        </div>
    );
}
```

- [ ] **Step 4: `lp.module.scss` にスタイル追加**

`/* ---------- ルーム作成CTA ---------- */` セクションの末尾に追加:

```scss
/* ---------- コード入室 ---------- */
.joinCode {
    margin-top: 18px;

    label {
        display: block;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.18em;
        color: $text-sub;
    }
}
.joinCodeRow {
    display: flex;
    gap: 10px;
    margin-top: 8px;

    input {
        width: 9.5em;
        padding: 10px 14px;
        border: 1px solid rgba(30, 59, 68, 0.3);
        border-radius: 999px;
        font-family: $serif;
        font-size: 16px;
        letter-spacing: 0.3em;
        color: $ink;
        background: rgba(255, 255, 255, 0.8);

        &:focus {
            outline: none;
            border-color: $teal;
        }
    }
    button {
        padding: 10px 22px;
        border: 1px solid rgba(30, 59, 68, 0.35);
        border-radius: 999px;
        background: transparent;
        font-size: 12.5px;
        font-weight: 700;
        letter-spacing: 0.16em;
        color: $ink;
        cursor: pointer;
        transition:
            background 0.3s,
            border-color 0.3s;

        &:hover {
            background: rgba(53, 168, 180, 0.1);
            border-color: rgba(53, 168, 180, 0.7);
        }
        &:disabled {
            opacity: 0.6;
            cursor: default;
        }
    }
}
.joinCodeError {
    margin: 8px 0 0;
    font-size: 12px;
    color: $rose-deep;
}
.joinCodeInvert {
    display: flex;
    flex-direction: column;
    align-items: center;

    label {
        color: rgba(255, 255, 255, 0.85);
    }
    .joinCodeRow input {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.5);
        color: #fdfefe;
    }
    .joinCodeRow button {
        border-color: rgba(255, 255, 255, 0.55);
        color: #fdfefe;

        &:hover {
            background: rgba(255, 255, 255, 0.14);
            border-color: rgba(255, 255, 255, 0.8);
        }
    }
    .joinCodeError {
        color: #ffd7da;
    }
}
```

※ セレクタ名が既存 lp.module.scss と重複しないこと(`grep -n "joinCode" frontend/src/styles/lp.module.scss` がこの追加分のみ)を確認。

- [ ] **Step 5: `RoomCreateCta.tsx` にコード表示を追加**

- state に `const [roomCode, setRoomCode] = useState('');` を追加
- `createRoom` の成功時に `setRoomCode(resJson.roomCode ?? '');` を追加
- `status === 'ready'` の表示で URL の前にコードを出す:

```tsx
{roomCode && (
    <p className={styles.roomCtaNote}>
        あいことば <strong className={styles.roomCtaCode}>{roomCode}</strong>
        (トップページの「あいことばで入室」から入れます)
    </p>
)}
```

`lp.module.scss` に追加:

```scss
.roomCtaCode {
    font-family: $serif;
    font-size: 1.5em;
    letter-spacing: 0.24em;
    color: $ink;
}
.roomCtaInvert .roomCtaCode {
    color: #fdfefe;
}
```

- [ ] **Step 6: `index.tsx` に配置**

ヒーローの `<RoomCreateCta />` の直後(同じ `styles.heroCta` div 内)に `<RoomJoinByCode />`、CTA セクションの `<RoomCreateCta invert />` の直後に `<RoomJoinByCode invert />` を追加。import も追加。

- [ ] **Step 7: `[roomId].tsx` の InvitePanel を配線**

Task 2 で `roomCode={null}` としていた箇所を `roomCode={state.roomCode}` に変更(`state` は分割代入前のオブジェクトを使うため、分割代入に `roomCode` を足すか `state.roomCode` を直接参照。既存の分割代入スタイルに合わせて `roomCode,` を追加し `roomCode={roomCode}` とする)。

- [ ] **Step 8: 完了ゲート + 動作確認**

```bash
cd /Users/fukasedaichi/git/BoardGameFront/frontend
npm test && npm run lint && npm run build
```

ローカルバックエンド(`.env.local` に `NEXT_PUBLIC_AP_HOST=http://localhost:8080/`)で確認:

1. トップ「今すぐ遊ぶ」→ URL とあいことばが表示される
2. 別タブでトップ → あいことば入力 → 入室ページに遷移 → 入室できる
3. 存在しないコードで「部屋が見つかりません」表示
4. 待機画面の招待パネルに 6桁コードが大きく表示される

確認後 `.env.local` を元に戻す(削除)。

- [ ] **Step 9: コミット**

```bash
cd /Users/fukasedaichi/git/BoardGameFront
git add frontend/src
git commit -m "トップにあいことば入室を追加し待機画面にルームコードを表示"
```

---

### Task 7: 退出・キック機能

**Files:**

- Modify: `frontend/src/features/werewolf/types.ts`(必要なし — state 変更なし。※変更が出た場合のみ)
- Modify: `frontend/src/features/werewolf/reducer.ts`(case 130 追加)
- Modify: `frontend/src/features/werewolf/reducer.test.ts`(case 130 テスト追加)
- Modify: `frontend/src/features/werewolf/useWerewolfRoom.ts`(`leaveRoom` / `removeUser` 送信 + 退出検知リダイレクト)
- Modify: `frontend/src/pages/werewolf/[roomId].tsx`(退出ボタン)
- Modify: `frontend/src/features/werewolf/components/UserField.tsx` / `userInfo.tsx`(他プレイヤーの退出操作)
- Modify: `frontend/src/styles/components/werewolf/userinfo.module.scss`(退出ボタンのスタイル)

**Interfaces:**

- Consumes: 既存バックエンド `/app/game-removeuser`(payload: `{ status: 130, roomId, userName, message: null, obj: <対象userName> }`。backend は obj の userName を `room.removeUser` し、status 130 のまま room 全体を broadcast する — `GameController.java:60-70`)
- Produces: `useWerewolfRoom` の戻り値に `leaveRoom: () => void` と `removeUser: (userName: string) => void` を追加
- status 130 は werewolf の既存 status(100/101/150/200/300/400/404/500/550/600/650/700/998/999)と衝突しない

- [ ] **Step 1: reducer テストを追加(失敗確認)**

```ts
it('status 130 でuserListが更新される(退出)', () => {
    const before = {
        ...initialWerewolfState,
        playerName: 'a',
        userList: [
            { userName: 'a', userNo: 1 },
            { userName: 'b', userNo: 2 },
        ],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
    const state = werewolfReducer(before, {
        type: 'message',
        payload: {
            status: 130,
            roomId: 'r',
            userName: 'a',
            message: null,
            obj: {
                userList: [{ userName: 'a', userNo: 1 }],
                winteamList: [],
                turn: 0,
                staticRollList: [],
                rollList: [],
                npcuser: null,
                rollNoList: [],
            },
        },
    });
    expect(state.userList).toHaveLength(1);
    expect(state.userList[0].userName).toBe('a');
});
```

Run: `npm test` → Expected: FAIL(case 130 が無く state 不変)
※ default 節で state がそのまま返るため userList は 2 件のまま → FAIL になることを確認

- [ ] **Step 2: reducer に case 130 を実装**

`reducer.ts` の `case 150:` の直前に追加:

```ts
        case 130: // 退出(userList から対象を除去した room が届く)
            return {
                ...dataSet(state, socketInfo.obj),
                counterMap: toCounterMap(socketInfo.obj.rollNoList),
                rollInfoList: socketInfo.obj.rollList,
            };
```

Run: `npm test` → Expected: PASS

- [ ] **Step 3: `useWerewolfRoom.ts` に送信関数と退出検知を追加**

import に `useRef` は既存、`Router` を追加: `import Router from 'next/router';`

送信系(`changeIcon` の下あたり)に追加:

```ts
    const leaveRoom = useCallback(() => {
        if (!state.playerName) {
            return;
        }
        conect('/app/game-removeuser', buildInfo(130, state.playerName));
    }, [conect, buildInfo, state.playerName]);

    const removeUser = useCallback(
        (userName: string) => {
            conect('/app/game-removeuser', buildInfo(130, userName));
        },
        [conect, buildInfo]
    );
```

`entered` の導出(既存 `const entered = !!own;`)の下に退出検知を追加:

```ts
    // 退出検知: 一度入室した後に userList から消えたらトップへ戻す
    // (自分の退出ボタン・他プレイヤーからの退出操作の両方をここで拾う)
    const wasEntered = useRef(false);
    useEffect(() => {
        if (entered) {
            wasEntered.current = true;
        } else if (wasEntered.current) {
            Router.push('/');
        }
    }, [entered]);
```

戻り値オブジェクトに `leaveRoom,` と `removeUser,` を追加。

- [ ] **Step 4: `[roomId].tsx` に退出ボタンを追加**

分割代入に `leaveRoom` を追加し、`styles.btnarea` 内の HOME ボタンを退出ボタンに置き換える(入室済み + 待機中/終了後のみ表示。未入室時は従来どおり HOME):

```tsx
<div className={styles.btnarea}>
    {entered && (turn === 0 || turn === 4) ? (
        <button
            onClick={() => {
                if (window.confirm('部屋から退出しますか?')) {
                    leaveRoom();
                }
            }}
        >
            退出
        </button>
    ) : (
        <button
            onClick={() => {
                Router.push('/');
            }}
        >
            HOME
        </button>
    )}
    <button onClick={init}>
        {turn > 0 && turn < 4 ? 'GAME RESET' : 'GAME START'}
    </button>
</div>
```

- [ ] **Step 5: 他プレイヤーの退出操作(キック)**

`UserField.tsx`: props に `removeUser: (userName: string) => void;` を追加し、`UserInfo` へ `removeUser={removeUser}` を渡す(UserField 内で userList を map して UserInfo を並べている箇所)。`[roomId].tsx` の `<UserField ... />` にも `removeUser={removeUser}` を追加。

`userInfo.tsx`: props 型に `removeUser: (userName: string) => void;` を追加し、`{props.ownFlg && <span className={styles.you}>YOU</span>}` の下に追加:

```tsx
{!props.ownFlg && (props.turn === 0 || props.turn === 4) && (
    <button
        className={styles.kick}
        aria-label={`${props.user.userName}を退出させる`}
        onClick={() => {
            if (
                window.confirm(
                    `「${props.user.userName}」を退出させますか?`
                )
            ) {
                props.removeUser(props.user.userName);
            }
        }}
    >
        ✕
    </button>
)}
```

`userinfo.module.scss` に追加(既存の `.you` の近く):

```scss
.kick {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 24px;
    height: 24px;
    border: 1px solid rgba(196, 100, 110, 0.6);
    border-radius: 50%;
    background: #fbfefe;
    font-size: 11px;
    line-height: 1;
    color: #c4646e;
    cursor: pointer;

    &:hover {
        background: #c4646e;
        color: #fbfefe;
    }
}
```

※ `.main` に `position: relative` が無ければ追加する。

- [ ] **Step 6: 完了ゲート + 動作確認**

```bash
cd /Users/fukasedaichi/git/BoardGameFront/frontend
npm test && npm run lint && npm run build
```

dev(本番 Heroku 接続)で 2 タブ確認:

1. タブ1・タブ2で入室 → タブ2で「退出」→ 確認 → タブ2がトップへ遷移し、タブ1の一覧から消える
2. タブ2で再入室 → タブ1からタブ2のカードの ✕ → タブ2が自動でトップへ遷移する
3. ゲーム中(turn 1〜3)は退出ボタン・✕ が表示されない
4. GAME START 直後に退出誤爆が起きない(turn 0→1 でボタンが消えるだけ)

- [ ] **Step 7: コミット**

```bash
cd /Users/fukasedaichi/git/BoardGameFront
git add frontend/src
git commit -m "werewolfに待機中の退出とキック機能を追加"
```

---

### Task 8: カスタムアイコンアップロード

**Files:**

- Create: `frontend/src/lib/imageToIconDataUrl.ts`
- Create: `frontend/src/lib/imageToIconDataUrl.test.ts`(サイズガードのテスト)
- Modify: `frontend/src/features/werewolf/components/userInfo.tsx`(自分のカードにアップロード導線)
- Modify: `frontend/src/styles/components/werewolf/userinfo.module.scss`(アップロードUIのスタイル)

**Interfaces:**

- Consumes: 既存 `changeIcon(iconUrl: string)`(status 650。Data URL 文字列をそのまま `userIconUrl` として送る。`getIconImgUrl` は非空文字列をそのまま `<img src>` に使うため Data URL でも表示される)
- Produces: `imageToIconDataUrl(file: File): Promise<string>` — 96px 正方形 JPEG の Data URL(最大約 30KB)を返す。失敗時は日本語メッセージの Error を throw
- 制約: STOMP メッセージサイズ(Spring デフォルト 64KB)内に収めるため Data URL は 40,000 文字以下を保証する
- 注意: `components/common/HideoutIcon.tsx` は hideout と共用のため**変更しない**(プリセット選択はそのまま残す)

- [ ] **Step 1: 失敗するテストを書く**

`imageToIconDataUrl.test.ts`(canvas は jsdom で動かないため、純粋なガード部分 `assertIconDataUrlSize` を分離してテストする):

```ts
import { describe, expect, it } from 'vitest';
import { assertIconDataUrlSize, MAX_DATA_URL_LENGTH } from './imageToIconDataUrl';

describe('assertIconDataUrlSize', () => {
    it('上限以下ならそのまま返す', () => {
        const url = 'data:image/jpeg;base64,' + 'a'.repeat(100);
        expect(assertIconDataUrlSize(url)).toBe(url);
    });

    it('上限超過で日本語エラーを投げる', () => {
        const url = 'data:image/jpeg;base64,' + 'a'.repeat(MAX_DATA_URL_LENGTH);
        expect(() => assertIconDataUrlSize(url)).toThrow(
            '画像を小さくできませんでした'
        );
    });
});
```

Run: `npm test` → Expected: FAIL(モジュール未定義)

- [ ] **Step 2: `imageToIconDataUrl.ts` を実装**

```ts
const ICON_SIZE = 96;
export const MAX_DATA_URL_LENGTH = 40000; // base64 で約30KB。STOMP 64KB 制限に余裕を持たせる

export function assertIconDataUrlSize(dataUrl: string): string {
    if (dataUrl.length >= MAX_DATA_URL_LENGTH) {
        throw new Error(
            '画像を小さくできませんでした。別の画像をお試しください'
        );
    }
    return dataUrl;
}

/**
 * 画像ファイルを 96px 正方形(中央クロップ)の JPEG Data URL に変換する。
 * 部屋の生存中のみ有効なアイコンとして status 650 でそのまま送信できるサイズに抑える。
 */
export async function imageToIconDataUrl(file: File): Promise<string> {
    if (!file.type.startsWith('image/')) {
        throw new Error('画像ファイルを選択してください');
    }
    if (file.size > 10 * 1024 * 1024) {
        throw new Error('10MB以下の画像を選択してください');
    }

    const bitmap = await createImageBitmap(file).catch(() => {
        throw new Error('画像を読み込めませんでした');
    });

    const canvas = document.createElement('canvas');
    canvas.width = ICON_SIZE;
    canvas.height = ICON_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('画像を変換できませんでした');
    }

    const scale = Math.max(
        ICON_SIZE / bitmap.width,
        ICON_SIZE / bitmap.height
    );
    const w = bitmap.width * scale;
    const h = bitmap.height * scale;
    ctx.drawImage(bitmap, (ICON_SIZE - w) / 2, (ICON_SIZE - h) / 2, w, h);
    bitmap.close();

    for (const quality of [0.7, 0.5, 0.35]) {
        const url = canvas.toDataURL('image/jpeg', quality);
        if (url.length < MAX_DATA_URL_LENGTH) {
            return url;
        }
    }
    return assertIconDataUrlSize(canvas.toDataURL('image/jpeg', 0.35));
}
```

Run: `npm test` → Expected: PASS

- [ ] **Step 3: `userInfo.tsx` にアップロード導線を追加**

import 追加: `import { imageToIconDataUrl } from '../../../lib/imageToIconDataUrl';`

コンポーネント内に state とハンドラを追加:

```tsx
    const [iconError, setIconError] = useState<string | null>(null);

    const handleIconFile = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) {
            return;
        }
        try {
            const dataUrl = await imageToIconDataUrl(file);
            setIconError(null);
            props.changeIcon(dataUrl);
        } catch (err) {
            setIconError(
                err instanceof Error ? err.message : '画像を変換できませんでした'
            );
        }
    };
```

`props.ownFlg` 側の `HideoutIcon` の直後(`.icon` div 内)に追加:

```tsx
{props.ownFlg && (
    <div className={styles.upload}>
        <label>
            <input
                type="file"
                accept="image/*"
                onChange={handleIconFile}
            />
            写真をアイコンに
        </label>
        {iconError && <p className={styles.uploaderror}>{iconError}</p>}
    </div>
)}
```

- [ ] **Step 4: `userinfo.module.scss` にスタイル追加**

```scss
.upload {
    margin-top: 4px;
    text-align: center;

    label {
        display: inline-block;
        padding: 3px 10px;
        border: 1px solid rgba(53, 168, 180, 0.5);
        border-radius: 999px;
        font-size: 9.5px;
        letter-spacing: 0.08em;
        color: #2e6d77;
        background: rgba(255, 255, 255, 0.8);
        cursor: pointer;

        &:hover {
            background: rgba(53, 168, 180, 0.12);
        }
    }
    input {
        display: none;
    }
}
.uploaderror {
    margin: 4px 0 0;
    font-size: 9.5px;
    color: #c4646e;
}
```

- [ ] **Step 5: 完了ゲート + 動作確認**

```bash
cd /Users/fukasedaichi/git/BoardGameFront/frontend
npm test && npm run lint && npm run build
```

dev(本番 Heroku 接続)で 2 タブ確認:

1. 「写真をアイコンに」→ 大きめの写真(数MB)を選択 → 自分と相手タブの両方でアイコンが差し替わる(=64KB 制限内で broadcast が通っている)
2. テキストファイルを選ぶと「画像ファイルを選択してください」が表示される
3. プリセットアイコンの radial 選択も従来どおり動く

- [ ] **Step 6: コミット**

```bash
cd /Users/fukasedaichi/git/BoardGameFront
git add frontend/src
git commit -m "werewolfに写真アップロードによるカスタムアイコンを追加"
```

---

### Task 9: ドキュメント更新 + 完了ゲート

**Files:**

- Modify: `docs/architecture/communication.md`(REST `roombycode`、Room JSON の `roomCode`、werewolf の status 130、status 650 の Data URL 許容)
- Modify: `docs/architecture/games/werewolf.md`(status 表に 130 追加、state に `roomCode` 追加、退出/アイコンの挙動)
- Modify: `docs/architecture/frontend.md`(tokens.scss、werewolf の EntryCard / PhaseBackground / WerewolfStart 構成)
- Modify: `docs/architecture/backend.md`(MainController の roombycode、Room.roomCode)

- [ ] **Step 1: 各ドキュメントを実ファイルを読んで更新**

それぞれの文書の既存の書き方(表形式・見出し構成)に合わせ、以下の事実を追記・修正する:

- REST: `GET {AP_HOST}roombycode/{roomCode}` → 200 で Room JSON / 404。werewolf の部屋作成時に 6桁 `roomCode` を採番(他ゲームは null)
- WS: werewolf が `/app/game-removeuser` を status 130 で使用(obj = 対象 userName、broadcast は room 全体)。status 650 の obj は プリセット URL または Data URL(40,000 文字未満)
- frontend: `styles/tokens.scss` がデザイントークンの正(lp.module.scss と werewolf 各 scss が @use)。werewolf の追加コンポーネント(PhaseBackground / EntryCard / InvitePanel / WerewolfStart)と `WerewolfState.roomCode`
- backend: `ApplicationInfoBeean.createRoomCode / getRoomByCode`、`Room.roomCode`

- [ ] **Step 2: 完了ゲート(全体)**

```bash
cd /Users/fukasedaichi/git/BoardGameFront/frontend && npm test && npm run lint && npm run build
cd /Users/fukasedaichi/git/BoardGameFront/backend && ./mvnw test
```

Expected: すべて成功

- [ ] **Step 3: 総合動作確認(本番相当)**

ローカルバックエンド + フロント dev で3タブ通しプレイ:

1. トップ → 部屋作成 → あいことば表示 → 別タブであいことば入室 + URL入室(計3人)
2. 待機画面: 入室カード → 招待パネル(コード表示・URLコピー)→ 1人退出→再入室 → キック→再入室
3. 写真アイコン設定 → 全タブ反映
4. 役職設定 → GAME START(夜の訪れ演出 → 背景が夜面へ)→ 役職選択 → 議論(背景が朝面へ)→ 投票 → 結果(勝利陣営色)
5. 遊び方モーダルの表示
6. モバイル幅(375px)で横スクロールが無いこと

- [ ] **Step 4: コミット + 完了報告**

```bash
cd /Users/fukasedaichi/git/BoardGameFront
git add docs
git commit -m "ルームコード・退出・アイコンの契約変更をドキュメントに反映"
```

検証結果をまとめてユーザーに報告し、PR 作成の指示を待つ(**push / PR はユーザー指示があるまで行わない**)。バックエンドは Heroku デプロイが必要な旨も報告に含める(ルームコード機能はデプロイまで本番で動かない)。マージ後にこの計画書を削除し、要点を必要に応じて docs/roadmap.md に記録する。
