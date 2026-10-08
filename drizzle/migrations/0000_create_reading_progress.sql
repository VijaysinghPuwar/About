create table public.reading_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  book_slug text not null,
  chapter_id text,
  position double precision,
  percent double precision,
  chapters jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  updated_at timestamptz not null default now(),
  finished_at timestamptz,
  unique (user_id, book_slug)
);

grant select, insert, update, delete on public.reading_progress to authenticated;
grant all on public.reading_progress to service_role;

alter table public.reading_progress enable row level security;

create policy "Readers can select their own progress"
  on public.reading_progress
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Readers can insert their own progress"
  on public.reading_progress
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Readers can update their own progress"
  on public.reading_progress
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Readers can delete their own progress"
  on public.reading_progress
  for delete
  to authenticated
  using (auth.uid() = user_id);