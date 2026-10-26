import { watch } from 'vue'
import { createI18n } from 'vue-i18n'

const messages = {
    en: {
        nav: {
            home: 'Home',
            experience: 'Career',
            projects: 'Projects',
            writing: 'Blog',
            menu: 'Menu',
            backToBlog: 'Back to blog',
            backToTop: 'Back to top'
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
            },
            dragonAlt: 'ASCII eastern dragon flying across the page. Head based on an illustration by Suryono Suryono (Vecteezy): https://pt.vecteezy.com/arte-vetorial/7949283-desenhado-a-mao-dragao-oriental-1'
        },
        experience: {
            title: "Where I've worked",
            present: 'now',
            years: '{n} yr | {n} yrs',
            months: '{n} mo | {n} mos'
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
            errorLoading: 'Projects could not be loaded.',
            clearSearch: 'Clear search'
        },
        blog: {
            title: 'My blog',
            visitMyBlog: '  Blog ( •̀ ω •́ )✧',
            loading: 'Loading post...',
            loadingPosts: 'Loading posts...',
            errorLoadingPosts: 'Posts could not be loaded.',
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
        },
        notFound: {
            title: 'Page not found',
            backHome: '← Back to home'
        },
        terminal: {
            windowTitle: 'guest\\@stherzada.com: ~',
            hint: 'Type "help" to see the available commands.',
            close: 'Close terminal',
            inputLabel: 'Terminal command',
            open: 'Open terminal',
            help: 'Available commands: whoami, about, projects, blog, links, clear, sudo hire-me, exit',
            navigatingAbout: 'Opening /about ...',
            navigatingProjects: 'Opening /projects ...',
            navigatingBlog: 'Opening /blog ...',
            linksIntro: 'Find me at:',
            hireMe: 'Permission granted. Opening email client...',
            unknownCommand: 'command not found: {cmd} — type "help"',
            closeHint: 'Press Esc or type "exit" to close.',
            permissionDenied: 'rm: cannot remove \'/\': Permission denied (maybe try sudo?)',
            rmrf: {
                removing: "rm: removing '/' ...",
                deleted: 'deleted: /home, /css, /layout, /dignity',
                awake: 'Just kidding. Something woke up. RUN.'
            }
        },
        destroy: {
            destroyed: '{n} destroyed',
            controls: '←↑↓→ / WASD walk · Space jump (again mid-air = ground pound) · F breath',
            restore: 'press Esc or reload the page to restore the site',
            move: 'Move',
            jump: 'Jump',
            breath: 'Breath',
            dirs: { up: 'Up', down: 'Down', left: 'Left', right: 'Right' },
            taunts: {
                t5: 'the CSS will never be the same',
                t15: 'the designer is crying',
                t30: 'this is fine 🔥',
                t60: 'total annihilation. proud of you.'
            }
        }
    },
    pt: {
        nav: {
            home: 'Início',
            experience: 'Carreira',
            projects: 'Projetos',
            writing: 'Blog',
            menu: 'Menu',
            backToBlog: 'Voltar ao blog',
            backToTop: 'Voltar ao topo'
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
            },
            dragonAlt: 'Dragão oriental em ASCII voando pela página. Cabeça baseada na ilustração de Suryono Suryono (Vecteezy): https://pt.vecteezy.com/arte-vetorial/7949283-desenhado-a-mao-dragao-oriental-1'
        },
        experience: {
            title: 'Onde trabalhei',
            present: 'atual',
            years: '{n} ano | {n} anos',
            months: '{n} mês | {n} meses'
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
            errorLoading: 'Não foi possível carregar os projetos.',
            clearSearch: 'Limpar busca'
        },
        blog: {
            title: 'Meu blog',
            visitMyBlog: 'Blog ( •̀ ω •́ )✧',
            loading: 'Carregando post...',
            loadingPosts: 'Carregando posts...',
            errorLoadingPosts: 'Não foi possível carregar os posts.',
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
        },
        notFound: {
            title: 'Página não encontrada',
            backHome: '← Voltar para o início'
        },
        terminal: {
            windowTitle: 'guest\\@stherzada.com: ~',
            hint: 'Digite "help" para ver os comandos disponíveis.',
            close: 'Fechar terminal',
            inputLabel: 'Comando do terminal',
            open: 'Abrir terminal',
            help: 'Comandos disponíveis: whoami, about, projects, blog, links, clear, sudo hire-me, exit',
            navigatingAbout: 'Abrindo /about ...',
            navigatingProjects: 'Abrindo /projects ...',
            navigatingBlog: 'Abrindo /blog ...',
            linksIntro: 'Me encontre em:',
            hireMe: 'Permissão concedida. Abrindo cliente de email...',
            unknownCommand: 'comando não encontrado: {cmd} — digite "help"',
            closeHint: 'Pressione Esc ou digite "exit" para fechar.',
            permissionDenied: 'rm: não foi possível remover \'/\': Permissão negada (tente com sudo?)',
            rmrf: {
                removing: "rm: removendo '/' ...",
                deleted: 'removido: /home, /css, /layout, /dignidade',
                awake: 'Brincadeira. Algo acordou. CORRE.'
            }
        },
        destroy: {
            destroyed: '{n} destruídos',
            controls: '←↑↓→ / WASD andar · Espaço pular (de novo no ar = pisão) · F bafo',
            restore: 'aperte Esc ou recarregue a página para restaurar o site',
            move: 'Mover',
            jump: 'Pular',
            breath: 'Bafo',
            dirs: { up: 'Cima', down: 'Baixo', left: 'Esquerda', right: 'Direita' },
            taunts: {
                t5: 'o CSS nunca mais será o mesmo',
                t15: 'a designer está chorando',
                t30: 'tá tudo bem 🔥',
                t60: 'aniquilação total. orgulho de você.'
            }
        }
    }
}

type Locale = keyof typeof messages

// Resolved before the first render so there's no PT -> EN flash on mount.
const getInitialLocale = (): Locale => {
    try {
        const saved = localStorage.getItem('language')
        if (saved === 'pt' || saved === 'en') return saved
    } catch {
        // Storage blocked: fall through to the default.
    }
    return 'en'
}

export const i18n = createI18n({
    legacy: false,
    locale: getInitialLocale(),
    fallbackLocale: 'en',
    messages
})

const syncDocumentLang = (locale: string) => {
    document.documentElement.lang = locale === 'pt' ? 'pt-BR' : 'en'
}
syncDocumentLang(i18n.global.locale.value)
watch(i18n.global.locale, syncDocumentLang)

