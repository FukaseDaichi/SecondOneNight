# Stage 3: ゲームごとの構造リファクタ(reducer化 + コンポーネント分割)設計書

作成日: 2026-07-04
親設計: `docs/superpowers/specs/2026-07-03-frontend-modernization-design.md`(Stage 3)

## 背景と現状

Stage 2 完了時点(PR #81 マージ済み)で、全5ゲームは共通フック `useGameSocket` 経由で通信しているが、各ゲームは依然として1枚の god component(`pages/<game>/[roomId].tsx`)のままである。

| ゲーム | 行数 | 受信ハンドラ | useState数 | 特記すべき副作用 |
|---|---|---|---|---|
| hideout | 465 | `getMessage` + `dataSet` | 18 | チャット scrollTop、roominbtn classList |
| decrypt | 525 | `getMessage` + `dataSet` | 13 | 同上系 |
| timebomb | 638 | `receve` | 15 | `body.classList`(modal_active)、scrollTo、DOM直読み input |
| werewolf | 1007 | `getMessage` + `dataSet` | 24 | `new Audio('/se/snip.mp3')` 再生、カウンタDOM直接操作、scrollTop |
| fakeartist | 1076 | `getMessage` + `dataSet` | 18 | canvas 直接操作、ヘッダDOM操作、多数の setTimeout |

受信ハンドラは status コードの巨大 switch で、setter 呼び出し・DOM 直接操作・タイマー・音声再生が混在している。stale closure(コールバック内の `messageList.concat` 等)も残存する。自動テストは通信層(useGameSocket)のみで、状態遷移ロジックはテストされていない。

## ゴールと非ゴール

### ゴール

1. 各ゲームの受信処理を**純粋関数の reducer** に変換し、ユニットテストで状態遷移を網羅する
2. god component を分割し、ページを**薄い入り口**(目安 100 行以下)にする
3. DOM 直接操作・stale closure 等のアンチパターンを React の状態管理に置換する

### 非ゴール

- バックエンド変更(通信仕様は現状維持)
- UI/UX の刷新(見た目・ゲームの流れは維持。明確なバグ修正のみ許容し記録する)
- 5ゲーム間の reducer 共通化(まず同じ形に揃える。共通化の判断は Stage 4 以降)
- scss ファイルの移動・命名整理(Stage 4)
- App Router 移行・TS strict 化(Stage 4)

## 決定事項(要件ヒアリング結果)

| 項目 | 決定 |
|---|---|
| スコープ | 元設計どおり「reducer化 + コンポーネント分割」の両方 |
| アプローチ | 案A: ゲームごとに独立した reducer + カスタムフック(共通基盤や外部ストアは採用しない) |
| 作業ブランチ | `feature/stage3-structure`(master から作成済み) |
| PR 単位 | Stage 3 全体で1本 |
| ブランチ整理 | マージ済み refactor/* および古い develop は削除済み(2026-07-04 実施) |

## アーキテクチャ

### ディレクトリ構造(1ゲームあたり、5ゲーム同構造)

```
src/
  features/
    hideout/
      components/        # 既存 src/components/hideout/* から移動 + ページから切り出したUI
      useHideoutRoom.ts  # useReducer + useGameSocket + 副作用(useEffect)を束ねるフック
      reducer.ts         # 純粋関数 ★ユニットテスト対象
      types.ts           # State / Action / サーバペイロードの型
  pages/
    hideout/[roomId].tsx # 薄い入り口(フック呼び出し + レイアウト組み立てのみ)
```

- scss(`src/styles/components/<game>/`)は移動しない。import パスの張り替えのみで diff を最小化する
- ゲーム間で共有するのは既存の `SocketInfo` 型と `useGameSocket` のみ。reducer・型はゲームごとに独立させ、ゲーム間の差異を無理に抽象化しない
- 共通 UI(Layout、ChatComponent、ConnectionStatus、Socialbtn、モーダル等)は `src/components/` に残す
- 既存のゲーム別コンポーネント(`src/components/<game>/`)は `features/<game>/components/` へ `git mv` で移動する(履歴維持)

### reducer とアクションの形

```ts
// 例: hideout
type HideoutAction =
    | { type: 'message'; payload: SocketInfo }   // サーバ受信(payload.status で分岐)
    | { type: 'dismissStart' }                   // ローカルUI操作(タイマー・閉じる等)
    | { type: 'closeRushArea' }
    | { type: 'systemMessage'; text: string };   // 通信エラー表示等

const reducer = (state: HideoutState, action: HideoutAction): HideoutState
```

- 現在の `getMessage`/`receve` の switch と `dataSet` の代入群を、そのまま `type: 'message'` の処理に写す。**状態遷移ロジックは挙動維持**とし、1メッセージにつき state 更新1回になる(現状は `dataSet` だけで setter 9連打、case によってはさらに追加)
- ゲームごとに乱立する useState(13〜24個)は1つの state オブジェクトに統合する
- 「受信で立ててタイマーで下ろす」フラグ(startFlg 等)は、受信時に reducer が立て、フック内の useEffect が時間経過後にローカルアクション(`dismissStart` 等)を dispatch して下ろす
- 未知の status は state を変更しない(現状の `default: console.log` 相当。ログはフック側で出す)

### 副作用の分離(reducer は純粋に保つ)

現在受信ハンドラ内に混在している副作用は、すべて「state の変化を監視する useEffect」(フック内)へ移す:

| 現在の副作用 | 移行先 |
|---|---|
| チャット欄の `scrollTop` 直接操作 | `chatList` を監視する useEffect(または ChatComponent 内) |
| `scrollTo(0,0)`・`setTimeout` | 該当フラグを監視する useEffect に統一 |
| werewolf の `new Audio('/se/snip.mp3')` 再生 | 該当 state 変化を監視する useEffect |
| timebomb の `body.classList`(modal_active) | state フラグ + useEffect で body クラスを同期 |
| 入室ボタンの `querySelector(...).classList.add(styles.in)` | reducer が持つ入室済み state から className を導出 |
| fakeartist の canvas 描画 | 受信データを state に置き、canvas への反映は useEffect(描画 API 呼び出しは副作用として維持) |

- stale closure(`messageList.concat` 等)は reducer 化で構造的に解消する。明確なバグ修正として計画書に記録する
- 送信ラッパー(`conect`/`coneect`)の catch は `systemMessage` アクションの dispatch に置換する
- 非制御 input の DOM 直読み(`document.getElementById('username').value` 等)は、切り出した入室フォームコンポーネント内の制御された state に置換する

### ページの薄型化

ページ(`pages/<game>/[roomId].tsx`)の責務は次の3つのみとする:

1. `useRouter` から roomId を取得
2. `use<Game>Room(roomId)` を呼ぶ
3. 返ってきた state と操作関数を feature コンポーネントへ渡してレイアウトを組む

現在ページ内にインラインで書かれている UI ブロック(入室フォーム、ボタン領域、結果モーダル群など)は `features/<game>/components/` に切り出す。

## テスト戦略

- **reducer ユニットテスト(主戦場)**: ゲームごとに全 status コード + 全ローカルアクションを網羅する。例:
  - 「status 300 受信 → startFlg が立ち、勝敗フラグがリセットされ、obj の内容が state に反映される」
  - 「winnerTeam=2 → テロリスト勝利フラグ」
  - 「未知 status → state 不変」
- 既存 switch の挙動をテストで写し取ってから置換する(先にテストを書き、reducer 実装で通す)
- フック(`use<Game>Room`)と UI の網羅テストは書かない(親設計の方針どおり)
- Stage 2 申し送りの `useGameSocket` Minor(enabled=false 時に status が disconnected に戻らない)を修正し、テストを補完する

## 進め方と完了条件

- 順序: **hideout → decrypt → timebomb → werewolf → fakeartist**(行数の少ない順。小さいゲームで型を確立する)
- 各ゲームを2コミットに分割:
  1. 「reducer + フック抽出 + ユニットテスト」(ページはまだ既存構造のまま新フックを使う)
  2. 「コンポーネント分割 + ページ薄型化」
- 各ゲーム完了ごとに `npm test && npm run lint && npm run build` を通し、本番 Heroku 接続で2タブ動作確認(入室 → 開始 → ゲーム固有アクション → 終了)
- 意図的な挙動差分(stale closure 修正、DOM 直接操作の state 化に伴うもの)は計画書の検証記録に残す
- PR は Stage 3 全体で1本(`feature/stage3-structure` → master)。push / PR 作成はユーザー指示があるまで行わない
- 完了条件: 5ゲームすべてで「ページが薄い入り口 + reducer がテスト済み」、テスト・lint・build 全通過、本番接続で5ゲーム動作

## リスクと対策

| リスク | 対策 |
|---|---|
| werewolf / fakeartist(約1000行)の分解で挙動が変わる | 小さいゲームで型を確立してから着手。既存 switch の挙動を reducer テストに写し取ってから置換する |
| useState → 単一 state 統合による再レンダリング特性の変化 | 1メッセージ1更新になり原理的に減る方向。fakeartist は描画メッセージの受信頻度が高いため重点確認 |
| コンポーネント移動(git mv)で import が壊れる | ゲームごとに build + lint をゲートにする |
| 本番 Heroku が落ちている時間帯は検証不可 | reducer テスト・ビルド確認を先行し、接続検証だけ後回しにできる構成にする |
