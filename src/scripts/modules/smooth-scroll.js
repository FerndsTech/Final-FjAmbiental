/**
 * smooth-scroll.js — Lenis + GSAP ScrollTrigger sincronizados
 *
 * Este é o pattern canônico. NÃO modifique sem entender exatamente o que
 * cada peça faz — esta é a armadilha #5 do CLAUDE.md.
 *
 * Flow:
 * 1. Lenis emite evento 'scroll' a cada frame
 * 2. ScrollTrigger.update() é chamado, sincronizando animações de scroll
 * 3. GSAP ticker fica responsável pelo loop de animação (single source)
 * 4. lagSmoothing(0) desativa correção automática que prejudica sync
 *
 * prefers-reduced-motion: Lenis simplesmente não inicializa. Scroll volta a
 * ser nativo do navegador. GSAP ScrollTrigger continua funcionando normal.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// Instância vive no escopo do módulo — acessível via getLenis()
let _lenis = null;

export function getLenis() {
  return _lenis;
}

export function initSmoothScroll() {
  // Respeitar preferência do usuário — não-negociável.
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    return () => {};
  }

  _lenis = new Lenis({
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false, // Mobile usa scroll nativo — mais fluido em touch
    touchMultiplier: 2,
    infinite: false,
  });

  // Sincroniza Lenis com ScrollTrigger
  _lenis.on('scroll', ScrollTrigger.update);

  // GSAP ticker dirige o requestAnimationFrame loop
  function raf(time) {
    _lenis.raf(time * 1000);
  }
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);

  // Cleanup function (importante para Astro islands na Fase 2)
  return () => {
    gsap.ticker.remove(raf);
    _lenis.destroy();
    _lenis = null;
    ScrollTrigger.refresh();
  };
}
