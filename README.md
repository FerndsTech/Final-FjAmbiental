# FJ Ambiental — Site Institucional

Landing site institucional da FJ Ambiental — Consultoria Ambiental e Recursos Hídricos.

> **Documentação técnica:**
> - 📐 [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) — tokens visuais e padrões
> - 🤖 [CLAUDE.md](./CLAUDE.md) — guia para desenvolvimento assistido por IA
>
> **Documentação interna:**
> - 📋 [docs/SECTIONS.md](./docs/SECTIONS.md) — estado atual de cada section
> - 🔍 [docs/LICOES.md](./docs/LICOES.md) — histórico de bugs e diagnósticos
> - ✅ [docs/PENDENCIAS.md](./docs/PENDENCIAS.md) — tarefas pendentes

---

## Stack

- **HTML5** + **Tailwind CSS 3.4** + **JavaScript ES2024** (vanilla, sem framework no cliente)
- **Vite 5** como build tool
- **GSAP 3.13** + **Lenis** para animações e smooth scroll
- **IBM Plex Sans** + **IBM Plex Mono** (self-hosted via `@fontsource`)
- **Sharp** para otimização de imagens

Lighthouse target: **100/100/100/100** mobile e desktop.

---

## Quick start

### Pré-requisitos
- **Node.js 20 LTS** (ver `.nvmrc`)
- **npm 10+**

### Setup

```bash
# Clone e instale dependências
npm install

# Dev server (http://localhost:5173)
npm run dev

# Build de produção (gera /dist)
npm run build

# Preview do build
npm run preview
```

---

## Scripts disponíveis

| Comando | Função |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com HMR |
| `npm run build` | Build de produção (minificado, tree-shaken) |
| `npm run preview` | Servir o build localmente |

> Scripts futuros (`npm run favicon`, `npm run optimize:images`) serão adicionados conforme necessidade.

---

## Estrutura

```
fj-ambiental/
├── public/                        # Servido como /
│   ├── favicon.svg                # Favicon SVG com dark mode embutido
│   ├── manifest.webmanifest       # PWA
│   ├── robots.txt
│   ├── video-hero.mp4
│   └── images/                    # Imagens otimizadas
├── src/
│   ├── partials/                  # Includes HTML (via plugins/vite-plugin-includes.js)
│   │   ├── head.html              # Meta tags compartilhadas
│   │   ├── header.html            # Navegação principal
│   │   ├── preloader.html         # Overlay de carregamento
│   │   ├── back-to-top.html
│   │   └── footer.html            # Footer dark
│   ├── styles/
│   │   ├── tokens.css             # CSS variables (FONTE DA VERDADE)
│   │   ├── base.css               # Reset + typography defaults
│   │   └── main.css               # Entry point
│   ├── scripts/
│   │   ├── main.js                # Entry point
│   │   ├── modules/               # Um arquivo por feature
│   │   │   ├── smooth-scroll.js   # Lenis + GSAP sync
│   │   │   ├── preloader.js       # Overlay + fallback síncrono (ver ARMADILHAS 4.28)
│   │   │   ├── header.js          # Shrinking dinâmico + modo camaleão
│   │   │   ├── mobile-nav.js
│   │   │   ├── hero.js            # Animações do Hero + reduced-motion
│   │   │   ├── reveal.js          # Fade-up on scroll
│   │   │   ├── clients.js         # Marquee de logos
│   │   │   ├── portfolio.js
│   │   │   ├── sobre.js
│   │   │   ├── faq.js             # Acordeão (max-height + scrollHeight)
│   │   │   ├── footer.js
│   │   │   ├── back-to-top.js
│   │   │   └── toast.js           # Alerta em CTAs inativos
│   │   └── utils/                 # Helpers reutilizáveis (vazio hoje)
│   ├── content/                   # Dados em JSON
│   │   ├── projects.json          # 8 projetos placeholder
│   │   ├── faq.json               # 8 perguntas (id, question, answer)
│   │   └── services.json          # ⬜ pendente
│   └── assets/
│       ├── logo/                  # SVGs da marca
│       ├── icones/                # SVGs de ícones (Flaticon, com "e")
│       └── imgs/
├── docs/                          # Ver índice em CLAUDE.md
├── plugins/
│   └── vite-plugin-includes.js    # Sistema de partials HTML
├── index.html                     # Home — única página existente hoje
├── CLAUDE.md                      # Regras para IA
├── DESIGN_SYSTEM.md               # Tokens visuais documentados
└── README.md                      # ← Você está aqui
```

Páginas ainda não criadas: `servicos.html`, `portfolio.html`, `sobre.html`,
`contato.html`.

As regras de arquitetura (o porquê desta estrutura) estão em
[CLAUDE.md](./CLAUDE.md) §3 e §5.

---

## Convenções

- Indentação: **2 espaços**
- Aspas: **simples** em JS, **duplas** em HTML/JSX
- Sem TypeScript na Fase 1 (planejado para Fase 2)
- Tailwind v3.4 (não v4 — ver CLAUDE.md §4.1)
- Toda animação respeita `prefers-reduced-motion`

---

## Roadmap

### ✅ Fase 1 — Vanilla foundation (atual)
- Scaffold + design system
- Home com todas as seções
- 4 páginas internas (Serviços, Portfólio, Sobre, Contato)
- Otimização de imagens (sharp)
- Sistema completo de favicon
- Deploy em Cloudflare Pages ou Vercel

### 🔄 Fase 2 — Astro migration (pós-launch)
- Migração para Astro 5
- Tailwind v4
- TypeScript + Content Collections type-safe
- View Transitions nativas
- Image component otimizando AVIF/WebP automaticamente

Estimativa de migração: **2 dias úteis** — graças às disciplinas seguidas na Fase 1 (ver CLAUDE.md §3).

---

## Procedimentos manuais (para a pessoa, não para a IA)

Estas duas regras vieram do `CLAUDE.md` §4.16 e §4.17. Mudaram de lugar
porque são instruções de **operação humana** — a IA não usa o VS Code e
não vê esses popups. Origem: incidente #6 em `docs/LICOES.md`.

### Popup "file changed on disk" no VS Code: nunca clicar sem verificar

Quando o VS Code exibir "The file has been changed on disk. Do you want to
reload it?" durante Ctrl+S: (1) não clicar em nada ainda, (2) abrir outro
terminal, (3) rodar `git diff [arquivo]` para ver qual versão é mais atual,
(4) só então decidir. Em caso de dúvida: fechar o VS Code sem salvar e checar
via `git status` antes de reabrir.

Este risco aumentou com o fluxo de agente: a IA grava arquivos enquanto o
VS Code está aberto. Se um arquivo estiver aberto e não salvo enquanto um
`/implement` roda, o popup vai aparecer.

### `git restore [arquivo]` é a recuperação padrão para working tree corrompida

Quando o conteúdo desejado estiver no HEAD (commitado), `git restore [arquivo]`
restaura em 1 segundo sem risco. Antes de restaurar: anotar qualquer mudança
no working tree que não estava commitada, para reaplicar manualmente depois.

---

## Suporte

Cliente: **FJ Ambiental** · contato@fjambiental.com.br
Edifício Ferreira Ferraz · Av. Tancredo Neves · Caminho das Árvores · Salvador-BA · 41.820-021

---

## Licença

Projeto privado · © FJ Ambiental · Todos os direitos reservados.
