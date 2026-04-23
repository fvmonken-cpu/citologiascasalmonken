-- Migration: Tabela de subscrições push para notificações PWA

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint  text        NOT NULL UNIQUE,
  p256dh    text        NOT NULL,
  auth      text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Cada usuário gerencia apenas suas próprias subscrições
CREATE POLICY "push_sub_select_own" ON public.push_subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "push_sub_insert_own" ON public.push_subscriptions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "push_sub_delete_own" ON public.push_subscriptions
  FOR DELETE USING (user_id = auth.uid());

-- Edge Function usa service role (bypassa RLS) para leitura de todas as subscrições ao enviar push
