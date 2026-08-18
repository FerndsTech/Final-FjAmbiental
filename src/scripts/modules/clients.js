/**

clients.js — Faixa de logos (marquee infinito) da Section Clientes

O motor de movimento (clonagem dinâmica + loop de rAF + wrap por módulo)
vive em marquee.js, compartilhado com a faixa institucional da Section
Sobre. A matemática do número de cópias — causa raiz do stutter
documentado em docs/LICOES.md #17 — está descrita lá; este módulo só
descreve a faixa.

Contrato de CSS cumprido por `.clients__track` / `.clients__logo`
(base.css § Section Clientes): track em `flex` + `width: max-content`,
espaçamento via `margin-right` no logo (nunca `gap` — ver marquee.js).

`alt` é zerado nos clones: o texto alternativo de cada logo já foi
anunciado uma vez pelo conjunto original.

`pauseOnFocus` fica desligado: não há elemento focável dentro do track
hoje, então os listeners nunca disparariam. Se a Section Clientes ganhar
um controle de pausa explícito no futuro (WCAG 2.2.2), isso volta à mesa
como decisão de acessibilidade separada.
*/

import { initMarquee } from './marquee.js';

const DURATION_S = 35;

export function initClients(root = document) {
  const section = root.querySelector('.clients');
  if (!section) return () => {};

  const wrapper = section.querySelector('.clients__track-wrapper');
  if (!wrapper) return () => {};

  const track = wrapper.querySelector('.clients__track');
  if (!track) return () => {};

  return initMarquee({
    viewport: wrapper,
    track,
    itemSelector: '.clients__logo',
    durationS: DURATION_S,
    cloneAttr: 'data-clients-clone',
    onClone: (clone) => { clone.setAttribute('alt', ''); },
  });
}
