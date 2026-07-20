/**
 * portfolio.js — Carrossel da section Portfólio (4 projetos fixos)
 *
 * Abordagem: JS define valores; crossfade sutil via GSAP na troca de
 * conteúdo do card featured (mesmo padrão de gsap.context()/cleanup de
 * sobre.js). Thumbnails e barra Explorar trocam instantaneamente (sem
 * fade), para dar resposta imediata ao clique — só o conteúdo do card
 * (imagem, tags, coords, meta, headline, descrição, stats) recebe o fade.
 *
 * .portfolio__desc tem altura travada via JS (lockDescHeight) porque as
 * 4 descrições têm comprimentos diferentes — sem isso, a troca de card
 * causa CLS visível no layout empilhado do mobile (LIÇÃO: mesmo padrão
 * de medição via scrollHeight que faq.js já usa).
 *
 * No mobile (<600px), a fileira de thumbnails/setas fica oculta via CSS
 * — a navegação manual nesse breakpoint é por um carrossel real de peek
 * (.portfolio__track), com 4 cards de imagem gerados via JS a partir de
 * projects.json, scroll-snap nativo (sem lib nova, stack travada em
 * CLAUDE.md §2) e sincronização de índice via IntersectionObserver. O
 * painel de texto (headline/descrição/stats) continua único, atualizado
 * via updateContent() — não duplicado por card, para não poluir o peek
 * com parágrafos inteiros cortados.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import projectsData from "../../content/projects.json";

gsap.registerPlugin(ScrollTrigger);

const IMG_BASE = "/images/";
const AUTO_ADVANCE_MS = 5000;
const SWIPE_THRESHOLD = 40;

export function initPortfolio(root = document) {
  const section = root.querySelector("#portfolio");
  if (!section) return () => {};

  const projects = projectsData.projects.slice(0, 4);
  const thumbs = Array.from(section.querySelectorAll(".portfolio__thumb"));
  if (projects.length !== thumbs.length) return () => {};

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const featured = section.querySelector(".portfolio__featured");
  const img = featured.querySelector(".portfolio__featured-img");
  const tagPrimary = featured.querySelector(".portfolio__tag-primary");
  const tagSecondary = featured.querySelector(".portfolio__tag-secondary");
  const coords = featured.querySelector(".portfolio__featured-coords");
  const metaEl = featured.querySelector(".portfolio__featured-meta");
  const metaCliente = featured.querySelector(".portfolio__meta-cliente");
  const metaAno = featured.querySelector(".portfolio__meta-ano");
  const metaLocal = featured.querySelector(".portfolio__meta-local");

  const headlineL1 = section.querySelector(".portfolio__headline-l1");
  const headlineL2 = section.querySelector(".portfolio__headline-l2");
  const desc = section.querySelector(".portfolio__desc");
  const statEls = Array.from(section.querySelectorAll(".portfolio__stat"));

  const explorerFill = section.querySelector(".portfolio__explore-fill");
  const explorerCount = section.querySelector(".portfolio__explore-count");

  const prevBtn = section.querySelector(".portfolio__arrow--prev");
  const nextBtn = section.querySelector(".portfolio__arrow--next");

  // Carrossel peek mobile (<600px) — track gerado via JS, oculto no desktop via CSS
  const track = section.querySelector(".portfolio__track");
  let trackObserver;

  let current = 0;
  let timer = null;
  let ctx;

  // Elementos que recebem o crossfade — thumbs e barra Explorar ficam de
  // fora de propósito, trocam instantaneamente (resposta imediata ao clique).
  const fadeTargets = [
    img,
    tagPrimary,
    tagSecondary,
    coords,
    metaEl,
    headlineL1,
    headlineL2,
    desc,
    ...statEls,
  ];

  function updateContent(index) {
    const p = projects[index];

    img.src = IMG_BASE + p.image;
    img.alt = p.titulo;
    tagPrimary.textContent = p.tag_primaria;
    tagSecondary.textContent = p.tag_secundaria;
    coords.textContent = p.coords;
    metaCliente.textContent = p.cliente;
    metaAno.textContent = p.ano;
    metaLocal.textContent = p.local;

    headlineL1.textContent = p.headline_l1;
    headlineL2.textContent = p.headline_l2;
    desc.textContent = p.descricao;

    statEls.forEach((el, i) => {
      const s = p.stats[i];
      el.querySelector(".portfolio__stat-label").textContent = s.label;
      // dd tem um text node (valor) + <span> aninhado (unidade) — mantém o span intacto
      el.querySelector(".portfolio__stat-value").firstChild.textContent =
        s.valor + " ";
      el.querySelector(".portfolio__stat-unit").textContent = s.unidade;
    });
  }

  function updateNav(index) {
    thumbs.forEach((t, i) => {
      t.classList.toggle("is-active", i === index);
      t.setAttribute("aria-current", i === index ? "true" : "false");
    });

    const pct = ((index + 1) / projects.length) * 100;
    explorerFill.style.width = pct + "%";
    explorerCount.textContent = `0${index + 1} / 0${projects.length}`;
  }

  function crossfade(index) {
    if (prefersReducedMotion) {
      updateContent(index);
      return;
    }
    gsap.killTweensOf(fadeTargets);
    ctx.add(() => {
      gsap.to(fadeTargets, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          updateContent(index);
          gsap.fromTo(
            fadeTargets,
            { opacity: 0 },
            { opacity: 1, duration: 0.4, ease: "power3.out" },
          );
        },
      });
    });
  }

  // Trava a altura de .portfolio__desc na maior entre os 4 projetos —
  // evita CLS ao trocar de card (descrições têm comprimentos diferentes,
  // e no layout empilhado do mobile isso mudava a altura total da section).
  function lockDescHeight() {
    const clone = desc.cloneNode(false);
    clone.style.position = "absolute";
    clone.style.visibility = "hidden";
    clone.style.height = "auto";
    clone.style.minHeight = "0";
    clone.style.width = desc.getBoundingClientRect().width + "px";
    document.body.appendChild(clone);

    let max = 0;
    projects.forEach((p) => {
      clone.textContent = p.descricao;
      max = Math.max(max, clone.scrollHeight);
    });
    document.body.removeChild(clone);

    desc.style.minHeight = max + "px";
  }

  let descResizeTimer;
  function handleDescResize() {
    clearTimeout(descResizeTimer);
    descResizeTimer = setTimeout(lockDescHeight, 200);
  }

  // fromTrack: true quando goTo() foi disparado pelo próprio scroll do
  // carrossel (IntersectionObserver) — nesse caso não reexecuta o
  // scrollIntoView, para não brigar com o gesto de swipe do usuário.
  function goTo(index, resetTimer = true, fromTrack = false) {
    const next = (index + projects.length) % projects.length;
    crossfade(next);
    updateNav(next);
    current = next;
    if (track && !fromTrack) {
      track.children[next]?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        inline: "center",
        block: "nearest",
      });
    }
    if (resetTimer) restartTimer();
  }

  function startTimer() {
    if (prefersReducedMotion) return;
    timer = setInterval(() => goTo(current + 1, false), AUTO_ADVANCE_MS);
  }
  function stopTimer() {
    clearInterval(timer);
    timer = null;
  }
  function restartTimer() {
    stopTimer();
    startTimer();
  }

  // --- Carrossel peek mobile: gera os 4 cards de imagem no track ---
  // aria-hidden no wrapper (ver HTML): os mesmos 4 projetos já são
  // acessíveis via .portfolio__thumbs, evita leitura duplicada por
  // leitor de tela.
  function buildTrack() {
    if (!track) return;
    projects.forEach((p, i) => {
      const card = document.createElement("article");
      card.className = "portfolio__featured";
      card.dataset.index = String(i);
      card.innerHTML = `
        <img class="portfolio__featured-img" src="${IMG_BASE}${p.image}" alt="" loading="lazy" decoding="async" />
        <div class="portfolio__featured-overlay" aria-hidden="true"></div>
        <div class="portfolio__featured-tags">
          <span class="portfolio__tag-primary">${p.tag_primaria}</span>
          <span class="portfolio__tag-secondary">${p.tag_secundaria}</span>
        </div>
        <p class="portfolio__featured-coords font-mono-numerals">${p.coords}</p>
        <div class="portfolio__featured-bottom">
          <p class="portfolio__featured-meta font-mono-numerals">
            <span>${p.cliente}</span><span> · </span><span>${p.ano}</span><span> · </span><span>${p.local}</span>
          </p>
        </div>`;
      track.appendChild(card);
    });
  }

  // Detecta qual card está centralizado no track (scroll-snap) e
  // sincroniza com o painel de texto/thumbs/barra Explorar via goTo().
  function initTrackObserver() {
    if (!track) return;
    trackObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const idx = Number(visible.target.dataset.index);
          if (idx !== current) goTo(idx, true, true);
        }
      },
      { root: track, threshold: [0.6, 0.75, 0.9] },
    );
    Array.from(track.children).forEach((card) => trackObserver.observe(card));
  }

  // --- Handlers (referências nomeadas para cleanup, padrão de faq.js) ---
  const thumbHandlers = thumbs.map((t, i) => {
    const handler = () => goTo(i);
    t.addEventListener("click", handler);
    return handler;
  });

  function onPrev() {
    goTo(current - 1);
  }
  function onNext() {
    goTo(current + 1);
  }
  prevBtn?.addEventListener("click", onPrev);
  nextBtn?.addEventListener("click", onNext);

  // Pausa no hover/focus — só na área de navegação do carrossel
  // (card, track mobile, thumbnails/setas), não na section inteira.
  // Evita que o timer pause sozinho quando o mouse já está parado sobre
  // título/stats no momento em que a section entra na viewport pelo scroll.
  function pause() {
    stopTimer();
  }
  function resume() {
    restartTimer();
  }
  const pauseZones = [
    featured,
    track,
    section.querySelector(".portfolio__thumbs-wrapper"),
  ].filter(Boolean);
  pauseZones.forEach((el) => {
    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);
    el.addEventListener("focusin", pause);
    el.addEventListener("focusout", resume);
  });

  // --- Swipe (card featured único do desktop — thumbnails/setas ficam
  // ocultas via CSS <600px, onde quem navega é o .portfolio__track) ---
  let touchStartX = 0;
  let touchStartY = 0;
  let touchActive = false;

  function onTouchStart(e) {
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
    touchActive = true;
  }
  function onTouchMove(e) {
    if (!touchActive) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    // Gesto predominantemente horizontal: impede o scroll vertical da
    // página para não competir com o swipe do carrossel.
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) e.preventDefault();
  }
  function onTouchEnd(e) {
    if (!touchActive) return;
    touchActive = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      dx < 0 ? goTo(current + 1) : goTo(current - 1);
    }
  }
  featured.addEventListener("touchstart", onTouchStart, { passive: true });
  featured.addEventListener("touchmove", onTouchMove, { passive: false });
  featured.addEventListener("touchend", onTouchEnd);

  // --- Estado inicial ---
  ctx = gsap.context(() => {}, section);
  updateContent(0);
  updateNav(0);
  lockDescHeight();
  buildTrack();
  initTrackObserver();
  window.addEventListener("resize", handleDescResize);
  // Auto-advance só roda com a section realmente visível — evita que o
  // scrollIntoView do goTo() dispare um jump vertical durante a transição
  // de scroll Serviços→Portfólio (timer rodando fora de contexto visível).
  const visibilityTrigger = ScrollTrigger.create({
    trigger: section,
    start: "top center",
    end: "bottom top",
    onEnter: startTimer,
    onLeave: stopTimer,
    onEnterBack: startTimer,
    onLeaveBack: stopTimer,
  });

  return function cleanupPortfolio() {
    stopTimer();
    thumbs.forEach((t, i) => t.removeEventListener("click", thumbHandlers[i]));
    prevBtn?.removeEventListener("click", onPrev);
    nextBtn?.removeEventListener("click", onNext);
    pauseZones.forEach((el) => {
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
      el.removeEventListener("focusin", pause);
      el.removeEventListener("focusout", resume);
    });
    featured.removeEventListener("touchstart", onTouchStart);
    featured.removeEventListener("touchmove", onTouchMove);
    featured.removeEventListener("touchend", onTouchEnd);
    window.removeEventListener("resize", handleDescResize);
    clearTimeout(descResizeTimer);
    trackObserver?.disconnect();
    visibilityTrigger.kill();
    ctx.revert();
  };
}
