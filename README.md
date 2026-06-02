# FJ Ambiental — Site Institucional

Landing site institucional da FJ Ambiental — Consultoria Ambiental e Recursos Hídricos.

> **Documentação técnica:**
> - 📐 [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) — tokens visuais e padrões
> - 🤖 [CLAUDE.md](./CLAUDE.md) — guia para desenvolvimento assistido por IA

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
├── public/              # Assets servidos como /
├── src/
│   ├── partials/        # Includes HTML reutilizáveis
│   ├── styles/          # Tokens, base e entry CSS
│   ├── scripts/         # JavaScript modular
│   ├── content/         # Dados JSON
│   └── assets/          # SVGs e ícones
├── plugins/             # Plugins Vite custom
├── index.html           # Home
└── *.html               # Outras páginas
```

Detalhes completos da arquitetura em [CLAUDE.md](./CLAUDE.md).

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

## Suporte

Cliente: **FJ Ambiental** · contato@fjambiental.com.br
Edifício Ferreira Ferraz · Av. Tancredo Neves · Caminho das Árvores · Salvador-BA · 41.820-021

---

## Licença

Projeto privado · © FJ Ambiental · Todos os direitos reservados.
