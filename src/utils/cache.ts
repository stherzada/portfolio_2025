export interface CacheEntry<T> {
    data: T
    timestamp: number
}

const readCache = <T>(key: string, duration: number): T | null => {
    try {
        const cached = localStorage.getItem(key)
        if (!cached) return null

        const entry: CacheEntry<T> = JSON.parse(cached)
        if (Date.now() - entry.timestamp > duration) {
            localStorage.removeItem(key)
            return null
        }

        return entry.data
    } catch {
        return null
    }
}

const writeCache = <T>(key: string, data: T): void => {
    try {
        const entry: CacheEntry<T> = { data, timestamp: Date.now() }
        localStorage.setItem(key, JSON.stringify(entry))
    } catch (error) {
        console.warn('Error saving to localStorage cache:', error)
    }
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export function useLocalStorageCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: {
        duration?: number
        retries?: number
        retryDelay?: number
    } = {}
) {
    const {
        duration = 1000 * 60 * 5,
        retries = 2,
        retryDelay = 300
    } = options

    // Tries the cache first, then the fetcher up to `retries + 1` times with
    // exponential backoff. Rethrows the last error if every attempt fails.
    const fetchWithRetry = async (): Promise<T> => {
        const cached = readCache<T>(key, duration)
        if (cached) return cached

        let lastError: unknown
        for (let attempt = 0; attempt <= retries; attempt++) {
            if (attempt > 0) await wait(retryDelay * 2 ** (attempt - 1))
            try {
                const data = await fetcher()
                writeCache(key, data)
                return data
            } catch (error) {
                lastError = error
            }
        }
        throw lastError
    }

    return { fetchWithRetry }
}

export const createCacheKey = {
    github: (username?: string) => `github_repos${username ? `_${username}` : ''}`,
}
