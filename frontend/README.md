# セカンドワンナイト人狼　frontend

Next.js / React / TypeScript で作られたフロントエンドです。5つのゲーム画面、ルーム入室、チャット、STOMP 接続、ゲームごとの UI 状態管理を担当します。

## 技術スタック

| 種別 | 内容 |
| --- | --- |
| Framework | Next.js 15(Pages Router) |
| UI | React 19 |
| Language | TypeScript 5 |
| Test | Vitest |
| Realtime | `@stomp/stompjs` + `sockjs-client` |
| Style | SCSS modules |

## 起動

```bash
npm install
npm run dev
```

開発サーバは http://localhost:3000 で起動します。

デフォルトでは本番バックエンド `https://boardgameap.herokuapp.com/` に接続します。ローカルバックエンドへ向ける場合は `.env.local` を作成します。

```env
NEXT_PUBLIC_AP_HOST=http://localhost:8080/
```

## よく使うコマンド

```bash
npm test       # reducer / useGameSocket のユニットテスト
npm run lint   # ESLint
npm run build  # 本番ビルド
```

## 主要ディレクトリ

| パス | 内容 |
| --- | --- |
| `src/pages/<game>/[roomId].tsx` | ゲーム画面の入口 |
| `src/features/<game>/` | ゲームごとの state / hook / UI |
| `src/lib/stomp/` | 共通 STOMP 接続 |
| `src/components/common/` | 複数ゲームで使う共通 UI |
| `src/styles/components/<game>/` | ゲームごとの SCSS modules |
| `src/type/` | ゲーム横断・一部ゲーム固有の型 |

## 実装を読む入口

ゲーム画面を追う時は、まず `src/pages/<game>/[roomId].tsx` を開き、次に `src/features/<game>/use<Game>Room.ts` と `reducer.ts` を見ると流れを掴みやすいです。

```text
page -> use<Game>Room -> useGameSocket -> reducer -> components
```

通信先や status の意味はコードだけだと追いづらいため、設計書も一緒に見るのがおすすめです。

| 目的 | ドキュメント |
| --- | --- |
| フロント構造 | [../docs/architecture/frontend.md](../docs/architecture/frontend.md) |
| 通信契約 | [../docs/architecture/communication.md](../docs/architecture/communication.md) |
| ゲーム別状態・status | [../docs/architecture/games/](../docs/architecture/games/) |
| 作業時の規約 | [AGENTS.md](AGENTS.md) |

