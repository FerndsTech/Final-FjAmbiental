/**

clients.js — Faixa de logos (marquee infinito) da Section Clientes

A segunda metade da faixa é gerada aqui via JS, clonando os nós reais
de .clients__track e inserindo-os como irmãos diretos das imagens
originais — sem wrapper intermediário. Evita depender de
display: contents (suporte inconsistente entre navegadores em
combinação com elementos animados) para simular que os clones são
itens diretos do flex pai; agora eles literalmente são.

Cada clone recebe o atributo data-clients-clone para diferenciá-lo
dos 12 originais (usado no cleanup e em reinicializações via HMR).

Sob prefers-reduced-motion, a animação é desligada via CSS e a
clonagem nem roda — sem animação, duplicar 12 imagens não tem função.
*/

export function initClients(root = document) {
  const section = root.querySelector('.clients');
  if (!section) return () => {};
  const track = section.querySelector('.clients__track');
  if (!track) return () => {};
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;
  if (prefersReducedMotion) {
    return () => {};
  }
  const originals = Array.from(track.children).filter(
    (el) => !el.hasAttribute('data-clients-clone'),
  );
  originals.forEach((el) => {
    const clone = el.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.setAttribute('alt', '');
    clone.setAttribute('data-clients-clone', 'true');
    track.appendChild(clone);
  });
  return function cleanupClients() {
    track.querySelectorAll('[data-clients-clone]').forEach((el) => el.remove());
  };
}
