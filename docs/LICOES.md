# LICOES.md — Histórico de bugs e diagnósticos

> Registro de incidentes resolvidos, lições de sessões anteriores e
> diagnósticos pontuais. Serve de memória para não repetir os mesmos erros.
>
> As **regras derivadas** de cada incidente estão em CLAUDE.md §4.
> Aqui fica só a narrativa: o que aconteceu, por que, como foi resolvido.

---

## #1 — Import path errado no scaffold (resolvido)

**Contexto:** primeira execução do `npm run dev` após o scaffold inicial.

**Sintoma:**
```
[plugin:vite:import-analysis] Failed to resolve import
"./styles/main.css" from "src/scripts/main.js"
```

**Causa raiz:** `main.js` vive em `src/scripts/`. O import
`"./styles/main.css"` resolve para `src/scripts/styles/main.css` —
caminho inexistente. O correto era `"../styles/main.css"` (subir um nível).

**Correção aplicada:** troca de `./styles/main.css` por `../styles/main.css`
em `src/scripts/main.js`. Servidor subiu sem erros.

**Status:** ✅ resolvido na primeira sessão de desenvolvimento.

---

## #2 — Acordeão FAQ: `grid-template-rows: 0fr` não colapsa para zero

**Contexto:** implementação da animação de abertura/fechamento dos cards
do acordeão na Section FAQ.

**Sintoma:** cards do acordeão não fechavam completamente. O computed
`height` resultava em 16px mesmo com o item "fechado" — o `padding-bottom`
do `<p>` filho sobrevivia ao colapso.

**Causa raiz:** `grid-template-rows: 0fr` impõe altura mínima residual no
filho de grid em Chrome. A propriedade não garante colapso total quando há
padding no elemento filho direto.

**Correção aplicada:** abandonou-se a abordagem de grid. Padrão adotado:
- CSS estático (fechado): `max-height: 0; overflow: hidden`
- JS (aberto): mede `scrollHeight` real e aplica `element.style.maxHeight = scrollHeight + 'px'`
- `transition: max-height` no CSS cuida da animação; JS só fornece o valor correto

Nunca usar valor fixo chutado para `max-height` — o `scrollHeight` real
evita corte de conteúdo se o texto mudar.

**Regra derivada:** CLAUDE.md §4.14.

**Status:** ✅ resolvido. FAQ funcional com acordeão `max-height + scrollHeight`.

---

## #3 — Campo de estado com valor não verificado (`_meta` / booleano aspiracional)

**Contexto:** criação de arquivo JSON de conteúdo (provável `projects.json`
ou `faq.json`) durante sessão de implementação.

**Sintoma:** campo com semântica de estado (ex: `"validado": true`,
`"placeholder": false` ou campo `_meta` equivalente) foi inicializado com
valor aspiracional — afirmando um estado que ainda não havia ocorrido
(ex: conteúdo marcado como "validado" antes de qualquer validação real).

**Causa raiz:** IA copiou campo de um template ou inferiu o valor "correto"
por analogia com outros registros, sem verificar o estado real no momento
da criação.

**Correção aplicada:** campos de estado devem ser inicializados com o valor
**atual real** — se o conteúdo ainda não foi validado, o valor deve ser
`false` / `"placeholder"` / ausente, não o valor desejado futuro.

**Regra derivada:** CLAUDE.md §4.13.
**Regra relacionada:** CLAUDE.md §4.12 (nunca afirmar "seguindo a convenção
de X" sem mostrar o trecho de X que embasa a afirmação).

**Status:** ✅ resolvido. Arquivos JSON do projeto não contêm campos de
estado com valor inventado.

---

## #4 — Bug de filename com sufixo `_1x` em `projects.json`

**Contexto:** discrepância entre o campo `"image"` em
`src/content/projects.json` e o atributo `src` do thumbnail correspondente
em `index.html`, para o projeto `"rede-hidrometrica"`.

**Sintoma:** `projects.json` usava `instalacao-rede-hidrometrica-ana-aneel.webp`
enquanto `index.html` usava `instalacao-rede-hidrometrica-ana-aneel_1x.webp`
(sufixo `_1x` divergente). Potencial 404 em runtime dependendo de qual
arquivo existia fisicamente.

**Causa raiz:** o thumbnail foi referenciado com sufixo de resolução
(`_1x`) em um arquivo enquanto o outro usava o nome base. Um dos dois
foi editado sem atualizar o par.

**Correção aplicada:** ambos os arquivos agora usam o nome base sem sufixo:
`instalacao-rede-hidrometrica-ana-aneel.webp`. Verificado: `projects.json`
linha 35 e `index.html` linha 527 estão em sincronia.

**Status:** ✅ resolvido (confirmado por leitura direta dos arquivos em
Jun/2026).

---

## #5 — Diagnóstico de performance (snapshot de dev — desatualizado)

Medição realizada em dev local durante o desenvolvimento da Home, antes
das sections FAQ e Footer estarem prontas. Números descartados por não
representarem o estado atual nem o comportamento em produção.

**Principal achado registrado:** `section#servicos` respondia por ~88% do
CLS total. Causa provável: fontes IBM Plex sem fallback de métricas corretas
causando layout shift ao carregar.

**Ação antes do launch:** rodar Lighthouse em build de produção
(`npm run build && npm run preview`), em aba anônima, sem extensões.
Priorizar Section Serviços na análise de CLS.

---

## #6 — Overwrite acidental de base.css via popup do VS Code (resolvido)

**Contexto:** sessão de desenvolvimento de 28/06/2026. `base.css` estava
aberto no VS Code com o Vite em modo `npm run dev` rodando em paralelo.

**Sintoma:** ao tentar salvar com Ctrl+S, apareceu o popup do VS Code:
"The file 'base.css' has been changed on disk. Do you want to reload it?"
O usuário clicou no segundo botão (Overwrite) sem ter certeza da ação.
Resultado: o buffer do editor — que estava numa versão anterior ao commit
`042b04d` (antes do `.btn-pill::before`, o círculo expansor) — sobrescreveu
o arquivo no disco. O arquivo ficou com 712 linhas (de 2059), perdendo
todos os estilos a partir da Section Portfólio: `.btn-pill::before`,
Header dinâmico, Portfólio, Sobre, FAQ e Footer ficaram sem CSS.

**Causa raiz:** o Vite HMR tocou em `base.css` enquanto o editor tinha
o arquivo aberto com um buffer desatualizado (versão anterior ao commit
mais recente). Isso gerou dessincronização entre buffer do editor e
arquivo em disco. O popup do VS Code perguntou qual versão deveria vencer
— o usuário escolheu o buffer antigo (Overwrite), que era mais curto,
truncando o arquivo no disco.

**Correção aplicada:**
1. `git restore src/styles/base.css` — restaurou a versão íntegra do HEAD
   (`ee5dd50`, 2059 linhas) em menos de 1 segundo.
2. Reaplicação manual das 3 linhas de hover que não estavam commitadas:
   `.btn-pill--dark:hover .portfolio__cta-accent { color: var(--color-deep-navy); }`
3. Commit `9dc40cb` registrou o fix do hover.

**Causa raiz da dessincronização:** ainda não totalmente confirmada.
Suspeita: extensão de formatter com "format on save" competindo com o
processo do Vite. Investigar antes de editar arquivos CSS grandes
novamente (ver docs/PENDENCIAS.md).

**Regra derivada:** antes de responder a qualquer popup de "arquivo
modificado no disco" durante desenvolvimento, pausar o Vite (`Ctrl+C`
no terminal de dev) para eliminar a fonte de modificações externas,
verificar qual versão é mais atual via `git diff`, e só então decidir.
Em caso de dúvida: fechar o VS Code sem salvar e checar via `git status`
antes de reabrir.

**Status:** ✅ resolvido. base.css restaurado e fix de hover commitado
em 28/06/2026.

---

## #7 — ScrollTrigger sem `end` cria janela de ativação com duração zero

**Contexto:** sessão de correção do header (contraste em sections dark),
jul/2026. O trigger de `.is-scrolled` em `header.js` usava `onToggle`
para adicionar/remover a classe, baseado em `start: 'bottom top'` do
`.hero`, sem `end` definido.

**Sintoma:** o header nunca ganhava contraste (fundo/blur) em nenhuma
section além do Hero — Serviços, Sobre ficavam com o nav sem fundo,
texto flutuando ilegível sobre o conteúdo.

**Causa raiz:** sem `end`, o GSAP calcula um valor padrão que, neste
caso, coincidia com o próprio `start` — criando uma janela de ativação
de duração efetivamente zero. `self.isActive` virava `true` e `false`
quase no mesmo instante, então a classe era adicionada e removida tão
rápido que nunca "grudava" visualmente.

**Diagnóstico:** três hipóteses de leitura estática foram descartadas
com evidência antes de chegar na causa real (Tailwind sobrescrevendo,
ordem de init errada, sync Lenis↔ScrollTrigger incorreto) — todas
descartadas por leitura de código e/ou documentação oficial das libs.
A causa real só foi confirmada medindo o estado real no DevTools
(aba Elements, observando a lista de classes do `<header>` em tempo
real durante o scroll) — a classe `is-scrolled` nunca aparecia fora do
ponto exato de transição do Hero.

**Correção aplicada:** adicionado `end: 'max'` ao `ScrollTrigger.create()`,
estendendo a janela ativa até o fim da página.

**Regra derivada:** ao criar um `ScrollTrigger` com `onToggle` que deve
manter um estado persistente (não só um pulso pontual), sempre definir
`end` explicitamente — nunca confiar no valor padrão quando o objetivo
é "ativo a partir daqui até o fim do scroll".

**Status:** ✅ resolvido e validado no navegador, jul/2026.

---

## #8 — `backdrop-filter` no pai quebra `position: fixed` de filhos aninhados

**Contexto:** implementação do menu mobile (painel lateral `#mobile-nav`
e overlay `.mobile-nav-overlay`), jul/2026. Ambos eram filhos diretos de
`<header class="site-header">`.

**Sintoma:** ao abrir o menu mobile no Hero (antes de rolar), tudo
funcionava normalmente. Ao abrir o mesmo menu depois de rolar para
Serviços/Sobre (ou sobre Portfólio/FAQ), o painel aparecia visualmente
quebrado — conteúdo da página vazando através dos links, como se o
painel não tivesse fundo sólido.

**Causa raiz:** `.site-header.is-scrolled` e `.site-header.is-light`
aplicam `backdrop-filter: blur(12px)` no `<header>`. Por especificação
CSS, um elemento com `backdrop-filter` (assim como `filter`, `transform`,
`perspective`, `will-change`, entre outros) se torna o "containing block"
de qualquer descendente `position: fixed` — não é um bug de navegador,
é comportamento documentado da spec. Como `#mobile-nav` é
`position: fixed` com `top:0; right:0; bottom:0`, esses valores passaram
a ser calculados relativos ao `<header>` (que tem só ~4rem de altura)
em vez da viewport inteira. O painel encolhia para essa faixa pequena,
mas o conteúdo interno continuava transbordando visualmente sem fundo
pintado atrás.

**Por que só acontecia depois de rolar:** no Hero, antes de `.is-scrolled`
ativar, o header não tem `backdrop-filter` — não havia "containing block"
alternativo, então `#mobile-nav` se posicionava normalmente relativo à
viewport. O bug só se manifestava quando o header ganhava blur.

**Correção aplicada:** `#mobile-nav` e `.mobile-nav-overlay` foram
movidos para fora de `<header>`, tornando-se irmãos dele no DOM (ainda
no mesmo arquivo `header.html`, já que o sistema de `<include>` faz
substituição literal de texto — tudo após `</header>` no partial sai
como irmão do `<header>` no HTML final). O JS (`mobile-nav.js`) não
precisou de nenhuma alteração, pois já selecionava os elementos via
`document.querySelector`, independente de posição no DOM.

**Regra derivada:** qualquer elemento `position: fixed` (overlays,
modais, painéis, tooltips) deve ser posicionado como irmão de nível
alto no DOM (próximo do `<body>`), nunca aninhado dentro de um elemento
que tenha ou possa vir a ter `backdrop-filter`, `filter`, `transform`
ou `will-change` aplicados dinamicamente. Verificar isso ANTES de
implementar qualquer novo painel/modal neste projeto, dado que o header
já usa `backdrop-filter` extensivamente.

**Status:** ✅ resolvido e validado no navegador, jul/2026.
