export function initHero(root = document) {
  const video = root.querySelector('.hero__video');
  if (!video) return () => {};

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  function applyMotionPreference() {
    if (prefersReduced.matches) {
      video.pause();
    } else {
      const promise = video.play();
      if (promise !== undefined) {
        promise.catch(() => {
          // Autoplay bloqueado pelo browser — fundo navy serve como fallback
        });
      }
    }
  }

  // Remove autoplay do DOM para garantir que o browser não inicie antes do JS
  // (só faz diferença em browsers que respeitam autoplay antes do JS rodar)
  if (prefersReduced.matches) {
    video.removeAttribute('autoplay');
  }

  applyMotionPreference();
  prefersReduced.addEventListener('change', applyMotionPreference);

  return () => {
    prefersReduced.removeEventListener('change', applyMotionPreference);
    video.pause();
  };
}
