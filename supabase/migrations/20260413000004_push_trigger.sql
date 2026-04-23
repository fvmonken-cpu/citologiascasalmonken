-- Migration: Trigger que chama a Edge Function de push ao mudar status do exame
--
-- ATENÇÃO: antes de aplicar esta migration, execute no SQL Editor do Supabase:
--   ALTER DATABASE postgres SET "app.settings.service_role_key" = '<sua service_role key>';
-- Isso armazena a chave de forma segura na configuração do banco.

-- Garante que pg_net está habilitado
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.notify_exam_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _key text;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status
     AND NEW.status IN ('Resultado Liberado', 'Parecer Médico Emitido')
  THEN
    _key := current_setting('app.settings.service_role_key', true);

    PERFORM net.http_post(
      url     := 'https://pzddfexyonmlvqdazgms.supabase.co/functions/v1/send-push-notification',
      headers := jsonb_build_object(
                   'Content-Type',  'application/json',
                   'Authorization', 'Bearer ' || _key
                 ),
      body    := jsonb_build_object(
                   'tipo',      'status_change',
                   'exam_id',   NEW.id::text,
                   'new_status', NEW.status,
                   'medico_id', NEW.medico_id::text
                 )::text
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER exam_status_push
  AFTER UPDATE ON public.exames
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_exam_status_change();
