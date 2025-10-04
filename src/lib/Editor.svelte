<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { notesStore, uiStore } from './store.svelte'
  import { router } from './router'
  import MarkdownPreview from './MarkdownPreview.svelte'
  import { noteService, type NoteMetadata } from './db'
  import EditorToolbar from './EditorToolbar.svelte'
  import OutlineView from './OutlineView.svelte'
  import * as imageHandler from './ImageHandler.svelte'
  import * as commands from './editorCommands'

  interface Props {
    id: string
  }

  let { id }: Props = $props()
  
  let titleInput: HTMLInputElement | undefined = $state()
  let contentTextarea: HTMLTextAreaElement | undefined = $state()
  let previewMode = $state(false)
  let splitView = $state(false)
  let backlinks = $state<NoteMetadata[]>([])
  let isDragging = $state(false)
  let showOutline = $state(false)
  let showToolbar = $state(true)
  
  // Local content for instant preview update (no debounce delay)
  let localContent = $state('')
  
  // Scroll sync for split view
  let previewPane: HTMLDivElement | undefined = $state()
  let isScrollingSynced = $state(false) // Prevent infinite loop
  let scrollSyncTimeout: number | null = null
  
  // Load note when component mounts or ID changes
  $effect(() => {
    const noteId = parseInt(id)
    if (!isNaN(noteId)) {
      notesStore.loadNote(noteId)
      // Load backlinks
      loadBacklinks(noteId)
    }
  })
  
  // Sync localContent with store content
  $effect(() => {
    if (notesStore.currentNote) {
      localContent = notesStore.currentNote.content
    }
  })

  // Load backlinks from database
  const loadBacklinks = async (noteId: number) => {
    backlinks = await noteService.getBacklinks(noteId)
  }

  const handleTitleChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    const noteId = parseInt(id)
    if (!isNaN(noteId)) {
      notesStore.updateNote(noteId, { title: target.value })
    }
  }

  const handleContentChange = (e: Event) => {
    const target = e.target as HTMLTextAreaElement
    const noteId = parseInt(id)
    
    // Update local content instantly for real-time preview
    localContent = target.value
    
    // Update store (will debounce save to DB)
    if (!isNaN(noteId)) {
      notesStore.updateNote(noteId, { content: target.value })
    }
    // Auto-resize textarea on mobile
    autoResizeTextarea(target)
  }

  // Update content from commands
  const updateContent = (newContent: string) => {
    const noteId = parseInt(id)
    
    // Update local content instantly for real-time preview
    localContent = newContent
    
    // Update store (will debounce save to DB)
    if (!isNaN(noteId)) {
      notesStore.updateNote(noteId, { content: newContent })
    }
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this note?')) {
      const noteId = parseInt(id)
      if (!isNaN(noteId)) {
        await notesStore.deleteNote(noteId)
        router.navigate('/')
      }
    }
  }

  const handleTogglePin = async () => {
    const noteId = parseInt(id)
    if (!isNaN(noteId)) {
      await notesStore.togglePin(noteId)
    }
  }

  const handleNewNote = async () => {
    const newId = await notesStore.createNote('New Note', '')
    router.navigate(`/note/${newId}`)
  }

  const togglePreview = () => {
    previewMode = !previewMode
    if (previewMode) {
      splitView = false // Disable split view when entering full preview
    }
  }

  const toggleSplitView = () => {
    splitView = !splitView
    if (splitView) {
      previewMode = false // Disable full preview when entering split view
    }
  }

  const toggleOutline = () => {
    showOutline = !showOutline
  }

  // Toolbar action handlers
  const handleBold = () => {
    if (!contentTextarea) return
    const newContent = commands.toggleWrap(contentTextarea, '**')
    updateContent(newContent)
  }

  const handleItalic = () => {
    if (!contentTextarea) return
    const newContent = commands.toggleWrap(contentTextarea, '*')
    updateContent(newContent)
  }

  const handleStrikethrough = () => {
    if (!contentTextarea) return
    const newContent = commands.toggleWrap(contentTextarea, '~~')
    updateContent(newContent)
  }

  const handleCode = () => {
    if (!contentTextarea) return
    const newContent = commands.toggleWrap(contentTextarea, '`')
    updateContent(newContent)
  }

  const handleLink = () => {
    if (!contentTextarea) return
    const url = prompt('Enter URL:')
    if (url) {
      const newContent = commands.insertLink(contentTextarea, url)
      updateContent(newContent)
    }
  }

  const handleImage = () => {
    if (!contentTextarea) return
    const url = prompt('Enter image URL (or paste image directly):')
    if (url) {
      // Check if it's a URL or try to fetch it
      imageHandler.urlToBase64(url).then(base64 => {
        const newContent = commands.insertImage(contentTextarea!, base64)
        updateContent(newContent)
      })
    }
  }

  const handleHeading = (level: number) => {
    if (!contentTextarea) return
    const newContent = commands.insertHeading(contentTextarea, level)
    updateContent(newContent)
  }

  const handleList = (ordered: boolean) => {
    if (!contentTextarea) return
    const newContent = commands.insertListItem(contentTextarea, ordered)
    updateContent(newContent)
  }

  const handleCheckbox = () => {
    if (!contentTextarea) return
    const newContent = commands.insertTaskItem(contentTextarea)
    updateContent(newContent)
  }

  const handleTable = () => {
    if (!contentTextarea) return
    const newContent = commands.insertTable(contentTextarea, 3, 3)
    updateContent(newContent)
  }

  // Scroll to header from outline
  const handleHeaderClick = (headerId: string) => {
    if (!contentTextarea) return
    
    // Find the header in content
    const lines = contentTextarea.value.split('\n')
    let lineNumber = 0
    
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/^(#{1,6})\s+(.+)$/)
      if (match) {
        const text = match[2].trim()
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
        
        if (id === headerId) {
          lineNumber = i
          break
        }
      }
    }
    
    // Scroll to line
    const lineHeight = 24 // Approximate line height
    contentTextarea.scrollTop = lineNumber * lineHeight
    contentTextarea.focus()
  }

  // Scroll synchronization between editor and preview (real-time)
  const handleEditorScroll = (e: Event) => {
    if (!splitView || !contentTextarea || !previewPane || isScrollingSynced) return
    
    const target = e.target as HTMLElement
    const maxScroll = target.scrollHeight - target.clientHeight
    
    // Prevent division by zero
    if (maxScroll <= 0) return
    
    const scrollPercentage = target.scrollTop / maxScroll
    
    // Use requestAnimationFrame for smooth sync
    isScrollingSynced = true
    requestAnimationFrame(() => {
      if (previewPane) {
        const previewMaxScroll = previewPane.scrollHeight - previewPane.clientHeight
        previewPane.scrollTop = scrollPercentage * previewMaxScroll
      }
      // Reset flag after a short delay
      setTimeout(() => { isScrollingSynced = false }, 10)
    })
  }

  const handlePreviewScroll = (e: Event) => {
    if (!splitView || !contentTextarea || !previewPane || isScrollingSynced) return
    
    const target = e.target as HTMLElement
    const maxScroll = target.scrollHeight - target.clientHeight
    
    // Prevent division by zero
    if (maxScroll <= 0) return
    
    const scrollPercentage = target.scrollTop / maxScroll
    
    // Use requestAnimationFrame for smooth sync
    isScrollingSynced = true
    requestAnimationFrame(() => {
      if (contentTextarea) {
        const textareaMaxScroll = contentTextarea.scrollHeight - contentTextarea.clientHeight
        contentTextarea.scrollTop = scrollPercentage * textareaMaxScroll
      }
      // Reset flag after a short delay
      setTimeout(() => { isScrollingSynced = false }, 10)
    })
  }

  // Cleanup on destroy
  onDestroy(() => {
    if (scrollSyncTimeout) cancelAnimationFrame(scrollSyncTimeout)
  })

  // Handle drag and drop
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    isDragging = true
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    isDragging = false
  }

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault()
    isDragging = false

    const files = e.dataTransfer?.files
    if (!files || files.length === 0) return

    if (!contentTextarea) return

    // Use new image handler
    const imageMarkdowns = await imageHandler.handleImageDrop(files)
    
    for (const imageMarkdown of imageMarkdowns) {
      const newContent = imageHandler.insertImageAtCursor(contentTextarea, imageMarkdown)
      updateContent(newContent)
    }
  }

  // Handle paste event for images and URLs
  const handlePaste = async (e: ClipboardEvent) => {
    if (!contentTextarea) return

    const imageMarkdown = await imageHandler.handleImagePaste(e)
    if (imageMarkdown) {
      e.preventDefault()
      const newContent = imageHandler.insertImageAtCursor(contentTextarea, imageMarkdown)
      updateContent(newContent)
    }
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!contentTextarea) return

    const ctrl = e.ctrlKey || e.metaKey
    
    // Tab for list indentation
    if (e.key === 'Tab') {
      e.preventDefault()
      const newContent = commands.handleTab(contentTextarea, e.shiftKey)
      updateContent(newContent)
      return
    }

    // Ctrl+B for bold
    if (ctrl && e.key === 'b') {
      e.preventDefault()
      const newContent = commands.toggleWrap(contentTextarea, '**')
      updateContent(newContent)
      return
    }

    // Ctrl+I for italic
    if (ctrl && e.key === 'i') {
      e.preventDefault()
      const newContent = commands.toggleWrap(contentTextarea, '*')
      updateContent(newContent)
      return
    }

    // Ctrl+Shift+X for strikethrough
    if (ctrl && e.shiftKey && e.key === 'X') {
      e.preventDefault()
      const newContent = commands.toggleWrap(contentTextarea, '~~')
      updateContent(newContent)
      return
    }

    // Ctrl+` for inline code
    if (ctrl && e.key === '`') {
      e.preventDefault()
      const newContent = commands.toggleWrap(contentTextarea, '`')
      updateContent(newContent)
      return
    }

    // Ctrl+K for link
    if (ctrl && e.key === 'k') {
      e.preventDefault()
      const url = prompt('Enter URL:')
      if (url) {
        const newContent = commands.insertLink(contentTextarea, url)
        updateContent(newContent)
      }
      return
    }
  }

  // Auto-resize textarea for mobile
  const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    if (uiStore.isMobile) {
      textarea.style.height = 'auto'
      textarea.style.height = textarea.scrollHeight + 'px'
    }
  }

  // Focus title on mount
  onMount(() => {
    titleInput?.focus()
    // Initial textarea resize
    if (contentTextarea) {
      autoResizeTextarea(contentTextarea)
    }
  })

  // Cleanup on unmount
  onDestroy(() => {
    notesStore.clearCurrentNote()
  })
</script>

<div class="editor">
  {#if notesStore.currentNote}
    <div class="editor-header">
      <input
        bind:this={titleInput}
        type="text"
        class="title-input editor-title"
        value={notesStore.currentNote.title}
        oninput={handleTitleChange}
        placeholder="Note title..."
      />
      <div class="header-actions">
        <button 
          onclick={toggleOutline} 
          class="btn-outline" 
          class:active={showOutline}
          title={showOutline ? 'Hide outline' : 'Show outline (TOC)'}
        >
          📋
        </button>
        <button 
          onclick={toggleSplitView} 
          class="btn-split" 
          class:active={splitView}
          title={splitView ? 'Exit split view' : 'Split view (editor ⬅➡ preview)'}
        >
          ⬅➡
        </button>
        <button 
          onclick={togglePreview} 
          class="btn-preview" 
          class:active={previewMode}
          title={previewMode ? 'Edit mode' : 'Preview mode'}
        >
          {previewMode ? '✏️' : '👁️'}
        </button>
        <button 
          onclick={handleTogglePin} 
          class="btn-pin" 
          class:pinned={notesStore.currentNote.pinned}
          title={notesStore.currentNote.pinned ? 'Unpin note' : 'Pin note'}
        >
          {notesStore.currentNote.pinned ? '📍' : '📌'}
        </button>
        <button onclick={handleDelete} class="btn-delete" title="Delete note">
          🗑️
        </button>
      </div>
    </div>

    <!-- Editor Toolbar -->
    {#if showToolbar && !previewMode}
      <EditorToolbar
        onBold={handleBold}
        onItalic={handleItalic}
        onStrikethrough={handleStrikethrough}
        onCode={handleCode}
        onLink={handleLink}
        onImage={handleImage}
        onHeading={handleHeading}
        onList={handleList}
        onCheckbox={handleCheckbox}
        onTable={handleTable}
      />
    {/if}

    
    <div 
      class="editor-content" 
      class:split-view={splitView}
      class:with-outline={showOutline}
      class:dragging={isDragging}
      ondragover={handleDragOver}
      ondragleave={handleDragLeave}
      ondrop={handleDrop}
      role="application"
      aria-label="Note editor with drag and drop support"
    >
      {#if previewMode}
        <MarkdownPreview content={localContent} mode="full" />
        {:else if splitView}
          <!-- Split view: editor on left, preview on right, outline on far right -->
          <div class="split-container">
            <div class="split-pane editor-pane">
              <textarea
                bind:this={contentTextarea}
                bind:value={localContent}
                class="content-textarea editor-text split-textarea"
                oninput={handleContentChange}
                onpaste={handlePaste}
                onkeydown={handleKeyDown}
                onscroll={handleEditorScroll}
                placeholder="Start writing your note... 

✨ Shortcuts:
• Ctrl+B: Bold
• Ctrl+I: Italic
• Ctrl+Shift+X: Strikethrough
• Ctrl+`: Code
• Ctrl+K: Link
• Tab/Shift+Tab: Indent/Unindent lists

📝 Features:
• Drag & drop images
• Paste images from clipboard
• Type image URL and it will auto-convert
• Headers: # H1, ## H2, ### H3
• Links: [[note-title]] or [text](url)
• Math: $inline$, $$block$$
• Mermaid: ```mermaid
• Lists: - bullet, 1. numbered, - [ ] task"
              ></textarea>
            </div>
            <div class="split-divider"></div>
            <div 
              class="split-pane preview-pane" 
              bind:this={previewPane}
              onscroll={handlePreviewScroll}
            >
              <MarkdownPreview content={localContent} mode="split" />
            </div>
            {#if showOutline}
              <div class="split-divider"></div>
              <div class="split-pane outline-pane">
                <OutlineView 
                  content={localContent}
                  onHeaderClick={handleHeaderClick}
                />
              </div>
            {/if}
          </div>
        {:else}
          <div class="edit-container">
            <textarea
              bind:this={contentTextarea}
              bind:value={localContent}
              class="content-textarea editor-text"
              oninput={handleContentChange}
              onpaste={handlePaste}
              onkeydown={handleKeyDown}
              placeholder="Start writing your note... 

✨ Shortcuts:
• Ctrl+B: Bold
• Ctrl+I: Italic
• Ctrl+Shift+X: Strikethrough
• Ctrl+`: Code
• Ctrl+K: Link
• Tab/Shift+Tab: Indent/Unindent lists

📝 Features:
• Drag & drop images
• Paste images from clipboard
• Type image URL and it will auto-convert
• Headers: # H1, ## H2, ### H3
• Links: [[note-title]] or [text](url)
• Math: $inline$, $$block$$
• Mermaid: ```mermaid
• Lists: - bullet, 1. numbered, - [ ] task"
            ></textarea>
            {#if showOutline}
              <div class="outline-sidebar">
                <OutlineView 
                  content={localContent}
                  onHeaderClick={handleHeaderClick}
                />
              </div>
            {/if}
          </div>
      {/if}
      
      <!-- Drag overlay -->
      {#if isDragging}
        <div class="drag-overlay">
          <div class="drag-message">
            📁 Drop files here to embed
          </div>
        </div>
      {/if}
    </div>

    <div class="editor-footer">
      <div class="footer-left">
        <span class="word-count" title="Detailed statistics">
          📊 {localContent.split(/\s+/).filter(w => w.length > 0).length} words · 
          {localContent.length} characters · 
          {localContent.replace(/\s/g, '').length} chars (no spaces)
        </span>
        {#if backlinks.length > 0}
          <span class="backlinks-count" title="Notes linking to this note">
            🔗 {backlinks.length} backlink{backlinks.length > 1 ? 's' : ''}
          </span>
        {/if}
      </div>
      <span class="last-updated">
        Last updated: {new Date(notesStore.currentNote.updatedAt).toLocaleString()}
      </span>
    </div>

    <!-- Backlinks section -->
    {#if backlinks.length > 0}
      <div class="backlinks-section">
        <h3>Linked from:</h3>
        <div class="backlinks-list">
          {#each backlinks as backlink}
            <a href="#/note/{backlink.id}" class="backlink-item">
              <span class="backlink-title">{backlink.title}</span>
              <span class="backlink-preview">{backlink.preview}</span>
            </a>
          {/each}
        </div>
      </div>
    {/if}
  {:else}
    <div class="editor-empty">
      <div class="empty-icon">📝</div>
      <h2>No note selected</h2>
      <p>Select a note from the sidebar or create a new one</p>
    </div>
  {/if}

  <!-- FAB (Floating Action Button) for mobile -->
  {#if uiStore.isMobile}
    <button class="fab" onclick={handleNewNote} title="New note">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>
  {/if}
</div>

<style>
  .editor {
    flex: 1;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg-color);
    overflow: hidden;
    position: relative;
    transition: background-color 0.3s;
  }

  .editor-header {
    padding: 1.5rem 2rem;
    padding-left: 3.5rem; /* Add space for toggle button */
    border-bottom: 1px solid var(--border-color);
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  /* On mobile, reset padding */
  @media (max-width: 1024px) {
    .editor-header {
      padding-left: 2rem;
    }
  }

  .header-actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .editor-content {
    flex: 1;
    overflow: auto; /* Allow scrolling for full preview mode */
    display: flex;
    flex-direction: column;
    position: relative;
  }

  /* Split view styles */
  .editor-content.split-view {
    overflow: hidden; /* In split view, children handle scroll */
  }

  .split-container {
    display: flex;
    flex: 1;
    overflow: hidden;
    height: 100%;
  }

  .split-pane {
    flex: 1;
    overflow: hidden; /* Prevent double scrollbar */
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .editor-pane {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .preview-pane {
    background: var(--bg-color);
    overflow-y: auto;
    overflow-x: hidden;
    /* Remove smooth scroll for instant sync */
    -webkit-overflow-scrolling: touch; /* Better mobile scrolling */
  }

  .outline-pane {
    width: 250px;
    flex-shrink: 0;
    overflow-y: auto;
    overflow-x: hidden;
  }

  /* Edit container for single pane with optional outline */
  .edit-container {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .outline-sidebar {
    width: 250px;
    flex-shrink: 0;
    overflow-y: auto;
    overflow-x: hidden;
    border-left: 1px solid var(--border-color);
  }

  /* Textarea in split view needs to be scrollable */
  .split-textarea {
    flex: 1;
    height: 100%;
    overflow-y: scroll !important; /* Force scrollbar to always show */
    overflow-x: hidden;
    /* Remove smooth scroll for instant sync */
    -webkit-overflow-scrolling: touch; /* Better mobile scrolling */
  }

  .split-divider {
    width: 4px;
    background: var(--border-color);
    cursor: col-resize;
    flex-shrink: 0;
    transition: background 0.2s;
  }

  .split-divider:hover {
    background: var(--primary-color);
  }

  /* Drag and drop styles */
  .editor-content.dragging::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 122, 204, 0.1);
    border: 3px dashed var(--primary-color);
    pointer-events: none;
    z-index: 99;
  }

  .drag-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 122, 204, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    pointer-events: none;
  }

  .drag-message {
    background: var(--primary-color);
    color: white;
    padding: 2rem 3rem;
    border-radius: 12px;
    font-size: 1.5rem;
    font-weight: 600;
    box-shadow: 0 8px 24px rgba(0, 122, 204, 0.4);
  }

  .title-input {
    flex: 1;
    font-size: 1.8rem;
    font-weight: 700;
    background: transparent;
    border: none;
    color: var(--text-color);
    outline: none;
    padding: 0;
    transition: color 0.3s;
  }

  .title-input::placeholder {
    color: var(--text-secondary);
  }

  .btn-outline,
  .btn-split,
  .btn-preview,
  .btn-pin,
  .btn-delete {
    background: transparent;
    border: 1px solid var(--border-color);
    font-size: 1.2rem;
    cursor: pointer;
    opacity: 0.7;
    transition: all 0.2s;
    padding: 0.5rem;
    border-radius: 4px;
  }

  .btn-outline:hover,
  .btn-outline.active {
    opacity: 1;
    border-color: var(--primary-color);
    background: var(--primary-color);
    color: white;
  }

  .btn-split:hover,
  .btn-split.active {
    opacity: 1;
    border-color: var(--primary-color);
    background: var(--primary-color);
    color: white;
  }

  .btn-preview:hover,
  .btn-preview.active {
    opacity: 1;
    border-color: var(--primary-color);
    background: var(--primary-color);
    color: white;
  }

  .btn-pin:hover {
    opacity: 1;
    border-color: var(--primary-color);
    background: var(--primary-color);
    color: white;
  }

  .btn-pin.pinned {
    opacity: 1;
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  .btn-delete:hover {
    opacity: 1;
    border-color: #ff4444;
    background: #ff4444;
    color: white;
  }

  .content-textarea {
    flex: 1;
    padding: 2rem;
    background: transparent;
    border: none;
    color: var(--text-color);
    font-size: 1rem;
    line-height: 1.6;
    resize: none;
    outline: none;
    font-family: 'Segoe UI', system-ui, sans-serif;
    transition: all 0.3s ease;
  }

  .content-textarea::placeholder {
    color: var(--text-secondary);
  }

  /* Font changing animation */
  :global(.editor-content.font-changing) {
    animation: fontFlash 0.3s ease;
  }

  @keyframes fontFlash {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  .editor-footer {
    padding: 0.75rem 2rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
    color: var(--text-secondary);
    flex-shrink: 0;
  }

  .footer-left {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .backlinks-count {
    color: var(--primary-color);
    font-weight: 500;
    cursor: help;
  }

  /* Backlinks section */
  .backlinks-section {
    padding: 1rem 2rem;
    border-top: 1px solid var(--border-color);
    background: var(--card-bg);
    max-height: 200px;
    overflow-y: auto;
  }

  .backlinks-section h3 {
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0 0 0.75rem 0;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .backlinks-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .backlink-item {
    display: flex;
    flex-direction: column;
    padding: 0.5rem 0.75rem;
    background: var(--bg-color);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    text-decoration: none;
    color: inherit;
    transition: all 0.2s;
  }

  .backlink-item:hover {
    border-color: var(--primary-color);
    background: var(--hover-bg);
  }

  .backlink-title {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text-color);
    margin-bottom: 0.25rem;
  }

  .backlink-preview {
    font-size: 0.8rem;
    color: var(--text-secondary);
    line-height: 1.4;
  }

  .editor-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .editor-empty h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    color: var(--text-color);
  }

  .editor-empty p {
    margin: 0;
    font-size: 1rem;
  }

  /* FAB (Floating Action Button) */
  .fab {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--primary-color);
    border: none;
    color: white;
    box-shadow: 0 4px 12px rgba(0, 122, 204, 0.4);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    z-index: 100;
  }

  .fab:hover {
    background: var(--primary-hover);
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 122, 204, 0.6);
  }

  .fab:active {
    transform: scale(0.95);
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    .editor-header {
      padding: 1rem;
      padding-top: 4rem; /* Space for burger menu */
    }

    .title-input {
      font-size: 1.4rem;
    }

    .content-textarea {
      padding: 1rem;
      font-size: 1rem;
      line-height: 1.8;
    }

    .editor-footer {
      padding: 0.5rem 1rem;
      font-size: 0.75rem;
      flex-direction: column;
      gap: 0.25rem;
    }

    .fab {
      bottom: 1.5rem;
      right: 1.5rem;
      width: 60px;
      height: 60px;
    }

    /* Disable split view on mobile, stack vertically instead */
    .split-container {
      flex-direction: column;
    }

    .split-divider {
      width: 100%;
      height: 4px;
      cursor: row-resize;
    }

    .btn-split {
      display: none; /* Hide split view button on mobile */
    }
  }

  @media (max-width: 600px) {
    .editor-header {
      padding: 0.75rem;
      padding-top: 3.5rem;
    }

    .title-input {
      font-size: 1.2rem;
    }

    .content-textarea {
      padding: 0.75rem;
      font-size: 0.95rem;
    }
  }
</style>
