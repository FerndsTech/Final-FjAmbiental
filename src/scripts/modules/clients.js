/**

clients.js — Faixa de logos (marquee infinito) da Section Clientes

Arquitetura: lista única — uma só .clients__track contendo as 12 <img>
originais + N cópias clonadas em runtime (cloneNode em cada <img>, não
na track inteira). O movimento não usa CSS @keyframes — um loop de
requestAnimationFrame calcula uma única variável de posição e aplica
transform: translateX() no único elemento a cada frame.

Por que N cópias e não uma quantidade fixa: causa raiz confirmada
matematicamente (ver docs/LICOES.md #17) — com exatamente 2 cópias
(24 itens), a largura de 1 conjunto de 12 logos (setWidth) podia ser
menor que a largura visível do wrapper em telas largas, abrindo um vão
sem conteúdo sempre no mesmo ponto do ciclo, pouco antes do wrap da
posição ("espaço vazio, depois duas aparecem juntas"). O número mínimo
de conjuntos para nunca haver vão é ceil(1 + larguraWrapper /
setWidth); adicionamos 1 conjunto extra de margem de segurança.

A velocidade é calibrada pra manter a equivalência de 35s pra
percorrer a largura de 1 conjunto de 12 logos originais (setWidth). O
wrap da posição usa módulo (position %= setWidth), não um reset de
timeline — robusto mesmo se o navegador atrasar o rAF por tempo longo
(aba em background).

O cálculo do número de cópias roda só na inicialização, medindo a
largura do wrapper na carga. Não há recálculo em resize — fora de
escopo por ora; se a largura do wrapper mudar drasticamente depois da
carga (ex: rotação de tablet), o pior caso é reintroduzir o vão até o
próximo reload, não quebrar o layout.

Pausa no hover: segue o padrão de portfolio.js (handlers nomeados de
mouseenter/mouseleave, escopados ao elemento de interação — aqui
.clients__track-wrapper — com cleanup explícito). focusin/focusout
foi propositalmente omitido: não há elemento focável dentro do track
hoje, então os listeners nunca disparariam. Se a Section Clientes
ganhar um controle de pausa explícito no futuro (WCAG 2.2.2), isso
volta à mesa como decisão de acessibilidade separada.

Sob prefers-reduced-motion, nem a clonagem nem o loop rodam — sem
movimento, duplicar as logos não tem função.
*/

export function initClients(root = document) {
  const section = root.querySelector('.clients');
  if (!section) return () => {};

  const wrapper = section.querySelector('.clients__track-wrapper');
  if (!wrapper) return () => {};

  const track = wrapper.querySelector('.clients__track');
  if (!track) return () => {};

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;
  if (prefersReducedMotion) {
    return () => {};
  }

  const originalLogos = Array.from(track.querySelectorAll('.clients__logo'));
  const setWidth = track.getBoundingClientRect().width;
  const wrapperWidth = wrapper.getBoundingClientRect().width;

  const SAFETY_MARGIN_SETS = 1;
  const minSets = Math.ceil(1 + wrapperWidth / setWidth);
  const totalSets = minSets + SAFETY_MARGIN_SETS;
  const copiesNeeded = totalSets - 1; // 1 conjunto original já está no DOM

  const fragment = document.createDocumentFragment();
  for (let i = 0; i < copiesNeeded; i += 1) {
    originalLogos.forEach((img) => {
      const clone = img.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.setAttribute('data-clients-clone', 'true');
      clone.setAttribute('alt', '');
      fragment.appendChild(clone);
    });
  }
  track.appendChild(fragment);

  const DURATION_S = 35;
  const speed = setWidth / DURATION_S; // px por segundo

  let position = 0;
  let lastTimestamp = null;
  let isPaused = false;
  let rafId = null;

  function tick(timestamp) {
    if (lastTimestamp === null) lastTimestamp = timestamp;
    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (!isPaused) {
      position = (position + speed * delta) % setWidth;
      track.style.transform = `translateX(-${position}px)`;
    }

    rafId = requestAnimationFrame(tick);
  }
  rafId = requestAnimationFrame(tick);

  function pause() { isPaused = true; }
  function resume() { isPaused = false; }
  wrapper.addEventListener('mouseenter', pause);
  wrapper.addEventListener('mouseleave', resume);

  return function cleanupClients() {
    cancelAnimationFrame(rafId);
    wrapper.removeEventListener('mouseenter', pause);
    wrapper.removeEventListener('mouseleave', resume);
    track.querySelectorAll('[data-clients-clone]').forEach((el) => el.remove());
  };
}
