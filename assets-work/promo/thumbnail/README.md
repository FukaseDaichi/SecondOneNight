# YouTube Shorts サムネイル

## 採用

ユーザー選定(2026-10-20): **thumb-2**(元 PNG を保持)。`best.jpg` は thumb-2 の JPEG 化(1080×1920、758KB)で、YouTube に設定するのはこれ。不採用の thumb-1 / thumb-3、プレビュー画像・HTML、検証 JSON は削除済み。以下の「採用案」「選定理由」は Codex 生成時の記録(thumb-1 推奨)で、採用結果とは異なる。

文字・背景・モチーフをすべて内蔵 imagegen で生成。コードによる描画・文字合成なし。Pillow はリサイズ、形式変換、寸法・容量検証のみに使用。

## 成果物

- `thumb-1.png`：巨大な「暗殺」と右下の月・狼。採用案。
- `thumb-2.png`：右上に大きな月、左下に狼。主文を横へ展開。
- `thumb-3.png`：左上の月・狼と、右側を回り込む水彩の弧。
- `best.jpg`：案1の JPEG。YouTube 用。
- `preview.html`：3案の比較。幅180pxの表示と、幅360pxの詳細を各案で並置。画像クリックで原寸表示。
- `preview-{1,2,3}-180.png`：180×320 の縮小確認用画像。
- `verification.json`：best の寸法・バイト数の実測記録。
- `README.md`：プロンプト全文と検証記録。

## 文字・構図の確認

参考3画像を最初に view_image で確認し、docs/design.md を読んでから生成。OGP の女性キャラクターは描いていない。

各案の1080×1920画像を view_image で拡大確認し、180×320の実画像も view_image で確認した。目視による確認。

| 案 | メインコピー | ゲーム名 | 余計な文字 | 幅180pxで「暗殺」 | 生成回数 |
| --- | --- | --- | --- | --- | --- |
| 1 | 議論中に暗殺される！？：全11字一致 | セカンドワンナイト人狼：全11字一致 | なし | 読める | 1 |
| 2 | 議論中に暗殺される！？：全11字一致 | セカンドワンナイト人狼：全11字一致 | なし | 読める | 1 |
| 3 | 議論中に暗殺される！？：全11字一致 | セカンドワンナイト人狼：全11字一致 | なし | 読める | 1 |

句読点も「！？」の順で確認。ゲーム名の改行は案1が1行、案2・3が「セカンド／ワンナイト人狼」。再生成を要する文字崩れはなかった。

メインコピーのブロックは各案とも画面幅の約90%以上。夜色背景、ローズの「暗殺」、アイボリーの縁・暗い影で視認性を確保。弾痕は各案1つ。血・死体・牙・ホラー顔・3Dベベルなし。

ゲーム名の文字下端は目視で案1が約83%、案2が約84%、案3が約80%の高さ。下端までそれぞれ約17%、16%、20%を残しており、指定の15%以上を満たす（装飾の下線は文字位置に含めない）。

## best 選定・ファイル検証

採用は案1。ローズの「暗殺」を2文字だけの大きな行にし、180px幅でも主題が瞬時に伝わる。コピーを上段・中央・下段へ順に読めて、月と狼はその下で世界観を補強する。案2より「暗殺」が大きく、案3より主文の開始位置が高い。ゲーム名も横1行でまとまっている。

- 寸法：**1080×1920 px**（9:16）
- 容量：**662,022 バイト**（`os.path.getsize` 実測、2,000,000 バイト未満）
- JPEG 品質：90、RGB、optimize / progressive 有効
- PNG 3案もそれぞれ1080×1920 px
- imagegen 出力の元寸法は各941×1672 px。Pillow LANCZOS で1080×1920へリサイズした。文字・構図の合成や描き足しは一切していない。

## imagegen プロンプト全文

各案は新規生成。参考画像は生成前に目視確認し、その特徴を以下のプロンプトに記述した。内蔵ツールが自動保存する生成元ファイルを読み、指定ディレクトリに最終成果物を保存した。

### 案1：生成1回目

```text
Use case: ads-marketing
Create one finished Japanese YouTube Shorts thumbnail, portrait 9:16, target 1080×1920. All lettering must be generated inside the image, never placeholders. Premium Japanese watercolor and bold brush lettering, quiet village mystery. Night background #142f37, teal #7fd0d6 and rose #e88f94 watercolor with ivory outlines, washi texture, restrained seigaiha waves and petals. Match the previously inspected brand reference: hand-painted howling wolf silhouette, moon, teal-to-rose watercolor, ivory-edged Japanese brush typography. No humans or third-party female character.
ONLY two text strings may appear, exactly:
「議論中に暗殺される！？」
「セカンドワンナイト人狼」
Do not print quotation brackets. Spell headline characters exactly: 議 / 論 / 中 / に / 暗 / 殺 / さ / れ / る / ！ / ？
Spell game name exactly: セ / カ / ン / ド / ワ / ン / ナ / イ / ト / 人 / 狼
Huge thick brush or heavy Gothic headline, energetic upward diagonal, occupies over 85% of image width, upper-to-middle image. Ivory lettering except 暗殺 in rose with strong ivory and dark ink outlines for readability at 180px wide. Headline can wrap across lines, reading order unambiguous; 暗殺 must be the largest focal point. Game name distinctly smaller in lower portion, entirely above y=80% (leave at least 20% clear below it for Shorts UI), in readable ivory brush lettering, can wrap once. One single tasteful bullet-impact crack motif only, no muzzle flash or other impacts. Moon and howling wolf silhouette support typography. No blood, corpse, fangs, horror face, neon glow, 3D bevel, watermark, other text or lettering. Flat printed illustration, high contrast letterforms, no clipping, fully legible Japanese.
VARIANT 1 — Monumental central headline: three lines 議論中に / 暗殺 / される！？ at y=10–55%, with 暗殺 especially immense. Behind lower-middle right, an ivory full moon inside a teal-to-rose watercolor circle and dark howling wolf at y=49–71%. One small bullet-impact crack beside the left edge of 暗殺, never breaking the glyphs. Sparse waves in lower corners, game name at y=74–80%. Lower 20% quiet dark textured background.
```

### 案2：生成1回目

```text
Use case: ads-marketing
Create one finished Japanese YouTube Shorts thumbnail, portrait 9:16, target 1080×1920. All lettering must be generated inside the image, never placeholders. Premium Japanese watercolor and bold brush lettering, quiet village mystery. Night background #142f37, teal #7fd0d6 and rose #e88f94 watercolor with ivory outlines, washi texture, restrained seigaiha waves and petals. Match the previously inspected brand reference: hand-painted howling wolf silhouette, moon, teal-to-rose watercolor, ivory-edged Japanese brush typography. No humans or third-party female character.
ONLY two text strings may appear, exactly:
「議論中に暗殺される！？」
「セカンドワンナイト人狼」
Do not print quotation brackets. Spell headline characters exactly: 議 / 論 / 中 / に / 暗 / 殺 / さ / れ / る / ！ / ？
Spell game name exactly: セ / カ / ン / ド / ワ / ン / ナ / イ / ト / 人 / 狼
Huge thick brush or heavy Gothic headline, energetic upward diagonal, occupies over 85% of image width, upper-to-middle image. Ivory lettering except 暗殺 in rose with strong ivory and dark ink outlines for readability at 180px wide. Headline can wrap across lines, reading order unambiguous; 暗殺 must be the largest focal point. Game name distinctly smaller in lower portion, entirely above y=80% (leave at least 20% clear below it for Shorts UI), in readable ivory brush lettering, can wrap once. One single tasteful bullet-impact crack motif only, no muzzle flash or other impacts. Moon and howling wolf silhouette support typography. No blood, corpse, fangs, horror face, neon glow, 3D bevel, watermark, other text or lettering. Flat printed illustration, high contrast letterforms, no clipping, fully legible Japanese.
VARIANT 2 — Diagonal typographic poster with large cropped ivory moon in upper right, watercolor teal washing left-to-right into rose. Huge headline across upper and middle: 議論中に / 暗殺される / ！？; make 暗殺 in second line dramatically larger than adjacent される, but all on readable baselines, filling 90% width. Moon stays behind typography without reducing contrast. A small lone wolf howls on a hill in the lower left at y=60–70%; a single delicate bullet-impact crack sits in the upper-left open background, never intersecting letters. Game name on two centered lines セカンド / ワンナイト人狼 at y=73–80%. Bottom fifth reserved, quiet seigaiha ripples. Bold crisp lettering, distinct asymmetrical composition.
```
