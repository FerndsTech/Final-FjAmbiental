import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initSobre(root = document) {
  const section = root.querySelector('#sobre');
  if (!section) return () => {};

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ctx = gsap.context(() => {
    const counters = section.querySelectorAll('.sobre__stat-value:not(.sobre__stat-value--aqua)');
    const unesco = section.querySelector('.sobre__stat-value--aqua');
    const primaryState = section.querySelector('#BRBA');
    const secondaryStates = section.querySelectorAll('#BRTO, #BRPE, #BRMG');
    const calloutText = section.querySelectorAll('.sobre__map-callout-text');

    const greenVivid = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-fj-green-vivid')
      .trim();

    if (prefersReducedMotion) {
      if (primaryState) {
        primaryState.style.fill = greenVivid;
        primaryState.style.fillOpacity = 1;
      }
      secondaryStates.forEach((el) => {
        el.style.fill = greenVivid;
        el.style.fillOpacity = 0.4;
      });
      calloutText.forEach((el) => { el.style.opacity = 1; });
      return;
    }

    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top 65%', once: true },
    });

    // --- Contadores ---
    counters.forEach((el) => {
      const raw = el.textContent.trim();
      const target = parseInt(raw, 10);
      const suffix = raw.replace(/^\d+/, '');
      const padLength = raw.replace(/\D/g, '').length;
      if (Number.isNaN(target)) return;

      const counter = { value: 0 };
      el.textContent = '0'.padStart(padLength, '0') + suffix;

      tl.to(counter, {
        value: target,
        duration: 1.6,
        ease: 'power2.out',
        onUpdate: () => {
          const current = Math.floor(counter.value).toString().padStart(padLength, '0');
          el.textContent = current + suffix;
        },
      }, 0);
    });

    // --- Reveal "UNESCO" no stat da direita ---
    if (unesco) {
      gsap.set(unesco, { clipPath: 'inset(0 100% 0 0)' });
      tl.to(unesco, {
        clipPath: 'inset(0 0% 0 0)',
        duration: 1,
        ease: 'power2.inOut',
      }, 0.2);
    }

    // --- Bahia: verde sólido (sede) ---
    if (primaryState) {
      tl.to(primaryState, {
        fill: greenVivid,
        fillOpacity: 1,
        duration: 0.8,
        ease: 'power2.out',
      }, 0.15);
    }

    // --- TO/PE/MG: mesmo verde, translúcido, em stagger ---
    if (secondaryStates.length) {
      tl.to(secondaryStates, {
        fill: greenVivid,
        fillOpacity: 0.4,
        duration: 0.8,
        ease: 'power2.out',
        stagger: 0.15,
      }, 0.3);
    }

    // --- Callout UNESCO/México no mapa ---
    if (calloutText.length) {
      tl.to(calloutText, {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
      }, 0.7);
    }
  }, root);

  return () => ctx.revert();
}