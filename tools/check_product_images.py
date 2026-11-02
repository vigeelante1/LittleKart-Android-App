"""Pixel check of every bundled product image (iteration 2, DECISIONS D-89).

Run:  python3 tools/check_product_images.py
Checks each app/src/assets/products/<id>.webp: 480 x 480, a clean white margin all round,
the item centred, and the item neither tiny nor touching the edges. Exits 1 if any image fails.
"""
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / 'app/src/assets/products'
MARGIN, WHITE = 10, 238          # px of margin that must stay near-white
INK = 250                        # anything darker than this counts as part of the item (incl. light card tiles)
CENTRE_TOL, MIN_FILL = 0.06, 0.30

def check(path):
    im = Image.open(path).convert('L')
    if im.size != (480, 480):
        return f'size {im.size}'
    w, h = im.size
    band = [im.getpixel((x, y)) for x in range(0, w, 4) for y in list(range(MARGIN)) + list(range(h - MARGIN, h))]
    band += [im.getpixel((x, y)) for y in range(0, h, 4) for x in list(range(MARGIN)) + list(range(w - MARGIN, w))]
    if min(band) < WHITE - 30 or sum(band) / len(band) < WHITE:
        return 'item touches the edge / margin not white'
    bbox = im.point(lambda v: 255 if v < INK else 0).getbbox()
    if not bbox:
        return 'empty image'
    cx, cy = (bbox[0] + bbox[2]) / 2 / w, (bbox[1] + bbox[3]) / 2 / h
    if abs(cx - 0.5) > CENTRE_TOL or abs(cy - 0.5) > CENTRE_TOL:
        return f'off centre ({cx:.2f}, {cy:.2f})'
    if max(bbox[2] - bbox[0], bbox[3] - bbox[1]) / w < MIN_FILL:
        return 'item too small'
    return None

def main():
    files = sorted(ROOT.glob('*.webp'))
    bad = [(f.stem, r) for f in files if (r := check(f))]
    for stem, reason in bad:
        print(f'FAIL {stem}: {reason}')
    print(f'{len(files) - len(bad)}/{len(files)} product images pass')
    return 1 if bad else 0

if __name__ == '__main__':
    sys.exit(main())
