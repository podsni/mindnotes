import Dexie, { type EntityTable } from 'dexie'

export interface Note {
  id?: number
  title: string
  content: string
  createdAt: number
  updatedAt: number
  pinned: boolean
}

// Lightweight metadata for list rendering (performance optimization)
export interface NoteMetadata {
  id: number
  title: string
  preview: string // First 150 chars of content
  createdAt: number
  updatedAt: number
  pinned: boolean
  wordCount: number
  charCount: number
  charCountNoSpaces: number
}

const db = new Dexie('MindNoteDB') as Dexie & {
  notes: EntityTable<Note, 'id'>
}

// Schema declaration with compound indexes for better performance
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

// Version 3: Add compound index for optimized queries
db.version(3).stores({
  notes: '++id, title, createdAt, updatedAt, pinned, [pinned+updatedAt]'
})

export { db }

// Helper function to calculate text statistics
const getTextStats = (content: string) => {
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length
  const charCount = content.length
  const charCountNoSpaces = content.replace(/\s/g, '').length
  return { wordCount, charCount, charCountNoSpaces }
}

// Helper functions untuk CRUD operations
export const noteService = {
  // Get all notes (optimized with limit for initial load)
  async getAllNotes(limit?: number): Promise<Note[]> {
    const query = db.notes.orderBy('updatedAt').reverse()
    return limit ? await query.limit(limit).toArray() : await query.toArray()
  },

  // Get notes metadata only (ultra-fast for list rendering)
  async getNotesMetadata(limit?: number, offset?: number): Promise<NoteMetadata[]> {
    const query = db.notes.orderBy('updatedAt').reverse()
    
    let notes: Note[]
    if (limit !== undefined) {
      notes = offset 
        ? await query.offset(offset).limit(limit).toArray()
        : await query.limit(limit).toArray()
    } else {
      notes = await query.toArray()
    }
    
    return notes.map(note => {
      const stats = getTextStats(note.content)
      return {
        id: note.id!,
        title: note.title,
        preview: note.content.substring(0, 150).trim(),
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        pinned: note.pinned,
        ...stats
      }
    })
  },

  // Get total count (for pagination)
  async getNotesCount(): Promise<number> {
    return await db.notes.count()
  },

  // Get single note by ID (lazy load full content)
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

  // Search notes by title or content (optimized with metadata)
  async searchNotes(query: string, limit: number = 100): Promise<NoteMetadata[]> {
    if (!query.trim()) {
      return await this.getNotesMetadata(limit)
    }
    
    const lowerQuery = query.toLowerCase()
    const words = lowerQuery.split(/\s+/).filter(w => w.length > 0)
    
    // Search in title first (faster), then content
    const titleMatches = await db.notes
      .filter(note => {
        const titleLower = note.title.toLowerCase()
        return words.some(word => titleLower.includes(word))
      })
      .limit(limit)
      .toArray()
    
    const titleIds = new Set(titleMatches.map(n => n.id))
    
    // If we have enough title matches, return early
    if (titleMatches.length >= limit) {
      return titleMatches.map(note => {
        const stats = getTextStats(note.content)
        return {
          id: note.id!,
          title: note.title,
          preview: note.content.substring(0, 150).trim(),
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
          pinned: note.pinned,
          ...stats
        }
      })
    }
    
    // Search in content for remaining slots
    const remainingLimit = limit - titleMatches.length
    const contentMatches = await db.notes
      .filter(note => {
        if (titleIds.has(note.id)) return false // Skip already matched
        const contentLower = note.content.toLowerCase()
        return words.some(word => contentLower.includes(word))
      })
      .limit(remainingLimit)
      .toArray()
    
    const allMatches = [...titleMatches, ...contentMatches]
    
    return allMatches.map(note => {
      const stats = getTextStats(note.content)
      return {
        id: note.id!,
        title: note.title,
        preview: note.content.substring(0, 150).trim(),
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        pinned: note.pinned,
        ...stats
      }
    })
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

  // Export all notes to Markdown
  async exportNotesToMarkdown(): Promise<string> {
    const notes = await db.notes.toArray()
    let markdown = `# MindNote Export\n\nExported on: ${new Date().toLocaleString()}\n\nTotal Notes: ${notes.length}\n\n---\n\n`
    
    for (const note of notes) {
      const date = new Date(note.updatedAt).toLocaleString()
      markdown += `## ${note.title}\n\n`
      markdown += `*Updated: ${date}*${note.pinned ? ' 📌 **Pinned**' : ''}\n\n`
      markdown += `${note.content}\n\n`
      markdown += `---\n\n`
    }
    
    return markdown
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
  },

  // Import from Markdown (basic parser)
  async importFromMarkdown(markdown: string): Promise<number> {
    try {
      // Split by --- separator
      const sections = markdown.split(/\n---\n+/)
      let imported = 0
      
      for (const section of sections) {
        // Skip empty sections and header
        if (!section.trim() || section.includes('# MindNote Export')) continue
        
        // Extract title (first ## heading)
        const titleMatch = section.match(/##\s+(.+)/)
        if (!titleMatch) continue
        
        const title = titleMatch[1].trim()
        
        // Extract content (everything after the metadata line)
        const contentMatch = section.match(/\*Updated:.*\*.*?\n\n([\s\S]+)/)
        const content = contentMatch ? contentMatch[1].trim() : ''
        
        // Check if pinned
        const pinned = section.includes('📌 **Pinned**')
        
        if (title) {
          await this.createNote(title, content, pinned)
          imported++
        }
      }
      
      return imported
    } catch (error) {
      console.error('Markdown import failed:', error)
      throw new Error('Invalid Markdown format')
    }
  },

  // Get backlinks for a note (notes that link to this note)
  async getBacklinks(noteId: number): Promise<NoteMetadata[]> {
    const currentNote = await db.notes.get(noteId)
    if (!currentNote) return []
    
    // Search for [[noteId]] or [[title]] in content
    const idPattern = `[[${noteId}]]`
    const titleLower = currentNote.title.toLowerCase()
    
    const backlinks = await db.notes
      .filter(note => {
        if (note.id === noteId) return false
        
        const content = note.content.toLowerCase()
        // Check for [[id]] or [[title]] pattern
        return content.includes(`[[${noteId}]]`) || 
               content.includes(`[[${titleLower}]]`)
      })
      .toArray()
    
    return backlinks.map(note => {
      const stats = getTextStats(note.content)
      return {
        id: note.id!,
        title: note.title,
        preview: note.content.substring(0, 150).trim(),
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        pinned: note.pinned,
        ...stats
      }
    })
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
