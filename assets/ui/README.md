# Supplied replacement UI assets

These transparent UI elements are deterministic crops of the user-supplied sheets in `References/replacements/`.

- `gallery-title.png`, `menu.png`, `journal.png`, `clues.png`, and `map.png` come from `ui-sheet.png`.
- `digits/0.png` through `digits/9.png` come from `numbers-sheet.png`.
- `floor-thirteen.png` combines the supplied gold `1` and `3` for the elevator exhibit.
- `inspect-prompt.png` preserves the supplied interaction-key treatment for future interface use.

Run `python3 scripts/prepare_replacement_assets.py` to reproduce these files and reinstall the supplied main-gallery background.

## Generated painted interface set

The files in `generated/` were created with the built-in image-generation workflow, using the supplied journal/case-board and object-inspection screenshots as visual references. They are production UI surfaces, not crops of the screenshots.

- `tool-eye.png`, `tool-hand.png`, and `tool-magnifier.png`: square Victorian museum medallions with a strong eye, open hand, or magnifying-glass silhouette; rustic hand-painted oil texture, aged brass rim, dark plum enamel, no text.
- `auditor-journal.png`: blank open antique investigator ledger with two aged parchment pages, leather spine, brass corners, and a deep-plum desk surround; no writing.
- `victorian-panel.png`: ornate aged-brass and blackened-wood landscape frame with a blank deep-plum center for live controls and text.
- `evidence-card.png`: blank lined evidence dossier with worn parchment, brass corner clips, and a single oxblood pushpin; no text.
- `case-board.png`: blank charcoal-plum felt evidence board with a restrained antique frame, subtle pinholes, and no fixed papers, strings, or labels.

The generated sources were resized for browser delivery while preserving their aspect ratios. Interface copy and interaction state remain live HTML so the images never contain essential text.
