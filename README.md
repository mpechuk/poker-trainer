# Texas Hold'em Poker Trainer

**Poker Trainer** is a browser-based educational app for learning poker terminology, hand rankings, GTO preflop strategy, and decision-making. Built as a single-page static site with zero dependencies.

**Play now:** https://mpechuk.github.io/poker-trainer/

## Key Features

- **Study Mode** — 3D flashcard system with elegant flip animations. Each card shows a poker term on one side and its definition with a custom SVG illustration on the other.
- **Quiz Mode** — Multiple-choice questions (4 options) with real-time score and streak tracking to test your poker vocabulary.
- **Reference** — Searchable glossary of ~78 poker terms organized across 9 categories, with detailed modal views.
- **Charts** — Interactive 13x13 preflop RFI (Raise First In) hand range grids for each table position (UTG, HJ, CO, BTN, SB).
- **RFI Quiz** — Practice raise/fold decisions against GTO-optimal preflop ranges with persistent progress tracking via localStorage.

## Technology

| Concern | Implementation |
|---|---|
| UI | Vanilla HTML5 + CSS3 |
| Logic | Vanilla JavaScript |
| Fonts | Google Fonts (Playfair Display, Crimson Pro) |
| State | Global JS variables + `localStorage` |
| Build | None — no bundler, no transpiler |
| Hosting | GitHub Pages (static) |
| CI/CD | GitHub Actions |

The entire application lives in a single file (`poker-trainer.html`) with no external dependencies, no build step, and no framework.

## Repository Structure

```
poker-trainer/
├── poker-trainer.html      # Entire application (HTML + CSS + JS)
├── index.html              # Redirect shim -> poker-trainer.html
├── README.md               # This file
├── CLAUDE.md               # AI development instructions
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions -> GitHub Pages deployment
├── .agents/skills/         # Claude Code skill definitions
├── .claude/skills/         # Symlinks to .agents/skills/
└── skills-lock.json        # Locked skill versions
```

## Development

No setup required. Edit `poker-trainer.html` directly and open it in a browser:

```bash
# Clone the repo
git clone https://github.com/mpechuk/poker-trainer.git
cd poker-trainer

# Open in browser
open poker-trainer.html
```

All CSS is in the `<style>` block and all JavaScript is in the `<script>` block at the bottom of `<body>`. Changes are live immediately on file save — no compilation or build step needed.

## Deployment

Push to `main` triggers GitHub Actions which deploys to GitHub Pages automatically. No build step — the workflow uploads the repository directory as-is.

## Design

The UI uses a casino-inspired dark green felt theme with gold accents:

- **Background:** Dark green felt texture (`#0c2416`) with subtle radial gradient
- **Accent:** Gold palette (`#c9a84c` / `#edd97a` / `#7a5e1a`)
- **Typography:** Playfair Display (headings) + Crimson Pro (body)
- **Cards:** Cream background (`#f9f5ea`) with 3D CSS perspective flip animations

## Contributing

1. All changes go in `poker-trainer.html` — do not split into separate files
2. Use existing CSS variables (`var(--gold)`, `var(--felt)`, etc.) instead of hardcoded colors
3. No external dependencies — no npm packages or CDN libraries (except existing Google Fonts)
4. The file must work by opening directly in a browser with no build step
