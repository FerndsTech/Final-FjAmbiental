# CONTEXTO_TRANSICAO — FJ Ambiental — jul/2026 (sessão 3)

## ESTADO ATUAL

**Branch ativa:** `feature/portfolio-ui-js`, criada a partir de
`main` (`c7e267f`). Não mergeada, não pusheada para o remoto.

**Commits nesta sessão:**

- `4eaaf4e` — Fase A (UI estática): remoção do botão "Ver case", card
  featured maior, correção do contador/barra Explorar para 01/04,
  correção de largura dos thumbnails (4 slots, não 5), viewport
  fitting.
- `90c259a` — Fase B (JS): criação de `src/scripts/modules/portfolio.js`
  — carrossel de 4 projetos fixos, crossfade via GSAP, timer de
  auto-advance.

**Working tree no momento do fechamento — NÃO COMMITADO:**

- `src/scripts/modules/portfolio.js` modificado: adição de
  `lockDescHeight()` (corrige CLS de descrição de tamanho variável) e
  handlers de swipe (navegação mobile).
- `src/styles/base.css` modificado: `.portfolio__thumbs-row {
display: none }` no mobile (`<600px`), `.portfolio__featured` com
  `aspect-ratio: 4/3` e `max-height: 480px` no mesmo breakpoint — mas
  **ainda contém a tentativa de `box-shadow` que não funcionou**,
  ainda não substituída pelos pseudo-elementos projetados.
- `proposed-css-check.txt` — arquivo temporário de verificação, precisa
  ser apagado antes do commit.

## PRÓXIMA TAREFA PRINCIPAL

**Terminar o peek-card mobile da Section Portfólio**, antes de
qualquer outra coisa — é continuação direta de onde esta sessão parou,
não uma nova task.

**O que já está decidido (não perguntar de novo):**

- Técnica: pseudo-elementos (`::before`/`::after`), não `box-shadow`
  (motivo documentado em LICOES.md #12).
- Onde: em `.portfolio__split` (não em `.portfolio__featured`, que tem
  `overflow: hidden` e cortaria os pseudo-elementos).
- `.portfolio__featured` precisa de `margin-inline` para abrir espaço
  visível real nas laterais (não só sobreposição).
- Referência visual: JCandy (fatias laterais altas e visíveis,
  sugerindo mais cards navegáveis por swipe) — mas o projeto é
  premium-corporativo, mais contido que o e-commerce da referência;
  não precisa ser idêntico, só comunicar a mesma ideia.

**O que NÃO está decidido — os valores de partida (`height: 260px`,
`width: 14px`, `opacity: 0.55`, offsets de `4px`) foram estimados sem
medição real, precisam de validação/ajuste no navegador antes de
fechar** — mesmo padrão iterativo usado em toda a sessão anterior
(propor valor de partida → validar → ajustar).

**Depois de fechar o peek-card:**

1. Apagar `proposed-css-check.txt`.
2. Commit único cobrindo as mudanças pendentes (`lockDescHeight`,
   swipe, `.portfolio__thumbs-row: none`, pseudo-elementos do peek —
   **sem** deixar rastro da tentativa de `box-shadow` descartada no
   histórico, já que nunca foi commitada).
3. Push da branch + merge em `main` (`--no-ff`, mesmo padrão das
   sessões anteriores) + validação de `git log --oneline` confirmando
   o merge real antes de considerar a task fechada.
4. Task "Portfólio — finalização de UI + `portfolio.js`" estará
   completa. Fila retoma: **Hero — subir conteúdo** (decisões da
   sessão 1 continuam válidas, não perguntar de novo — ver
   PENDENCIAS.md).

## LIÇÕES TÉCNICAS DESTA SESSÃO

5 lições promovidas a docs/LICOES.md #10-14 e CLAUDE.md §4.21-4.25:

1. DevTools em modo responsivo contamina medições de layout — sempre
   desligar `Ctrl+Shift+M` antes de medir.
2. Conteúdo dinâmico de comprimento variável precisa de altura travada
   via medição (clone invisível), não CSS chutado.
3. `box-shadow` não serve para decorações com dimensões independentes
   de largura/altura — usar pseudo-elementos.
4. Mensagens de commit multi-linha no PowerShell: usar here-string,
   nunca aspas escapadas.
5. Confirmação dada no Claude Chat não chega automaticamente ao Claude
   Code — sempre colar manualmente na sessão dele.

## ESTADO DA DOCUMENTAÇÃO

Já propagado nesta sessão (a aplicar via Claude Code no início da
próxima, antes de qualquer código novo):

- **SECTIONS.md** — § Section 03 (Portfólio) reescrita por completo.
- **PENDENCIAS.md** — itens de `portfolio.js` e "card maior" removidos
  (concluídos); adicionados: peek-card mobile pendente, commit
  pendente, arquivo temporário a apagar.
- **LICOES.md** — lições #10-14 adicionadas.
- **CLAUDE.md** — regras derivadas §4.21-4.25 adicionadas.
- **DESIGN_SYSTEM.md** — não precisou de alteração (nenhum token novo).

## RECOMENDAÇÃO FINAL

Diferente da sessão anterior, esta fecha **no meio de uma subtask**
(peek-card mobile) — não há merge para `main` ainda, e o working tree
tem mudanças reais não commitadas. O próximo chat deve: anexar os 6
documentos (CLAUDE.md, DESIGN_SYSTEM.md, SECTIONS.md, PENDENCIAS.md,
LICOES.md, mais este CONTEXTO_TRANSICAO.md), confirmar o estado real
do Git (`git status`, `git log --oneline -5`) antes de qualquer ação,
e retomar exatamente do prompt de pseudo-elementos que estava pronto
mas não aplicado.
