// Markdown utilities with cross-note linking support
import { marked } from 'marked'
import type { Note } from './db'

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true,
})

// Custom renderer for cross-note links [[note-id]]
const renderer = new marked.Renderer()

// Store reference to notes for linking
let notesCache: Note[] = []

export function setNotesCache(notes: Note[]) {
  notesCache = notes
}

// Override link rendering to support [[...]] syntax
const originalTextRenderer = renderer.text.bind(renderer)
renderer.text = (text) => {
  // Replace [[note-title]] or [[note-id]] with actual links
  const linkRegex = /\[\[([^\]]+)\]\]/g
  
  const textStr = typeof text === 'string' ? text : text.text
  const replaced = textStr.replace(linkRegex, (_match: string, content: string) => {
    // Try to find note by ID first
    const byId = notesCache.find(n => n.id?.toString() === content)
    if (byId) {
      return `<a href="#/note/${byId.id}" class="note-link" data-note-id="${byId.id}">${byId.title}</a>`
    }
    
    // Try to find by title (case-insensitive)
    const byTitle = notesCache.find(n => 
      n.title.toLowerCase() === content.toLowerCase()
    )
    if (byTitle) {
      return `<a href="#/note/${byTitle.id}" class="note-link" data-note-id="${byTitle.id}">${byTitle.title}</a>`
    }
    
    // If not found, create a "create new note" link
    return `<span class="note-link-missing" title="Note not found: ${content}">[[${content}]]</span>`
  })
  
  return replaced
}

// Parse markdown to HTML
export function parseMarkdown(markdown: string): string {
  try {
    return marked(markdown, { renderer }) as string
  } catch (error) {
    console.error('Markdown parse error:', error)
    return markdown
  }
}

// Extract all note links from markdown
export function extractNoteLinks(markdown: string): string[] {
  const linkRegex = /\[\[([^\]]+)\]\]/g
  const links: string[] = []
  let match
  
  while ((match = linkRegex.exec(markdown)) !== null) {
    links.push(match[1])
  }
  
  return links
}

// Get backlinks for a note (notes that link to this note)
export function getBacklinks(noteId: number, allNotes: Note[]): Note[] {
  const currentNote = allNotes.find(n => n.id === noteId)
  if (!currentNote) return []
  
  const backlinks: Note[] = []
  
  for (const note of allNotes) {
    if (note.id === noteId) continue
    
    const links = extractNoteLinks(note.content)
    const hasLink = links.some(link => {
      // Check if link matches by ID or title
      return link === noteId.toString() || 
             link.toLowerCase() === currentNote.title.toLowerCase()
    })
    
    if (hasLink) {
      backlinks.push(note)
    }
  }
  
  return backlinks
}

// Sanitize HTML to prevent XSS
export function sanitizeHtml(html: string): string {
  // Basic sanitization - in production, use DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '')
}
