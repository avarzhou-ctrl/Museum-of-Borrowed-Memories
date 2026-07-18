"""Full browser smoke test for the preliminary investigation loop."""

from pathlib import Path
from playwright.sync_api import sync_playwright


BASE_URL = "http://127.0.0.1:4173"
SHOT = Path("/tmp/museum-complete.png")


def restore_memory(page, exhibit, puzzle, choice, check_perspectives=False):
    print(f"Restoring {exhibit}...", flush=True)
    target = page.locator(f'[data-exhibit="{exhibit}"]')
    target.evaluate("el => el.click()")
    assert page.locator("#player").evaluate("el => el.classList.contains('is-interacting')")
    assert "interact-" in page.locator("#player-sprite").evaluate("el => getComputedStyle(el).backgroundImage")
    page.locator(".viewer-modal").wait_for()
    if exhibit == "raincoat":
        page.screenshot(path="/tmp/museum-viewer.png", full_page=True)
    puzzle(page)
    page.locator(".memory-visual").wait_for()
    assert f"{exhibit}.png" in page.locator(".memory-visual").evaluate("el => getComputedStyle(el).backgroundImage")
    if check_perspectives:
        human = page.get_by_role("tab", name="Human Recollection")
        human.click()
        assert human.get_attribute("aria-selected") == "true"
        page.screenshot(path="/tmp/museum-memory-perspective.png", full_page=True)
        page.get_by_role("tab", name="Object Memory").click()
    restored_started = page.evaluate("performance.now()")
    page.get_by_role("button", name=choice, exact=True).click()
    assert page.get_by_role("tab", name="Restored Truth").get_attribute("aria-selected") == "true"
    return_button = page.get_by_role("button", name="Return to gallery")
    if exhibit == "raincoat":
        page.wait_for_timeout(1500)
        assert return_button.count() == 0
    return_button.wait_for()
    if exhibit == "raincoat":
        assert page.evaluate("performance.now()") - restored_started >= 3000
    return_button.click()


def main():
    with sync_playwright() as runner:
        browser = runner.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.set_default_timeout(6000)
        errors = []
        page.on("pageerror", lambda error: (errors.append(str(error)), print(f"PAGE ERROR: {error}", flush=True)))
        page.on("console", lambda message: print(f"CONSOLE {message.type}: {message.text}", flush=True) if message.type == "error" else None)
        page.goto(BASE_URL)
        page.evaluate("localStorage.clear(); sessionStorage.clear()")
        page.reload()

        page.get_by_role("button", name="Enter the Museum").click()
        page.screenshot(path="/tmp/museum-selection.png", full_page=True)
        assert page.locator('[data-character="female"] strong').inner_text() == "Elara Finch"
        assert page.locator('[data-character="male"] strong').inner_text() == "Silas Hart"
        assert page.locator(".character-card > span").count() == 2
        assert page.locator("#select-title").evaluate("el => getComputedStyle(el).fontFamily") == page.locator("html").evaluate("el => getComputedStyle(el).getPropertyValue('--display').trim()")
        assert page.locator("#start-button").evaluate("el => getComputedStyle(el).fontFamily") == page.locator("html").evaluate("el => getComputedStyle(el).getPropertyValue('--sans').trim()")
        page.locator('[data-character="female"]').click()
        page.get_by_role("button", name="Begin Audit").click()
        assert page.locator(".briefing-content").evaluate("el => getComputedStyle(el).paddingTop") == "0px"
        assert page.locator(".briefing-content").evaluate("el => getComputedStyle(el).marginTop") == "0px"
        assert page.locator(".briefing-content > .eyebrow").evaluate("el => [getComputedStyle(el).paddingTop, getComputedStyle(el).paddingBottom]") == ["10.4px", "0px"]
        page.screenshot(path="/tmp/museum-briefing.png", full_page=True)
        page.get_by_role("button", name="Begin investigation").click()
        page.screenshot(path="/tmp/museum-gallery.png", full_page=True)
        assert page.locator("#gallery.painted-gallery").is_visible()
        assert page.locator("#player").evaluate("el => getComputedStyle(el).width") == "100px"
        assert page.locator("#player-sprite").evaluate("el => getComputedStyle(el).height") == "158px"
        assert page.locator(".hud-actions .icon-button").all_inner_texts() == ["Clues", "Journal", "Map", "Menu"]
        assert "menu.png" in page.locator(".hud-icon-menu").evaluate("el => getComputedStyle(el).backgroundImage")
        assert page.get_by_role("heading", name="Main Gallery").is_visible()
        assert page.locator('[data-exhibit="teacup"]').evaluate("el => el.style.getPropertyValue('--x')") == "25%"
        assert page.evaluate("document.elementFromPoint(innerWidth * .25, innerHeight * .82).closest('[data-exhibit]')?.dataset.exhibit") == "teacup"

        page.keyboard.down("ArrowUp")
        page.wait_for_timeout(120)
        page.keyboard.up("ArrowUp")
        page.wait_for_timeout(50)
        assert page.locator("#player").get_attribute("data-direction") == "back"
        assert "idle-back.png" in page.locator("#player-sprite").evaluate("el => getComputedStyle(el).backgroundImage")
        page.keyboard.down("ArrowRight")
        page.wait_for_timeout(120)
        page.keyboard.up("ArrowRight")
        page.wait_for_timeout(50)
        assert page.locator("#player").get_attribute("data-direction") == "side"
        assert "idle-side.png" in page.locator("#player-sprite").evaluate("el => getComputedStyle(el).backgroundImage")
        page.keyboard.down("ArrowLeft")
        page.wait_for_timeout(120)
        page.keyboard.up("ArrowLeft")
        page.wait_for_timeout(50)
        assert "facing-left" in page.locator("#player").get_attribute("class")
        page.keyboard.down("ArrowDown")
        page.wait_for_timeout(120)
        page.keyboard.up("ArrowDown")
        page.wait_for_timeout(50)
        assert page.locator("#player").get_attribute("data-direction") == "front"
        assert "idle-front.png" in page.locator("#player-sprite").evaluate("el => getComputedStyle(el).backgroundImage")
        page.keyboard.down("ArrowUp")
        page.wait_for_timeout(1000)
        page.keyboard.up("ArrowUp")
        page.wait_for_timeout(50)
        player_y = page.locator("#player").evaluate("el => parseFloat(el.style.getPropertyValue('--player-y'))")
        assert player_y >= 66, f"Player crossed the Glass Orchard collision: {player_y}"

        restore_memory(
            page,
            "raincoat",
            lambda p: [p.locator(".droplet").first.click() for _ in range(5)],
            "Celeste Wren",
            check_perspectives=True,
        )

        page.get_by_role("button", name="Open journal").click()
        page.get_by_role("tab", name="Memories").click()
        page.get_by_role("button", name="Replay").click()
        assert page.get_by_role("tab", name="Restored Truth").get_attribute("aria-selected") == "true"
        page.get_by_role("tab", name="Human Recollection").click()
        page.get_by_role("button", name="Close panel").click()

        def rotate(p):
            p.locator("#rotation").fill("72")
            p.get_by_role("button", name="Align cracks").click()

        restore_memory(page, "teacup", rotate, "Mara and Elian argue")

        def toggle(p):
            for _ in range(3):
                p.locator("[data-toggle-umbrella]").click()

        restore_memory(page, "umbrella", toggle, "To frame Celeste")

        def sequence(p):
            for number in ["1", "3", "1", "2"]:
                p.locator(f'[data-sequence="{number}"]').click()

        restore_memory(page, "elevator", sequence, "Mara entering the archive")

        def melody(p):
            for note in ["D", "A", "C", "B"]:
                p.locator(f'[data-note="{note}"]').click()

        restore_memory(page, "musicbox", melody, "The Glass Orchard")
        restore_memory(
            page,
            "guestbook",
            lambda p: p.locator('[data-signature="permanent"]').click(),
            "A disguised memory transfer",
        )

        print("Proving contradictions...", flush=True)
        page.get_by_role("button", name="Open case board").click()
        links = [
            ("mara-spoke", "teacup", "mara-argument"),
            ("mara-entered", "elevator", "archive-fingerprint"),
            ("celeste-left", "raincoat", "returned-in-storm"),
        ]
        for statement, memory, evidence in links:
            page.locator("#statement-select").select_option(statement)
            page.locator("#memory-select").select_option(memory)
            page.locator("#evidence-select").select_option(evidence)
            page.get_by_role("button", name="Pin three-part connection").click()
        page.screenshot(path="/tmp/museum-case-board.png", full_page=True)
        assert page.locator(".evidence-node").count() == 9
        page.get_by_role("button", name="Close panel").click()
        page.get_by_role("button", name="Open journal").click()
        assert page.get_by_text("A Pattern of Protection", exact=True).is_visible()
        page.get_by_role("button", name="Close panel").click()

        def match(p):
            p.locator('[data-match="celeste"]').select_option("Celeste")
            p.locator('[data-match="mara"]').select_option("Mara")
            p.locator('[data-match="elian"]').select_option("Elian")
            p.get_by_role("button", name="Return fragments").click()

        restore_memory(page, "orchard", match, "He is alive inside the Orchard")

        print("Building timeline...", flush=True)
        page.get_by_role("button", name="Open case board").click()
        event_slots = [
            ("guests", "10:55 PM"), ("argument", "11:10 PM"),
            ("celeste", "11:24 PM"), ("elevator", "11:31 PM"),
            ("melody", "11:36 PM"), ("trapped", "11:43 PM"),
            ("planted", "11:50 PM"),
        ]
        for event_id, time in event_slots:
            page.locator(f'[data-event-card="{event_id}"]').click()
            page.locator(f'[data-time-slot="{time}"]').click()

        print("Making accusation...", flush=True)
        page.get_by_role("button", name="Make accusation").click()
        answers = {
            "who": "Mara Vale",
            "how": "the archive melody",
            "where": "the Glass Orchard",
            "why": "Elian was going to expose the museum’s stolen memories",
        }
        for field, answer in answers.items():
            page.locator(f'[data-accusation="{field}"]').select_option(answer)
        page.get_by_role("button", name="Confirm accusation").click()
        page.locator('[data-ending="return"]').click()
        page.get_by_role("heading", name="Return What Was Taken").wait_for()
        page.screenshot(path=str(SHOT), full_page=True)

        assert not errors, f"Browser errors: {errors}"
        assert page.locator(".ending-screen").is_visible()
        assert page.locator('text="virtual joystick"').count() == 0

        page.get_by_role("button", name="Begin another investigation").click()
        page.get_by_role("button", name="Enter the Museum").click()
        page.locator('[data-character="male"]').click()
        page.get_by_role("button", name="Begin Audit").click()
        page.get_by_role("button", name="Begin investigation").click()
        assert page.locator("#player-sprite.investigator-male").is_visible()
        browser.close()
        print("PASS: full investigation reached an ending and both investigators launch")


if __name__ == "__main__":
    main()
