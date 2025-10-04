# 🎨 Typora-like Features Implementation

## ✨ Overview
MindNote sekarang mendukung fitur-fitur lengkap seperti Typora untuk pengalaman menulis yang lebih baik!

---

## 🖼️ Images

### ✅ Fitur yang Sudah Diimplementasikan:

1. **Paste URL Langsung** 
   - Paste URL image dari clipboard → otomatis jadi `![](url)`
   - **TIDAK download image** - URL tetap bersih dan tidak bloat markdown
   - Contoh: Paste `https://example.com/image.jpg` → langsung jadi markdown

2. **Drag & Drop**
   - Drag file image → otomatis convert ke Base64 → embed di markdown
   - Mendukung: JPG, PNG, GIF, WebP, SVG, BMP

3. **Clipboard Paste**
   - Screenshot atau copy image → paste di editor → auto-embed
   - Convert ke Base64 untuk offline-first

4. **Insert Image dari Toolbar**
   - Klik tombol 🖼️ → masukkan URL → otomatis insert `![](url)`

### 📝 Cara Pakai:

```markdown
# Method 1: Paste URL
Copy URL image → Paste di editor → Done! ✅
Result: ![](https://example.com/image.jpg)

# Method 2: Drag & Drop
Drag image file → Drop ke editor → Auto-embed

# Method 3: Screenshot
Screenshot (Ctrl+PrtSc) → Paste di editor → Auto-embed

# Method 4: Toolbar
Klik tombol 🖼️ → Enter URL → Done!
```

---

## 🧭 Headers & Outline

### ✅ Fitur yang Sudah Diimplementasikan:

1. **Auto Outline/TOC**
   - Otomatis extract headers dari markdown
   - Tampil di sidebar kanan (toggle dengan 📋)
   - Real-time update saat typing

2. **Click to Jump**
   - Klik header di outline → auto scroll ke header di editor
   - Smooth navigation

3. **Visual Hierarchy**
   - H1: 📄 (Document icon)
   - H2: 📌 (Pin icon)
   - H3: • (Bullet)
   - H4+: ◦ (Small bullet)
   - Indentasi otomatis by level

### 📝 Cara Pakai:

```markdown
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

Klik tombol 📋 untuk toggle outline sidebar
Klik heading di outline → langsung jump ke section!
```

---

## 📝 Lists

### ✅ Fitur yang Sudah Diimplementasikan:

1. **Bullet List**
   ```markdown
   - Item 1
   - Item 2
     - Nested item (Tab untuk indent)
   ```

2. **Ordered List**
   ```markdown
   1. First
   2. Second
      1. Nested (Tab untuk indent)
   ```

3. **Task List (Interactive Checkboxes)**
   ```markdown
   - [ ] Todo
   - [x] Done
   - [ ] In progress
   ```
   - Checkbox bisa diklik langsung di preview!
   - Two-way binding: klik checkbox → update markdown

4. **Tab/Shift+Tab Indentation**
   - Tab: Indent list item
   - Shift+Tab: Outdent list item
   - Auto-detect context (list, code, etc)

### 📝 Cara Pakai:

```markdown
# Keyboard Shortcuts:
- Tab: Indent current line
- Shift+Tab: Outdent current line
- Ctrl+Shift+C: Insert task list item

# Toolbar:
- 📋 Button: Insert bullet list
- 🔢 Button: Insert numbered list
- ☑️ Button: Insert task list
```

---

## 📊 Tables

### ✅ Fitur yang Sudah Diimplementasikan:

1. **Quick Insert**
   - Klik tombol 📊 → auto-insert 3×3 table template

2. **Markdown Table Format**
   ```markdown
   | Header 1 | Header 2 | Header 3 |
   |----------|----------|----------|
   | Cell 1   | Cell 2   | Cell 3   |
   | Cell 4   | Cell 5   | Cell 6   |
   ```

3. **Auto-render di Preview**
   - Preview mode: tables rendered dengan styling yang bagus
   - Split view: lihat markdown & preview side-by-side

### 📝 Cara Pakai:

```markdown
# From Toolbar:
Klik tombol 📊 → Auto-insert table template

# Manual:
| Name | Age | City |
|------|-----|------|
| John | 24  | NYC  |
| Jane | 28  | LA   |

Tips: Gunakan | sebagai separator kolom
```

---

## ✨ Inline Styles

### ✅ Fitur yang Sudah Diimplementasikan:

1. **Bold** - `**text**` atau Ctrl+B
2. **Italic** - `*text*` atau Ctrl+I
3. **Strikethrough** - `~~text~~` atau Ctrl+Shift+X
4. **Inline Code** - `` `code` `` atau Ctrl+`
5. **Link** - `[text](url)` atau Ctrl+K
6. **Image** - `![](url)` atau Ctrl+Shift+I

### 📝 Keyboard Shortcuts:

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | **Bold** |
| `Ctrl+I` | *Italic* |
| `Ctrl+Shift+X` | ~~Strikethrough~~ |
| ``Ctrl+` `` | `Inline code` |
| `Ctrl+K` | Insert link |
| `Ctrl+Shift+I` | Insert image |
| `Tab` | Indent list |
| `Shift+Tab` | Outdent list |

### 📝 Toolbar Buttons:

```
[B] - Bold
[I] - Italic
[S] - Strikethrough
[<>] - Code
[🔗] - Link
[🖼️] - Image
[H▾] - Heading (dropdown H1-H6)
[•] - Bullet list
[1.] - Numbered list
[☑️] - Task list
[📊] - Table
```

---

## 🎯 Split View & Preview

### ✅ Fitur yang Sudah Diimplementasikan:

1. **Split View (⬅➡)**
   - Editor kiri, preview kanan
   - **Real-time scroll sync** - scroll di editor → preview ikut scroll
   - Two-way sync - scroll di preview → editor ikut scroll
   - Smooth synchronization dengan requestAnimationFrame

2. **Full Preview (👁️)**
   - Preview-only mode
   - Toggle untuk fokus membaca

3. **Edit Mode (✏️)**
   - Editor-only mode
   - Toggle untuk fokus menulis

### 📝 Cara Pakai:

```
⬅➡ Split View: Editor + Preview side-by-side dengan scroll sync
👁️ Preview: Full preview mode (read-only)
✏️ Edit: Back to edit mode
📋 Outline: Toggle outline/TOC sidebar
```

---

## 🎨 Theme Support

Semua fitur **otomatis mengikuti tema** yang dipilih:

- 🌙 Dark
- ☀️ Light
- 📝 Typewriter
- ✨ Minimal
- 🖋️ Dark Typewriter
- 💚 Green Terminal
- 🔶 Amber Noir
- 💜 Indigo Typewriter

**Toolbar, Outline, dan semua UI elements** menggunakan CSS variables global untuk styling yang konsisten.

---

## 🚀 Performance

### Optimizations:

1. **Debounced Auto-save** - 500ms delay setelah typing berhenti
2. **RequestAnimationFrame** - Smooth scroll sync tanpa lag
3. **Efficient Re-renders** - Svelte 5 reactivity untuk update minimal
4. **IndexedDB** - Fast local storage untuk offline-first

---

## 📱 Mobile Support

- ✅ Touch-friendly UI
- ✅ Responsive layout
- ✅ FAB (Floating Action Button) untuk quick actions
- ✅ Auto-resize textarea
- ✅ Stack view di mobile (no split view)

---

## 🔮 Future Enhancements

1. **Tables**:
   - Visual table editor (click to edit cells)
   - Column resize
   - Add/remove rows/columns
   - Cell alignment

2. **Images**:
   - Image resize in preview
   - Image gallery view
   - Image compression options
   - Lazy loading for performance

3. **Lists**:
   - Auto-continue list on Enter
   - Smart paste for lists
   - Convert between list types

4. **Headers**:
   - Collapsible sections
   - Outline search/filter
   - Mini-map view

---

## 📚 Examples

### Complete Note Example:

```markdown
# Project Planning

## Overview
This is a **bold** statement with *italic* text and ~~strikethrough~~.

## Tasks
- [x] Design mockups
- [ ] Implement features
  - [x] Image support
  - [ ] Table editor
- [ ] Write tests

## Team
| Name | Role | Status |
|------|------|--------|
| John | Dev | Active |
| Jane | Design | Active |

## Code Example
\`\`\`javascript
function hello() {
  console.log('Hello World!')
}
\`\`\`

## Images
![Project Screenshot](https://example.com/screenshot.png)

## Links
Check out [MindNote](https://github.com) for more!
```

---

## 🎉 Summary

MindNote sekarang memiliki semua fitur Typora yang penting:

✅ Image paste (URL langsung tanpa download)  
✅ Drag & drop images  
✅ Outline/TOC dengan click-to-jump  
✅ Interactive task lists  
✅ Tables dengan quick insert  
✅ Inline styles dengan shortcuts  
✅ Real-time scroll sync di split view  
✅ Theme-aware UI (semua komponen)  
✅ Mobile-friendly  

**Happy writing! 🚀📝**
