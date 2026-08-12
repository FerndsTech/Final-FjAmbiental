# PENDENCIAS.md — o que ainda não é issue

> **O backlog de engenharia mudou de casa.** Ele agora vive no issue
> tracker do repo — GitHub Issues, ver `docs/agents/issue-tracker.md`.
> Não abra tarefa de código aqui.
>
> ```
> gh issue list --state open
> ```
>
> Este arquivo guarda só as duas categorias que **não cabem** numa issue
> hoje. Quando um item daqui virar trabalho de verdade, ele vira issue e
> sai desta lista.

---

## 1. Espera por input do cliente

Não são trabalho de código: são bloqueios externos. Ficam fora do tracker
porque o repo é público e o assunto é a relação com o cliente, não a
engenharia.

- [ ] **Número de WhatsApp real** — substituir `5571XXXXXXXXX`. Usado em
      **2 lugares** (CTA da Section FAQ e da Section Sobre); ao trocar,
      checar os dois.
- [ ] **URLs das redes sociais** — Instagram e LinkedIn no Footer
      (`href="#"` hoje)
- [ ] **Telefone do Footer** — `(71) 3000-0000` parece placeholder;
      confirmar o número real
- [ ] **Tagline do Footer** — confirmar o texto "Consultoria ambiental e
      recursos hídricos desde 2010..."

Quando o WhatsApp real chegar, ele destrava a issue de remoção do
`data-toast-trigger` no tracker.

---

## 2. Páginas internas — ainda não mapeadas

As quatro páginas que faltam. Estão aqui, e não no tracker, de propósito:
como checkbox de uma linha elas não são issues acionáveis — não há
decisão tomada sobre estrutura, conteúdo ou seções de nenhuma delas.

- [ ] `servicos.html`
- [ ] `portfolio.html`
- [ ] `sobre.html`
- [ ] `contato.html` — também é destino do CTA "Solicitar Proposta" da
      Section Sobre (o CTA de WhatsApp usa `wa.me` externo)

**Próximo passo:** `/wayfinder` — mapear as decisões antes de virar
ticket. Ver `CLAUDE.md` §13. Quando o mapa fechar, estas quatro saem
daqui e viram issues de verdade via `/to-spec` → `/to-tickets`.

---

## Histórico

Em 11/08/2026 este arquivo tinha 17 itens e era o backlog inteiro do
projeto. Treze deles migraram para o GitHub Issues quando o
`/setup-vini-skills` configurou o tracker — os dois itens de Hero
(micro-interações e SplitType) foram fundidos numa issue só, por
descreverem o mesmo trabalho. Os oito que sobraram são os de cima.
