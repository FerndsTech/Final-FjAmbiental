# SECTIONS.md — Estado atual das sections da Home

> Complementa CLAUDE.md. Registra decisões de estrutura, nomenclatura BEM
> e intenção de design de cada section. Não repete o que o código já diz —
> documenta o **porquê** e o que **diverge do padrão esperado**.
>
> Pendências ativas → docs/PENDENCIAS.md
> Histórico de bugs/diagnósticos → docs/LICOES.md

---

## ⚠️ Aviso de Estado (Fase 1 - Vercel)

Todos os links e CTAs que apontam para páginas não construídas ou usam o
WhatsApp provisório estão interceptados temporariamente pelo módulo
`toast.js` via atributo `data-toast-trigger`. Eles disparam uma animação
de recusa (Gaveta Trancada) para blindar a apresentação da UI/UX. Esta
interceptação deve ser removida assim que as respectivas páginas/links
reais entrarem em produção.

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
- Vídeo de fundo (`.hero__video`): usa `transform: scale(1.05)` para
  expandir visualmente o asset e "empurrar" as bordas para fora do
  `overflow: hidden` do container pai. Isso oculta a marca d'água da
  ferramenta de IA (localizada no canto inferior direito) de forma leve
  e performática, sem necessidade de re-renderizar o vídeo original.

**Camadas de background (ordem z-index):**

1. `<picture>` — imagem drone, `object-fit: cover`
2. `.hero__overlay` — `radial-gradient` vinheta + `linear-gradient` 40%
3. `.hero__content` — conteúdo centralizado

---

## Section — Clientes (faixa de logos / marquee)

Arquivos: `index.html` (section `.clients`, id `clientes`), CSS
`base.css` § Section: Clientes, JS `src/scripts/modules/clients.js`.

**Status:** em ajuste — arquitetura da duplicação do loop já
reconstruída e validada, mas há um bug de stutter recorrente ainda
não resolvido (ver docs/PENDENCIAS.md e docs/LICOES.md #17).

**Arquitetura do loop infinito:**

- `.clients__track` contém as 12 `<img>` reais (logos dos clientes),
  com `alt` descritivo. `clients.js` (`initClients()`) clona cada uma
  via `cloneNode`, marca os clones com `aria-hidden="true"`, `alt=""`
  e `data-clients-clone="true"`, e os insere como irmãos diretos no
  mesmo `.clients__track` — não existe mais wrapper `.clients__track-dupe`
  nem `display: contents`. Isso garante que a segunda metade da faixa
  é sempre idêntica à primeira (mesmos atributos, mesma ordem),
  eliminando duplicação manual de HTML como fonte de risco.
- Animação via `@keyframes clients-marquee`, `translateX(0)` →
  `translateX(-50%)`, `35s linear infinite` — a metade exata do
  percurso corresponde ao ponto em que a segunda cópia (clonada)
  começa, criando a ilusão de loop contínuo sem salto.
- `will-change: transform` na regra `.clients__track` — sinaliza pro
  navegador priorizar essa animação no compositor/GPU.
- Sob `prefers-reduced-motion: reduce`: a animação é desligada via CSS
  (`.clients__track { animation: none; }`), e `clients.js` nem executa
  a clonagem (checagem de `matchMedia` no início do módulo) — sem
  animação, duplicar 12 imagens não tem função.
- Todas as 12 `<img>` (originais e clones) usam `loading="eager"` —
  `lazy` não funciona nesse padrão, porque as imagens só "entram na
  tela" via `transform`, não por posição real de layout (ver
  docs/LICOES.md #17).
- Tamanho: `.clients__logo { height: 48px; width: auto; }` no desktop,
  `36px` no mobile (`<600px`).
- Monocromia: `filter: brightness(0) invert(1)` em `.clients__logo`,
  `opacity: 0.55` (`1` no hover) — exige que os SVGs sejam vetores
  reais com formas separadas por cor (não raster), ou o filtro perde
  detalhe fino do desenho (ver docs/LICOES.md #17, causa 2).

**Pendências conhecidas:**

- Stutter recorrente no loop ao passar pela logo Yamana Gold — não
  resolvido, ver docs/PENDENCIAS.md.
- Atributos `width`/`height` HTML das 12 `<img>` desatualizados
  (herdados da era raster, não batem com o `viewBox` real dos SVGs
  vetoriais atuais) — ver docs/PENDENCIAS.md.

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

**Status:** implementada e completa — UI finalizada, carrossel funcional
(4 projetos fixos) com peek-card real no mobile, reveal no scroll
correto em todos os elementos.

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

- Sem `<script>` extra de geração de DOM no HTML estático — os 4
  thumbnails são fixos no HTML; o módulo troca o conteúdo do card
  featured + coluna de texto + stats + qual thumbnail está
  `.is-active` + barra Explorar.
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
  qualquer interação manual (thumbnail, seta, swipe, scroll do
  carrossel mobile). **Pausa no hover/focus restrita à área de
  navegação** (`.portfolio__featured`, `.portfolio__track`,
  `.portfolio__thumbs-wrapper`) — não à section inteira, para evitar
  que o timer pause sozinho quando o cursor já está parado sobre
  título/stats no momento em que a section entra na viewport pelo
  scroll (ver docs/LICOES.md #15). Desligado por completo sob
  `prefers-reduced-motion`.
- **Peek-card mobile (`<600px`): carrossel real via scroll-snap
  nativo.** `.portfolio__track` é populado via JS (`buildTrack()`) a
  partir de `projects.json` — 4 `<article class="portfolio__featured">`
  dentro de um container `overflow-x: auto; scroll-snap-type: x
mandatory`, cada card com `flex: 0 0 85%; scroll-snap-align: center`.
  Um `IntersectionObserver` detecta qual card está centralizado no
  scroll/swipe e sincroniza com o painel de texto, thumbnails e barra
  Explorar via `goTo(idx, true, true)` (o 3º parâmetro evita loop de
  scroll). Substitui a tentativa anterior de decoração via
  pseudo-elementos, que não conseguia mostrar conteúdo real dos cards
  adjacentes (ver docs/LICOES.md #12, revertida nesta sessão).
  Desktop (`≥600px`) não é afetado: o card único original
  (`.portfolio__split > .portfolio__featured`) permanece intocado,
  `.portfolio__track` fica `display: none` fora do breakpoint mobile.
  Fileira de thumbnails/setas oculta via CSS nesse breakpoint
  (`.portfolio__thumbs-row { display: none; }`).
- Sem geração de DOM a partir do JSON no card único desktop: `import
projectsData from '../../content/projects.json'` é lido, mas só os 4
  primeiros (`.slice(0, 4)`) são usados — mapeamento por índice, não
  por busca.

**Viewport fitting (jul/2026):**

- Section usa `min-height: 100svh` + `display: flex; justify-content:
center` — quando o conteúdo é mais baixo que a tela, o navegador
  sempre estica até bater exatamente no piso (nunca menor). Isso foi
  confirmado por medição real (ver docs/LICOES.md #10) — não existe
  cenário em telas desktop onde a section "sobra" espaço, contanto que
  o conteúdo caiba dentro do piso.
- **Cuidado ao medir:** o Device Toolbar do DevTools (`Ctrl+Shift+M`)
  contamina qualquer medição de `window.innerWidth`/`innerHeight` —
  sempre desligar antes de medir. Ver docs/LICOES.md #10. **Exceção:**
  para testar gestos de swipe/drag em containers com scroll horizontal
  (ex.: `.portfolio__track`), o Device Toolbar precisa estar **ligado**
  com um preset de dispositivo real — clique+arrastar com mouse nunca
  rola nativamente um container `overflow-x`, só toque real ou
  simulação de toque.

**Scroll-reveal:**

- `.portfolio__title`, `.portfolio__split > .portfolio__featured`
  (`data-reveal-delay="0.1"`) e `.portfolio__editorial`
  (`data-reveal-delay="0.15"`) usam `data-reveal` nos containers pais,
  não nos elementos filhos individuais — porque `portfolio.js` já
  anima a opacidade desses filhos (img, tags, coords, meta, headline,
  desc, stats) via crossfade GSAP. Aplicar `data-reveal` nos filhos
  também causaria dois `gsap.context()` disputando a mesma
  propriedade. `.portfolio__track` (populado via JS) não recebe
  `data-reveal`.
- `.portfolio__footer` usa `data-reveal-start="top 98%"` (em vez do
  padrão `top 85%` de `reveal.js`) — o footer nasce muito perto do fim
  físico da section (`min-height: 100svh` deixa a altura real quase
  idêntica à viewport), então o threshold padrão só disparava quase no
  fim do scroll da section, dando a impressão de que o botão "já vinha
  carregado". Ver docs/LICOES.md #16.

---

## Section 04 — Sobre

Arquivos: `index.html` (section #sobre, `index.html:598-725`),
CSS `base.css` § Sobre (`base.css:1461-1664`),
JS `src/scripts/modules/sobre.js`.

**Status:** implementada no código. Única pendência: animação de marquee
da faixa institucional na base (ver docs/PENDENCIAS.md).

**Estrutura implementada:**

- Label "SOBRE" — pill com dot verde, padronizada no padrão `.portfolio__label`
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
(Home, Serviços, Portfólio, Sobre — classe `.nav-link`. Os links são
pílulas individuais permanentes: possuem fundo branco a 4% com blur 4px
no estado dark/transparente, e fundo navy a 4% sem blur no estado
`.is-light`, mantendo o formato pill visível em todos os contextos.
Hover com cor verde da marca), CTA "Solicitar Contato" isolado à direita
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
