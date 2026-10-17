import { onMounted, onUnmounted, nextTick } from 'vue'

interface ScrollPosition {
  x: number
  y: number
  timestamp: number
}

const SCROLL_POSITION_KEY = 'scroll_position'
const SCROLL_POSITION_DURATION = 1000 * 60 * 30

/**
 * Drops the saved scroll position so the next Home mount doesn't restore
 * it. Call this before an intentional "go to top / go home" navigation —
 * otherwise the restore-on-mount below would silently override it.
 */
export function clearSavedScrollPosition() {
  try {
    localStorage.removeItem(SCROLL_POSITION_KEY)
  } catch {
    // Storage blocked: nothing saved to clear.
  }
}

export function useScrollPosition() {
  let scrollTimeout: number | null = null
  let restoreTimeout: number | null = null

  const saveScrollPosition = () => {
    const position: ScrollPosition = {
      x: window.scrollX,
      y: window.scrollY,
      timestamp: Date.now()
    }
    try {
      localStorage.setItem(SCROLL_POSITION_KEY, JSON.stringify(position))
    } catch {
      // Storage full/blocked: restoring scroll is a nice-to-have.
    }
  }

  const restoreScrollPosition = () => {
      let position: ScrollPosition
      try {
        const saved = localStorage.getItem(SCROLL_POSITION_KEY)
        if (!saved) return
        position = JSON.parse(saved)
      } catch {
        clearSavedScrollPosition()
        return
      }

      if (Date.now() - position.timestamp > SCROLL_POSITION_DURATION) {
        clearSavedScrollPosition()
        return
      }

      nextTick(() => {
        window.scrollTo({ left: position.x, top: position.y, behavior: 'auto' })
        restoreTimeout = window.setTimeout(() => {
          window.scrollTo({ left: position.x, top: position.y, behavior: 'auto' })
        }, 100)
      })
  }

  const handleScroll = () => {   
    if (scrollTimeout) {
      clearTimeout(scrollTimeout)
    }
    
    scrollTimeout = window.setTimeout(() => {
      saveScrollPosition()
    }, 100)
  }

  const handleBeforeUnload = () => {
    saveScrollPosition()
  }

  onMounted(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    restoreScrollPosition()
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('beforeunload', handleBeforeUnload)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('beforeunload', handleBeforeUnload)
    // Hand scroll restoration back to the browser/router on other pages.
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'auto'
    }

    if (scrollTimeout) {
      clearTimeout(scrollTimeout)
    }
    if (restoreTimeout) {
      clearTimeout(restoreTimeout)
    }
  })

  return {
    saveScrollPosition,
    restoreScrollPosition  }
} 