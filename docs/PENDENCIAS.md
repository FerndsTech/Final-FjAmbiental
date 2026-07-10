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

      - [ ] **Section Clientes — stutter no loop do marquee ao passar pela
      logo Yamana Gold:** ao completar uma volta da faixa de logos,
      especificamente ao chegar na Yamana Gold, a animação trava por
      1-2s (surge um espaço vazio, depois duas logos aparecem juntas
      de repente) antes de continuar. Sempre no mesmo ponto, todo
      ciclo — não é falha de rede/carregamento único.

      **Já corrigido nesta investigação (não é a causa do stutter, mas
      eram problemas reais):**
      - `loading="lazy"` nas duplicatas do loop → `eager`.
      - Tamanho das logos: 36px→48px desktop, 28px→36px mobile.
      - 11 de 12 SVGs eram raster (PNG em base64) disfarçado de vetor
        → revetorizados no Inkscape, viewBox padronizado `125×75`.
      - Duplicação do loop: de HTML manual duplicado → JS clonando nós
        reais (`src/scripts/modules/clients.js`, `initClients()`) —
        elimina risco de assimetria entre as duas metades da faixa.
      - Wrapper `.clients__track-dupe` + `display: contents` removido
        — clones agora são irmãos diretos em `.clients__track`
        (`data-clients-clone="true"`), sem aninhamento de DOM.

      **Hipóteses testadas e descartadas com dados reais** (ver
      docs/LICOES.md #17): assimetria entre metades do loop,
      aninhamento de DOM via `display: contents`, custo do filtro CSS
      `brightness(0) invert(1)`, throttling de rede, mismatch de
      `width`/`height` HTML vs. proporção real do SVG (esse último é
      real e mensurado — afeta as 12 logos, não só a Yamana Gold — mas
      é evento único de carga, não explica recorrência a cada ciclo;
      vale corrigir de qualquer forma, ver item abaixo).

      **Em teste no momento da pausa desta sessão:** complexidade
      geométrica do path SVG da Yamana Gold (foi vetorizada
      separadamente das outras 11, com "Suavizar"+"Empilhar" ativados
      no Inkscape, gerando mais pontos de curva) — hipótese de que
      isso cause custo de rasterização maior especificamente quando
      ela entra na área visível do loop. Revetorização de teste em
      andamento (sem Suavizar/Empilhar, com `Ctrl+L` Simplificar,
      mesmo canvas `125×75` das outras 11) para confirmar por
      eliminação antes de aplicar qualquer correção de código.

      Branch: `feature/clients-marquee` (commit `c88553f`), pushada,
      não mergeada em `main` — task não fechada.

- [ ] **Section Clientes — atributos `width`/`height` desatualizados
      nas 12 `<img>`:** todos os 12 atributos HTML de `width` (usados
      pelo navegador para reservar espaço de layout antes da imagem
      carregar) foram herdados da era raster antiga e não batem com a
      proporção real dos SVGs revetorizados (desvios de +17% a +100%
      — ver docs/LICOES.md #17 para a tabela completa). Isso causa
      CLS na primeira carga da página (não confirmado como causa do
      stutter recorrente, mas é um problema real e separado que
      precisa de correção). Recalcular `width` de cada `<img>` com
      base no `viewBox` real de cada SVG (todas em `125×75`, exceto
      Tenda `175×75` e Yamana Gold — ainda fora do padrão, pendente da
      revetorização em andamento).

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

- [ ] **Clientes — tamanho + loop sincronizado:** logos da Section
      Clientes (`index.html:143-177`, `base.css:780-846`) estão pequenos e
      o loop do marquee não está sincronizado. Aumentar tamanho e corrigir
      a animação CSS/GSAP do loop.

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
