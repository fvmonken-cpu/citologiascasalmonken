# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é este projeto

Sistema de controle de exames de citologia oncótica (rastreamento de câncer cervical) para o Espaço Casal Monken. Rastreia o ciclo completo de cada exame: coleta → laboratório → resultado → parecer médico → comunicação à paciente.

Implantado em produção em: **https://citologiascasalmonken.netlify.app**  
Backend Supabase: **projeto `pzddfexyonmlvqdazgms`**

---

## Resumo do trabalho até aqui

Evolução do projeto em ordem cronológica (última atualização: 2026-04-23):

1. **Migração de autenticação** — saída do esquema antigo baseado em `senha_hash` em `public.users` para **Supabase Auth nativo** (`signInWithPassword`). Script `scripts/migrate-users-to-auth.ts` já executado (não rodar de novo).
2. **Row Level Security** — ativado em todas as tabelas (`patients`, `exames`, `labs`, `audit_logs`, `users`) via migration `000001`. Função `get_user_perfil()` SECURITY DEFINER criada para evitar recursão.
3. **Correção de recursão em RLS de `users`** (migration `000008`) — policy passou a ler o perfil via `auth.jwt() -> 'user_metadata' ->> 'perfil'` em vez de `get_user_perfil()`, que causava hang.
4. **Edge Function `create-user`** — cria/atualiza usuários via Admin API, bypassa RLS. Ações: `create`, `update_password`, `update_profile` (esta última sincroniza `user_metadata` quando o perfil é alterado, para refletir no JWT).
5. **Notificações push (PWA)** — infra completa:
   - Tabela `push_subscriptions` (migration `000002`)
   - Coluna `ultima_notificacao_sla` em `exames` (migration `000003`)
   - Trigger `exam_status_push` em `'Resultado Liberado'` e `'Parecer Médico Emitido'` (migrations `000004` + `000007` com service_role_key hardcoded)
   - Cron diário 08h BRT para SLA vencido (migration `000005`)
   - Edge Function `send-push-notification` (tipos `status_change` e `sla_check`)
   - Hook `src/hooks/usePushNotifications.ts` + botão 🔔/🔕 no `Layout.tsx`
6. **Fixes de ciclo de vida do AuthContext** — `setTimeout(0)` obrigatório dentro de `onAuthStateChange` (evita deadlock do mutex do auth client); `TOKEN_REFRESHED` e re-emissões de `SIGNED_IN` ao voltar à aba são ignorados para não recarregar o Dashboard.
7. **Service Worker** (`public/sw.js` v1.1.0) — cache-first para assets locais, passthrough para Supabase API.

---

## Estado atual

- **Produção**: [citologiascasalmonken.netlify.app](https://citologiascasalmonken.netlify.app) — funcional.
- **Migrations aplicadas**: 8 (ver tabela abaixo). Todas aplicadas em produção, incluindo `000006_remove_senha_hash.sql` (coluna removida em 2026-04-23 via SQL Editor).
- **Edge Functions deployadas**: `create-user`, `send-push-notification`.
- **Service Worker**: versão `citologia-casal-monken-v1.1.0` — **lembrar de incrementar** antes do próximo deploy que mexa em JS.
- **Dependências**: React 18.3.1, Vite 5.4.10, @supabase/supabase-js 2.45.4, TypeScript 5.6.3. `react-router-dom` está instalado mas não é usado (navegação é switch/case em `Index.tsx`).
- **Perfis ativos**: `Superusuario`, `Administrador`, `Secretaria`, `Medico` — RLS enforçando corretamente (médico vê só seus exames/pacientes).

---

## Próximos passos

_A ser definido com o usuário no início de cada sessão._ Candidatos conhecidos / pendências identificadas:

- Avaliar remoção de `react-router-dom` do `package.json` (não é usado).
- Rotina de testes end-to-end para o fluxo de push (subscribe → status change → notificação recebida) antes de novos deploys.
- Definir política de retenção de `audit_logs` e `push_subscriptions` inválidas (endpoints expirados).

> Adicione aqui os itens combinados na conversa atual antes de começar a editar.

---

## Comandos

```bash
npm run dev       # dev server em localhost:8080 (HMR desativado por opção de projeto)
npm run build     # build de produção → pasta dist/
npm run lint      # ESLint
npm run format    # Prettier em ts/tsx/md/html

# Deploy para Netlify (depois de cada alteração)
npm run build && netlify deploy --prod --dir=dist

# Deploy de Edge Function específica
supabase functions deploy create-user
supabase functions deploy send-push-notification

# Rodar script de migração de usuários (não re-executar — já foi aplicado)
npx tsx scripts/migrate-users-to-auth.ts
```

---

## Arquitetura

### Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui (Radix primitives)
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions + pg_net + pg_cron)
- **Deploy**: Netlify (frontend) + Supabase managed (backend)
- **PWA**: Service Worker (`public/sw.js`) + Web Push API + VAPID

### Fluxo de autenticação (`src/contexts/AuthContext.tsx`)

Usa **Supabase Auth nativo** (`signInWithPassword`). Padrão crítico:

```
onAuthStateChange → setTimeout(0) → loadUserProfile()
```

O `setTimeout(0)` é **obrigatório** — sem ele, queries Supabase feitas dentro do callback travam indefinidamente porque o auth client segura um mutex interno enquanto o callback executa.

Eventos ignorados propositalmente:
- `TOKEN_REFRESHED` — não recarrega perfil (evitava reload do Dashboard a cada ~1h)
- Qualquer evento com `session.user.id === loadedUserIdRef.current` — evita reset de página ao voltar à aba (Supabase re-emite `SIGNED_IN` no `visibilitychange`)

### Navegação (`src/pages/Index.tsx`)

Navegação é estado local React (`currentPage: string`). Não há React Router com rotas — o roteamento é um switch/case no `renderCurrentPage()`. O redirect para dashboard no login usa `redirectedForUserRef` para disparar **somente na transição null → usuário**, nunca em re-renders.

### Row Level Security (RLS)

Todas as tabelas têm RLS ativo. Regra importante:

- **`public.users`**: usa `auth.jwt() -> 'user_metadata' ->> 'perfil'` (não pode usar `get_user_perfil()` — causaria recursão/hang)
- **Demais tabelas** (`patients`, `exames`, `labs`, `audit_logs`): usam `get_user_perfil(auth.uid())` — função SECURITY DEFINER que lê `public.users` bypassando RLS

Quando o perfil de um usuário é atualizado em `public.users`, o JWT dele ainda tem o perfil antigo até o próximo login. Por isso, `UserManagement` chama a Edge Function `create-user` com `action: 'update_profile'` para sincronizar `auth.users.user_metadata`.

### Edge Functions (`supabase/functions/`)

| Função | Responsabilidade |
|--------|-----------------|
| `create-user` | Cria/atualiza usuários via Supabase Admin API (bypassa RLS). Actions: `create`, `update_password`, `update_profile` |
| `send-push-notification` | Envia push via Web Push/VAPID. Types: `status_change` (trigger DB) e `sla_check` (cron diário) |

Ambas usam `SERVICE_ROLE_KEY` (secret do Supabase, diferente de `SUPABASE_SERVICE_ROLE_KEY` — o Supabase CLI proíbe prefixo `SUPABASE_` em secrets de Edge Functions).

### Notificações push

**Fluxo**: DB trigger (`exam_status_push`) → `pg_net.http_post` → Edge Function `send-push-notification` → `web-push` → Service Worker → notificação do SO.

- **Trigger dispara em**: status `'Resultado Liberado'` (notifica médico) e `'Parecer Médico Emitido'` (notifica Secretaria + Admins)
- **Cron diário** (08h BRT / 11h UTC): verifica exames com SLA vencido e notifica Admins/Superusuarios
- A `service_role_key` está **hardcoded** na função do trigger (`migration 007`) — `ALTER DATABASE SET` não é permitido no Supabase managed
- Subscriptions salvas em `public.push_subscriptions` (vinculadas a `auth.users`)
- Hook no frontend: `src/hooks/usePushNotifications.ts`
- Botão 🔔/🔕 no `Layout.tsx` (desktop e mobile)

### Service Worker (`public/sw.js`)

Cache-first para assets do próprio domínio. Requests cross-origin (incluindo Supabase API) passam direto para a rede. **Para invalidar cache após deploy**, incremente `CACHE_NAME` (`citologia-casal-monken-v1.1.0` → `v1.2.0` etc.).

### Perfis de usuário

`Superusuario` > `Administrador` > `Secretaria` > `Medico`

- Superusuario: único que pode excluir usuários e alterar senha de Admins
- Médico: vê apenas seus próprios exames e pacientes associados a eles (via EXISTS na RLS de patients)
- INSERT em `public.users` é feito exclusivamente pela Edge Function `create-user` (service role bypassa RLS)

---

## Variáveis de ambiente

### Frontend (`.env.local`, bakeado no build pelo Vite)
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_VAPID_PUBLIC_KEY=...   # obrigatório também no painel Netlify para CI/CD
```

### Edge Functions (secrets no Supabase — `supabase secrets set`)
```
SERVICE_ROLE_KEY=...
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:...
```

---

## Migrações aplicadas

| Arquivo | Descrição |
|---------|-----------|
| `000001_enable_rls.sql` | Habilita RLS em todas as tabelas + `get_user_perfil()` SECURITY DEFINER |
| `000002_push_subscriptions.sql` | Tabela `push_subscriptions` |
| `000003_sla_column.sql` | Coluna `ultima_notificacao_sla` em `exames` |
| `000004_push_trigger.sql` | Trigger `exam_status_push` (versão inicial) |
| `000005_sla_cron.sql` | Cron job pg_cron diário |
| `000006_remove_senha_hash.sql` | Remove coluna `senha_hash` de `public.users` (aplicada em 2026-04-23) |
| `000007_fix_trigger_key.sql` | Re-cria trigger/cron com `service_role_key` hardcoded |
| `000008_fix_users_rls_jwt.sql` | Corrige RLS de `users` para usar `auth.jwt()` (evita recursão) |

---

## Armadilhas conhecidas

- **Não chamar `supabase.from()` diretamente dentro de `onAuthStateChange`** sem `setTimeout(0)` — trava por deadlock de mutex.
- **`users_select` policy não pode usar `get_user_perfil()`** — causaria recursão. Usar `auth.jwt() -> 'user_metadata' ->> 'perfil'`.
- **Supabase re-emite `SIGNED_IN` ao retornar à aba** — ignorar no `onAuthStateChange` se `loadedUserIdRef.current === session.user.id`.
- **`TOKEN_REFRESHED`** dispara `onAuthStateChange` a cada ~1h — ignorar para não recarregar o Dashboard.
- **Secrets de Edge Functions não podem ter prefixo `SUPABASE_`** — usar `SERVICE_ROLE_KEY`, não `SUPABASE_SERVICE_ROLE_KEY`.
- **`ALTER DATABASE SET` não é permitido** no Supabase managed — service role key fica hardcoded no trigger SQL (migration 007).
- **Cache do Service Worker**: após deploy com mudanças de JS, incrementar `CACHE_NAME` em `public/sw.js` para forçar invalidação nos browsers.
