<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import * as pdfjsLib from 'pdfjs-dist'
  import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
  import type { Attachment, PDFAnnotation } from './db'
  import { attachmentService } from './db'

  interface Props {
    attachment: Attachment
  }

  let { attachment }: Props = $props()

  // PDF.js worker setup
  const workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

  let pdfDoc: PDFDocumentProxy | null = $state(null)
  let currentPage: number = $state(1)
  let totalPages: number = $state(0)
  let scale: number = $state(1.5)
  let isLoading: boolean = $state(true)
  let searchQuery: string = $state('')
  let searchResults: string = $state('')
  let canvasElement: HTMLCanvasElement | null = $state(null)
  let containerElement: HTMLDivElement | null = $state(null)
  let annotations: PDFAnnotation[] = $state(attachment.metadata?.annotations || [])
  
  // Annotation mode
  let annotationMode: 'none' | 'highlight' | 'comment' = $state('none')
  let newCommentText: string = $state('')
  let showCommentInput: boolean = $state(false)
  let commentPosition: { x: number; y: number } | null = $state(null)

  // Touch/Pan/Zoom state
  let isPanning: boolean = $state(false)
  let panStart: { x: number; y: number } = $state({ x: 0, y: 0 })
  let panOffset: { x: number; y: number } = $state({ x: 0, y: 0 })
  let lastTouchDistance: number = $state(0)
  let showMinimap: boolean = $state(false)
  let minimapCanvas: HTMLCanvasElement | null = $state(null)

  onMount(async () => {
    await loadPDF()
  })

  async function loadPDF() {
    try {
      isLoading = true
      const arrayBuffer = await attachment.fileBlob.arrayBuffer()
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      pdfDoc = await loadingTask.promise
      totalPages = pdfDoc.numPages
      
      // Update attachment metadata with page count
      if (!attachment.metadata?.pageCount) {
        await attachmentService.updateAttachmentMetadata(attachment.id!, {
          ...attachment.metadata,
          pageCount: totalPages
        })
      }
      
      await renderPage(currentPage)
    } catch (error) {
      console.error('Failed to load PDF:', error)
    } finally {
      isLoading = false
    }
  }

  async function renderPage(pageNum: number) {
    if (!pdfDoc || !canvasElement) return

    try {
      const page = await pdfDoc.getPage(pageNum)
      const viewport = page.getViewport({ scale })
      const context = canvasElement.getContext('2d')
      
      if (!context) return

      canvasElement.height = viewport.height
      canvasElement.width = viewport.width

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvasElement
      }

      await page.render(renderContext).promise
      
      // Render annotations for this page
      renderAnnotations(pageNum)
    } catch (error) {
      console.error('Failed to render page:', error)
    }
  }

  function renderAnnotations(pageNum: number) {
    const pageAnnotations = annotations.filter(a => a.pageNumber === pageNum)
    // TODO: Draw annotations on canvas overlay
  }

  async function searchInPDF() {
    if (!pdfDoc || !searchQuery.trim()) return

    let matchCount = 0
    searchResults = 'Searching...'

    try {
      for (let i = 1; i <= totalPages; i++) {
        const page = await pdfDoc.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')

        const matches = pageText.toLowerCase().split(searchQuery.toLowerCase()).length - 1
        matchCount += matches
      }

      searchResults = matchCount > 0 
        ? `Found ${matchCount} match${matchCount > 1 ? 'es' : ''}`
        : 'No matches found'
    } catch (error) {
      console.error('Search failed:', error)
      searchResults = 'Search failed'
    }
  }

  function nextPage() {
    if (currentPage < totalPages) {
      currentPage++
      renderPage(currentPage)
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      currentPage--
      renderPage(currentPage)
    }
  }

  function zoomIn() {
    scale = Math.min(scale + 0.25, 3)
    renderPage(currentPage)
  }

  function zoomOut() {
    scale = Math.max(scale - 0.25, 0.5)
    renderPage(currentPage)
  }

  function handleCanvasClick(event: MouseEvent) {
    if (annotationMode === 'comment' && canvasElement) {
      const rect = canvasElement.getBoundingClientRect()
      commentPosition = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      }
      showCommentInput = true
    }
  }

  // Touch and Pan handlers
  function handleTouchStart(event: TouchEvent) {
    if (event.touches.length === 1) {
      // Single touch - pan
      isPanning = true
      panStart = {
        x: event.touches[0].clientX - panOffset.x,
        y: event.touches[0].clientY - panOffset.y
      }
    } else if (event.touches.length === 2) {
      // Two fingers - pinch zoom
      const touch1 = event.touches[0]
      const touch2 = event.touches[1]
      lastTouchDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
    }
  }

  function handleTouchMove(event: TouchEvent) {
    if (event.touches.length === 1 && isPanning) {
      // Pan
      event.preventDefault()
      panOffset = {
        x: event.touches[0].clientX - panStart.x,
        y: event.touches[0].clientY - panStart.y
      }
      if (containerElement) {
        containerElement.scrollLeft = -panOffset.x
        containerElement.scrollTop = -panOffset.y
      }
    } else if (event.touches.length === 2) {
      // Pinch zoom
      event.preventDefault()
      const touch1 = event.touches[0]
      const touch2 = event.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      
      if (lastTouchDistance > 0) {
        const delta = distance - lastTouchDistance
        const zoomFactor = delta > 0 ? 0.05 : -0.05
        scale = Math.max(0.5, Math.min(3, scale + zoomFactor))
        renderPage(currentPage)
      }
      
      lastTouchDistance = distance
    }
  }

  function handleTouchEnd() {
    isPanning = false
    lastTouchDistance = 0
  }

  // Mouse wheel zoom
  function handleWheel(event: WheelEvent) {
    if (event.ctrlKey) {
      event.preventDefault()
      const delta = event.deltaY > 0 ? -0.1 : 0.1
      scale = Math.max(0.5, Math.min(3, scale + delta))
      renderPage(currentPage)
    }
  }

  // Double tap to zoom
  let lastTapTime = 0
  function handleDoubleTap(event: TouchEvent) {
    const now = Date.now()
    if (now - lastTapTime < 300) {
      // Double tap detected
      if (scale > 1) {
        scale = 1
      } else {
        scale = 2
      }
      renderPage(currentPage)
    }
    lastTapTime = now
  }

  // Generate minimap thumbnail
  async function generateMinimap() {
    if (!pdfDoc || !minimapCanvas) return
    
    try {
      const page = await pdfDoc.getPage(currentPage)
      const viewport = page.getViewport({ scale: 0.2 })
      const context = minimapCanvas.getContext('2d')
      
      if (!context) return
      
      minimapCanvas.height = viewport.height
      minimapCanvas.width = viewport.width
      
      await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: minimapCanvas
      }).promise
    } catch (error) {
      console.error('Failed to generate minimap:', error)
    }
  }

  function toggleMinimap() {
    showMinimap = !showMinimap
    if (showMinimap) {
      generateMinimap()
    }
  }

  async function saveComment() {
    if (!commentPosition || !newCommentText.trim()) return

    const annotation: PDFAnnotation = {
      id: crypto.randomUUID(),
      pageNumber: currentPage,
      type: 'comment',
      content: newCommentText,
      color: '#FFD700',
      position: commentPosition,
      createdAt: Date.now()
    }

    await attachmentService.addPDFAnnotation(attachment.id!, annotation)
    annotations = [...annotations, annotation]
    
    // Reset
    newCommentText = ''
    showCommentInput = false
    commentPosition = null
    annotationMode = 'none'
  }

  async function deleteAnnotation(annotationId: string) {
    await attachmentService.deletePDFAnnotation(attachment.id!, annotationId)
    annotations = annotations.filter(a => a.id !== annotationId)
    renderPage(currentPage)
  }

  $effect(() => {
    if (canvasElement && pdfDoc) {
      renderPage(currentPage)
    }
  })
</script>

<div class="pdf-viewer">
  <div class="pdf-toolbar">
    <div class="pdf-controls">
      <button onclick={prevPage} disabled={currentPage === 1}>
        ← Prev
      </button>
      <span class="page-info">
        Page {currentPage} of {totalPages}
      </span>
      <button onclick={nextPage} disabled={currentPage === totalPages}>
        Next →
      </button>
    </div>

    <div class="zoom-controls">
      <button onclick={zoomOut} disabled={scale <= 0.5}>−</button>
      <span>{Math.round(scale * 100)}%</span>
      <button onclick={zoomIn} disabled={scale >= 3}>+</button>
    </div>

    <div class="annotation-controls">
      <button
        class:active={annotationMode === 'comment'}
        onclick={() => annotationMode = annotationMode === 'comment' ? 'none' : 'comment'}
      >
        💬 Comment
      </button>
      <button
        class:active={showMinimap}
        onclick={toggleMinimap}
        title="Toggle minimap"
      >
        🗺️ Map
      </button>
    </div>

    <div class="search-controls">
      <input
        type="text"
        placeholder="Search in PDF..."
        bind:value={searchQuery}
        onkeydown={(e) => e.key === 'Enter' && searchInPDF()}
      />
      <button onclick={searchInPDF}>🔍</button>
      {#if searchResults}
        <span class="search-results">{searchResults}</span>
      {/if}
    </div>
  </div>

  <div 
    class="pdf-canvas-container"
    bind:this={containerElement}
    ontouchstart={handleTouchStart}
    ontouchmove={handleTouchMove}
    ontouchend={handleTouchEnd}
    onwheel={handleWheel}
  >
    {#if isLoading}
      <div class="loading">Loading PDF...</div>
    {:else}
      <canvas
        bind:this={canvasElement}
        onclick={handleCanvasClick}
        ontouchstart={handleDoubleTap}
        class:annotation-cursor={annotationMode !== 'none'}
      ></canvas>

      <!-- Minimap -->
      {#if showMinimap}
        <div class="minimap-container">
          <div class="minimap-header">
            <span>Page {currentPage}/{totalPages}</span>
            <button onclick={toggleMinimap} class="minimap-close">×</button>
          </div>
          <canvas bind:this={minimapCanvas} class="minimap-canvas"></canvas>
        </div>
      {/if}

      <!-- Comment annotations overlay -->
      {#each annotations.filter(a => a.pageNumber === currentPage && a.type === 'comment') as annotation}
        <div
          class="comment-annotation"
          style="left: {annotation.position.x}px; top: {annotation.position.y}px;"
        >
          <div class="comment-bubble">
            💬
            <div class="comment-content">
              <p>{annotation.content}</p>
              <button onclick={() => deleteAnnotation(annotation.id)}>Delete</button>
            </div>
          </div>
        </div>
      {/each}

      <!-- Comment input -->
      {#if showCommentInput && commentPosition}
        <div
          class="comment-input"
          style="left: {commentPosition.x}px; top: {commentPosition.y}px;"
        >
          <textarea
            bind:value={newCommentText}
            placeholder="Add comment..."
            rows="3"
          ></textarea>
          <div class="comment-actions">
            <button onclick={saveComment}>Save</button>
            <button onclick={() => { showCommentInput = false; annotationMode = 'none' }}>
              Cancel
            </button>
          </div>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .pdf-viewer {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--bg-color);
    color: var(--text-color);
  }

  .pdf-toolbar {
    display: flex;
    gap: 1rem;
    padding: 0.75rem 1rem;
    background: var(--card-bg);
    border-bottom: 1px solid var(--border-color);
    flex-wrap: wrap;
    align-items: center;
  }

  .pdf-controls, .zoom-controls, .annotation-controls {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .search-controls {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex: 1;
    min-width: 200px;
  }

  .search-controls input {
    flex: 1;
    padding: 0.4rem 0.6rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background: var(--bg-color);
    color: var(--text-color);
    transition: all 0.2s;
  }

  .search-controls input:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  button {
    padding: 0.4rem 0.8rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
  }

  button:hover {
    background: var(--primary-hover);
  }

  button:disabled {
    background: var(--border-color);
    color: var(--text-secondary);
    cursor: not-allowed;
    opacity: 0.5;
  }

  button.active {
    background: #ff9800;
  }

  .page-info {
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .search-results {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .pdf-canvas-container {
    flex: 1;
    overflow: auto;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 2rem;
    position: relative;
    background: var(--bg-color);
  }

  canvas {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background: white;
    border-radius: 4px;
  }

  canvas.annotation-cursor {
    cursor: crosshair;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    color: var(--text-secondary);
  }

  .comment-annotation {
    position: absolute;
    z-index: 10;
  }

  .comment-bubble {
    position: relative;
    cursor: pointer;
    font-size: 1.5rem;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    transition: transform 0.2s;
  }

  .comment-bubble:hover {
    transform: scale(1.1);
  }

  .comment-content {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 0.75rem;
    min-width: 220px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 100;
  }

  .comment-bubble:hover .comment-content {
    display: block;
  }

  .comment-content p {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
  }

  .comment-input {
    position: absolute;
    z-index: 20;
    background: var(--card-bg);
    border: 2px solid var(--primary-color);
    border-radius: 8px;
    padding: 0.75rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  }

  .comment-input textarea {
    width: 280px;
    padding: 0.6rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    resize: vertical;
    background: var(--bg-color);
    color: var(--text-color);
    font-family: inherit;
  }

  .comment-input textarea:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  .comment-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .comment-actions button {
    flex: 1;
    padding: 0.4rem;
    font-size: 0.85rem;
  }

  .comment-content p {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
    color: var(--text-color);
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .pdf-toolbar {
      padding: 0.5rem;
      gap: 0.5rem;
    }

    .search-controls {
      width: 100%;
    }

    .pdf-canvas-container {
      padding: 1rem;
    }

    button {
      padding: 0.3rem 0.6rem;
      font-size: 0.85rem;
    }
  }
</style>
