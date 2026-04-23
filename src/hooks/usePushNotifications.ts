import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(b64)
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

export type PushPermission = 'granted' | 'denied' | 'default' | 'unsupported'

export function usePushNotifications() {
  const { user } = useAuth()
  const isSupported = typeof window !== 'undefined'
    && 'serviceWorker' in navigator
    && 'PushManager' in window

  const [permission, setPermission] = useState<PushPermission>(() => {
    if (!isSupported) return 'unsupported'
    return Notification.permission as PushPermission
  })

  // Ao logar, verifica se já existe subscrição ativa
  useEffect(() => {
    if (!isSupported || !user) return
    navigator.serviceWorker.ready
      .then(reg => reg.pushManager.getSubscription())
      .then(sub => { if (sub) setPermission('granted') })
  }, [user, isSupported])

  const subscribe = async (): Promise<boolean> => {
    if (!isSupported || !user) return false
    if (!VAPID_PUBLIC_KEY) {
      console.error('VITE_VAPID_PUBLIC_KEY não definida')
      return false
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result as PushPermission)
      if (result !== 'granted') return false

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } }
      const { error } = await supabase.from('push_subscriptions').upsert(
        { user_id: user.id, endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth },
        { onConflict: 'endpoint' }
      )
      if (error) throw error
      return true
    } catch (err) {
      console.error('Erro ao ativar notificações:', err)
      return false
    }
  }

  const unsubscribe = async (): Promise<boolean> => {
    if (!isSupported) return false
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (!sub) { setPermission('default'); return true }

      await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
      await sub.unsubscribe()
      setPermission('default')
      return true
    } catch (err) {
      console.error('Erro ao desativar notificações:', err)
      return false
    }
  }

  return { isSupported, permission, subscribe, unsubscribe }
}
