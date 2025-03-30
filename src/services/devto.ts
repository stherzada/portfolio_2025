interface Article {
    title: string
    description: string
    canonical_url: string
    reading_time_minutes: number
    readable_publish_date: string
}

export async function fetchArticles(): Promise<Article[]> {
    const response = await fetch('https://dev.to/api/articles?username=stherzada')

    if (!response.ok) {
        throw new Error('Erro ao buscar artigos')
    }

    return await response.json()
} 