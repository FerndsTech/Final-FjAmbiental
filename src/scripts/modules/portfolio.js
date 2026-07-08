/**
 * portfolio.js — Carrossel da section Portfólio (4 projetos fixos)
 *
 * Abordagem: JS define valores; crossfade sutil via GSAP na troca de
 * conteúdo do card featured (mesmo padrão de gsap.context()/cleanup de
 * sobre.js). Thumbnails e barra Explorar trocam instantaneamente (sem
 * fade), para dar resposta imediata ao clique — só o conteúdo do card
 * (imagem, tags, coords, meta, headline, descrição, stats) recebe o fade.
 */

import gsap from 'gsap';
import projectsData from '../../content/projects.json';

const IMG_BASE = './src/assets/imgs/';
const AUTO_ADVANCE_MS = 5000;

export function initPortfolio(root = document) {
  const section = root.querySelector('#portfolio');
  if (!section) return () => {};

  const projects = projectsData.projects.slice(0, 4);
  const thumbs = Array.from(section.querySelectorAll('.portfolio__thumb'));
  if (projects.length !== thumbs.length) return () => {};

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const featured      = section.querySelector('.portfolio__featured');
  const img           = featured.querySelector('.portfolio__featured-img');
  const tagPrimary    = featured.querySelector('.portfolio__tag-primary');
  const tagSecondary  = featured.querySelector('.portfolio__tag-secondary');
  const coords        = featured.querySelector('.portfolio__featured-coords');
  const metaEl        = featured.querySelector('.portfolio__featured-meta');
  const metaCliente   = featured.querySelector('.portfolio__meta-cliente');
  const metaAno       = featured.querySelector('.portfolio__meta-ano');
  const metaLocal     = featured.querySelector('.portfolio__meta-local');

  const headlineL1 = section.querySelector('.portfolio__headline-l1');
  const headlineL2 = section.querySelector('.portfolio__headline-l2');
  const desc       = section.querySelector('.portfolio__desc');
  const statEls    = Array.from(section.querySelectorAll('.portfolio__stat'));

  const explorerFill  = section.querySelector('.portfolio__explore-fill');
  const explorerCount = section.querySelector('.portfolio__explore-count');

  const prevBtn = section.querySelector('.portfolio__arrow--prev');
  const nextBtn = section.querySelector('.portfolio__arrow--next');

  let current = 0;
  let timer = null;
  let ctx;

  // Elementos que recebem o crossfade — thumbs e barra Explorar ficam de
  // fora de propósito, trocam instantaneamente (resposta imediata ao clique).
  const fadeTargets = [img, tagPrimary, tagSecondary, coords, metaEl, headlineL1, headlineL2, desc, ...statEls];

  function updateContent(index) {
    const p = projects[index];

    img.src = IMG_BASE + p.image;
    img.alt = p.titulo;
    tagPrimary.textContent = p.tag_primaria;
    tagSecondary.textContent = p.tag_secundaria;
    coords.textContent = p.coords;
    metaCliente.textContent = p.cliente;
    metaAno.textContent = p.ano;
    metaLocal.textContent = p.local;

    headlineL1.textContent = p.headline_l1;
    headlineL2.textContent = p.headline_l2;
    desc.textContent = p.descricao;

    statEls.forEach((el, i) => {
      const s = p.stats[i];
      el.querySelector('.portfolio__stat-label').textContent = s.label;
      // dd tem um text node (valor) + <span> aninhado (unidade) — mantém o span intacto
      el.querySelector('.portfolio__stat-value').firstChild.textContent = s.valor + ' ';
      el.querySelector('.portfolio__stat-unit').textContent = s.unidade;
    });
  }

  function updateNav(index) {
    thumbs.forEach((t, i) => {
      t.classList.toggle('is-active', i === index);
      t.setAttribute('aria-current', i === index ? 'true' : 'false');
    });

    const pct = ((index + 1) / projects.length) * 100;
    explorerFill.style.width = pct + '%';
    explorerCount.textContent = `0${index + 1} / 0${projects.length}`;
  }

  function crossfade(index) {
    if (prefersReducedMotion) {
      updateContent(index);
      return;
    }
    gsap.killTweensOf(fadeTargets);
    ctx.add(() => {
      gsap.to(fadeTargets, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          updateContent(index);
          gsap.fromTo(fadeTargets, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power3.out' });
        },
      });
    });
  }

  function goTo(index, resetTimer = true) {
    const next = (index + projects.length) % projects.length;
    crossfade(next);
    updateNav(next);
    current = next;
    if (resetTimer) restartTimer();
  }

  function startTimer() {
    if (prefersReducedMotion) return;
    timer = setInterval(() => goTo(current + 1, false), AUTO_ADVANCE_MS);
  }
  function stopTimer() {
    clearInterval(timer);
    timer = null;
  }
  function restartTimer() {
    stopTimer();
    startTimer();
  }

  // --- Handlers (referências nomeadas para cleanup, padrão de faq.js) ---
  const thumbHandlers = thumbs.map((t, i) => {
    const handler = () => goTo(i);
    t.addEventListener('click', handler);
    return handler;
  });

  function onPrev() { goTo(current - 1); }
  function onNext() { goTo(current + 1); }
  prevBtn?.addEventListener('click', onPrev);
  nextBtn?.addEventListener('click', onNext);

  // Pausa no hover/focus (dentro da section inteira)
  function pause() { stopTimer(); }
  function resume() { restartTimer(); }
  section.addEventListener('mouseenter', pause);
  section.addEventListener('mouseleave', resume);
  section.addEventListener('focusin', pause);
  section.addEventListener('focusout', resume);

  // --- Estado inicial ---
  ctx = gsap.context(() => {}, section);
  updateContent(0);
  updateNav(0);
  startTimer();

  return function cleanupPortfolio() {
    stopTimer();
    thumbs.forEach((t, i) => t.removeEventListener('click', thumbHandlers[i]));
    prevBtn?.removeEventListener('click', onPrev);
    nextBtn?.removeEventListener('click', onNext);
    section.removeEventListener('mouseenter', pause);
    section.removeEventListener('mouseleave', resume);
    section.removeEventListener('focusin', pause);
    section.removeEventListener('focusout', resume);
    ctx.revert();
  };
}