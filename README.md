# Museum of Borrowed Memories

A preliminary, complete browser prototype of a 10–20 minute 2.5D desktop detective game. Curator Elian Voss vanished during a private museum preview; seven exhibits remember what happened.

## Run the game

No install or build step is required. From this folder, start a local server:

```bash
python3 -m http.server 4173
```

Then open [http://localhost:4173](http://localhost:4173) in a desktop browser.

## Controls

- `WASD` or arrow keys: move
- `E` or `Space`: inspect the nearest exhibit
- Mouse: inspect objects and use menus
- Memory tabs: switch between the object's record, a human recollection, and the restored truth
- `J`: open the journal
- `M`: open the gallery map
- `Escape`: close a panel or open the menu

Progress, settings, timeline placements, contradictions, and notes save automatically in the browser.

## Investigation flow

1. Restore the Raincoat, Teacup, and Umbrella memories.
2. Investigate Floor Thirteen, the Music Box, and the Guestbook.
3. Use statements, memories, and physical clues on the Case Board to prove at least three contradictions.
4. Restore the newly unlocked Glass Orchard.
5. Place at least five timeline events and make a structured accusation.
6. Decide the archive’s fate.

The game supports a six-of-seven solution route, early accusations, five distinct endings, two selectable investigators with front/side/back movement and interaction animations, perspective-switching memory scenes, a draggable timeline, a visual evidence wall, evolving suspect statements and museum labels, keyboard navigation, reduced motion, larger text, text-speed controls, and persistent field notes.

## Verify the prototype

With the local server running and Playwright for Python installed:

```bash
python3 tests/browser_smoke.py
python3 tests/browser_branches.py
```

The smoke test completes all seven exhibit puzzles, switches memory perspectives, verifies directional and interaction animation states, proves contradictions, fills the timeline, makes the correct accusation, reaches an ending, checks for browser errors, and confirms both investigators launch. The branch suite verifies the six-exhibit route, drag-and-drop placement, all five endings, persistence, accessibility settings, and generated asset loading.

## Project structure

- `style.md`: standardized colors, typography, spacing, surfaces, motion, and interaction rules
- `index.html`: game screens and gallery scene
- `styles.css`: 2.5D environment, characters, interface, and accessibility styles
- `assets/generated/`: painterly title and archive backgrounds plus the supplied replacement gallery
- `assets/memories/`: seven unique painterly exhibit-memory scenes and their generation notes
- `assets/artifacts/`: seven isolated inspection artifacts generated for the object viewer, clue journal, and timeline
- `assets/suspects/`: four generated accusation and evidence-board portraits
- `assets/characters/`: cleaned, transparent, foot-aligned front/side/back idle, walk, and interaction frames extracted from the supplied sheets
- `assets/ui/`: supplied circular HUD icons, gold numerals, and interaction decoration extracted onto transparent canvases
- `src/data.js`: exhibits, clues, suspects, timeline, contradictions, and accusation data
- `src/game.js`: movement, puzzles, progression, persistence, panels, and endings
- `scripts/prepare_character_assets.py`: reproducible character-frame cleanup and normalization
- `scripts/prepare_replacement_assets.py`: reproducible UI, numeral, and replacement-gallery preparation
- `tests/browser_smoke.py`: full browser playthrough
- `tests/browser_branches.py`: progression, ending, persistence, accessibility, and asset-loading branches
- `References/replacements/`: the five user-supplied replacement sheets and gallery source
- `References/`: source design documents and visual references (never shown raw in-game)
