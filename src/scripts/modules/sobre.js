import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initSobre(root = document) {
  const section = root.querySelector('#sobre');
  if (!section) return () => {};

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ctx = gsap.context(() => {
    // --- Contadores (100+, 15+, 04) ---
    const counters = section.querySelectorAll('.sobre__stat-value:not(.sobre__stat-value--aqua)');

    counters.forEach((el) => {
      const raw = el.textContent.trim();
      const target = parseInt(raw, 10);
      const suffix = raw.replace(/^\d+/, ''); // "+" ou "" (mantém "04" com zero à esquerda via padStart)
      const padLength = raw.replace(/\D/g, '').length;

      if (prefersReducedMotion || Number.isNaN(target)) return;

      const counter = { value: 0 };
      el.textContent = '0'.padStart(padLength, '0') + suffix;

      gsap.to(counter, {
        value: target,
        duration: 1.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: section, start: 'top 70%', once: true },
        onUpdate: () => {
          const current = Math.floor(counter.value).toString().padStart(padLength, '0');
          el.textContent = current + suffix;
        },
      });
    });

    // --- Reveal "UNESCO" esquerda → direita ---
    const unesco = section.querySelector('.sobre__stat-value--aqua');
    if (unesco && !prefersReducedMotion) {
      gsap.set(unesco, { clipPath: 'inset(0 100% 0 0)' });
      gsap.to(unesco, {
        clipPath: 'inset(0 0% 0 0)',
        duration: 1,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: section, start: 'top 70%', once: true },
      });
    }

    // --- Stagger dos marcadores do mapa ---
    const markers = section.querySelectorAll('.sobre__map-dot, .sobre__map-ba-pin, .sobre__map-ba-label, .sobre__map-state-label');
    if (markers.length && !prefersReducedMotion) {
      gsap.to(markers, {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.12,
        scrollTrigger: { trigger: section, start: 'top 60%', once: true },
      });
    }
  }, root);

  return () => ctx.revert();
}