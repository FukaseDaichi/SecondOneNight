# frontend — エージェント向け作業ガイド

Next.js 15 / React 19 / TypeScript 5 のフロントエンド。アーキテクチャの説明は [docs/architecture/frontend.md](../docs/architecture/frontend.md) を参照。

このファイルは `frontend/CLAUDE.md` から参照される。`frontend/` 配下を触る時だけ必要な規約を書く。モノレポ全体のルールは [../AGENTS.md](../AGENTS.md) を参照。

## 参照ドキュメント

| 目的 | 文書 |
| --- | --- |
| フロント構造・reducer 方針 | [../docs/architecture/frontend.md](../docs/architecture/frontend.md) |
| 通信契約 | [../docs/architecture/communication.md](../docs/architecture/communication.md) |
| ゲーム別 status / state 対応 | [../docs/architecture/games/](../docs/architecture/games/) |
| モダナイズ進捗 | [../docs/roadmap.md](../docs/roadmap.md) |

## コマンド(このディレクトリで実行)

```bash
npm run dev      # 開発サーバ(localhost:3000)
npm test         # Vitest(ユニットテスト)
npm run lint     # ESLint(src 配下)
npm run build    # 本番ビルド
```

- 接続先バックエンドはデフォルトで本番 Heroku。`.env.local` の `NEXT_PUBLIC_AP_HOST` で切り替え(例: `http://localhost:8080/`)

## 完了ゲート(タスク完了時に必ず通すこと)

1. `npm test && npm run lint && npm run build` が全て成功(lint は **error 0**。warning は既存分のみ可、新規を増やさない)
2. 挙動に触れる変更は本番 Heroku 接続で動作確認: `npm run dev` → ブラウザ2タブで「ルーム作成 → 入室 → ゲーム進行」を確認

## ディレクトリ規約

```
src/
  features/<game>/     # ゲームごとの実装(5ゲーム同構造)
    reducer.ts         #   純粋関数。ユニットテスト必須
    reducer.test.ts
    types.ts           #   State / Action(サーバ由来の型は src/type/ から import)
    use<Game>Room.ts   #   useReducer + useGameSocket + 副作用(useEffect)
    components/        #   ゲーム固有 UI
  type/                # サーバ由来のドメイン型(SocketInfo・RoomUserInfo・<Game>User 等)
  lib/stomp/           # useGameSocket(共通 STOMP 接続フック)
  components/common/   # 2ゲーム以上で使う共通 UI(RoomInForm、ConnectionStatus 等)
  components/          # レイアウト・汎用部品
  pages/<game>/[roomId].tsx  # 薄い入り口のみ(フック呼び出し + レイアウト組み立て)
  styles/components/<game>/  # scss(roadmap 5「CSS とコンポーネントを整理する」まで移動しない)
  const/next.config.ts # 接続先などのシステム定数
```

## 実装ルール

- **reducer は純粋に保つ**。副作用(スクロール・タイマー・Audio・canvas・body クラス操作)はフック内の useEffect に分離する
- **通信内容は変更不可**: 送信 destination / payload / 購読 topic は現状維持(timebomb のみ `/topic/{roomId}/timebomb`、他は `/topic/{roomId}`)
- `useGameSocket.send` が payload を `JSON.stringify` する。呼び出し側で stringify しない
- 通信契約や status の意味を変える場合は backend と docs も同じ変更に含める
- DOM 直接操作(`document.querySelector` 等)・非制御 input は追加しない。state から導出する
- ファイル移動は `git mv`(履歴維持)
- Prettier 設定(tabWidth:4 / singleQuote / semi / trailingComma:es5)は変更しない
- テストは reducer と通信層が対象。UI コンポーネントの網羅テストは書かない
- サーバペイロードの詳細型は roadmap 3「TypeScript strict 化を進める」まで `any` 許容。state のトップレベル形状は types.ts に明示する

## 導入スキルの適用範囲

`.agents/skills/` のスキルは外部リポジトリから取り込んだ汎用ガイド(`skills-lock.json` でハッシュ固定)。取り込み元との差分になるのでスキル本体は編集しない。本リポジトリのスタックと食い違う部分は、このファイルと `docs/design.md` を優先する。

- `baseline-ui` は Tailwind CSS / `cn`(clsx + tailwind-merge)/ `motion/react` / Base UI・Radix 前提。いずれも未導入で、本リポジトリは SCSS Modules。クラス名前提の規約(`h-dvh`・`size-*`・`z-*`・`truncate`)は考え方だけ読み替える(例: `h-screen` 禁止 → `100vh` ではなく `100dvh` を使う)
- `baseline-ui` の「gradient を使わない」「letter-spacing を変えない」は `docs/design.md` のデザイン言語(teal↔rose のグラデーション、広い letter-spacing)と衝突する。LP / werewolf では `docs/design.md` が正
- `vercel-react-best-practices` の `server-` 系(RSC・Server Actions・`after()`・`React.cache`)と Suspense 前提の `async-` 系は App Router 向け。本リポジトリは Pages Router(`src/pages/`)なので対象外。`js-` / `rerender-` / `bundle-` 系は有効
- アニメーションの採否は `frontend-design`(モーションを積極的に設計する)を優先し、`baseline-ui` の「明示要求がない限り追加しない」は採らない。ただし実装手段の制約(compositor プロパティのみ・レイアウトプロパティを animate しない・`prefers-reduced-motion` を尊重・大面積の blur を避ける)は `baseline-ui` / `fixing-motion-performance` に従う
- `web-design-guidelines` はレビューのたびに外部 URL(`raw.githubusercontent.com`)からガイドラインを取得する。取得に失敗した場合はレビュー結果を出さず、失敗した旨を伝える(記憶で代用しない)
