# MindNote - Feature Documentation

## ✨ Fitur-Fitur Baru yang Telah Ditambahkan

### 1. 💾 Auto-save dengan Debounce (500ms)
**Status:** ✅ Sudah Terimplementasi di Versi Awal

- **Lokasi:** `src/lib/store.svelte.ts` - method `updateNote()`
- **Cara Kerja:**
  - Local state diupdate **instant** untuk UI yang responsif
  - Perubahan di-debounce selama 500ms sebelum disimpan ke IndexedDB
  - Setiap keystroke mereset timer, save hanya terjadi setelah user berhenti mengetik
- **Manfaat:**
  - Mengurangi operasi write ke database
  - UI tetap terasa cepat dan responsive
  - Auto-save tanpa perlu tombol save manual

---

### 2. 🔍 Search Realtime
**Status:** ✅ Sudah Terimplementasi

- **Lokasi:** `src/lib/Sidebar.svelte` dan `src/lib/store.svelte.ts`
- **Cara Kerja:**
  - Input search di sidebar dengan event `oninput`
  - Memanggil `notesStore.search()` yang menggunakan IndexedDB filter
  - Hasil muncul instant tanpa delay
- **Optimisasi:**
  - IndexedDB indexes pada `title`, `createdAt`, `updatedAt`
  - Filter di-cache untuk query yang sama
- **Fitur:**
  - Search di title dan content
  - Case-insensitive search
  - Instant feedback saat mengetik

---

### 3. 🌓 Dark/Light Mode Toggle
**Status:** ✅ Baru Ditambahkan

#### Implementasi:
- **Store:** `UIStore` di `src/lib/store.svelte.ts`
  - Property `theme: 'dark' | 'light'`
  - Method `toggleTheme()` untuk switch mode
  - Method `loadTheme()` untuk load dari localStorage
  - Method `applyTheme()` untuk apply ke DOM

- **CSS Variables:** `src/app.css`
  ```css
  /* Dark Theme (Default) */
  [data-theme="dark"] {
    --bg-color: #1e1e1e;
    --text-color: #e0e0e0;
    --primary-color: #007acc;
    /* ... */
  }

  /* Light Theme */
  [data-theme="light"] {
    --bg-color: #ffffff;
    --text-color: #1e1e1e;
    --primary-color: #007acc;
    /* ... */
  }
  ```

- **Toggle Button:** Sidebar header
  - Icon: ☀️ (light mode) / 🌙 (dark mode)
  - Klik untuk toggle
  - Tersimpan otomatis ke localStorage

#### Cara Pakai:
1. Klik icon sun/moon di header sidebar
2. Theme berubah instant dengan smooth transition (0.3s)
3. Preferensi tersimpan dan akan di-load saat app dibuka kembali

---

### 4. 📌 Pin/Favorite Notes
**Status:** ✅ Baru Ditambahkan

#### Database Schema Update:
- **Field Baru:** `pinned: boolean` di `Note` interface
- **Migration:** Auto-upgrade dari version 1 ke version 2
- **Index:** `pinned` field diindex untuk query cepat

#### Fitur:
- **Pin Button:**
  - Di sidebar: 📌 (unpin) / 📍 (pinned)
  - Di editor header: tombol pin dengan highlight
- **Sorting:**
  - Pinned notes selalu di atas
  - Dalam kategori pinned/unpinned, sort by `updatedAt`
- **Visual:**
  - Pinned notes punya background khusus (`--pinned-bg`)
  - Pin icon 📌 di title note yang di-pin

#### Database Methods:
```typescript
// Toggle pin status
await noteService.togglePin(noteId)

// Get only pinned notes
await noteService.getPinnedNotes()
```

---

### 5. 📤📥 Export/Import JSON
**Status:** ✅ Baru Ditambahkan

#### Export:
- **Lokasi:** Toolbar di sidebar (📤 Export button)
- **Format:**
  ```json
  {
    "version": 1,
    "exportDate": "2025-10-02T...",
    "notes": [
      {
        "id": 1,
        "title": "Note Title",
        "content": "Note content...",
        "createdAt": 1234567890,
        "updatedAt": 1234567890,
        "pinned": false
      }
    ]
  }
  ```
- **File Name:** `mindnote-backup-YYYY-MM-DD.json`
- **Implementation:** `notesStore.exportNotes()` → auto-download file

#### Import:
- **Lokasi:** Toolbar di sidebar (📥 Import button)
- **Input:** JSON file upload
- **Validation:** Parse JSON dan validasi format
- **Merge:** Menambahkan notes tanpa menghapus yang existing (id baru di-generate)
- **Feedback:** Alert dengan jumlah notes yang berhasil diimport
- **Error Handling:** Alert jika format JSON invalid

#### Use Cases:
- **Backup:** Export semua notes sebelum clear browser data
- **Restore:** Import dari backup file
- **Migration:** Pindah data antar device
- **Sharing:** Share notes dengan user lain

---

### 6. ⚡ Optimisasi Performa

#### a) Indexed Search
**Status:** ✅ Implemented

- **Dexie Indexes:** `title`, `createdAt`, `updatedAt`, `pinned`
- **Benefit:** Query cepat untuk filtering dan sorting
- **Where Clause:** `db.notes.where('pinned').equals(1)` → O(log n) dengan index

#### b) Delta Save (Partial Updates)
**Status:** ✅ Implemented via Debounce

- **Mechanism:** 
  - Hanya field yang berubah di-save (`Partial<Note>`)
  - Dexie's `update()` method hanya update field yang diberikan
- **Benefit:** Reduce write operations, faster updates

#### c) Auto-resize Textarea (Mobile)
**Status:** ✅ Implemented

- **Location:** `Editor.svelte` → `autoResizeTextarea()`
- **Trigger:** Setiap `oninput` event di textarea
- **Mobile Only:** Hanya aktif jika `uiStore.isMobile === true`
- **Benefit:** Textarea expand sesuai content, no scrolling needed

---

## 🚀 Fitur Tambahan yang Sudah Ada

### Responsive Design
- **Desktop (>1024px):** Sidebar statis 280px
- **Tablet (600-1024px):** Sidebar collapsible dengan overlay
- **Mobile (<600px):** Sidebar drawer dengan backdrop

### Touch Gestures
- **Swipe from left edge:** Buka sidebar
- **Swipe left di sidebar:** Tutup sidebar
- **FAB (+):** Floating button untuk create note (mobile only)

### Keyboard Shortcuts
- **Ctrl+B / Cmd+B:** Toggle sidebar

### CRUD Operations
- ✅ **Create:** Multiple entry points (FAB, New button, home page)
- ✅ **Read:** Real-time dari IndexedDB
- ✅ **Update:** Auto-save dengan debounce
- ✅ **Delete:** Konfirmasi dialog, hapus dari DB dan UI

---

## 🔧 Technical Stack

| Component | Technology |
|-----------|-----------|
| Framework | Svelte 5 (with runes) |
| Build Tool | Vite 7 |
| Language | TypeScript (strict mode) |
| Database | IndexedDB via Dexie.js |
| Styling | Tailwind CSS + CSS Variables |
| Router | Custom hash-based router |
| State | Svelte 5 `$state` runes |

---

## 📊 Performance Metrics

### Optimizations Applied:
1. ✅ Debounced saves (500ms)
2. ✅ Indexed database queries
3. ✅ Partial updates (delta save)
4. ✅ CSS transitions with GPU acceleration
5. ✅ Lazy state updates (local first, DB async)
6. ✅ Efficient re-renders (Svelte's fine-grained reactivity)

### New Features Implemented:
- ✅ **Virtualized List:** Auto-enabled for >50 notes
- ✅ **Markdown Preview:** Toggle preview mode with 👁️ button
- ✅ **Cross-note Linking:** `[[note-title]]` syntax with backlinks
- ✅ **Backlinks Display:** See which notes link to current note

### Future Optimizations (Not Yet Implemented):
- ⏳ **Lazy Loading:** Dynamic import for Editor component
- ⏳ **Service Worker:** Offline caching & PWA support
- ⏳ **Web Workers:** Background DB operations
- ⏳ **Graph View:** Visual network of note connections

---

## 🧪 Testing

### Manual Testing Checklist:
- [x] Create note
- [x] Edit note (title & content)
- [x] Delete note
- [x] Pin/unpin note
- [x] Search notes
- [x] Toggle theme (dark/light)
- [x] Export notes to JSON
- [x] Import notes from JSON
- [x] Responsive layout (desktop/tablet/mobile)
- [x] Touch gestures (swipe)
- [x] Keyboard shortcuts (Ctrl+B)
- [x] Auto-save (wait 500ms after typing)

### Browser Compatibility:
- ✅ Chrome/Edge (tested)
- ✅ Firefox (IndexedDB supported)
- ✅ Safari (IndexedDB supported)
- ⚠️ Mobile browsers (touch gestures may vary)

---

## 📝 API Reference

### NotesStore Methods:
```typescript
class NotesStore {
  // Data
  notes: Note[]
  currentNote: Note | null
  isLoading: boolean
  searchQuery: string

  // Methods
  async loadNotes()
  async loadNote(id: number)
  async createNote(title: string, content?: string)
  async updateNote(id: number, updates: Partial<Note>)
  async deleteNote(id: number)
  async search(query: string)
  async togglePin(id: number)
  async exportNotes()
  async importNotes(file: File)
  clearCurrentNote()
}
```

### UIStore Methods:
```typescript
class UIStore {
  // Data
  sidebarOpen: boolean
  isMobile: boolean
  theme: 'dark' | 'light'

  // Methods
  toggleSidebar()
  closeSidebar()
  openSidebar()
  setMobile(mobile: boolean)
  toggleTheme()
  applyTheme()
  loadTheme()
}
```

---

## 🎨 Theme Customization

Edit CSS variables di `src/app.css`:

```css
[data-theme="dark"] {
  --bg-color: #1e1e1e;          /* Background utama */
  --card-bg: #252525;            /* Card/note item background */
  --hover-bg: #2d2d2d;           /* Hover state */
  --text-color: #e0e0e0;         /* Text utama */
  --text-secondary: #888;        /* Text secondary/muted */
  --border-color: #333;          /* Border */
  --primary-color: #007acc;      /* Accent color */
  --primary-hover: #005a9e;      /* Accent hover */
  --pinned-bg: #2a2a3e;          /* Background note yang di-pin */
}
```

---

## 🐛 Known Issues & Limitations

1. **Virtualized List:** Belum diimplementasi (performance issue jika >1000 notes)
2. **Service Worker:** Belum ada offline caching
3. **Collaborative Editing:** Tidak support (local only)
4. **Attachments:** Tidak support file upload
5. **Rich Text:** Plain text only (no markdown rendering)

---

## 🔮 Future Roadmap

### Phase 1: Performance (Priority)
- [ ] Implement virtualized list for large datasets
- [ ] Add lazy loading for Editor component
- [ ] Service Worker for PWA support

### Phase 2: Features
- [ ] Markdown support with preview
- [ ] Tags/categories system
- [ ] Note templates
- [ ] Trash/Archive functionality

### Phase 3: Collaboration
- [ ] Cloud sync (optional)
- [ ] End-to-end encryption
- [ ] Version history
- [ ] Conflict resolution

---

## 📚 Documentation

- **Project Setup:** See `README.md`
- **Architecture:** See `.github/copilot-instructions.md`
- **API Docs:** See `ide.md`

---

**Last Updated:** October 2, 2025
**Version:** 2.0.0 (with new features)
