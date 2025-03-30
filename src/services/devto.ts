export interface Article {
    title: string
    description: string
    canonical_url: string
    reading_time_minutes: number
    readable_publish_date: string
    published_at: string
    tag_list: string[]
    url: string
    cover_image: string | null
    social_image: string | null
    tags: string[]
}

interface DevToArticle {
    type_of: string
    id: number
    title: string
    description: string
    published: boolean
    published_at: string
    slug: string
    path: string
    url: string
    canonical_url: string
    comments_count: number
    positive_reactions_count: number
    public_reactions_count: number
    collection_id: number | null
    created_at: string
    edited_at: string | null
    crossposted_at: string | null
    last_comment_at: string
    reading_time_minutes: number
    tag_list: string[]
    tags: string
    body_html: string
    cover_image: string | null
    social_image: string | null
    readable_publish_date: string
}

export async function fetchArticles(): Promise<Article[]> {
    try {
        const response = await fetch('https://dev.to/api/articles?username=stherzada')

        if (!response.ok) {
            throw new Error('Erro ao buscar artigos')
        }

        const articles: DevToArticle[] = await response.json()

        return articles.map(article => ({
            title: article.title,
            description: article.description,
            canonical_url: article.canonical_url,
            reading_time_minutes: article.reading_time_minutes,
            readable_publish_date: article.readable_publish_date,
            published_at: article.published_at,
            tag_list: article.tag_list,
            url: article.url,
            cover_image: article.cover_image,
            social_image: article.social_image,
            tags: article.tag_list
        }))
    } catch (error) {
        console.error('Erro ao buscar artigos do Dev.to:', error)
        throw error
    }
} 