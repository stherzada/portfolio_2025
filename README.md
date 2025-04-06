# 🌟 Portfolio 2025 - Sthefany Sther

Este projeto é um site de portfólio pessoal desenvolvido com Vue 3, TypeScript e
Vite, apresentando informações sobre a minha pessoa.

<img src="public/images/tumblr_mgkl3rgYoJ1s2axdno1_500.gif" alt="Nico Robin One Piece" width="400" />

## ✨ Características

- 📱 **Design Responsivo**: Interface adaptada para dispositivos móveis e
  desktop;
- 🌓 **Modo Claro/Escuro**: Suporte para tema claro e escuro com detecção
  automática da preferência do sistema;
- 🌎 **Internacionalização**: Suporte para português e inglês;
- ⚡ **Carregamento Otimizado**: Componentes principais carregados
  assincronamente para melhor performance;
- 🔍 **SEO-friendly**: Estrutura otimizada para mecanismos de busca

## 🛠️ Tecnologias Utilizadas

- 🟢 **Vue 3**: Framework JavaScript progressivo com Composition API;
- 🔷 **TypeScript**: Tipagem estática para melhor manutenção do código;
- ⚡ **Vite**: Ferramenta de build rápida e moderna;
- 🎨 **Tailwind CSS**: Framework CSS utilitário para estilização rápida e
  consistente;
- 🌐 **Vue I18n**: Plugin de internacionalização para suporte multi-idioma;
- 🧰 **VueUse**: Coleção de utilitários para Vue Composition API;
- 🔍 **Lucide Icons**: Biblioteca de ícones para interface.

## 📂 Estrutura do Projeto

```
portfolio_2025/
├── src/                      # Código fonte
│   ├── assets/               # Arquivos estáticos (imagens, etc.)
│   ├── components/           # Componentes Vue
│   │   ├── About.vue         # Seção sobre o autor
│   │   ├── Blog.vue          # Seção de blog
│   │   ├── BlogPost.vue      # Componente de post de blog
│   │   ├── Footer.vue        # Rodapé do site
│   │   ├── Links.vue         # Links sociais e de contato
│   │   ├── NavBar.vue        # Barra de navegação
│   │   ├── Projects.vue      # Seção de projetos
│   │   ├── ScrambleText.vue  # Efeito de texto embaralhado
│   │   └── SearchBar.vue     # Barra de pesquisa
│   ├── i18n/                 # Configurações de internacionalização
│   ├── services/             # Serviços de API e utilitários
│   ├── App.vue               # Componente raiz
│   ├── main.ts               # Ponto de entrada do aplicativo
│   ├── style.css             # Estilos globais
│   └── vite-env.d.ts         # Tipos para ambiente Vite
├── public/                   # Arquivos estáticos públicos
├── index.html                # Arquivo HTML principal
├── vite.config.ts            # Configuração do Vite
├── tailwind.config.js        # Configuração do Tailwind CSS
├── tsconfig.json             # Configuração do TypeScript
└── package.json              # Dependências e scripts
```

## 🚀 Executando o Projeto

### 📋 Pré-requisitos

- ✅ Node.js (versão recomendada: 18+)
- ✅ npm ou yarn

### 💻 Instalação

```bash
# Instalar dependências
npm install
# ou
yarn
```

### 📜 Scripts Disponíveis

```bash
# Iniciar servidor de desenvolvimento
npm run dev
# ou
yarn dev

# Compilar para produção
npm run build
# ou
yarn build

# Visualizar versão de produção localmente
npm run preview
# ou
yarn preview
```

## 📌 Recursos e Seções

- 🧭 **NavBar**: Navegação principal com troca de idioma e tema
- 👤 **About**: Informações sobre mim.
- 📂 **Projects**: Lista de projetos com pesquisa, filtros e cards informativos.
- 📝 **Blog**: Artigos e publicações com prévia
- 🏁 **Footer**: Rodapé com informações de copyright e links adicionais
