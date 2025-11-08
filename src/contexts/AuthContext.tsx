import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
    loading: boolean;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = ()=>{
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
export const AuthProvider: React.FC<{
    children: React.ReactNode;
}> = ({ children })=>{
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(()=>{
        checkUser();
    }, []);
    const checkUser = async ()=>{
        console.log('🔍 Verificando usuário armazenado...');
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                console.log('👤 Usuário encontrado no localStorage:', userData.email);
                setUser(userData);
            }
        } catch (error) {
            console.error('❌ Erro ao verificar usuário:', error);
            localStorage.removeItem('user');
        } finally{
            setLoading(false);
        }
    };
    const login = async (email: string, password: string): Promise<boolean> =>{
        console.log('🔐 Tentando fazer login com:', email);
        setLoading(true);
        try {
            const { data: users, error } = await supabase.from('users').select('*').eq('email', email).eq('ativo', true).single();
            if (error) {
                console.error('❌ Erro ao buscar usuário:', error);
                toast.error('Credenciais inválidas');
                return false;
            }
            if (!users) {
                console.log('❌ Usuário não encontrado');
                toast.error('Credenciais inválidas');
                return false;
            }
            if (users.senha_hash !== password) {
                console.log('❌ Senha incorreta');
                toast.error('Credenciais inválidas');
                return false;
            }
            console.log('✅ Login realizado com sucesso para:', users.email);
            setUser(users);
            localStorage.setItem('user', JSON.stringify(users));
            toast.success(`Bem-vindo, ${users.nome}!`);
            return true;
        } catch (error) {
            console.error('❌ Erro no login:', error);
            toast.error('Erro interno. Tente novamente.');
            return false;
        } finally{
            setLoading(false);
        }
    };
    const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> =>{
        console.log('🔒 Tentando alterar senha...');
        if (!user) {
            toast.error('Usuário não autenticado');
            return false;
        }
        setLoading(true);
        try {
            if (user.senha_hash !== currentPassword) {
                toast.error('Senha atual incorreta');
                return false;
            }
            const { error } = await supabase.from('users').update({
                senha_hash: newPassword,
                updated_at: new Date().toISOString()
            }).eq('id', user.id);
            if (error) throw error;
            const updatedUser = {
                ...user,
                senha_hash: newPassword
            };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            toast.success('Senha alterada com sucesso!');
            return true;
        } catch (error) {
            console.error('❌ Erro ao alterar senha:', error);
            toast.error('Erro ao alterar senha');
            return false;
        } finally{
            setLoading(false);
        }
    };
    const logout = ()=>{
        console.log('👋 Fazendo logout...');
        setUser(null);
        localStorage.removeItem('user');
        toast.success('Logout realizado com sucesso');
    };
    const value = {
        user,
        login,
        logout,
        changePassword,
        loading
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
