# CLAUDE.md — Poker Trainer

## Project Overview

Texas Hold'em Poker Trainer — a browser-based educational app for learning poker terminology, hand rankings, GTO preflop strategy, and decision-making. Modular Preact SPA deployed to GitHub Pages via Vite.

**Live URL:** `https://mpechuk.github.io/poker-trainer/`

---

## Tech Stack

| Concern | Implementation |
|---|---|
| UI | Preact (JSX components) |
| Build | Vite + @preact/preset-vite |
| Routing | Custom hash-based router (`#/section/page`) |
| Fonts | Google Fonts CDN (Playfair Display, Crimson Pro) |
| State | Component state (`useState`/`useEffect`) + `localStorage` for persistence |
| Hosting | GitHub Pages (static) |
| CI/CD | GitHub Actions (`deploy.yml` — npm ci + vite build + deploy dist/) |

---

## Repository Structure

```
poker-trainer/
├── index.html                          # Vite entry point (minimal shell)
├── vite.config.js                      # Vite config (preact plugin, base path)
├── package.json                        # deps: preact; devDeps: vite, @preact/preset-vite
├── src/
│   ├── main.jsx                        # Mount <App /> into #app
│   ├── app.jsx                         # Header + hash router with route table
│   ├── styles/
│   │   ├── base.css                    # :root vars, body, fonts, global reset
│   │   ├── header.css                  # Header, section nav, sub-nav tabs
│   │   ├── welcome.css                 # Welcome page hand rankings, section cards
│   │   ├── study.css                   # Flashcard scene, 3D flip, card nav
│   │   ├── quiz.css                    # Term quiz + RFI quiz styles
│   │   ├── reference.css              # Search input, ref grid, modal
│   │   ├── charts.css                  # Position tabs, RFI grid, legend
│   │   └── stats.css                   # Stats dashboard styles
│   ├── data/
│   │   ├── terms.js                    # TERMS array (~78 terms), CATS set
│   │   └── rfi-ranges.js              # RFI_RANGES, RANKS, POS_LIST, quiz constants
│   ├── utils/
│   │   ├── illustrations.jsx           # cardSvg(), hand(), ILLUS, getIllus(), handToCards()
│   │   ├── shuffle.js                  # Immutable Fisher-Yates shuffle
│   │   └── storage.js                  # localStorage helpers for all 3 stat stores
│   ├── hooks/
│   │   ├── useFilters.js               # activeCats state + toggle logic
│   │   └── useDeck.js                  # deck, idx, flipped, nav, shuffle
│   ├── components/
│   │   ├── Header.jsx                  # App header + section nav (Home | Terminology | Preflop | Stats)
│   │   ├── SubNav.jsx                  # Sub-navigation tabs within a section
│   │   ├── FilterChips.jsx             # Category filter chip bar
│   │   ├── ProgressBar.jsx             # Study progress bar
│   │   └── Modal.jsx                   # Term detail modal overlay
│   └── sections/
│       ├── welcome/
│       │   └── Welcome.jsx             # Landing page with hand rankings overview
│       ├── terminology/
│       │   ├── Study.jsx               # Flashcard study mode
│       │   ├── Quiz.jsx                # Multiple-choice terminology quiz
│       │   └── Reference.jsx           # Searchable glossary
│       ├── preflop/
│       │   ├── Charts.jsx              # RFI hand range grid with position tabs
│       │   └── Quiz.jsx                # Raise/fold RFI quiz
│       └── stats/
│           └── Dashboard.jsx           # Full stats dashboard
├── .github/workflows/deploy.yml        # Build + deploy to GitHub Pages
├── CLAUDE.md                           # This file
└── README.md                           # User-facing docs
```

---

## Route Structure

Hash-based routing (`#/path`) for GitHub Pages compatibility.

| Route | Component | Description |
|---|---|---|
| `#/welcome` | Welcome.jsx | Landing page with hand rankings overview (default) |
| `#/terminology/study` | Study.jsx | Flashcard study mode |
| `#/terminology/quiz` | Quiz.jsx | Multiple-choice terminology quiz |
| `#/terminology/reference` | Reference.jsx | Searchable glossary |
| `#/preflop/charts` | Charts.jsx | RFI hand range grids |
| `#/preflop/quiz` | Quiz.jsx | Raise/fold RFI quiz |
| `#/stats` | Dashboard.jsx | Full stats dashboard |

Redirects: `/` → `/welcome`, `/terminology` → `/terminology/study`, `/preflop` → `/preflop/charts`

---

## Core Data

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

---

## CSS Design System

CSS variables defined in `:root` (src/styles/base.css):

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

Fonts: `'Playfair Display'` for headings, `'Crimson Pro'` for body text.

---

## localStorage Schema

| Key | Content |
|---|---|
| `rfi-quiz-stats` | `{ totalQuizzes, totalQuestions, totalCorrect, byPosition, recentScores }` |
| `term-quiz-stats` | `{ totalQuizzes, totalQuestions, totalCorrect, bestStreak, recentScores }` |
| `study-progress` | `{ cardsSeen: [], totalFlips, byCategory: {} }` |

---

## Development Commands

```bash
npm run dev      # Start Vite dev server (localhost:5173)
npm run build    # Production build to dist/
npm run preview  # Preview production build locally
```

---

## Deployment

Push to `main` → GitHub Actions runs `deploy.yml` → `npm ci` + `npm run build` → deploys `dist/` to GitHub Pages.

**Development branch convention:** `claude/[feature-description]-[uuid]`

---

## Development Conventions

### Adding Poker Terms

Add to `TERMS` array in `src/data/terms.js`:
```javascript
{ term: "Term Name", cat: "Category", def: "Full definition.", illus: "illustration-key" }
```

### Adding RFI Range Hands

Edit the `Set` for the relevant position in `src/data/rfi-ranges.js`.

### Adding Illustrations

Add an entry to the `ILLUS` object in `src/utils/illustrations.jsx`. SVG illustration functions return HTML strings, rendered via `dangerouslySetInnerHTML`.

### Style Additions

Use existing CSS variables — don't hardcode colors. Each section has its own CSS file in `src/styles/`.

---

## Installed Claude Code Skills

**caveman** — Reduces token usage ~75% by dropping articles and filler. Triggered by `/caveman` or user request.

**caveman-compress** — Python utility to compress CLAUDE.md files via Claude API.

---

## README Maintenance

Update `README.md` whenever a change affects the project's structure or functionality.

---

## Testing Requirements

**Every code change must include a test.** No exceptions.

- **Test file location**: `src/<module>.test.js` alongside the module under test
- **Test runner**: Vitest (`npm test`) — tests in `src/` use `describe`/`it`/`expect` from `vitest`
- **Run tests before pushing**: `npm test && npm run build`
- **CI enforces this**: `test.yml` runs both `node test.js` (favicon) and `npm test` (unit tests) on every PR

### What to test

| Change type | What to add |
|---|---|
| New routing path / redirect | Test in `src/routing.test.js` — verify `resolveRoute` and `ROUTES_LIST` |
| New data (terms, RFI hands) | Test that the entry exists and has required fields |
| New utility function | Pure unit tests for all branches |
| Bug fix | Regression test that would have caught the bug |

### Regression test pattern

When fixing a bug, add a test named to describe the failure mode:
```js
it('empty hash on initial load resolves to a renderable route — no blank page regression', () => {
  // reproduce the exact conditions that triggered the bug
  ...
});
```

---

## Staging Deployments (PR Previews)

Each PR automatically deploys a preview build to the `gh-pages` branch under `pr-<number>/`.

**Preview URL**: `https://mpechuk.github.io/poker-trainer/pr-<number>/`

**One-time repo setup required** (do this once in GitHub repo settings):
> Settings → Pages → Source → "Deploy from a branch" → Branch: `gh-pages` / folder: `/ (root)`

Workflows:
- `.github/workflows/preview.yml` — builds and deploys on PR open/update, comments URL on PR, cleans up on PR close
- `.github/workflows/deploy.yml` — production deploy to root on push to `main`

Dynamic base path is controlled by `VITE_BASE_PATH` env var (default: `/poker-trainer/`).

---

## Important Constraints

- **No additional external dependencies** beyond what's in package.json (except existing Google Fonts)
- **Hash-based routing** — required for GitHub Pages (no server-side rewrites)
- **Static only** — no server-side rendering, no API endpoints, no database
- **GitHub Pages compatible** — deployment must remain zero-config static hosting
- **Run `npm test && npm run build`** to verify changes before pushing
