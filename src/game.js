(() => {
  "use strict";

  const DATA = window.GAME_DATA;
  const SAVE_KEY = "museum-of-borrowed-memories-v1";
  const RESTORED_TRUTH_DWELL_MS = 3200;
  const DEFAULT_STATE = {
    started: false,
    character: null,
    completed: [],
    clues: [],
    contradictions: [],
    timeline: {},
    notes: "",
    settings: { reducedMotion: false, largeText: false, volume: 45, textSpeed: "calm" },
    player: { x: 50, y: 78 },
    ending: null
  };

  const HOTSPOTS = {
    raincoat: { x: 18, y: 82 }, teacup: { x: 25, y: 90 }, umbrella: { x: 36, y: 74 },
    orchard: { x: 50, y: 70 }, musicbox: { x: 63, y: 74 }, guestbook: { x: 77, y: 90 },
    elevator: { x: 91, y: 90 }
  };
  // These rectangles cover the painted cases and their signs, not just the object centers.
  const COLLISIONS = [
    { left: 10, right: 24, top: 43, bottom: 78 },
    { left: 18, right: 33, top: 61, bottom: 87.5 },
    { left: 29, right: 43, top: 43, bottom: 70 },
    { left: 40, right: 59, top: 43, bottom: 66 },
    { left: 55, right: 69, top: 43, bottom: 70 },
    { left: 68, right: 86, top: 55, bottom: 87.5 },
    { left: 86, right: 94, top: 58, bottom: 87.5 }
  ];
  const SYMBOLS = { raincoat: "⌑", teacup: "♨", umbrella: "☂", elevator: "13", musicbox: "♫", guestbook: "≋", orchard: "♧" };
  const EVENT_EXHIBIT = { guests: "guestbook", argument: "teacup", celeste: "raincoat", elevator: "elevator", melody: "musicbox", trapped: "orchard", planted: "umbrella" };
  const MUSEUM_LABELS = {
    raincoat: "SHE CAME BACK", teacup: "WE HEARD THEM", umbrella: "PLACED, NOT LOST",
    elevator: "THE THIRTEENTH WAY", musicbox: "THE ARCHIVE HUMS", guestbook: "EVERY GIFT WAS KEPT",
    orchard: "ONE LIFE PRESERVES MANY"
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const titleScreen = $("#title-screen");
  const selectionScreen = $("#selection-screen");
  const museumScreen = $("#museum-screen");
  const modalRoot = $("#modal-root");
  const player = $("#player");
  const sprite = $("#player-sprite");
  const prompt = $("#interaction-prompt");
  let state = loadState();
  let keys = new Set();
  let nearestExhibit = null;
  let movementFrame = null;
  let lastFrame = 0;
  let lastFocus = null;
  let selectedCharacter = null;
  let selectedTimelineEvent = null;
  let audioContext = null;
  let interactionTimeout = null;
  let textTimer = null;

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (!saved) return structuredClone(DEFAULT_STATE);
      return {
        ...structuredClone(DEFAULT_STATE), ...saved,
        settings: { ...DEFAULT_STATE.settings, ...(saved.settings || {}) },
        player: { ...DEFAULT_STATE.player, ...(saved.player || {}) }
      };
    } catch {
      return structuredClone(DEFAULT_STATE);
    }
  }

  function saveState() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }

  function showScreen(screen) {
    $$(".screen").forEach((item) => item.classList.toggle("is-active", item === screen));
  }

  function completedCount() { return state.completed.length; }
  function hasCompleted(id) { return state.completed.includes(id); }
  function hasClue(id) { return state.clues.includes(id); }
  function ordinaryCompleteCount() { return state.completed.filter((id) => id !== "orchard").length; }
  function phase2Unlocked() { return state.completed.filter((key) => DATA.exhibits[key]?.phase === 1).length >= 3; }
  function correctTimelineCount() {
    return DATA.timeline.filter((event) => state.timeline[event.time] === event.id).length;
  }
  function orchardUnlocked() { return ordinaryCompleteCount() >= 5 && state.contradictions.length >= 3; }
  function caseClue(id) { return DATA.caseClues?.find((item) => item.id === id); }
  function clueRecord(id) {
    const exhibit = Object.values(DATA.exhibits).find((item) => item.clue.id === id);
    if (exhibit) return { ...exhibit.clue, image: exhibit.artifactImage, exhibit: exhibit.shortTitle };
    return caseClue(id) || null;
  }
  function syncCaseClues() {
    if (state.contradictions.length >= 3 && !state.clues.includes("pattern-of-protection")) {
      state.clues.push("pattern-of-protection");
      saveState();
      return true;
    }
    return false;
  }
  function isUnlocked(id) {
    const exhibit = DATA.exhibits[id];
    if (exhibit.phase === 1) return true;
    if (exhibit.phase === 2) return phase2Unlocked();
    return orchardUnlocked();
  }

  function applySettings() {
    document.body.classList.toggle("reduced-motion", state.settings.reducedMotion);
    document.body.classList.toggle("large-text", state.settings.largeText);
    document.body.dataset.textSpeed = state.settings.textSpeed;
  }

  function toast(title, message = "") {
    const region = $("#toast-region");
    const item = document.createElement("div");
    item.className = "toast";
    item.innerHTML = `<strong>${title}</strong>${message ? `<span>${message}</span>` : ""}`;
    region.append(item);
    window.setTimeout(() => item.remove(), state.settings.reducedMotion ? 1800 : 3600);
  }

  function playTone(frequency = 440, duration = .09) {
    if (state.settings.volume <= 0) return;
    try {
      audioContext ||= new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.value = (state.settings.volume / 100) * .07;
      oscillator.connect(gain).connect(audioContext.destination);
      gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + duration);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    } catch { /* The game remains fully playable without Web Audio. */ }
  }

  function createParticles() {
    const particles = $("#particles");
    particles.innerHTML = "";
    for (let index = 0; index < 28; index += 1) {
      const particle = document.createElement("i");
      particle.className = "particle";
      particle.style.left = `${4 + Math.random() * 92}%`;
      particle.style.top = `${18 + Math.random() * 75}%`;
      particle.style.setProperty("--duration", `${6 + Math.random() * 8}s`);
      particle.style.setProperty("--dx", `${-40 + Math.random() * 80}px`);
      particle.style.setProperty("--dy", `${-25 - Math.random() * 70}px`);
      particle.style.animationDelay = `${-Math.random() * 8}s`;
      particles.append(particle);
    }
  }

  function updateMuseum() {
    const phase2JustUnlocked = ordinaryCompleteCount() === 3 && !sessionStorage.getItem("phase2-noticed");
    const museumPhase = orchardUnlocked() || hasCompleted("orchard") ? 3 : phase2Unlocked() ? 2 : 1;
    museumScreen.dataset.phase = String(museumPhase);
    syncCaseClues();
    $$(".exhibit").forEach((element) => {
      const id = element.dataset.exhibit;
      const unlocked = isUnlocked(id);
      element.classList.toggle("is-locked", !unlocked);
      element.classList.toggle("is-complete", hasCompleted(id));
      element.style.zIndex = Math.round(HOTSPOTS[id].y);
      element.setAttribute("role", "button");
      element.setAttribute("aria-label", `${hasCompleted(id) ? "Recall" : "Inspect"} ${DATA.exhibits[id].title}`);
      element.setAttribute("aria-disabled", String(!unlocked));
      element.tabIndex = unlocked ? 0 : -1;
      const mark = $(".lock-mark", element);
      if (mark) mark.classList.toggle("is-hidden", unlocked);
      const label = $(".pedestal span", element);
      if (label) {
        element.dataset.originalLabel ||= label.textContent;
        label.textContent = museumPhase >= 2 && hasCompleted(id) ? MUSEUM_LABELS[id] : element.dataset.originalLabel;
        label.classList.toggle("is-altered", museumPhase >= 2 && hasCompleted(id));
      }
    });
    $("#memory-count").textContent = `${completedCount()} / 7`;
    $("#progress-fill").style.width = `${(completedCount() / 7) * 100}%`;
    $("#objective").textContent = currentObjective();
    updatePlayerVisual();
    if (phase2JustUnlocked) {
      sessionStorage.setItem("phase2-noticed", "true");
      toast("The museum shifts", "Three more cases have opened. The labels are watching you.");
    }
  }

  function currentObjective() {
    if (hasCompleted("orchard") && completedCount() >= 6) return "The truth is assembled. Align five events and make your accusation.";
    if (ordinaryCompleteCount() >= 5 && state.contradictions.length < 3) return "Prove three contradictions on the Case Board.";
    if (orchardUnlocked() && !hasCompleted("orchard")) return "The Glass Orchard is awake. Approach the central case.";
    if (ordinaryCompleteCount() >= 3) return "Restore the newly awakened exhibits and organize your evidence.";
    return "Explore the gallery and restore the three accessible memories.";
  }

  function updatePlayerVisual() {
    const { x, y } = state.player;
    const character = state.character || "female";
    player.style.setProperty("--player-x", `${x}%`);
    player.style.setProperty("--player-y", `${y}%`);
    const depth = Math.max(0, Math.min(1, (y - 44) / 48));
    player.style.setProperty("--player-scale", (.72 + depth * .28).toFixed(3));
    player.style.zIndex = Math.round(y);
    museumScreen.style.setProperty("--parallax-x", `${((x - 50) / 50).toFixed(3)}`);
    museumScreen.style.setProperty("--parallax-y", `${((y - 67) / 24).toFixed(3)}`);
    sprite.className = `investigator investigator-${character}`;
    if (sprite.dataset.assetsFor !== character) {
      const frames = DATA.characterAnimations[character];
      const setFrame = (name, path) => sprite.style.setProperty(name, `url("${path}")`);
      setFrame("--idle-front", frames.idleFront); setFrame("--idle-side", frames.idleSide); setFrame("--idle-back", frames.idleBack);
      ["front", "side", "back"].forEach((direction) => {
        const title = direction[0].toUpperCase() + direction.slice(1);
        frames[`walk${title}`].forEach((path, index) => setFrame(`--walk-${direction}-${index + 1}`, path));
        frames[`interact${title}`].forEach((path, index) => setFrame(`--interact-${direction}-${index + 1}`, path));
      });
      sprite.dataset.assetsFor = character;
    }
  }

  function validPosition(x, y) {
    if (x < 7 || x > 94 || y < 43 || y > 91) return false;
    return !COLLISIONS.some((rect) => x > rect.left && x < rect.right && y > rect.top && y < rect.bottom);
  }

  function movementLoop(timestamp) {
    const delta = Math.min(34, timestamp - lastFrame || 16) / 1000;
    lastFrame = timestamp;
    if (museumScreen.classList.contains("is-active") && !modalRoot.classList.contains("is-open")) {
      let dx = 0; let dy = 0;
      if (keys.has("arrowleft") || keys.has("a")) dx -= 1;
      if (keys.has("arrowright") || keys.has("d")) dx += 1;
      if (keys.has("arrowup") || keys.has("w")) dy -= 1;
      if (keys.has("arrowdown") || keys.has("s")) dy += 1;
      const moving = (dx !== 0 || dy !== 0) && !player.classList.contains("is-interacting");
      player.classList.toggle("is-moving", moving);
      if (moving) {
        if (Math.abs(dx) >= Math.abs(dy)) {
          player.dataset.direction = "side";
          player.classList.toggle("facing-left", dx < 0);
        } else {
          player.dataset.direction = dy < 0 ? "back" : "front";
          player.classList.remove("facing-left");
        }
        const length = Math.hypot(dx, dy);
        const speed = 17 * delta;
        const nextX = state.player.x + (dx / length) * speed;
        const nextY = state.player.y + (dy / length) * speed;
        if (validPosition(nextX, state.player.y)) state.player.x = nextX;
        if (validPosition(state.player.x, nextY)) state.player.y = nextY;
        updatePlayerVisual();
      }
      updateNearestExhibit();
    }
    movementFrame = requestAnimationFrame(movementLoop);
  }

  function updateNearestExhibit() {
    let nearest = null;
    let distance = Infinity;
    Object.entries(HOTSPOTS).forEach(([id, spot]) => {
      if (!isUnlocked(id)) return;
      const value = Math.hypot((state.player.x - spot.x) * 1.25, state.player.y - spot.y);
      if (value < distance) { nearest = id; distance = value; }
    });
    $$(".exhibit").forEach((element) => element.classList.remove("is-near"));
    if (distance <= 10.5) {
      nearestExhibit = nearest;
      const element = $(`[data-exhibit="${nearest}"]`);
      element.classList.add("is-near");
      const spot = HOTSPOTS[nearest];
      prompt.style.left = `${spot.x}%`;
      prompt.style.top = `${spot.y - 11}%`;
      prompt.innerHTML = `<kbd>E</kbd> ${hasCompleted(nearest) ? "Recall" : "Inspect"}`;
      prompt.classList.remove("is-hidden");
    } else {
      nearestExhibit = null;
      prompt.classList.add("is-hidden");
    }
  }

  function openModal(html, className = "") {
    lastFocus = document.activeElement;
    keys.clear();
    player.classList.remove("is-moving");
    modalRoot.className = `modal-root is-open ${className}`;
    modalRoot.innerHTML = html;
    const modal = $(".modal", modalRoot);
    modal?.setAttribute("role", "dialog");
    modal?.setAttribute("aria-modal", "true");
    requestAnimationFrame(() => $("button, select, input, textarea, [tabindex]", modalRoot)?.focus());
  }

  function closeModal() {
    if (!modalRoot.classList.contains("is-open")) return;
    const notes = $("#notes-area", modalRoot);
    if (notes) { state.notes = notes.value; saveState(); }
    modalRoot.className = "modal-root";
    modalRoot.innerHTML = "";
    lastFocus?.focus?.();
  }

  function modalHeader(title, subtitle = "") {
    return `<header class="modal-header"><div><h2>${title}</h2>${subtitle ? `<p>${subtitle}</p>` : ""}</div><button class="close-button" data-close aria-label="Close panel">×</button></header>`;
  }

  function puzzleMarkup(id) {
    const exhibit = DATA.exhibits[id];
    if (hasCompleted(id)) return `<button class="button button-primary" data-replay="${id}">Replay restored memory</button>`;
    const title = `<h4>${exhibit.instruction}</h4>`;
    if (exhibit.puzzle === "wipe") return `${title}<div class="puzzle-progress" id="puzzle-status">0 of 5 droplets wiped</div>`;
    if (exhibit.puzzle === "rotate") return `${title}<input id="rotation" class="rotation-control" type="range" min="0" max="180" value="0" aria-label="Rotate teacup"><div class="puzzle-actions"><button class="puzzle-button" data-check-rotation>Align cracks</button></div><div class="puzzle-progress" id="puzzle-status">Angle: 0°</div>`;
    if (exhibit.puzzle === "toggle") return `${title}<div class="puzzle-actions"><button class="puzzle-button" data-toggle-umbrella>Open umbrella</button></div><div class="puzzle-progress" id="puzzle-status">The clasp is still fixed.</div>`;
    if (exhibit.puzzle === "sequence") return `${title}<div class="puzzle-actions">${[1, 2, 3].map((n) => `<button class="puzzle-button" data-sequence="${n}">${n}</button>`).join("")}</div><div class="puzzle-progress" id="puzzle-status">Sequence: —</div>`;
    if (exhibit.puzzle === "melody") return `${title}<div class="puzzle-actions">${["A", "B", "C", "D"].map((n) => `<button class="puzzle-button" data-note="${n}">${n}</button>`).join("")}</div><div class="puzzle-progress" id="puzzle-status">Melody: —</div>`;
    if (exhibit.puzzle === "compare") return `${title}<div class="signature-list"><button class="puzzle-button" data-signature="mailing">I consent to museum correspondence.</button><button class="puzzle-button" data-signature="preservation">I consent to temporary preservation.</button><button class="puzzle-button" data-signature="permanent">I surrender the memory for permanent transfer.</button></div><div class="puzzle-progress" id="puzzle-status">The carbon copy is faint.</div>`;
    return `${title}<div class="signature-list">
      <label>Celeste’s fragment <select data-match="celeste"><option>Choose owner</option><option>Celeste</option><option>Mara</option><option>Elian</option></select></label>
      <label>Mara’s fragment <select data-match="mara"><option>Choose owner</option><option>Celeste</option><option>Mara</option><option>Elian</option></select></label>
      <label>Elian’s fragment <select data-match="elian"><option>Choose owner</option><option>Celeste</option><option>Mara</option><option>Elian</option></select></label>
      <button class="puzzle-button" data-check-match>Return fragments</button></div><div class="puzzle-progress" id="puzzle-status">Grief remembers Celeste. Guilt knows Mara. Truth calls for Elian.</div>`;
  }

  function openExhibit(id) {
    if (!isUnlocked(id)) { toast("The case is sleeping", id === "orchard" ? "Restore six exhibits and prove three contradictions." : "Restore the first three memories."); return; }
    const exhibit = DATA.exhibits[id];
    openModal(`<section class="modal viewer-modal" aria-labelledby="viewer-title">
      ${modalHeader(exhibit.title, hasCompleted(id) ? "Memory restored · available for replay" : "Exhibit inspection")}
      <div class="viewer">
        <div class="object-stage" id="object-stage"><img class="stage-symbol artifact-hero" src="${exhibit.artifactImage}" alt="${exhibit.title} on display">${id === "raincoat" && !hasCompleted(id) ? `<div class="droplets" id="droplets"></div>` : ""}<div class="artifact-tools" aria-label="Inspection lenses"><button type="button" data-artifact-mode="observe" aria-label="Observe whole artifact" aria-pressed="true">◉</button><button type="button" data-artifact-mode="touch" aria-label="Focus on manipulable details" aria-pressed="false">✋</button><button type="button" data-artifact-mode="magnify" aria-label="Magnify artifact" aria-pressed="false">⌕</button></div></div>
        <div class="viewer-copy"><p class="eyebrow">Accession ${String(Object.keys(DATA.exhibits).indexOf(id) + 1).padStart(2, "0")} · memory-bearing object</p><h3>${exhibit.description}</h3><p class="property">${exhibit.property}</p><div class="puzzle-box" data-puzzle="${id}">${puzzleMarkup(id)}</div></div>
      </div></section>`);
    $$('[data-artifact-mode]', modalRoot).forEach((button) => button.addEventListener("click", () => {
      const stage = $("#object-stage", modalRoot);
      stage.dataset.mode = button.dataset.artifactMode;
      $$('[data-artifact-mode]', modalRoot).forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    }));
    setupPuzzle(id);
  }

  function beginExhibitInteraction(id) {
    if (!isUnlocked(id)) return openExhibit(id);
    if (player.classList.contains("is-interacting")) return;
    keys.clear();
    player.classList.remove("is-moving");
    player.classList.add("is-interacting");
    window.clearTimeout(interactionTimeout);
    interactionTimeout = window.setTimeout(() => {
      player.classList.remove("is-interacting");
      openExhibit(id);
    }, state.settings.reducedMotion ? 30 : 520);
  }

  function setupPuzzle(id) {
    if (hasCompleted(id)) return;
    let input = [];
    let toggles = 0;
    const status = () => $("#puzzle-status", modalRoot);
    const succeed = () => { playTone(660, .2); window.setTimeout(() => openMemory(id), 260); };
    if (id === "raincoat") {
      const positions = [[18,20],[68,18],[42,42],[77,61],[25,72],[57,77],[82,35]];
      positions.forEach(([left, top], index) => {
        const drop = document.createElement("button");
        drop.className = "droplet"; drop.style.left = `${left}%`; drop.style.top = `${top}%`;
        drop.setAttribute("aria-label", `Wipe droplet ${index + 1}`);
        drop.addEventListener("click", () => {
          drop.remove(); input.push(index); playTone(360 + input.length * 35);
          status().textContent = `${Math.min(input.length, 5)} of 5 droplets wiped`;
          if (input.length === 5) succeed();
        });
        $("#droplets", modalRoot).append(drop);
      });
    }
    $("#rotation", modalRoot)?.addEventListener("input", (event) => {
      const value = Number(event.target.value);
      $(".stage-symbol", modalRoot).style.transform = `rotate(${value}deg)`;
      status().textContent = `Angle: ${value}°`;
    });
    $("[data-check-rotation]", modalRoot)?.addEventListener("click", () => {
      const value = Number($("#rotation", modalRoot).value);
      if (Math.abs(value - 72) <= 8) succeed(); else { status().textContent = "The words almost meet. Try near 72°."; playTone(180); }
    });
    $("[data-toggle-umbrella]", modalRoot)?.addEventListener("click", (event) => {
      toggles += 1; const open = toggles % 2 === 1;
      event.currentTarget.textContent = open ? "Close umbrella" : "Open umbrella";
      $(".stage-symbol", modalRoot).style.transform = open ? "scale(1.18) rotate(-10deg)" : "scale(.82) rotate(8deg)";
      status().textContent = `${toggles} of 3 movements. ${open ? "Moon charms catch the light." : "Something clicks in the handle."}`;
      playTone(300 + toggles * 70); if (toggles >= 3) succeed();
    });
    $$('[data-sequence]', modalRoot).forEach((button) => button.addEventListener("click", () => {
      input.push(Number(button.dataset.sequence)); playTone(290 + Number(button.dataset.sequence) * 80);
      status().textContent = `Sequence: ${input.join(" · ")}`;
      const target = [1, 3, 1, 2];
      if (input.some((value, index) => value !== target[index])) { input = []; status().textContent = "The button rejects the pattern. Sequence reset."; playTone(150); }
      else if (input.length === target.length) succeed();
    }));
    $$('[data-note]', modalRoot).forEach((button) => button.addEventListener("click", () => {
      input.push(button.dataset.note); playTone({ A: 440, B: 494, C: 523, D: 587 }[button.dataset.note]);
      status().textContent = `Melody: ${input.join(" · ")}`;
      const target = ["D", "A", "C", "B"];
      if (input.some((value, index) => value !== target[index])) { input = []; status().textContent = "The ballerina turns away. Melody reset."; playTone(160); }
      else if (input.length === target.length) succeed();
    }));
    $$('[data-signature]', modalRoot).forEach((button) => button.addEventListener("click", () => {
      if (button.dataset.signature === "permanent") succeed();
      else { status().textContent = "That line appears unchanged on both copies."; playTone(180); }
    }));
    $("[data-check-match]", modalRoot)?.addEventListener("click", () => {
      const values = Object.fromEntries($$("[data-match]", modalRoot).map((select) => [select.dataset.match, select.value]));
      if (values.celeste === "Celeste" && values.mara === "Mara" && values.elian === "Elian") succeed();
      else { status().textContent = "A fruit clouds over. Listen to what each fragment carries."; playTone(170); }
    });
  }

  function renderPacedText(element, value) {
    window.clearInterval(textTimer);
    element.setAttribute("aria-label", value);
    const delay = state.settings.reducedMotion || state.settings.textSpeed === "instant" ? 0 : state.settings.textSpeed === "quick" ? 6 : 18;
    if (!delay) { element.textContent = value; return; }
    let index = 1;
    element.textContent = value.slice(0, index);
    textTimer = window.setInterval(() => {
      index += 1;
      element.textContent = value.slice(0, index);
      if (index >= value.length) window.clearInterval(textTimer);
    }, delay);
  }

  function setMemoryPerspective(id, perspective) {
    const exhibit = DATA.exhibits[id];
    const labels = { object: "Object Memory", human: "Human Recollection", restored: "Restored Truth" };
    const visual = $("[data-memory-visual]", modalRoot);
    const copy = $("[data-perspective-copy]", modalRoot);
    const label = $("[data-perspective-label]", modalRoot);
    if (!visual || !copy || !label) return;
    visual.dataset.perspectiveView = perspective;
    renderPacedText(copy, exhibit.perspectives?.[perspective] || exhibit.memory);
    label.textContent = labels[perspective];
    $$('[data-memory-perspective]', modalRoot).forEach((button) => {
      const selected = button.dataset.memoryPerspective === perspective;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
  }

  function openMemory(id, initialPerspective = hasCompleted(id) ? "restored" : "object") {
    const exhibit = DATA.exhibits[id];
    const restored = hasCompleted(id);
    const perspectives = [
      ["object", "Object Memory"],
      ["human", "Human Recollection"],
      ["restored", "Restored Truth"]
    ];
    openModal(`<section class="modal memory-modal" aria-labelledby="memory-title">
      ${modalHeader(`${exhibit.shortTitle} remembers`, restored ? "Memory restored · all perspectives available" : "Memory fragment · compare what the object and witness remember")}
      <div class="perspective-switch" role="tablist" aria-label="Memory perspective">${perspectives.map(([key, label]) => `<button role="tab" data-memory-perspective="${key}" aria-selected="${initialPerspective === key}" tabindex="${initialPerspective === key ? 0 : -1}" ${key === "restored" && !restored ? "disabled" : ""}>${label}</button>`).join("")}</div>
      <div class="memory-scene"><div class="memory-visual" data-memory-visual data-perspective-view="${initialPerspective}" style="--memory-image: url(&quot;${exhibit.memoryImage}&quot;)"><div class="memory-lens" aria-hidden="true"></div></div>
      <div class="memory-text"><p class="eyebrow" data-perspective-label>Object Memory</p><blockquote ${restored ? 'id="memory-title"' : ""} data-perspective-copy>${exhibit.memory}</blockquote>${restored ? `<div class="restored-note"><span>✦</span> This memory is stable. Switch perspectives to compare testimony with the object's record.</div>` : `<h3 id="memory-title">${exhibit.question}</h3><div class="choice-list">${exhibit.choices.map((choice) => `<button class="choice-button" data-memory-choice="${choice.replaceAll('"', '&quot;')}">${choice}</button>`).join("")}</div>`}</div></div>
    </section>`);
    setMemoryPerspective(id, initialPerspective);
    $$('[data-memory-perspective]', modalRoot).forEach((button) => button.addEventListener("click", () => setMemoryPerspective(id, button.dataset.memoryPerspective)));
    $$('[data-memory-choice]', modalRoot).forEach((button) => button.addEventListener("click", () => {
      if (button.dataset.memoryChoice === exhibit.answer) {
        $$('[data-memory-choice]', modalRoot).forEach((choice) => { choice.disabled = true; });
        const restoredTab = $('[data-memory-perspective="restored"]', modalRoot);
        restoredTab.disabled = false;
        setMemoryPerspective(id, "restored");
        playTone(660, .2);
        window.setTimeout(() => revealClue(id), RESTORED_TRUTH_DWELL_MS);
      }
      else {
        const modal = $(".memory-modal", modalRoot); modal.classList.remove("memory-error"); void modal.offsetWidth; modal.classList.add("memory-error");
        button.textContent = "The memory rejects this detail — try again"; playTone(145, .15);
      }
    }));
  }

  function revealClue(id) {
    const exhibit = DATA.exhibits[id];
    const isNew = !hasCompleted(id);
    if (isNew) {
      state.completed.push(id);
      state.clues.push(exhibit.clue.id);
      saveState();
      updateMuseum();
    }
    playTone(720, .28);
    openModal(`<section class="modal memory-modal" aria-labelledby="clue-title">
      ${modalHeader("Memory restored", `${exhibit.shortTitle} is quiet now`)}
      <div class="memory-text"><p class="eyebrow">Clue acquired</p><div class="clue-reveal"><img class="clue-artifact" src="${exhibit.artifactImage}" alt=""><div><h2 id="clue-title">${exhibit.clue.title}</h2><p>${exhibit.clue.text}</p><span class="clue-meta">${exhibit.shortTitle} · ${exhibit.clue.time}</span></div></div>
      <button class="button button-primary" data-return-gallery>Return to gallery</button></div></section>`);
    $("[data-return-gallery]", modalRoot).addEventListener("click", () => {
      closeModal();
      if (orchardUnlocked() && !hasCompleted("orchard")) toast("The Glass Orchard wakes", "Something alive is waiting inside the central case.");
      if (hasCompleted("orchard") && completedCount() >= 6) toast("The case is ready", "Open the Case Board and make your accusation.");
    });
  }

  function journalMarkup(activeTab = "clues") {
    return `<section class="modal journal-modal" aria-labelledby="journal-title">${modalHeader("Auditor’s Journal", `${state.clues.length} clues · ${completedCount()} memories`)}` +
      `<div class="tabs" role="tablist">${["clues","people","memories","timeline","notes"].map((tab) => `<button class="tab" role="tab" data-journal-tab="${tab}" aria-controls="journal-content" aria-selected="${activeTab === tab}" tabindex="${activeTab === tab ? 0 : -1}">${tab[0].toUpperCase() + tab.slice(1)}</button>`).join("")}</div><div class="journal-paper"><div class="tab-panel" id="journal-content" role="tabpanel">${journalContent(activeTab)}</div></div></section>`;
  }

  function journalContent(tab) {
    if (tab === "clues") {
      const clues = state.clues.map(clueRecord).filter(Boolean);
      return clues.length ? `<div class="clue-grid artifact-clue-grid">${clues.map((item, index) => `<article class="clue-card" style="--tilt:${index % 2 ? ".4deg" : "-.35deg"}"><img class="clue-card-art" src="${item.image}" alt=""><span class="clue-meta">${item.exhibit || "Case board"} · ${item.time}</span><h3>${item.title}</h3><p>${item.text}</p><span class="clue-meta">Related: ${item.suspect}</span></article>`).join("")}</div>` : `<div class="empty-state">No clues recorded.<br>Approach a glowing exhibit and press E.</div>`;
    }
    if (tab === "people") {
      if (!phase2Unlocked()) return `<div class="empty-state"><div><strong>Portrait files sealed</strong><p>Restore the three opening memories to identify everyone who remained in the museum.</p></div></div>`;
      return `<div class="people-grid">${DATA.suspects.map((person) => {
        const relevant = DATA.contradictions.filter((item) => person.contradictionIds.includes(item.id));
        const resolved = relevant.filter((item) => state.contradictions.includes(item.id));
        const latest = resolved.at(-1);
        return `<article class="person-card ${resolved.length ? "has-reveal" : ""}"><img class="person-portrait" src="${person.image}" alt="Portrait of ${person.name}"><div class="person-file"><h3>${person.name}</h3><span class="role">${person.role}</span><span class="file-count">${resolved.length} / ${relevant.length} contradictions</span><blockquote>“${latest?.update || person.statement}”</blockquote><ul class="known-contradictions">${relevant.map((item) => `<li class="${state.contradictions.includes(item.id) ? "is-proven" : ""}">${state.contradictions.includes(item.id) ? "Proven" : "Unresolved"}: ${item.statement}</li>`).join("")}</ul><p class="reveal">${resolved.length ? person.reveal : "No emotional reveal recorded yet."}</p></div></article>`;
      }).join("")}</div>`;
    }
    if (tab === "memories") {
      const memories = Object.entries(DATA.exhibits).filter(([id]) => hasCompleted(id));
      return memories.length ? `<div class="clue-grid">${memories.map(([id, item]) => `<article class="clue-card memory-card"><img class="clue-card-art" src="${item.memoryImage}" alt=""><span class="clue-meta">Restored memory</span><h3>${item.shortTitle}</h3><p>${item.memory}</p><button class="puzzle-button" data-replay="${id}">Replay</button></article>`).join("")}</div>` : `<div class="empty-state">The pages wait for an object to remember.</div>`;
    }
    if (tab === "timeline") return `<div class="empty-state"><div><p>${correctTimelineCount()} of 7 events correctly placed.</p><button class="button button-primary" data-panel="case">Open Timeline Board</button></div></div>`;
    return `<label for="notes-area" class="clue-meta">Private field notes · saved automatically</label><textarea id="notes-area" class="notes-area" placeholder="Write your theories here…">${escapeHtml(state.notes)}</textarea>`;
  }

  function openJournal(tab = "clues") {
    openModal(journalMarkup(tab));
  }

  function clueTitle(id) {
    return Object.values(DATA.exhibits).find((item) => item.clue.id === id)?.clue.title || id;
  }

  function caseMarkup() {
    const availableEvents = DATA.timeline.filter((event) => hasCompleted(EVENT_EXHIBIT[event.id]));
    const placed = new Set(Object.values(state.timeline));
    const unsolved = DATA.contradictions.filter((item) => !state.contradictions.includes(item.id));
    const availableClues = Object.values(DATA.exhibits).filter((item) => hasClue(item.clue.id));
    const availableMemories = Object.entries(DATA.exhibits).filter(([id]) => hasCompleted(id));
    return `<section class="modal case-modal" aria-labelledby="case-title">${modalHeader("Case Board", "Arrange the night. Connect each lie to a memory and the physical clue it produced.")}
      <div class="case-summary"><span>${correctTimelineCount()} / 7 timeline events</span><span>${state.contradictions.length} / 5 contradictions</span><span>${state.clues.length} clue cards</span>${completedCount() >= 4 ? `<button class="puzzle-button" data-accuse>Make accusation</button>` : ""}</div>
      <div class="case-board"><section class="board-section timeline-board"><h3 id="case-title">The night of the preview</h3><p class="board-help">Drag an event card to a time slot, or select a card and then a slot. Filled slots remain movable.</p>
        <div class="timeline-slots">${DATA.timeline.map((slot) => { const eventId = state.timeline[slot.time]; const event = DATA.timeline.find((item) => item.id === eventId); const correct = eventId && eventId === slot.id; const exhibit = event ? DATA.exhibits[EVENT_EXHIBIT[event.id]] : null; return `<button class="timeline-slot ${correct ? "is-correct" : eventId ? "is-wrong" : ""}" data-time-slot="${slot.time}" data-drop-target aria-label="${slot.time}: ${event ? event.title : "empty"}"><time>${slot.time}</time><span class="slot-content">${event ? `<img src="${exhibit.artifactImage}" alt=""><span>${event.title}<small>${correct ? "✓ Aligned" : "Needs review · move"}</small></span>` : "Place event"}</span></button>`; }).join("")}</div>
        <div class="event-cards" aria-label="Available event cards">${availableEvents.map((event) => { const exhibit = DATA.exhibits[EVENT_EXHIBIT[event.id]]; return `<button class="event-card" draggable="${!placed.has(event.id)}" data-event-card="${event.id}" aria-grabbed="false" ${placed.has(event.id) ? "disabled" : ""}><img src="${exhibit.artifactImage}" alt=""><span><time>${event.time}</time><strong>${event.title}</strong><small>Source: ${event.source}</small></span></button>`; }).join("") || `<span class="board-help">Restore memories to reveal event cards.</span>`}</div>
      </section><section class="board-section contradiction-board"><h3>Connections / Contradictions</h3><p class="board-help">Link the statement, the remembered scene, and the physical clue. All three must agree.</p>
        <div class="contradiction-form"><label>Statement<select id="statement-select"><option value="">Choose a statement</option>${unsolved.map((item) => `<option value="${item.id}">${item.speaker}: “${item.statement}”</option>`).join("")}</select></label>
        <label>Exhibit memory<select id="memory-select"><option value="">Choose a restored memory</option>${availableMemories.map(([id, item]) => `<option value="${id}">${item.shortTitle}: ${item.memory.slice(0, 54)}…</option>`).join("")}</select></label>
        <label>Physical clue<select id="evidence-select"><option value="">Choose a clue</option>${availableClues.map((item) => `<option value="${item.clue.id}">${item.clue.title}</option>`).join("")}</select></label>
        <button class="button button-primary" data-link-contradiction ${!unsolved.length ? "disabled" : ""}>Pin three-part connection</button><div id="board-feedback" class="board-error" role="status"></div></div>
        <div class="connections evidence-wall">${state.contradictions.map((id) => { const item = DATA.contradictions.find((entry) => entry.id === id); const suspect = DATA.suspects.find((person) => person.id === item.suspect); const exhibit = DATA.exhibits[item.memoryExhibit]; return `<article class="connection"><div class="evidence-node statement-node"><img src="${suspect.image}" alt=""><span><strong>${item.speaker}</strong><small>“${item.statement}”</small></span></div><span class="thread-line" aria-hidden="true"></span><div class="evidence-node memory-node"><img src="${exhibit.memoryImage}" alt=""><span><strong>${exhibit.shortTitle}</strong><small>Restored memory</small></span></div><span class="thread-line" aria-hidden="true"></span><div class="evidence-node clue-node"><img src="${exhibit.artifactImage}" alt=""><span><strong>${clueTitle(item.evidence)}</strong><small>Physical clue</small></span></div></article>`; }).join("")}</div>
      </section></div></section>`;
  }

  function bindCaseInteractions() {
    $$("[data-event-card]", modalRoot).forEach((card) => {
      card.addEventListener("dragstart", (event) => {
        selectedTimelineEvent = card.dataset.eventCard;
        card.setAttribute("aria-grabbed", "true");
        event.dataTransfer?.setData("text/plain", selectedTimelineEvent);
      });
      card.addEventListener("dragend", () => card.setAttribute("aria-grabbed", "false"));
    });
    $$("[data-drop-target]", modalRoot).forEach((slot) => {
      slot.addEventListener("dragover", (event) => { event.preventDefault(); slot.classList.add("is-dragover"); });
      slot.addEventListener("dragleave", () => slot.classList.remove("is-dragover"));
      slot.addEventListener("drop", (event) => {
        event.preventDefault();
        selectedTimelineEvent = event.dataTransfer?.getData("text/plain") || selectedTimelineEvent;
        placeTimeline(slot.dataset.timeSlot);
      });
    });
  }

  function openCase() {
    selectedTimelineEvent = null;
    openModal(caseMarkup());
    bindCaseInteractions();
  }

  function refreshCase() {
    modalRoot.innerHTML = caseMarkup();
    bindCaseInteractions();
    requestAnimationFrame(() => $(".case-modal", modalRoot)?.focus?.());
  }

  function placeTimeline(time) {
    if (!selectedTimelineEvent) {
      if (state.timeline[time]) {
        selectedTimelineEvent = state.timeline[time];
        delete state.timeline[time];
        saveState(); refreshCase();
        requestAnimationFrame(() => {
          const card = $(`[data-event-card="${selectedTimelineEvent}"]`, modalRoot);
          card?.classList.add("is-selected"); card?.removeAttribute("disabled");
        });
      } else toast("Select an event", "Choose a card below the timeline first.");
      return;
    }
    Object.keys(state.timeline).forEach((key) => { if (state.timeline[key] === selectedTimelineEvent) delete state.timeline[key]; });
    state.timeline[time] = selectedTimelineEvent;
    const event = DATA.timeline.find((item) => item.id === selectedTimelineEvent);
    const correct = event.time === time;
    selectedTimelineEvent = null;
    saveState(); playTone(correct ? 650 : 190); refreshCase();
    if (correct) toast("Event aligned", `${time} · ${event.title}`);
  }

  function linkContradiction() {
    const statementId = $("#statement-select", modalRoot).value;
    const memoryId = $("#memory-select", modalRoot).value;
    const evidenceId = $("#evidence-select", modalRoot).value;
    const feedback = $("#board-feedback", modalRoot);
    if (!statementId || !memoryId || !evidenceId) { feedback.textContent = "Choose a statement, a restored memory, and a physical clue."; return; }
    const contradiction = DATA.contradictions.find((item) => item.id === statementId);
    if (contradiction.evidence !== evidenceId || contradiction.memoryExhibit !== memoryId) {
      feedback.textContent = "The thread slips loose. All three cards must describe the same remembered event."; playTone(165); return;
    }
    state.contradictions.push(statementId);
    const synthesized = syncCaseClues();
    saveState(); playTone(690, .2); refreshCase();
    toast("Contradiction proven", `${contradiction.speaker}’s statement cannot stand.`);
    if (synthesized) toast("Case clue synthesized", "Three lies reveal a pattern of protection around the archive.");
    updateMuseum();
  }

  function openMenu() {
    openModal(`<section class="modal menu-modal" aria-labelledby="menu-title">${modalHeader("Museum Menu", "Investigation progress is saved automatically")}
      <div class="menu-grid"><div><h3 id="menu-title">Case progress</h3><p>${completedCount()} of 7 memories restored</p><p>${correctTimelineCount()} timeline events aligned</p><p>${state.contradictions.length} contradictions proven</p><button class="button button-quiet" data-restart>Restart investigation</button></div>
      <div class="settings"><label class="setting-row">Memory cue volume <input id="volume-setting" type="range" min="0" max="100" value="${state.settings.volume}"></label>
      <label class="setting-row">Text pace <select id="text-speed"><option value="calm" ${state.settings.textSpeed === "calm" ? "selected" : ""}>Calm</option><option value="quick" ${state.settings.textSpeed === "quick" ? "selected" : ""}>Quick</option><option value="instant" ${state.settings.textSpeed === "instant" ? "selected" : ""}>Instant</option></select></label>
      <div class="setting-row"><span>Reduced motion</span><button class="switch" data-setting="reducedMotion" aria-pressed="${state.settings.reducedMotion}">${state.settings.reducedMotion ? "On" : "Off"}</button></div>
      <div class="setting-row"><span>Larger text</span><button class="switch" data-setting="largeText" aria-pressed="${state.settings.largeText}">${state.settings.largeText ? "On" : "Off"}</button></div></div></div></section>`);
  }

  function openMap() {
    openModal(`<section class="modal map-modal" aria-labelledby="map-title">${modalHeader("Gallery Map", "The museum has only one public room. The archive is another matter.")}
      <div id="map-title" class="map-layout">${Object.entries(HOTSPOTS).map(([id, spot]) => `<div class="map-point ${hasCompleted(id) ? "is-complete" : ""} ${!isUnlocked(id) ? "is-locked" : ""}" style="--x:${spot.x}%;--y:${spot.y}%"><span>${DATA.exhibits[id].shortTitle}</span></div>`).join("")}</div></section>`);
  }

  function accusationMarkup() {
    const a = DATA.accusation;
    const select = (name, options) => `<label>${name[0].toUpperCase() + name.slice(1)}<select data-accusation="${name}"><option value="">Choose ${name}</option>${options.map((value) => `<option>${value}</option>`).join("")}</select></label>`;
    return `<section class="modal accusation-modal" aria-labelledby="accusation-title">${modalHeader("Formal Accusation", "You may accuse now, even if your evidence is incomplete.")}
      <div class="accusation-step"><p class="step-number">6</p><div><h3>Accuse</h3><p>Decide who is responsible.</p></div></div>
      <div class="culprit-cards" role="group" aria-label="Choose the culprit">${DATA.suspects.map((person) => `<button type="button" class="culprit-card" data-accuse-who="${person.name}" aria-pressed="false"><img src="${person.image}" alt=""><strong>${person.name}</strong><span>${person.role}</span><i aria-hidden="true">⌕</i></button>`).join("")}</div>
      <label class="visually-hidden">Culprit<select id="culprit-select" data-accusation="who"><option value="">Choose who</option>${a.who.map((value) => `<option>${value}</option>`).join("")}</select></label>
      <div class="accusation-grid accusation-details">${select("how", a.how)}${select("where", a.where)}${select("why", a.why)}</div>
      <p id="accusation-title" class="accusation-sentence">On opening night, <span data-word="who">[who]</span> used <span data-word="how">[how]</span> to trap Elian inside <span data-word="where">[where]</span> because <span data-word="why">[why]</span>.</p>
      <div class="accusation-footer"><span class="evidence-warning">Strong outcome: 6 exhibits · 7 clue cards · 5 timeline events · 3 contradictions · the Orchard restored</span><button class="button button-primary" data-confirm-accusation disabled>Confirm Accusation</button></div></section>`;
  }

  function openAccusation() { openModal(accusationMarkup()); }

  function confirmAccusation() {
    const values = Object.fromEntries($$("[data-accusation]", modalRoot).map((select) => [select.dataset.accusation, select.value]));
    const correct = values.who === "Mara Vale" && values.how === "the archive melody" && values.where === "the Glass Orchard" && values.why === "Elian was going to expose the museum’s stolen memories";
    const strong = completedCount() >= 6 && state.clues.length >= 7 && correctTimelineCount() >= 5 && state.contradictions.length >= 3 && hasCompleted("orchard");
    if (!correct) return showEnding("visitor");
    if (!strong) return showEnding("beautiful-lie");
    openDecision();
  }

  function openDecision() {
    openModal(`<section class="modal decision-modal" aria-labelledby="decision-title">${modalHeader("The archive asks one question", "Elian can be freed. What should become of everything else?")}
      <div class="memory-text"><h2 id="decision-title">Some memories were stolen. Some were surrendered because they hurt.</h2></div><div class="decision-grid">
      <button class="decision-card" data-ending="return"><h3>Return What Was Taken</h3><p>Give every memory back, grief and love together, while allowing the museum to survive.</p></button>
      <button class="decision-card" data-ending="break"><h3>Burn the Orchard</h3><p>Destroy the archive so no memory can ever be stolen or weaponized again.</p></button>
      <button class="decision-card" data-ending="remember"><h3>Free the Curator</h3><p>Release Elian and empty the stolen cases under his care, preserving only what was freely given.</p></button>
      </div></section>`);
  }

  const ENDINGS = {
    return: { title: "Return What Was Taken", glow: "#58405f", image: "assets/memories/guestbook.png", text: "The glass fruit opens. Across the city, forgotten grief, shame, love, and loss return to their owners. The museum remains—but its cases hold only gifts freely given. It is smaller now, and more honest." },
    break: { title: "Burn the Orchard", glow: "#684045", image: "assets/artifacts/orchard.png", text: "The first fracture sounds like a bell. The archive can never steal again. Some memories rise toward their owners; others vanish like breath from glass. Mara watches something terrible and beautiful end." },
    remember: { title: "The Curator Remembered", glow: "#3f5360", image: "assets/memories/orchard.png", text: "Elian steps out beneath a rain of violet light. The stolen cases empty, and Mara confesses. ‘You have destroyed something beautiful,’ she says. Elian answers, ‘It was never ours.’" },
    "beautiful-lie": { title: "A Beautiful Lie", glow: "#4b394d", image: "assets/generated/main-gallery.png", text: "The museum accepts your convenient version of the truth. Elian’s disappearance becomes an official accident. A new label appears beside the Orchard: NOTHING WAS TAKEN. The doors open again at ten." },
    visitor: { title: "The Visitor Who Almost Remembered", glow: "#372c43", image: "assets/suspects/the-museum.png", text: "The accusation settles into the archive like dust. The museum thanks you for protecting its collection. When the lights return, a new exhibit label bears your name—and your last memory is already fading." }
  };

  function showEnding(id) {
    state.ending = id; saveState(); closeModal();
    $("#toast-region").innerHTML = "";
    const ending = ENDINGS[id];
    const screen = document.createElement("section");
    const investigatorName = state.character === "male" ? "Silas Hart" : "Elara Finch";
    const portrait = `assets/characters/${state.character || "female"}/portrait.png`;
    screen.className = `ending-screen ending-${id}`;
    screen.style.setProperty("--ending-glow", ending.glow);
    screen.style.setProperty("--ending-image", `url("${ending.image}")`);
    screen.innerHTML = `<div class="ending-vignette" aria-hidden="true"></div><div class="ending-card"><img class="ending-investigator" src="${portrait}" alt="${investigatorName}"><div class="ending-copy"><p class="eyebrow">Case ending · ${investigatorName}</p><h2>${ending.title}</h2><p>${ending.text}</p>${id === "visitor" ? `<div class="museum-label"><span>NEW ACQUISITION</span><strong>${investigatorName}</strong><small>A memory auditor who came too close.</small></div>` : ""}<div class="ending-stats"><span>${completedCount()} memories</span><span>${correctTimelineCount()} timeline</span><span>${state.contradictions.length} contradictions</span></div><button class="button button-primary" data-new-investigation>Begin another investigation</button></div></div>`;
    document.body.append(screen); playTone(id === "visitor" ? 170 : 620, .4);
  }

  function resetGame() {
    localStorage.removeItem(SAVE_KEY); sessionStorage.removeItem("phase2-noticed");
    state = structuredClone(DEFAULT_STATE); selectedCharacter = null; keys.clear();
    window.clearTimeout(interactionTimeout); player.classList.remove("is-moving", "is-interacting", "facing-left"); player.dataset.direction = "front";
    $(".ending-screen")?.remove(); applySettings(); updateMuseum(); showScreen(titleScreen); refreshContinueButton();
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  }

  function refreshContinueButton() {
    $("#continue-button").classList.toggle("is-hidden", !state.started || !!state.ending);
  }

  function enterMuseum(showBriefing = false) {
    showScreen(museumScreen); applySettings(); updateMuseum(); createParticles();
    if (showBriefing) {
      openModal(`<section class="modal briefing-modal" aria-labelledby="briefing-title">${modalHeader("11:58 PM · Private Preview", "Emergency memory audit authorized")}
        <div class="memory-text briefing-content"><p class="eyebrow">Case briefing</p><h2 id="briefing-title">Elian Voss vanished at 11:43 PM.</h2><p>Seven exhibits witnessed the night, but their memories are distorted. Walk with <kbd>WASD</kbd> or the arrow keys. Approach a glowing case and press <kbd>E</kbd>. Open your journal with <kbd>J</kbd>.</p><p>The museum will not make this easy.</p><button class="button button-primary" data-close>Begin investigation</button></div></section>`);
    }
  }

  function handleClick(event) {
    const close = event.target.closest("[data-close]"); if (close) return closeModal();
    const panel = event.target.closest("[data-panel]");
    if (panel) {
      const name = panel.dataset.panel;
      if (name === "journal") openJournal(); else if (name === "case") openCase(); else if (name === "map") openMap(); else openMenu();
      return;
    }
    const tab = event.target.closest("[data-journal-tab]");
    if (tab) {
      const notes = $("#notes-area", modalRoot); if (notes) state.notes = notes.value;
      $$("[data-journal-tab]", modalRoot).forEach((item) => { item.setAttribute("aria-selected", String(item === tab)); item.tabIndex = item === tab ? 0 : -1; });
      $("#journal-content", modalRoot).innerHTML = journalContent(tab.dataset.journalTab); saveState(); return;
    }
    const replay = event.target.closest("[data-replay]"); if (replay) return openMemory(replay.dataset.replay);
    const eventCard = event.target.closest("[data-event-card]");
    if (eventCard) { selectedTimelineEvent = eventCard.dataset.eventCard; $$("[data-event-card]", modalRoot).forEach((card) => card.classList.toggle("is-selected", card === eventCard)); return; }
    const slot = event.target.closest("[data-time-slot]"); if (slot) return placeTimeline(slot.dataset.timeSlot);
    if (event.target.closest("[data-link-contradiction]")) return linkContradiction();
    if (event.target.closest("[data-accuse]")) return openAccusation();
    const culpritCard = event.target.closest("[data-accuse-who]");
    if (culpritCard) {
      const select = $("#culprit-select", modalRoot);
      select.value = culpritCard.dataset.accuseWho;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      return;
    }
    if (event.target.closest("[data-confirm-accusation]")) return confirmAccusation();
    const ending = event.target.closest("[data-ending]"); if (ending) return showEnding(ending.dataset.ending);
    if (event.target.closest("[data-new-investigation]")) return resetGame();
    const setting = event.target.closest("[data-setting]");
    if (setting) {
      const key = setting.dataset.setting; state.settings[key] = !state.settings[key]; saveState(); applySettings(); setting.setAttribute("aria-pressed", state.settings[key]); setting.textContent = state.settings[key] ? "On" : "Off"; return;
    }
    if (event.target.closest("[data-restart]")) {
      if (window.confirm("Erase the current case and begin again?")) resetGame();
    }
  }

  document.addEventListener("click", handleClick);
  modalRoot.addEventListener("change", (event) => {
    if (event.target.matches("[data-accusation]")) {
      const selects = $$("[data-accusation]", modalRoot);
      selects.forEach((select) => { $(`[data-word="${select.dataset.accusation}"]`, modalRoot).textContent = select.value || `[${select.dataset.accusation}]`; });
      $$("[data-accuse-who]", modalRoot).forEach((card) => card.setAttribute("aria-pressed", String(card.dataset.accuseWho === $("#culprit-select", modalRoot)?.value)));
      $("[data-confirm-accusation]", modalRoot).disabled = selects.some((select) => !select.value);
    }
    if (event.target.id === "volume-setting") { state.settings.volume = Number(event.target.value); saveState(); playTone(440); }
    if (event.target.id === "text-speed") { state.settings.textSpeed = event.target.value; saveState(); applySettings(); }
  });
  modalRoot.addEventListener("input", (event) => {
    if (event.target.id === "volume-setting") state.settings.volume = Number(event.target.value);
    if (event.target.id === "notes-area") state.notes = event.target.value;
  });

  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (key === "escape") { if (modalRoot.classList.contains("is-open")) closeModal(); else if (museumScreen.classList.contains("is-active")) openMenu(); return; }
    if (modalRoot.classList.contains("is-open")) {
      if (key === "tab") {
        const focusable = $$("button:not([disabled]), select:not([disabled]), input:not([disabled]), textarea, [tabindex]:not([tabindex='-1'])", modalRoot).filter((item) => item.getClientRects().length);
        if (focusable.length) {
          const first = focusable[0]; const last = focusable.at(-1);
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
      }
      if ((key === "arrowleft" || key === "arrowright") && document.activeElement?.getAttribute("role") === "tab") {
        const tabs = $$('[role="tab"]:not([disabled])', modalRoot);
        const index = tabs.indexOf(document.activeElement);
        const next = tabs[(index + (key === "arrowright" ? 1 : -1) + tabs.length) % tabs.length];
        event.preventDefault(); next.focus(); next.click();
      }
      return;
    }
    if (!museumScreen.classList.contains("is-active")) return;
    if (["arrowleft","arrowright","arrowup","arrowdown","w","a","s","d"].includes(key)) { event.preventDefault(); keys.add(key); }
    if ((key === "e" || key === " ") && nearestExhibit) { event.preventDefault(); beginExhibitInteraction(nearestExhibit); }
    if (key === "j") openJournal();
    if (key === "m") openMap();
  });
  document.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
  window.addEventListener("blur", () => { keys.clear(); player.classList.remove("is-moving"); saveState(); });
  window.addEventListener("beforeunload", saveState);

  $("#begin-button").addEventListener("click", () => { selectedCharacter = null; showScreen(selectionScreen); });
  $("#continue-button").addEventListener("click", () => enterMuseum(false));
  $$(".character-card").forEach((card) => card.addEventListener("click", () => {
    selectedCharacter = card.dataset.character;
    $$(".character-card").forEach((item) => item.setAttribute("aria-checked", String(item === card)));
    $("#start-button").disabled = false; playTone(440);
  }));
  $("#start-button").addEventListener("click", () => {
    if (!selectedCharacter) return;
    state.started = true; state.character = selectedCharacter; state.ending = null; saveState(); enterMuseum(true);
  });
  $$(".exhibit").forEach((exhibit) => {
    const inspect = () => beginExhibitInteraction(exhibit.dataset.exhibit);
    exhibit.addEventListener("click", inspect);
    exhibit.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); inspect(); }
    });
  });

  applySettings(); refreshContinueButton(); updateMuseum(); createParticles();
  movementFrame = requestAnimationFrame(movementLoop);
})();
