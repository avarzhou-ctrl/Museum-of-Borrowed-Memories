# Museum of Borrowed Memories

A complete browser prototype of a 10–20 minute 2.5D desktop detective game. Curator Elian Voss vanished during a private museum preview; seven exhibits remember what happened.

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
- Exhibit viewer: use Eye, Hand, and Magnifier to find details; select two details to connect them; drag or click memory fragments into order
- Memory tabs: switch between the object's record, a human recollection, and the restored truth
- `J`: open the journal
- `M`: open the gallery map
- `Escape`: close a panel or open the menu
- `F8`: temporarily show or hide the navigation mesh, obstacle polygons, and feet anchor

The collision overlay can also start enabled at [http://localhost:4173/?collisionDebug=1](http://localhost:4173/?collisionDebug=1).

For endgame testing, launch [http://localhost:4173/?testMode=1](http://localhost:4173/?testMode=1), open **Menu**, and toggle **Completed case state**. The control fills every exhibit, clue, contradiction, and timeline entry; switching it off restores the prior case progress. It is not shown during normal play.

Investigation progress, settings, timeline placements, and contradictions save automatically in the browser. Loaded saves are migrated and allow-listed so corrupted or older values cannot strand the player.

The supplied “Borrowed Memories” backing track is initialized on the title page and loops continuously beneath museum ambience and distinct inspection, restoration, timeline, contradiction, transition, phase, and ending cues. Fresh investigations default to 100% sound, with a stronger music bus and still-louder effects bus so important feedback remains clear above the uninterrupted score. Browsers that prohibit audible autoplay keep the decoded track ready and begin it on the first permitted pointer or keyboard gesture. The audio context is retried and resumed on later gestures if suspended. **Menu → All sound** mutes the complete mix, **Sound level** controls it from 0–100%, and both settings persist. The game contains no speech, so no spoken information requires subtitles; every sound cue is paired with visible state, feedback text, or a notification. If Web Audio, music, or artwork fails, gameplay continues with readable visual fallbacks and action sounds.

## Investigation flow

1. Inspect an exhibit with Eye, Hand, and Magnifier to record three observations.
2. Connect the two observations that disprove its suspect statement or museum label.
3. Arrange three text fragments to restore the exhibit memory.
4. Restore the Raincoat, Teacup, and Umbrella to unlock Phase 2: the Case Board, suspect portraits, object/human perspective switching, Floor Thirteen, the Music Box, and the Guestbook.
5. Use statements, memories, and physical clues on the Case Board to prove at least three contradictions.
6. Restore the newly unlocked Glass Orchard.
7. Place at least five timeline events, make a structured accusation, and decide the archive’s fate.

The game supports a six-of-seven solution route, early accusations, five distinct result-driven ending cutscenes, a player-paced opening cutscene before character selection, two selectable investigators with generated multi-frame front/side/back idle, walk, and interaction animation, perspective-switching memory scenes, a draggable case-board timeline, a horizontally scrolling journal timeline, persistent new-entry/action badges, a visual evidence wall, evolving suspect statements and museum labels, keyboard navigation, reduced motion, larger text, and text-speed controls. Cutscenes advance only from the circular `>` control or keyboard and reveal a Skip control after three seconds.

## Desktop support

The intended minimum viewport is **1280×720** with a keyboard and mouse or trackpad; 1440×900 is the reference layout. Panels remain scrollable in narrower desktop windows and with enlarged text. The implementation targets current desktop Chrome/Edge, Firefox, and Safari. Automated end-to-end coverage runs in Chromium; the final cross-browser and zoom sweep remains a release check.

## Verify the prototype

With Playwright for Python installed, run the complete sequential verifier. It starts a local server when needed, checks JavaScript syntax, and runs both browser suites without concurrent Chromium launches:

```bash
./scripts/verify.sh
```

The two suites remain independently runnable with `python3 tests/browser_smoke.py` and `python3 tests/browser_branches.py` when a server is already running.

The smoke test completes Observe → Connect → Restore for all seven exhibits, switches memory perspectives, verifies directional and interaction animation states, proves contradictions, fills the timeline, makes the correct accusation, reaches an ending, checks for browser errors, and confirms both investigators launch. The branch suite verifies incorrect deductions and fragment orders, click and drag correction, partial-progress reload, legacy and malformed-save migration, replay de-duplication, the six-exhibit route, all five endings, settings, and generated asset loading.

## Suno prompt for music
Written by ChatGPT.

Prompt:
```text
Instrumental dark fantasy museum soundtrack for a 2.5D detective game called “Museum of Borrowed Memories.” Elegant, dreamlike, mysterious, and quietly unsettling rather than frightening. Delicate music-box melody, soft felt piano, glass harmonica, celesta, muted strings, distant choir pads without words, subtle clockwork percussion, and faint shimmering textures.

The music should evoke an ornate midnight museum filled with stolen memories, glowing glass exhibits, purple candlelight, and a hidden sadness beneath its beauty. Begin with a simple fragile motif, gradually add gentle harmonic tension, then return naturally to the opening mood.

Designed as seamless background music for exploration: steady atmosphere, no dramatic climax, no sudden transitions, no loud percussion, no trailer-style impacts, and no strong ending cadence. The final bars should blend smoothly back into the opening bars for a clean loop.

Tempo around 65–75 BPM, minor key, restrained dynamics, cinematic but intimate, haunting, elegant, melancholic, magical, and slightly uncanny.

Instrumental only. No vocals, lyrics, spoken words, or recognizable copyrighted melodies.

Avoid a clear intro or final resolution. Start and end on the same harmony and texture.
```

Style:
```text
dark fantasy, gothic chamber music, ambient game soundtrack, music box, celesta, felt piano, glass harmonica, soft strings, mysterious, melancholic, elegant, seamless loop, instrumental
```

## Project structure

- `style.md`: standardized colors, typography, spacing, surfaces, motion, and interaction rules
- `index.html`: game screens and gallery scene
- `styles.css`: 2.5D environment, characters, interface, and accessibility styles
- `assets/generated/`: painterly title and archive backgrounds plus the supplied replacement gallery
- `assets/memories/`: seven unique painterly exhibit-memory scenes and their generation notes
- `assets/artifacts/`: seven isolated inspection artifacts generated for the object viewer, clue journal, and timeline
- `assets/suspects/`: four generated accusation and evidence-board portraits
- `assets/audio/backing-track.mp3`: supplied looping exploration score
- `assets/characters/`: `sheet-copies/` contains pixel-preserved reference frames on magenta; `final/` contains equal-height transparent, foot-aligned gameplay frames
- `assets/ui/`: supplied HUD elements plus generated painted inspection medallions, auditor’s ledger, Victorian panels, evidence cards, and case-board surface
- `src/data.js`: exhibits, observations, memory fragments, clues, suspects, timeline, contradictions, and accusation data
- `src/room-collision.js`: reusable walkable-floor polygon, exhibit obstacles, architecture barriers, margins, and interaction approach points
- `src/game.js`: movement, shared investigation pipeline, progression, persistence, panels, and endings
- `scripts/prepare_character_assets.py`: direct reference-sheet copying, background masking, equal-height production scaling, and foot alignment
- `scripts/verify.sh`: one-command sequential server, syntax, smoke, and branch verification
- `scripts/prepare_replacement_assets.py`: reproducible UI, numeral, and replacement-gallery preparation
- `tests/browser_smoke.py`: full browser playthrough
- `tests/browser_branches.py`: progression, ending, persistence, accessibility, and asset-loading branches
- `References/replacements/`: the five user-supplied replacement sheets and gallery source
- `References/`: source design documents and visual references (never shown raw in-game)
