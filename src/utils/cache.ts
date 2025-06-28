export interface CacheOptions {
    duration?: number
    key: string
}

export interface CacheEntry<T> {
    data: T
    timestamp: number
}

export class LocalStorageCache {
    private static instance: LocalStorageCache
    private defaultDuration = 1000 * 60 * 5

    private constructor() { }

    static getInstance(): LocalStorageCache {
        if (!LocalStorageCache.instance) {
            LocalStorageCache.instance = new LocalStorageCache()
        }
        return LocalStorageCache.instance
    }


    get<T>(key: string): T | null {
        try {
            const cached = localStorage.getItem(key)
            if (!cached) return null

            const entry: CacheEntry<T> = JSON.parse(cached)
            if (Date.now() - entry.timestamp > this.defaultDuration) {
                localStorage.removeItem(key)
                return null
            }

            return entry.data
        } catch {
            return null
        }
    }

    set<T>(key: string, data: T, _duration?: number): void {
        try {
            const entry: CacheEntry<T> = {
                data,
                timestamp: Date.now()
            }
            localStorage.setItem(key, JSON.stringify(entry))
        } catch (error) {
            console.warn('Error saving to localStorage cache:', error)
        }
    }

    clear(): void {
        try {
            const keys = Object.keys(localStorage)
            keys.forEach(key => {
                if (key.includes('cache_')) {
                    localStorage.removeItem(key)
                }
            })
        } catch (error) {
            console.warn('Error clearing localStorage cache:', error)
        }
    }

    has(key: string): boolean {
        return this.get(key) !== null
    }
    setDefaultDuration(duration: number): void {
        this.defaultDuration = duration
    }
}

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
        duration,
        retries = 2,
        retryDelay = 300
    } = options

    const cache = LocalStorageCache.getInstance()
    if (duration) {
        cache.setDefaultDuration(duration)
    }

    const fetchWithRetry = async (): Promise<T> => {
        const cached = cache.get<T>(key)
        if (cached) {
            return cached
        }

        for (let i = 0; i < retries; i++) {
            const data = await fetcher()
            cache.set(key, data, duration)
            await new Promise(resolve => setTimeout(resolve, retryDelay))
            return data
        }
        throw new Error('All attempts failed')
    }
    const clearAllCache = () => {
        cache.clear()
    }
    return {
        fetchWithRetry,
        clearAllCache,
        getCached: () => cache.get<T>(key),
        hasCached: () => cache.has(key)
    }
}


export const createCacheKey = {
    blog: (username?: string) => `blog_articles${username ? `_${username}` : ''}`,
    github: (username?: string) => `github_repos${username ? `_${username}` : ''}`,
    user: (userId: string) => `user_${userId}`,
    project: (projectId: string) => `project_${projectId}`,
    custom: (prefix: string, ...params: string[]) => `${prefix}_${params.join('_')}`
}

