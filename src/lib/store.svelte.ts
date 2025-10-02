import { noteService, type Note } from './db'

// Global state using Svelte 5 runes
class NotesStore {
  notes: Note[] = $state([])
  currentNote: Note | null = $state(null)
  isLoading: boolean = $state(false)
  searchQuery: string = $state('')

  // Load all notes from IndexedDB
  async loadNotes() {
    this.isLoading = true
    try {
      this.notes = await noteService.getAllNotes()
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
}

export const notesStore = new NotesStore()
