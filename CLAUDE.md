# CLAUDE.md — Poker Trainer

## Project Overview

Texas Hold'em Poker Trainer — a browser-based educational app for learning poker terminology, hand rankings, GTO preflop strategy, and decision-making. Single-page static site deployed to GitHub Pages.

**Live URL:** `https://mpechuk.github.io/poker-trainer/`

---

## Repository Structure

```
poker-trainer/
├── poker-trainer.html      # Entire application (HTML + CSS + JS, ~1600 lines)
├── index.html              # Redirect shim → poker-trainer.html
├── README.md               # Project README (keep in sync — see README Maintenance)
├── CLAUDE.md               # AI development instructions
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions → GitHub Pages on push to main
├── .agents/skills/         # Claude Code skill definitions (caveman, caveman-compress)
├── .claude/skills/         # Symlinks to .agents/skills/
└── skills-lock.json        # Locked skill versions
```

**Everything lives in `poker-trainer.html`.** There is no build system, no npm, no framework — pure vanilla HTML/CSS/JS in one file.

---

## Tech Stack

| Concern | Implementation |
|---|---|
| UI | Vanilla HTML5 + CSS3, no framework |
| Logic | Vanilla JavaScript, no libraries |
| Fonts | Google Fonts CDN (Playfair Display, Crimson Pro) |
| State | Global JS variables + `localStorage` for RFI quiz stats |
| Build | None — edit and deploy directly |
| Hosting | GitHub Pages (static) |
| CI/CD | GitHub Actions (`deploy.yml`) |

---

## Application Architecture

### Modes (Tabs)

The app has 5 modes switched via `setMode(m)`:

| Mode ID | Tab Label | Description |
|---|---|---|
| `study` | Study | 3D flashcard flip — back shows term, front shows definition + illustration |
| `quiz` | Quiz | Multiple-choice (4 options) with score/streak tracking |
| `ref` | Reference | Searchable glossary, categorized, with modal detail view |
| `charts` | Charts | Preflop RFI hand range grids per position |
| `rfi-quiz` | RFI Quiz | Raise/Fold quiz against GTO ranges, with progress persistence |

### Core Data

**`TERMS` array** — all poker knowledge:
```javascript
{ term: "Royal Flush", cat: "Hand Rankings", def: "...", illus: "royal-flush" }
```

**9 categories:** Hand Rankings, Positions, Betting Actions, Board & Cards, Strategy, Math & Odds, Player Types, Miscellaneous (~78 total terms)

**`RFI_RANGES` object** — GTO preflop open-raise ranges per position (6-max):
```javascript
RFI_RANGES = { UTG: new Set([...]), HJ: new Set([...]), CO: new Set([...]), BTN: new Set([...]), SB: new Set([...]) }
```

Hand notation: `"AKs"` (suited), `"AKo"` (offsuit), `"AA"` (pair)

### Global State Variables

| Variable | Purpose |
|---|---|
| `mode` | Current view (`'study'`/`'quiz'`/`'ref'`/`'charts'`/`'rfi-quiz'`) |
| `activeCats` | `Set` of active category filters |
| `deck` | Filtered + shuffled `TERMS` array |
| `idx` | Current card index in deck |
| `flipped` | Boolean — is card showing definition side |
| `quizState` | `{ score, streak, total, answered }` for quiz mode |
| `rqDeck` | Array of RFI quiz questions for current round |
| `rqIdx` | Current RFI question index |
| `rqScore` | Correct answers in current RFI round |
| `rqAnswered` | Boolean — has current RFI question been answered |
| `rqResults` | Array of `{ pos, correct }` for end-of-round stats |

### Key Functions

| Function | What it does |
|---|---|
| `setMode(m)` | Switch active panel, show/hide filters, trigger mode init |
| `rebuildDeck()` | Filter `TERMS` by `activeCats`, shuffle |
| `shuffle(arr)` | Fisher-Yates in-place shuffle |
| `flipCard()` | Toggle `.flipped` class for 3D CSS transform |
| `renderCard()` | Update DOM for current deck card + progress bar |
| `startQuiz()` | Reset quiz state, shuffle deck |
| `showQuizQ()` | Render question + 4 answer choices (1 correct, 3 random) |
| `answerQuiz(btn, chosen)` | Evaluate answer, update score/streak, show feedback |
| `renderRef()` | Filter by search input, render terms grouped by category |
| `openModal(termName)` | Show term detail overlay |
| `renderRFI()` | Render 13×13 hand range grid for active position |
| `startRfiQuiz()` | Generate balanced raise/fold deck (max 7 of each), reset state |
| `answerRfiQuiz(choseRaise)` | Check against `RFI_RANGES`, update UI + stats |
| `nextRfiQuiz()` | Advance index, re-render |
| `showRfiQuizComplete()` | Save stats to `localStorage`, show results + history |
| `buildFilters()` | Render category filter chips from `TERMS` categories |
| `getIllus(t)` | Return SVG illustration for a term |
| `card(rank, suit, w, h)` | Generate SVG playing card element |
| `handToCards(h)` | Convert hand notation (e.g. `"AKs"`) to two card SVGs |

---

## CSS Design System

CSS variables defined in `:root`:

```css
--felt: #0c2416        /* Dark green background */
--felt-mid: #173527
--felt-rim: #1e4733
--gold: #c9a84c        /* Primary accent */
--gold-bright: #edd97a /* Highlights */
--gold-dark: #7a5e1a   /* Borders, inactive states */
--card-bg: #f9f5ea     /* Card cream */
--red: #c0392b         /* Red suits */
--black: #1a1a2a       /* Black suits */
--text: #f0e8d0        /* Body text */
--muted: #8a7a5a       /* Secondary text */
--accent: #2ecc71      /* Success green */
```

Fonts: `'Playfair Display'` for headings (serif, elegant), `'Crimson Pro'` for body text.

Card flip uses `perspective: 1200px` + `rotateY(180deg)` with `backface-visibility: hidden`.

---

## Deployment

Push to `main` → GitHub Actions runs `deploy.yml` → deploys to GitHub Pages automatically. No build step. The workflow uploads the entire repo directory as the artifact.

**Development branch convention:** `claude/[feature-description]-[uuid]` (e.g. `claude/add-rfi-quiz-XYZ123`)

---

## Development Conventions

### Making Changes

1. Edit `poker-trainer.html` directly — CSS is in `<style>`, JS is in `<script>` at bottom of `<body>`
2. No transpilation, no bundler — changes are live immediately on file save
3. Test in browser by opening `poker-trainer.html` locally

### Adding Poker Terms

Add to the `TERMS` array in `poker-trainer.html`:
```javascript
{ term: "Term Name", cat: "Category", def: "Full definition.", illus: "illustration-key" }
```
Valid categories: `"Hand Rankings"`, `"Positions"`, `"Betting Actions"`, `"Board & Cards"`, `"Strategy"`, `"Math & Odds"`, `"Player Types"`, `"Miscellaneous"`

### Adding RFI Range Hands

Edit the `Set` for the relevant position in `RFI_RANGES`. Hand format:
- Pairs: `"AA"`, `"KK"`, `"22"`
- Suited: `"AKs"`, `"87s"` (higher rank first)
- Offsuit: `"AKo"`, `"87o"` (higher rank first)

### Adding Illustrations

Add an entry to the `ILLUS` object mapping a key to a function that returns an SVG string. Reference the key via the `illus` field on a `TERMS` entry.

### Style Additions

Use existing CSS variables (`var(--gold)`, `var(--felt)`, etc.) — don't hardcode color values that duplicate the palette. Follow the minified CSS style already in the file (no extra whitespace).

---

## Installed Claude Code Skills

**caveman** — Reduces token usage ~75% by dropping articles and filler. Triggered by `/caveman` or user request.

**caveman-compress** — Python utility to compress CLAUDE.md files via Claude API. Located at `.agents/skills/caveman-compress/scripts/`.

---

## LocalStorage Keys

| Key | Content |
|---|---|
| `rfi-quiz-stats` | JSON: `{ totalQuizzes, totalQuestions, totalCorrect, byPosition, recentScores }` |

---

## README Maintenance

**Update `README.md` whenever a change affects the project's structure or functionality.** This includes:

- Adding, removing, or renaming files in the repository
- Adding or changing application modes/tabs
- Modifying the tech stack (new dependencies, changed hosting, etc.)
- Changing the deployment process
- Adding new features or removing existing ones
- Changing the design system or theme

Keep the README concise and user-facing — it describes *what the project does and how to use it*, not internal implementation details (those belong in CLAUDE.md).

---

## Important Constraints

- **No external dependencies** — do not add npm packages, CDN libraries (except the existing Google Fonts), or backend services
- **Single file** — keep everything in `poker-trainer.html`; do not split into separate JS/CSS files unless explicitly requested
- **No build step** — the file must work by opening it directly in a browser
- **Static only** — no server-side rendering, no API endpoints, no database
- **GitHub Pages compatible** — deployment must remain zero-config static hosting
