# 📝 MindNote

A fast, offline-first note-taking application built with Svelte 5 + Vite + TypeScript. Experience instant navigation without page reloads and seamless local storage.

## ✨ Features

- ⚡ **Lightning Fast**: Built on Svelte 5 with Vite for instant HMR
- 📱 **Offline Ready**: All notes stored locally in IndexedDB
- 🚀 **SPA Navigation**: Client-side routing with no page reloads
- 💾 **Auto-save**: Debounced auto-save (500ms) while you type
- 🔍 **Search**: Fast full-text search across all notes
- 🎨 **Dark Mode**: Clean, modern dark interface
- ☁️ **Google Drive Sync**: Backup and restore notes to/from Google Drive
- 🔐 **Secure Authentication**: OAuth 2.0 integration with Google

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Type check
pnpm check

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 📁 Project Structure

```
src/
├── lib/
│   ├── db.ts                  # IndexedDB + Dexie.js setup
│   ├── store.svelte.ts        # Global state management (Svelte 5 runes)
│   ├── router.ts              # Client-side routing
│   ├── googleDrive.ts         # Google Drive API integration
│   ├── Sidebar.svelte         # Note list with search
│   ├── Editor.svelte          # Note editor with auto-save
│   ├── Home.svelte            # Welcome screen
│   ├── Settings.svelte        # Settings panel
│   ├── GoogleDriveSync.svelte # Google Drive backup/restore UI
│   └── ...                    # Other components
├── App.svelte                 # Root component with routing
├── main.ts                    # App entry point
└── app.css                    # Global styles
```

## 🏗️ Architecture

- **Framework**: Svelte 5 (using new `$state` runes)
- **Build Tool**: Vite 7.x
- **Storage**: IndexedDB via Dexie.js
- **Routing**: svelte-routing (hash-based)
- **Language**: TypeScript with strict checking

## 🎯 Key Design Decisions

- **Why not SvelteKit?** For simpler architecture without built-in routing/SSR overhead
- **Client-side first**: All persistence and routing handled client-side
- **Performance focus**: Instant navigation + compile-time optimizations

## ☁️ Cloud Sync Integration

MindNote supports backing up and syncing your notes with cloud storage!

### Google Drive

1. Create a Google Cloud Project and enable Google Drive API
2. Create OAuth 2.0 credentials
3. Configure in `.env.local`

**Setup Guide**: [GOOGLE_DRIVE_SETUP.md](./GOOGLE_DRIVE_SETUP.md)

### Dropbox

1. Create a Dropbox App
2. Get your App Key
3. Configure in `.env.local`

**Setup Guide**: [DROPBOX_SETUP.md](./DROPBOX_SETUP.md)  
**Quick Start**: [DROPBOX_QUICK_START.md](./DROPBOX_QUICK_START.md)

### Usage

1. Open Settings in the app
2. Navigate to "Google Drive Sync" or "Dropbox Sync"
3. Sign in with your account
4. Backup or restore your notes

## 📖 Development

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode).

## Need an official Svelte framework?

Check out [SvelteKit](https://github.com/sveltejs/kit#readme), which is also powered by Vite. Deploy anywhere with its serverless-first approach and adapt to various platforms, with out of the box support for TypeScript, SCSS, and Less, and easily-added support for mdsvex, GraphQL, PostCSS, Tailwind CSS, and more.

## Technical considerations

**Why use this over SvelteKit?**

- It brings its own routing solution which might not be preferable for some users.
- It is first and foremost a framework that just happens to use Vite under the hood, not a Vite app.

This template contains as little as possible to get started with Vite + TypeScript + Svelte, while taking into account the developer experience with regards to HMR and intellisense. It demonstrates capabilities on par with the other `create-vite` templates and is a good starting point for beginners dipping their toes into a Vite + Svelte project.

Should you later need the extended capabilities and extensibility provided by SvelteKit, the template has been structured similarly to SvelteKit so that it is easy to migrate.

**Why `global.d.ts` instead of `compilerOptions.types` inside `jsconfig.json` or `tsconfig.json`?**

Setting `compilerOptions.types` shuts out all other types not explicitly listed in the configuration. Using triple-slash references keeps the default TypeScript setting of accepting type information from the entire workspace, while also adding `svelte` and `vite/client` type information.

**Why include `.vscode/extensions.json`?**

Other templates indirectly recommend extensions via the README, but this file allows VS Code to prompt the user to install the recommended extension upon opening the project.

**Why enable `allowJs` in the TS template?**

While `allowJs: false` would indeed prevent the use of `.js` files in the project, it does not prevent the use of JavaScript syntax in `.svelte` files. In addition, it would force `checkJs: false`, bringing the worst of both worlds: not being able to guarantee the entire codebase is TypeScript, and also having worse typechecking for the existing JavaScript. In addition, there are valid use cases in which a mixed codebase may be relevant.

**Why is HMR not preserving my local component state?**

HMR state preservation comes with a number of gotchas! It has been disabled by default in both `svelte-hmr` and `@sveltejs/vite-plugin-svelte` due to its often surprising behavior. You can read the details [here](https://github.com/rixo/svelte-hmr#svelte-hmr).

If you have state that's important to retain within a component, consider creating an external store which would not be replaced by HMR.

```ts
// store.ts
// An extremely simple external store
import { writable } from 'svelte/store'
export default writable(0)
```
