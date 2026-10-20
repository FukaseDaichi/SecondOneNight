# セカンドワンナイト人狼 — imagegen ロゴ

## 採用

ユーザー選定(2026-10-20): 横組み **logo-h-2**、縦積み **logo-stack-3**。`best-h.png` / `best-stack.png` はこの 2 案のコピー。以下の「おすすめ」「選定」は Codex 生成時の推奨で、採用結果とは異なる。

生成日: 2026-10-20。組み込み imagegen を使用し、全7回に `transparent_background: true` を指定。PNGは生成出力をそのままコピーしたもの。SVG・canvas・Python描画・背景除去・文字合成は行っていない。Pythonは読み取り検証と文書生成のみ。参照: `frontend/public/images/ogp.jpg` を最初に view_image で閲覧し、`docs/design.md` を読んだ。参考画像そのものを生成ツールへ入力せず、配色・筆文字・和柄・月と狼を文章で指定。人物は全案に存在しない。

## ファイルと選定

`preview.html` をブラウザで開くと全6案を #142f37 / #effdfe で比較できる。縦積みの表示枠は9:16。PNG自体は下表のサイズ。

| PNG | 説明 |
| --- | --- |
| `logo-h-1.png` | 左のローズ満月と狼、青海波で安定した横組み。 |
| `logo-h-2.png` | 右の三日月と小さな狼、流れるローズの筆跡。 |
| `logo-h-3.png` | 中央上の円相と狼、左下の青海波。 |
| `logo-stack-1.png` | ローズ満月を上に据えた端正な3段組み。 |
| `logo-stack-2.png` | ティールの三日月と余白を生かす3段組み。 |
| `logo-stack-3.png` | 二色の円相と紅葉で和の印象を強めた3段組み。 |
| `best-h.png` | `logo-h-1.png` のバイト同一コピー。 |
| `best-stack.png` | `logo-stack-2.png` 最終版のバイト同一コピー。 |

総合推奨は **logo-h-1**。横一列のタイトルを主役に、左のローズ満月が視線の入口になり、狼と青海波がまとまっている。文字と装飾が競合しにくく、OGPの色調と和の雰囲気を保っている。縦用途は **logo-stack-2**。三日月の内側の抜けがあり、月・狼から3段のタイトルへ視線が下がる。

## 文字確認

全6案を生成後に view_image の original 詳細で原寸確認。対象は正確に11文字: **セ・カ・ン・ド・ワ・ン・ナ・イ・ト・人・狼**。OCRによる自動保証ではなく目視判定。ドの濁点、2箇所のン、ナ／イ／ト、人と狼の字形を個別に確認。筆のかすれは意匠として残っている。

| 案 | 最終確認文字列 | 欠字・誤字・余計な文字 | 生成回数 |
| --- | --- | --- | --- |
| logo-h-1 | セカンドワンナイト人狼 | 目視でなし | 1 |
| logo-h-2 | セカンドワンナイト人狼 | 目視でなし | 1 |
| logo-h-3 | セカンドワンナイト人狼 | 目視でなし | 1 |
| logo-stack-1 | セカンドワンナイト人狼 | 目視でなし | 1 |
| logo-stack-2 | セカンドワンナイト人狼 | 目視でなし | 2 |
| logo-stack-3 | セカンドワンナイト人狼 | 目視でなし | 1 |

縦積みは「セカンド / ワンナイト / 人狼」の3段。文字の不合格はなく、文字なしへの切り替えは行っていない。縦積み2の初回も文字は合格したが、左下のalpha=1で透過検証が不合格となったため、余白指定を加えて再生成。最終版も改めて原寸確認済み。

## 透過検証

`python3 assets-work/promo/logo/imagegen/verify.py` で再実行可能。既存環境の Pillow 11.3.0 を使用、依存追加なし。読み取り専用でRGBAの四隅を検査し、`verification.json` に結果を保存。順序は左上・右上・左下・右下。全最終PNGはRGBA、alphaの範囲0〜255で、四隅は厳密に0。四隅チェックは内部の全背景画素の完全透明を保証するものではない。画像編集・背景除去は行っていない。

| PNG | サイズ px | 左上 | 右上 | 左下 | 右下 | 結果 |
| --- | --- | --- | --- | --- | --- | --- |
| best-h.png | 2172 × 724 | 0 | 0 | 0 | 0 | 合格 |
| best-stack.png | 941 × 1672 | 0 | 0 | 0 | 0 | 合格 |
| logo-h-1.png | 2172 × 724 | 0 | 0 | 0 | 0 | 合格 |
| logo-h-2.png | 2172 × 724 | 0 | 0 | 0 | 0 | 合格 |
| logo-h-3.png | 2172 × 724 | 0 | 0 | 0 | 0 | 合格 |
| logo-stack-1.png | 941 × 1672 | 0 | 0 | 0 | 0 | 合格 |
| logo-stack-2.png | 941 × 1672 | 0 | 0 | 0 | 0 | 合格 |
| logo-stack-3.png | 941 × 1672 | 0 | 0 | 0 | 0 | 合格 |

初回 `logo-stack-2` は 940×1672、四隅 [0,0,1,0] で不合格。採用せず、imagegenで再生成した。背景除去による修正はしていない。

## 背景上の視認性

墨色の文字に淡いアイボリーの縁とティール／ローズのにじみを指定。夜色では淡い縁が字形を支え、白地では墨色の芯が読める設計。比較HTMLは両背景を並べる構成。原寸画像では淡い縁による字形の識別を確認したが、背景色上のブラウザ実表示の目視確認は未実施。ローカルHTTPサーバーは環境のsocket権限制限で起動不可、ブラウザのfile URLはURLポリシーで拒否された。制限を回避する操作は行っていない。利用者が `preview.html` を開いて最終確認する必要がある。細い筆先・かすれは小さく縮小すると失われるため、原寸リンクでも確認可能にしている。

## imagegen プロンプト全文

以下は各呼び出しに渡した全文。全呼び出しのオプションは `transparent_background: true`。参照画像指定なし。機械可読版は `prompts.json`。

### logo-h-1

```text
Use case: logo-brand.
Create a finished original raster logo PNG for Japanese online board game セカンドワンナイト人狼. Genuine transparent background, no white or colored rectangular canvas, all four corners empty alpha. Quiet village mystery, refined Japanese modern design. Delicate dry-brush Japanese calligraphy with sharp elegant terminals and lightly distressed ink texture, restrained watercolor teal #7fd0d6 and sakura rose #e9a7be bleeding into ivory and deep ink #1e3b44. Use dark ink letter cores with a fine continuous pale ivory keyline so every character is readable against night #142f37 as well as pale #effdfe; no glow. Motifs: original small howling wolf silhouette, moon, a few petals and restrained seigaiha Japanese wave detail. Washi texture only WITHIN painted strokes and motifs, NEVER as a background sheet. Generous transparent margins; no clipping.
Text verbatim, exactly once: 「セカンドワンナイト人狼」. Exactly 11 glyphs in order セ / カ / ン / ド / ワ / ン / ナ / イ / ト / 人 / 狼. Preserve recognizable correct Japanese glyph anatomy, especially ド dakuten and 狼. Do not draw quote brackets, glyph separators, furigana, English subtitles, seals with text, extra letters or watermarks.
Reference direction from inspected OGP: soft teal/rose watercolors, Japanese brush calligraphy, moon and wolf, sparse traditional pattern. No humans, no female character, no humanoids, no existing third-party logo. No horror, blood, fangs, aggressive snarling, neon, heavy glow, bevel, 3D, mockup or checkerboard drawn into the art.
Composition: Wide horizontal logo, approximately 3:1 overall. One continuous left-to-right line of all 11 characters, dominant and large. A small rose watercolor moon medallion with a deep teal howling wolf at the left of the lettering. A tiny teal seigaiha fragment underneath the medallion and two rose petals near the right end. Elegant calm baseline.
```

### logo-h-2

```text
Use case: logo-brand.
Create a finished original raster logo PNG for Japanese online board game セカンドワンナイト人狼. Genuine transparent background, no white or colored rectangular canvas, all four corners empty alpha. Quiet village mystery, refined Japanese modern design. Delicate dry-brush Japanese calligraphy with sharp elegant terminals and lightly distressed ink texture, restrained watercolor teal #7fd0d6 and sakura rose #e9a7be bleeding into ivory and deep ink #1e3b44. Use dark ink letter cores with a fine continuous pale ivory keyline so every character is readable against night #142f37 as well as pale #effdfe; no glow. Motifs: original small howling wolf silhouette, moon, a few petals and restrained seigaiha Japanese wave detail. Washi texture only WITHIN painted strokes and motifs, NEVER as a background sheet. Generous transparent margins; no clipping.
Text verbatim, exactly once: 「セカンドワンナイト人狼」. Exactly 11 glyphs in order セ / カ / ン / ド / ワ / ン / ナ / イ / ト / 人 / 狼. Preserve recognizable correct Japanese glyph anatomy, especially ド dakuten and 狼. Do not draw quote brackets, glyph separators, furigana, English subtitles, seals with text, extra letters or watermarks.
Reference direction from inspected OGP: soft teal/rose watercolors, Japanese brush calligraphy, moon and wolf, sparse traditional pattern. No humans, no female character, no humanoids, no existing third-party logo. No horror, blood, fangs, aggressive snarling, neon, heavy glow, bevel, 3D, mockup or checkerboard drawn into the art.
Composition: Wide horizontal logo, approximately 3:1 overall. All 11 characters in a single left-to-right calligraphy line. A fine pale teal crescent arcs ABOVE the final 人狼 on the right, with a very small howling wolf at its lower tip, separate from the glyphs. A sparse rose brush ribbon beneath the last two letters, two tiny petals at the left. Text remains completely unobstructed.
```

### logo-h-3

```text
Use case: logo-brand.
Create a finished original raster logo PNG for Japanese online board game セカンドワンナイト人狼. Genuine transparent background, no white or colored rectangular canvas, all four corners empty alpha. Quiet village mystery, refined Japanese modern design. Delicate dry-brush Japanese calligraphy with sharp elegant terminals and lightly distressed ink texture, restrained watercolor teal #7fd0d6 and sakura rose #e9a7be bleeding into ivory and deep ink #1e3b44. Use dark ink letter cores with a fine continuous pale ivory keyline so every character is readable against night #142f37 as well as pale #effdfe; no glow. Motifs: original small howling wolf silhouette, moon, a few petals and restrained seigaiha Japanese wave detail. Washi texture only WITHIN painted strokes and motifs, NEVER as a background sheet. Generous transparent margins; no clipping.
Text verbatim, exactly once: 「セカンドワンナイト人狼」. Exactly 11 glyphs in order セ / カ / ン / ド / ワ / ン / ナ / イ / ト / 人 / 狼. Preserve recognizable correct Japanese glyph anatomy, especially ド dakuten and 狼. Do not draw quote brackets, glyph separators, furigana, English subtitles, seals with text, extra letters or watermarks.
Reference direction from inspected OGP: soft teal/rose watercolors, Japanese brush calligraphy, moon and wolf, sparse traditional pattern. No humans, no female character, no humanoids, no existing third-party logo. No horror, blood, fangs, aggressive snarling, neon, heavy glow, bevel, 3D, mockup or checkerboard drawn into the art.
Composition: Wide horizontal logo, approximately 3:1 overall. All 11 characters in one prominent left-to-right line. A small open teal and rose circular brush moon floats centered ABOVE the middle of the wordmark, with a miniature deep-ink howling wolf inside. Very minimal seigaiha under the left edge, one maple leaf beside the circle. Airy asymmetric editorial balance; text dominant.
```

### logo-stack-1

```text
Use case: logo-brand.
Create a finished original raster logo PNG for Japanese online board game セカンドワンナイト人狼. Genuine transparent background, no white or colored rectangular canvas, all four corners empty alpha. Quiet village mystery, refined Japanese modern design. Delicate dry-brush Japanese calligraphy with sharp elegant terminals and lightly distressed ink texture, restrained watercolor teal #7fd0d6 and sakura rose #e9a7be bleeding into ivory and deep ink #1e3b44. Use dark ink letter cores with a fine continuous pale ivory keyline so every character is readable against night #142f37 as well as pale #effdfe; no glow. Motifs: original small howling wolf silhouette, moon, a few petals and restrained seigaiha Japanese wave detail. Washi texture only WITHIN painted strokes and motifs, NEVER as a background sheet. Generous transparent margins; no clipping.
Text verbatim, exactly once: 「セカンドワンナイト人狼」. Exactly 11 glyphs in order セ / カ / ン / ド / ワ / ン / ナ / イ / ト / 人 / 狼. Preserve recognizable correct Japanese glyph anatomy, especially ド dakuten and 狼. Do not draw quote brackets, glyph separators, furigana, English subtitles, seals with text, extra letters or watermarks.
Reference direction from inspected OGP: soft teal/rose watercolors, Japanese brush calligraphy, moon and wolf, sparse traditional pattern. No humans, no female character, no humanoids, no existing third-party logo. No horror, blood, fangs, aggressive snarling, neon, heavy glow, bevel, 3D, mockup or checkerboard drawn into the art.
Composition: Portrait stacked logo for placement in a vertical 9:16 video. Motif ABOVE, text BELOW. Top: restrained rose full moon medallion with small original teal howling wolf. Below it, exactly three centered horizontal text lines: line 1 セカンド ; line 2 ワンナイト ; line 3 人狼 . The bottom 人狼 is larger. Two small sakura petals and a tiny seigaiha base. Compact graceful centered composition, generous transparent margin.
```

### logo-stack-2

```text
Use case: logo-brand.
Create a finished original raster logo PNG for Japanese online board game セカンドワンナイト人狼. Genuine transparent background, no white or colored rectangular canvas, all four corners empty alpha. Quiet village mystery, refined Japanese modern design. Delicate dry-brush Japanese calligraphy with sharp elegant terminals and lightly distressed ink texture, restrained watercolor teal #7fd0d6 and sakura rose #e9a7be bleeding into ivory and deep ink #1e3b44. Use dark ink letter cores with a fine continuous pale ivory keyline so every character is readable against night #142f37 as well as pale #effdfe; no glow. Motifs: original small howling wolf silhouette, moon, a few petals and restrained seigaiha Japanese wave detail. Washi texture only WITHIN painted strokes and motifs, NEVER as a background sheet. Generous transparent margins; no clipping.
Text verbatim, exactly once: 「セカンドワンナイト人狼」. Exactly 11 glyphs in order セ / カ / ン / ド / ワ / ン / ナ / イ / ト / 人 / 狼. Preserve recognizable correct Japanese glyph anatomy, especially ド dakuten and 狼. Do not draw quote brackets, glyph separators, furigana, English subtitles, seals with text, extra letters or watermarks.
Reference direction from inspected OGP: soft teal/rose watercolors, Japanese brush calligraphy, moon and wolf, sparse traditional pattern. No humans, no female character, no humanoids, no existing third-party logo. No horror, blood, fangs, aggressive snarling, neon, heavy glow, bevel, 3D, mockup or checkerboard drawn into the art.
Composition: Portrait stacked logo for placement in a vertical 9:16 video. Motif ABOVE, text BELOW. Top: open pale teal crescent enclosing a small deep teal howling wolf with a rose watercolor accent behind its lower body, two floating rose petals. Below: exactly three horizontal text lines, セカンド then ワンナイト then 人狼 . Strong yet delicate calligraphy, enlarged final 人狼, asymmetric crescent and calm aligned text.
```

### logo-stack-3

```text
Use case: logo-brand.
Create a finished original raster logo PNG for Japanese online board game セカンドワンナイト人狼. Genuine transparent background, no white or colored rectangular canvas, all four corners empty alpha. Quiet village mystery, refined Japanese modern design. Delicate dry-brush Japanese calligraphy with sharp elegant terminals and lightly distressed ink texture, restrained watercolor teal #7fd0d6 and sakura rose #e9a7be bleeding into ivory and deep ink #1e3b44. Use dark ink letter cores with a fine continuous pale ivory keyline so every character is readable against night #142f37 as well as pale #effdfe; no glow. Motifs: original small howling wolf silhouette, moon, a few petals and restrained seigaiha Japanese wave detail. Washi texture only WITHIN painted strokes and motifs, NEVER as a background sheet. Generous transparent margins; no clipping.
Text verbatim, exactly once: 「セカンドワンナイト人狼」. Exactly 11 glyphs in order セ / カ / ン / ド / ワ / ン / ナ / イ / ト / 人 / 狼. Preserve recognizable correct Japanese glyph anatomy, especially ド dakuten and 狼. Do not draw quote brackets, glyph separators, furigana, English subtitles, seals with text, extra letters or watermarks.
Reference direction from inspected OGP: soft teal/rose watercolors, Japanese brush calligraphy, moon and wolf, sparse traditional pattern. No humans, no female character, no humanoids, no existing third-party logo. No horror, blood, fangs, aggressive snarling, neon, heavy glow, bevel, 3D, mockup or checkerboard drawn into the art.
Composition: Portrait stacked logo for placement in a vertical 9:16 video. Motif ABOVE, text BELOW. Top: original howling wolf silhouette in deep ink inside a delicate split teal/rose circular dry-brush moon with a very small seigaiha fragment across the bottom of the circle. Below: exactly three centered horizontal text lines, セカンド then ワンナイト then 人狼 . Refined broad calligraphic strokes, large 人狼, single rose maple leaf beside the medallion. Clear transparent spaces between motif and lettering.
```

### logo-stack-2-attempt-2

```text
Use case: logo-brand.
Create a finished original raster logo PNG for Japanese online board game セカンドワンナイト人狼. Genuine transparent background, no white or colored rectangular canvas, all four corners empty alpha. Quiet village mystery, refined Japanese modern design. Delicate dry-brush Japanese calligraphy with sharp elegant terminals and lightly distressed ink texture, restrained watercolor teal #7fd0d6 and sakura rose #e9a7be bleeding into ivory and deep ink #1e3b44. Use dark ink letter cores with a fine continuous pale ivory keyline so every character is readable against night #142f37 as well as pale #effdfe; no glow. Motifs: original small howling wolf silhouette, moon, a few petals and restrained seigaiha Japanese wave detail. Washi texture only WITHIN painted strokes and motifs, NEVER as a background sheet. Generous transparent margins; no clipping.
Text verbatim, exactly once: 「セカンドワンナイト人狼」. Exactly 11 glyphs in order セ / カ / ン / ド / ワ / ン / ナ / イ / ト / 人 / 狼. Preserve recognizable correct Japanese glyph anatomy, especially ド dakuten and 狼. Do not draw quote brackets, glyph separators, furigana, English subtitles, seals with text, extra letters or watermarks.
Reference direction from inspected OGP: soft teal/rose watercolors, Japanese brush calligraphy, moon and wolf, sparse traditional pattern. No humans, no female character, no humanoids, no existing third-party logo. No horror, blood, fangs, aggressive snarling, neon, heavy glow, bevel, 3D, mockup or checkerboard drawn into the art.
Composition: Portrait stacked logo for placement in a vertical 9:16 video. Motif ABOVE, text BELOW. Top: open pale teal crescent enclosing a small deep teal howling wolf with a rose watercolor accent behind its lower body, two floating rose petals. Below: exactly three horizontal text lines, セカンド then ワンナイト then 人狼 . Strong yet delicate calligraphy, enlarged final 人狼, asymmetric crescent and calm aligned text.
Transparency correction: keep the entire outermost 8% margin fully empty with exact alpha 0, including every corner. No pigment, paper texture, spray, almost-invisible wash or shadow at the edges. Keep all artwork and texture safely inside this transparent margin.
```

## 補助ファイル

- `prompts.json`: 全7回の生成プロンプト全文。
- `verify.py` / `verification.json`: PNGの透過検査と結果。
- `build_review.py`: READMEとpreview.htmlを再作成。画像描画・編集なし。

指定ディレクトリ外のリポジトリファイルは変更していない。git add / git commit は実行していない。
