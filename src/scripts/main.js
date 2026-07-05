/**
 * main.js — Entry point JavaScript
 *
 * Responsabilidades:
 * 1. Importar CSS principal e fontes
 * 2. Inicializar módulos (smooth scroll, reveal, futuras features)
 * 3. Coordenar cleanup quando necessário
 *
 * Disciplina: nada de DOM manipulation aqui — só orquestração de módulos.
 */

// === Estilos ===
import '../styles/main.css';

// === Fontes (self-hosted via @fontsource) ===
// Carrega apenas pesos que vamos usar — performance budget.
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-mono/400.css';

// === Módulos ===
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initHeader } from './modules/header.js';
import { initHero } from './modules/hero.js';
import { initSmoothScroll } from './modules/smooth-scroll.js';
import { initReveal } from './modules/reveal.js';
import { initFaq } from './modules/faq.js';
import { initFooterNav } from './modules/footer.js';
import { initMobileNav } from './modules/mobile-nav.js';

// === Inicialização ===
// Cada init retorna função de cleanup para suporte futuro a View Transitions.
const cleanups = [];

function init() {
  cleanups.push(initSmoothScroll()); // Lenis primeiro — ScrollTrigger depende do scroller
  cleanups.push(initHero());
  cleanups.push(initHeader());       // ScrollTrigger do header criado após Lenis estar ativo
  cleanups.push(initReveal());
  cleanups.push(initFaq());
  cleanups.push(initFooterNav());
  cleanups.push(initMobileNav());
  setTimeout(() => { requestAnimationFrame(() => ScrollTrigger.refresh()); }, 100);

  if (import.meta.env.DEV) {
    console.log('[FJ] Modules initialized');
  }
}

function cleanup() {
  cleanups.forEach(fn => typeof fn === 'function' && fn());
  cleanups.length = 0;
}

// Aguarda DOM pronto. `defer` no script já garante isso, mas é seguro garantir.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}

// Cleanup em HMR (dev only)
if (import.meta.hot) {
  import.meta.hot.dispose(cleanup);
}
