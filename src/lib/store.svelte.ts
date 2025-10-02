import { noteService, type Note } from './db'

// Global state using Svelte 5 runes
class NotesStore {
  notes: Note[] = $state([])
  currentNote: Note | null = $state(null)
  isLoading: boolean = $state(false)
  searchQuery: string = $state('')

  // Load all notes from IndexedDB (pinned first)
  async loadNotes() {
    this.isLoading = true
    try {
      const allNotes = await noteService.getAllNotes()
      // Sort: pinned first, then by updatedAt
      this.notes = allNotes.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1
        if (!a.pinned && b.pinned) return 1
        return b.updatedAt - a.updatedAt
      })
    } catch (error) {
      console.error('Failed to load notes:', error)
    } finally {
      this.isLoading = false
    }
  }

  // Load specific note
  async loadNote(id: number) {
    try {
      const note = await noteService.getNote(id)
      this.currentNote = note || null
    } catch (error) {
      console.error('Failed to load note:', error)
    }
  }

  // Create new note
  async createNote(title: string, content: string = '') {
    try {
      const id = await noteService.createNote(title, content)
      await this.loadNotes() // Refresh list
      return id
    } catch (error) {
      console.error('Failed to create note:', error)
      throw error
    }
  }

  // Update note with debouncing
  private updateTimeout: number | null = null
  
  async updateNote(id: number, updates: Partial<Note>) {
    // Debounce: update local state immediately
    if (this.currentNote && this.currentNote.id === id) {
      Object.assign(this.currentNote, updates)
    }
    
    // Clear previous timeout
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout)
    }

    // Debounce save to IndexedDB (500ms)
    this.updateTimeout = setTimeout(async () => {
      try {
        await noteService.updateNote(id, updates)
        await this.loadNotes() // Refresh list
      } catch (error) {
        console.error('Failed to update note:', error)
      }
    }, 500) as unknown as number
  }

  // Delete note
  async deleteNote(id: number) {
    try {
      await noteService.deleteNote(id)
      await this.loadNotes()
      if (this.currentNote?.id === id) {
        this.currentNote = null
      }
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  // Search notes
  async search(query: string) {
    this.searchQuery = query
    if (query.trim() === '') {
      await this.loadNotes()
    } else {
      try {
        this.notes = await noteService.searchNotes(query)
      } catch (error) {
        console.error('Failed to search notes:', error)
      }
    }
  }

  // Clear current note
  clearCurrentNote() {
    this.currentNote = null
  }

  // Toggle pin
  async togglePin(id: number) {
    try {
      await noteService.togglePin(id)
      await this.loadNotes()
      // Update current note if it's the one being pinned
      if (this.currentNote?.id === id) {
        this.currentNote.pinned = !this.currentNote.pinned
      }
    } catch (error) {
      console.error('Failed to toggle pin:', error)
    }
  }

  // Export notes
  async exportNotes() {
    try {
      const jsonString = await noteService.exportNotes()
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mindnote-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export notes:', error)
    }
  }

  // Import notes
  async importNotes(file: File) {
    try {
      const text = await file.text()
      const imported = await noteService.importNotes(text)
      await this.loadNotes()
      return imported
    } catch (error) {
      console.error('Failed to import notes:', error)
      throw error
    }
  }
}

// UI State Store for sidebar toggle, theme, etc
class UIStore {
  sidebarOpen: boolean = $state(true)
  isMobile: boolean = $state(false)
  theme: 'dark' | 'light' | 'typewriter' | 'minimal' | 'dark-typewriter' | 'green-terminal' | 'amber-noir' | 'indigo-typewriter' = $state('dark')
  font: string = $state('courier-prime')
  fontSize: number = $state(16)

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen
    // Save sidebar state to localStorage
    localStorage.setItem('mindnote-sidebar', this.sidebarOpen.toString())
  }

  closeSidebar() {
    this.sidebarOpen = false
    localStorage.setItem('mindnote-sidebar', 'false')
  }

  openSidebar() {
    this.sidebarOpen = true
    localStorage.setItem('mindnote-sidebar', 'true')
  }

  setMobile(mobile: boolean) {
    this.isMobile = mobile
    // Auto-close sidebar on mobile by default
    if (mobile) {
      this.sidebarOpen = false
    } else {
      // Load saved sidebar state for desktop
      const savedSidebar = localStorage.getItem('mindnote-sidebar')
      if (savedSidebar !== null) {
        this.sidebarOpen = savedSidebar === 'true'
      }
    }
  }

  // Set theme
  setTheme(theme: 'dark' | 'light' | 'typewriter' | 'minimal' | 'dark-typewriter' | 'green-terminal' | 'amber-noir' | 'indigo-typewriter') {
    this.theme = theme
    // Save to localStorage
    localStorage.setItem('mindnote-theme', this.theme)
    // Apply theme to document
    this.applyTheme()
  }

  // Toggle theme (cycle through all themes)
  toggleTheme() {
    const themes: Array<'dark' | 'light' | 'typewriter' | 'minimal' | 'dark-typewriter' | 'green-terminal' | 'amber-noir' | 'indigo-typewriter'> = ['dark', 'light', 'typewriter', 'minimal', 'dark-typewriter', 'green-terminal', 'amber-noir', 'indigo-typewriter']
    const currentIndex = themes.indexOf(this.theme)
    const nextIndex = (currentIndex + 1) % themes.length
    this.setTheme(themes[nextIndex])
  }

  // Apply theme
  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.theme)
  }

  // Load theme from localStorage
  loadTheme() {
    const savedTheme = localStorage.getItem('mindnote-theme') as 'dark' | 'light' | 'typewriter' | 'minimal' | null
    if (savedTheme) {
      this.theme = savedTheme
    }
    this.applyTheme()
  }

  // Set font
  setFont(font: string) {
    this.font = font
    // Save to localStorage
    localStorage.setItem('mindnote-font', font)
    // Apply font to document
    this.applyFont()
  }

  // Apply font
  applyFont() {
    document.documentElement.setAttribute('data-font', this.font)
  }

  // Load font from localStorage
  loadFont() {
    const savedFont = localStorage.getItem('mindnote-font')
    if (savedFont) {
      this.font = savedFont
    }
    this.applyFont()
  }

  // Set font size
  setFontSize(size: number) {
    this.fontSize = Math.max(12, Math.min(100, size)) // Limit between 12-100px
    // Save to localStorage
    localStorage.setItem('mindnote-fontSize', this.fontSize.toString())
    // Apply font size to document
    this.applyFontSize()
  }

  // Apply font size
  applyFontSize() {
    document.documentElement.style.setProperty('--editor-font-size', `${this.fontSize}px`)
  }

  // Load font size from localStorage
  loadFontSize() {
    const savedSize = localStorage.getItem('mindnote-fontSize')
    if (savedSize) {
      this.fontSize = parseInt(savedSize, 10)
    }
    this.applyFontSize()
  }
}

export const notesStore = new NotesStore()
export const uiStore = new UIStore()
