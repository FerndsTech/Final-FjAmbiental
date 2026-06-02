import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * vite-plugin-includes
 *
 * Plugin Vite custom para incluir partials HTML.
 * Sintaxe: <include src="header.html" />
 *
 * Resolve includes recursivamente — partials podem incluir outros partials.
 * Ordem 'pre' garante que rode antes do processing padrão do Vite.
 *
 * Por que custom em vez de plugin de terceiro?
 * - 30 linhas de código, zero dependências
 * - Sintaxe próxima ao Astro (<Header />) facilita migração futura
 * - Total controle sobre comportamento e error messages
 *
 * @param {Object} options
 * @param {string} options.basePath - Diretório base dos partials
 * @returns {import('vite').Plugin}
 */
export function htmlIncludes(options = {}) {
  const basePath = options.basePath || './src/partials';
  const INCLUDE_RE = /<include\s+src=["']([^"']+)["']\s*\/?>/g;

  function processIncludes(html) {
    return html.replace(INCLUDE_RE, (match, src) => {
      try {
        const filePath = resolve(basePath, src);
        const content = readFileSync(filePath, 'utf-8');
        return processIncludes(content);
      } catch (err) {
        console.error(`[vite-plugin-includes] Could not read partial: ${src}`);
        console.error(`  Looked in: ${resolve(basePath, src)}`);
        return `<!-- ERROR: Partial not found: ${src} -->`;
      }
    });
  }

  return {
    name: 'vite-plugin-includes',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return processIncludes(html);
      },
    },
  };
}
