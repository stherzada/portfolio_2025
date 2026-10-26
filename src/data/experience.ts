export interface Localized {
  pt: string
  en: string
}

export interface Experience {
  company: string
  url?: string
  role: Localized
  /** 'YYYY-MM' */
  start: string
  /** 'YYYY-MM'; omit for the current position. */
  end?: string
  location?: Localized
  description?: Localized
  highlights?: Localized[]
  stack?: string[]
}

export const experiences: Experience[] = [
  {
    company: 'quatrodois',
    role: { pt: 'Desenvolvedora Fullstack', en: 'Fullstack Developer' },
    start: '2025-08',
    location: { pt: 'Remoto', en: 'Remote' },
    highlights: [
      {
        pt: 'Construí funcionalidades de rede social interna (fóruns, chat em tempo real, notificações) para a Multimarcas Consórcio, usada por 1.500 pessoas',
        en: 'Built internal social network features (forums, real-time chat, notifications) for Multimarcas Consórcio, used by 1,500 users'
      },
      {
        pt: 'Modelei o tracking com GA4 e Google Tag Manager para medir uso em mais de 20.000 usuários e a qualidade dos sites',
        en: 'Modeled tracking data with GA4 and Google Tag Manager to measure usage across 20,000+ users and site quality'
      },
      {
        pt: 'Desenvolvi e mantive funcionalidades do Wagtail CMS em todas as páginas institucionais da Multimarcas',
        en: 'Developed and maintained Wagtail CMS features across all of Multimarcas’ institutional pages'
      },
      {
        pt: 'Criei landing pages da própria quatrodois, focadas em conversão e geração de leads para o time comercial',
        en: 'Built landing pages for quatrodois itself, focused on conversion and lead generation for the sales team'
      },
      {
        pt: 'Padronizei os ambientes Docker no Linux, melhorando a estabilidade e o fluxo de desenvolvimento',
        en: 'Standardized Docker environments on Linux, improving stability and the development workflow'
      },
      {
        pt: 'Refatorei templates Django com Bootstrap para acessibilidade e consistência',
        en: 'Refactored Django templates for accessibility and consistency with Bootstrap'
      }
    ],
    stack: ['Python', 'Django', 'Wagtail', 'Docker', 'Bootstrap', 'GA4', 'GTM']
  },
  {
    company: 'deco.cx',
    url: 'https://deco.cx',
    role: { pt: 'Desenvolvedora de Software', en: 'Software Developer' },
    start: '2024-06',
    end: '2025-06',
    location: { pt: 'Brasil · Remoto', en: 'Brazil · Remote' },
    highlights: [
      {
        pt: 'Construí storefronts para grandes marcas de e-commerce, como a FarmRio na VTEX, ajudando a levar o score de performance no Lighthouse de menos de 20 para mais de 60',
        en: 'Built storefronts for major e-commerce brands, including FarmRio on VTEX, contributing to raising its Lighthouse performance score from under 20 to 60+'
      },
      {
        pt: 'Criei agentes com LLM: conversão automática de planilhas, geração de apresentações a partir de prompt e fluxos disparados por webhook',
        en: 'Created LLM-powered agents: automatic spreadsheet conversion, prompt-to-presentation generation, and webhook-triggered workflows'
      },
      {
        pt: 'Liderei refatorações contínuas com foco em performance e legibilidade do código',
        en: 'Led continuous refactoring focused on performance and code readability'
      },
      {
        pt: 'Trabalhei direto com clientes e stakeholders, do escopo à entrega',
        en: 'Worked directly with clients and stakeholders from scoping to delivery'
      }
    ],
    stack: ['TypeScript', 'Preact/Fresh', 'Deno', 'Tailwind', 'LLM APIs']
  },
  {
    company: 'Dione',
    role: { pt: 'Tech Community Manager | Product Manager', en: 'Tech Community Manager | Product Manager' },
    start: '2023-11',
    end: '2024-06',
    location: { pt: 'São Paulo, Brasil · Remoto', en: 'São Paulo, Brazil · Remote' },
    highlights: [
      {
        pt: 'Gerenciei uma comunidade tech: organização de eventos, gestão de conteúdo e conexões com o ecossistema',
        en: 'Managed a tech community: event organization, content management and ecosystem connections'
      },
      {
        pt: 'Contribuí com melhorias no produto a partir de insights de usuários e da comunidade',
        en: 'Contributed to product improvements with insights from users and the community'
      }
    ]
  },
  {
    company: 'era',
    role: { pt: 'Desenvolvedora de Software', en: 'Software Developer' },
    start: '2023-10',
    end: '2023-12',
    location: { pt: 'Remoto · Meio período', en: 'Remote · Part-time' },
    highlights: [
      {
        pt: 'Otimizei código e implementei layouts responsivos para sites',
        en: 'Optimized code and implemented responsive layouts for websites'
      }
    ]
  }
]
