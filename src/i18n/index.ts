import { createI18n } from 'vue-i18n'

const messages = {
    en: {
        nav: {
            home: 'Home',
            about: 'About',
            projects: 'Projects',
            writing: 'Writing'
        },
        about: {
            title: 'Sthefany Sther',
            description: 'Currently a Software Developer at Deco, where I combine my technical expertise with my passion for people management and data analysis. I believe in the power of technology to transform businesses while keeping people at the heart of innovation.',
            links: {
                email: 'Email',
                twitter: 'Twitter',
                midiaKit: 'Media Kit',
                twitch: 'Twitch',
                github: 'Github',
                linkedin: 'LinkedIn'
            }
        },
        footer: {
            rights: 'All rights reserved.'
        },
        projects: {
            projects: 'My projects',
            viewOnGithub: 'View on GitHub →',
            searchPlaceholder: 'Search projects by name, description, language or tags...',
            noResults: 'No projects found for your search',
            noProjects: 'No projects available',
            tryAgain: 'Try again',
            stars: 'Stars',
            forks: 'Forks',
            loading: 'Loading projects...',
            clearSearch: 'Clear search'
        },
        blog: {
            title: 'My Blog',
            minRead: 'min read',
            noArticles: 'No articles found',
            readMore: 'Read more about the article',
            tryAgain: 'Try again'
        }
    },
    pt: {
        nav: {
            home: 'Início',
            about: 'Sobre',
            projects: 'Projetos',
            writing: 'Blog'
        },
        about: {
            title: 'Sthefany Sther',
            description: 'Atualmente trabalho como Desenvolvedora de Software na Deco, onde combino minha experiência técnica com minha paixão por gestão de pessoas e análise de dados. Acredito no poder da tecnologia para transformar negócios, mantendo as pessoas no centro da inovação.',
            links: {
                email: 'Email',
                twitter: 'Twitter',
                midiaKit: 'Mídia Kit',
                twitch: 'Twitch',
                github: 'Github',
                linkedin: 'LinkedIn'
            }
        },
        footer: {
            rights: 'Todos os direitos reservados.'
        },
        projects: {
            projects: 'Meus projetos',
            viewOnGithub: 'Ver no GitHub →',
            searchPlaceholder: 'Buscar projetos por nome, descrição, linguagem ou tags...',
            noResults: 'Nenhum projeto encontrado para sua busca',
            noProjects: 'Nenhum projeto disponível',
            tryAgain: 'Tentar novamente',
            stars: 'Estrelas',
            forks: 'Forks',
            loading: 'Carregando projetos...',
            clearSearch: 'Limpar busca'
        },
        blog: {
            title: 'Meu Blog',
            minRead: 'min de leitura',
            noArticles: 'Nenhum artigo encontrado',
            readMore: 'Ver mais sobre o artigo',
            tryAgain: 'Tentar novamente'
        }
    }
}

export const i18n = createI18n({
    legacy: false,
    locale: 'pt',
    fallbackLocale: 'en',
    messages
}) 