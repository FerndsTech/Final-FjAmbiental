# SECTIONS.md — Estado atual das sections da Home

> Complementa CLAUDE.md. Registra decisões de estrutura, nomenclatura BEM
> e intenção de design de cada section. Não repete o que o código já diz —
> documenta o **porquê** e o que **diverge do padrão esperado**.
>
> Pendências ativas → docs/PENDENCIAS.md
> Histórico de bugs/diagnósticos → docs/LICOES.md

---

## Ritmo de contraste global

O site alterna dark e light entre sections. Esse contraste é identidade
visual da marca — não é acidente. Regra: nunca duas sections com mesmo
tratamento visual seguidas.

| Nº  | Section   | Tema            | Background               | Status                        |
| --- | --------- | --------------- | ------------------------ | ----------------------------- |
| 01  | Hero      | DARK cinemático | Foto drone + overlay 40% | ✅ Implementado               |
| 02  | Serviços  | DARK            | `--color-deep-navy`      | ✅ Implementado               |
| 03  | Portfólio | LIGHT           | `--color-canvas`         | ✅ Implementado (UI estática) |
| 04  | Sobre     | DARK            | `--color-deep-navy`      | ⬜ Pendente                   |
| 05  | FAQ       | LIGHT           | `--color-canvas`         | ✅ Implementado               |
| 06  | Footer    | DARK            | `--color-deep-navy`      | ✅ Implementado               |

**Nota Serviços:** a implementação ficou dark (sequência Hero dark cinemático
→ Serviços dark sólido). O contraste entre imagem com overlay e fundo sólido
é suficiente para distingui-las visualmente. Decisão resolvida na prática.

---

## Section 01 — Hero

Arquivos: `index.html` (section #hero), CSS `base.css` § Hero.

**Decisões não-óbvias:**

- Usa `min-height: 100vh` (não `svh`) — é a primeira dobra, não sofre do
  problema da barra mobile que afeta sections intermediárias (CLAUDE.md §12.11).
- Verde usa `--color-fj-green-vivid` (#00C766), não `--color-fj-green`
  (#00A859) — sobre fundo escuro precisa de mais luminância (DESIGN_SYSTEM.md §2.5).
- CTA `.btn-pill--hero`: ícone à **esquerda** — padding `8px 28px 8px 8px`.
  Inverte o padrão das demais variantes onde o ícone fica à direita.
- Imagem hero: `fetchpriority="high"` (não `loading="lazy"`) — é o LCP.
  Preload deve estar em `src/partials/head.html`.

**Camadas de background (ordem z-index):**

1. `<picture>` — imagem drone, `object-fit: cover`
2. `.hero__overlay` — `radial-gradient` vinheta + `linear-gradient` 40%
3. `.hero__content` — conteúdo centralizado

---

## Section 02 — Serviços

Arquivos: `index.html` (section #servicos), CSS `base.css` § Serviços.

**Decisões não-óbvias:**

- Grid colapsa para 1 coluna em `< 600px` — breakpoint customizado, fora
  dos breakpoints padrão do Tailwind.
- Número ghosted ("01"/"02"/"03"): decorativo, `aria-hidden="true"`,
  `opacity ~3.5%`, posicionado `absolute top-right` dentro do card.
- Tags (`.service-card__tags`): `margin-top: auto` ancora na base — cards
  são `display: flex; flex-direction: column; height: 100%`.
- Ícones SVG: pasta `src/assets/icones/` (**com "e"** — não `icons/`),
  inline no HTML, cor via `currentColor` herdado de `.service-card__icon--green`
  ou `.service-card__icon--aqua`.
- Todo o CSS desta section está em `src/styles/base.css`.
  Não existe `src/styles/sections/`.

**Hierarquia de cor:** Outorga → verde · Hidrometria → aqua · Hidrologia → verde.

---

## Section 03 — Portfólio

Arquivos: `index.html` (section #portfolio, `data-theme="light"`),
CSS `base.css` § Portfólio.

**Decisões não-óbvias:**

- Grid assimétrico desktop `≥ 900px`: `1.45fr 1fr`. Mobile: `1fr`.
- Tags duplas no featured card: `.portfolio__tag-primary` (verde sólida) +
  `.portfolio__tag-secondary` (glassmorphism). O glassmorphism é funcional —
  distingue hierarquia semântica sobre imagem (exceção em DESIGN_SYSTEM.md §10).
- Coordenadas geográficas no card: decorativas, `aria-hidden="true"`.
- Setas de navegação (`.portfolio__arrow--prev` / `--next`) ficam dentro de
  `.portfolio__thumbs-row`, flanqueando `<ul class="portfolio__thumbs">` —
  **não no header da section**.
- Barra de progresso: `.portfolio__explore` + `.portfolio__explore-fill`
  (largura via `style` inline). Nome correto é "Explorar", não "progress line".
- 4 thumbnails estáticos hoje; `portfolio.js` (pendente) gerará os 8 de
  `src/content/projects.json` dinamicamente.
- Stats em `<dl>` — `<dt>` label + `<dd>` valor + unidade.

---

## Section 04 — Sobre

Ainda não implementada. Spec validada com o cliente:

- Tema: dark (`--color-deep-navy`)
- Label: "04 — SOBRE"
- Título: "Presença técnica em **todo o Brasil.**" (negrito verde)
- Layout: mapa SVG do Brasil (esq) + lista de stats (dir)
  - BA em verde (elipse) · PE/TO/MG como dots aqua
  - Callout UNESCO/México com linha tracejada
- Stats (mono, verde): 100+ Projetos · 15+ Anos · 04 Estados · UNESCO Parceiro
- Band de clientes na base: EMBASA · YAMANA GOLD · MINERAÇÃO CARAÍBA ·
  BUNGE ALIMENTOS · UNESCO · TENDA · +50 CLIENTES

---

## Section 05 — FAQ

Arquivos: `index.html` (section #faq, `data-theme="light"`),
CSS `base.css` § FAQ, JS `src/scripts/modules/faq.js`.

**Decisões não-óbvias:**

- Cards: fundo `#F1F1EE` — tom intermediário entre `--color-canvas` e
  `--color-surface`, não um dos tokens principais.
- Estado aberto: borda verde com 28% de opacidade (não sólida).
- Acordeão usa `max-height: 0; overflow: hidden` (CSS fechado) + JS mede
  `scrollHeight` real e aplica via `element.style.maxHeight`. Não usar
  `grid-template-rows: 0fr` — ver docs/LICOES.md.
- `src/content/faq.json` existe mas **não é lido em build-time** nesta fase
  — os 8 cards estão hard-coded no HTML. O JSON é a fonte de verdade para
  migração futura (Astro Content Collections).
- Grid 2 colunas `≥ 700px` / 1 coluna `< 700px` — breakpoint customizado.
- CTA WhatsApp: número placeholder (`5571XXXXXXXXX`) — ver docs/PENDENCIAS.md.

---

## Section 06 — Footer

Arquivo: `src/partials/footer.html`, CSS `base.css` § Footer.

**Estrutura (3 colunas em `.footer__columns`):**

- `.footer__brand` — logo + tagline + `<nav>` interna
- `.footer__address` — `<address>` semântico: e-mail, telefone, endereço
- `.footer__cta-col` — `.btn-pill` "Solicitar Proposta" + ícones sociais

**Camadas de background:**

1. `.footer__map` — padrão decorativo (`aria-hidden`)
2. `.footer__overlay` — gradiente
3. `.footer__inner` — conteúdo

**Decisões não-óbvias:**

- `.footer__wordmark` na faixa inferior: decorativo, `aria-hidden="true"`.
- Links sociais têm `href="#"` (placeholder) — URLs reais pendentes com cliente.

---

- Link "Início" (footer.html:28, href="/") tem comportamento JS via
  `src/scripts/modules/footer.js` (`initFooterNav()`): se o usuário já
  está na home, intercepta o clique e faz scroll suave ao topo via
  `lenis.scrollTo(0)` (fallback `window.scrollTo` quando Lenis não
  inicializou, ex: prefers-reduced-motion); se está em outra página,
  navegação padrão (sem interceptar). Depende de `getLenis()` exportado
  por `smooth-scroll.js`.
- Os demais links de navegação do footer (Serviços, Projetos, Sobre,
  Contato) ainda não têm comportamento JS — são `<a href>` de navegação
  padrão, porque as páginas internas de destino ainda não existem
  (ver docs/PENDENCIAS.md § Páginas internas). Não é uma pendência de JS
  isolada; depende da criação das páginas primeiro.
- Commit de referência: ee5dd50 (28/06/2026).

## Header dinâmico (`.site-header`)

Arquivos: `src/partials/header.html`, JS `src/scripts/modules/header.js`,
CSS `base.css` § Header.

**Estados JS:**

| Classe         | Gatilho ScrollTrigger                      | Efeito                                                                  |
| -------------- | ------------------------------------------ | ----------------------------------------------------------------------- |
| `.is-scrolled` | Bottom de `.hero` cruza top da viewport    | Fundo `rgba(10,22,40,0.85)` + blur 12px + altura reduz (5rem → 3.25rem) |
| `.is-light`    | Header entra/sai de `[data-theme="light"]` | Fundo branco translúcido + texto/ícones dark                            |

**Ordem de inicialização em `main.js` — não alterar:**

```js
initSmoothScroll(); // 1. Lenis primeiro — registra scroller no ScrollTrigger
initHero(); // 2. Hero segundo
initHeader(); // 3. Header por último — precisa de Lenis ativo
```

Se `initHeader()` rodar antes de `initSmoothScroll()`, triggers calculam
posições erradas e os estados disparam fora de sincronia.

Toda transição é CSS — o JS só adiciona/remove classes. `prefers-reduced-motion`
cancela as transitions via `transition: none` no CSS.

**Tailwind no header:** as utilities `fixed top-0 z-50 w-full` presentes no
markup são posicionais e não conflitam com os overrides JS de cor/background.
Não adicionar utilities de cor (`bg-*`, `text-*`) — ver CLAUDE.md §4.11.
