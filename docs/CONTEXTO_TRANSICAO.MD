# CONTEXTO_TRANSICAO — FJ Ambiental — jul/2026 (sessão 2)

## ESTADO ATUAL

**Branch ativa:** `main`, sincronizada com `origin/main` (commit `206e021`), working tree limpo. `feature/sobre-map-counters` foi mergeada (`--no-ff`, preservando os 4 commits da feature no histórico) e deletada local + remota.

**O que foi concluído nesta sessão, e como:**

1. **Section Sobre — mapa real do Brasil.**
   - Substituído o blob placeholder (`viewBox 460x530`, sem geografia real) pelo mapa real do simplemaps.com/svg/country/br (uso livre comercial/pessoal), 27 `<path>` de estado com `id` preservado (ex: `id="BRBA"`).
   - O arquivo original tinha 259KB (muito acima do orçamento de performance do CLAUDE.md) — simplificado via Douglas-Peucker (script próprio, não `mapshaper` puro, porque este último descartava os `id` no roundtrip SVG) para 19.6KB, preservando fidelidade visual na escala de exibição (`max-width: 460px`).
   - Estados atendidos (BA/TO/PE/MG) não usam mais dots/pins/labels soltos — são pintados diretamente via JS (`fill` + `fillOpacity`) no próprio path do estado. Bahia (sede) sólida (`fillOpacity: 1`), os outros 3 translúcidos (`fillOpacity: 0.4`), mesma cor `--color-fj-green-vivid`.
   - CSS estático (`.sobre__map-shape`) define só o estado neutro dos demais estados: `fill: --color-border-inverse`, `stroke: --color-deep-navy` (dois tokens diferentes) — a cor final dos 4 estados atendidos vem inteiramente do JS, sobrescrevendo esse fill neutro.
   - Callout UNESCO/México: só texto (2 `<text>`), sem linha tracejada.

2. **`sobre.js` — timeline única sincronizada.**
   - Uma única timeline GSAP com um único `ScrollTrigger` (`start: 'top 65%', once: true`) — contadores (100+, 15+, 04), preenchimento dos 4 estados, e reveal do callout UNESCO disparam todos no mesmo ponto de scroll, com offsets internos (`0`, `0.15`, `0.3`, `0.7`) para dar ritmo.
   - `prefers-reduced-motion` tratado diretamente no JS (aplica estado final sem animação), não mais via regra CSS estática.

3. **2 CTAs novos na Section Sobre (`.sobre__cta-row`).**
   - WhatsApp: reaproveita `.btn-pill--hero` (mesma classe da FAQ), aponta para `wa.me/5571XXXXXXXXX` (placeholder).
   - Formulário ("Solicitar Proposta"): reaproveita `.btn-pill` base (mesma classe do Footer), aponta para `/contato.html`.
   - **Bug descoberto e corrigido:** `.btn-pill--hero` usa `background: var(--color-deep-navy)` — mesmo token do fundo da própria Section Sobre. Primeira vez que essa variante aparece sobre fundo sólido escuro (Hero tem foto, FAQ é light) — o botão "sumia" visualmente. Corrigido com override **escopado** (`.sobre__cta-row .btn-pill--hero`), sem tocar na definição global. Promovido a docs/LICOES.md #9 e CLAUDE.md §4.20.
   - Diferença de altura entre as 2 variantes (52px vs 56px, padding de fábrica diferente) corrigida via override escopado no botão light, mesmo contexto.

4. **Faixa de clientes substituída por faixa institucional.**
   - Os 7 logos de clientes foram substituídos por 5 itens de texto, validados contra o site oficial (fjambiental.com.br): `OUTORGA SUPERFICIAL E SUBTERRÂNEA`, `PESSOA FÍSICA E JURÍDICA`, `CONFORMIDADE ANA/ANEEL`, `+50 CLIENTES ATENDIDOS`, `ATUAÇÃO EM 4 ESTADOS`.
   - Resolve na prática a dúvida antiga (sessão 1) sobre a faixa da Sobre duplicar a Section Clientes — não são mais logos, a pergunta deixa de se aplicar. **Removida do PENDENCIAS.md.**

5. **Ajuste de viewport.**
   - A section cresceu além de uma tela depois dos CTAs novos. Corrigido reduzindo paddings/margins de `.sobre__container`, `.sobre__header`, `.sobre__body`, `.sobre__stat` e `.sobre__cta-row`. Validado no navegador: faixa institucional visível sem scroll adicional.

6. **Documentação e fechamento — dois desvios nesta sessão, ambos corrigidos.**
   - Durante a atualização de `docs/SECTIONS.md`, o Claude Code cometeu um erro factual real (não truncamento): descreveu `fill` e `stroke` de `.sobre__map-shape` como se usassem o mesmo token de cor, quando na verdade são dois tokens diferentes. Identificado antes do commit, corrigido via pedido pontual — reforça que documentação também precisa de revisão contra o código real, não só código em si (CLAUDE.md §4.12/§4.13).
   - No primeiro commit de fechamento, o merge para `main` foi **planejado mas não executado** — o commit ficou preso em `feature/sobre-map-counters` local, e o `git push origin main` reportou "Everything up-to-date" porque a `main` local não tinha as mudanças. Diagnosticado e corrigido: push da feature branch primeiro, depois merge de verdade. Também escaparam 2 arquivos de diff temporários (`diff-docs-fechamento.txt`, `diff-sections-fix.txt`, gerados durante a própria revisão de documentação) que entraram no commit por engano — corrigido com `git rm` + `git commit --amend` antes do push.

**Fluxo de trabalho desta sessão:** mesmo ciclo Claude Chat + Claude Code + usuário. Confirmação prática e repetida de que **arquivos grandes (SVG com 27 paths, diffs longos) truncam de forma consistente quando reimpressos no terminal** — o método que funcionou sem falha em toda a sessão foi sempre gravar em arquivo e fazer upload direto no chat, nunca copiar/colar output de `cat`/`git diff` impresso no terminal. Isso deixou de ser só uma lição transitória (como estava registrado na sessão 1) e virou prática obrigatória sempre que o conteúdo for grande.

---

## PENDÊNCIAS CONHECIDAS (herdadas da sessão 1 + atualizações desta sessão)

- **Número de WhatsApp placeholder** (`5571XXXXXXXXX`) — agora usado em **2 lugares** (FAQ e Sobre). Ao trocar pelo número real, checar os dois.
- **URLs das redes sociais no Footer** (`href="#"`) — inalterado.
- **Telefone do Footer** (`(71) 3000-0000`) — inalterado.
- **Tagline do Footer** — inalterado.
- **Focus trap no menu mobile** — inalterado, ainda pendente.
- **Tags de section ainda não padronizadas**: Hero, Serviços, e **Sobre ("04 — SOBRE")** continuam fora do padrão `.label` (pill translúcida + dot). Não foi tocado nesta sessão.
- **CLS da Section Serviços** — inalterado.
- **Contraste do Footer** — inalterado.
- **`services.json`** — inalterado.
- **`portfolio.js`** — inalterado.
- ~~**Sobre — decisão de duplicação com Section Clientes**~~ — **resolvida nesta sessão** (faixa deixou de ser logos, pergunta não se aplica mais).
- ~~**Sobre — mapa SVG provisório**~~ — **resolvida nesta sessão** (mapa real do simplemaps.com aplicado).
- **`/contato.html`** ainda não existe — agora referenciado também pelo CTA "Solicitar Proposta" da Sobre (WhatsApp usa link externo `wa.me`, não essa página).

---

## PRÓXIMA TAREFA PRINCIPAL

**Reordenação decidida ao final desta sessão:** a fila original de PENDENCIAS.md § "Ajustes de UI" (definida na sessão 1) tinha Hero como próximo item. O usuário decidiu adiantar a **Section Portfólio** antes do Hero — mesmo padrão da sessão 2, que adiantou a Sobre fora de ordem. Hero permanece na fila, só reordenado para depois do Portfólio.

**Portfólio — finalização de UI + `portfolio.js`.** Escopo ainda não detalhado nesta sessão — o usuário sinalizou que vai detalhar no próximo chat. O que já se sabe do estado atual (via SECTIONS.md § Section 03, sessão 1):

- Hoje é UI estática: 4 thumbnails hard-coded, sem troca de case dinâmica.
- `portfolio.js` **não existe** — precisa ser criado do zero (não é módulo já existente aguardando conexão, como foi o caso do `sobre.js`).
- `src/content/projects.json` já existe (mencionado em LICOES.md #4, bug do sufixo `_1x` já resolvido) — provavelmente é a fonte de dados pretendida para os 8 projetos completos (hoje só 4 aparecem, hard-coded).
- PENDENCIAS.md também lista uma pendência de UI separada e já aprovada, ainda não aplicada: "card principal maior" — aumentar o card, alinhar/aumentar conteúdo da esquerda com o título, aumentar botão proporcional ao card.
- Setas de navegação (prev/next) já existem no HTML, dentro de `.portfolio__thumbs-row` — hoje decorativas, sem função JS.
- Barra de progresso `.portfolio__explore-fill` já existe no HTML com largura via `style` inline — hoje estática, precisa ficar dinâmica se o JS passar a trocar de case.

**Antes de propor qualquer código:** ler `index.html` (section `#portfolio`) e `base.css § Portfólio` na íntegra, e pedir ao usuário o detalhamento prometido (que dados o `portfolio.js` deve orquestrar, se é troca de case ao clicar em thumbnail + navegação por setas + sync de stats, como já estava mapeado em PENDENCIAS.md, ou se o escopo mudou).

**Depois do Portfólio, a fila retoma:**

**Hero — subir conteúdo.** Conteúdo principal posicionado baixo na viewport; ajuste esperado em `padding-top` ou `align-items` de `.hero__content`.

**Decisões já tomadas na sessão 1 sobre o Hero (não perguntar de novo quando chegar a vez):**

- Direção: subir um pouco, mantendo centralizado — não recentralizar de forma diferente.
- Sem referência visual externa — ajuste a olho, direto no navegador.
- Breakpoint mobile vs desktop: ainda não detalhado, avaliar ao ler o CSS real (risco conhecido de `vh`/`svh` no Hero, já documentado em SECTIONS.md §01).

Depois do Hero: Clientes (tamanho + loop sincronizado) → Footer (aguardando referência visual do cliente). Sobre já está fora da fila.

---

## LIÇÃO TÉCNICA DESTA SESSÃO

Promovida para docs/LICOES.md #9 e CLAUDE.md §4.20:

- **Variante de botão compartilhada pode colidir com o background da section onde é reutilizada.** Nenhuma variante de componente é "segura por padrão" contra qualquer fundo — o contraste dela sempre foi validado só nos contextos onde já era usada. Ao reaproveitar uma variante existente num tipo de fundo novo, checar contraste explicitamente antes de assumir que "já funciona em outro lugar" é garantia suficiente. Corrigir com override escopado no novo contexto, nunca editando a definição base compartilhada.

---

## ESTADO DA DOCUMENTAÇÃO

Já propagado nesta sessão (commitado e mergeado em `main`, nada pendente de atualização):

- **SECTIONS.md** — § Section 04 (Sobre) reescrita por completo, refletindo mapa real, JS de preenchimento, timeline única, CTAs e faixa institucional.
- **PENDENCIAS.md** — item de faixa/mapa da Sobre removido (concluído); nota do WhatsApp atualizada (2 locais); nota de `/contato.html` atualizada.
- **LICOES.md** — lição #9 adicionada.
- **CLAUDE.md** — regra derivada §4.20 adicionada.
- **DESIGN_SYSTEM.md** — não precisou de alteração (nenhum token novo, tudo reaproveitou tokens já documentados: `--color-fj-green-vivid`, `--color-deep-navy-2`, `--color-border-inverse`).

---

## RECOMENDAÇÃO FINAL

Tudo já propagado e confirmado via `git log --oneline` (merge `206e021` no topo de `main`, working tree limpo). Não é necessário rodar nenhum prompt de atualização de documentação antes do próximo chat. O próximo chat pode anexar os 5 documentos (CLAUDE.md, DESIGN_SYSTEM.md, docs/SECTIONS.md, docs/PENDENCIAS.md, docs/LICOES.md) já atualizados, mais este CONTEXTO_TRANSICAO.md como resumo executivo, e colar o prompt de abertura preparado como primeira mensagem.
