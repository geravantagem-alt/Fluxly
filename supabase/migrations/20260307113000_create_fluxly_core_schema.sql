begin;

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'cargo_usuario') then
    create type public.cargo_usuario as enum ('dono', 'colaborador');
  end if;
end $$;

create table if not exists public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  empresa_id uuid null,
  nome_completo text not null,
  cargo public.cargo_usuario not null default 'colaborador',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint perfis_nome_completo_nao_vazio check (length(btrim(nome_completo)) > 0)
);

create table if not exists public.empresas (
  id uuid primary key default gen_random_uuid(),
  dono_id uuid not null unique references auth.users (id) on delete restrict,
  nome text not null,
  cnpj text not null unique,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint empresas_nome_nao_vazio check (length(btrim(nome)) > 0),
  constraint empresas_cnpj_nao_vazio check (length(btrim(cnpj)) > 0)
);

do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'perfis'
      and constraint_name = 'perfis_empresa_id_fkey'
  ) then
    alter table public.perfis
      add constraint perfis_empresa_id_fkey
      foreign key (empresa_id) references public.empresas (id) on delete set null;
  end if;
end $$;

create table if not exists public.areas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  nome text not null,
  cor text null,
  icone text null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint areas_nome_nao_vazio check (length(btrim(nome)) > 0)
);

create unique index if not exists areas_unique_nome_por_empresa
  on public.areas (empresa_id, lower(btrim(nome)));

create table if not exists public.processos (
  id uuid primary key default gen_random_uuid(),
  area_id uuid not null references public.areas (id) on delete cascade,
  nome text not null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint processos_nome_nao_vazio check (length(btrim(nome)) > 0)
);

create unique index if not exists processos_unique_nome_por_area
  on public.processos (area_id, lower(btrim(nome)));

create table if not exists public.etapas_fluxograma (
  id uuid primary key default gen_random_uuid(),
  processo_id uuid not null references public.processos (id) on delete cascade,
  titulo text not null,
  descricao text null,
  ordem integer not null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint etapas_titulo_nao_vazio check (length(btrim(titulo)) > 0),
  constraint etapas_ordem_positiva check (ordem > 0),
  constraint etapas_ordem_unica_por_processo unique (processo_id, ordem)
);

create table if not exists public.area_colaboradores (
  id uuid primary key default gen_random_uuid(),
  area_id uuid not null references public.areas (id) on delete cascade,
  colaborador_id uuid not null references public.perfis (id) on delete cascade,
  criado_em timestamptz not null default now(),
  constraint area_colaboradores_unico unique (area_id, colaborador_id)
);

create table if not exists public.processo_colaboradores (
  id uuid primary key default gen_random_uuid(),
  processo_id uuid not null references public.processos (id) on delete cascade,
  colaborador_id uuid not null references public.perfis (id) on delete cascade,
  criado_em timestamptz not null default now(),
  constraint processo_colaboradores_unico unique (processo_id, colaborador_id)
);

create index if not exists perfis_empresa_cargo_idx
  on public.perfis (empresa_id, cargo);
create index if not exists areas_empresa_criado_em_idx
  on public.areas (empresa_id, criado_em desc);
create index if not exists processos_area_criado_em_idx
  on public.processos (area_id, criado_em desc);
create index if not exists etapas_processo_ordem_idx
  on public.etapas_fluxograma (processo_id, ordem);
create index if not exists area_colaboradores_colaborador_idx
  on public.area_colaboradores (colaborador_id);
create index if not exists processo_colaboradores_colaborador_idx
  on public.processo_colaboradores (colaborador_id);

create or replace function public.set_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create or replace function public.current_empresa_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.empresa_id
  from public.perfis p
  where p.id = auth.uid();
$$;

create or replace function public.current_user_role()
returns public.cargo_usuario
language sql
stable
security definer
set search_path = public
as $$
  select p.cargo
  from public.perfis p
  where p.id = auth.uid();
$$;

create or replace function public.is_member_of_empresa(target_empresa_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.perfis p
    where p.id = auth.uid()
      and p.empresa_id = target_empresa_id
  );
$$;

create or replace function public.is_owner_of_empresa(target_empresa_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.perfis p
    where p.id = auth.uid()
      and p.empresa_id = target_empresa_id
      and p.cargo = 'dono'
  );
$$;

create or replace function public.can_edit_processo(target_processo_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  with processo_ctx as (
    select p.id as processo_id, p.area_id, a.empresa_id
    from public.processos p
    join public.areas a on a.id = p.area_id
    where p.id = target_processo_id
  )
  select exists (
    select 1
    from processo_ctx pc
    where public.is_owner_of_empresa(pc.empresa_id)
       or exists (
         select 1
         from public.processo_colaboradores prc
         where prc.processo_id = pc.processo_id
           and prc.colaborador_id = auth.uid()
       )
       or exists (
         select 1
         from public.area_colaboradores ac
         where ac.area_id = pc.area_id
           and ac.colaborador_id = auth.uid()
       )
  );
$$;

create or replace function public.enforce_colaborador_assignment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_empresa_id uuid;
  role_atual public.cargo_usuario;
begin
  if tg_table_name = 'area_colaboradores' then
    select a.empresa_id into target_empresa_id
    from public.areas a
    where a.id = new.area_id;
  elsif tg_table_name = 'processo_colaboradores' then
    select a.empresa_id into target_empresa_id
    from public.processos p
    join public.areas a on a.id = p.area_id
    where p.id = new.processo_id;
  else
    raise exception 'Tabela de atribuicao invalida: %', tg_table_name;
  end if;

  if target_empresa_id is null then
    raise exception 'Nao foi possivel identificar empresa da atribuicao.';
  end if;

  select p.cargo into role_atual
  from public.perfis p
  where p.id = new.colaborador_id
    and p.empresa_id = target_empresa_id;

  if role_atual is distinct from 'colaborador' then
    raise exception 'Somente perfis colaboradores da mesma empresa podem ser atribuidos.';
  end if;

  return new;
end;
$$;

create or replace function public.handle_auth_user_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_nome text;
  meta_role public.cargo_usuario;
begin
  meta_nome := coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1));
  meta_role := case
    when (new.raw_user_meta_data ->> 'role') in ('dono', 'colaborador')
      then (new.raw_user_meta_data ->> 'role')::public.cargo_usuario
    else 'colaborador'::public.cargo_usuario
  end;

  insert into public.perfis (id, email, nome_completo, cargo)
  values (new.id, new.email, meta_nome, meta_role)
  on conflict (id) do update
    set email = excluded.email,
        nome_completo = coalesce(excluded.nome_completo, public.perfis.nome_completo),
        cargo = coalesce(public.perfis.cargo, excluded.cargo);

  return new;
end;
$$;

create or replace function public.sync_owner_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.perfis
  set empresa_id = new.id,
      cargo = 'dono'
  where id = new.dono_id;

  return new;
end;
$$;

drop trigger if exists perfis_set_atualizado_em on public.perfis;
create trigger perfis_set_atualizado_em
before update on public.perfis
for each row execute function public.set_atualizado_em();

drop trigger if exists empresas_set_atualizado_em on public.empresas;
create trigger empresas_set_atualizado_em
before update on public.empresas
for each row execute function public.set_atualizado_em();

drop trigger if exists areas_set_atualizado_em on public.areas;
create trigger areas_set_atualizado_em
before update on public.areas
for each row execute function public.set_atualizado_em();

drop trigger if exists processos_set_atualizado_em on public.processos;
create trigger processos_set_atualizado_em
before update on public.processos
for each row execute function public.set_atualizado_em();

drop trigger if exists etapas_fluxograma_set_atualizado_em on public.etapas_fluxograma;
create trigger etapas_fluxograma_set_atualizado_em
before update on public.etapas_fluxograma
for each row execute function public.set_atualizado_em();

drop trigger if exists area_colaboradores_validate on public.area_colaboradores;
create trigger area_colaboradores_validate
before insert or update on public.area_colaboradores
for each row execute function public.enforce_colaborador_assignment();

drop trigger if exists processo_colaboradores_validate on public.processo_colaboradores;
create trigger processo_colaboradores_validate
before insert or update on public.processo_colaboradores
for each row execute function public.enforce_colaborador_assignment();

drop trigger if exists on_auth_user_sync on auth.users;
create trigger on_auth_user_sync
after insert or update of email, raw_user_meta_data on auth.users
for each row execute function public.handle_auth_user_sync();

drop trigger if exists empresas_sync_owner_profile on public.empresas;
create trigger empresas_sync_owner_profile
after insert or update of dono_id on public.empresas
for each row execute function public.sync_owner_profile();

alter table public.perfis enable row level security;
alter table public.empresas enable row level security;
alter table public.areas enable row level security;
alter table public.processos enable row level security;
alter table public.etapas_fluxograma enable row level security;
alter table public.area_colaboradores enable row level security;
alter table public.processo_colaboradores enable row level security;

drop policy if exists perfis_select_self_or_owner on public.perfis;
create policy perfis_select_self_or_owner
on public.perfis
for select
using (
  id = auth.uid()
  or public.is_owner_of_empresa(empresa_id)
);

drop policy if exists perfis_update_self_or_owner on public.perfis;
create policy perfis_update_self_or_owner
on public.perfis
for update
using (
  id = auth.uid()
  or (public.is_owner_of_empresa(empresa_id) and cargo = 'colaborador')
)
with check (
  id = auth.uid()
  or (public.is_owner_of_empresa(empresa_id) and cargo = 'colaborador')
);

drop policy if exists empresas_select_members on public.empresas;
create policy empresas_select_members
on public.empresas
for select
using (public.is_member_of_empresa(id));

drop policy if exists empresas_insert_owner_only on public.empresas;
create policy empresas_insert_owner_only
on public.empresas
for insert
with check (
  auth.uid() = dono_id
  and public.current_empresa_id() is null
);

drop policy if exists empresas_update_owner_only on public.empresas;
create policy empresas_update_owner_only
on public.empresas
for update
using (auth.uid() = dono_id)
with check (auth.uid() = dono_id);

drop policy if exists empresas_delete_owner_only on public.empresas;
create policy empresas_delete_owner_only
on public.empresas
for delete
using (auth.uid() = dono_id);

drop policy if exists areas_select_company_members on public.areas;
create policy areas_select_company_members
on public.areas
for select
using (public.is_member_of_empresa(empresa_id));

drop policy if exists areas_insert_owner_only on public.areas;
create policy areas_insert_owner_only
on public.areas
for insert
with check (public.is_owner_of_empresa(empresa_id));

drop policy if exists areas_update_owner_only on public.areas;
create policy areas_update_owner_only
on public.areas
for update
using (public.is_owner_of_empresa(empresa_id))
with check (public.is_owner_of_empresa(empresa_id));

drop policy if exists areas_delete_owner_only on public.areas;
create policy areas_delete_owner_only
on public.areas
for delete
using (public.is_owner_of_empresa(empresa_id));

drop policy if exists processos_select_company_members on public.processos;
create policy processos_select_company_members
on public.processos
for select
using (
  exists (
    select 1
    from public.areas a
    where a.id = processos.area_id
      and public.is_member_of_empresa(a.empresa_id)
  )
);

drop policy if exists processos_insert_owner_only on public.processos;
create policy processos_insert_owner_only
on public.processos
for insert
with check (
  exists (
    select 1
    from public.areas a
    where a.id = processos.area_id
      and public.is_owner_of_empresa(a.empresa_id)
  )
);

drop policy if exists processos_update_owner_only on public.processos;
create policy processos_update_owner_only
on public.processos
for update
using (
  exists (
    select 1
    from public.areas a
    where a.id = processos.area_id
      and public.is_owner_of_empresa(a.empresa_id)
  )
)
with check (
  exists (
    select 1
    from public.areas a
    where a.id = processos.area_id
      and public.is_owner_of_empresa(a.empresa_id)
  )
);

drop policy if exists processos_delete_owner_only on public.processos;
create policy processos_delete_owner_only
on public.processos
for delete
using (
  exists (
    select 1
    from public.areas a
    where a.id = processos.area_id
      and public.is_owner_of_empresa(a.empresa_id)
  )
);

drop policy if exists etapas_select_company_members on public.etapas_fluxograma;
create policy etapas_select_company_members
on public.etapas_fluxograma
for select
using (
  exists (
    select 1
    from public.processos p
    join public.areas a on a.id = p.area_id
    where p.id = etapas_fluxograma.processo_id
      and public.is_member_of_empresa(a.empresa_id)
  )
);

drop policy if exists etapas_insert_owner_or_assigned on public.etapas_fluxograma;
create policy etapas_insert_owner_or_assigned
on public.etapas_fluxograma
for insert
with check (public.can_edit_processo(processo_id));

drop policy if exists etapas_update_owner_or_assigned on public.etapas_fluxograma;
create policy etapas_update_owner_or_assigned
on public.etapas_fluxograma
for update
using (public.can_edit_processo(processo_id))
with check (public.can_edit_processo(processo_id));

drop policy if exists etapas_delete_owner_or_assigned on public.etapas_fluxograma;
create policy etapas_delete_owner_or_assigned
on public.etapas_fluxograma
for delete
using (public.can_edit_processo(processo_id));

drop policy if exists area_colaboradores_select_company_members on public.area_colaboradores;
create policy area_colaboradores_select_company_members
on public.area_colaboradores
for select
using (
  exists (
    select 1
    from public.areas a
    where a.id = area_colaboradores.area_id
      and public.is_member_of_empresa(a.empresa_id)
  )
);

drop policy if exists area_colaboradores_manage_owner_only on public.area_colaboradores;
create policy area_colaboradores_manage_owner_only
on public.area_colaboradores
for all
using (
  exists (
    select 1
    from public.areas a
    where a.id = area_colaboradores.area_id
      and public.is_owner_of_empresa(a.empresa_id)
  )
)
with check (
  exists (
    select 1
    from public.areas a
    where a.id = area_colaboradores.area_id
      and public.is_owner_of_empresa(a.empresa_id)
  )
);

drop policy if exists processo_colaboradores_select_company_members on public.processo_colaboradores;
create policy processo_colaboradores_select_company_members
on public.processo_colaboradores
for select
using (
  exists (
    select 1
    from public.processos p
    join public.areas a on a.id = p.area_id
    where p.id = processo_colaboradores.processo_id
      and public.is_member_of_empresa(a.empresa_id)
  )
);

drop policy if exists processo_colaboradores_manage_owner_only on public.processo_colaboradores;
create policy processo_colaboradores_manage_owner_only
on public.processo_colaboradores
for all
using (
  exists (
    select 1
    from public.processos p
    join public.areas a on a.id = p.area_id
    where p.id = processo_colaboradores.processo_id
      and public.is_owner_of_empresa(a.empresa_id)
  )
)
with check (
  exists (
    select 1
    from public.processos p
    join public.areas a on a.id = p.area_id
    where p.id = processo_colaboradores.processo_id
      and public.is_owner_of_empresa(a.empresa_id)
  )
);

comment on table public.perfis is 'Perfil de usuario ligado ao auth.users e escopo de empresa.';
comment on table public.empresas is 'Empresa (tenant) principal do Fluxly.';
comment on table public.areas is 'Areas/setores da empresa.';
comment on table public.processos is 'Processos pertencentes a uma area.';
comment on table public.etapas_fluxograma is 'Etapas ordenadas do fluxograma de um processo.';
comment on table public.area_colaboradores is 'Atribuicoes de colaboradores por area.';
comment on table public.processo_colaboradores is 'Atribuicoes de colaboradores por processo.';

commit;
