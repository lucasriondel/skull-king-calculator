# Skull King Score Tracker

Score tracker for the [Skull King](https://en.wikipedia.org/wiki/Skull_King) card game. Client-side only, installable as a PWA, works offline.

**Live:** https://pirates.gousse.cool

## Features

- 7 game modes: Classic, No Odd Rounds, Ready to Fight, Flash Attack, Dam Shooting, Whirlwind, Bed Time
- Bid/trick entry per round with automatic scoring, including the expansion bonus cards
- Score, bonus, bid win/loss and zero-bid charts
- End-of-game podium
- English and French (`/en`, `/fr`), auto-detected from the browser
- Light and dark themes
- Player names and theme preference remembered between sessions

## Stack

Vite · React 19 · TypeScript · TanStack Router · Zustand · Tailwind CSS · shadcn/ui · Recharts · i18next

## Getting started

Requires [Bun](https://bun.sh).

```bash
bun install
bun run dev:app   # http://localhost:5140
```

## Scripts

| Script | Description |
| --- | --- |
| `bun run dev:app` | Start the Vite dev server |
| `bun run dev` | Start via portless at `skull-king-calculator.localhost` |
| `bun run build` | Typecheck and build to `dist/` |
| `bun run preview` | Serve the production build |
| `bun run typecheck` | Run `tsc --noEmit` |
| `bun test` | Run the test suite |

## Project structure

```
src/routes/       TanStack Router file-based routes ($locale/…)
src/i18n/         i18next setup and supported locales
components/game/  Game screens, cards and charts
components/ui/    shadcn/ui primitives
lib/              Store, scoring and helpers
hooks/            Shared React hooks
messages/         en.json / fr.json translations
```

## Deployment

Built as a static site and served by nginx (see `Dockerfile` and `nginx.conf`), deployed to https://pirates.gousse.cool via [Dokploy](https://dokploy.com/).

```bash
docker build -t skull-king .
docker run -p 3000:3000 skull-king
```
