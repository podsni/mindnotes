# 🧪 Testing Guide - Typora Features

## Quick Test Scenarios

### 1. 🖼️ Test Images

#### Drag & Drop
1. Buka browser di http://localhost:5173
2. Buat note baru
3. Seret file gambar dari file explorer ke editor
4. ✅ Gambar harus muncul di preview dengan Base64

#### Paste from Clipboard
1. Copy screenshot (Win: `Win+Shift+S`, Mac: `Cmd+Shift+4`)
2. Paste di editor (`Ctrl+V`)
3. ✅ Gambar harus langsung embed

#### URL to Base64
1. Klik toolbar button 🖼️
2. Masukkan URL gambar (contoh: `https://picsum.photos/200`)
3. ✅ Gambar harus di-fetch dan convert ke Base64

### 2. 📋 Test Outline

1. Ketik beberapa heading:
```markdown
# Main Title
## Section 1
### Subsection 1.1
## Section 2
### Subsection 2.1
### Subsection 2.2
# Another Title
```

2. Klik button 📋 di toolbar
3. ✅ Outline harus muncul di sidebar dengan indent proper
4. Klik item di outline
5. ✅ Editor harus scroll ke header tersebut

### 3. 📝 Test Lists & Indentation

#### Tab Indentation
1. Ketik:
```markdown
- Item 1
- Item 2
```
2. Letakkan cursor di "Item 2"
3. Tekan `Tab`
4. ✅ Item 2 harus indent 2 spasi
5. Tekan `Shift+Tab`
6. ✅ Item 2 harus unindent

#### Task List
1. Klik button ☑ di toolbar
2. Ketik task: `Task to do`
3. ✅ Harus muncul `- [ ] Task to do`
4. Ubah `[ ]` menjadi `[x]`
5. Toggle preview
6. ✅ Checkbox harus tercentang dengan strikethrough

### 4. 📊 Test Tables

1. Klik button ⊞ di toolbar
2. ✅ Table 3x3 harus di-insert
3. Edit cell content
4. Toggle preview
5. ✅ Table harus render dengan border dan alternating colors

### 5. ✨ Test Inline Formatting

#### Bold
1. Ketik "bold text"
2. Select "bold"
3. Tekan `Ctrl+B`
4. ✅ Harus jadi `**bold** text`
5. Tekan `Ctrl+B` lagi
6. ✅ Harus remove bold

#### Italic
1. Ketik "italic text"
2. Select "italic"
3. Tekan `Ctrl+I`
4. ✅ Harus jadi `*italic* text`

#### Strikethrough
1. Ketik "strike text"
2. Select "strike"
3. Tekan `Ctrl+Shift+X`
4. ✅ Harus jadi `~~strike~~ text`

#### Code
1. Ketik "code text"
2. Select "code"
3. Tekan `Ctrl+` `` ` ``
4. ✅ Harus jadi `` `code` text``

#### Link
1. Ketik "click here"
2. Select "click here"
3. Tekan `Ctrl+K`
4. Masukkan URL: `https://example.com`
5. ✅ Harus jadi `[click here](https://example.com)`

### 6. 🎨 Test Toolbar Buttons

#### Heading Menu
1. Klik button "H▾"
2. ✅ Dropdown harus muncul dengan H1-H6
3. Klik "H2"
4. ✅ Harus insert `## ` di cursor

#### List Buttons
1. Klik ☰ → ✅ Insert `- `
2. Klik 1. → ✅ Insert `1. `
3. Klik ☑ → ✅ Insert `- [ ] `

### 7. 🔄 Test Split View

1. Klik button ⬅➡
2. ✅ Editor split jadi 2: editor | preview
3. Scroll di editor
4. ✅ Preview harus scroll sync
5. Klik button 📋
6. ✅ Outline harus muncul di pane ketiga

### 8. 🎯 Test All Together

Ketik markdown berikut:

```markdown
# Testing All Features

## Images
![Test](https://picsum.photos/300/200)

## Lists
- Item 1
  - Nested item 1.1
  - Nested item 1.2
- Item 2

### Task List
- [x] Completed task
- [ ] Pending task

## Table
| Name | Age | City |
| --- | --- | --- |
| Alice | 25 | NYC |
| Bob | 30 | LA |

## Formatting
This is **bold**, this is *italic*, this is ~~strikethrough~~, and this is `code`.

## Code Block
```javascript
function hello() {
  console.log("Hello World!");
}
\`\`\`

## Math
Inline: $E = mc^2$

Block:
$$
\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$
```

Toggle preview dan verifikasi semua render dengan benar.

---

## ✅ Success Criteria

### Images
- [ ] Drag & drop works
- [ ] Paste from clipboard works
- [ ] URL auto-converts to Base64
- [ ] Images display in preview

### Outline
- [ ] Headers extracted correctly
- [ ] Indent proper (H1 → H6)
- [ ] Click navigation works
- [ ] Auto-updates on typing

### Lists
- [ ] Tab indents
- [ ] Shift+Tab unindents
- [ ] Task checkboxes render
- [ ] Checked tasks have strikethrough

### Tables
- [ ] Insert via toolbar
- [ ] Proper markdown syntax
- [ ] Renders with borders
- [ ] Alternating row colors

### Inline Formatting
- [ ] Ctrl+B toggles bold
- [ ] Ctrl+I toggles italic
- [ ] Ctrl+Shift+X toggles strike
- [ ] Ctrl+` toggles code
- [ ] Ctrl+K inserts link
- [ ] Toolbar buttons work

### UI/UX
- [ ] Toolbar shows in edit mode
- [ ] Outline toggles visibility
- [ ] Split view works
- [ ] Scroll sync works
- [ ] Mobile responsive

---

## 🐛 Known Issues

### Non-Critical
- Accessibility warnings di MermaidViewer (cosmetic)
- PWA warning tentang glob pattern (tidak affect functionality)

### To Be Fixed
- None reported yet

---

## 📱 Mobile Testing

Test pada device mobile atau dengan Chrome DevTools mobile emulation:

1. Resize browser ke mobile size
2. ✅ Toolbar harus wrap properly
3. ✅ FAB button harus muncul
4. ✅ Outline harus stack di bawah (tidak side-by-side)
5. ✅ Touch events harus work
6. ✅ Keyboard harus show saat focus textarea

---

## 🎉 Done!

Jika semua test pass, fitur Typora-inspired sudah berhasil diimplementasikan!
