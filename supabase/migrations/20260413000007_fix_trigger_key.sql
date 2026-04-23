-- Migration: Atualiza trigger e cron com a service role key embutida
-- (ALTER DATABASE SET não é permitido no Supabase managed)

CREATE EXTENSION IF NOT EXISTS pg_net;

-- Atualiza função do trigger com a chave direta
CREATE OR REPLACE FUNCTION public.notify_exam_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status
     AND NEW.status IN ('Resultado Liberado', 'Parecer Médico Emitido')
  THEN
    PERFORM net.http_post(
      url     := 'https://pzddfexyonmlvqdazgms.supabase.co/functions/v1/send-push-notification',
      headers := jsonb_build_object(
                   'Content-Type',  'application/json',
                   'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6ZGRmZXh5b25tbHZxZGF6Z21zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjExNDE0MiwiZXhwIjoyMDc3NjkwMTQyfQ.JHH1WVhLdVCRuAjyZ1Bt6pwg5yoeNeCX9zMcBieCCHc'
                 ),
      body    := jsonb_build_object(
                   'tipo',       'status_change',
                   'exam_id',    NEW.id::text,
                   'new_status', NEW.status,
                   'medico_id',  NEW.medico_id::text
                 )::text
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Remove e recria o cron com a chave direta
SELECT cron.unschedule('check-sla-vencido');

SELECT cron.schedule(
  'check-sla-vencido',
  '0 11 * * *',
  $$
    SELECT net.http_post(
      url     := 'https://pzddfexyonmlvqdazgms.supabase.co/functions/v1/send-push-notification',
      headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6ZGRmZXh5b25tbHZxZGF6Z21zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjExNDE0MiwiZXhwIjoyMDc3NjkwMTQyfQ.JHH1WVhLdVCRuAjyZ1Bt6pwg5yoeNeCX9zMcBieCCHc"}'::jsonb,
      body    := '{"tipo":"sla_check"}'
    )
  $$
);
