# Manual do(a) Médico(a) — Sistema de Controle de Citologias

**Espaço Casal Monken | Ginecologia e Obstetrícia**

---

## 1. Para que serve este sistema

O sistema acompanha o **ciclo completo de cada exame de citologia oncótica** das suas pacientes — da coleta à comunicação do resultado final — garantindo que nenhum laudo fique sem parecer e que nenhuma paciente deixe de ser avisada.

Seu papel no sistema é o **mais clínico**: analisar o resultado e emitir o parecer com a recomendação. O sistema cuida do resto (cobrar a secretária para fazer o contato, marcar retorno com o comercial, avisar quando algo atrasar).

### O que você vê

Por segurança e privacidade, **você só enxerga as pacientes e os exames que são seus**. Se outra médica coletou um exame, ele não aparece no seu dashboard.

### Etapas de um exame

| # | Etapa | Quem avança |
|---|-------|-------------|
| 1 | Amostra Coletada | Secretária (ao cadastrar o exame) |
| 2 | Recolhido pelo Laboratório | Secretária |
| 3 | Resultado Liberado | Secretária |
| 4 | Conferido pela Secretária | Secretária |
| 5 | **Parecer Médico Emitido** | **Você** |
| 6 | Paciente Comunicada | Secretária |
| 7 | Próxima Consulta Comunicada ao Comercial | Secretária |

A etapa 5 é a sua. Tudo converge para ela, e sua ação libera as etapas seguintes.

---

## 2. Como acessar o sistema

1. Abra o navegador (Chrome ou Edge recomendados) e vá para:
   **https://citologiascasalmonken.netlify.app**
2. Digite seu **email** e **senha**.
3. Clique em **Entrar**.

### No celular

Funciona direto pelo navegador. Para uma experiência próxima de aplicativo:

- **Android (Chrome):** toque no menu → *Instalar app* ou *Adicionar à tela inicial*.
- **iPhone (Safari):** toque no botão compartilhar → *Adicionar à Tela de Início*.

Assim o sistema fica como um ícone na tela inicial e funciona mesmo com o navegador fechado.

### Troca de senha

Menu → **Alterar Senha**. Digite a senha atual, a nova e confirme.

### Sessão expira sozinha

Após **15 minutos sem nenhuma ação** o sistema desconecta automaticamente — proposital, para proteger dados das pacientes se o aparelho for deixado aberto.

---

## 3. O que aparece no Dashboard

Seu dashboard é **filtrado** para mostrar só o que é seu. O foco é responder a uma pergunta: *"o que precisa da minha atenção hoje?"*

- **Exames aguardando seu parecer** — já foram conferidos pela secretária e esperam sua análise.
- **Pareceres já emitidos, aguardando comunicação à paciente** — você já analisou, agora é com a secretária.
- **Exames em andamento no laboratório** — só para acompanhamento, nenhuma ação sua.
- **Exames com SLA vencido** — estão demorando mais do que o prazo normal do laboratório.

Clique em qualquer exame para abrir os detalhes.

---

## 4. Emitir um parecer médico (sua tarefa principal)

### Quando

Você deve emitir parecer quando um exame seu atingir o status **"Conferido pela Secretária"**. O sistema te avisa por notificação push (veja seção 6) assim que o resultado é liberado pelo laboratório.

### Passo a passo

1. Acesse **Dashboard** ou **Histórico** e clique no exame em questão.
2. Na tela de detalhes, visualize o **laudo do laboratório** (anexado pela secretária).
3. Clique em **Emitir Parecer Médico**.
4. Preencha os campos clínicos:

   - **Interpretação da citologia**: Normal / Inconclusivo / ASC-US / ASC-H / LSIL / HSIL / AGC / Carcinoma.
   - **Resultado DNA-HPV**: Não realizada / Negativa / Positiva (se foi solicitado).
   - **Interpretação da biópsia**: Normal / Alterado / Não realizado (se foi solicitada).
   - **Observações**: campo livre para contextualizar — histórico relevante da paciente, justificativas da conduta, orientações específicas à secretária sobre o contato.

5. Preencha a **recomendação de retorno**:

   - **Tipo de retorno**: Imediato (casos que exigem ação rápida) / 6 meses / 1 ano / 2 anos / Outro.
   - **Data prevista da próxima consulta** (para o comercial agendar).

6. Clique em **Salvar Parecer**.
7. O sistema vai perguntar se você quer também **avançar o status para "Parecer Médico Emitido"**. Respondendo sim, a secretária recebe uma notificação imediata para comunicar a paciente.

> **Importante**: enquanto você não clicar em avançar o status, o parecer fica salvo mas a secretária não sabe que pode comunicar a paciente. Então, no fluxo normal, sempre avance.

### Editar um parecer já emitido

Se precisar corrigir algo depois de emitir:

1. Abra o exame.
2. Clique em **Editar Parecer** no card do parecer médico.
3. Ajuste e salve.

Toda edição é registrada no histórico de auditoria (quem mudou, o quê, quando).

---

## 5. Casos especiais

### Retorno imediato

Se a recomendação for **retorno imediato** (ex: HSIL, suspeita de malignidade, biópsia necessária), marque *Tipo de retorno = Imediato*.

Nesse caso, a secretária vai priorizar o contato com a paciente para agendar o retorno com você o quanto antes.

### Resultado inconclusivo

Marque a citologia como **Inconclusivo** e use o campo de **Observações** para orientar a secretária e a paciente — geralmente repetir a coleta em intervalo menor.

### Exame de paciente que não é sua

Se chegar ao seu conhecimento um exame de paciente que não é sua — por exemplo, substituindo uma colega — peça à administração para **associar a paciente a você** antes de tentar acessar. Por RLS, você não consegue ver exames de outros médicos diretamente.

---

## 6. Notificações no celular (importante)

O sistema pode **te avisar automaticamente** quando um resultado estiver pronto para seu parecer. Assim você não precisa ficar entrando no sistema para checar.

### O que é notificado

- **Resultado Liberado** em um dos seus exames.
- **SLA vencido** (aviso diário de manhã, quando aplicável).

### Como ativar

**No computador (Chrome/Edge):**

1. Faça login.
2. No canto superior direito, procure o ícone de **sino**:
   - 🔔 **azul** = ativado
   - 🔕 **cinza** = desativado
3. Clique no sino. O navegador pedirá permissão — escolha **"Permitir"**.
4. Aparece *"Notificações ativadas!"* e o sino fica azul.

**No celular (Android, Chrome):**

1. Abra o sistema e faça login.
2. Toque no ícone do sino no topo.
3. Autorize quando o Android pedir.
4. **Dica**: instale como aplicativo (ver seção 2). Notificações funcionam mesmo com o navegador fechado.

**No iPhone:** notificações push só funcionam se o sistema for **instalado como aplicativo pelo Safari** (botão compartilhar → *Adicionar à Tela de Início*) e aberto por esse ícone. No Safari comum, não funcionam (limitação da Apple).

### Se você bloqueou por engano

Clique no cadeado 🔒 à esquerda da barra de endereço → **Notificações** → *Permitir*. Recarregue a página e clique no sino novamente.

---

## 7. Pacientes e histórico

### Pacientes (menu "Pacientes")

Você vê **apenas as pacientes associadas a você**. Pode:

- Consultar dados (telefone, data de nascimento).
- Ver todo o histórico de exames daquela paciente (quantos fez, quando, resultados).
- Editar dados cadastrais.

### Histórico de exames (menu "Histórico")

Lista todos **seus** exames, com filtros por:

- Nome da paciente
- Status atual
- Laboratório
- Período (data de coleta)

Útil para ver rapidamente o que ainda está pendente de parecer, ou conferir exames antigos de uma paciente.

---

## 8. Boas práticas

- **Emita o parecer assim que possível** — idealmente no mesmo dia em que recebe a notificação. A paciente está no aguardo, e a secretária só consegue comunicá-la depois que você avança o status.
- **Use o campo de observações**: instruções claras para a secretária aumentam muito a qualidade do contato com a paciente.
- **Não compartilhe sua senha**. Cada parecer fica registrado com o nome do médico que o emitiu — é sua assinatura digital no sistema.
- **Abra o sistema no celular** com notificações ativadas. Muitos resultados saem fora do horário do consultório, e você pode dar vazão rapidamente.
- **Confira o Dashboard no início do expediente** para não deixar parecer pendente.

---

## 9. Problemas comuns

### "Email ou senha incorretos"
Confira o email. Se não lembrar a senha, peça à administração para redefinir.

### "A sessão foi encerrada"
Normal após 15 minutos de inatividade. Faça login de novo.

### Não vejo uma paciente que sei que é minha
Pode ser que ela esteja cadastrada associada a outro médico. Peça à administração para reassociar.

### O botão "Emitir Parecer" não aparece
O exame pode não estar no status "Conferido pela Secretária" ainda. Ou pode não ser um exame seu — o sistema só permite parecer do médico responsável.

### As notificações pararam de chegar
1. Verifique se o sino no topo está **azul**.
2. Confira a permissão do navegador (cadeado na barra de endereço).
3. No celular, confira se o navegador/app tem permissão de notificação nas configurações do sistema operacional.

### O sistema parece desatualizado após uma novidade
Pressione **Ctrl + Shift + R** (Windows) ou **Cmd + Shift + R** (Mac) para forçar atualização. No celular, feche e reabra o app.

### Vi algo estranho nos dados (exame com número de frasco errado, paciente errada, etc.)
Não tente "corrigir" apagando — pareceres e mudanças ficam registrados na auditoria. Anote o que viu e avise a administração.

---

## 10. Confidencialidade

Tudo que você acessa aqui é dado sensível de saúde. Por favor:

- **Feche a sessão** (botão *Sair* no canto) ao terminar de usar, especialmente em computadores compartilhados.
- **Nunca mande print do sistema** para grupos, redes sociais ou fora do ambiente clínico.
- Se suspeitar que alguém usou seu acesso indevidamente, **troque sua senha imediatamente** e avise a administração.

---

## 11. Em caso de dúvida

- **Uso do sistema**: consulte este manual, depois pergunte à administração.
- **Problemas técnicos** (sistema fora do ar, erros inesperados): avise a administração com um print da tela.
- **Sugestões** de melhoria: são bem-vindas — anote e encaminhe à administração.

---

_Manual atualizado em abril de 2026._
