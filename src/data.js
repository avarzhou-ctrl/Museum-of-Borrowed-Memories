/* The mystery lives here so presentation and progression do not duplicate narrative rules. */
window.GAME_DATA = {
  exhibits: {
    raincoat: {
      title: "The Raincoat That Never Dried",
      shortTitle: "The Raincoat",
      phase: 1,
      description: "A child-sized yellow raincoat. Water gathers on its case although the gallery is dry.",
      property: "It remembers every person who left the museum crying.",
      investigation: {
        statement: "Celeste: “I left before the storm.”",
        observations: [
          { id: "wet-hem", tool: "eye", label: "Rain on the inner hem", hotspotName: "Inspect the raincoat hem", detail: "Water beads inside the hem, where a sealed display could not have gathered it.", x: 48, y: 72, w: 18, h: 16 },
          { id: "familiar-trace", tool: "hand", label: "A familiar trace on the sleeve", hotspotName: "Examine the raincoat sleeve", detail: "The wet sleeve carries Celeste’s violet perfume and the warmth of a recent touch.", x: 39, y: 52, w: 18, h: 20 },
          { id: "fresh-repair", tool: "magnifier", label: "Fresh fibers in the lining", hotspotName: "Magnify the raincoat lining", detail: "New burgundy fibers snag inside a repair made after the case was catalogued.", x: 57, y: 58, w: 17, h: 18 }
        ],
        correctConnection: ["wet-hem", "familiar-trace"],
        incorrectHint: "Find one detail that proves the coat was worn and another that identifies who touched it.",
        deduction: "Celeste returned during the storm.",
        fragments: [
          { id: "returns", caption: "Celeste crosses the threshold during the storm." },
          { id: "searches", caption: "She searches for the memory of her sister." },
          { id: "recognized", caption: "The raincoat recognizes the familiar hand on its sleeve." }
        ]
      },
      artifactImage: "assets/artifacts/raincoat.png",
      memoryImage: "assets/memories/raincoat.png",
      memory: "A soaked figure crosses the threshold long after she claimed to have left. The raincoat trembles as the museum recognizes her.",
      perspectives: {
        object: "Cold rain strikes first. Then hurried footsteps, perfume, and a familiar hand brushing the wet sleeve.",
        human: "Celeste remembers returning for her sister's memory, terrified that the museum would erase the last thing she still possessed.",
        restored: "A soaked Celeste crosses the threshold long after she claimed to have left. The raincoat trembles as the museum recognizes her."
      },
      question: "Who returned during the storm?",
      choices: ["Jonah Reed", "Celeste Wren", "Mara Vale"],
      answer: "Celeste Wren",
      clue: {
        id: "returned-in-storm",
        title: "A Storm-Soaked Return",
        text: "The Raincoat remembers Celeste returning after she claimed to have left.",
        suspect: "Celeste Wren",
        time: "11:24 PM"
      }
    },
    teacup: {
      title: "The Cracked Teacup",
      shortTitle: "The Teacup",
      phase: 1,
      description: "Porcelain painted with strawberries. The old tea ripples whenever a lie is spoken nearby.",
      property: "Its cracks have rearranged themselves into the shape of words.",
      investigation: {
        statement: "Mara: “I never spoke to Elian that night.”",
        observations: [
          { id: "rippling-tea", tool: "eye", label: "Tea rippling without movement", hotspotName: "Inspect the surface of the tea", detail: "The old tea trembles although the cup and table remain perfectly still.", x: 50, y: 39, w: 20, h: 15 },
          { id: "warm-fracture", tool: "hand", label: "A fresh, warm fracture", hotspotName: "Touch the cracked handle", detail: "One fracture is warmer than the porcelain around it, as if a lie has just reopened it.", x: 65, y: 53, w: 18, h: 20 },
          { id: "cracked-words", tool: "magnifier", label: "Words inside the newest crack", hotspotName: "Magnify the newest crack", detail: "The fracture holds two names—Elian and Mara—and the shape of the word ‘empty.’", x: 48, y: 57, w: 20, h: 18 }
        ],
        correctConnection: ["warm-fracture", "cracked-words"],
        incorrectHint: "The useful pair must show that the crack is recent and preserve what was said.",
        deduction: "Mara argued with Elian shortly before he vanished.",
        fragments: [
          { id: "confronts", caption: "Elian confronts Mara beside the service table." },
          { id: "sharpens", caption: "Their voices sharpen and the old tea begins to ripple." },
          { id: "condemns", caption: "Mara condemns his plan to empty the archive." }
        ]
      },
      artifactImage: "assets/artifacts/teacup.png",
      memoryImage: "assets/memories/teacup.png",
      memory: "Elian stands beside a service table. Mara's voice is low and furious: ‘You would empty every case for the sake of people who chose to forget.’",
      perspectives: {
        object: "Tea shivers against porcelain. Two voices sharpen, and the newest crack opens precisely when Mara says the memories belong here.",
        human: "Mara remembers an argument about duty: Elian called preservation theft; she called his plan a second destruction.",
        restored: "Elian stands beside a service table. Mara's voice is low and furious: ‘You would empty every case for the sake of people who chose to forget.’"
      },
      question: "What detail completes the memory?",
      choices: ["Mara leaves without speaking", "Mara and Elian argue", "Celeste breaks the cup"],
      answer: "Mara and Elian argue",
      clue: {
        id: "mara-argument",
        title: "An Argument Remembered",
        text: "The Teacup heard Mara arguing with Elian shortly before he vanished.",
        suspect: "Mara Vale",
        time: "11:10 PM"
      }
    },
    umbrella: {
      title: "The Donor’s Silver Umbrella",
      shortTitle: "The Umbrella",
      phase: 1,
      description: "An elegant silver umbrella with tiny moon charms and Celeste Wren’s initials on the handle.",
      property: "It remembers being carried into the wrong room.",
      investigation: {
        statement: "Museum label: “The umbrella was found near Celeste.”",
        observations: [
          { id: "dry-grip", tool: "eye", label: "A completely dry grip", hotspotName: "Inspect the umbrella grip", detail: "The handle and wrist strap are dry despite the museum’s account of a storm-soaked owner.", x: 51, y: 28, w: 18, h: 18 },
          { id: "wet-tip", tool: "hand", label: "Water only on the tip", hotspotName: "Touch the umbrella tip", detail: "The metal tip is wet and cold, but no water has traveled up the folded canopy.", x: 50, y: 76, w: 18, h: 16 },
          { id: "moved-tag", tool: "magnifier", label: "A displaced provenance tag", hotspotName: "Magnify the initials and tag", detail: "Celeste’s initials are genuine, but the archive-corridor location was added in different ink.", x: 58, y: 43, w: 18, h: 18 }
        ],
        correctConnection: ["wet-tip", "moved-tag"],
        incorrectHint: "Look for evidence that the umbrella’s location—and even its wetness—was manufactured.",
        deduction: "The umbrella was planted to frame Celeste.",
        fragments: [
          { id: "taken", caption: "A museum attendant takes the umbrella from the donor cloakroom." },
          { id: "wetted", caption: "Only its tip is pressed into rainwater." },
          { id: "planted", caption: "It is placed beside Celeste’s belongings at 11:50." }
        ]
      },
      artifactImage: "assets/artifacts/umbrella.png",
      memoryImage: "assets/memories/umbrella.png",
      memory: "A gloved hand sets the umbrella beside Celeste's things at 11:50. Its wet tip points toward the archive corridor—not the door.",
      perspectives: {
        object: "A gloved grip closes around the silver handle. The hand is dry; only the umbrella's tip is pressed into rainwater.",
        human: "Celeste remembers leaving the umbrella in the donor cloakroom. She never carried it near the archive corridor.",
        restored: "A gloved museum attendant plants the umbrella beside Celeste's things at 11:50, after Elian has already vanished."
      },
      question: "Why was the umbrella moved?",
      choices: ["To dry it", "To frame Celeste", "To open the elevator"],
      answer: "To frame Celeste",
      clue: {
        id: "planted-umbrella",
        title: "Planted Silver",
        text: "The Umbrella was moved after Elian disappeared to make Celeste look responsible.",
        suspect: "The Museum",
        time: "11:50 PM"
      }
    },
    elevator: {
      title: "The Elevator Button for Floor Thirteen",
      shortTitle: "Floor Thirteen",
      phase: 2,
      description: "A brass button in a velvet box. The number 13 is worn smooth by hands no guest remembers seeing.",
      property: "It remembers every fingerprint that has touched it.",
      investigation: {
        statement: "Mara: “I never entered the archive.”",
        observations: [
          { id: "hidden-control", tool: "eye", label: "A concealed thirteen", hotspotName: "Inspect the worn elevator numeral", detail: "The brass has been polished by repeated use, but only around the hidden number thirteen.", x: 50, y: 48, w: 19, h: 20 },
          { id: "pressure-points", tool: "hand", label: "Four pressure points", hotspotName: "Feel the edge of the elevator control", detail: "Four shallow dents form a deliberate activation pattern around the button.", x: 51, y: 61, w: 24, h: 18 },
          { id: "mara-print", tool: "magnifier", label: "Mara’s fresh fingerprint", hotspotName: "Magnify the fingerprints", detail: "Mara’s fresh print overlaps Jonah’s older print and carries gold archive dust.", x: 59, y: 42, w: 17, h: 19 }
        ],
        correctConnection: ["hidden-control", "mara-print"],
        incorrectHint: "Connect the concealed route with the fresh evidence of who activated it.",
        deduction: "Mara used Floor Thirteen while Jonah watched.",
        fragments: [
          { id: "presses", caption: "Mara presses the concealed four-point sequence." },
          { id: "opens", caption: "The hidden elevator opens onto the archive." },
          { id: "steps-aside", caption: "Jonah sees her and deliberately steps aside." }
        ]
      },
      artifactImage: "assets/artifacts/elevator.png",
      memoryImage: "assets/memories/elevator.png",
      memory: "Mara presses the hidden control. Jonah watches from the landing and steps aside. Gold dust clings to both their hands.",
      perspectives: {
        object: "Four pressures wake the brass. Mara's fingerprint arrives last; Jonah's is older, worn into the edge where he tested the mechanism.",
        human: "Jonah remembers stepping aside. He told himself Mara was protecting the collection and that watching was not the same as helping.",
        restored: "Mara presses the hidden control. Jonah watches from the landing and deliberately steps aside. Gold archive dust clings to both their hands."
      },
      question: "What did Jonah see?",
      choices: ["Celeste leaving", "Nothing at all", "Mara entering the archive"],
      answer: "Mara entering the archive",
      clue: {
        id: "archive-fingerprint",
        title: "The Thirteenth Fingerprint",
        text: "Mara used the hidden elevator while Jonah watched and let her pass.",
        suspect: "Mara Vale · Jonah Reed",
        time: "11:31 PM"
      }
    },
    musicbox: {
      title: "The Music Box With One Missing Note",
      shortTitle: "The Music Box",
      phase: 2,
      description: "A dark wood music box. Its ballerina always stops before the final turn.",
      property: "The missing note is not lost. It has been locked away.",
      investigation: {
        statement: "Museum label: “The missing note is ordinary damage.”",
        observations: [
          { id: "stopped-turn", tool: "eye", label: "A ballerina stopped before the final turn", hotspotName: "Inspect the ballerina", detail: "The figure always stops at the same point, waiting rather than failing.", x: 50, y: 33, w: 20, h: 22 },
          { id: "missing-tooth", tool: "hand", label: "A deliberately removed cylinder tooth", hotspotName: "Feel the music cylinder", detail: "The gap is smooth and intentional; the missing note was extracted, not broken away.", x: 47, y: 57, w: 22, h: 17 },
          { id: "answering-phrase", tool: "magnifier", label: "Four notes answered by the wall", hotspotName: "Magnify the engraved musical marks", detail: "Tiny marks spell D · A · C · B, and a mechanism inside the wall answers the phrase.", x: 62, y: 51, w: 19, h: 18 }
        ],
        correctConnection: ["missing-tooth", "answering-phrase"],
        incorrectHint: "The missing note matters only when paired with evidence that something else answers it.",
        deduction: "The melody is a key that activates the hidden archive.",
        fragments: [
          { id: "phrase", caption: "The four-note archive phrase is played." },
          { id: "locks", caption: "Seven locks turn inside the museum walls." },
          { id: "awakens", caption: "The Glass Orchard opens every glowing eye." }
        ]
      },
      artifactImage: "assets/artifacts/musicbox.png",
      memoryImage: "assets/memories/musicbox.png",
      memory: "Four notes pass down the archive corridor. Locks turn inside the walls. In the Orchard, every glass fruit opens its eye.",
      perspectives: {
        object: "The cylinder catches on one absent tooth. A second melody answers from inside the wall, and seven hidden locks turn together.",
        human: "Mara remembers learning the archive phrase from Elian's notes and practicing until the museum began to hum it back.",
        restored: "Four notes pass down the archive corridor. Locks turn inside the walls. In the Orchard, every glass fruit opens its eye."
      },
      question: "What did the melody activate?",
      choices: ["The donor wing", "The Glass Orchard", "The museum clock"],
      answer: "The Glass Orchard",
      clue: {
        id: "archive-melody",
        title: "The Missing Archive Note",
        text: "A four-note melody opens the hidden archive and activates the Glass Orchard.",
        suspect: "Mara Vale",
        time: "11:36 PM"
      }
    },
    guestbook: {
      title: "The Velvet Guestbook",
      shortTitle: "The Guestbook",
      phase: 2,
      description: "Pink velvet, gold-edged pages, and signatures whose owners insist they never wrote them.",
      property: "The book remembers consent differently from the people who gave it.",
      investigation: {
        statement: "The Museum: “EVERY OBJECT WAS FREELY GIVEN.”",
        observations: [
          { id: "covered-paragraph", tool: "eye", label: "A paragraph hidden beneath a hand", hotspotName: "Inspect the obscured paragraph", detail: "The final consent paragraph was positioned so a docent could cover it while guests signed.", x: 49, y: 45, w: 24, h: 18 },
          { id: "deep-impression", tool: "hand", label: "Writing impressed through two pages", hotspotName: "Feel the writing impressions", detail: "Every signature presses through the visible promise into a second sentence below.", x: 51, y: 64, w: 25, h: 16 },
          { id: "altered-copy", tool: "magnifier", label: "Different wording on the carbon copy", hotspotName: "Magnify the carbon copy", detail: "‘Temporary preservation’ becomes ‘permanent transfer’ on the concealed duplicate.", x: 63, y: 55, w: 20, h: 19 }
        ],
        correctConnection: ["covered-paragraph", "altered-copy"],
        incorrectHint: "Find the detail that concealed the terms and the detail that proves those terms changed.",
        deduction: "Visitors unknowingly signed permanent memory transfers.",
        fragments: [
          { id: "promised", caption: "Visitors are promised temporary preservation." },
          { id: "signed", caption: "They sign the visible consent line." },
          { id: "transferred", caption: "The hidden copy records a permanent memory transfer." }
        ]
      },
      artifactImage: "assets/artifacts/guestbook.png",
      memoryImage: "assets/memories/guestbook.png",
      memory: "A docent covers the final paragraph with one hand. Guests sign for ‘preservation’; the carbon copy beneath says ‘permanent transfer.’",
      perspectives: {
        object: "Each pen stroke presses through pink paper into a second sentence below. The lower page keeps words no guest was permitted to read.",
        human: "A visitor remembers being promised that painful memories would be stored temporarily, safe to reclaim whenever she wished.",
        restored: "A docent covers the final paragraph with one hand. Guests sign for ‘preservation’; the carbon copy beneath says ‘permanent transfer.’"
      },
      question: "What were visitors actually signing?",
      choices: ["A mailing list", "Meaningful informed consent", "A disguised memory transfer"],
      answer: "A disguised memory transfer",
      clue: {
        id: "borrowed-consent",
        title: "Consent in Disappearing Ink",
        text: "Visitors donated memories for years without understanding the permanent transfer.",
        suspect: "The Museum",
        time: "10:55 PM"
      }
    },
    orchard: {
      title: "The Glass Orchard",
      shortTitle: "The Glass Orchard",
      phase: 3,
      description: "A glass tree heavy with glowing fruit. Each one holds a life that belongs somewhere else.",
      property: "The oldest fruit beats with a living pulse.",
      investigation: {
        statement: "Archive record: “Elian Voss left the museum.”",
        observations: [
          { id: "elian-reflection", tool: "eye", label: "Elian’s reflection inside the oldest fruit", hotspotName: "Inspect the oldest glass fruit", detail: "The reflection moves independently of the gallery and turns toward the observer.", x: 51, y: 35, w: 22, h: 22 },
          { id: "living-pulse", tool: "hand", label: "A living heartbeat", hotspotName: "Feel the pulse in the glass roots", detail: "A human rhythm travels from the oldest fruit through the glass roots.", x: 49, y: 66, w: 24, h: 18 },
          { id: "fractured-face", tool: "magnifier", label: "Fractures forming Elian’s face", hotspotName: "Magnify the fractures in the fruit", detail: "Fine cracks repeat Elian’s features and bind them to the center of the tree.", x: 61, y: 43, w: 19, h: 20 }
        ],
        correctConnection: ["elian-reflection", "living-pulse"],
        incorrectHint: "Prove both identity and life: one detail shows who is inside, another shows that he survives.",
        deduction: "Elian is alive inside the Glass Orchard.",
        fragments: [
          { id: "melody", caption: "Mara plays the archive melody." },
          { id: "bends", caption: "The glass branches bend toward Elian." },
          { id: "imprisoned", caption: "The Orchard draws him alive into its heart." }
        ]
      },
      artifactImage: "assets/artifacts/orchard.png",
      memoryImage: "assets/memories/orchard.png",
      memory: "Mara plays the melody. The tree bends toward Elian and draws his reflection into its heart. ‘If you expose it,’ she whispers, ‘all of them disappear.’",
      perspectives: {
        object: "The oldest fruit has a heartbeat. When Elian reaches for it, every branch bends inward and the glass learns the shape of his face.",
        human: "Mara remembers choosing the archive over Elian. She believed one stolen life could preserve thousands of memories from oblivion.",
        restored: "Mara plays the melody. The tree bends toward Elian and draws him alive into its heart. ‘If you expose it,’ she whispers, ‘all of them disappear.’"
      },
      question: "Where is Elian now?",
      choices: ["He left the city", "He is dead", "He is alive inside the Orchard"],
      answer: "He is alive inside the Orchard",
      clue: {
        id: "elian-trapped",
        title: "The Living Fruit",
        text: "Elian is alive, imprisoned in the Glass Orchard by Mara and the archive melody.",
        suspect: "Mara Vale",
        time: "11:43 PM"
      }
    }
  },
  characterAnimations: {
    female: {
      idleFront: "assets/characters/female/idle-front.png",
      idleBack: "assets/characters/female/idle-back.png",
      idleSide: "assets/characters/female/idle-side.png",
      walkFront: ["assets/characters/female/walk-front-1.png", "assets/characters/female/walk-front-2.png"],
      walkBack: ["assets/characters/female/walk-back-1.png", "assets/characters/female/walk-back-2.png"],
      walkSide: ["assets/characters/female/walk-side-1.png", "assets/characters/female/walk-side-2.png"],
      interactFront: ["assets/characters/female/interact-front-1.png", "assets/characters/female/interact-front-2.png"],
      interactBack: ["assets/characters/female/interact-back-1.png", "assets/characters/female/interact-back-2.png"],
      interactSide: ["assets/characters/female/interact-side-1.png", "assets/characters/female/interact-side-2.png"]
    },
    male: {
      idleFront: "assets/characters/male/idle-front.png",
      idleBack: "assets/characters/male/idle-back.png",
      idleSide: "assets/characters/male/idle-side.png",
      walkFront: ["assets/characters/male/walk-front-1.png", "assets/characters/male/walk-front-2.png"],
      walkBack: ["assets/characters/male/walk-back-1.png", "assets/characters/male/walk-back-2.png"],
      walkSide: ["assets/characters/male/walk-side-1.png", "assets/characters/male/walk-side-2.png"],
      interactFront: ["assets/characters/male/interact-front-1.png", "assets/characters/male/interact-front-2.png"],
      interactBack: ["assets/characters/male/interact-back-1.png", "assets/characters/male/interact-back-2.png"],
      interactSide: ["assets/characters/male/interact-side-1.png", "assets/characters/male/interact-side-2.png"]
    }
  },
  timeline: [
    { id: "guests", time: "10:55 PM", title: "Guests arrive", source: "The Guestbook" },
    { id: "argument", time: "11:10 PM", title: "Elian confronts Mara", source: "The Teacup" },
    { id: "celeste", time: "11:24 PM", title: "Celeste searches the donor wing", source: "The Raincoat" },
    { id: "elevator", time: "11:31 PM", title: "Mara uses the hidden elevator", source: "Floor Thirteen" },
    { id: "melody", time: "11:36 PM", title: "The archive melody is played", source: "The Music Box" },
    { id: "trapped", time: "11:43 PM", title: "Elian is trapped in the Orchard", source: "The Glass Orchard" },
    { id: "planted", time: "11:50 PM", title: "False evidence is planted", source: "The Umbrella" }
  ],
  contradictions: [
    { id: "mara-spoke", suspect: "mara", speaker: "Mara", statement: "I never spoke to Elian that night.", memoryExhibit: "teacup", evidence: "mara-argument", update: "Elian confronted me. He wanted to empty the archive, even the memories people begged to forget." },
    { id: "mara-entered", suspect: "mara", speaker: "Mara", statement: "I never entered the archive.", memoryExhibit: "elevator", evidence: "archive-fingerprint", update: "I used Floor Thirteen. I believed the Orchard was the only thing keeping thousands of memories alive." },
    { id: "celeste-left", suspect: "celeste", speaker: "Celeste", statement: "I left before the storm.", memoryExhibit: "raincoat", evidence: "returned-in-storm", update: "I came back for my sister. The museum kept the last afternoon I could still remember her voice." },
    { id: "museum-umbrella", suspect: "museum", speaker: "Museum label", statement: "The umbrella was found near Celeste.", memoryExhibit: "umbrella", evidence: "planted-umbrella", update: "PROVENANCE REVISED: THE OBJECT WAS PLACED. THE COLLECTION REQUIRED A SAFER STORY." },
    { id: "jonah-saw", suspect: "jonah", speaker: "Jonah", statement: "I saw nothing.", memoryExhibit: "elevator", evidence: "archive-fingerprint", update: "I saw Mara enter. I took her money and stepped aside because I was afraid of losing everything." }
  ],
  suspects: [
    {
      id: "mara", name: "Mara Vale", role: "Deputy curator", image: "assets/suspects/mara-vale.png",
      statement: "I left Elian to finish the preview alone.",
      reveal: "Mara trapped Elian, but believes the archive rescues fragile memories from oblivion.",
      contradictionIds: ["mara-spoke", "mara-entered"]
    },
    {
      id: "jonah", name: "Jonah Reed", role: "Night guard", image: "assets/suspects/jonah-reed.png",
      statement: "The gallery was quiet. I saw nothing.",
      reveal: "Jonah accepted a bribe and enabled Mara, but he did not trap Elian.",
      contradictionIds: ["jonah-saw"]
    },
    {
      id: "celeste", name: "Celeste Wren", role: "Museum donor", image: "assets/suspects/celeste-wren.png",
      statement: "I left before the storm began.",
      reveal: "Celeste returned for her late sister’s memory and was framed with her own umbrella.",
      contradictionIds: ["celeste-left"]
    },
    {
      id: "museum", name: "The Museum", role: "Archive entity", image: "assets/suspects/the-museum.png",
      statement: "EVERY OBJECT WAS FREELY GIVEN.",
      reveal: "The Museum changes labels, obscures memories, and protects the collection through convenient stories.",
      contradictionIds: ["museum-umbrella"]
    }
  ],
  caseClues: [
    {
      id: "pattern-of-protection",
      title: "A Pattern of Protection",
      text: "Three disproven statements point to one design: Mara acted, Jonah enabled her, and the Museum edited the story.",
      suspect: "Mara Vale · The Museum",
      time: "Case synthesis",
      image: "assets/suspects/the-museum.png"
    }
  ],
  accusation: {
    who: ["Mara Vale", "Jonah Reed", "Celeste Wren", "The Museum"],
    how: ["the archive melody", "a poisoned teacup", "the hidden elevator", "a false confession"],
    where: ["the Glass Orchard", "the donor wing", "floor thirteen", "the raincoat case"],
    why: [
      "Elian was going to expose the museum’s stolen memories",
      "she wanted Celeste’s fortune",
      "Jonah threatened to resign",
      "the museum demanded a new exhibit"
    ]
  }
};
