# Fluxly

Aplicacao web do Fluxly para mapear areas, processos e fluxogramas com autenticacao e banco no Supabase.

## Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React
- Radix UI (Dialog + Toast)
- React Flow
- Supabase JS

## Como rodar
1. Instale dependencias:
```bash
npm install
```
2. Crie o `.env.local` com base no `.env.example`
3. Rode em desenvolvimento:
```bash
npm run dev
```
4. Abra:
```text
http://localhost:3000
```

## Variaveis de ambiente
Preencha no `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

## Supabase
O projeto depende de:
- Supabase Auth para login/cadastro
- schema principal em `supabase/migrations`
- service role para gestao de colaboradores via rotas `src/app/api/collaborators`

Antes de usar o app em ambiente real:
1. aplique as migrations do diretorio `supabase/migrations`
2. configure as tres variaveis do `.env.local`
3. reinicie o servidor `npm run dev`
4. siga o `LAUNCH_CHECKLIST.md` antes do primeiro deploy publico

## Fluxos implementados
- cadastro e login do dono
- dashboard autenticado
- criacao, edicao e exclusao de areas
- criacao, edicao e exclusao de processos
- criacao, edicao, reordenacao e exclusao de etapas do fluxograma
- gestao de colaboradores com atribuicao por area e processo
- configuracoes de conta e empresa
- regras iniciais de permissao entre dono e colaborador

## Estrutura
- `src/app/(auth)` telas de login/cadastro
- `src/app/(dashboard)` telas autenticadas com menu lateral
- `src/app/api/collaborators` rotas protegidas para gestao de colaboradores
- `src/components/ui` design system interno
- `src/lib/supabase` clientes e camada de acesso a dados
- `supabase/migrations` schema, RLS, triggers e funcoes do banco
- `LAUNCH_CHECKLIST.md` roteiro operacional para validacao final e deploy
- `src/types` tipagem global
