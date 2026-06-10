begin;

create or replace function public.bootstrap_current_profile(
  full_name_input text default null,
  role_input text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  auth_user auth.users%rowtype;
  normalized_role public.cargo_usuario;
  normalized_name text;
begin
  if auth.uid() is null then
    raise exception 'Usuario nao autenticado.';
  end if;

  select * into auth_user
  from auth.users
  where id = auth.uid();

  if auth_user.id is null then
    raise exception 'Usuario auth nao encontrado.';
  end if;

  normalized_name := coalesce(
    nullif(trim(full_name_input), ''),
    nullif(trim(auth_user.raw_user_meta_data ->> 'full_name'), ''),
    split_part(auth_user.email, '@', 1)
  );

  normalized_role := case
    when coalesce(role_input, auth_user.raw_user_meta_data ->> 'role') in ('dono', 'owner') then 'dono'::public.cargo_usuario
    else 'colaborador'::public.cargo_usuario
  end;

  insert into public.perfis (id, email, nome_completo, cargo)
  values (auth_user.id, auth_user.email, normalized_name, normalized_role)
  on conflict (id) do update
    set email = excluded.email,
        nome_completo = coalesce(public.perfis.nome_completo, excluded.nome_completo),
        cargo = coalesce(public.perfis.cargo, excluded.cargo);

  return auth_user.id;
end;
$$;

grant execute on function public.bootstrap_current_profile(text, text) to authenticated;

commit;
