# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kids Math Games (EasyMath) - A Next.js educational web application providing interactive math games for children ages 5-12. The site is deployed at kids-math.com.

## Development Commands

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint
npm run start        # Start production server
```

**Utility scripts:**
```bash
npm run generate-screenshots  # Generate game preview images (uses Puppeteer)
npm run test-images          # Test image display
```

## Architecture

### Tech Stack
- Next.js 15 with App Router and Turbopack
- React 19
- TypeScript (strict mode)
- Tailwind CSS v4
- next-intl for i18n (English and Chinese)
- Framer Motion for animations

### Route Structure

**Main pages (no locale prefix):**
- `/` - Homepage with all games listing
- `/addition`, `/subtraction`, `/multiplication`, `/division` - Math operation practice pages
- `/number-sense/*` - Number sense games:
  - `/games/counting`, `/games/matching`, `/games/sequence`
  - `/patterns/odd-even`, `/patterns/skipcountinggame`
  - `/basics/comparison`, `/basics/estimation`, `/basics/visualization`

**Localized pages:** `/[locale]/page.tsx` - Supported locales: `en`, `zh` (defined in `i18n.ts`)

### Key Patterns

**Client Components:** Most game pages use `"use client"` directive for interactive features.

**Hydration Safety:** Game pages use deterministic initial state generation (e.g., `generateInitialProblems`) for SSR, then switch to random generation on client-side interactions to avoid hydration mismatches.

**SEO/Metadata:** Pages define a `pageMetadata` object and inject schema.org JSON-LD directly. The `components/Metadata.tsx` component provides reusable SEO tags.

**Analytics:** Game pages include Google Analytics via Next.js `Script` component with `strategy="afterInteractive"`.

**UI Components:** Located in `components/ui/` - Button, Card, Input using Radix UI primitives with class-variance-authority for variants.

**Styling Utility:** `lib/utils.ts` exports `cn()` function combining clsx and tailwind-merge.

### Path Aliases
- `@/*` maps to project root (e.g., `@/components/ui/button`)

## Conventions

- 使用中文回答用户问题
- Game pages include educational content sections with SEO text below the interactive game
- Translation keys are in `messages/en.json` and `messages/zh.json`
