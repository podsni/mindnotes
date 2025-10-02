<script lang="ts">
  import { notesStore, uiStore } from './store.svelte'
  import { router } from './router'
  import type { Note } from './db'
  import VirtualList from 'svelte-virtual-list'
  import FontSelector from './FontSelector.svelte'

  let searchInput = $state('')
  let touchStartX = $state(0)
  let touchCurrentX = $state(0)
  let isDragging = $state(false)
  let listContainer: HTMLDivElement | undefined = $state()

  const handleSearch = (e: Event) => {
    const target = e.target as HTMLInputElement
    searchInput = target.value
    notesStore.search(searchInput)
  }

  const handleNewNote = async () => {
    const id = await notesStore.createNote('New Note', '')
    router.navigate(`/note/${id}`)
    // Close sidebar on mobile after creating note
    if (uiStore.isMobile) {
      uiStore.closeSidebar()
    }
  }

  const handleNoteClick = () => {
    // Close sidebar on mobile when clicking a note
    if (uiStore.isMobile) {
      uiStore.closeSidebar()
    }
  }

  const handleDeleteNote = async (e: Event, noteId: number) => {
    e.preventDefault() // Prevent navigation
    e.stopPropagation() // Prevent click bubbling
    
    if (confirm('Are you sure you want to delete this note?')) {
      await notesStore.deleteNote(noteId)
    }
  }

  const handleTogglePin = async (e: Event, noteId: number) => {
    e.preventDefault()
    e.stopPropagation()
    await notesStore.togglePin(noteId)
  }

  const handleExport = async () => {
    await notesStore.exportNotes()
  }

  const handleImport = async (e: Event) => {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    if (file) {
      try {
        const count = await notesStore.importNotes(file)
        alert(`Successfully imported ${count} notes!`)
      } catch (error) {
        alert('Failed to import notes. Please check the file format.')
      }
      // Reset input
      input.value = ''
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  // Swipe gesture handlers
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX = e.touches[0].clientX
    isDragging = true
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return
    touchCurrentX = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    
    const diff = touchCurrentX - touchStartX
    
    // Swipe left to close (threshold: 50px)
    if (diff < -50 && uiStore.isMobile) {
      uiStore.closeSidebar()
    }
    
    isDragging = false
    touchStartX = 0
    touchCurrentX = 0
  }
</script>

<aside 
  class="sidebar" 
  class:open={uiStore.sidebarOpen}
  ontouchstart={handleTouchStart}
  ontouchmove={handleTouchMove}
  ontouchend={handleTouchEnd}
>
  <div class="sidebar-header">
    <h1>📝 MindNote</h1>
    <div class="header-actions">
      <button 
        onclick={() => uiStore.toggleTheme()} 
        class="btn-icon" 
        title="Toggle theme"
        aria-label="Toggle theme"
      >
        {uiStore.theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <button onclick={handleNewNote} class="btn-new">
        + New
      </button>
    </div>
  </div>

  <div class="toolbar">
    <button onclick={handleExport} class="btn-tool" title="Export notes">
      📤 Export
    </button>
    <label class="btn-tool" title="Import notes">
      📥 Import
      <input 
        type="file" 
        accept="application/json"
        onchange={handleImport}
        style="display: none;"
      />
    </label>
  </div>

  <div class="font-settings">
    <FontSelector />
  </div>

  <div class="search-box">
    <input
      type="text"
      placeholder="Search notes..."
      value={searchInput}
      oninput={handleSearch}
    />
  </div>

  <div class="notes-list" bind:this={listContainer}>
    {#if notesStore.isLoading}
      <div class="loading">Loading...</div>
    {:else if notesStore.notes.length === 0}
      <div class="empty">
        <p>No notes yet</p>
        <p class="hint">Create your first note!</p>
      </div>
    {:else if notesStore.notes.length > 50}
      <!-- Use virtual list for large datasets (>50 notes) -->
      <VirtualList items={notesStore.notes} let:item height="calc(100vh - 250px)">
        {#if item.id}
          <a href="#/note/{item.id}" class="note-item" class:pinned={item.pinned} onclick={handleNoteClick}>
            <div class="note-content">
              <div class="note-title">
                {#if item.pinned}
                  <span class="pin-icon">📌</span>
                {/if}
                {item.title || 'Untitled'}
              </div>
              <div class="note-preview">{item.content.slice(0, 60)}{item.content.length > 60 ? '...' : ''}</div>
              <div class="note-date">{formatDate(item.updatedAt)}</div>
            </div>
            <div class="note-actions">
              <button 
                class="btn-pin-note" 
                onclick={(e) => handleTogglePin(e, item.id!)}
                title={item.pinned ? 'Unpin note' : 'Pin note'}
                aria-label={item.pinned ? 'Unpin note' : 'Pin note'}
              >
                {item.pinned ? '📍' : '📌'}
              </button>
              <button 
                class="btn-delete-note" 
                onclick={(e) => handleDeleteNote(e, item.id!)}
                title="Delete note"
                aria-label="Delete note"
              >
                🗑️
              </button>
            </div>
          </a>
        {/if}
      </VirtualList>
    {:else}
      <!-- Regular list for small datasets (≤50 notes) -->
      {#each notesStore.notes as note (note.id)}
        {#if note.id}
          <a href="#/note/{note.id}" class="note-item" class:pinned={note.pinned} onclick={handleNoteClick}>
            <div class="note-content">
              <div class="note-title">
                {#if note.pinned}
                  <span class="pin-icon">📌</span>
                {/if}
                {note.title || 'Untitled'}
              </div>
              <div class="note-preview">{note.content.slice(0, 60)}{note.content.length > 60 ? '...' : ''}</div>
              <div class="note-date">{formatDate(note.updatedAt)}</div>
            </div>
            <div class="note-actions">
              <button 
                class="btn-pin-note" 
                onclick={(e) => handleTogglePin(e, note.id!)}
                title={note.pinned ? 'Unpin note' : 'Pin note'}
                aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
              >
                {note.pinned ? '📍' : '📌'}
              </button>
              <button 
                class="btn-delete-note" 
                onclick={(e) => handleDeleteNote(e, note.id!)}
                title="Delete note"
                aria-label="Delete note"
              >
                🗑️
              </button>
            </div>
          </a>
        {/if}
      {/each}
    {/if}
  </div>
</aside>

<style>
  .sidebar {
    width: 280px;
    height: 100vh;
    background: var(--bg-color);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: transform 0.3s ease, width 0.3s ease, background-color 0.3s;
  }

  /* Desktop: Static sidebar with toggle */
  @media (min-width: 1025px) {
    .sidebar {
      width: 280px;
    }
  }

  /* Tablet: Sidebar can collapse */
  @media (max-width: 1024px) {
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      z-index: 1000;
      transform: translateX(-100%);
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
    }

    .sidebar.open {
      transform: translateX(0);
    }
  }

  /* Mobile: Full overlay drawer */
  @media (max-width: 600px) {
    .sidebar {
      width: 85%;
      max-width: 320px;
    }
  }

  .sidebar-header {
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .sidebar-header h1 {
    font-size: 1.2rem;
    margin: 0;
    font-weight: 600;
  }

  .header-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .btn-icon {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-color);
    padding: 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s;
  }

  .btn-icon:hover {
    background: var(--hover-bg);
    border-color: var(--primary-color);
  }

  .btn-new {
    background: var(--primary-color);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.2s;
  }

  .btn-new:hover {
    background: var(--primary-hover);
  }

  .toolbar {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    gap: 0.5rem;
  }

  .btn-tool {
    flex: 1;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    color: var(--text-color);
    padding: 0.4rem 0.75rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .btn-tool:hover {
    background: var(--hover-bg);
    border-color: var(--primary-color);
  }

  .font-settings {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--border-color);
  }

  .search-box {
    padding: 1rem;
    border-bottom: 1px solid #333;
  }

  .search-box input {
    width: 100%;
    padding: 0.5rem;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    color: var(--text-color);
    font-size: 0.9rem;
    transition: background-color 0.3s, border-color 0.2s;
  }

  .search-box input:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  .notes-list {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem;
  }

  .loading, .empty {
    text-align: center;
    padding: 2rem 1rem;
    color: var(--text-secondary);
  }

  .empty .hint {
    font-size: 0.85rem;
    margin-top: 0.5rem;
  }

  :global(.note-item) {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    background: var(--card-bg);
    border-radius: 6px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    color: inherit;
    position: relative;
  }

  :global(.note-item:hover) {
    background: var(--hover-bg);
    border-color: var(--primary-color);
  }

  :global(.note-item.active) {
    background: var(--hover-bg);
    border-color: var(--primary-color);
  }

  :global(.note-item.pinned) {
    background: var(--pinned-bg);
    border-color: var(--primary-color);
  }

  .note-content {
    flex: 1;
    min-width: 0; /* Allow text truncation */
  }

  .note-title {
    font-weight: 600;
    font-size: 0.95rem;
    margin-bottom: 0.25rem;
    color: var(--text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .pin-icon {
    font-size: 0.85rem;
    flex-shrink: 0;
  }

  .note-preview {
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.4;
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .note-date {
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .note-actions {
    display: flex;
    gap: 0.25rem;
    opacity: 0;
    transition: opacity 0.2s;
  }

  :global(.note-item:hover) .note-actions {
    opacity: 1;
  }

  .btn-pin-note,
  .btn-delete-note {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 1rem;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .btn-pin-note:hover {
    background: var(--primary-color);
    color: white;
    transform: scale(1.1);
  }

  .btn-delete-note:hover {
    background: #ff4444;
    color: white;
    transform: scale(1.1);
  }

  /* Always show action buttons on mobile */
  @media (max-width: 768px) {
    .note-actions {
      opacity: 1;
    }
  }

  /* Scrollbar styling */
  .notes-list::-webkit-scrollbar {
    width: 6px;
  }

  .notes-list::-webkit-scrollbar-track {
    background: var(--bg-color);
  }

  .notes-list::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;
  }

  .notes-list::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);
  }
</style>
