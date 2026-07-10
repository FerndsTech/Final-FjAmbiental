# PENDENCIAS.md — Tarefas ativas

> Checklist das pendências abertas do projeto. À medida que itens forem
> concluídos: remover daqui, e mover para docs/LICOES.md se houver
> aprendizado registrável.

---

## Home — sections

- [ ] **Section Sobre — marquee de clientes:** band de clientes na base
      da Section Sobre existe como lista estática. Implementar rolagem
      infinita via GSAP (módulo novo ou extensão do `initReveal()`).
      Ver docs/SECTIONS.md § Section 04.
- [ ] **Section Serviços — `services.json`:** arquivo ainda não existe em
      `src/content/`. Conteúdo dos 3 cards está hard-coded no HTML hoje.
      Criar o JSON antes da migração para Astro (Content Collections).
- [ ] **Section Hero — micro-interações:** SplitType no H1 (fade-up por
      palavra no load, após preloader), fade-in no badge, parallax sutil no
      scroll — tudo respeitando `prefers-reduced-motion`

---

## Marquee da Section Clientes — pendências novas (pós-correção)

> A Section Clientes (faixa de logos) teve seu stutter recorrente
> resolvido — ver docs/LICOES.md #17 para o histórico completo da
> investigação e a causa raiz real. As pendências abaixo são itens
> menores, novos, que surgiram durante a correção — não bugs.

- [ ] **Clients.js — recálculo de conjuntos em resize:** o número de
      cópias das 12 logos necessárias para cobrir a largura do
      `.clients__track-wrapper` é calculado só na inicialização
      (medindo a largura na carga). Não há recálculo em
      resize/rotação de tela. Se a largura do wrapper mudar
      drasticamente depois da carga (ex: rotação de tablet, ou
      redimensionar janela desktop de forma significativa), o vão que
      causava o stutter pode reaparecer até o próximo reload. Não é
      urgente, mas vale registrar como pendência de robustez.
- [ ] **Marquee — controle de pausa explícito (acessibilidade):** hoje
      a pausa do marquee só acontece via `mouseenter`/`mouseleave` no
      wrapper (hover). Não há controle de pausa acessível via teclado
      ou para usuários de touch, o que pode ser relevante para WCAG
      2.2.2 (conteúdo em movimento automático). Considerar um botão de
      pausa explícito se o site precisar de conformidade WCAG formal.

---

## Conteúdo a confirmar com cliente

- [ ] **Número WhatsApp real** — substituir `5571XXXXXXXXX` no CTA da
      Section FAQ antes do deploy. Nota: o mesmo placeholder agora é usado
      em 2 lugares (FAQ e Sobre) — ao trocar pelo número real, checar os dois.
- [ ] **URLs das redes sociais** — Instagram e LinkedIn no Footer
      (`href="#"` hoje)
- [ ] **Telefone do Footer** — `(71) 3000-0000` parece placeholder;
      confirmar número real
- [ ] **Tagline do Footer** — comentário no HTML indica que o texto
      "Consultoria ambiental e recursos hídricos desde 2010..." precisa de
      confirmação do cliente

---

## Ajustes de UI — prioridade antes das próximas features

> Estes ajustes devem ser concluídos antes de iniciar novas features
> (portfolio.js, páginas internas, etc.). Ordem sugerida: do menor
> para o maior escopo.

- [ ] **Tags das sections — padronizar no estilo Portfólio:** hoje cada
      section usa um formato diferente (pill, texto simples, com número, sem
      número). Padronizar todas no estilo da tag do Portfólio ("PORTFÓLIO
      TÉCNICO" — pill com fundo suave, texto caps, sem número).
      **FAQ já concluída** (`.faq__label`, texto "PERGUNTAS FREQUENTES").
      Sections restantes: Hero ("ENGENHARIA & CONSULTORIA"), Serviços
      ("• 02 · SERVIÇOS"), Sobre ("04 — SOBRE"). Portfólio já está no
      padrão correto (referência original).
      Footer não tem tag (intencional). Section Contato terá tag quando
      for desenvolvida (modelo já existe com o cliente).

- [ ] **Hero — subir conteúdo:** conteúdo principal está baixo na
      viewport. Ajuste de `padding-top` ou `align-items` no `.hero__content`.
      Ler o CSS atual de `.hero__content` em `base.css § Hero` antes de editar.

- [ ] **Footer — redistribuir elementos:** distribuir mais à esquerda e
      direita os elementos de texto. **AGUARDANDO referência visual do
      cliente** antes de implementar — não iniciar sem ela. Ler
      `src/partials/footer.html` e `base.css § Footer` quando a ref chegar.

---

## Performance e acessibilidade

- [ ] **CLS da Section Serviços** — principal fonte de layout shift
      identificada (~88% do CLS total em medição de dev). Re-medir com
      Lighthouse em produção após build. Ver docs/LICOES.md #5.
- [ ] **Contraste Footer** — textos com opacidade baixa provavelmente
      falham WCAG 4.5:1. Auditar e corrigir antes do launch.
- [ ] **Focus trap no menu mobile** — ao abrir o painel `#mobile-nav`,
      a navegação por teclado (Tab) ainda circula pelo conteúdo da página
      por trás, não fica presa dentro do painel. Implementar focus trap
      (mover foco pro primeiro link ao abrir, ciclar Tab dentro do painel,
      devolver foco ao botão toggle ao fechar) — boa prática de
      acessibilidade para menus modais.

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
- [ ] `contato.html` — agora também referenciado pelos 2 novos CTAs da
      Section Sobre (WhatsApp usa link externo `wa.me`, mas o CTA
      "Solicitar Proposta" aponta direto para `/contato.html`)
