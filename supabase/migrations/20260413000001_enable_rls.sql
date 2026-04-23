-- Migration: Habilita Row Level Security em todas as tabelas
-- Pré-requisito: executar scripts/migrate-users-to-auth.ts ANTES desta migration

-- Helper: retorna o perfil do usuário autenticado via JWT
CREATE OR REPLACE FUNCTION public.get_user_perfil(uid uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT perfil FROM public.users WHERE id = uid
$$;

-- ===================== USERS =====================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Leitura: próprio registro ou Admin/Super
CREATE POLICY "users_select" ON public.users
  FOR SELECT USING (
    id = auth.uid()
    OR get_user_perfil(auth.uid()) IN ('Administrador', 'Superusuario')
  );

-- Atualização: próprio registro ou Admin/Super
CREATE POLICY "users_update" ON public.users
  FOR UPDATE USING (
    id = auth.uid()
    OR get_user_perfil(auth.uid()) IN ('Administrador', 'Superusuario')
  );

-- Exclusão: apenas Superusuario
CREATE POLICY "users_delete" ON public.users
  FOR DELETE USING (
    get_user_perfil(auth.uid()) = 'Superusuario'
  );

-- INSERT é gerenciado pela Edge Function create-user (service role bypassa RLS)

-- ===================== PATIENTS =====================
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patients_select" ON public.patients
  FOR SELECT USING (
    medico_responsavel_id = auth.uid()
    OR get_user_perfil(auth.uid()) IN ('Secretaria', 'Administrador', 'Superusuario')
  );

CREATE POLICY "patients_insert" ON public.patients
  FOR INSERT WITH CHECK (
    get_user_perfil(auth.uid()) IN ('Medico', 'Secretaria', 'Administrador', 'Superusuario')
  );

CREATE POLICY "patients_update" ON public.patients
  FOR UPDATE USING (
    medico_responsavel_id = auth.uid()
    OR get_user_perfil(auth.uid()) IN ('Secretaria', 'Administrador', 'Superusuario')
  );

CREATE POLICY "patients_delete" ON public.patients
  FOR DELETE USING (
    get_user_perfil(auth.uid()) IN ('Administrador', 'Superusuario')
  );

-- ===================== EXAMES =====================
ALTER TABLE public.exames ENABLE ROW LEVEL SECURITY;

-- Médico vê apenas seus exames; demais perfis veem todos
CREATE POLICY "exames_select" ON public.exames
  FOR SELECT USING (
    medico_id = auth.uid()
    OR get_user_perfil(auth.uid()) IN ('Secretaria', 'Administrador', 'Superusuario')
  );

CREATE POLICY "exames_insert" ON public.exames
  FOR INSERT WITH CHECK (
    get_user_perfil(auth.uid()) IN ('Secretaria', 'Administrador', 'Superusuario')
  );

CREATE POLICY "exames_update" ON public.exames
  FOR UPDATE USING (
    medico_id = auth.uid()
    OR get_user_perfil(auth.uid()) IN ('Secretaria', 'Administrador', 'Superusuario')
  );

CREATE POLICY "exames_delete" ON public.exames
  FOR DELETE USING (
    get_user_perfil(auth.uid()) IN ('Administrador', 'Superusuario')
  );

-- ===================== AUDIT_LOGS =====================
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Qualquer autenticado pode inserir (auditoria)
CREATE POLICY "audit_logs_insert" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Apenas Admin/Super pode ler
CREATE POLICY "audit_logs_select" ON public.audit_logs
  FOR SELECT USING (
    get_user_perfil(auth.uid()) IN ('Administrador', 'Superusuario')
  );

-- ===================== LABS =====================
ALTER TABLE public.labs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "labs_select" ON public.labs
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "labs_insert" ON public.labs
  FOR INSERT WITH CHECK (
    get_user_perfil(auth.uid()) IN ('Administrador', 'Superusuario')
  );

CREATE POLICY "labs_update" ON public.labs
  FOR UPDATE USING (
    get_user_perfil(auth.uid()) IN ('Administrador', 'Superusuario')
  );

CREATE POLICY "labs_delete" ON public.labs
  FOR DELETE USING (
    get_user_perfil(auth.uid()) IN ('Administrador', 'Superusuario')
  );
