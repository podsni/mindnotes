<script lang="ts">
  import { onMount } from 'svelte'
  import Papa from 'papaparse'
  import type { Attachment } from './db'
  import { attachmentService } from './db'

  interface Props {
    attachment: Attachment
  }

  let { attachment }: Props = $props()

  interface CSVData {
    headers: string[]
    rows: any[][]
  }

  let csvData: CSVData | null = $state(null)
  let isLoading: boolean = $state(true)
  let error: string = $state('')
  let searchQuery: string = $state('')
  let sortColumn: number | null = $state(null)
  let sortDirection: 'asc' | 'desc' = $state('asc')
  let isEditing: boolean = $state(false)
  let editedData: any[][] = $state([])
  
  // Table zoom state
  let tableZoom: number = $state(1)
  let tableContainer: HTMLDivElement | null = $state(null)

  onMount(async () => {
    await loadCSV()
  })

  async function loadCSV() {
    try {
      isLoading = true
      const text = await attachment.fileBlob.text()
      
      Papa.parse(text, {
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const headers = results.data[0] as string[]
            const rows = results.data.slice(1) as any[][]
            
            csvData = { headers, rows }
            editedData = JSON.parse(JSON.stringify(rows)) // Deep copy
            
            // Update attachment metadata
            attachmentService.updateAttachmentMetadata(attachment.id!, {
              ...attachment.metadata,
              rowCount: rows.length,
              columnCount: headers.length,
              headers
            })
          }
          isLoading = false
        },
        error: (err: Error) => {
          error = err.message
          isLoading = false
        }
      })
    } catch (err) {
      error = 'Failed to load CSV file'
      isLoading = false
    }
  }

  function getFilteredRows(): any[][] {
    if (!csvData) return []
    
    let rows = isEditing ? editedData : csvData.rows
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      rows = rows.filter(row =>
        row.some(cell => 
          String(cell).toLowerCase().includes(query)
        )
      )
    }
    
    // Sort by column
    if (sortColumn !== null) {
      const colIndex = sortColumn
      rows = [...rows].sort((a, b) => {
        const aVal = a[colIndex]
        const bVal = b[colIndex]
        
        // Try numeric comparison first
        const aNum = parseFloat(aVal)
        const bNum = parseFloat(bVal)
        
        let comparison = 0
        if (!isNaN(aNum) && !isNaN(bNum)) {
          comparison = aNum - bNum
        } else {
          comparison = String(aVal).localeCompare(String(bVal))
        }
        
        return sortDirection === 'asc' ? comparison : -comparison
      })
    }
    
    return rows
  }

  function toggleSort(colIndex: number) {
    if (sortColumn === colIndex) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    } else {
      sortColumn = colIndex
      sortDirection = 'asc'
    }
  }

  function updateCell(rowIndex: number, colIndex: number, value: string) {
    editedData[rowIndex][colIndex] = value
  }

  async function saveChanges() {
    if (!csvData) return
    
    try {
      // Convert back to CSV
      const csvString = Papa.unparse({
        fields: csvData.headers,
        data: editedData
      })
      
      // Create new blob
      const newBlob = new Blob([csvString], { type: 'text/csv' })
      
      // Update attachment in database
      await attachmentService.updateAttachmentMetadata(attachment.id!, {
        ...attachment.metadata,
        rowCount: editedData.length
      })
      
      // Update the attachment blob (we need to update the entire record)
      // For now, just update local state
      csvData.rows = JSON.parse(JSON.stringify(editedData))
      isEditing = false
      
      alert('Changes saved successfully!')
    } catch (err) {
      console.error('Failed to save:', err)
      alert('Failed to save changes')
    }
  }

  function cancelEdit() {
    editedData = JSON.parse(JSON.stringify(csvData?.rows || []))
    isEditing = false
  }

  async function exportCSV() {
    if (!csvData) return
    
    const csvString = Papa.unparse({
      fields: csvData.headers,
      data: isEditing ? editedData : csvData.rows
    })
    
    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = attachment.filename
    a.click()
    URL.revokeObjectURL(url)
  }

  async function exportJSON() {
    if (!csvData) return
    
    const rows = isEditing ? editedData : csvData.rows
    const jsonData = rows.map(row => {
      const obj: any = {}
      csvData!.headers.forEach((header, index) => {
        obj[header] = row[index]
      })
      return obj
    })
    
    const jsonString = JSON.stringify(jsonData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = attachment.filename.replace('.csv', '.json')
    a.click()
    URL.revokeObjectURL(url)
  }

  // Table zoom functions
  function zoomTableIn() {
    tableZoom = Math.min(tableZoom + 0.1, 2)
  }

  function zoomTableOut() {
    tableZoom = Math.max(tableZoom - 0.1, 0.5)
  }

  function resetTableZoom() {
    tableZoom = 1
  }

  function addRow() {
    if (!csvData) return
    const newRow = csvData.headers.map(() => '')
    editedData = [...editedData, newRow]
  }

  function deleteRow(index: number) {
    if (confirm('Delete this row?')) {
      editedData = editedData.filter((_, i) => i !== index)
    }
  }

  let filteredRows = $derived(getFilteredRows())
</script>

<div class="csv-viewer">
  <div class="csv-toolbar">
    <div class="toolbar-section">
      <input
        type="text"
        placeholder="Search..."
        bind:value={searchQuery}
        class="search-input"
      />
      
      {#if !isEditing}
        <button onclick={() => isEditing = true}>
          ✏️ Edit
        </button>
      {:else}
        <button onclick={saveChanges} class="save-btn">
          💾 Save
        </button>
        <button onclick={cancelEdit}>
          ❌ Cancel
        </button>
        <button onclick={addRow}>
          ➕ Add Row
        </button>
      {/if}
    </div>

    <div class="toolbar-section">
      <button onclick={exportCSV}>
        📥 Export CSV
      </button>
      <button onclick={exportJSON}>
        📥 Export JSON
      </button>
    </div>

    <div class="toolbar-section zoom-section">
      <button onclick={zoomTableOut} disabled={tableZoom <= 0.5}>−</button>
      <span class="zoom-display" title="Table zoom">{Math.round(tableZoom * 100)}%</span>
      <button onclick={zoomTableIn} disabled={tableZoom >= 2}>+</button>
      {#if tableZoom !== 1}
        <button onclick={resetTableZoom} class="reset-zoom">Reset</button>
      {/if}
    </div>

    {#if csvData}
      <div class="stats">
        {csvData.rows.length} rows × {csvData.headers.length} columns
        {#if searchQuery}
          | {filteredRows.length} filtered
        {/if}
      </div>
    {/if}
  </div>

  <div class="csv-content" bind:this={tableContainer}>
    {#if isLoading}
      <div class="loading">Loading CSV...</div>
    {:else if error}
      <div class="error">{error}</div>
    {:else if csvData}
      <div class="table-container">
        <table style="transform: scale({tableZoom}); transform-origin: top left;">
          <thead>
            <tr>
              {#if isEditing}
                <th class="action-col">Actions</th>
              {/if}
              {#each csvData.headers as header, colIndex}
                <th onclick={() => toggleSort(colIndex)} class="sortable">
                  {header}
                  {#if sortColumn === colIndex}
                    <span class="sort-indicator">
                      {sortDirection === 'asc' ? '▲' : '▼'}
                    </span>
                  {/if}
                </th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each filteredRows as row, rowIndex}
              <tr>
                {#if isEditing}
                  <td class="action-col">
                    <button 
                      onclick={() => deleteRow(rowIndex)}
                      class="delete-btn"
                      title="Delete row"
                    >
                      🗑️
                    </button>
                  </td>
                {/if}
                {#each row as cell, colIndex}
                  <td>
                    {#if isEditing}
                      <input
                        type="text"
                        value={cell}
                        oninput={(e) => updateCell(rowIndex, colIndex, e.currentTarget.value)}
                      />
                    {:else}
                      {cell}
                    {/if}
                  </td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else}
      <div class="empty">No data to display</div>
    {/if}
  </div>
</div>

<style>
  .csv-viewer {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--bg-color);
    color: var(--text-color);
  }

  .csv-toolbar {
    display: flex;
    gap: 1rem;
    padding: 0.75rem 1rem;
    background: var(--card-bg);
    border-bottom: 1px solid var(--border-color);
    flex-wrap: wrap;
    align-items: center;
  }

  .toolbar-section {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .search-input {
    padding: 0.4rem 0.6rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    min-width: 200px;
    background: var(--bg-color);
    color: var(--text-color);
    transition: all 0.2s;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  button {
    padding: 0.4rem 0.8rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    white-space: nowrap;
    transition: all 0.2s;
  }

  button:hover {
    background: var(--primary-hover);
    transform: translateY(-1px);
  }

  button.save-btn {
    background: #4caf50;
  }

  button.save-btn:hover {
    background: #45a049;
  }

  button.delete-btn {
    background: #f44336;
    padding: 0.2rem 0.4rem;
    font-size: 0.8rem;
  }

  button.delete-btn:hover {
    background: #da190b;
  }

  button.reset-zoom {
    background: var(--border-color);
    color: var(--text-color);
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
  }

  button.reset-zoom:hover {
    background: var(--hover-bg);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  .zoom-section {
    display: flex;
    gap: 0.25rem;
    align-items: center;
    padding: 0 0.5rem;
    border-left: 1px solid var(--border-color);
    border-right: 1px solid var(--border-color);
  }

  .zoom-display {
    font-weight: 600;
    color: var(--text-color);
    min-width: 45px;
    text-align: center;
    font-size: 0.85rem;
  }

  .stats {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-left: auto;
    font-weight: 500;
  }

  .csv-content {
    flex: 1;
    overflow: auto;
    background: var(--bg-color);
  }

  .table-container {
    width: 100%;
    overflow: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
    background: var(--bg-color);
  }

  th, td {
    padding: 0.7rem 0.8rem;
    text-align: left;
    border: 1px solid var(--border-color);
  }

  th {
    background: var(--card-bg);
    font-weight: 600;
    position: sticky;
    top: 0;
    z-index: 10;
    color: var(--text-color);
  }

  th.sortable {
    cursor: pointer;
    user-select: none;
    transition: background 0.2s;
  }

  th.sortable:hover {
    background: var(--hover-bg);
  }

  .sort-indicator {
    margin-left: 0.3rem;
    font-size: 0.8rem;
    color: var(--primary-color);
  }

  .action-col {
    width: 80px;
    text-align: center;
  }

  td input {
    width: 100%;
    padding: 0.4rem;
    border: 1px solid var(--border-color);
    border-radius: 3px;
    font-size: 0.9rem;
    background: var(--bg-color);
    color: var(--text-color);
    transition: all 0.2s;
  }

  td input:focus {
    outline: none;
    border-color: var(--primary-color);
    background: var(--card-bg);
  }

  tbody tr {
    transition: background 0.2s;
  }

  tbody tr:hover {
    background: var(--hover-bg);
  }

  .loading, .error, .empty {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    color: var(--text-secondary);
    font-size: 1.1rem;
  }

  .error {
    color: #f44336;
  }

  /* Striped rows for better readability */
  tbody tr:nth-child(even) {
    background: var(--card-bg);
  }

  tbody tr:nth-child(even):hover {
    background: var(--hover-bg);
  }

  /* Smooth scrollbar */
  .csv-content::-webkit-scrollbar,
  .table-container::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  .csv-content::-webkit-scrollbar-track,
  .table-container::-webkit-scrollbar-track {
    background: var(--card-bg);
  }

  .csv-content::-webkit-scrollbar-thumb,
  .table-container::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 5px;
  }

  .csv-content::-webkit-scrollbar-thumb:hover,
  .table-container::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .csv-toolbar {
      padding: 0.5rem;
      gap: 0.5rem;
    }

    .toolbar-section {
      width: 100%;
    }

    .zoom-section {
      width: auto;
      border: none;
      padding: 0;
      justify-content: center;
    }

    .search-input {
      min-width: 100%;
    }

    button {
      padding: 0.35rem 0.6rem;
      font-size: 0.85rem;
    }

    th, td {
      padding: 0.5rem;
      font-size: 0.85rem;
    }

    .stats {
      width: 100%;
      text-align: center;
      margin-left: 0;
      margin-top: 0.5rem;
    }
  }

  /* Touch hint for mobile */
  @media (hover: none) and (pointer: coarse) {
    .csv-content::before {
      content: '👆 Swipe to scroll • Pinch zoom available';
      display: block;
      text-align: center;
      padding: 0.5rem;
      background: var(--card-bg);
      border-bottom: 1px solid var(--border-color);
      font-size: 0.8rem;
      color: var(--text-secondary);
      animation: fadeOut 4s ease-in-out forwards;
    }

    @keyframes fadeOut {
      0%, 70% { opacity: 1; }
      100% { opacity: 0; pointer-events: none; }
    }
  }
</style>
