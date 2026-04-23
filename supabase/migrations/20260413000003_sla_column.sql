-- Migration: Coluna para controle de deduplicação de notificações de SLA vencido

ALTER TABLE public.exames
  ADD COLUMN IF NOT EXISTS ultima_notificacao_sla date;
