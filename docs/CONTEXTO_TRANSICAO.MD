# CONTEXTO_TRANSICAO

### ESTADO ATUAL

- **Branch ativa:** `feature/header-ui`
- **O que foi concluído NESTA sessão e COMO:**
  - **Implementação do Preloader (Mitigação de FOUC):** Criado o componente `preloader.html` e o módulo `preloader.js`. Utilizamos uma _timeline_ do GSAP para animar um contador numérico de 0 a 100%, garantindo que os assets e a estrutura da página carreguem de forma polida antes de revelar o site.
  - **Prevenção de Layout Shift:** Inicialmente, bloqueamos o scroll via `document.body.style.overflow = 'hidden'`, mas isso causava um "pulo" no layout devido ao desaparecimento da barra de rolagem. A solução técnica adotada foi remover a manipulação de `overflow` no JS, permitindo que a barra exista por baixo do preloader (que possui `position: fixed; inset: 0; z-index: 9999;`), garantindo estabilidade 100% no layout.
  - **Responsividade e UI Minimalista:** A tipografia da marca no preloader foi configurada usando a técnica de _Text Gradient Masking_ (`background-clip: text` com `-webkit-text-fill-color: transparent`) e implementada com a abordagem _mobile-first_: `--text-2xl` padrão para mobile e `--text-3xl` em viewports `(min-width: 768px)`, garantindo elegância sem exageros.
  - **Rede de Segurança (Fallback):** Implementado um `setTimeout` de 5 segundos fora do escopo do GSAP no `preloader.js`. Se o JS falhar ou a animação travar, o preloader é removido à força, impedindo que o usuário fique preso em uma tela bloqueada.

### PENDÊNCIAS CONHECIDAS

- **Dados de Contato Reais:** CTAs das seções FAQ, Sobre e Footer utilizam números de WhatsApp (ex: `wa.me/XXX`), URLs sociais e telefones provisórios. _Motivo:_ Aguardando fornecimento dos dados oficiais pelo cliente. _Para fechar:_ Substituir os placeholders no HTML assim que as informações forem disponibilizadas.
- **Estrutura de Serviços:** O arquivo `services.json` em `src/content/` ainda não foi criado. _Motivo:_ Foco atual foi finalização exclusiva de UI/UX base. _Para fechar:_ Criar o JSON e integrar a renderização dinâmica (se aplicável).
- **Rolagem Infinita na Seção Sobre:** A faixa institucional ainda precisa da implementação de rolagem contínua. _Motivo:_ Foco na renderização base e preloader. _Para fechar:_ Implementar animação horizontal contínua via GSAP.

### PRÓXIMA TAREFA PRINCIPAL

- **Header Dinâmico (Glassmorphism):** Implementar um estado inicial translúcido (com blur) no `.site-header` para proteger o contraste dos links sobre o vídeo da seção Hero, funcionando como um "botão de elevador", sem afetar a transição dinâmica para a classe `.is-scrolled` que já ocorre via GSAP.
- **Para ler ANTES de começar:**
  - `src/styles/base.css` -> Ler o bloco de regras iniciais de `.site-header`.
- **Perguntas a responder no próximo chat ANTES da implementação:**
  1.  Os valores de `rgba(10, 22, 40, 0.15)` para o fundo e `blur(6px)` para o filtro atendem à exata opacidade desejada, ou prefere testar variações de densidade primeiro?

### LIÇÕES TÉCNICAS DESTA SESSÃO

- **[PROMOVER PARA CLAUDE.MD] Segurança em Overlays Bloqueantes:** Qualquer feature que aplique uma camada opaca sobre toda a tela (como Preloaders) DEVE possuir um _fallback_ síncrono (ex: `setTimeout` vanilla JS) independente do framework de animação. Isso garante que a UI seja destravada em caso de falha de carregamento ou execução do framework (ex: GSAP).
- **[TRANSITÓRIA] Layout Shift em Modais/Preloaders:** Evitar o uso de `overflow: hidden` no `<body>` apenas para travar a tela se o elemento sobreposto for `position: fixed` e cobrir o `inset` inteiro. Deixar a rolagem nativa ativa por trás evita o pulo da scrollbar e reduz a complexidade do JS.
- **[TRANSITÓRIA] Fallback de Text Gradient:** O uso de `color: transparent` como fallback para `-webkit-background-clip: text` deixa o texto invisível em navegadores sem suporte. É aceitável em projetos modernos, mas deve ser validado conforme a matriz de suporte do projeto.
