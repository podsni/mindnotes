<script lang="ts">
  import { parseMarkdown, sanitizeHtml, setNotesCache } from './markdown'
  import { notesStore } from './store.svelte'
  
  interface Props {
    content: string
  }
  
  let { content }: Props = $props()
  
  // Update notes cache for cross-linking
  $effect(() => {
    setNotesCache(notesStore.notes)
  })
  
  // Parse markdown to HTML
  const html = $derived(() => {
    const parsed = parseMarkdown(content)
    return sanitizeHtml(parsed)
  })
</script>

<div class="markdown-preview">
  {@html html()}
</div>

<style>
  .markdown-preview {
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
    line-height: 1.8;
    color: var(--text-color);
    overflow-y: auto;
    height: 100%;
  }

  /* Typography */
  .markdown-preview :global(h1) {
    font-size: 2rem;
    font-weight: 700;
    margin: 2rem 0 1rem 0;
    color: var(--text-color);
    border-bottom: 2px solid var(--border-color);
    padding-bottom: 0.5rem;
  }

  .markdown-preview :global(h2) {
    font-size: 1.6rem;
    font-weight: 600;
    margin: 1.5rem 0 0.75rem 0;
    color: var(--text-color);
  }

  .markdown-preview :global(h3) {
    font-size: 1.3rem;
    font-weight: 600;
    margin: 1.25rem 0 0.5rem 0;
    color: var(--text-color);
  }

  .markdown-preview :global(h4),
  .markdown-preview :global(h5),
  .markdown-preview :global(h6) {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 1rem 0 0.5rem 0;
    color: var(--text-color);
  }

  .markdown-preview :global(p) {
    margin: 0.75rem 0;
    line-height: 1.8;
  }

  .markdown-preview :global(a) {
    color: var(--primary-color);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s;
  }

  .markdown-preview :global(a:hover) {
    border-bottom-color: var(--primary-color);
  }

  /* Cross-note links */
  .markdown-preview :global(.note-link) {
    color: var(--primary-color);
    background: var(--card-bg);
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    font-weight: 500;
    border: 1px solid var(--primary-color);
    transition: all 0.2s;
  }

  .markdown-preview :global(.note-link:hover) {
    background: var(--primary-color);
    color: white;
    border-bottom-color: var(--primary-color);
  }

  .markdown-preview :global(.note-link-missing) {
    color: var(--text-secondary);
    background: var(--card-bg);
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    border: 1px dashed var(--text-secondary);
    font-style: italic;
    cursor: help;
  }

  /* Code blocks */
  .markdown-preview :global(code) {
    background: var(--card-bg);
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 0.9em;
    color: var(--primary-color);
  }

  .markdown-preview :global(pre) {
    background: var(--card-bg);
    padding: 1rem;
    border-radius: 6px;
    overflow-x: auto;
    margin: 1rem 0;
    border: 1px solid var(--border-color);
  }

  .markdown-preview :global(pre code) {
    background: transparent;
    padding: 0;
    color: var(--text-color);
  }

  /* Lists */
  .markdown-preview :global(ul),
  .markdown-preview :global(ol) {
    margin: 0.75rem 0;
    padding-left: 2rem;
  }

  .markdown-preview :global(li) {
    margin: 0.5rem 0;
    line-height: 1.6;
  }

  .markdown-preview :global(ul ul),
  .markdown-preview :global(ol ol),
  .markdown-preview :global(ul ol),
  .markdown-preview :global(ol ul) {
    margin: 0.25rem 0;
  }

  /* Blockquotes */
  .markdown-preview :global(blockquote) {
    border-left: 4px solid var(--primary-color);
    padding-left: 1rem;
    margin: 1rem 0;
    color: var(--text-secondary);
    font-style: italic;
  }

  /* Tables */
  .markdown-preview :global(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
  }

  .markdown-preview :global(th),
  .markdown-preview :global(td) {
    border: 1px solid var(--border-color);
    padding: 0.5rem 0.75rem;
    text-align: left;
  }

  .markdown-preview :global(th) {
    background: var(--card-bg);
    font-weight: 600;
  }

  .markdown-preview :global(tr:nth-child(even)) {
    background: var(--card-bg);
  }

  /* Horizontal rule */
  .markdown-preview :global(hr) {
    border: none;
    border-top: 2px solid var(--border-color);
    margin: 2rem 0;
  }

  /* Images */
  .markdown-preview :global(img) {
    max-width: 100%;
    height: auto;
    border-radius: 6px;
    margin: 1rem 0;
  }

  /* Task lists */
  .markdown-preview :global(input[type="checkbox"]) {
    margin-right: 0.5rem;
  }

  /* Mobile optimization */
  @media (max-width: 768px) {
    .markdown-preview {
      padding: 1rem;
    }

    .markdown-preview :global(h1) {
      font-size: 1.6rem;
    }

    .markdown-preview :global(h2) {
      font-size: 1.4rem;
    }

    .markdown-preview :global(h3) {
      font-size: 1.2rem;
    }

    .markdown-preview :global(pre) {
      font-size: 0.85rem;
    }
  }
</style>
