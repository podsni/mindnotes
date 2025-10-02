# MindNote Copilot Instructions

## Project Overview
MindNote is a fast, offline-first notes application built as a Single Page Application (SPA). The architecture prioritizes instant navigation without page reloads and client-side data persistence. This is a **Svelte 5 + Vite + TypeScript** project, currently in early development from the default Vite template.

## Architecture Vision (from ide.md)
- **SPA Pattern**: All navigation happens client-side without page reloads
- **Planned Storage**: IndexedDB via Dexie.js for offline-capable, scalable local storage
- **Client-side Routing**: Will use lightweight routing (e.g., `svelte-routing`) to maintain URL state
- **State Management**: In-memory state with IndexedDB persistence layer
- **PWA Target**: Intended to be installable as a progressive web app

## Technology Stack
- **Framework**: Svelte 5 (using new `$state` runes, not legacy stores)
- **Build Tool**: Vite 7.x with HMR
- **Language**: TypeScript with strict checking enabled (`checkJs: true`)
- **Package Manager**: pnpm (note the `pnpm-lock.yaml`)
- **Styling**: Tailwind CSS v3 + scoped CSS in `.svelte` components
- **Database**: IndexedDB via Dexie.js
- **Routing**: Custom hash-based router (lightweight, no dependencies)

## Svelte 5 Specific Patterns
This project uses **Svelte 5 runes** (not Svelte 3/4 stores):
- Use `$state()` for reactive state - **MUST be in `.svelte` or `.svelte.ts` files**
- Component mounting uses `mount()` from `svelte` (see `main.ts`)
- Event handlers use `onclick={handler}` syntax, not `on:click`
- For shared state with runes, use `.svelte.ts` extension (see `store.svelte.ts`)

Example from existing code:
```typescript
// In .svelte or .svelte.ts files only
let count: number = $state(0)
const increment = () => { count += 1 }
```

⚠️ **Critical**: `$state`, `$derived`, `$effect` runes ONLY work in `.svelte` or `.svelte.ts` files. Regular `.ts` files will throw `rune_outside_svelte` error.

## Development Workflow
- **Start dev server**: `pnpm dev` (not `npm run dev`)
- **Type checking**: `pnpm check` runs `svelte-check` + TypeScript compiler
- **Build**: `pnpm build` (outputs to `dist/`)
- **Preview build**: `pnpm preview`

## File Structure Conventions
- `src/lib/` - Reusable Svelte components (e.g., `Counter.svelte`)
- `src/App.svelte` - Root application component
- `src/main.ts` - Entry point that mounts the app to `#app` div
- `public/` - Static assets served as-is
- Component files use `<script lang="ts">` for TypeScript support

## TypeScript Configuration
- Uses project references: `tsconfig.app.json` (app code) and `tsconfig.node.json` (build config)
- `allowJs: true` and `checkJs: true` - JS files are allowed but type-checked
- Target: ES2022 with ESNext modules
- Types: `svelte` and `vite/client` are globally available

## Key Design Decisions
1. **Why not SvelteKit?** Deliberately chose vanilla Svelte + Vite for simpler architecture without built-in routing/SSR overhead
2. **Client-side first**: All data persistence and routing will be client-side (IndexedDB, no backend planned)
3. **Performance focus**: Vite's instant HMR + Svelte's compile-time optimizations for native-like speed

## Current Implementation

### Data Layer (`src/lib/db.ts`)
- IndexedDB via Dexie.js for persistent storage
- `Note` interface: `{ id, title, content, createdAt, updatedAt }`
- `noteService` exports CRUD operations (getAllNotes, getNote, createNote, updateNote, deleteNote, searchNotes)
- Requests persistent storage via `navigator.storage.persist()`

### State Management (`src/lib/store.ts`)
- `NotesStore` class uses Svelte 5 runes (`$state`)
- Manages in-memory state synced with IndexedDB
- **Debounced autosave**: 500ms delay after typing stops before persisting to DB
- Local state updates immediately for instant UI response

### Routing (`src/lib/router.ts`)
- Custom lightweight hash-based router using Svelte stores
- Routes: `/` (home), `/note/:id` (editor)
- Navigation via `router.navigate(path)` or direct hash links `<a href="#/path">`
- Parses URL params automatically (e.g., `/note/:id` extracts `id`)
- Navigation happens instantly without page reloads

### Components
- **`Sidebar.svelte`**: Note list with search, sorted by `updatedAt` descending
- **`Editor.svelte`**: Title/content editor with word count, auto-saves via store
- **`Home.svelte`**: Welcome screen for empty state
- **`App.svelte`**: Root component with Router setup, loads notes on mount

### Key Patterns
1. **Reactive State**: Use `$state()` for component-local state, store for global state
2. **Effect Hook**: `$effect(() => { ... })` runs when dependencies change (see Editor.svelte)
3. **Props**: Destructure with `let { id }: Props = $props()` (Svelte 5 syntax)
4. **Debouncing**: Editor updates local state immediately, debounces IndexedDB writes
5. **Event Handlers**: Use `onclick={handler}` not `on:click={handler}`

## When Adding Features
- Install packages with `pnpm add <package>` (not npm/yarn)
- New components go in `src/lib/`
- Use Svelte 5 runes (`$state`, `$derived`, `$effect`) for reactivity
- Add new DB operations to `noteService` in `db.ts`
- Update `NotesStore` in `store.ts` for state management
- Components should read from store, call store methods to update
- Prefer scoped styles in `.svelte` files over global CSS
