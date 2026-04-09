# Texas Hold'em Poker Trainer

**Poker Trainer** is a browser-based educational app for learning poker terminology, hand rankings, GTO preflop strategy, and decision-making. Built with Preact and Vite, deployed to GitHub Pages.

**Play now:** https://mpechuk.github.io/poker-trainer/

## Sections

### Terminology
- **Study** — 3D flashcard system with elegant flip animations. Each card shows a poker term on one side and its definition with a custom SVG illustration on the other.
- **Quiz** — Multiple-choice questions (4 options) with real-time score, streak tracking, and persistent stats.
- **Reference** — Searchable glossary of ~78 poker terms organized across 9 categories, with detailed modal views.

### Preflop
- **Charts** — Interactive 13x13 preflop RFI (Raise First In) hand range grids for each table position (UTG, HJ, CO, BTN, SB).
- **RFI Quiz** — Practice raise/fold decisions against GTO-optimal preflop ranges with persistent progress tracking.

### Stats
- **Dashboard** — Full statistics view showing study progress, terminology quiz accuracy, and RFI quiz performance by position.

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
│   └── sections/               # terminology/, preflop/, stats/
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
| `#/terminology/study` | Flashcard study mode |
| `#/terminology/quiz` | Multiple-choice terminology quiz |
| `#/terminology/reference` | Searchable glossary |
| `#/preflop/charts` | RFI hand range grids |
| `#/preflop/quiz` | Raise/fold RFI quiz |
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
