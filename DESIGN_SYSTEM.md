# DESIGN_SYSTEM.md — Sistema Visual da FJ Ambiental

> Documentação dos tokens visuais.
> A **fonte da verdade** está em [`src/styles/tokens.css`](./src/styles/tokens.css) — este documento explica o porquê de cada decisão.

---

## 1. Filosofia visual

**Direção:** Premium Corporativo · refinamento minimalista com restraint.

Não somos Tesla nem Apple nem startup-de-fintech. Somos uma consultoria técnica que entrega outorga, hidrometria e hidrologia há 15 anos para EMBASA, UNESCO, Yamana Gold, Mineração Caraíba e prefeituras. A linguagem visual precisa transmitir:

1. **Autoridade técnica** — sem ser frio
2. **Precisão** — sem ser estéril
3. **Modernidade** — sem ser efêmero
4. **Confiança institucional** — sem ser corporativo genérico

A inspiração visual vem de templates premium do Webflow (Altuz, Shokti, Forfuture) e de marcas como Linear, Vercel, Stripe — porém **traduzido para o contexto de engenharia hídrica brasileira**.

---

## 2. Cores

### 2.1 Brand colors

| Token | Hex | Uso |
|---|---|---|
| `--color-fj-green` | `#00A859` | **Cor principal da marca.** CTAs, links, ícones, ênfases. Vibrante mas profissional. |
| `--color-fj-green-dim` | `#008A48` | Hover de elementos verdes, sombras de elementos verdes |
| `--color-fj-aqua` | `#00B4D8` | **Acento secundário.** Usado pontualmente para reforçar contexto hídrico — ícones de água, dados secundários, focus states. **Nunca** como cor dominante. |

### 2.2 Surfaces (light mode = body)

| Token | Hex | Uso |
|---|---|---|
| `--color-canvas` | `#FAFAF7` | Background principal das seções light. Off-white quente, anti-frieza do branco puro. |
| `--color-surface` | `#FFFFFF` | Cards, modals, elementos elevados |
| `--color-ink` | `#1A1F2E` | Texto principal. **Não preto puro** — preto puro é amador. Azul-quase-preto sugere profundidade. |
| `--color-slate` | `#6B7280` | Texto secundário, labels, captions |
| `--color-slate-light` | `#9CA3AF` | Texto terciário, placeholders |
| `--color-border` | `rgba(26, 31, 46, 0.08)` | Bordas sutis (0.5px ideal) |

### 2.3 Dark sections (hero, sobre, footer)

| Token | Hex | Uso |
|---|---|---|
| `--color-deep-navy` | `#0A1628` | Background das seções dark. Azul-marinho profundo, evita o preto puro. |
| `--color-deep-navy-2` | `#14202E` | Surfaces elevadas dentro de seções dark |
| `--color-ink-inverse` | `#FFFFFF` | Texto principal em fundos dark |
| `--color-slate-inverse` | `rgba(255, 255, 255, 0.65)` | Texto secundário em dark |
| `--color-border-inverse` | `rgba(255, 255, 255, 0.1)` | Bordas em seções dark |

### 2.4 Estados semânticos

| Token | Hex | Uso |
|---|---|---|
| `--color-success` | `#00A859` | Reusa o verde da marca para success states |
| `--color-warning` | `#F59E0B` | Alertas |
| `--color-danger` | `#DC2626` | Erros |
| `--color-info` | `#00B4D8` | Reusa o aqua para info |

### 2.5 Rules para uso de cor

- **80/15/5 rule:** 80% neutros (canvas/ink/slate), 15% green, 5% aqua. Inverter essa proporção é o erro de quem usa cor demais.
- Verde sólido pra CTAs primárias; outline para CTAs secundárias.
- Aqua só em contextos hídricos explícitos (gota d'água, ícones de água, "Recursos Hídricos" label) — não decoração.
- Texto sobre verde: branco. Texto sobre aqua: navy escuro. **Nunca preto puro sobre cores da marca.**

---

## 3. Tipografia

### 3.1 Pareamento

| Família | Uso |
|---|---|
| **IBM Plex Sans** | Display, headings, body. Toda a hierarquia textual. |
| **IBM Plex Mono** | Números, stats, eyebrow labels, código, identificadores técnicos (CNPJ, processo ANA, lat/long). |

**Por que IBM Plex?** Foi desenhada pela IBM em 2017 especificamente para representar identidade técnica de engenharia. Tem:

- Suporte impecável a notação científica (subscript, superscript, ∫, ∑, m³/s, km², L/s)
- Versão mono pareada (Plex Mono) para números tabulares e identificadores
- Personalidade humana sem cair em "tech-bro" como Geist ou "designer-y" como Inter
- Open source (SIL Open Font License), zero custo, hospedável local
- Casa perfeitamente com a estética "consultoria de engenharia" da FJ

### 3.2 Type scale

Sistema baseado em `clamp()` para responsividade fluida. Sem media queries em font-size.

| Token | Tamanho | Uso |
|---|---|---|
| `--text-xs` | `0.75rem` (12px) | Captions, footnotes, legal |
| `--text-sm` | `0.875rem` (14px) | Body small, labels |
| `--text-base` | `1rem` (16px) | Body padrão |
| `--text-lg` | `1.125rem` (18px) | Body destacado, lead |
| `--text-xl` | `1.5rem` (24px) | H4, card titles |
| `--text-2xl` | `2rem` (32px) | H3 |
| `--text-3xl` | `2.75rem` (44px) | H2, section headlines |
| `--text-display` | `clamp(2.5rem, 6vw, 4.5rem)` | H1 de páginas internas |
| `--text-display-xl` | `clamp(3.5rem, 9vw, 6.5rem)` | Hero da home |

### 3.3 Pesos

**Apenas 2 pesos** carregados — performance budget acima de tudo.

- **400 Regular** — todo body, descrições, textos longos
- **500 Medium** — headings, labels, CTAs, ênfase

Plex Mono: apenas **400 Regular**.

### 3.4 Line-height

| Contexto | Valor |
|---|---|
| Headings (h1-h2) | `1.05` |
| Headings (h3-h4) | `1.15` |
| Body | `1.6` |
| Body small | `1.5` |
| Captions | `1.4` |

### 3.5 Letter-spacing

| Contexto | Valor |
|---|---|
| Display headings | `-0.025em` |
| Headings normais | `-0.015em` |
| Body | `0` (default) |
| All-caps labels | `0.08em` |
| Mono identifiers | `0` |

---

## 4. Espaçamento

### 4.1 Spacing scale (component-internal)

Tailwind padrão. `gap-4`, `p-6`, `mb-8`, etc.

### 4.2 Section spacing tokens

| Token | Valor | Uso |
|---|---|---|
| `--space-section` | `clamp(4rem, 8vw, 8rem)` | Padding vertical de seções inteiras |
| `--space-block` | `clamp(2rem, 4vw, 4rem)` | Espaçamento entre blocos dentro de seção |
| `--space-container` | `clamp(1.25rem, 4vw, 2rem)` | Padding horizontal do container |

### 4.3 Container

`--container-max: 1280px` — largura máxima do conteúdo, centralizado.

---

## 5. Motion

### 5.1 Filosofia

Sutil e técnico. Não dance, não show off. Cada animação tem uma função:

- **Reveal** ao scroll: dá ritmo de leitura, sinaliza nova informação
- **Hover state**: confirma interatividade, sem teatro
- **Page transitions**: continuidade narrativa
- **Smooth scroll** (Lenis): conforto, não dramatic

### 5.2 Easings

| Token | Curva | Uso |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrada (elementos aparecendo) |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Estados transicionando |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Apenas elementos interativos (overshoot leve) |

### 5.3 Durations

| Token | Valor | Uso |
|---|---|---|
| `--duration-fast` | `200ms` | Hover, focus, micro-interações |
| `--duration-base` | `400ms` | Reveals, modais |
| `--duration-slow` | `800ms` | Transições de página, hero entrance |

### 5.4 Patterns canônicos

**Fade-up no scroll** (padrão para entrada de conteúdo):
```js
gsap.from(el, {
  y: 24,
  opacity: 0,
  duration: 0.8,
  ease: 'power3.out',
  scrollTrigger: { trigger: el, start: 'top 85%', once: true }
});
```

**Stagger em grids**:
```js
gsap.from(cards, {
  y: 32,
  opacity: 0,
  duration: 0.6,
  ease: 'power3.out',
  stagger: 0.08,
  scrollTrigger: { trigger: container, start: 'top 80%' }
});
```

**Hover em cards**:
```css
.card {
  transition: transform var(--duration-fast) var(--ease-out),
              box-shadow var(--duration-fast) var(--ease-out);
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.12);
}
```

### 5.5 `prefers-reduced-motion`

Toda animação respeita. Implementação em `src/scripts/modules/smooth-scroll.js` — Lenis não inicializa, GSAP duration cai para 0.

---

## 6. Border radius

| Token | Valor | Uso |
|---|---|---|
| `--radius-sm` | `6px` | Botões small, pills |
| `--radius-md` | `8px` | Botões padrão, inputs |
| `--radius-lg` | `12px` | Cards |
| `--radius-xl` | `16px` | Cards destacados, modais |
| `--radius-pill` | `999px` | Pills, badges |

Nunca arredondar canto único — radius é aplicado nos 4 cantos consistentemente, exceto onde dois elementos se juntam.

---

## 7. Sombras

Mínimas. Premium não usa drop shadow gratuito.

| Token | Valor | Uso |
|---|---|---|
| `--shadow-card` | `0 1px 2px 0 rgba(26, 31, 46, 0.04)` | Cards estáticos (sutil) |
| `--shadow-card-hover` | `0 12px 32px -8px rgba(26, 31, 46, 0.12)` | Card no hover |
| `--shadow-modal` | `0 24px 64px -12px rgba(26, 31, 46, 0.18)` | Modais e overlays |

Zero shadow em tudo mais. Bordas sutis (0.5px) substituem.

---

## 8. Logo system

Sistema completo em `src/assets/logo/`:

| Arquivo | Uso |
|---|---|
| `logo-primary.svg` | Verde + flow line branca · backgrounds claros |
| `logo-inverse.svg` | Branco + flow line verde · backgrounds dark (hero, footer) |
| `logo-mono.svg` | `currentColor` único · contextos onde cor única é exigida (P&B, gravação) |
| `/public/favicon.svg` | Favicon SVG com `prefers-color-scheme` embutido |

Wordmark sempre via texto HTML, **nunca** convertido para path SVG. Performance + acessibilidade.

---

## 9. Iconografia

Sistema baseado em **Lucide Icons** (`https://lucide.dev`) — peso de stroke consistente com IBM Plex.

Tamanhos:
- `20px` — inline em texto
- `24px` — padrão (nav, CTAs)
- `32px` — destaque

Stroke width: `1.75px` (refinado, não gritante).

---

## 10. Don'ts (anti-patterns)

- ❌ Gradientes lineares decorativos (`linear-gradient(45deg, purple, blue)`)
- ❌ Drop shadow em texto
- ❌ Glassmorphism (backdrop-blur ornamental)
- ❌ Bordas multi-cor ou animadas
- ❌ Cursor customizado em desktop
- ❌ Emoji em UI (só em conteúdo escrito pelo usuário)
- ❌ Stock photos genéricas — usar **somente** fotos reais de campo da FJ
- ❌ Ícones com pesos diferentes (`stroke-width` precisa ser consistente)
- ❌ Mais de 2 fontes carregadas
- ❌ Texto centralizado em parágrafos longos (só em headings curtos)
- ❌ Fundo com pattern/texture decorativo
