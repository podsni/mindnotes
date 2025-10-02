# MindNote - Advanced Features Guide

## 🔗 Cross-Note Linking

### Cara Menggunakan:
Link ke note lain menggunakan syntax `[[note-title]]` atau `[[note-id]]`

**Contoh:**
```markdown
Lihat catatan [[Meeting Notes]] untuk detailnya.
Atau reference by ID: [[1]]
```

### Fitur:
- **Auto-linking**: Akan otomatis membuat link jika note ditemukan
- **Title matching**: Case-insensitive matching dengan title note
- **ID matching**: Bisa link langsung dengan ID
- **Visual indicator**: Link yang valid berwarna biru dengan border
- **Broken links**: Link ke note yang tidak ada akan ditampilkan dengan style berbeda

### Backlinks:
Setiap note menampilkan daftar notes yang link ke note tersebut di bagian bawah editor.

---

## 👁️ Markdown Preview

### Cara Menggunakan:
1. Klik tombol **👁️** di header editor untuk masuk preview mode
2. Klik **✏️** untuk kembali ke edit mode
3. Toggle kapan saja tanpa kehilangan perubahan

### Supported Markdown Syntax:

#### Headers
```markdown
# H1 - Main Title
## H2 - Section
### H3 - Subsection
```

#### Text Formatting
```markdown
**bold text**
*italic text*
~~strikethrough~~
`inline code`
```

#### Lists
```markdown
- Unordered list
- Item 2
  - Nested item

1. Ordered list
2. Item 2
```

#### Links & Cross-references
```markdown
[External link](https://example.com)
[[Internal note link]]
```

#### Code Blocks
````markdown
```javascript
function hello() {
  console.log('Hello World')
}
```
````

#### Blockquotes
```markdown
> This is a quote
> Multiple lines
```

#### Tables
```markdown
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
```

#### Task Lists
```markdown
- [ ] Todo item
- [x] Completed item
```

---

## ⚡ Virtualized List Performance

### Automatic Optimization:
- **< 50 notes**: Regular list (fast enough)
- **≥ 50 notes**: Virtualized list (only renders visible items)

### Benefits:
- **Smooth scrolling** dengan ribuan notes
- **Low memory usage** - hanya render ~20 items at a time
- **Instant search** - filtering tetap fast
- **No lag** saat scroll atau switch notes

### Technical Details:
- Uses `svelte-virtual-list` library
- Item height: auto-calculated
- Viewport height: dynamic based on container
- Scroll buffer: 3 items above/below viewport

---

## 🎨 Markdown Styling

### Custom Note Links:
```css
.note-link {
  color: var(--primary-color);
  background: var(--card-bg);
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--primary-color);
}
```

### Broken Links:
```css
.note-link-missing {
  color: var(--text-secondary);
  border: 1px dashed var(--text-secondary);
  font-style: italic;
}
```

### Code Highlighting:
- Inline code: Background dengan accent color
- Code blocks: Dark background dengan border
- Syntax highlighting: Ready untuk plugin

---

## 💡 Tips & Tricks

### Cross-linking Best Practices:
1. **Use descriptive titles** untuk easy linking
2. **Create index notes** untuk organize topics
3. **Check backlinks** untuk find related content
4. **Use ID links** untuk notes dengan title yang sering berubah

### Markdown Shortcuts:
- `Ctrl/Cmd + B` - Toggle sidebar
- Click 👁️ - Preview mode
- Double brackets `[[` - Start note link
- Hashtags work as plain text (no special handling yet)

### Performance Tips:
1. **Virtualized list** otomatis aktif untuk >50 notes
2. **Search** tetap fast karena IndexedDB indexes
3. **Debounced save** prevent lag saat typing
4. **Preview mode** untuk check formatting tanpa switch

---

## 🔍 Search with Cross-references

Search sekarang juga mencari dalam:
- Note titles
- Note content
- Linked note references

**Example:**
Searching "meeting" akan find:
- Notes dengan title "Meeting"
- Notes dengan content containing "meeting"
- Notes yang link ke [[Meeting Notes]]

---

## 📊 Use Cases

### 1. Personal Wiki:
```markdown
# Projects

## Active Projects
- [[Project Alpha]]
- [[Project Beta]]

See also: [[Archive]]
```

### 2. Daily Journal:
```markdown
# 2025-10-02

## Tasks
- [x] Review [[Q4 Goals]]
- [ ] Update [[Project Timeline]]

## Notes
Met with team, discussed [[New Feature Ideas]]
```

### 3. Learning Notes:
```markdown
# JavaScript Async

## Related Topics
- [[Promises]]
- [[Async/Await]]
- [[Event Loop]]

## Code Examples
See [[Code Snippets]] for implementations
```

### 4. Book Notes:
```markdown
# Atomic Habits - Chapter 1

## Key Points
- Habits compound over time
- Related: [[Productivity System]]

## Action Items
- [ ] Apply to [[Morning Routine]]
```

---

## 🚀 Advanced Features Coming Soon

### Phase 1 (Planned):
- [ ] Graph view untuk visualize connections
- [ ] Auto-complete saat typing `[[`
- [ ] Bidirectional link suggestions
- [ ] Note templates dengan pre-filled links

### Phase 2 (Planned):
- [ ] Tags system dengan `#tag` syntax
- [ ] Folders/categories
- [ ] Advanced search dengan filters
- [ ] Export to other formats (PDF, HTML)

---

## 🐛 Known Limitations

1. **Markdown Preview:**
   - No real-time preview (split view) yet
   - Some GFM features may not render perfectly
   
2. **Cross-linking:**
   - No auto-complete suggestions yet
   - Broken links tidak auto-update saat rename
   
3. **Virtual List:**
   - Fixed height items (variable height coming soon)
   - Scroll position reset saat filter

---

## 📚 API Reference

### Markdown Utilities:

```typescript
import { parseMarkdown, extractNoteLinks, getBacklinks } from './lib/markdown'

// Parse markdown to HTML
const html = parseMarkdown('# Hello [[World]]')

// Extract all note links
const links = extractNoteLinks('See [[Note 1]] and [[Note 2]]')
// Returns: ['Note 1', 'Note 2']

// Get backlinks for a note
const backlinks = getBacklinks(noteId, allNotes)
// Returns: Note[] - notes that link to this note
```

### Configuration:

```typescript
// markdown.ts
import { marked } from 'marked'

marked.setOptions({
  breaks: true,      // Line breaks become <br>
  gfm: true,         // GitHub Flavored Markdown
  // Add more options as needed
})
```

---

## 🎓 Tutorial: Creating a Knowledge Base

### Step 1: Create Index Note
```markdown
# My Knowledge Base

## Categories
- [[Programming]]
- [[Design]]
- [[Business]]
```

### Step 2: Create Topic Notes
```markdown
# Programming

## Languages
- [[JavaScript]]
- [[Python]]
- [[Rust]]

Back to [[My Knowledge Base]]
```

### Step 3: Add Detailed Notes
```markdown
# JavaScript

## Frameworks
- React - [[React Notes]]
- Vue - [[Vue Notes]]
- Svelte - [[Svelte Notes]]

## Resources
See [[Learning Resources]]

Related: [[Web Development]], [[Programming]]
```

### Step 4: Use Backlinks
- Click any note
- Scroll to bottom
- See "Linked from:" section
- Navigate related notes easily

---

**Last Updated:** October 2, 2025
**Features Version:** 2.1.0
