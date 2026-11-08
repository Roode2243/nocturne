-- An empty object keeps the app's default typography.
alter table public.pieces
  add column if not exists formatting jsonb not null default '{}'::jsonb;
