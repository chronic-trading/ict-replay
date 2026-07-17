# ICT Replay Trainer

Practice reading real ICT setups. Study a scenario, identify the concept, pick the
direction, name the draw on liquidity, and place your entry — then get scored on
the read. Includes bar-by-bar **Trade Mode** (play the tape and manage a live
position), a timed **Exam Mode**, daily streaks, and progress tracking.

Part of the **Chronic Trading** suite alongside [Trading Lab](https://chronic-trading.github.io/trading-lab/)
(the model builder) and the [ICT Glossary](https://chronic-trading.github.io/ict-glossary/).

## Stack

- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS 4** for utilities; component colors flow from CSS custom
  properties (`--rp-*`) so themes stay consistent
- **lightweight-charts** for the bar-by-bar replay in Trade Mode
- **lucide-react** for iconography

## Running locally

```bash
npm install
npm run dev      # http://localhost:5174
npm run build    # type-check + production build to dist/
```

No account or backend is required — the trainer runs entirely in the browser.
Progress (`ict-replay-progress`, streaks, exam best, saved trades) is kept in
`localStorage`. If you're signed into Trading Lab in the same browser,
`src/lib/crossSync.ts` mirrors progress into the shared session so the suite
sites stay in sync; signed out, it's a no-op and everything stays local.

## Theming

Warm light is the default; dark is opt-in via `<html data-theme="dark">`. Both
themes are defined as token sets in `src/index.css` (`--rp-*`), and the dark
values are the app's original palette, so dark mode is pixel-identical to before
the tokens were introduced. The token contract is kept in sync across
trading-lab / ict-replay / ict-glossary.

## Source layout

- `src/App.tsx` — scenario browser, scoring flow, results
- `src/components/TradeMode.tsx` — bar-by-bar replay + position management
- `src/components/ExamMode.tsx` — timed 10-question exam
- `src/data/scenarios.ts` — the scored scenarios
- `src/lib/crossSync.ts` — cross-site progress sync (defensive; local-first)

Deployed to GitHub Pages on push to `main`.
