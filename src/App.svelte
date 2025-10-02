<script lang="ts">
  import { onMount } from 'svelte'
  import Sidebar from './lib/Sidebar.svelte'
  import Editor from './lib/Editor.svelte'
  import Home from './lib/Home.svelte'
  import { notesStore, uiStore } from './lib/store.svelte'
  import { router } from './lib/router'
  import { initTouchHandlers } from './lib/touchHandler.svelte'

  let currentRoute = $state<{ path: string; params: Record<string, string> }>({ path: '/', params: {} })

  // Subscribe to route changes
  router.subscribe(route => {
    currentRoute = route
  })

  // Handle keyboard shortcuts
  const handleKeydown = (e: KeyboardEvent) => {
    // Ctrl+B or Cmd+B to toggle sidebar
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault()
      uiStore.toggleSidebar()
    }
  }

  // Handle backdrop click
  const handleBackdropClick = () => {
    if (uiStore.isMobile) {
      uiStore.closeSidebar()
    }
  }

  // Check screen size and set mobile state
  const checkMobile = () => {
    uiStore.setMobile(window.innerWidth < 768)
  }

  // Load notes on app startup
  onMount(() => {
    notesStore.loadNotes()
    checkMobile()
    uiStore.loadTheme() // Load saved theme
    
    window.addEventListener('resize', checkMobile)
    window.addEventListener('keydown', handleKeydown)
    
    // Initialize touch handlers for swipe gestures
    const cleanupTouch = initTouchHandlers()

    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('keydown', handleKeydown)
      cleanupTouch()
    }
  })
</script>

<div class="app">
  <!-- Toggle Button (burger menu) -->
  <button 
    class="sidebar-toggle" 
    class:hidden={uiStore.sidebarOpen && !uiStore.isMobile}
    onclick={() => uiStore.toggleSidebar()}
    aria-label="Toggle sidebar"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  </button>

  <!-- Backdrop for mobile -->
  {#if uiStore.sidebarOpen && uiStore.isMobile}
    <div 
      class="backdrop" 
      onclick={handleBackdropClick}
      onkeydown={(e) => e.key === 'Escape' && handleBackdropClick()}
      role="button"
      tabindex="-1"
      aria-label="Close sidebar"
    ></div>
  {/if}

  <Sidebar />
  
  <main class="main-content">
    {#if currentRoute.path === '/'}
      <Home />
    {:else if currentRoute.path === '/note/:id' && currentRoute.params.id}
      <Editor id={currentRoute.params.id} />
    {:else}
      <Home />
    {/if}
  </main>

  <!-- FAB (Floating Action Button) for mobile -->
  {#if uiStore.isMobile}
    <button 
      class="fab" 
      onclick={async () => {
        const id = await notesStore.createNote('New Note', '')
        router.navigate(`/note/${id}`)
      }}
      aria-label="Create new note"
    >
      +
    </button>
  {/if}
</div>

<style>
  .app {
    display: flex;
    height: 100vh;
    overflow: hidden;
    background: var(--bg-color);
    color: var(--text-color);
    position: relative;
    transition: background-color 0.3s, color 0.3s;
  }

  .main-content {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  /* Sidebar Toggle Button */
  .sidebar-toggle {
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 1001;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 0.5rem;
    cursor: pointer;
    color: var(--text-color);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .sidebar-toggle:hover {
    background: var(--hover-bg);
    border-color: var(--primary-color);
  }

  .sidebar-toggle.hidden {
    opacity: 0;
    pointer-events: none;
  }

  /* Backdrop for mobile */
  .backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    animation: fadeIn 0.2s;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* Desktop (>1024px) - Static sidebar */
  @media (min-width: 1025px) {
    .sidebar-toggle {
      display: none;
    }
  }

  /* Tablet (600-1024px) - Collapsible sidebar */
  @media (max-width: 1024px) {
    .sidebar-toggle {
      display: flex;
    }
  }

  /* Mobile (<600px) - Drawer sidebar */
  @media (max-width: 600px) {
    .main-content {
      width: 100%;
    }
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
    color: white;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 122, 204, 0.4);
    z-index: 998;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
  }

  .fab:hover {
    background: var(--primary-hover);
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 122, 204, 0.6);
  }

  .fab:active {
    transform: scale(0.95);
  }
</style>
