-- Migration: Corrige deadlock recursivo nas políticas RLS da tabela users
--
-- Problema: a policy chamava get_user_perfil() que faz SELECT em public.users
-- enquanto a própria query de public.users ainda estava aberta → hang.
--
-- Solução: usar auth.jwt() para ler o perfil diretamente do token JWT,
-- sem nenhuma query adicional ao banco.

DROP POLICY IF EXISTS "users_select" ON public.users;
DROP POLICY IF EXISTS "users_update" ON public.users;
DROP POLICY IF EXISTS "users_delete" ON public.users;

-- Lê o perfil do payload JWT (user_metadata.perfil, salvo no momento do login/criação)
CREATE POLICY "users_select" ON public.users
  FOR SELECT USING (
    id = auth.uid()
    OR (auth.jwt() -> 'user_metadata' ->> 'perfil') IN ('Administrador', 'Superusuario')
  );

CREATE POLICY "users_update" ON public.users
  FOR UPDATE USING (
    id = auth.uid()
    OR (auth.jwt() -> 'user_metadata' ->> 'perfil') IN ('Administrador', 'Superusuario')
  );

CREATE POLICY "users_delete" ON public.users
  FOR DELETE USING (
    (auth.jwt() -> 'user_metadata' ->> 'perfil') = 'Superusuario'
  );
