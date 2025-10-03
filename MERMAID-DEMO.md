# 🎨 Mermaid Diagram Interactive Viewer - Demo

Selamat datang! Ini adalah demo untuk fitur **Interactive Mermaid Viewer** yang baru. Klik tombol **Zoom** di pojok kanan atas setiap diagram untuk membuka viewer interaktif.

## 📊 Diagram 1: Simple Flowchart

```mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
```

## 🏗️ Diagram 2: System Architecture

```mermaid
graph LR
    subgraph "Client Side"
        A[Browser]
        B[Svelte App]
    end
    
    subgraph "Data Layer"
        C[IndexedDB]
        D[Dexie.js]
    end
    
    A --> B
    B --> D
    D --> C
    
    style A fill:#4f46e5,color:#fff
    style B fill:#8b5cf6,color:#fff
    style C fill:#ec4899,color:#fff
    style D fill:#f59e0b,color:#fff
```

## 🔄 Diagram 3: State Management Flow

```mermaid
sequenceDiagram
    participant U as User
    participant E as Editor
    participant S as Store
    participant DB as IndexedDB
    
    U->>E: Types content
    E->>S: Update state
    Note over S: Debounce 500ms
    S->>DB: Save to IndexedDB
    DB-->>S: Confirm saved
    S-->>E: Update UI
```

## 🗂️ Diagram 4: Class Diagram

```mermaid
classDiagram
    class Note {
        +number id
        +string title
        +string content
        +Date createdAt
        +Date updatedAt
    }
    
    class NotesStore {
        +Note[] notes
        +createNote()
        +updateNote()
        +deleteNote()
        +searchNotes()
    }
    
    class NoteService {
        +getAllNotes()
        +getNote()
        +createNote()
        +updateNote()
        +deleteNote()
    }
    
    NotesStore --> Note
    NotesStore --> NoteService
    NoteService --> Note
```

## 🚀 Diagram 5: Git Flow

```mermaid
gitGraph
    commit id: "Initial commit"
    branch develop
    checkout develop
    commit id: "Add Mermaid support"
    commit id: "Add viewer component"
    branch feature/interactive-viewer
    checkout feature/interactive-viewer
    commit id: "Implement zoom"
    commit id: "Implement pan"
    commit id: "Add touch support"
    checkout develop
    merge feature/interactive-viewer
    checkout main
    merge develop tag: "v1.0.0"
```

## 📈 Diagram 6: Entity Relationship

```mermaid
erDiagram
    USER ||--o{ NOTE : creates
    NOTE ||--o{ TAG : has
    NOTE ||--o{ ATTACHMENT : contains
    NOTE }o--o{ NOTE : links-to
    
    USER {
        string id
        string name
        date createdAt
    }
    
    NOTE {
        number id
        string title
        string content
        date createdAt
        date updatedAt
    }
    
    TAG {
        number id
        string name
        string color
    }
    
    ATTACHMENT {
        number id
        string filename
        string type
        blob data
    }
```

## 🧭 Diagram 7: User Journey

```mermaid
journey
    title User Journey: Creating a Note
    section Open App
        Open MindNote: 5: User
        View note list: 4: User
    section Create Note
        Click new note: 5: User
        Enter title: 4: User
        Write content: 5: User
        Add Mermaid diagram: 4: User
    section Interactive Viewing
        Click zoom button: 5: User
        Zoom and pan: 5: User
        View details: 5: User
        Close viewer: 4: User
    section Save
        Auto-save triggers: 5: System
        Note saved: 5: System
```

## 🎯 Diagram 8: Gantt Chart

```mermaid
gantt
    title MindNote Development Timeline
    dateFormat YYYY-MM-DD
    section Phase 1
        Basic Notes         :done, 2024-01-01, 7d
        Markdown Support    :done, 2024-01-08, 5d
        IndexedDB Setup     :done, 2024-01-13, 3d
    section Phase 2
        Mermaid Diagrams    :done, 2024-01-16, 4d
        Theme System        :done, 2024-01-20, 3d
        Mobile Support      :done, 2024-01-23, 5d
    section Phase 3
        Interactive Viewer  :active, 2024-01-28, 7d
        Zoom & Pan          :active, 2024-02-02, 3d
        Touch Support       :active, 2024-02-05, 2d
    section Phase 4
        PDF Support         :2024-02-07, 5d
        Export Features     :2024-02-12, 4d
        PWA Setup           :2024-02-16, 3d
```

## 🎮 How to Use

### Desktop
1. **Zoom**: 
   - Click zoom button on diagram
   - Use mouse wheel to zoom in/out
   - Press `+` or `-` keys
2. **Pan**: 
   - Click and drag the diagram
3. **Reset**: 
   - Click reset button
   - Press `0` key
4. **Close**: 
   - Click close button (X)
   - Press `Esc` key
   - Click outside the viewer

### Mobile
1. **Zoom**: 
   - Tap zoom button on diagram
   - Use pinch gesture (two fingers)
2. **Pan**: 
   - Swipe with one finger
3. **Reset**: 
   - Tap reset button
4. **Close**: 
   - Tap close button (X)
   - Tap outside the viewer

## 🌟 Features

✅ **Smooth Zoom**: Scale from 50% to 500%  
✅ **Pan Navigation**: Drag to explore large diagrams  
✅ **Touch Support**: Pinch zoom and touch pan  
✅ **Keyboard Shortcuts**: Fast navigation with keyboard  
✅ **Fullscreen Mode**: Distraction-free viewing  
✅ **Dark Mode**: Matches your theme preference  
✅ **Responsive**: Works on all screen sizes  
✅ **Accessible**: ARIA labels and keyboard support  

## 💡 Pro Tips

1. **Large Diagrams**: Zoom out first to see the overview, then zoom in to details
2. **Quick Reset**: Press `0` to quickly return to default view
3. **Smooth Scrolling**: Use mouse wheel for precise zoom control
4. **Mobile Zoom**: Use two fingers for more accurate zoom control
5. **Keyboard Navigation**: Fastest way for repeated zooming

---

**Enjoy exploring your diagrams! 🚀**
