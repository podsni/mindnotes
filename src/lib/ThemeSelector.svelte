<script lang="ts">
  import { uiStore } from './store.svelte'

  export const themeOptions = [
    { 
      id: 'dark', 
      name: '🌙 Dark', 
      desc: 'Dark mode for night coding',
      icon: '🌙'
    },
    { 
      id: 'light', 
      name: '☀️ Light', 
      desc: 'Clean light theme',
      icon: '☀️'
    },
    { 
      id: 'typewriter', 
      name: '📝 Typewriter', 
      desc: 'Classic paper style for focus writing',
      icon: '📝'
    },
    { 
      id: 'minimal', 
      name: '✨ Minimal', 
      desc: 'Modern flat design with frosted glass',
      icon: '✨'
    },
    { 
      id: 'dark-typewriter', 
      name: '🖋️ Dark Typewriter', 
      desc: 'Elegant dark mode with typewriter vibes',
      icon: '🖋️'
    },
    { 
      id: 'green-terminal', 
      name: '💚 Green Terminal', 
      desc: 'Retro 80s terminal with neon green',
      icon: '💚'
    },
    { 
      id: 'amber-noir', 
      name: '🔶 Amber Noir', 
      desc: 'Vintage typewriter with warm amber glow',
      icon: '🔶'
    },
    { 
      id: 'indigo-typewriter', 
      name: '💜 Indigo Typewriter', 
      desc: 'Modern classy with purple neon accents',
      icon: '💜'
    },
  ]

  let isOpen = $state(false)

  const toggleDropdown = () => {
    isOpen = !isOpen
  }

  const selectTheme = (themeId: 'dark' | 'light' | 'typewriter' | 'minimal' | 'dark-typewriter' | 'green-terminal' | 'amber-noir' | 'indigo-typewriter') => {
    uiStore.setTheme(themeId)
    isOpen = false
    
    // Visual feedback
    const app = document.querySelector('#app')
    if (app) {
      app.classList.add('theme-changing')
      setTimeout(() => app.classList.remove('theme-changing'), 400)
    }
  }

  const currentTheme = $derived(
    themeOptions.find(t => t.id === uiStore.theme) || themeOptions[0]
  )

  // Close dropdown when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (!target.closest('.theme-selector')) {
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

<div class="theme-selector">
  <button 
    type="button"
    class="theme-selector-button"
    onclick={toggleDropdown}
    aria-label="Select theme"
    title="Change theme"
  >
    <span class="theme-icon">{currentTheme.icon}</span>
    <span class="theme-name">{currentTheme.name}</span>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chevron" class:open={isOpen}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </button>

  {#if isOpen}
    <div class="theme-dropdown">
      {#each themeOptions as theme (theme.id)}
        <button
          type="button"
          class="theme-option"
          class:active={theme.id === uiStore.theme}
          onclick={() => selectTheme(theme.id as any)}
        >
          <div class="theme-option-content">
            <div class="theme-option-header">
              <span class="theme-option-icon">{theme.icon}</span>
              <span class="theme-option-name">{theme.name}</span>
              {#if theme.id === uiStore.theme}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              {/if}
            </div>
            <div class="theme-option-desc">{theme.desc}</div>
          </div>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .theme-selector {
    position: relative;
    width: 100%;
  }

  .theme-selector-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.625rem 0.75rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    color: var(--text-primary);
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .theme-selector-button:hover {
    background: var(--bg-hover);
    border-color: var(--border-hover);
  }

  .theme-icon {
    font-size: 1.25rem;
  }

  .theme-name {
    flex: 1;
    text-align: left;
  }

  .chevron {
    transition: transform 0.2s;
  }

  .chevron.open {
    transform: rotate(180deg);
  }

  .theme-dropdown {
    position: absolute;
    top: calc(100% + 0.25rem);
    left: 0;
    right: 0;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    overflow: hidden;
  }

  .theme-option {
    width: 100%;
    padding: 0.875rem;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }

  .theme-option:last-child {
    border-bottom: none;
  }

  .theme-option:hover {
    background: var(--bg-hover);
  }

  .theme-option.active {
    background: var(--bg-active);
  }

  .theme-option-content {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .theme-option-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .theme-option-icon {
    font-size: 1.25rem;
  }

  .theme-option-name {
    flex: 1;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .theme-option.active .theme-option-name {
    color: var(--accent);
  }

  .theme-option svg {
    flex-shrink: 0;
    color: var(--accent);
  }

  .theme-option-desc {
    font-size: 0.75rem;
    color: var(--text-secondary);
    opacity: 0.8;
    margin-left: 1.75rem;
  }

  /* Mobile styles */
  @media (max-width: 768px) {
    .theme-dropdown {
      position: fixed;
      top: auto;
      bottom: 0;
      left: 0;
      right: 0;
      border-radius: 1rem 1rem 0 0;
      box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.2);
    }
  }
</style>
