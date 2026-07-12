/**
 * back-to-top.js — Botão "voltar ao topo"
 *
 * Visibilidade controlada por ScrollTrigger com o Hero como trigger
 * (mesmo padrão de header.js: 'bottom top' = passou da primeira dobra).
 * Clique usa Lenis (getLenis()) quando ativo, para não conflitar com o
 * smooth scroll sincronizado — armadilha §4.5 do CLAUDE.md. Sem Lenis
 * (prefers-reduced-motion), cai para scroll nativo.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getLenis } from './smooth-scroll.js';

gsap.registerPlugin(ScrollTrigger);

export function initBackToTop(root = document) {
  const button = root.querySelector('.back-to-top');
  const hero = root.querySelector('.hero');

  if (!button) return () => {};

  const ctx = gsap.context(() => {
    ScrollTrigger.create({
      trigger: hero || document.body,
      start: hero ? 'bottom top' : 'top -100px',
      end: 'max',
      onToggle: (self) => {
        button.classList.toggle('is-visible', self.isActive);
      },
    });
  }, root);

  function handleClick() {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { duration: 2.5 });
      return;
    }
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }

  button.addEventListener('click', handleClick);

  return () => {
    button.removeEventListener('click', handleClick);
    ctx.revert();
  };
}
