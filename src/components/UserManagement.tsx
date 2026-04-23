import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@/types/database';
import { Plus, Edit2, Trash2, UserCheck, UserX } from 'lucide-react';
const UserManagement = ()=>{
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        senha: '',
        perfil: 'Secretaria' as 'Medico' | 'Secretaria' | 'Administrador',
        ativo: true
    });
    useEffect(()=>{
        loadUsers();
    }, []);
    const loadUsers = async ()=>{
        console.log('👥 Carregando usuários...');
        setLoading(true);
        try {
            const { data, error } = await supabase.from('users').select('*').order('created_at', {
                ascending: false
            });
            if (error) throw error;
            console.log('✅ Usuários carregados:', data.length);
            setUsers(data || []);
        } catch (error) {
            console.error('❌ Erro ao carregar usuários:', error);
            toast.error('Erro ao carregar usuários');
        } finally{
            setLoading(false);
        }
    };
    const handleSubmit = async (e: React.FormEvent)=>{
        e.preventDefault();
        try {
            if (editingUser) {
                // Atualiza campos de perfil em public.users
                const { error } = await supabase.from('users').update({
                    nome: formData.nome,
                    email: formData.email,
                    perfil: formData.perfil,
                    ativo: formData.ativo,
                    updated_at: new Date().toISOString()
                }).eq('id', editingUser.id);
                if (error) throw error;

                // Sincroniza user_metadata no auth.users para manter JWT atualizado
                const { error: profileError } = await supabase.functions.invoke('create-user', {
                    body: { action: 'update_profile', userId: editingUser.id, nome: formData.nome, perfil: formData.perfil }
                });
                if (profileError) throw profileError;

                // Se nova senha informada, delega à Edge Function (usa admin API)
                if (formData.senha.trim()) {
                    const { error: fnError } = await supabase.functions.invoke('create-user', {
                        body: { action: 'update_password', userId: editingUser.id, password: formData.senha }
                    });
                    if (fnError) throw fnError;
                }

                toast.success('Usuário atualizado com sucesso!');
            } else {
                // Criação via Edge Function (cria auth.users + public.users com mesmo UUID)
                const { error: fnError } = await supabase.functions.invoke('create-user', {
                    body: {
                        action: 'create',
                        nome: formData.nome,
                        email: formData.email,
                        password: formData.senha,
                        perfil: formData.perfil,
                        ativo: formData.ativo
                    }
                });
                if (fnError) throw fnError;
                toast.success('Usuário criado com sucesso!');
            }
            resetForm();
            setDialogOpen(false);
            loadUsers();
        } catch (error) {
            console.error('❌ Erro ao salvar usuário:', error);
            toast.error('Erro ao salvar usuário');
        }
    };
    const resetForm = ()=>{
        setFormData({
            nome: '',
            email: '',
            senha: '',
            perfil: 'Secretaria',
            ativo: true
        });
        setEditingUser(null);
    };
    const handleEdit = (user: User)=>{
        setEditingUser(user);
        setFormData({
            nome: user.nome,
            email: user.email,
            senha: '',
            perfil: user.perfil,
            ativo: user.ativo
        });
        setDialogOpen(true);
    };
    const handleDelete = async (userId: string)=>{
        if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
        try {
            const { error } = await supabase.from('users').delete().eq('id', userId);
            if (error) throw error;
            toast.success('Usuário excluído com sucesso!');
            loadUsers();
        } catch (error) {
            console.error('❌ Erro ao excluir usuário:', error);
            toast.error('Erro ao excluir usuário');
        }
    };
    const toggleUserStatus = async (userId: string, currentStatus: boolean)=>{
        try {
            const { error } = await supabase.from('users').update({
                ativo: !currentStatus,
                updated_at: new Date().toISOString()
            }).eq('id', userId);
            if (error) throw error;
            toast.success(`Usuário ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!`);
            loadUsers();
        } catch (error) {
            console.error('❌ Erro ao alterar status:', error);
            toast.error('Erro ao alterar status do usuário');
        }
    };
    const getProfileBadge = (perfil: string)=>{
        const colors = {
            'Superusuario': 'bg-purple-100 text-purple-800 border-purple-200',
            'Administrador': 'bg-red-100 text-red-800 border-red-200',
            'Medico': 'bg-blue-100 text-blue-800 border-blue-200',
            'Secretaria': 'bg-green-100 text-green-800 border-green-200'
        };
        return colors[perfil as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
    };
    const canEditUser = (user: User)=>{
        if (user.perfil === 'Superusuario') return false;
        return true;
    };
    const canToggleUserStatus = (user: User)=>{
        if (user.perfil === 'Superusuario') return false;
        if (user.id === currentUser?.id) return false;
        return true;
    };
    const canDeleteUser = (user: User)=>{
        if (user.perfil === 'Superusuario') return false;
        if (user.id === currentUser?.id) return false;
        return true;
    };
    const canManageUsers = currentUser?.perfil === 'Superusuario' || currentUser?.perfil === 'Administrador';
    if (!canManageUsers) {
        return (<div className="text-center py-12" data-spec-id="access-denied">
        <h2 className="text-2xl font-bold text-gray-900 mb-4" data-spec-id="o1gkbZKBRMZaTbQt">Acesso Negado</h2>
        <p className="text-gray-600" data-spec-id="ZZEWoB8LFXiN2ejU">Você não tem permissão para acessar esta área.</p>
      </div>);
    }
    const activeUsers = users.filter((u)=>u.ativo);
    const inactiveUsers = users.filter((u)=>!u.ativo);
    const renderUserTable = (list: User[])=>(<div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((user)=>(<TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div>
                    <div className="font-medium">{user.nome}</div>
                    <div className="sm:hidden text-sm text-gray-500">{user.email}</div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{user.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getProfileBadge(user.perfil)}>
                    {user.perfil}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 justify-end">
                    {canEditUser(user) && (<Button size="sm" variant="ghost" onClick={()=>handleEdit(user)}>
                        <Edit2 className="w-4 h-4"/>
                      </Button>)}
                    {canToggleUserStatus(user) && (<Button size="sm" variant="ghost" onClick={()=>toggleUserStatus(user.id, user.ativo)} title={user.ativo ? 'Desativar' : 'Ativar'}>
                        {user.ativo ? <UserX className="w-4 h-4"/> : <UserCheck className="w-4 h-4"/>}
                      </Button>)}
                    {canDeleteUser(user) && (<Button size="sm" variant="ghost" onClick={()=>handleDelete(user.id)} className="text-red-600 hover:text-red-800" title="Excluir">
                        <Trash2 className="w-4 h-4"/>
                      </Button>)}
                  </div>
                </TableCell>
              </TableRow>))}
          </TableBody>
        </Table>
      </div>);
    return (<div className="space-y-6 p-4 md:p-6" data-spec-id="user-management-container">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" data-spec-id="wYWiASxaZYOYwe90">
        <div data-spec-id="nCfQGZv9ZtXO2GhB">
          <h1 className="text-2xl font-bold text-gray-900" data-spec-id="page-title">
            Gerenciar Usuários
          </h1>
          <p className="text-gray-600" data-spec-id="page-subtitle">
            Adicione, edite e gerencie usuários do sistema
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen} data-spec-id="GsYFhgWsnOEqlg74">
          <DialogTrigger asChild data-spec-id="syD9vVE5AdK2cYlp">
            <Button onClick={(e)=>{
        e.preventDefault();
        resetForm();
        setDialogOpen(true);
    }} className="bg-blue-600 hover:bg-blue-700" data-spec-id="add-user-button">
              <Plus className="w-4 h-4 mr-2" data-spec-id="LQBUdeZYSO3sHCjV"/>
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" data-spec-id="user-dialog">
            <DialogHeader data-spec-id="SKsE0D7cuDJdGM78">
              <DialogTitle data-spec-id="dialog-title">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4" data-spec-id="user-form">
              <div className="space-y-2" data-spec-id="H35JephehPZzgbQc">
                <Label htmlFor="nome" data-spec-id="jDDmJgdbAT8X4lPe">Nome Completo</Label>
                <Input id="nome" value={formData.nome} onChange={(e)=>setFormData({
            ...formData,
            nome: e.target.value
        })} placeholder="Nome completo do usuário" required data-spec-id="name-input"/>
              </div>

              <div className="space-y-2" data-spec-id="FnugFLKd61SozhQn">
                <Label htmlFor="email" data-spec-id="VDPIy0FtwKtssjKb">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e)=>setFormData({
            ...formData,
            email: e.target.value
        })} placeholder="email@casalmonken.com.br" required data-spec-id="email-input"/>
              </div>

              <div className="space-y-2" data-spec-id="mjAbdYQRUliQJLBk">
                <Label htmlFor="senha" data-spec-id="dMaR87gyFProeg28">
                  {editingUser ? 'Nova Senha (deixe vazio para manter atual)' : 'Senha'}
                </Label>
                <Input id="senha" type="password" value={formData.senha} onChange={(e)=>setFormData({
            ...formData,
            senha: e.target.value
        })} placeholder="Senha do usuário" required={!editingUser} data-spec-id="password-input"/>
              </div>

              <div className="space-y-2" data-spec-id="1dF9ABzfBILisPSo">
                <Label htmlFor="perfil" data-spec-id="dtxnUJZ3pGFCeGl9">Perfil</Label>
                <Select value={formData.perfil} onValueChange={(value)=>setFormData({
            ...formData,
            perfil: value as any
        })} data-spec-id="nMOi0DHzFdhVTMEC">
                  <SelectTrigger data-spec-id="profile-select">
                    <SelectValue data-spec-id="hkDNTeGN1AI9HnA0"/>
                  </SelectTrigger>
                  <SelectContent data-spec-id="U06zGkGi4bJK6KxB">
                    <SelectItem value="Secretaria" data-spec-id="rP1JBe0QMrKK9eKQ">Secretária</SelectItem>
                    <SelectItem value="Medico" data-spec-id="Gfs9JQpnCDYiNESv">Médico</SelectItem>
                    <SelectItem value="Administrador" data-spec-id="ohl09cTs8aReydrT">Administrador</SelectItem>
                    {currentUser?.perfil === 'Superusuario' && (<SelectItem value="Superusuario" data-spec-id="3t8aWYfTkgh3ZWPp">Superusuário</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {}
              {(!editingUser || editingUser.id !== currentUser?.id) && (<div className="flex items-center space-x-2" data-spec-id="XD9UHgcTMG3LpkA0">
                  <Switch id="ativo" checked={formData.ativo} onCheckedChange={(checked)=>setFormData({
            ...formData,
            ativo: checked
        })} data-spec-id="active-switch"/>
                  <Label htmlFor="ativo" data-spec-id="XYzqecr2WHRfPshH">Usuário ativo</Label>
                </div>)}

              {}
              {editingUser && editingUser.id === currentUser?.id && (<div className="p-3 bg-amber-50 border border-amber-200 rounded-md" data-spec-id="self-edit-warning">
                  <p className="text-sm text-amber-800" data-spec-id="glODUQfzqAYdbCHk">
                    ⚠️ Você está editando seu próprio perfil. Por segurança, não é possível alterar o status de ativação.
                  </p>
                </div>)}

              <div className="flex gap-2 pt-4" data-spec-id="y50OOgbj1o0AQkSr">
                <Button type="submit" className="flex-1" data-spec-id="save-button">
                  {editingUser ? 'Atualizar' : 'Criar'} Usuário
                </Button>
                <Button type="button" variant="outline" onClick={()=>setDialogOpen(false)} data-spec-id="cancel-button">
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-green-600"/>
            Usuários Ativos ({activeUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (<div className="text-center py-8">
              <p>Carregando usuários...</p>
            </div>) : activeUsers.length === 0 ? (<p className="text-center py-6 text-gray-500">Nenhum usuário ativo.</p>) : renderUserTable(activeUsers)}
        </CardContent>
      </Card>

      {!loading && inactiveUsers.length > 0 && (<Card className="opacity-80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-600">
            <UserX className="w-5 h-5"/>
            Usuários Inativos ({inactiveUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderUserTable(inactiveUsers)}
        </CardContent>
      </Card>)}
    </div>);
};
export default UserManagement;
