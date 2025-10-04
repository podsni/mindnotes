<script lang="ts">
  // Outline/Table of Contents component
  // Extracts headers from markdown and displays them as a navigable TOC
  
  interface Props {
    content: string
    onHeaderClick?: (headerId: string) => void
  }
  
  let { content, onHeaderClick }: Props = $props()
  
  interface Header {
    level: number // 1-6 for h1-h6
    text: string
    id: string // Anchor ID
    line: number // Line number in content
  }
  
  // Extract headers from markdown content
  const headers = $derived(() => {
    const lines = content.split('\n')
    const headerList: Header[] = []
    
    lines.forEach((line, index) => {
      // Match markdown headers: # Title, ## Title, etc.
      const match = line.match(/^(#{1,6})\s+(.+)$/)
      if (match) {
        const level = match[1].length
        const text = match[2].trim()
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
        
        headerList.push({ level, text, id, line: index })
      }
    })
    
    return headerList
  })
  
  const handleClick = (header: Header) => {
    if (onHeaderClick) {
      onHeaderClick(header.id)
    }
  }
</script>

<div class="outline-view">
  {#if headers().length === 0}
    <div class="text-gray-500 text-sm p-4">
      No headers found. Use # Heading syntax.
    </div>
  {:else}
    <div class="outline-header text-xs font-semibold uppercase text-gray-600 dark:text-gray-400 p-4 pb-2">
      Outline
    </div>
    <ul class="outline-list">
      {#each headers() as header}
        <li
          class="outline-item"
          style="padding-left: {(header.level - 1) * 12 + 16}px"
        >
          <button
            type="button"
            class="outline-link"
            onclick={() => handleClick(header)}
          >
            <span class="outline-bullet" style="opacity: {1 - (header.level - 1) * 0.15}">
              {#if header.level === 1}📄{:else if header.level === 2}📌{:else if header.level === 3}•{:else}◦{/if}
            </span>
            <span class="outline-text">{header.text}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .outline-view {
    height: 100%;
    overflow-y: auto;
    background-color: var(--bg-secondary);
    border-left: 1px solid var(--border-color);
  }
  
  .outline-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .outline-item {
    margin: 0;
  }
  
  .outline-link {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 6px 8px;
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-primary);
    font-size: 0.875rem;
    transition: background-color 0.2s;
  }
  
  .outline-link:hover {
    background-color: var(--hover-bg);
  }
  
  .outline-bullet {
    margin-right: 8px;
    flex-shrink: 0;
  }
  
  .outline-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  /* Use global CSS variables for automatic theme support */
  .outline-view {
    --bg-secondary: var(--card-bg);
    --border-color: var(--border-color);
    --text-primary: var(--text-color);
    --hover-bg: var(--hover-bg);
  }
</style>
