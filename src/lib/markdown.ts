// Markdown utilities with cross-note linking support
import { marked } from 'marked'
import type { Note } from './db'
import hljs from 'highlight.js'
import DOMPurify from 'dompurify'
import katex from 'katex'

// ⚡ Performance Optimization: Lazy load Mermaid
let mermaidModule: typeof import('mermaid') | null = null
let mermaidInitialized = false

async function loadMermaid() {
  if (!mermaidModule) {
    mermaidModule = await import('mermaid')
  }
  if (!mermaidInitialized) {
    mermaidModule.default.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
    })
    mermaidInitialized = true
  }
  return mermaidModule.default
}

// ⚡ Performance Optimization: Aggressive markdown parsing cache with TTL
const markdownCache = new Map<string, { html: string, timestamp: number }>()
const MAX_CACHE_SIZE = 200 // Increased cache size
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes TTL

// ⚡ Realtime: Track content changes for incremental updates
let lastParsedContent = ''
let lastParsedResult = ''

function getCachedOrParse(content: string, parser: () => string): string {
  // ⚡ Instant return for unchanged content (realtime optimization)
  if (content === lastParsedContent) {
    return lastParsedResult
  }
  
  const cached = markdownCache.get(content)
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    lastParsedContent = content
    lastParsedResult = cached.html
    return cached.html
  }
  
  const result = parser()
  
  // LRU-like cache eviction
  if (markdownCache.size >= MAX_CACHE_SIZE) {
    // Remove oldest entry
    let oldestKey: string | undefined
    let oldestTime = Infinity
    for (const [key, value] of markdownCache.entries()) {
      if (value.timestamp < oldestTime) {
        oldestTime = value.timestamp
        oldestKey = key
      }
    }
    if (oldestKey) {
      markdownCache.delete(oldestKey)
    }
  }
  
  markdownCache.set(content, { html: result, timestamp: Date.now() })
  lastParsedContent = content
  lastParsedResult = result
  return result
}

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true
})

// Custom renderer for cross-note links [[note-id]]
const renderer = new marked.Renderer()

// Override list item rendering to support task lists
renderer.listitem = (text) => {
  const textStr = typeof text === 'string' ? text : text.text
  
  // Check for task list syntax: - [ ] or - [x]
  const uncheckedMatch = textStr.match(/^\s*\[ \]\s+(.*)/)
  const checkedMatch = textStr.match(/^\s*\[x\]\s+(.*)/)
  
  if (uncheckedMatch) {
    const content = uncheckedMatch[1]
    return `<li class="task-list-item">
      <input type="checkbox" class="task-checkbox" disabled />
      <span class="task-content">${content}</span>
    </li>`
  }
  
  if (checkedMatch) {
    const content = checkedMatch[1]
    return `<li class="task-list-item">
      <input type="checkbox" class="task-checkbox" checked disabled />
      <span class="task-content">${content}</span>
    </li>`
  }
  
  // Regular list item
  return `<li>${textStr}</li>`
}

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

// ⚡ Performance: Code highlighting cache
const highlightCache = new Map<string, string>()
const MAX_HIGHLIGHT_CACHE = 100

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
  
  // ⚡ Performance: Check cache first
  const cacheKey = `${lang}:${codeStr}`
  if (highlightCache.has(cacheKey)) {
    return highlightCache.get(cacheKey)!
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
    // ⚡ Auto-detect only for small code blocks (< 500 chars)
    if (codeStr.length < 500) {
      highlighted = hljs.highlightAuto(codeStr).value
    }
  }
  
  const result = `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`
  
  // Cache the result
  if (highlightCache.size >= MAX_HIGHLIGHT_CACHE) {
    const firstKey = highlightCache.keys().next().value
    if (firstKey) highlightCache.delete(firstKey)
  }
  highlightCache.set(cacheKey, result)
  
  return result
}

// ⚡ Performance: LaTeX rendering cache
const latexCache = new Map<string, string>()
const MAX_LATEX_CACHE = 200

function renderLatexCached(latex: string, displayMode: boolean, trust: boolean = false): string {
  const cacheKey = `${displayMode ? 'd' : 'i'}:${trust ? 't' : 'f'}:${latex}`
  
  if (latexCache.has(cacheKey)) {
    return latexCache.get(cacheKey)!
  }
  
  try {
    const rendered = katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      trust
    })
    
    // Cache the result
    if (latexCache.size >= MAX_LATEX_CACHE) {
      const firstKey = latexCache.keys().next().value
      if (firstKey) latexCache.delete(firstKey)
    }
    latexCache.set(cacheKey, rendered)
    
    return rendered
  } catch (err) {
    return `<span class="math-error">Math Error: ${err}</span>`
  }
}

// Process LaTeX math expressions
function processMath(text: string): string {
  // Handle LaTeX environments (multi-line) like \begin{align}...\end{align}
  // Support: equation, align, gather, alignat, multline, array, matrix, etc.
  const latexEnvs = [
    'equation', 'equation\\*',
    'align', 'align\\*',
    'gather', 'gather\\*',
    'alignat', 'alignat\\*',
    'multline', 'multline\\*',
    'split',
    'array',
    'matrix', 'pmatrix', 'bmatrix', 'Bmatrix', 'vmatrix', 'Vmatrix',
    'cases', 'aligned', 'gathered'
  ]
  
  // Create regex pattern for all environments
  const envPattern = latexEnvs.join('|')
  const latexEnvRegex = new RegExp(
    `\\\\begin\\{(${envPattern})\\}([\\s\\S]*?)\\\\end\\{\\1\\}`,
    'g'
  )
  
  let replaced = text.replace(latexEnvRegex, (_match: string, env: string, content: string) => {
    const fullLatex = `\\begin{${env}}${content}\\end{${env}}`
    return renderLatexCached(fullLatex, true, true)
  })
  
  // Handle block math mode \[...\]
  replaced = replaced.replace(/\\\[([\s\S]*?)\\\]/g, (_match: string, math: string) => {
    return renderLatexCached(math.trim(), true, false)
  })
  
  // Handle block math $$...$$
  replaced = replaced.replace(/\$\$([\s\S]*?)\$\$/g, (_match: string, math: string) => {
    return renderLatexCached(math.trim(), true, false)
  })
  
  // Handle inline math $...$
  replaced = replaced.replace(/\$([^\$]+)\$/g, (_match: string, math: string) => {
    return renderLatexCached(math.trim(), false, false)
  })
  
  return replaced
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
  
  // Process math expressions (inline and block)
  replaced = processMath(replaced)
  
  return replaced
}

// Preprocess markdown to handle LaTeX environments at document level
function preprocessLatex(markdown: string): string {
  // First, handle block math mode \[...\]
  let processed = markdown.replace(/\\\[([\s\S]*?)\\\]/g, (_match: string, math: string) => {
    try {
      const rendered = katex.renderToString(math.trim(), {
        displayMode: true,
        throwOnError: false
      })
      return `\n\n<div class="latex-block">${rendered}</div>\n\n`
    } catch (err) {
      return `\n\n<div class="math-error">LaTeX Error in block math: ${err}</div>\n\n`
    }
  })
  
  // Handle block math $$...$$ at document level
  processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_match: string, math: string) => {
    try {
      const rendered = katex.renderToString(math.trim(), {
        displayMode: true,
        throwOnError: false
      })
      return `\n\n<div class="latex-block">${rendered}</div>\n\n`
    } catch (err) {
      return `\n\n<div class="math-error">LaTeX Error in block math: ${err}</div>\n\n`
    }
  })
  
  // LaTeX environments that should be rendered as display math blocks
  const latexEnvs = [
    'equation', 'equation\\*',
    'align', 'align\\*',
    'gather', 'gather\\*',
    'alignat', 'alignat\\*',
    'multline', 'multline\\*',
    'split',
    'array',
    'matrix', 'pmatrix', 'bmatrix', 'Bmatrix', 'vmatrix', 'Vmatrix',
    'cases', 'aligned', 'gathered'
  ]
  
  const envPattern = latexEnvs.join('|')
  const latexEnvRegex = new RegExp(
    `\\\\begin\\{(${envPattern})\\}([\\s\\S]*?)\\\\end\\{\\1\\}`,
    'g'
  )
  
  // Replace LaTeX environments with rendered HTML
  return processed.replace(latexEnvRegex, (_match: string, env: string, content: string) => {
    try {
      const fullLatex = `\\begin{${env}}${content}\\end{${env}}`
      const rendered = katex.renderToString(fullLatex, {
        displayMode: true,
        throwOnError: false,
        trust: true
      })
      // Wrap in a special marker to prevent markdown processing
      return `\n\n<div class="latex-block">${rendered}</div>\n\n`
    } catch (err) {
      return `\n\n<div class="math-error">LaTeX Error in \\begin{${env}}: ${err}</div>\n\n`
    }
  })
}

// Parse markdown to HTML with caching
export function parseMarkdown(markdown: string): string {
  return getCachedOrParse(markdown, () => {
    try {
      // Preprocess LaTeX environments first
      const preprocessed = preprocessLatex(markdown)
      return marked(preprocessed, { renderer }) as string
    } catch (error) {
      console.error('Markdown parse error:', error)
      return markdown
    }
  })
}

// ⚡ Performance: Render Mermaid diagrams with lazy loading
export async function renderMermaidDiagrams(
  container: HTMLElement, 
  onZoomClick?: (svg: string) => void
) {
  const diagrams = container.querySelectorAll('.mermaid-diagram')
  
  // If no diagrams, don't load Mermaid at all!
  if (diagrams.length === 0) return
  
  // Lazy load Mermaid only when needed
  const mermaid = await loadMermaid()
  
  for (const diagram of diagrams) {
    const id = diagram.getAttribute('data-mermaid-id')
    const code = diagram.textContent || ''
    
    try {
      const { svg } = await mermaid.render(`mermaid-${id}`, code)
      
      // Create wrapper with zoom button
      const wrapper = document.createElement('div')
      wrapper.className = 'mermaid-wrapper'
      
      const svgContainer = document.createElement('div')
      svgContainer.className = 'mermaid-svg-container'
      svgContainer.innerHTML = svg
      
      // Add zoom button if callback provided
      if (onZoomClick) {
        const zoomBtn = document.createElement('button')
        zoomBtn.className = 'mermaid-zoom-btn'
        zoomBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span>Zoom</span>
        `
        zoomBtn.title = 'View full diagram (interactive)'
        zoomBtn.onclick = (e) => {
          e.stopPropagation()
          onZoomClick(svg)
        }
        
        wrapper.appendChild(zoomBtn)
      }
      
      wrapper.appendChild(svgContainer)
      diagram.innerHTML = ''
      diagram.appendChild(wrapper)
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
