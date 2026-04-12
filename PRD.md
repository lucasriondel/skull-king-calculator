# Migration Plan: Next.js 15 to Vite + TanStack Router

## Context

The Skull King Score Tracker is a **fully client-side** Next.js 15 app with no API routes, no SSR, and no server components — all pages use `"use client"`. Next.js is overkill here. The migration to Vite + TanStack Router will reduce bundle size, simplify the build, and give full control over routing. The only Next.js-specific features in use are: routing (App Router), i18n (next-intl), font loading (next/font), image component (next/image, already unoptimized), theming (next-themes, which works outside Next.js), and Vercel Analytics.

## Dependency Changes

**Remove:** `next`, `next-intl`, `@vercel/analytics` (or swap to `@vercel/analytics/react`)
**Add:** `vite`, `@vitejs/plugin-react`, `@tanstack/react-router`, `@tanstack/router-devtools`, `@tanstack/router-plugin`, `i18next`, `react-i18next`, `i18next-browser-languagedetector`
**Keep:** all Radix/shadcn, Zustand, dnd-kit, next-themes, Tailwind, recharts, lucide-react, etc.

## New File Structure

```
skull-king-calculator/
  index.html                          # NEW — entry HTML with Inter font CDN link
  vite.config.ts                      # NEW — Vite + TanStack Router plugin + @/ alias
  tsconfig.json                       # MODIFY — jsx: react-jsx, remove next plugin
  tailwind.config.ts                  # MODIFY — update content paths
  postcss.config.mjs                  # KEEP as-is
  public/                             # KEEP as-is
  messages/
    en.json                           # MODIFY — {var} -> {{var}} for i18next
    fr.json                           # MODIFY — same
  src/
    main.tsx                          # NEW — app entry, i18n init, router mount
    globals.css                       # MOVE from app/globals.css
    i18n/
      index.ts                        # NEW — i18next config with translations
      locales.ts                      # NEW — supported locales constant
    routes/
      __root.tsx                      # NEW — ThemeProvider + Outlet
      index.tsx                       # NEW — locale detect + redirect
      $locale/
        route.tsx                     # NEW — locale validation layout
        index.tsx                     # NEW — redirect to game-modes
        game-modes.tsx                # MIGRATE from app/[locale]/game-modes/page.tsx
        players.tsx                   # MIGRATE from app/[locale]/players/page.tsx
        game.tsx                      # MIGRATE from app/[locale]/game/page.tsx
  components/
    language-switcher.tsx             # REWRITE — TanStack Router + i18next
    theme-provider.tsx                # MINOR — remove "use client"
    ui/                               # KEEP — all shadcn components unchanged
    game/                             # MODIFY — swap useTranslations -> useTranslation
  lib/                                # KEEP — store.ts, game-utils.ts, utils.ts (remove "use client")
  hooks/                              # KEEP — use-mobile.ts, use-toast.ts (remove "use client")
```

## Phase 1: Scaffold Vite project

### 1.1 Create `vite.config.ts`
- React plugin + TanStack Router Vite plugin for file-based routing
- `@/` path alias resolving to project root

### 1.2 Create `index.html`
- `<link>` to Google Fonts CDN for Inter
- `<div id="root">` mount point
- `<script type="module" src="/src/main.tsx">`
- Title and meta from current `app/layout.tsx`

### 1.3 Update `tsconfig.json`
- `"jsx": "react-jsx"` (was `"preserve"`)
- Remove `next` plugin from `compilerOptions.plugins`
- Remove `next-env.d.ts` and `.next/types/**` from include
- Add `"src"` to include
- Keep `@/*` path alias

### 1.4 Update `package.json`
- Update scripts: `"dev": "vite"`, `"build": "tsc -b && vite build"`, `"preview": "vite preview"`
- Add/remove deps as listed above

### 1.5 Update `tailwind.config.ts`
- Content paths: `"./index.html"`, `"./src/**/*.{ts,tsx}"`, `"./components/**/*.{ts,tsx}"`
- Remove `"./pages/**"`, `"./app/**"`

### 1.6 Move CSS
- Copy `app/globals.css` to `src/globals.css` (the two existing copies are identical)

## Phase 2: Set up i18n with i18next

### 2.1 Create `src/i18n/locales.ts`
- Export `supportedLocales = ['en', 'fr'] as const`, `defaultLocale = 'en'`

### 2.2 Create `src/i18n/index.ts`
- Init i18next with react-i18next
- Import translations from `messages/en.json` and `messages/fr.json`
- Configure `i18next-browser-languagedetector` for initial locale detection

### 2.3 Update translation files
- `messages/en.json` and `messages/fr.json`: replace `{var}` with `{{var}}`
- Affected keys in both files:
  - `PlayersPage.modeInfo`: `{mode}` -> `{{mode}}`, `{rounds}` -> `{{rounds}}`
  - `PlayersPage.playersHeader`: `{count}` -> `{{count}}`
  - `PlayersPage.defaultPlayerName`: `{number}` -> `{{number}}`

## Phase 3: Create TanStack Router routes

### 3.1 Create `src/main.tsx`
- Import `src/globals.css` and `src/i18n`
- Create router from generated route tree
- Render `<RouterProvider>`

### 3.2 Create `src/routes/__root.tsx`
- Wrap `<Outlet>` in `<ThemeProvider>` (from `components/theme-provider.tsx`)
- Include `<Analytics />` if keeping Vercel Analytics

### 3.3 Create `src/routes/index.tsx`
- `beforeLoad`: detect browser locale via `navigator.language`, redirect to `/$locale/game-modes`

### 3.4 Create `src/routes/$locale/route.tsx`
- `beforeLoad`: validate `$locale` param against supported locales, redirect to `/en/game-modes` if invalid, call `i18n.changeLanguage(locale)`
- Component: render `<Outlet />`

### 3.5 Create `src/routes/$locale/index.tsx`
- Redirect to `/$locale/game-modes`

### 3.6-3.8 Migrate page components into route files
- `game-modes.tsx`, `players.tsx`, `game.tsx`
- Each page: move the component body into the route's `component` export

## Phase 4: Update imports across all components

### 4.1 Replace `useTranslations` with `useTranslation` (9 files)

| File | Before | After |
|------|--------|-------|
| Route: game-modes | `useTranslations("GameModesPage")` | `useTranslation('translation', { keyPrefix: 'GameModesPage' })` |
| Route: players | `useTranslations("PlayersPage")` | `useTranslation('translation', { keyPrefix: 'PlayersPage' })` |
| Route: game | `useTranslations("GamePage")` | `useTranslation('translation', { keyPrefix: 'GamePage' })` |
| `components/game/GameHeader.tsx` | `useTranslations("GamePage")` | same pattern |
| `components/game/GameComplete.tsx` | `useTranslations("GamePage")` | same pattern |
| `components/game/ScoresTab.tsx` | `useTranslations("GamePage")` | same pattern |
| `components/game/DetailsTab.tsx` | `useTranslations("GamePage.DetailsTab")` | `keyPrefix: 'GamePage.DetailsTab'` |
| `components/game/PlayerCard.tsx` | `useTranslations("GamePage")` | same pattern |

Also replace `t.raw(...)` with `t(..., { returnObjects: true })` in game-modes page.

### 4.2 Replace routing imports
- `useRouter` from `@/src/i18n/navigation` -> `useNavigate` + `useParams` from `@tanstack/react-router`
- `router.push("/players")` -> `navigate({ to: '/$locale/players', params: { locale } })`
- `Image` from `next/image` -> plain `<img>` tag

### 4.3 Rewrite `components/language-switcher.tsx`
- Use `useTranslation()` for `i18n.language`
- Use `useNavigate()`, `useParams()`, and `useRouterState()` from TanStack Router
- `handleChangeLocale`: navigate to same path with new locale param

### 4.4 Remove `"use client"` directives
- ~15 files: all game components, theme-provider, store, hooks, etc.
- Harmless but should be removed for cleanliness

## Phase 5: Clean up Next.js artifacts

**Delete:**
- `app/` (entire directory)
- `src/middleware.ts`
- `src/i18n/routing.ts`
- `src/i18n/navigation.ts`
- `src/i18n/request.ts`
- `next.config.mjs`
- `next-env.d.ts`
- `styles/globals.css` (consolidated into `src/globals.css`)

## Phase 6: Install deps and verify

1. `rm -rf node_modules package-lock.json pnpm-lock.yaml .next`
2. `npm install`
3. `npm run dev` — verify TanStack Router generates `routeTree.gen.ts`
4. Test all routes: `/`, `/en/game-modes`, `/fr/game-modes`, `/en/players`, `/en/game`
5. Test locale switching via language switcher
6. Test theme toggle (light/dark)
7. Test full game flow: select mode -> add players -> play rounds -> game complete
8. Test edge cases: direct URL navigation, invalid locale redirect, page refresh mid-game

## Key Risks

- **TanStack Router `$locale` param**: ensure `beforeLoad` fires on every navigation to keep i18next language in sync
- **Translation key compatibility**: i18next `t()` with `keyPrefix` should match next-intl behavior, but test interpolated strings carefully
- **next-themes**: works outside Next.js but test that theme persistence (localStorage) and system preference detection still work
- **shadcn/ui components.json**: has `rsc: true` — update to `rsc: false` since there's no RSC in Vite
