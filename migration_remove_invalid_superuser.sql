-- Remove usuário superusuário com email incorreto
DELETE FROM users WHERE email = 'super@casal-monken.com';

-- Garantir que existe apenas o superusuário correto
-- (Manter apenas o super@casalmonken.com.br)