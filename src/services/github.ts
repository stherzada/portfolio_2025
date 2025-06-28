export interface Repository {
    name: string
    description: string
    home?: string
    url: string
    stars: number
    forks: number
    languages: string[]
    tags: string[]
    created_at: string
    updated_at: string
    is_template: boolean
    archived: boolean
    visibility: 'public' | 'private'
    default_branch: string
    homepage?: string
    topics: string[]
    license?: {
        key: string
        name: string
        url: string
    }
}

interface GitHubError {
    message: string
    documentation_url?: string
}

export async function fetchPinnedRepos(): Promise<Repository[]> {
  
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        const response = await fetch('https://api.kremilly.com/github?user=stherzada', {
            signal: controller.signal
        })

        clearTimeout(timeoutId)
        if (!response.ok) {
            const error: GitHubError = await response.json()
            throw new Error(error.message || 'Erro ao buscar repositórios')
        }
        const data = await response.json()
        return Array.isArray(data) ? data : [data]
    
} 