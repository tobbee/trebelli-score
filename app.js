/* Tre Belli — web scorer. Vanilla JS, no dependencies.
 * Mirrors the SwiftUI app's domain rules; persists the current game to
 * localStorage; theme follows the system via CSS (prefers-color-scheme). */

"use strict";

const TOTAL_ROUNDS = 18;
const TRICKS_PER_ROUND = 13;
const MODES = ["hearts", "spades", "diamonds", "clubs", "spel", "pass"];

// Icon glyph + CSS class per mode. Suits use Unicode pips; the two no-suit
// modes use +/- badges (Spel maximizes, Pass minimizes).
const MODE_META = {
  hearts:   { glyph: "♥", cls: "suit-red" },
  spades:   { glyph: "♠", cls: "suit-dark" },
  diamonds: { glyph: "♦", cls: "suit-red" },
  clubs:    { glyph: "♣", cls: "suit-dark" },
  spel:     { glyph: "+", cls: "badge mode-spel" },
  pass:     { glyph: "−", cls: "badge mode-pass" },
};

// ---------- i18n ----------
const I18N = {
  en: {
    appName: "Tre Belli",
    startGame: "Start Game",
    playerName: (n) => `Player ${n} name`,
    round: (a, b) => `Round ${a} / ${b}`,
    chooses: (name) => `${name} chooses the mode`,
    changeMode: "Change mode",
    leader: "Leader", next: "Next", third: "Third",
    target: (t) => `target ${t}`,
    confirmRound: "Confirm round",
    scoreboard: "Scoreboard",
    total: "Total",
    colRound: "Round", colMode: "Mode",
    done: "Done",
    undo: "Undo last round",
    playAgain: "Play another game",
    playAgainConfirm: "Clear the current scores and start a fresh 18-round game with the same players?",
    changePlayers: "Change players",
    gameOver: "Game over",
    rules: "Rules",
    rulesTitle: "How to play Tre Belli",
    rulesSections: [
      { h: "The game", p: [
        "Tre Belli is a trick-taking card game for three players, played over 18 rounds with a standard deck. This app doesn't deal or play the cards — it keeps score while you play at the table.",
      ] },
      { h: "Rounds and modes", legend: true, p: [
        "Each round has a leader who chooses the round's mode. The lead rotates round-robin, so every player leads six rounds and uses each of the six modes exactly once (6 modes × 3 players = 18 rounds).",
        "The four suits make that suit trump. No Trump and Misère are played without a trump suit.",
      ] },
      { h: "The deal and the kitty", p: [
        "Each player is dealt 13 cards, and 13 more form a kitty. The leader first announces the mode, then may buy from the kitty — taking cards by discarding the same number from their hand. The next player may then buy from whatever cards remain, and finally the third player if any are left.",
      ] },
      { h: "Playing the tricks", p: [
        "Play is standard trick-taking. A player leads a card and the others follow, playing the led suit when they can. The highest trump wins the trick, or if no trump is played, the highest card of the led suit. In No Trump and Misère there is no trump, so the highest card of the led suit always wins.",
      ] },
      { h: "Targets and scoring", p: [
        "Every round has 13 tricks. Each player has a target number of tricks: the leader 7, the next player 4, the third player 2.",
        "Misère is the exception — there you want as few tricks as possible, so the targets flip to 2, 4 and 7.",
        "Your score for the round is the tricks you took minus your target (for Misère, target minus tricks). Because the targets add up to 13, the three scores always sum to zero.",
      ] },
      { h: "Using this app", p: [
        "Pick the leader's mode, then enter the tricks for the leader and the next player — the third player's tricks and everyone's scores are worked out for you. Running totals stay visible, and the scoreboard shows every round and who chose it. Undo the last round or start over from the menu.",
      ] },
    ],
    modes: { hearts: "Hearts", spades: "Spades", diamonds: "Diamonds", clubs: "Clubs", spel: "No Trump", pass: "Misère" },
  },
  sv: {
    appName: "Tre Belli",
    startGame: "Starta spel",
    playerName: (n) => `Spelare ${n} namn`,
    round: (a, b) => `Omgång ${a} / ${b}`,
    chooses: (name) => `${name} väljer spelform`,
    changeMode: "Byt spelform",
    leader: "Ledare", next: "Nästa", third: "Tredje",
    target: (t) => `mål ${t}`,
    confirmRound: "Bekräfta omgång",
    scoreboard: "Poängtavla",
    total: "Totalt",
    colRound: "Omgång", colMode: "Spelform",
    done: "Klar",
    undo: "Ångra senaste omgången",
    playAgain: "Spela igen",
    playAgainConfirm: "Nollställ poängen och starta en ny match på 18 omgångar med samma spelare?",
    changePlayers: "Byt spelare",
    gameOver: "Spelet slut",
    rules: "Regler",
    rulesTitle: "Så spelar man Tre Belli",
    rulesSections: [
      { h: "Spelet", p: [
        "Tre Belli är ett sticktagningsspel för tre spelare som spelas över 18 omgångar med en vanlig kortlek. Appen delar inte ut eller spelar korten — den håller poängen medan ni spelar vid bordet.",
      ] },
      { h: "Omgångar och spelformer", legend: true, p: [
        "Varje omgång har en ledare som väljer omgångens spelform. Ledarrollen roterar, så varje spelare leder sex omgångar och använder var och en av de sex spelformerna exakt en gång (6 spelformer × 3 spelare = 18 omgångar).",
        "De fyra färgerna gör den färgen till trumf. Spel och Pass spelas utan trumf.",
      ] },
      { h: "Given och köphögen", p: [
        "Varje spelare får 13 kort, och ytterligare 13 bildar köphögen. Ledaren väljer först spelform och får sedan köpa kort från köphögen genom att slänga lika många kort från handen. Nästa spelare får därefter köpa av de kort som är kvar, och till sist tredje spelaren om några återstår.",
      ] },
      { h: "Att spela sticken", p: [
        "Spelet är vanlig sticktagning. En spelare spelar ut ett kort och de andra följer och lägger den utspelade färgen om de kan. Högsta trumfen tar sticket, eller om ingen trumf spelas det högsta kortet i den utspelade färgen. I Spel och Pass finns ingen trumf, så det högsta kortet i den utspelade färgen vinner alltid.",
      ] },
      { h: "Mål och poäng", p: [
        "Varje omgång har 13 stick. Varje spelare har ett målantal stick: ledaren 7, nästa spelare 4 och tredje spelaren 2.",
        "Pass är undantaget — där vill man ta så få stick som möjligt, så målen blir istället 2, 4 och 7.",
        "Din poäng för omgången är antalet stick du tog minus ditt mål (för Pass: mål minus stick). Eftersom målen summerar till 13 blir de tre spelarnas poäng alltid noll tillsammans.",
      ] },
      { h: "Så använder du appen", p: [
        "Välj ledarens spelform och mata in sticken för ledaren och nästa spelare — tredje spelarens stick och allas poäng räknas ut åt dig. Totalpoängen syns hela tiden, och poängtavlan visar varje omgång och vem som valde den. Ångra senaste omgången eller börja om från menyn.",
      ] },
    ],
    modes: { hearts: "Hjärter", spades: "Spader", diamonds: "Ruter", clubs: "Klöver", spel: "Spel", pass: "Pass" },
  },
};

function defaultLang() {
  const saved = localStorage.getItem("trebelli.lang");
  if (saved === "en" || saved === "sv") return saved;
  return (navigator.language || "en").toLowerCase().startsWith("sv") ? "sv" : "en";
}

// ---------- State ----------
const STORAGE_KEY = "trebelli.game";

let state = {
  screen: "setup",          // "setup" | "game"
  players: ["", "", ""],
  rounds: [],               // committed RoundResult objects
  selectedMode: null,       // in-progress round entry
  leadTricks: 0,
  nextTricks: 0,
  lang: defaultLang(),
  showScoreboard: false,
  showRules: false,
  menuOpen: false,
};

function save() {
  const { screen, players, rounds, selectedMode, leadTricks, nextTricks } = state;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ screen, players, rounds, selectedMode, leadTricks, nextTricks }));
  localStorage.setItem("trebelli.lang", state.lang);
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const s = JSON.parse(raw);
    if (Array.isArray(s.players)) state.players = s.players;
    if (Array.isArray(s.rounds)) state.rounds = s.rounds;
    state.selectedMode = s.selectedMode ?? null;
    state.leadTricks = s.leadTricks ?? 0;
    state.nextTricks = s.nextTricks ?? 0;
    // Resume into the game if one was in progress.
    if (s.screen === "game" && state.players.every((n) => n.trim() !== "")) {
      state.screen = "game";
    }
  } catch (_) { /* ignore corrupt storage */ }
}

// ---------- Domain helpers ----------
const t = () => I18N[state.lang];
const currentRoundNumber = () => state.rounds.length + 1;
const isGameOver = () => state.rounds.length >= TOTAL_ROUNDS;
const leadIndex = () => state.rounds.length % 3;
const nextIndex = () => (state.rounds.length + 1) % 3;
const thirdIndex = () => (state.rounds.length + 2) % 3;

function targetsFor(mode) {
  return mode === "pass" ? { lead: 2, next: 4, third: 7 } : { lead: 7, next: 4, third: 2 };
}
function scoreFor(mode, tricks, target) {
  return mode === "pass" ? target - tricks : tricks - target;
}
function remainingModes(playerIndex) {
  const used = new Set(state.rounds.filter((r) => r.leadPlayerIndex === playerIndex).map((r) => r.mode));
  return MODES.filter((m) => !used.has(m));
}
function totalScore(playerIndex) {
  return state.rounds.reduce((sum, r) => sum + r.score[playerIndex], 0);
}

function recordRound(mode, leadTricks, nextTricks) {
  const tg = targetsFor(mode);
  const thirdTricks = TRICKS_PER_ROUND - leadTricks - nextTricks;
  const li = leadIndex(), ni = nextIndex(), ti = thirdIndex();
  const leadScore = scoreFor(mode, leadTricks, tg.lead);
  const nextScore = scoreFor(mode, nextTricks, tg.next);
  const thirdScore = -(leadScore + nextScore);

  const score = [0, 0, 0], tricks = [0, 0, 0];
  score[li] = leadScore; score[ni] = nextScore; score[ti] = thirdScore;
  tricks[li] = leadTricks; tricks[ni] = nextTricks; tricks[ti] = thirdTricks;

  state.rounds.push({
    roundNumber: currentRoundNumber(),
    mode,
    leadPlayerIndex: li,
    score,   // indexed by player
    tricks,  // indexed by player
  });
}

// ---------- Actions ----------
function selectMode(mode) {
  const tg = targetsFor(mode);
  state.selectedMode = mode;
  state.leadTricks = tg.lead;
  state.nextTricks = tg.next;
  render();
}
function clearMode() { state.selectedMode = null; render(); }

function adjust(which, delta) {
  const maxLead = TRICKS_PER_ROUND - state.nextTricks;
  const maxNext = TRICKS_PER_ROUND - state.leadTricks;
  if (which === "lead") state.leadTricks = Math.max(0, Math.min(maxLead, state.leadTricks + delta));
  else state.nextTricks = Math.max(0, Math.min(maxNext, state.nextTricks + delta));
  render();
}

function confirmRound() {
  recordRound(state.selectedMode, state.leadTricks, state.nextTricks);
  state.selectedMode = null;
  state.leadTricks = 0;
  state.nextTricks = 0;
  render();
}

function undoLastRound() {
  if (state.rounds.length === 0) return;
  state.rounds.pop();
  state.selectedMode = null;
  state.menuOpen = false;
  render();
}

function playAnotherGame() {
  if (!confirm(t().playAgainConfirm)) { state.menuOpen = false; render(); return; }
  state.rounds = [];
  state.selectedMode = null;
  state.leadTricks = 0;
  state.nextTricks = 0;
  state.menuOpen = false;
  state.showScoreboard = false;
  render();
}

function changePlayers() {
  state.screen = "setup";
  state.menuOpen = false;
  state.showScoreboard = false;
  render();
}

function startGame() {
  if (!state.players.every((n) => n.trim() !== "")) return;
  state.rounds = [];
  state.selectedMode = null;
  state.leadTricks = 0;
  state.nextTricks = 0;
  state.screen = "game";
  render();
}

function setLang(lang) { state.lang = lang; render(); }

// ---------- Rendering ----------
const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function modeIcon(mode, extraClass = "") {
  const m = MODE_META[mode];
  return `<span class="mode-icon ${m.cls} ${extraClass}">${m.glyph}</span>`;
}
const signed = (v) => (v > 0 ? `+${v}` : `${v}`);

function render() {
  save();
  const app = document.getElementById("app");
  app.innerHTML = state.screen === "setup" ? renderSetup() : renderGame();
  bind();
}

function renderSetup() {
  const L = t();
  const scatter = ["♠", "♥", "♦", "♣"];
  const pos = [[8,10],[80,14],[46,24],[18,42],[88,46],[60,58],[10,72],[76,78],[40,86],[90,92]];
  const suits = pos.map(([x, y], i) =>
    `<span style="left:${x}%;top:${y}%">${scatter[i % 4]}</span>`).join("");
  const canStart = state.players.every((n) => n.trim() !== "");
  const inputs = [0, 1, 2].map((i) =>
    `<input data-idx="${i}" type="text" inputmode="text" autocomplete="off"
       placeholder="${esc(L.playerName(i + 1))}" value="${esc(state.players[i])}">`).join("");
  return `
    <div class="setup">
      <div class="suit-scatter">${suits}</div>
      <div class="lang-toggle">${langSeg(true)}</div>
      <div class="brand"><div class="spade">♠</div><h1>${esc(L.appName)}</h1></div>
      <form id="setup-form">
        ${inputs}
        <button type="submit" class="start-btn" ${canStart ? "" : "disabled"}>${esc(L.startGame)}</button>
      </form>
      <button class="rules-link" data-act="rules">${esc(L.rules)}</button>
    </div>
    ${state.showRules ? renderRulesOverlay() : ""}`;
}

function langSeg(onFelt) {
  const mk = (code, label) =>
    `<button data-lang="${code}" class="${state.lang === code ? "active" : ""}">${label}</button>`;
  return `<div class="seg">${mk("en", "EN")}${mk("sv", "SV")}</div>`;
}

function renderGame() {
  const L = t();
  const over = isGameOver();
  return `
    <div class="game">
      <div class="topbar">
        <span class="title">${esc(L.appName)}</span>
        <span class="spacer"></span>
        ${over ? "" : `<button class="tool" data-act="scoreboard">${esc(L.scoreboard)}</button>`}
        <div class="menu-wrap">
          <button class="tool" data-act="menu" aria-label="Menu">⋯</button>
          ${state.menuOpen ? renderMenu() : ""}
        </div>
      </div>
      <div class="game-body">
        ${renderTotals()}
        <div class="main">${over ? renderGameOver() : renderRound()}</div>
      </div>
    </div>
    ${state.showScoreboard ? renderScoreboardOverlay() : ""}
    ${state.showRules ? renderRulesOverlay() : ""}`;
}

function renderMenu() {
  const L = t();
  const dis = state.rounds.length === 0 ? "disabled" : "";
  return `
    <div class="menu" id="menu">
      <button data-act="rules">${esc(L.rules)}</button>
      <div class="sep"></div>
      <button data-act="undo" ${dis}>${esc(L.undo)}</button>
      <button data-act="playagain" ${dis}>${esc(L.playAgain)}</button>
      <button data-act="changeplayers">${esc(L.changePlayers)}</button>
      <div class="sep"></div>
      <div style="display:flex;gap:6px;padding:10px 16px;align-items:center;">
        <span style="color:var(--muted);font-size:14px;">Language</span>
        <span class="spacer"></span>${langSegDark()}
      </div>
    </div>`;
}
function langSegDark() {
  const mk = (code, label) =>
    `<button data-lang="${code}" style="border:1px solid var(--divider);background:${state.lang===code?"var(--accent)":"transparent"};color:${state.lang===code?"#fff":"var(--text)"};border-radius:8px;padding:4px 10px;font-size:13px;font-weight:600;margin-left:4px;">${label}</button>`;
  return mk("en", "EN") + mk("sv", "SV");
}

function renderTotals() {
  const L = t();
  const items = [0, 1, 2].map((i) => `
    <div class="total-item">
      <div class="name">${esc(state.players[i])}</div>
      <div class="score">${totalScore(i)}</div>
    </div>`).join("");
  return `<aside class="totals"><span class="totals-label">${esc(L.total)}</span>${items}</aside>`;
}

function renderRound() {
  const L = t();
  const header = `<div class="round-no">${esc(L.round(currentRoundNumber(), TOTAL_ROUNDS))}</div>`;
  if (!state.selectedMode) {
    const li = leadIndex();
    const tiles = remainingModes(li).map((m) => `
      <button data-mode="${m}">
        ${modeIcon(m)}
        <span>${esc(L.modes[m])}</span>
      </button>`).join("");
    return `<div class="round">
      ${header}
      <h2>${esc(L.chooses(state.players[li]))}</h2>
      <div class="mode-grid">${tiles}</div>
    </div>`;
  }

  const mode = state.selectedMode;
  const tg = targetsFor(mode);
  const li = leadIndex(), ni = nextIndex(), ti = thirdIndex();
  const thirdTricks = TRICKS_PER_ROUND - state.leadTricks - state.nextTricks;

  return `<div class="round">
    ${header}
    <div class="change-bar">
      <button class="change-btn" data-act="changemode">↩ ${esc(L.changeMode)}</button>
      <span class="cur-mode">${modeIcon(mode)} ${esc(L.modes[mode])}</span>
    </div>
    ${playerCard(li, L.leader, tg.lead, state.leadTricks, "lead", mode)}
    ${playerCard(ni, L.next, tg.next, state.nextTricks, "next", mode)}
    ${thirdCard(ti, tg.third, thirdTricks, mode)}
    <button class="confirm-btn" data-act="confirm">${esc(L.confirmRound)}</button>
  </div>`;
}

function playerCard(playerIndex, role, target, tricks, which, mode) {
  const L = t();
  const other = which === "lead" ? state.nextTricks : state.leadTricks;
  const maxAllowed = TRICKS_PER_ROUND - other;
  const score = scoreFor(mode, tricks, target);
  return `<div class="player-card">
    <div class="pc-head">
      <div>
        <div class="pc-name">${esc(state.players[playerIndex])}</div>
        <div class="pc-role">${esc(role)} · ${esc(L.target(target))}</div>
      </div>
    </div>
    <div class="stepper">
      <button data-step="${which}" data-delta="-1" ${tricks <= 0 ? "disabled" : ""}>−</button>
      <span class="count">${tricks}</span>
      <button data-step="${which}" data-delta="1" ${tricks >= maxAllowed ? "disabled" : ""}>+</button>
    </div>
    <div class="pc-score">${signed(score)}</div>
  </div>`;
}

function thirdCard(playerIndex, target, tricks, mode) {
  const L = t();
  const score = scoreFor(mode, tricks, target);
  return `<div class="player-card third">
    <div class="pc-head">
      <div>
        <div class="pc-name">${esc(state.players[playerIndex])}</div>
        <div class="pc-role">${esc(L.third)} · ${esc(L.target(target))}</div>
      </div>
    </div>
    <div class="stepper"><span class="count">${tricks}</span></div>
    <div class="pc-score">${signed(score)}</div>
  </div>`;
}

function renderScoreboardTable() {
  const L = t();
  const rows = state.rounds.map((r) => {
    const cells = [0, 1, 2].map((i) => {
      const v = r.score[i];
      const lead = r.leadPlayerIndex === i;
      const cls = [lead ? "lead" : "", v < 0 ? "neg" : ""].filter(Boolean).join(" ");
      const inner = lead ? `<span class="cell">${signed(v)}</span>` : signed(v);
      return `<td class="${cls}">${inner}</td>`;
    }).join("");
    return `<tr>
      <td class="col-round">${r.roundNumber}</td>
      <td class="col-mode">${modeIcon(r.mode)}</td>
      ${cells}
    </tr>`;
  }).join("");
  const totals = [0, 1, 2].map((i) => `<td>${totalScore(i)}</td>`).join("");
  return `<table class="board">
    <thead><tr>
      <th class="col-round">${esc(L.colRound)}</th>
      <th class="col-mode">${esc(L.colMode)}</th>
      <th>${esc(state.players[0])}</th>
      <th>${esc(state.players[1])}</th>
      <th>${esc(state.players[2])}</th>
    </tr></thead>
    <tbody>
      ${rows}
      <tr class="totals-row"><td>${esc(L.total)}</td><td></td>${totals}</tr>
    </tbody>
  </table>`;
}

function renderScoreboardOverlay() {
  const L = t();
  return `<div class="overlay" data-act="closeboard">
    <div class="sheet">
      <div class="sheet-head">
        <h2>${esc(L.scoreboard)}</h2>
        <button data-act="closeboard">${esc(L.done)}</button>
      </div>
      <div class="scoreboard">${renderScoreboardTable()}</div>
    </div>
  </div>`;
}

function renderRulesOverlay() {
  const L = t();
  const legend = MODES.map((m) =>
    `<span class="rule-mode">${modeIcon(m)} ${esc(L.modes[m])}</span>`).join("");
  const sections = L.rulesSections.map((sec) => {
    const paras = sec.p.map((para) => `<p>${esc(para)}</p>`).join("");
    const leg = sec.legend ? `<div class="rule-legend">${legend}</div>` : "";
    return `<section><h3>${esc(sec.h)}</h3>${paras}${leg}</section>`;
  }).join("");
  return `<div class="overlay" data-act="closerules">
    <div class="sheet">
      <div class="sheet-head">
        <h2>${esc(L.rulesTitle)}</h2>
        <button data-act="closerules">${esc(L.done)}</button>
      </div>
      <div class="rules">${sections}</div>
    </div>
  </div>`;
}

function renderGameOver() {
  const L = t();
  return `<div>
    <div class="gameover"><h2>${esc(L.gameOver)}</h2></div>
    <div class="scoreboard">${renderScoreboardTable()}</div>
    <div class="endgame-actions">
      <button data-act="changeplayers">${esc(L.changePlayers)}</button>
      <button class="primary" data-act="playagain">${esc(L.playAgain)}</button>
    </div>
  </div>`;
}

// ---------- Event binding ----------
function bind() {
  const app = document.getElementById("app");

  // Setup: name inputs update state without re-render (keep focus).
  const form = document.getElementById("setup-form");
  if (form) {
    form.querySelectorAll("input[data-idx]").forEach((inp) => {
      inp.addEventListener("input", (e) => {
        state.players[+e.target.dataset.idx] = e.target.value;
        const btn = form.querySelector(".start-btn");
        btn.disabled = !state.players.every((n) => n.trim() !== "");
        save();
      });
    });
    form.addEventListener("submit", (e) => { e.preventDefault(); startGame(); });
  }

  // Delegated clicks for everything else.
  app.addEventListener("click", onClick);
}

function onClick(e) {
  const langBtn = e.target.closest("[data-lang]");
  if (langBtn) { setLang(langBtn.dataset.lang); return; }

  const modeBtn = e.target.closest("[data-mode]");
  if (modeBtn) { selectMode(modeBtn.dataset.mode); return; }

  const step = e.target.closest("[data-step]");
  if (step) { adjust(step.dataset.step, +step.dataset.delta); return; }

  const actEl = e.target.closest("[data-act]");
  if (!actEl) {
    // click outside menu closes it
    if (state.menuOpen) { state.menuOpen = false; render(); }
    return;
  }
  const act = actEl.dataset.act;

  // Overlays close only on their Done button or a click on the backdrop
  // itself — never on clicks inside the sheet (which bubble up to the overlay).
  if (act === "closeboard" || act === "closerules") {
    const isDoneButton = actEl.tagName === "BUTTON";
    const clickedBackdrop = e.target === actEl && actEl.classList.contains("overlay");
    if (isDoneButton || clickedBackdrop) {
      if (act === "closeboard") state.showScoreboard = false; else state.showRules = false;
      render();
    }
    return;
  }

  switch (act) {
    case "menu": state.menuOpen = !state.menuOpen; render(); break;
    case "scoreboard": state.showScoreboard = true; state.menuOpen = false; render(); break;
    case "rules": state.showRules = true; state.menuOpen = false; render(); break;
    case "changemode": clearMode(); break;
    case "confirm": confirmRound(); break;
    case "undo": undoLastRound(); break;
    case "playagain": playAnotherGame(); break;
    case "changeplayers": changePlayers(); break;
  }
}

// ---------- Boot ----------
load();
render();
