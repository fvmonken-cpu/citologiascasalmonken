import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { User } from '@/types/database'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  // Rastreia o ID do último perfil carregado para evitar toast repetido em re-autenticações
  const loadedUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    // setTimeout(0) é essencial: evita deadlock com o mutex interno do Supabase auth client.
    // Chamar supabase.from() diretamente dentro de onAuthStateChange faz com que getSession()
    // tente adquirir o mesmo lock que o callback ainda segura → query trava indefinidamente.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setTimeout(() => {
        // TOKEN_REFRESHED apenas atualiza o JWT internamente — não recarrega perfil
        if (event === 'TOKEN_REFRESHED') return
        if (session?.user) {
          // Supabase re-emite SIGNED_IN ao voltar para a aba (visibilitychange).
          // Se o usuário já está carregado com o mesmo ID, não há nada a fazer.
          if (loadedUserIdRef.current === session.user.id) return
          loadUserProfile(session.user.id)
        } else {
          setUser(null)
          setLoading(false)
        }
      }, 0)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Timer de inatividade (15 min)
  useEffect(() => {
    if (!user) return

    let inactivityTimer: ReturnType<typeof setTimeout>

    const resetTimer = () => {
      clearTimeout(inactivityTimer)
      inactivityTimer = setTimeout(() => {
        logout()
        toast.info('Sessão expirada por inatividade. Faça login novamente.')
      }, 15 * 60 * 1000)
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    events.forEach(ev => document.addEventListener(ev, resetTimer, true))
    resetTimer()

    return () => {
      clearTimeout(inactivityTimer)
      events.forEach(ev => document.removeEventListener(ev, resetTimer, true))
    }
  }, [user])

  const loadUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .eq('ativo', true)
      .single()

    if (error || !data) {
      // Usuário inativo ou removido — encerra sessão
      loadedUserIdRef.current = null
      await supabase.auth.signOut()
      setUser(null)
    } else {
      const isNewLogin = loadedUserIdRef.current !== data.id
      loadedUserIdRef.current = data.id
      setUser(data as User)
      // Exibe boas-vindas apenas no primeiro login, não em re-autenticações (ex: troca de senha)
      if (isNewLogin) toast.success(`Bem-vindo, ${data.nome}!`)
    }
    setLoading(false)
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error('Email ou senha incorretos. Verifique suas credenciais e tente novamente.')
      setLoading(false)
      return false
    }
    // onAuthStateChange cuida do resto
    return true
  }

  const logout = async () => {
    loadedUserIdRef.current = null
    await supabase.auth.signOut()
    setUser(null)
    toast.success('Logout realizado com sucesso')
  }

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) { toast.error('Usuário não autenticado'); return false }
    setLoading(true)
    try {
      // Verifica senha atual via re-autenticação
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })
      if (verifyError) {
        toast.error('Senha atual incorreta')
        return false
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      toast.success('Senha alterada com sucesso!')
      return true
    } catch {
      toast.error('Erro ao alterar senha')
      return false
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, changePassword, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
