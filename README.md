# Tre Belli — web scorer

A score-keeping companion for the 3-player trick-taking card game **Tre Belli**,
as a self-contained static web page. It's the web counterpart to the native
iPad/iPhone app: enter three player names, walk through all 18 rounds
(round-robin lead, per-player mode selection, target-relative trick entry with
the third player auto-derived), and read a running scoreboard. It does **not**
simulate card play — it keeps score for a game played with a real deck.

## Features

- **Works everywhere** — responsive layout: totals sit in a sidebar on
  desktop/tablet and collapse to a top bar on phones. Just a browser, no app
  store.
- **Automatic dark / light** — follows the operating system via
  `prefers-color-scheme`; no theme switch to fiddle with.
- **Remembers your game** — the current game (players + all rounds) is saved to
  `localStorage`, so a reload or coming back later resumes exactly where you
  left off.
- **English + Swedish** — auto-detected from the browser language, with an
  EN/SV toggle. Mode names: Hjärter/Hearts, Spader/Spades, Ruter/Diamonds,
  Klöver/Clubs, Spel/No Trump, Pass/Misère.
- **Undo & restart** — change the chosen mode before confirming, undo the last
  recorded round, play another game (same players), or change players.
- Zero dependencies, no build step — plain HTML/CSS/JS.

## Scoring rules

- 6 modes per player over 18 rounds (6 × 3); each player leads 6 rounds and uses
  every mode exactly once.
- Trick targets: lead 7, next 4, third 2 — except **Pass** (Misère), which
  inverts to 2 / 4 / 7 (aim for *fewer* tricks).
- Score = `tricksTaken − target` for normal modes; `target − tricksTaken` for
  Pass. Targets sum to 13, so every round's scores sum to 0.
- Only two players' tricks are entered per round; the third is derived
  (`13 − t1 − t2`), and trick entry is capped so the total can't exceed 13.

## Running it

It's just static files — serve the folder with any web server:

```sh
# locally
python3 -m http.server 8000
# then open http://localhost:8000
```

To deploy, copy `index.html`, `styles.css`, and `app.js` to any static host
(nginx/Apache, GitHub Pages, Netlify, an S3 bucket, a Raspberry Pi …). No
backend required.

## Files

- `index.html` — page shell
- `styles.css` — theme (light/dark via CSS variables) and responsive layout
- `app.js` — game state, rules, rendering, and `localStorage` persistence
