// Touch gesture handler for swipe-to-open sidebar
import { uiStore } from './store.svelte'

let touchStartX = 0
let touchStartY = 0
let touchCurrentX = 0
let isEdgeSwipe = false

export function initTouchHandlers() {
  // Handle touch start - detect edge swipe
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX = e.touches[0].clientX
    touchStartY = e.touches[0].clientY
    
    // Check if touch started from left edge (within 20px)
    if (touchStartX < 20 && !uiStore.sidebarOpen) {
      isEdgeSwipe = true
    }
  }

  // Handle touch move
  const handleTouchMove = (e: TouchEvent) => {
    if (!isEdgeSwipe) return
    
    touchCurrentX = e.touches[0].clientX
    const touchCurrentY = e.touches[0].clientY
    
    const diffX = touchCurrentX - touchStartX
    const diffY = Math.abs(touchCurrentY - touchStartY)
    
    // Swipe right from edge (horizontal swipe, not vertical scroll)
    if (diffX > 50 && diffY < 30) {
      uiStore.openSidebar()
      isEdgeSwipe = false
    }
  }

  // Handle touch end
  const handleTouchEnd = () => {
    isEdgeSwipe = false
    touchStartX = 0
    touchStartY = 0
    touchCurrentX = 0
  }

  // Attach listeners
  document.addEventListener('touchstart', handleTouchStart, { passive: true })
  document.addEventListener('touchmove', handleTouchMove, { passive: true })
  document.addEventListener('touchend', handleTouchEnd, { passive: true })

  // Return cleanup function
  return () => {
    document.removeEventListener('touchstart', handleTouchStart)
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
  }
}
