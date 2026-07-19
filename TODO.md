# Museum of Borrowed Memories — Final Checks

All remaining implementation work is complete. This deletion-based checklist now contains only release validation intentionally excluded from the current task.

## Manual and matrix QA

- [ ] Exercise both investigators through front, back, left, right, idle, walk, interaction, memory replay, accusation, and ending flows; visually compare scale, shadows, foot anchors, clothing, hair, bags, watches, and accessories in every state.
- [ ] Test every wall, case, pedestal, rope, and decorative collision from multiple approach angles; verify diagonal movement, depth sorting, vertical scaling, foreground overlap, and exact restoration of the pre-inspection position.
- [ ] Complete the entire game through keyboard input only, including character selection, movement, exhibit interaction, journal tabs, memory choices, timeline placement, contradiction linking, accusation, archive decision, Escape behavior, modal focus trapping, and focus return.
- [ ] Complete the final accessibility audit for visible focus, heading structure, semantic names/roles, non-color status cues, live announcements, 200% text scaling, modal focus, replay controls, reduced motion, and audio alternatives.
- [ ] Complete uninterrupted routes at 1280×720, 1440×900, 1920×1080, 200% zoom, and a narrow desktop window; confirm every panel remains readable, scrollable, and operable.
- [ ] Conduct fresh-player playtests to confirm the route is understandable without developer help and lasts roughly 10–20 minutes; revise onboarding, objective copy, hints, or pacing only if observed failures require it.
- [ ] Perform and record a frame-by-frame visual asset audit confirming no reference sheets, labels, numbers, cream backgrounds, checker artifacts, malformed frames, inconsistent character details, or unrelated objects appear in gameplay.

## Clean release verification

- [ ] From a clean checkout, run `./scripts/verify.sh`, complete one separate manual playthrough without seeded or edited state, inspect the browser console and network panel for errors or missing assets, and record the result in the project log.
