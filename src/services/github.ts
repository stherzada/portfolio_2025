interface Repository {
    name: string
    description: string
    home?: string
    url: string
    stars: number
    forks: number
    languages: string[]
    tags: string[]
}

export async function fetchPinnedRepos(): Promise<Repository[]> {
    const response = await fetch('https://api.kremilly.com/github?user=stherzada')

    if (!response.ok) {
        throw new Error('Erro ao buscar repositórios')
    }

    const data = await response.json()
    return Array.isArray(data) ? data : [data]
} 