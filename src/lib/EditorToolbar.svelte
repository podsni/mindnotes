<script lang="ts">
  // Editor toolbar for inline formatting and quick actions
  
  interface Props {
    onBold?: () => void
    onItalic?: () => void
    onStrikethrough?: () => void
    onCode?: () => void
    onLink?: () => void
    onImage?: () => void
    onHeading?: (level: number) => void
    onList?: (ordered: boolean) => void
    onCheckbox?: () => void
    onTable?: () => void
  }
  
  let {
    onBold,
    onItalic,
    onStrikethrough,
    onCode,
    onLink,
    onImage,
    onHeading,
    onList,
    onCheckbox,
    onTable
  }: Props = $props()
  
  let showHeadingMenu = $state(false)
  
  const handleHeading = (level: number) => {
    showHeadingMenu = false
    onHeading?.(level)
  }
</script>

<div class="toolbar">
  <!-- Text formatting -->
  <div class="toolbar-group">
    <button
      type="button"
      class="toolbar-btn"
      title="Bold (Ctrl+B)"
      onclick={onBold}
    >
      <strong>B</strong>
    </button>
    
    <button
      type="button"
      class="toolbar-btn"
      title="Italic (Ctrl+I)"
      onclick={onItalic}
    >
      <em>I</em>
    </button>
    
    <button
      type="button"
      class="toolbar-btn"
      title="Strikethrough (Ctrl+Shift+X)"
      onclick={onStrikethrough}
    >
      <s>S</s>
    </button>
    
    <button
      type="button"
      class="toolbar-btn"
      title="Inline Code (Ctrl+`)"
      onclick={onCode}
    >
      <code>{'<>'}</code>
    </button>
  </div>
  
  <div class="toolbar-separator"></div>
  
  <!-- Heading menu -->
  <div class="toolbar-group">
    <div class="toolbar-dropdown">
      <button
        type="button"
        class="toolbar-btn"
        title="Heading"
        onclick={() => showHeadingMenu = !showHeadingMenu}
      >
        H▾
      </button>
      
      {#if showHeadingMenu}
        <div class="dropdown-menu">
          {#each [1, 2, 3, 4, 5, 6] as level}
            <button
              type="button"
              class="dropdown-item"
              onclick={() => handleHeading(level)}
            >
              <span style="font-size: {20 - level}px; font-weight: bold;">
                H{level}
              </span>
              Heading {level}
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </div>
  
  <div class="toolbar-separator"></div>
  
  <!-- Lists -->
  <div class="toolbar-group">
    <button
      type="button"
      class="toolbar-btn"
      title="Unordered List"
      onclick={() => onList?.(false)}
    >
      ☰
    </button>
    
    <button
      type="button"
      class="toolbar-btn"
      title="Ordered List"
      onclick={() => onList?.(true)}
    >
      1.
    </button>
    
    <button
      type="button"
      class="toolbar-btn"
      title="Task List"
      onclick={onCheckbox}
    >
      ☑
    </button>
  </div>
  
  <div class="toolbar-separator"></div>
  
  <!-- Insert -->
  <div class="toolbar-group">
    <button
      type="button"
      class="toolbar-btn"
      title="Insert Link (Ctrl+K)"
      onclick={onLink}
    >
      🔗
    </button>
    
    <button
      type="button"
      class="toolbar-btn"
      title="Insert Image"
      onclick={onImage}
    >
      🖼️
    </button>
    
    <button
      type="button"
      class="toolbar-btn"
      title="Insert Table"
      onclick={onTable}
    >
      ⊞
    </button>
  </div>
</div>

<style>
  .toolbar {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background-color: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    gap: 8px;
    flex-wrap: wrap;
  }
  
  .toolbar-group {
    display: flex;
    gap: 4px;
    align-items: center;
  }
  
  .toolbar-btn {
    padding: 6px 10px;
    background: var(--btn-bg);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
    color: var(--text-primary);
  }
  
  .toolbar-btn:hover {
    background: var(--btn-hover);
    border-color: var(--border-hover);
  }
  
  .toolbar-btn:active {
    transform: scale(0.95);
  }
  
  .toolbar-separator {
    width: 1px;
    height: 20px;
    background-color: var(--border-color);
  }
  
  .toolbar-dropdown {
    position: relative;
  }
  
  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 4px;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    min-width: 150px;
  }
  
  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 12px;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    font-size: 14px;
    color: var(--text-primary);
    transition: background-color 0.2s;
  }
  
  .dropdown-item:hover {
    background: var(--hover-bg);
  }
  
  /* Use global CSS variables for theme support */
  .toolbar {
    --bg-primary: var(--bg-color);
    --bg-secondary: var(--card-bg);
    --border-color: var(--border-color);
    --border-hover: var(--primary-color);
    --text-primary: var(--text-color);
    --btn-bg: var(--bg-color);
    --btn-hover: var(--hover-bg);
    --hover-bg: var(--hover-bg);
  }
  
  .dropdown-menu {
    --bg-primary: var(--bg-color);
    --bg-secondary: var(--card-bg);
    --border-color: var(--border-color);
    --border-hover: var(--primary-color);
    --text-primary: var(--text-color);
    --btn-bg: var(--bg-color);
    --btn-hover: var(--hover-bg);
    --hover-bg: var(--hover-bg);
  }
</style>
