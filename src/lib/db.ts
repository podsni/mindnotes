import Dexie, { type EntityTable } from 'dexie'

export interface Note {
  id?: number
  title: string
  content: string
  createdAt: number
  updatedAt: number
}

const db = new Dexie('MindNoteDB') as Dexie & {
  notes: EntityTable<Note, 'id'>
}

// Schema declaration
db.version(1).stores({
  notes: '++id, title, createdAt, updatedAt'
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
  async createNote(title: string, content: string = ''): Promise<number> {
    const now = Date.now()
    const id = await db.notes.add({
      title,
      content,
      createdAt: now,
      updatedAt: now
    })
    return id as number
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

  // Search notes by title or content
  async searchNotes(query: string): Promise<Note[]> {
    const lowerQuery = query.toLowerCase()
    return await db.notes
      .filter(note => 
        note.title.toLowerCase().includes(lowerQuery) ||
        note.content.toLowerCase().includes(lowerQuery)
      )
      .toArray()
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
