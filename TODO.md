# Museum of Borrowed Memories — Remaining Work

This checklist contains only work that remains after the 2026-07-18 audit of `References/Gameplay_brief.md`, `References/Visual_guide.md`, the current implementation, the rendered browser screens, and both Playwright suites.

## Specification alignment

- [ ] Gate the contradiction board, suspect portraits, and memory-perspective switching behind Phase 2 as described in the gameplay brief; introduce each system when the first three memories are restored without blocking replay or saved games.
- [ ] Restore a restrained proximity treatment for the painted exhibits (soft glow, particles, or another non-neon cue) so nearby exhibits are visually highlighted in addition to showing the framed `E — Inspect` prompt.
- [ ] Complete the character animation pass for both investigators: add subtle multi-frame idle loops and expand walk/interact loops toward the guide’s suggested frame counts and timing while preserving foot alignment, scale, clothing, hair, bags, and accessories.

## Audio and atmosphere

- [ ] Add the missing audio pass: gallery ambience, restrained music, exhibit-manipulation cues, memory distortion/restoration cues, timeline/contradiction feedback, transitions, and distinct ending cues.
- [ ] Expand audio settings beyond the current synthesized cue slider with clear mute and level controls; persist them and ensure every important audio cue has an equivalent visible status or subtitle when speech is introduced.
- [ ] Verify audio starts only after user interaction, resumes safely after tab focus changes, respects reduced motion where appropriate, and never blocks gameplay when Web Audio or an asset fails.

## Reliability and graceful failure

- [ ] Validate and migrate loaded save data before using it: reject unknown character, exhibit, clue, contradiction, timeline, setting, and ending values; recover safely from corrupted or older saves; and add regression tests.
- [ ] Add asset preloading and graceful fallbacks for missing or failed background, character, artifact, memory, suspect, UI, and future audio assets so the game remains understandable and completable.
- [ ] Prevent transient notifications from covering evidence-board controls or cards; make stacked toasts readable at supported desktop viewport sizes.

## Required QA and test coverage

- [ ] Exercise both investigators through front, back, left, right, idle, walk, interaction, memory replay, accusation, and ending flows; verify their scale, shadows, foot anchors, and accessories remain consistent.
- [ ] Test every wall, case, pedestal, and decorative collision from multiple approach angles, plus depth sorting, vertical scaling, foreground overlap, diagonal movement, and returning to the exact pre-inspection position.
- [ ] Add explicit tests that clues unlock only once, restored memories replay without duplicating progress, wrong timeline placements can be moved and corrected, and all five valid and several invalid contradiction combinations produce the intended feedback.
- [ ] Add a keyboard-only end-to-end route covering character selection, movement, exhibit interactions, journal tabs, memory choices, timeline placement, contradiction linking, accusation, archive decision, Escape behavior, and modal focus return/trapping.
- [ ] Run an accessibility audit for contrast, visible focus, semantic names/roles, heading structure, non-color status cues, screen-reader announcements, text scaling, reduced motion, replay controls, and audio alternatives; fix every material issue found.
- [ ] Verify the complete game at representative desktop sizes and zoom levels (including 1280×720, 1440×900, 1920×1080, 200% zoom, and a narrow desktop window) without clipped controls, unreadable text, or inaccessible scrolling.
- [ ] Conduct fresh-player playtests to confirm the full route is understandable without developer help and lasts roughly 10–20 minutes; revise onboarding, objective copy, hints, and pacing from observed failures.
- [ ] Perform a final visual asset audit confirming no reference sheets, labels, numbers, cream backgrounds, checker artifacts, malformed frames, inconsistent character details, or unrelated objects appear in gameplay.

## Release readiness

- [ ] Add a single repeatable final-verification command that starts the app as needed and runs syntax checks plus both Playwright suites sequentially, avoiding concurrent Chromium launch failures.
- [ ] Update `README.md` after the remaining work is finished: remove the “preliminary” label, document final audio/settings behavior, state supported desktop browsers and viewport assumptions, and record the final verification command.
- [ ] Run the final verification from a clean checkout, complete one uninterrupted manual playthrough without editing saved state, inspect the browser console and network panel for errors or missing assets, and record the result in the project log.
