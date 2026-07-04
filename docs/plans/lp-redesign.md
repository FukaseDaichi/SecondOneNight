# トップページLP刷新 + 隠しページ 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** トップページをセカンドワンナイト人狼専用のLP(claude.ai/design のデザイン再現)に全面刷新し、他4ゲームの入口を `/secret/` の非公開一覧ページに移す。

**Architecture:** `pages/index.tsx` をデザインHTML由来のJSX + `styles/lp.module.scss` に書き換える。スクロールrevealは `useReveal` フック(ref + IntersectionObserver)で実装し、DOM直接操作禁止の規約を守る。ルーム作成は新コンポーネント `RoomCreateCta`(werewolf専用)。`/secret/` は既存 `CreateGameBtn` を再利用した noindex ページ。

**Tech Stack:** Next.js 15(pages router)/ React 19 / TypeScript / SCSS modules。新規依存なし。

## 設計サマリ(承認済み)

- デザイン: claude.ai/design プロジェクト `39d1be91-458f-4bbc-9bb4-d5021df7f5b5` の「セカンドワンナイト人狼LP.dc.html」。6セクション構成(ヒーロー / ABOUT / HOW TO PLAY / ROLES / CTA / フッター)、配色 `#EFFDFE`(地)`#1E3B44`(墨)`#35A8B4`(青緑)`#E88F94`(紅)、フォント Shippori Mincho + Zen Kaku Gothic New
- ヒーローのメインCTA「今すぐ遊ぶ」= werewolf ルーム作成(作成→URLコピー/入室)。サブCTA「遊び方を見る」= `#howto` アンカー。下部CTAセクションも同じルーム作成UI
- ヒーロー画像はユーザー提供の `frontend/public/images/hero.png`(1600×1920, 2.4MB)を 1200px幅の WebP + JPEG に最適化して使用。元PNGはコミットしない
- 隠しページは `/secret/`。`noindex, nofollow` メタのみ(robots.txt には書かない)。タイムボム / ハイドアウト / エセ芸術家 の3ゲームを一覧。decrypt は現状どおり非掲載
- トップの meta(description / keywords / og)から他ゲーム名を完全削除
- ルームURL(`/<game>/[roomId]`)・通信契約は一切変更しない

## Global Constraints

- Prettier 設定を変えない: tabWidth 4 / singleQuote / semi / trailingComma es5
- DOM 直接操作(`document.querySelector` 等)を新規追加しない(既存 `creategamebtn.tsx` 内の既存分は許容)
- 通信内容は変更不可: `GET {AP_HOST}createroom/werewolf` → `{ roomId }` のみ使用
- UI コンポーネントの網羅テストは書かない(テスト対象は reducer / 通信層のみ)
- コミットメッセージは日本語の短文
- master に直接コミットしない。push / PR 作成はユーザー指示があるまで行わない
- 完了ゲート: `frontend/` で `npm test && npm run lint && npm run build` 全成功(lint error 0、新規 warning 0)+ dev サーバでの動作確認

---

### Task 0: 作業ブランチ作成

**Files:** なし(git 操作のみ)

- [ ] **Step 1: master から新ブランチを作成**

```bash
cd /Users/fukasedaichi/git/BoardGameFront
git stash list  # 念のため確認(空を期待)
git checkout master && git pull
git checkout -b feature/lp-redesign
```

Expected: `Switched to a new branch 'feature/lp-redesign'`(stage4a の PR とは独立させる)

- [ ] **Step 2: 計画書をコミット**

```bash
git add docs/plans/lp-redesign.md
git commit -m "トップページLP刷新の実装計画を追加"
```

---

### Task 1: ヒーロー画像の最適化アセット生成

**Files:**

- Create: `frontend/public/images/hero.webp`(表示用・1200px幅)
- Create: `frontend/public/images/hero.jpg`(`<picture>` フォールバック + og:image 用・1200px幅)
- 注意: `frontend/public/images/hero.png`(2.4MB)は**コミットしない**(生成後に削除)

**Interfaces:**

- Produces: `/images/hero.webp` と `/images/hero.jpg`(Task 3 の index.tsx が `<picture>` と og:image で参照)

- [ ] **Step 1: リサイズとJPEG生成(sips)**

```bash
cd /Users/fukasedaichi/git/BoardGameFront/frontend/public/images
sips --resampleWidth 1200 -s format jpeg -s formatOptions 80 hero.png --out hero.jpg
```

Expected: `hero.jpg`(1200×1440)が生成され、ファイルサイズ ~150〜300KB

- [ ] **Step 2: WebP生成**

まず sips を試す(macOS 14+ は webp 書き出し対応):

```bash
sips --resampleWidth 1200 -s format webp hero.png --out hero.webp
```

失敗した場合は sharp-cli を使う:

```bash
npx --yes sharp-cli --input hero.png --output hero.webp resize 1200
```

Expected: `hero.webp` が生成され、ファイルサイズ ~100〜250KB。`sips -g pixelWidth hero.webp` で幅1200を確認

- [ ] **Step 3: 見た目確認と元PNG削除**

`open hero.webp` と `open hero.jpg` で画像が壊れていないこと(下部欠けなし・色化け無し)を目視確認。問題なければ:

```bash
rm hero.png
```

- [ ] **Step 4: コミット**

```bash
cd /Users/fukasedaichi/git/BoardGameFront
git add frontend/public/images/hero.webp frontend/public/images/hero.jpg
git commit -m "LP用ヒーロー画像を追加"
```

---

### Task 2: LP部品(useReveal / Reveal / LeafFall / RoomCreateCta)とスタイル

**Files:**

- Create: `frontend/src/components/lp/useReveal.ts`
- Create: `frontend/src/components/lp/Reveal.tsx`
- Create: `frontend/src/components/lp/LeafFall.tsx`
- Create: `frontend/src/components/lp/RoomCreateCta.tsx`
- Create: `frontend/src/styles/lp.module.scss`

**Interfaces:**

- Consumes: `SystemConst.Server.AP_HOST` / `SystemConst.Server.CREATE_ROOM`(既存定数)
- Produces(Task 3 が使用):
  - `Reveal`: `{ delay?: string; className?: string; children: React.ReactNode }` の div ラッパー
  - `LeafFall`: `{ count?: number }`(デフォルト9)
  - `RoomCreateCta`: `{ invert?: boolean }`(invert=true はダーク背景用の白基調)
  - `lp.module.scss` の全クラス(Task 3 のJSXから参照)

- [ ] **Step 1: `useReveal.ts` を作成**

```ts
import { RefObject, useEffect, useRef, useState } from "react";

/**
 * 要素が viewport に入ったら revealed=true を返すフック。
 * prefers-reduced-motion 時と IntersectionObserver 非対応時は即時表示。
 */
export default function useReveal<T extends HTMLElement>(): [
  RefObject<T | null>,
  boolean,
] {
  const ref = useRef<T>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setRevealed(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return [ref, revealed];
}
```

- [ ] **Step 2: `Reveal.tsx` を作成**

```tsx
import React from "react";
import styles from "../../styles/lp.module.scss";
import useReveal from "./useReveal";

type RevealProps = {
  delay?: string;
  className?: string;
  children: React.ReactNode;
};

export default function Reveal({ delay, className, children }: RevealProps) {
  const [ref, revealed] = useReveal<HTMLDivElement>();
  const cls = [styles.reveal, revealed ? styles.revealed : "", className]
    .filter(Boolean)
    .join(" ");
  return (
    <div
      ref={ref}
      className={cls}
      style={delay ? { transitionDelay: delay } : undefined}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 3: `LeafFall.tsx` を作成(決定的擬似乱数でSSR/CSR一致)**

```tsx
import React from "react";
import styles from "../../styles/lp.module.scss";

const PALETTE = ["#E88F94", "#E9A7BE", "#F3B9BC", "#8FD0D6"];

// デザイン由来の決定的擬似乱数(Math.random だと hydration がズレる)
const rand = (i: number, n: number): number => {
  const x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export default function LeafFall({ count = 9 }: { count?: number }) {
  const leaves = Array.from({ length: count }, (_, i) => {
    const size = 9 + rand(i, 1) * 14;
    return {
      left: `${3 + rand(i, 2) * 94}%`,
      width: `${size}px`,
      height: `${size}px`,
      background: PALETTE[i % PALETTE.length],
      animationDuration: `${13 + rand(i, 3) * 11}s`,
      animationDelay: `${-rand(i, 4) * 24}s`,
    };
  });
  return (
    <div className={styles.leaves} aria-hidden="true">
      {leaves.map((style, i) => (
        <span key={i} className={styles.leaf} style={style} />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: `RoomCreateCta.tsx` を作成**

```tsx
import React, { useState } from "react";
import Router from "next/router";
import { SystemConst } from "../../const/next.config";
import styles from "../../styles/lp.module.scss";

type Status = "idle" | "creating" | "ready" | "error";

type RoomCreateCtaProps = {
  /** ダーク背景(CTAセクション)用の白基調スタイル */
  invert?: boolean;
};

export default function RoomCreateCta({ invert = false }: RoomCreateCtaProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [roomId, setRoomId] = useState("");
  const [copied, setCopied] = useState(false);

  const roomUrl = roomId
    ? `${typeof window !== "undefined" ? location.origin : ""}/werewolf/${roomId}`
    : "";

  const createRoom = async () => {
    if (status === "creating") return;
    setStatus("creating");
    setCopied(false);
    try {
      const res = await fetch(
        SystemConst.Server.AP_HOST +
          SystemConst.Server.CREATE_ROOM +
          "/werewolf",
      );
      if (!res.ok) throw new Error();
      const resJson = await res.json();
      setRoomId(resJson.roomId);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
    } catch {
      // クリップボード非対応時はURL表示のみで手動コピーしてもらう
    }
  };

  const rootCls = [styles.roomCta, invert ? styles.roomCtaInvert : ""]
    .filter(Boolean)
    .join(" ");

  if (status === "ready") {
    return (
      <div className={rootCls}>
        <p className={styles.roomCtaNote}>
          部屋ができました。URLを参加者に伝えて入室してください。
        </p>
        <p className={styles.roomCtaUrl}>{roomUrl}</p>
        <div className={styles.roomCtaActions}>
          <button type="button" className={styles.btnGhost} onClick={copyUrl}>
            {copied ? "コピーしました" : "URLをコピー"}
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => Router.push(`/werewolf/${roomId}`)}
          >
            入室する
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={rootCls}>
      <div className={styles.roomCtaActions}>
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={createRoom}
          disabled={status === "creating"}
        >
          {status === "creating" ? "部屋を準備しています…" : "今すぐ遊ぶ"}
        </button>
        <a href="#howto" className={styles.btnGhost}>
          遊び方を見る
        </a>
      </div>
      {status === "error" && (
        <p className={styles.roomCtaError}>
          {SystemConst.Message.MSG_SYSTEMERR}
          しばらくしてからもう一度お試しください。
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 5: `lp.module.scss` を作成(全文)**

```scss
/* セカンドワンナイト人狼 LP */
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

$serif: "Shippori Mincho", serif;
$ease: cubic-bezier(0.22, 0.61, 0.36, 1);

@keyframes charIn {
  0% {
    opacity: 0;
    transform: translateY(0.55em);
    filter: blur(8px);
    color: #79c4cc;
  }
  55% {
    opacity: 1;
    filter: blur(0.5px);
    color: #e29aa6;
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
    color: $ink;
  }
}
@keyframes charInTeal {
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
    color: $teal;
  }
}
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes heroFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-11px);
  }
}
@keyframes breatheGlow {
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
@keyframes ringPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.65;
  }
  50% {
    transform: scale(1.035);
    opacity: 1;
  }
}
@keyframes spinSlow {
  to {
    transform: rotate(360deg);
  }
}
@keyframes leafFall {
  0% {
    transform: translate3d(0, -6vh, 0) rotate(20deg);
    opacity: 0;
  }
  7% {
    opacity: 0.9;
  }
  50% {
    transform: translate3d(3.5vw, 48vh, 0) rotate(185deg);
    opacity: 0.9;
  }
  92% {
    opacity: 0.6;
  }
  100% {
    transform: translate3d(-2.5vw, 106vh, 0) rotate(350deg);
    opacity: 0;
  }
}
@keyframes cueDrop {
  0% {
    transform: translateY(0);
    opacity: 0;
  }
  25% {
    opacity: 1;
  }
  75% {
    opacity: 1;
  }
  100% {
    transform: translateY(36px);
    opacity: 0;
  }
}

.lp {
  font-family: "Zen Kaku Gothic New", sans-serif;
  color: $ink;
  background: $mist;
  overflow-x: hidden;
  scroll-behavior: smooth;
}

/* ---------- 共通 ---------- */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition:
    opacity 0.9s $ease,
    transform 0.9s $ease;
}
.revealed {
  opacity: 1;
  transform: translateY(0);
}

.eyebrow {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.44em;
}
.sectionTitle {
  margin: 14px 0 0;
  font-family: $serif;
  font-weight: 600;
  font-size: clamp(25px, 3.8vw, 40px);
  letter-spacing: 0.14em;
  color: $ink;
}
.divider {
  width: 56px;
  height: 1px;
  margin: 24px auto 0;
  background: linear-gradient(90deg, $teal, $rose);
}

.btnPrimary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
  padding: 12px 34px;
  border: none;
  border-radius: 999px;
  background: $ink;
  color: #f2fbfb;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-decoration: none;
  cursor: pointer;
  transition:
    transform 0.35s $ease,
    box-shadow 0.35s,
    background 0.35s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 16px 32px rgba(30, 59, 68, 0.24);
    background: $ink-deep;
    color: #f2fbfb;
  }
  &:disabled {
    opacity: 0.7;
    cursor: default;
    transform: none;
    box-shadow: none;
  }
}
.btnGhost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
  padding: 12px 34px;
  border: 1px solid rgba(30, 59, 68, 0.35);
  border-radius: 999px;
  background: transparent;
  color: $ink;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-decoration: none;
  cursor: pointer;
  transition:
    transform 0.35s $ease,
    background 0.35s,
    border-color 0.35s;

  &:hover {
    transform: translateY(-3px);
    background: rgba(53, 168, 180, 0.1);
    border-color: rgba(53, 168, 180, 0.7);
    color: $ink;
  }
}

/* ---------- ルーム作成CTA ---------- */
.roomCta {
  margin-top: clamp(26px, 4.5vh, 40px);
}
.roomCtaActions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}
.roomCtaNote {
  margin: 0 0 14px;
  font-size: 13.5px;
  line-height: 1.9;
  color: $text-sub;
}
.roomCtaUrl {
  margin: 0 0 16px;
  padding: 10px 16px;
  border: 1px dashed rgba(53, 168, 180, 0.6);
  border-radius: 10px;
  font-size: 12.5px;
  word-break: break-all;
  color: $ink;
  background: rgba(255, 255, 255, 0.65);
}
.roomCtaError {
  margin: 12px 0 0;
  font-size: 12.5px;
  color: $rose-deep;
}
.roomCtaInvert {
  display: flex;
  flex-direction: column;
  align-items: center;

  .roomCtaActions {
    justify-content: center;
  }
  .btnPrimary {
    background: #fdfefe;
    color: $ink-deep;

    &:hover {
      background: #fff;
      box-shadow: 0 18px 36px rgba(10, 30, 36, 0.35);
      color: $ink-deep;
    }
  }
  .btnGhost {
    border-color: rgba(255, 255, 255, 0.55);
    color: #fdfefe;

    &:hover {
      background: rgba(255, 255, 255, 0.14);
      border-color: rgba(255, 255, 255, 0.8);
      color: #fdfefe;
    }
  }
  .roomCtaNote {
    color: rgba(255, 255, 255, 0.85);
  }
  .roomCtaUrl {
    color: #fdfefe;
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.5);
  }
  .roomCtaError {
    color: #ffd7da;
  }
}

/* ---------- ヒーロー ---------- */
.hero {
  position: relative;
  overflow: hidden;
  min-height: 100svh;
  display: flex;
  align-items: center;
  background: radial-gradient(120% 90% at 78% 30%, #f7eff2 0%, $mist 55%);
  padding: clamp(72px, 10vh, 120px) clamp(20px, 6vw, 96px)
    clamp(72px, 10vh, 110px);
}
.leaves {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 3;
}
.leaf {
  position: absolute;
  top: -8vh;
  border-radius: 0 100% 0 100%;
  opacity: 0;
  animation-name: leafFall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform;
  pointer-events: none;
}
.heroInner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: clamp(36px, 5vw, 72px);
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}
.heroCopy {
  flex: 1 1 420px;
  min-width: 0;
  max-width: 620px;
}
.heroEyebrow {
  margin: 0 0 clamp(18px, 3vh, 30px);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.34em;
  color: $label;
}
.heroTitle {
  margin: 0;
  font-family: $serif;
  font-weight: 600;
  line-height: 1.15;
}
.titleSub {
  display: block;
  font-size: clamp(19px, 2.6vw, 30px);
  letter-spacing: 0.42em;
  color: $teal;
  margin-bottom: 0.5em;
}
.titleMain {
  display: block;
  font-size: clamp(36px, 5.2vw, 70px);
  letter-spacing: 0.1em;
  color: $ink;
}
.titleWord {
  white-space: nowrap;
  display: inline-block;
}
.charTeal {
  display: inline-block;
  animation: charInTeal 0.9s $ease both;
}
.charInk {
  display: inline-block;
  animation: charIn 1s $ease both;
}
.tagline {
  margin: clamp(22px, 4vh, 36px) 0 0;
  font-family: $serif;
  font-size: clamp(17px, 2.1vw, 23px);
  letter-spacing: 0.2em;
  color: $rose-deep;
  animation: fadeUp 1.1s $ease both 1.6s;
}
.lead {
  margin: clamp(14px, 2.5vh, 22px) 0 0;
  max-width: 33em;
  font-size: clamp(13.5px, 1.5vw, 15.5px);
  line-height: 2.1;
  color: $text-sub;
  animation: fadeUp 1.1s $ease both 1.75s;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: clamp(20px, 3.5vh, 30px);
  animation: fadeUp 1.1s $ease both 1.9s;
}
.chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  border: 1px solid rgba(53, 168, 180, 0.45);
  border-radius: 999px;
  font-size: 12px;
  letter-spacing: 0.12em;
  color: #2e6d77;
}
.heroCta {
  animation: fadeUp 1.1s $ease both 2.05s;
}
.heroArt {
  position: relative;
  flex: 1 1 320px;
  max-width: 560px;
  margin: 0 auto;
  animation: fadeUp 1.4s $ease both 0.3s;
}
.heroGlow {
  position: absolute;
  inset: -4%;
  border-radius: 50%;
  background: radial-gradient(
    circle at 58% 38%,
    rgba(238, 178, 190, 0.5),
    rgba(127, 200, 207, 0.28) 55%,
    transparent 74%
  );
  filter: blur(26px);
  animation: breatheGlow 9s ease-in-out infinite;
}
.heroRing1 {
  position: absolute;
  inset: 3%;
  border-radius: 50%;
  border: 1px solid rgba(53, 168, 180, 0.35);
  animation: ringPulse 8s ease-in-out infinite;
}
.heroRing2 {
  position: absolute;
  inset: -3.5%;
  border-radius: 50%;
  border: 1px solid rgba(232, 143, 148, 0.32);
  animation: ringPulse 11s ease-in-out 1.8s infinite;
}
.heroHand {
  position: absolute;
  inset: 6%;
  animation: spinSlow 140s linear infinite;

  div {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 1px;
    height: 46%;
    background: linear-gradient(rgba(30, 59, 68, 0), rgba(30, 59, 68, 0.35));
    transform-origin: top center;
  }
}
.heroImgWrap {
  position: relative;
  animation: heroFloat 9s ease-in-out infinite;
}
.heroImg {
  display: block;
  width: 100%;
  height: auto;
  -webkit-mask-image: radial-gradient(
    82% 74% at 50% 48%,
    #000 55%,
    transparent 88%
  );
  mask-image: radial-gradient(82% 74% at 50% 48%, #000 55%, transparent 88%);
}
.scrollCue {
  position: absolute;
  bottom: 26px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  z-index: 2;
  animation: fadeUp 1s both 2.6s;

  span:first-child {
    font-size: 9px;
    letter-spacing: 0.4em;
    color: rgba(30, 59, 68, 0.5);
  }
}
.cueLine {
  position: relative;
  display: block;
  width: 1px;
  height: 44px;
  background: rgba(30, 59, 68, 0.2);
  overflow: hidden;

  span {
    position: absolute;
    left: -1.5px;
    top: 0;
    width: 4px;
    height: 8px;
    border-radius: 999px;
    background: $rose;
    animation: cueDrop 2.4s ease-in-out infinite;
  }
}

/* ---------- ABOUT ---------- */
.about {
  position: relative;
  background: $paper;
  padding: clamp(72px, 12vh, 130px) clamp(20px, 6vw, 96px);
}
.aboutInner {
  max-width: 1080px;
  margin: 0 auto;
}
.aboutEyebrow {
  color: $teal;
}
.sectionHead {
  text-align: center;
}
.aboutLead {
  max-width: 36em;
  margin: clamp(28px, 5vh, 44px) auto 0;
  font-size: clamp(13.5px, 1.5vw, 15.5px);
  line-height: 2.2;
  color: $text-sub;
  text-align: center;
  text-wrap: pretty;
}
.statGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: clamp(14px, 2vw, 22px);
  margin-top: clamp(40px, 7vh, 64px);
}
.statCard {
  height: 100%;
  background: #ffffff;
  border: 1px solid rgba(53, 168, 180, 0.18);
  border-radius: 14px;
  padding: 30px 18px;
  text-align: center;
  transition:
    transform 0.4s $ease,
    box-shadow 0.4s,
    border-color 0.4s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(23, 69, 79, 0.1);
    border-color: rgba(53, 168, 180, 0.5);
  }

  .statLabel {
    margin: 0;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.32em;
    color: $label;
  }
  .statValue {
    margin: 12px 0 0;
    font-family: $serif;
    font-size: clamp(28px, 3vw, 36px);
    color: $ink;

    span {
      font-size: 0.45em;
      letter-spacing: 0.2em;
      margin-left: 4px;
    }
  }
  .statCaption {
    margin: 10px 0 0;
    font-size: 12px;
    letter-spacing: 0.14em;
    color: $label;
  }
}

/* ---------- HOW TO PLAY ---------- */
.howto {
  position: relative;
  background: linear-gradient(180deg, $paper 0%, #f8eff0 65%, #f4e5e7 100%);
  padding: clamp(72px, 12vh, 130px) clamp(20px, 6vw, 96px);
}
.howtoInner {
  max-width: 1160px;
  margin: 0 auto;
}
.howtoEyebrow {
  color: $rose-deep;
}
.stepGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: clamp(14px, 2vw, 22px);
  margin-top: clamp(40px, 7vh, 64px);
}
.stepCard {
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(30, 59, 68, 0.08);
  border-radius: 16px;
  padding: 32px 26px;
  transition:
    transform 0.4s $ease,
    box-shadow 0.4s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 22px 44px rgba(23, 69, 79, 0.12);
  }

  .stepNum {
    margin: 0;
    font-family: $serif;
    font-size: 38px;
    line-height: 1;
  }
  h3 {
    margin: 18px 0 0;
    font-family: $serif;
    font-weight: 600;
    font-size: 20px;
    letter-spacing: 0.22em;
    color: $ink;
  }
  p:last-child {
    margin: 14px 0 0;
    font-size: 13.5px;
    line-height: 2;
    color: $text-sub;
    text-wrap: pretty;
  }
}

/* ---------- ROLES ---------- */
.roles {
  position: relative;
  overflow: hidden;
  background: $night;
  padding: clamp(72px, 12vh, 130px) clamp(20px, 6vw, 96px);
}
.rolesGlowTop {
  position: absolute;
  top: -140px;
  right: -100px;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(127, 208, 214, 0.16),
    transparent 70%
  );
  animation: breatheGlow 12s ease-in-out infinite;
}
.rolesGlowBottom {
  position: absolute;
  bottom: -160px;
  left: -120px;
  width: 460px;
  height: 460px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(233, 167, 190, 0.12),
    transparent 70%
  );
  animation: breatheGlow 14s ease-in-out 3s infinite;
}
.rolesInner {
  position: relative;
  max-width: 1160px;
  margin: 0 auto;
}
.rolesEyebrow {
  color: $teal-soft;
}
.rolesTitle {
  color: #f2fbfb;
}
.rolesDivider {
  background: linear-gradient(90deg, $teal-soft, $rose-soft);
}
.roleGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(255px, 1fr));
  gap: clamp(14px, 2vw, 22px);
  margin-top: clamp(40px, 7vh, 64px);
}
.roleCard {
  height: 100%;
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 28px 26px;
  transition:
    transform 0.4s $ease,
    border-color 0.4s,
    box-shadow 0.4s;

  .roleHead {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .roleGlyph {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: 1px solid;
    font-family: $serif;
    font-size: 24px;
  }
  .roleCamp {
    padding: 4px 12px;
    border: 1px solid;
    border-radius: 999px;
    font-size: 10px;
    letter-spacing: 0.22em;
  }
  h3 {
    margin: 20px 0 0;
    font-family: $serif;
    font-weight: 600;
    font-size: 23px;
    letter-spacing: 0.18em;
    color: #f2fbfb;
  }
  p:last-child {
    margin: 12px 0 0;
    font-size: 13px;
    line-height: 2;
    color: rgba(242, 251, 251, 0.7);
    text-wrap: pretty;
  }
}
.roleWolf {
  &:hover {
    transform: translateY(-5px);
    border-color: rgba(240, 148, 155, 0.6);
    box-shadow: 0 20px 44px rgba(240, 148, 155, 0.12);
  }
  .roleGlyph,
  .roleCamp {
    border-color: rgba(240, 148, 155, 0.55);
    color: #f0949b;
  }
}
.roleVillage {
  &:hover {
    transform: translateY(-5px);
    border-color: rgba(127, 208, 214, 0.6);
    box-shadow: 0 20px 44px rgba(127, 208, 214, 0.12);
  }
  .roleGlyph,
  .roleCamp {
    border-color: rgba(127, 208, 214, 0.55);
    color: $teal-soft;
  }
}
.roleThird {
  &:hover {
    transform: translateY(-5px);
    border-color: rgba(233, 167, 190, 0.6);
    box-shadow: 0 20px 44px rgba(233, 167, 190, 0.12);
  }
  .roleGlyph,
  .roleCamp {
    border-color: rgba(233, 167, 190, 0.55);
    color: $rose-soft;
  }
}

/* ---------- CTA ---------- */
.cta {
  position: relative;
  overflow: hidden;
  background: linear-gradient(130deg, $ink-deep 0%, #2e7d8a 48%, #c97f92 100%);
  padding: clamp(84px, 14vh, 150px) clamp(20px, 6vw, 96px);
  text-align: center;
}
.ctaRing1,
.ctaRing2 {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
}
.ctaRing1 {
  width: min(72vw, 640px);
  height: min(72vw, 640px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  animation: ringPulse 9s ease-in-out infinite;
}
.ctaRing2 {
  width: min(88vw, 820px);
  height: min(88vw, 820px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: ringPulse 13s ease-in-out 2s infinite;
}
.ctaInner {
  position: relative;
  max-width: 760px;
  margin: 0 auto;
}
.ctaEyebrow {
  color: rgba(255, 255, 255, 0.75);
}
.ctaTitle {
  margin: 18px 0 0;
  font-family: $serif;
  font-weight: 600;
  font-size: clamp(30px, 5vw, 52px);
  letter-spacing: 0.16em;
  color: #fdfefe;
}
.ctaLead {
  max-width: 30em;
  margin: clamp(18px, 3vh, 28px) auto 0;
  font-size: clamp(13.5px, 1.5vw, 15px);
  line-height: 2.1;
  color: rgba(255, 255, 255, 0.85);
  text-wrap: pretty;
}

/* ---------- フッター ---------- */
.footer {
  background: $night-deep;
  padding: clamp(40px, 6vh, 56px) clamp(20px, 6vw, 96px);
}
.footerInner {
  max-width: 1160px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  .footerLogo {
    margin: 0;
    font-family: $serif;
    font-size: 16px;
    letter-spacing: 0.2em;
    color: #f2fbfb;
  }
  nav {
    display: flex;
    flex-wrap: wrap;
    gap: clamp(16px, 3vw, 28px);

    a {
      font-size: 12px;
      letter-spacing: 0.16em;
      color: rgba(242, 251, 251, 0.6);
      text-decoration: none;
      transition: color 0.3s;

      &:hover {
        color: $teal-soft;
      }
    }
  }
  .copyright {
    margin: 0;
    font-size: 10.5px;
    letter-spacing: 0.14em;
    color: rgba(242, 251, 251, 0.4);
  }
}

/* ---------- reduced motion ---------- */
@media (prefers-reduced-motion: reduce) {
  .lp *,
  .lp *::before,
  .lp *::after {
    animation: none !important;
    transition: none !important;
  }
  .lp .charTeal,
  .lp .charInk,
  .lp .tagline,
  .lp .lead,
  .lp .chips,
  .lp .heroCta,
  .lp .heroArt,
  .lp .reveal {
    opacity: 1;
    transform: none;
  }
}
```

- [ ] **Step 6: ビルド確認**

```bash
cd /Users/fukasedaichi/git/BoardGameFront/frontend
npm run lint && npm run build
```

Expected: エラー0(この時点で未使用ファイル warning が出ないこと。出た場合は import 漏れではなく「まだ index.tsx から未参照」なのが原因なので、次タスクで解消される旨をログに残す。lint が unused で error になる場合のみ Task 3 と同一コミットにまとめる)

- [ ] **Step 7: コミット**

```bash
cd /Users/fukasedaichi/git/BoardGameFront
git add frontend/src/components/lp frontend/src/styles/lp.module.scss
git commit -m "LP用の部品とスタイルを追加"
```

---

### Task 3: トップページ全面書き換え

**Files:**

- Modify: `frontend/src/pages/index.tsx`(全面書き換え)

**Interfaces:**

- Consumes: Task 2 の `Reveal` / `LeafFall` / `RoomCreateCta` / `lp.module.scss`、Task 1 の `/images/hero.webp` `/images/hero.jpg`

- [ ] **Step 1: `index.tsx` を以下の内容で全面書き換え**

```tsx
import React from "react";
import Head from "next/head";
import { SystemConst } from "../const/next.config";
import styles from "../styles/lp.module.scss";
import Reveal from "../components/lp/Reveal";
import LeafFall from "../components/lp/LeafFall";
import RoomCreateCta from "../components/lp/RoomCreateCta";

const TITLE_SUB = ["セ", "カ", "ン", "ド"];
const TITLE_MAIN: string[][] = [
  ["ワ", "ン", "ナ", "イ", "ト"],
  ["人", "狼"],
];

const STATS = [
  { label: "PLAYERS", value: "3〜8", unit: "人", caption: "プレイ人数" },
  { label: "TIME", value: "約10", unit: "分", caption: "1プレイの時間" },
  { label: "SETUP", value: "約1", unit: "分", caption: "準備にかかる時間" },
  { label: "AGE", value: "10", unit: "歳以上", caption: "対象年齢" },
];

const STEPS = [
  {
    num: "壱",
    color: "#35A8B4",
    title: "くばる",
    text: "役職カードを1枚ずつ伏せて配り、余りの2枚は場の中央へ。自分の正体は、自分だけがそっと確認します。",
  },
  {
    num: "弐",
    color: "#17454F",
    title: "ねむる",
    text: "全員が目を閉じる、一度きりの夜。人狼は仲間を確かめ、占い師や怪盗が、闇のなかでひそかに動きます。",
  },
  {
    num: "参",
    color: "#C4646E",
    title: "はなす",
    text: "朝が来たら議論の時間。名乗り、かまをかけ、嘘を見抜く。記憶と証言が交錯する数分間です。",
  },
  {
    num: "肆",
    color: "#E88F94",
    title: "ゆびさす",
    text: "「せーの」で一斉に投票。最多票の人物が追放され、勝敗が決まります。──その指は、正しかったのか。",
  },
];

type Camp = "wolf" | "village" | "third";
const CAMP_LABEL: Record<Camp, string> = {
  wolf: "人狼陣営",
  village: "村人陣営",
  third: "第三陣営",
};

const ROLES: {
  glyph: string;
  camp: Camp;
  name: string;
  text: string;
}[] = [
  {
    glyph: "狼",
    camp: "wolf",
    name: "人狼",
    text: "正体を隠し、夜をやり過ごす闇の住人。仲間と目配せを交わし、村人のふりをして議論を欺きます。",
  },
  {
    glyph: "占",
    camp: "village",
    name: "占い師",
    text: "夜、誰かひとりの正体か、中央の2枚をのぞき見る。真実にもっとも近く、もっとも疑われる者。",
  },
  {
    glyph: "盗",
    camp: "village",
    name: "怪盗",
    text: "夜、誰かと役職をすり替えられる。朝を迎えたとき、あなたは本当に「あなた」のままですか。",
  },
  {
    glyph: "村",
    camp: "village",
    name: "村人",
    text: "能力は持たない。あるのは言葉と観察眼だけ。それでも議論の中心に立つのは、いつも村人です。",
  },
  {
    glyph: "狂",
    camp: "wolf",
    name: "狂人",
    text: "人狼の勝利を望む人間。占い師を騙り、場をかき乱す。嘘をつくほど輝く、愉快な裏切り者。",
  },
  {
    glyph: "吊",
    camp: "third",
    name: "吊人",
    text: "追放されたとき、ただひとり勝利する。疑われるために振る舞う、すべてを裏返す逆転の役職。",
  },
];

const CAMP_CLASS: Record<Camp, string> = {
  wolf: styles.roleWolf,
  village: styles.roleVillage,
  third: styles.roleThird,
};

export default function Homepage() {
  return (
    <>
      <Head>
        <meta
          name="google-site-verification"
          content="PL4mFXSOkoRJNiMOigMC2VmfdZ3X3nOMzuvZmMPmbmc"
        />
        <meta name="title" content="セカンドワンナイト人狼" />
        <meta
          name="description"
          content="ブラウザで遊べる正体隠匿ゲーム「セカンドワンナイト人狼」。役職が選べて1プレイ約10分。GM不要・脱落なしで、はじめての人ともすぐ遊べます。"
        />
        <meta
          name="keywords"
          content="人狼ゲーム,ブラウザゲーム,セカンドワンナイト人狼,オンライン,ボードゲーム,ワンナイト人狼"
        />
        <meta property="og:url" content={SystemConst.Server.SITE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="セカンドワンナイト人狼" />
        <meta property="og:site_name" content="セカンドワンナイト人狼" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@2d7rqU5gFQ6VpGo" />
        <meta
          property="og:image"
          content={SystemConst.Server.SITE_URL + "/images/hero.jpg"}
        />
        <meta
          property="og:description"
          content="ブラウザで遊べる正体隠匿ゲーム「セカンドワンナイト人狼」。役職が選べて1プレイ約10分。"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;600;700&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <title>セカンドワンナイト人狼</title>
      </Head>
      <style jsx global>
        {`
          html,
          body {
            background-color: #effdfe;
            scroll-behavior: smooth;
          }
        `}
      </style>

      <main className={styles.lp}>
        {/* ヒーロー */}
        <section id="hero" className={styles.hero}>
          <LeafFall />
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <p className={styles.heroEyebrow}>
                SECOND ONE NIGHT WEREWOLF ─ 正体隠匿ボードゲーム
              </p>
              <h1 className={styles.heroTitle}>
                <span className={styles.titleSub}>
                  {TITLE_SUB.map((ch, i) => (
                    <span
                      key={i}
                      className={styles.charTeal}
                      style={{
                        animationDelay: `${0.15 + i * 0.09}s`,
                      }}
                    >
                      {ch}
                    </span>
                  ))}
                </span>
                <span className={styles.titleMain}>
                  {TITLE_MAIN.map((word, wi) => (
                    <span key={wi} className={styles.titleWord}>
                      {word.map((ch, i) => (
                        <span
                          key={i}
                          className={styles.charInk}
                          style={{
                            animationDelay: `${
                              wi === 0 ? 0.62 + i * 0.1 : 1.16 + i * 0.14
                            }s`,
                          }}
                        >
                          {ch}
                        </span>
                      ))}
                    </span>
                  ))}
                </span>
              </h1>
              <p className={styles.tagline}>─夜は、二人おとずれる。</p>
              <p className={styles.lead}>
                たった一晩の、嘘と推理。配られた正体はあなただけの秘密。時計の針がひとめぐりする前に、この村に潜む人狼を見つけ出せるか──。
              </p>
              <div className={styles.chips}>
                <span className={styles.chip}>3〜8人</span>
                <span className={styles.chip}>1プレイ 約10分</span>
                <span className={styles.chip}>10歳以上</span>
              </div>
              <div className={styles.heroCta}>
                <RoomCreateCta />
              </div>
            </div>
            <div className={styles.heroArt}>
              <div aria-hidden="true" className={styles.heroGlow}></div>
              <div aria-hidden="true" className={styles.heroRing1}></div>
              <div aria-hidden="true" className={styles.heroRing2}></div>
              <div aria-hidden="true" className={styles.heroHand}>
                <div></div>
              </div>
              <div className={styles.heroImgWrap}>
                <picture>
                  <source srcSet="/images/hero.webp" type="image/webp" />
                  <img
                    src="/images/hero.jpg"
                    alt="昼と夜に分かたれた時計の円環の中、紅葉の舞う空をみつめる少女のイラスト"
                    className={styles.heroImg}
                  />
                </picture>
              </div>
            </div>
          </div>
          <div aria-hidden="true" className={styles.scrollCue}>
            <span>SCROLL</span>
            <span className={styles.cueLine}>
              <span></span>
            </span>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className={styles.about}>
          <div className={styles.aboutInner}>
            <Reveal className={styles.sectionHead}>
              <p className={`${styles.eyebrow} ${styles.aboutEyebrow}`}>
                ABOUT
              </p>
              <h2 className={styles.sectionTitle}>
                一夜のあいだに、すべてが決まる。
              </h2>
              <div className={styles.divider}></div>
            </Reveal>
            <Reveal delay="0.1s">
              <p className={styles.aboutLead}>
                配られた役職カードは、自分だけがそっと確認。全員が目を閉じる「夜」を越えたら、短い議論と一度きりの投票で人狼をあばき出す──。ゲームマスター不要・脱落者なし、はじめての人ともすぐに遊べるワンナイト人狼です。
              </p>
            </Reveal>
            <div className={styles.statGrid}>
              {STATS.map((stat, i) => (
                <Reveal key={stat.label} delay={`${0.05 + i * 0.07}s`}>
                  <div className={styles.statCard}>
                    <p className={styles.statLabel}>{stat.label}</p>
                    <p className={styles.statValue}>
                      {stat.value}
                      <span>{stat.unit}</span>
                    </p>
                    <p className={styles.statCaption}>{stat.caption}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* HOW TO PLAY */}
        <section id="howto" className={styles.howto}>
          <div className={styles.howtoInner}>
            <Reveal className={styles.sectionHead}>
              <p className={`${styles.eyebrow} ${styles.howtoEyebrow}`}>
                HOW TO PLAY
              </p>
              <h2 className={styles.sectionTitle}>
                遊び方は、たったの四手順。
              </h2>
              <div className={styles.divider}></div>
            </Reveal>
            <div className={styles.stepGrid}>
              {STEPS.map((step, i) => (
                <Reveal key={step.num} delay={`${0.05 + i * 0.08}s`}>
                  <div className={styles.stepCard}>
                    <p className={styles.stepNum} style={{ color: step.color }}>
                      {step.num}
                    </p>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ROLES */}
        <section id="roles" className={styles.roles}>
          <div aria-hidden="true" className={styles.rolesGlowTop}></div>
          <div aria-hidden="true" className={styles.rolesGlowBottom}></div>
          <div className={styles.rolesInner}>
            <Reveal className={styles.sectionHead}>
              <p className={`${styles.eyebrow} ${styles.rolesEyebrow}`}>
                ROLES
              </p>
              <h2 className={`${styles.sectionTitle} ${styles.rolesTitle}`}>
                あなたは今夜、誰になる。
              </h2>
              <div className={`${styles.divider} ${styles.rolesDivider}`}></div>
            </Reveal>
            <div className={styles.roleGrid}>
              {ROLES.map((role, i) => (
                <Reveal key={role.name} delay={`${0.05 + i * 0.06}s`}>
                  <div
                    className={`${styles.roleCard} ${CAMP_CLASS[role.camp]}`}
                  >
                    <div className={styles.roleHead}>
                      <span className={styles.roleGlyph}>{role.glyph}</span>
                      <span className={styles.roleCamp}>
                        {CAMP_LABEL[role.camp]}
                      </span>
                    </div>
                    <h3>{role.name}</h3>
                    <p>{role.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="cta" className={styles.cta}>
          <div aria-hidden="true" className={styles.ctaRing1}></div>
          <div aria-hidden="true" className={styles.ctaRing2}></div>
          <div className={styles.ctaInner}>
            <Reveal>
              <p className={`${styles.eyebrow} ${styles.ctaEyebrow}`}>
                PLAY NOW
              </p>
            </Reveal>
            <Reveal delay="0.08s">
              <h2 className={styles.ctaTitle}>さあ、二度目の夜へ。</h2>
            </Reveal>
            <Reveal delay="0.16s">
              <p className={styles.ctaLead}>
                紅葉の散る夜、時計の針がもうひとめぐり。
                <br />
                あなたの村に、人狼は潜んでいるか。
              </p>
            </Reveal>
            <Reveal delay="0.24s">
              <RoomCreateCta invert />
            </Reveal>
          </div>
        </section>

        {/* フッター */}
        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <p className={styles.footerLogo}>セカンドワンナイト人狼</p>
            <nav>
              <a href="#about">ゲーム概要</a>
              <a href="#howto">遊び方</a>
              <a href="#roles">役職紹介</a>
              <a href="#cta">あそぶ</a>
            </nav>
            <p className={styles.copyright}>© 2026 SECOND ONE NIGHT WEREWOLF</p>
          </div>
        </footer>
      </main>
    </>
  );
}
```

注意点:

- 旧 index.tsx の `google-site-verification` メタは必ず引き継ぐ(上記に含めてある)
- 旧ページのパララックス(`scrollEvent`)・`Background`・`Socialbtn`・`CreateGameBtn` の import は削除
- 素材クレジット(ノーコピーライトガール様)はヒーロー画像が変わるため削除。ただしゲーム内画像で引き続き使用しているため、クレジット継続が必要なら `/werewolf/[roomId]` 側は現状維持(このタスクでは触らない)

- [ ] **Step 2: lint / build 確認**

```bash
cd /Users/fukasedaichi/git/BoardGameFront/frontend
npm run lint && npm run build
```

Expected: error 0、新規 warning 0

- [ ] **Step 3: dev サーバで表示確認**

```bash
cd /Users/fukasedaichi/git/BoardGameFront/frontend
npm run dev
```

ブラウザで `http://localhost:3000` を開き確認:

1. ヒーローの文字アニメ・落ち葉・時計の針・画像マスクが表示される
2. 「今すぐ遊ぶ」→ スピナー表示 → URL表示 → 「URLをコピー」でクリップボードにURL、「入室する」で `/werewolf/{roomId}` に遷移(本番 Heroku 接続。初回はスリープ解除で数十秒かかる場合あり)
3. 「遊び方を見る」で `#howto` にスムーススクロール
4. スクロールで ABOUT 以降のカードが順に reveal される
5. モバイル幅(375px)で横スクロールが発生しない

- [ ] **Step 4: コミット**

```bash
cd /Users/fukasedaichi/git/BoardGameFront
git add frontend/src/pages/index.tsx
git commit -m "トップページをセカンドワンナイト人狼LPに刷新"
```

---

### Task 4: /secret/ 隠しページ作成と旧トップ資産の整理

**Files:**

- Create: `frontend/src/pages/secret/index.tsx`
- Create: `frontend/src/styles/secret.module.scss`
- Modify: `frontend/src/components/home/creategamebtn.tsx:62-63`(URL生成を `location.origin` 基準に修正)
- Delete: `frontend/src/components/home/background.tsx`(旧トップ専用・他から未参照)
- Delete: `frontend/src/styles/homepage.module.scss`(旧トップ専用・他から未参照)

**Interfaces:**

- Consumes: 既存 `CreateGameBtn`(`{ title, discription, imgUrl, gameId }`)

- [ ] **Step 1: `creategamebtn.tsx` のURL生成バグ修正**

現状の `location.href + game + '/' + resJson.roomId` はトップ(`/`)以外に置くと壊れる(`/secret` 配下では `https://site/secrettimebomb/xxx` になる)。以下に修正:

```tsx
// 修正前(59-64行目)
const roomUrlDom = document.querySelector(
  "#" + props.gameId + "_url",
) as HTMLElement;
roomUrlDom.innerText = location.href + game + "/" + resJson.roomId;

// 修正後
const roomUrlDom = document.querySelector(
  "#" + props.gameId + "_url",
) as HTMLElement;
roomUrlDom.innerText = location.origin + "/" + game + "/" + resJson.roomId;
```

- [ ] **Step 2: `secret.module.scss` を作成**

```scss
.secret {
  min-height: 100vh;
  padding: 60px 20px 80px;
  background: #142f37;
  color: #f2fbfb;

  h1 {
    margin: 0;
    text-align: center;
    font-size: 22px;
    letter-spacing: 0.3em;
    font-weight: 500;
  }

  > p {
    margin: 16px auto 0;
    max-width: 34em;
    text-align: center;
    font-size: 12.5px;
    line-height: 2;
    color: rgba(242, 251, 251, 0.65);
  }
}

.list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  margin-top: 40px;
}
```

- [ ] **Step 3: `pages/secret/index.tsx` を作成**

```tsx
import React from "react";
import Head from "next/head";
import CreateGameBtn from "../../components/home/creategamebtn";
import styles from "../../styles/secret.module.scss";

export default function SecretPage() {
  return (
    <>
      <Head>
        <title>hidden games</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <main className={styles.secret}>
        <h1>HIDDEN GAMES</h1>
        <p>
          ここは非公開のあそび場です。このページのURLは、そっと胸にしまっておいてください。
        </p>
        <div className={styles.list}>
          <CreateGameBtn
            title="タイムボム"
            discription="ゲームデザイナー佐藤雄介様の手がけたあの名作「タイムボム」!(非公式)"
            imgUrl="/images/background.jpg"
            gameId="timebomb"
          />
          <CreateGameBtn
            title="ハイドアウト"
            discription="あの名作タイムボムの次回作!(非公式)"
            imgUrl="/images/hideout/hideoutbackground.png"
            gameId="hideout"
          />
          <CreateGameBtn
            title="エセ芸術家ニューヨークへ行く"
            discription="お絵描き人狼(非公式)"
            imgUrl="/images/fakeartist/fakeartistbackground.png"
            gameId="fakeartist"
          />
        </div>
      </main>
    </>
  );
}
```

- [ ] **Step 4: 旧トップ専用ファイルを削除**

```bash
cd /Users/fukasedaichi/git/BoardGameFront/frontend/src
grep -rn "home/background\|homepage.module" pages components  # ヒット0を確認してから削除
git rm components/home/background.tsx styles/homepage.module.scss
```

Expected: grep がヒット0(Task 3 で index.tsx から参照が消えている)

- [ ] **Step 5: lint / build / dev 確認**

```bash
cd /Users/fukasedaichi/git/BoardGameFront/frontend
npm run lint && npm run build
```

dev サーバで `http://localhost:3000/secret` を開き確認:

1. noindex メタが出力されている(view-source で `<meta name="robots" content="noindex, nofollow"/>`)
2. 3ゲームのカードが表示され、クリックでルーム作成 → URL が `http://localhost:3000/timebomb/xxxx` 形式(`/secret` が混入しない)
3. 「URLコピー」「入室」が動作する
4. トップページのどこにも /secret へのリンクが無い

- [ ] **Step 6: コミット**

```bash
cd /Users/fukasedaichi/git/BoardGameFront
git add -A frontend/src
git commit -m "他ゲームの入口を/secretの隠しページに移設"
```

---

### Task 5: ドキュメント更新と完了ゲート

**Files:**

- Modify: `docs/architecture/frontend.md`(ページ構成の説明を現状に合わせる)
- Delete: `docs/plans/lp-redesign.md`(完了時。マージ後でよい)

- [ ] **Step 1: `docs/architecture/frontend.md` を更新**

実際のファイルを読み、ページ構成に触れている箇所を以下の事実に合わせて修正する(該当記述がなければ「ページ構成」節を追加):

- `pages/index.tsx` はセカンドワンナイト人狼専用のLP(部品は `src/components/lp/`、スタイルは `styles/lp.module.scss`)。ヒーローと下部CTAの `RoomCreateCta` が `GET {AP_HOST}createroom/werewolf` でルームを作成する
- `pages/secret/index.tsx` は非公開のゲーム一覧(timebomb / hideout / fakeartist)。`noindex, nofollow`。トップからリンクしない
- 旧トップ用の `components/home/background.tsx` / `styles/homepage.module.scss` は削除済み。`components/home/creategamebtn.tsx` は /secret 専用の部品になった

- [ ] **Step 2: 完了ゲートを実行**

```bash
cd /Users/fukasedaichi/git/BoardGameFront/frontend
npm test && npm run lint && npm run build
```

Expected: すべて成功(test は既存の reducer / 通信層テストが全パス)

- [ ] **Step 3: 本番 Heroku 接続で最終動作確認**

`npm run dev` でブラウザ2タブ確認:

1. トップの「今すぐ遊ぶ」でルーム作成 → タブ1で入室 → タブ2で同URLに入室 → werewolf のゲーム開始まで進むこと
2. `/secret` からタイムボムのルーム作成 → 2タブで入室できること

- [ ] **Step 4: ドキュメントをコミット**

```bash
cd /Users/fukasedaichi/git/BoardGameFront
git add docs/architecture/frontend.md
git commit -m "frontend.mdにLPと隠しページの構成を反映"
```

- [ ] **Step 5: 完了報告**

検証結果(確認した項目・スクリーンショット)をまとめてユーザーに報告し、PR作成の指示を待つ(**push / PR はユーザー指示があるまで行わない**)。マージ後にこの計画書を削除する。
