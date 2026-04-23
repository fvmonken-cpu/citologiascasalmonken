# Manual do Administrador — Sistema de Controle de Citologias

**Espaço Casal Monken | Ginecologia e Obstetrícia**

---

## 1. Seu papel

Como Administrador, você é quem **mantém o sistema funcionando no dia a dia** — além de poder executar qualquer ação que secretária ou médico façam, a seu cargo ficam:

- **Gerenciar usuários** (criar, alterar, desativar contas da equipe).
- **Configurar laboratórios** e seus prazos (SLA).
- **Monitorar o fluxo** da clínica inteira, não apenas o de um médico.
- **Atuar em situações excepcionais** (um médico de férias, um exame travado, um SLA vencendo sem ação).
- **Zelar pela segurança dos dados** das pacientes.

Diferente do médico (que só vê os próprios exames) e da secretária (que executa o fluxo), **você enxerga tudo**. Isso é poder e responsabilidade ao mesmo tempo.

---

## 2. Hierarquia de perfis

O sistema tem quatro perfis, do mais restrito ao mais abrangente:

| Perfil | O que pode fazer |
|--------|------------------|
| **Médico** | Ver e dar parecer nos próprios exames |
| **Secretária** | Cadastrar pacientes, exames, labs; conduzir o fluxo até comunicar paciente |
| **Administrador** (você) | Tudo que secretária e médico fazem + gerenciar usuários, ver relatórios, editar qualquer parecer |
| **Superusuário** | Tudo + criar/editar/excluir outros administradores e mudar senhas de admins |

Você **não consegue**:

- Alterar senha de um Superusuário.
- Mudar o perfil de um Superusuário.
- Desativar ou excluir um Superusuário.

Para isso, é necessário um Superusuário. Se você é a única pessoa administrativa e perdeu esse acesso, será preciso recorrer ao suporte técnico.

---

## 3. Como acessar o sistema

1. Abra Chrome ou Edge e vá para:
   **https://citologiascasalmonken.netlify.app**
2. Entre com seu email e senha.

Sessão expira automaticamente após **15 minutos** de inatividade — proposital para proteger o sistema.

### Troca de senha

Menu → **Alterar Senha**. Recomendação: troque sua senha a cada 90 dias.

---

## 4. Gerenciar Usuários (menu "Usuários")

### Criar um novo usuário

1. Menu → **Usuários** → clique em **Novo Usuário**.
2. Preencha:
   - **Nome completo** (como aparecerá nas telas e nos registros).
   - **Email** (será o login da pessoa).
   - **Senha** (provisória — peça para a pessoa trocar no primeiro acesso).
   - **Perfil**: Médico / Secretária / Administrador.
   - **Ativo**: marcado por padrão.
3. Clique em **Criar Usuário**.

A pessoa já pode fazer login com o email e senha que você definiu.

### Editar um usuário existente

1. Na listagem, clique no ícone de **lápis** ao lado do usuário.
2. Você pode alterar: nome, email, perfil, status (ativo/inativo) e também **redefinir a senha** (deixe o campo vazio se quiser manter a senha atual).
3. Salve.

> **Importante sobre mudança de perfil**: quando você muda o perfil de alguém, a nova permissão só passa a valer no **próximo login** dessa pessoa (por motivos técnicos internos do sistema de autenticação). Peça para ela sair e entrar de novo.

### Desativar um usuário (preferível a excluir)

Na listagem, clique no ícone de **usuário com X** para desativar. A pessoa:

- Não consegue mais fazer login.
- **Some** da lista de "Usuários Ativos" e vai para a seção "Usuários Inativos" abaixo.
- Todo o histórico dela (pareceres emitidos, ações registradas) permanece intacto — importante para auditoria e compliance.

Esta é a forma recomendada de "remover" alguém do sistema (ex: médico que não atende mais na clínica, secretária que saiu). Você pode reativar no futuro se necessário.

### Excluir um usuário (com cuidado)

O botão de lixeira **exclui de verdade** a conta. Funciona apenas se a pessoa **não tem pareceres emitidos nem pacientes associadas**. Caso tenha, o sistema bloqueia a exclusão — e a forma correta é desativar.

**Regra prática**: para médicos e secretárias que já usaram o sistema, sempre **desative**, nunca exclua. Excluir é apropriado apenas para contas criadas por engano e nunca usadas.

---

## 5. Laboratórios (menu "Laboratórios")

Aqui você cadastra e mantém os laboratórios que a clínica usa.

### Cadastrar laboratório

1. Menu → **Laboratórios** → **Novo Laboratório**.
2. Preencha:
   - **Nome** do laboratório.
   - **Pessoa de contato** (quem a secretária procura quando há dúvida).
   - **Telefone de contato**.
   - **Link para consulta de resultados** (portal do laboratório).
   - **SLA em dias** — **configuração crítica**, veja abaixo.
3. Salve.

### Entendendo o SLA

O **SLA em dias** é quantos dias o laboratório costuma levar para liberar o resultado, contados a partir da coleta.

Quando um exame fica **mais tempo** do que esse SLA sem mudar de status, o sistema:

1. Marca o exame como **"SLA vencido"** no dashboard de todos os usuários da clínica.
2. **Envia uma notificação push** diariamente (manhã, aproximadamente às 8h) para você e demais administradores.

Isso evita que exames fiquem esquecidos no laboratório.

**Calibração**: comece com o SLA declarado pelo laboratório; se passar alguns meses e você perceber que vencimentos são frequentes mesmo com o laboratório funcionando normal, aumente um pouco. Se quase nenhum exame vence, considere diminuir para aumentar o rigor.

---

## 6. Monitoramento do fluxo da clínica

### Dashboard

Seu dashboard mostra **tudo da clínica**, não só o seu. Use-o para:

- Ver exames com **SLA vencido** — requer ação (cobrar o laboratório).
- Ver **pareceres pendentes** — se algum médico está acumulando sem responder.
- Ver **pacientes aguardando comunicação** — se a secretária não está dando conta.

### Histórico (menu "Histórico")

Lista todos os exames com filtros:

- Nome da paciente
- Médico(a)
- Status
- Laboratório
- Período

Use para relatórios pontuais ("quantos exames o Dr. X fez em março", "quantos resultados HSIL tivemos no último trimestre").

### Relatórios (menu "Relatórios")

Acesso exclusivo de Administrador/Superusuário. Em desenvolvimento — novos indicadores agregados serão adicionados conforme a demanda.

---

## 7. Situações excepcionais e como atuar

### Um médico está de férias e o resultado chegou

Como administrador, **você pode emitir parecer em qualquer exame**, inclusive de um médico ausente.

1. Abra o exame.
2. Clique em **Emitir Parecer Médico**.
3. Preencha os campos normalmente e salve.
4. Registre no campo de **observações** algo como *"Parecer emitido pela administração em substituição ao Dr. X por motivo de férias"*.

### Precisa-se editar um parecer já emitido

Administradores podem **editar parecer de qualquer médico**. Toda edição fica registrada no log de auditoria.

1. Abra o exame com o parecer.
2. Clique em **Editar Parecer**.
3. Ajuste e salve.

Por cortesia, avise o médico originalmente responsável.

### Uma paciente foi cadastrada associada ao médico errado

1. Menu → **Pacientes**.
2. Abra a paciente em questão.
3. Edite o campo **Médico responsável**.
4. Salve.

Os exames já registrados continuam com o médico anterior — se isso for um problema, abra cada exame e ajuste manualmente ou fale com a administração para intervir.

### Exame travado em um status

Se por algum motivo um exame ficou em um status que não avança (ex: secretária esqueceu de conferir e saiu de férias), você pode avançar no lugar dela — o sistema permite admins executarem qualquer transição.

### Usuário esqueceu a senha e não consegue entrar

Menu → **Usuários** → clique no lápis do usuário → informe nova senha → salve. Comunique-o e peça para trocar no próximo login.

### Notificações pararam de chegar para algum usuário

1. Peça para a pessoa conferir se o sino está **azul** na tela dela.
2. Se sim, o problema pode ser permissão do navegador. Peça para ela abrir o cadeado na barra de endereço e verificar se "Notificações" está como *Permitir*.
3. Se mesmo assim não chegar, peça para desativar e reativar o sino.

---

## 8. Notificações que você recebe

Como administrador, você recebe notificações push de dois tipos:

- **"Parecer Médico Emitido"** — sempre que qualquer médico emite um parecer (para você acompanhar o fluxo).
- **"SLA vencido"** — aviso diário de manhã listando exames atrasados no laboratório.

### Como ativar

**Computador:** login → sino no canto superior direito → clicar para ativar → permitir no navegador.

**Celular (Android):** login → toque no sino → permitir. **Dica**: instale como aplicativo (menu do navegador → *Instalar app*) para notificações funcionarem mesmo com o navegador fechado.

**iPhone:** precisa instalar como app pelo Safari (botão compartilhar → *Adicionar à Tela de Início*) e abrir dali. Limitação da Apple — não funciona no Safari comum.

### Se bloqueou por engano

Cadeado na barra de endereço → **Notificações** → *Permitir* → recarregar página.

---

## 9. Segurança e boas práticas

### Nunca compartilhar senha

Cada pessoa tem login próprio para que o sistema saiba **quem fez o quê**. Se duas pessoas usam o mesmo login, a auditoria perde valor legal.

### Cadastrar colaboradores novos imediatamente

Assim que alguém novo entra na clínica, crie o usuário antes do primeiro dia. Evita que a pessoa "peça o login" de um colega para começar a trabalhar.

### Desativar imediatamente quando alguém sair

Quando um colaborador sai da clínica, **desative a conta no mesmo dia** (ou antes, se saída programada). Acessos abandonados são o principal vetor de vazamento em sistemas clínicos.

### Trocar senhas periodicamente

Recomende à equipe trocar a senha a cada 90 dias. Você não pode forçar, mas pode incentivar.

### Monitorar o dashboard

Pelo menos **uma vez por dia**, confira:

- Exames com SLA vencido.
- Pareceres há muito tempo pendentes.
- Comunicações à paciente pendentes há mais de 2 dias.

### Privacidade de dados

O sistema lida com dados sensíveis de saúde — sujeitos à LGPD. Nunca:

- Envie prints com nomes de pacientes para grupos ou fora do ambiente clínico.
- Baixe e salve relatórios com dados pessoais em pen drives ou pastas pessoais na nuvem.
- Deixe o computador da clínica desbloqueado com o sistema aberto.

---

## 10. Problemas comuns

### Criei um usuário mas ele não consegue entrar
Verifique se o status está **Ativo**. Se a senha foi informada corretamente, peça para ele tentar de novo — às vezes é só erro de digitação.

### A pessoa mudou de perfil mas ainda vê as telas antigas
Peça para ela sair e entrar novamente — o novo perfil só passa a valer após novo login.

### "Não consigo excluir um usuário"
É um comportamento de segurança do banco: usuários que emitiram pareceres ou têm pacientes associadas não podem ser excluídos, para preservar a auditoria. **Desative** em vez de excluir.

### "A página está estranha após uma atualização do sistema"
Pressione **Ctrl + Shift + R** (Windows) ou **Cmd + Shift + R** (Mac) para recarregar ignorando o cache. Peça para a equipe fazer o mesmo se uma atualização foi anunciada.

### Um exame aparece duplicado / com número de frasco errado
Abra o exame, confira o histórico de ações (quem cadastrou, quando) e decida: se foi duplicação, peça ao suporte técnico para marcar um como cancelado. Se foi erro de digitação no frasco, edite o exame.

### SLA vencendo constantemente para um laboratório
Dois cenários:

1. O laboratório realmente está atrasando — é hora de conversar com eles ou buscar alternativas.
2. Seu SLA está configurado muito justo — reavalie o prazo cadastrado em **Laboratórios**.

---

## 11. Quando recorrer ao Superusuário ou ao suporte técnico

Procure o **Superusuário** quando:

- Precisar alterar senha ou perfil de outro Administrador.
- Um Administrador saiu da clínica e precisa ser excluído.
- Você (único admin) perdeu acesso à sua conta.

Procure o **suporte técnico** quando:

- O sistema está indisponível (erro 500, página em branco).
- Encontrou um comportamento que parece erro de programação (ex: botão que não responde, dado salvo errado).
- Precisa de uma migração de dados em massa (ex: remanejar dezenas de pacientes entre médicos).
- Quer adicionar uma funcionalidade nova ou um novo relatório.

Envie sempre que possível: **o que você estava tentando fazer**, **o que aconteceu** e **um print da tela**.

---

## 12. Referência rápida

| Situação | Onde resolver |
|----------|---------------|
| Criar/alterar/desativar usuário | Menu → Usuários |
| Redefinir senha de alguém | Menu → Usuários → editar → senha |
| Cadastrar/editar laboratório, ajustar SLA | Menu → Laboratórios |
| Ver todos os exames de um médico | Menu → Histórico → filtro por médico |
| Ver todas as pacientes | Menu → Pacientes |
| Emitir parecer em nome de um médico | Abrir o exame → Emitir Parecer Médico |
| Corrigir parecer emitido | Abrir o exame → Editar Parecer |
| Ver SLAs vencidos | Dashboard |
| Trocar sua senha | Menu → Alterar Senha |
| Sair do sistema | Botão *Sair* no canto |

---

_Manual atualizado em abril de 2026._
