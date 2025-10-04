# 🧪 Testing Guide - Fitur Baru

## 🎯 Checklist Testing

### 1. 🖼️ **Image Paste - Clean URL**

**Test 1: Paste URL Image**
```bash
✅ Steps:
1. Copy URL ini: https://picsum.photos/400/300
2. Buka note di MindNote
3. Paste (Ctrl+V) di editor
4. Check hasilnya: ![](https://picsum.photos/400/300)

✅ Expected:
- Markdown clean (no Base64)
- Preview langsung tampil image
- Format: ![](url) bukan ![](data:image/base64...)
```

**Test 2: Paste dari Clipboard**
```bash
✅ Steps:
1. Screenshot (Ctrl+PrtSc)
2. Paste di editor
3. Check hasilnya: ![Pasted Image](data:image/png;base64...)

✅ Expected:
- Image embed dengan Base64 (untuk screenshot)
- Preview langsung tampil
```

**Test 3: Drag & Drop File**
```bash
✅ Steps:
1. Drag image file ke editor
2. Drop
3. Check hasilnya

✅ Expected:
- Image embed dengan Base64
- Preview langsung tampil
```

**Test 4: Toolbar Insert**
```bash
✅ Steps:
1. Klik tombol 🖼️ di toolbar
2. Masukkan URL: https://picsum.photos/400/300
3. Check hasilnya

✅ Expected:
- Markdown clean: ![](url)
- Preview langsung tampil
```

---

### 2. 📜 **Real-time Scroll Sync**

**Test 1: Editor → Preview Sync**
```bash
✅ Steps:
1. Buat note dengan konten panjang (scroll-able)
2. Klik tombol ⬅➡ (split view)
3. Scroll di editor pane (kiri)
4. Amati preview pane (kanan)

✅ Expected:
- Preview scroll mengikuti editor
- Smooth, no lag
- Posisi relatif sama (top → top, middle → middle, bottom → bottom)
```

**Test 2: Preview → Editor Sync (2-way)**
```bash
✅ Steps:
1. Di split view
2. Scroll di preview pane (kanan)
3. Amati editor pane (kiri)

✅ Expected:
- Editor scroll mengikuti preview
- Smooth, no lag
- Posisi relatif sama
```

**Test 3: Long Content**
```bash
✅ Steps:
1. Buat note dengan 50+ lines
2. Split view
3. Scroll cepat di editor
4. Scroll cepat di preview

✅ Expected:
- No stuttering
- Always in sync
- Smooth animation
```

---

### 3. 🎨 **Theme Support**

**Test Semua Tema:**
```bash
✅ Steps:
1. Buka Settings
2. Ganti tema satu per satu:
   - 🌙 Dark
   - ☀️ Light
   - 📝 Typewriter
   - ✨ Minimal
   - 🖋️ Dark Typewriter
   - 💚 Green Terminal
   - 🔶 Amber Noir
   - 💜 Indigo Typewriter

3. Check setiap tema:
   - Toolbar colors
   - Outline sidebar colors
   - Dropdown menu colors
   - Border colors
   - Text colors

✅ Expected:
- Semua komponen ikut berubah
- No hardcoded colors
- Consistent styling
- Readable text di semua tema
```

---

### 4. 🧭 **Outline/TOC**

**Test 1: Auto-generate**
```bash
✅ Steps:
1. Buat note dengan headers:
   # Header 1
   ## Header 2
   ### Header 3
   #### Header 4

2. Klik tombol 📋 (outline)
3. Check sidebar

✅ Expected:
- Outline muncul di kanan
- Semua headers detected
- Hierarchy terlihat (indent by level)
- Icons berbeda (📄 📌 • ◦)
```

**Test 2: Click to Jump**
```bash
✅ Steps:
1. Di outline sidebar
2. Klik header di tengah list
3. Amati editor

✅ Expected:
- Editor auto-scroll ke header
- Cursor focus ke editor
- Smooth scroll
```

**Test 3: Real-time Update**
```bash
✅ Steps:
1. Buka outline
2. Ketik header baru: ## New Section
3. Amati outline

✅ Expected:
- Outline update otomatis
- New header muncul di list
- No refresh needed
```

---

### 5. 📝 **Lists**

**Test 1: Tab Indent**
```bash
✅ Steps:
1. Ketik: - Item 1
2. Enter
3. Ketik: - Item 2
4. Tekan Tab
5. Check hasilnya

✅ Expected:
- Item 2 ter-indent
- Formatted: "  - Item 2"
```

**Test 2: Shift+Tab Outdent**
```bash
✅ Steps:
1. Dari list ter-indent
2. Tekan Shift+Tab
3. Check hasilnya

✅ Expected:
- Item kembali ke level sebelumnya
- Formatted correctly
```

**Test 3: Task List Checkbox**
```bash
✅ Steps:
1. Ketik:
   - [ ] Task 1
   - [x] Task 2
   - [ ] Task 3

2. Klik tombol 👁️ (preview)
3. Klik checkbox di preview
4. Amati markdown

✅ Expected:
- Checkbox interaktif (clickable)
- Click → update markdown ([ ] ↔ [x])
- Two-way binding works
```

---

### 6. 📊 **Tables**

**Test 1: Quick Insert**
```bash
✅ Steps:
1. Klik tombol 📊 di toolbar
2. Check hasilnya

✅ Expected:
- 3×3 table template inserted
- Formatted correctly
- Preview renders table dengan styling
```

**Test 2: Manual Edit**
```bash
✅ Steps:
1. Edit table cells di markdown
2. Check preview

✅ Expected:
- Preview update real-time
- Table styling applied
- Borders, padding correct
```

---

### 7. ✨ **Inline Styles & Shortcuts**

**Test Shortcuts:**
```bash
✅ Ctrl+B (Bold):
1. Select text: "Hello"
2. Press Ctrl+B
3. Check: **Hello**

✅ Ctrl+I (Italic):
1. Select text: "World"
2. Press Ctrl+I
3. Check: *World*

✅ Ctrl+Shift+X (Strikethrough):
1. Select text: "Delete"
2. Press Ctrl+Shift+X
3. Check: ~~Delete~~

✅ Ctrl+` (Code):
1. Select text: "code"
2. Press Ctrl+`
3. Check: `code`

✅ Ctrl+K (Link):
1. Select text: "Click here"
2. Press Ctrl+K
3. Enter URL: https://example.com
4. Check: [Click here](https://example.com)
```

**Test Toolbar Buttons:**
```bash
✅ Steps untuk setiap button:
1. Select text
2. Click toolbar button
3. Check format applied

Buttons: [B] [I] [S] [<>] [🔗] [🖼️] [H▾] [•] [1.] [☑️] [📊]
```

---

### 8. 🎯 **Split View**

**Test 1: Toggle Split**
```bash
✅ Steps:
1. Klik ⬅➡
2. Check layout

✅ Expected:
- Editor di kiri
- Preview di kanan
- Divider di tengah
- Both scrollable
```

**Test 2: With Outline**
```bash
✅ Steps:
1. Split view active
2. Klik 📋
3. Check layout

✅ Expected:
- Editor kiri
- Preview tengah
- Outline kanan
- All scrollable
```

**Test 3: Toggle Preview**
```bash
✅ Steps:
1. Klik 👁️
2. Check layout

✅ Expected:
- Full preview mode
- No editor visible
- Klik ✏️ → back to edit
```

---

### 9. 📱 **Mobile Support**

**Test di Mobile Viewport:**
```bash
✅ Steps:
1. Resize browser ke mobile size (< 768px)
2. Check:
   - Toolbar responsive
   - Outline sidebar responsive
   - Split view → stack view
   - FAB button visible
   - Touch-friendly buttons

✅ Expected:
- All UI elements responsive
- No overflow
- Buttons touchable
- Smooth scrolling
```

---

## 🎯 Complete Flow Test

**End-to-End Test:**
```bash
1. Buat note baru
2. Ketik title: "Testing MindNote Features"
3. Paste URL image
4. Add headers (# ## ###)
5. Add bullet list dengan Tab indent
6. Add task list
7. Add table
8. Add bold, italic, strikethrough text
9. Enable split view
10. Test scroll sync
11. Enable outline
12. Click headers di outline
13. Change theme
14. Check semua UI follow theme

✅ Expected: Semua fitur works perfectly!
```

---

## 🐛 Known Issues to Test

1. **Image URL validation** - Test invalid URLs
2. **Scroll sync edge cases** - Test dengan konten sangat pendek/panjang
3. **Theme switch** - Test hot-swap saat typing
4. **Performance** - Test dengan 100+ headers di outline
5. **Mobile** - Test touch gestures

---

## ✅ Success Criteria

Fitur dinyatakan **PASS** jika:

✅ Image paste → clean markdown (no bloat)  
✅ Scroll sync → instant, smooth, 2-way  
✅ Theme → semua komponen follow  
✅ Outline → real-time, clickable  
✅ Lists → tab/shift-tab works  
✅ Tables → quick insert works  
✅ Shortcuts → all working  
✅ Split view → layout correct  
✅ Mobile → responsive  

---

## 📊 Test Report Template

```markdown
# Test Report - [Date]

## Environment
- Browser: Chrome/Firefox/Safari
- Screen: Desktop/Mobile
- Theme: Dark/Light/etc

## Test Results

### 🖼️ Images
- [ ] Paste URL clean
- [ ] Drag & drop works
- [ ] Clipboard paste works
- [ ] Toolbar insert works

### 📜 Scroll Sync
- [ ] Editor → Preview
- [ ] Preview → Editor
- [ ] Long content smooth

### 🎨 Theme Support
- [ ] Toolbar follows theme
- [ ] Outline follows theme
- [ ] All UI consistent

### 🧭 Outline
- [ ] Auto-generate works
- [ ] Click to jump works
- [ ] Real-time update works

### 📝 Lists
- [ ] Tab indent works
- [ ] Shift+Tab outdent works
- [ ] Task checkbox interactive

### 📊 Tables
- [ ] Quick insert works
- [ ] Preview renders correctly

### ✨ Shortcuts
- [ ] Ctrl+B (Bold)
- [ ] Ctrl+I (Italic)
- [ ] Ctrl+Shift+X (Strike)
- [ ] Ctrl+` (Code)
- [ ] Ctrl+K (Link)

### 🎯 Split View
- [ ] Toggle works
- [ ] With outline works
- [ ] Scroll sync works

### 📱 Mobile
- [ ] Responsive layout
- [ ] Touch-friendly
- [ ] Stack view works

## Bugs Found
- [ ] None / List bugs here

## Overall: PASS / FAIL
```

---

**Happy Testing! 🧪✅**
