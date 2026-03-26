# CLAUDE.md

## Project Overview

**InvoiceFlow** (`auto-invoicer`) — A next-generation invoice management platform for freelancers, micro-businesses, and accountants. AI-powered OCR extraction, multi-country compliance, and one-click PDF generation. Currently in early development with a themed invoice form UI.

## Tech Stack

- **Language**: TypeScript 5
- **Framework**: Next.js 16.0.6 (App Router)
- **Runtime**: React 19.2.0
- **Styling**: Tailwind CSS v4 (PostCSS plugin, `@import "tailwindcss"` syntax)
- **Fonts**: Geist, Geist Mono, Caveat (via `next/font/google`)
- **Linting**: ESLint 9 flat config (next core-web-vitals + typescript)
- **Planned integrations**: Supabase (DB/Auth/Storage), Groq AI (OCR/LLM), React-PDF, RevenueCat (payments)

## Common Commands

### Development
```bash
npm run dev      # Start Next.js dev server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint check
```

### Setup
```bash
npm install      # Install dependencies (node_modules not committed)
```

## Architecture Overview

```
src/
  app/
    page.tsx        — Main invoice form (single-file, client component with theme system)
    layout.tsx      — Root layout (Geist + Caveat fonts, metadata)
    globals.css     — Tailwind import + CSS custom properties (light/dark)
    favicon.ico
public/             — Static SVG assets (file, globe, next, vercel, window)
requirements/
  solution.md       — Full solution design document (architecture, DB schema, i18n, etc.)
```

## Code Conventions

### Naming
- Components: PascalCase (`InvoiceForm`, `ThemeSwitcher`)
- Files: kebab-case for configs, PascalCase not yet established for component files
- Variables: camelCase
- Theme tokens: camelCase properties in TypeScript interfaces

### Patterns
- **Theming**: Token-based theme system using React Context (`ThemeContext`) with Tailwind class strings as values
- **Styling**: Tailwind CSS utility classes, dynamic class composition via template literals
- **State**: React `useState` + Context (no external state library yet)
- **Imports**: Absolute imports via `@/*` path alias (maps to `./src/*`)

### Current Themes
- `minimal-mono` — Ultra-minimal monochrome, font-mono, no shadows
- `paper-perfect` — Warm paper aesthetic, Caveat handwriting font, rounded cards with shadows

## Important Conventions

- Tailwind v4 uses `@import "tailwindcss"` (not `@tailwind` directives)
- Tailwind v4 uses `@theme inline {}` for custom theme tokens in CSS
- ESLint uses flat config format (`eslint.config.mjs`)
- Path alias `@/*` → `./src/*` configured in `tsconfig.json`
- Dark mode via `prefers-color-scheme` media query in CSS custom properties

## Do NOT

- Do not commit `.env*` files (gitignored)
- Do not commit `node_modules/` or `.next/`
- Do not modify `next-env.d.ts` (auto-generated)
- Do not use Tailwind v3 syntax (`@tailwind base`, `theme()` function, etc.)
