/**
 * Edge Function: create-user
 *
 * Gerencia criação e atualização de usuários (requer perfil Admin/Super).
 * Usa a service role key para operar no auth.users via admin API.
 *
 * Ações:
 *   POST { action: 'create',          nome, email, password, perfil, ativo }
 *   POST { action: 'update_password', userId, password }
 *   POST { action: 'update_profile',  userId, nome, perfil }
 */

import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY')!

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Valida token JWT do chamador
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return json({ error: 'Não autorizado' }, 401)
  }

  const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: { user: caller }, error: authError } = await callerClient.auth.getUser()
  if (authError || !caller) {
    return json({ error: 'Não autorizado' }, 401)
  }

  // Verifica perfil do chamador
  const { data: callerProfile } = await adminClient
    .from('users')
    .select('perfil')
    .eq('id', caller.id)
    .single()

  if (!callerProfile || !['Administrador', 'Superusuario'].includes(callerProfile.perfil)) {
    return json({ error: 'Acesso negado' }, 403)
  }

  try {
    const body = await req.json()

    if (body.action === 'create') {
      return await handleCreate(body)
    }

    if (body.action === 'update_password') {
      return await handleUpdatePassword(body, callerProfile.perfil)
    }

    if (body.action === 'update_profile') {
      return await handleUpdateProfile(body, callerProfile.perfil)
    }

    return json({ error: 'Ação inválida' }, 400)
  } catch (err) {
    console.error('create-user error:', err)
    return json({ error: err.message }, 500)
  }
})

async function handleCreate({ nome, email, password, perfil, ativo }: {
  nome: string; email: string; password: string; perfil: string; ativo: boolean
}) {
  // Cria usuário em auth.users
  const { data: authData, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nome, perfil },
  })

  if (createError || !authData.user) {
    return json({ error: createError?.message ?? 'Erro ao criar usuário' }, 500)
  }

  // Insere em public.users com o mesmo UUID
  const { error: insertError } = await adminClient.from('users').insert({
    id: authData.user.id,
    nome,
    email,
    perfil,
    ativo,
  })

  if (insertError) {
    // Desfaz criação no auth para evitar inconsistência
    await adminClient.auth.admin.deleteUser(authData.user.id)
    return json({ error: insertError.message }, 500)
  }

  return json({ id: authData.user.id }, 201)
}

async function handleUpdatePassword(
  { userId, password }: { userId: string; password: string },
  callerPerfil: string
) {
  // Apenas Superusuario pode redefinir senha de outros admins
  const { data: targetUser } = await adminClient.from('users').select('perfil').eq('id', userId).single()
  if (targetUser?.perfil === 'Superusuario' && callerPerfil !== 'Superusuario') {
    return json({ error: 'Sem permissão para alterar senha de Superusuario' }, 403)
  }

  const { error } = await adminClient.auth.admin.updateUserById(userId, { password })
  if (error) return json({ error: error.message }, 500)
  return json({ ok: true })
}

async function handleUpdateProfile(
  { userId, nome, perfil }: { userId: string; nome: string; perfil: string },
  callerPerfil: string
) {
  // Superusuario não pode ter o perfil alterado por admins
  const { data: targetUser } = await adminClient.from('users').select('perfil').eq('id', userId).single()
  if (targetUser?.perfil === 'Superusuario' && callerPerfil !== 'Superusuario') {
    return json({ error: 'Sem permissão para alterar perfil de Superusuario' }, 403)
  }

  // Atualiza user_metadata no auth.users para manter JWT em sincronia
  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    user_metadata: { nome, perfil },
  })
  if (error) return json({ error: error.message }, 500)
  return json({ ok: true })
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
