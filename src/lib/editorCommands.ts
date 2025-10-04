// Editor command utilities for text formatting
// Handles keyboard shortcuts and toolbar actions

export interface TextSelection {
  start: number
  end: number
  text: string
}

/**
 * Get current selection from textarea
 */
export function getSelection(textarea: HTMLTextAreaElement): TextSelection {
  return {
    start: textarea.selectionStart,
    end: textarea.selectionEnd,
    text: textarea.value.substring(textarea.selectionStart, textarea.selectionEnd)
  }
}

/**
 * Replace selection with new text
 */
export function replaceSelection(
  textarea: HTMLTextAreaElement,
  newText: string,
  selectAfter: boolean = false
): string {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const content = textarea.value
  
  const before = content.substring(0, start)
  const after = content.substring(end)
  const newContent = before + newText + after
  
  // Update textarea and set cursor position
  textarea.value = newContent
  
  if (selectAfter) {
    textarea.selectionStart = start
    textarea.selectionEnd = start + newText.length
  } else {
    textarea.selectionStart = textarea.selectionEnd = start + newText.length
  }
  
  textarea.focus()
  
  return newContent
}

/**
 * Wrap selected text with prefix and suffix
 */
export function wrapSelection(
  textarea: HTMLTextAreaElement,
  prefix: string,
  suffix: string = prefix
): string {
  const selection = getSelection(textarea)
  const wrappedText = prefix + selection.text + suffix
  return replaceSelection(textarea, wrappedText, true)
}

/**
 * Toggle wrap (remove if already wrapped, add if not)
 */
export function toggleWrap(
  textarea: HTMLTextAreaElement,
  prefix: string,
  suffix: string = prefix
): string {
  const selection = getSelection(textarea)
  const content = textarea.value
  
  // Check if already wrapped
  const beforeStart = content.substring(
    Math.max(0, selection.start - prefix.length),
    selection.start
  )
  const afterEnd = content.substring(
    selection.end,
    selection.end + suffix.length
  )
  
  if (beforeStart === prefix && afterEnd === suffix) {
    // Remove wrapping
    const newStart = selection.start - prefix.length
    const newEnd = selection.end + suffix.length
    textarea.selectionStart = newStart
    textarea.selectionEnd = newEnd
    return replaceSelection(textarea, selection.text, true)
  } else {
    // Add wrapping
    return wrapSelection(textarea, prefix, suffix)
  }
}

/**
 * Insert text at cursor
 */
export function insertText(textarea: HTMLTextAreaElement, text: string): string {
  return replaceSelection(textarea, text, false)
}

/**
 * Insert line at cursor (with newlines before/after if needed)
 */
export function insertLine(textarea: HTMLTextAreaElement, text: string): string {
  const selection = getSelection(textarea)
  const content = textarea.value
  
  // Get current line
  const lineStart = content.lastIndexOf('\n', selection.start - 1) + 1
  const lineEnd = content.indexOf('\n', selection.end)
  const currentLine = content.substring(
    lineStart,
    lineEnd === -1 ? content.length : lineEnd
  )
  
  // Check if we need newlines
  let insertText = text
  if (currentLine.trim() !== '') {
    insertText = '\n' + text
  }
  if (lineEnd !== -1) {
    insertText += '\n'
  }
  
  return replaceSelection(textarea, insertText, false)
}

/**
 * Insert heading
 */
export function insertHeading(textarea: HTMLTextAreaElement, level: number): string {
  const selection = getSelection(textarea)
  const prefix = '#'.repeat(level) + ' '
  
  if (selection.text) {
    return wrapSelection(textarea, prefix, '')
  } else {
    return insertText(textarea, prefix)
  }
}

/**
 * Insert list item
 */
export function insertListItem(textarea: HTMLTextAreaElement, ordered: boolean): string {
  const selection = getSelection(textarea)
  const content = textarea.value
  
  // Get current line
  const lineStart = content.lastIndexOf('\n', selection.start - 1) + 1
  const prefix = ordered ? '1. ' : '- '
  
  // If at start of line, just add prefix
  if (selection.start === lineStart) {
    return insertText(textarea, prefix)
  }
  
  // Otherwise insert new line with prefix
  return insertText(textarea, '\n' + prefix)
}

/**
 * Insert task list item
 */
export function insertTaskItem(textarea: HTMLTextAreaElement): string {
  return insertListItem(textarea, false).replace('- ', '- [ ] ')
}

/**
 * Handle Tab key for list indentation
 */
export function handleTab(textarea: HTMLTextAreaElement, shift: boolean = false): string {
  const selection = getSelection(textarea)
  const content = textarea.value
  
  // Get current line
  const lineStart = content.lastIndexOf('\n', selection.start - 1) + 1
  const lineEnd = content.indexOf('\n', selection.end)
  const currentLine = content.substring(
    lineStart,
    lineEnd === -1 ? content.length : lineEnd
  )
  
  // Check if it's a list item
  const listMatch = currentLine.match(/^(\s*)([-*+]|\d+\.)\s/)
  
  if (listMatch) {
    const indent = listMatch[1]
    
    if (shift) {
      // Unindent (remove 2 spaces or 1 tab)
      if (indent.length >= 2) {
        const newIndent = indent.substring(2)
        const newLine = newIndent + currentLine.substring(indent.length)
        textarea.selectionStart = lineStart
        textarea.selectionEnd = lineEnd === -1 ? content.length : lineEnd
        return replaceSelection(textarea, newLine, false)
      }
    } else {
      // Indent (add 2 spaces)
      const newLine = '  ' + currentLine
      textarea.selectionStart = lineStart
      textarea.selectionEnd = lineEnd === -1 ? content.length : lineEnd
      return replaceSelection(textarea, newLine, false)
    }
  }
  
  // Default tab behavior
  return shift ? content : insertText(textarea, '  ')
}

/**
 * Insert table
 */
export function insertTable(
  textarea: HTMLTextAreaElement,
  rows: number = 3,
  cols: number = 3
): string {
  let table = '\n'
  
  // Header row
  table += '|'
  for (let i = 0; i < cols; i++) {
    table += ` Header ${i + 1} |`
  }
  table += '\n'
  
  // Separator row
  table += '|'
  for (let i = 0; i < cols; i++) {
    table += ' --- |'
  }
  table += '\n'
  
  // Data rows
  for (let r = 0; r < rows - 1; r++) {
    table += '|'
    for (let c = 0; c < cols; c++) {
      table += ' Cell |'
    }
    table += '\n'
  }
  
  table += '\n'
  
  return insertLine(textarea, table)
}

/**
 * Insert link
 */
export function insertLink(textarea: HTMLTextAreaElement, url?: string): string {
  const selection = getSelection(textarea)
  const linkText = selection.text || 'Link Text'
  const linkUrl = url || 'https://'
  const markdown = `[${linkText}](${linkUrl})`
  return replaceSelection(textarea, markdown, true)
}

/**
 * Insert image
 */
export function insertImage(textarea: HTMLTextAreaElement, url?: string): string {
  const selection = getSelection(textarea)
  const altText = selection.text || 'Image'
  const imageUrl = url || 'https://'
  const markdown = `![${altText}](${imageUrl})`
  return replaceSelection(textarea, markdown, true)
}
