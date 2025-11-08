-- Limpeza do banco de dados mantendo usuários
-- Remove todos os exames e dados relacionados
DELETE FROM audit_logs;
DELETE FROM exames;
DELETE FROM patients;

-- Adiciona o novo superusuário
INSERT INTO users (nome, email, senha_hash, perfil, ativo) 
VALUES ('Super Usuário', 'super@casalmonken.com.br', 'CasalMonken2025', 'Superusuario', true)
ON CONFLICT (email) DO UPDATE SET
  nome = EXCLUDED.nome,
  senha_hash = EXCLUDED.senha_hash,
  perfil = EXCLUDED.perfil,
  ativo = EXCLUDED.ativo,
  updated_at = NOW();

-- Confirma que a limpeza foi realizada
SELECT 
  'Limpeza concluída' as status,
  (SELECT COUNT(*) FROM exames) as total_exames,
  (SELECT COUNT(*) FROM patients) as total_patients,
  (SELECT COUNT(*) FROM audit_logs) as total_audit_logs,
  (SELECT COUNT(*) FROM users) as total_users;