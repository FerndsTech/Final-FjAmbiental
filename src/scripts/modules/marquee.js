/**

marquee.js — Motor genérico de faixa infinita (marquee)

Extraído de clients.js depois que a Section Sobre precisou do mesmo
comportamento (issue #5). A causa raiz do stutter documentada em
docs/LICOES.md #17 é matemática, não visual — reimplementá-la em cada
section seria convidar o mesmo bug de volta. Este módulo é o único lugar
do projeto onde essa matemática mora.

Arquitetura: faixa única. Uma só `track` contendo os itens originais + N
conjuntos clonados em runtime (cloneNode em cada item, nunca na track
inteira). O movimento não usa CSS @keyframes — um loop de
requestAnimationFrame calcula uma única variável de posição e aplica
transform: translateX() na track a cada frame.

Por que N conjuntos e não uma quantidade fixa (docs/LICOES.md #17): com
exatamente 2 conjuntos, a largura de 1 conjunto (setWidth) pode ser menor
que a largura visível do viewport em telas largas, abrindo um vão sem
conteúdo sempre no mesmo ponto do ciclo, pouco antes do wrap da posição
("espaço vazio, depois dois itens aparecendo juntos"). O mínimo para nunca
haver vão é ceil(1 + larguraViewport / setWidth); somamos 1 conjunto extra
de margem de segurança.

Contrato de CSS que o chamador precisa cumprir:

- `viewport` com `overflow: hidden` e `position: relative`.
- `track` com `display: flex`, `flex-wrap: nowrap` e `width: max-content`.
- Espaçamento entre itens via `margin-right` no ITEM, nunca via `gap` na
  track. Com `gap`, a largura de 1 conjunto medida antes da clonagem é
  `soma(itens) + gap * (n-1)`, mas o período real de repetição depois da
  clonagem é `soma(itens) + gap * n` — a costura ganha um gap que o
  setWidth não contabiliza, e o wrap salta a largura de um gap. Com
  `margin-right` os dois valores coincidem por construção.

O wrap da posição usa módulo (`position %= setWidth`), não reset de
timeline — robusto mesmo se o navegador atrasar o rAF por muito tempo
(aba em background).

Por que a medição espera `document.fonts.ready`: setWidth é medido uma vez
e vira, ao mesmo tempo, a velocidade (setWidth / durationS) e a distância
do wrap (position %= setWidth). Numa faixa de TEXTO, medir antes do swap
da webfont congela um setWidth menor que o período real de repetição — e
o resultado é um salto visível na costura a cada volta, o mesmo sintoma
da lição #17 por outro caminho. Medido em produção na faixa da Section
Sobre: 1143px antes das fontes, 1216px depois (~6% de erro, ~73px de
salto por ciclo). Faixas de imagem com width/height intrínsecos não
sofrem disso, mas esperar não custa nada para elas.

O cálculo do número de cópias roda só uma vez, medindo a largura do
viewport nesse momento. Não há recálculo em resize — fora de escopo; se a
largura mudar drasticamente depois da carga (rotação de tablet), o pior
caso é reintroduzir o vão até o próximo reload, não quebrar o layout.

Pausa no hover escopada ao `viewport`, não à section (CLAUDE.md §4.27).
Não há pausa por foco: nenhuma das duas faixas tem elemento focável
dentro da track hoje, então os listeners nunca disparariam. **Isso não
satisfaz a WCAG 2.2.2 (Pause, Stop, Hide, Nível A)**, que pede um
mecanismo de pausa alcançável por teclado — um botão, não um listener.
A lacuna é anterior a este módulo (nasceu na Section Clientes) e está
registrada em docs/PADROES-UI.md §12.4 como pendência de acessibilidade.

Sob prefers-reduced-motion nada roda — nem clonagem, nem loop. Sem
movimento, duplicar o conteúdo não tem função, e o layout estático fica
por conta do CSS do chamador. A preferência é **observada ao vivo**: se
o usuário ligá-la com a página aberta, o loop para e os clones saem do
DOM, para o JS não discordar do `@media` do CSS do chamador (que reage
na hora). Desligar reconstrói a faixa.
*/

const SAFETY_MARGIN_SETS = 1;

/**
 * @param {object} options
 * @param {HTMLElement} options.viewport   Elemento com overflow: hidden.
 * @param {HTMLElement} options.track      Faixa que recebe o translateX.
 * @param {string} options.itemSelector    Seletor dos itens originais dentro da track.
 * @param {number} options.durationS       Segundos para percorrer 1 conjunto.
 * @param {string} [options.cloneAttr]     data-attribute que marca os clones.
 * @param {(clone: HTMLElement) => void} [options.onClone] Ajuste extra por clone.
 * @returns {() => void} cleanup
 */
export function initMarquee({
  viewport,
  track,
  itemSelector,
  durationS,
  cloneAttr = 'data-marquee-clone',
  onClone,
} = {}) {
  const noop = () => {};
  if (!viewport || !track || !itemSelector || !durationS) return noop;

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  let teardown = null;
  let cancelled = false;
  let fontsReady = false;

  function start() {
    if (cancelled || teardown || motionQuery.matches) return;
    teardown = setup();
  }

  function stop() {
    if (!teardown) return;
    teardown();
    teardown = null;
  }

  function onMotionPreferenceChange() {
    if (motionQuery.matches) stop();
    else if (fontsReady) start();
  }
  motionQuery.addEventListener('change', onMotionPreferenceChange);

  function onFontsReady() {
    fontsReady = true;
    start();
  }

  if (document.fonts) {
    document.fonts.ready.then(onFontsReady);
  } else {
    onFontsReady();
  }

  return function cleanupMarquee() {
    cancelled = true;
    motionQuery.removeEventListener('change', onMotionPreferenceChange);
    stop();
  };

  function setup() {
    const originalItems = Array.from(track.querySelectorAll(itemSelector));
    if (!originalItems.length) return noop;

    const setWidth = track.getBoundingClientRect().width;
    const viewportWidth = viewport.getBoundingClientRect().width;
    // Track sem layout (ex: section dentro de um ancestral display:none):
    // clonar com setWidth 0 geraria divisão por zero no cálculo de conjuntos.
    // Desistimos em silêncio, sem retry e sem ResizeObserver — nenhuma das
    // duas faixas do site nasce escondida, então observar seria abstração
    // sem consumidor. Se alguma section futura montar escondida, a faixa
    // simplesmente não anima, e o lugar de resolver é aqui.
    if (setWidth <= 0) return noop;

    const totalSets = Math.ceil(1 + viewportWidth / setWidth) + SAFETY_MARGIN_SETS;
    const copiesNeeded = totalSets - 1; // 1 conjunto original já está no DOM

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < copiesNeeded; i += 1) {
      originalItems.forEach((item) => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.setAttribute(cloneAttr, 'true');
        if (typeof onClone === 'function') onClone(clone);
        fragment.appendChild(clone);
      });
    }
    track.appendChild(fragment);

    const speed = setWidth / durationS; // px por segundo

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

    viewport.addEventListener('mouseenter', pause);
    viewport.addEventListener('mouseleave', resume);

    return function stopMarquee() {
      cancelAnimationFrame(rafId);
      viewport.removeEventListener('mouseenter', pause);
      viewport.removeEventListener('mouseleave', resume);
      track.querySelectorAll(`[${cloneAttr}]`).forEach((el) => el.remove());
      track.style.transform = '';
    };
  }
}
