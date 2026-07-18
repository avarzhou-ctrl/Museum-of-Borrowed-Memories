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