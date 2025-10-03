<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { notesStore, uiStore } from './store.svelte'
  import { router } from './router'
  import MarkdownPreview from './MarkdownPreview.svelte'
  import AttachmentManager from './AttachmentManager.svelte'
  import { noteService, type NoteMetadata } from './db'

  interface Props {
    id: string
  }

  let { id }: Props = $props()
  
  let titleInput: HTMLInputElement | undefined = $state()
  let contentTextarea: HTMLTextAreaElement | undefined = $state()
  let previewMode = $state(false)
  let splitView = $state(false)
  let backlinks = $state<NoteMetadata[]>([])
  let activeTab: 'editor' | 'attachments' = $state('editor')
  let isDragging = $state(false)
  
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
    if (!isNaN(noteId)) {
      notesStore.updateNote(noteId, { content: target.value })
    }
    // Auto-resize textarea on mobile
    autoResizeTextarea(target)
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

  // Scroll synchronization between editor and preview (real-time)
  const handleEditorScroll = (e: Event) => {
    if (!splitView || !contentTextarea || !previewPane || isScrollingSynced) return
    
    const target = e.target as HTMLElement
    const maxScroll = target.scrollHeight - target.clientHeight
    
    // Prevent division by zero
    if (maxScroll <= 0) return
    
    const scrollPercentage = target.scrollTop / maxScroll
    
    // Direct sync without RAF for instant response
    isScrollingSynced = true
    const previewMaxScroll = previewPane.scrollHeight - previewPane.clientHeight
    previewPane.scrollTop = scrollPercentage * previewMaxScroll
    
    // Reset flag immediately on next tick
    setTimeout(() => { isScrollingSynced = false }, 0)
  }

  const handlePreviewScroll = (e: Event) => {
    if (!splitView || !contentTextarea || !previewPane || isScrollingSynced) return
    
    const target = e.target as HTMLElement
    const maxScroll = target.scrollHeight - target.clientHeight
    
    // Prevent division by zero
    if (maxScroll <= 0) return
    
    const scrollPercentage = target.scrollTop / maxScroll
    
    // Direct sync without RAF for instant response
    isScrollingSynced = true
    const textareaMaxScroll = contentTextarea.scrollHeight - contentTextarea.clientHeight
    contentTextarea.scrollTop = scrollPercentage * textareaMaxScroll
    
    // Reset flag immediately on next tick
    setTimeout(() => { isScrollingSynced = false }, 0)
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

    const noteId = parseInt(id)
    if (isNaN(noteId)) return

    let insertText = ''

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Handle image files
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (evt) => {
          const base64 = evt.target?.result as string
          const imageMarkdown = `\n![${file.name}](${base64})\n`
          
          // Insert at cursor position or append
          if (contentTextarea) {
            const cursorPos = contentTextarea.selectionStart || 0
            const currentContent = notesStore.currentNote?.content || ''
            const newContent = currentContent.slice(0, cursorPos) + imageMarkdown + currentContent.slice(cursorPos)
            notesStore.updateNote(noteId, { content: newContent })
          }
        }
        reader.readAsDataURL(file)
      } 
      // Handle other files (create link)
      else {
        const reader = new FileReader()
        reader.onload = (evt) => {
          const base64 = evt.target?.result as string
          const fileMarkdown = `\n[📎 ${file.name}](${base64})\n`
          
          if (contentTextarea) {
            const cursorPos = contentTextarea.selectionStart || 0
            const currentContent = notesStore.currentNote?.content || ''
            const newContent = currentContent.slice(0, cursorPos) + fileMarkdown + currentContent.slice(cursorPos)
            notesStore.updateNote(noteId, { content: newContent })
          }
        }
        reader.readAsDataURL(file)
      }
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

    <!-- Tab Navigation -->
    <div class="editor-tabs">
      <button
        class="tab-btn"
        class:active={activeTab === 'editor'}
        onclick={() => activeTab = 'editor'}
      >
        📝 Note
      </button>
      <button
        class="tab-btn"
        class:active={activeTab === 'attachments'}
        onclick={() => activeTab = 'attachments'}
      >
        📎 Attachments
      </button>
    </div>
    
    <div 
      class="editor-content" 
      class:split-view={splitView}
      class:dragging={isDragging}
      ondragover={handleDragOver}
      ondragleave={handleDragLeave}
      ondrop={handleDrop}
      role="application"
      aria-label="Note editor with drag and drop support"
    >
      {#if activeTab === 'editor'}
        {#if previewMode}
          <MarkdownPreview content={notesStore.currentNote.content} mode="full" />
        {:else if splitView}
          <!-- Split view: editor on left, preview on right -->
          <div class="split-container">
            <div class="split-pane editor-pane">
              <textarea
                bind:this={contentTextarea}
                class="content-textarea editor-text split-textarea"
                value={notesStore.currentNote.content}
                oninput={handleContentChange}
                onscroll={handleEditorScroll}
                placeholder="Start writing your note... Use [[note-title]] for cross-note links

📝 Markdown features:
• Headers: # H1, ## H2, ### H3
• Links: [[note-title]] or [text](url)
• Images: drag & drop or ![alt](url)
• Code: ```language or inline `code`
• Math: $inline$, $$block$$, block mode, LaTeX environments
• Mermaid: ```mermaid
• Lists: - bullet or 1. numbered
• Tables: | col1 | col2 |
• Checkboxes: - [ ] task"
              ></textarea>
            </div>
            <div class="split-divider"></div>
            <div 
              class="split-pane preview-pane" 
              bind:this={previewPane}
              onscroll={handlePreviewScroll}
            >
              <MarkdownPreview content={notesStore.currentNote.content} mode="split" />
            </div>
          </div>
        {:else}
          <textarea
            bind:this={contentTextarea}
            class="content-textarea editor-text"
            value={notesStore.currentNote.content}
            oninput={handleContentChange}
            placeholder="Start writing your note... Use [[note-title]] for cross-note links

📝 Markdown features:
• Headers: # H1, ## H2, ### H3
• Links: [[note-title]] or [text](url)
• Images: drag & drop or ![alt](url)
• Code: ```language or inline `code`
• Math: $inline$, $$block$$, block mode, LaTeX environments
• Mermaid: ```mermaid
• Lists: - bullet or 1. numbered
• Tables: | col1 | col2 |
• Checkboxes: - [ ] task"
          ></textarea>
        {/if}
      {:else}
        <AttachmentManager noteId={parseInt(id)} />
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
          📊 {notesStore.currentNote.content.split(/\s+/).filter(w => w.length > 0).length} words · 
          {notesStore.currentNote.content.length} characters · 
          {notesStore.currentNote.content.replace(/\s/g, '').length} chars (no spaces)
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

  /* Tab navigation */
  .editor-tabs {
    display: flex;
    border-bottom: 1px solid var(--border-color);
    background: var(--card-bg);
    padding: 0 2rem;
  }

  .tab-btn {
    padding: 0.75rem 1.5rem;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 500;
    transition: all 0.2s;
  }

  .tab-btn:hover {
    color: var(--text-color);
    background: var(--hover-bg);
  }

  .tab-btn.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
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
