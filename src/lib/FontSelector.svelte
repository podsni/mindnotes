<script lang="ts">
  import { uiStore } from './store.svelte'

  export const fontOptions = [
    // Screenplay Standard Fonts
    { id: 'courier-new', name: '📝 Courier New', desc: 'Hollywood Standard', family: '"Courier New", Courier, monospace', category: 'Screenplay' },
    { id: 'courier-prime', name: '📝 Courier Prime', desc: 'Modern & Clean', family: '"Courier Prime", "Courier New", Courier, monospace', category: 'Screenplay' },
    
    // Typewriter / Mesin Ketik Fonts
    { id: 'special-elite', name: '⌨️ Special Elite', desc: 'Retro Typewriter', family: '"Special Elite", "Courier New", monospace', category: 'Typewriter' },
    { id: 'american-typewriter', name: '⌨️ American Typewriter', desc: 'Classic', family: '"American Typewriter", "Courier New", serif', category: 'Typewriter' },
    { id: 'cutive-mono', name: '⌨️ Cutive Mono', desc: 'Formal Style', family: '"Cutive Mono", "Courier New", monospace', category: 'Typewriter' },
    
    // Modern Monospace Fonts
    { id: 'ibm-plex', name: '💻 IBM Plex Mono', desc: 'Professional', family: '"IBM Plex Mono", monospace', category: 'Modern' },
    { id: 'source-code', name: '💻 Source Code Pro', desc: 'Adobe Font', family: '"Source Code Pro", monospace', category: 'Modern' },
    { id: 'pt-mono', name: '💻 PT Mono', desc: 'Clean Modern', family: '"PT Mono", monospace', category: 'Modern' },
    { id: 'anonymous', name: '💻 Anonymous Pro', desc: 'Focus Writing', family: '"Anonymous Pro", monospace', category: 'Modern' },
    
    // Additional Fonts
    { id: 'roboto-mono', name: '💻 Roboto Mono', desc: 'Google Standard', family: '"Roboto Mono", monospace', category: 'Modern' },
    { id: 'jetbrains', name: '💻 JetBrains Mono', desc: 'Developer Font', family: '"JetBrains Mono", monospace', category: 'Modern' },
    
    // System Fallback
    { id: 'system', name: '🖥️ System Default', desc: 'OS Native', family: 'system-ui, -apple-system, sans-serif', category: 'System' },
  ]

  let isOpen = $state(false)

  const toggleDropdown = () => {
    isOpen = !isOpen
  }

  const selectFont = (fontId: string) => {
    uiStore.setFont(fontId)
    isOpen = false
    
    // Visual feedback - flash the editor briefly
    const editor = document.querySelector('.editor-content')
    if (editor) {
      editor.classList.add('font-changing')
      setTimeout(() => editor.classList.remove('font-changing'), 300)
    }
  }

  const currentFont = $derived(
    fontOptions.find(f => f.id === uiStore.font) || fontOptions[0]
  )

  const increaseFontSize = () => {
    uiStore.setFontSize(uiStore.fontSize + 1)
  }

  const decreaseFontSize = () => {
    uiStore.setFontSize(uiStore.fontSize - 1)
  }

  const handleFontSizeInput = (e: Event) => {
    const target = e.target as HTMLInputElement
    const size = parseInt(target.value, 10)
    if (!isNaN(size)) {
      uiStore.setFontSize(size)
    }
  }

  // Close dropdown when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (!target.closest('.font-selector')) {
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

<div class="font-selector">
  <!-- Font Family Selector -->
  <button 
    type="button"
    class="font-selector-button"
    onclick={toggleDropdown}
    aria-label="Select font"
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M4 7V4h16v3M9 20h6M12 4v16" />
    </svg>
    <span class="font-name">{currentFont.name}</span>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chevron" class:open={isOpen}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </button>

  <!-- Font Size Control -->
  <div class="font-size-control">
    <button 
      type="button"
      class="btn-size"
      onclick={decreaseFontSize}
      disabled={uiStore.fontSize <= 12}
      aria-label="Decrease font size"
      title="Decrease font size"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>
    
    <input 
      type="number"
      class="font-size-input"
      value={uiStore.fontSize}
      oninput={handleFontSizeInput}
      min="12"
      max="100"
      aria-label="Font size"
    />
    <span class="font-size-label">px</span>
    
    <button 
      type="button"
      class="btn-size"
      onclick={increaseFontSize}
      disabled={uiStore.fontSize >= 100}
      aria-label="Increase font size"
      title="Increase font size"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>
  </div>

  {#if isOpen}
    <div class="font-dropdown">
      {#each fontOptions as font (font.id)}
        <button
          type="button"
          class="font-option"
          class:active={font.id === uiStore.font}
          onclick={() => selectFont(font.id)}
        >
          <div class="font-option-content">
            <div class="font-option-header">
              <span class="font-option-name">{font.name}</span>
              {#if font.id === uiStore.font}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              {/if}
            </div>
            <div class="font-option-preview" style="font-family: {font.family};">
              The quick brown fox jumps
            </div>
            <div class="font-option-desc">{font.desc}</div>
          </div>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .font-selector {
    position: relative;
    width: 100%;
  }

  .font-selector-button {
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

  .font-selector-button:hover {
    background: var(--bg-hover);
    border-color: var(--border-hover);
  }

  .font-name {
    flex: 1;
    text-align: left;
  }

  .chevron {
    transition: transform 0.2s;
  }

  .chevron.open {
    transform: rotate(180deg);
  }

  .font-dropdown {
    position: absolute;
    top: calc(100% + 0.25rem);
    left: 0;
    right: 0;
    max-height: 400px;
    overflow-y: auto;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }

  .font-option {
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

  .font-option:last-child {
    border-bottom: none;
  }

  .font-option:hover {
    background: var(--bg-hover);
  }

  .font-option.active {
    background: var(--bg-active);
  }

  .font-option-content {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .font-option-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .font-option-name {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .font-option.active .font-option-name {
    color: var(--accent);
  }

  .font-option svg {
    flex-shrink: 0;
    color: var(--accent);
  }

  .font-option-preview {
    font-size: 0.875rem;
    color: var(--text-secondary);
    padding: 0.375rem 0.5rem;
    background: var(--card-bg);
    border-radius: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .font-option-desc {
    font-size: 0.75rem;
    color: var(--text-secondary);
    opacity: 0.7;
  }

  /* Font Size Control */
  .font-size-control {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
  }

  .btn-size {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 0.375rem;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s;
    padding: 0;
  }

  .btn-size:hover:not(:disabled) {
    background: var(--hover-bg);
    border-color: var(--accent);
    transform: scale(1.05);
  }

  .btn-size:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .font-size-input {
    width: 50px;
    padding: 0.375rem 0.5rem;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 0.375rem;
    color: var(--text-primary);
    font-size: 0.875rem;
    text-align: center;
    appearance: textfield;
    -moz-appearance: textfield;
  }

  .font-size-input::-webkit-outer-spin-button,
  .font-size-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .font-size-input:focus {
    outline: none;
    border-color: var(--accent);
  }

  .font-size-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-left: -0.25rem;
  }

  /* Mobile styles */
  @media (max-width: 768px) {
    .font-dropdown {
      position: fixed;
      top: auto;
      bottom: 0;
      left: 0;
      right: 0;
      max-height: 60vh;
      border-radius: 1rem 1rem 0 0;
      box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.2);
    }

    .font-size-control {
      padding: 0.375rem 0.5rem;
    }

    .btn-size {
      width: 28px;
      height: 28px;
    }

    .font-size-input {
      width: 45px;
      font-size: 0.8rem;
    }
  }
</style>
