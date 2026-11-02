# Frames drawn product pictures exactly like the photos (DECISIONS D-89): one item group, longest side
# 78% of a 480 × 480 white square, centred, the same soft shadow.
import sys, os
from PIL import Image, ImageFilter
SIZE, FILL = 480, 0.78
src, dst = sys.argv[1], sys.argv[2]
rgba = Image.open(src).convert('RGBA')
bb = rgba.split()[3].point(lambda v: 255 if v > 24 else 0).getbbox()
obj = rgba.crop(bb); box = int(SIZE * FILL)
k = min(box / obj.width, box / obj.height)
obj = obj.resize((max(1, round(obj.width * k)), max(1, round(obj.height * k))), Image.LANCZOS)
x, y = (SIZE - obj.width) // 2, (SIZE - obj.height) // 2
canvas = Image.new('RGB', (SIZE, SIZE), (255, 255, 255))
sh = Image.new('L', (SIZE, SIZE), 0); sh.paste(obj.split()[3].point(lambda v: int(v * 0.14)), (x, y + 8))
canvas.paste((40, 40, 40), (0, 0), sh.filter(ImageFilter.GaussianBlur(12)))
canvas.paste(obj, (x, y), obj)
canvas.save(dst, 'WEBP', quality=86, method=6)
