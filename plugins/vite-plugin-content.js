import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * vite-plugin-content
 *
 * Plugin Vite custom para renderizar conteúdo de `src/content/*.json`
 * em HTML **no build**, não no cliente.
 * Sintaxe: <render src="services.js" />
 *
 * `src` aponta para um módulo em `plugins/renderers/` que exporta uma
 * função `render()` retornando string de HTML. O bloco devolvido é
 * re-indentado com a indentação da linha onde a tag `<render>` estava,
 * pra saída continuar legível.
 *
 * Por que build-time e não um módulo em src/scripts/modules/?
 * - CLAUDE.md §3.2: coleção de N itens do mesmo shape é lida em build-time
 * - Conteúdo indexável por crawler e presente no primeiro paint (sem CLS,
 *   sem depender de JS) — o que um `innerHTML` no cliente não dá
 * - Cada renderer é candidato direto a virar `.astro` na Fase 2
 *
 * Erro de renderização quebra o build de propósito (`vite build`), e só
 * vira comentário HTML no dev server — falha silenciosa em produção é
 * pior que build vermelho.
 *
 * @param {Object} options
 * @param {string} options.basePath - Diretório base dos renderers
 * @returns {import('vite').Plugin}
 */
export function htmlContent(options = {}) {
  const basePath = options.basePath || './plugins/renderers';
  const RENDER_RE = /^([ \t]*)<render\s+src=["']([^"']+)["']\s*\/?>/gm;

  let isDev = false;

  function indentBlock(html, indent) {
    return html
      .split('\n')
      .map(line => (line.trim() ? indent + line : line))
      .join('\n');
  }

  async function renderBlock(src, indent) {
    const filePath = resolve(basePath, src);

    try {
      // Query de cache-bust só no dev: sem ela o ESM cache do Node serve
      // o renderer antigo até reiniciar o servidor.
      const url =
        pathToFileURL(filePath).href + (isDev ? `?t=${Date.now()}` : '');
      const { render } = await import(url);

      if (typeof render !== 'function') {
        throw new Error(`"${src}" não exporta uma função render()`);
      }

      return indentBlock(await render(), indent);
    } catch (err) {
      const message = `[vite-plugin-content] Falha ao renderizar "${src}": ${err.message}`;
      if (!isDev) throw new Error(message);
      console.error(message);
      console.error(`  Procurado em: ${filePath}`);
      return `${indent}<!-- ERROR: Renderer failed: ${src} -->`;
    }
  }

  return {
    name: 'vite-plugin-content',

    configResolved(config) {
      isDev = config.command === 'serve';
    },

    transformIndexHtml: {
      order: 'pre',
      async handler(html) {
        const matches = [...html.matchAll(RENDER_RE)];
        if (!matches.length) return html;

        let output = html;
        for (const [tag, indent, src] of matches) {
          const rendered = await renderBlock(src, indent);
          output = output.replace(tag, () => rendered);
        }
        return output;
      },
    },

    // Nem o JSON de conteúdo nem o renderer estão no grafo de módulos do
    // cliente — sem isto o dev server não recarrega e o HTML antigo fica
    // na tela.
    handleHotUpdate({ file, server }) {
      const watched = ['/src/content/', '/plugins/renderers/'];
      if (!watched.some(dir => file.includes(dir))) return;
      const channel = server.hot || server.ws;
      channel.send({ type: 'full-reload' });
    },
  };
}
