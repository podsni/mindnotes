<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { notesStore } from './store.svelte'
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

  // Focus title on mount
  onMount(() => {
    titleInput?.focus()
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
</div>

<style>
  .editor {
    flex: 1;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #1e1e1e;
    overflow: hidden;
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
</style>
