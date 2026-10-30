"""Generate the FarsiMatrix app icon set.

The mark is the Persian letter «ف» (Vazirmatn Bold outline) whose dot is replaced by a
2x2 "matrix" of flashcard tiles, on a Persian-turquoise MD3 tonal background.

Requirements: `pip install fonttools`, plus the `resvg` and `magick` (ImageMagick) CLIs.
Usage:  python3 scripts/generate_icons.py /path/to/Vazirmatn-Bold.ttf
"""

import math
import os
import subprocess
import sys

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ICONS_DIR = os.path.join(ROOT, 'public', 'icons')
APP_DIR = os.path.join(ROOT, 'src', 'app')

TILE_COLORS = [['#FFFFFF', '#FFC94D'], ['#9CF1F0', '#E3FFFE']]


def feh_body_path(font_path):
    """Return the SVG path of «ف» without its dot, in font units (y-up)."""
    font = TTFont(font_path)
    glyphs = font.getGlyphSet()
    rec = DecomposingRecordingPen(glyphs)
    glyphs[font.getBestCmap()[0x0641]].draw(rec)

    contours, current = [], []
    for op, args in rec.value:
        current.append((op, args))
        if op in ('closePath', 'endPath'):
            contours.append(current)
            current = []

    def area(contour):
        bp = BoundsPen(glyphs)
        for op, args in contour:
            getattr(bp, op)(*args)
        x0, y0, x1, y1 = bp.bounds
        return (x1 - x0) * (y1 - y0), bp.bounds

    # The dot is the topmost contour; everything else is the body (outline + counter).
    dot = max(contours, key=lambda c: area(c)[1][1])
    pen = SVGPathPen(glyphs)
    for contour in contours:
        if contour is dot:
            continue
        for op, args in contour:
            getattr(pen, op)(*args)
    return pen.getCommands()


def cookie(cx, cy, r, k, a, n=360):
    pts = []
    for i in range(n):
        th = 2 * math.pi * i / n
        rr = r * (1 + a * math.cos(k * th))
        pts.append(f'{cx + rr * math.cos(th):.1f},{cy + rr * math.sin(th):.1f}')
    return 'M' + ' L'.join(pts) + ' Z'


def mark(body, s, cx, cy, tilt=8):
    gx, gy = 908.5, 860
    t, g = 218, 46
    tile_cx, tile_cy = 1300, 1440
    x0, y0 = tile_cx - (t + g / 2), tile_cy - (t + g / 2)
    tiles = ''.join(
        f'<rect x="{x0 + col * (t + g):.0f}" y="{y0 + row * (t + g):.0f}" width="{t}" height="{t}" '
        f'rx="64" fill="{TILE_COLORS[row][col]}"/>'
        for row in range(2)
        for col in range(2)
    )
    return (
        f'<g transform="translate({cx - gx * s:.2f},{cy + gy * s:.2f}) scale({s:.4f},{-s:.4f})">'
        f'<g filter="url(#lift)"><path d="{body}" fill="#FFFFFF"/>'
        f'<g transform="rotate({tilt} {tile_cx} {tile_cy})">{tiles}</g></g></g>'
    )


def build_svg(body, size=1024, maskable=False):
    c = size / 2
    s = (0.31 if maskable else 0.36) * size / 1024
    inset, side, radius = size * 0.04, size * 0.92, size * 0.23
    if maskable:
        bg = f'<rect width="{size}" height="{size}" fill="url(#bg)"/>'
        clip = ''
    else:
        bg = f'<rect x="{inset:.1f}" y="{inset:.1f}" width="{side:.1f}" height="{side:.1f}" rx="{radius:.1f}" fill="url(#bg)"/>'
        clip = 'clip-path="url(#round)"'
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" width="{size}" height="{size}">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1A8C8C"/><stop offset="1" stop-color="#004F50"/></linearGradient>
<radialGradient id="glow" cx="0.3" cy="0.22" r="0.75"><stop offset="0" stop-color="#9CF1F0" stop-opacity="0.35"/><stop offset="1" stop-color="#9CF1F0" stop-opacity="0"/></radialGradient>
<clipPath id="round"><rect x="{inset:.1f}" y="{inset:.1f}" width="{side:.1f}" height="{side:.1f}" rx="{radius:.1f}"/></clipPath>
<filter id="lift" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceAlpha" stdDeviation="28"/><feOffset dx="0" dy="-36" result="b"/><feFlood flood-color="#002020" flood-opacity="0.35"/><feComposite in2="b" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
{bg}
<g {clip}><path d="{cookie(c, c, size * 0.36, 9, 0.045)}" fill="#FFFFFF" fill-opacity="0.07" transform="rotate(12 {c} {c})"/><rect width="{size}" height="{size}" fill="url(#glow)"/></g>
{mark(body, s, c, c + size * 0.01)}
</svg>
'''


def render(svg_path, png_path, width):
    subprocess.run(['resvg', svg_path, png_path, '-w', str(width)], check=True)


def main():
    font_path = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser('~/Downloads/Vazirmatn-font/Vazirmatn-Bold.ttf')
    body = feh_body_path(font_path)
    os.makedirs(ICONS_DIR, exist_ok=True)

    any_svg = os.path.join(ICONS_DIR, 'icon.svg')
    maskable_svg = os.path.join(ICONS_DIR, 'icon-maskable.svg')
    open(any_svg, 'w').write(build_svg(body))
    open(maskable_svg, 'w').write(build_svg(body, maskable=True))

    for size in (192, 512):
        render(any_svg, os.path.join(ICONS_DIR, f'icon-{size}x{size}.png'), size)
        render(maskable_svg, os.path.join(ICONS_DIR, f'icon-maskable-{size}x{size}.png'), size)
    render(maskable_svg, os.path.join(ICONS_DIR, 'apple-touch-icon.png'), 180)

    tmp = []
    for size in (16, 32, 48):
        p = os.path.join(ICONS_DIR, f'_fav{size}.png')
        render(any_svg, p, size)
        tmp.append(p)
    subprocess.run(['magick', *tmp, os.path.join(APP_DIR, 'favicon.ico')], check=True)
    for p in tmp:
        os.remove(p)
    print('Icons written to', ICONS_DIR)


if __name__ == '__main__':
    main()
