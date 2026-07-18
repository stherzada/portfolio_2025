import { createI18n } from 'vue-i18n'

const messages = {
    en: {
        nav: {
            home: 'Home',
            projects: 'Projects',
            writing: 'Blog'
        },
        about: {
            title: 'Sthefany Sther',
            role: 'software engineer · people & data',
            description: "I'm Software Developer, where I combine my technical expertise with my passion for people management and data analysis. I believe in the power of technology to transform businesses while keeping people at the heart of innovation.",
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
            searchPlaceholder: 'Search by name, language, tags...',
            noResults: 'No matches for "{query}"',
            noProjects: 'No projects to show right now.',
            tryAgain: 'Try again',
            stars: 'Stars',
            forks: 'Forks',
            loading: 'Loading projects...',
            clearSearch: 'Clear search'
        },
        blog: {
            title: 'My blog',
            visitMyBlog: '  Blog ( •̀ ω •́ )✧',
            loading: 'Loading post...',
            description: 'Here you can find my thoughts and ideas about technology, programming, and other topics.',
            featuredPost: 'Featured Post',
            readMore: 'Read more',
            previous: 'Previous',
            next: 'Next',
            page: 'Page {current} of {total}',
            postNotFound: 'Post not found.',
            errorTitle: 'Something went wrong',
            errorLoading: 'This post could not be loaded.',
            retry: 'Try again'
        }
    },
    pt: {
        nav: {
            home: 'Início',
            projects: 'Projetos',
            writing: 'Blog'
        },
        about: {
            title: 'Sthefany Sther',
            role: 'desenvolvedora de software · pessoas & dados',
            description: 'Sou desenvolvedora de software, onde combino minha experiência técnica com minha paixão por gestão de pessoas e análise de dados. Acredito no poder da tecnologia para transformar negócios, mantendo as pessoas no centro da inovação.',
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
            searchPlaceholder: 'Buscar por nome, linguagem, tags...',
            noResults: 'Nada encontrado para "{query}"',
            noProjects: 'Nenhum projeto disponível no momento.',
            tryAgain: 'Tentar novamente',
            stars: 'Estrelas',
            forks: 'Forks',
            loading: 'Carregando projetos...',
            clearSearch: 'Limpar busca'
        },
        blog: {
            title: 'Meu blog',
            visitMyBlog: 'Blog ( •̀ ω •́ )✧',
            loading: 'Carregando post...',
            description: 'Aqui você pode encontrar meus pensamentos e ideias sobre tecnologia, programação e outros temas.',
            featuredPost: 'Post em Destaque',
            readMore: 'Ler mais',
            previous: 'Anterior',
            next: 'Próxima',
            page: 'Página {current} de {total}',
            postNotFound: 'Post não encontrado.',
            errorTitle: 'Algo deu errado',
            errorLoading: 'Não foi possível carregar esse post.',
            retry: 'Tentar novamente'
        }
    }
}

export const i18n = createI18n({
    legacy: false,
    locale: 'pt',
    fallbackLocale: 'en',
    messages
}) 
