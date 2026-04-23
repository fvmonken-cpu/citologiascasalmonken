/**
 * Edge Function: send-push-notification
 *
 * Chamada por:
 *   - Trigger Postgres ao mudar status de exame (tipo: 'status_change')
 *   - Cron job diário para verificar SLA vencido   (tipo: 'sla_check')
 */

import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push'
import { corsHeaders } from '../_shared/cors.ts'

const SUPABASE_URL    = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY')!
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT   = Deno.env.get('VAPID_SUBJECT')!

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()

    if (body.tipo === 'status_change') {
      await handleStatusChange(body)
    } else if (body.tipo === 'sla_check') {
      await handleSlaCheck()
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('send-push error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

// ─── Mudança de status ────────────────────────────────────────────────────────

async function handleStatusChange({ exam_id, new_status, medico_id }: {
  exam_id: string; new_status: string; medico_id: string
}) {
  const { data: exam } = await db
    .from('exames')
    .select('id, patient:patients(nome_completo)')
    .eq('id', exam_id)
    .single()

  if (!exam) return

  const paciente = (exam.patient as any)?.nome_completo ?? 'Paciente'

  if (new_status === 'Resultado Liberado') {
    await sendToUsers(
      [medico_id],
      'Resultado Liberado',
      `${paciente} — resultado disponível para parecer`,
      exam_id
    )
  } else if (new_status === 'Parecer Médico Emitido') {
    const { data: users } = await db
      .from('users')
      .select('id')
      .in('perfil', ['Secretaria', 'Administrador', 'Superusuario'])
      .eq('ativo', true)

    await sendToUsers(
      (users ?? []).map((u: any) => u.id),
      'Parecer Médico Emitido',
      `${paciente} — comunicar resultado à paciente`,
      exam_id
    )
  }
}

// ─── Verificação de SLA ───────────────────────────────────────────────────────

async function handleSlaCheck() {
  const today = new Date().toISOString().split('T')[0]

  const { data: exams } = await db
    .from('exames')
    .select(`
      id,
      data_recolhido_lab,
      ultima_notificacao_sla,
      patient:patients(nome_completo),
      lab:labs(nome, sla_dias)
    `)
    .eq('status', 'Recolhido pelo Laboratório')
    .not('data_recolhido_lab', 'is', null)

  if (!exams?.length) return

  // Filtra exames com SLA vencido e ainda não notificados hoje
  const vencidos = exams.filter((exam: any) => {
    const sla = exam.lab?.sla_dias
    if (!sla) return false

    const prazo = new Date(exam.data_recolhido_lab)
    prazo.setDate(prazo.getDate() + sla)
    const vencido = prazo < new Date()
    const jaNotificado = exam.ultima_notificacao_sla === today
    return vencido && !jaNotificado
  })

  if (!vencidos.length) return

  // Busca administradores
  const { data: admins } = await db
    .from('users')
    .select('id')
    .in('perfil', ['Administrador', 'Superusuario'])
    .eq('ativo', true)

  const adminIds = (admins ?? []).map((u: any) => u.id)

  for (const exam of vencidos) {
    const sla = exam.lab!.sla_dias!
    const prazo = new Date(exam.data_recolhido_lab)
    prazo.setDate(prazo.getDate() + sla)
    const diasAtraso = Math.floor((Date.now() - prazo.getTime()) / 86_400_000)

    await sendToUsers(
      adminIds,
      `SLA Vencido — ${exam.lab?.nome}`,
      `${(exam.patient as any)?.nome_completo ?? 'Paciente'} — ${diasAtraso}d além do prazo (SLA: ${sla}d)`,
      exam.id
    )

    await db
      .from('exames')
      .update({ ultima_notificacao_sla: today })
      .eq('id', exam.id)
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function sendToUsers(
  userIds: string[],
  title: string,
  body: string,
  examId: string
) {
  if (!userIds.length) return

  const { data: subs } = await db
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .in('user_id', userIds)

  if (!subs?.length) return

  const payload = JSON.stringify({ title, body, url: `/?exam=${examId}` })

  await Promise.allSettled(
    subs.map((sub: any) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      )
    )
  )
}
