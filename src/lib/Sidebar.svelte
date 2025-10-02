<script lang="ts">
  import { notesStore } from './store.svelte'
  import { router } from './router'
  import type { Note } from './db'

  let searchInput = $state('')

  const handleSearch = (e: Event) => {
    const target = e.target as HTMLInputElement
    searchInput = target.value
    notesStore.search(searchInput)
  }

  const handleNewNote = async () => {
    const id = await notesStore.createNote('New Note', '')
    router.navigate(`/note/${id}`)
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
</script>

<aside class="sidebar">
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
        <a href="#/note/{note.id}" class="note-item">
          <div class="note-title">{note.title || 'Untitled'}</div>
          <div class="note-preview">{note.content.slice(0, 60)}{note.content.length > 60 ? '...' : ''}</div>
          <div class="note-date">{formatDate(note.updatedAt)}</div>
        </a>
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
    display: block;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    background: #252525;
    border-radius: 6px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    color: inherit;
  }

  :global(.note-item:hover) {
    background: #2d2d2d;
    border-color: #007acc;
  }

  :global(.note-item.active) {
    background: #2d2d2d;
    border-color: #007acc;
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
