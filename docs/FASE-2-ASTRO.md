# FASE-2-ASTRO.md — Migração futura para Astro 5

> Extraído de `CLAUDE.md` §10. Documento de referência: só é relevante
> quando a Fase 1 estiver no ar e validada em produção.

---

Depois do site no ar e validado em produção, migração para Astro 5.

### Mecânica (estimativa: 2 dias úteis se Fase 1 seguiu §3)

1. `npm create astro@latest` em diretório novo
2. Copiar `src/partials/*.html` → `src/components/*.astro` (adicionar `---` no topo)
3. Copiar `src/scripts/modules/*.js` → islands com `client:visible`
4. Copiar `src/styles/*` direto (Astro consome CSS igual)
5. Copiar `src/content/*.json` → Content Collections com schema Zod
6. Migrar para Tailwind v4 simultaneamente (já que vamos refatorar config mesmo)
7. Adicionar TypeScript com schemas type-safe

### Ganhos esperados na Fase 2

- View Transitions nativas entre páginas
- Image component otimizando AVIF/WebP automaticamente
- Type-safety em todos os imports de conteúdo
- Lighthouse score ainda mais estável (zero JS por padrão)

