# Texas Hold'em Poker Trainer

**Poker Trainer** is a browser-based educational app for learning poker terminology, hand rankings, GTO preflop strategy, and decision-making. Built with Preact and Vite, deployed to GitHub Pages.

**Play now:** https://mpechuk.github.io/poker-trainer/

## Sections

### Welcome
- **Home** — Landing page with poker hand rankings (Royal Flush through High Card) and an overview of all trainer sections.

### Terminology
- **Study** — 3D flashcard system with elegant flip animations. Each card shows a poker term on one side and its definition with a custom SVG illustration on the other.
- **Quiz** — Setup screen for picking topics, then multiple-choice questions (4 options) with real-time score, streak tracking, current question counter, and persistent stats. Honors the Settings page's quiz length and auto-advance preferences.
- **Reference** — Searchable glossary of ~84 poker terms organized across 9 categories (including a Board Texture category covering flop types: dry/static, wet/dynamic, paired, two-tone, monotone, and connected), with detailed modal views.

### Preflop
- **Charts** — Interactive 13x13 preflop RFI (Raise First In) hand range grids for each table position (UTG, HJ, CO, BTN, SB).
- **RFI Quiz** — Practice raise/fold decisions against GTO-optimal preflop ranges with persistent progress tracking. Each question shows the 6-max table with hero highlighted gold and (in vs Limp / vs Raise modes) the villain highlighted red, with a chip next to the villain seat indicating their action (↑ for raise, ✓ for limp).

### Quizzes
- **Preflop Quiz** — The RFI / vs-Limp / vs-Raise preflop quizzes (above).
- **Terminology Quiz** — Multiple-choice questions on poker terms across all 9 categories.
- **Flop Texture Quiz** — Classify a randomly dealt three-card flop as one of the six Board Texture categories (Paired, Monotone, Wet / Dynamic, Two-tone, Connected, Dry / Static). Four multiple-choice options are drawn from the same pool so the user has to read the flop's ranks, suits, and connectedness to pick the right one.
- **Flop Combos & Outs Quiz** — Given 2 hole cards and a 3-card flop, (phase 1) classify every hand category twice — is it reachable **by the turn** (one more card) and is it reachable **by the river** (two more cards)? Backdoor (runner-runner) draws are river-only. Then (phase 2) enter the number of single-card turn outs for each category you marked as turn-reachable. Categories already made on the flop are pre-checked and locked for both horizons — including their subset categories (e.g. when Two Pair is on the flop, Pair is also pre-checked). Feedback reveals the exact river probability, the rule-of-4 approximation, and renders the specific out cards so you can see exactly which cards complete each draw. When you miss a river-reachable category (typical for backdoor draws), feedback also shows one concrete (turn, river) pair that would have gotten there — so a 3-5 hole on a 7-K-Q flop highlights the 4 + 6 runner-runner that completes the straight.

### Stats
- **Dashboard** — Full statistics view showing study progress, terminology quiz accuracy, and RFI quiz performance by position. Surfaces a "Recommended Next Quiz" card that points you at your weakest area (or an untaken quiz for a baseline) with a one-click button to start it.

### Shareable Quiz Links
Every quiz (terminology + preflop) has a **Share** button that copies a link encoding the exact quiz configuration — its length, stack depth, and the full ordered list of questions. Opening the link launches that identical quiz, so two players can attempt the same set of questions and compare scores.

## Technology

| Concern | Implementation |
|---|---|
| UI | Preact (JSX components) |
| Build | Vite + @preact/preset-vite |
| Routing | Hash-based (`#/section/page`) |
| Fonts | Google Fonts (Playfair Display, Crimson Pro) |
| State | Component state + `localStorage` |
| Hosting | GitHub Pages (static) |
| CI/CD | GitHub Actions (build + deploy) |

## Repository Structure

```
poker-trainer/
├── index.html                  # Vite entry point
├── vite.config.js              # Vite config with GitHub Pages base path
├── package.json                # Dependencies: preact, preact-router; devDeps: vite
├── src/
│   ├── main.jsx                # Mount <App /> into #app
│   ├── app.jsx                 # Top-level: Header + hash router
│   ├── styles/                 # CSS modules (base, header, study, quiz, etc.)
│   ├── data/                   # terms.js, rfi-ranges.js
│   ├── utils/                  # illustrations.jsx, shuffle.js, storage.js
│   ├── hooks/                  # useFilters.js, useDeck.js
│   ├── components/             # Header, SubNav, FilterChips, ProgressBar, Modal
│   └── sections/               # welcome/, terminology/, preflop/, stats/
├── .github/workflows/deploy.yml
└── CLAUDE.md
```

## Development

```bash
# Clone and install
git clone https://github.com/mpechuk/poker-trainer.git
cd poker-trainer
npm install

# Start dev server
npm run dev

# Production build
npm run build
```

## URL Routes

All routes use hash-based URLs for GitHub Pages compatibility:

| Route | View |
|---|---|
| `#/welcome` | Welcome / hand rankings overview |
| `#/terminology/study` | Flashcard study mode |
| `#/terminology/quiz` | Multiple-choice terminology quiz |
| `#/terminology/reference` | Searchable glossary |
| `#/preflop/charts` | RFI hand range grids |
| `#/preflop/quiz` | Raise/fold RFI quiz |
| `#/quizzes/flop` | Flop Texture (Board Texture) quiz |
| `#/quizzes/flop-combos` | Flop Combos & Outs quiz |
| `#/stats` | Stats dashboard |

## Deployment

Push to `main` triggers GitHub Actions which runs `npm ci && npm run build` and deploys the `dist/` folder to GitHub Pages.

## Design

The UI uses a casino-inspired dark green felt theme with gold accents:

- **Background:** Dark green felt texture (`#0c2416`) with subtle radial gradient
- **Accent:** Gold palette (`#c9a84c` / `#edd97a` / `#7a5e1a`)
- **Typography:** Playfair Display (headings) + Crimson Pro (body)
- **Cards:** Cream background (`#f9f5ea`) with 3D CSS perspective flip animations

## Contributing

1. Use existing CSS variables (`var(--gold)`, `var(--felt)`, etc.) instead of hardcoded colors
2. No external dependencies beyond what's in package.json (except existing Google Fonts)
3. Run `npm run build` to verify your changes compile before pushing
