-- Run in the Supabase SQL Editor. Run this before using the deployed app.
create extension if not exists pgcrypto;

create table if not exists public.pieces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null default 'Untitled',
  body text not null,
  kind text not null default 'Poem' check (kind in ('Poem', 'Fragment', 'Thought')),
  favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint title_size check (char_length(title) between 1 and 180),
  constraint body_size check (char_length(body) between 1 and 50000)
);

create index if not exists pieces_by_user_and_date on public.pieces (user_id, created_at desc);
alter table public.pieces enable row level security;

-- Explicit TO authenticated avoids anonymous/public access.
drop policy if exists "Owner can read pieces" on public.pieces;
drop policy if exists "Owner can insert pieces" on public.pieces;
drop policy if exists "Owner can update pieces" on public.pieces;
drop policy if exists "Owner can delete pieces" on public.pieces;
create policy "Owner can read pieces" on public.pieces for select to authenticated using (user_id = (select auth.uid()));
create policy "Owner can insert pieces" on public.pieces for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Owner can update pieces" on public.pieces for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Owner can delete pieces" on public.pieces for delete to authenticated using (user_id = (select auth.uid()));

create or replace function public.set_piece_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists update_piece_timestamp on public.pieces;
create trigger update_piece_timestamp before update on public.pieces
for each row execute function public.set_piece_updated_at();

revoke all on public.pieces from anon;
grant select, insert, update, delete on public.pieces to authenticated;
