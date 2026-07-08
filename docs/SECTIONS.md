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

| Nº  | Section   | Tema            | Background               | Status                             |
| --- | --------- | --------------- | ------------------------ | ---------------------------------- |
| 01  | Hero      | DARK cinemático | Foto drone + overlay 40% | ✅ Implementado                    |
| 02  | Serviços  | DARK            | `--color-deep-navy`      | ✅ Implementado                    |
| 03  | Portfólio | LIGHT           | `--color-canvas`         | ✅ Implementado (UI estática)      |
| 04  | Sobre     | DARK            | `--color-deep-navy`      | ✅ Implementado (marquee pendente) |
| 05  | FAQ       | LIGHT           | `--color-canvas`         | ✅ Implementado                    |
| 06  | Footer    | DARK            | `--color-deep-navy`      | ✅ Implementado                    |

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
CSS `base.css` § Portfólio, JS `src/scripts/modules/portfolio.js`.

**Status:** implementada — UI finalizada, carrossel funcional (4
projetos fixos). Pendência aberta: decoração "peek" mobile (ver
docs/PENDENCIAS.md).

**Decisões não-óbvias:**

- Grid assimétrico desktop `≥ 900px`: `1.55fr 1fr` (ajustado de
  `1.45fr 1fr` para aumentar o card featured). Mobile: `1fr`
  (empilhado).
- Card featured: `aspect-ratio: 16 / 10.5` (ajustado de `16 / 11` para
  abrir margem de segurança de viewport fitting), `max-height: 440px`
  — só entra em ação em telas bem mais largas que o breakpoint padrão,
  já que o `aspect-ratio` costuma governar a altura real primeiro.
- Botão "Ver case" **removido** do card featured — o card é
  visualmente inerte (sem clique próprio). O único CTA da section é
  "Conheça todos os 100+ projetos" (`.portfolio__footer`), apontando
  para `/portfolio.html`.
- **Carrossel: Opção A — 4 thumbnails fixos, não 8.** Decisão
  explícita: apesar de `projects.json` ter 8 projetos completos
  (mais outros no catálogo geral de "100+"), o carrossel da Home só
  percorre os 4 primeiros do array (`disponibilidade-hidrica`,
  `rede-hidrometrica`, `pocos-tubulares`, `medicao-vazao-pojuca`),
  mapeados 1:1 aos 4 `<li class="portfolio__thumb">` do HTML. O
  contador `.portfolio__explore-count` reflete `01/04`, não `01/08`.
- Tags duplas no featured card: `.portfolio__tag-primary` (verde
  sólida) + `.portfolio__tag-secondary` (glassmorphism). O
  glassmorphism é funcional — distingue hierarquia semântica sobre
  imagem (exceção em DESIGN_SYSTEM.md §10).
- Coordenadas geográficas no card: decorativas, `aria-hidden="true"`.
- Thumbnails: `flex: 0 0 calc(25% - 7.5px)` (ajustado de
  `calc(20% - 8px)`, que era dimensionado para 5 slots — corrigido
  para 4, matemática recalculada com o mesmo método: N gaps de 10px
  dividido pelo número real de itens).

**`portfolio.js` — arquitetura do carrossel:**

- Sem `<script>` extra de geração de DOM — os 4 thumbnails são fixos
  no HTML; o módulo só troca o conteúdo do card featured + coluna de
  texto + stats + qual thumbnail está `.is-active` + barra Explorar.
- `updateContent(index)` e `updateNav(index)` são funções separadas —
  `updateContent` (imagem, tags, coords, meta, headline, descrição,
  stats) recebe o crossfade animado; `updateNav` (thumbnail ativo,
  barra Explorar) troca **instantaneamente**, sem fade, para dar
  resposta imediata ao clique.
- Crossfade via `gsap.context()` (mesmo padrão de `sobre.js`):
  fade-out (0.2s, `power2.in`) → troca de conteúdo → fade-in (0.4s,
  `power3.out`). `prefers-reduced-motion`: pula a animação, troca
  instantânea.
- `lockDescHeight()`: mede a altura das 4 descrições via clone
  invisível e trava `.portfolio__desc` na maior — evita CLS ao trocar
  de card no layout empilhado do mobile (ver docs/LICOES.md #11).
  Recalculado no resize (debounce 200ms, mesmo padrão de `faq.js`).
- Auto-advance a cada 5000ms (`AUTO_ADVANCE_MS`), resetado por
  qualquer interação manual (thumbnail, seta, swipe). Pausado no
  `mouseenter`/`focusin` da section, retomado no `mouseleave`/
  `focusout`. Desligado por completo sob `prefers-reduced-motion`.
- **Mobile (`<600px`): thumbnails e setas ficam ocultas via CSS**
  (`.portfolio__thumbs-row { display: none; }`) — navegação manual
  nesse breakpoint é por **swipe** no card featured (`touchstart`/
  `touchmove`/`touchend`, threshold de 40px, `preventDefault` só em
  gestos predominantemente horizontais para não competir com o scroll
  vertical da página).
- Sem geração de DOM a partir do JSON: `import projectsData from
'../../content/projects.json'` é lido, mas só os 4 primeiros
  (`.slice(0, 4)`) são usados — mapeamento por índice, não por busca.

**Viewport fitting (jul/2026):**

- Section usa `min-height: 100svh` + `display: flex; justify-content:
center` — quando o conteúdo é mais baixo que a tela, o navegador
  sempre estica até bater exatamente no piso (nunca menor). Isso foi
  confirmado por medição real (ver docs/LICOES.md #10) — não existe
  cenário em telas desktop onde a section "sobra" espaço, contanto que
  o conteúdo caiba dentro do piso.
- **Cuidado ao medir:** o Device Toolbar do DevTools (`Ctrl+Shift+M`)
  contamina qualquer medição de `window.innerWidth`/`innerHeight` —
  sempre desligar antes de medir. Ver docs/LICOES.md #10.

**Pendência aberta — decoração "peek" mobile:**

Tentativa via `box-shadow` (spread negativo) não conseguiu replicar
fatias laterais altas como a referência visual (JCandy) — só produz
efeito "baralho empilhado" (escala uniforme), quase invisível nos
valores testados. Substituição projetada via pseudo-elementos
(`::before`/`::after` em `.portfolio__split`, não em
`.portfolio__featured`, que tem `overflow: hidden` e cortaria os
pseudo-elementos) — diff pronto, não aplicado. Ver docs/LICOES.md #12
e docs/PENDENCIAS.md.

---

## Section 04 — Sobre

Arquivos: `index.html` (section #sobre, `index.html:598-725`),
CSS `base.css` § Sobre (`base.css:1461-1664`),
JS `src/scripts/modules/sobre.js`.

**Status:** implementada no código. Única pendência: animação de marquee
da faixa institucional na base (ver docs/PENDENCIAS.md).

**Estrutura implementada:**

- Label "04 — SOBRE" (pendência de padronização de tag — ver docs/PENDENCIAS.md)
- Título "Presença técnica em **todo o Brasil.**" (negrito verde)
- Layout: mapa SVG do Brasil (esq) + stats em `<dl>` (dir) — grid 2
  colunas `≥ 900px`, 1 coluna abaixo disso
- Stats (`<dl>`, mono, verde): 100+ Projetos · 15+ Anos · 04 Estados ·
  UNESCO Parceiro (aqua). Sub-label "Fundada em 2010" abaixo do stat de anos.
- 2 CTAs (`.sobre__cta-row`): WhatsApp + Formulário (ver detalhe abaixo)
- Faixa institucional estática na base (ver detalhe abaixo)

**Mapa do Brasil:**

- SVG inline em `index.html` (`index.html:618-658`), fonte real:
  simplemaps.com/svg/country/br — licença "Free for Commercial and
  Personal Use" (uso livre comercial/pessoal), ver comentário
  `index.html:625`.
- 27 `<path>` de estado (uma UF cada), `id` original da fonte preservado
  (ex: `id="BRBA"`, `id="BRTO"`) — permite selecionar cada estado
  diretamente por `#id` em `sobre.js`, sem `data-*` extra.
- Geometria simplificada via algoritmo RDP (Ramer-Douglas-Peucker):
  259KB → 19.6KB, para caber no orçamento de performance (CLAUDE.md §7).
- Não existem mais dots, pins, labels soltos ou elipse decorativa no
  SVG — o preenchimento é feito diretamente no `<path>` do próprio
  estado via JS, sem elemento decorativo adicional.
- Callout "UNESCO / México 2019": apenas 2 `<text>`
  (`index.html:656-657`), sem linha tracejada ou conector — ancorado
  numa área vazia do Atlântico no viewBox.

**Estados atendidos — pintados via JS, não HTML/CSS estático:**

- Bahia (`#BRBA`): verde sólido (`--color-fj-green-vivid`,
  `fill-opacity: 1`) — é a sede.
- Tocantins / Pernambuco / Minas Gerais (`#BRTO`, `#BRPE`, `#BRMG`):
  mesma cor, translúcidos (`fill-opacity: 0.4`), preenchidos em stagger.
- CSS estático (`.sobre__map-shape`, `base.css:1536-1540`) define apenas
  o estado neutro dos demais estados: fill em `--color-border-inverse` e
  stroke em `--color-deep-navy` (tokens diferentes um do outro) — a cor
  final de cada estado atendido (BA/TO/PE/MG) vem inteiramente do JS,
  sobrescrevendo esse fill neutro.

**`sobre.js` — timeline única do GSAP:**

- Um único `gsap.timeline()` com `ScrollTrigger` (`start: 'top 65%',
once: true`) sincroniza: contadores numéricos (`.sobre__stat-value`),
  reveal do stat UNESCO (`clip-path`), preenchimento dos 4 estados e
  fade-in do callout — não são dois `ScrollTrigger` separados.
- `prefers-reduced-motion` tratado diretamente em JS (branch dedicado
  no topo do `gsap.context()`, antes de criar a timeline): aplica o
  estado final (cores e opacidade definitivos) sem animação. O único
  fallback em CSS é `.sobre__map-callout-text { opacity: 1 }` sob
  `@media (prefers-reduced-motion: reduce)`, como rede de segurança
  adicional.

**CTAs (`.sobre__cta-row`):**

- WhatsApp: reaproveita `.btn-pill--hero` (mesma classe do Hero/FAQ),
  ícone à esquerda, aponta para `wa.me/5571XXXXXXXXX` (placeholder —
  ver docs/PENDENCIAS.md).
- Formulário ("Solicitar Proposta"): reaproveita `.btn-pill` (mesma
  classe do Footer), aponta para `/contato.html`.
- `.sobre__cta-row .btn-pill--hero` recebe um **override escopado**
  (`background: var(--color-deep-navy-2)` + `box-shadow` de borda 1px
  translúcida, `base.css:1621-1624`) — primeira vez que essa variante
  aparece sobre um fundo **sólido** dark (Hero e FAQ têm foto/fundo
  light atrás dela). A definição global de `.btn-pill--hero`
  (`base.css:608`) não foi alterada. Ver docs/LICOES.md #9 para o
  incidente que motivou o override.

**Faixa institucional (antiga "band de clientes" com logos):**

- Logos de clientes substituídos por 5 itens de texto institucional
  (`.sobre__clients-band` → `<ul class="sobre__clients">`): "OUTORGA
  SUPERFICIAL E SUBTERRÂNEA" · "PESSOA FÍSICA E JURÍDICA" ·
  "CONFORMIDADE ANA/ANEEL" · "+50 CLIENTES ATENDIDOS" · "ATUAÇÃO EM 4
  ESTADOS".
- Como não são mais logos de clientes, a dúvida antiga sobre
  redundância com a Section Clientes (entre Hero e Serviços) deixa de
  se aplicar — não há mais duplicação de conteúdo entre as duas sections.
- Rolagem infinita (marquee) ainda não implementada — a lista é
  estática, sem animação (ver docs/PENDENCIAS.md).

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
- Tag de section (`.faq__label`, texto "PERGUNTAS FREQUENTES"): mesmo
  padrão visual do `.portfolio__label` (pill verde translúcido + dot),
  substituindo `.faq__eyebrow` (classe órfã, nunca instanciada no HTML,
  removida do CSS).
- Estado inicial do acordeão: o primeiro card (`outorga-o-que-e`) nascia
  com classe `is-open` e `aria-expanded="true"` hard-coded no HTML,
  abrindo por padrão no load. Corrigido diretamente no HTML — `faq.js`
  não precisou de alteração (só mede `scrollHeight` de quem já está
  `is-open`).

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
- Link "Início" (`footer.html:28`, `href="/"`) tem comportamento JS via
  `src/scripts/modules/footer.js` (`initFooterNav()`): se o usuário já
  está na home, intercepta o clique e faz scroll suave ao topo via
  `lenis.scrollTo(0)` (fallback `window.scrollTo` quando Lenis não
  inicializou, ex: `prefers-reduced-motion`); se está em outra página,
  navegação padrão (sem interceptar). Depende de `getLenis()` exportado
  por `smooth-scroll.js`.
- Os demais links de navegação do footer (Serviços, Projetos, Sobre,
  Contato) ainda não têm comportamento JS — são `<a href>` de navegação
  padrão, porque as páginas internas de destino ainda não existem
  (ver docs/PENDENCIAS.md § Páginas internas). Não é uma pendência de JS
  isolada; depende da criação das páginas primeiro.
- Commit de referência: `ee5dd50` (28/06/2026).

---

## Header dinâmico (`.site-header`)

Arquivos: `src/partials/header.html`, JS `src/scripts/modules/header.js`,
CSS `base.css` § Header. Menu mobile: JS dedicado
`src/scripts/modules/mobile-nav.js`.

**Estados JS:**

| Classe          | Gatilho ScrollTrigger                      | Efeito                                                                                                                              |
| --------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `.is-scrolled`  | Bottom de `.hero` cruza top da viewport    | Fundo `rgba(10,22,40,0.85)` + blur 12px + altura reduz (5rem → 4rem)                                                                |
| `.is-light`     | Header entra/sai de `[data-theme="light"]` | Fundo branco translúcido + texto/ícones dark                                                                                        |
| `.is-menu-open` | Menu mobile aberto (via `mobile-nav.js`)   | `opacity: 0` + `pointer-events: none` — header some com fade enquanto o painel mobile está aberto (evita duplicação visual da logo) |

**Correção de bug (sessão jul/2026):** o trigger de `.is-scrolled` não
tinha `end` definido, fazendo o GSAP calcular uma janela de ativação com
duração efetivamente zero (start e end coincidindo). A classe era
adicionada e removida quase instantaneamente, nunca persistindo — header
ficava sem contraste em todas as sections dark além do Hero. Corrigido
com `end: 'max'`. Ver docs/LICOES.md #7.

**Layout (`.container-main` dentro do header):** grid de 3 colunas
(`grid-cols-[auto_1fr_auto]`): logo à esquerda, `<nav>` centralizado
(Home, Serviços, Portfólio, Sobre — classe `.nav-link`, hover em pill
com cor verde da marca), CTA "Solicitar Contato" isolado à direita
(hover: `scale-105`, não muda cor — texto protegido com `hover:text-white`
contra a regra global `a:hover { color: var(--color-fj-green) }`).

**Hover do logo:** `.site-logo:hover span` fica verde em todos os temas.
Precisou de uma regra dedicada para `.is-light` porque
`.site-header.is-light span { color: var(--color-deep-navy) }` tinha
especificidade maior que o `a:hover` global, travando a cor mesmo no
hover — só funcionava em sections dark antes da correção.

**Menu mobile (`#mobile-nav`):** painel lateral direito, `position: fixed`,
desliza via `transform: translateX()`. Estrutura: cabeçalho (logo + "FJ
Ambiental" + botão `.mobile-nav__close` dedicado) → `<hr>` divisor →
`<nav>` com os 4 links → CTA ancorado no rodapé (`margin-top: auto`).
Overlay (`.mobile-nav-overlay`) usa `backdrop-filter: blur(5px)` — exceção
funcional de glassmorphism (DESIGN_SYSTEM.md §10), sinaliza prioridade
visual do menu sobre o conteúdo.

**IMPORTANTE — `#mobile-nav` e `.mobile-nav-overlay` são irmãos de
`<header>` no DOM, não filhos dele.** Motivo: `backdrop-filter` no
elemento pai (`.is-scrolled`/`.is-light`) transforma esse elemento no
"containing block" de descendentes `position: fixed` (comportamento
documentado da spec CSS, não bug de navegador) — isso quebrava o
cálculo de `top/right/bottom` do painel quando aninhado dentro do
header. Ver docs/LICOES.md #8. **Não mover esses elementos de volta
para dentro do `<header>`.**

Fechamento do menu: botão `.mobile-nav__close`, clique em qualquer link,
clique no overlay, tecla `Esc`, ou resize da janela para desktop
(`≥768px`). Scroll do `<body>` trava enquanto aberto. Ícone do botão
toggle alterna hambúrguer/X via `aria-expanded` (CSS puro, sem JS
manipulando ícones). **Pendente:** focus trap por teclado — ver
docs/PENDENCIAS.md.

**Ordem de inicialização em `main.js` — não alterar:**

```js
initSmoothScroll(); // 1. Lenis primeiro — registra scroller no ScrollTrigger
initHero(); // 2. Hero segundo
initHeader(); // 3. Header por último — precisa de Lenis ativo
initMobileNav(); // 4. Independente de Lenis/ScrollTrigger, ordem não é crítica
```

Se `initHeader()` rodar antes de `initSmoothScroll()`, triggers calculam
posições erradas e os estados disparam fora de sincronia.

Toda transição é CSS — o JS só adiciona/remove classes. `prefers-reduced-motion`
cancela as transitions via `transition: none` no CSS.

**Tailwind no header:** as utilities `fixed top-0 z-50 w-full` presentes no
markup são posicionais e não conflitam com os overrides JS de cor/background.
Não adicionar utilities de cor (`bg-*`, `text-*`) — ver CLAUDE.md §4.11.
