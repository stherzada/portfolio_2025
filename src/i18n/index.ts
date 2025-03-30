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
            viewOnGithub: 'View on GitHub →'
        },
        blog: {
            title: 'My Blog',
            minRead: 'min read',
            noArticles: 'No articles found',
            readMore: 'Read more about the article'
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
            loading: 'Carregando projetos...'
        },
        blog: {
            title: 'Meu Blog',
            minRead: 'min de leitura',
            noArticles: 'Nenhum artigo encontrado',
            readMore: 'Ver mais sobre o artigo'
        }
    }
}

export const i18n = createI18n({
    legacy: false,
    locale: 'pt',
    fallbackLocale: 'en',
    messages
}) 