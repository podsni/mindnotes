// Image handling utilities for MindNote
// Supports drag & drop, clipboard paste, URL paste, and Base64 conversion

export interface ImageSettings {
  imageBasePath: string // Relative path for images (e.g., "./images" or "./assets")
  autoCopyImageToDir: boolean // Auto-save images to directory
  useBase64: boolean // Use Base64 encoding instead of file paths
}

// Default settings
export const defaultImageSettings: ImageSettings = {
  imageBasePath: './images',
  autoCopyImageToDir: false,
  useBase64: true // Use Base64 by default for offline-first approach
}

// Image settings state (using Svelte 5 runes)
let imageSettings = $state<ImageSettings>({ ...defaultImageSettings })

export function getImageSettings(): ImageSettings {
  return imageSettings
}

export function setImageSettings(settings: Partial<ImageSettings>) {
  imageSettings = { ...imageSettings, ...settings }
}

/**
 * Convert File to Base64 string
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      resolve(result)
    }
    reader.onerror = (e) => reject(e)
    reader.readAsDataURL(file)
  })
}

/**
 * Keep URL as-is without downloading
 * Only convert Base64 if it's already a data URL
 */
export async function urlToBase64(url: string): Promise<string> {
  // Just return the URL directly - no downloading needed
  // This keeps images clean and doesn't bloat the markdown
  return url
}

/**
 * Handle paste event for images
 */
export async function handleImagePaste(e: ClipboardEvent): Promise<string | null> {
  const items = e.clipboardData?.items
  if (!items) return null

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    
    // Check for image file
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) {
        const base64 = await fileToBase64(file)
        return `![Pasted Image](${base64})`
      }
    }
    
    // Check for text (might be image URL)
    if (item.type === 'text/plain') {
      const text = await new Promise<string>((resolve) => {
        item.getAsString(resolve)
      })
      
      // Check if it's an image URL - USE DIRECTLY without downloading
      if (isImageURL(text)) {
        // Return URL directly without downloading
        return `![](${text})`
      }
    }
  }

  return null
}

/**
 * Check if URL points to an image
 */
export function isImageURL(url: string): boolean {
  // Check file extension
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico']
  const lowerUrl = url.toLowerCase()
  
  if (imageExtensions.some(ext => lowerUrl.includes(ext))) {
    return true
  }
  
  // Check if it's a valid URL
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Handle drag and drop for images
 */
export async function handleImageDrop(files: FileList): Promise<string[]> {
  const imageMarkdowns: string[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    
    if (file.type.startsWith('image/')) {
      const base64 = await fileToBase64(file)
      imageMarkdowns.push(`![${file.name}](${base64})`)
    }
  }

  return imageMarkdowns
}

/**
 * Insert image at cursor position
 */
export function insertImageAtCursor(
  textarea: HTMLTextAreaElement,
  imageMarkdown: string
): string {
  const cursorPos = textarea.selectionStart || 0
  const content = textarea.value
  const before = content.slice(0, cursorPos)
  const after = content.slice(cursorPos)
  
  return before + '\n' + imageMarkdown + '\n' + after
}
