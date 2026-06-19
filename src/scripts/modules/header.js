/**
 * header.js — Shrinking header + Header Adaptativo (tema claro/escuro)
 *
 * Adiciona/remove .is-scrolled no .site-header usando ScrollTrigger.
 * A classe ativa estilos CSS: backdrop-blur, bg translúcido, altura reduzida.
 *
 * Adiciona/remove .is-light quando o scroll passa por sections [data-theme="light"].
 *
 * Sem animação própria aqui — tudo é CSS transition ativado pela classe.
 * O CSS já respeita prefers-reduced-motion (transition: none).
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initHeader(root = document) {
  const header = root.querySelector('.site-header');
  const hero   = root.querySelector('.hero');

  if (!header) return () => {};

  const ctx = gsap.context(() => {
    ScrollTrigger.create({
      trigger: hero || document.body,
      start: hero ? 'bottom top' : 'top -100px',
      onToggle: (self) => {
        header.classList.toggle('is-scrolled', self.isActive);
      },
    });

    const lightSections = root.querySelectorAll('[data-theme="light"]');

    lightSections.forEach((section) => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top ' + header.offsetHeight,
        end:   'bottom ' + header.offsetHeight,
        onEnter:     () => header.classList.add('is-light'),
        onLeave:     () => header.classList.remove('is-light'),
        onEnterBack: () => header.classList.add('is-light'),
        onLeaveBack: () => header.classList.remove('is-light'),
      });
    });
  }, root);

  return () => ctx.revert();
}
