-- Migration: Corrige assinatura de net.http_post no trigger e no cron
--
-- Problema: pg_net espera `body jsonb`, mas o trigger passava `body ::text` e o
-- cron passava string literal (inferida como text) → erro 42883:
--   function net.http_post(url => unknown, headers => jsonb, body => text) does not exist
--
-- Fix: passar body como jsonb (remover cast para text no trigger; adicionar ::jsonb
-- no cron).

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
                 )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Recria o cron job com body em jsonb
SELECT cron.unschedule('check-sla-vencido');

SELECT cron.schedule(
  'check-sla-vencido',
  '0 11 * * *',
  $$
    SELECT net.http_post(
      url     := 'https://pzddfexyonmlvqdazgms.supabase.co/functions/v1/send-push-notification',
      headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6ZGRmZXh5b25tbHZxZGF6Z21zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjExNDE0MiwiZXhwIjoyMDc3NjkwMTQyfQ.JHH1WVhLdVCRuAjyZ1Bt6pwg5yoeNeCX9zMcBieCCHc"}'::jsonb,
      body    := '{"tipo":"sla_check"}'::jsonb
    )
  $$
);
