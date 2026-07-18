(() => {
  "use strict";

  const DATA = window.GAME_DATA;
  const roomCollision = window.MUSEUM_ROOM_COLLISION;
  if (!roomCollision) throw new Error("Museum room collision configuration is missing.");
  const SAVE_KEY = "museum-of-borrowed-memories-v1";
  const TEST_SNAPSHOT_KEY = `${SAVE_KEY}-test-completion-snapshot`;
  const DEFAULT_STATE = {
    started: false,
    character: null,
    completed: [],
    clues: [],
    contradictions: [],
    timeline: {},
    investigations: {},
    seen: { clues: 0, people: 0, memories: 0, timeline: 0 },
    settings: { reducedMotion: false, largeText: false, volume: 45, textSpeed: "calm" },
    player: { x: 50, y: 78 },
    ending: null
  };

  const HOTSPOTS = Object.fromEntries(roomCollision.obstacles
    .filter((obstacle) => obstacle.exhibitId && obstacle.interactionPoint)
    .map((obstacle) => [obstacle.exhibitId, obstacle.interactionPoint]));
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
  let investigationHintTimeout = null;
  let selectedMemoryFragment = null;
  const testModeEnabled = new URLSearchParams(window.location.search).has("testMode");
  let collisionDebugEnabled = new URLSearchParams(window.location.search).has("collisionDebug");

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (!saved) return structuredClone(DEFAULT_STATE);
      const migrated = {
        ...structuredClone(DEFAULT_STATE), ...saved,
        settings: { ...DEFAULT_STATE.settings, ...(saved.settings || {}) },
        seen: { ...DEFAULT_STATE.seen, ...(saved.seen || {}) },
        player: { ...DEFAULT_STATE.player, ...(saved.player || {}) },
        investigations: {}
      };
      Object.keys(DATA.exhibits).forEach((id) => {
        const progress = sanitizeInvestigationProgress(id, saved.investigations?.[id]);
        if (progress) migrated.investigations[id] = progress;
      });
      localStorage.setItem(SAVE_KEY, JSON.stringify(migrated));
      return migrated;
    } catch {
      return structuredClone(DEFAULT_STATE);
    }
  }

  function sanitizeInvestigationProgress(id, value) {
    if (!value || typeof value !== "object") return null;
    const config = DATA.exhibits[id]?.investigation;
    if (!config) return null;
    const observationIds = new Set(config.observations.map((item) => item.id));
    const fragmentIds = new Set(config.fragments.map((item) => item.id));
    const observations = [...new Set(Array.isArray(value.observations) ? value.observations : [])].filter((item) => observationIds.has(item));
    const connection = [...new Set(Array.isArray(value.connection) ? value.connection : [])].filter((item) => observationIds.has(item)).slice(0, 2);
    const seenFragments = new Set();
    const fragments = Array.from({ length: 3 }, (_, index) => {
      const fragment = Array.isArray(value.fragments) ? value.fragments[index] : null;
      if (!fragmentIds.has(fragment) || seenFragments.has(fragment)) return null;
      seenFragments.add(fragment);
      return fragment;
    });
    const correctConnection = config.correctConnection.every((item) => connection.includes(item));
    const connectionProven = Boolean(value.connectionProven && correctConnection);
    const allowedSteps = ["observe", "connect", "restore", "truth", "complete"];
    let step = allowedSteps.includes(value.step) ? value.step : "observe";
    if (observations.length < config.observations.length) step = "observe";
    else if (!connectionProven && !["observe", "connect"].includes(step)) step = "connect";
    else if (connectionProven && step === "observe") step = "connect";
    const perspective = ["object", "human", "restored"].includes(value.perspective) ? value.perspective : "object";
    const truthUnlocked = Math.max(0, Math.min(2, Number(value.truthUnlocked) || 0));
    return { step, observations, connection, connectionProven, fragments, perspective, truthUnlocked };
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

  function journalNotificationCounts() {
    return {
      clues: state.clues.length,
      people: phase2Unlocked() ? 1 + state.contradictions.length : 0,
      memories: completedCount(),
      timeline: DATA.timeline.filter((event) => hasCompleted(EVENT_EXHIBIT[event.id])).length
    };
  }

  function journalTabHasNotification(tab) {
    const counts = journalNotificationCounts();
    return counts[tab] > (state.seen?.[tab] || 0);
  }

  function caseActionsAvailable() {
    const timelineAction = DATA.timeline.some((event) => hasCompleted(EVENT_EXHIBIT[event.id]) && state.timeline[event.time] !== event.id);
    const contradictionAction = DATA.contradictions.some((item) => !state.contradictions.includes(item.id) && hasCompleted(item.memoryExhibit) && hasClue(item.evidence));
    return timelineAction || contradictionAction;
  }

  function updateNotificationBadges() {
    const journalHasNews = ["clues", "people", "memories", "timeline"].some(journalTabHasNotification);
    const journalButton = $('[data-panel="journal"]');
    const caseButton = $('[data-panel="case"]');
    if (journalButton) {
      journalButton.dataset.notification = String(journalHasNews);
      journalButton.setAttribute("aria-label", journalHasNews ? "Open journal, new entries available" : "Open journal");
    }
    if (caseButton) {
      const actionable = caseActionsAvailable();
      caseButton.dataset.notification = String(actionable);
      caseButton.setAttribute("aria-label", actionable ? "Open case board, action available" : "Open case board");
    }
    $$('[data-journal-tab]', modalRoot).forEach((tab) => {
      const hasNews = journalTabHasNotification(tab.dataset.journalTab);
      tab.dataset.notification = String(hasNews);
      tab.setAttribute("aria-label", `${tab.textContent.trim()}${hasNews ? ", new entries" : ""}`);
    });
  }

  function markJournalTabSeen(tab) {
    const count = journalNotificationCounts()[tab] || 0;
    if ((state.seen?.[tab] || 0) === count) return;
    state.seen ||= structuredClone(DEFAULT_STATE.seen);
    state.seen[tab] = count;
    saveState();
  }

  function testCompletionIsActive() {
    return testModeEnabled && sessionStorage.getItem(TEST_SNAPSHOT_KEY) !== null;
  }

  function toggleTestCompletion() {
    if (!testModeEnabled) return;
    if (testCompletionIsActive()) {
      try {
        const snapshot = JSON.parse(sessionStorage.getItem(TEST_SNAPSHOT_KEY));
        ["completed", "clues", "contradictions", "timeline", "investigations", "ending"].forEach((key) => {
          state[key] = structuredClone(snapshot[key]);
        });
      } catch {
        state.completed = [];
        state.clues = [];
        state.contradictions = [];
        state.timeline = {};
        state.investigations = {};
        state.ending = null;
      }
      sessionStorage.removeItem(TEST_SNAPSHOT_KEY);
      toast("Test completion disabled", "Your previous case progress has been restored.");
    } else {
      const snapshot = Object.fromEntries(
        ["completed", "clues", "contradictions", "timeline", "investigations", "ending"]
          .map((key) => [key, structuredClone(state[key])])
      );
      sessionStorage.setItem(TEST_SNAPSHOT_KEY, JSON.stringify(snapshot));
      state.completed = Object.keys(DATA.exhibits);
      state.clues = [...Object.values(DATA.exhibits).map((exhibit) => exhibit.clue.id), "pattern-of-protection"];
      state.contradictions = DATA.contradictions.map((item) => item.id);
      state.timeline = Object.fromEntries(DATA.timeline.map((event) => [event.time, event.id]));
      state.ending = null;
      toast("Test completion enabled", "All evidence is ready for accusation testing.");
    }
    saveState();
    updateMuseum();
    openMenu();
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
    updateNotificationBadges();
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

  function playerScaleAt(y) {
    const depth = Math.max(0, Math.min(1, (y - 44) / 48));
    return .72 + depth * .28;
  }

  function updatePlayerVisual() {
    const { x, y } = state.player;
    const character = state.character || "female";
    player.style.setProperty("--player-x", `${x}%`);
    player.style.setProperty("--player-y", `${y}%`);
    player.style.setProperty("--player-scale", playerScaleAt(y).toFixed(3));
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
    updateCollisionDebugFeet();
  }

  function pointOnSegment(point, start, end) {
    const cross = (point.y - start.y) * (end.x - start.x) - (point.x - start.x) * (end.y - start.y);
    if (Math.abs(cross) > .0001) return false;
    const dot = (point.x - start.x) * (end.x - start.x) + (point.y - start.y) * (end.y - start.y);
    const lengthSquared = (end.x - start.x) ** 2 + (end.y - start.y) ** 2;
    return dot >= 0 && dot <= lengthSquared;
  }

  function pointInPolygon(point, polygon) {
    let inside = false;
    for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
      const start = polygon[previous];
      const end = polygon[index];
      if (pointOnSegment(point, start, end)) return true;
      const crosses = (end.y > point.y) !== (start.y > point.y) &&
        point.x < ((start.x - end.x) * (point.y - end.y)) / (start.y - end.y) + end.x;
      if (crosses) inside = !inside;
    }
    return inside;
  }

  function validPosition(x, y) {
    const feet = { x, y };
    if (!pointInPolygon(feet, roomCollision.walkablePolygon)) return false;
    return !roomCollision.obstacles.some((obstacle) => pointInPolygon(feet, obstacle.polygon));
  }

  function polygonPoints(polygon) {
    return polygon.map((point) => `${point.x},${point.y}`).join(" ");
  }

  function polygonCenter(polygon) {
    return polygon.reduce((center, point) => ({ x: center.x + point.x / polygon.length, y: center.y + point.y / polygon.length }), { x: 0, y: 0 });
  }

  function createCollisionDebugOverlay() {
    const overlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    overlay.id = "collision-debug-overlay";
    overlay.classList.add("collision-debug-overlay");
    overlay.setAttribute("viewBox", "0 0 100 100");
    overlay.setAttribute("preserveAspectRatio", "none");
    overlay.setAttribute("aria-hidden", "true");
    const obstacleMarkup = roomCollision.obstacles.map((obstacle) => {
      const center = polygonCenter(obstacle.polygon);
      return `<polygon class="collision-debug-obstacle" data-debug-obstacle="${obstacle.id}" points="${polygonPoints(obstacle.polygon)}"></polygon><text class="collision-debug-label" x="${center.x}" y="${center.y}">${obstacle.id}</text>`;
    }).join("");
    overlay.innerHTML = `<polygon class="collision-debug-walkable" points="${polygonPoints(roomCollision.walkablePolygon)}"></polygon>${obstacleMarkup}<ellipse class="collision-debug-feet" data-debug-feet rx=".45" ry=".7"></ellipse>`;
    gallery.append(overlay);
    return overlay;
  }

  function updateCollisionDebugFeet() {
    const feet = $("[data-debug-feet]", gallery);
    if (!feet) return;
    feet.setAttribute("cx", state.player.x);
    feet.setAttribute("cy", state.player.y);
  }

  function setCollisionDebug(enabled) {
    collisionDebugEnabled = Boolean(enabled);
    const overlay = $("#collision-debug-overlay") || createCollisionDebugOverlay();
    overlay.classList.toggle("is-hidden", !collisionDebugEnabled);
    updateCollisionDebugFeet();
  }

  function recoverPlayerPosition() {
    if (validPosition(state.player.x, state.player.y)) return;
    const origin = { ...state.player };
    for (let radius = .5; radius <= 30; radius += .5) {
      for (let index = 0; index < 32; index += 1) {
        const angle = (index / 32) * Math.PI * 2;
        const x = origin.x + Math.cos(angle) * radius;
        const y = origin.y + Math.sin(angle) * radius;
        if (!validPosition(x, y)) continue;
        state.player = { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
        saveState();
        return;
      }
    }
    state.player = { ...DEFAULT_STATE.player };
    saveState();
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
        const proposed = {
          x: state.player.x + (dx / length) * speed,
          y: state.player.y + (dy / length) * speed
        };
        if (validPosition(proposed.x, proposed.y)) {
          state.player = proposed;
        } else if (validPosition(proposed.x, state.player.y)) {
          state.player.x = proposed.x;
        } else if (validPosition(state.player.x, proposed.y)) {
          state.player.y = proposed.y;
        }
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
    window.clearTimeout(investigationHintTimeout);
    selectedMemoryFragment = null;
    modalRoot.className = "modal-root";
    modalRoot.innerHTML = "";
    lastFocus?.focus?.();
  }

  function modalHeader(title, subtitle = "") {
    return `<header class="modal-header"><div><h2>${title}</h2>${subtitle ? `<p>${subtitle}</p>` : ""}</div><button class="close-button" data-close aria-label="Close panel">×</button></header>`;
  }

  function investigationProgress(id) {
    state.investigations[id] ||= {
      step: "observe", observations: [], connection: [], connectionProven: false,
      fragments: [null, null, null], perspective: "object", truthUnlocked: 0
    };
    return state.investigations[id];
  }

  function investigationStepsMarkup(id, progress) {
    const observeDone = hasCompleted(id) || progress.observations.length === DATA.exhibits[id].investigation.observations.length;
    const connectDone = hasCompleted(id) || progress.connectionProven;
    const restoreDone = hasCompleted(id) || progress.step === "complete";
    const active = hasCompleted(id) ? null : progress.step === "truth" ? "restore" : progress.step;
    return `<ol class="investigation-steps" aria-label="Memory restoration progress">
      ${[["observe", "Observe", observeDone], ["connect", "Connect", connectDone], ["restore", "Restore", restoreDone]].map(([key, label, done], index) => `<li class="${done ? "is-done" : ""} ${active === key ? "is-active" : ""}" ${active === key ? 'aria-current="step"' : ""}><span>${done ? "✓" : index + 1}</span><strong>${label}</strong></li>`).join("")}
    </ol>`;
  }

  const INSPECTION_TOOLS = [
    ["eye", "assets/ui/generated/tool-eye.png", "Eye"],
    ["hand", "assets/ui/generated/tool-hand.png", "Hand"],
    ["magnifier", "assets/ui/generated/tool-magnifier.png", "Magnifier"]
  ];

  function inspectionToolsMarkup(activeTool = "eye") {
    const items = INSPECTION_TOOLS.map(([tool, image, label]) => `<button type="button" data-investigation-tool="${tool}" aria-label="Use ${label}" aria-pressed="${activeTool === tool}"><img src="${image}" alt=""><small>${label}</small></button>`).join("");
    return `<div class="artifact-tools investigation-tools" role="group" aria-label="Inspection tools">${items}</div>`;
  }

  function artifactStageMarkup(id, progress, activeTool = "eye", interactive = true) {
    const exhibit = DATA.exhibits[id];
    const observations = exhibit.investigation.observations;
    const markers = observations.map((item) => {
      const discovered = progress.observations.includes(item.id);
      const style = `--spot-x:${item.x}%;--spot-y:${item.y}%;--spot-w:${item.w || 18}%;--spot-h:${item.h || 18}%`;
      if (discovered) return `<span class="observation-hotspot is-discovered" style="${style}" aria-hidden="true"><i>✓</i></span>`;
      if (!interactive || item.tool !== activeTool) return "";
      return `<button class="observation-hotspot is-available" style="${style}" data-observation-hotspot="${item.id}" aria-label="${item.hotspotName}"><i aria-hidden="true"></i></button>`;
    }).join("");
    const tools = interactive ? inspectionToolsMarkup(activeTool) : "";
    return `<div class="object-stage investigation-stage" id="object-stage" data-mode="${activeTool}">
      <img class="stage-symbol artifact-hero" src="${exhibit.artifactImage}" alt="${exhibit.title} on display">
      <div class="observation-layer">${markers}</div>${tools}
    </div>`;
  }

  function observationCardsMarkup(id, progress, selectable = false) {
    const config = DATA.exhibits[id].investigation;
    return `<div class="observation-cards" aria-label="Discovered details">${config.observations.map((item) => {
      const discovered = progress.observations.includes(item.id);
      const selected = progress.connection.includes(item.id);
      if (!discovered) return `<div class="observation-card is-unknown"><span>◇</span><p>Undiscovered detail</p></div>`;
      const content = `<span class="observation-tool">${item.tool}</span><strong>${item.label}</strong><p>${item.detail}</p>`;
      return selectable ? `<button class="observation-card is-known ${selected ? "is-selected" : ""}" data-connect-observation="${item.id}" aria-pressed="${selected}">${content}</button>` : `<article class="observation-card is-known" data-observation-card="${item.id}" tabindex="-1">${content}</article>`;
    }).join("")}</div>`;
  }

  function renderObserveStep(id, progress, activeTool, message = "") {
    const exhibit = DATA.exhibits[id];
    const allFound = progress.observations.length === exhibit.investigation.observations.length;
    return `<div class="investigation-layout observe-layout">
      ${artifactStageMarkup(id, progress, activeTool, true)}
      <div class="investigation-copy"><p class="eyebrow">Step 1 · Observe</p><h3>Study the object from three perspectives.</h3><p>${exhibit.description}</p><p class="property">${exhibit.property}</p>
        ${observationCardsMarkup(id, progress)}
        <p class="investigation-feedback ${message ? "has-message" : ""}" id="investigation-feedback" aria-live="polite">${message || (allFound ? "Every detail is recorded. Decide what they prove together." : "Choose a tool, then inspect the softly pulsing area.")}</p>
        <p class="investigation-hint" aria-live="polite">Hints will appear if the object stays quiet.</p>
        <button class="button button-primary" data-advance-investigation="connect" ${allFound ? "" : "disabled"}>Continue to Connect</button>
      </div></div>`;
  }

  function renderConnectStep(id, progress, message = "", status = "") {
    const exhibit = DATA.exhibits[id];
    const config = exhibit.investigation;
    const pairReady = progress.connection.length === 2;
    return `<div class="investigation-layout connect-layout">
      ${artifactStageMarkup(id, progress, "eye", false)}
      <div class="investigation-copy"><p class="eyebrow">Step 2 · Connect</p><h3>Which details challenge the record?</h3>
        <blockquote class="challenged-statement ${progress.connectionProven ? "is-disproven" : ""}">${config.statement}</blockquote>
        ${observationCardsMarkup(id, progress, true)}
        ${progress.connectionProven ? `<div class="deduction-reveal"><span>✦</span><div><small>Deduction</small><strong>${config.deduction}</strong></div></div>` : ""}
        <p class="investigation-feedback ${status ? `is-${status}` : ""}" id="investigation-feedback" aria-live="polite">${message || (pairReady ? "The connection is ready. Test these details." : "Select exactly two observations.")}</p>
        ${progress.connectionProven ? `<button class="button button-primary" data-advance-investigation="restore">Continue to Restore</button>` : `<button class="button button-primary" data-test-connection ${pairReady ? "" : "disabled"}>Test connection</button>`}
      </div></div>`;
  }

  function fragmentById(id, fragmentId) {
    return DATA.exhibits[id].investigation.fragments.find((item) => item.id === fragmentId);
  }

  function renderRestoreStep(id, progress, message = "", status = "") {
    const exhibit = DATA.exhibits[id];
    const config = exhibit.investigation;
    const placed = progress.fragments.filter(Boolean);
    const available = config.fragments.filter((item) => !placed.includes(item.id));
    return `<div class="restore-layout">
      <div class="restore-memory" style="--memory-image:url(&quot;${exhibit.memoryImage}&quot;)" role="img" aria-label="Distorted memory held by ${exhibit.shortTitle}"><div class="memory-lens" aria-hidden="true"></div></div>
      <div class="restore-workspace"><p class="eyebrow">Step 3 · Restore</p><h3>Arrange the memory from beginning to end.</h3><p>Choose a fragment, then choose a numbered position. Filled positions remain movable.</p>
        <div class="fragment-bank" aria-label="Unplaced memory fragments">${available.map((fragment) => `<button class="memory-fragment ${selectedMemoryFragment === fragment.id ? "is-selected" : ""}" draggable="true" data-memory-fragment="${fragment.id}" aria-pressed="${selectedMemoryFragment === fragment.id}">${fragment.caption}</button>`).join("") || `<span class="all-placed">All fragments are placed.</span>`}</div>
        <div class="fragment-slots" aria-label="Memory order">${progress.fragments.map((fragmentId, index) => {
          const fragment = fragmentById(id, fragmentId);
          return `<button class="fragment-slot ${fragment ? "is-filled" : ""} ${selectedMemoryFragment === fragmentId ? "is-selected" : ""}" data-fragment-slot="${index}" ${fragment ? `draggable="true" data-fragment-id="${fragment.id}"` : ""}><span>${index + 1}</span><strong>${fragment ? fragment.caption : "Place a fragment"}</strong></button>`;
        }).join("")}</div>
        <p class="investigation-feedback ${status ? `is-${status}` : ""}" id="investigation-feedback" aria-live="polite">${message || "The memory will stabilize when cause and consequence align."}</p>
        <button class="button button-primary" data-test-fragments ${placed.length === 3 ? "" : "disabled"}>Restore memory</button>
      </div></div>`;
  }

  function renderTruthStep(id, progress) {
    const exhibit = DATA.exhibits[id];
    const perspectives = [["object", "Object Memory"], ["human", "Human Recollection"], ["restored", "Restored Truth"]];
    const activeIndex = perspectives.findIndex(([key]) => key === progress.perspective);
    const next = perspectives[activeIndex + 1];
    return `<div class="truth-layout">
      <div class="restore-memory is-stable" style="--memory-image:url(&quot;${exhibit.memoryImage}&quot;)" role="img" aria-label="Restored memory held by ${exhibit.shortTitle}"><div class="memory-lens" aria-hidden="true"></div></div>
      <div class="truth-copy"><p class="eyebrow">Step 3 · Restore</p><div class="perspective-switch" role="tablist" aria-label="Memory perspective">${perspectives.map(([key, label], index) => `<button role="tab" data-investigation-perspective="${key}" aria-selected="${progress.perspective === key}" tabindex="${progress.perspective === key ? 0 : -1}" ${index > progress.truthUnlocked ? "disabled" : ""}>${label}</button>`).join("")}</div>
        <p class="eyebrow truth-label">${perspectives[activeIndex][1]}</p><blockquote data-truth-copy>${exhibit.perspectives[progress.perspective]}</blockquote>
        ${next && activeIndex === progress.truthUnlocked ? `<button class="button button-primary" data-truth-action data-advance-perspective="${next[0]}" disabled>Continue to ${next[1]}</button>` : progress.truthUnlocked === 2 && progress.perspective === "restored" ? `<button class="button button-primary" data-truth-action data-claim-clue disabled>Record restored clue</button>` : `<p class="restored-note"><span>✦</span> Compare the available perspectives, then return to Restored Truth.</p>`}
      </div></div>`;
  }

  function renderReplaySummary(id, progress) {
    const exhibit = DATA.exhibits[id];
    return `<div class="investigation-layout replay-layout">
      ${artifactStageMarkup(id, { ...progress, observations: exhibit.investigation.observations.map((item) => item.id) }, "eye", false)}
      <div class="investigation-copy"><p class="eyebrow">Restored exhibit</p><h3>${exhibit.investigation.deduction}</h3><p>${exhibit.clue.text}</p>
        ${observationCardsMarkup(id, { ...progress, observations: exhibit.investigation.observations.map((item) => item.id) })}
        <div class="deduction-reveal"><span>✓</span><div><small>Proven connection</small><strong>${exhibit.investigation.statement}</strong></div></div>
        <button class="button button-primary" data-review-memory="${id}">Review restored memory</button>
      </div></div>`;
  }

  function renderInvestigationBody(id, activeTool = "eye", message = "", status = "") {
    window.clearTimeout(investigationHintTimeout);
    const body = $("#investigation-body", modalRoot);
    if (!body) return;
    const progress = investigationProgress(id);
    const content = hasCompleted(id) ? renderReplaySummary(id, progress)
      : progress.step === "observe" ? renderObserveStep(id, progress, activeTool, message)
      : progress.step === "connect" ? renderConnectStep(id, progress, message, status)
      : progress.step === "restore" ? renderRestoreStep(id, progress, message, status)
      : renderTruthStep(id, progress);
    body.innerHTML = `${investigationStepsMarkup(id, progress)}${content}`;
    bindInvestigationControls(id, activeTool);
    const truthCopy = $("[data-truth-copy]", body);
    if (truthCopy) renderPacedText(truthCopy, DATA.exhibits[id].perspectives[progress.perspective], () => {
      const action = $("[data-truth-action]", body);
      if (action) action.disabled = false;
    });
    if (!hasCompleted(id) && progress.step === "observe" && progress.observations.length < DATA.exhibits[id].investigation.observations.length) {
      investigationHintTimeout = window.setTimeout(() => {
        const next = DATA.exhibits[id].investigation.observations.find((item) => !progress.observations.includes(item.id));
        const hint = $(".investigation-hint", modalRoot);
        if (hint && next) { hint.textContent = `Try the ${next.tool}: ${next.hotspotName.toLowerCase()}.`; hint.classList.add("is-visible"); }
      }, state.settings.reducedMotion ? 2500 : 6000);
    }
  }

  function placeMemoryFragment(id, fragmentId, slotIndex) {
    const progress = investigationProgress(id);
    const previousIndex = progress.fragments.indexOf(fragmentId);
    if (previousIndex === slotIndex) { selectedMemoryFragment = null; renderInvestigationBody(id); return; }
    if (previousIndex >= 0) progress.fragments[previousIndex] = null;
    progress.fragments[slotIndex] = fragmentId;
    selectedMemoryFragment = null;
    saveState();
    renderInvestigationBody(id, "eye", `Fragment placed in position ${slotIndex + 1}.`);
  }

  function bindInvestigationControls(id, activeTool) {
    const progress = investigationProgress(id);
    $$('[data-investigation-tool]', modalRoot).forEach((button) => button.addEventListener("click", () => renderInvestigationBody(id, button.dataset.investigationTool)));
    $$('[data-observation-hotspot]', modalRoot).forEach((button) => button.addEventListener("click", () => {
      const observationId = button.dataset.observationHotspot;
      if (!progress.observations.includes(observationId)) progress.observations.push(observationId);
      saveState(); playTone(430 + progress.observations.length * 45);
      const item = DATA.exhibits[id].investigation.observations.find((entry) => entry.id === observationId);
      renderInvestigationBody(id, activeTool, `Recorded: ${item.label}.`);
      requestAnimationFrame(() => $(`[data-observation-card="${observationId}"]`, modalRoot)?.focus());
    }));
    $$('[data-advance-investigation]', modalRoot).forEach((button) => button.addEventListener("click", () => {
      progress.step = button.dataset.advanceInvestigation;
      selectedMemoryFragment = null; saveState(); renderInvestigationBody(id);
    }));
    $$('[data-connect-observation]', modalRoot).forEach((button) => button.addEventListener("click", () => {
      const observationId = button.dataset.connectObservation;
      if (progress.connection.includes(observationId)) progress.connection = progress.connection.filter((item) => item !== observationId);
      else progress.connection = [...progress.connection.slice(-1), observationId];
      saveState(); renderInvestigationBody(id);
    }));
    $("[data-test-connection]", modalRoot)?.addEventListener("click", () => {
      const config = DATA.exhibits[id].investigation;
      const correct = config.correctConnection.every((item) => progress.connection.includes(item));
      if (correct) {
        progress.connectionProven = true; progress.connection = [...config.correctConnection]; saveState(); playTone(660, .2);
        renderInvestigationBody(id, "eye", "The record cannot stand. The connection is proven.", "success");
      } else {
        playTone(155, .15); renderInvestigationBody(id, "eye", config.incorrectHint, "error");
        $(".connect-layout", modalRoot)?.classList.add("connection-error");
      }
    });
    $$('[data-memory-fragment]', modalRoot).forEach((button) => button.addEventListener("click", () => {
      selectedMemoryFragment = selectedMemoryFragment === button.dataset.memoryFragment ? null : button.dataset.memoryFragment;
      renderInvestigationBody(id);
    }));
    $$('[data-fragment-slot]', modalRoot).forEach((slot) => slot.addEventListener("click", () => {
      const slotIndex = Number(slot.dataset.fragmentSlot);
      if (selectedMemoryFragment) placeMemoryFragment(id, selectedMemoryFragment, slotIndex);
      else if (progress.fragments[slotIndex]) { selectedMemoryFragment = progress.fragments[slotIndex]; renderInvestigationBody(id); }
    }));
    $$('[draggable="true"]', modalRoot).forEach((item) => item.addEventListener("dragstart", (event) => {
      const fragmentId = item.dataset.memoryFragment || item.dataset.fragmentId;
      event.dataTransfer.setData("text/plain", fragmentId); event.dataTransfer.effectAllowed = "move";
      item.classList.add("is-dragging");
    }));
    $$('[data-fragment-slot]', modalRoot).forEach((slot) => {
      slot.addEventListener("dragover", (event) => { event.preventDefault(); slot.classList.add("is-dragover"); });
      slot.addEventListener("dragleave", () => slot.classList.remove("is-dragover"));
      slot.addEventListener("drop", (event) => {
        event.preventDefault(); slot.classList.remove("is-dragover");
        const fragmentId = event.dataTransfer.getData("text/plain");
        if (fragmentById(id, fragmentId)) placeMemoryFragment(id, fragmentId, Number(slot.dataset.fragmentSlot));
      });
    });
    $("[data-test-fragments]", modalRoot)?.addEventListener("click", () => {
      const correct = DATA.exhibits[id].investigation.fragments.map((item) => item.id);
      const mismatch = progress.fragments.findIndex((item, index) => item !== correct[index]);
      if (mismatch < 0) {
        progress.step = "truth"; progress.perspective = "object"; progress.truthUnlocked = 0; saveState(); playTone(680, .22); renderInvestigationBody(id);
      } else {
        playTone(150, .15);
        const hint = mismatch === 0 ? "The opening fragment must establish who acts first." : `Fragment ${mismatch + 1} cannot follow the event before it.`;
        renderInvestigationBody(id, "eye", hint, "error");
        $(".restore-layout", modalRoot)?.classList.add("fragment-error");
      }
    });
    $$('[data-investigation-perspective]', modalRoot).forEach((button) => button.addEventListener("click", () => {
      progress.perspective = button.dataset.investigationPerspective; saveState(); renderInvestigationBody(id);
    }));
    $("[data-advance-perspective]", modalRoot)?.addEventListener("click", (event) => {
      progress.perspective = event.currentTarget.dataset.advancePerspective;
      progress.truthUnlocked = Math.min(2, progress.truthUnlocked + 1); saveState(); renderInvestigationBody(id);
    });
    $("[data-claim-clue]", modalRoot)?.addEventListener("click", () => revealClue(id));
    $("[data-review-memory]", modalRoot)?.addEventListener("click", () => openMemory(id, "restored"));
  }

  function openExhibit(id) {
    if (!isUnlocked(id)) { toast("The case is sleeping", id === "orchard" ? "Restore five ordinary exhibits and prove three contradictions." : "Restore the first three memories."); return; }
    const exhibit = DATA.exhibits[id];
    selectedMemoryFragment = null;
    openModal(`<section class="modal viewer-modal investigation-modal" aria-labelledby="viewer-title">
      ${modalHeader(exhibit.title, hasCompleted(id) ? "Memory restored · evidence available for review" : "Exhibit inspection · observe, connect, restore")}
      <div id="investigation-body"></div>
    </section>`);
    renderInvestigationBody(id);
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

  function renderPacedText(element, value, onComplete = null) {
    window.clearInterval(textTimer);
    element.setAttribute("aria-label", value);
    const delay = state.settings.reducedMotion || state.settings.textSpeed === "instant" ? 0 : state.settings.textSpeed === "quick" ? 6 : 18;
    if (!delay) { element.textContent = value; onComplete?.(); return; }
    let index = 1;
    element.textContent = value.slice(0, index);
    textTimer = window.setInterval(() => {
      index += 1;
      element.textContent = value.slice(0, index);
      if (index >= value.length) { window.clearInterval(textTimer); onComplete?.(); }
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
    if (!hasCompleted(id)) return openExhibit(id);
    const perspectives = [
      ["object", "Object Memory"],
      ["human", "Human Recollection"],
      ["restored", "Restored Truth"]
    ];
    openModal(`<section class="modal memory-modal" aria-labelledby="memory-title">
      ${modalHeader(`${exhibit.shortTitle} remembers`, "Memory restored · all perspectives available")}
      <div class="perspective-switch" role="tablist" aria-label="Memory perspective">${perspectives.map(([key, label]) => `<button role="tab" data-memory-perspective="${key}" aria-selected="${initialPerspective === key}" tabindex="${initialPerspective === key ? 0 : -1}">${label}</button>`).join("")}</div>
      <div class="memory-scene"><div class="memory-visual" data-memory-visual data-perspective-view="${initialPerspective}" style="--memory-image: url(&quot;${exhibit.memoryImage}&quot;)"><div class="memory-lens" aria-hidden="true"></div></div>
      <div class="memory-text"><p class="eyebrow" data-perspective-label>Object Memory</p><blockquote id="memory-title" data-perspective-copy>${exhibit.memory}</blockquote><div class="restored-note"><span>✦</span> This memory is stable. Switch perspectives to compare testimony with the object's record.</div></div></div>
    </section>`);
    setMemoryPerspective(id, initialPerspective);
    $$('[data-memory-perspective]', modalRoot).forEach((button) => button.addEventListener("click", () => setMemoryPerspective(id, button.dataset.memoryPerspective)));
  }

  function revealClue(id) {
    const exhibit = DATA.exhibits[id];
    const isNew = !hasCompleted(id);
    if (isNew) {
      state.completed.push(id);
      if (!hasClue(exhibit.clue.id)) state.clues.push(exhibit.clue.id);
      const progress = investigationProgress(id);
      progress.step = "complete";
      progress.perspective = "restored";
      progress.truthUnlocked = 2;
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
    const tabs = ["clues", "people", "memories", "timeline"];
    return `<section class="modal journal-modal" aria-labelledby="journal-title">${modalHeader("Auditor’s Journal", `${state.clues.length} clues · ${completedCount()} memories`)}` +
      `<div class="tabs" role="tablist">${tabs.map((tab) => { const label = tab[0].toUpperCase() + tab.slice(1); const hasNews = journalTabHasNotification(tab); return `<button class="tab" role="tab" data-journal-tab="${tab}" data-notification="${hasNews}" aria-label="${label}${hasNews ? ", new entries" : ""}" aria-controls="journal-content" aria-selected="${activeTab === tab}" tabindex="${activeTab === tab ? 0 : -1}">${label}</button>`; }).join("")}</div><div class="journal-paper"><div class="tab-panel" id="journal-content" role="tabpanel">${journalContent(activeTab)}</div></div></section>`;
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
    const placedEvents = Object.values(state.timeline);
    return `<section class="journal-timeline-section" aria-labelledby="journal-timeline-title"><header><div><span class="clue-meta">The night of the preview</span><h3 id="journal-timeline-title">Recovered sequence</h3></div><span>${correctTimelineCount()} / 7 aligned</span></header>
      <div class="journal-timeline" tabindex="0" aria-label="Horizontally scrolling recovered timeline"><div class="journal-timeline-track">
        ${DATA.timeline.map((event, index) => {
          const exhibit = DATA.exhibits[EVENT_EXHIBIT[event.id]];
          const unlocked = hasCompleted(EVENT_EXHIBIT[event.id]);
          const placedTime = Object.entries(state.timeline).find(([, eventId]) => eventId === event.id)?.[0];
          const aligned = state.timeline[event.time] === event.id;
          const status = aligned ? "Aligned" : placedTime ? `Placed at ${placedTime}` : unlocked ? "Ready to place" : "Memory not restored";
          return `<article class="journal-timeline-card ${unlocked ? "is-unlocked" : "is-locked"} ${aligned ? "is-aligned" : ""}" data-journal-event="${event.id}"><span class="timeline-index">${index + 1}</span><time>${event.time}</time>${unlocked ? `<img src="${exhibit.artifactImage}" alt="">` : `<div class="timeline-card-lock" aria-hidden="true">◇</div>`}<div><span class="clue-meta">${status}</span><h4>${unlocked ? event.title : "Unrecovered event"}</h4><p>${unlocked ? `Source: ${event.source}` : "Restore its exhibit memory to reveal this moment."}</p></div></article>`;
        }).join("")}
      </div></div><footer><span>${placedEvents.length} event${placedEvents.length === 1 ? "" : "s"} placed on the board</span><button class="button button-primary" data-panel="case">Open Timeline Board</button></footer></section>`;
  }

  function openJournal(tab = "clues") {
    markJournalTabSeen(tab);
    openModal(journalMarkup(tab));
    updateNotificationBadges();
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
    updateNotificationBadges();
  }

  function refreshCase() {
    modalRoot.innerHTML = caseMarkup();
    bindCaseInteractions();
    updateNotificationBadges();
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
    const testControls = testModeEnabled ? `<div class="settings test-settings"><p class="eyebrow">Test controls</p><div class="setting-row"><span>Completed case state</span><button class="switch" data-test-completion aria-label="Toggle completed test state" aria-pressed="${testCompletionIsActive()}">${testCompletionIsActive() ? "On" : "Off"}</button></div></div>` : "";
    openModal(`<section class="modal menu-modal" aria-labelledby="menu-title">${modalHeader("Museum Menu", "Investigation progress is saved automatically")}
      <div class="menu-grid"><div><h3 id="menu-title">Case progress</h3><p>${completedCount()} of 7 memories restored</p><p>${correctTimelineCount()} timeline events aligned</p><p>${state.contradictions.length} contradictions proven</p><button class="button button-quiet" data-restart>Restart investigation</button></div>
      <div class="settings"><label class="setting-row">Memory cue volume <input id="volume-setting" type="range" min="0" max="100" value="${state.settings.volume}"></label>
      <label class="setting-row">Text pace <select id="text-speed"><option value="calm" ${state.settings.textSpeed === "calm" ? "selected" : ""}>Calm</option><option value="quick" ${state.settings.textSpeed === "quick" ? "selected" : ""}>Quick</option><option value="instant" ${state.settings.textSpeed === "instant" ? "selected" : ""}>Instant</option></select></label>
      <div class="setting-row"><span>Reduced motion</span><button class="switch" data-setting="reducedMotion" aria-pressed="${state.settings.reducedMotion}">${state.settings.reducedMotion ? "On" : "Off"}</button></div>
      <div class="setting-row"><span>Larger text</span><button class="switch" data-setting="largeText" aria-pressed="${state.settings.largeText}">${state.settings.largeText ? "On" : "Off"}</button></div>${testControls}</div></div></section>`);
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
    sessionStorage.removeItem(TEST_SNAPSHOT_KEY);
    state = structuredClone(DEFAULT_STATE); selectedCharacter = null; keys.clear();
    window.clearTimeout(interactionTimeout); player.classList.remove("is-moving", "is-interacting", "facing-left"); player.dataset.direction = "front";
    $(".ending-screen")?.remove(); applySettings(); updateMuseum(); showScreen(titleScreen); refreshContinueButton();
  }

  function refreshContinueButton() {
    $("#continue-button").classList.toggle("is-hidden", !state.started || !!state.ending);
  }

  function enterMuseum(showBriefing = false) {
    showScreen(museumScreen); applySettings(); recoverPlayerPosition(); updateMuseum(); createParticles();
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
      markJournalTabSeen(tab.dataset.journalTab);
      $$("[data-journal-tab]", modalRoot).forEach((item) => { item.setAttribute("aria-selected", String(item === tab)); item.tabIndex = item === tab ? 0 : -1; });
      $("#journal-content", modalRoot).innerHTML = journalContent(tab.dataset.journalTab); updateNotificationBadges(); return;
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
    if (event.target.closest("[data-test-completion]")) return toggleTestCompletion();
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
  });

  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (key === "f8") { event.preventDefault(); setCollisionDebug(!collisionDebugEnabled); return; }
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

  window.MUSEUM_COLLISION_API = {
    config: roomCollision,
    isWalkablePoint: (point) => validPosition(Number(point.x), Number(point.y)),
    setDebug: setCollisionDebug
  };

  applySettings(); refreshContinueButton(); updateMuseum(); createParticles(); setCollisionDebug(collisionDebugEnabled);
  movementFrame = requestAnimationFrame(movementLoop);
})();
