# PADROES-UI.md — Padrões de componentes e implementação

> Extraído de `CLAUDE.md` §12. Lido sob demanda, ao construir ou alterar
> qualquer componente de UI. O resumo de uma linha vive em `CLAUDE.md` §12.

---

### 12.1 Botão CTA (`.btn-pill`)

Componente reutilizável implementado em `src/styles/base.css`. Três variantes:

**`.btn-pill`** (base) — sobre fundo dark: fundo branco, texto navy, ícone
navy à direita. Padding assimétrico `10px 10px 10px 26px`. Hover: gap
14px → 18px, ícone vira verde e rotaciona -45°.

**`.btn-pill--dark`** — sobre fundo light/canvas: fundo navy, texto branco,
ícone verde à direita. Mesmo comportamento de hover.

**`.btn-pill--hero`** — ícone à **esquerda**: padding `8px 28px 8px 8px`.
Fundo navy, texto branco, ícone `--color-fj-green-vivid`. Usado no Hero
CTA e FAQ CTA.

Seta em todas as variantes: path `M7 17L17 7M9 7h8v8`, `stroke-width 2.5`.

### 12.2 Microinteração da seta circular (padrão global)

A rotação `-45deg` + mudança para verde no hover de qualquer "círculo com
seta" é a assinatura de interação do site. Aplicar consistentemente em:
botões pill, cards de serviço (se tiverem arrow), card "Ver case" do
portfólio.

### 12.3 Viewport fitting — `min-height: 100svh`

Sections intermediárias usam `min-height: 100svh` (não `100vh`). A unidade
`svh` (small viewport height) exclui a barra de URL mobile — garante que
o conteúdo nunca seja cortado independente do estado da barra.

**Padrão de implementação:**

```css
.nome-da-section {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: calc(var(--header-height) + Xrem);
  padding-bottom: Yrem;
}
```

Exceção: o Hero usa `min-height: 100vh` — é a primeira dobra, não sofre
do problema da barra mobile.
