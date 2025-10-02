<script lang="ts">
  import { notesStore, uiStore } from './store.svelte'
  import { router } from './router'
  import type { Note } from './db'

  let searchInput = $state('')
  let touchStartX = $state(0)
  let touchCurrentX = $state(0)
  let isDragging = $state(false)

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
    <button onclick={handleNewNote} class="btn-new">
      + New
    </button>
  </div>

  <div class="search-box">
    <input
      type="text"
      placeholder="Search notes..."
      value={searchInput}
      oninput={handleSearch}
    />
  </div>

  <div class="notes-list">
    {#if notesStore.isLoading}
      <div class="loading">Loading...</div>
    {:else if notesStore.notes.length === 0}
      <div class="empty">
        <p>No notes yet</p>
        <p class="hint">Create your first note!</p>
      </div>
    {:else}
      {#each notesStore.notes as note (note.id)}
        {#if note.id}
          <a href="#/note/{note.id}" class="note-item" onclick={handleNoteClick}>
            <div class="note-content">
              <div class="note-title">{note.title || 'Untitled'}</div>
              <div class="note-preview">{note.content.slice(0, 60)}{note.content.length > 60 ? '...' : ''}</div>
              <div class="note-date">{formatDate(note.updatedAt)}</div>
            </div>
            <button 
              class="btn-delete-note" 
              onclick={(e) => handleDeleteNote(e, note.id!)}
              title="Delete note"
              aria-label="Delete note"
            >
              🗑️
            </button>
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
    background: #1e1e1e;
    border-right: 1px solid #333;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: transform 0.3s ease, width 0.3s ease;
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
    border-bottom: 1px solid #333;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .sidebar-header h1 {
    font-size: 1.2rem;
    margin: 0;
    font-weight: 600;
  }

  .btn-new {
    background: #007acc;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.2s;
  }

  .btn-new:hover {
    background: #005a9e;
  }

  .search-box {
    padding: 1rem;
    border-bottom: 1px solid #333;
  }

  .search-box input {
    width: 100%;
    padding: 0.5rem;
    background: #2d2d2d;
    border: 1px solid #444;
    border-radius: 4px;
    color: #fff;
    font-size: 0.9rem;
  }

  .search-box input:focus {
    outline: none;
    border-color: #007acc;
  }

  .notes-list {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem;
  }

  .loading, .empty {
    text-align: center;
    padding: 2rem 1rem;
    color: #888;
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
    background: #252525;
    border-radius: 6px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    color: inherit;
    position: relative;
  }

  :global(.note-item:hover) {
    background: #2d2d2d;
    border-color: #007acc;
  }

  :global(.note-item.active) {
    background: #2d2d2d;
    border-color: #007acc;
  }

  .note-content {
    flex: 1;
    min-width: 0; /* Allow text truncation */
  }

  .note-title {
    font-weight: 600;
    font-size: 0.95rem;
    margin-bottom: 0.25rem;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .note-preview {
    font-size: 0.85rem;
    color: #aaa;
    line-height: 1.4;
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .note-date {
    font-size: 0.75rem;
    color: #666;
  }

  .btn-delete-note {
    background: transparent;
    border: none;
    color: #888;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 1rem;
    transition: all 0.2s;
    opacity: 0;
    flex-shrink: 0;
  }

  :global(.note-item:hover) .btn-delete-note {
    opacity: 1;
  }

  .btn-delete-note:hover {
    background: #ff4444;
    color: white;
    transform: scale(1.1);
  }

  /* Always show delete button on mobile */
  @media (max-width: 768px) {
    .btn-delete-note {
      opacity: 1;
    }
  }

  /* Scrollbar styling */
  .notes-list::-webkit-scrollbar {
    width: 6px;
  }

  .notes-list::-webkit-scrollbar-track {
    background: #1e1e1e;
  }

  .notes-list::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 3px;
  }

  .notes-list::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
</style>
