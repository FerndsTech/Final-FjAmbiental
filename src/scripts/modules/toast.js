import { gsap } from 'gsap';

export function initToast() {
  const triggers = document.querySelectorAll('[data-toast-trigger]');
  if (triggers.length === 0) return;

  const toastHTML = `
    <div class="fj-toast" role="status" aria-live="polite">
      <svg class="fj-toast__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
      </svg>
      <span>Módulo em desenvolvimento</span>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', toastHTML);
  const toastEl = document.querySelector('.fj-toast');

  let toastTimeout;

  const handleClick = (e) => {
    e.preventDefault();
    const btn = e.currentTarget;

    gsap.fromTo(btn,
      { x: 0 },
      { x: 8, duration: 0.4, ease: "elastic.out(2, 0.2)", clearProps: "x" }
    );

    gsap.killTweensOf(toastEl);
    clearTimeout(toastTimeout);

    gsap.to(toastEl, {
      y: 0,
      opacity: 1,
      duration: 0.4,
      ease: "power3.out"
    });

    toastTimeout = setTimeout(() => {
      gsap.to(toastEl, {
        y: 20,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in"
      });
    }, 2500);
  };

  triggers.forEach(trigger => trigger.addEventListener('click', handleClick));

  return () => {
    triggers.forEach(trigger => trigger.removeEventListener('click', handleClick));
    toastEl?.remove();
    clearTimeout(toastTimeout);
  };
}
