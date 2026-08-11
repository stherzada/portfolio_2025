// Vercel serverless function. Checks whether the Twitch channel is live via
// decapi.me — a free, public, unauthenticated proxy over Twitch's chat-bot
// data (built for Nightbot/StreamElements commands). No Twitch app/OAuth
// credentials needed, but it's an unofficial third-party service with no
// SLA: if it's down or changes its response format, this just degrades to
// "offline" rather than erroring.

interface VercelRequest {
  method?: string
}

interface VercelResponse {
  status(code: number): VercelResponse
  setHeader(name: string, value: string): VercelResponse
  json(body: unknown): void
}

interface TwitchLiveStatusPayload {
  isLive: boolean
  streamUrl?: string
}

const TWITCH_CHANNEL_LOGIN = 'stherzada'
const DECAPI_BASE_URL = 'https://decapi.me/twitch'

async function fetchDecapiText(path: string): Promise<string | null> {
  try {
    const response = await fetch(`${DECAPI_BASE_URL}/${path}/${TWITCH_CHANNEL_LOGIN}`)
    if (!response.ok) return null
    return (await response.text()).trim()
  } catch {
    return null
  }
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60')

  try {
    const uptime = await fetchDecapiText('uptime')
    const isLive = !!uptime && !uptime.toLowerCase().includes('offline')

    if (!isLive) {
      res.status(200).json({ isLive: false } satisfies TwitchLiveStatusPayload)
      return
    }

    res.status(200).json({
      isLive: true,
      streamUrl: `https://twitch.tv/${TWITCH_CHANNEL_LOGIN}`,
    } satisfies TwitchLiveStatusPayload)
  } catch (error) {
    console.error('twitch-live-status handler error', error)
    res.status(200).json({ isLive: false } satisfies TwitchLiveStatusPayload)
  }
}
