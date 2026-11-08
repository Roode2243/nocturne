# Nocturne project guide

Nocturne is a private, personal notebook for poems, fragments, and thoughts. The stable release is `v1.0.0`. Update 1 targets `v1.1.0` (Typography Customization) on `feature/typography-customization`.

- [Repository](https://github.com/Roode2243/nocturne)
- [Production app](https://roode2243.github.io/nocturne/)

## Architecture

- React 19 and strict TypeScript run in a Vite single-page app. `src/main.tsx` mounts the app and registers the service worker.
- `src/App.tsx` handles Supabase Auth, cloud writes, and the deck, reader, Library, and editor. `src/data.ts` defines the writing model and Markdown export helpers. `src/style.css` owns the visual tokens and responsive styles. Use Motion for React for existing motion patterns and Lucide React for icons.
- `src/supabase.ts` initializes the browser client. Supabase Auth manages sessions, and PostgreSQL stores writing in `public.pieces`. `supabase/schema.sql` defines the table and owner-only policies.
- GitHub Actions builds and publishes `dist` to GitHub Pages through `.github/workflows/pages.yml`. `vite.config.ts` configures the installable PWA with `vite-plugin-pwa`. Keep Vite's `/nocturne/` base, Pages configuration, and PWA scope and settings unless a change is justified. Cache the app shell only and keep private writing out of service-worker caches.

## Design and development

- Preserve Black + Ice Blue. Use background `#090B0F`, surface `#171C25`, accent `#91BFF5`, text `#F2F5FA`, and muted `#929CAC`.
- Keep the app intimate, minimalist, cinematic, and focused on writing. Preserve the swipeable poetry deck. Avoid generic dashboard layouts, excessive gradients, decorative clutter, and feature bloat.
- Inspect relevant files and Git status before editing. Make small, maintainable changes, preserve existing behavior unless the task calls for a change, use precise TypeScript types, and avoid unnecessary dependencies.
- Use Prettier for changed code and keep formatting scoped to the task. The repository currently has no dedicated Prettier configuration or script.
- Provide loading, empty, success, and error states where appropriate. Surface failed cloud saves and keep unsaved writing available for retry. Check mobile layouts, keyboard access, visible focus, and reduced motion for UI changes.

## Security and data

- Keep RLS enabled and preserve owner-only SELECT, INSERT, UPDATE, and DELETE policies for authenticated users. Public Supabase client settings never replace database authorization.
- Use `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for browser configuration. The client also accepts the legacy anon key. Keep secret keys, service-role credentials, passwords, and local `.env` contents out of source, logs, and messages.
- Local development and production currently share a Supabase database. Treat local writes as production writes and verify the target before any database work. Use test data for authorized write checks and obtain explicit authorization before deleting or overwriting user writing.
- Keep migrations backward-compatible and non-destructive. Require explicit review and authorization before execution. Never run schema SQL or migrations automatically.
- Never discard unsaved editor content during navigation, authentication changes, or failed network requests. Preserve it for recovery whenever practical.

## Validation

- Use Node 22 to match CI. For local setup, copy `.env.example` to `.env.local` and configure the public Supabase values when testing authentication or sync. Run `npm install` and `npm run dev`.
- Before reporting completion, review the diff and status, run `npm run typecheck` and `npm run build`, and run relevant tests when available. The repository currently has no test script.
- Keep generated build output and incidental TypeScript cache changes out of the diff. Summarize changed files, checks and any verification gaps, and manual setup steps.

## Git and releases

- `main` is the production branch. Pushes to `main` trigger the Pages deployment workflow, which also supports manual dispatch.
- Develop features on separate branches. Never switch branches silently or discard uncommitted work. When commits are authorized, keep them focused and use meaningful messages.
- Use feature branch → local testing → review → pull request → approved merge → release. Keep the stable version in production until the next release is tested and approved.
- Obtain explicit authorization before committing, pushing, merging, tagging, publishing a release, or deploying.
- Feature branches must not trigger production deployments. Verify that GitHub Actions continues to deploy only from main. Do not automatically merge feature branches.