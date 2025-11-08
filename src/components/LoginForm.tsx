import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
const LoginForm = ()=>{
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading } = useAuth();
    const handleSubmit = async (e: React.FormEvent)=>{
        e.preventDefault();
        console.log('📝 Formulário de login submetido');
        await login(email, password);
    };
    return (<div className="min-h-screen flex items-center justify-center p-4" data-spec-id="login-container">
      <Card className="w-full max-w-md shadow-lg" data-spec-id="login-card">
        <CardHeader className="text-center space-y-4" data-spec-id="login-header">
          <div className="flex justify-center mb-4" data-spec-id="login-logo-container">
            <img src="https://cdn-pinspec-public.pinspec.ai/assets/TyEPnly8Vve4mhijRj0lR.png" alt="Espaço Casal Monken Logo" className="h-20 w-auto object-contain" data-spec-id="login-logo"/>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800" data-spec-id="login-title">
            Citologia Oncótica
          </CardTitle>
          <p className="text-gray-600" data-spec-id="login-subtitle">
            Sistema de Gestão de Exames
          </p>
        </CardHeader>
        <CardContent data-spec-id="s6ma4oM7aEwxgVWe">
          <form onSubmit={handleSubmit} className="space-y-4" data-spec-id="login-form">
            <div className="space-y-2" data-spec-id="jcrGDg2dNj2zHv7m">
              <Label htmlFor="email" data-spec-id="email-label">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="seu.email@casalmonken.com.br" required data-spec-id="email-input" className="w-full"/>
            </div>
            
            <div className="space-y-2" data-spec-id="0gYSqKT3DzIDIqCC">
              <Label htmlFor="password" data-spec-id="password-label">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Sua senha" required data-spec-id="password-input" className="w-full"/>
            </div>
            
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading} data-spec-id="login-button">
              {loading ? (<>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" data-spec-id="jdynEcJC6zjINFil"/>
                  Entrando...
                </>) : ('Entrar')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>);
};
export default LoginForm;
