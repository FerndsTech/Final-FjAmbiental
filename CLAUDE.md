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
│   │   └── projects.json          # (a criar)
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
- **Verde sobre dark:** usar tom mais vibrante `#00C766` (não o `#00A859` do sistema), pois sobre fundo escuro precisa de mais luminância. Aplica-se ao Hero e a qualquer texto/acento verde sobre fundos escuros cinemáticos.
- **Micro-interações (produção):** H1 recebe SplitType — palavras entram em fade-up stagger no load (após preloader). Badge com leve fade-in. Background com possível parallax sutil no scroll (subtle, respeitando reduced-motion).
- **Header:** logo + navegação ficam por cima do Hero (já existe `src/partials/header.html` no scaffold). Header tem fundo translúcido com backdrop-blur sobre o Hero.

### 12.5 Section 02 — Serviços (VALIDADO)

- **Tema:** dark (`#0A1628` wrap, cards `#14202E`)
- **Título:** "Três pilares da **engenharia hídrica.**" (segunda linha verde)
- **Label:** "02 · Serviços" (mono, dot verde antes)
- **Intro:** à direita do título — "Do licenciamento à medição em campo e ao estudo preditivo — o ciclo completo dos recursos hídricos."
- **Layout:** grid 3 colunas (vira 1 coluna em mobile <600px), gap 12px
- **Cards (compactos):**
  - Número ghosted "01/02/03" no fundo (opacity ~3.5%, mono, 64px, top-right)
  - Topo: ícone (42px, rounded 11px, fundo tint) + título + subtítulo mono lado a lado
  - Descrição (12px, ~3 linhas)
  - Tags de sub-serviços (pills, separadas por border-top)
  - SEM seta individual nos cards, SEM footer com contador
- **Hierarquia por cor:** Outorga (verde) · Hidrometria (aqua) · Hidrologia (verde). Aqua marca contexto hídrico direto (medição); verde marca consultoria/regularização.
- **Conteúdo dos 3 cards:**
  - **01 Outorga** / RECURSOS HÍDRICOS / "Regularização do uso da água perante órgãos ambientais — captação, barramento, perfuração e lançamento de efluentes." / tags: Poços (APPO), Captação, Barramento / 10 sub-serviços
  - **02 Hidrometria** / MEDIÇÃO EM CAMPO / "Instalação de estações, medição de vazão e sedimentos, curvas de descarga e consistência de séries históricas." / tags: Fluviométrica, ADCP, Topobatimetria / 08 sub-serviços
  - **03 Hidrologia** / ESTUDOS PREDITIVOS / "Vazão regularizada, previsão de cheias, estudos hidrossedimentológicos e modelagem de qualidade de água." / tags: Vazão regul., Cheias, Modelo SMAP / 05 sub-serviços
- **CTA:** botão `.btn-pill` "Ver todos os serviços" → `/servicos.html`, centralizado
- **Ícones:** ATUAIS SÃO PLACEHOLDER. Cliente quer ícones mais sofisticados — a destrinchar em sessão futura. Não considerar finalizados.

### 12.6 Section 03 — Portfólio (VALIDADO)

- **Tema:** light (`--color-canvas`)
- **Título:** "Engenharia hídrica **em ação.**" (segunda linha verde) — lado direito do editorial split
- **Label:** "PORTFÓLIO TÉCNICO" (pill verde com dot) + counter "03 / 24 CASES" + arrows prev/next no header
- **Layout:** editorial split assimétrico `1.45fr / 1fr`:
  - Esquerda: featured card (aspect 16/11) dark com imagem, tags overlay, coordenadas, título/metadata, CTA "Ver case"
  - Direita: headline editorial + descrição + strip de stats 2×2 (mono numerals)
- **Featured card detalhes:**
  - Padrão topográfico SVG sutil (opacity 7%) no fundo
  - Glow aqua radial no canto superior direito
  - Tags duplas top-left (primária verde sólida + secundária glassmorphism)
  - Coordenadas geográficas top-right (mono, ex: 12°44'01"S / 38°47'05"W) — detalhe de engenharia
  - Metadata em mono: cliente · ano · localização
- **Stats por projeto:** cada projeto tem suas 4 stats próprias (label/value/unit) — trocam ao trocar de case. Ex: Poços = Vazão(L/s)/Poços/Profundidade/Duração.
- **Thumbnails:** 5 thumbs seletores abaixo, com indicador (linha verde acima + glow verde no ativo), número mono
- **Progress line:** barra com preenchimento verde mostrando posição no catálogo
- **CTA final:** `.btn-pill` "Conheça todos os 100+ projetos" → `/portfolio.html`
- **Dados:** estruturar em `src/content/projects.json`. Coordenadas reais ainda não disponíveis — usar fakes; se não houver listagem com localização exata, remover o campo coords dos cards na implementação final.

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

1. **Aplicar fix do §0** e subir o servidor (`npm run dev` sem erros)
2. **Implementar Hero (Section 01)** conforme §12.4 — é o LCP e a primeira dobra; usar placeholder de imagem até a foto drone final chegar
3. **Implementar Section 02 (Serviços)** conforme §12.5
4. **Implementar Section 03 (Portfólio)** conforme §12.6 + `projects.json` + `portfolio.js`
5. **Prototipar + implementar FAQ (light)**
6. **Refinar Footer (dark)** — já existe base no scaffold
7. **Adicionar preloader** (§12.8) + SplitType no Hero
8. **Destrinchar ícones premium dos serviços** (§12.5 — pendente)
9. Otimização de imagens (sharp), favicon system completo, Lighthouse pass

**Componente reutilizável a criar primeiro:** `.btn-pill` (§12.2) — usado em Hero, Serviços e Portfólio. Definir uma vez no CSS antes de implementar as sections.

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
