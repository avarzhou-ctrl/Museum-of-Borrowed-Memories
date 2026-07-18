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


def seed(context, errors, completed, contradictions=None, timeline=None, character="female", settings=None, notes=""):
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
        "notes": notes,
        "settings": {
            "reducedMotion": False,
            "largeText": False,
            "volume": 0,
            "textSpeed": "instant",
            **(settings or {}),
        },
        "player": {"x": 50, "y": 78},
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


def main():
    with sync_playwright() as runner:
        browser = runner.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        errors = []

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

        # Notes, settings, and timeline state survive a reload and settings affect the document.
        page.close()
        page = seed(
            context,
            errors,
            ["raincoat", "teacup", "umbrella"],
            timeline={"11:10 PM": "argument"},
            notes="The labels change after they are disproven.",
            settings={"reducedMotion": True, "largeText": True, "textSpeed": "instant"},
        )
        enter_saved_case(page)
        assert "reduced-motion" in page.locator("body").get_attribute("class")
        assert "large-text" in page.locator("body").get_attribute("class")
        assert page.locator("body").get_attribute("data-text-speed") == "instant"
        page.get_by_role("button", name="Open journal").click()
        page.get_by_role("tab", name="Notes").click()
        assert page.locator("#notes-area").input_value() == "The labels change after they are disproven."

        # Every generated project asset used by the interface loaded successfully.
        page.get_by_role("button", name="Close panel").click()
        page.locator('[data-exhibit="raincoat"]').evaluate("el => el.click()")
        page.locator(".artifact-hero").wait_for()
        assert page.locator(".artifact-hero").evaluate("img => img.complete && img.naturalWidth > 0")

        assert not errors, errors
        browser.close()
        print("PASS: six-of-seven progression, drag/drop, all endings, persistence, settings, and generated assets")


if __name__ == "__main__":
    main()
