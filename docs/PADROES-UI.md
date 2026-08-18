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

---

### 12.4 Faixa infinita (marquee) — `src/scripts/modules/marquee.js`

Motor único para qualquer faixa de rolagem contínua. Em uso na Section
Clientes (logos, 35s) e na faixa institucional da Section Sobre (texto,
45s). **Não reimplemente o loop numa section nova** — a matemática do
número de cópias é a causa raiz da lição #17 e mora num lugar só.

```js
import { initMarquee } from './marquee.js';

const cleanup = initMarquee({
  viewport: section.querySelector('.x__viewport'), // overflow: hidden
  track: section.querySelector('.x__track'),       // flex nowrap, width max-content
  itemSelector: '.x__item',
  durationS: 45,                 // obrigatório: segundos para percorrer 1 conjunto
  cloneAttr: 'data-x-clone',     // marca os clones, usado no cleanup
  onClone: (el) => {},           // opcional (ex: zerar alt de <img>)
});
```

**Contrato de CSS que o chamador precisa cumprir:**

| Elemento | Regras |
| -------- | ------ |
| viewport | `position: relative` + `overflow: hidden` |
| track    | `display: flex` + `flex-wrap: nowrap` + `width: max-content` |
| item     | `flex-shrink: 0` + `margin-right: <espaço>` + `white-space: nowrap` |

**`margin-right` no item, nunca `gap` na track.** Com `gap`, a largura de
1 conjunto medida antes da clonagem é `soma(itens) + gap × (n-1)`, mas o
período real depois da clonagem é `soma(itens) + gap × n` — a costura
ganha um espaço que o wrap não contabiliza, e a faixa salta a cada volta.
Com `margin-right` os dois valores coincidem por construção.

**Fade das bordas** (opcional): dois `<div aria-hidden="true">` absolutos
dentro do viewport, com `linear-gradient` do fundo da section para
transparente. Usar `rgb(var(--token-rgb) / 1)` → `rgb(var(--token-rgb) / 0)`
— nunca `rgba(var(--token-rgb), 1)`, que é inválido e some em silêncio
(CLAUDE.md §4.30).

**`prefers-reduced-motion`:** o motor sai cedo — sem clones, sem loop, sem
`transform`. O layout estático fica por conta do CSS do chamador, que
precisa devolver a faixa a um estado legível (tipicamente `flex-wrap: wrap`
+ `overflow: visible` no viewport + fades escondidos). A preferência é
observada ao vivo (`matchMedia` + `change`): ligá-la com a página aberta
para o loop e remove os clones, para o JS não discordar do `@media`.

**⚠️ Pendência de acessibilidade — WCAG 2.2.2 (Pause, Stop, Hide, Nível A).**
O motor só pausa no `mouseenter` do viewport. Movimento automático que
dura mais de 5s e roda em paralelo com outro conteúdo precisa de um
mecanismo de pausa **alcançável por teclado** — ou seja, um botão, não um
listener de foco. Nenhuma das duas faixas tem esse controle hoje. A
lacuna nasceu na Section Clientes e foi herdada pela Section Sobre ao
compartilhar o motor; `CLAUDE.md` §9 fixa WCAG 2.1 AA como piso, então
isto é dívida real, não preferência. Resolver exige decisão de design
(onde o botão mora, como ele aparece nas duas faixas) — trabalho de
issue própria, não de refactor silencioso.
