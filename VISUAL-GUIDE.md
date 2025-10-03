# Visual Guide - Before & After

## 🎨 Theme Integration Showcase

### Dark Theme
```
┌─────────────────────────────────────────────────────────┐
│  📎 Attachments                      [➕ Add File]      │ ← Theme-aware header
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │     📄      │  │     📊      │  │     🖼️      │    │
│  │             │  │             │  │             │    │ ← Hover lift effect
│  │ document.pdf│  │  data.csv   │  │  image.png  │    │   + border color
│  │ PDF • 2.3MB │  │ CSV • 145KB │  │ IMG • 890KB │    │
│  │ 15 pages    │  │ 500×10 rows │  │ 1920×1080   │    │
│  │             │  │             │  │             │    │
│  │ [👁️][📥][🗑️]│  │ [👁️][📥][🗑️]│  │ [👁️][📥][🗑️]│    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
  Dark: #1e1e1e bg, #252525 cards, #007acc primary
```

### Light Theme
```
┌─────────────────────────────────────────────────────────┐
│  📎 Attachments                      [➕ Add File]      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │     📄      │  │     📊      │  │     🖼️      │    │
│  │             │  │             │  │             │    │
│  │ document.pdf│  │  data.csv   │  │  image.png  │    │
│  │ PDF • 2.3MB │  │ CSV • 145KB │  │ IMG • 890KB │    │
│  │ 15 pages    │  │ 500×10 rows │  │ 1920×1080   │    │
│  │             │  │             │  │             │    │
│  │ [👁️][📥][🗑️]│  │ [👁️][📥][🗑️]│  │ [👁️][📥][🗑️]│    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
  Light: #ffffff bg, #f5f5f5 cards, #007acc primary
```

### Typewriter Theme
```
┌─────────────────────────────────────────────────────────┐
│  📎 Attachments                      [➕ Add File]      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │     📄      │  │     📊      │  │     🖼️      │    │
│  │             │  │             │  │             │    │
│  │ document.pdf│  │  data.csv   │  │  image.png  │    │
│  │ PDF • 2.3MB │  │ CSV • 145KB │  │ IMG • 890KB │    │
│  │ 15 pages    │  │ 500×10 rows │  │ 1920×1080   │    │
│  │             │  │             │  │             │    │
│  │ [👁️][📥][🗑️]│  │ [👁️][📥][🗑️]│  │ [👁️][📥][🗑️]│    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
  Typewriter: #f5f2e8 bg (paper), #8b4513 primary (brown)
```

---

## 📄 PDF Viewer - Enhanced UI

### Toolbar Layout
```
┌──────────────────────────────────────────────────────────────────┐
│  [← Prev]  Page 5 of 24  [Next →]  [−] 150% [+]  [💬 Comment]  │
│  [🔍Search: "important"___________] [🔍]  Found 3 matches        │
└──────────────────────────────────────────────────────────────────┘
  • Theme-aware background (var(--card-bg))
  • Primary color buttons with hover effects
  • Responsive: stacks on mobile
```

### Canvas with Annotations
```
┌──────────────────────────────────────────────────────────────────┐
│                                                                   │
│                    ╔═════════════════════╗                       │
│                    ║                     ║                       │
│                    ║   PDF Page Content  ║  💬 ← Comment icon    │
│                    ║                     ║     (hover to view)   │
│                    ║   Lorem ipsum dolor ║                       │
│                    ║   sit amet...       ║  💬 ← Another one     │
│                    ║                     ║                       │
│                    ║                     ║                       │
│                    ╚═════════════════════╝                       │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
  • White canvas with rounded corners (4px)
  • Drop shadow: 0 4px 12px rgba(0,0,0,0.15)
  • Background: var(--bg-color) for contrast
```

### Comment Tooltip (Hover)
```
       💬
       ↓
   ┌────────────────────────────┐
   │ Important point here!      │ ← var(--text-color)
   │                            │
   │ Created: 3:45 PM           │ ← var(--text-secondary)
   │                            │
   │ [Delete]                   │
   └────────────────────────────┘
     • Background: var(--card-bg)
     • Border: var(--border-color)
     • Shadow: 0 4px 12px rgba(0,0,0,0.2)
     • Rounded: 6px
```

### Add Comment Modal
```
     ┌──────────────────────────────────┐
     │ ┌──────────────────────────────┐ │
     │ │ Type your comment here...    │ │ ← Theme textarea
     │ │                              │ │
     │ │                              │ │
     │ └──────────────────────────────┘ │
     │                                  │
     │         [Save]    [Cancel]       │
     └──────────────────────────────────┘
       • Border: 2px solid var(--primary-color)
       • Shadow: 0 4px 16px rgba(0,0,0,0.25)
       • Rounded: 8px
```

---

## 📊 CSV Viewer - Table Enhancements

### Toolbar with Stats
```
┌───────────────────────────────────────────────────────────────────┐
│  [Search: "product"_______] [✏️ Edit] [📥 CSV] [📥 JSON]          │
│                                            500 rows × 10 columns   │
└───────────────────────────────────────────────────────────────────┘
  • Full-width responsive
  • Theme-integrated inputs
  • Right-aligned stats
```

### Enhanced Table
```
┌─────────────────────────────────────────────────────────────────────┐
│ Name ▲       │ Price      │ Category    │ Stock      │ Actions     │ ← Sticky header
├─────────────────────────────────────────────────────────────────────┤
│ Product A    │ $29.99     │ Electronics │ 150        │ [🗑️]        │ ← Even row
│ Product B    │ $19.99     │ Books       │ 230        │ [🗑️]        │ ← Odd row (striped)
│ Product C    │ $49.99     │ Electronics │ 89         │ [🗑️]        │
│ Product D    │ $9.99      │ Accessories │ 450        │ [🗑️]        │
│ ...          │ ...        │ ...         │ ...        │ ...         │
└─────────────────────────────────────────────────────────────────────┘
  • Striped rows: var(--card-bg) on even
  • Hover: var(--hover-bg)
  • Sort indicators: var(--primary-color)
  • Custom scrollbar themed
```

### Edit Mode
```
┌─────────────────────────────────────────────────────────────────────┐
│ Actions │ Name                    │ Price   │ Category   │ Stock    │
├─────────────────────────────────────────────────────────────────────┤
│ [🗑️]    │ [Product A____________] │ [29.99] │ [Elect...] │ [150]    │
│ [🗑️]    │ [Product B____________] │ [19.99] │ [Books___] │ [230]    │
│                                                                       │
│                     [➕ Add Row]                                      │
│                                                                       │
│                 [💾 Save]  [❌ Cancel]                                │
└─────────────────────────────────────────────────────────────────────┘
  • Inputs: var(--bg-color) background
  • Focus: border-color: var(--primary-color)
  • Action column: 80px width
```

---

## 📎 Attachment Cards - Hover States

### Normal State
```
┌─────────────────┐
│       📄        │
│                 │
│  document.pdf   │
│  PDF • 2.3MB    │
│  15 pages       │
│                 │
│ [👁️] [📥] [🗑️]  │
└─────────────────┘
  Border: var(--border-color)
  Background: var(--card-bg)
  Shadow: none
```

### Hover State
```
┌─────────────────┐ ← Lifts up 2px
│       📄        │
│                 │
│  document.pdf   │
│  PDF • 2.3MB    │
│  15 pages       │
│                 │
│ [👁️] [📥] [🗑️]  │
└─────────────────┘
  Border: var(--primary-color) ← Changes!
  Transform: translateY(-2px)
  Shadow: 0 4px 12px rgba(0,0,0,0.15) ← Bigger
```

---

## 📤 Upload Dialog - Enhanced

### Before (Old)
```
┌────────────────────────────┐
│ Upload File                │
│ Supported: PDF, CSV, IMG   │
│                            │
│ [Choose File]              │
│                            │
│            [Cancel]        │
└────────────────────────────┘
  • Basic white background
  • Simple border
  • No blur effect
```

### After (New)
```
╔════════════════════════════════╗ ← Backdrop blur!
║ Upload File                    ║
║ Supported formats: PDF, CSV... ║
║                                ║
║ ┌────────────────────────────┐ ║
║ │ ╭╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╮ │ ║ ← Dashed border
║ │ ╎  Drop or click to select ╎ │ ║
║ │ ╰╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╯ │ ║
║ └────────────────────────────┘ ║
║                                ║
║                    [Cancel]    ║
╚════════════════════════════════╝
  • Background: var(--card-bg)
  • Border: var(--border-color)
  • Backdrop-filter: blur(4px)
  • Rounded: 12px (more rounded)
  • Shadow: 0 8px 32px rgba(0,0,0,0.3)
```

---

## 🎯 Button Hover Animations

### Primary Button
```
Normal:     [  View  ]
            └────────┘
            background: var(--primary-color)

Hover:      [  View  ] ← Subtle lift
            └────────┘
            background: var(--primary-hover)
            transform: translateY(-1px)
            
Press:      [  View  ]
            └────────┘
            transform: scale(0.98)
```

### Delete Button (Dangerous)
```
Normal:     [ 🗑️ ]
            └────┘
            background: #f44336

Hover:      [ 🗑️ ] ← Scales up
            └────┘
            background: #da190b
            transform: scale(1.05)
```

---

## 📱 Responsive Breakpoints

### Desktop (>768px)
```
┌────────────────────────────────────────────────────────┐
│ [Controls___________] [Actions____] [Stats_________]   │
└────────────────────────────────────────────────────────┘
  Full horizontal layout, all elements visible
```

### Mobile (<768px)
```
┌──────────────────────────┐
│ [Controls______________] │ ← Stack vertically
├──────────────────────────┤
│ [Actions______________]  │
├──────────────────────────┤
│ Stats: 500 rows × 10 col │
└──────────────────────────┘
  • Reduced padding
  • Full-width elements
  • Smaller font sizes
  • Compact spacing
```

---

## 🎨 Color Palette Reference

### Dark Theme
```
Background:      ███ #1e1e1e
Card:            ███ #252525
Hover:           ███ #2d2d2d
Text:            ███ #e0e0e0
Secondary:       ███ #888888
Border:          ███ #333333
Primary:         ███ #007acc
Primary Hover:   ███ #005a9e
```

### Light Theme
```
Background:      ███ #ffffff
Card:            ███ #f5f5f5
Hover:           ███ #e8e8e8
Text:            ███ #1e1e1e
Secondary:       ███ #666666
Border:          ███ #dddddd
Primary:         ███ #007acc
Primary Hover:   ███ #005a9e
```

### Typewriter Theme
```
Background:      ███ #f5f2e8 (paper)
Card:            ███ #faf7f0
Hover:           ███ #efe9dd
Text:            ███ #2a2419
Secondary:       ███ #6b5d4f
Border:          ███ #d4c5ad
Primary:         ███ #8b4513 (brown)
Primary Hover:   ███ #6b3410
```

---

## ✨ Animation Examples

### Card Lift on Hover
```
Frame 1:  ┌───────┐
          │ Card  │
          └───────┘
            ↓ 0ms

Frame 2:  ┌───────┐  ← 2px up
          │ Card  │
          └───────┘
          ╰─shadow─╯ ← Shadow grows
            ↓ 100ms

Frame 3:  ┌───────┐
          │ Card  │  ← Stable
          └───────┘
          ╰─shadow─╯
            ↓ 200ms
```

### Button Press Animation
```
Frame 1:  [ Button ]   Normal
            ↓ click

Frame 2:  [Button]     Scale 0.98
            ↓ 50ms

Frame 3:  [ Button ]   Back to normal
            ↓ 100ms
```

---

## 🌈 Theme Switching Demo

```
User clicks theme selector...

┌─────────────────────────┐     ┌─────────────────────────┐
│ Light Theme Active      │ --> │ Dark Theme Active       │
│ ┌─────────────────────┐ │     │ ┌─────────────────────┐ │
│ │ White backgrounds   │ │     │ │ Dark backgrounds    │ │
│ │ Dark text           │ │     │ │ Light text          │ │
│ │ Light borders       │ │     │ │ Dark borders        │ │
│ └─────────────────────┘ │     │ └─────────────────────┘ │
└─────────────────────────┘     └─────────────────────────┘
        ↓ 300ms                          ↓ instant
   Smooth fade                     All CSS variables update
```

All components update instantly because they use CSS variables!

---

**End of Visual Guide** 🎨

Quick test: Open dev server → Switch themes → See magic happen! ✨
