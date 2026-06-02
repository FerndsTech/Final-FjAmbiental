/**
 * reveal.js — Animações de entrada no scroll
 *
 * Pattern declarativo: HTML usa atributos data-reveal para optar pela animação.
 * Permite reveals sem JS-side selectors específicos por feature.
 *
 * Uso no HTML:
 *
 *   <h2 data-reveal>Título que aparece com fade-up</h2>
 *
 *   <div data-reveal data-reveal-delay="0.2">Com delay</div>
 *
 *   <ul data-reveal-stagger>
 *     <li>Cada filho anima em sequência</li>
 *     <li>Stagger automático de 80ms</li>
 *     <li>Sem precisar de classe extra</li>
 *   </ul>
 *
 * Disciplina: toda animação dentro de gsap.context() — armadilha #4 do CLAUDE.md.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initReveal(root = document) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    return () => {};
  }

  const ctx = gsap.context(() => {
    // === Fade-up individual ===
    const revealEls = root.querySelectorAll('[data-reveal]:not([data-reveal-stagger])');

    revealEls.forEach(el => {
      const delay = parseFloat(el.dataset.revealDelay) || 0;

      gsap.from(el, {
        y: 24,
        opacity: 0,
        duration: 0.8,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
      });
    });

    // === Stagger em containers ===
    const staggerContainers = root.querySelectorAll('[data-reveal-stagger]');

    staggerContainers.forEach(container => {
      const children = Array.from(container.children);
      const staggerAmount = parseFloat(container.dataset.staggerAmount) || 0.08;

      gsap.from(children, {
        y: 32,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
        stagger: staggerAmount,
        scrollTrigger: {
          trigger: container,
          start: 'top 80%',
          once: true,
        },
      });
    });
  }, root);

  return () => ctx.revert();
}
