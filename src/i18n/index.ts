import { createI18n } from 'vue-i18n'

const messages = {
    en: {
        hello: 'Hello World',
        nav: {
            home: 'Home',
            about: 'About',
            projects: 'Projects',
            writing: 'Writing'
        }
    },
    pt: {
        hello: 'Olá Mundo',
        nav: {
            home: 'Início',
            about: 'Sobre',
            projects: 'Projetos',
            writing: 'Blog'
        }
    }
}

export const i18n = createI18n({
    legacy: false,
    locale: 'pt',
    fallbackLocale: 'en',
    messages
}) 