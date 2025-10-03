// Markdown utilities with cross-note linking support
import { marked } from 'marked'
import type { Note } from './db'
import hljs from 'highlight.js'
import DOMPurify from 'dompurify'
import katex from 'katex'
import mermaid from 'mermaid'

// Initialize Mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
})

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true
})

// Custom renderer for cross-note links [[note-id]]
const renderer = new marked.Renderer()

// Minimal interface for cross-linking (only need id and title)
interface NoteLinkData {
  id?: number
  title: string
}

// Store reference to notes for linking
let notesCache: NoteLinkData[] = []

export function setNotesCache(notes: NoteLinkData[]) {
  notesCache = notes
}

// Override code rendering for Mermaid diagrams
renderer.code = (code) => {
  const codeStr = typeof code === 'string' ? code : code.text
  const lang = typeof code === 'string' ? '' : code.lang || ''
  
  // Handle Mermaid diagrams
  if (lang === 'mermaid') {
    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`
    // Return a container that will be rendered by Mermaid later
    return `<div class="mermaid-diagram" data-mermaid-id="${id}">${codeStr}</div>`
  }
  
  // Handle syntax highlighting for code blocks
  let highlighted = codeStr
  if (lang && hljs.getLanguage(lang)) {
    try {
      highlighted = hljs.highlight(codeStr, { language: lang }).value
    } catch (err) {
      console.error('Highlight error:', err)
    }
  } else {
    highlighted = hljs.highlightAuto(codeStr).value
  }
  
  return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`
}

// Override link rendering to support [[...]] syntax
const originalTextRenderer = renderer.text.bind(renderer)
renderer.text = (text) => {
  // Replace [[note-title]] or [[note-id]] with actual links
  const linkRegex = /\[\[([^\]]+)\]\]/g
  
  const textStr = typeof text === 'string' ? text : text.text
  let replaced = textStr.replace(linkRegex, (_match: string, content: string) => {
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
  
  // Handle inline math $...$ and block math $$...$$
  // Block math first ($$...$$)
  replaced = replaced.replace(/\$\$([^\$]+)\$\$/g, (_match: string, math: string) => {
    try {
      return katex.renderToString(math.trim(), {
        displayMode: true,
        throwOnError: false
      })
    } catch (err) {
      return `<span class="math-error">Math Error: ${math}</span>`
    }
  })
  
  // Inline math ($...$)
  replaced = replaced.replace(/\$([^\$]+)\$/g, (_match: string, math: string) => {
    try {
      return katex.renderToString(math.trim(), {
        displayMode: false,
        throwOnError: false
      })
    } catch (err) {
      return `<span class="math-error">Math Error: ${math}</span>`
    }
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

// Render Mermaid diagrams after DOM insertion
export async function renderMermaidDiagrams(container: HTMLElement) {
  const diagrams = container.querySelectorAll('.mermaid-diagram')
  
  for (const diagram of diagrams) {
    const id = diagram.getAttribute('data-mermaid-id')
    const code = diagram.textContent || ''
    
    try {
      const { svg } = await mermaid.render(`mermaid-${id}`, code)
      diagram.innerHTML = svg
    } catch (err) {
      console.error('Mermaid render error:', err)
      diagram.innerHTML = `<div class="mermaid-error">Mermaid Error: ${err}</div>`
    }
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

// Sanitize HTML to prevent XSS using DOMPurify
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['svg', 'g', 'path', 'rect', 'circle', 'line', 'text', 'tspan', 'foreignObject'],
    ADD_ATTR: ['style', 'class', 'id', 'data-mermaid-id', 'transform', 'viewBox', 'xmlns', 'xmlns:xlink', 'x', 'y', 'width', 'height', 'fill', 'stroke', 'stroke-width', 'd', 'cx', 'cy', 'r', 'x1', 'y1', 'x2', 'y2', 'font-size', 'text-anchor']
  })
}
