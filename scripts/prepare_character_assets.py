"""Extract clean character frames from the current replacement sprite sheets.

The source sheet remains untouched. Background removal is limited to pale pixels
connected to each crop edge so skin and cream highlights inside the character
silhouette are preserved.
"""

from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCES = {
    "female": ROOT / "References" / "replacements" / "female-sheet.png",
    "male": ROOT / "References" / "replacements" / "male-sheet.png",
}
OUTPUT = ROOT / "assets" / "characters"

CROPS = {
    "female": {
        "portrait": ("female", (62, 20, 205, 270)),
        "idle-front": ("female", (62, 20, 205, 270)),
        "walk-front-1": ("female", (405, 20, 550, 270)),
        "walk-front-2": ("female", (585, 20, 725, 270)),
        "interact-front-1": ("female", (62, 775, 220, 1038)),
        "interact-front-2": ("female", (820, 775, 985, 1038)),
        "idle-side": ("female", (68, 530, 210, 765)),
        "walk-side-1": ("female", (230, 530, 375, 765)),
        "walk-side-2": ("female", (395, 530, 540, 765)),
        "interact-side-1": ("female", (68, 530, 210, 765)),
        "interact-side-2": ("female", (1100, 530, 1250, 765)),
        "idle-back": ("female", (62, 275, 205, 525)),
        "walk-back-1": ("female", (405, 275, 550, 525)),
        "walk-back-2": ("female", (580, 275, 725, 525)),
        "interact-back-1": ("female", (62, 275, 205, 525)),
        "interact-back-2": ("female", (1260, 275, 1410, 525)),
    },
    "male": {
        "portrait": ("male", (62, 15, 215, 280)),
        "idle-front": ("male", (62, 15, 215, 280)),
        "walk-front-1": ("male", (425, 15, 575, 280)),
        "walk-front-2": ("male", (600, 15, 755, 280)),
        "interact-front-1": ("male", (35, 735, 205, 1020)),
        "interact-front-2": ("male", (770, 735, 945, 1020)),
        "idle-back": ("male", (780, 280, 925, 510)),
        "walk-back-1": ("male", (425, 280, 575, 510)),
        "walk-back-2": ("male", (605, 280, 755, 510)),
        "interact-back-1": ("male", (780, 280, 925, 510)),
        "interact-back-2": ("male", (1270, 280, 1420, 510)),
        "idle-side": ("male", (1270, 510, 1425, 742)),
        "walk-side-1": ("male", (230, 510, 385, 742)),
        "walk-side-2": ("male", (425, 510, 575, 742)),
        "interact-side-1": ("male", (62, 510, 215, 742)),
        "interact-side-2": ("male", (1270, 510, 1425, 742)),
    },
}


def connected_background_alpha(image: Image.Image, threshold: int = 72) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    border_samples = []
    for x in range(width):
        border_samples.extend([pixels[x, 0][:3], pixels[x, height - 1][:3]])
    for y in range(height):
        border_samples.extend([pixels[0, y][:3], pixels[width - 1, y][:3]])
    background = tuple(sorted(sample[channel] for sample in border_samples)[len(border_samples) // 2] for channel in range(3))

    def is_background(x: int, y: int) -> bool:
        rgb = pixels[x, y][:3]
        distance = sum((rgb[channel] - background[channel]) ** 2 for channel in range(3)) ** 0.5
        return distance <= threshold or (min(rgb) > 226 and max(rgb) - min(rgb) < 24)

    queue = deque()
    seen = set()
    for x in range(width):
        queue.extend([(x, 0), (x, height - 1)])
    for y in range(height):
        queue.extend([(0, y), (width - 1, y)])

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

    # Labels, frame numbers, and divider rules are isolated from the character.
    # Keeping the largest opaque component removes them without touching the pose.
    source_mask = mask.load()
    component_seen = set()
    components = []
    for start_y in range(height):
        for start_x in range(width):
            if source_mask[start_x, start_y] < 128 or (start_x, start_y) in component_seen:
                continue
            component = []
            component_queue = deque([(start_x, start_y)])
            while component_queue:
                x, y = component_queue.popleft()
                if (x, y) in component_seen or source_mask[x, y] < 128:
                    continue
                component_seen.add((x, y))
                component.append((x, y))
                if x: component_queue.append((x - 1, y))
                if x + 1 < width: component_queue.append((x + 1, y))
                if y: component_queue.append((x, y - 1))
                if y + 1 < height: component_queue.append((x, y + 1))
            components.append(component)
    largest = set(max(components, key=len))
    for y in range(height):
        for x in range(width):
            if (x, y) not in largest:
                source_mask[x, y] = 0

    mask = mask.filter(ImageFilter.GaussianBlur(.35))
    rgba.putalpha(mask)
    bbox = rgba.getbbox()
    if not bbox:
        raise RuntimeError("Character extraction produced an empty frame")
    left, top, right, bottom = bbox
    padding = 5
    return rgba.crop((max(0, left - padding), max(0, top - padding), min(width, right + padding), min(height, bottom + padding)))


def normalize(frame: Image.Image, canvas_size: tuple[int, int]) -> Image.Image:
    canvas_width, canvas_height = canvas_size
    scale = min((canvas_width - 8) / frame.width, (canvas_height - 8) / frame.height)
    resized = frame.resize((round(frame.width * scale), round(frame.height * scale)), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", canvas_size, (0, 0, 0, 0))
    x = (canvas_width - resized.width) // 2
    y = canvas_height - resized.height - 3
    canvas.alpha_composite(resized, (x, y))
    return canvas


def remove_floor_shadow(frame: Image.Image) -> Image.Image:
    """Remove the sheets' pale baked shadow that reads as white between the feet."""
    rgba = frame.copy()
    pixels = rgba.load()
    start_y = round(rgba.height * .78)
    for y in range(start_y, rgba.height):
        for x in range(rgba.width):
            red, green, blue, alpha = pixels[x, y]
            if alpha and min(red, green, blue) > 125 and max(red, green, blue) - min(red, green, blue) < 32:
                pixels[x, y] = (red, green, blue, 0)
    return rgba


def main() -> None:
    sources = {name: Image.open(path) for name, path in SOURCES.items()}
    for character, frames in CROPS.items():
        destination = OUTPUT / character
        destination.mkdir(parents=True, exist_ok=True)
        for name, (source_name, box) in frames.items():
            cleaned = remove_floor_shadow(connected_background_alpha(sources[source_name].crop(box)))
            size = (220, 360) if name == "portrait" else (112, 172)
            normalize(cleaned, size).save(destination / f"{name}.png", optimize=True)
    print(f"Prepared character assets in {OUTPUT}")


if __name__ == "__main__":
    main()
