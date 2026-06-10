# Fluxly Launch Checklist

Checklist operacional para validar o MVP antes do primeiro deploy publico.

## 1. Ambiente
- [ ] Rodar `npm install`
- [ ] Confirmar `.env.local` preenchido com:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Confirmar que o projeto Supabase alvo e o projeto correto de producao ou staging

## 2. Banco e Supabase
- [ ] Aplicar as migrations em `supabase/migrations`
- [ ] Verificar se as tabelas existem:
  - [ ] `perfis`
  - [ ] `empresas`
  - [ ] `areas`
  - [ ] `processos`
  - [ ] `etapas_fluxograma`
  - [ ] `area_colaboradores`
  - [ ] `processo_colaboradores`
- [ ] Verificar se as funcoes existem:
  - [ ] `current_empresa_id`
  - [ ] `current_user_role`
  - [ ] `can_edit_processo`
  - [ ] `bootstrap_current_profile`
- [ ] Confirmar Row Level Security habilitado nas tabelas principais
- [ ] Confirmar que a service role esta funcionando para as rotas `/api/collaborators`

## 3. Validacao tecnica local
- [x] `npm run typecheck`
- [x] `npm run build`
- [ ] `npm run dev`
- [ ] Abrir o app sem erros no console do navegador

## 4. Fluxo do dono
- [ ] Criar conta de dono
- [ ] Confirmar criacao de `perfil`
- [ ] Confirmar criacao de `empresa`
- [ ] Entrar no dashboard
- [ ] Criar uma area
- [ ] Editar a area
- [ ] Excluir uma area de teste
- [ ] Criar um processo
- [ ] Editar o processo
- [ ] Excluir um processo de teste
- [ ] Criar etapas no fluxograma
- [ ] Editar etapa
- [ ] Reordenar etapa
- [ ] Excluir etapa
- [ ] Alterar nome do dono em configuracoes
- [ ] Alterar senha do dono
- [ ] Alterar nome da empresa
- [ ] Alterar CNPJ da empresa

## 5. Fluxo de colaborador
- [ ] Criar colaborador via tela de colaboradores
- [ ] Confirmar que o colaborador aparece na listagem
- [ ] Atribuir colaborador a uma area
- [ ] Atribuir colaborador a um processo especifico
- [ ] Fazer login com o colaborador
- [ ] Confirmar que o colaborador NAO ve a tela de colaboradores no menu
- [ ] Confirmar que o colaborador consegue visualizar areas e processos
- [ ] Confirmar que o colaborador consegue editar etapas apenas onde foi atribuido
- [ ] Confirmar que o colaborador NAO consegue criar ou excluir areas
- [ ] Confirmar que o colaborador NAO consegue criar ou excluir processos
- [ ] Confirmar que o colaborador consegue alterar propria senha em configuracoes

## 6. Permissoes e seguranca
- [ ] Acesso direto a `/colaboradores` como colaborador redireciona corretamente
- [ ] Acesso direto a uma area inexistente retorna tela adequada
- [ ] Acesso direto a um processo inexistente retorna tela adequada
- [ ] API de colaboradores bloqueia usuario que nao e dono
- [ ] Rotas autenticadas redirecionam para `/login` sem sessao
- [ ] `login` e `signup` redirecionam para `/dashboard` se a sessao ja existir

## 7. UX minima
- [ ] Verificar toasts de sucesso e erro nos fluxos principais
- [ ] Verificar estados vazios
- [ ] Verificar carregamentos principais
- [ ] Verificar navegacao mobile basica
- [ ] Verificar que os textos nao mencionam mock, fallback ou demo indevidamente

## 8. Deploy
- [ ] Configurar variaveis de ambiente na Vercel
- [ ] Rodar deploy
- [ ] Abrir ambiente publicado
- [ ] Repetir os fluxos criticos de dono
- [ ] Repetir os fluxos criticos de colaborador
- [ ] Validar APIs `/api/collaborators` no ambiente publicado

## 9. Pos-lancamento imediato
- [ ] Criar primeiro usuario real de teste
- [ ] Criar primeira empresa real de teste
- [ ] Monitorar erros de autenticacao
- [ ] Monitorar erros nas rotas de colaboradores
- [ ] Registrar bugs encontrados no uso real
