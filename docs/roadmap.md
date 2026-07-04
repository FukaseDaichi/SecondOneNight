# ロードマップ — future 残タスク

この文書は**これから行う作業だけ**を置く。完了済みの変更履歴は git / PR に任せ、必要な現在仕様は `docs/architecture/` と `docs/design.md` に反映する。

このリポジトリは future 側として扱う。安定運用・本番反映を担う main リポジトリとは分け、future では次期 UI、設計整理、モダナイズを進める。

## 現在のコード確認

| 項目 | コード上の現状 | 残タスク |
| --- | --- | --- |
| ルーティング | `frontend/src/pages/` が現役。`frontend/src/app/` は未導入 | App Router 移行 |
| TypeScript | `frontend/tsconfig.json` は `strict: false`、`allowJs: true` | strict 化、サーバペイロード型の具体化 |
| ESLint | `no-explicit-any` は warning、`no-img-element` は off | `any` 削減後に rule を強化 |
| STOMP | 全ゲームが `useGameSocket` 経由。topic / destination は既存互換 | 契約を変える場合のみ frontend / backend / docs を同時更新 |
| werewolf | LP、6桁ルームコード、退出/キック、カスタムアイコン、待機/終了 UI、勝利演出は実装済み | ゲーム中画面の UI 統一 |
| decrypt | hook に制限時間系送信口があるが、画面からは使っていない。`DecryptRoom` は `LimitTimeInterface` 未実装 | 使うなら backend 対応、使わないなら hook から削除 |
| CSS | `_app.tsx` が `bootstrap.min.css` を import。`row` / `d-flex` / `container` の使用が残る | Bootstrap 依存の削減 |
| SCSS 配置 | ゲーム別 SCSS は `frontend/src/styles/components/<game>/` 配下 | feature 配下へ寄せるか判断 |
| DOM 直接操作 | modal、icon menu、fakeartist canvas、timebomb/werewolf/hideout の一部に `document.*` が残る | React state / ref へ段階移行 |
| 重複・命名 | `countdownclock.tsx` と `clock/countdownClock.tsx` が併存。`sosialbtn` / `caroucel` など旧綴りが残る | 統合・リネーム |
| ページ分割 | `index.tsx` 451行、`werewolf/[roomId].tsx` 273行、`fakeartist/[roomId].tsx` 252行 | 画面単位コンポーネントへ追加分割 |

## 今後やること

1. リポジトリ運用を main / future の2本に整理する
   - main は安定版・本番反映用、future は次期開発用にする。
   - 本番 Vercel / Heroku へ接続するのは main 側に限定する。
   - future の成果を取り込む時は、契約変更と検証結果を確認して main へ昇格する。

2. App Router へ移行する
   - ゲームページはクライアント主体なので、必要な入口に `'use client'` を付ける。
   - 既存 URL と roomId 取得の互換性を保つ。

3. TypeScript strict 化を進める
   - `strict: true` へ切り替え、型エラーを解消する。
   - `SocketInfo.obj` とゲーム別 Room payload の `any` を具体化する。
   - `no-explicit-any` を warning から error に上げられる状態を目指す。

4. DOM 直接操作を整理する
   - modal / body class / chat scroll / icon menu / fakeartist canvas の境界を確認する。
   - 表示制御は state / props / ref から導出する。
   - canvas など imperative API が必要な箇所は、ref と小さな helper に閉じ込める。

5. CSS とコンポーネントを整理する
   - Bootstrap utility の実使用を洗い出し、自前 CSS へ置き換える。
   - `countdownclock` の重複を統合する。
   - `sosialbtn` / `caroucel` などの旧綴りを、import 追従込みで整理する。
   - ゲーム固有 SCSS を feature 側へ移すか判断する。

6. werewolf のゲーム中画面をデザインシステムへ寄せる
   - 待機/終了画面で入った `tokens.scss`、`PhaseBackground`、`SakuraParticles`、`VictoryOverlay` の方向性を、役職選択・議論・投票画面にも広げる。
   - 通信契約と reducer の挙動は維持する。

7. decrypt の制限時間機能を決める
   - 実装する場合は `DecryptRoom` を `LimitTimeInterface` に対応させ、UI と reducer も追加する。
   - 実装しない場合は `useDecryptRoom` の未使用送信口を削除する。

8. future から main へ昇格する検証を定義する
   - frontend: `npm test && npm run lint && npm run build`
   - backend: Java 11 環境で `./mvnw test`
   - 手動確認: 本番相当バックエンド接続で、公開 werewolf と `/secret` の各ゲームのルーム作成・入室・主要進行を確認する。
