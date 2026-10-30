import os
from PIL import Image, ImageDraw, ImageFont

ICONS_DIR = '/home/ehsan/farsimatrix/public/icons'
os.makedirs(ICONS_DIR, exist_ok=True)

def create_icon(size, is_maskable=False):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Padding
    pad = int(size * 0.1) if is_maskable else int(size * 0.05)
    corner_radius = int(size * 0.22) if not is_maskable else int(size * 0.1)

    # Background squircle
    draw.rounded_rectangle(
        [pad, pad, size - pad, size - pad],
        radius=corner_radius,
        fill=(0, 104, 116, 255) # M3 Deep Teal
    )

    # Subtle inner accent
    inner_pad = pad + int(size * 0.02)
    draw.rounded_rectangle(
        [inner_pad, inner_pad, size - inner_pad, size - inner_pad],
        radius=corner_radius - int(size * 0.02),
        outline=(77, 216, 236, 60), # Cyan tint
        width=max(2, int(size * 0.01))
    )

    # Geometric matrix / flashcard layers in white
    # Top card outline
    scale = size / 512
    card_w = int(240 * scale)
    card_h = int(160 * scale)
    center_x = size // 2
    center_y = size // 2

    # Draw card stack
    # Back card
    draw.rounded_rectangle(
        [center_x - card_w // 2 + int(14 * scale), center_y - card_h // 2 - int(18 * scale),
         center_x + card_w // 2 + int(14 * scale), center_y + card_h // 2 - int(18 * scale)],
        radius=int(20 * scale),
        fill=(0, 79, 88, 255),
        outline=(151, 240, 255, 120),
        width=max(2, int(3 * scale))
    )

    # Front card
    draw.rounded_rectangle(
        [center_x - card_w // 2 - int(6 * scale), center_y - card_h // 2 + int(8 * scale),
         center_x + card_w // 2 - int(6 * scale), center_y + card_h // 2 + int(8 * scale)],
        radius=int(20 * scale),
        fill=(255, 255, 255, 255),
        outline=(77, 216, 236, 255),
        width=max(2, int(4 * scale))
    )

    # Inner lines representing lines of text on the card
    line_x1 = center_x - card_w // 2 + int(24 * scale)
    line_x2 = center_x + card_w // 2 - int(36 * scale)
    line_y = center_y - int(24 * scale)
    
    # Line 1
    draw.rounded_rectangle(
        [line_x1, line_y, line_x2 - int(40 * scale), line_y + int(12 * scale)],
        radius=int(6 * scale),
        fill=(0, 104, 116, 255)
    )
    # Line 2
    draw.rounded_rectangle(
        [line_x1, line_y + int(24 * scale), line_x2, line_y + int(32 * scale)],
        radius=int(4 * scale),
        fill=(74, 98, 103, 180)
    )
    # Line 3
    draw.rounded_rectangle(
        [line_x1, line_y + int(42 * scale), line_x2 - int(60 * scale), line_y + int(50 * scale)],
        radius=int(4 * scale),
        fill=(74, 98, 103, 140)
    )

    # Cyan glowing dot
    dot_r = int(12 * scale)
    dot_x = center_x + card_w // 2 - int(28 * scale)
    dot_y = center_y + card_h // 2 - int(12 * scale)
    draw.ellipse(
        [dot_x - dot_r, dot_y - dot_r, dot_x + dot_r, dot_y + dot_r],
        fill=(77, 216, 236, 255),
        outline=(0, 104, 116, 255),
        width=max(1, int(2 * scale))
    )

    return img

if __name__ == '__main__':
    img192 = create_icon(192)
    img192.save(os.path.join(ICONS_DIR, 'icon-192x192.png'))
    
    img512 = create_icon(512)
    img512.save(os.path.join(ICONS_DIR, 'icon-512x512.png'))

    img_maskable = create_icon(512, is_maskable=True)
    img_maskable.save(os.path.join(ICONS_DIR, 'icon-maskable-512x512.png'))

    print("Icons generated successfully!")
