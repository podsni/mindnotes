<script lang="ts">
  import { onMount } from 'svelte'
  import { parseMarkdown, sanitizeHtml, setNotesCache, renderMermaidDiagrams } from './markdown'
  import { notesStore } from './store.svelte'
  
  interface Props {
    content: string
  }
  
  let { content }: Props = $props()
  let previewContainer: HTMLDivElement | undefined = $state()
  
  // Update notes cache for cross-linking
  $effect(() => {
    setNotesCache(notesStore.notes)
  })
  
  // Parse markdown to HTML
  const html = $derived(() => {
    const parsed = parseMarkdown(content)
    return sanitizeHtml(parsed)
  })
  
  // Render Mermaid diagrams after HTML is inserted
  $effect(() => {
    if (previewContainer) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        if (previewContainer) {
          renderMermaidDiagrams(previewContainer)
        }
      }, 50)
    }
  })
</script>

<div class="markdown-preview" bind:this={previewContainer}>
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

  /* Syntax highlighting (highlight.js) */
  .markdown-preview :global(.hljs) {
    background: var(--card-bg);
    color: var(--text-color);
  }

  .markdown-preview :global(.hljs-keyword),
  .markdown-preview :global(.hljs-selector-tag),
  .markdown-preview :global(.hljs-literal),
  .markdown-preview :global(.hljs-section),
  .markdown-preview :global(.hljs-link) {
    color: #569cd6;
  }

  .markdown-preview :global(.hljs-string),
  .markdown-preview :global(.hljs-title),
  .markdown-preview :global(.hljs-name),
  .markdown-preview :global(.hljs-type),
  .markdown-preview :global(.hljs-attribute),
  .markdown-preview :global(.hljs-symbol),
  .markdown-preview :global(.hljs-bullet),
  .markdown-preview :global(.hljs-built_in),
  .markdown-preview :global(.hljs-addition),
  .markdown-preview :global(.hljs-variable),
  .markdown-preview :global(.hljs-template-tag),
  .markdown-preview :global(.hljs-template-variable) {
    color: #ce9178;
  }

  .markdown-preview :global(.hljs-comment),
  .markdown-preview :global(.hljs-quote),
  .markdown-preview :global(.hljs-deletion),
  .markdown-preview :global(.hljs-meta) {
    color: #6a9955;
  }

  .markdown-preview :global(.hljs-number),
  .markdown-preview :global(.hljs-regexp),
  .markdown-preview :global(.hljs-function) {
    color: #dcdcaa;
  }

  /* KaTeX Math */
  .markdown-preview :global(.katex) {
    font-size: 1.1em;
  }

  .markdown-preview :global(.katex-display) {
    overflow-x: auto;
    overflow-y: hidden;
    margin: 1rem 0;
    padding: 0.5rem;
  }

  .markdown-preview :global(.math-error) {
    color: #ff4444;
    font-style: italic;
    background: rgba(255, 68, 68, 0.1);
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
  }

  /* Mermaid diagrams */
  .markdown-preview :global(.mermaid-diagram) {
    margin: 1.5rem 0;
    padding: 1rem;
    background: var(--card-bg);
    border-radius: 6px;
    border: 1px solid var(--border-color);
    overflow-x: auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .markdown-preview :global(.mermaid-diagram svg) {
    max-width: 100%;
    height: auto;
  }

  .markdown-preview :global(.mermaid-error) {
    color: #ff4444;
    font-style: italic;
    padding: 1rem;
    background: rgba(255, 68, 68, 0.1);
    border-radius: 4px;
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

    .markdown-preview :global(.mermaid-diagram) {
      padding: 0.5rem;
    }

    .markdown-preview :global(.katex-display) {
      font-size: 0.9em;
    }
  }
</style>
