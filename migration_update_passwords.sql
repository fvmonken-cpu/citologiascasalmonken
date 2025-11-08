-- Atualiza todas as senhas para "1234"
UPDATE users 
SET senha_hash = '1234', updated_at = NOW()
WHERE email IN (
    'admin@casal-monken.com',
    'maria@casal-monken.com', 
    'paula@casal-monken.com'
);