# Word Count & Character Count Feature

## Overview
MindNote now displays detailed text statistics for all notes, helping you track your writing progress and content length.

## Features

### 📊 Statistics Displayed

1. **Word Count**: Number of words (split by whitespace)
2. **Character Count**: Total characters including spaces
3. **Characters (No Spaces)**: Characters excluding all whitespace

### 📍 Where Statistics Appear

#### 1. Sidebar (Note List)
- **Compact Format**: `25w · 150c`
  - Shows word count and character count
  - Tooltip on hover shows full details: "25 words, 150 characters"
- Visible on both:
  - Regular list (< 50 notes)
  - Virtual list (≥ 50 notes)

#### 2. Editor Footer
- **Detailed Format**: `📊 25 words · 150 characters · 125 chars (no spaces)`
- Shows all three statistics in real-time
- Updates as you type (with debounced auto-save)

## Technical Implementation

### Database Layer (`src/lib/db.ts`)

#### Updated Interface
```typescript
export interface NoteMetadata {
  id: number
  title: string
  preview: string
  createdAt: number
  updatedAt: number
  pinned: boolean
  wordCount: number
  charCount: number           // NEW
  charCountNoSpaces: number   // NEW
}
```

#### Helper Function
```typescript
const getTextStats = (content: string) => {
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length
  const charCount = content.length
  const charCountNoSpaces = content.replace(/\s/g, '').length
  return { wordCount, charCount, charCountNoSpaces }
}
```

### Methods Updated
All methods returning `NoteMetadata` now calculate and include character counts:
- `getNotesMetadata(limit?, offset?)`
- `searchNotes(query, limit?)`
- `getBacklinks(noteId)`

### UI Components

#### Sidebar (`src/lib/Sidebar.svelte`)
```html
<span class="word-count" title="{note.wordCount} words, {note.charCount} characters">
  {note.wordCount}w · {note.charCount}c
</span>
```

#### Editor (`src/lib/Editor.svelte`)
```html
<span class="word-count" title="Detailed statistics">
  📊 {words} words · {totalChars} characters · {charsNoSpaces} chars (no spaces)
</span>
```

## Performance Impact

✅ **Minimal Performance Impact**
- Statistics calculated once per note during metadata creation
- Stored in memory with metadata (no extra database queries)
- Real-time calculation in editor uses simple string operations (O(n))
- No impact on load time or memory usage

## Use Cases

1. **Writing Goals**: Track progress toward word/character targets
2. **Content Guidelines**: Ensure notes fit character limits (e.g., social media, documentation)
3. **Brevity Checks**: Monitor note length for conciseness
4. **Character Limits**: Useful for constrained formats
5. **Writing Analytics**: Understand writing patterns across notes

## Examples

### Short Note
```
Title: "Quick Reminder"
Content: "Buy milk"
Stats: 2w · 8c
```

### Medium Note
```
Title: "Meeting Notes"
Content: "Discussed Q4 goals and budget allocation..."
Stats: 47w · 285c
```

### Long Note
```
Title: "Project Documentation"
Content: "# Project Overview\n\nThis document describes..."
Stats: 1,247w · 7,892c · 6,645c (no spaces)
```

## Keyboard Accessibility

All statistics are accessible via tooltips:
- **Sidebar**: Hover over compact stats to see full details
- **Editor**: Tooltip shows "Detailed statistics" label

## Future Enhancements

Potential additions:
- [ ] Reading time estimate (e.g., "~3 min read")
- [ ] Paragraph count
- [ ] Sentence count
- [ ] Average word length
- [ ] Unique word count
- [ ] Statistics history/trends over time
- [ ] Export statistics to CSV for analysis
- [ ] Character count by language (for multilingual notes)

## Testing

To verify the feature:

1. **Create a new note** with some content
2. **Check Sidebar**: Should show `Xw · Yc` format
3. **Hover on stats**: Tooltip shows full details
4. **Open note in Editor**: Footer shows all 3 statistics
5. **Type content**: Stats update in real-time
6. **Search notes**: Stats appear in search results
7. **Check backlinks**: Stats appear in backlink previews

## Configuration

No configuration needed - statistics are automatically calculated and displayed for all notes.

## Backward Compatibility

✅ **Fully Compatible**
- Existing notes automatically get statistics calculated
- No database migration required
- Statistics computed on-the-fly from existing content
- Works with all existing features (search, export, import)
