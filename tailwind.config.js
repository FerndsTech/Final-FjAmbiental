/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './*.html',
    './src/**/*.{html,js}',
  ],

  theme: {
    /**
     * Configuração refinada — consome variáveis CSS de src/styles/tokens.css.
     * Estratégia: Tailwind dá utilities; tokens.css é a fonte da verdade.
     */
    extend: {
      colors: {
        'fj-green': {
          DEFAULT: 'var(--color-fj-green)',
          dim: 'var(--color-fj-green-dim)',
        },
        'fj-aqua': 'var(--color-fj-aqua)',

        canvas: 'var(--color-canvas)',
        surface: 'var(--color-surface)',
        ink: 'var(--color-ink)',
        slate: {
          DEFAULT: 'var(--color-slate)',
          light: 'var(--color-slate-light)',
        },

        'deep-navy': {
          DEFAULT: 'var(--color-deep-navy)',
          2: 'var(--color-deep-navy-2)',
        },
      },

      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },

      fontSize: {
        'display-xl': ['var(--text-display-xl)', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        display: ['var(--text-display)', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
      },

      spacing: {
        section: 'var(--space-section)',
        block: 'var(--space-block)',
        container: 'var(--space-container)',
      },

      maxWidth: {
        container: 'var(--container-max)',
      },

      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        pill: 'var(--radius-pill)',
      },

      transitionTimingFunction: {
        'out-quint': 'var(--ease-out)',
        'in-out-cubic': 'var(--ease-in-out)',
        spring: 'var(--ease-spring)',
      },

      transitionDuration: {
        fast: 'var(--duration-fast)',
        base: 'var(--duration-base)',
        slow: 'var(--duration-slow)',
      },
    },
  },

  plugins: [],
};
