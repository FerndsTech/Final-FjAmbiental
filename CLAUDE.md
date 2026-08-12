# CLAUDE.md — Guia para Desenvolvimento Assistido por IA

> Este arquivo define as regras inegociáveis do projeto.
> Qualquer assistente de IA (Claude, Copilot, Cursor, GPT-4, Aider, etc.) deve ler este documento **antes** de gerar qualquer linha de código.
>
> Compatível com a convenção `AGENTS.md` da indústria — duplica este arquivo como `AGENTS.md` se necessário.

**Este arquivo contém só o que se aplica a QUALQUER linha de código.**
O que só importa ao tocar numa área específica mora em `docs/` e é lido
sob demanda — manter o núcleo enxuto é performance de agente, já que ele
é carregado inteiro em toda sessão.

**Documentação sob demanda:**

| Documento | Ler quando |
| --------- | ---------- |
| `docs/ARMADILHAS.md` | Corpo completo das armadilhas do §4 — ao tocar na área correspondente |
| `docs/PADROES-UI.md` | Construir ou alterar qualquer componente de UI (§12) |
| `docs/SECTIONS.md` | Trabalhar numa section específica da Home |
| `docs/LICOES.md` | Investigar um bug — histórico de diagnósticos |
| `docs/PENDENCIAS.md` | Só o que ainda não é issue: bloqueios de cliente e páginas não mapeadas |
| `docs/FASE-2-ASTRO.md` | Só quando a Fase 1 estiver no ar e validada |
| `docs/agents/` | Operar issue tracker, triagem ou docs de domínio — lido por skill (§ Agent skills) |
| `DESIGN_SYSTEM.md` | Tokens visuais e escalas |

---

## 1. Contexto do projeto

| Campo                   | Valor                                                                   |
| ----------------------- | ----------------------------------------------------------------------- |
| **Cliente**             | FJ Ambiental                                                            |
| **Setor**               | Consultoria Ambiental e Recursos Hídricos                               |
| **Sede**                | Salvador — Bahia, Brasil                                                |
| **Fundada em**          | 2010                                                                    |
| **Tipo do site**        | Landing institucional — 5 páginas                                       |
| **Páginas**             | Home, Serviços, Portfólio, Sobre, Contato                               |
| **Direção visual**      | Premium Corporativo — Hero dark, body light, ritmo dark/light alternado |
| **Meta de performance** | Lighthouse 100/100/100/100 em mobile e desktop                          |
| **Idioma principal**    | pt-BR                                                                   |
| **Site antigo**         | https://fjambiental.com.br/ (referência de conteúdo apenas)             |

---

## 2. Stack travado — Fase 1 (vanilla)

**Toda dependência abaixo está travada com motivo. NÃO atualize versões major sem aprovação humana explícita.**

### Core

- **HTML5** semântico — sem framework JavaScript no cliente
- **Vite 5.x** — build tool e dev server
- **Tailwind CSS 3.4.x** — utility-first styling (ver §4.1)
- **JavaScript ES2024** — módulos nativos, sem TypeScript na Fase 1

### Animação e interação

- **GSAP 3.13+** — toda a suite gratuita após aquisição pela Webflow (Abr/2025). ScrollTrigger, ScrollSmoother, MorphSVG, SplitText são livres agora.
- **Lenis 1.x** — smooth scroll sincronizado com ScrollTrigger

### Assets e build

- **@fontsource/ibm-plex-sans** + **@fontsource/ibm-plex-mono** — fontes self-hosted via npm
- **sharp** — otimização de imagens em build (AVIF + WebP + srcset responsivo)
- **posthtml-include** (via plugin Vite custom) — partials HTML reutilizáveis

### Proibido na Fase 1

- ❌ React, Vue, Svelte, Solid
- ❌ Astro, Next.js, Nuxt, SvelteKit
- ❌ TypeScript (vamos adicionar na Fase 2)
- ❌ jQuery, Bootstrap, Material UI
- ❌ Animation libraries que não sejam GSAP (Framer Motion, GreenSock-old, anime.js)
- ❌ CSS-in-JS (styled-components, emotion)

---

## 3. Disciplinas arquiteturais inegociáveis

Estas 5 regras foram desenhadas pra permitir migração futura para Astro **sem reescrita**. Quebrar qualquer uma transforma migração em refatoração.

### 3.1 Partials HTML — nunca HTML duplicado

Header, footer, head e blocos repetidos ficam em `src/partials/`. Inclusão via:

```html
<include src="header.html" />
```

Quando migrarmos para Astro, cada partial vira `.astro` direto, copy-paste.

### 3.2 Conteúdo separado de apresentação

Serviços e projetos do portfólio ficam em `src/content/*.json` lidos em build-time.
**Nunca** hardcode "23 serviços" em HTML. Migra direto para Content Collections do Astro.

#### Critério de decisão: onde um conteúdo deve viver

Antes de criar qualquer section nova, decida onde o conteúdo dela mora
usando este critério de 3 vias:

**1. Chrome do site (repete entre PÁGINAS diferentes) → `src/partials/`**
Se o elemento aparece (ou vai aparecer) em mais de uma página do site —
ex: header, footer, head — ele é um partial, incluído via
`<include src="arquivo.html" />` (vite-plugin-includes.js). O critério é
repetição CROSS-PAGE, não repetição dentro da mesma página. Pensando na
migração futura para Astro: cada partial é candidato direto a virar
componente `.astro` (`<Header />`).

**2. Dado estruturado e repetido (N itens do mesmo shape) → `src/content/*.json`**
Se o conteúdo de uma section é uma coleção de N registros com os mesmos
campos — ex: 8 projetos do portfólio, N serviços, N perguntas de FAQ — ele
vira um arquivo JSON em `src/content/`, lido em build-time, nunca
hardcoded item-a-item no HTML. Pensando na migração futura: cada JSON é
candidato direto a uma Astro Content Collection.

**3. Conteúdo editorial único de uma section → inline no HTML da própria página**
Se o conteúdo é único (não é uma lista de N itens iguais) — ex: o texto do
Hero, a introdução da section Sobre, o título e intro da FAQ — ele fica
escrito direto no HTML da section, sem JSON e sem partial. Não há
repetição de shape que justifique abstração.

**Módulos JS** (`src/scripts/modules/`) seguem uma lógica separada: cada
módulo nasce quando a section **ganha comportamento interativo** (não quando
a section é criada). Uma section pode existir 100% estática por várias
sessões antes de receber seu módulo — isso é estágio de desenvolvimento,
não ausência arquitetural.

### 3.3 Design tokens em CSS variables

`src/styles/tokens.css` é a **única fonte de verdade**.
Tailwind config consome de lá via `theme.extend.colors`.
**Nunca** hardcode hex em componente — sempre via token.

### 3.4 JavaScript em módulos ES, jamais monolítico

`src/scripts/modules/` com **um arquivo por feature** (hero.js, reveal.js, faq.js, nav.js, etc.).
Cada módulo exporta uma função `init` que retorna função de cleanup.
Cada módulo vira um Astro island depois com `client:visible`.

```js
// src/scripts/modules/hero.js
export function initHero(root = document) {
  const ctx = gsap.context(() => {
    // animations
  }, root);

  return () => ctx.revert();
}
```

### 3.5 GSAP sempre dentro de `gsap.context()`

**Toda** animação é criada dentro de um context. Sem exceção. Memory leak garantido se ignorar.

```js
const ctx = gsap.context(() => {
  gsap.to(".elem", { y: 0, duration: 0.8 });
}, scopeElement);

// Cleanup obrigatório:
return () => ctx.revert();
```

---

## 4. Armadilhas comuns de IA neste stack

A IA tende a errar nestes pontos específicos. Se você for IA lendo isto,
faça **checagem ativa** antes de submeter código.

**Este é o índice. O corpo completo está em `docs/ARMADILHAS.md`** — leia
a entrada correspondente antes de mexer na área que ela cobre. Estas
regras são também a fonte que o eixo *Standards* do `/code-review` usa;
não existe `CODING_STANDARDS.md` neste repo.

- **4.1** Tailwind v3 vs v4
- **4.2** Imagens sem dimensões intrínsecas
- **4.3** Scripts bloqueantes
- **4.4** GSAP fora de context
- **4.5** Lenis sem sync com ScrollTrigger
- **4.6** `font-display` errado em @font-face
- **4.7** `console.log` em produção
- **4.8** DOM manipulation fora de módulos
- **4.9** `prefers-reduced-motion` ignorado
- **4.10** Tags semânticas erradas
- **4.11** Tailwind utilities em elementos com estado JS
- **4.13** Campos semânticos com estado não verificado
- **4.14** Acordeão: não usar `grid-template-rows: 0fr` para colapso de altura
- **4.15** Bug visual persistente: instrumentar antes de propor hipótese
- **4.19** Documentação desatualizada é mais perigosa que ausente
- **4.20** Variante de botão/componente reaproveitada num fundo novo precisa de checagem explícita de contraste
- **4.21** Medir layout com DevTools sempre com Device Toolbar desligado
- **4.22** Conteúdo dinâmico de comprimento variável precisa de altura travada
- **4.23** `box-shadow` não serve para decorações com dimensões independentes
- **4.24** Mensagens de commit multi-linha no PowerShell: usar here-string
- **4.26** Threshold de scroll-reveal fixo não serve para todo elemento
- **4.27** Pausa de auto-advance por hover/focus deve escopar à área de interação, não à section
- **4.28** Overlays full-screen precisam de fallback síncrono independente de frameworks de animação

**Numeração estável — nunca renumerar.** As lacunas são propositais:

- **4.16** e **4.17** viraram procedimentos humanos → `README.md` § Procedimentos manuais
- **4.12**, **4.18** e **4.25** descreviam o fluxo antigo Chat+Code e estão
  arquivadas em `docs/ARMADILHAS.md` § Histórico. Não são regras ativas.

`docs/LICOES.md` referencia estes números; renumerar quebraria as referências.

---

## 5. Onde mora cada tipo de conteúdo

O critério de decisão de 3 vias está no §3.2. Resumo operacional:

| Tipo | Local |
| ---- | ----- |
| Chrome que repete entre páginas | `src/partials/` — via `<include src="..." />` |
| Coleção de N itens do mesmo shape | `src/content/*.json` — lido em build-time |
| Conteúdo editorial único de uma section | Inline no HTML da própria página |
| Comportamento interativo de uma section | `src/scripts/modules/<feature>.js` |
| Design tokens | `src/styles/tokens.css` — **única fonte de verdade** |

A árvore completa de pastas está no `README.md` § Estrutura.

---

## 6. Convenções de código

### CSS / Tailwind

- Tailwind primeiro para layout, espaçamento, cor e tipografia.
- CSS custom só onde Tailwind não chega: animações complexas, pseudo-elementos elaborados, container queries específicas, custom properties dinâmicas.
- `@apply` apenas para padrões repetidos 3+ vezes.
- **Mobile-first**: estilos base = mobile, breakpoints adicionam para maior (`md:`, `lg:`, `xl:`).

### JavaScript

- ES modules nativos sempre (`import` / `export`).
- Funções nomeadas em export, não `export default function()`.
- Cada módulo exporta uma `init` que aceita opcionalmente um `root` element.
- Cleanup via return function (preparação para Astro islands).
- Sem semicolons opcionais — usar consistentemente (estamos usando WITH).
- Aspas simples para strings, backticks para template literals.

### HTML

- Semântico ao máximo: `<article>`, `<section>`, `<aside>`, `<nav>`, `<header>`, `<footer>`, `<figure>`, `<figcaption>`.
- `alt` em **todas** as imagens (vazio `alt=""` só para decorativas).
- ARIA quando necessário, mas **semantic HTML primeiro**.
- Heading hierarchy correta — não pular níveis.
- Indentação de 2 espaços.

### Nomes

- Arquivos: `kebab-case` (`hero-section.js`, `project-card.html`)
- CSS classes: `kebab-case` ou Tailwind utilities
- JS variables/functions: `camelCase`
- JS constants: `SCREAMING_SNAKE_CASE`
- Componentes-like: `PascalCase` quando aplicável

---

## 7. Performance budget (limites duros)

| Asset                    | Budget        |
| ------------------------ | ------------- |
| HTML por página          | < 25kb        |
| CSS total (purgado)      | < 30kb        |
| JS inicial (main.js)     | < 50kb        |
| GSAP bundle (lazy)       | < 60kb        |
| Imagens above-the-fold   | < 200kb total |
| Fontes (3 weights total) | < 80kb        |
| **Total página inicial** | **< 400kb**   |

### Core Web Vitals targets

- **LCP** (Largest Contentful Paint): < 2.0s
- **INP** (Interaction to Next Paint): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.05

---

## 8. SEO baseline (toda página)

- `<title>` único, < 60 caracteres
- `<meta name="description">` único, 140-160 caracteres
- Open Graph completo: og:title, og:description, og:image, og:url, og:type, og:locale
- Twitter Card: summary_large_image
- JSON-LD: `Organization` (todas) + `ProfessionalService` (home, serviços) + `FAQPage` (onde houver)
- Sitemap.xml automático no build (a configurar)
- Canonical URL absoluta em toda página
- `<html lang="pt-BR">` em todas as páginas

---

## 9. Acessibilidade — WCAG 2.1 AA mínimo

- Contraste de texto: 4.5:1 (normal), 3:1 (large text 18px+ bold ou 24px+ regular)
- Focus visible em todos os elementos interativos (custom focus ring com `outline: 2px solid var(--color-fj-aqua); outline-offset: 2px`)
- `prefers-reduced-motion` respeitado em **todas** as animações
- Navegação por teclado funcional 100%
- Skip-to-content link no header como primeiro elemento focável
- Labels em todos os inputs (`<label>` explícito, `aria-label` só quando label visual não couber)
- Landmarks ARIA implícitos via semantic HTML
- `aria-current="page"` em link de navegação ativa

---

## 10. Migração futura — Fase 2 (Astro)

Depois do site no ar e validado em produção, migração para Astro 5.
Mecânica, estimativa e ganhos esperados: **`docs/FASE-2-ASTRO.md`**.

As 5 disciplinas do §3 existem para tornar essa migração cópia, não
reescrita. Quebrar qualquer uma transforma migração em refatoração.

---

## 11. Checklist antes de fazer commit

Antes de marcar qualquer feature como pronta, validar:

- [ ] Lighthouse rodado localmente — score 95+ em todas as categorias
- [ ] Mobile testado em viewport 375px (iPhone SE) e 414px (iPhone Pro Max)
- [ ] Desktop testado em 1280px e 1920px
- [ ] `prefers-reduced-motion: reduce` testado (DevTools → Rendering)
- [ ] Dark mode do navegador testado (não quebra layout/contraste)
- [ ] Console limpo (sem errors, sem warnings)
- [ ] Network tab limpo (sem 404, sem requests excessivos)
- [ ] HTML validado em https://validator.w3.org
- [ ] Imagens com width+height e alt
- [ ] Todos os textos em pt-BR (sem placeholders de inglês)

---

## 12. Padrões de componentes e implementação

Três padrões reutilizáveis, documentados em **`docs/PADROES-UI.md`**:

- **12.1 Botão CTA (`.btn-pill`)** — três variantes (base, `--dark`, `--hero`)
- **12.2 Microinteração da seta circular** — assinatura de interação do site
- **12.3 Viewport fitting** — `min-height: 100svh` em sections intermediárias

Ler o documento antes de criar qualquer componente novo de UI — inclusive
para checar se o que você vai construir já existe.

---

## 13. Fluxo de trabalho: skills de engenharia no Claude Code

O desenvolvimento acontece dentro do Claude Code, usando as skills de
engenharia instaladas em `~/.claude/skills`. O papel de "cérebro" que era
do Claude Chat agora é do `/grill-with-docs`, que afia a ideia com acesso
ao código real — eliminando a origem do incidente #14 (`docs/LICOES.md`).

O fluxo antigo (Claude Chat "cérebro" + Claude Code "motor", com a pessoa
traduzindo entre os dois) foi aposentado. As armadilhas que descreviam
aquela coreografia estão arquivadas em `docs/ARMADILHAS.md` § Histórico.

### Ciclo

1. **`/grill-with-docs`** — entrevista até a ideia estar tecnicamente precisa.
2. Trabalho de várias sessões? → **`/to-spec`** → **`/to-tickets`**.
   Sessão única? → direto pro passo 3.
3. **`/implement`** por ticket, com `/clear` entre cada um.
4. **`/code-review`** (chamado pelo próprio `/implement`) antes do commit.
5. A pessoa valida no navegador e aprova o merge.

**Higiene de contexto:** manter os passos 1–2 numa única janela, sem
`/clear` e sem `/compact` no meio. Cada `/implement` começa limpo, lendo
só o ticket.

**Skills que só a pessoa pode disparar** (`disable-model-invocation`):
`/grill-with-docs`, `/to-spec`, `/to-tickets`, `/implement`, `/wayfinder`,
`/triage`, `/handoff`, `/improve-codebase-architecture`,
`/setup-vini-skills`. A IA não consegue iniciá-las sozinha.

**Atenção ao nome:** o comando é `/setup-vini-skills` (nome da pasta). As
outras skills o referenciam como `/setup-matt-pocock-skills`, que não existe.

### Autoridade de git

| Ação | Quem |
| ---- | ---- |
| `git commit` | **A IA**, sempre em branch de feature — nunca direto na `main` |
| `git push` | A IA **pergunta antes**. Aprovado → a IA executa. Negado → a pessoa executa |
| `merge` do PR | A IA **pergunta antes**. Aprovado → a IA executa. Negado → a pessoa executa |
| `reset --hard`, `clean -f`, `branch -D`, `checkout .`, `push --force` | **Ninguém automaticamente.** A IA nunca roda sem pedido explícito da pessoa |

**Gate obrigatório antes de todo commit:** `npm run build` verde e console
limpo. Este projeto **não tem suíte de testes** — este é o único gate
automático que existe, então ele não é opcional. O checklist completo é o §11.

- Todo commit atualiza o doc correspondente junto (§4.19).
- Mensagens de commit multi-linha: here-string do PowerShell (§4.24).
- Branch por ticket. A `main` é o estado bom conhecido.

### Regras que sobrevivem do fluxo antigo

- Diffs grandes em `.md` têm risco real de perda silenciosa de conteúdo —
  preferir edições cirúrgicas com âncora única, ou extração por intervalo
  de linhas, a reescritas de blocos inteiros.
- Confirmar integridade de edição grande com `grep -c` em frases-âncora do
  conteúdo antigo E do novo — a leitura visual do diff em terminal já se
  mostrou pouco confiável neste ambiente.

### Configuração das skills

O issue tracker, o vocabulário de labels de triagem e o layout de docs de
domínio estão registrados em `docs/agents/` — resumo na seção **Agent
skills** logo abaixo. As skills leem de lá.

Os arquivos em `docs/agents/` são os únicos do projeto escritos em inglês.
Não são documentação para pessoas: são lidos por skill, e carregam strings
que as skills casam literalmente (a flag `PRs as a request surface`, os
nomes dos labels, os comandos `gh`). Traduzir quebra o parsing.

---

## Agent skills

> Seção **sem número** de propósito: as skills de engenharia procuram
> exatamente o heading `## Agent skills`. Não renumerar, não renomear,
> não traduzir os sub-headings.

### Issue tracker

GitHub Issues no repo `FerndsTech/Final-FjAmbiental`, operado via `gh` CLI.
Ver `docs/agents/issue-tracker.md`.

### Triage labels

Os cinco papéis canônicos, sem renomear — `needs-triage`, `needs-info`,
`ready-for-agent`, `ready-for-human`, `wontfix`.
Ver `docs/agents/triage-labels.md`.

### Domain docs

Single-context: um `CONTEXT.md` na raiz mais `docs/adr/`. Nenhum dos dois
existe hoje — são criados sob demanda pelo `/domain-modeling`, não agora.
Ver `docs/agents/domain.md`.

---

## 14. Sobre este documento

Este `CLAUDE.md` é **versionado junto com o código**. Toda decisão
arquitetural importante é registrada aqui. Toda IA lê isto antes de gerar
código.

**Quando atualizar (e em qual arquivo):**

| Mudança | Arquivo |
| ------- | ------- |
| Nova dependência, mudança de stack | `CLAUDE.md` §2 |
| Mudar uma disciplina arquitetural | `CLAUDE.md` §3 |
| Descobrir uma armadilha nova de IA | `docs/ARMADILHAS.md` + índice no §4 |
| Mudar performance budget | `CLAUDE.md` §7 |
| Novo padrão de componente reutilizável | `docs/PADROES-UI.md` + resumo no §12 |
| Implementar ou alterar uma section | `docs/SECTIONS.md` |
| Resolver um bug relevante | `docs/LICOES.md` |
| Concluir ou adicionar tarefa | issue tracker (ver `docs/agents/`) |
| Mudar o fluxo de trabalho ou a autoridade de git | `CLAUDE.md` §13 |

**Regra de ouro (§4.19):** documentação desatualizada é mais perigosa que
ausente. Atualizar no mesmo commit — nunca "depois".

**Linguagem:** português (cliente brasileiro, equipe brasileira,
documentação brasileira).
