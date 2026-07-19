# AGENTS.md

## Agent Role

You are the implementation agent for **Museum of Borrowed Memories**, a short 2.5D desktop detective game.

Your job is to turn the provided design documents and visual references into a complete, polished, playable prototype. Prioritize a coherent investigation loop, reliable interactions, readable code, and consistent visual presentation over unnecessary technical complexity.

Before making major implementation decisions, read:

- [`gameplay_brief.md`](./gameplay_brief.md) for the story, gameplay loop, exhibits, suspects, clues, progression, win conditions, and endings.
- [`visual_guide.md`](./visual_guide.md) for the art direction, character references, animation rules, desktop controls, 2.5D presentation, interface styling, and asset requirements.

Treat those two files as the source of truth. If this file conflicts with either guide, follow the more specific requirement in the relevant guide.

## Primary Responsibilities

The agent should:

- Build a playable 10–20 minute desktop experience.
- Implement exploration, exhibit inspection, memory restoration, clue collection, timeline organization, contradiction linking, accusation, and ending selection.
- Use the supplied gameplay, interface, and character images as visual references.
- Reuse the supplied character poses for animation where practical, after cleaning and standardizing them.
- Keep the visual style consistent across gameplay, menus, journals, memories, and endings.
- Maintain clear project structure and reusable systems.
- Test the full mystery from beginning to end.

## Implementation Priorities

Work in this order:

1. Create the main museum room.
2. Add desktop movement, depth sorting, and collision boundaries.
3. Add character selection and animation.
4. Add exhibit interaction prompts.
5. Implement exhibit inspection and memory scenes.
6. Implement clue collection and journal tracking.
7. Implement the timeline and contradiction board.
8. Implement suspect statements and progression.
9. Implement the accusation screen and ending logic.
10. Add lighting, particles, sound, transitions, accessibility, and final polish.

Always keep the game runnable. Complete one functional vertical slice before expanding every system.

## Decision-Making Rules

When several approaches are possible:

- Choose the simplest approach that preserves the intended player experience.
- Prefer fixed-camera 2.5D presentation over unnecessary full 3D systems.
- Prefer data-driven exhibit, clue, dialogue, and ending definitions over duplicated hard-coded logic.
- Prefer reusable components and centralized configuration.
- Preserve desktop usability; do not add mobile-style controls.
- Preserve narrative consistency; do not change the culprit, method, location, motive, or core ending logic without explicit instruction.
- Do not add mechanics that significantly increase scope unless they replace an equally complex requirement.

## Visual Asset Rules

The supplied images are references and animation sources, not automatically production-ready assets.

When using character frames:

- Crop individual poses rather than displaying full reference sheets.
- Remove backgrounds, labels, numbers, borders, and unrelated objects.
- Place frames on identical transparent canvases.
- Align frames by the feet.
- Normalize scale and position.
- Correct obvious inconsistencies in clothing, hair, accessories, hands, eyes, and proportions.
- Replace unusable frames with cleaned derivatives of the nearest valid pose.

Do not introduce a conflicting art style. Follow `visual_guide.md` for detailed visual requirements.

## Code Quality

- Keep gameplay data separate from rendering logic where practical.
- Use clear names for scenes, exhibits, clues, suspects, memories, and endings.
- Avoid hard-coding asset paths throughout the codebase; centralize them.
- Avoid duplicating progression conditions in multiple files.
- Add concise comments only where behavior is not obvious.
- Handle missing assets and invalid state gracefully.
- Do not leave broken placeholder controls in the final interface.

## Testing Requirements

Before considering the prototype complete, verify that:

- Both selectable player characters work.
- Movement, collision, scaling, and depth sorting behave correctly.
- Every required exhibit can be completed.
- Clues unlock once and remain recorded.
- Timeline cards can be placed and corrected.
- Contradictions validate correctly.
- The Glass Orchard unlocks under the intended conditions.
- Correct and incorrect accusations produce appropriate outcomes.
- At least three endings are reachable.
- The game can be completed without refreshing or editing saved state.
- No mobile joystick or touch-control UI appears.
- No raw reference sheet is visible during gameplay.

## Scope Protection

Prioritize the required playable loop over:

- additional museum rooms
- full 3D camera movement
- complex cinematics
- advanced physics
- procedural generation
- online multiplayer
- unnecessary backend services
- excessive visual effects

When time is limited, reduce decorative polish before cutting essential investigation mechanics.

## Completion Standard

The project is complete when a new player can launch it, understand the controls, investigate the museum, solve the mystery, make an accusation, reach an ending, and experience a consistent visual and narrative presentation without developer assistance.

### GitHub Commits
When told to reformat commits, follow the Conventional Commits (https://www.conventionalcommits.org/en/v1.0.0/) format.

**Structure:** <type>[optional scope]: <description>
- **Type:** Define the nature of the change.
    * feat: Adding a new feature.
    * fix: Resolving a bug.
    * docs: Changes to documentation or README.
    * refactor: Code restructuring without changing behavior.
    * perf: Performance-related improvements.
    * test: Adding or updating tests.
- **Scope (optional):** The specific area of the game affected (movement, visuals, clues, endings, audio, or UI).
- **Summary:** A concise, imperative sentence (e.g., Add support for...). Use the imperative mood (e.g., "Add," not "Added").
- **Example:** "feat: added character movement"

## Documentation
- **Helpful Commenting:** Keep comments concise and focused on "Why" something is being done.
    - Use single-line explanations that provide context or reasoning.
    - Document non-obvious dependencies or system-level requirements.
    - Ensure comments are helpful for anyone who didn't write the code.
- **TODO maintenance:** `TODO.md` is a deletion-based list. Whenever a task is completed, delete its checklist item in the same change instead of checking it off. Delete empty sections, and delete `TODO.md` when no items remain.
- After completing any coding or design task, you must update the "# Project Log" section of this file. Include date, action, and files affected. Summarize why changes were made.
- Format: "**YYYY-MM-DD**: [Brief description of changes with which files were edited]"
- Ask if you should update the project log after major changes are made.

### Example Project Log
- **2026-07-17**: Initialized project skeleton. Read `References/gameplay_brief.md` and `References/visual_guide.md`.

# Project Log

- **2026-07-19**: Scrambled every exhibit’s unplaced Restore fragments in `src/game.js`, guaranteed the bank never begins in the solution order, persisted the randomized order across rerenders and reloads with legacy-save migration, refreshed cache versions in `index.html`, documented the behavior in `README.md`, and expanded `tests/browser_smoke.py`.
- **2026-07-19**: Fixed intermittent `Return to gallery` failures by deferring Phase II/III overlays until after the clue modal closes in `src/game.js`, sequencing post-return notifications after each phase card, refreshing cache versions in `index.html`, and updating the full-route regression in `tests/browser_smoke.py`.
- **2026-07-19**: Made Object Memory, Human Recollection, and Restored Truth available and narrated from the first Phase 1 restoration in `src/game.js`, while preserving the three-opening-memory gate for the Case Board, suspect files, and later exhibits; refreshed cache versions in `index.html` and updated `README.md` plus both browser suites.
- **2026-07-19**: Made gallery depth scaling more legible by widening the foot-anchored investigator range from 66% at the rear to 103% at the foreground in `src/game.js`; refreshed unified runtime versions in `index.html` and updated the exact depth regression in `tests/browser_smoke.py`.
- **2026-07-19**: Split the six supplied cutscene narration masters into 43 slide-aligned PCM WAVs under `assets/audio/cutscenes/slides/`, added reproducible word-aligned cutting in `scripts/split_cutscene_audio.sh`, documented the intentional silent Mara-dialogue placeholder, changed `src/game.js` to interrupt and start narration with each slide, refreshed runtime versions in `index.html`, maintained `TODO.md`, and expanded `README.md` plus both browser suites.
- **2026-07-19**: Added persistent matching exclamation notifications to unlocked, unvisited gallery memories; formalized foot-anchored character scaling from 72% at the rear to 100% at the front; integrated the supplied stone-floor walking loop with collision-aware start and stop behavior in `src/game.js`, `styles.css`, and `assets/audio/footsteps/`; refreshed cache versions, documentation, `TODO.md`, and browser regressions in `index.html`, `README.md`, and `tests/browser_smoke.py`.
- **2026-07-19**: Integrated the six supplied opening and ending narration tracks from `assets/audio/cutscenes/` into the player-paced cutscene system in `src/game.js`, with continuous playback across slides, immediate stop on Skip or Finish, score ducking, shared sound controls, visible text alternatives, and runtime status coverage; refreshed cache versions in `index.html` and updated `README.md`, `tests/browser_smoke.py`, and `tests/browser_branches.py`.
- **2026-07-19**: Integrated all 21 supplied memory narration WAVs from `assets/audio/memories/` into `src/game.js` with automatic perspective-matched playback, interruption on navigation, score ducking, mute/volume support, and graceful failure; corrected the backing-track runtime path, refreshed cache versions in `index.html`, removed the completed voice task from `TODO.md`, and updated `README.md` plus `tests/browser_smoke.py`.
- **2026-07-19**: Preserved source-image proportions in Restore fragment and sequence thumbnails by replacing forced-width-and-height scaling with proportional section crops in `styles.css`; refreshed unified runtime versions in `index.html` and added exact computed-style coverage in `tests/browser_smoke.py`.
- **2026-07-19**: Matched the Restore reconstruction artwork to the same exhibit PNG shown during Observe in `src/game.js`, generated and integrated the non-geometric raster `assets/ui/generated/memory-hotspot-shimmer.png` to replace circular hotspot and discovery markers, removed their vector-like CSS rings from `styles.css`, refreshed unified runtime versions in `index.html`, documented the asset in `assets/ui/README.md`, and expanded `tests/browser_smoke.py` coverage.
- **2026-07-19**: Removed the title-screen tagline and case-summary copy, generated transparent primary and secondary Art Nouveau button skins in `assets/generated/`, centered the wordmark and live-label button stack in `index.html` and `styles.css`, preloaded the new UI assets in `src/game.js`, refreshed runtime versions and asset documentation, and expanded `tests/browser_smoke.py` with transparency, layout, and button-art coverage.
- **2026-07-19**: Rebuilt the Restore memory clicking interface in `src/game.js` and `styles.css` as a raster-led reconstruction table with photographic fragment strips, rectangular numbered positions, image-reactive repair progress, compact completion feedback, and a ceremonial ready state without SVG or vector-shaped controls; refreshed unified runtime versions in `index.html` and added focused coverage in `tests/browser_smoke.py`.
- **2026-07-19**: Generated the transparent `assets/generated/title-wordmark.png`, replaced the title screen’s live-text visual with the new accessible wordmark in `index.html`, added a gold-violet hover glow in `styles.css`, documented the asset in `assets/generated/README.md`, refreshed runtime versions, and added title load and interaction coverage in `tests/browser_smoke.py`.
- **2026-07-18**: Renamed the investigation title cards to `The Quiet Gallery`, `Echoes in the Collection`, and `The Glass Orchard Opens` across `References/Gameplay_brief.md`, `src/game.js`, and `tests/browser_smoke.py`, and refreshed runtime versions in `index.html`.
- **2026-07-18**: Raised the fresh-game sound default from 45% to 100% and materially increased music, ambience, and action-cue bus levels in `src/game.js`, while keeping cues louder than the continuous score; refreshed `README.md`, runtime versions in `index.html`, and default-level coverage in `tests/browser_smoke.py`.
- **2026-07-18**: Removed the 8–11 pixel downward gameplay background offset that clipped investigator feet in side-walk and other animation states; aligned both characters to the fully visible 100% baseline in `styles.css`, refreshed runtime versions in `index.html`, and added female/male baseline coverage in `tests/browser_smoke.py`.
- **2026-07-18**: Initialized the supplied backing track on the title page and removed action-triggered music ducking in `src/game.js`; rebalanced the uninterrupted music and stronger cue buses, refreshed documentation and runtime versions, and added title-page plus continuous-mix coverage in `tests/browser_smoke.py`.
- **2026-07-18**: Added the supplied `assets/audio/backing-track.mp3` as a looped Web Audio music layer in `src/game.js`, with automatic music ducking and stronger action-cue gain for clear gameplay feedback; refreshed `README.md`, `index.html`, and `tests/browser_smoke.py` with music behavior and load/loop/mix coverage.
- **2026-07-18**: Extended every black phase-title pause by three seconds, from 1.9 to 4.9 seconds, across `src/game.js` and `styles.css`; refreshed runtime versions in `index.html` and widened phase timing coverage in `tests/browser_smoke.py`.
- **2026-07-18**: Made every cutscene page change restart the same deterministic upward text dissolve using the new `cutscene-copy-rise` animation in `styles.css`; refreshed runtime versions in `index.html` and added repeated-page animation coverage in `tests/browser_smoke.py`.
- **2026-07-18**: Fixed journal evidence cards at a consistent 310×430 size, hid every event from the journal timeline until it is placed on the Case Board, and added black Phase I–III title flashes using the brief’s phase names across `src/game.js`, `styles.css`, `index.html`, `README.md`, and both browser suites.
- **2026-07-18**: Moved the opening cutscene ahead of character selection, removed its pre-audit heading and every cutscene page counter, replaced the arrow with a circular `>` control, and changed story copy to a slower dark upward dissolve across `src/game.js`, `styles.css`, `README.md`, and `tests/browser_smoke.py`.
- **2026-07-18**: Added player-paced opening and result-driven ending cutscenes from `References/Cutscenes.md` using `assets/generated/start-cutscene.png` and `end-cutscene.png`; implemented arrow/keyboard advancement plus a delayed Skip control in `src/game.js` and `styles.css`, refreshed runtime versions and documentation, and expanded both browser suites to cover pacing, backgrounds, skip timing, and all five outcome branches.
- **2026-07-18**: Removed the Map item from the main gallery HUD in `index.html` and updated the exact navigation-order regression in `tests/browser_smoke.py`, while retaining the underlying map system and keyboard shortcut.
- **2026-07-18**: Normalized every transparent production character frame to the same 240-pixel visible height in `scripts/prepare_character_assets.py` and `assets/characters/final/`; eliminated black walking flashes by retaining, cache-versioning, and decoding all animation images before entering the gallery across `src/data.js`, `src/game.js`, and `styles.css`; refreshed `index.html`, `README.md`, and `assets/characters/README.md`, and added exact equal-height regression coverage in `tests/browser_smoke.py`.
- **2026-07-18**: Corrected the male side-profile source bounds in `scripts/prepare_character_assets.py` and regenerated `assets/characters/sheet-copies/` plus `assets/characters/final/` so his full head is retained; increased the gallery investigators and their contact shadows by 50% in `styles.css` and updated `tests/browser_smoke.py` coverage.
- **2026-07-18**: Replaced the generated investigator strips with direct pixel-preserved crops from `References/replacements/female-sheet.png` and `male-sheet.png`; updated `scripts/prepare_character_assets.py`, `assets/characters/sheet-copies/`, `assets/characters/final/`, `assets/characters/README.md`, and `README.md` to retain magenta source copies and transparent gameplay exports without redrawing or resampling.
- **2026-07-18**: Removed the synthesized looping melody from `src/game.js` at the user’s request while retaining ambience, interaction cues, reliable browser audio unlocking, and the shared sound controls; updated `README.md`, `index.html`, and `tests/browser_smoke.py` to describe and verify the music-free build.
- **2026-07-18**: Fixed inaudible gallery music and mixed-generation character chopping in `src/game.js`, `src/data.js`, `styles.css`, `index.html`, `scripts/prepare_character_assets.py`, `assets/characters/`, `README.md`, and `tests/browser_smoke.py` by reliably resuming Web Audio, adding an audible restrained score, moving every proportion-audited transparent frame to fresh production URLs, removing the legacy white-background/cache-prone assets, and expanding audio plus asset-path regression coverage.
- **2026-07-18**: Completed all non-final-check work across `src/game.js`, `src/data.js`, `styles.css`, `index.html`, `README.md`, `TODO.md`, `scripts/prepare_character_assets.py`, `scripts/verify.sh`, `tests/browser_smoke.py`, `tests/browser_branches.py`, and `assets/characters/` by gating Phase 2 systems, restoring painted-case proximity light, regenerating both investigators into multi-frame directional animation sets, adding resilient saves/assets, a persistent layered audio mix, non-obstructive notifications, stronger contrast, focused regressions, and one-command sequential verification.
- **2026-07-18**: Added a query-gated, reversible completed-case test toggle in `src/game.js` and `styles.css`, documented it in `README.md`, refreshed runtime asset versions in `index.html`, and covered normal-mode hiding plus complete/restore behavior in `tests/browser_branches.py`.
- **2026-07-18**: Removed the border, background panel, corner radius, and shadow from the bottom-right movement instructions in `styles.css` while preserving typography and player-overlap layering, with a no-box regression assertion in `tests/browser_smoke.py`.
- **2026-07-18**: Raised the gallery movement and interaction instructions above every player depth layer in `styles.css`, restyled them as readable dark museum controls, and aligned HUD captions, progress values, prompts, and keyboard hints with the display/reading/functional typography roles in `style.md`; expanded `tests/browser_smoke.py` and `tests/browser_branches.py` with computed-style and layering checks.
- **2026-07-18**: Replaced image-coupled movement checks with the reusable polygonal navigation model in `src/room-collision.js`; updated `src/game.js`, `index.html`, and `styles.css` to validate the feet anchor against the marble-floor polygon and explicit exhibit, rope, wall, and column obstacles, added an F8/debug-query SVG overlay, and expanded browser collision coverage in `tests/browser_smoke.py` and `tests/browser_branches.py`.
- **2026-07-18**: Extended the gallery walk bounds to a 99% feet-anchor limit in `src/game.js`, allowing investigators to reach the bottom of the screen while remaining visible, and added bottom-edge movement coverage in `tests/browser_branches.py`.
- **2026-07-18**: Added saved-position recovery in `src/game.js` so players loaded inside newly expanded exhibit collisions are moved to the nearest valid foot position, with an embedded-umbrella regression case in `tests/browser_branches.py`.
- **2026-07-18**: Anchored both investigator sprites to their painted feet in `styles.css`, replaced point-based movement checks with a depth-scaled foot footprint in `src/game.js`, and strengthened `tests/browser_smoke.py` so players cannot walk through main-gallery exhibit hitboxes.
- **2026-07-18**: Realigned all seven main-gallery exhibit hitboxes and collision boundaries in `index.html`, `styles.css`, and `src/game.js` to match the supplied red-frame reference, and expanded `tests/browser_smoke.py` with exact geometry coverage.
- **2026-07-18**: Audited the implementation against `References/Gameplay_brief.md` and `References/Visual_guide.md`, recorded all remaining specification, audio, resilience, QA, accessibility, and release work in `TODO.md`, and added deletion-based checklist maintenance guidance to `AGENTS.md`.
- **2026-07-17**: Built the preliminary playable browser prototype and full investigation loop in `index.html`, `styles.css`, `src/data.js`, and `src/game.js`; added launch documentation in `README.md` and a complete Playwright verification in `tests/browser_smoke.py` so the game can be played, maintained, and tested from character selection through accusation and ending.
- **2026-07-17**: Reworked the visual presentation around the supplied reference art by adding generated painterly backgrounds in `assets/generated/`, cleaned character frames in `assets/characters/`, reproducible extraction in `scripts/prepare_character_assets.py`, and updated integration styles in `styles.css` and `index.html`; expanded `README.md` and browser QA captures so title, selection, gallery, viewer, and ending screens share one consistent museum world.
- **2026-07-17**: Added object, human, and restored perspective switching with seven unique generated memory scenes in `assets/memories/`; completed front, side, and back idle, walking, and interaction animation sets through `scripts/prepare_character_assets.py`; integrated the new states in `src/data.js`, `src/game.js`, `styles.css`, and `index.html`, and expanded `README.md` plus `tests/browser_smoke.py` to document and verify the feature.
- **2026-07-17**: Replaced the main gallery, both investigator sprite sets, HUD medallions, and Floor Thirteen numerals with the newly supplied artwork in `References/replacements/`; added deterministic cleanup in `scripts/prepare_character_assets.py` and `scripts/prepare_replacement_assets.py`, realigned painted exhibit hotspots in `index.html` and `src/game.js`, and updated `styles.css`, asset documentation, and `README.md` so the replacement art is integrated without exposing raw sheets or duplicate display cases.
- **2026-07-17**: Refined the supplied-asset integration in `scripts/prepare_character_assets.py`, `scripts/prepare_replacement_assets.py`, `index.html`, `src/game.js`, and `styles.css` by removing enclosed checker artifacts from character legs, installing the supplied gallery title, adding illuminated HUD medallions, moving the Teacup interaction to its labeled lower display, extending all exhibit hitboxes through their signs, and replacing point collisions with full painted-case boundaries; expanded `tests/browser_smoke.py` and `assets/ui/README.md` to verify and document the changes.
- **2026-07-17**: Tightened the gallery HUD in `index.html` and `styles.css` by reducing medallion glow, moving captions closer, restoring a live-text Baskerville/Didot-style room title, and removing painted-exhibit proximity outlines so only the framed interaction prompt appears; updated `tests/browser_smoke.py` to verify the restored heading.
- **2026-07-17**: Added `style.md` as the standardized visual-system reference for typography, colors, spacing, surfaces, borders, lighting, controls, imagery, motion, gallery interactions, and accessibility; linked it from `README.md` so future interface work remains consistent with `styles.css` and the supplied art direction.
- **2026-07-17**: Refined character presentation and typography in `index.html` and `styles.css` by enlarging the in-gallery investigators, renaming them Elara Finch and Silas Hart to avoid suspect-name collisions, removing personality descriptions, and applying the display, reading, and functional font roles from `style.md`; expanded `tests/browser_smoke.py` to verify the new selection copy and gameplay sprite size.
- **2026-07-17**: Increased the in-gallery investigator dimensions and matching contact shadow in `styles.css` so both playable characters read more clearly against the museum environment; updated the size assertions in `tests/browser_smoke.py`.
- **2026-07-17**: Reordered the main gallery HUD controls in `index.html` to Clues, Journal, Map, and Menu for the requested navigation priority; added an exact-order assertion in `tests/browser_smoke.py`.
- **2026-07-17**: Raised the case briefing content on the Private Preview modal by adding a scoped briefing layout hook in `src/game.js` and reducing its top padding in `styles.css`; added a focused layout assertion in `tests/browser_smoke.py`.
- **2026-07-17**: Raised the Private Preview case briefing further in `styles.css` by removing its remaining top padding and applying a restrained negative top margin that preserves separation from the authorization subtitle; updated the corresponding layout assertions in `tests/browser_smoke.py`.
- **2026-07-17**: Increased separation above the Private Preview case briefing in `styles.css` by removing its negative offset, and extended the Restored Truth dwell time in `src/game.js` from 720 milliseconds to 3.2 seconds before clue reveal; updated `tests/browser_smoke.py` to verify the final briefing spacing.
- **2026-07-17**: Added dedicated vertical padding around the Private Preview `Case Briefing` label in `styles.css` to improve separation from both the authorization subtitle and briefing headline; added exact spacing assertions in `tests/browser_smoke.py`.
- **2026-07-17**: Removed the bottom padding beneath the Private Preview `Case Briefing` label in `styles.css` so the briefing body sits closer while retaining the added spacing above; updated the focused assertion in `tests/browser_smoke.py`.
- **2026-07-17**: Completed the non-audio investigation polish across `src/data.js`, `src/game.js`, `styles.css`, `README.md`, `.gitignore`, `assets/artifacts/`, and `assets/suspects/` by adding generated inspection artifacts and suspect portraits, a three-part visual evidence wall, draggable timeline, six-of-seven clue synthesis, evolving statements and gallery labels, paced text, distinct investigator-aware endings, and stronger motion and parallax; expanded `tests/browser_smoke.py` and added `tests/browser_branches.py` to verify the full route, progression alternatives, all five endings, persistence, accessibility, and asset loading.
- **2026-07-18**: Documented the implementation-ready Observe → Connect → Restore exhibit redesign in `TODO.md`, including unchanged-image constraints, shared UI and state behavior, per-exhibit observations and deductions, data structure, save migration, accessibility requirements, acceptance criteria, and automated test coverage.
- **2026-07-18**: Replaced all seven bespoke memory minigames with the shared Observe → Connect → Restore pipeline in `src/data.js`, `src/game.js`, and `styles.css`; added tool-specific accessible hotspots, order-independent evidence connections, click/drag memory reconstruction, paced perspective reveals, fail-forward hints, partial-progress persistence, legacy-save migration, and read-only replay without changing existing art; updated `README.md`, removed the completed redesign from `TODO.md`, and expanded `tests/browser_smoke.py` and `tests/browser_branches.py` to verify every exhibit, correction paths, replay de-duplication, and save recovery.
- **2026-07-18**: Diagnosed the legacy minigame screenshot as a mixed browser cache containing old `src/game.js` with new `src/data.js`; versioned `styles.css`, `src/data.js`, `src/room-collision.js`, and `src/game.js` together in `index.html`, added matching assertions to `tests/browser_smoke.py`, and made both browser suites wait for decoded artifact images so normal reloads cannot combine incompatible interface generations and asset checks remain deterministic.
- **2026-07-18**: Generated and integrated a reference-led painted UI set in `assets/ui/generated/`, replaced symbolic inspection controls with persistent Eye/Hand/Magnifier medallions in `src/game.js`, rebuilt the auditor’s journal and case board styling in `styles.css`, corrected memory-card and Replay contrast, bumped the unified runtime asset version in `index.html`, documented the assets in `assets/ui/README.md` and `README.md`, and expanded `tests/browser_smoke.py` plus `tests/browser_branches.py` to verify contrast, loaded icons, archive surfaces, and detective-redline evidence links.
- **2026-07-18**: Matched the inspection medallion states to the restrained top-right HUD illumination in `styles.css` by removing the flat gold selection disk and applying the same warm drop-shadow glow, updated the unified runtime version in `index.html`, and added active-state regression checks in `tests/browser_smoke.py`.
- **2026-07-18**: Refined narrow and desktop journal formatting in `styles.css` with wider dossier columns, parchment-safe padding, structured metadata/title/body/footer spacing, and anchored Replay controls; removed the misleading read-only inspection ribbon from recollection and restored-memory views in `src/game.js`, and refreshed the unified asset version in `index.html`.
- **2026-07-18**: Removed the private field-notes page from the Auditor’s Journal in `src/game.js`, deleted its unused styling and persistence handlers from `styles.css`, updated save-behavior documentation in `README.md`, refreshed runtime asset versions in `index.html`, and revised `tests/browser_branches.py` to enforce the four-tab journal.
- **2026-07-18**: Removed decorative connection threads from the Connect investigation step in `src/game.js` and `styles.css`, replaced the crossed statement line with a compact Revised badge, refreshed the unified runtime asset version in `index.html`, and added thread-removal coverage in `tests/browser_smoke.py`.
- **2026-07-18**: Refined People dossier alignment, built a horizontally scrolling seven-event journal timeline, and added persistent exclamation badges for unseen journal entries and available case-board actions across `src/game.js` and `styles.css`; updated save migration, runtime asset versions, `README.md`, and `tests/browser_smoke.py` to verify the new behavior.
- **2026-07-18**: Increased timeline readability in `styles.css` by darkening parchment headings and metadata while brightening locked-card copy, refreshed unified runtime versions in `index.html`, and added exact rendered-color assertions in `tests/browser_smoke.py` to prevent contrast regressions.
- **2026-07-18**: Rebuilt the journal timeline in `src/game.js` and `styles.css` as a purple evidence surface without the parchment-book background, arranged its seven events above and below a conventional central time axis, and anchored a live aligned-count sign at the upper-right; refreshed runtime versions in `index.html` and expanded `tests/browser_smoke.py` with surface, alternating-layout, counter, and scrolling assertions.
- **2026-07-18**: Simplified the journal timeline in `src/game.js` and `styles.css` by removing its redundant preview label, moving timestamps from event frames to opposite sides of the numbered axis markers, and eliminating per-frame green alignment borders and `Aligned` labels so progress is communicated only by the upper-right counter; refreshed cache versions and extended both browser suites with focused regressions.
- **2026-07-18**: Removed the vertical connector strokes between timeline frames and their numbered axis markers in `styles.css`, refreshed unified runtime versions in `index.html`, and added a pseudo-element regression assertion in `tests/browser_smoke.py` while retaining the central axis, markers, and timestamps.
- **2026-07-18**: Re-audited every remaining requirement in `TODO.md` against the current implementation, rendered UI, and passing browser suites; decomposed compound tasks into verified completed and outstanding sub-items so partial work is credited without prematurely closing any top-level release requirement.
