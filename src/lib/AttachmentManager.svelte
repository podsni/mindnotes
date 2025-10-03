<script lang="ts">
  import { attachmentService, type Attachment, type AttachmentType } from './db'
  import PDFViewer from './PDFViewer.svelte'
  import CSVViewer from './CSVViewer.svelte'

  interface Props {
    noteId: number
  }

  let { noteId }: Props = $props()

  let attachments: Attachment[] = $state([])
  let isLoading: boolean = $state(false)
  let selectedAttachment: Attachment | null = $state(null)
  let showUploadDialog: boolean = $state(false)

  // Load attachments on mount
  $effect(() => {
    loadAttachments()
  })

  async function loadAttachments() {
    try {
      attachments = await attachmentService.getAttachmentsByNote(noteId)
    } catch (error) {
      console.error('Failed to load attachments:', error)
    }
  }

  async function handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement
    if (!input.files || input.files.length === 0) return

    const file = input.files[0]
    isLoading = true

    try {
      let type: AttachmentType
      let metadata: Attachment['metadata'] = {}

      // Determine type from file extension
      if (file.name.toLowerCase().endsWith('.pdf')) {
        type = 'pdf'
      } else if (file.name.toLowerCase().endsWith('.csv')) {
        type = 'csv'
      } else if (file.type.startsWith('image/')) {
        type = 'image'
      } else {
        alert('Unsupported file type. Please upload PDF, CSV, or image files.')
        return
      }

      await attachmentService.addAttachment(noteId, file, type, metadata)
      await loadAttachments()
      showUploadDialog = false
      
      // Clear input
      input.value = ''
    } catch (error) {
      console.error('Failed to upload file:', error)
      alert('Failed to upload file')
    } finally {
      isLoading = false
    }
  }

  async function deleteAttachment(id: number) {
    if (!confirm('Delete this attachment? This cannot be undone.')) return

    try {
      await attachmentService.deleteAttachment(id)
      await loadAttachments()
      
      if (selectedAttachment?.id === id) {
        selectedAttachment = null
      }
    } catch (error) {
      console.error('Failed to delete attachment:', error)
      alert('Failed to delete attachment')
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  function getFileIcon(type: AttachmentType): string {
    switch (type) {
      case 'pdf': return '📄'
      case 'csv': return '📊'
      case 'image': return '🖼️'
      default: return '📎'
    }
  }

  async function downloadAttachment(attachment: Attachment) {
    try {
      const url = URL.createObjectURL(attachment.fileBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = attachment.filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download:', error)
      alert('Failed to download file')
    }
  }
</script>

<div class="attachment-manager">
  {#if !selectedAttachment}
    <!-- Attachment List View -->
    <div class="attachment-list">
      <div class="list-header">
        <h3>📎 Attachments</h3>
        <button onclick={() => showUploadDialog = true} class="add-btn">
          ➕ Add File
        </button>
      </div>

      {#if attachments.length === 0}
        <div class="empty-state">
          <p>No attachments yet</p>
          <button onclick={() => showUploadDialog = true}>
            Upload PDF or CSV
          </button>
        </div>
      {:else}
        <div class="attachment-grid">
          {#each attachments as attachment}
            <div class="attachment-card">
              <div class="attachment-icon">
                {getFileIcon(attachment.type)}
              </div>
              <div class="attachment-info">
                <h4>{attachment.filename}</h4>
                <p class="file-meta">
                  {attachment.type.toUpperCase()} • {formatFileSize(attachment.fileSize)}
                </p>
                {#if attachment.metadata?.pageCount}
                  <p class="file-meta">{attachment.metadata.pageCount} pages</p>
                {/if}
                {#if attachment.metadata?.rowCount}
                  <p class="file-meta">
                    {attachment.metadata.rowCount} rows × {attachment.metadata.columnCount} cols
                  </p>
                {/if}
              </div>
              <div class="attachment-actions">
                <button
                  onclick={() => selectedAttachment = attachment}
                  class="view-btn"
                  title="View"
                >
                  👁️
                </button>
                <button
                  onclick={() => downloadAttachment(attachment)}
                  class="download-btn"
                  title="Download"
                >
                  📥
                </button>
                <button
                  onclick={() => deleteAttachment(attachment.id!)}
                  class="delete-btn"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Upload Dialog -->
    {#if showUploadDialog}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="upload-dialog-overlay" onclick={() => showUploadDialog = false}>
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="upload-dialog" onclick={(e) => e.stopPropagation()}>
          <h3>Upload File</h3>
          <p>Supported formats: PDF, CSV, Images</p>
          
          <input
            type="file"
            accept=".pdf,.csv,image/*"
            onchange={handleFileUpload}
            disabled={isLoading}
          />

          {#if isLoading}
            <div class="upload-loading">Uploading...</div>
          {/if}

          <div class="dialog-actions">
            <button onclick={() => showUploadDialog = false}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    {/if}
  {:else}
    <!-- Attachment Viewer -->
    <div class="attachment-viewer">
      <div class="viewer-header">
        <button onclick={() => selectedAttachment = null} class="back-btn">
          ← Back to List
        </button>
        <h3>{selectedAttachment.filename}</h3>
        <button
          onclick={() => downloadAttachment(selectedAttachment!)}
          class="download-btn"
        >
          📥 Download
        </button>
      </div>

      <div class="viewer-content">
        {#if selectedAttachment.type === 'pdf'}
          <PDFViewer attachment={selectedAttachment} />
        {:else if selectedAttachment.type === 'csv'}
          <CSVViewer attachment={selectedAttachment} />
        {:else if selectedAttachment.type === 'image'}
          <div class="image-viewer">
            <img
              src={URL.createObjectURL(selectedAttachment.fileBlob)}
              alt={selectedAttachment.filename}
            />
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .attachment-manager {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--bg-color);
    color: var(--text-color);
  }

  .attachment-list {
    padding: 1.5rem;
    height: 100%;
    overflow-y: auto;
  }

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .list-header h3 {
    margin: 0;
    font-size: 1.3rem;
    color: var(--text-color);
  }

  .add-btn {
    background: #4caf50;
    color: white;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
  }

  .add-btn:hover {
    background: #45a049;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
  }

  .empty-state {
    text-align: center;
    padding: 4rem 1rem;
    color: var(--text-secondary);
  }

  .empty-state p {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
  }

  .empty-state button {
    margin-top: 1rem;
    padding: 0.6rem 1.5rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s;
  }

  .empty-state button:hover {
    background: var(--primary-hover);
    transform: translateY(-1px);
  }

  .attachment-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.25rem;
  }

  .attachment-card {
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    background: var(--card-bg);
    transition: all 0.3s;
  }

  .attachment-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
    border-color: var(--primary-color);
  }

  .attachment-icon {
    font-size: 3.5rem;
    text-align: center;
    margin-bottom: 0.5rem;
  }

  .attachment-info h4 {
    margin: 0;
    font-size: 1.05rem;
    word-break: break-word;
    color: var(--text-color);
    font-weight: 600;
  }

  .file-meta {
    margin: 0.3rem 0;
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .attachment-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: auto;
  }

  .attachment-actions button {
    flex: 1;
    padding: 0.5rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
    font-weight: 500;
  }

  .view-btn {
    background: var(--primary-color);
    color: white;
  }

  .view-btn:hover {
    background: var(--primary-hover);
    transform: scale(1.05);
  }

  .download-btn {
    background: #4caf50;
    color: white;
  }

  .download-btn:hover {
    background: #45a049;
    transform: scale(1.05);
  }

  .delete-btn {
    background: #f44336;
    color: white;
  }

  .delete-btn:hover {
    background: #da190b;
    transform: scale(1.05);
  }

  .upload-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }

  .upload-dialog {
    background: var(--card-bg);
    padding: 2rem;
    border-radius: 12px;
    max-width: 440px;
    width: 90%;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    border: 1px solid var(--border-color);
  }

  .upload-dialog h3 {
    margin-top: 0;
    color: var(--text-color);
    font-size: 1.3rem;
  }

  .upload-dialog p {
    color: var(--text-secondary);
    margin-bottom: 1rem;
  }

  .upload-dialog input[type="file"] {
    width: 100%;
    margin: 1rem 0;
    padding: 0.5rem;
    border: 2px dashed var(--border-color);
    border-radius: 6px;
    background: var(--bg-color);
    color: var(--text-color);
  }

  .upload-loading {
    text-align: center;
    color: var(--text-secondary);
    padding: 1rem;
    font-style: italic;
  }

  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1.5rem;
  }

  .dialog-actions button {
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    background: var(--border-color);
    color: var(--text-color);
  }

  .dialog-actions button:hover {
    background: var(--hover-bg);
  }

  .attachment-viewer {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--bg-color);
  }

  .viewer-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    background: var(--card-bg);
    border-bottom: 1px solid var(--border-color);
  }

  .viewer-header h3 {
    flex: 1;
    margin: 0;
    font-size: 1.15rem;
    color: var(--text-color);
  }

  .back-btn {
    background: var(--primary-color);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
  }

  .back-btn:hover {
    background: var(--primary-hover);
    transform: translateX(-2px);
  }

  .viewer-content {
    flex: 1;
    overflow: hidden;
  }

  .image-viewer {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: var(--bg-color);
  }

  .image-viewer img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    border-radius: 8px;
  }

  /* Scrollbar styling */
  .attachment-list::-webkit-scrollbar {
    width: 10px;
  }

  .attachment-list::-webkit-scrollbar-track {
    background: var(--card-bg);
  }

  .attachment-list::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 5px;
  }

  .attachment-list::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .attachment-list {
      padding: 1rem;
    }

    .list-header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .list-header h3 {
      text-align: center;
    }

    .add-btn {
      width: 100%;
    }

    .attachment-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .attachment-icon {
      font-size: 2.5rem;
    }

    .viewer-header {
      padding: 0.75rem;
      flex-wrap: wrap;
    }

    .viewer-header h3 {
      width: 100%;
      margin-bottom: 0.5rem;
      font-size: 1rem;
    }

    .upload-dialog {
      width: 95%;
      padding: 1.5rem;
    }
  }
</style>
