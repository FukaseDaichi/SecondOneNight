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
    types.ts           #   State / Action / ペイロード型
    use<Game>Room.ts   #   useReducer + useGameSocket + 副作用(useEffect)
    components/        #   ゲーム固有 UI
  lib/stomp/           # useGameSocket(共通 STOMP 接続フック)
  components/common/   # 2ゲーム以上で使う共通 UI(RoomInForm、ConnectionStatus 等)
  components/          # レイアウト・汎用部品
  pages/<game>/[roomId].tsx  # 薄い入り口のみ(フック呼び出し + レイアウト組み立て)
  styles/components/<game>/  # scss(Stage 4 まで移動しない)
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
- サーバペイロードの詳細型は Stage 4(strict 化)まで `any` 許容。state のトップレベル形状は types.ts に明示する
