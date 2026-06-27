# PENDENCIAS.md — Tarefas ativas

> Checklist das pendências abertas do projeto. À medida que itens forem
> concluídos: remover daqui, e mover para docs/LICOES.md se houver
> aprendizado registrável.

---

## Home — sections

- [ ] **Section Sobre** — implementar do zero (spec em docs/SECTIONS.md)
- [ ] **Section Serviços — ícones:** remover caixa de fundo do
  `.service-card__icon` (tirar `background`, `padding`, `border-radius`,
  `width`/`height` do wrapper) e aumentar SVG para ~40px — ícone solto,
  sem container
- [ ] **Section Serviços — `services.json`:** arquivo ainda não existe em
  `src/content/`. Conteúdo dos 3 cards está hard-coded no HTML hoje.
  Criar o JSON antes da migração para Astro (Content Collections).
- [ ] **Section Portfólio — `portfolio.js`:** interatividade completa —
  troca de case ao clicar em thumbnail, navegação por setas prev/next,
  atualização de `.portfolio__explore-fill`, sincronização dos stats em `<dl>`
- [ ] **Section Hero — micro-interações:** SplitType no H1 (fade-up por
  palavra no load, após preloader), fade-in no badge, parallax sutil no
  scroll — tudo respeitando `prefers-reduced-motion`
- [ ] **Marquee de clientes** — band de clientes da Section Sobre rola
  infinitamente com GSAP

---

## Conteúdo a confirmar com cliente

- [ ] **Número WhatsApp real** — substituir `5571XXXXXXXXX` no CTA da
  Section FAQ antes do deploy
- [ ] **URLs das redes sociais** — Instagram e LinkedIn no Footer
  (`href="#"` hoje)
- [ ] **Telefone do Footer** — `(71) 3000-0000` parece placeholder;
  confirmar número real
- [ ] **Tagline do Footer** — comentário no HTML indica que o texto
  "Consultoria ambiental e recursos hídricos desde 2010..." precisa de
  confirmação do cliente

---

## Performance e acessibilidade

- [ ] **CLS da Section Serviços** — principal fonte de layout shift
  identificada (~88% do CLS total em medição de dev). Re-medir com
  Lighthouse em produção após build. Ver docs/LICOES.md #5.
- [ ] **Contraste Footer** — textos com opacidade baixa provavelmente
  falham WCAG 4.5:1. Auditar e corrigir antes do launch.

---

## Funcionalidades globais

- [ ] **Preloader** — contador 0→100% com GSAP Timeline; módulo novo em
  `src/scripts/modules/preloader.js`. Reduz FOUC no load inicial.
- [ ] **SplitType** — adicionar como dependência quando implementar
  micro-interações do Hero. Reveals palavra-por-palavra / linha-por-linha
  nos headings grandes.

---

## Build e deploy

- [ ] **Otimização de imagens (sharp)** — pipeline AVIF + WebP + srcset
  responsivo para todas as imagens do projeto
- [ ] **Favicon system completo** — `favicon.svg` existe; confirmar
  `apple-touch-icon`, ícones do `manifest.webmanifest` e tamanhos faltantes
- [ ] **Lighthouse pass em produção** — rodar em `npm run build &&
  npm run preview`, aba anônima, sem extensões. Meta: 95+ em todas as
  categorias. Priorizar Performance (CLS de Serviços) e Accessibility
  (contraste footer).
- [ ] **Headers de segurança** (CSP, HSTS, COOP, X-Frame-Options) —
  configurar no ambiente de deploy (Cloudflare Pages ou Vercel).
  Não aplicável em dev.

---

## Páginas internas

- [ ] `servicos.html`
- [ ] `portfolio.html`
- [ ] `sobre.html`
- [ ] `contato.html`
