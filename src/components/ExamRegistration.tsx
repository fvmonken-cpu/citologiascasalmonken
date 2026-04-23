import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FilePlus, UserPlus, Search, Calendar, TestTube, FlaskConical } from 'lucide-react';
import { toast } from 'sonner';
import { formatDateBR } from '@/lib/dateUtils';
interface Patient {
    id: string;
    nome_completo: string;
    data_nascimento: string;
    telefone?: string;
    medico_responsavel_id?: string;
}
interface Lab {
    id: string;
    nome: string;
    sla_dias?: number;
}
interface User {
    id: string;
    nome: string;
    perfil: string;
}
interface ExamRegistrationProps {
    onSuccess?: () => void;
}
const ExamRegistration: React.FC<ExamRegistrationProps> = ({ onSuccess })=>{
    const { user } = useAuth();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [labs, setLabs] = useState<Lab[]>([]);
    const [doctors, setDoctors] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [selectedLabId, setSelectedLabId] = useState('');
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const [numeroFrasco, setNumeroFrasco] = useState('');
    const [dataColeta, setDataColeta] = useState(new Date().toISOString().split('T')[0]);
    const [citologiaRealizada, setCitologiaRealizada] = useState(false);
    const [dnaHpvSolicitado, setDnaHpvSolicitado] = useState(false);
    const [biopsiaSolicitada, setBiopsiaSolicitada] = useState(false);
    const [observacoesIniciais, setObservacoesIniciais] = useState('');
    const [patientSearch, setPatientSearch] = useState('');
    const [showNewPatientDialog, setShowNewPatientDialog] = useState(false);
    const [newPatientName, setNewPatientName] = useState('');
    const [newPatientBirthDate, setNewPatientBirthDate] = useState('');
    const [newPatientPhone, setNewPatientPhone] = useState('');
    const [savingNewPatient, setSavingNewPatient] = useState(false);
    useEffect(()=>{
        loadData();
    }, []);
    useEffect(()=>{
        if (user?.perfil === 'Medico') {
            setSelectedDoctorId(user.id);
        }
    }, [
        user
    ]);
    const loadData = async ()=>{
        console.log('📊 Carregando dados para registro de exame...');
        setLoading(true);
        try {
            const { data: patientsData, error: patientsError } = await supabase.from('patients').select('*').order('nome_completo');
            if (patientsError) throw patientsError;
            const { data: labsData, error: labsError } = await supabase.from('labs').select('*').order('nome');
            if (labsError) throw labsError;
            const { data: doctorsData, error: doctorsError } = await supabase.from('users').select('id, nome, perfil').eq('perfil', 'Medico').eq('ativo', true).order('nome');
            if (doctorsError) throw doctorsError;
            setPatients(patientsData || []);
            setLabs(labsData || []);
            setDoctors(doctorsData || []);
            console.log('✅ Dados carregados:', {
                patients: patientsData?.length,
                labs: labsData?.length,
                doctors: doctorsData?.length
            });
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            toast.error('Erro ao carregar dados');
        } finally{
            setLoading(false);
        }
    };
    const saveNewPatient = async ()=>{
        if (!newPatientName.trim() || !newPatientBirthDate) {
            toast.error('Nome e data de nascimento são obrigatórios');
            return;
        }
        console.log('💾 Salvando nova paciente...');
        setSavingNewPatient(true);
        try {
            const { data, error } = await supabase.from('patients').insert({
                nome_completo: newPatientName.trim(),
                data_nascimento: newPatientBirthDate,
                telefone: newPatientPhone.trim() || null
            }).select().single();
            if (error) throw error;
            setPatients((prev)=>[
                    ...prev,
                    data
                ].sort((a, b)=>a.nome_completo.localeCompare(b.nome_completo)));
            setSelectedPatientId(data.id);
            setNewPatientName('');
            setNewPatientBirthDate('');
            setNewPatientPhone('');
            setShowNewPatientDialog(false);
            toast.success('Paciente cadastrada com sucesso!');
        } catch (error) {
            console.error('❌ Erro ao salvar paciente:', error);
            toast.error('Erro ao cadastrar paciente');
        } finally{
            setSavingNewPatient(false);
        }
    };
    const saveExam = async ()=>{
        if (!selectedPatientId || !selectedLabId || !selectedDoctorId || !numeroFrasco.trim()) {
            toast.error('Todos os campos obrigatórios devem ser preenchidos');
            return;
        }
        if (!citologiaRealizada && !dnaHpvSolicitado && !biopsiaSolicitada) {
            toast.error('Pelo menos um exame deve ser solicitado (Citologia, DNA HPV ou Biópsia)');
            return;
        }
        console.log('💾 Salvando novo exame...');
        setSaving(true);
        try {
            const dataColetaUTC = new Date(dataColeta + 'T12:00:00Z').toISOString().split('T')[0];
            const examData = {
                patient_id: selectedPatientId,
                lab_id: selectedLabId,
                medico_id: selectedDoctorId,
                numero_frasco: numeroFrasco.trim(),
                data_coleta: dataColetaUTC,
                citologia_realizada: citologiaRealizada,
                dna_hpv_solicitado: dnaHpvSolicitado,
                biopsia_solicitada: biopsiaSolicitada,
                observacoes_iniciais: observacoesIniciais.trim() || null,
                status: 'Amostra Coletada' as const,
                data_amostra_coletada: new Date().toISOString()
            };
            const { data: exam, error: examError } = await supabase.from('exames').insert(examData).select().single();
            if (examError) throw examError;
            if (user) {
                const { error: logError } = await supabase.from('audit_logs').insert({
                    user_id: user.id,
                    exam_id: exam.id,
                    action: `Exame criado - Frasco: ${numeroFrasco} | Citologia: ${citologiaRealizada ? 'Sim' : 'Não'} | DNA HPV: ${dnaHpvSolicitado ? 'Sim' : 'Não'} | Biópsia: ${biopsiaSolicitada ? 'Sim' : 'Não'}`,
                    new_values: examData,
                    justificativa: 'Novo exame registrado no sistema'
                });
                if (logError) {
                    console.warn('⚠️ Erro ao criar log de auditoria:', logError);
                }
            }
            toast.success('Exame cadastrado com sucesso!');
            setSelectedPatientId('');
            setSelectedLabId('');
            if (user?.perfil !== 'Medico') {
                setSelectedDoctorId('');
            }
            setNumeroFrasco('');
            setDataColeta(new Date().toISOString().split('T')[0]);
            setCitologiaRealizada(false);
            setDnaHpvSolicitado(false);
            setBiopsiaSolicitada(false);
            setObservacoesIniciais('');
            setPatientSearch('');
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('❌ Erro ao salvar exame:', error);
            toast.error('Erro ao cadastrar exame');
        } finally{
            setSaving(false);
        }
    };
    const filteredPatients = patients.filter((patient)=>patient.nome_completo.toLowerCase().includes(patientSearch.toLowerCase()));
    if (loading) {
        return (<div className="flex items-center justify-center py-12" data-spec-id="exam-registration-loading">
        <div className="text-center" data-spec-id="OAVOGq8rJf96T8Z9">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" data-spec-id="NlENPi5m3NSqXhhA"></div>
          <p className="mt-2 text-gray-600" data-spec-id="ZT7mLtyJvIT9RUev">Carregando dados...</p>
        </div>
      </div>);
    }
    return (<div className="space-y-6" data-spec-id="exam-registration-container">
      {}
      <div className="flex items-center justify-between" data-spec-id="exam-registration-header">
        <div className="flex items-center space-x-4" data-spec-id="DgQJ7KK8ZZJoQ7mp">
          <div className="p-2 bg-blue-100 rounded-lg" data-spec-id="fAF9pzHEKfVH5WOj">
            <FilePlus className="w-6 h-6 text-blue-600" data-spec-id="exam-registration-icon"/>
          </div>
          <div data-spec-id="OGgEQXhtWR3uhPHm">
            <h2 className="text-2xl font-bold text-gray-900" data-spec-id="exam-registration-title">
              Novo Exame
            </h2>
            <p className="text-gray-600" data-spec-id="exam-registration-subtitle">
              Registre um novo exame citológico
            </p>
          </div>
        </div>
      </div>

      <Card data-spec-id="exam-registration-form-card">
        <CardHeader data-spec-id="exam-form-header">
          <CardTitle className="flex items-center" data-spec-id="exam-form-title">
            <TestTube className="w-5 h-5 mr-2" data-spec-id="HPgYIxruAvlHeXwv"/>
            Dados do Exame
          </CardTitle>
        </CardHeader>
        <CardContent data-spec-id="exam-form-content">
          <div className="space-y-6" data-spec-id="exam-form-fields">
            
            {}
            <div className="space-y-3" data-spec-id="patient-selection-section">
              <div className="flex items-center justify-between" data-spec-id="EweXIm794DXuL2e1">
                <Label className="text-sm font-medium text-gray-700" data-spec-id="patient-label">
                  Paciente *
                </Label>
                <Dialog open={showNewPatientDialog} onOpenChange={setShowNewPatientDialog} data-spec-id="qbnwWZG4NQQ2eQBV">
                  <DialogTrigger asChild data-spec-id="ywZ18oiM2loqOMX7">
                    <Button variant="outline" size="sm" onClick={()=>setShowNewPatientDialog(true)} data-spec-id="new-patient-trigger">
                      <UserPlus className="w-4 h-4 mr-2" data-spec-id="T7N9do0QBXC9sNIl"/>
                      Nova Paciente
                    </Button>
                  </DialogTrigger>
                  <DialogContent data-spec-id="new-patient-dialog">
                    <DialogHeader data-spec-id="wYPyPH52MgtUUDWN">
                      <DialogTitle data-spec-id="new-patient-dialog-title">Cadastrar Nova Paciente</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4" data-spec-id="new-patient-form">
                      <div data-spec-id="new-patient-name-field">
                        <Label htmlFor="newPatientName" data-spec-id="new-patient-name-label">Nome Completo *</Label>
                        <Input id="newPatientName" value={newPatientName} onChange={(e)=>setNewPatientName(e.target.value)} placeholder="Digite o nome completo da paciente" data-spec-id="new-patient-name-input"/>
                      </div>
                      <div data-spec-id="new-patient-birth-field">
                        <Label htmlFor="newPatientBirthDate" data-spec-id="new-patient-birth-label">Data de Nascimento *</Label>
                        <Input id="newPatientBirthDate" type="date" value={newPatientBirthDate} onChange={(e)=>setNewPatientBirthDate(e.target.value)} data-spec-id="new-patient-birth-input"/>
                      </div>
                      <div data-spec-id="new-patient-phone-field">
                        <Label htmlFor="newPatientPhone" data-spec-id="new-patient-phone-label">Telefone</Label>
                        <Input id="newPatientPhone" value={newPatientPhone} onChange={(e)=>setNewPatientPhone(e.target.value)} placeholder="(11) 99999-9999" data-spec-id="new-patient-phone-input"/>
                      </div>
                      <div className="flex justify-end space-x-2" data-spec-id="new-patient-actions">
                        <Button variant="outline" onClick={()=>setShowNewPatientDialog(false)} data-spec-id="new-patient-cancel-button">
                          Cancelar
                        </Button>
                        <Button onClick={saveNewPatient} disabled={savingNewPatient} data-spec-id="new-patient-save-button">
                          {savingNewPatient ? 'Salvando...' : 'Cadastrar'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="relative" data-spec-id="patient-search-field">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" data-spec-id="6WyYX2zUNmbYOyXD"/>
                <Input placeholder="Buscar paciente pelo nome..." value={patientSearch} onChange={(e)=>setPatientSearch(e.target.value)} className="pl-10" data-spec-id="patient-search-input"/>
              </div>
              
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId} data-spec-id="patient-select">
                <SelectTrigger data-spec-id="patient-select-trigger">
                  <SelectValue placeholder="Selecione uma paciente" data-spec-id="lGJQ2AcboMyk4QyJ"/>
                </SelectTrigger>
                <SelectContent data-spec-id="patient-select-content">
                  {filteredPatients.map((patient)=>(<SelectItem key={patient.id} value={patient.id} data-spec-id={`patient-option-${patient.id}`}>
                      <div className="flex flex-col" data-spec-id="WhR33oqaJ6RTwsMF">
                        <span className="font-medium" data-spec-id="l7GAsjHIqValNaNf">{patient.nome_completo}</span>
                        <span className="text-xs text-gray-500" data-spec-id="BGZzSYQAVGSqZpge">
                          Nascimento: {formatDateBR(patient.data_nascimento)}
                        </span>
                      </div>
                    </SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            {}
            <div className="space-y-3" data-spec-id="doctor-selection-section">
              <Label className="text-sm font-medium text-gray-700" data-spec-id="doctor-label">
                Médico Responsável *
              </Label>
              <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId} disabled={user?.perfil === 'Medico'} data-spec-id="doctor-select">
                <SelectTrigger data-spec-id="doctor-select-trigger">
                  <SelectValue placeholder="Selecione o médico responsável" data-spec-id="JDDXvhXgkDi7qCAl"/>
                </SelectTrigger>
                <SelectContent data-spec-id="doctor-select-content">
                  {doctors.map((doctor)=>(<SelectItem key={doctor.id} value={doctor.id} data-spec-id={`doctor-option-${doctor.id}`}>
                      {doctor.nome}
                    </SelectItem>))}
                </SelectContent>
              </Select>
              {user?.perfil === 'Medico' && (<p className="text-xs text-blue-600" data-spec-id="doctor-auto-selected">
                  Você foi automaticamente selecionado como médico responsável
                </p>)}
            </div>

            {}
            <div className="space-y-3" data-spec-id="lab-selection-section">
              <Label className="text-sm font-medium text-gray-700" data-spec-id="lab-label">
                Laboratório *
              </Label>
              <Select value={selectedLabId} onValueChange={setSelectedLabId} data-spec-id="lab-select">
                <SelectTrigger data-spec-id="lab-select-trigger">
                  <SelectValue placeholder="Selecione o laboratório" data-spec-id="lGgsSev4Ab3M24ph"/>
                </SelectTrigger>
                <SelectContent data-spec-id="lab-select-content">
                  {labs.map((lab)=>(<SelectItem key={lab.id} value={lab.id} data-spec-id={`lab-option-${lab.id}`}>
                      <div className="flex items-center justify-between w-full" data-spec-id="8n98dRaCCoAaQIGp">
                        <span data-spec-id="b9u3N9bwVCYk1QDx">{lab.nome}</span>
                        {lab.sla_dias && (<Badge variant="secondary" className="ml-2" data-spec-id="g6WJKhWosBnrlBQz">
                            SLA: {lab.sla_dias} dias
                          </Badge>)}
                      </div>
                    </SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-spec-id="collection-data-section">
              <div className="space-y-3" data-spec-id="collection-date-field">
                <Label className="text-sm font-medium text-gray-700" data-spec-id="collection-date-label">
                  Data da Coleta *
                </Label>
                <div className="relative" data-spec-id="9wKsT8ka4qO31oZm">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" data-spec-id="P3Irhu1FRiQPBXQX"/>
                  <Input type="date" value={dataColeta} onChange={(e)=>setDataColeta(e.target.value)} className="pl-10" data-spec-id="collection-date-input"/>
                </div>
              </div>
              
              <div className="space-y-3" data-spec-id="flask-number-field">
                <Label className="text-sm font-medium text-gray-700" data-spec-id="flask-number-label">
                  Número do Frasco *
                </Label>
                <div className="relative" data-spec-id="OblwBgA855ie4xIE">
                  <FlaskConical className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" data-spec-id="wgjF5xySPLKpuAz8"/>
                  <Input value={numeroFrasco} onChange={(e)=>setNumeroFrasco(e.target.value)} placeholder="Ex: F001, ABC123..." className="pl-10" data-spec-id="flask-number-input"/>
                </div>
              </div>
            </div>

            {}
            <div className="space-y-3" data-spec-id="requested-exams-section">
              <Label className="text-sm font-medium text-gray-700" data-spec-id="requested-exams-label">
                Exames Solicitados *
              </Label>
              <div className="space-y-3" data-spec-id="exam-checkboxes">
                <div className="flex items-center space-x-2" data-spec-id="citologia-checkbox">
                  <Checkbox id="citologia" checked={citologiaRealizada} onCheckedChange={setCitologiaRealizada} data-spec-id="citologia-checkbox-input"/>
                  <Label htmlFor="citologia" className="text-sm font-medium" data-spec-id="citologia-checkbox-label">
                    Citologia Oncótica
                  </Label>
                </div>
                <div className="flex items-center space-x-2" data-spec-id="dna-hpv-checkbox">
                  <Checkbox id="dnaHpv" checked={dnaHpvSolicitado} onCheckedChange={setDnaHpvSolicitado} data-spec-id="dna-hpv-checkbox-input"/>
                  <Label htmlFor="dnaHpv" className="text-sm font-medium" data-spec-id="dna-hpv-checkbox-label">
                    DNA HPV
                  </Label>
                </div>
                <div className="flex items-center space-x-2" data-spec-id="biopsia-checkbox">
                  <Checkbox id="biopsia" checked={biopsiaSolicitada} onCheckedChange={setBiopsiaSolicitada} data-spec-id="biopsia-checkbox-input"/>
                  <Label htmlFor="biopsia" className="text-sm font-medium" data-spec-id="biopsia-checkbox-label">
                    Anatomopatológico (Biópsia)
                  </Label>
                </div>
              </div>
              <p className="text-xs text-gray-500" data-spec-id="exam-selection-note">
                Selecione pelo menos um exame
              </p>
            </div>

            {}
            <div className="space-y-3" data-spec-id="initial-observations-section">
              <Label className="text-sm font-medium text-gray-700" data-spec-id="initial-observations-label">
                Observações Iniciais
              </Label>
              <Textarea value={observacoesIniciais} onChange={(e)=>setObservacoesIniciais(e.target.value)} placeholder="Digite observações sobre a coleta, se necessário..." rows={3} data-spec-id="initial-observations-input"/>
            </div>

            {}
            <div className="flex justify-end space-x-3 pt-4 border-t" data-spec-id="exam-form-actions">
              <Button variant="outline" onClick={()=>{
        setSelectedPatientId('');
        setSelectedLabId('');
        if (user?.perfil !== 'Medico') {
            setSelectedDoctorId('');
        }
        setNumeroFrasco('');
        setDataColeta(new Date().toISOString().split('T')[0]);
        setCitologiaRealizada(false);
        setDnaHpvSolicitado(false);
        setBiopsiaSolicitada(false);
        setObservacoesIniciais('');
        setPatientSearch('');
    }} data-spec-id="exam-form-reset-button">
                Limpar Formulário
              </Button>
              <Button onClick={saveExam} disabled={saving} className="bg-blue-600 hover:bg-blue-700" data-spec-id="exam-form-save-button">
                {saving ? 'Salvando...' : 'Cadastrar Exame'}
              </Button>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>);
};
export default ExamRegistration;
