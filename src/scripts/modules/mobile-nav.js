/**
 * mobile-nav.js — Menu mobile do header (painel lateral direito)
 *
 * Controla abrir/fechar do painel #mobile-nav via: clique no botão
 * .nav-toggle (que também alterna ícone hamburguer/X via CSS +
 * aria-expanded), clique no overlay, clique em qualquer link do
 * painel, tecla Esc, ou resize da janela para desktop (≥768px).
 * Trava o scroll do body enquanto o menu está aberto.
 */

export function initMobileNav(root = document) {
  const toggle  = root.querySelector('.nav-toggle');
  const panel   = root.querySelector('#mobile-nav');
  const overlay  = root.querySelector('.mobile-nav-overlay');
  const closeBtn = root.querySelector('.mobile-nav__close');

  if (!toggle || !panel || !overlay) return () => {};

  function openMenu() {
    panel.classList.add('is-open');
    overlay.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    panel.classList.remove('is-open');
    overlay.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') closeMenu();
  }

  function handleResize() {
    if (window.innerWidth >= 768) closeMenu();
  }

  const links = Array.from(panel.querySelectorAll('a'));

  toggle.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', closeMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  links.forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', handleKeydown);
  window.addEventListener('resize', handleResize);

  return function cleanupMobileNav() {
    toggle.removeEventListener('click', toggleMenu);
    overlay.removeEventListener('click', closeMenu);
    if (closeBtn) closeBtn.removeEventListener('click', closeMenu);
    links.forEach(link => link.removeEventListener('click', closeMenu));
    document.removeEventListener('keydown', handleKeydown);
    window.removeEventListener('resize', handleResize);
    document.body.style.overflow = '';
  };
}
