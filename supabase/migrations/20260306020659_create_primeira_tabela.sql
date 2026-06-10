create table if not exists public.teste_fluxly (
  id uuid primary key default gen_random_uuid(),
  nome text,
  created_at timestamptz default now()
);