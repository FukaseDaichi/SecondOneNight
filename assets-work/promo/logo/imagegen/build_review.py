"""Write review documents only; never render or modify logo pixels."""
import json
from pathlib import Path
from html import escape
r = Path(__file__).resolve().parent
names = ['logo-h-1','logo-h-2','logo-h-3','logo-stack-1','logo-stack-2','logo-stack-3']
desc = ['左のローズ満月と狼、青海波で安定した横組み。','右の三日月と小さな狼、流れるローズの筆跡。','中央上の円相と狼、左下の青海波。','ローズ満月を上に据えた端正な3段組み。','ティールの三日月と余白を生かす3段組み。','二色の円相と紅葉で和の印象を強めた3段組み。']
cards=[]
for n,d in zip(names,desc):
    badge=' · 選定' if n in ('logo-h-1','logo-stack-2') else ''
    panels=''.join(f'<figure class="{theme}"><figcaption>{label}</figcaption><a href="{n}.png"><img src="{n}.png" alt="セカンドワンナイト人狼 {n}" loading="eager"></a></figure>' for theme,label in [('night','夜 #142f37'),('light','白地 #effdfe')])
    cards.append(f'<article class="{"stack" if "stack" in n else "wide"}"><h2>{n}{badge}</h2><p>{d}</p><div class="pair">{panels}</div></article>')
html='''<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>セカンドワンナイト人狼 · imagegen ロゴ比較</title><style>
*{box-sizing:border-box}body{margin:0;background:#e1ebec;color:#142f37;font:15px/1.7 system-ui,sans-serif}main{max-width:1500px;margin:auto;padding:32px 24px}h1{font-size:28px;margin:0}h2{font-size:18px;margin:0}p{margin:8px 0 16px}article{margin:24px 0 36px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px}figure{margin:0;padding:20px;border-radius:12px}figcaption{font-size:12px;margin-bottom:12px}.night{background:#142f37;color:#effdfe}.light{background:#effdfe;color:#142f37}a{color:inherit}img{display:block;width:100%;height:auto}.wide img{aspect-ratio:3/1;object-fit:contain}.stack img{max-height:620px;object-fit:contain}.stack figure a{display:block;aspect-ratio:9/16} .stack img{height:100%;max-height:none;object-fit:contain}@media(max-width:700px){main{padding:20px 12px}.pair{grid-template-columns:1fr}figure{padding:12px}h1{font-size:23px}}
</style><main><h1>セカンドワンナイト人狼</h1><p>imagegen 生成ロゴ6案。夜色／白地の比較。画像をクリックすると原寸PNGを開きます。<br>横推奨: logo-h-1 ／ 縦推奨: logo-stack-2。<a href="README.md">生成・検証記録</a></p>'''+''.join(cards)+'</main></html>'
(r/'preview.html').write_text(html)
rows=json.loads((r/'verification.json').read_text())
md='''# セカンドワンナイト人狼 — imagegen ロゴ

生成日: 2026-10-20。組み込み imagegen を使用し、全7回に `transparent_background: true` を指定。PNGは生成出力をそのままコピーしたもの。SVG・canvas・Python描画・背景除去・文字合成は行っていない。Pythonは読み取り検証と文書生成のみ。参照: `frontend/public/images/ogp.jpg` を最初に view_image で閲覧し、`docs/design.md` を読んだ。参考画像そのものを生成ツールへ入力せず、配色・筆文字・和柄・月と狼を文章で指定。人物は全案に存在しない。

## ファイルと選定

`preview.html` をブラウザで開くと全6案を #142f37 / #effdfe で比較できる。縦積みの表示枠は9:16。PNG自体は下表のサイズ。

| PNG | 説明 |
| --- | --- |
'''
md+=''.join(f'| `{n}.png` | {d} |\n' for n,d in zip(names,desc))
md+='''| `best-h.png` | `logo-h-1.png` のバイト同一コピー。 |
| `best-stack.png` | `logo-stack-2.png` 最終版のバイト同一コピー。 |

総合推奨は **logo-h-1**。横一列のタイトルを主役に、左のローズ満月が視線の入口になり、狼と青海波がまとまっている。文字と装飾が競合しにくく、OGPの色調と和の雰囲気を保っている。縦用途は **logo-stack-2**。三日月の内側の抜けがあり、月・狼から3段のタイトルへ視線が下がる。

## 文字確認

全6案を生成後に view_image の original 詳細で原寸確認。対象は正確に11文字: **セ・カ・ン・ド・ワ・ン・ナ・イ・ト・人・狼**。OCRによる自動保証ではなく目視判定。ドの濁点、2箇所のン、ナ／イ／ト、人と狼の字形を個別に確認。筆のかすれは意匠として残っている。

| 案 | 最終確認文字列 | 欠字・誤字・余計な文字 | 生成回数 |
| --- | --- | --- | --- |
'''
md+=''.join(f'| {n} | セカンドワンナイト人狼 | 目視でなし | {2 if n=="logo-stack-2" else 1} |\n' for n in names)
md+='''
縦積みは「セカンド / ワンナイト / 人狼」の3段。文字の不合格はなく、文字なしへの切り替えは行っていない。縦積み2の初回も文字は合格したが、左下のalpha=1で透過検証が不合格となったため、余白指定を加えて再生成。最終版も改めて原寸確認済み。

## 透過検証

`python3 assets-work/promo/logo/imagegen/verify.py` で再実行可能。既存環境の Pillow 11.3.0 を使用、依存追加なし。読み取り専用でRGBAの四隅を検査し、`verification.json` に結果を保存。順序は左上・右上・左下・右下。全最終PNGはRGBA、alphaの範囲0〜255で、四隅は厳密に0。四隅チェックは内部の全背景画素の完全透明を保証するものではない。画像編集・背景除去は行っていない。

| PNG | サイズ px | 左上 | 右上 | 左下 | 右下 | 結果 |
| --- | --- | --- | --- | --- | --- | --- |
'''
for row in rows:
    md+=f'| {row["file"]} | {row["width"]} × {row["height"]} | '+ ' | '.join(map(str,row['corner_alpha']))+' | 合格 |\n'
md+='''
初回 `logo-stack-2` は 940×1672、四隅 [0,0,1,0] で不合格。採用せず、imagegenで再生成した。背景除去による修正はしていない。

## 背景上の視認性

墨色の文字に淡いアイボリーの縁とティール／ローズのにじみを指定。夜色では淡い縁が字形を支え、白地では墨色の芯が読める設計。比較HTMLは両背景を並べる構成。原寸画像では淡い縁による字形の識別を確認したが、背景色上のブラウザ実表示の目視確認は未実施。ローカルHTTPサーバーは環境のsocket権限制限で起動不可、ブラウザのfile URLはURLポリシーで拒否された。制限を回避する操作は行っていない。利用者が `preview.html` を開いて最終確認する必要がある。細い筆先・かすれは小さく縮小すると失われるため、原寸リンクでも確認可能にしている。

## imagegen プロンプト全文

以下は各呼び出しに渡した全文。全呼び出しのオプションは `transparent_background: true`。参照画像指定なし。機械可読版は `prompts.json`。

'''
for p in json.loads((r/'prompts.json').read_text()):
    md+='### '+p['name']+'\n\n```text\n'+p['prompt']+'\n```\n\n'
md+='''## 補助ファイル

- `prompts.json`: 全7回の生成プロンプト全文。
- `verify.py` / `verification.json`: PNGの透過検査と結果。
- `build_review.py`: READMEとpreview.htmlを再作成。画像描画・編集なし。

指定ディレクトリ外のリポジトリファイルは変更していない。git add / git commit は実行していない。
'''
(r/'README.md').write_text(md)
