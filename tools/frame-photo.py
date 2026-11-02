# Frames one product photo like every other product picture (DECISIONS D-89, D-95): trims the empty
# (transparent or near-white) border, fits the item to 78% of a 480 × 480 white square, centred, soft shadow.
# Usage: python3 tools/frame-photo.py <input image> <output .webp>
import sys
import numpy as np
from PIL import Image, ImageFilter

SIZE, FILL = 480, 0.78
src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src)
rgba = im.convert('RGBA')
arr = np.array(rgba)
if (arr[..., 3] < 250).mean() > 0.02:  # has real transparency: use it as the item's outline
    mask = arr[..., 3] > 24
else:  # packshot on a light background: everything that is not near-white
    mask = (arr[..., :3].min(axis=2) < 242)
ys, xs = np.nonzero(mask)
if len(xs) == 0:
    ys, xs = np.nonzero(np.ones(mask.shape, bool))
obj = rgba.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
box = int(SIZE * FILL)
k = min(box / obj.width, box / obj.height)
obj = obj.resize((max(1, round(obj.width * k)), max(1, round(obj.height * k))), Image.LANCZOS)
x, y = (SIZE - obj.width) // 2, (SIZE - obj.height) // 2
canvas = Image.new('RGB', (SIZE, SIZE), (255, 255, 255))
alpha = obj.split()[3]
sh = Image.new('L', (SIZE, SIZE), 0)
sh.paste(alpha.point(lambda v: int(v * 0.14)), (x, y + 8))
canvas.paste((40, 40, 40), (0, 0), sh.filter(ImageFilter.GaussianBlur(12)))
canvas.paste(obj, (x, y), alpha)
canvas.save(dst, 'WEBP', quality=86, method=6)
