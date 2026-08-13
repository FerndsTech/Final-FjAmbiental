import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Renderer da section Serviços — gera os `<li>` de `.services__grid` a
 * partir de `src/content/services.json`, em build-time.
 *
 * Chamado por plugins/vite-plugin-content.js via <render src="services.js" />.
 * O `<ul class="services__grid">` continua no index.html: layout é da
 * página, os cards são do conteúdo.
 *
 * Derivados da ordem do array (não duplicados no JSON):
 * - número ghosted: 01, 02, 03…
 * - data-reveal-delay: 0.1, 0.2, 0.3…
 * - aria-label das tags: "Especialidades de <titulo>"
 *
 * Os arquivos lidos com readFileSync (e não `import`) de propósito: o
 * ESM cache do Node serviria a versão antiga do JSON no dev server.
 */

const SRC = new URL('../../src/', import.meta.url);
const CONTENT_FILE = fileURLToPath(new URL('content/services.json', SRC));
const ICONS_DIR = new URL('assets/icones/', SRC);

const ACCENTS = ['green', 'aqua'];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Inline do SVG do ícone. Os arquivos da Flaticon vêm com `id`,
 * `width`/`height` fixos, `enable-background` e `fill="rgb(0,0,0)"` —
 * nada disso serve aqui: o tamanho vem do CSS (`.service-card__icon`) e
 * a cor vem de `currentColor` herdado da variante de accent.
 *
 * `width`/`height`/`enable-background`/`xmlns` só saem da tag `<svg>` de
 * abertura: um `<rect width="…">` lá dentro precisa manter a dimensão dele.
 * Já o `id` sai de todo elemento — a Flaticon repete o mesmo id ("Слой_1")
 * entre arquivos diferentes, e dois deles na mesma página seria id
 * duplicado, erro de validação W3C (CLAUDE.md §11).
 */
function inlineIcon(fileName) {
  const raw = readFileSync(
    fileURLToPath(new URL(fileName, ICONS_DIR)),
    'utf-8'
  ).trim();

  // Gradiente, clipPath ou <use> dependem dos ids que a limpeza abaixo
  // remove. Melhor quebrar o build aqui do que servir um ícone torto.
  if (/(?:url\(#|(?:xlink:)?href="#)/.test(raw)) {
    throw new Error(
      `"${fileName}" referencia ids internamente — inline manual necessário`
    );
  }

  return raw
    .replace(/^<svg[^>]*>/, tag =>
      tag.replace(/\s(?:width|height|enable-background|xmlns)="[^"]*"/g, '')
    )
    .replace(/\sid="[^"]*"/g, '')
    .replace(/rgb\(0,\s*0,\s*0\)/g, 'currentColor');
}

function renderCard(service, index) {
  const { titulo, subtitulo, accent, icone, descricao, tags } = service;

  if (!ACCENTS.includes(accent)) {
    throw new Error(
      `accent inválido "${accent}" em "${service.id}" — use ${ACCENTS.join(' ou ')}`
    );
  }

  const numero = String(index + 1).padStart(2, '0');
  const delay = ((index + 1) / 10).toFixed(1);

  const tagsHtml = tags
    .map(tag => `      <li class="service-card__tag">${escapeHtml(tag)}</li>`)
    .join('\n');

  return `<li>
  <article class="service-card" data-reveal data-reveal-delay="${delay}">
    <span class="service-card__number" aria-hidden="true">${numero}</span>
    <div class="service-card__top">
      <div
        class="service-card__icon service-card__icon--${accent}"
        aria-hidden="true"
      >
        ${inlineIcon(icone)}
      </div>
      <div class="service-card__heading">
        <h3 class="service-card__title">${escapeHtml(titulo)}</h3>
        <p class="service-card__subtitle service-card__subtitle--${accent}">
          ${escapeHtml(subtitulo)}
        </p>
      </div>
    </div>
    <p class="service-card__desc">${escapeHtml(descricao)}</p>
    <ul
      class="service-card__tags"
      role="list"
      aria-label="Especialidades de ${escapeHtml(titulo)}"
    >
${tagsHtml}
    </ul>
  </article>
</li>`;
}

export function render() {
  const { services } = JSON.parse(readFileSync(CONTENT_FILE, 'utf-8'));

  if (!Array.isArray(services) || !services.length) {
    throw new Error('services.json não tem a chave "services" com itens');
  }

  return services.map(renderCard).join('\n\n');
}
