import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Lab } from '@/types/database';
import { FlaskConical, Plus, Edit, Trash2, Phone, Clock } from 'lucide-react';
import { toast } from 'sonner';
const LabManagement: React.FC = ()=>{
    const { user } = useAuth();
    const [labs, setLabs] = useState<Lab[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingLab, setEditingLab] = useState<Lab | null>(null);
    const [formData, setFormData] = useState({
        nome: '',
        pessoa_contato: '',
        telefone_contato: '',
        link_resultados: '',
        sla_dias: ''
    });
    useEffect(()=>{
        loadLabs();
    }, []);
    const loadLabs = async ()=>{
        console.log('🧪 Carregando laboratórios...');
        setLoading(true);
        try {
            const { data: labsData, error } = await supabase.from('labs').select('*').order('nome');
            if (error) throw error;
            setLabs(labsData || []);
            console.log('✅ Laboratórios carregados:', labsData?.length);
        } catch (error) {
            console.error('❌ Erro ao carregar laboratórios:', error);
            toast.error('Erro ao carregar laboratórios');
        } finally{
            setLoading(false);
        }
    };
    const resetForm = ()=>{
        setFormData({
            nome: '',
            pessoa_contato: '',
            telefone_contato: '',
            link_resultados: '',
            sla_dias: ''
        });
        setEditingLab(null);
    };
    const openCreateDialog = ()=>{
        resetForm();
        setIsDialogOpen(true);
    };
    const openEditDialog = (lab: Lab)=>{
        setFormData({
            nome: lab.nome,
            pessoa_contato: lab.pessoa_contato || '',
            telefone_contato: lab.telefone_contato || '',
            link_resultados: lab.link_resultados || '',
            sla_dias: lab.sla_dias?.toString() || ''
        });
        setEditingLab(lab);
        setIsDialogOpen(true);
    };
    const handleSubmit = async (e: React.FormEvent)=>{
        e.preventDefault();
        if (!formData.nome.trim()) {
            toast.error('Nome do laboratório é obrigatório');
            return;
        }
        console.log('💾 Salvando laboratório...');
        try {
            const labData = {
                nome: formData.nome.trim(),
                pessoa_contato: formData.pessoa_contato.trim() || null,
                telefone_contato: formData.telefone_contato.trim() || null,
                link_resultados: formData.link_resultados.trim() || null,
                sla_dias: formData.sla_dias ? parseInt(formData.sla_dias) : null
            };
            if (editingLab) {
                const { error } = await supabase.from('labs').update(labData).eq('id', editingLab.id);
                if (error) throw error;
                toast.success('Laboratório atualizado com sucesso!');
            } else {
                const { error } = await supabase.from('labs').insert([
                    labData
                ]);
                if (error) throw error;
                toast.success('Laboratório criado com sucesso!');
            }
            setIsDialogOpen(false);
            resetForm();
            await loadLabs();
        } catch (error) {
            console.error('❌ Erro ao salvar laboratório:', error);
            toast.error('Erro ao salvar laboratório');
        }
    };
    const handleDelete = async (lab: Lab)=>{
        console.log('🗑️ Excluindo laboratório:', lab.nome);
        try {
            const { data: examsData, error: examsError } = await supabase.from('exames').select('id').eq('lab_id', lab.id).limit(1);
            if (examsError) throw examsError;
            if (examsData && examsData.length > 0) {
                toast.error('Não é possível excluir este laboratório pois ele está vinculado a exames');
                return;
            }
            const { error } = await supabase.from('labs').delete().eq('id', lab.id);
            if (error) throw error;
            toast.success('Laboratório excluído com sucesso!');
            await loadLabs();
        } catch (error) {
            console.error('❌ Erro ao excluir laboratório:', error);
            toast.error('Erro ao excluir laboratório');
        }
    };
    const canManageLabs = ()=>{
        return user?.perfil === 'Secretaria' || user?.perfil === 'Administrador' || user?.perfil === 'Superusuario';
    };
    if (!canManageLabs()) {
        return (<div className="text-center py-12" data-spec-id="no-permission">
        <p className="text-gray-600" data-spec-id="JQ0XCPMuVP5hGv3J">Você não tem permissão para acessar esta página.</p>
      </div>);
    }
    if (loading) {
        return (<div className="flex items-center justify-center py-12" data-spec-id="lab-management-loading">
        <div className="text-center" data-spec-id="QTI3Zjnh16pHr2eI">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" data-spec-id="BaT7zXdXd6PS9ZhW"></div>
          <p className="mt-2 text-gray-600" data-spec-id="8qwnV651gMYQNle4">Carregando laboratórios...</p>
        </div>
      </div>);
    }
    return (<div className="space-y-6" data-spec-id="lab-management-container">
      {}
      <div className="flex justify-between items-center" data-spec-id="lab-management-header">
        <div className="flex items-center space-x-3" data-spec-id="fkQSYm21KSDGb7rG">
          <FlaskConical className="w-6 h-6 text-gray-600" data-spec-id="Dcf5IXoFTIuucLyS"/>
          <h2 className="text-2xl font-bold text-gray-900" data-spec-id="lab-management-title">
            Gerenciamento de Laboratórios
          </h2>
        </div>
        <Button onClick={openCreateDialog} data-spec-id="create-lab-button">
          <Plus className="w-4 h-4 mr-2" data-spec-id="2FqmDx6cUzYwsSlr"/>
          Novo Laboratório
        </Button>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-spec-id="labs-grid">
        {labs.length === 0 ? (<div className="col-span-full text-center py-12 text-gray-500" data-spec-id="no-labs">
            Nenhum laboratório cadastrado.
          </div>) : (labs.map((lab)=>(<Card key={lab.id} className="hover:shadow-md transition-shadow" data-spec-id={`lab-card-${lab.id}`}>
              <CardHeader data-spec-id="6XPWqzi8aV7r6Nuo">
                <CardTitle className="flex items-center justify-between" data-spec-id="lab-card-header">
                  <span className="flex items-center" data-spec-id="0B0BE8A48ekF3oEn">
                    <FlaskConical className="w-5 h-5 mr-2 text-blue-600" data-spec-id="UENyGQTUZgW81p1t"/>
                    {lab.nome}
                  </span>
                  <div className="flex items-center space-x-2" data-spec-id="X7fYCq4I5l2eXR32">
                    <Button variant="ghost" size="sm" onClick={()=>openEditDialog(lab)} data-spec-id="edit-lab-button">
                      <Edit className="w-4 h-4" data-spec-id="nicv0Crdi4oRLkVS"/>
                    </Button>
                    <AlertDialog data-spec-id="VDTeRSvjXOrrCeJY">
                      <AlertDialogTrigger asChild data-spec-id="mnlWDPjkN4FNidZ7">
                        <Button variant="ghost" size="sm" data-spec-id="delete-lab-trigger">
                          <Trash2 className="w-4 h-4 text-red-600" data-spec-id="fjVnaDydYqPliFdY"/>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent data-spec-id="delete-lab-dialog">
                        <AlertDialogHeader data-spec-id="NtebKOT49bQSt3Xr">
                          <AlertDialogTitle data-spec-id="9dTELhoZ5GQJIJR0">Confirmar Exclusão</AlertDialogTitle>
                          <AlertDialogDescription data-spec-id="Udr7yIPk1xEWwEIh">
                            Tem certeza que deseja excluir o laboratório "{lab.nome}"?
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter data-spec-id="5vVkqlZrzSrBs69Q">
                          <AlertDialogCancel data-spec-id="duRcOsKuez7pP4Am">Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={()=>handleDelete(lab)} className="bg-red-600 hover:bg-red-700" data-spec-id="0b2iyrZCuYsCXuSi">
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent data-spec-id="73fmGPZvhJFjbQSi">
                <div className="space-y-3" data-spec-id="lab-card-content">
                  {lab.pessoa_contato && (<div className="flex items-center text-sm text-gray-600" data-spec-id="rNofjWKDN5E5TsGq">
                      <span className="font-medium mr-2" data-spec-id="NWLH7VRNLjGY8PjW">Contato:</span>
                      {lab.pessoa_contato}
                    </div>)}
                  
                  {lab.telefone_contato && (<div className="flex items-center text-sm text-gray-600" data-spec-id="6dQFYX3824dAAxjO">
                      <Phone className="w-4 h-4 mr-2" data-spec-id="9dlGveNSIsMMT5E0"/>
                      {lab.telefone_contato}
                    </div>)}
                  
                  {lab.sla_dias && (<div className="flex items-center text-sm text-gray-600" data-spec-id="o1ue9jTPCnBMEXSY">
                      <Clock className="w-4 h-4 mr-2" data-spec-id="uc6WvxWNRRogIxtH"/>
                      SLA: {lab.sla_dias} dias
                    </div>)}
                  
                  {lab.link_resultados && (<div className="text-sm" data-spec-id="OkGmtJSwUaQ8GbBi">
                      <a href={lab.link_resultados} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline" data-spec-id="lab-results-link">
                        Acessar Resultados
                      </a>
                    </div>)}
                </div>
              </CardContent>
            </Card>)))}
      </div>

      {}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} data-spec-id="PvTuszKeI7bZzwJp">
        <DialogContent className="sm:max-w-[425px]" data-spec-id="lab-form-dialog">
          <DialogHeader data-spec-id="ZmxxBUF0847CvSLc">
            <DialogTitle data-spec-id="lab-form-title">
              {editingLab ? 'Editar Laboratório' : 'Novo Laboratório'}
            </DialogTitle>
            <DialogDescription data-spec-id="lab-form-description">
              {editingLab ? 'Atualize as informações do laboratório.' : 'Preencha as informações do novo laboratório.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" data-spec-id="lab-form">
            <div className="space-y-2" data-spec-id="d4sd9cqwNoN8B8qY">
              <Label htmlFor="nome" data-spec-id="1pNz0fuFaRVJWHN7">Nome do Laboratório *</Label>
              <Input id="nome" value={formData.nome} onChange={(e)=>setFormData((prev)=>({
                ...prev,
                nome: e.target.value
            }))} placeholder="Digite o nome do laboratório" required data-spec-id="lab-name-input"/>
            </div>

            <div className="space-y-2" data-spec-id="JVxA7zMWQdliU0Ag">
              <Label htmlFor="pessoa_contato" data-spec-id="aWlhpFSNosIiaFgt">Pessoa de Contato</Label>
              <Input id="pessoa_contato" value={formData.pessoa_contato} onChange={(e)=>setFormData((prev)=>({
                ...prev,
                pessoa_contato: e.target.value
            }))} placeholder="Nome da pessoa responsável" data-spec-id="lab-contact-person-input"/>
            </div>

            <div className="space-y-2" data-spec-id="egQNMHRPEX3voxCk">
              <Label htmlFor="telefone_contato" data-spec-id="wASBqW28SPfHGwoC">Telefone de Contato</Label>
              <Input id="telefone_contato" value={formData.telefone_contato} onChange={(e)=>setFormData((prev)=>({
                ...prev,
                telefone_contato: e.target.value
            }))} placeholder="(11) 99999-9999" data-spec-id="lab-contact-phone-input"/>
            </div>

            <div className="space-y-2" data-spec-id="M9CuQmuOt4PTadkt">
              <Label htmlFor="link_resultados" data-spec-id="eZi86A6D3EyjS2Gz">Link para Resultados</Label>
              <Input id="link_resultados" type="url" value={formData.link_resultados} onChange={(e)=>setFormData((prev)=>({
                ...prev,
                link_resultados: e.target.value
            }))} placeholder="https://exemplo.com/resultados" data-spec-id="lab-results-link-input"/>
            </div>

            <div className="space-y-2" data-spec-id="Qaja3QNRKnX2FZID">
              <Label htmlFor="sla_dias" data-spec-id="L26KGrUQ2FtcB2kH">SLA (dias)</Label>
              <Input id="sla_dias" type="number" min="1" value={formData.sla_dias} onChange={(e)=>setFormData((prev)=>({
                ...prev,
                sla_dias: e.target.value
            }))} placeholder="Ex: 5" data-spec-id="lab-sla-input"/>
            </div>

            <DialogFooter data-spec-id="NQ5Ge0njXEeSEMic">
              <Button type="button" variant="outline" onClick={()=>setIsDialogOpen(false)} data-spec-id="cwkaYANiR240SfHU">
                Cancelar
              </Button>
              <Button type="submit" data-spec-id="lab-form-submit">
                {editingLab ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>);
};
export default LabManagement;
