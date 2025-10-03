<script lang="ts">
  import { onMount } from 'svelte'
  
  let { svg, onClose }: { svg: string; onClose?: () => void } = $props()
  
  let container: HTMLDivElement | undefined = $state()
  let svgElement: SVGElement | undefined = $state()
  
  // Transform state
  let scale: number = $state(1)
  let translateX: number = $state(0)
  let translateY: number = $state(0)
  
  // Pan state
  let isPanning: boolean = $state(false)
  let startX: number = $state(0)
  let startY: number = $state(0)
  let lastTranslateX: number = $state(0)
  let lastTranslateY: number = $state(0)
  
  // Touch state
  let initialDistance: number = $state(0)
  let initialScale: number = $state(1)
  
  const MIN_SCALE = 0.5
  const MAX_SCALE = 5
  const ZOOM_STEP = 0.2
  
  onMount(() => {
    if (container) {
      // Parse SVG string and insert into container
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = svg
      const svgEl = tempDiv.querySelector('svg')
      
      if (svgEl) {
        svgElement = svgEl
        container.appendChild(svgEl)
        
        // Set initial viewBox to fit
        const bbox = svgEl.getBBox()
        if (bbox.width && bbox.height) {
          svgEl.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`)
          svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet')
        }
        
        // Make SVG fill container
        svgEl.style.width = '100%'
        svgEl.style.height = '100%'
      }
    }
  })
  
  // Update transform
  function updateTransform() {
    if (svgElement) {
      svgElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`
      svgElement.style.transformOrigin = 'center center'
    }
  }
  
  // Zoom functions
  function zoomIn() {
    if (scale < MAX_SCALE) {
      scale = Math.min(scale + ZOOM_STEP, MAX_SCALE)
      updateTransform()
    }
  }
  
  function zoomOut() {
    if (scale > MIN_SCALE) {
      scale = Math.max(scale - ZOOM_STEP, MIN_SCALE)
      updateTransform()
    }
  }
  
  function resetZoom() {
    scale = 1
    translateX = 0
    translateY = 0
    updateTransform()
  }
  
  // Mouse wheel zoom
  function handleWheel(e: WheelEvent) {
    e.preventDefault()
    
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale + delta))
    
    if (newScale !== scale) {
      scale = newScale
      updateTransform()
    }
  }
  
  // Mouse pan
  function handleMouseDown(e: MouseEvent) {
    if (e.button !== 0) return // Only left click
    
    isPanning = true
    startX = e.clientX
    startY = e.clientY
    lastTranslateX = translateX
    lastTranslateY = translateY
    
    if (container) {
      container.style.cursor = 'grabbing'
    }
  }
  
  function handleMouseMove(e: MouseEvent) {
    if (!isPanning) return
    
    const dx = e.clientX - startX
    const dy = e.clientY - startY
    
    translateX = lastTranslateX + dx
    translateY = lastTranslateY + dy
    updateTransform()
  }
  
  function handleMouseUp() {
    isPanning = false
    if (container) {
      container.style.cursor = 'grab'
    }
  }
  
  // Touch support
  function getTouchDistance(touches: TouchList): number {
    if (touches.length < 2) return 0
    
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }
  
  function handleTouchStart(e: TouchEvent) {
    if (e.touches.length === 1) {
      // Single touch - pan
      isPanning = true
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
      lastTranslateX = translateX
      lastTranslateY = translateY
    } else if (e.touches.length === 2) {
      // Two finger - zoom
      e.preventDefault()
      isPanning = false
      initialDistance = getTouchDistance(e.touches)
      initialScale = scale
    }
  }
  
  function handleTouchMove(e: TouchEvent) {
    if (e.touches.length === 1 && isPanning) {
      // Pan
      const dx = e.touches[0].clientX - startX
      const dy = e.touches[0].clientY - startY
      
      translateX = lastTranslateX + dx
      translateY = lastTranslateY + dy
      updateTransform()
    } else if (e.touches.length === 2) {
      // Pinch zoom
      e.preventDefault()
      const currentDistance = getTouchDistance(e.touches)
      
      if (initialDistance > 0) {
        const ratio = currentDistance / initialDistance
        const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, initialScale * ratio))
        scale = newScale
        updateTransform()
      }
    }
  }
  
  function handleTouchEnd() {
    isPanning = false
    initialDistance = 0
  }
  
  // Keyboard shortcuts
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape' && onClose) {
      onClose()
    } else if (e.key === '+' || e.key === '=') {
      e.preventDefault()
      zoomIn()
    } else if (e.key === '-') {
      e.preventDefault()
      zoomOut()
    } else if (e.key === '0') {
      e.preventDefault()
      resetZoom()
    }
  }
</script>

<svelte:window 
  onkeydown={handleKeyDown}
  onmousemove={handleMouseMove}
  onmouseup={handleMouseUp}
/>

<div class="mermaid-viewer-overlay" onclick={onClose} role="button" tabindex="0">
  <div class="mermaid-viewer-container" onclick={(e) => e.stopPropagation()} role="dialog" tabindex="-1">
    <!-- Header with controls -->
    <div class="viewer-header">
      <div class="viewer-title">Mermaid Diagram</div>
      <div class="viewer-controls">
        <button 
          class="control-btn" 
          onclick={zoomOut}
          disabled={scale <= MIN_SCALE}
          title="Zoom Out (-)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="8" y1="11" x2="14" y2="11"></line>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
        
        <span class="zoom-level">{Math.round(scale * 100)}%</span>
        
        <button 
          class="control-btn" 
          onclick={zoomIn}
          disabled={scale >= MAX_SCALE}
          title="Zoom In (+)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
        
        <button 
          class="control-btn" 
          onclick={resetZoom}
          title="Reset (0)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
            <path d="M21 3v5h-5"></path>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
            <path d="M3 21v-5h5"></path>
          </svg>
        </button>
        
        {#if onClose}
          <button class="control-btn close-btn" onclick={onClose} title="Close (Esc)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        {/if}
      </div>
    </div>
    
    <!-- SVG Container -->
    <div 
      class="svg-container"
      bind:this={container}
      onwheel={handleWheel}
      onmousedown={handleMouseDown}
      ontouchstart={handleTouchStart}
      ontouchmove={handleTouchMove}
      ontouchend={handleTouchEnd}
      role="img"
      aria-label="Interactive Mermaid diagram"
    >
      <!-- SVG will be inserted here by onMount -->
    </div>
    
    <!-- Instructions -->
    <div class="viewer-instructions">
      <span>🖱️ Drag to pan</span>
      <span>🔍 Scroll to zoom</span>
      <span>📱 Pinch to zoom</span>
      <span>⌨️ +/- to zoom, 0 to reset, Esc to close</span>
    </div>
  </div>
</div>

<style>
  .mermaid-viewer-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.2s ease-out;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  .mermaid-viewer-container {
    width: 95vw;
    height: 95vh;
    max-width: 1600px;
    background: var(--bg-color);
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideUp 0.3s ease-out;
  }
  
  @keyframes slideUp {
    from {
      transform: translateY(30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  .viewer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background: var(--card-bg);
    border-bottom: 1px solid var(--border-color);
  }
  
  .viewer-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-color);
  }
  
  .viewer-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .control-btn {
    padding: 0.5rem;
    background: var(--bg-color);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    color: var(--text-color);
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .control-btn:hover:not(:disabled) {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
    transform: translateY(-1px);
  }
  
  .control-btn:active:not(:disabled) {
    transform: translateY(0);
  }
  
  .control-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  
  .close-btn {
    background: #ef4444;
    border-color: #ef4444;
    color: white;
  }
  
  .close-btn:hover {
    background: #dc2626;
    border-color: #dc2626;
  }
  
  .zoom-level {
    min-width: 55px;
    text-align: center;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-color);
    padding: 0 0.5rem;
  }
  
  .svg-container {
    flex: 1;
    overflow: hidden;
    cursor: grab;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-color);
    touch-action: none; /* Prevent default touch behaviors */
  }
  
  .svg-container:active {
    cursor: grabbing;
  }
  
  .svg-container :global(svg) {
    transition: transform 0.1s ease-out;
    will-change: transform;
  }
  
  .viewer-instructions {
    padding: 0.75rem 1.5rem;
    background: var(--card-bg);
    border-top: 1px solid var(--border-color);
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
  
  .viewer-instructions span {
    white-space: nowrap;
  }
  
  /* Mobile optimizations */
  @media (max-width: 768px) {
    .mermaid-viewer-container {
      width: 100vw;
      height: 100vh;
      border-radius: 0;
    }
    
    .viewer-header {
      padding: 0.75rem 1rem;
    }
    
    .viewer-title {
      font-size: 1rem;
    }
    
    .control-btn {
      padding: 0.4rem;
    }
    
    .zoom-level {
      min-width: 50px;
      font-size: 0.85rem;
    }
    
    .viewer-instructions {
      padding: 0.5rem 1rem;
      font-size: 0.75rem;
      gap: 0.5rem;
    }
    
    .viewer-instructions span:nth-child(n+3) {
      display: none; /* Hide keyboard shortcuts on mobile */
    }
  }
  
  /* Dark mode support */
  :global([data-theme="dark"]) .mermaid-viewer-overlay {
    background: rgba(0, 0, 0, 0.9);
  }
</style>
