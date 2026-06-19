/**
 * header.js — Shrinking header ao sair da Hero Section
 *
 * Adiciona/remove .is-scrolled no .site-header usando ScrollTrigger.
 * A classe ativa estilos CSS: backdrop-blur, bg translúcido, altura reduzida.
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

  if (!header || !hero) return () => {};

  const ctx = gsap.context(() => {
    ScrollTrigger.create({
      trigger: hero,
      start: 'bottom top', // ativa quando o fundo da Hero ultrapassa o topo da viewport
      onToggle: (self) => {
        header.classList.toggle('is-scrolled', self.isActive);
      },
    });
  }, root);

  return () => ctx.revert();
}
