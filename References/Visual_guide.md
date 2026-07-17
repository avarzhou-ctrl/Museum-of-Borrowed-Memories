# Visual and Implementation Guide

Use the supplied images as the primary visual references for **Museum of Borrowed Memories**.

## **Reference Files**

Found in `/References`

* `Character_front.png` — front-facing character designs and animation poses  
* `Character_back.png` — rear-facing and side-facing character designs and animation poses  
* `Gameplay.png` — exploration layout, museum lighting, atmosphere, and HUD placement  
* `Interface.png` — inspection, memory, clue journal, contradiction, accusation, and ending screens

## **Overall Visual Direction**

The museum should appear:

* dark  
* elegant  
* dreamlike  
* painterly  
* slightly unreal  
* beautiful but unsettling

Use a palette built around:

* deep purple  
* black  
* muted rose  
* warm amber  
* antique gold  
* pale cream  
* soft violet light

The museum should include:

* polished glass cases  
* dark wood pedestals  
* reflective floors  
* brass decorations  
* candles and chandeliers  
* glowing memory particles  
* subtle butterflies  
* tall arches  
* decorative Victorian borders

The visual tone should be mysterious and bittersweet rather than graphic or frightening.

Avoid:

* bright cartoon colors  
* modern neon interfaces  
* pixel art  
* generic white panels  
* Bootstrap-style layouts  
* mobile-game controls  
* heavily exaggerated chibi proportions

## **Character Direction**

Use the male and female investigators shown in the reference sheets.

Characters should be:

* stylized but not heavily chibi  
* approximately five heads tall  
* slightly realistic in proportion  
* small relative to the environment  
* dressed in dark Victorian-inspired investigator clothing  
* visually consistent across gameplay and interface screens

Keep the character designs consistent in:

* coat shape  
* hair  
* hat  
* shoulder bag  
* buttons  
* shoes  
* accessories  
* body proportions

The eyes should be smaller and more natural than standard chibi or anime eyes.

Avoid:

* oversized heads  
* extremely large eyes  
* very short limbs  
* bouncing idle animations  
* exaggerated facial expressions  
* inconsistent accessories between frames

## **Character Animation Assets**

The character sheets may be used directly as the basis for animation.

Extract, crop, clean, and standardize the illustrated poses where possible.

Required animation states:

| Animation | Directions |
| ----- | ----- |
| Idle | front, back, side |
| Walk | front, back, left, right |
| Interact | front, back, side |

The left-facing walk animation may be created by horizontally flipping a clean right-facing sequence when appropriate.

Preserve the same character design across all frames.

## **Frame Preparation**

Before placing reference-sheet frames into the game:

1. Remove the cream background.  
2. Remove labels, numbers, borders, and unrelated objects.  
3. Place each frame on a transparent canvas of identical dimensions.  
4. Align all frames using the character’s feet as the anchor.  
5. Normalize scale and horizontal position.  
6. Remove visible artifacts.  
7. Export transparent PNG sequences or a clean sprite atlas.

Do not display the complete reference sheets inside the game.

Generated frames may contain inconsistencies. Correct problems such as:

* changing eye size  
* shifting bag position  
* missing buttons  
* altered coat length  
* changing hair shape  
* malformed hands  
* missing accessories  
* feet moving vertically  
* character scale changing between frames

When a frame cannot be cleaned reliably, recreate it from the nearest valid frame.

## **Suggested Animation Timing**

Use restrained, smooth animation.

| Animation | Frames | Speed |
| ----- | ----- | ----- |
| Idle | 4–6 | 5–7 FPS |
| Walk | 6–8 | 8–10 FPS |
| Interact | 4–6 | 6–8 FPS |

Idle animation should include only subtle breathing, blinking, or clothing movement.

Walking should use small, natural steps.

Interaction animation may show the character:

* reaching toward an exhibit  
* raising a magnifying glass  
* opening a journal  
* examining an object  
* touching a glass case

## **Character Selection**

At the beginning of the game, allow the player to select either the male or female investigator.

The selected character remains active throughout the game.

Do not include a permanent avatar-switching control during exploration.

Character choice should affect:

* the exploration sprite  
* player portraits  
* ending artwork

It should not affect clues, suspects, or the mystery solution.

## **Desktop Controls**

This is a desktop computer application.

Use:

| Input | Action |
| ----- | ----- |
| WASD or Arrow Keys | Move |
| E or Space | Interact |
| Mouse | Inspect objects and use menus |
| Escape | Close panel or open pause menu |
| J | Open journal |
| M | Open map |

When the player approaches an exhibit, show a small contextual prompt such as:

E — Inspect

Do not include:

* virtual joysticks  
* touch controls  
* on-screen movement pads  
* oversized circular buttons  
* permanent avatar-selection controls

## **2.5D Exploration**

The museum should appear dimensional without requiring a fully 3D environment.

Use:

* fixed or mostly fixed camera angles  
* layered background, middle-ground, and foreground art  
* character scaling based on vertical position  
* soft contact shadows  
* subtle parallax  
* foreground objects that overlap the character  
* restricted walkable areas  
* depth sorting

Objects closer to the bottom of the screen should render in front of the character.

Characters farther toward the back of the room should appear slightly smaller.

Example scaling logic:

const depth \= clamp(

  (playerY \- roomTop) / (roomBottom \- roomTop),

  0,

  1

);

const scale \= lerp(0.72, 1.0, depth);

Use a polygonal walk region, navigation mesh, or collision boundaries so the player cannot walk through:

* pedestals  
* glass cases  
* walls  
* furniture  
* decorative barriers

The player does not need free camera rotation.

## **Main Gameplay Screen**

Use `Gameplay.png` as the primary layout reference.

Include:

* museum title and room name in the upper-left  
* current objective below the room title  
* menu, journal, clues, and map in the upper-right  
* memory progress in a small side panel  
* exhibit labels on display bases  
* interaction prompts near active exhibits  
* the Glass Orchard as the distant central focal point

The player character should remain relatively small.

The museum environment and exhibits should dominate the composition.

Do not include a mobile joystick.

## **Exhibit Interaction**

When the player approaches an exhibit:

1. Highlight the exhibit subtly.  
2. Show an interaction prompt.  
3. Pause character movement after interaction begins.  
4. Transition to the Exhibit Viewer.  
5. Return the player to the same position afterward.

Highlight effects may include:

* a soft gold outline  
* a faint butterfly icon  
* a small glow  
* particles gathering around the object

Avoid strong neon outlines.

## **Exhibit Viewer**

Use a dark, museum-like close-up screen.

Include:

* the object in the center or left side  
* exhibit title  
* short description  
* manipulation controls  
* visible clue details  
* close button  
* optional inspection prompt

Possible interactions include:

* dragging to rotate  
* clicking a crack  
* wiping condensation  
* opening an umbrella  
* turning pages  
* arranging musical notes  
* pressing a sequence  
* matching memory fragments

The viewer should resemble a museum display rather than a standard software modal.

## **Memory Viewer**

Memory scenes should feel softer and less stable than the museum.

Use:

* blurred edges  
* muted purple lighting  
* drifting particles  
* slight distortion  
* slow fades  
* layered silhouettes  
* incomplete dialogue  
* sound cues

The player may switch between:

* object memory  
* human memory  
* restored memory

Missing details should be restored through two or three selectable options.

The correct selection reveals a clue.

Incorrect selections may briefly distort the scene but should not permanently block progress.

## **Journal**

The journal should resemble an old investigator’s notebook.

Include tabs for:

* Clues  
* People  
* Memories  
* Timeline  
* Notes

Clue cards may contain:

* object illustration  
* clue title  
* short description  
* source exhibit  
* related suspect  
* timeline relevance

Use parchment, dark leather, brass tabs, and handwritten-style annotations.

Avoid plain white cards.

## **Timeline Board**

The timeline should present empty time slots and draggable event cards.

Each event card should include:

* time  
* event title  
* small illustration or symbol  
* source clue

Correct placement should produce:

* a soft glow  
* a quiet sound  
* a connecting line

Incorrect placement should remain movable without harsh failure feedback.

## **Contradiction Board**

The contradiction board should resemble a dark evidence wall or museum archive panel.

The player connects:

* a suspect statement  
* an exhibit memory  
* a physical clue

Use thread, brass pins, cards, photographs, and handwritten notes.

Correct connections should unlock updated suspect statements.

## **Suspect Interface**

Each suspect should have:

* portrait  
* role  
* initial statement  
* updated statement  
* known contradictions  
* emotional reveal

Portraits should match the game’s character style but may be more detailed than exploration sprites.

The Museum may be represented by:

* an empty portrait frame  
* an exhibit label  
* a changing symbol  
* the Glass Orchard  
* a dark silhouette of the building

## **Accusation Screen**

Use selectable cards or dropdown-like panels.

The player selects:

* culprit  
* method  
* location  
* motive

Display the final sentence before confirmation:

On opening night, \[who\] used \[how\] to trap Elian inside \[where\] because \[why\].

Use a prominent but restrained **Confirm Accusation** button.

Do not require the player to type the full answer.

## **Ending Screens**

Ending screens should reuse museum locations while changing their mood.

Examples:

* empty glass cases  
* returned memories floating away  
* the Glass Orchard breaking  
* Elian stepping out of the archive  
* the player’s name appearing on an exhibit label

Use short text, environmental storytelling, and restrained animation.

Avoid long exposition dumps.

## **Interface Style**

UI panels should feel physically connected to the museum.

Use:

* parchment  
* dark wood  
* aged paper  
* brass  
* glass  
* velvet  
* thin gold borders  
* serif typography  
* subtle handwritten notes

Buttons should have clear hover and focus states.

Keep text readable despite the dark background.

Do not sacrifice usability for decorative detail.

## **Accessibility**

Include:

* readable text sizes  
* keyboard navigation  
* visible focus indicators  
* adjustable text speed  
* optional reduced motion  
* subtitles for all important audio  
* sufficient contrast  
* volume controls  
* ability to replay memories

Do not rely on color alone to communicate whether a clue is correct.

## **Asset Structure**

Use an organization similar to:

assets/

  characters/

    female/

      front/

        idle/

        walk/

        interact/

      back/

        idle/

        walk/

        interact/

      side/

        idle/

        walk/

        interact/

    male/

      front/

      back/

      side/

  museum/

    rooms/

    exhibits/

    glass-orchard/

  ui/

    icons/

    frames/

    journal/

    clues/

    suspects/

    endings/

  audio/

    music/

    ambience/

    effects/

Use one central character-animation configuration instead of hard-coding file paths throughout the application.

const characterAnimations \= {

  female: {

    idleFront: \[\],

    idleBack: \[\],

    idleSide: \[\],

    walkFront: \[\],

    walkBack: \[\],

    walkLeft: \[\],

    walkRight: \[\],

    interactFront: \[\],

    interactBack: \[\],

    interactSide: \[\]

  },

  male: {

    idleFront: \[\],

    idleBack: \[\],

    idleSide: \[\],

    walkFront: \[\],

    walkBack: \[\],

    walkLeft: \[\],

    walkRight: \[\],

    interactFront: \[\],

    interactBack: \[\],

    interactSide: \[\]

  }

};

## **Implementation Order**

Build the game in this order:

1. Main museum room  
2. Walkable area and collision boundaries  
3. Character selection  
4. Character animation  
5. Exhibit interaction prompts  
6. Exhibit Viewer  
7. Memory Viewer  
8. Clue Journal  
9. Timeline Board  
10. Contradiction Board  
11. Suspect statements  
12. Accusation Screen  
13. Ending logic  
14. Lighting, particles, sound, and transitions  
15. Accessibility and final polish

Prioritize a complete playable mystery over perfect reproduction of every decorative detail.

## **Final Asset Restriction**

The supplied images are concept references and animation sources, not finished production sheets.

It is acceptable to crop and reuse the character poses, but all frames must be cleaned, standardized, and exported separately.

Never display:

* full reference sheets  
* frame numbers  
* cream sheet backgrounds  
* decorative sheet borders  
* reference labels  
* unrelated exhibit stands  
* visible generation artifacts

Use the images to maintain a consistent style across the entire game.

