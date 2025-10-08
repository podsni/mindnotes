<script lang="ts">
  import ThemeSelector from './ThemeSelector.svelte'
  import FontSelector from './FontSelector.svelte'
  import ExportImport from './ExportImport.svelte'
  import GoogleDriveSync from './GoogleDriveSync.svelte'

  let isOpen = $state(false)

  const toggleSettings = () => {
    isOpen = !isOpen
  }

  // Close settings when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (!target.closest('.settings-container')) {
      isOpen = false
    }
  }

  $effect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  })
</script>

<div class="settings-container">
  <button
    type="button"
    class="settings-toggle"
    onclick={toggleSettings}
    aria-label="Settings"
    aria-expanded={isOpen}
    title={isOpen ? 'Close settings' : 'Open settings'}
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="settings-icon" class:spinning={isOpen}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6m6-12v6m0 6v6M6 1v6m0 6v6" />
      <path d="M1 12h6m6 0h6" />
    </svg>
    <span class="settings-label">Settings</span>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chevron" class:open={isOpen}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </button>

  {#if isOpen}
    <div class="settings-dropdown">
      <!-- Theme Selector -->
      <div class="settings-section">
        <div class="section-label">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          Theme
        </div>
        <ThemeSelector />
      </div>

      <!-- Font Selector -->
      <div class="settings-section">
        <div class="section-label">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 7V4h16v3M9 20h6M12 4v16" />
          </svg>
          Font
        </div>
        <FontSelector />
      </div>

      <!-- Export/Import -->
      <div class="settings-section">
        <ExportImport />
      </div>

      <!-- Google Drive Sync -->
      <div class="settings-section">
        <GoogleDriveSync />
      </div>
    </div>
  {/if}
</div>

<style>
  .settings-container {
    position: relative;
    padding: 0 1rem 1rem 1rem;
    border-bottom: 1px solid var(--border-color);
  }

  .settings-toggle {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    width: 100%;
    padding: 0.75rem 1rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    color: var(--text-primary);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .settings-toggle:hover {
    background: var(--bg-hover);
    border-color: var(--accent);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .settings-toggle:active {
    transform: translateY(0);
  }

  .settings-icon {
    flex-shrink: 0;
    color: var(--accent);
    transition: transform 0.5s ease;
  }

  .settings-icon.spinning {
    animation: spin 0.5s ease;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(180deg); }
  }

  .settings-label {
    flex: 1;
    text-align: left;
  }

  .chevron {
    flex-shrink: 0;
    transition: transform 0.2s;
    opacity: 0.7;
  }

  .chevron.open {
    transform: rotate(180deg);
  }

  .settings-dropdown {
    position: absolute;
    top: calc(100% - 0.5rem);
    left: 0.5rem;
    right: 0.5rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    z-index: 1100;
    max-height: 80vh;
    overflow-y: auto;
    overflow-x: hidden;
    animation: slideDown 0.2s ease;
    
    /* Smooth scrolling */
    scroll-behavior: smooth;
    
    /* Custom scrollbar */
    scrollbar-width: thin;
    scrollbar-color: var(--border-hover) var(--bg-secondary);
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Webkit scrollbar */
  .settings-dropdown::-webkit-scrollbar {
    width: 6px;
  }

  .settings-dropdown::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 0 0.5rem 0.5rem 0;
  }

  .settings-dropdown::-webkit-scrollbar-thumb {
    background: var(--border-hover);
    border-radius: 3px;
  }

  .settings-dropdown::-webkit-scrollbar-thumb:hover {
    background: var(--accent);
  }

  .settings-section {
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);
  }

  .settings-section:last-child {
    border-bottom: none;
  }

  .section-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .section-label svg {
    flex-shrink: 0;
    opacity: 0.7;
  }

  /* Mobile styles */
  @media (max-width: 768px) {
    .settings-container {
      padding: 0 0.75rem 0.75rem 0.75rem;
    }

    .settings-toggle {
      padding: 0.625rem 0.875rem;
      font-size: 0.875rem;
    }

    .settings-dropdown {
      position: fixed;
      top: auto;
      bottom: 0;
      left: 0;
      right: 0;
      max-height: 85vh;
      border-radius: 1rem 1rem 0 0;
      box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.3);
      
      /* Better touch scrolling */
      -webkit-overflow-scrolling: touch;
    }

    /* Larger scrollbar on mobile */
    .settings-dropdown::-webkit-scrollbar {
      width: 8px;
    }

    .settings-section {
      padding: 0.875rem;
    }

    .section-label {
      font-size: 0.75rem;
      margin-bottom: 0.625rem;
    }
  }

  /* Tablet styles */
  @media (min-width: 769px) and (max-width: 1024px) {
    .settings-dropdown {
      max-height: 70vh;
    }
  }

  /* Desktop styles */
  @media (min-width: 1025px) {
    .settings-dropdown {
      max-height: 75vh;
    }
  }
</style>
