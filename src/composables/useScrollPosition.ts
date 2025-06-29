import { onMounted, onUnmounted, nextTick } from 'vue'

interface ScrollPosition {
  x: number
  y: number
  timestamp: number
}

const SCROLL_POSITION_KEY = 'scroll_position'
const SCROLL_POSITION_DURATION = 1000 * 60 * 30 

export function useScrollPosition() {
  let scrollTimeout: number | null = null
  let restoreTimeout: number | null = null

  const saveScrollPosition = () => {
    const position: ScrollPosition = {
      x: window.scrollX,
      y: window.scrollY,
      timestamp: Date.now()
    }
    
      localStorage.setItem(SCROLL_POSITION_KEY, JSON.stringify(position))
    
  }

  const restoreScrollPosition = () => {
   
      const saved = localStorage.getItem(SCROLL_POSITION_KEY)
      if (!saved) return

      const position: ScrollPosition = JSON.parse(saved)
      const now = Date.now()

      if (now - position.timestamp > SCROLL_POSITION_DURATION) {
        localStorage.removeItem(SCROLL_POSITION_KEY)
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