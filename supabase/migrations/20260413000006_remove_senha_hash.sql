-- Migration: Remove coluna de senha em texto puro após migração para Supabase Auth
--
-- ATENÇÃO: só execute esta migration DEPOIS de rodar scripts/migrate-users-to-auth.ts
-- e confirmar que todos os usuários conseguem fazer login normalmente.

ALTER TABLE public.users DROP COLUMN IF EXISTS senha_hash;
