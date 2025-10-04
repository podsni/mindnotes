# 🎨 TYPORA-INSPIRED FEATURES

## Implementasi Tanggal: 4 Oktober 2025

Dokumen ini menjelaskan implementasi fitur-fitur yang terinspirasi dari Typora untuk MindNote.

---

## 🖼️ Images

### ✅ Fitur yang Diimplementasikan

#### 1. **Drag & Drop Images**
- Seret file gambar ke editor dan otomatis akan di-embed sebagai Base64
- Mendukung format: JPG, PNG, GIF, WebP, SVG, BMP, ICO
- File non-gambar akan menjadi link attachment dengan emoji 📎

#### 2. **Paste from Clipboard**
- `Ctrl+V` untuk paste gambar langsung dari clipboard
- Gambar otomatis di-convert ke Base64
- Paste URL gambar juga otomatis di-convert

#### 3. **URL Auto-conversion**
- Ketik URL gambar dan paste → otomatis fetch & convert ke Base64
- Mendukung URL external images
- Fallback ke URL asli jika fetch gagal

#### 4. **Base64 Storage**
- Default menggunakan Base64 untuk offline-first approach
- Gambar tersimpan langsung dalam markdown (tidak perlu folder terpisah)
- Cocok untuk IndexedDB storage

### 📁 File Struktur
```
src/lib/
├── ImageHandler.svelte.ts  ← Image utilities
├── Editor.svelte           ← Updated dengan paste handler
```

### 🔧 API yang Digunakan
```typescript
// Handle paste
handleImagePaste(e: ClipboardEvent): Promise<string | null>

// Handle drag & drop
handleImageDrop(files: FileList): Promise<string[]>

// Convert URL to Base64
urlToBase64(url: string): Promise<string>

// Convert File to Base64
fileToBase64(file: File): Promise<string>
```

### 🎯 Cara Pakai
1. **Drag & Drop**: Seret gambar dari file explorer
2. **Paste**: `Ctrl+V` setelah copy gambar dari browser/screenshot tool
3. **URL**: Toolbar → 🖼️ → masukkan URL → auto-convert

---

## 🧭 Headers & Outline (TOC)

### ✅ Fitur yang Diimplementasikan

#### 1. **Outline View**
- Sidebar TOC yang menampilkan semua heading (H1-H6)
- Auto-update saat mengetik header baru
- Indent otomatis sesuai level heading
- Emoji indicator untuk setiap level (📄 H1, 📌 H2, • H3, ◦ H4+)

#### 2. **Click to Navigate**
- Klik header di outline → auto-scroll ke line tersebut di editor
- Smooth navigation antara editor dan outline

#### 3. **Toggle Visibility**
- Button 📋 di toolbar untuk show/hide outline
- Outline bisa muncul di:
  - Split view: outline di pane kanan
  - Edit mode: outline di sidebar kanan

### 📁 File Struktur
```
src/lib/
├── OutlineView.svelte      ← Komponen TOC
├── Editor.svelte           ← Integrasi outline
```

### 🎯 Cara Pakai
1. Ketik heading dengan syntax `# Heading`, `## H2`, dll
2. Klik tombol 📋 untuk toggle outline view
3. Klik item di outline untuk jump ke header

---

## 📝 Lists & Indentation

### ✅ Fitur yang Diimplementasikan

#### 1. **Tab/Shift+Tab untuk Indent**
- `Tab` → indent list item (tambah 2 spasi)
- `Shift+Tab` → unindent list item (kurangi 2 spasi)
- Bekerja untuk bullet list, numbered list, dan task list

#### 2. **Auto List Creation**
- Toolbar button untuk:
  - ☰ Unordered list (`- item`)
  - 1. Ordered list (`1. item`)
  - ☑ Task list (`- [ ] task`)

#### 3. **Task List Rendering**
- Checkbox interaktif di preview mode
- ✅ Checked items dengan strikethrough
- Syntax: `- [ ]` unchecked, `- [x]` checked

### 📁 File Struktur
```
src/lib/
├── editorCommands.ts       ← Tab handler & list commands
├── markdown.ts             ← Task list renderer
├── MarkdownPreview.svelte  ← Task list styling
```

### 🎯 Cara Pakai
1. **Manual**: Ketik `- item` untuk bullet, `1. item` untuk numbered
2. **Toolbar**: Klik ☰ atau 1. atau ☑ untuk insert list
3. **Indent**: Tekan `Tab` untuk indent, `Shift+Tab` untuk unindent
4. **Task**: Klik ☑ di toolbar → ketik task → `[x]` untuk mark done

---

## 📊 Tables

### ✅ Fitur yang Diimplementasikan

#### 1. **Insert Table dari Toolbar**
- Button ⊞ untuk insert table 3x3 default
- Auto-generate markdown table syntax

#### 2. **Table Rendering**
- Markdown-it rendering dengan border styling
- Alternating row colors untuk readability
- Header row dengan bold background

### Contoh Table Syntax
```markdown
| Header 1 | Header 2 | Header 3 |
| --- | --- | --- |
| Cell 1 | Cell 2 | Cell 3 |
| Cell 4 | Cell 5 | Cell 6 |
```

### 📁 File Struktur
```
src/lib/
├── editorCommands.ts       ← insertTable()
├── EditorToolbar.svelte    ← Table button
```

### 🎯 Cara Pakai
1. Klik button ⊞ di toolbar
2. Table 3x3 akan di-insert di cursor position
3. Edit cell content langsung

---

## ✨ Inline Styles & Shortcuts

### ✅ Fitur yang Diimplementasikan

#### 1. **Keyboard Shortcuts**
| Shortcut | Action | Markdown |
|----------|--------|----------|
| `Ctrl+B` | Bold | `**text**` |
| `Ctrl+I` | Italic | `*text*` |
| `Ctrl+Shift+X` | Strikethrough | `~~text~~` |
| `Ctrl+` ` | Inline code | `` `code` `` |
| `Ctrl+K` | Insert link | `[text](url)` |
| `Tab` | Indent list | - |
| `Shift+Tab` | Unindent list | - |

#### 2. **Toolbar Buttons**
- **B** → Bold
- **I** → Italic
- **S** → Strikethrough
- **<>** → Inline code
- 🔗 → Link
- 🖼️ → Image
- H▾ → Heading menu (H1-H6)
- ☰ → Bullet list
- 1. → Numbered list
- ☑ → Task list
- ⊞ → Table

#### 3. **Toggle Behavior**
- Shortcuts toggle format on/off
- Jika text sudah formatted, shortcut akan remove format
- Jika text belum formatted, shortcut akan add format

### 📁 File Struktur
```
src/lib/
├── EditorToolbar.svelte    ← Toolbar UI
├── editorCommands.ts       ← Command functions
├── Editor.svelte           ← Keyboard handler
```

### 🎯 Cara Pakai
1. **Toolbar**: Pilih text → klik button
2. **Keyboard**: Pilih text → tekan shortcut
3. **Toggle**: Jalankan command lagi untuk remove format

---

## 🎨 UI/UX Enhancements

### Toggle Buttons
- 📋 **Outline** → Show/hide table of contents
- ⬅➡ **Split** → Editor + Preview side-by-side
- 👁️ **Preview** → Full preview mode
- 📍 **Pin** → Pin note to top

### Layout Modes
1. **Edit Only**: Full editor dengan optional outline sidebar
2. **Split View**: Editor | Preview | Outline
3. **Preview Only**: Full preview mode

---

## 📊 Technical Implementation

### Performance Optimizations
- ✅ **Debounced autosave**: 500ms after typing stops
- ✅ **Markdown cache**: LRU cache untuk parsed markdown
- ✅ **Lazy loading**: Mermaid hanya load saat dibutuhkan
- ✅ **Base64 images**: Offline-first, no external dependencies

### Browser APIs Used
- `FileReader` untuk Base64 conversion
- `ClipboardEvent` untuk paste handling
- `DragEvent` untuk drag & drop
- `Blob` & `fetch` untuk URL image loading

---

## 🚀 Future Enhancements

### Possible Improvements
1. **Image Management**
   - [ ] Option to save images to local folder
   - [ ] Image compression before Base64
   - [ ] Lazy loading for Base64 images

2. **Tables**
   - [ ] Interactive table editor (add/remove rows/cols)
   - [ ] Cell merging
   - [ ] Column alignment controls

3. **Outline**
   - [ ] Drag to reorder headers
   - [ ] Fold/unfold sections
   - [ ] Mini-map view

4. **Lists**
   - [ ] Auto-continue list on Enter
   - [ ] Smart indent detection
   - [ ] Multi-level list shortcuts

---

## 📖 Changelog

### v1.0 - 4 Oktober 2025
- ✅ Image drag & drop + paste
- ✅ URL to Base64 conversion
- ✅ Outline/TOC view
- ✅ Tab/Shift+Tab list indentation
- ✅ Task list with checkboxes
- ✅ Table insertion
- ✅ Inline formatting toolbar
- ✅ Keyboard shortcuts (Ctrl+B, I, K, etc)

---

## 🎯 Developer Guide

### Adding New Toolbar Button
```typescript
// 1. Add to EditorToolbar.svelte
<button onclick={onNewFeature}>Icon</button>

// 2. Add handler in Editor.svelte
const handleNewFeature = () => {
  if (!contentTextarea) return
  const newContent = commands.newFeatureCommand(contentTextarea)
  updateContent(newContent)
}

// 3. Add command in editorCommands.ts
export function newFeatureCommand(textarea: HTMLTextAreaElement): string {
  // Implementation
  return replaceSelection(textarea, newText, false)
}
```

### Adding New Markdown Feature
```typescript
// 1. Add renderer in markdown.ts
renderer.customElement = (element) => {
  // Custom rendering logic
  return `<div class="custom">${element}</div>`
}

// 2. Add CSS in MarkdownPreview.svelte
.markdown-preview :global(.custom) {
  /* Styling */
}
```

---

## 📝 Testing Checklist

- [x] Drag & drop gambar JPG/PNG
- [x] Paste screenshot dari clipboard
- [x] Paste URL gambar external
- [x] Outline auto-update saat ketik heading
- [x] Klik outline item → scroll ke header
- [x] Tab indent list
- [x] Shift+Tab unindent list
- [x] Task list checkbox rendering
- [x] Table insertion via toolbar
- [x] Ctrl+B bold toggle
- [x] Ctrl+I italic toggle
- [x] Ctrl+K link insertion
- [x] Keyboard shortcuts work in edit mode
- [x] Toolbar buttons work
- [x] Toggle outline view
- [x] Split view dengan outline

---

## 🎉 Kesimpulan

Semua fitur utama Typora telah diimplementasikan:
- ✅ **Images**: Drag & drop, paste, URL auto-convert, Base64 storage
- ✅ **Headers**: Outline view dengan navigation
- ✅ **Lists**: Tab indentation, task lists, auto-creation
- ✅ **Tables**: Toolbar insertion, proper rendering
- ✅ **Inline Styles**: Full toolbar + keyboard shortcuts

MindNote sekarang memiliki editor experience yang mirip dengan Typora, dengan keunggulan:
- 🚀 Offline-first dengan IndexedDB
- ⚡ Instant navigation (SPA)
- 🎨 Clean, modern UI
- 📱 Responsive mobile support
