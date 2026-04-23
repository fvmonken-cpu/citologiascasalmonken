-- Migration: Cron job diário para notificação de SLA vencido
--
-- Requer pg_cron habilitado no projeto Supabase (Dashboard > Database > Extensions).
-- Executa todo dia às 08h00 (horário UTC — ajustar para UTC-3 conforme necessário).

CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'check-sla-vencido',
  '0 11 * * *',  -- 08:00 BRT (UTC-3)
  $$
    SELECT net.http_post(
      url     := 'https://pzddfexyonmlvqdazgms.supabase.co/functions/v1/send-push-notification',
      headers := jsonb_build_object(
                   'Content-Type',  'application/json',
                   'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
                 ),
      body    := '{"tipo":"sla_check"}'
    )
  $$
);
