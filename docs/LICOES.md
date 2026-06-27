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
