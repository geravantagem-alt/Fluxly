# **Problema que o produto ataca**

## **O cenário real das PMEs**

A grande maioria das pequenas e médias empresas no Brasil opera no que chamamos de **"modo cabeça"** — os processos existem, mas vivem na cabeça dos donos e funcionários mais antigos. Não há documentação, não há padronização, não há rastreabilidade.

Isso gera uma série de problemas concretos e custosos:

**Dependência de pessoas.** Quando um colaborador-chave sai da empresa, o conhecimento vai junto. O processo de onboarding de um substituto é lento, caro e cheio de retrabalho porque ninguém sabe exatamente como as coisas funcionam — elas simplesmente "sempre foram assim".

**Inconsistência na execução.** Sem um processo documentado e visível, cada pessoa faz do seu jeito. O resultado de uma tarefa varia dependendo de quem a executou, gerando erros, retrabalho e experiências inconsistentes para o cliente final.

**Dificuldade de escalar.** O dono quer crescer, contratar mais gente, abrir uma filial — mas não consegue porque o negócio inteiro depende dele. Para crescer, precisa primeiro organizar a casa, e organizar a casa parece um projeto enorme e assustador.

**Ferramentas inadequadas.** As soluções existentes são ou muito simples (Word, Excel, Notion) — que não têm estrutura visual nem controle de acesso — ou muito complexas e caras (ERPs, BPM enterprise), que são feitas para grandes empresas e exigem implantação demorada e treinamento intenso.

## **A oportunidade**

Existe um vão enorme entre o "caderno na gaveta" e o software enterprise. É exatamente nesse espaço que o seu produto entra: uma plataforma simples, visual e acessível onde o dono de uma PME consegue **mapear, organizar e compartilhar os processos internos da empresa** com sua equipe — sem precisar ser técnico, sem precisar de consultoria e sem pagar caro.

## **A proposta de valor em uma frase**

**Transformar o conhecimento que está na cabeça das pessoas em processos visíveis, organizados e compartilháveis — para que a empresa funcione sem depender de ninguém específico.**

---

Esse é o problema. Quer que eu avance agora para o **fluxo de usuários** — mapeando cada passo que o dono e o colaborador percorrem dentro da plataforma?

# **Ideação do Software — Fluxly**

## **O que é o produto**

Fluxly é uma plataforma web onde donos de PMEs cadastram sua empresa, organizam suas áreas internas e documentam os processos de cada área em formato de fluxograma visual — com controle de acesso para a equipe.

---

## **As 4 entidades centrais**

**Empresa** → **Área** → **Processo** → **Fluxograma**

**1\. Empresa** — container de tudo. Criada pelo dono no cadastro.

**2\. Área** — representa um setor (RH, Financeiro, Marketing...). Tem colaboradores atribuídos e vários processos dentro dela.

**3\. Processo** — atividade recorrente dentro de uma área (ex: Folha de Pagamento, Contratação). Cada processo tem um fluxograma.

**4\. Fluxograma** — sequência linear de etapas do processo, representada visualmente como blocos conectados por setas. Editado via painel lateral em formato de checklist ordenado — o fluxograma visual atualiza automaticamente conforme as etapas são criadas/reordenadas.

Cada etapa tem:

* Título  
* Descrição (opcional)  
* Ordem (define a sequência)

---

## **Os 2 perfis de usuário**

**Dono / Gestor** — cria a empresa, tem acesso total. Único que pode criar, editar e deletar áreas, processos e colaboradores.

**Colaborador** — convidado pelo dono via e-mail. Visualiza toda a empresa, mas só edita o conteúdo das áreas em que foi atribuído. Não mexe em estrutura.

---

## **As telas do produto**

**Menu lateral fixo com 3 seções:**

* **Áreas** — tela inicial após login  
* **Colaboradores** — gestão de membros  
* **Configurações** — dados da empresa e perfil

**Telas acessadas por navegação:**

**Tela de Áreas** — grid de cards, um por área. Botão para criar nova área via popup (nome \+ cor/ícone). Cada card mostra nome da área e quantidade de processos.

**Tela de Processos da Área** — acessada ao clicar em um card de área. Grid de cards de processos. Mostra colaboradores daquela área. Botão para criar novo processo via popup.

**Tela do Fluxograma** — acessada ao clicar em um processo. Tela cheia com duas partes:

* **Lado esquerdo/direito:** painel de edição em formato de checklist ordenado com as etapas do processo  
* **Centro:** fluxograma visual gerado automaticamente — blocos retangulares conectados por setas de cima para baixo, refletindo a ordem do checklist em tempo real

---

## **Fora do escopo do MVP**

Bifurcações condicionais, comentários nas etapas, histórico de versões, notificações, integrações externas e modo mobile completo.

---

**Fluxo de Usuários — Fluxly**

---

FLUXO 1 — DONO / GESTOR

1. Acesso à plataforma

O usuário acessa o site e se depara com a tela de login. Se ainda não tem conta, vai para o cadastro onde preenche: Nome completo, E-mail, Senha, Nome da empresa e CNPJ. Após confirmar, é direcionado direto para o Dashboard (Tela de Áreas).

Se já tem conta, preenche e-mail e senha e acessa o Dashboard normalmente.

2. Gerenciando Áreas

Na tela de Áreas o dono vê o grid de cards. Ao clicar em "+ Nova Área" um popup abre pedindo o nome da área. Após confirmar, o card aparece na tela. Clicando em um card de área, vai para a tela de Processos daquela área.

3. Gerenciando Processos

Na tela de Processos o dono vê os cards dos processos daquela área. Ao clicar em "+ Novo Processo" um popup abre pedindo o nome do processo e também permite atribuir colaboradores àquele processo diretamente — buscando pelo e-mail dos colaboradores já cadastrados na empresa. Após confirmar, o card do processo é criado. Clicando no card vai para a tela do Fluxograma.

4. Editando o Fluxograma

O dono vê o fluxograma visual vazio e o painel de checklist vazio ao lado. Clicando em "+ Nova Etapa" um popup abre pedindo título e descrição da etapa. Ao confirmar, a etapa aparece no checklist e o fluxograma visual atualiza automaticamente com o novo bloco conectado ao anterior por uma seta. O dono pode reordenar as etapas no checklist com setas para cima e para baixo, e o fluxograma reflete a nova ordem em tempo real. Também é possível editar ou deletar qualquer etapa clicando nela.

5. Gerenciando Colaboradores

No menu lateral em "Colaboradores" o dono vê a lista de membros da empresa. Ao clicar em "+ Novo Colaborador" um popup abre com os campos: E-mail e Senha — que o próprio dono define. Após criar, o dono repassa essas credenciais ao colaborador manualmente. O colaborador entra pela tela de login normalmente com o e-mail e senha fornecidos. Na mesma tela de gerenciamento o dono pode atribuir o colaborador a áreas específicas. Lembrando que colaboradores também podem ser atribuídos a processos específicos na hora de criar ou editar um processo.

6. Configurações do Dono

Na tela de Configurações o dono pode alterar seus dados pessoais (nome, e-mail e senha) e também os dados da empresa (nome e CNPJ).

---

FLUXO 2 — COLABORADOR

1. Primeiro acesso

O colaborador recebe as credenciais (e-mail e senha) diretamente do dono/gestor. Acessa o site, vai para a tela de login, preenche e-mail e senha e entra na plataforma.

2. Navegação geral

O colaborador entra no Dashboard e vê todos os cards de áreas. Pode clicar em qualquer área e visualizar todos os processos e fluxogramas livremente — sem restrição de visualização.

3. O que o colaborador pode editar

Nas áreas em que foi atribuído pelo dono: pode editar as etapas do fluxograma (título, descrição e ordem). Nos processos em que foi atribuído pelo dono: pode editar as etapas do fluxograma daquele processo especificamente. Em ambos os casos, não pode criar ou deletar áreas, processos ou colaboradores.

Nas áreas e processos em que não foi atribuído: apenas visualização, sem botões de edição visíveis.

4. Configurações do Colaborador

Na tela de Configurações o colaborador pode alterar apenas seu nome e sua senha.

---

RESUMO DE PERMISSÕES

Criar ou deletar área: somente o dono. Criar ou deletar processo: somente o dono. Convidar e criar colaboradores: somente o dono. Atribuir colaboradores a áreas e processos: somente o dono. Editar etapas do fluxograma: dono e colaboradores atribuídos à área ou processo. Visualizar tudo: dono e todos os colaboradores. Alterar dados da empresa: somente o dono. Alterar nome e senha: dono e colaboradores (cada um os seus próprios dados).

# **Descrição de Wireframes — Fluxly**

---

## **TELA 1 — LOGIN / CADASTRO**

Layout centralizado na tela com o logo do Fluxly no topo. Abaixo um card com duas abas no topo: "Entrar" e "Criar conta". A aba ativa alterna o formulário abaixo sem mudar de página.

Aba "Entrar" exibe os campos: E-mail e Senha. Botão primário "Entrar".

Aba "Criar conta" exibe os campos: Nome completo, E-mail, Senha, Confirmar senha, Nome da empresa e CNPJ. Botão primário "Criar conta".

Popup de sucesso do cadastro: ícone de check verde, "Conta criada com sucesso\!" Redireciona automaticamente para o Dashboard.

Popup de erro do cadastro: ícone de X vermelho com mensagens específicas — "E-mail já cadastrado", "CNPJ inválido", "As senhas não coincidem" ou "Preencha todos os campos obrigatórios." Botão "Ok" fecha o popup e mantém os dados já preenchidos.

Popup de erro do login: ícone de X vermelho, mensagem "E-mail ou senha incorretos." Botão "Tentar novamente."

---

## **TELA 2 — DASHBOARD / ÁREAS**

Layout com menu lateral fixo à esquerda contendo: logo do Fluxly no topo, item "Áreas" (ativo/selecionado), item "Colaboradores", item "Configurações" e no rodapé do menu o nome e e-mail do usuário logado com opção de logout.

Área principal à direita com título "Áreas" no topo, botão "+ Nova Área" alinhado à direita do título. Abaixo um grid de cards — cada card mostra o nome da área e a quantidade de processos dentro dela. Cards clicáveis navegam para a tela de processos da área. Quando não há nenhuma área cadastrada, exibe um estado vazio com ícone ilustrativo e texto "Nenhuma área cadastrada. Crie sua primeira área."

---

## **POPUP — CRIAR NOVA ÁREA**

Modal centralizado na tela com título "Nova Área". Campo de texto "Nome da área". Dois botões: "Cancelar" (secundário, fecha o popup) e "Criar" (primário, confirma).

Popup de sucesso: ícone de check verde, "Área criada com sucesso\!" Fecha automaticamente e o novo card aparece no grid.

Popup de erro: "O nome da área é obrigatório" ou "Já existe uma área com esse nome." Botão "Ok" mantém o popup de criação aberto para correção.

---

## **POPUP — EDITAR ÁREA**

Mesmo layout do popup de criação, porém com o campo já preenchido com o nome atual da área. Título "Editar Área". Botão "Salvar alterações".

Popup de sucesso: "Área atualizada com sucesso\!"

Popup de erro: "Já existe uma área com esse nome."

---

## **POPUP — DELETAR ÁREA**

Modal de confirmação com ícone de alerta laranja. Texto "Tem certeza que deseja excluir a área \[nome da área\]? Todos os processos e fluxogramas dentro dela serão excluídos permanentemente." Dois botões: "Cancelar" e "Excluir" (vermelho).

Popup de sucesso: "Área excluída com sucesso." Card some do grid.

Popup de erro: "Não foi possível excluir. Tente novamente."

---

## **TELA 3 — PROCESSOS DA ÁREA**

Mesma estrutura de layout com menu lateral. Topo da área principal com breadcrumb "Áreas → \[Nome da Área\]". Título da área em destaque. Abaixo uma linha horizontal separando o header do conteúdo. Botão "+ Novo Processo" alinhado à direita. Grid de cards de processos — cada card mostra o nome do processo. Cards clicáveis navegam para o fluxograma. Estado vazio com texto "Nenhum processo cadastrado nesta área."

---

## **POPUP — CRIAR NOVO PROCESSO**

Modal com título "Novo Processo". Campo "Nome do processo" (obrigatório). Seção "Atribuir colaboradores" com campo de busca por e-mail listando os colaboradores já cadastrados na empresa — cada resultado tem um checkbox para seleção. Dois botões: "Cancelar" e "Criar".

Popup de sucesso: "Processo criado com sucesso\!"

Popup de erro: "O nome do processo é obrigatório" ou "Já existe um processo com esse nome nesta área."

---

## **POPUP — EDITAR PROCESSO**

Mesmo layout do popup de criação com campos preenchidos. Permite renomear e alterar colaboradores atribuídos. Botão "Salvar alterações".

Popup de sucesso: "Processo atualizado com sucesso\!"

Popup de erro: "Já existe um processo com esse nome nesta área."

---

## **POPUP — DELETAR PROCESSO**

Modal de confirmação com ícone de alerta laranja. Texto "Tem certeza que deseja excluir o processo \[nome\]? O fluxograma será excluído permanentemente." Botões "Cancelar" e "Excluir" (vermelho).

Popup de sucesso: "Processo excluído com sucesso."

Popup de erro: "Não foi possível excluir. Tente novamente."

---

## **TELA 4 — FLUXOGRAMA DO PROCESSO**

Tela cheia sem scroll de página. Breadcrumb no topo "Áreas → \[Área\] → \[Processo\]". Layout dividido em dois painéis lado a lado.

Painel esquerdo — Checklist de etapas: título "Etapas do Processo", botão "+ Nova Etapa" no topo. Lista ordenada das etapas — cada item mostra número de ordem, título da etapa e ícones de ação (editar, mover para cima, mover para baixo, deletar). Estado vazio com texto "Nenhuma etapa cadastrada. Adicione a primeira etapa."

Painel direito — Fluxograma visual: renderização automática das etapas em blocos retangulares conectados por setas de cima para baixo. Cada bloco mostra o número e o título da etapa. Clicando em um bloco abre um tooltip ou pequeno popup com a descrição completa da etapa. O fluxograma atualiza em tempo real conforme etapas são adicionadas, editadas ou reordenadas.

Usuários sem permissão de edição nessa área ou processo visualizam o painel esquerdo em modo somente leitura — sem botões de ação visíveis.

---

## **POPUP — CRIAR NOVA ETAPA**

Modal com título "Nova Etapa". Campo "Título da etapa" (obrigatório). Campo "Descrição" (textarea, opcional). Dois botões: "Cancelar" e "Adicionar".

Popup de sucesso: "Etapa adicionada\!" O modal fecha e a etapa aparece no checklist e no fluxograma.

Popup de erro: "O título da etapa é obrigatório."

---

## **POPUP — EDITAR ETAPA**

Mesmo layout do popup de criação com campos preenchidos. Título "Editar Etapa". Botão "Salvar".

Popup de sucesso: "Etapa atualizada\!"

Popup de erro: "O título da etapa é obrigatório."

---

## **POPUP — DELETAR ETAPA**

Modal de confirmação. Texto "Deseja excluir a etapa \[título\]?" Botões "Cancelar" e "Excluir" (vermelho).

Popup de sucesso: "Etapa excluída." Fluxograma atualiza automaticamente reconectando os blocos restantes.

Popup de erro: "Não foi possível excluir. Tente novamente."

---

## **TELA 5 — COLABORADORES**

Mesma estrutura com menu lateral. Título "Colaboradores" com botão "+ Novo Colaborador" à direita. Tabela ou lista com colunas: Nome, E-mail, Áreas atribuídas e Ações (editar e deletar). Estado vazio com texto "Nenhum colaborador cadastrado."

---

## **POPUP — CRIAR NOVO COLABORADOR**

Modal com título "Novo Colaborador". Campos: E-mail e Senha — ambos definidos pelo dono. Seção "Atribuir a Áreas" com checkboxes listando todas as áreas da empresa. Dois botões: "Cancelar" e "Criar".

Popup de sucesso: "Colaborador criado com sucesso\! Repasse o e-mail e senha para ele acessar a plataforma."

Popup de erro: "E-mail já cadastrado na plataforma" ou "Preencha todos os campos obrigatórios."

---

## **POPUP — EDITAR COLABORADOR**

Mesmo layout, campos preenchidos. Permite alterar e-mail, senha e áreas atribuídas. Botão "Salvar alterações".

Popup de sucesso: "Colaborador atualizado com sucesso\!"

Popup de erro: "E-mail já utilizado por outro usuário."

---

## **POPUP — DELETAR COLABORADOR**

Modal de confirmação. Texto "Deseja remover \[nome\] da empresa? Ele perderá acesso à plataforma." Botões "Cancelar" e "Remover" (vermelho).

Popup de sucesso: "Colaborador removido."

Popup de erro: "Não foi possível remover. Tente novamente."

---

## **TELA 6 — CONFIGURAÇÕES (DONO)**

Mesma estrutura com menu lateral. Título "Configurações". Dividida em duas seções com subtítulos.

Seção "Meus dados": campos editáveis de Nome completo, E-mail e Senha (com confirmação de senha). Botão "Salvar dados pessoais".

Seção "Dados da empresa": campos editáveis de Nome da empresa e CNPJ. Botão "Salvar dados da empresa".

Popup de sucesso para cada seção: "Dados atualizados com sucesso\!"

Popup de erro: "E-mail já está em uso por outro usuário", "CNPJ inválido" ou "As senhas não coincidem."

---

## **TELA 7 — CONFIGURAÇÕES (COLABORADOR)**

Mesma estrutura com menu lateral. Título "Configurações". Seção única "Meus dados" com campos: Nome completo e Senha (com confirmação de senha). Não exibe dados da empresa nem CNPJ. Botão "Salvar".

Popup de sucesso: "Dados atualizados com sucesso\!"

Popup de erro: "As senhas não coincidem" ou "Preencha todos os campos obrigatórios."

---

Wireframes completos e ajustados. Quer avançar para a modelagem do banco de dados?

# **Modelagem do Banco de Dados — Fluxly**

Supabase usa PostgreSQL, então a modelagem será relacional com uso do sistema de autenticação nativo do Supabase (auth.users) e Row Level Security (RLS) para controlar as permissões diretamente no banco.

---

## **VISÃO GERAL DAS TABELAS**

auth.users (nativa do Supabase) → perfis → empresas → areas → processos → etapas\_fluxograma → area\_colaboradores → processo\_colaboradores

---

## **TABELAS**

### **perfis**

Extensão da tabela nativa auth.users do Supabase. Armazena dados adicionais do usuário.

id — uuid, chave primária, referencia auth.users(id) empresa\_id — uuid, chave estrangeira → empresas(id), nullable (nulo até a empresa ser criada) nome\_completo — text, não nulo cargo — text, não nulo — valores possíveis: "dono" ou "colaborador" criado\_em — timestamp with time zone, padrão now()

---

### **empresas**

Representa a empresa cadastrada pelo dono.

id — uuid, chave primária, padrão gen\_random\_uuid() dono\_id — uuid, chave estrangeira → perfis(id), não nulo nome — text, não nulo cnpj — text, não nulo, único criado\_em — timestamp with time zone, padrão now()

---

### **areas**

Representa os setores da empresa (RH, Financeiro, Marketing...).

id — uuid, chave primária, padrão gen\_random\_uuid() empresa\_id — uuid, chave estrangeira → empresas(id), não nulo nome — text, não nulo criado\_em — timestamp with time zone, padrão now()

Restrição: nome deve ser único dentro do mesmo empresa\_id.

---

### **processos**

Representa os processos dentro de uma área.

id — uuid, chave primária, padrão gen\_random\_uuid() area\_id — uuid, chave estrangeira → areas(id), não nulo nome — text, não nulo criado\_em — timestamp with time zone, padrão now()

Restrição: nome deve ser único dentro do mesmo area\_id.

---

### **etapas\_fluxograma**

Representa as etapas do fluxograma de um processo. A ordem das etapas define o fluxograma linear.

id — uuid, chave primária, padrão gen\_random\_uuid() processo\_id — uuid, chave estrangeira → processos(id), não nulo titulo — text, não nulo descricao — text, nullable ordem — integer, não nulo criado\_em — timestamp with time zone, padrão now()

Restrição: ordem deve ser única dentro do mesmo processo\_id.

---

### **area\_colaboradores**

Tabela de relacionamento que define quais colaboradores têm permissão de edição em quais áreas.

id — uuid, chave primária, padrão gen\_random\_uuid() area\_id — uuid, chave estrangeira → areas(id), não nulo colaborador\_id — uuid, chave estrangeira → perfis(id), não nulo criado\_em — timestamp with time zone, padrão now()

Restrição: combinação de area\_id \+ colaborador\_id deve ser única.

---

### **processo\_colaboradores**

Tabela de relacionamento que define quais colaboradores têm permissão de edição em quais processos específicos.

id — uuid, chave primária, padrão gen\_random\_uuid() processo\_id — uuid, chave estrangeira → processos(id), não nulo colaborador\_id — uuid, chave estrangeira → perfis(id), não nulo criado\_em — timestamp with time zone, padrão now()

Restrição: combinação de processo\_id \+ colaborador\_id deve ser única.

---

## **RELACIONAMENTOS**

Uma empresa tem um dono (perfis) e muitos colaboradores (perfis). Uma empresa tem muitas areas. Uma area tem muitos processos. Um processo tem muitas etapas\_fluxograma. Uma area pode ter muitos colaboradores via area\_colaboradores. Um processo pode ter muitos colaboradores via processo\_colaboradores.

---

## **REGRAS DE NEGÓCIO NO BANCO (RLS)**

Estas políticas serão configuradas no Supabase via Row Level Security para garantir as permissões no nível do banco, sem depender só do frontend.

perfis — usuário só lê e edita o próprio perfil. Dono lê todos os perfis da sua empresa.

empresas — apenas o dono lê e edita a própria empresa.

areas — todos os membros da empresa podem ler. Apenas o dono pode inserir, atualizar e deletar.

processos — todos os membros da empresa podem ler. Apenas o dono pode inserir, atualizar e deletar.

etapas\_fluxograma — todos os membros da empresa podem ler. Dono pode fazer tudo. Colaborador pode inserir, atualizar e deletar apenas se existir um registro correspondente em area\_colaboradores ou processo\_colaboradores com o seu id.

area\_colaboradores — apenas o dono pode gerenciar.

processo\_colaboradores — apenas o dono pode gerenciar.

---

## **OBSERVAÇÕES IMPORTANTES**

O Supabase cuida do cadastro e login via auth.users nativamente. A tabela perfis é criada separadamente e vinculada via trigger automático no Supabase — toda vez que um novo usuário é criado em auth.users, um registro correspondente é inserido em perfis automaticamente.

Colaboradores são criados pelo dono diretamente via Supabase Auth Admin API no backend, passando e-mail e senha — sem fluxo de convite por e-mail, exatamente como definido no fluxo de usuários.

O campo ordem em etapas fluxograma controla a sequência linear do fluxograma. Quando uma etapa é reordenada, os valores de ordem das demais etapas do mesmo processo são atualizados em cascata.

---

Banco de dados modelado e renomeado. Quer avançar agora para a escolha das tecnologias?

**STACK INICIAL**

\-google stitch \ 
Next.js com TypeScript — estrutura e roteamento do frontend.   
Tailwind CSS — estilização.      
React Flow — renderização do fluxograma visual.   
Supabase — autenticação, banco de dados PostgreSQL, RLS e Edge Functions.   
Vercel — deploy e hospedagem.

**Identidade Visual — Fluxly**  
Paleta de cores  
Fundo principal — preto puro ou quase puro: \#0a0a0a. É a base de tudo, dá peso e sofisticação.  
Superfícies e cards — preto um tom acima: \#141414 e \#1c1c1c. Cria profundidade sem sair do universo escuro.  
Cor primária / destaque — amarelo areia: algo entre \#c9a84c e \#d4a843. Não é amarelo neon, é um amarelo quente, dourado, terroso. Aplicado em botões primários, bordas ativas, ícones de destaque, item ativo no menu e os blocos do fluxograma.  
Cor de texto principal — branco suave: \#f0f0f0. Nunca branco puro para não agredir o olho no fundo escuro.  
Cor de texto secundário — cinza médio: \#8a8a8a. Para descrições, labels e informações de suporte.  
Bordas e separadores — cinza muito escuro: \#2a2a2a. Quase invisível, só para delimitar elementos.  
Erro — vermelho apagado: \#c0392b que vibra no hover.  
Sucesso — verde musgo apagado: \#4a7c59. Discreto, não compete com o amarelo areia.

Tipografia  
Fonte: Geist ou Inter — sem serifa, moderna e legível em fundo escuro.  
Títulos em bold pesado (\#f0f0f0), corpo em regular (\#8a8a8a), destaques e labels em amarelo areia (\#d4a843).

Menu lateral  
Fundo \#0f0f0f, levemente mais escuro que o conteúdo. Itens com ícone e texto em cinza claro. Item ativo com fundo \#1c1c1c e texto/ícone em amarelo areia. Borda direita fina em amarelo areia no item ativo para reforçar a seleção. Logo do Fluxly no topo com a letra ou ícone em amarelo areia sobre fundo preto.

Cards  
Fundo \#141414, borda \#2a2a2a fina. No hover a borda acende em amarelo areia com transição suave. Sem sombra — o contraste de tons e o hover fazem o trabalho.

Botões  
Primário: fundo amarelo areia (\#d4a843) com texto preto bold — contraste alto e muito elegante. Secundário: fundo transparente com borda \#2a2a2a e texto \#f0f0f0, hover acende a borda em amarelo areia. Destrutivo: texto vermelho apagado com borda vermelha que vibra no hover.

Inputs e formulários  
Fundo \#0f0f0f, borda \#2a2a2a em repouso. No foco a borda vira amarelo areia. Label em cinza médio acima do campo. Texto digitado em branco suave.

Popups e modais  
Fundo \#141414, borda \#2a2a2a, overlay \#000000 com 60% de opacidade atrás. Título do modal em branco bold, conteúdo em cinza, botões seguindo o padrão acima.

Fluxograma  
Blocos retangulares com fundo \#1c1c1c, borda em amarelo areia (\#d4a843), número da etapa em amarelo areia, título em branco. Setas finas em \#2a2a2a conectando os blocos de cima para baixo. Bloco selecionado ou em hover ganha borda mais intensa e um brilho sutil em amarelo.

