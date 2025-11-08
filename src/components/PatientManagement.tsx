import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types/database';
import { Users, Plus, Edit, Trash2, Phone, Calendar } from 'lucide-react';
import { toast } from 'sonner';
const PatientManagement: React.FC = ()=>{
    const { user } = useAuth();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        nome_completo: '',
        data_nascimento: '',
        telefone: ''
    });
    useEffect(()=>{
        loadData();
    }, []);
    const loadData = async ()=>{
        console.log('👥 Carregando pacientes...');
        setLoading(true);
        try {
            let patientsQuery = supabase.from('patients').select('*').order('nome_completo');
            const { data: patientsData, error: patientsError } = await patientsQuery;
            if (patientsError) throw patientsError;
            setPatients(patientsData || []);
            console.log('✅ Dados carregados:', {
                patients: patientsData?.length
            });
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            toast.error('Erro ao carregar pacientes');
        } finally{
            setLoading(false);
        }
    };
    const resetForm = ()=>{
        setFormData({
            nome_completo: '',
            data_nascimento: '',
            telefone: ''
        });
        setEditingPatient(null);
    };
    const openCreateDialog = ()=>{
        resetForm();
        setIsDialogOpen(true);
    };
    const openEditDialog = (patient: Patient)=>{
        setFormData({
            nome_completo: patient.nome_completo,
            data_nascimento: patient.data_nascimento,
            telefone: patient.telefone || ''
        });
        setEditingPatient(patient);
        setIsDialogOpen(true);
    };
    const handleSubmit = async (e: React.FormEvent)=>{
        e.preventDefault();
        if (!formData.nome_completo.trim()) {
            toast.error('Nome completo é obrigatório');
            return;
        }
        if (!formData.data_nascimento) {
            toast.error('Data de nascimento é obrigatória');
            return;
        }
        console.log('💾 Salvando paciente...');
        try {
            const patientData = {
                nome_completo: formData.nome_completo.trim(),
                data_nascimento: formData.data_nascimento,
                telefone: formData.telefone.trim() || null
            };
            if (editingPatient) {
                const { error } = await supabase.from('patients').update(patientData).eq('id', editingPatient.id);
                if (error) throw error;
                toast.success('Paciente atualizado com sucesso!');
            } else {
                const { error } = await supabase.from('patients').insert([
                    patientData
                ]);
                if (error) throw error;
                toast.success('Paciente criado com sucesso!');
            }
            setIsDialogOpen(false);
            resetForm();
            await loadData();
        } catch (error) {
            console.error('❌ Erro ao salvar paciente:', error);
            toast.error('Erro ao salvar paciente');
        }
    };
    const handleDelete = async (patient: Patient)=>{
        console.log('🗑️ Excluindo paciente:', patient.nome_completo);
        try {
            const { data: examsData, error: examsError } = await supabase.from('exames').select('id').eq('patient_id', patient.id).limit(1);
            if (examsError) throw examsError;
            if (examsData && examsData.length > 0) {
                toast.error('Não é possível excluir este paciente pois ele possui exames vinculados');
                return;
            }
            const { error } = await supabase.from('patients').delete().eq('id', patient.id);
            if (error) throw error;
            toast.success('Paciente excluído com sucesso!');
            await loadData();
        } catch (error) {
            console.error('❌ Erro ao excluir paciente:', error);
            toast.error('Erro ao excluir paciente');
        }
    };
    const calculateAge = (birthDate: string): number =>{
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };
    const filteredPatients = patients.filter((patient)=>{
        const matchesSearch = searchTerm === '' || patient.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) || (patient.telefone && patient.telefone.includes(searchTerm));
        return matchesSearch;
    });
    if (loading) {
        return (<div className="flex items-center justify-center py-12" data-spec-id="patient-management-loading">
        <div className="text-center" data-spec-id="51KVIv9GYDXv7KQj">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" data-spec-id="E5aUBTKcqZHKfxil"></div>
          <p className="mt-2 text-gray-600" data-spec-id="9WgPRPWPpgWrqbFS">Carregando pacientes...</p>
        </div>
      </div>);
    }
    return (<div className="space-y-6" data-spec-id="patient-management-container">
      {}
      <div className="flex justify-between items-center" data-spec-id="patient-management-header">
        <div className="flex items-center space-x-3" data-spec-id="zRy6qsyZLlCyL9Ke">
          <Users className="w-6 h-6 text-gray-600" data-spec-id="MxWJMX9kxfNwCwvM"/>
          <h2 className="text-2xl font-bold text-gray-900" data-spec-id="patient-management-title">
            Gerenciamento de Pacientes
          </h2>
        </div>
        <Button onClick={openCreateDialog} data-spec-id="create-patient-button">
          <Plus className="w-4 h-4 mr-2" data-spec-id="5xl5Z75UyX08YbFA"/>
          Novo Paciente
        </Button>
      </div>

      {}
      <Card data-spec-id="patient-filters-card">
        <CardHeader data-spec-id="Nve7pERgsvdeObVh">
          <CardTitle className="text-lg" data-spec-id="2wXfyWArisPsK3q4">Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent data-spec-id="gjZJWbTMfyKNQoct">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-spec-id="patient-filters-grid">
            <div className="relative" data-spec-id="kqKrFo3D6jbQlkoZ">
              <Input placeholder="Buscar por nome ou telefone..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} data-spec-id="patient-search-input"/>
            </div>

            <Button variant="outline" onClick={()=>{
        setSearchTerm('');
    }} data-spec-id="clear-patient-filters">
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-spec-id="patient-stats">
        <Card data-spec-id="xoGsJfXQwDXqYPIq">
          <CardContent className="p-4 text-center" data-spec-id="VfbHPZF5eJuNzqeD">
            <div className="text-2xl font-bold text-gray-900" data-spec-id="Yfnayk5UzCBjDVyp">{patients.length}</div>
            <p className="text-sm text-gray-600" data-spec-id="UvmLIrrnDJXCU4vG">Total de Pacientes</p>
          </CardContent>
        </Card>

        <Card data-spec-id="njrNQqYGkIRSVm7s">
          <CardContent className="p-4 text-center" data-spec-id="6OMxYQypjA8TB5VW">
            <div className="text-2xl font-bold text-blue-600" data-spec-id="dAnPb5q0LBTV0TGD">
              {patients.filter((p)=>p.telefone).length}
            </div>
            <p className="text-sm text-gray-600" data-spec-id="8mvwOv0yb1O1vZSl">Com Telefone</p>
          </CardContent>
        </Card>

        <Card data-spec-id="jDSwuT0aelRLKBSu">
          <CardContent className="p-4 text-center" data-spec-id="hn0wNuzqy2jctgI7">
            <div className="text-2xl font-bold text-green-600" data-spec-id="vIxiGooTolYgbwaW">
              {filteredPatients.length}
            </div>
            <p className="text-sm text-gray-600" data-spec-id="0WkfncndlHsZwzqV">Exibindo</p>
          </CardContent>
        </Card>
      </div>

      {}
      <Card data-spec-id="patients-list-card">
        <CardHeader data-spec-id="BLkqNRR3dP6GB6pm">
          <CardTitle className="text-lg" data-spec-id="Y5PsnbWbOczzVJ77">
            Pacientes ({filteredPatients.length})
          </CardTitle>
        </CardHeader>
        <CardContent data-spec-id="Mt21q2bihYSArx3g">
          <div className="space-y-4" data-spec-id="patients-list">
            {filteredPatients.length === 0 ? (<div className="text-center py-8 text-gray-500" data-spec-id="no-patients">
                Nenhum paciente encontrado com os filtros aplicados.
              </div>) : (filteredPatients.map((patient)=>(<div key={patient.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors" data-spec-id={`patient-item-${patient.id}`}>
                  <div className="flex items-center justify-between" data-spec-id="BciKqw9GRpJEIzTL">
                    <div className="flex-1 space-y-2" data-spec-id="patient-info">
                      <div className="flex items-center space-x-4" data-spec-id="JHYO8XKZpEfX6Wfr">
                        <div data-spec-id="4jrX6tNP4wdJPc74">
                          <h4 className="font-medium text-gray-900" data-spec-id="patient-name">
                            {patient.nome_completo}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600" data-spec-id="AkofOrPZi56Q8UTn">
                            <span className="flex items-center" data-spec-id="KHwMDtfO8xzS4AtL">
                              <Calendar className="w-3 h-3 mr-1" data-spec-id="eKYPIHfWpdCORmYz"/>
                              {calculateAge(patient.data_nascimento)} anos
                            </span>
                            <span data-spec-id="e0d9fZ3jLG41noDq">
                              Nascimento: {new Date(patient.data_nascimento).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          {patient.telefone && (<div className="flex items-center text-sm text-gray-600 mt-1" data-spec-id="s3g12PzYUrHDHX2r">
                              <Phone className="w-3 h-3 mr-1" data-spec-id="xp4J6qJmw6cjHBWD"/>
                              {patient.telefone}
                            </div>)}

                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2" data-spec-id="patient-actions">
                      <Button variant="outline" size="sm" onClick={()=>openEditDialog(patient)} data-spec-id="edit-patient-button">
                        <Edit className="w-4 h-4 mr-1" data-spec-id="q14aebG4cZdWZmfs"/>
                        Editar
                      </Button>
                      <AlertDialog data-spec-id="jjoKCHeZDqgstvHe">
                        <AlertDialogTrigger asChild data-spec-id="Ajo2PSxyenrJcZmQ">
                          <Button variant="outline" size="sm" data-spec-id="delete-patient-trigger">
                            <Trash2 className="w-4 h-4 text-red-600" data-spec-id="VEtXCnPEQYCYsZ9a"/>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent data-spec-id="delete-patient-dialog">
                          <AlertDialogHeader data-spec-id="hIm7RfWI0SIa3DzE">
                            <AlertDialogTitle data-spec-id="Aq3RZEue12KKaEim">Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription data-spec-id="gWJ7ZxaYEeQQSShj">
                              Tem certeza que deseja excluir o paciente "{patient.nome_completo}"?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter data-spec-id="s4JbeZe5DszGVdc7">
                            <AlertDialogCancel data-spec-id="MEfstHPRAkfYQpJC">Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={()=>handleDelete(patient)} className="bg-red-600 hover:bg-red-700" data-spec-id="6hQ6un8tVgQU8vRU">
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>)))}
          </div>
        </CardContent>
      </Card>

      {}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} data-spec-id="YttgnnYvzd9h3ueB">
        <DialogContent className="sm:max-w-[425px]" data-spec-id="patient-form-dialog">
          <DialogHeader data-spec-id="0gU0SW0D8BSc6efs">
            <DialogTitle data-spec-id="patient-form-title">
              {editingPatient ? 'Editar Paciente' : 'Novo Paciente'}
            </DialogTitle>
            <DialogDescription data-spec-id="patient-form-description">
              {editingPatient ? 'Atualize as informações do paciente.' : 'Preencha as informações do novo paciente.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" data-spec-id="patient-form">
            <div className="space-y-2" data-spec-id="EUN37cD7zcuBoC62">
              <Label htmlFor="nome_completo" data-spec-id="obfFE10rdCStoib6">Nome Completo *</Label>
              <Input id="nome_completo" value={formData.nome_completo} onChange={(e)=>setFormData((prev)=>({
                ...prev,
                nome_completo: e.target.value
            }))} placeholder="Digite o nome completo" required data-spec-id="patient-name-input"/>
            </div>

            <div className="space-y-2" data-spec-id="aJ70fslnjjnR8l5j">
              <Label htmlFor="data_nascimento" data-spec-id="HfsmH4IFCru62Ucr">Data de Nascimento *</Label>
              <Input id="data_nascimento" type="date" value={formData.data_nascimento} onChange={(e)=>setFormData((prev)=>({
                ...prev,
                data_nascimento: e.target.value
            }))} required data-spec-id="patient-birth-input"/>
            </div>

            <div className="space-y-2" data-spec-id="VEtZaBtWbMuJzc4Z">
              <Label htmlFor="telefone" data-spec-id="1jg66FivXH12Tawm">Telefone</Label>
              <Input id="telefone" value={formData.telefone} onChange={(e)=>setFormData((prev)=>({
                ...prev,
                telefone: e.target.value
            }))} placeholder="(11) 99999-9999" data-spec-id="patient-phone-input"/>
            </div>



            <DialogFooter data-spec-id="J5iXJovzNSW5QkPt">
              <Button type="button" variant="outline" onClick={()=>setIsDialogOpen(false)} data-spec-id="2eEVkiCwAQbu3Ehz">
                Cancelar
              </Button>
              <Button type="submit" data-spec-id="patient-form-submit">
                {editingPatient ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>);
};
export default PatientManagement;
