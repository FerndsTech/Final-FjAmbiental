# CLAUDE.md — Guia para Desenvolvimento Assistido por IA

> Este arquivo define as regras inegociáveis do projeto.
> Qualquer assistente de IA (Claude, Copilot, Cursor, GPT-4, Aider, etc.) deve ler este documento **antes** de gerar qualquer linha de código.
>
> Compatível com a convenção `AGENTS.md` da indústria — duplica este arquivo como `AGENTS.md` se necessário.

**Documentação complementar:**
- Estado atual de cada section → `docs/SECTIONS.md`
- Histórico de bugs e diagnósticos → `docs/LICOES.md`
- Tarefas pendentes → `docs/PENDENCIAS.md`

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

**Regra:** elementos controlados por JS usam **apenas classes BEM custom** no HTML. Tailwind fica nos elementos filhos estáticos que não mudam de estado. Ver docs/SECTIONS.md § Header dinâmico.

### 4.12 Replicar convenção "por analogia" sem mostrar a fonte

Ao seguir o padrão de um arquivo existente (ex: estrutura de um JSON de conteúdo), mostrar o trecho real desse arquivo antes de aplicar o padrão a um arquivo novo. Não afirmar "seguindo a convenção de X" sem exibir o trecho de X que embasa a afirmação.

### 4.13 Campos semânticos com estado não verificado

Um campo com significado de estado (ex: booleano de "validado", "placeholder", "publicado") não pode afirmar um estado que não ocorreu de fato. Inicializar com o valor real no momento da criação — não com o valor aspiracional ou copiado do template.

### 4.14 Acordeão: não usar `grid-template-rows: 0fr` para colapso de altura

Em Chrome, o filho de grid impõe altura mínima residual — `grid-template-rows: 0fr`
não colapsa para zero quando há padding no elemento filho.

**Padrão correto:** `max-height: 0; overflow: hidden` no CSS estático +
JS que mede `scrollHeight` real e aplica via `element.style.maxHeight`.
Nunca usar valor fixo chutado. Ver docs/LICOES.md #2 para o diagnóstico.

### 4.15 Bug visual persistente: instrumentar antes de propor hipótese

Se uma correção CSS não resolver um bug visual, a próxima etapa é **medir o estado computado real** — DevTools → Computed tab → `height` do elemento — ou listar a cascata CSS completa que alcança o elemento. Não propor outra hipótese a partir de nova leitura estática do código. A causa real pode ser diferente de qualquer hipótese baseada em leitura.

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
│   │   │   ├── reveal.js          # Fade-up on scroll
│   │   │   ├── header.js          # Shrinking dinâmico + modo camaleão
│   │   │   ├── hero.js            # Animações do Hero + reduced-motion
│   │   │   └── faq.js             # Acordeão FAQ (max-height + scrollHeight)
│   │   └── utils/                 # Helpers reutilizáveis
│   ├── content/                   # Dados em JSON
│   │   ├── services.json          # ⬜ pendente — ver docs/PENDENCIAS.md
│   │   ├── projects.json          # ✅ 8 projetos placeholder
│   │   └── faq.json               # ✅ 8 perguntas (id, question, answer)
│   └── assets/
│       ├── logo/                  # SVGs da marca
│       └── icones/                # SVGs de ícones (Flaticon, com "e")
├── docs/
│   ├── SECTIONS.md                # Estado atual de cada section
│   ├── LICOES.md                  # Histórico de bugs e diagnósticos
│   └── PENDENCIAS.md              # Tarefas pendentes
├── plugins/
│   └── vite-plugin-includes.js    # Sistema de partials HTML
├── scripts/                       # Scripts Node de build
├── index.html                     # Home
├── servicos.html                  # ⬜ pendente
├── portfolio.html                 # ⬜ pendente
├── sobre.html                     # ⬜ pendente
├── contato.html                   # ⬜ pendente
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

## 12. Padrões de componentes e implementação

### 12.1 Botão CTA (`.btn-pill`)

Componente reutilizável implementado em `src/styles/base.css`. Três variantes:

**`.btn-pill`** (base) — sobre fundo dark: fundo branco, texto navy, ícone
navy à direita. Padding assimétrico `10px 10px 10px 26px`. Hover: gap
14px → 18px, ícone vira verde e rotaciona -45°.

**`.btn-pill--dark`** — sobre fundo light/canvas: fundo navy, texto branco,
ícone verde à direita. Mesmo comportamento de hover.

**`.btn-pill--hero`** — ícone à **esquerda**: padding `8px 28px 8px 8px`.
Fundo navy, texto branco, ícone `--color-fj-green-vivid`. Usado no Hero
CTA e FAQ CTA.

Seta em todas as variantes: path `M7 17L17 7M9 7h8v8`, `stroke-width 2.5`.

### 12.2 Microinteração da seta circular (padrão global)

A rotação `-45deg` + mudança para verde no hover de qualquer "círculo com
seta" é a assinatura de interação do site. Aplicar consistentemente em:
botões pill, cards de serviço (se tiverem arrow), card "Ver case" do
portfólio.

### 12.3 Viewport fitting — `min-height: 100svh`

Sections intermediárias usam `min-height: 100svh` (não `100vh`). A unidade
`svh` (small viewport height) exclui a barra de URL mobile — garante que
o conteúdo nunca seja cortado independente do estado da barra.

**Padrão de implementação:**
```css
.nome-da-section {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: calc(var(--header-height) + Xrem);
  padding-bottom: Yrem;
}
```

Exceção: o Hero usa `min-height: 100vh` — é a primeira dobra, não sofre
do problema da barra mobile.

---

## 13. Sobre este documento

Este `CLAUDE.md` é **versionado junto com o código**. Toda decisão arquitetural importante é registrada aqui. Toda IA lê isto antes de gerar código.

**Quando atualizar:**

- Adicionar nova dependência
- Mudar uma disciplina arquitetural
- Descobrir uma armadilha nova de IA
- Mudar performance budget
- Implementar ou alterar uma section → atualizar `docs/SECTIONS.md`
- Resolver um bug relevante → registrar em `docs/LICOES.md`
- Concluir ou adicionar tarefa → atualizar `docs/PENDENCIAS.md`
- Definir um novo padrão de componente reutilizável
- Antes da migração Fase 1 → Fase 2

**Linguagem:** português (cliente brasileiro, equipe brasileira, documentação brasileira).
