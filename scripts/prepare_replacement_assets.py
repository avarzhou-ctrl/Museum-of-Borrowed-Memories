"""Prepare the supplied replacement UI, numeral, and gallery assets."""

from pathlib import Path

from PIL import Image, ImageDraw

from prepare_character_assets import ROOT, connected_background_alpha


SOURCE = ROOT / "References" / "replacements"
UI_OUTPUT = ROOT / "assets" / "ui"

UI_CROPS = {
    "gallery-title": (180, 65, 800, 320),
    "menu": (185, 570, 425, 790),
    "journal": (465, 570, 705, 790),
    "clues": (740, 570, 975, 790),
    "map": (1010, 570, 1250, 790),
    "inspect-prompt": (425, 865, 975, 1038),
}


def remove_checker_background(image: Image.Image) -> Image.Image:
    """Remove the pale checker while preserving disconnected lettering."""
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            red, green, blue, _ = pixels[x, y]
            if min(red, green, blue) > 210 and max(red, green, blue) - min(red, green, blue) < 34:
                pixels[x, y] = (red, green, blue, 0)
    bbox = rgba.getbbox()
    return rgba.crop(bbox) if bbox else rgba


def center_on_canvas(frame: Image.Image, size: tuple[int, int], padding: int = 4) -> Image.Image:
    scale = min((size[0] - padding * 2) / frame.width, (size[1] - padding * 2) / frame.height)
    resized = frame.resize((round(frame.width * scale), round(frame.height * scale)), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    canvas.alpha_composite(resized, ((size[0] - resized.width) // 2, (size[1] - resized.height) // 2))
    return canvas


def prepare_ui() -> None:
    UI_OUTPUT.mkdir(parents=True, exist_ok=True)
    source = Image.open(SOURCE / "ui-sheet.png")
    for name, box in UI_CROPS.items():
        frame = remove_checker_background(source.crop(box)) if name == "gallery-title" else connected_background_alpha(source.crop(box))
        if name == "gallery-title":
            size = (620, 255)
        else:
            size = (256, 256) if name != "inspect-prompt" else (550, 173)
        prepared = center_on_canvas(frame, size)
        if name == "inspect-prompt":
            # Preserve the supplied gold frame while clearing baked copy for live prompt text.
            ImageDraw.Draw(prepared).rounded_rectangle((30, 24, 520, 149), radius=12, fill=(10, 11, 20, 255))
        prepared.save(UI_OUTPUT / f"{name}.png", optimize=True)


def prepare_digits() -> None:
    destination = UI_OUTPUT / "digits"
    destination.mkdir(parents=True, exist_ok=True)
    source = Image.open(SOURCE / "numbers-sheet.png")
    digits = {}
    cell_width = source.width / 5
    cell_height = source.height / 2
    for value in range(10):
        row, column = divmod(value, 5)
        margin_x, margin_y = 35, 22
        box = (
            round(column * cell_width + margin_x),
            round(row * cell_height + margin_y),
            round((column + 1) * cell_width - margin_x),
            round((row + 1) * cell_height - margin_y),
        )
        digit = center_on_canvas(connected_background_alpha(source.crop(box)), (140, 210), 8)
        digit.save(destination / f"{value}.png", optimize=True)
        digits[value] = digit

    floor = Image.new("RGBA", (240, 210), (0, 0, 0, 0))
    floor.alpha_composite(digits[1], (-10, 0))
    floor.alpha_composite(digits[3], (110, 0))
    floor.save(UI_OUTPUT / "floor-thirteen.png", optimize=True)


def prepare_gallery() -> None:
    source = Image.open(SOURCE / "main-gallery.png").convert("RGB")
    source.save(ROOT / "assets" / "generated" / "main-gallery.png", optimize=True)


def main() -> None:
    prepare_ui()
    prepare_digits()
    prepare_gallery()
    print(f"Prepared replacement assets in {UI_OUTPUT} and assets/generated/main-gallery.png")


if __name__ == "__main__":
    main()
