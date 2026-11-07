# Nocturne

A private, installable poetry notebook with a swipe deck, responsive reading, Library timeline, rediscovery, and Supabase cloud sync. Built using React, TypeScript, Vite, Motion and Supabase. Designed for GitHub Pages at `/nocturne/`.

## Requirements
- Node 22+
- A Supabase project (free tier works for personal use)
- A GitHub repository with Pages configured to deploy from **GitHub Actions**

## First-time setup
1. In Supabase, create a project. From its **SQL Editor**, run `supabase/schema.sql`. **Do this before letting users create accounts.** Row-level security policies restrict every row to the authenticated owner.
2. In Supabase Authentication > URL Configuration, set Site URL to `https://roode2243.github.io/nocturne/` and add `https://roode2243.github.io/nocturne/` as an allowed redirect URL. For local development, also allow `http://localhost:5173/nocturne/`.
3. Enable Email authentication under Supabase Authentication > Providers. For production, configure a reliable SMTP provider if default email sending limits are unsuitable.
4. Copy `.env.example` to `.env.local` and enter the **project URL** and **publishable key** (or `anon` key). **Never put a `service_role` or secret key into browser code.**
5. Run `npm install` and `npm run dev`, then open the local address from Vite (the app base is `/nocturne/`).
6. For deployment, set GitHub repository **Settings > Secrets and variables > Actions > Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   These two settings are **public browser identifiers**, not secrets. Security relies on Supabase RLS, not the key being hidden.
7. Set **Settings > Pages > Build and deployment > Source** to **GitHub Actions**. Push to `main`; workflow `.github/workflows/pages.yml` builds and deploys automatically.
8. Visit `https://roode2243.github.io/nocturne/`, sign in, and use your browser's **Install app / Add to Home Screen** option.

## How privacy works
Each `pieces` row contains `user_id`. PostgreSQL row-level security checks `auth.uid()` for every SELECT/INSERT/UPDATE/DELETE. The client uses only the Supabase publishable key, not a privileged server key. GitHub Pages hosts code; poems go directly to Supabase and are not included in the repository. The app is **not end-to-end encrypted**: Supabase operators/project admins with sufficient privileges can access the database. Protect your Supabase account with MFA and export backups regularly.

## Important limitations
- Cloud writes require internet. The service worker caches the app shell, **not** private poem data. The UI intentionally prevents saving while offline rather than falsely claiming successful sync.
- When reopening on another device, sign in with the same account. The app refreshes on foreground and listens for Supabase changes (Realtime must be enabled for `public.pieces` if you want instant updates; foreground refresh works independently).
- Data exports are Markdown backups. Deleting a piece deletes the cloud row; there is no undo/version history yet.
- Supabase email confirmation, password rules, rate limits, and mail delivery depend on project configuration.
- The card-deck animation uses Motion for React. The PWA installation may vary by browser/platform.

## Development
```bash
npm install
npm run dev
npm run typecheck
npm run build
```

## Credits
Original Nocturne concept and poem-design direction developed from the user's Black + Ice Blue Figma mockups and interaction preview. Sample lines are **not** committed as user data; writing begins empty after sign-in.
