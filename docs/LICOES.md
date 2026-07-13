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

---

## #9 — Variante de botão compartilhada pode colidir com o background da section onde é reutilizada

**Contexto:** implementação dos 2 CTAs (`.sobre__cta-row`) da Section
Sobre, jul/2026. `.btn-pill--hero` foi criada para o Hero (fundo com
foto) e já era reutilizada com sucesso na FAQ (fundo light) — funcionando
bem nos dois contextos.

**Sintoma:** ao reutilizar a mesma classe `.btn-pill--hero` no CTA de
WhatsApp da Section Sobre, o botão "sumiu" visualmente. `.btn-pill--hero`
define `background: var(--color-deep-navy)`, e a Section Sobre usa
exatamente o mesmo token como fundo (`base.css:1466`) — botão e fundo
eram literalmente a mesma cor, sem nenhum contraste.

**Causa raiz:** nenhuma variante de componente reutilizável é "segura por
padrão" contra qualquer fundo. O contraste de `.btn-pill--hero` sempre
foi implícito ao contexto onde já era usada (foto no Hero, fundo light na
FAQ) — nunca foi testado contra um fundo **sólido da mesma paleta de cor**
do próprio botão.

**Correção aplicada:** em vez de alterar a definição global de
`.btn-pill--hero` (o que afetaria Hero e FAQ, os dois contextos onde já
funcionava), foi criado um override **escopado**
(`.sobre__cta-row .btn-pill--hero`, `base.css:1621-1624`) só para este
novo contexto — troca o background para `--color-deep-navy-2` (tom
levemente diferente) e adiciona uma borda 1px translúcida para reforçar
o contorno.

**Regra derivada:** CLAUDE.md §4.20.

**Status:** ✅ resolvido e validado no navegador, jul/2026.

---

## #10 — DevTools em modo responsivo (Device Toolbar) contamina medições de layout

**Contexto:** sessão de correção de viewport fitting da Section Portfólio,
jul/2026. Depois do primeiro ajuste de padding/margin, `window.innerHeight`
e a altura medida de `#portfolio` batiam exatamente iguais em repetidas
tentativas (854=854, depois 963=963) — sinal aparentemente positivo.

**Sintoma:** mesmo com as medições "batendo perfeito", o usuário reportou
vazamento visual da section vizinha (dark) por cima e por baixo da
Portfólio ao navegar normalmente no navegador — contradizendo os números
medidos.

**Causa raiz:** o DevTools estava em **modo responsivo forçado**
(Device Toolbar, `Ctrl+Shift+M`), fixando a página numa moldura simulada
de 1024×854px — independente do tamanho real da janela do navegador.
Toda a "régua" de medição usada em 6 rodadas de debug estava presa a
esse simulador, não à experiência real do usuário.

**Diagnóstico:** confirmado rodando `window.innerWidth` com o Device
Toolbar ainda ativo — retornou `320` (largura de celular), mesmo a
página aparentando estar em layout desktop na tela. Isso expôs a
contaminação.

**Correção aplicada:** desligar o Device Toolbar (`Ctrl+Shift+M`) antes
de qualquer medição de layout via Console. Reconhecido que perseguir
"zero overflow exato" numa única altura de tela é um alvo frágil — a
estratégia final adotada foi criar margem de segurança (a section não
precisa caber com folga zero, só sem sobra grosseira que revele a
section vizinha).

**Regra derivada:** CLAUDE.md §4.21.

**Status:** ✅ resolvido — viewport fitting validado com medição real
(janela desacoplada, sem Device Toolbar), jul/2026.

---

## #11 — Troca de conteúdo dinâmico com comprimento de texto variável causa CLS em layout empilhado

**Contexto:** implementação de `portfolio.js` (carrossel da Section
Portfólio), jul/2026. `.portfolio__desc` recebe texto diferente a cada
projeto, via `textContent`, sem altura fixa no CSS.

**Sintoma:** ao trocar de card no mobile, a altura total da section
mudava visivelmente — thumbnails, barra Explorar e CTA "pulavam" de
posição a cada troca, e em alguns casos revelava a section seguinte
(dark) por baixo do CTA.

**Causa raiz:** as 4 descrições de `projects.json` têm comprimentos de
texto diferentes, quebrando em números de linha diferentes. No layout
desktop (`.portfolio__split` em 2 colunas), essa variação era absorvida
porque o card featured domina a altura do bloco. No layout mobile
(1 coluna, empilhado), a altura de `.portfolio__desc` soma direto na
altura total da section — qualquer variação de linha desloca tudo
abaixo.

**Correção aplicada:** função `lockDescHeight()` em `portfolio.js`, que
mede a altura real de cada uma das 4 descrições via um clone invisível
(mesmo elemento, mesma largura, fora da tela) e trava
`.portfolio__desc` na maior altura encontrada, via `style.minHeight`.
Recalculada no resize (debounce de 200ms) porque a largura do elemento
muda entre breakpoints. Mesmo padrão de medição de `scrollHeight` que
`faq.js` já usa (ver LIÇÃO #2) — não foi técnica nova, foi replicação
de convenção já validada no projeto.

**Regra derivada:** CLAUDE.md §4.22.

**Status:** ✅ resolvido e validado no navegador, jul/2026.

---

## #12 — `box-shadow` com spread negativo não serve para "peek cards" independentes

**Contexto:** tentativa de criar um efeito decorativo de "cards ao lado"
no card featured mobile (sugerindo que há mais projetos pra navegar),
inspirado em referência visual (JCandy — carrossel de produtos com
fatias laterais visíveis dos itens adjacentes).

**Sintoma:** `box-shadow` com `spread` negativo e `offset` produziu um
efeito quase invisível — só um traço fino no canto do card, não as
fatias altas e visíveis da referência.

**Causa raiz:** `box-shadow` com `spread` negativo encolhe a forma
inteira de forma **uniforme** (largura e altura juntas, na mesma
proporção) antes de deslocar — é matematicamente incapaz de produzir
uma fatia alta e estreita (que precisa de controle independente de
largura vs. altura). É a ferramenta certa para um efeito "baralho
empilhado" (diagonal, sutil), não para fatias laterais literais.

**Correção proposta (não aplicada ainda ao fechar esta sessão):**
pseudo-elementos (`::before`/`::after`) no elemento pai
(`.portfolio__split`, não em `.portfolio__featured`, que tem
`overflow: hidden` e cortaria os pseudo-elementos) — dão controle
independente de largura/altura, permitindo fatias altas e estreitas
nas laterais. Ver docs/PENDENCIAS.md.

**Regra derivada:** CLAUDE.md §4.23.

**Status:** ✅ resolvido — mas não como projetado. A correção via
pseudo-elementos, mesmo aplicada, não conseguia entregar o efeito real
pretendido (pseudo-elemento não tem como renderizar conteúdo de outro
card). Revertida e substituída por carrossel real com scroll-snap
nativo (`.portfolio__track`, populado via JS) — ver docs/SECTIONS.md
§ Section 03. Lição adicional: ao aprovar uma correção "projetada" sem
protótipo visual, validar contra uma referência visual concreta antes
de implementar — o diagnóstico técnico (`box-shadow` não serve) estava
certo, mas o substituto proposto também não seria capaz de atingir o
objetivo, e isso só ficou claro quando o resultado renderizado foi
comparado à referência (JCandy) explicitamente.

---

## #13 — Mensagem de commit com aspas escapadas quebra em PowerShell

**Contexto:** commit da Fase A da task Portfólio, jul/2026. Mensagem de
commit multi-linha continha aspas duplas internas escapadas
(`\"texto\"`), formato válido em bash mas não em PowerShell.

**Sintoma:** `git commit -m "... \"Conheça todos os 100+ projetos\" ..."`
falhou com `fatal: Invalid path '/Conheça todos os 100+ projetos':
No such file or directory` — o PowerShell reinterpretou o conteúdo
escapado como se fosse um argumento de caminho separado.

**Causa raiz:** o parser de linha de comando do PowerShell trata aspas
escapadas (`\"`) de forma diferente do bash — o `git add` anterior já
havia rodado com sucesso (arquivos ficaram staged), só o `commit -m`
com aspas internas falhou.

**Correção aplicada:** usar here-string do PowerShell
(`@"..."@ | git commit -F -`) para mensagens de commit multi-linha,
evitando qualquer aspas duplas internas na mensagem (substituídas por
texto sem acentuação especial/aspas onde necessário).

**Regra derivada:** CLAUDE.md §4.24.

**Status:** ✅ resolvido — commits `4eaaf4e` e `90c259a` bem-sucedidos
com o método corrigido, jul/2026.

---

## #14 — Confirmação dada no Claude Chat não chega automaticamente ao Claude Code

**Contexto:** ao longo de toda a sessão de jul/2026 (Portfólio), diversos
momentos em que o usuário recebeu "pode aplicar" do Claude Chat e
presumiu que isso já autorizava o Claude Code a gravar.

**Sintoma:** em um caso concreto, o Claude Code ficou parado por várias
mensagens aguardando confirmação explícita que já havia sido dada no
Claude Chat — nenhuma edição foi perdida, mas gerou confusão sobre por
que o arquivo não refletia a mudança esperada (chegou a ser investigado
como possível bug de cache/servidor antes da causa real ser identificada).

**Causa raiz:** Claude Chat e Claude Code são sessões/ferramentas
completamente separadas — o Claude Code não tem acesso ao conteúdo da
conversa no Claude Chat. "Pode aplicar" dito num não é visto pelo outro.

**Correção aplicada:** todo "pode aplicar" do Claude Chat precisa ser
colado manualmente na sessão do Claude Code antes de qualquer gravação.

**Regra derivada:** CLAUDE.md §4.25.

**Status:** ✅ identificado e corrigido no fluxo de trabalho, jul/2026.

---

## #15 — Escopo de pausa em auto-advance deve ser a área de interação, não a section inteira

**Contexto:** carrossel da Section Portfólio (`portfolio.js`) pausa o
timer de auto-advance (5s) no `mouseenter`/`focusin`, para não trocar
de conteúdo enquanto o usuário interage — boa prática de acessibilidade
(WCAG 2.2.2).

**Sintoma:** primeira troca de card demorando ~15s em vez dos 5s
configurados; trocas seguintes normais.

**Causa raiz:** os listeners de `mouseenter`/`focusin` estavam
anexados na `section` inteira (`#portfolio`), não só na área do
carrossel. Se o cursor do mouse já está posicionado sobre qualquer
parte da section (título, stats, thumbnails) no momento em que ela
entra na viewport pelo scroll, o navegador dispara `mouseenter`
imediatamente — pausando o timer sem nenhuma interação real com o
carrossel. O timer só recomeça quando o mouse sai da section inteira.

**Correção aplicada:** restringir os listeners de pausa a um array de
"zonas de pausa" — só os elementos que são de fato a área de
navegação do carrossel (`.portfolio__featured`, `.portfolio__track`,
`.portfolio__thumbs-wrapper`), não a section como um todo.

**Regra derivada:** ao implementar pausa de auto-advance por
hover/focus, escopar os listeners à área de interação real do
componente, nunca ao container de section inteiro — mesmo que pareça
mais simples anexar num único elemento pai.

**Status:** ✅ resolvido.

---

## #16 — Threshold fixo de scroll-reveal falha em elementos que nascem perto do fim físico da section

**Contexto:** `.portfolio__footer` (CTA final da Section Portfólio)
usa `data-reveal`, mesmo padrão de fade-up no scroll das outras
sections — mas a animação parecia "já carregada" ao chegar na section.

**Sintoma:** o fade-up só disparava quando a próxima section (dark,
abaixo) já estava visivelmente entrando por baixo da tela — muito mais
tarde do que o esperado.

**Causa raiz:** `reveal.js` usa um threshold fixo (`start: 'top 85%'`)
para todos os elementos com `data-reveal`. A Section Portfólio usa
`min-height: 100svh`, e sua altura real medida (~968px) é quase
idêntica à altura da viewport (~965px) — ou seja, a section mal
ultrapassa 1 tela de altura. Como `.portfolio__footer` é o último
elemento, seu topo nasce a ~92% da altura da section (medição real:
891.7px de 965px de viewport) — bem depois do threshold de 85%, que só
é cruzado quando o usuário já rolou quase a section inteira.

**Correção aplicada:** `reveal.js` passou a aceitar um atributo
opcional `data-reveal-start`, sobrescrevendo o padrão `'top 85%'` por
elemento, sem afetar nenhum elemento que não usa o atributo.
`.portfolio__footer` usa `data-reveal-start="top 98%"`.

**Regra derivada:** CLAUDE.md §4.26.

**Status:** ✅ resolvido.

---

## #17 — Duplicação manual de HTML em loops infinitos é fonte de bugs difíceis de rastrear (RESOLVIDO)

**Contexto:** faixa de logos da Section Clientes (`.clients__track`) usa
a técnica clássica de marquee infinito: duplicar o conteúdo e animar
via `transform`, criando a ilusão de loop contínuo.

**Sintoma original:** ao completar uma volta, a animação travava por
1-2s (espaço vazio, depois duas logos aparecendo juntas) sempre no
mesmo ponto do ciclo — inicialmente perto da logo Yamana Gold.

**Causa raiz real (confirmada matematicamente):** a faixa duplicava o
conteúdo apenas **1x** (2 conjuntos de 12 logos = 24 itens no total).
Mas a largura de 1 conjunto de 12 logos (~1664.6px, medida real do
projeto) é **menor** que a largura visível do `.clients__track-wrapper`
em telas largas (~1905px, medida real). Isso cria um vão sem conteúdo
sempre no mesmo ponto do ciclo, pouco antes do wrap da posição — dois
conjuntos nunca foram suficientes para cobrir a tela continuamente.
Fórmula: são necessárias pelo menos `ceil(1 + larguraWrapper /
larguraDeUmConjunto)` cópias do conteúdo original para nunca haver vão,
não um número fixo.

**Por que o sintoma parecia "sempre a Yamana Gold":** ela era,
originalmente, a última logo da lista — ou seja, a última coisa visível
antes do vão aparecer. O sintoma sempre foi sobre a **posição** (a
fronteira entre o fim do conteúdo original e o início do conteúdo
duplicado), nunca sobre o arquivo daquela logo específica. Confirmado
por teste de eliminação: mover a Yamana Gold para a primeira posição
não fez o bug segui-la — o bug permaneceu na nova última posição
(depois da Tenda), provando que era posicional, não relacionado ao
conteúdo.

**Hipóteses testadas e descartadas com dados reais, em ordem
cronológica** (nenhuma delas era a causa, mas todas eram investigações
legítimas e algumas revelaram problemas reais separados):

1. `loading="lazy"` nas imagens duplicadas nunca disparava fetch,
   porque essas imagens só "entram na tela" via `transform`, não por
   posição real de layout. Corrigido para `eager` — problema real,
   mas não a causa do stutter recorrente. (Regrediu uma vez ao portar
   a técnica de fade do projeto antigo, corrigido de novo.)
2. 11 de 12 SVGs de logos eram raster (PNG em base64) disfarçado de
   vetor — revetorizados no Inkscape. Problema real (qualidade visual),
   não a causa do stutter.
3. Duplicação via HTML manual → trocada por clonagem JS
   (`cloneNode`) — elimina risco de assimetria entre metades, mas não
   era a causa do stutter.
4. `display: contents` no wrapper de duplicação — removido por
   suporte inconsistente entre navegadores, não era a causa.
5. Mismatch `width`/`height` HTML vs. proporção real do SVG — real e
   mensurado, causa CLS real na primeira carga, mas não o stutter
   recorrente.
6. Complexidade geométrica do path SVG da Yamana Gold (hipótese de
   custo de rasterização) — descartada: revetorização mais simples
   (sem Suavizar/Empilhar) não mudou o stutter. Também revelou
   regressão visual (o "V" do logo ficava quase invisível sem
   Suavizar+Empilhar — a combinação correta preserva o V e não afeta
   o stutter).
7. Unidade `mm` no `width`/`height` do SVG exportado (vs. sem unidade
   nas outras 11 logos) — corrigida, não era a causa.
8. Custo de decode assíncrono (`decoding="async"` vs `"sync"`) —
   trocado para `sync`, não era a causa.
9. Vídeo do Hero disputando recursos de GPU com o marquee — testado
   comentando o vídeo (após corrigir o teste, que inicialmente não
   refletiu no ambiente de produção por engano de cache de build), não
   era a causa.
10. Dev server (Vite HMR/overhead) vs. produção — bug reproduzia
    identico em produção (`npm run build && npm run preview`),
    eliminando essa variável.
11. Filtro `filter: brightness(0) invert(1)` custoso em ~24 elementos
    animados continuamente — desativado ao vivo via DevTools, bug
    persistiu. Não era a causa.
12. `mask-image`/`-webkit-mask-image` no fade das bordas — combinação
    historicamente instável com elementos em composição contínua.
    Comentado, bug persistiu. Não era a causa (mas foi substituído por
    divs de fade + `rgba()` interpolando só alpha como parte da
    migração para a técnica do projeto antigo, que se mostrou mais
    limpa de qualquer forma).
13. Arquitetura de lista única com clones intercalados → duas faixas
    CSS independentes → duas faixas com motor de movimento em JS/rAF
    sincronizado → uma única faixa com motor JS/rAF. Nenhuma mudança de
    arquitetura de movimento resolveu, porque a causa nunca esteve em
    _como_ mover, sempre em _quantas cópias_ existiam.
14. Divergência de largura entre duas faixas clonadas — medido ao
    vivo por 75s, diferença de 0.000px. Não era a causa.
15. Espaçamento (`margin-right`) diferente na costura entre faixas vs.
    espaçamento normal entre logos — medido, 56.000px em ambos os
    casos, diferença de 0.000px. Não era a causa.
16. Pressão de memória de GPU / tile eviction (repaint completo de
    camada) — testado com Paint Flashing + Layer Borders do DevTools,
    nenhum repaint visível no momento do bug. `chrome://gpu` sem sinais
    de limitação de hardware. Não era a causa.
17. Defasagem de sincronização entre o nascimento da faixa original
    (presente no HTML estático) e a faixa clonada via JS — corrigido
    via `animation-play-state: paused` + classe `.is-playing` aplicada
    a ambas no mesmo frame. Resolveu um problema real de sincronização,
    mas não era a causa do stutter recorrente (bug persistiu).

**Método de diagnóstico usado:** eliminação sistemática com medição
real a cada etapa, incluindo instrumentação JS customizada (samplers de
`requestAnimationFrame`, medição de `getBoundingClientRect()` em
intervalos, comparação de largura entre elementos) quando as
ferramentas nativas do DevTools não eram suficientes. O teste decisivo
final — reposicionar a Yamana Gold na lista para separar "é essa logo"
de "é a posição" — foi cogitado várias vezes ao longo da investigação
antes de finalmente ser executado, e foi o que redirecionou a
investigação para a causa real.

**Correção definitiva:** `src/scripts/modules/clients.js` agora calcula
dinamicamente quantos conjuntos de 12 logos são necessários para cobrir
a largura do `.clients__track-wrapper` (fórmula: `ceil(1 +
larguraWrapper / larguraDeUmConjunto)`, mais 1 conjunto de margem de
segurança) e clona esse número de vezes, em vez de sempre clonar
exatamente 1x. O motor de movimento continua em JS/`requestAnimationFrame`
com uma única variável de posição aplicada a uma única `.clients__track`
(arquitetura de lista única, não duas faixas separadas).

**Efeito visual (`.clients__logo`):** o projeto usa
`filter: brightness(0) invert(1)` + `opacity: 0.55` (não `grayscale`),
que uniformiza todas as logos para o mesmo tom, em vez de preservar o
tom relativo de cada uma. Registrado aqui porque essa diferença já
causou confusão durante ajustes visuais pós-correção.

**Status:** ✅ resolvido e validado visualmente. Branch
`feature/clients-marquee`, pendente de commit e merge em `main`.

---

## #18 — Opacidade travada no Hero até o primeiro scroll: dois bugs sobrepostos

**Contexto:** ao padronizar as tags de identificação das sections
(Hero, Serviços, Sobre) para o padrão pill do Portfólio, notou-se que
`.hero__label` — e depois todo o bloco acima da dobra do Hero (h1,
descrição, CTA) — renderizava com opacidade zero no carregamento
inicial, só aparecendo após o primeiro scroll do usuário.

**Sintoma:** conteúdo do Hero (label, título, descrição, CTA)
invisível no frame zero; aparecia normalmente assim que o usuário
rolava a página uma vez.

**Dois mecanismos distintos estavam envolvidos, descobertos em
ordem:**

1. **GSAP ScrollTrigger em elementos acima da dobra (causa
   confirmada por leitura de código):** `reveal.js` aplica
   `gsap.from(el, { opacity: 0, scrollTrigger: { start: 'top 85%',
   once: true } })` a todo elemento com `data-reveal`. Para
   elementos já visíveis no primeiro fold, o estado inicial
   `opacity: 0` é aplicado de forma síncrona no load, e só é
   corrigido quando o ScrollTrigger recalcula as posições — recálculo
   que pode ficar defasado até um scroll/resize real. Correção:
   removido `data-reveal`/`data-reveal-delay` de `.hero__label`,
   `.hero__title`, `.hero__desc` e do CTA `.btn-pill--hero` — os
   quatro elementos da primeira dobra não devem ter gatilho de
   scroll.
2. **Bug de GPU compositing com vídeo de fundo acelerado por
   hardware (diagnosticado via teste prático no navegador — vídeo
   ligado vs. desligado isolava o bug):** mesmo sem `data-reveal`, a
   camada `.hero__overlay` ainda aparecia clara demais sobre o vídeo
   no frame zero, corrigindo sozinha após o primeiro repaint forçado
   por scroll.

**Hipóteses testadas e descartadas antes da correção final:**

1. `transform: translateZ(0)` em `.hero__label` — não resolveu;
   a label não é o elemento que fica empilhado diretamente sobre o
   vídeo, então promovê-la a uma layer própria não tinha efeito sobre
   a composição real do bug.
2. `transform: translateZ(0)` em `.hero__overlay` — tecnicamente
   mais bem direcionado (é o elemento com `position: absolute;
   z-index: 1` diretamente sobre o `<video>`), mas também não
   resolveu.

**Causa raiz e correção final:** `opacity: 0.99` aplicado diretamente
em `.hero__video` força a criação de um stacking context confiável
para o elemento de vídeo, contornando o atraso de composição da GPU.
Combinado com a remoção do `data-reveal` da primeira dobra (mecanismo
#1 acima), o bloco inteiro do Hero passou a renderizar corretamente
no frame zero.

**Nota de proveniência:** a causa do bug de GPU compositing (mecanismo
#2) foi diagnosticada via testes práticos no navegador conduzidos fora
desta sessão de Claude Code (fluxo Cérebro + Motor, CLAUDE.md §13) —
relatada aqui como reportada, não medida diretamente por este agente.
O mecanismo #1 (ScrollTrigger) foi confirmado por leitura direta de
`reveal.js`.

**Regra derivada:** reforça CLAUDE.md §4.15 — múltiplas hipóteses de
`translateZ(0)` foram tentadas em elementos diferentes antes de
isolar o elemento correto (`.hero__video`) via teste prático de
isolamento (vídeo ligado/desligado).

**Status:** ✅ resolvido e validado visualmente pelo usuário.

---

## #19 — `window.scrollTo({ behavior: 'smooth' })` nativo não permite controlar duração

**Contexto:** implementação do botão Back-to-Top. O comportamento
desejado era uma rolagem lenta e "cinemática" até o topo, não o scroll
rápido padrão do navegador.

**Causa raiz:** a Web API nativa `window.scrollTo({ top: 0, behavior:
'smooth' })` usa uma curva de easing e duração fixas, definidas pelo
navegador — não expõe nenhum parâmetro de duração. Não dá para tornar
esse scroll nativo mais lento/"premium" sem trocar de mecanismo.

**Correção aplicada:** como o projeto já usa Lenis para smooth scroll
sincronizado com GSAP ScrollTrigger (`smooth-scroll.js`), o botão
reaproveita a instância via `getLenis()` e chama
`lenis.scrollTo(0, { duration: 2.5 })`, que aceita duração explícita
em segundos. O `window.scrollTo` nativo continua como fallback só
para quando o Lenis não está ativo (`prefers-reduced-motion`), caso
em que a duração não é relevante — o scroll cai para instantâneo
(`behavior: 'auto'`).

**Regra derivada:** ao precisar de scroll programático com controle
fino de duração/easing neste projeto, usar `getLenis()` de
`smooth-scroll.js` em vez de `window.scrollTo` nativo — reforça a
armadilha §4.5 do CLAUDE.md (Lenis precisa ser a fonte única de
verdade do scroll quando está ativo, para não haver dois mecanismos
de scroll competindo).

**Status:** ✅ resolvido. Botão Back-to-Top mergeado em produção.
