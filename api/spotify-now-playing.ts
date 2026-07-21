// Vercel serverless function. Keeps Spotify OAuth secrets server-side and
// exposes only the minimal "now playing" data the front-end needs.
//
// Required env vars (set in Vercel Project Settings -> Environment Variables,
// and in .env.local for `vercel dev`):
//   SPOTIFY_CLIENT_ID
//   SPOTIFY_CLIENT_SECRET
//   SPOTIFY_REFRESH_TOKEN

interface VercelRequest {
  method?: string
}

interface VercelResponse {
  status(code: number): VercelResponse
  setHeader(name: string, value: string): VercelResponse
  json(body: unknown): void
}

interface NowPlayingPayload {
  isPlaying: boolean
  title?: string
  artist?: string
  album?: string
  albumImageUrl?: string
  songUrl?: string
}

const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing'

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    console.error('Missing Spotify env vars (SPOTIFY_CLIENT_ID/SECRET/REFRESH_TOKEN)')
    return null
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    console.error('Spotify token refresh failed', response.status, await response.text())
    return null
  }

  const data = (await response.json()) as { access_token?: string }
  return data.access_token ?? null
}

async function getNowPlaying(accessToken: string): Promise<NowPlayingPayload> {
  const response = await fetch(NOW_PLAYING_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  // 204 No Content means nothing is currently playing.
  if (response.status === 204 || response.status === 202) {
    return { isPlaying: false }
  }

  if (!response.ok) {
    console.error('Spotify currently-playing request failed', response.status, await response.text())
    return { isPlaying: false }
  }

  const data = await response.json()

  if (!data || !data.item || data.is_playing !== true) {
    return { isPlaying: false }
  }

  const item = data.item as {
    name: string
    artists: { name: string }[]
    album: { name: string; images: { url: string }[] }
    external_urls: { spotify: string }
  }

  return {
    isPlaying: true,
    title: item.name,
    artist: item.artists.map((artist) => artist.name).join(', '),
    album: item.album.name,
    albumImageUrl: item.album.images?.[0]?.url,
    songUrl: item.external_urls?.spotify,
  }
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  // Cache at the edge briefly so we don't hammer Spotify on every page view.
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60')

  try {
    const accessToken = await getAccessToken()

    if (!accessToken) {
      res.status(200).json({ isPlaying: false } satisfies NowPlayingPayload)
      return
    }

    const payload = await getNowPlaying(accessToken)
    res.status(200).json(payload)
  } catch (error) {
    console.error('spotify-now-playing handler error', error)
    res.status(200).json({ isPlaying: false } satisfies NowPlayingPayload)
  }
}
