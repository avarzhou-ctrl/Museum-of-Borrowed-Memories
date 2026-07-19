# Visual background assets

This directory contains the game's full-screen painterly backgrounds. No raw sprite or interface sheet is displayed in the game.

## `main-gallery.png`

Source: the user-supplied `References/replacements/main-gallery.png`, copied without generative modification by `scripts/prepare_replacement_assets.py`. The interactive exhibit hotspots are layered invisibly over its painted display cases.

## `title-gallery.png`

Created with the built-in `imagegen` tool on 2026-07-17.

Use case: `stylized-concept`

Prompt: Create cinematic painterly title key art in the same world as the references. Show a shadowed Victorian museum entrance opening toward a distant violet-lit arch. Place a glass bell jar on a dark wood pedestal in the far-right foreground containing a pale violet flower and a sealed rose envelope. Keep generous dark negative space at center-left for HTML title copy. Use low amber spotlights, violet memory glow, reflective marble, dark wood, aged plaster, faint butterflies, and a dreamy, bittersweet, quietly unsettling mood. No people, readable writing, UI, text, logos, watermark, neon, or modern objects.

References: `References/Title.png` and `References/Gameplay.png`.

## `title-wordmark.png`

Created with the built-in `imagegen` tool on 2026-07-19, using `title-gallery.png` as a palette and mood reference. The generated title was placed on a flat chroma-key background, converted to a transparent PNG, and tightly cropped for title-screen use.

Use case: `logo-brand`

Prompt: Create only an elegant two-line wordmark reading “MUSEUM OF” and “BORROWED MEMORIES,” using refined old-style serif lettering, restrained Art Nouveau flourishes, warm aged ivory, antique gold, and subtle dusty rose-violet accents. Keep the base state unlit so the interactive glow can be supplied by CSS. No subtitle, tagline, frame, plaque, scene, objects, watermark, or baked-in outer glow.

## `title-button-enter.png` and `title-button-continue.png`

Created with the built-in `imagegen` tool on 2026-07-19. Both assets were generated on flat chroma-key backgrounds, converted to transparent PNGs, and tightly cropped. Their empty centers deliberately preserve the accessible live button labels in `index.html`.

Use case: `ui-mockup`

Prompts: Create one empty, approximately 4:1 Victorian Art Nouveau button skin matching the title wordmark, with antique-gold and dusty-rose ornament over a deep plum center. The Enter version uses a warmer illuminated primary frame; the Continue version preserves the same silhouette in a quieter, less saturated state. No text, icons, scene, cast shadow, watermark, modern rounded rectangle, or neon styling.

## `start-cutscene.png`

User-supplied painterly opening-cutscene background. The composition reserves its dark right side for the player-paced story text defined in `References/Cutscenes.md`.

## `end-cutscene.png`

User-supplied painterly ending-cutscene background. Its dark left side carries the result-specific story selected by the accusation strength and archive decision.

## `archive-viewer.png`

Created with the built-in `imagegen` tool on 2026-07-17.

Use case: `stylized-concept`

Prompt: Create a reusable painterly archive alcove for exhibit inspection and restored-memory screens. Place an empty glass display dome on an ornate dark wood and brass pedestal in the left portion, with blurred gothic windows, velvet curtains, violet motes, and warm edge lighting. Keep the right portion dark and simple for readable HTML text. Match the supplied deep-plum, antique-gold, muted-rose, and violet palette. No object inside the dome, people, characters, interface controls, text, logos, watermark, neon, or modern UI.

References: `References/Interface.png` and `References/Gameplay.png`.
