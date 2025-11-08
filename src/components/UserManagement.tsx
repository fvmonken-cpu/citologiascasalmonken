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
        console.log('💾 Salvando usuário...');
        try {
            if (editingUser) {
                const updateData: any = {
                    nome: formData.nome,
                    email: formData.email,
                    perfil: formData.perfil,
                    ativo: formData.ativo,
                    updated_at: new Date().toISOString()
                };
                if (formData.senha.trim()) {
                    updateData.senha_hash = formData.senha;
                }
                const { error } = await supabase.from('users').update(updateData).eq('id', editingUser.id);
                if (error) throw error;
                toast.success('Usuário atualizado com sucesso!');
            } else {
                const { error } = await supabase.from('users').insert([
                    {
                        nome: formData.nome,
                        email: formData.email,
                        senha_hash: formData.senha,
                        perfil: formData.perfil,
                        ativo: formData.ativo
                    }
                ]);
                if (error) throw error;
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

      <Card data-spec-id="users-table-card">
        <CardHeader data-spec-id="hXXor8hTBewrj7QK">
          <CardTitle className="flex items-center gap-2" data-spec-id="table-title">
            <UserCheck className="w-5 h-5" data-spec-id="tagjZLOWTBgQVRzd"/>
            Usuários Cadastrados ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent data-spec-id="HP8nkSS87QH2Nwvo">
          {loading ? (<div className="text-center py-8" data-spec-id="loading-state">
              <p data-spec-id="KH6uwJoQNP1zyAKu">Carregando usuários...</p>
            </div>) : (<div className="overflow-x-auto" data-spec-id="table-container">
              <Table data-spec-id="grBnpw98kCjs2zMF">
                <TableHeader data-spec-id="a8qeo9oSMgTC7bDE">
                  <TableRow data-spec-id="9GFLqjMOJJzIHTlp">
                    <TableHead data-spec-id="A3G7VsQFrpxykDNy">Nome</TableHead>
                    <TableHead className="hidden sm:table-cell" data-spec-id="elDaPqd7mTQZMYaN">Email</TableHead>
                    <TableHead data-spec-id="D7pHDAAqPQ9SQU9I">Perfil</TableHead>
                    <TableHead className="hidden md:table-cell" data-spec-id="zp9EXD88cCAC48Is">Status</TableHead>
                    <TableHead className="text-right" data-spec-id="PAHYGGnHAKE1GxgT">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody data-spec-id="eENP7yfsNs7FlARt">
                  {users.map((user)=>(<TableRow key={user.id} data-spec-id={`user-row-${user.id}`}>
                      <TableCell className="font-medium" data-spec-id="nGswkcUgax65zGFe">
                        <div data-spec-id="zSNkw5ylSmNBgoaO">
                          <div className="font-medium" data-spec-id="M0YbNd7vlgD3bOpS">{user.nome}</div>
                          <div className="sm:hidden text-sm text-gray-500" data-spec-id="tbVlPgTfYeJdNvM1">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell" data-spec-id="R96MhH3KbDYr0Lu5">{user.email}</TableCell>
                      <TableCell data-spec-id="0VmTVfm0Yc8VmQlG">
                        <Badge variant="outline" className={getProfileBadge(user.perfil)} data-spec-id="ieB5MjlA2NwjH8Ba">
                          {user.perfil}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell" data-spec-id="QXlX4rO6iTZ6rSzv">
                        <div className="flex items-center gap-2" data-spec-id="ZdaN8FcsbvtkjP4Q">
                          {user.ativo ? (<UserCheck className="w-4 h-4 text-green-600" data-spec-id="lGOj8oXbxQoDsrmE"/>) : (<UserX className="w-4 h-4 text-red-600" data-spec-id="RyL3CYsj0DvAsT52"/>)}
                          <span className={user.ativo ? 'text-green-600' : 'text-red-600'} data-spec-id="faTfaCT2o7fWUGqB">
                            {user.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell data-spec-id="elx64sbVmlkAXT25">
                        <div className="flex items-center gap-1 justify-end" data-spec-id="r3W42Lv1aMOW7JD2">
                          {canEditUser(user) && (<Button size="sm" variant="ghost" onClick={()=>handleEdit(user)} data-spec-id={`edit-user-${user.id}`}>
                              <Edit2 className="w-4 h-4" data-spec-id="bLvwxL6Q5Ya6X4Pq"/>
                            </Button>)}
                          {canToggleUserStatus(user) && (<Button size="sm" variant="ghost" onClick={()=>toggleUserStatus(user.id, user.ativo)} data-spec-id={`toggle-status-${user.id}`}>
                              {user.ativo ? <UserX className="w-4 h-4" data-spec-id="5PR33MglGwFPjzrR"/> : <UserCheck className="w-4 h-4" data-spec-id="RmVpnFp1rtCk9cvM"/>}
                            </Button>)}
                          {canDeleteUser(user) && (<Button size="sm" variant="ghost" onClick={()=>handleDelete(user.id)} className="text-red-600 hover:text-red-800" data-spec-id={`delete-user-${user.id}`}>
                              <Trash2 className="w-4 h-4" data-spec-id="4AEoR4XoHUkUl42e"/>
                            </Button>)}
                        </div>
                      </TableCell>
                    </TableRow>))}
                </TableBody>
              </Table>
            </div>)}
        </CardContent>
      </Card>
    </div>);
};
export default UserManagement;
