# Manual da Secretária — Sistema de Controle de Citologias

**Espaço Casal Monken | Ginecologia e Obstetrícia**

---

## 1. Para que serve este sistema

O sistema acompanha o **ciclo completo de cada exame de citologia oncótica** de uma paciente — desde a coleta no consultório até a comunicação do resultado final a ela — sem que nenhum exame seja esquecido no caminho.

Sem o sistema, é comum que:

- um exame seja coletado mas nunca chegue ao laboratório;
- um resultado seja liberado e fique dias sem ser visto;
- o médico emita um parecer e a paciente não seja avisada;
- uma próxima consulta seja recomendada mas nunca marcada.

O sistema impede que isso aconteça, mostrando **em qual etapa cada exame está** e **alertando quando algo está atrasado**.

### Etapas de um exame

Cada exame percorre sempre esta sequência:

| # | Etapa | Quem avança |
|---|-------|-------------|
| 1 | **Amostra Coletada** | (status inicial, ao cadastrar o exame) |
| 2 | **Recolhido pelo Laboratório** | **Secretária** |
| 3 | **Resultado Liberado** | Secretária (ao subir o laudo) |
| 4 | **Conferido pela Secretária** | **Secretária** |
| 5 | **Parecer Médico Emitido** | Médico |
| 6 | **Paciente Comunicada** | **Secretária** |
| 7 | **Próxima Consulta Comunicada ao Comercial** | **Secretária** |

Em negrito: as etapas onde **você** é a pessoa responsável por avançar.

---

## 2. Como acessar o sistema

1. Abra o navegador (Chrome ou Edge recomendados) e vá para:
   **https://citologiascasalmonken.netlify.app**
2. Digite seu **email** e **senha** nos campos do formulário.
3. Clique em **Entrar**.

Você verá um aviso "Bem-vinda, [seu nome]!" e o Dashboard será aberto.

### Troca de senha

1. No menu lateral (computador) ou ao descer pelo menu (celular), clique em **Alterar Senha**.
2. Digite a senha atual, a nova senha e confirme.
3. Salve.

### Sessão expira sozinha

Por segurança, após **15 minutos sem nenhuma ação** (nem clique, nem rolar tela), o sistema desconecta você automaticamente e pede login novamente. Isso é proposital — evita que alguém use seu acesso se você sair do computador.

---

## 3. O que aparece no Dashboard

A tela inicial mostra **o que precisa da sua atenção hoje**:

- **Exames aguardando coleta no laboratório** — amostras que você já cadastrou mas que o laboratório ainda não buscou.
- **Resultados recém-liberados** — prontos para você conferir.
- **Pareceres médicos emitidos** — aguardando você avisar a paciente.
- **Consultas a comunicar ao comercial** — para agendar retorno.
- **Exames com SLA vencido** — estão demorando mais do que o prazo normal do laboratório e precisam de atenção.

Clique em qualquer exame da lista para abrir os detalhes dele.

---

## 4. Passo a passo das suas tarefas principais

### 4.1. Cadastrar uma paciente nova

> Fazer **antes** de cadastrar o exame dela.

1. Menu → **Pacientes**.
2. Clique em **Nova Paciente**.
3. Preencha:
   - Nome completo
   - Data de nascimento
   - Telefone (WhatsApp, de preferência)
   - Médico(a) responsável
4. Clique em **Salvar**.

> Se a paciente já existe, não precisa cadastrar de novo. Use a busca.

### 4.2. Cadastrar um novo exame (após a coleta)

1. Menu → **Novo Exame**.
2. Selecione a **paciente** (campo de busca).
3. Selecione o **médico** que coletou.
4. Selecione o **laboratório** que vai processar.
5. Preencha:
   - **Data da coleta**
   - **Número do frasco** (conforme etiqueta que vai com a amostra)
   - Marque o que foi solicitado: Citologia / DNA-HPV / Biópsia
   - Observações iniciais (se houver)
6. Clique em **Cadastrar Exame**.

O exame entra no status **"Amostra Coletada"**.

### 4.3. Quando o laboratório buscar a amostra

1. Abra o exame (clique nele no Dashboard ou no Histórico).
2. Clique em **"Avançar para: Recolhido pelo Laboratório"**.

A data do recolhimento é registrada automaticamente.

### 4.4. Quando o laudo ficar pronto no laboratório

1. Entre no site do laboratório (link está na ficha do exame, em **Laboratórios**).
2. Baixe o laudo.
3. Abra o exame no sistema.
4. Faça **upload do laudo** e avance para **"Resultado Liberado"**.
5. A médica/médico responsável recebe uma notificação automática nesse momento.

### 4.5. Conferir se o resultado está completo

1. Quando o resultado estiver liberado, abra o exame.
2. Confira se:
   - O laudo está legível.
   - Todos os exames solicitados estão no laudo (citologia, HPV, biópsia quando houver).
   - O número do frasco no laudo bate com o do cadastro.
3. Se estiver tudo OK, clique em **"Avançar para: Conferido pela Secretária"**.
4. Se faltar alguma coisa, entre em contato com o laboratório antes de avançar.

### 4.6. Comunicar a paciente (após o parecer médico)

Você recebe uma notificação no celular/computador quando o médico emite o parecer. Então:

1. Abra o exame.
2. Leia a **recomendação médica** (seção "Parecer Médico").
3. Entre em contato com a paciente pelo meio que ela preferir — geralmente WhatsApp.
4. Comunique o resultado e a recomendação (retorno imediato, 6 meses, 1 ano, 2 anos, etc.).
5. No sistema, escolha o **meio de contato usado** (WhatsApp, Telefone, Email).
6. Clique em **"Avançar para: Paciente Comunicada"**.

### 4.7. Avisar o comercial sobre a próxima consulta

Quando a próxima consulta **não** é imediata (ex.: retorno em 6m, 1a, 2a):

1. Envie a informação ao comercial conforme o combinado da clínica (planilha, WhatsApp interno, etc.), com:
   - Nome da paciente
   - Data prevista para o retorno
2. No sistema, clique em **"Avançar para: Próxima Consulta Comunicada ao Comercial"**.

Pronto — o ciclo do exame está fechado.

---

## 5. Notificações no celular/computador (muito importante)

O sistema pode **te avisar automaticamente** quando:

- Um **parecer médico é emitido** e precisa ser comunicado à paciente.
- Um **exame está com SLA vencido** (atrasou no laboratório).

### Como ativar as notificações

**No computador (Chrome/Edge):**

1. Faça login normalmente no sistema.
2. No canto superior direito, encontre o ícone de **sino**:
   - 🔔 **azul** = ativado
   - 🔕 **cinza** = desativado
3. Se estiver cinza, clique nele.
4. O navegador vai pedir permissão — escolha **"Permitir"**.
5. Deve aparecer o aviso: *"Notificações ativadas!"* e o sino fica azul.

**No celular (Android, no Chrome):**

1. Abra o sistema no Chrome do celular.
2. Faça login.
3. Toque no ícone do sino no topo da tela.
4. Autorize quando o Android pedir.
5. **Dica**: instale como aplicativo. No menu do Chrome → "Instalar app" ou "Adicionar à tela inicial". Assim ele funciona como um app nativo, e as notificações funcionam mesmo com o navegador fechado.

**No iPhone:** as notificações funcionam apenas se o sistema for **instalado como aplicativo** (Safari → botão compartilhar → "Adicionar à Tela de Início") e aberto dali. No Safari comum, notificações não funcionam (limitação da Apple).

### Como desativar

É só clicar no sino azul novamente. Aparece *"Notificações desativadas"* e o sino fica cinza.

### Se o navegador bloqueou e eu quiser reativar

Se em algum momento você clicou "Bloquear" por engano, o sino vai mostrar **🔕 cinza** e clicando nele você verá *"Notificações bloqueadas. Libere nas configurações do navegador."*. Para liberar:

1. Clique no cadeado 🔒 à esquerda da barra de endereço.
2. Procure por "Notificações" e mude para "Permitir".
3. Recarregue a página e tente ativar o sino de novo.

---

## 6. Laboratórios

Você pode cadastrar os laboratórios que a clínica usa.

1. Menu → **Laboratórios**.
2. Clique em **Novo Laboratório**.
3. Preencha:
   - Nome do laboratório
   - Pessoa de contato (quem você fala quando precisa)
   - Telefone de contato
   - **Link para consulta de resultados** (portal do laboratório)
   - **SLA em dias** (quanto tempo eles costumam levar — ex: 7 dias)
4. Salve.

O campo **SLA em dias** é o que o sistema usa para avisar você quando um exame está demorando demais.

---

## 7. Histórico de exames

Menu → **Histórico**.

Aqui você vê **todos os exames da clínica** (coletados, em andamento e finalizados). Use os filtros para:

- Buscar por nome de paciente.
- Filtrar por médico.
- Filtrar por status.
- Filtrar por laboratório.
- Filtrar por período (data de coleta).

Clique em qualquer exame para ver os detalhes completos e o histórico de mudanças de status.

---

## 8. Dicas práticas

- **Cadastre os exames no mesmo dia da coleta.** Se acumular, aumenta o risco de perder a ordem ou o número do frasco.
- **Confira o laudo antes de avançar.** Se avançar para "Conferido" com laudo incompleto, o médico pode emitir parecer com informação faltando.
- **Use sempre o mesmo meio de contato** combinado com cada paciente. Isso evita ligar para quem prefere WhatsApp ou mandar mensagem para quem prefere ligação.
- **Confira o Dashboard todo dia pela manhã.** Em 5 minutos você vê tudo que precisa da sua atenção no dia.
- **Mantenha as notificações ativadas** — assim você não precisa ficar atualizando a tela esperando um parecer sair.
- **Não compartilhe sua senha.** Cada pessoa tem o próprio login para que o sistema saiba quem fez o quê (rastreabilidade).

---

## 9. Problemas comuns

### "Email ou senha incorretos"
Confira se está usando o email cadastrado. Se não lembrar a senha, peça à administração para redefinir.

### "A sessão foi encerrada"
Normal após 15 minutos de inatividade. Basta fazer login de novo.

### Não consigo avançar um exame
Só algumas ações ficam disponíveis em cada etapa, e só para o perfil certo. Por exemplo: só o médico pode emitir parecer. Se o botão não aparece para você, é porque a etapa não é sua.

### As notificações pararam de chegar
1. Verifique se o sino no topo está **azul**. Se estiver cinza, clique para ativar.
2. Verifique as permissões do navegador (cadeado na barra de endereço).
3. No celular, certifique-se que o navegador tem permissão de notificação nas configurações do sistema.

### O sistema está lento ou com aparência estranha após uma atualização
Faça **Ctrl + Shift + R** (Windows) ou **Cmd + Shift + R** (Mac) para forçar o navegador a baixar a versão mais nova. No celular, feche e abra novamente.

### Vi algo errado (exame duplicado, paciente errada, etc.)
Anote o número do frasco ou o nome da paciente e avise a administração. Não tente "corrigir" excluindo — algumas correções precisam de permissão especial para preservar o histórico.

---

## 10. Em caso de dúvida

- Dúvidas sobre o **uso do sistema**: veja este manual e, persistindo, pergunte à administração.
- Dúvidas sobre **um resultado de exame**: fale com o médico responsável do exame (aparece na ficha do exame).
- **Problemas técnicos** (sistema fora do ar, erros estranhos): comunique a administração com um print da tela.

---

_Manual atualizado em abril de 2026._
