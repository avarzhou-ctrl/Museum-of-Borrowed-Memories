"""Copy production character frames directly from the supplied sprite sheets."""

from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCES = {
    "female": ROOT / "References" / "replacements" / "female-sheet.png",
    "male": ROOT / "References" / "replacements" / "male-sheet.png",
}
MAGENTA_OUTPUT = ROOT / "assets" / "characters" / "sheet-copies"
OUTPUT = ROOT / "assets" / "characters" / "final"
CANVAS_SIZE = (181, 272)
GAMEPLAY_HEIGHT = 240
ROW_BOUNDS = {
    "female": ((0, 272), (270, 530), (520, 775), (770, 1086)),
    "male": ((0, 285), (270, 520), (500, 750), (730, 1086)),
}

# Sheet rows are front, back, side, and front-facing interaction poses.
# Reusing supplied directional poses for interaction keeps every production pixel
# traceable to the reference art without inventing new frames.
FRAME_CELLS = {
    "idle-front-1": (0, 0), "idle-front-2": (1, 0),
    "walk-front-1": (2, 0), "walk-front-2": (3, 0),
    "walk-front-3": (4, 0), "walk-front-4": (5, 0),
    "interact-front-1": (0, 0), "interact-front-2": (6, 0), "interact-front-3": (7, 0),
    "idle-back-1": (0, 1), "idle-back-2": (1, 1),
    "walk-back-1": (2, 1), "walk-back-2": (3, 1),
    "walk-back-3": (4, 1), "walk-back-4": (5, 1),
    "interact-back-1": (0, 1), "interact-back-2": (6, 1), "interact-back-3": (7, 1),
    "idle-side-1": (0, 2), "idle-side-2": (1, 2),
    "walk-side-1": (2, 2), "walk-side-2": (3, 2),
    "walk-side-3": (4, 2), "walk-side-4": (5, 2),
    "interact-side-1": (0, 2), "interact-side-2": (6, 2), "interact-side-3": (7, 2),
}


def connected_background_alpha(image: Image.Image, threshold: int = 72) -> Image.Image:
    """Clear only pale checker pixels connected to a crop edge."""
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    border = []
    for x in range(width):
        border.extend((pixels[x, 0][:3], pixels[x, height - 1][:3]))
    for y in range(height):
        border.extend((pixels[0, y][:3], pixels[width - 1, y][:3]))
    background = tuple(sorted(sample[channel] for sample in border)[len(border) // 2] for channel in range(3))

    def is_background(x: int, y: int) -> bool:
        rgb = pixels[x, y][:3]
        distance = sum((rgb[channel] - background[channel]) ** 2 for channel in range(3)) ** .5
        return distance <= threshold or (min(rgb) > 226 and max(rgb) - min(rgb) < 24)

    queue = deque()
    for x in range(width):
        queue.extend(((x, 0), (x, height - 1)))
    for y in range(height):
        queue.extend(((0, y), (width - 1, y)))

    seen = set()
    mask = Image.new("L", rgba.size, 255)
    mask_pixels = mask.load()
    while queue:
        x, y = queue.popleft()
        if (x, y) in seen or not is_background(x, y):
            continue
        seen.add((x, y))
        mask_pixels[x, y] = 0
        if x: queue.append((x - 1, y))
        if x + 1 < width: queue.append((x + 1, y))
        if y: queue.append((x, y - 1))
        if y + 1 < height: queue.append((x, y + 1))

    rgba.putalpha(mask)
    return remove_floor_shadow(keep_largest_component(rgba))


def keep_largest_component(image: Image.Image) -> Image.Image:
    """Remove the disconnected checker shadow while retaining source pixels."""
    alpha = image.getchannel("A")
    pixels = alpha.load()
    seen = set()
    components = []
    for start_y in range(image.height):
        for start_x in range(image.width):
            if pixels[start_x, start_y] < 128 or (start_x, start_y) in seen:
                continue
            component = []
            queue = deque(((start_x, start_y),))
            while queue:
                x, y = queue.popleft()
                if (x, y) in seen or pixels[x, y] < 128:
                    continue
                seen.add((x, y))
                component.append((x, y))
                if x: queue.append((x - 1, y))
                if x + 1 < image.width: queue.append((x + 1, y))
                if y: queue.append((x, y - 1))
                if y + 1 < image.height: queue.append((x, y + 1))
            components.append(component)
    if not components:
        raise RuntimeError("Character extraction produced an empty frame")
    largest = set(max(components, key=len))
    for y in range(image.height):
        for x in range(image.width):
            if (x, y) not in largest:
                pixels[x, y] = 0
    image.putalpha(alpha)
    bbox = image.getbbox()
    return image.crop(bbox)


def remove_floor_shadow(image: Image.Image) -> Image.Image:
    """Clear the sheet's pale contact shadow without touching the character."""
    pixels = image.load()
    for y in range(round(image.height * .78), image.height):
        for x in range(image.width):
            red, green, blue, alpha = pixels[x, y]
            if alpha and min(red, green, blue) > 125 and max(red, green, blue) - min(red, green, blue) < 32:
                pixels[x, y] = (red, green, blue, 0)
    bbox = image.getbbox()
    return image.crop(bbox) if bbox else image


def extract_cell(sheet: Image.Image, character: str, column: int, row: int) -> Image.Image:
    left = round(sheet.width * column / 8)
    right = round(sheet.width * (column + 1) / 8)
    top, bottom = ROW_BOUNDS[character][row]
    return connected_background_alpha(sheet.crop((left, top, right, bottom)))


def place_without_resampling(frame: Image.Image, background: tuple[int, int, int, int]) -> Image.Image:
    if frame.width > CANVAS_SIZE[0] or frame.height > CANVAS_SIZE[1]:
        raise RuntimeError(f"Source frame {frame.size} does not fit {CANVAS_SIZE}; refusing to resample it")
    canvas = Image.new("RGBA", CANVAS_SIZE, background)
    position = ((CANVAS_SIZE[0] - frame.width) // 2, CANVAS_SIZE[1] - frame.height - 4)
    canvas.alpha_composite(frame, position)
    return canvas


def normalize_gameplay_frame(frame: Image.Image) -> Image.Image:
    """Give every displayed silhouette the same height and foot baseline."""
    width = round(frame.width * GAMEPLAY_HEIGHT / frame.height)
    resized = frame.resize((width, GAMEPLAY_HEIGHT), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", CANVAS_SIZE, (0, 0, 0, 0))
    canvas.alpha_composite(resized, ((CANVAS_SIZE[0] - width) // 2, CANVAS_SIZE[1] - GAMEPLAY_HEIGHT - 4))
    return canvas


def main() -> None:
    for character, source_path in SOURCES.items():
        sheet = Image.open(source_path).convert("RGB")
        magenta_destination = MAGENTA_OUTPUT / character
        destination = OUTPUT / character
        magenta_destination.mkdir(parents=True, exist_ok=True)
        destination.mkdir(parents=True, exist_ok=True)

        copied = {}
        for name, (column, row) in FRAME_CELLS.items():
            frame = extract_cell(sheet, character, column, row)
            transparent = normalize_gameplay_frame(frame)
            magenta = place_without_resampling(frame, (255, 0, 255, 255))
            transparent.save(destination / f"{name}.png", optimize=True)
            magenta.save(magenta_destination / f"{name}.png", optimize=True)
            copied[name] = transparent

        copied["idle-front-1"].save(destination / "portrait.png", optimize=True)
        place_without_resampling(extract_cell(sheet, character, 0, 0), (255, 0, 255, 255)).save(
            magenta_destination / "portrait.png", optimize=True
        )

    print(f"Copied reference-sheet pixels to {MAGENTA_OUTPUT} and {OUTPUT}")


if __name__ == "__main__":
    main()
