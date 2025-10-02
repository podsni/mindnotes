<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { notesStore, uiStore } from './store.svelte'
  import { router } from './router'

  interface Props {
    id: string
  }

  let { id }: Props = $props()
  
  let titleInput: HTMLInputElement | undefined = $state()
  let contentTextarea: HTMLTextAreaElement | undefined = $state()
  
  // Load note when component mounts or ID changes
  $effect(() => {
    const noteId = parseInt(id)
    if (!isNaN(noteId)) {
      notesStore.loadNote(noteId)
    }
  })

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

  const handleNewNote = async () => {
    const newId = await notesStore.createNote('New Note', '')
    router.navigate(`/note/${newId}`)
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
        class="title-input"
        value={notesStore.currentNote.title}
        oninput={handleTitleChange}
        placeholder="Note title..."
      />
      <button onclick={handleDelete} class="btn-delete" title="Delete note">
        🗑️
      </button>
    </div>
    
    <textarea
      bind:this={contentTextarea}
      class="content-textarea"
      value={notesStore.currentNote.content}
      oninput={handleContentChange}
      placeholder="Start writing your note..."
    ></textarea>

    <div class="editor-footer">
      <span class="word-count">
        {notesStore.currentNote.content.split(/\s+/).filter(w => w.length > 0).length} words
      </span>
      <span class="last-updated">
        Last updated: {new Date(notesStore.currentNote.updatedAt).toLocaleString()}
      </span>
    </div>
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
    background: #1e1e1e;
    overflow: hidden;
    position: relative;
  }

  .editor-header {
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #333;
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .title-input {
    flex: 1;
    font-size: 1.8rem;
    font-weight: 700;
    background: transparent;
    border: none;
    color: #fff;
    outline: none;
    padding: 0;
  }

  .title-input::placeholder {
    color: #555;
  }

  .btn-delete {
    background: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.2s;
    padding: 0.5rem;
  }

  .btn-delete:hover {
    opacity: 1;
  }

  .content-textarea {
    flex: 1;
    padding: 2rem;
    background: transparent;
    border: none;
    color: #e0e0e0;
    font-size: 1rem;
    line-height: 1.6;
    resize: none;
    outline: none;
    font-family: 'Segoe UI', system-ui, sans-serif;
  }

  .content-textarea::placeholder {
    color: #555;
  }

  .editor-footer {
    padding: 0.75rem 2rem;
    border-top: 1px solid #333;
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: #888;
  }

  .editor-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #888;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .editor-empty h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    color: #aaa;
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
    background: #007acc;
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
    background: #005a9e;
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
