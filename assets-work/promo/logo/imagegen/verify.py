"""Read-only PNG alpha verification; no drawing or image editing."""
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent
rows = []
for path in sorted(root.glob('*.png')):
    with Image.open(path) as im:
        rgba = im.convert('RGBA')
        w, h = im.size
        corners = [rgba.getpixel(p)[3] for p in [(0, 0), (w-1, 0), (0, h-1), (w-1, h-1)]]
        extrema = rgba.getchannel('A').getextrema()
        row = dict(file=path.name, width=w, height=h, mode=im.mode, corner_alpha=corners,
                   alpha_extrema=extrema, passed=('A' in im.getbands() and corners == [0]*4 and extrema[1] > 0))
        rows.append(row)
(root / 'verification.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n')
for row in rows:
    print(row)
assert len(rows) == 8 and all(row['passed'] for row in rows)
