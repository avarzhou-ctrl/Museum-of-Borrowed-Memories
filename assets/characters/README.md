# Generated investigator animation

Elara Finch and Silas Hart are copied directly from `References/replacements/female-sheet.png` and `male-sheet.png`. No character pixels are redrawn.

`sheet-copies/` contains each selected source frame without resampling on a solid `#ff00ff` background. `final/` contains transparent, foot-aligned 181×272 gameplay frames normalized to a consistent 240-pixel visible height.

Run `python3 scripts/prepare_character_assets.py` to rebuild the magenta copies and transparent gameplay frames. The script removes the sheet checker/background and disconnected floor shadow, preserves literal source copies, then scales only the transparent production silhouettes to the shared height.
