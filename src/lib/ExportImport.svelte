<script lang="ts">
  import { noteService } from './db'
  import { notesStore } from './store.svelte'

  let isExporting = $state(false)
  let isImporting = $state(false)
  let importMessage = $state('')

  const exportJSON = async () => {
    try {
      isExporting = true
      const jsonData = await noteService.exportNotes()
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mindnote-backup-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      isExporting = false
    }
  }

  const exportMarkdown = async () => {
    try {
      isExporting = true
      const markdown = await noteService.exportNotesToMarkdown()
      const blob = new Blob([markdown], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mindnote-export-${Date.now()}.md`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      isExporting = false
    }
  }

  const importFile = async (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    try {
      isImporting = true
      importMessage = ''
      const text = await file.text()
      
      let imported = 0
      if (file.name.endsWith('.json')) {
        imported = await noteService.importNotes(text)
      } else if (file.name.endsWith('.md')) {
        imported = await noteService.importFromMarkdown(text)
      } else {
        throw new Error('Unsupported file format. Please use .json or .md files.')
      }
      
      // Refresh notes list
      await notesStore.loadNotes()
      
      importMessage = `✅ Successfully imported ${imported} note${imported !== 1 ? 's' : ''}!`
      setTimeout(() => {
        importMessage = ''
      }, 5000)
    } catch (error: any) {
      console.error('Import failed:', error)
      importMessage = `❌ ${error.message || 'Import failed'}`
    } finally {
      isImporting = false
      input.value = '' // Reset input
    }
  }

  const triggerImport = () => {
    document.getElementById('file-import')?.click()
  }
</script>

<div class="export-import-section">

  <div class="button-group">
    <!-- Export Buttons -->
    <button
      type="button"
      class="action-btn export-btn"
      onclick={exportJSON}
      disabled={isExporting}
      title="Export all notes as JSON"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      {isExporting ? 'Exporting...' : 'Export JSON'}
    </button>

    <button
      type="button"
      class="action-btn export-btn"
      onclick={exportMarkdown}
      disabled={isExporting}
      title="Export all notes as Markdown"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      {isExporting ? 'Exporting...' : 'Export Markdown'}
    </button>

    <!-- Import Button -->
    <button
      type="button"
      class="action-btn import-btn"
      onclick={triggerImport}
      disabled={isImporting}
      title="Import notes from JSON or Markdown file"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {isImporting ? 'Importing...' : 'Import File'}
    </button>

    <input
      type="file"
      id="file-import"
      accept=".json,.md"
      onchange={importFile}
      style="display: none;"
    />
  </div>

  {#if importMessage}
    <div class="import-message" class:success={importMessage.startsWith('✅')} class:error={importMessage.startsWith('❌')}>
      {importMessage}
    </div>
  {/if}

  <p class="section-desc">
    💡 Export your notes for backup. Import to restore from backup files (JSON or Markdown).
  </p>
</div>

<style>
  .export-import-section {
    padding: 0;
  }

  .button-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.625rem 0.75rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    color: var(--text-primary);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
  }

  .action-btn:hover:not(:disabled) {
    background: var(--bg-hover);
    border-color: var(--border-hover);
    transform: translateY(-1px);
  }

  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .export-btn svg {
    color: var(--primary-color);
  }

  .import-btn svg {
    color: var(--accent);
  }

  .import-message {
    margin-top: 0.75rem;
    padding: 0.625rem;
    border-radius: 0.375rem;
    font-size: 0.8125rem;
    font-weight: 500;
    text-align: center;
  }

  .import-message.success {
    background: rgba(167, 192, 128, 0.15);
    color: #a7c080;
    border: 1px solid rgba(167, 192, 128, 0.3);
  }

  .import-message.error {
    background: rgba(230, 126, 128, 0.15);
    color: #e67e80;
    border: 1px solid rgba(230, 126, 128, 0.3);
  }

  .section-desc {
    margin-top: 0.75rem;
    font-size: 0.75rem;
    color: var(--text-secondary);
    line-height: 1.4;
    opacity: 0.8;
  }

  /* Mobile styles */
  @media (max-width: 768px) {
    .action-btn {
      padding: 0.75rem;
      font-size: 0.8125rem;
    }
  }
</style>
