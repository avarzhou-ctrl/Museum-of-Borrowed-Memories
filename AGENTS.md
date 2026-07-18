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
- After completing any coding or design task, you must update the "# Project Log" section of this file. Include date, action, and files affected. Summarize why changes were made.
- Format: "**YYYY-MM-DD**: [Brief description of changes with which files were edited]"
- Ask if you should update the project log after major changes are made.

### Example Project Log
- **2026-07-17**: Initialized project skeleton. Read `References/gameplay_brief.md` and `References/visual_guide.md`.

# Project Log

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
