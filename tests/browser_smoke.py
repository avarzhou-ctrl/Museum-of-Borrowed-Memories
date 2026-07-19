"""Full browser smoke test for the Observe → Connect → Restore investigation loop."""

from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright


BASE_URL = "http://127.0.0.1:4173"
SHOT = Path("/tmp/museum-complete.png")
ROOT = Path(__file__).resolve().parents[1]


INVESTIGATIONS = {
    "raincoat": (("wet-hem", "familiar-trace"), ("returns", "searches", "recognized")),
    "teacup": (("warm-fracture", "cracked-words"), ("confronts", "sharpens", "condemns")),
    "umbrella": (("wet-tip", "moved-tag"), ("taken", "wetted", "planted")),
    "elevator": (("hidden-control", "mara-print"), ("presses", "opens", "steps-aside")),
    "musicbox": (("missing-tooth", "answering-phrase"), ("phrase", "locks", "awakens")),
    "guestbook": (("covered-paragraph", "altered-copy"), ("promised", "signed", "transferred")),
    "orchard": (("elian-reflection", "living-pulse"), ("melody", "bends", "imprisoned")),
}


def finish_cutscene(page):
    if page.locator(".audio-reminder-card").count():
        page.locator(".audio-reminder-card").wait_for(state="detached", timeout=4000)
        page.locator(".cutscene-screen").wait_for()
    for _ in range(12):
        if page.locator(".cutscene-screen").count() == 0:
            return
        page.locator("[data-cutscene-next]").click()
    raise AssertionError("Cutscene did not finish within its expected slide count")


def restore_memory(page, exhibit, check_perspectives=False, expected_phase=None):
    print(f"Restoring {exhibit}...", flush=True)
    target = page.locator(f'[data-exhibit="{exhibit}"]')
    target.evaluate("el => el.click()")
    if exhibit == "raincoat":
        assert page.locator("#player").evaluate("el => el.classList.contains('is-interacting')")
        assert "interact-" in page.locator("#player-sprite").evaluate("el => getComputedStyle(el).backgroundImage")
    page.locator(".viewer-modal").wait_for()
    assert target.get_attribute("data-notification") == "false"
    if exhibit == "raincoat":
        page.screenshot(path="/tmp/museum-viewer.png", full_page=True)
    assert page.get_by_text("Observe", exact=True).is_visible()
    page.wait_for_function("document.querySelector('.artifact-hero')?.complete && document.querySelector('.artifact-hero').naturalWidth > 0")
    assert page.locator(".artifact-hero").evaluate("img => img.complete && img.naturalWidth > 0")
    observe_artifact_src = page.locator(".artifact-hero").get_attribute("src")
    tool_icons = page.locator("[data-investigation-tool] img")
    assert tool_icons.count() == 3
    assert tool_icons.evaluate_all("icons => icons.every(icon => icon.complete && icon.naturalWidth > 0 && icon.src.includes('/assets/ui/generated/tool-'))")
    active_tool = page.locator('[data-investigation-tool][aria-pressed="true"]')
    assert active_tool.evaluate("el => getComputedStyle(el).backgroundColor") == "rgba(0, 0, 0, 0)"
    assert "drop-shadow" in active_tool.locator("img").evaluate("el => getComputedStyle(el).filter")

    for tool in ("Eye", "Hand", "Magnifier"):
        page.get_by_role("button", name=f"Use {tool}").click()
        hotspot = page.locator("[data-observation-hotspot]")
        assert hotspot.locator('img[src="assets/ui/generated/memory-hotspot-shimmer.png"]').count() == 1
        assert hotspot.evaluate("el => getComputedStyle(el).borderRadius") == "0px"
        assert hotspot.evaluate("el => getComputedStyle(el).backgroundColor") == "rgba(0, 0, 0, 0)"
        hotspot.click()

    assert page.locator(".observation-card.is-known").count() == 3
    assert page.locator('.observation-hotspot.is-discovered img[src="assets/ui/generated/memory-hotspot-shimmer.png"]').count() == 3
    page.get_by_role("button", name="Continue to Connect").click()
    assert page.locator(".investigation-tools").count() == 0
    connection, fragments = INVESTIGATIONS[exhibit]
    for observation in connection:
        page.locator(f'[data-connect-observation="{observation}"]').click()
    page.get_by_role("button", name="Test connection").click()
    assert page.locator(".challenged-statement.is-disproven").is_visible()
    assert page.locator(".connection-thread-preview").count() == 0
    assert page.locator(".challenged-statement.is-disproven").evaluate("el => getComputedStyle(el, '::after').borderTopWidth") == "1px"
    if exhibit == "raincoat":
        page.screenshot(path="/tmp/museum-connect.png", full_page=True)
    page.get_by_role("button", name="Continue to Restore").click()

    restore_visual = page.locator(".restore-memory")
    assert observe_artifact_src in restore_visual.evaluate("el => getComputedStyle(el).backgroundImage")
    assert f"artifacts/{exhibit}.png" in restore_visual.evaluate("el => getComputedStyle(el).backgroundImage")
    assert restore_visual.get_attribute("data-repair-progress") == "0"
    assert page.locator(".restore-layout svg").count() == 0
    assert page.locator(".memory-fragment-image").count() == 3
    bank_order = page.locator("[data-memory-fragment]").evaluate_all("items => items.map(item => item.dataset.memoryFragment)")
    assert set(bank_order) == set(fragments)
    assert bank_order != list(fragments), (exhibit, bank_order)
    assert page.evaluate("([id]) => JSON.parse(localStorage.getItem('museum-of-borrowed-memories-v1')).investigations[id].fragmentOrder", [exhibit]) == bank_order
    fragment_background_size = page.locator(".memory-fragment-image").first.evaluate("el => getComputedStyle(el).backgroundSize")
    assert all(value.strip() == "300%" for value in fragment_background_size.split(",")), fragment_background_size
    fragment_background_repeat = page.locator(".memory-fragment-image").first.evaluate("el => getComputedStyle(el).backgroundRepeat")
    assert all(value.strip() == "no-repeat" for value in fragment_background_repeat.split(",")), fragment_background_repeat
    assert page.locator(".fragment-slot .slot-number").count() == 3
    assert page.locator(".restore-action").is_disabled()
    initial_filter = restore_visual.evaluate("el => getComputedStyle(el).filter")
    for index, fragment in enumerate(fragments):
        page.locator(f'[data-memory-fragment="{fragment}"]').click()
        page.locator(f'[data-fragment-slot="{index}"]').click()
    assert restore_visual.get_attribute("data-repair-progress") == "3"
    assert restore_visual.evaluate("el => getComputedStyle(el).filter") != initial_filter
    assert page.locator(".fragment-bank.is-empty").is_visible()
    assert page.get_by_text("Sequence assembled", exact=True).is_visible()
    assert page.locator(".restore-action.is-ready").is_enabled()
    if exhibit == "raincoat":
        page.screenshot(path="/tmp/museum-restore.png", full_page=True)
    page.get_by_role("button", name="Restore memory").click()

    assert page.locator(".investigation-tools").count() == 0
    page.wait_for_function("window.MUSEUM_AUDIO_API.status().narrationPlaying")
    assert page.evaluate("window.MUSEUM_AUDIO_API.status().narrationKey") == f"{exhibit}:object"
    for label in ("Object Memory", "Human Recollection", "Restored Truth"):
        assert page.get_by_role("tab", name=label).is_enabled()
    assert page.get_by_role("tab", name="Object Memory").get_attribute("aria-selected") == "true"
    page.get_by_role("tab", name="Human Recollection").click()
    page.wait_for_function(f"window.MUSEUM_AUDIO_API.status().narrationKey === '{exhibit}:human'")
    assert page.get_by_role("tab", name="Human Recollection").get_attribute("aria-selected") == "true"
    if check_perspectives:
        page.screenshot(path="/tmp/museum-memory-perspective.png", full_page=True)
    page.get_by_role("tab", name="Restored Truth").click()
    page.wait_for_function(f"window.MUSEUM_AUDIO_API.status().narrationKey === '{exhibit}:restored'")
    assert page.get_by_role("tab", name="Restored Truth").get_attribute("aria-selected") == "true"
    page.wait_for_function("document.querySelector('[data-claim-clue]') && !document.querySelector('[data-claim-clue]').disabled")
    if exhibit == "raincoat":
        page.screenshot(path="/tmp/museum-truth.png", full_page=True)
    page.get_by_role("button", name="Record restored clue").click()
    assert not page.evaluate("window.MUSEUM_AUDIO_API.status().narrationPlaying")
    assert page.locator(".phase-card").count() == 0
    page.get_by_role("button", name="Return to gallery").click()
    if expected_phase:
        number, name = expected_phase
        phase_card = page.locator(".phase-card")
        phase_card.wait_for(state="visible")
        assert phase_card.get_by_text(f"Phase {number}", exact=True).is_visible()
        assert phase_card.get_by_role("heading", name=name).is_visible()
        phase_card.wait_for(state="detached", timeout=6000)


def main():
    assert (ROOT / "assets" / "music" / "backing-track.mp3").stat().st_size > 3_000_000
    narration_stems = ("raincoat", "teacup", "umbrella", "button", "music", "guestbook", "orchard")
    for stem in narration_stems:
        for perspective in ("object", "human", "restored"):
            assert (ROOT / "assets" / "audio" / "memories" / f"{stem}-{perspective}.wav").stat().st_size > 300_000
    cutscene_narration = (
        "start", "the-curator-remembered", "return-what-was-taken", "burn-the-orchard",
        "a-beautiful-lie", "the-visitor-who-almost-remembered",
    )
    for name in cutscene_narration:
        assert (ROOT / "assets" / "audio" / "cutscenes" / f"{name}.wav").stat().st_size > 1_000_000
    cutscene_slide_counts = {
        "start": 8,
        "the-curator-remembered": 7,
        "return-what-was-taken": 7,
        "burn-the-orchard": 8,
        "a-beautiful-lie": 6,
        "the-visitor-who-almost-remembered": 7,
    }
    for name, count in cutscene_slide_counts.items():
        clips = sorted((ROOT / "assets" / "audio" / "cutscenes" / "slides" / name).glob("slide-*.wav"))
        assert len(clips) == count, (name, len(clips))
        assert all(clip.stat().st_size > 8_000 for clip in clips)
    assert (ROOT / "assets" / "audio" / "footsteps" / "stone-floor.wav").stat().st_size > 500_000
    for name in ("title-wordmark.png", "title-button-enter.png", "title-button-continue.png"):
        asset = Image.open(ROOT / "assets" / "generated" / name).convert("RGBA")
        assert asset.getchannel("A").getbbox()
        assert asset.getpixel((0, 0))[3] == 0
    for character in ("female", "male"):
        frames = (ROOT / "assets" / "characters" / "final" / character).glob("*.png")
        heights = set()
        for path in frames:
            bbox = Image.open(path).convert("RGBA").getchannel("A").getbbox()
            heights.add(bbox[3] - bbox[1])
        assert heights == {240}, (character, heights)

    with sync_playwright() as runner:
        browser = runner.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.set_default_timeout(6000)
        errors = []
        page.on("pageerror", lambda error: (errors.append(str(error)), print(f"PAGE ERROR: {error}", flush=True)))
        page.on("console", lambda message: print(f"CONSOLE {message.type}: {message.text}", flush=True) if message.type == "error" else None)
        page.goto(BASE_URL)
        assert page.locator('link[href^="styles.css?v="]').count() == 1
        assert page.locator('script[src^="src/data.js?v="]').count() == 1
        assert page.locator('script[src^="src/room-collision.js?v="]').count() == 1
        assert page.locator('script[src^="src/game.js?v="]').count() == 1
        page.evaluate("localStorage.clear(); sessionStorage.clear()")
        page.reload()

        title_wordmark = page.locator("#game-title img")
        title_wordmark.wait_for(state="visible")
        assert page.locator(".title-copy > .eyebrow, .title-copy > .title-blurb").count() == 0
        assert title_wordmark.get_attribute("src") == "assets/generated/title-wordmark.png"
        assert title_wordmark.get_attribute("alt") == "Museum of Borrowed Memories"
        page.wait_for_function("document.querySelector('#game-title img').complete && document.querySelector('#game-title img').naturalWidth > 0")
        title_layout = page.locator(".title-copy").evaluate("el => { const s = getComputedStyle(el); return {position:s.position, align:s.alignItems, justify:s.justifyContent, text:s.textAlign}; }")
        assert title_layout == {"position": "absolute", "align": "center", "justify": "center", "text": "center"}
        assert "title-button-enter.png" in page.locator("#begin-button").evaluate("el => getComputedStyle(el).backgroundImage")
        assert "title-button-continue.png" in page.locator("#continue-button").evaluate("el => getComputedStyle(el).backgroundImage")
        resting_title_filter = title_wordmark.evaluate("el => getComputedStyle(el).filter")
        title_wordmark.hover()
        page.wait_for_timeout(450)
        glowing_title_filter = title_wordmark.evaluate("el => getComputedStyle(el).filter")
        assert glowing_title_filter != resting_title_filter
        assert glowing_title_filter.count("drop-shadow") >= 3
        page.screenshot(path="/tmp/museum-title-centered.png", full_page=True)

        page.wait_for_function("window.MUSEUM_AUDIO_API?.status().musicPlaying", timeout=10000)
        title_audio = page.evaluate("window.MUSEUM_AUDIO_API.status()")
        assert title_audio["musicPlaying"] and title_audio["musicContinuous"], title_audio
        assert title_audio["cueLevel"] > title_audio["musicLevel"], title_audio
        page.get_by_role("button", name="Enter the Museum").click()
        page.wait_for_function("window.MUSEUM_AUDIO_API?.status().unlocked")
        reminder = page.locator(".audio-reminder-card")
        reminder.wait_for(state="visible")
        assert reminder.get_by_text("For the full experience", exact=True).is_visible()
        assert reminder.get_by_role("heading", name="Turn up your audio").is_visible()
        assert reminder.evaluate("el => getComputedStyle(el).backgroundColor") == "rgb(2, 2, 4)"
        assert page.locator(".cutscene-screen").count() == 0
        reminder.wait_for(state="detached", timeout=4000)
        page.wait_for_function("window.MUSEUM_AUDIO_API?.status().cutsceneNarrationKey === 'start:0'")
        assert page.evaluate("window.MUSEUM_AUDIO_API.status().cutsceneNarrationPlaying")
        page.wait_for_function("window.MUSEUM_AUDIO_API?.status().musicPlaying", timeout=10000)
        audio = page.evaluate("window.MUSEUM_AUDIO_API.status()")
        assert audio["supported"] and audio["ambienceNodeCount"] == 7, audio
        assert audio["musicPlaying"] and audio["musicLooping"] and audio["musicDuration"] > 150, audio
        assert audio["musicContinuous"] and audio["cueLevel"] > audio["musicLevel"], audio
        assert abs(audio["effectiveLevel"] - 1) < .001, audio
        assert "start-cutscene.png" in page.locator(".cutscene-start").evaluate("el => getComputedStyle(el).backgroundImage")
        assert page.locator(".cutscene-start .eyebrow, .cutscene-start h2, .cutscene-progress").count() == 0
        assert page.get_by_role("button", name="Next scene").inner_text() == ">"
        assert page.get_by_role("button", name="Next scene").evaluate("el => getComputedStyle(el).borderRadius") == "50%"
        assert page.locator(".cutscene-copy").evaluate("el => getComputedStyle(el).animationName") == "cutscene-copy-rise"
        page.get_by_role("button", name="Next scene").click()
        page.wait_for_function("window.MUSEUM_AUDIO_API.status().cutsceneNarrationKey === 'start:1'")
        page.wait_for_function("document.querySelector('.cutscene-copy')?.classList.contains('is-visible')")
        assert page.locator(".cutscene-copy").evaluate("el => getComputedStyle(el).animationName") == "cutscene-copy-rise"
        assert page.locator("[data-cutscene-skip]").get_attribute("class").endswith("is-hidden")
        finish_cutscene(page)
        assert not page.evaluate("window.MUSEUM_AUDIO_API.status().cutsceneNarrationPlaying")
        page.screenshot(path="/tmp/museum-selection.png", full_page=True)
        assert page.locator('[data-character="female"] strong').inner_text() == "Elara Finch"
        assert page.locator('[data-character="male"] strong').inner_text() == "Silas Hart"
        assert page.locator(".character-card > span").count() == 2
        assert "/assets/characters/final/female/portrait.png" in page.locator(".investigator-female.is-preview").evaluate("el => getComputedStyle(el).backgroundImage")
        assert "/assets/characters/final/male/portrait.png" in page.locator(".investigator-male.is-preview").evaluate("el => getComputedStyle(el).backgroundImage")
        assert page.locator("#select-title").evaluate("el => getComputedStyle(el).fontFamily") == page.locator("html").evaluate("el => getComputedStyle(el).getPropertyValue('--display').trim()")
        assert page.locator("#start-button").evaluate("el => getComputedStyle(el).fontFamily") == page.locator("html").evaluate("el => getComputedStyle(el).getPropertyValue('--sans').trim()")
        page.locator('[data-character="female"]').click()
        page.get_by_role("button", name="Begin Audit").click()
        phase_card = page.locator(".phase-card")
        phase_card.wait_for(state="visible")
        assert phase_card.get_by_text("Phase I", exact=True).is_visible()
        assert phase_card.get_by_role("heading", name="The Quiet Gallery").is_visible()
        phase_card.wait_for(state="detached", timeout=6000)
        assert page.locator(".briefing-content").evaluate("el => getComputedStyle(el).paddingTop") == "0px"
        assert page.locator(".briefing-content").evaluate("el => getComputedStyle(el).marginTop") == "0px"
        assert page.locator(".briefing-content > .eyebrow").evaluate("el => [getComputedStyle(el).paddingTop, getComputedStyle(el).paddingBottom]") == ["10.4px", "0px"]
        page.screenshot(path="/tmp/museum-briefing.png", full_page=True)
        page.get_by_role("button", name="Begin investigation").click()
        page.screenshot(path="/tmp/museum-gallery.png", full_page=True)
        assert page.locator("#gallery.painted-gallery").is_visible()
        assert page.locator("#player").evaluate("el => getComputedStyle(el).width") == "150px"
        assert page.locator("#player-sprite").evaluate("el => getComputedStyle(el).height") == "237px"
        assert page.locator("#player-sprite").evaluate("el => getComputedStyle(el).backgroundPositionY") == "100%"
        assert "/assets/characters/final/female/idle-front-" in page.locator("#player-sprite").evaluate("el => getComputedStyle(el).backgroundImage")
        assert page.locator(".hud-actions .icon-button").all_inner_texts() == ["Clues", "Journal", "Menu"]
        assert page.locator('[data-panel="journal"]').get_attribute("data-notification") == "false"
        assert page.locator('[data-panel="case"]').get_attribute("data-notification") == "false"
        assert page.locator('.exhibit[data-notification="true"]').count() == 3
        assert page.locator('[data-exhibit="raincoat"]').get_attribute("aria-label").endswith(", unvisited memory")
        assert page.locator('[data-exhibit="elevator"]').get_attribute("data-notification") == "false"
        notification_style = page.locator('[data-exhibit="raincoat"]').evaluate("el => { const s = getComputedStyle(el, '::after'); return [s.content, s.borderRadius, s.width]; }")
        assert notification_style == ['"!"', "50%", "20px"]
        assert "menu.png" in page.locator(".hud-icon-menu").evaluate("el => getComputedStyle(el).backgroundImage")
        assert page.get_by_role("heading", name="Main Gallery").is_visible()
        typography = page.evaluate("""
            () => {
              const root = getComputedStyle(document.documentElement);
              const family = selector => getComputedStyle(document.querySelector(selector)).fontFamily;
              const size = selector => parseFloat(getComputedStyle(document.querySelector(selector)).fontSize);
              return {
                tokens: {
                  display: root.getPropertyValue('--display').trim(),
                  serif: root.getPropertyValue('--serif').trim(),
                  sans: root.getPropertyValue('--sans').trim()
                },
                families: {
                  brand: family('.gallery-brand'), room: family('.location-block h2'),
                  objective: family('.objective'), hud: family('.icon-button'),
                  progressLabel: family('.progress-card strong'), progressValue: family('#memory-count'),
                  movement: family('.controls-hint'), key: family('.controls-hint kbd'),
                  prompt: family('.interaction-prompt')
                },
                sizes: { hud: size('.icon-button'), movement: size('.controls-hint') }
              };
            }
        """)
        for role in ("brand", "room", "progressLabel"):
            assert typography["families"][role] == typography["tokens"]["display"], (role, typography)
        assert typography["families"]["objective"] == typography["tokens"]["serif"]
        for role in ("hud", "progressValue", "movement", "key", "prompt"):
            assert typography["families"][role] == typography["tokens"]["sans"], (role, typography)
        assert typography["sizes"]["hud"] >= 13.12
        assert typography["sizes"]["movement"] >= 13.12
        assert page.locator(".controls-hint").evaluate("el => [getComputedStyle(el).borderStyle, getComputedStyle(el).backgroundImage, getComputedStyle(el).boxShadow]") == ["none", "none", "none"]
        expected_hitboxes = {
            "raincoat": ("17.97%", "58.40%", "11.90vw", "44.31vh"),
            "teacup": ("28.41%", "80.34%", "9.69vw", "28.48vh"),
            "umbrella": ("35.23%", "55.84%", "8.01vw", "33.69vh"),
            "orchard": ("49.52%", "49.31%", "13.88vw", "32.94vh"),
            "musicbox": ("63.01%", "57.28%", "8.55vw", "28.06vh"),
            "guestbook": ("75.87%", "70.94%", "18.36vw", "31.35vh"),
            "elevator": ("93.09%", "75.45%", "9.99vw", "36.77vh"),
        }
        for exhibit, bounds in expected_hitboxes.items():
            target = page.locator(f'[data-exhibit="{exhibit}"]')
            assert target.evaluate("el => ['--x', '--y', '--hit-w', '--hit-h'].map(name => el.style.getPropertyValue(name))") == list(bounds)
            assert target.evaluate("el => getComputedStyle(el).borderRadius") == "0px"

        collision_report = page.evaluate("""
            () => {
              const api = window.MUSEUM_COLLISION_API;
              return {
                exhibitIds: api.config.obstacles.filter(item => item.exhibitId).map(item => item.exhibitId).sort(),
                obstacleCount: api.config.obstacles.length,
                allEdgesBlocked: api.config.obstacles.every(obstacle => {
                  const vertices = obstacle.polygon;
                  const edgeCenters = vertices.map((point, index) => {
                    const next = vertices[(index + 1) % vertices.length];
                    return { x: (point.x + next.x) / 2, y: (point.y + next.y) / 2 };
                  });
                  const center = vertices.reduce((sum, point) => ({
                    x: sum.x + point.x / vertices.length,
                    y: sum.y + point.y / vertices.length
                  }), { x: 0, y: 0 });
                  return [...vertices, ...edgeCenters, center].every(point => !api.isWalkablePoint(point));
                }),
                defaultPositionOpen: api.isWalkablePoint({ x: 50, y: 78 })
              };
            }
        """)
        assert collision_report["exhibitIds"] == ["elevator", "guestbook", "musicbox", "orchard", "raincoat", "teacup", "umbrella"]
        assert collision_report["obstacleCount"] >= 12
        assert collision_report["allEdgesBlocked"]
        assert collision_report["defaultPositionOpen"]

        depth_report = page.evaluate("""
            () => ({
              far: window.MUSEUM_PLAYER_API.scaleAt(44),
              middle: window.MUSEUM_PLAYER_API.scaleAt(70),
              near: window.MUSEUM_PLAYER_API.scaleAt(96),
              current: window.MUSEUM_PLAYER_API.status(),
              css: Number(document.querySelector('#player').style.getPropertyValue('--player-scale'))
            })
        """)
        assert abs(depth_report["far"] - .66) < .001
        assert depth_report["far"] < depth_report["middle"] < depth_report["near"]
        assert abs(depth_report["near"] - 1.03) < .001
        assert abs(depth_report["current"]["scale"] - depth_report["css"]) < .001

        page.keyboard.press("F8")
        assert page.locator("#collision-debug-overlay").is_visible()
        assert page.locator("[data-debug-obstacle]").count() == collision_report["obstacleCount"]
        assert page.locator("[data-debug-feet]").get_attribute("cx") == "50"
        page.keyboard.press("F8")
        assert page.locator("#collision-debug-overlay").is_hidden()

        page.keyboard.down("ArrowUp")
        page.wait_for_timeout(120)
        page.wait_for_function("window.MUSEUM_AUDIO_API.status().footstepsPlaying")
        walking_audio = page.evaluate("window.MUSEUM_AUDIO_API.status()")
        assert walking_audio["footstepLevel"] > 0
        page.keyboard.up("ArrowUp")
        page.wait_for_timeout(50)
        page.wait_for_function("!window.MUSEUM_AUDIO_API.status().footstepsPlaying")
        assert page.locator("#player").get_attribute("data-direction") == "back"
        assert "idle-back-" in page.locator("#player-sprite").evaluate("el => getComputedStyle(el).backgroundImage")
        page.keyboard.down("ArrowRight")
        page.wait_for_timeout(120)
        page.keyboard.up("ArrowRight")
        page.wait_for_timeout(50)
        assert page.locator("#player").get_attribute("data-direction") == "side"
        assert "idle-side-" in page.locator("#player-sprite").evaluate("el => getComputedStyle(el).backgroundImage")
        page.keyboard.down("ArrowLeft")
        page.wait_for_timeout(120)
        page.keyboard.up("ArrowLeft")
        page.wait_for_timeout(50)
        assert "facing-left" in page.locator("#player").get_attribute("class")
        page.keyboard.down("ArrowDown")
        page.wait_for_timeout(120)
        page.keyboard.up("ArrowDown")
        page.wait_for_function("getComputedStyle(document.querySelector('#player-sprite')).backgroundImage.includes('idle-front-')")
        assert page.locator("#player").get_attribute("data-direction") == "front"
        front_idle_image = page.locator("#player-sprite").evaluate("el => getComputedStyle(el).backgroundImage")
        assert "idle-front-" in front_idle_image, front_idle_image
        page.keyboard.down("ArrowUp")
        page.wait_for_timeout(1000)
        page.keyboard.up("ArrowUp")
        page.wait_for_timeout(50)
        player_y = page.locator("#player").evaluate("el => parseFloat(el.style.getPropertyValue('--player-y'))")
        assert player_y >= 66.55, f"Player's feet anchor crossed the Glass Orchard obstacle: {player_y}"
        page.keyboard.down("ArrowLeft")
        page.wait_for_timeout(1000)
        page.keyboard.up("ArrowLeft")
        page.wait_for_timeout(50)
        player_x = page.locator("#player").evaluate("el => parseFloat(el.style.getPropertyValue('--player-x'))")
        assert player_x >= 39.9, f"Player's feet anchor crossed the Silver Umbrella obstacle: {player_x}"

        restore_memory(page, "raincoat", check_perspectives=True)

        assert page.locator('[data-exhibit="raincoat"]').get_attribute("data-notification") == "false"
        assert page.locator('.exhibit[data-notification="true"]').count() == 2
        assert page.locator('[data-panel="journal"]').get_attribute("data-notification") == "true"
        assert page.locator('[data-panel="case"]').get_attribute("data-notification") == "false"
        page.get_by_role("button", name="Open case board").click()
        assert page.get_by_text("The board is still asleep.").is_visible()
        page.get_by_role("button", name="Close panel").click()
        page.get_by_role("button", name="Open journal").click()
        assert page.locator('[data-journal-tab="clues"]').get_attribute("data-notification") == "false"
        assert page.locator('[data-journal-tab="memories"]').get_attribute("data-notification") == "true"
        assert page.locator('[data-journal-tab="timeline"]').get_attribute("data-notification") == "true"
        page.get_by_role("tab", name="Memories").click()
        page.screenshot(path="/tmp/museum-journal-memory.png", full_page=True)
        page.set_viewport_size({"width": 620, "height": 900})
        page.screenshot(path="/tmp/museum-journal-memory-narrow.png", full_page=True)
        memory_card_box = page.locator(".memory-card").bounding_box()
        replay_box = page.get_by_role("button", name="Replay").bounding_box()
        assert memory_card_box["y"] + memory_card_box["height"] - (replay_box["y"] + replay_box["height"]) >= 48
        assert page.locator(".journal-paper .clue-grid").evaluate("el => getComputedStyle(el).gridTemplateColumns.split(' ').length") == 1
        page.set_viewport_size({"width": 1440, "height": 900})
        replay_contrast = page.get_by_role("button", name="Replay").evaluate("""
            el => {
              const parse = value => value.match(/[\\d.]+/g).slice(0, 3).map(Number);
              const luminance = rgb => {
                const channels = rgb.map(value => {
                  const normalized = value / 255;
                  return normalized <= .03928 ? normalized / 12.92 : Math.pow((normalized + .055) / 1.055, 2.4);
                });
                return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
              };
              const style = getComputedStyle(el);
              const foreground = luminance(parse(style.color));
              const background = luminance(parse(style.backgroundColor));
              return (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05);
            }
        """)
        assert replay_contrast >= 4.5, replay_contrast
        assert "auditor-journal.png" in page.locator(".journal-paper").evaluate("el => getComputedStyle(el).backgroundImage")
        page.get_by_role("tab", name="Timeline").click()
        assert page.locator(".journal-timeline-card").count() == 0
        assert page.locator(".journal-timeline-empty").is_visible()
        assert page.get_by_text("Place an event on the Timeline Board to begin the recovered sequence.").is_visible()
        assert "auditor-journal.png" not in page.locator(".journal-paper.is-timeline").evaluate("el => getComputedStyle(el).backgroundImage")
        assert "The night of the preview" not in page.locator(".journal-timeline-section").inner_text()
        assert page.locator(".timeline-alignment").inner_text() == "0 / 7 ALIGNED"
        assert page.locator('[data-panel="journal"]').get_attribute("data-notification") == "false"
        page.get_by_role("tab", name="Memories").click()
        page.get_by_role("button", name="Replay").click()
        assert page.get_by_role("tab", name="Object Memory").count() == 1
        assert page.get_by_role("tab", name="Human Recollection").count() == 1
        assert page.get_by_role("tab", name="Restored Truth").count() == 1
        assert page.get_by_text("This memory is stable. Switch perspectives to compare testimony with the object's record.").is_visible()
        assert page.locator(".investigation-tools").count() == 0
        page.get_by_role("button", name="Close panel").click()

        restore_memory(page, "teacup")
        restore_memory(page, "umbrella", expected_phase=("II", "Echoes in the Collection"))
        assert page.locator("#museum-screen").get_attribute("data-phase") == "2"
        page.locator('[data-exhibit="raincoat"]').evaluate("el => el.click()")
        page.get_by_role("button", name="Review restored memory").click()
        assert page.get_by_role("tab", name="Object Memory").count() == 1
        assert page.get_by_role("tab", name="Human Recollection").count() == 1
        page.get_by_role("button", name="Close panel").click()
        restore_memory(page, "elevator")
        restore_memory(page, "musicbox")
        restore_memory(page, "guestbook")

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
            if statement == "celeste-left":
                phase_card = page.locator(".phase-card")
                phase_card.wait_for(state="visible")
                assert phase_card.get_by_text("Phase III", exact=True).is_visible()
                assert phase_card.get_by_role("heading", name="The Glass Orchard Opens").is_visible()
                phase_card.wait_for(state="detached", timeout=6000)
        page.screenshot(path="/tmp/museum-case-board.png", full_page=True)
        assert page.locator(".evidence-node").count() == 9
        assert "case-board.png" in page.locator(".case-board").evaluate("el => getComputedStyle(el).backgroundImage")
        assert page.locator(".evidence-node").first.evaluate("el => getComputedStyle(el).backgroundImage.includes('evidence-card.png')")
        assert page.locator(".thread-line").first.evaluate("el => getComputedStyle(el).backgroundColor") == "rgb(143, 41, 55)"
        page.get_by_role("button", name="Close panel").click()
        page.get_by_role("button", name="Open journal").click()
        assert page.get_by_text("A Pattern of Protection", exact=True).is_visible()
        assert page.locator('[data-journal-tab="people"]').get_attribute("data-notification") == "true"
        page.get_by_role("tab", name="People").click()
        assert page.locator(".person-file").first.evaluate("el => parseFloat(getComputedStyle(el).paddingTop)") >= 12
        page.get_by_role("tab", name="Clues").click()
        page.set_viewport_size({"width": 620, "height": 900})
        page.screenshot(path="/tmp/museum-journal-clues-narrow.png", full_page=True)
        first_clue = page.locator(".artifact-clue-grid .clue-card").first
        clue_box = first_clue.bounding_box()
        related_box = first_clue.locator(":scope > .clue-meta").last.bounding_box()
        assert first_clue.evaluate("el => [getComputedStyle(el).width, getComputedStyle(el).height]") == ["310px", "430px"]
        assert clue_box["y"] + clue_box["height"] - (related_box["y"] + related_box["height"]) >= 48
        page.set_viewport_size({"width": 1440, "height": 900})
        page.get_by_role("button", name="Close panel").click()

        restore_memory(page, "orchard")

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
        assert "end-cutscene.png" in page.locator(".cutscene-ending").evaluate("el => getComputedStyle(el).backgroundImage")
        assert page.locator(".cutscene-panel h2").inner_text() == "Return What Was Taken"
        finish_cutscene(page)
        page.get_by_role("heading", name="Return What Was Taken").wait_for()
        page.screenshot(path=str(SHOT), full_page=True)

        assert not errors, f"Browser errors: {errors}"
        assert page.locator(".ending-screen").is_visible()
        assert page.locator('text="virtual joystick"').count() == 0

        page.get_by_role("button", name="Begin another investigation").click()
        page.get_by_role("button", name="Enter the Museum").click()
        finish_cutscene(page)
        page.locator('[data-character="male"]').click()
        page.get_by_role("button", name="Begin Audit").click()
        page.get_by_role("button", name="Begin investigation").click()
        assert page.locator("#player-sprite.investigator-male").is_visible()
        assert page.locator("#player-sprite").evaluate("el => getComputedStyle(el).backgroundPositionY") == "100%"
        browser.close()
        print("PASS: full investigation reached an ending and both investigators launch")


if __name__ == "__main__":
    main()
