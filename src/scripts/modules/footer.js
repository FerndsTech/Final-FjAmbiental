import { getLenis } from './smooth-scroll.js';

export function initFooterNav() {
  const homeLink = document.querySelector('.footer__nav-list a[href="/"]');
  if (!homeLink) return () => {};

  function handleHomeClick(e) {
    const isHome = ['/', '/index.html'].includes(window.location.pathname);
    if (!isHome) return; // outra página: navegação normal, sem interceptar

    e.preventDefault();
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0);
    } else {
      // prefers-reduced-motion: Lenis não inicializou — vai ao topo sem animação
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  homeLink.addEventListener('click', handleHomeClick);
  return () => homeLink.removeEventListener('click', handleHomeClick);
}
