# ARMADILHAS.md — Armadilhas comuns de IA neste stack

> Corpo completo das armadilhas. O índice vive em `CLAUDE.md` §4 —
> este arquivo é lido sob demanda, quando a área correspondente for tocada.
>
> A IA tende a errar nestes pontos específicos. Se você for IA lendo isto,
> faça **checagem ativa** antes de submeter código.
>
> **A numeração é estável e NÃO deve ser renumerada.** Há lacunas (4.12,
> 4.16, 4.17, 4.18, 4.25 saíram desta lista) porque `docs/LICOES.md` e
> outros documentos referenciam estes números. Renumerar quebraria essas
> referências.

---

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

### 4.19 Documentação desatualizada é mais perigosa que ausente

Ao concluir qualquer task de código, atualizar o doc correspondente
(SECTIONS.md, PENDENCIAS.md) no mesmo commit ou no imediatamente seguinte.
Nunca deixar para "depois" — documentação que não reflete o código real
induz retrabalho nas sessões seguintes. Exemplo: Section Sobre ficou marcada
como "não implementada" por várias sessões após já estar completa no código.

### 4.20 Variante de botão/componente reaproveitada num fundo novo precisa de checagem explícita de contraste

Nenhuma variante de botão é "segura por padrão" contra qualquer fundo —
o contraste dela sempre foi validado apenas nos contextos onde já era
usada. Ao reaproveitar uma variante existente (ex: `.btn-pill--hero`) num
tipo de fundo que ela nunca encontrou antes, verificar explicitamente o
contraste contra esse fundo específico antes de assumir que "já funciona
nos outros lugares" é garantia suficiente. Corrigir com override escopado
no novo contexto (ex: `.sobre__cta-row .btn-pill--hero`), nunca editando
a definição base compartilhada. Ver docs/LICOES.md #9.

### 4.21 Medir layout com DevTools sempre com Device Toolbar desligado

`window.innerWidth`/`innerHeight` medidos com o modo responsivo do
DevTools ativo (`Ctrl+Shift+M`) refletem o viewport **simulado**, não a
janela real do navegador — mesmo que os números pareçam consistentes
entre medições repetidas. Sempre confirmar que o Device Toolbar está
desligado antes de rodar qualquer medição de layout via Console.
Adicionalmente: não perseguir "zero overflow exato" numa única altura
de tela testada — criar margem de segurança (a section não precisa
caber com folga zero, só sem sobra grosseira que revele a section
vizinha). Ver docs/LICOES.md #10.

### 4.22 Conteúdo dinâmico de comprimento variável precisa de altura travada

Quando JS troca o texto de um elemento cujo tamanho depende do
conteúdo (ex: descrições de tamanhos diferentes vindas de JSON), medir
a maior variação possível via clone invisível e travar a altura via
`style.minHeight` — nunca deixar o layout empilhado (mobile) absorver
a variação, o que causa CLS visível a cada troca. Mesmo padrão de
medição de `scrollHeight` que `faq.js` já usa. Ver docs/LICOES.md #11.

### 4.23 `box-shadow` não serve para decorações com dimensões independentes

`box-shadow` com `spread` negativo só produz uma cópia uniformemente
escalada da forma original (largura e altura shrinkam juntas) — correto
para efeitos tipo "baralho empilhado" (diagonal, sutil), incorreto para
qualquer decoração que precise de largura e altura controladas
independentemente (ex: fatias laterais altas e estreitas). Nesses casos,
usar pseudo-elementos — e lembrar que pseudo-elementos são cortados por
`overflow: hidden` do próprio elemento, precisando morar no elemento
pai. Ver docs/LICOES.md #12.

### 4.24 Mensagens de commit multi-linha no PowerShell: usar here-string

`git commit -m "texto com \"aspas\" escapadas"` quebra no PowerShell
(erro `Invalid path`, reinterpretação incorreta do conteúdo escapado).
Usar here-string para mensagens multi-linha:

```powershell
@"
tipo(escopo): resumo

- detalhe 1
- detalhe 2
"@ | git commit -F -
```

Evitar aspas duplas internas na mensagem. Ver docs/LICOES.md #13.

### 4.26 Threshold de scroll-reveal fixo não serve para todo elemento

`reveal.js` usa `start: 'top 85%'` por padrão para `data-reveal`.
Elementos que nascem perto do fim físico de uma section (especialmente
sections com `min-height: 100svh` cuja altura real fica próxima da
altura da viewport) podem só cruzar esse threshold quase no fim do
scroll da section — dando a impressão de que a animação "não roda".
Usar `data-reveal-start="top 98%"` (ou outro valor mais tardio) nesses
casos, em vez de assumir que o padrão de 85% serve para qualquer
elemento de qualquer section. Ver docs/LICOES.md #16.

**Regra obrigatória (prevenção de Layout Shift no mobile):** CTAs ou
qualquer elemento posicionado no extremo inferior de seções longas
(ex.: `.portfolio__footer`) DEVEM usar `data-reveal-start="top 98%"`
explicitamente no HTML — nunca depender do threshold padrão do GSAP.
Gatilhos padrão nesses elementos disparam o recálculo de DOM no meio
do scroll, causando um solavanco de layout shift perceptível no
mobile. Esta não é uma correção pontual, mas uma regra arquitetural
obrigatória ao criar qualquer CTA/elemento final de section.

### 4.27 Pausa de auto-advance por hover/focus deve escopar à área de interação, não à section

Ao pausar um timer de auto-advance (carrossel, slideshow) via
`mouseenter`/`focusin`, nunca anexar os listeners na section inteira —
isso pausa o timer mesmo quando o cursor só está sobre texto/stats
sem nenhuma interação real com o componente. Escopar aos elementos que
são de fato a área de navegação (card, track, controles). Ver
docs/LICOES.md #15.

### 4.28 Overlays full-screen precisam de fallback síncrono independente de frameworks de animação

Qualquer componente que bloqueie a tela inteira (`position: fixed;
inset: 0`) DEVE possuir um fallback síncrono de segurança (`setTimeout`
vanilla) fora do ciclo de vida de frameworks de animação (GSAP, etc.),
para garantir a liberação da UI caso o script de animação falhe.
Adicionalmente: evitar `overflow: hidden` no `body` para travar scroll
durante o overlay se isso causar layout shift pelo sumiço da barra de
rolagem nativa — preferir `scrollbar-gutter: stable` no `body` como
baseline permanente, em vez de manipular `overflow` via JS. Ver
docs/LICOES.md #20.

---

## Histórico — armadilhas do fluxo antigo (Claude Chat + Claude Code)

> As três regras abaixo descreviam a coreografia entre duas ferramentas
> separadas (Claude Chat como "cérebro", Claude Code como "motor"). Esse
> fluxo foi aposentado — ver `CLAUDE.md` §13. Ficam registradas porque
> `docs/LICOES.md` #14 as referencia e porque explicam decisões passadas.
> **Não são regras ativas.**

### 4.12 Replicar convenção "por analogia" sem mostrar a fonte

Ao seguir o padrão de um arquivo existente (ex: estrutura de um JSON de conteúdo), mostrar o trecho real desse arquivo antes de aplicar o padrão a um arquivo novo. Não afirmar "seguindo a convenção de X" sem exibir o trecho de X que embasa a afirmação.

### 4.18 Prompt de encerramento é obrigatório antes de fechar qualquer sessão longa

Ao encerrar uma sessão de desenvolvimento (Claude Code ou Claude Chat), sempre
gerar o bloco CONTEXTO_TRANSICAO antes de fechar. Sem ele, o próximo chat
começa sem saber o porquê das decisões tomadas — só o "o quê", não o "como"
e o "por quê". O prompt de encerramento está em
`prompt-encerramento-sessao.md` (gerado na sessão de 03/07/2026).

### 4.25 Confirmação no Claude Chat não chega automaticamente ao Claude Code

São ferramentas/sessões separadas — "pode aplicar" dito no Claude Chat
não é visto pelo Claude Code. Toda aprovação precisa ser colada
manualmente na sessão do Claude Code antes de qualquer gravação. Ver
docs/LICOES.md #14.

