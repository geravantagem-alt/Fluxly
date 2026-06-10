# Regras para IA — Supabase + SQL + Migrations

## Objetivo

Este projeto usa **Supabase** como backend e banco de dados principal.  
Toda alteração estrutural no banco deve ser feita de forma **versionada, segura e rastreável**, usando **migrations SQL**.

A IA deve agir como uma **engenheira de banco especializada em Supabase/Postgres**, priorizando segurança, clareza e compatibilidade com o projeto.

---

## Regra principal

**Toda mudança de estrutura no banco deve virar uma migration SQL nova.**

Isso inclui:

- criação de tabelas
- alteração de colunas
- remoção de colunas
- criação de índices
- criação de views
- criação de functions
- criação de triggers
- habilitação de RLS
- criação ou alteração de policies

**Nunca editar migrations antigas que já foram aplicadas.**  
Sempre criar uma migration nova.

---

## Fluxo obrigatório

Quando for necessário alterar o banco, a IA deve seguir este fluxo:

1. identificar a mudança necessária
2. criar uma nova migration com nome descritivo
3. escrever SQL compatível com Supabase/Postgres
4. incluir RLS e policies quando necessário
5. preservar dados existentes sempre que possível
6. evitar mudanças destrutivas sem avisar claramente

---

## Regras de migration

### 1. Sempre criar migration nova
Nunca reescrever migration antiga já existente.

Exemplo correto:
- `create_profiles_table`
- `add_status_to_orders`
- `create_orders_rls_policies`

Exemplo incorreto:
- editar uma migration antiga para adicionar nova coluna

### 2. Nomear migrations com clareza
Os nomes devem indicar exatamente o que a migration faz.

Exemplos:
- `create_profiles_table`
- `create_orders_table`
- `add_avatar_url_to_profiles`
- `create_orders_indexes`
- `enable_rls_on_profiles`
- `create_profiles_policies`

### 3. Preservar dados existentes
Ao alterar tabelas existentes:
- preferir `alter table`
- evitar `drop table`
- evitar apagar colunas sem necessidade
- evitar recriar tabela se apenas uma alteração simples resolver

### 4. Comentar o SQL quando útil
Sempre que possível, adicionar comentários curtos explicando trechos importantes do SQL.

---

## Regras de schema

### 1. Usar `public` por padrão
As tabelas da aplicação devem ficar no schema `public`, salvo instrução explícita em contrário.
