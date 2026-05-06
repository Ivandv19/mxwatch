# mxwatch — AGENTS.md

Frontend dashboard de inteligencia geoespacial. Next.js 16 (App Router) + React 19 + TypeScript 6 + Tailwind CSS v4 + Zustand 5 + Biome 2.4.

## Comandos

- `bun run dev` — servidor de desarrollo
- `bun run build` — build producción
- `bun run lint` — Biome check + write (lint + format)
- `bun run check` — Biome check (solo validación)

## Convenciones

- Nombres de archivo: `PascalCase.tsx` para componentes, `kebab-case` para páginas/config, `camelCase` para stores/actions/tipos
- Imports absolutos con `@/` (mapea a `src/`)
- `"use client"` en componentes interactivos; `"use server"` en actions
- `import type { ... }` para imports tipo-solo
- JSDoc en español describiendo cada función/componente al inicio del archivo
- Tailwind utility classes, NO CSS modules ni archivos de estilo separados (solo `globals.css`)
- `React.memo`, `useMemo`, `useCallback` para optimización en componentes de mapa
- `displayName` en componentes memoizados
- Texto UI en español
- Estado global vía Zustand con selectores exportados como hooks individuales
- Estado sincronizado con URL search params

## API

- Toda llamada a backend pasa por Server Actions en `src/actions/mapData.ts`
- Cliente Hono RPC tipo-seguro compartido con `mxwatch-api`
- Edge runtime en página `/mapa` (`export const runtime = "edge"`)
