/**
 * faq.js — Acordeão da section FAQ
 *
 * Abordagem: CSS transition em max-height, JS apenas para:
 * 1. Medir scrollHeight real e aplicar como max-height inline
 * 2. Toggle de .is-open + aria-expanded
 * 3. Um card aberto por vez (one-open-at-a-time)
 *
 * Sem GSAP — a transição visual é 100% CSS (transition: max-height em base.css).
 */

export function initFaq(root = document) {
  const grid = root.querySelector('.faq__grid');
  if (!grid) return () => {};

  const cards = Array.from(grid.querySelectorAll('.faq__card'));
  if (!cards.length) return () => {};

  // --- Funções de estado ---

  function openCard(card) {
    const btn    = card.querySelector('.faq__question');
    const answer = card.querySelector('.faq__answer');
    card.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    answer.style.maxHeight = answer.scrollHeight + 'px';
  }

  function closeCard(card) {
    const btn    = card.querySelector('.faq__question');
    const answer = card.querySelector('.faq__answer');
    answer.style.maxHeight = '0px';
    card.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
  }

  // --- Handlers de click (referências nomeadas para cleanup) ---

  function makeClickHandler(card) {
    return function onFaqClick() {
      if (card.classList.contains('is-open')) {
        closeCard(card);
      } else {
        // Fecha qualquer outro card aberto antes de abrir o clicado
        cards.forEach(other => {
          if (other !== card && other.classList.contains('is-open')) {
            closeCard(other);
          }
        });
        openCard(card);
      }
    };
  }

  const handlers = new Map(); // btn → handler (para removeEventListener)

  cards.forEach(card => {
    const btn     = card.querySelector('.faq__question');
    const handler = makeClickHandler(card);
    handlers.set(btn, handler);
    btn.addEventListener('click', handler);
  });

  // --- Estado inicial: aplica scrollHeight no card já aberto no HTML ---
  // Substitui o max-height: 300px provisório do CSS pelo valor real medido.
  cards.forEach(card => {
    if (card.classList.contains('is-open')) {
      const answer = card.querySelector('.faq__answer');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });

  // --- Resize: re-mede o card aberto se a janela mudar ---
  // (ex: texto quebra em mais/menos linhas em viewport diferente)
  let resizeTimer;

  function handleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const currentOpen = grid.querySelector('.faq__card.is-open');
      if (!currentOpen) return;
      const answer = currentOpen.querySelector('.faq__answer');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }, 200);
  }

  window.addEventListener('resize', handleResize);

  // --- Cleanup ---
  return function cleanupFaq() {
    handlers.forEach((handler, btn) => {
      btn.removeEventListener('click', handler);
    });
    handlers.clear();
    window.removeEventListener('resize', handleResize);
    clearTimeout(resizeTimer);
  };
}
