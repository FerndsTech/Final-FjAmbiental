import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initPreloader(root = document) {
  const preloader = root.getElementById('preloader');
  const counter = preloader?.querySelector('.preloader__counter');

  if (!preloader || !counter) return () => {};

  document.body.style.overflow = 'hidden';

  const safetyTimer = setTimeout(() => {
    if (preloader.style.display !== 'none') {
      preloader.style.display = 'none';
      document.body.style.overflow = '';
      ScrollTrigger.refresh();
    }
  }, 5000);

  const ctx = gsap.context(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", () => {
      clearTimeout(safetyTimer);
      preloader.style.display = 'none';
      document.body.style.overflow = '';
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({
        onComplete: () => {
          clearTimeout(safetyTimer);
          document.body.style.overflow = '';
          ScrollTrigger.refresh();
        }
      });

      const progress = { value: 0 };

      tl.to(progress, {
        value: 100,
        duration: 1.8,
        ease: 'power3.inOut',
        onUpdate: () => {
          counter.textContent = `${Math.round(progress.value)}%`;
        }
      })
      .to(preloader, {
        yPercent: -100,
        duration: 0.8,
        ease: 'power3.inOut'
      });
    });
  }, root);

  return () => ctx.revert();
}
