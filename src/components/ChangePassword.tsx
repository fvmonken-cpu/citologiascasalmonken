import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
const ChangePassword: React.FC = ()=>{
    const { changePassword, loading } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const handleSubmit = async (e: React.FormEvent)=>{
        e.preventDefault();
        if (newPassword.length < 4) {
            toast.error('A nova senha deve ter pelo menos 4 caracteres');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('As senhas não coincidem');
            return;
        }
        if (currentPassword === newPassword) {
            toast.error('A nova senha deve ser diferente da atual');
            return;
        }
        const success = await changePassword(currentPassword, newPassword);
        if (success) {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    };
    return (<div className="max-w-md mx-auto space-y-6" data-spec-id="change-password-container">
            <div className="flex items-center space-x-3" data-spec-id="change-password-header">
                <KeyRound className="w-6 h-6 text-gray-600" data-spec-id="change-password-icon"/>
                <h2 className="text-2xl font-bold text-gray-900" data-spec-id="change-password-title">
                    Alterar Senha
                </h2>
            </div>

            <Card data-spec-id="change-password-card">
                <CardHeader data-spec-id="change-password-card-header">
                    <CardTitle className="text-lg" data-spec-id="change-password-card-title">
                        Definir Nova Senha
                    </CardTitle>
                </CardHeader>
                <CardContent data-spec-id="change-password-card-content">
                    <form onSubmit={handleSubmit} className="space-y-4" data-spec-id="change-password-form">
                        <div className="space-y-2" data-spec-id="current-password-field">
                            <Label htmlFor="currentPassword" data-spec-id="current-password-label">
                                Senha Atual
                            </Label>
                            <div className="relative" data-spec-id="current-password-input-container">
                                <Input id="currentPassword" type={showCurrentPassword ? "text" : "password"} value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)} placeholder="Digite sua senha atual" required data-spec-id="current-password-input" className="pr-10"/>
                                <button type="button" onClick={()=>setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600" data-spec-id="current-password-toggle">
                                    {showCurrentPassword ? (<EyeOff className="w-4 h-4" data-spec-id="current-password-hide-icon"/>) : (<Eye className="w-4 h-4" data-spec-id="current-password-show-icon"/>)}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2" data-spec-id="new-password-field">
                            <Label htmlFor="newPassword" data-spec-id="new-password-label">
                                Nova Senha
                            </Label>
                            <div className="relative" data-spec-id="new-password-input-container">
                                <Input id="newPassword" type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} placeholder="Digite sua nova senha" required minLength={4} data-spec-id="new-password-input" className="pr-10"/>
                                <button type="button" onClick={()=>setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600" data-spec-id="new-password-toggle">
                                    {showNewPassword ? (<EyeOff className="w-4 h-4" data-spec-id="new-password-hide-icon"/>) : (<Eye className="w-4 h-4" data-spec-id="new-password-show-icon"/>)}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2" data-spec-id="confirm-password-field">
                            <Label htmlFor="confirmPassword" data-spec-id="confirm-password-label">
                                Confirmar Nova Senha
                            </Label>
                            <div className="relative" data-spec-id="confirm-password-input-container">
                                <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} placeholder="Confirme sua nova senha" required minLength={4} data-spec-id="confirm-password-input" className="pr-10"/>
                                <button type="button" onClick={()=>setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600" data-spec-id="confirm-password-toggle">
                                    {showConfirmPassword ? (<EyeOff className="w-4 h-4" data-spec-id="confirm-password-hide-icon"/>) : (<Eye className="w-4 h-4" data-spec-id="confirm-password-show-icon"/>)}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2" data-spec-id="change-password-actions">
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading || !currentPassword || !newPassword || !confirmPassword} data-spec-id="change-password-submit">
                                {loading ? 'Alterando...' : 'Alterar Senha'}
                            </Button>
                        </div>

                        <div className="text-sm text-gray-500 space-y-1" data-spec-id="password-requirements">
                            <p data-spec-id="password-requirements-title">Requisitos da senha:</p>
                            <ul className="list-disc list-inside space-y-1 text-xs" data-spec-id="password-requirements-list">
                                <li data-spec-id="password-requirement-length">Mínimo de 4 caracteres</li>
                                <li data-spec-id="password-requirement-different">Diferente da senha atual</li>
                                <li data-spec-id="password-requirement-match">Confirmação deve coincidir</li>
                            </ul>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>);
};
export default ChangePassword;
