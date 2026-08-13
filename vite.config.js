import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { htmlIncludes } from './plugins/vite-plugin-includes.js';
import { htmlContent } from './plugins/vite-plugin-content.js';

/**
 * Vite configuration — FJ Ambiental
 *
 * - Multi-page setup (home + 4 páginas internas)
 * - Custom HTML includes plugin para partials reutilizáveis
 * - Custom HTML content plugin para renderizar src/content/*.json em build-time
 * - Aliases de path para imports limpos
 */
export default defineConfig({
  plugins: [
    // Ordem importa: includes primeiro, para que um partial também possa
    // conter <render src="..." />.
    htmlIncludes({ basePath: resolve(__dirname, 'src/partials') }),
    htmlContent({ basePath: resolve(__dirname, 'plugins/renderers') }),
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@scripts': resolve(__dirname, 'src/scripts'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@content': resolve(__dirname, 'src/content'),
    },
  },

  build: {
    target: 'es2022',
    cssMinify: 'lightningcss',
    minify: 'esbuild',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        // Páginas internas serão adicionadas aqui conforme forem criadas:
        // servicos: resolve(__dirname, 'servicos.html'),
        // portfolio: resolve(__dirname, 'portfolio.html'),
        // sobre: resolve(__dirname, 'sobre.html'),
        // contato: resolve(__dirname, 'contato.html'),
      },
    },
  },

  server: {
    port: 5173,
    open: true,
  },

  preview: {
    port: 4173,
  },
});
