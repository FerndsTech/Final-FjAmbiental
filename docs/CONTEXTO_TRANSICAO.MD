# CONTEXTO_TRANSICAO — FJ Ambiental — jul/2026

## ESTADO ATUAL

**Branch ativa:** `main`, sincronizada com `origin/main` (commit `d421bdb`), working tree limpo. Todas as branches de feature desta sessão já foram mergeadas e podem ser consideradas fechadas: `feature/faq-tag-and-state`, `feature/header-dark-contrast`, `fix/mobile-nav-backdrop-filter`, `docs/session-wrapup`.

**O que foi concluído nesta sessão, e como:**

1. **FAQ — tag de section + estado inicial fechado.**
   - Criada `.faq__label` + `.faq__label-dot`, espelhando exatamente `.portfolio__label`/`.portfolio__label-dot` (mesmo padrão visual: pill verde translúcido `rgba(0,168,89,0.1)` + dot verde), com o texto "PERGUNTAS FREQUENTES". Substituiu `.faq__eyebrow`, que era uma classe CSS órfã (nunca tinha elemento HTML correspondente).
   - O primeiro card do acordeão (`outorga-o-que-e`) nascia com `class="faq__card is-open"` e `aria-expanded="true"` hard-coded no HTML — por isso abria sozinho no load. Corrigido removendo esses dois atributos diretamente no HTML. Nenhuma mudança em `faq.js` foi necessária (o script só mede `scrollHeight` de cards que já estejam `is-open`).

2. **Header — bug de contraste em sections dark (Serviços, Sobre).**
   - Causa raiz: o `ScrollTrigger.create()` de `.is-scrolled` em `header.js` não tinha `end` definido. Sem `end`, o GSAP calcula um valor padrão que coincidia com o próprio `start` (`'bottom top'` do Hero) — criando uma janela de ativação com duração efetivamente zero. A classe `.is-scrolled` era adicionada e removida quase instantaneamente, nunca persistindo visualmente.
   - Diagnóstico levou tempo porque 3 hipóteses plausíveis foram descartadas com evidência antes de achar a causa real: (a) utility Tailwind de cor sobrescrevendo via cascata — descartado, header.html não tinha nenhuma; (b) ordem de inicialização em `main.js` errada — descartado, `initSmoothScroll → initHero → initHeader` já estava correto; (c) sincronização Lenis↔ScrollTrigger incorreta — descartado, o padrão em `smooth-scroll.js` é literalmente a receita oficial da documentação do Lenis. A causa real só foi confirmada medindo no DevTools (aba Elements, observando a lista de classes do header em tempo real durante o scroll).
   - Correção: adicionado `end: 'max'` ao ScrollTrigger, estendendo a janela ativa até o fim da página.
   - Ver docs/LICOES.md #7 para o relato completo.

3. **Header — reestruturação de layout e hovers.**
   - `.container-main` do header mudou de `flex justify-between` (2 grupos) para `grid grid-cols-[auto_1fr_auto]` (3 colunas): logo à esquerda, `<nav>` centralizado (Home + Serviços + Portfólio + Sobre, novo link "Home" adicionado), CTA "Solicitar Contato" isolado à direita.
   - Links do nav ganharam classe `.nav-link`: hover em pill de fundo sutil (`rgba(255,255,255,0.08)` em dark, `rgba(10,22,40,0.06)` em light) + `font-weight: 500` + cor de hover verde (`--color-fj-green-vivid` em dark, `--color-fj-green` em light — mesma regra de contraste que já rege as tags de section).
   - Hover do logo ("FJ Ambiental") não funcionava em sections light. Causa: `.site-header.is-light span { color: var(--color-deep-navy) }` tinha especificidade maior (`0-2-1`) que a regra global `a:hover { color: var(--color-fj-green) }` (`0-1-1`), travando a cor mesmo no hover. Corrigido com uma regra dedicada `.site-header.is-light .site-logo:hover span`.
   - CTA "Solicitar Contato": hover mudou de `bg-fj-green-dim` (quase imperceptível sobre fundo já verde) para `hover:scale-105` + `hover:text-white` (o `text-white` explícito foi necessário pela mesma razão do bug do logo — a regra global `a:hover` verde ganhava da utility sem essa proteção).
   - Altura do header em `.is-scrolled`: `3.25rem` → `4rem` (ajuste fino, decisão de preferência visual).

4. **Header — menu mobile implementado do zero.**
   - O botão hamburguer já existia visualmente, mas `aria-controls="mobile-nav"` apontava para um elemento que nunca foi criado — o menu era 100% decorativo antes desta sessão.
   - Implementado: painel lateral direito (`#mobile-nav`, `position: fixed`, desliza via `transform: translateX()`), overlay escurecido (`.mobile-nav-overlay`), módulo JS novo `src/scripts/modules/mobile-nav.js` (registrado em `main.js` após `initFooterNav()`).
   - Fecha via: botão dedicado `.mobile-nav__close` dentro do painel, clique em qualquer link, clique no overlay, tecla `Esc`, ou resize da janela para desktop (`≥768px`). Trava scroll do `<body>` enquanto aberto.
   - **Bug crítico corrigido:** `#mobile-nav` e `.mobile-nav-overlay` eram inicialmente filhos diretos de `<header>`. Quando o header ativava `backdrop-filter` (via `.is-scrolled` ou `.is-light`), isso tornava o header o "containing block" de descendentes `position: fixed` (comportamento documentado da spec CSS, não bug de navegador) — o painel calculava sua posição relativa ao header (~4rem de altura) em vez da viewport inteira, causando vazamento visual do conteúdo da página através dos links. Corrigido movendo os dois elementos para fora de `<header>`, como irmãos dele no DOM. Ver docs/LICOES.md #8.
   - Ícone do botão hamburguer/X ficava invisível em tema light (herdava `text-white` sem variante). Corrigido com `.site-header.is-light .nav-toggle { color: var(--color-deep-navy) }`.
   - Adicionado efeito de "prioridade visual": `backdrop-filter: blur(5px)` no overlay (exceção funcional documentada ao Don't de glassmorphism decorativo do DESIGN_SYSTEM.md §10) + o header real desaparece com fade suave (`opacity: 0`, `pointer-events: none` via nova classe `.is-menu-open`) enquanto o menu está aberto — evita duplicação visual entre a logo do header real e a logo dentro do painel.

**Fluxo de trabalho estabelecido nesta sessão (agora documentado em CLAUDE.md §13):** ciclo de 8 passos entre Claude Chat (planejamento, leitura, diff) e Claude Code (execução), sempre com diff mostrado antes de gravar, validação no navegador antes de commit, e commits/push/merge sempre manuais.

---

## PENDÊNCIAS CONHECIDAS

- **Número de WhatsApp placeholder** (`5571XXXXXXXXX`) no CTA da Section FAQ — falta o número real do cliente antes do deploy.
- **URLs das redes sociais no Footer** (`href="#"`) — Instagram e LinkedIn, aguardando links reais do cliente.
- **Telefone do Footer** (`(71) 3000-0000`) — parece placeholder, precisa confirmar número real com o cliente.
- **Tagline do Footer** — texto "Consultoria ambiental e recursos hídricos desde 2010..." precisa de confirmação do cliente (há um comentário no HTML sinalizando isso).
- **Focus trap no menu mobile** (pendência NOVA desta sessão) — ao abrir `#mobile-nav`, a navegação por Tab do teclado ainda circula pelo conteúdo da página por trás, não fica presa dentro do painel. Falta: mover foco pro primeiro link ao abrir, ciclar Tab dentro do painel, devolver foco ao botão toggle ao fechar.
- **Tags de section ainda não padronizadas** (Hero "ENGENHARIA & CONSULTORIA", Serviços "• 02 · SERVIÇOS", Sobre "04 — SOBRE") — só Portfólio (referência original) e FAQ (feita nesta sessão) seguem o padrão `.label` (pill translúcida + dot). Falta aplicar o mesmo padrão às 3 restantes.
- **CLS da Section Serviços** — medição antiga de dev (~88% do CLS total), não remedida em produção. Falta rodar Lighthouse em build de produção.
- **Contraste do Footer** — textos com opacidade baixa, suspeita de falha WCAG 4.5:1, não auditado ainda.
- **`services.json` não existe** — conteúdo dos 3 cards de Serviços ainda hard-coded no HTML.
- **`portfolio.js` não existe** — Portfólio ainda é UI estática, sem troca de case dinâmica.
- **Sobre — decisão pendente com o cliente:** avaliar se a faixa de clientes na Section Sobre é redundante com a Section Clientes (entre Hero e Serviços) antes de decidir se remove.
- **Sobre — mapa SVG provisório** — precisa ser substituído pelo SVG definitivo do Figma quando disponível.
- **4 páginas internas não existem ainda:** `servicos.html`, `portfolio.html`, `sobre.html`, `contato.html`. Por isso os links do nav do header/footer que apontam pra elas são navegação padrão sem comportamento JS especial.

---

## PRÓXIMA TAREFA PRINCIPAL

Segundo a ordem definida no início desta sessão em PENDENCIAS.md § "Ajustes de UI", com FAQ e Header já concluídos, a próxima é:

**Hero — subir conteúdo.** O conteúdo principal do Hero está posicionado baixo na viewport; ajuste esperado é em `padding-top` ou `align-items` de `.hero__content`.

**Perguntas a fazer no próximo chat antes de implementar:**

- Qual é a direção exata desejada — subir um pouco (ajuste fino) ou centralizar verticalmente de forma diferente?
- Há uma referência visual (screenshot, Figma) de como deveria ficar, ou é ajuste por olho no próprio navegador?
- Isso deve respeitar algum breakpoint específico (mobile vs desktop podem precisar de tratamento diferente)?

**O que já existe e deve ser lido antes de começar:**

- `index.html`, section `#hero` — estrutura atual do HTML
- `base.css § Hero` — CSS atual de `.hero__content`, incluindo notas já documentadas em SECTIONS.md (uso de `min-height: 100vh` não `svh`, verde vivid em vez de verde normal, CTA com ícone à esquerda em vez de à direita)

Depois do Hero, a ordem original planejada continua: Clientes (tamanho + loop sincronizado) → Portfólio (card principal maior) → Footer (aguardando referência visual do cliente) → Sobre (aguardando decisão de duplicação + SVG do Figma).

---

## LIÇÕES TÉCNICAS DESTA SESSÃO

Ambas já foram promovidas para docs/LICOES.md como #7 e #8 — são regras permanentes, não transitórias, porque descrevem comportamento de bibliotecas/CSS que pode se repetir em qualquer parte futura do projeto:

- **#7 (recomendo manter como está, já promovida):** `ScrollTrigger` com `onToggle` que deve manter estado persistente sempre precisa de `end` explícito — sem ele, o GSAP pode calcular uma janela de ativação de duração efetivamente zero.
- **#8 (recomendo manter como está, já promovida):** qualquer elemento `position: fixed` (overlays, modais, painéis) deve ser posicionado como irmão de nível alto no DOM, nunca aninhado dentro de um elemento com `backdrop-filter`/`filter`/`transform`/`will-change` — isso quebra o cálculo de posição do elemento fixo.

**Lição transitória, específica desta sessão (não precisa virar regra permanente, mas vale saber):** o terminal integrado da Claude Code no VS Code tem corte de linha por largura de coluna — copiar/colar output longo (diffs grandes, `cat` de arquivos) pode truncar palavras no meio, sem indicar que houve corte. Mitigado nesta sessão aumentando a largura do painel/diminuindo zoom da fonte do terminal. Para diffs muito grandes ou reescrita de seções inteiras de `.md`, o método mais confiável validado foi usar `grep -c` com frases-âncora do conteúdo antes/depois, em vez de confiar na leitura visual do diff colado.

---

## ESTADO DA DOCUMENTAÇÃO

Já propagado nesta sessão (commitado em `main`, nada pendente de atualização):

- **PENDENCIAS.md** — itens concluídos removidos, item de tags atualizado, pendência de focus trap adicionada.
- **SECTIONS.md** — seção "Header dinâmico" reescrita com o estado atual completo (layout, hovers, menu mobile, bug do ScrollTrigger); seção FAQ atualizada com a tag e a correção do estado inicial.
- **LICOES.md** — lições #7 e #8 adicionadas.
- **CLAUDE.md** — nova seção 13 (Fluxo Cérebro + Motor), seção antiga "Sobre este documento" renumerada para 14 sem alteração de conteúdo.

**DESIGN_SYSTEM.md não foi tocado nesta sessão** — não identifiquei nada que exija atualização nele. A única aproximação foi o uso do `backdrop-filter: blur()` no overlay do menu mobile, mas isso já se enquadra na exceção documentada em DESIGN_SYSTEM.md §10 (glassmorphism funcional) sem precisar de mudança no texto — o exemplo citado lá (`.portfolio__tag-secondary`) continua válido como referência, e o novo uso é análogo o suficiente para não precisar de um segundo exemplo registrado ali. Se no futuro houver um terceiro uso, pode valer a pena generalizar a explicação.

---

## RECOMENDAÇÃO FINAL

Não é necessário rodar nenhum prompt de atualização de documentação antes do próximo chat — tudo já foi propagado e commitado em `main` nesta própria sessão. O próximo chat pode simplesmente anexar os 5 documentos (CLAUDE.md, DESIGN_SYSTEM.md, docs/SECTIONS.md, docs/PENDENCIAS.md, docs/LICOES.md) já atualizados, mais este CONTEXTO_TRANSICAO.md como resumo executivo, e colar o prompt de abertura preparado como primeira mensagem.
