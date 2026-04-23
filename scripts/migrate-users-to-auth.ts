/**
 * Script de migração única: cria entradas em auth.users para todos os usuários
 * que existem em public.users (preservando os mesmos UUIDs).
 *
 * Executar uma única vez, ANTES de aplicar as migrations RLS e de remover senha_hash.
 *
 * Uso:
 *   npx tsx scripts/migrate-users-to-auth.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Lê .env.local
const envRaw = readFileSync(join(process.cwd(), '.env.local'), 'utf-8')
const env = Object.fromEntries(
  envRaw
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => {
      const idx = l.indexOf('=')
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()]
    })
)

const SUPABASE_URL = env['VITE_SUPABASE_URL']
const SERVICE_ROLE_KEY = env['SERVICE_ROLE_KEY']

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ VITE_SUPABASE_URL ou SERVICE_ROLE_KEY não encontrados no .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

interface PublicUser {
  id: string
  email: string
  nome: string
  perfil: string
  ativo: boolean
  senha_hash: string
}

async function run() {
  console.log('🔐 Migrando usuários para Supabase Auth...\n')

  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, nome, perfil, ativo, senha_hash')

  if (error) {
    console.error('❌ Erro ao buscar usuários:', error.message)
    process.exit(1)
  }

  console.log(`📋 ${users.length} usuário(s) encontrado(s)\n`)

  let ok = 0
  let skipped = 0
  let failed = 0

  for (const user of users as PublicUser[]) {
    process.stdout.write(`  ${user.email} ... `)

    // Verifica se já existe em auth.users
    const { data: existing } = await supabase.auth.admin.getUserById(user.id)
    if (existing?.user) {
      console.log('⏭  já existe, pulando')
      skipped++
      continue
    }

    // Cria em auth.users com o mesmo UUID
    const { error: createError } = await supabase.auth.admin.createUser({
      id: user.id,
      email: user.email,
      password: user.senha_hash, // Supabase vai fazer o hash
      email_confirm: true,
      user_metadata: { nome: user.nome, perfil: user.perfil }
    })

    if (createError) {
      console.log(`❌ erro: ${createError.message}`)
      failed++
    } else {
      console.log('✅ migrado')
      ok++
    }
  }

  console.log(`\n─────────────────────────────`)
  console.log(`✅ Migrados:  ${ok}`)
  console.log(`⏭  Pulados:   ${skipped}`)
  console.log(`❌ Falhas:    ${failed}`)

  if (failed > 0) {
    console.log('\n⚠️  Corrija as falhas antes de prosseguir com as migrations.')
    process.exit(1)
  }

  console.log('\n🎉 Migração concluída! Próximos passos:')
  console.log('   1. Teste o login de cada usuário no app')
  console.log('   2. Execute: supabase db push (aplica RLS e demais migrations)')
  console.log('   3. Após confirmar tudo OK, aplique 20260413000006_remove_senha_hash.sql')
}

run().catch(err => {
  console.error('❌ Erro inesperado:', err)
  process.exit(1)
})
