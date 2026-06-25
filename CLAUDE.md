# CLAUDE.md — Guia para Desenvolvimento Assistido por IA

> Este arquivo define as regras inegociáveis do projeto.
> Qualquer assistente de IA (Claude, Copilot, Cursor, GPT-4, Aider, etc.) deve ler este documento **antes** de gerar qualquer linha de código.
>
> Compatível com a convenção `AGENTS.md` da indústria — duplica este arquivo como `AGENTS.md` se necessário.

---

## 0. Correção pendente do scaffold (APLICAR PRIMEIRO)

**Bug conhecido:** o servidor de desenvolvimento falha ao iniciar com:

```
[plugin:vite:import-analysis] Failed to resolve import "./styles/main.css" from "src/scripts/main.js"
```

**Causa:** em `src/scripts/main.js`, o import do CSS usa caminho relativo errado. Como `main.js` está em `src/scripts/`, o caminho `./styles/main.css` aponta para `src/scripts/styles/main.css` (inexistente).

**Fix:** em `src/scripts/main.js`, trocar:

```js
import "./styles/main.css"; // ERRADO
```

por:

```js
import "../styles/main.css"; // CORRETO (sobe um nível)
```

Após o fix, `npm run dev` deve subir sem erros.

---

## 1. Contexto do projeto

| Campo                   | Valor                                                                   |
| ----------------------- | ----------------------------------------------------------------------- |
| **Cliente**             | FJ Ambiental                                                            |
| **Setor**               | Consultoria Ambiental e Recursos Hídricos                               |
| **Sede**                | Salvador — Bahia, Brasil                                                |
| **Fundada em**          | 2010                                                                    |
| **Tipo do site**        | Landing institucional — 5 páginas                                       |
| **Páginas**             | Home, Serviços, Portfólio, Sobre, Contato                               |
| **Direção visual**      | Premium Corporativo — Hero dark, body light, ritmo dark/light alternado |
| **Meta de performance** | Lighthouse 100/100/100/100 em mobile e desktop                          |
| **Idioma principal**    | pt-BR                                                                   |
| **Site antigo**         | https://fjambiental.com.br/ (referência de conteúdo apenas)             |

---

## 2. Stack travado — Fase 1 (vanilla)

**Toda dependência abaixo está travada com motivo. NÃO atualize versões major sem aprovação humana explícita.**

### Core

- **HTML5** semântico — sem framework JavaScript no cliente
- **Vite 5.x** — build tool e dev server
- **Tailwind CSS 3.4.x** — utility-first styling (ver §4.1)
- **JavaScript ES2024** — módulos nativos, sem TypeScript na Fase 1

### Animação e interação

- **GSAP 3.13+** — toda a suite gratuita após aquisição pela Webflow (Abr/2025). ScrollTrigger, ScrollSmoother, MorphSVG, SplitText são livres agora.
- **Lenis 1.x** — smooth scroll sincronizado com ScrollTrigger

### Assets e build

- **@fontsource/ibm-plex-sans** + **@fontsource/ibm-plex-mono** — fontes self-hosted via npm
- **sharp** — otimização de imagens em build (AVIF + WebP + srcset responsivo)
- **posthtml-include** (via plugin Vite custom) — partials HTML reutilizáveis

### Proibido na Fase 1

- ❌ React, Vue, Svelte, Solid
- ❌ Astro, Next.js, Nuxt, SvelteKit
- ❌ TypeScript (vamos adicionar na Fase 2)
- ❌ jQuery, Bootstrap, Material UI
- ❌ Animation libraries que não sejam GSAP (Framer Motion, GreenSock-old, anime.js)
- ❌ CSS-in-JS (styled-components, emotion)

---

## 3. Disciplinas arquiteturais inegociáveis

Estas 5 regras foram desenhadas pra permitir migração futura para Astro **sem reescrita**. Quebrar qualquer uma transforma migração em refatoração.

### 3.1 Partials HTML — nunca HTML duplicado

Header, footer, head e blocos repetidos ficam em `src/partials/`. Inclusão via:

```html
<include src="header.html" />
```

Quando migrarmos para Astro, cada partial vira `.astro` direto, copy-paste.

### 3.2 Conteúdo separado de apresentação

Serviços e projetos do portfólio ficam em `src/content/*.json` lidos em build-time.
**Nunca** hardcode "23 serviços" em HTML. Migra direto para Content Collections do Astro.

#### Critério de decisão: onde um conteúdo deve viver

Antes de criar qualquer section nova, decida onde o conteúdo dela mora
usando este critério de 3 vias:

**1. Chrome do site (repete entre PÁGINAS diferentes) → `src/partials/`**
Se o elemento aparece (ou vai aparecer) em mais de uma página do site —
ex: header, footer, head — ele é um partial, incluído via
`<include src="arquivo.html" />` (vite-plugin-includes.js). O critério é
repetição CROSS-PAGE, não repetição dentro da mesma página. Pensando na
migração futura para Astro: cada partial é candidato direto a virar
componente `.astro` (`<Header />`).

**2. Dado estruturado e repetido (N itens do mesmo shape) → `src/content/*.json`**
Se o conteúdo de uma section é uma coleção de N registros com os mesmos
campos — ex: 8 projetos do portfólio, N serviços, N perguntas de FAQ — ele
vira um arquivo JSON em `src/content/`, lido em build-time, nunca
hardcoded item-a-item no HTML. Pensando na migração futura: cada JSON é
candidato direto a uma Astro Content Collection.

**3. Conteúdo editorial único de uma section → inline no HTML da própria página**
Se o conteúdo é único (não é uma lista de N itens iguais) — ex: o texto do
Hero, a introdução da section Sobre, o título e intro da FAQ — ele fica
escrito direto no HTML da section, sem JSON e sem partial. Não há
repetição de shape que justifique abstração.

**Módulos JS** (`src/scripts/modules/`) seguem uma lógica separada: cada
módulo nasce quando a section **ganha comportamento interativo** (não quando
a section é criada). Uma section pode existir 100% estática por várias
sessões antes de receber seu módulo — isso é estágio de desenvolvimento,
não ausência arquitetural.

### 3.3 Design tokens em CSS variables

`src/styles/tokens.css` é a **única fonte de verdade**.
Tailwind config consome de lá via `theme.extend.colors`.
**Nunca** hardcode hex em componente — sempre via token.

### 3.4 JavaScript em módulos ES, jamais monolítico

`src/scripts/modules/` com **um arquivo por feature** (hero.js, reveal.js, faq.js, nav.js, etc.).
Cada módulo exporta uma função `init` que retorna função de cleanup.
Cada módulo vira um Astro island depois com `client:visible`.

```js
// src/scripts/modules/hero.js
export function initHero(root = document) {
  const ctx = gsap.context(() => {
    // animations
  }, root);

  return () => ctx.revert();
}
```

### 3.5 GSAP sempre dentro de `gsap.context()`

**Toda** animação é criada dentro de um context. Sem exceção. Memory leak garantido se ignorar.

```js
const ctx = gsap.context(() => {
  gsap.to(".elem", { y: 0, duration: 0.8 });
}, scopeElement);

// Cleanup obrigatório:
return () => ctx.revert();
```

---

## 4. Armadilhas comuns de IA neste stack

A IA tende a errar nestes pontos específicos. Se você for IA lendo isto, faça **checagem ativa** antes de submeter código.

### 4.1 Tailwind v3 vs v4

- **Estamos em v3.4.x.** Se for usar `@theme {}` ou `@layer theme` no CSS, isso é **v4** — não aplica.
- Config em `tailwind.config.js`. `theme.extend.colors` consome CSS vars.
- v4 será considerada na Fase 2.

### 4.2 Imagens sem dimensões intrínsecas

**Toda** `<img>` precisa de `width` e `height` no HTML, mesmo sendo responsiva.
Sem isso, CLS estoura e Lighthouse cai. Para AVIF/WebP responsivo:

```html
<img
  src="/images/hero-1024.avif"
  srcset="
    /images/hero-640.avif   640w,
    /images/hero-1024.avif 1024w,
    /images/hero-1920.avif 1920w
  "
  sizes="(max-width: 768px) 100vw, 80vw"
  width="1920"
  height="1080"
  alt="..."
  loading="lazy"
  decoding="async"
/>
```

Para a primeira imagem do hero, troque `loading="lazy"` por `fetchpriority="high"`.

### 4.3 Scripts bloqueantes

**Todo** `<script>` no HTML deve ter `defer` ou `type="module"`. Scripts inline são banidos exceto JSON-LD.

### 4.4 GSAP fora de context

Detalhado em §3.5. **Não esquecer.**

### 4.5 Lenis sem sync com ScrollTrigger

Quando animações de scroll disparam em momento errado, é isso. Ver `src/scripts/modules/smooth-scroll.js` para a implementação correta.

### 4.6 `font-display` errado em @font-face

Sempre `swap` ou `optional`. Nunca `block` (FOIT — Flash of Invisible Text).
Como usamos @fontsource, isso já vem configurado correto. Não substituir por @import manual.

### 4.7 `console.log` em produção

Vite remove em build se configurado. Para garantir, manter `if (import.meta.env.DEV)` em logs.

### 4.8 DOM manipulation fora de módulos

**Todo** JS num módulo nomeado importado por `main.js`. Nada de `<script>` solto no fim do HTML.

### 4.9 `prefers-reduced-motion` ignorado

**Toda** animação respeita a preferência do usuário. Ver pattern em `smooth-scroll.js`.

### 4.10 Tags semânticas erradas

- Card de projeto/serviço → `<article>`, não `<div>`
- Lista de cards → `<ul><li>...`, não `<div><div>...`
- Navegação → `<nav>`, não `<div>` com classe `nav`
- Hierarchia heading — não pular níveis (h1 → h3 sem h2 é erro)

### 4.11 Tailwind utilities em elementos com estado JS

**Nunca** adicione Tailwind utilities diretamente em elementos que recebem classes de estado via JavaScript.

Exemplo problemático: `.site-header` recebe `.is-scrolled` e `.is-light` por JS. Se alguém adicionar `bg-white` via Tailwind diretamente no `<header>`, a especificidade do utilitário pode bloquear silenciosamente os overrides das classes de estado, quebrando a troca de tema sem gerar erro visível.

**Regra:** elementos controlados por JS usam **apenas classes BEM custom** no HTML. Tailwind fica nos elementos filhos estáticos que não mudam de estado. Ver arquitetura completa em §12.12.

---

## 5. Estrutura de pastas

```
fj-ambiental/
├── public/                        # Servido como /
│   ├── favicon.svg                # Favicon SVG com dark mode embutido
│   ├── manifest.webmanifest       # PWA
│   ├── robots.txt
│   └── images/                    # Imagens otimizadas (gerado por sharp)
├── src/
│   ├── partials/                  # Includes HTML
│   │   ├── head.html              # Meta tags compartilhadas
│   │   ├── header.html            # Navegação principal
│   │   └── footer.html            # Footer dark
│   ├── styles/
│   │   ├── tokens.css             # CSS variables (FONTE DA VERDADE)
│   │   ├── base.css               # Reset + typography defaults
│   │   └── main.css               # Entry point
│   ├── scripts/
│   │   ├── main.js                # Entry point
│   │   ├── modules/               # Um arquivo por feature
│   │   │   ├── smooth-scroll.js   # Lenis + GSAP sync
│   │   │   └── reveal.js          # Fade-up on scroll
│   │   └── utils/                 # Helpers reutilizáveis
│   ├── content/                   # Dados em JSON
│   │   ├── services.json          # (a criar)
│   │   └── projects.json          # ✅ 8 projetos placeholder
│   └── assets/
│       └── logo/                  # SVGs da marca
├── plugins/
│   └── vite-plugin-includes.js    # Sistema de partials HTML
├── scripts/                       # Scripts Node de build
├── index.html                     # Home
├── servicos.html                  # (a criar nas próximas iterações)
├── portfolio.html                 # idem
├── sobre.html                     # idem
├── contato.html                   # idem
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .gitignore
├── .nvmrc
├── CLAUDE.md                      # ← Você está aqui
├── DESIGN_SYSTEM.md               # Tokens visuais documentados
└── README.md                      # Quick start humano
```

---

## 6. Convenções de código

### CSS / Tailwind

- Tailwind primeiro para layout, espaçamento, cor e tipografia.
- CSS custom só onde Tailwind não chega: animações complexas, pseudo-elementos elaborados, container queries específicas, custom properties dinâmicas.
- `@apply` apenas para padrões repetidos 3+ vezes.
- **Mobile-first**: estilos base = mobile, breakpoints adicionam para maior (`md:`, `lg:`, `xl:`).

### JavaScript

- ES modules nativos sempre (`import` / `export`).
- Funções nomeadas em export, não `export default function()`.
- Cada módulo exporta uma `init` que aceita opcionalmente um `root` element.
- Cleanup via return function (preparação para Astro islands).
- Sem semicolons opcionais — usar consistentemente (estamos usando WITH).
- Aspas simples para strings, backticks para template literals.

### HTML

- Semântico ao máximo: `<article>`, `<section>`, `<aside>`, `<nav>`, `<header>`, `<footer>`, `<figure>`, `<figcaption>`.
- `alt` em **todas** as imagens (vazio `alt=""` só para decorativas).
- ARIA quando necessário, mas **semantic HTML primeiro**.
- Heading hierarchy correta — não pular níveis.
- Indentação de 2 espaços.

### Nomes

- Arquivos: `kebab-case` (`hero-section.js`, `project-card.html`)
- CSS classes: `kebab-case` ou Tailwind utilities
- JS variables/functions: `camelCase`
- JS constants: `SCREAMING_SNAKE_CASE`
- Componentes-like: `PascalCase` quando aplicável

---

## 7. Performance budget (limites duros)

| Asset                    | Budget        |
| ------------------------ | ------------- |
| HTML por página          | < 25kb        |
| CSS total (purgado)      | < 30kb        |
| JS inicial (main.js)     | < 50kb        |
| GSAP bundle (lazy)       | < 60kb        |
| Imagens above-the-fold   | < 200kb total |
| Fontes (3 weights total) | < 80kb        |
| **Total página inicial** | **< 400kb**   |

### Core Web Vitals targets

- **LCP** (Largest Contentful Paint): < 2.0s
- **INP** (Interaction to Next Paint): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.05

---

## 8. SEO baseline (toda página)

- `<title>` único, < 60 caracteres
- `<meta name="description">` único, 140-160 caracteres
- Open Graph completo: og:title, og:description, og:image, og:url, og:type, og:locale
- Twitter Card: summary_large_image
- JSON-LD: `Organization` (todas) + `ProfessionalService` (home, serviços) + `FAQPage` (onde houver)
- Sitemap.xml automático no build (a configurar)
- Canonical URL absoluta em toda página
- `<html lang="pt-BR">` em todas as páginas

---

## 9. Acessibilidade — WCAG 2.1 AA mínimo

- Contraste de texto: 4.5:1 (normal), 3:1 (large text 18px+ bold ou 24px+ regular)
- Focus visible em todos os elementos interativos (custom focus ring com `outline: 2px solid var(--color-fj-aqua); outline-offset: 2px`)
- `prefers-reduced-motion` respeitado em **todas** as animações
- Navegação por teclado funcional 100%
- Skip-to-content link no header como primeiro elemento focável
- Labels em todos os inputs (`<label>` explícito, `aria-label` só quando label visual não couber)
- Landmarks ARIA implícitos via semantic HTML
- `aria-current="page"` em link de navegação ativa

---

## 10. Migração futura — Fase 2 (Astro)

Depois do site no ar e validado em produção, migração para Astro 5.

### Mecânica (estimativa: 2 dias úteis se Fase 1 seguiu §3)

1. `npm create astro@latest` em diretório novo
2. Copiar `src/partials/*.html` → `src/components/*.astro` (adicionar `---` no topo)
3. Copiar `src/scripts/modules/*.js` → islands com `client:visible`
4. Copiar `src/styles/*` direto (Astro consome CSS igual)
5. Copiar `src/content/*.json` → Content Collections com schema Zod
6. Migrar para Tailwind v4 simultaneamente (já que vamos refatorar config mesmo)
7. Adicionar TypeScript com schemas type-safe

### Ganhos esperados na Fase 2

- View Transitions nativas entre páginas
- Image component otimizando AVIF/WebP automaticamente
- Type-safety em todos os imports de conteúdo
- Lighthouse score ainda mais estável (zero JS por padrão)

---

## 11. Checklist antes de fazer commit

Antes de marcar qualquer feature como pronta, validar:

- [ ] Lighthouse rodado localmente — score 95+ em todas as categorias
- [ ] Mobile testado em viewport 375px (iPhone SE) e 414px (iPhone Pro Max)
- [ ] Desktop testado em 1280px e 1920px
- [ ] `prefers-reduced-motion: reduce` testado (DevTools → Rendering)
- [ ] Dark mode do navegador testado (não quebra layout/contraste)
- [ ] Console limpo (sem errors, sem warnings)
- [ ] Network tab limpo (sem 404, sem requests excessivos)
- [ ] HTML validado em https://validator.w3.org
- [ ] Imagens com width+height e alt
- [ ] Todos os textos em pt-BR (sem placeholders de inglês)

---

## 12. Estado dos protótipos da Home (atualizado)

Esta seção registra as decisões de design tomadas nas sessões de prototipagem de alta fidelidade. Quando for implementar uma section, **siga estas especificações** — elas já foram validadas com o cliente.

### 12.1 Ritmo de contraste das sections (CONFIRMADO)

O site alterna fundo dark (navy da logo) e light (off-white) entre sections. Esse ritmo é a identidade visual da FJ Ambiental (azul + verde da logo traduzidos na estrutura). Ordem da home:

| Nº  | Section   | Tema            | Background                      | Status protótipo                |
| --- | --------- | --------------- | ------------------------------- | ------------------------------- |
| 01  | Hero      | DARK CINEMÁTICO | Foto drone + overlay escuro 40% | ✅ Validado                     |
| 02  | Serviços  | LIGHT           | `--color-canvas` (ver nota)     | ✅ Validado (versão dark)       |
| 03  | Portfólio | LIGHT           | `--color-canvas`                | ✅ Validado                     |
| 04  | Sobre     | DARK            | `--color-deep-navy`             | ✅ Validado                     |
| 05  | FAQ       | LIGHT           | `--color-canvas`                | ⬜ A prototipar                 |
| 06  | Footer    | DARK            | `--color-deep-navy`             | ✅ Existe no scaffold (refinar) |

**NOTA DE AJUSTE DE RITMO:** o Hero virou dark cinemático (foto + overlay), diferente do plano original (white). Isso cria potencial conflito Hero(dark) → Serviços(dark). DECISÃO PENDENTE com cliente: ou (a) Serviços vira light com cards azuis, ou (b) mantém-se um respiro visual entre Hero e Serviços. A versão validada de Serviços em §12.4 está em dark — pode precisar de adaptação para light dependendo da decisão. O Hero dark cinemático é tão diferente visualmente de uma section dark sólida que o conflito é menor do que parece — avaliar na implementação.

**Regra geral:** evitar duas sections com mesmo tratamento visual seguidas. O contraste é intencional.

### 12.2 Padrão de botão CTA primário (CONFIRMADO — reutilizar em todo o site)

Quando implementar, criar como componente `.btn-pill` reutilizável (Serviços, Portfólio, Hero secundário). Especificação:

- Estado normal: fundo branco (`#fff`), texto navy (`--color-deep-navy`), círculo navy com seta branca à direita
- Padding assimétrico: `10px 10px 10px 26px` (espaço extra à esquerda, círculo cola na direita)
- Hover: gap texto→círculo expande (`14px → 18px`), círculo vira verde (`--color-fj-green`), seta rotaciona `-45deg`
- Seta: ícone `arrow-up-right` (path `M7 17L17 7M9 7h8v8`), `stroke-width 2.5`
- Border-radius: `999px` (pill)

```css
.btn-pill {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  color: var(--color-deep-navy);
  padding: 10px 10px 10px 26px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.25s var(--ease-out);
}
.btn-pill:hover {
  gap: 18px;
}
.btn-pill__icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-deep-navy);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s var(--ease-out);
}
.btn-pill:hover .btn-pill__icon {
  background: var(--color-fj-green);
  transform: rotate(-45deg);
}
```

#### Variante `.btn-pill--dark` (para CTAs em fundo canvas/light)

Quando o botão está sobre fundo claro (`--color-canvas`, `--color-surface`), usar esta variante:

- Fundo: `--color-deep-navy`
- Texto: `--color-ink-inverse` (branco)
- Ícone: background `--color-fj-green`, cor `--color-deep-navy`
- Hover ícone: background `--color-fj-green-vivid`
- Comportamento de hover idêntico ao padrão (gap expande, ícone rotaciona -45°)

Uso atual: CTA "Conheça todos os 100+ projetos" na section Portfólio.

### 12.3 Microinteração da seta circular (PADRÃO GLOBAL)

A rotação `-45deg` + mudança para verde no hover de qualquer "círculo com seta" é a assinatura de interação do site. Aplicar consistentemente em: botões pill, cards de serviço (se tiverem arrow), card "Ver case" do portfólio.

### 12.4 Section 01 — Hero (VALIDADO)

- **Tema:** dark cinemático — imagem aérea (drone) realista de área natural/rio/plantação ocupando 100% da viewport, com overlay escuro 40% + vinheta radial para legibilidade
- **Altura:** `min-height: 100vh` (primeira dobra completa)
- **Alinhamento:** TUDO centralizado vertical e horizontalmente (flexbox center)
- **É o LCP da página** — imagem de fundo precisa: formato AVIF/WebP, `fetchpriority="high"`, preload no `<head>`, dimensões explícitas. NÃO usar `loading="lazy"` aqui.
- **Estrutura de camadas (z-index) do background:**
  1. Imagem drone (camada base)
  2. Overlay: `radial-gradient` vinheta + `linear-gradient` escuro 40%
  3. Conteúdo central (z-index acima)
- **Elementos centrais (ordem vertical):**
  1. **Badge:** pílula com borda verde + texto verde caixa-alta "ENGENHARIA & CONSULTORIA", letter-spacing 2.5px, dot verde com glow, glassmorphism sutil (backdrop-blur 4px). Margin-bottom 26px.
  2. **H1 split:** Extra Bold (800), caixa-alta, 2 linhas. Linha 1 "SOLUÇÕES EM" branca; linha 2 "ENGENHARIA AMBIENTAL" verde. `font-size: clamp(34px, 7vw, 58px)`, line-height 1.02, letter-spacing -0.02em. Margin-bottom 24px.
  3. **Parágrafo:** branco/gelo (opacity 82%), max-width 460px, centralizado. "Atuamos no planejamento, organização e coordenação de ações necessárias para a regularização de atos ambientais." Margin-bottom 34px.
  4. **CTA cápsula assimétrico:** fundo navy `#0A1628`, texto branco caixa-alta "Entre em Contato". Círculo verde com seta escura COLADO NO CANTO ESQUERDO (atenção: invertido vs. os outros botões do site, onde o círculo fica à direita). Padding `8px 28px 8px 8px`. Hover: gap expande, círculo rotaciona -45°. Link → `/contato.html`.
- **REMOVIDO (decisão do cliente):** coordenadas técnicas nos cantos e scroll indicator. Hero fica limpo, foco no conteúdo central.
- **Verde sobre dark:** usar o token `--color-fj-green-vivid` (`#00C766`), não o `--color-fj-green` (`#00A859`). Sobre fundo escuro precisa de mais luminância. Aplica-se ao Hero e a qualquer texto/acento verde sobre fundos escuros cinemáticos. Ver regra completa em §2.5 do DESIGN_SYSTEM.md.
- **Micro-interações (produção):** H1 recebe SplitType — palavras entram em fade-up stagger no load (após preloader). Badge com leve fade-in. Background com possível parallax sutil no scroll (subtle, respeitando reduced-motion).
- **Header:** logo + navegação ficam por cima do Hero (já existe `src/partials/header.html` no scaffold). Header tem fundo translúcido com backdrop-blur sobre o Hero.

### 12.5 Section 02 — Serviços (IMPLEMENTADO — refinamentos pendentes)

#### Estado atual do CSS (`src/styles/base.css`)

- **Tema:** dark (`#0A1628` wrap, cards `#14202E`) ✅
- **Título:** "Três pilares da **engenharia hídrica.**" (segunda linha verde) ✅
- **Label:** "02 · Serviços" (mono, dot verde antes) ✅
- **Intro** (`.services__intro`): `color: rgba(255,255,255,0.65)` ✅
- **Header** (`.services__header`): `align-items: start` ✅
- **Layout:** grid 3 colunas (vira 1 coluna em mobile <600px), gap 12px ✅
- **Cards** (`.service-card`): `min-height: 300px`, `display: flex`, `flex-direction: column`, `height: 100%`, `padding: 28px` ✅
  - Número ghosted "01/02/03" no fundo (opacity ~3.5%, mono, 64px, top-right) ✅
  - Topo (`.service-card__top`): gap 16px — ícone + título/subtítulo lado a lado ✅
  - Título (`.service-card__title`): `font-size: var(--text-lg)` (18px) ✅
  - Descrição (`.service-card__desc`): `font-size: 15px`, `line-height: 1.6` ✅
  - Tags ancoradas na base: `.service-card__tags { margin-top: auto }` ✅
  - Tags de sub-serviços (pills, separadas por border-top) ✅
  - SEM seta individual nos cards, SEM footer com contador ✅
- **Rodapé** (`.services__cta`): `justify-content: space-between` + `border-top: 0.5px solid rgba(255,255,255,0.10)` + `padding-top: 24px`; texto à esquerda, `.btn-pill` à direita; no mobile: `flex-direction: column`, `align-items: flex-start` ✅
- **Hierarquia por cor:** Outorga (verde) · Hidrometria (aqua) · Hidrologia (verde) ✅
- **Conteúdo dos 3 cards:**
  - **01 Outorga** / RECURSOS HÍDRICOS / "Regularização do uso da água perante órgãos ambientais — captação, barramento, perfuração e lançamento de efluentes." / tags: Poços (APPO), Captação, Barramento / 10 sub-serviços
  - **02 Hidrometria** / MEDIÇÃO EM CAMPO / "Instalação de estações, medição de vazão e sedimentos, curvas de descarga e consistência de séries históricas." / tags: Fluviométrica, ADCP, Topobatimetria / 08 sub-serviços
  - **03 Hidrologia** / ESTUDOS PREDITIVOS / "Vazão regularizada, previsão de cheias, estudos hidrossedimentológicos e modelagem de qualidade de água." / tags: Vazão regul., Cheias, Modelo SMAP / 05 sub-serviços

#### Ícones (parcialmente implementado)

- **Vetores:** 3 SVGs Flaticon reais substituíram placeholders — inline em `index.html`, `fill="currentColor"` em `<g>` interno, `viewBox` originais preservados (160×160 / 60×60 / 160×160), `id`s internos removidos ✅
- **Arquivos-fonte:** `src/assets/icones/` (**português com "e"** — não `icons/`) ✅
- **CSS cor:** `.service-card__icon--green { color: var(--color-fj-green) }` / `--aqua { color: var(--color-fj-aqua) }` — cor herdada via `currentColor` ✅
- **CSS tamanho atual:** `.service-card__icon svg { width: 20px; height: 20px }` — tamanho ainda pequeno ⚠️
- **⬜ PENDENTE:** remover caixa de fundo do `.service-card__icon` (tirar `background`, `padding`, `border-radius`, `width/height` do wrapper) e aumentar SVG para ~40px — ícone maior e "solto"

#### Notas de arquitetura (não alucinar)

- **CSS:** todo o CSS de Serviços está em `src/styles/base.css`. NÃO existe `src/styles/sections/`. Dívida técnica: dividir por section no futuro.
- **Tailwind + tokens:** Tailwind v3.4 e CSS custom coexistem. `tokens.css` é a fonte da verdade para variáveis; Tailwind para layout/espaçamento.

### 12.6 Section 03 — Portfólio (IMPLEMENTADO — UI estática)

- **Tema:** light (`--color-canvas`)
- **Título:** "Engenharia hídrica **em ação.**" (segunda linha verde) — em `.portfolio__header-left`
- **Label:** "PORTFÓLIO TÉCNICO" (pill verde com dot) — **sem counter e sem setas no header**
- **Layout:** editorial split assimétrico:
  - Mobile: `1fr` (coluna única)
  - Desktop (≥ 900px): `1.45fr / 1fr`
  - Esquerda: featured card (`aspect-ratio: 16/11`, `max-height: 340px`) dark com imagem, tags overlay, coordenadas, metadata, CTA "Ver case"
  - Direita: headline editorial + descrição + stats 2×2 (mono numerals via `<dl>`)
- **Featured card detalhes:**
  - Tags duplas top-left: primária (`.portfolio__tag-primary`, verde sólida) + secundária (`.portfolio__tag-secondary`, glassmorphism) — glassmorphism funcional aqui pois tem função semântica (distinguir hierarquia de tag sobre imagem); ver exceção em §10 do DESIGN_SYSTEM.md
  - Coordenadas geográficas top-right (`aria-hidden="true"`, decorativas)
  - Metadata em mono bottom-left: cliente · ano · localização
  - CTA "Ver case" bottom-right: `.btn-pill` padrão (branco)
  - **Não implementado:** padrão topográfico SVG e glow aqua radial foram considerados no protótipo mas não estão no código
- **Stats por projeto:** 4 stats em `<dl>` com `<dt>` label e `<dd>` value + unit — trocam ao trocar de case
- **Setas de navegação:** `.portfolio__arrow--prev` e `.portfolio__arrow--next` ficam **dentro da `.portfolio__thumbs-row`**, flanqueando a `<ul class="portfolio__thumbs">` — **não no header**
- **Thumbnails:** o catálogo tem 8 projetos (`projects.json`), mas hoje há **4 thumbnails estáticos no HTML**. Quando `portfolio.js` for criado, gerará os 8 dinamicamente. Indicador visual do ativo: borda verde 2px + linha verde no topo via `::before`
- **Barra "Explorar":** `.portfolio__explore` abaixo dos thumbs — label "Explorar" + track + `.portfolio__explore-fill` (preenchimento verde, largura via `style` inline) + count "01 / 08". **Não se chama "progress line".**
- **CTA final:** `.btn-pill.btn-pill--dark` "Conheça todos os 100+ projetos" → `/portfolio.html` (fundo deep-navy, ícone verde)
- **Módulo JS:** `portfolio.js` **ainda não existe**. A section é 100% estática. Interatividade (troca de case, navegação por setas, atualização da barra Explorar) está pendente de implementação.
- **Dados:** `src/content/projects.json` ✅ já existe com 8 projetos placeholder. ⚠️ Bug de filename: ver §12.13.

### 12.7 Section 04 — Sobre (VALIDADO — já desenhado pelo cliente)

- **Tema:** dark
- **Título:** "Presença técnica em **todo o Brasil.**" (verde) com label "04 — SOBRE"
- **Layout:** mapa do Brasil estilizado à esquerda + stats list à direita
- **Mapa:** SVG Brasil, BA destacado em verde (elipse), PE/TO/MG como dots aqua, callout UNESCO/México com linha tracejada
- **Stats (mono numerals, verde):** 100+ Projetos (2009→2026) · 15+ Anos (fundada 2010) · 04 Estados (BA·PE·TO·MG) · UNESCO Parceiro internacional (Morelos·México)
- **Band de clientes (footer da section):** EMBASA · YAMANA GOLD · MINERAÇÃO CARAÍBA · BUNGE ALIMENTOS · UNESCO · TENDA · +50 CLIENTES

### 12.8 Referência de fluidez/renderização premium

Site de referência principal do cliente: `webhubeducacao.com.br/comunidade-webhub`. Técnicas a incorporar:

- **Preloader de contador 0→100%** com GSAP Timeline (esconde carregamento, entrada controlada) — ADICIONAR ao roadmap (módulo `src/scripts/modules/preloader.js`)
- **SplitType** para reveals de texto palavra-por-palavra / linha-por-linha nos headings grandes — considerar adicionar como dependência quando chegar no Hero
- **Lenis + ScrollTrigger** — já implementado no scaffold ✅
- **Marquees infinitos** opcionais (band de clientes pode rolar)
- **Pill buttons com ícone circular** — já definido em §12.2 ✅

### 12.9 Próximos passos (ordem)

1. ✅ ~~**Aplicar fix do §0**~~ — servidor rodando
2. ✅ ~~**Implementar Hero (Section 01)**~~ — conforme §12.4
3. ✅ ~~**Implementar Section 02 (Serviços)**~~ — estrutura e conteúdo prontos · **⬜ pendente: ícones soltos (~40px, sem caixa)** — ver §12.5
4. **Corrigir CLS** (0.472 → < 0.05) — causa principal: fontes IBM Plex sem dimensões reservadas, seção Serviços responde por 88% do shift — ver §12.10
5. ✅ ~~**Implementar Section 03 (Portfólio) — UI estática**~~ — conforme §12.6 · **⬜ pendente: `portfolio.js` (interatividade: troca de case, navegação, barra Explorar)**
6. **Prototipar + implementar FAQ (light)**
7. **Refinar Footer (dark)** — base existente no scaffold; corrigir contraste `text-white/40` (falha WCAG) — ver §12.10
8. **Adicionar preloader** (§12.8) + SplitType no Hero
9. Otimização de imagens (sharp), favicon system completo, Lighthouse pass em produção

**Componente reutilizável a criar primeiro:** `.btn-pill` (§12.2) — usado em Hero, Serviços e Portfólio. Definir uma vez no CSS antes de implementar as sections.

### 12.10 Diagnóstico de performance (pendente de correção)

> Medição em dev local (localhost, Slow 4G emulado no DevTools). **Performance 40 não representa produção** — dev server não minifica nem comprime.

| Categoria      | Score (dev) |
| -------------- | ----------- |
| Performance    | 40          |
| Accessibility  | 96          |
| Best Practices | 81          |
| SEO            | 100         |

#### CLS — problema principal

- **CLS medido:** 0.472 (meta do projeto: < 0.05 — ver §7)
- **Culpado:** `section#servicos` responde por 0.417 (88% do CLS total)
- **Causa provável:** fontes IBM Plex causando layout shift ao carregarem + altura dos elementos não reservada explicitamente no CSS
- **FOUC:** flash de HTML sem estilo ao recarregar (~2-3s) — mesma raiz do CLS; fontes sem `size-adjust` ou fallback de métricas correto

#### Falso positivo identificado

- **Fontes Google (Inter/Roboto)** apareciam no Network tab — era injeção da extensão **CodeGPT**, não do código. Confirmado limpo em aba anônima. O site usa **somente IBM Plex** via `@fontsource` self-hosted.

#### Outros achados (menor prioridade)

- **Contraste footer:** textos com `text-white/40` (opacity 40%) falham WCAG 4.5:1 — corrigir antes do launch
- **Headers de segurança** (CSP, HSTS, COOP, X-Frame-Options): ausentes — configurar somente no deploy, não aplicável em dev
- **Preloader:** ainda não implementado — quando pronto reduz percepção de FOUC (ver §12.8)

### 12.11 Viewport fitting — `min-height: 100svh` (padrão das sections)

As sections `.services` e `.portfolio` usam `min-height: 100svh` (não `100vh`).

**Por que `svh` em vez de `vh`?** Em mobile, a unidade `vh` inclui a altura da barra de URL do navegador, que aparece e desaparece ao rolar. Isso provoca overflow e jumping indesejado. A unidade `svh` (small viewport height) usa a viewport **sem** a barra de URL — o menor tamanho possível — garantindo que o conteúdo nunca seja cortado independente do estado da barra.

**Padrão de implementação:**
```css
.nome-da-section {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: calc(var(--header-height) + Xrem); /* compensa header fixo */
  padding-bottom: Yrem;
}
```

O conteúdo fica centralizado verticalmente no espaço restante. Usar este padrão em toda section que deve preencher a viewport.

### 12.12 Header dinâmico — arquitetura (`.is-scrolled` + `.is-light`)

Módulo: `src/scripts/modules/header.js`.

#### Estados CSS ativados por JS

| Classe | Gatilho ScrollTrigger | Efeito visual |
|---|---|---|
| `.is-scrolled` | `.hero bottom` passa por `top` da viewport | Fundo navy translúcido `rgba(10,22,40,0.85)` + backdrop-blur 12px + altura reduzida (5rem → 3.25rem) |
| `.is-light` | Header entra/sai de `[data-theme="light"]` | Fundo branco translúcido + texto/ícones dark. Adicionada no `onEnter`/`onEnterBack`, removida no `onLeave`/`onLeaveBack`. |

Sem animação própria no JS — toda transição é CSS `transition` ativada pela classe. `prefers-reduced-motion` cancela as transitions via CSS (`transition: none`).

#### Ordem de inicialização em `main.js` (CRÍTICA — não alterar)

```js
initSmoothScroll(); // 1. Lenis primeiro — registra o scroller no ScrollTrigger
initHero();         // 2. Hero segundo
initHeader();       // 3. Header por último — ScrollTrigger precisa de Lenis ativo
```

Se `initHeader()` rodar antes de `initSmoothScroll()`, os triggers calculam posições erradas e os estados disparam fora de sincronia com o scroll visível.

#### Regra crítica: nunca Tailwind utility em elemento com estado JS

O `.site-header` usa apenas classes BEM custom no HTML. **Não adicionar** utilitários Tailwind (ex: `bg-white`, `text-gray-900`) diretamente no elemento `<header>`. A especificidade de utilitários Tailwind pode bloquear silenciosamente os overrides das classes `.is-scrolled` e `.is-light`. Ver também §4.11.

### 12.13 Bug conhecido — discrepância de filename em `projects.json`

**Ainda não corrigido.**

| Local | Campo | Valor atual |
|---|---|---|
| `src/content/projects.json` linha 35 | `"image"` do projeto `"rede-hidrometrica"` | `instalacao-rede-hidrometrica-ana-aneel.webp` |
| `index.html` linha ~527 | `src` do thumb correspondente | `instalacao-rede-hidrometrica-ana-aneel_1x.webp` |

Um dos dois está errado (divergência no sufixo `_1x`). Antes de corrigir: verificar qual filename existe em `src/assets/imgs/` e corrigir o divergente. Se o arquivo real tem `_1x`, o `projects.json` deve ser atualizado; se não tem, o `index.html` deve ser corrigido.

---

## 13. Sobre este documento

Este `CLAUDE.md` é **versionado junto com o código**. Toda decisão arquitetural importante é registrada aqui. Toda IA lê isto antes de gerar código.

**Quando atualizar:**

- Adicionar nova dependência
- Mudar uma disciplina arquitetural
- Descobrir uma armadilha nova de IA
- Mudar performance budget
- Validar um novo protótipo de section (atualizar §13)
- Definir um novo padrão de componente reutilizável
- Antes da migração Fase 1 → Fase 2

**Linguagem:** português (cliente brasileiro, equipe brasileira, documentação brasileira).
