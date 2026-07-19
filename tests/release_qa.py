"""Release-matrix QA for keyboard, accessibility, layout, collision, and art assets."""

import json
from pathlib import Path

from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright


BASE_URL = "http://127.0.0.1:4173"
ROOT = Path(__file__).resolve().parents[1]
SAVE_KEY = "museum-of-borrowed-memories-v1"
REPORT = Path("/tmp/museum-release-qa.json")
CONTACT_SHEET = Path("/tmp/museum-character-contact-sheet.png")

INVESTIGATIONS = {
    "raincoat": (("wet-hem", "familiar-trace"), ("returns", "searches", "recognized")),
    "teacup": (("warm-fracture", "cracked-words"), ("confronts", "sharpens", "condemns")),
    "umbrella": (("wet-tip", "moved-tag"), ("taken", "wetted", "planted")),
    "elevator": (("hidden-control", "mara-print"), ("presses", "opens", "steps-aside")),
    "musicbox": (("missing-tooth", "answering-phrase"), ("phrase", "locks", "awakens")),
    "guestbook": (("covered-paragraph", "altered-copy"), ("promised", "signed", "transferred")),
    "orchard": (("elian-reflection", "living-pulse"), ("melody", "bends", "imprisoned")),
}

CONTRADICTIONS = (
    ("mara-spoke", "teacup", "mara-argument"),
    ("mara-entered", "elevator", "archive-fingerprint"),
    ("celeste-left", "raincoat", "returned-in-storm"),
)

TIMELINE = (
    ("guests", "10:55 PM"),
    ("argument", "11:10 PM"),
    ("celeste", "11:24 PM"),
    ("elevator", "11:31 PM"),
    ("melody", "11:36 PM"),
    ("trapped", "11:43 PM"),
    ("planted", "11:50 PM"),
)


def activate(page, locator):
    locator.focus()
    locator.press("Enter")


def choose_option(page, locator, value):
    options = locator.locator("option").evaluate_all("items => items.map(item => item.value)")
    assert value in options, (value, options)
    locator.focus()
    assert locator.evaluate("el => document.activeElement === el && el.tagName === 'SELECT'")
    # Headless Chromium on macOS cannot synthesize its platform select popup.
    locator.select_option(value)
    assert locator.input_value() == value, (value, locator.input_value())


def wait_for_phase(page):
    if page.locator(".phase-card").count():
        page.locator(".phase-card").wait_for(state="detached", timeout=6000)


def keyboard_restore(page, exhibit):
    activate(page, page.locator(f'[data-exhibit="{exhibit}"]'))
    page.locator(".viewer-modal").wait_for()
    for discovered, tool in enumerate(("Eye", "Hand", "Magnifier"), start=1):
        activate(page, page.get_by_role("button", name=f"Use {tool}"))
        assert page.locator("[data-observation-hotspot]").count() == 1, (
            exhibit, tool, page.locator("#investigation-body").inner_text()
        )
        activate(page, page.locator("[data-observation-hotspot]"))
        assert page.locator(".observation-card.is-known").count() == discovered
    activate(page, page.get_by_role("button", name="Continue to Connect"))
    page.locator(".connect-layout").wait_for()
    connection, fragments = INVESTIGATIONS[exhibit]
    for observation in connection:
        activate(page, page.locator(f'[data-connect-observation="{observation}"]'))
    activate(page, page.get_by_role("button", name="Test connection"))
    activate(page, page.get_by_role("button", name="Continue to Restore"))
    for index, fragment in enumerate(fragments):
        activate(page, page.locator(f'[data-memory-fragment="{fragment}"]'))
        activate(page, page.locator(f'[data-fragment-slot="{index}"]'))
    activate(page, page.get_by_role("button", name="Restore memory"))
    activate(page, page.get_by_role("tab", name="Human Recollection"))
    activate(page, page.get_by_role("tab", name="Restored Truth"))
    page.wait_for_function("document.querySelector('[data-claim-clue]') && !document.querySelector('[data-claim-clue]').disabled")
    activate(page, page.get_by_role("button", name="Record restored clue"))
    activate(page, page.get_by_role("button", name="Return to gallery"))
    wait_for_phase(page)


def solve_keyboard_case(page):
    activate(page, page.get_by_role("button", name="Open case board"))
    for solved, (statement, memory, evidence) in enumerate(CONTRADICTIONS, start=1):
        choose_option(page, page.locator("#statement-select"), statement)
        choose_option(page, page.locator("#memory-select"), memory)
        choose_option(page, page.locator("#evidence-select"), evidence)
        activate(page, page.get_by_role("button", name="Pin three-part connection"))
        assert page.locator(".connection").count() == solved, (
            solved, statement, page.locator("#board-feedback").inner_text()
        )
        wait_for_phase(page)
    page.keyboard.press("Escape")
    release_state = page.evaluate("key => JSON.parse(localStorage.getItem(key))", SAVE_KEY)
    assert len(release_state["completed"]) == 6, release_state
    assert len(release_state["contradictions"]) == 3, release_state
    assert "is-locked" not in page.locator('[data-exhibit="orchard"]').get_attribute("class")
    keyboard_restore(page, "orchard")
    activate(page, page.get_by_role("button", name="Open case board"))
    for event, time in TIMELINE:
        activate(page, page.locator(f'[data-event-card="{event}"]'))
        activate(page, page.locator(f'[data-time-slot="{time}"]'))
    assert page.locator(".timeline-slot.is-correct").count() == 7
    activate(page, page.get_by_role("button", name="Make accusation"))
    activate(page, page.get_by_role("button", name="Mara Vale Deputy curator"))
    choose_option(page, page.locator('[data-accusation="how"]'), "the archive melody")
    choose_option(page, page.locator('[data-accusation="where"]'), "the Glass Orchard")
    choose_option(
        page,
        page.locator('[data-accusation="why"]'),
        "Elian was going to expose the museum’s stolen memories",
    )
    activate(page, page.get_by_role("button", name="Confirm Accusation"))
    activate(page, page.get_by_role("button", name="Free the Curator"))
    for _ in range(12):
        if not page.locator(".cutscene-screen").count():
            break
        page.keyboard.press("ArrowRight")
    page.get_by_role("heading", name="The Curator Remembered").wait_for()


def fresh_keyboard_route(page):
    page.goto(BASE_URL)
    page.evaluate("localStorage.clear(); sessionStorage.clear()")
    page.reload()
    activate(page, page.get_by_role("button", name="Enter the Museum"))
    page.locator(".audio-reminder-card").wait_for(state="detached", timeout=4000)
    page.locator(".cutscene-screen").wait_for()
    for _ in range(10):
        if not page.locator(".cutscene-screen").count():
            break
        page.keyboard.press("ArrowRight")
    page.locator("#selection-screen.is-active").wait_for()
    activate(page, page.locator('[data-character="female"]'))
    activate(page, page.get_by_role("button", name="Begin Audit"))
    wait_for_phase(page)
    activate(page, page.get_by_role("button", name="Begin investigation"))

    page.keyboard.down("ArrowUp")
    page.wait_for_timeout(120)
    page.keyboard.up("ArrowUp")
    assert page.locator("#player").get_attribute("data-direction") == "back"
    page.keyboard.press("j")
    page.get_by_role("heading", name="Auditor’s Journal").wait_for()
    page.keyboard.press("Escape")
    page.keyboard.press("m")
    page.get_by_role("heading", name="Gallery Map").wait_for()
    page.keyboard.press("Escape")

    for exhibit in ("raincoat", "teacup", "umbrella", "elevator", "musicbox", "guestbook"):
        keyboard_restore(page, exhibit)
    solve_keyboard_case(page)
    state = page.evaluate("key => JSON.parse(localStorage.getItem(key))", SAVE_KEY)
    assert len(state["completed"]) == 7
    assert len(state["contradictions"]) >= 3
    assert len(state["timeline"]) == 7
    assert state["ending"] == "remember"


def completed_state(character="female", large_text=False, reduced_motion=True):
    completed = list(INVESTIGATIONS)
    clue_ids = [
        "returned-in-storm", "mara-argument", "planted-umbrella", "archive-fingerprint",
        "archive-melody", "borrowed-consent", "elian-trapped", "pattern-of-protection",
    ]
    return {
        "started": True,
        "character": character,
        "completed": completed,
        "clues": clue_ids,
        "contradictions": [item[0] for item in CONTRADICTIONS],
        "timeline": {time: event for event, time in TIMELINE},
        "investigations": {},
        "seen": {"clues": 8, "people": 4, "memories": 7, "timeline": 7},
        "visitedMemories": completed,
        "settings": {
            "reducedMotion": reduced_motion,
            "largeText": large_text,
            "muted": True,
            "volume": 100,
            "textSpeed": "instant",
        },
        "player": {"x": 50, "y": 78},
        "ending": None,
    }


def enter_seeded(page, state):
    page.add_init_script(
        script=f"localStorage.setItem({json.dumps(SAVE_KEY)}, {json.dumps(json.dumps(state))});"
    )
    page.goto(BASE_URL)
    activate(page, page.get_by_role("button", name="Continue Investigation"))
    page.locator("#museum-screen.is-active").wait_for()


def asset_audit():
    expected_states = {
        "idle-front": 2, "idle-back": 2, "idle-side": 2,
        "walk-front": 4, "walk-back": 4, "walk-side": 4,
        "interact-front": 3, "interact-back": 3, "interact-side": 3,
    }
    thumbs = []
    for character in ("female", "male"):
        folder = ROOT / "assets" / "characters" / "final" / character
        files = sorted(folder.glob("*.png"))
        assert len(files) == sum(expected_states.values()) + 1, (character, len(files))
        for state, count in expected_states.items():
            assert len(list(folder.glob(f"{state}-*.png"))) == count, (character, state)
        dimensions = set()
        for path in files:
            image = Image.open(path).convert("RGBA")
            dimensions.add(image.size)
            alpha = image.getchannel("A")
            bbox = alpha.getbbox()
            assert bbox, path
            assert all(image.getpixel(point)[3] == 0 for point in ((0, 0), (image.width - 1, 0)))
            pixels = image.getdata()
            # A few source-edge pixels retain magenta RGB at alpha 1; reject only visible remnants.
            assert not any(r > 245 and b > 245 and g < 20 and a > 16 for r, g, b, a in pixels), path
            if path.name != "portrait.png":
                assert bbox[3] - bbox[1] == 240, (path, bbox)
            thumb = image.copy()
            thumb.thumbnail((132, 132), Image.Resampling.LANCZOS)
            thumbs.append((character, path.name, thumb))
        assert len(dimensions) == 1, (character, dimensions)

    columns, cell_w, cell_h = 8, 180, 172
    rows = (len(thumbs) + columns - 1) // columns
    sheet = Image.new("RGB", (columns * cell_w, rows * cell_h), "#211726")
    draw = ImageDraw.Draw(sheet)
    for index, (character, name, thumb) in enumerate(thumbs):
        x = (index % columns) * cell_w
        y = (index // columns) * cell_h
        sheet.paste(thumb, (x + (cell_w - thumb.width) // 2, y + 3), thumb)
        draw.text((x + 5, y + 138), f"{character} · {name}", fill="#ead9c0")
    sheet.save(CONTACT_SHEET)

    runtime_text = "\n".join(
        path.read_text(errors="ignore") for path in (ROOT / "index.html", ROOT / "styles.css", ROOT / "src" / "data.js", ROOT / "src" / "game.js")
    ).lower()
    assert "references/" not in runtime_text
    assert "sheet-copies" not in runtime_text


def character_and_collision_matrix(browser, errors, bad_responses):
    for character in ("female", "male"):
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        monitor(page, errors, bad_responses)
        enter_seeded(page, completed_state(character, reduced_motion=False))
        sprite = page.locator("#player-sprite")
        assert f"investigator-{character}" in sprite.get_attribute("class")
        for key, direction, asset in (
            ("ArrowUp", "back", "walk-back-"),
            ("ArrowDown", "front", "walk-front-"),
            ("ArrowRight", "side", "walk-side-"),
            ("ArrowLeft", "side", "walk-side-"),
        ):
            page.keyboard.down(key)
            page.wait_for_timeout(140)
            assert page.locator("#player").get_attribute("data-direction") == direction
            active_asset = sprite.evaluate("el => getComputedStyle(el).backgroundImage")
            assert asset in active_asset, (character, key, active_asset)
            page.keyboard.up(key)
        shadow = page.locator(".contact-shadow").evaluate(
            "el => { const s = getComputedStyle(el); return [parseFloat(s.width), parseFloat(s.height), s.backgroundColor]; }"
        )
        assert shadow[0] > 60 and shadow[1] > 10 and shadow[2] != "rgba(0, 0, 0, 0)", shadow
        position = page.locator("#player").evaluate(
            "el => [el.style.getPropertyValue('--player-x'), el.style.getPropertyValue('--player-y')]"
        )
        activate(page, page.locator('[data-exhibit="raincoat"]'))
        assert "interact-" in sprite.evaluate("el => getComputedStyle(el).backgroundImage")
        page.locator(".viewer-modal").wait_for()
        page.keyboard.press("Escape")
        restored = page.locator("#player").evaluate(
            "el => [el.style.getPropertyValue('--player-x'), el.style.getPropertyValue('--player-y')]"
        )
        assert restored == position, (position, restored)

        collision = page.evaluate("""
            () => {
              const api = window.MUSEUM_COLLISION_API;
              return api.config.obstacles.map(obstacle => {
                const points = obstacle.polygon;
                const center = points.reduce((sum, point) => ({
                  x: sum.x + point.x / points.length,
                  y: sum.y + point.y / points.length
                }), {x: 0, y: 0});
                const approaches = points.flatMap((point, index) => {
                  const next = points[(index + 1) % points.length];
                  return [point, {x: (point.x + next.x) / 2, y: (point.y + next.y) / 2}];
                });
                return {id: obstacle.id, blocked: [...approaches, center].every(point => !api.isWalkablePoint(point))};
              });
            }
        """)
        assert all(item["blocked"] for item in collision), collision
        assert page.evaluate("window.MUSEUM_PLAYER_API.scaleAt(50) < window.MUSEUM_PLAYER_API.scaleAt(95)")
        foreground_z = page.locator(".foreground-left").evaluate("el => Number(getComputedStyle(el).zIndex)")
        player_z = page.locator("#player").evaluate("el => Number(getComputedStyle(el).zIndex)")
        assert foreground_z > player_z

        page.keyboard.press("j")
        activate(page, page.get_by_role("tab", name="Memories"))
        page.locator('[data-journal-tab="memories"][aria-selected="true"]').wait_for()
        assert page.locator("[data-replay]").count() == 7, page.locator("#journal-content").inner_text()
        activate(page, page.locator("[data-replay]").first)
        assert page.get_by_role("tab", name="Restored Truth").is_visible()
        page.keyboard.press("Escape")
        page.close()


def monitor(page, errors, bad_responses):
    page.set_default_timeout(8000)
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
    page.on("response", lambda response: bad_responses.append((response.status, response.url)) if response.status >= 400 else None)


def accessibility_and_viewports(browser, errors, bad_responses):
    viewports = ((1280, 720), (1440, 900), (1920, 1080), (620, 900), (640, 450))
    checked = []
    for width, height in viewports:
        page = browser.new_page(viewport={"width": width, "height": height})
        monitor(page, errors, bad_responses)
        enter_seeded(page, completed_state(large_text=(width == 640)))
        assert page.locator("h1").count() == 1
        assert page.locator('[aria-live="polite"]').count() >= 2
        assert page.locator('[aria-live="assertive"]').count() >= 1
        assert page.locator("body.large-text").count() == (1 if width == 640 else 0)
        if width == 640:
            assert page.locator("body").evaluate("el => parseFloat(getComputedStyle(el).fontSize)") >= 19

        case_opener = page.get_by_role("button", name="Open case board")
        case_opener.focus()
        page.keyboard.press("Space")
        page.locator(".case-modal").wait_for()
        page.keyboard.press("Escape")
        assert page.evaluate("document.activeElement === document.querySelector('[data-panel=\"case\"]')")

        opener = page.get_by_role("button", name="Open journal")
        activate(page, opener)
        dialog = page.get_by_role("dialog")
        assert dialog.get_attribute("aria-labelledby")
        box = dialog.bounding_box()
        assert box and box["x"] >= -1 and box["y"] >= -1
        assert box["x"] + box["width"] <= width + 1
        assert box["y"] + min(box["height"], height) <= height + 1
        focusables = page.locator(
            "#modal-root button:not([disabled]), #modal-root select:not([disabled]), "
            "#modal-root input:not([disabled]), #modal-root textarea, #modal-root [tabindex]:not([tabindex='-1'])"
        )
        page.wait_for_timeout(50)
        focusables.last.focus()
        page.keyboard.press("Tab")
        assert page.evaluate("document.activeElement === document.querySelector('#modal-root button:not([disabled])')")
        page.keyboard.press("Escape")
        assert page.evaluate("document.activeElement === document.querySelector('[data-panel=\"journal\"]')")

        page.keyboard.press("Tab")
        focused = page.locator(":focus")
        focus_style = focused.evaluate("el => { const s = getComputedStyle(el); return [parseFloat(s.outlineWidth), s.outlineStyle]; }")
        assert focus_style[0] >= 3 and focus_style[1] != "none", focus_style

        activate(page, page.get_by_role("button", name="Open case board"))
        page.locator(".case-modal").wait_for()
        assert page.locator(".timeline-slot.is-correct").count() == 7
        assert page.locator("#board-feedback[role=status]").count() == 1
        page.get_by_role("button", name="Make accusation").click()
        page.locator(".accusation-modal").wait_for()
        assert page.locator('[role="group"][aria-label="Choose the culprit"]').count() == 1
        assert page.locator("select[data-accusation]").count() == 4
        page.keyboard.press("Escape")
        checked.append(f"{width}x{height}")
        page.close()
    return checked


def main():
    asset_audit()
    errors = []
    bad_responses = []
    with sync_playwright() as runner:
        browser = runner.chromium.launch(headless=True)
        character_and_collision_matrix(browser, errors, bad_responses)
        checked_viewports = accessibility_and_viewports(browser, errors, bad_responses)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        monitor(page, errors, bad_responses)
        fresh_keyboard_route(page)
        page.close()
        browser.close()

    unique_errors = sorted(set(errors))
    unique_bad = sorted(set(bad_responses))
    assert not unique_errors, unique_errors
    assert not unique_bad, unique_bad
    payload = {
        "status": "pass",
        "keyboardRoute": "fresh state through The Curator Remembered; native select values applied through the browser control API",
        "characters": ["Elara Finch", "Silas Hart"],
        "collisionObstacles": 12,
        "viewports": checked_viewports,
        "accessibility": [
            "focus visibility and return", "modal focus trap", "semantic dialog names",
            "live regions", "non-color timeline status", "large text", "reduced motion",
            "visible narration text and replay controls",
        ],
        "networkErrors": unique_bad,
        "consoleErrors": unique_errors,
        "contactSheet": str(CONTACT_SHEET),
    }
    REPORT.write_text(json.dumps(payload, indent=2))
    print("PASS: release keyboard, accessibility, viewport, collision, character, and asset QA")
    print(json.dumps(payload, indent=2))


if __name__ == "__main__":
    main()
