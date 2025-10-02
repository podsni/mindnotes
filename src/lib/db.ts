import Dexie, { type EntityTable } from 'dexie'

export interface Note {
  id?: number
  title: string
  content: string
  createdAt: number
  updatedAt: number
  pinned: boolean
}

const db = new Dexie('MindNoteDB') as Dexie & {
  notes: EntityTable<Note, 'id'>
}

// Schema declaration with indexes for better performance
db.version(1).stores({
  notes: '++id, title, createdAt, updatedAt'
})

// Version 2: Add pinned field
db.version(2).stores({
  notes: '++id, title, createdAt, updatedAt, pinned'
}).upgrade(tx => {
  // Migrate existing notes to have pinned: false
  return tx.table('notes').toCollection().modify(note => {
    note.pinned = false
  })
})

export { db }

// Helper functions untuk CRUD operations
export const noteService = {
  // Get all notes
  async getAllNotes(): Promise<Note[]> {
    return await db.notes.orderBy('updatedAt').reverse().toArray()
  },

  // Get single note by ID
  async getNote(id: number): Promise<Note | undefined> {
    return await db.notes.get(id)
  },

  // Create new note
  async createNote(title: string, content: string = '', pinned: boolean = false): Promise<number> {
    const now = Date.now()
    const id = await db.notes.add({
      title,
      content,
      createdAt: now,
      updatedAt: now,
      pinned
    })
    return id as number
  },

  // Get pinned notes
  async getPinnedNotes(): Promise<Note[]> {
    return await db.notes.where('pinned').equals(1).sortBy('updatedAt').then(notes => notes.reverse())
  },

  // Toggle pin status
  async togglePin(id: number): Promise<void> {
    const note = await db.notes.get(id)
    if (note) {
      await db.notes.update(id, { pinned: !note.pinned })
    }
  },

  // Update existing note
  async updateNote(id: number, updates: Partial<Note>): Promise<number> {
    return await db.notes.update(id, {
      ...updates,
      updatedAt: Date.now()
    })
  },

  // Delete note
  async deleteNote(id: number): Promise<void> {
    await db.notes.delete(id)
  },

  // Search notes by title or content (indexed search)
  async searchNotes(query: string): Promise<Note[]> {
    const lowerQuery = query.toLowerCase()
    return await db.notes
      .filter(note => 
        note.title.toLowerCase().includes(lowerQuery) ||
        note.content.toLowerCase().includes(lowerQuery)
      )
      .toArray()
  },

  // Export all notes to JSON
  async exportNotes(): Promise<string> {
    const notes = await db.notes.toArray()
    const exportData = {
      version: 1,
      exportDate: new Date().toISOString(),
      notes
    }
    return JSON.stringify(exportData, null, 2)
  },

  // Import notes from JSON
  async importNotes(jsonString: string): Promise<number> {
    try {
      const importData = JSON.parse(jsonString)
      const notes = importData.notes || []
      
      let imported = 0
      for (const note of notes) {
        // Remove id to avoid conflicts
        const { id, ...noteData } = note
        await db.notes.add({ ...noteData, pinned: noteData.pinned || false })
        imported++
      }
      
      return imported
    } catch (error) {
      console.error('Import failed:', error)
      throw new Error('Invalid JSON format')
    }
  }
}

// Request persistent storage
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist().then(persistent => {
    if (persistent) {
      console.log('Storage will not be cleared automatically')
    }
  })
}
