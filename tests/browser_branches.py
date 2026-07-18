"""Branch, persistence, progression, and accessibility checks for the polished prototype."""

import json
from playwright.sync_api import sync_playwright


BASE_URL = "http://127.0.0.1:4173"
SAVE_KEY = "museum-of-borrowed-memories-v1"

EXHIBIT_CLUES = {
    "raincoat": "returned-in-storm",
    "teacup": "mara-argument",
    "umbrella": "planted-umbrella",
    "elevator": "archive-fingerprint",
    "musicbox": "archive-melody",
    "guestbook": "borrowed-consent",
    "orchard": "elian-trapped",
}

TIMELINE = {
    "10:55 PM": "guests",
    "11:10 PM": "argument",
    "11:24 PM": "celeste",
    "11:31 PM": "elevator",
    "11:36 PM": "melody",
    "11:43 PM": "trapped",
    "11:50 PM": "planted",
}


def seed(context, errors, completed, contradictions=None, timeline=None, character="female", settings=None, investigations=None, player=None):
    clues = [EXHIBIT_CLUES[item] for item in completed]
    if contradictions and len(contradictions) >= 3:
        clues.append("pattern-of-protection")
    state = {
        "started": True,
        "character": character,
        "completed": completed,
        "clues": clues,
        "contradictions": contradictions or [],
        "timeline": timeline or {},
        "investigations": investigations or {},
        "settings": {
            "reducedMotion": False,
            "largeText": False,
            "volume": 0,
            "textSpeed": "instant",
            **(settings or {}),
        },
        "player": player or {"x": 50, "y": 78},
        "ending": None,
    }
    writer = context.new_page()
    writer.goto(BASE_URL)
    writer.evaluate("([key, value]) => localStorage.setItem(key, JSON.stringify(value))", [SAVE_KEY, state])
    writer.close()
    page = context.new_page()
    page.set_default_timeout(7000)
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(BASE_URL)
    return page


def enter_saved_case(page):
    assert page.evaluate("key => JSON.parse(localStorage.getItem(key)).started", SAVE_KEY)
    page.locator("#continue-button").evaluate("button => button.click()")
    page.locator("#museum-screen.is-active").wait_for()


def choose_accusation(page, correct=True):
    page.get_by_role("button", name="Open case board").click()
    page.get_by_role("button", name="Make accusation").click()
    page.get_by_role("button", name="Mara Vale Deputy curator").click()
    page.locator('[data-accusation="how"]').select_option("the archive melody" if correct else "a poisoned teacup")
    page.locator('[data-accusation="where"]').select_option("the Glass Orchard")
    page.locator('[data-accusation="why"]').select_option("Elian was going to expose the museum’s stolen memories")
    page.get_by_role("button", name="Confirm Accusation").click()


def observe_all(page):
    for tool in ("Eye", "Hand", "Magnifier"):
        page.get_by_role("button", name=f"Use {tool}").click()
        page.locator("[data-observation-hotspot]").click()


def main():
    with sync_playwright() as runner:
        browser = runner.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        errors = []

        # The completed-case toggle is test-only, fills coherent endgame state, and restores prior progress.
        page = seed(context, errors, [], timeline={"11:10 PM": "argument"})
        enter_saved_case(page)
        page.get_by_role("button", name="Open menu").click()
        assert page.get_by_role("button", name="Toggle completed test state").count() == 0
        page.close()
        page = seed(context, errors, [], timeline={"11:10 PM": "argument"})
        page.goto(f"{BASE_URL}/?testMode=1")
        enter_saved_case(page)
        page.get_by_role("button", name="Open menu").click()
        completion_toggle = page.get_by_role("button", name="Toggle completed test state")
        assert completion_toggle.get_attribute("aria-pressed") == "false"
        completion_toggle.click()
        assert page.locator("#memory-count").inner_text() == "7 / 7"
        completed_state = page.evaluate("key => JSON.parse(localStorage.getItem(key))", SAVE_KEY)
        assert len(completed_state["completed"]) == 7
        assert len(completed_state["clues"]) == 8
        assert len(completed_state["contradictions"]) == 5
        assert completed_state["timeline"] == TIMELINE
        assert page.get_by_role("button", name="Toggle completed test state").get_attribute("aria-pressed") == "true"
        page.get_by_role("button", name="Toggle completed test state").click()
        restored_state = page.evaluate("key => JSON.parse(localStorage.getItem(key))", SAVE_KEY)
        assert restored_state["completed"] == []
        assert restored_state["clues"] == []
        assert restored_state["contradictions"] == []
        assert restored_state["timeline"] == {"11:10 PM": "argument"}
        assert page.locator("#memory-count").inner_text() == "0 / 7"
        page.close()

        # Saves made before footprint collisions must not reopen inside a display case.
        page = seed(context, errors, [], player={"x": 35.23, "y": 60})
        enter_saved_case(page)
        recovered = page.locator("#player").evaluate("el => ({ x: parseFloat(el.style.getPropertyValue('--player-x')), y: parseFloat(el.style.getPropertyValue('--player-y')) })")
        assert page.evaluate("point => window.MUSEUM_COLLISION_API.isWalkablePoint(point)", recovered), recovered
        assert page.evaluate("key => JSON.parse(localStorage.getItem(key)).player", SAVE_KEY) == recovered
        page.close()

        # The feet anchor can reach the bottom of the gallery without leaving the screen.
        page = seed(context, errors, [])
        enter_saved_case(page)
        page.keyboard.down("ArrowDown")
        page.wait_for_function("parseFloat(document.querySelector('#player').style.getPropertyValue('--player-y')) >= 98.5", timeout=5000)
        page.keyboard.up("ArrowDown")
        page.wait_for_timeout(50)
        bottom_y = page.locator("#player").evaluate("el => parseFloat(el.style.getPropertyValue('--player-y'))")
        # Frame-sized movement stops at the final valid step before the 99% polygon edge.
        assert 98.5 <= bottom_y <= 99, bottom_y
        page.close()

        # Bottom-right instructions remain above the player when their rectangles overlap.
        page = seed(context, errors, [], player={"x": 93, "y": 97})
        enter_saved_case(page)
        layering = page.evaluate("""
            () => {
              const player = document.querySelector('#player');
              const controls = document.querySelector('.controls-hint');
              const a = player.getBoundingClientRect();
              const b = controls.getBoundingClientRect();
              const left = Math.max(a.left, b.left);
              const right = Math.min(a.right, b.right);
              const top = Math.max(a.top, b.top);
              const bottom = Math.min(a.bottom, b.bottom);
              const overlaps = right > left && bottom > top;
              const topElement = overlaps ? document.elementFromPoint((left + right) / 2, (top + bottom) / 2) : null;
              return {
                overlaps,
                controlsOnTop: Boolean(topElement?.closest('.controls-hint')),
                controlsZ: Number(getComputedStyle(controls).zIndex),
                playerZ: Number(getComputedStyle(player).zIndex)
              };
            }
        """)
        assert layering["overlaps"], layering
        assert layering["controlsOnTop"], layering
        assert layering["controlsZ"] > layering["playerZ"], layering
        page.close()

        # Five ordinary exhibits plus three contradictions must unlock the Orchard.
        five_ordinary = ["raincoat", "teacup", "umbrella", "elevator", "musicbox"]
        contradictions = ["mara-spoke", "mara-entered", "celeste-left"]
        page = seed(context, errors, five_ordinary, contradictions)
        enter_saved_case(page)
        orchard = page.locator('[data-exhibit="orchard"]')
        assert orchard.get_attribute("aria-disabled") == "false"
        assert page.locator('[data-exhibit="guestbook"]').get_attribute("aria-disabled") == "false"
        assert page.locator("#museum-screen").get_attribute("data-phase") == "3"
        assert page.locator("#memory-count").inner_text() == "5 / 7"

        # Dragging remains available in addition to the keyboard/click placement path.
        page.get_by_role("button", name="Open case board").click()
        page.locator('[data-event-card="argument"]').drag_to(page.locator('[data-time-slot="11:10 PM"]'))
        assert "is-correct" in (page.locator('[data-time-slot="11:10 PM"]').get_attribute("class") or "")
        page.get_by_role("button", name="Close panel").click()

        # Wrong deductions and fragment orders fail forward; partial work survives reload.
        page.close()
        page = seed(context, errors, [])
        enter_saved_case(page)
        page.locator('[data-exhibit="raincoat"]').evaluate("el => el.click()")
        observe_all(page)
        page.get_by_role("button", name="Continue to Connect").click()
        page.locator('[data-connect-observation="wet-hem"]').click()
        page.locator('[data-connect-observation="fresh-repair"]').click()
        page.get_by_role("button", name="Test connection").click()
        assert "who touched" in page.locator("#investigation-feedback").inner_text()
        assert page.locator(".observation-card.is-known").count() == 3
        page.locator('[data-connect-observation="fresh-repair"]').click()
        page.locator('[data-connect-observation="familiar-trace"]').click()
        page.get_by_role("button", name="Test connection").click()
        page.get_by_role("button", name="Continue to Restore").click()
        for index, fragment in enumerate(("searches", "returns", "recognized")):
            page.locator(f'[data-memory-fragment="{fragment}"]').click()
            page.locator(f'[data-fragment-slot="{index}"]').click()
        page.get_by_role("button", name="Restore memory").click()
        assert "opening fragment" in page.locator("#investigation-feedback").inner_text()
        saved_progress = page.evaluate("key => JSON.parse(localStorage.getItem(key)).investigations.raincoat", SAVE_KEY)
        assert saved_progress["observations"] == ["wet-hem", "familiar-trace", "fresh-repair"]
        assert saved_progress["fragments"] == ["searches", "returns", "recognized"]
        page.reload()
        enter_saved_case(page)
        page.locator('[data-exhibit="raincoat"]').evaluate("el => el.click()")
        assert page.locator('[data-fragment-slot="0"]').get_attribute("data-fragment-id") == "searches"
        page.locator('[data-fragment-slot="0"]').drag_to(page.locator('[data-fragment-slot="1"]'))
        page.locator('[data-memory-fragment="returns"]').drag_to(page.locator('[data-fragment-slot="0"]'))
        page.get_by_role("button", name="Restore memory").click()
        page.get_by_role("button", name="Continue to Human Recollection").click()
        page.get_by_role("button", name="Continue to Restored Truth").click()
        page.get_by_role("button", name="Record restored clue").click()
        page.get_by_role("button", name="Return to gallery").click()
        assert page.evaluate("key => JSON.parse(localStorage.getItem(key)).clues.filter(id => id === 'returned-in-storm').length", SAVE_KEY) == 1
        page.locator('[data-exhibit="raincoat"]').evaluate("el => el.click()")
        page.get_by_text("Restored exhibit", exact=True).wait_for()
        page.get_by_role("button", name="Review restored memory").click()
        assert page.get_by_role("tab", name="Restored Truth").get_attribute("aria-selected") == "true"
        page.get_by_role("button", name="Close panel").click()
        assert page.evaluate("key => JSON.parse(localStorage.getItem(key)).clues.filter(id => id === 'returned-in-storm').length", SAVE_KEY) == 1

        # Unknown progress IDs cannot skip steps; legacy completed saves still open a replay summary.
        page.close()
        page = seed(
            context,
            errors,
            [],
            investigations={
                "raincoat": {
                    "step": "truth",
                    "observations": ["not-real"],
                    "connection": ["not-real", "also-fake"],
                    "connectionProven": True,
                    "fragments": ["fake", "returns", "returns"],
                    "perspective": "restored",
                    "truthUnlocked": 99,
                }
            },
        )
        enter_saved_case(page)
        page.locator('[data-exhibit="raincoat"]').evaluate("el => el.click()")
        page.get_by_text("Step 1 · Observe", exact=True).wait_for()
        migrated = page.evaluate("key => JSON.parse(localStorage.getItem(key)).investigations.raincoat", SAVE_KEY)
        assert migrated["observations"] == []
        assert migrated["step"] == "observe"
        page.get_by_role("button", name="Use Eye").focus()
        page.keyboard.press("Enter")
        page.locator("[data-observation-hotspot]").focus()
        page.keyboard.press("Enter")
        assert page.locator(".observation-card.is-known").count() == 1
        page.get_by_role("button", name="Close panel").click()
        page.close()
        page = seed(context, errors, ["raincoat"])
        enter_saved_case(page)
        page.locator('[data-exhibit="raincoat"]').evaluate("el => el.click()")
        page.get_by_text("Restored exhibit", exact=True).wait_for()
        page.get_by_role("button", name="Close panel").click()

        # Six exhibits, seven clues, five events, and the Orchard produce the strong decision.
        six_route = five_ordinary + ["orchard"]
        five_events = dict(list(TIMELINE.items())[:5])
        for ending_id, title in [
            ("return", "Return What Was Taken"),
            ("break", "Burn the Orchard"),
            ("remember", "The Curator Remembered"),
        ]:
            page.close()
            page = seed(context, errors, six_route, contradictions, five_events)
            enter_saved_case(page)
            choose_accusation(page)
            page.locator(f'[data-ending="{ending_id}"]').click()
            page.get_by_role("heading", name=title).wait_for()
            assert page.locator(".ending-investigator").get_attribute("src").endswith("female/portrait.png")
            assert "assets/" in page.locator(".ending-screen").evaluate("el => el.style.getPropertyValue('--ending-image')")

        # A correct but under-supported accusation gives the weaker ending.
        page.close()
        page = seed(context, errors, ["raincoat", "teacup", "umbrella", "elevator"])
        enter_saved_case(page)
        choose_accusation(page)
        page.get_by_role("heading", name="A Beautiful Lie").wait_for()

        # A wrong accusation gives the collection ending and names the chosen auditor.
        page.close()
        page = seed(context, errors, ["raincoat", "teacup", "umbrella", "elevator"], character="male")
        enter_saved_case(page)
        choose_accusation(page, correct=False)
        page.get_by_role("heading", name="The Visitor Who Almost Remembered").wait_for()
        assert page.locator(".museum-label strong").inner_text() == "Silas Hart"
        assert page.locator(".ending-investigator").get_attribute("src").endswith("male/portrait.png")

        # Settings and timeline state survive a reload and settings affect the document.
        page.close()
        page = seed(
            context,
            errors,
            ["raincoat", "teacup", "umbrella"],
            timeline={"11:10 PM": "argument"},
            settings={"reducedMotion": True, "largeText": True, "textSpeed": "instant"},
        )
        enter_saved_case(page)
        assert "reduced-motion" in page.locator("body").get_attribute("class")
        assert "large-text" in page.locator("body").get_attribute("class")
        assert page.locator("body").get_attribute("data-text-speed") == "instant"
        page.get_by_role("button", name="Open journal").click()
        assert page.get_by_role("tab").all_inner_texts() == ["Clues", "People", "Memories", "Timeline"]
        assert page.locator("#notes-area").count() == 0
        page.get_by_role("tab", name="People").click()
        page.screenshot(path="/tmp/museum-journal-people.png", full_page=True)
        page.get_by_role("tab", name="Timeline").click()
        page.screenshot(path="/tmp/museum-journal-timeline.png", full_page=True)

        # Every generated project asset used by the interface loaded successfully.
        page.get_by_role("button", name="Close panel").click()
        page.locator('[data-exhibit="raincoat"]').evaluate("el => el.click()")
        page.locator(".artifact-hero").wait_for()
        page.wait_for_function("document.querySelector('.artifact-hero')?.complete && document.querySelector('.artifact-hero').naturalWidth > 0")
        assert page.locator(".artifact-hero").evaluate("img => img.complete && img.naturalWidth > 0")
        assert page.locator(".investigation-tools").count() == 0

        assert not errors, errors
        browser.close()
        print("PASS: six-of-seven progression, drag/drop, all endings, persistence, settings, and generated assets")


if __name__ == "__main__":
    main()
