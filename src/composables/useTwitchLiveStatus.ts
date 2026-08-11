import { onMounted, onUnmounted, ref } from 'vue'

interface TwitchLiveStatus {
  isLive: boolean
  streamUrl?: string
}

const POLL_INTERVAL_MS = 45_000

// Module-level singleton: Links.vue and TwitchLiveStatus.vue both consume
// this, so one shared poll avoids duplicate requests for the same data.
const twitchLiveStatus = ref<TwitchLiveStatus>({ isLive: false })
let pollId: ReturnType<typeof setInterval> | undefined
let subscriberCount = 0

async function fetchTwitchLiveStatus() {
  try {
    const response = await fetch('/api/twitch-live-status')
    if (!response.ok) throw new Error(`Unexpected status ${response.status}`)
    twitchLiveStatus.value = await response.json()
  } catch {
    twitchLiveStatus.value = { isLive: false }
  }
}

export function useTwitchLiveStatus() {
  onMounted(() => {
    subscriberCount += 1
    if (subscriberCount === 1) {
      fetchTwitchLiveStatus()
      pollId = setInterval(fetchTwitchLiveStatus, POLL_INTERVAL_MS)
    }
  })

  onUnmounted(() => {
    subscriberCount -= 1
    if (subscriberCount === 0 && pollId) {
      clearInterval(pollId)
      pollId = undefined
    }
  })

  return { twitchLiveStatus }
}
