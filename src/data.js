/* The mystery lives here so presentation and progression do not duplicate narrative rules. */
window.GAME_DATA = {
  exhibits: {
    raincoat: {
      title: "The Raincoat That Never Dried",
      shortTitle: "The Raincoat",
      phase: 1,
      description: "A child-sized yellow raincoat. Water gathers on its case although the gallery is dry.",
      property: "It remembers every person who left the museum crying.",
      instruction: "Wipe five droplets from the glass.",
      puzzle: "wipe",
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
      instruction: "Rotate the cup until the fractures align near 72°.",
      puzzle: "rotate",
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
      instruction: "Open and close the umbrella three times to loosen the hidden clasp.",
      puzzle: "toggle",
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
      instruction: "Repeat the four-note pressure sequence: 1 · 3 · 1 · 2.",
      puzzle: "sequence",
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
      instruction: "Play the archive phrase: D · A · C · B.",
      puzzle: "melody",
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
      instruction: "Compare the signatures and identify the altered consent line.",
      puzzle: "compare",
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
      instruction: "Return each fragment to its owner: grief, guilt, and truth.",
      puzzle: "match",
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
