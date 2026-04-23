-- Migration: Permite SELECT em public.users para qualquer usuário autenticado
--
-- Problema: Secretaria e Medico não conseguiam ler o médico responsável pelo exame
-- em ExamDetails (PGRST116 → "Exame não encontrado"), porque a policy anterior
-- restringia SELECT ao próprio registro ou perfis Administrador/Superusuario.
--
-- loadAuditLogs também depende de ler a lista de users ativos para renderizar nomes.
--
-- Decisão: expor id/nome/email/perfil/ativo entre usuários autenticados é aceitável
-- dentro de uma clínica. senha_hash já foi removida em migration 006. INSERT/UPDATE/
-- DELETE permanecem restritos.

DROP POLICY IF EXISTS "users_select" ON public.users;

CREATE POLICY "users_select" ON public.users
  FOR SELECT USING (auth.uid() IS NOT NULL);
