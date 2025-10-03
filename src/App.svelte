<script lang="ts">
  import { onMount } from 'svelte'
  import Sidebar from './lib/Sidebar.svelte'
  import Editor from './lib/Editor.svelte'
  import Home from './lib/Home.svelte'
  import OfflineIndicator from './lib/OfflineIndicator.svelte'
  import { notesStore, uiStore } from './lib/store.svelte'
  import { router } from './lib/router'
  import { initTouchHandlers } from './lib/touchHandler.svelte'
  import { registerSW } from 'virtual:pwa-register'

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
    uiStore.loadFont() // Load saved font
    uiStore.loadFontSize() // Load saved font size
    
    window.addEventListener('resize', checkMobile)
    window.addEventListener('keydown', handleKeydown)
    
    // Initialize touch handlers for swipe gestures
    const cleanupTouch = initTouchHandlers()

    // Register Service Worker for PWA
    const updateSW = registerSW({
      onNeedRefresh() {
        if (confirm('New version available! Reload to update?')) {
          updateSW(true)
        }
      },
      onOfflineReady() {
        console.log('App is ready to work offline')
      },
    })

    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('keydown', handleKeydown)
      cleanupTouch()
    }
  })
</script>

<div class="app">
  <Sidebar />
  
  <!-- Toggle Button (compact & smart positioning) -->
  <button 
    class="sidebar-toggle" 
    class:sidebar-open={uiStore.sidebarOpen && !uiStore.isMobile}
    onclick={() => uiStore.toggleSidebar()}
    aria-label="Toggle sidebar"
    title={uiStore.sidebarOpen ? 'Close sidebar (Ctrl+B)' : 'Open sidebar (Ctrl+B)'}
  >
    {#if uiStore.sidebarOpen}
      <!-- Close icon when sidebar is open -->
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    {:else}
      <!-- Menu icon when sidebar is closed -->
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <line x1="4" y1="6" x2="20" y2="6"></line>
        <line x1="4" y1="12" x2="20" y2="12"></line>
        <line x1="4" y1="18" x2="20" y2="18"></line>
      </svg>
    {/if}
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
  
  <main class="main-content" class:sidebar-open={uiStore.sidebarOpen && !uiStore.isMobile}>
    {#if currentRoute.path === '/'}
      <Home />
    {:else if currentRoute.path === '/note/:id' && currentRoute.params.id}
      <Editor id={currentRoute.params.id} />
    {:else}
      <Home />
    {/if}
  </main>

  <!-- Offline Indicator -->
  <OfflineIndicator />

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
    transition: margin-left 0.3s ease;
  }

  /* Add margin when sidebar is open on desktop */
  @media (min-width: 1025px) {
    .main-content.sidebar-open {
      margin-left: 280px;
    }
  }

  /* Sidebar Toggle Button - Compact & Smart */
  .sidebar-toggle {
    position: fixed;
    top: 0.75rem;
    z-index: 1001;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 50%;
    width: 36px;
    height: 36px;
    padding: 0;
    cursor: pointer;
    color: var(--text-color);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    opacity: 0.85;
  }

  /* Position changes based on sidebar state on desktop */
  @media (min-width: 1025px) {
    .sidebar-toggle {
      left: 0.75rem;
    }
    
    .sidebar-toggle.sidebar-open {
      left: calc(280px + 0.5rem);
    }
  }

  /* On mobile/tablet always at left */
  @media (max-width: 1024px) {
    .sidebar-toggle {
      left: 0.75rem;
    }
  }

  .sidebar-toggle:hover {
    background: var(--hover-bg);
    border-color: var(--primary-color);
    transform: scale(1.08);
    opacity: 1;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }

  .sidebar-toggle:active {
    transform: scale(0.92);
  }

  /* Subtle pulsing animation when sidebar is closed on desktop */
  @media (min-width: 1025px) {
    .sidebar-toggle:not(.sidebar-open) {
      animation: subtlePulse 3s ease-in-out infinite;
    }
  }

  @keyframes subtlePulse {
    0%, 100% { opacity: 0.85; }
    50% { opacity: 1; }
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

  /* Desktop (>1024px) - Show toggle button always */
  @media (min-width: 1025px) {
    .sidebar-toggle {
      display: flex;
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

  /* Theme changing animation */
  :global(.app.theme-changing) {
    animation: themeTransition 0.4s ease;
  }

  @keyframes themeTransition {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.85; }
  }
</style>
