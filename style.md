# Museum of Borrowed Memories Style Guide

This document standardizes the visual language used throughout the game. The implementation source of truth is the `:root` token block in `styles.css`; new UI should reuse those variables before introducing new values.

## Visual direction

The game is dreamy, elegant, dark, painterly, and quietly uncanny. Interfaces should feel like physical museum objects made from dark wood, velvet, glass, aged paper, and antique brass.

Avoid bright cartoon colors, neon outlines, plain white software panels, modern dashboard styling, pixel art, mobile controls, and exaggerated animation.

## Color palette

| Token | Value | Use |
| --- | --- | --- |
| `--ink` | `#0b0810` | Deepest page and modal background |
| `--midnight` | `#120d1d` | Primary dark surface |
| `--violet` | `#2d1c43` | Elevated violet surface |
| `--violet-soft` | `#715184` | Dividers, inactive accents, memory effects |
| `--rose` | `#b67b83` | Warm secondary accent |
| `--gold` | `#c7a16a` | Borders, labels, metadata, inactive ornament |
| `--gold-bright` | `#f1d39a` | Headings, active controls, important highlights |
| `--cream` | `#f2e2c4` | Primary readable text |
| `--paper` | `#d9c4a7` | Journal and archival paper surfaces |
| `--danger` | `#d7898b` | Incorrect answers and warnings |
| `--success` | `#a9c79d` | Correct evidence and completed states |

### Color rules

- Body text uses cream or a muted cream-purple tint on dark surfaces.
- Gold communicates importance and interactivity, not failure or success.
- Violet lighting should remain soft and atmospheric rather than neon.
- Success and error states must use text, symbols, or borders in addition to color.
- Large panels should use layered dark gradients rather than flat black.

## Typography

### Display and interface serif

```css
font-family: "Bodoni 72", Didot, Baskerville, "Iowan Old Style",
  "Palatino Linotype", Georgia, serif;
```

Use for the museum title, room names, exhibit titles, modal headings, quotations, and decorative labels. Display headings use regular or medium weight; avoid heavy bold weights.

### Reading serif

```css
font-family: var(--serif);
```

`--serif` resolves to `"Iowan Old Style", "Palatino Linotype", Baskerville, Georgia, serif`. Use it for narrative passages, memory text, journal copy, and atmospheric interface labels.

### Functional sans-serif

```css
font-family: var(--sans);
```

`--sans` resolves to `Inter, Avenir, system-ui, sans-serif`. Use it for compact controls, form fields, settings, short instructions, and accessibility-focused content.

### Type scale

| Role | Recommended size | Treatment |
| --- | --- | --- |
| Display title | `2.5rem–5rem` | Serif, regular weight, tight line height |
| Room or modal heading | `1.8rem–2.7rem` | Serif, medium weight |
| Section heading | `1.2rem–1.7rem` | Serif, medium weight |
| Narrative text | `1rem–1.25rem` | Serif, `1.5–1.7` line height |
| Functional text | `0.82rem–1rem` | Sans-serif or serif by context |
| Eyebrow/metadata | `0.72rem–0.88rem` | Uppercase, `0.08em–0.17em` spacing |

Use text shadows sparingly over painterly backgrounds: normally `0 2px 8px #000` or `0 2px 10px #000`.

## Spacing and sizing

The base spacing rhythm is approximately `0.25rem`, `0.5rem`, `0.75rem`, `1rem`, `1.5rem`, and `2rem`.

- Compact control gaps: `0.25rem–0.55rem`
- Related content spacing: `0.75rem–1rem`
- Panel padding: `1.2rem–1.5rem`
- Large modal/content padding: `2rem`
- Desktop interactive controls: minimum `40px`, preferably `44px`, in either dimension
- Thin decorative borders: `1px`
- Small corner radius: `2px–3px`; use circular shapes only for medallions and icon controls

## Surfaces and borders

- Primary dark panel: a gradient between approximately `#191220` and `#0d0a12`.
- Raised controls: dark violet around `#241a28` with a muted gold-purple border.
- Journal surfaces: parchment around `--paper`, with brown text and subtle aged variation.
- Standard decorative border: `1px solid rgb(199 161 106 / 40%–60%)`.
- Secondary divider: `1px solid rgb(199 161 106 / 16%–25%)`.
- Major overlay shadow: `var(--shadow)`, currently `0 24px 70px rgb(0 0 0 / 55%)`.

Borders should be thin and restrained. Do not use thick glowing outlines around exhibits.

## Lighting and glow

- HUD medallions use a tight gold glow no larger than roughly `4px` at rest and `7px` on hover/focus.
- Memory effects may use broader violet light because they represent unstable recollection.
- Interactive exhibits do not glow on approach. Only the framed `E — Inspect` prompt appears.
- Completed exhibits may use one small violet or green-gold symbol rather than a large aura.
- Character shadows should be soft, dark, and grounded beneath the feet.

## Buttons and controls

- Default height is at least `44px` for primary buttons and `40px` for compact puzzle controls.
- Primary actions use a restrained antique-gold gradient with dark text.
- Secondary actions use dark violet surfaces with muted borders.
- Hover states may brighten the border or move upward by `1px`.
- Keyboard focus uses a visible `3px` `--gold-bright` outline with `3px` offset.
- Disabled controls remain readable at approximately `38%` opacity.
- HUD captions sit directly beneath their circular medallions.

## Imagery and characters

- Use the supplied gallery, UI medallions, numerals, and cleaned investigator sheets as the primary visual source.
- Never show a raw reference or sprite sheet in the game.
- Character frames use transparent, identically sized canvases and are aligned by the feet.
- Characters remain small relative to the gallery and scale from approximately `0.72` to `1.0` with room depth.
- Do not add white contact shadows or pale matte artifacts around/between the legs.
- Memory illustrations use dark violet, muted rose, warm amber, antique gold, and pale cream.

## Motion

- Movement should feel restrained and natural.
- Walking uses discrete directional sprite frames at approximately `8–10 FPS`.
- Interactions use short `6–8 FPS` reaching or inspection motions.
- UI transitions generally last `0.2–0.35s`.
- Ambient memory motion may be slower, around `4–8s`.
- Reduced-motion mode removes nonessential animation and transitions.

## Gallery interaction

- Painted exhibit cases and their signs are protected by collision rectangles.
- Clickable hitboxes cover the complete case and sign, but remain visually invisible.
- Approaching an unlocked exhibit displays only the framed contextual prompt.
- The lower labeled Cracked Teacup is the interactive Teacup display.
- Exhibit completion, lock state, and proximity must not obscure the supplied gallery painting.

## Accessibility

- Maintain readable contrast over all painterly backgrounds.
- Preserve visible keyboard focus on every interactive element.
- Use semantic headings, buttons, labels, tabs, and dialog roles.
- Support keyboard navigation, larger text, reduced motion, volume adjustment, and memory replay.
- Do not communicate state through color alone.
- Important audio information must also appear as text.

## Implementation references

- Global tokens and component styles: `styles.css`
- Gallery markup and HUD structure: `index.html`
- Character and exhibit data: `src/data.js`
- Interaction, movement, and collision behavior: `src/game.js`
- Replacement-asset preparation: `scripts/prepare_character_assets.py` and `scripts/prepare_replacement_assets.py`

