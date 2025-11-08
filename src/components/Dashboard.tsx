import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Exam, User, Patient, Lab, ExamStatus } from '@/types/database';
import { Search, Filter, Clock, CheckCircle, AlertCircle, Eye, ArrowUpDown, CalendarDays, AlertTriangle, Stethoscope, FileText, FlaskConical, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { formatDateBR } from '@/lib/dateUtils';
interface DashboardProps {
    onViewExam?: (examId: string) => void;
}
const Dashboard: React.FC<DashboardProps> = ({ onViewExam })=>{
    const { user } = useAuth();
    const [exams, setExams] = useState<Exam[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [labs, setLabs] = useState<Lab[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMedico, setFilterMedico] = useState('todos');
    const [filterStatus, setFilterStatus] = useState('todos');
    const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'date-desc' | 'collection-desc'>('date-desc');
    useEffect(()=>{
        loadData();
    }, [
        user
    ]);
    const loadData = async ()=>{
        console.log('📊 Carregando dados do dashboard...');
        setLoading(true);
        try {
            const { data: usersData, error: usersError } = await supabase.from('users').select('*').eq('ativo', true);
            if (usersError) throw usersError;
            const { data: patientsData, error: patientsError } = await supabase.from('patients').select('*');
            if (patientsError) throw patientsError;
            const { data: labsData, error: labsError } = await supabase.from('labs').select('*');
            if (labsError) throw labsError;
            let examsQuery = supabase.from('exames').select('*').neq('status', 'Próxima Consulta Comunicada ao Comercial').order('created_at', {
                ascending: false
            });
            if (user?.perfil === 'Medico') {
                examsQuery = examsQuery.eq('medico_id', user.id);
            }
            const { data: examsData, error: examsError } = await examsQuery;
            if (examsError) throw examsError;
            setUsers(usersData || []);
            setPatients(patientsData || []);
            setLabs(labsData || []);
            setExams(examsData || []);
            console.log('✅ Dados carregados:', {
                users: usersData?.length,
                patients: patientsData?.length,
                labs: labsData?.length,
                exams: examsData?.length
            });
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            toast.error('Erro ao carregar dados do dashboard');
        } finally{
            setLoading(false);
        }
    };
    const getStatusCounts = ()=>{
        const statusList: ExamStatus[] = [
            'Amostra Coletada',
            'Recolhido pelo Laboratório',
            'Resultado Liberado',
            'Parecer Médico Emitido',
            'Paciente Comunicada'
        ];
        return statusList.map((status)=>({
                status,
                count: exams.filter((exam)=>exam.status === status).length,
                color: getStatusColor(status)
            }));
    };
    const getStatusColor = (status: ExamStatus): string =>{
        switch(status){
            case 'Amostra Coletada':
                return 'bg-gray-100 text-gray-800';
            case 'Recolhido pelo Laboratório':
                return 'bg-blue-100 text-blue-800';
            case 'Resultado Liberado':
                return 'bg-yellow-100 text-yellow-800';
            case 'Parecer Médico Emitido':
                return 'bg-purple-100 text-purple-800';
            case 'Paciente Comunicada':
                return 'bg-green-100 text-green-800';
            case 'Próxima Consulta Comunicada ao Comercial':
                return 'bg-emerald-100 text-emerald-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    const getPatientName = (patientId: string): string =>{
        const patient = patients.find((p)=>p.id === patientId);
        return patient?.nome_completo || 'Paciente não encontrado';
    };
    const getMedicoName = (medicoId: string): string =>{
        const medico = users.find((u)=>u.id === medicoId);
        return medico?.nome || 'Médico não encontrado';
    };
    const getLabName = (labId: string): string =>{
        const lab = labs.find((l)=>l.id === labId);
        return lab?.nome || 'Lab não encontrado';
    };
    const formatReturnType = (tipo: string): string =>{
        switch(tipo){
            case 'Imediato':
                return 'Imediato';
            case '6m':
                return '6 meses';
            case '1a':
                return '1 ano';
            case '2a':
                return '2 anos';
            case 'Outro':
                return 'Outro';
            default:
                return tipo;
        }
    };
    const getExamsWithReturnSchedule = ()=>{
        return exams.filter((exam)=>exam.status === 'Parecer Médico Emitido' && exam.tipo_retorno && exam.tipo_retorno !== 'Imediato' && exam.data_proxima_consulta).sort((a, b)=>{
            if (!a.data_proxima_consulta || !b.data_proxima_consulta) return 0;
            return new Date(a.data_proxima_consulta).getTime() - new Date(b.data_proxima_consulta).getTime();
        });
    };
    const getExamsAwaitingOpinion = ()=>{
        return exams.filter((exam)=>exam.status === 'Resultado Liberado').sort((a, b)=>{
            return new Date(b.data_resultado_liberado || b.updated_at).getTime() - new Date(a.data_resultado_liberado || a.updated_at).getTime();
        });
    };
    const getDaysWaiting = (exam: Exam): number =>{
        const releaseDate = new Date(exam.data_resultado_liberado || exam.updated_at);
        const today = new Date();
        releaseDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        const diffInDays = Math.floor((today.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(0, diffInDays);
    };
    const isWaitingTooLong = (exam: Exam): boolean =>{
        return getDaysWaiting(exam) >= 3;
    };
    const getExamsOverSLA = ()=>{
        return exams.filter((exam)=>{
            if (!exam.data_recolhido_lab || exam.status === 'Amostra Coletada') return false;
            const lab = labs.find((l)=>l.id === exam.lab_id);
            if (!lab?.sla_dias) return false;
            const recolhidoDate = new Date(exam.data_recolhido_lab);
            const today = new Date();
            recolhidoDate.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);
            const daysInLab = Math.floor((today.getTime() - recolhidoDate.getTime()) / (1000 * 60 * 60 * 24));
            return daysInLab > lab.sla_dias;
        }).sort((a, b)=>{
            const daysOverSLA_A = getDaysOverSLA(a);
            const daysOverSLA_B = getDaysOverSLA(b);
            return daysOverSLA_B - daysOverSLA_A;
        });
    };
    const getDaysInLab = (exam: Exam): number =>{
        if (!exam.data_recolhido_lab) return 0;
        const recolhidoDate = new Date(exam.data_recolhido_lab);
        const today = new Date();
        recolhidoDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        return Math.floor((today.getTime() - recolhidoDate.getTime()) / (1000 * 60 * 60 * 24));
    };
    const getDaysOverSLA = (exam: Exam): number =>{
        const lab = labs.find((l)=>l.id === exam.lab_id);
        if (!lab?.sla_dias) return 0;
        const daysInLab = getDaysInLab(exam);
        return Math.max(0, daysInLab - lab.sla_dias);
    };
    const isReturnDueSoon = (dataProximaConsulta: string): boolean =>{
        const today = new Date();
        const returnDate = new Date(dataProximaConsulta);
        const diffInDays = Math.ceil((returnDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffInDays <= 30 && diffInDays >= 0;
    };
    const examsWithReturnSchedule = getExamsWithReturnSchedule();
    const examsAwaitingOpinion = getExamsAwaitingOpinion();
    const examsOverSLA = getExamsOverSLA();
    const filteredAndSortedExams = exams.filter((exam)=>{
        const patientName = getPatientName(exam.patient_id).toLowerCase();
        const patient = patients.find((p)=>p.id === exam.patient_id);
        const phone = patient?.telefone || '';
        const matchesSearch = searchTerm === '' || patientName.includes(searchTerm.toLowerCase()) || phone.includes(searchTerm);
        const matchesMedico = filterMedico === 'todos' || exam.medico_id === filterMedico;
        const matchesStatus = filterStatus === 'todos' || exam.status === filterStatus;
        return matchesSearch && matchesMedico && matchesStatus;
    }).sort((a, b)=>{
        switch(sortBy){
            case 'name-asc':
                return getPatientName(a.patient_id).localeCompare(getPatientName(b.patient_id));
            case 'name-desc':
                return getPatientName(b.patient_id).localeCompare(getPatientName(a.patient_id));
            case 'date-desc':
                return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
            case 'collection-desc':
                return new Date(b.data_coleta).getTime() - new Date(a.data_coleta).getTime();
            default:
                return 0;
        }
    });
    const statusCounts = getStatusCounts();
    if (loading) {
        return (<div className="flex items-center justify-center py-12" data-spec-id="dashboard-loading">
        <div className="text-center" data-spec-id="pMtkjgduEig3fUIg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" data-spec-id="0Q8DTrWfWiN29eC4"></div>
          <p className="mt-2 text-gray-600" data-spec-id="GDw11cdTmEecbgYV">Carregando dashboard...</p>
        </div>
      </div>);
    }
    return (<div className="space-y-6" data-spec-id="dashboard-container">
      {}
      <div className="flex justify-between items-center" data-spec-id="dashboard-header">
        <h2 className="text-2xl font-bold text-gray-900" data-spec-id="dashboard-title">
          Dashboard - Dia a Dia
        </h2>
        <div className="flex items-center space-x-2" data-spec-id="dashboard-actions">
          <Button variant="outline" size="sm" onClick={loadData} data-spec-id="refresh-button">
            Atualizar
          </Button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4" data-spec-id="status-cards">
        {statusCounts.map(({ status, count, color })=>(<Card key={status} className={`cursor-pointer hover:shadow-md transition-all duration-200 ${filterStatus === status ? 'ring-2 ring-blue-500 shadow-lg' : ''}`} data-spec-id={`status-card-${status}`} onClick={()=>{
            console.log('🎯 Card clicado, ativando filtro:', status);
            setFilterStatus(filterStatus === status ? 'todos' : status);
        }}>
            <CardContent className="p-4" data-spec-id="CzYPGnk4KXM45pNW">
              <div className="text-center" data-spec-id="p8sIXTxLgTaKMjIx">
                <div className="text-2xl font-bold text-gray-900" data-spec-id="ShtFHGEqalbBZfSp">{count}</div>
                <Badge className={`${color} text-xs mt-1`} data-spec-id="3NOKVqjm74PQnBdy">
                  {status}
                </Badge>
                {filterStatus === status && (<div className="text-xs text-blue-600 font-medium mt-1" data-spec-id="filter-active-indicator">
                    Filtro ativo
                  </div>)}
              </div>
            </CardContent>
          </Card>))}
      </div>

      {}
      {(user?.perfil === 'Secretaria' || user?.perfil === 'Administrador' || user?.perfil === 'Superusuario') && (<Card className={`border-l-4 ${examsWithReturnSchedule.length > 0 ? 'border-l-orange-500' : 'border-l-gray-300'}`} data-spec-id="return-schedule-card">
          <CardHeader data-spec-id="return-schedule-header">
            <CardTitle className="flex items-center space-x-2 text-lg" data-spec-id="return-schedule-title">
              <CalendarDays className="w-5 h-5 text-orange-600" data-spec-id="return-schedule-icon"/>
              <span data-spec-id="3S8Wu2A1zGQkWGpK">Exames com Prazo de Retorno Definido</span>
              <Badge className="bg-orange-100 text-orange-800" data-spec-id="return-schedule-count">
                {examsWithReturnSchedule.length}
              </Badge>
            </CardTitle>
            <p className="text-sm text-gray-600" data-spec-id="return-schedule-description">
              Exames que precisam de comunicação à paciente e ao comercial sobre o prazo de retorno
            </p>
          </CardHeader>
          <CardContent data-spec-id="return-schedule-content">
            {examsWithReturnSchedule.length > 0 ? (<div className="space-y-3" data-spec-id="return-schedule-list">
                {examsWithReturnSchedule.slice(0, 5).map((exam)=>(<div key={exam.id} className={`p-3 border rounded-lg ${isReturnDueSoon(exam.data_proxima_consulta!) ? 'bg-orange-50 border-orange-200' : 'bg-gray-50'}`} data-spec-id={`return-schedule-item-${exam.id}`}>
                  <div className="flex items-center justify-between" data-spec-id="return-schedule-item-content">
                    <div className="flex-1" data-spec-id="return-schedule-patient-info">
                      <div className="flex items-center space-x-2" data-spec-id="return-schedule-patient-header">
                        <h4 className="font-medium text-gray-900" data-spec-id="return-schedule-patient-name">
                          {getPatientName(exam.patient_id)}
                        </h4>
                        {isReturnDueSoon(exam.data_proxima_consulta!) && (<AlertTriangle className="w-4 h-4 text-orange-600" data-spec-id="return-schedule-urgent-icon"/>)}
                      </div>
                      <p className="text-sm text-gray-600" data-spec-id="return-schedule-exam-info">
                        Frasco: {exam.numero_frasco} • Dr(a). {getMedicoName(exam.medico_id)}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1" data-spec-id="return-schedule-dates">
                        <span data-spec-id="return-schedule-collection-date">
                          Coleta: {formatDateBR(exam.data_coleta)}
                        </span>
                        <span className="font-medium text-orange-600" data-spec-id="return-schedule-return-date">
                          Próxima: {formatDateBR(exam.data_proxima_consulta!)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2" data-spec-id="return-schedule-badges">
                      <Badge variant="outline" className={isReturnDueSoon(exam.data_proxima_consulta!) ? 'border-orange-600 text-orange-600' : ''} data-spec-id="return-schedule-type-badge">
                        {formatReturnType(exam.tipo_retorno!)}
                      </Badge>
                      {onViewExam && (<Button variant="outline" size="sm" onClick={()=>onViewExam(exam.id)} data-spec-id="return-schedule-view-button">
                          <Eye className="w-4 h-4 mr-1" data-spec-id="return-schedule-view-icon"/>
                          Ver
                        </Button>)}
                    </div>
                  </div>
                </div>))}
                
                {examsWithReturnSchedule.length > 5 && (<div className="text-center pt-2" data-spec-id="return-schedule-more">
                    <p className="text-sm text-gray-500" data-spec-id="return-schedule-more-text">
                      E mais {examsWithReturnSchedule.length - 5} exames com prazo definido
                    </p>
                  </div>)}
              </div>) : (<div className="text-center py-6 text-gray-500" data-spec-id="no-return-schedule">
                <CalendarDays className="w-8 h-8 mx-auto mb-2 text-gray-400" data-spec-id="no-return-schedule-icon"/>
                <p className="text-sm" data-spec-id="no-return-schedule-text">
                  Nenhum exame com prazo de retorno definido no momento
                </p>
                <p className="text-xs mt-1" data-spec-id="no-return-schedule-help">
                  Os prazos aparecerão aqui após os médicos emitirem pareceres com retorno não-imediato
                </p>
              </div>)}
          </CardContent>
        </Card>)}

      {}
      {(user?.perfil === 'Secretaria' || user?.perfil === 'Administrador' || user?.perfil === 'Superusuario') && (<Card className={`border-l-4 ${examsOverSLA.length > 0 ? 'border-l-red-500' : 'border-l-gray-300'}`} data-spec-id="sla-monitoring-card">
          <CardHeader data-spec-id="sla-monitoring-header">
            <CardTitle className="flex items-center space-x-2 text-lg" data-spec-id="sla-monitoring-title">
              <FlaskConical className="w-5 h-5 text-red-600" data-spec-id="sla-monitoring-icon"/>
              <span data-spec-id="sla-monitoring-title-text">Exames Fora do Prazo SLA</span>
              <Badge className="bg-red-100 text-red-800" data-spec-id="sla-monitoring-count">
                {examsOverSLA.length}
              </Badge>
            </CardTitle>
            <p className="text-sm text-gray-600" data-spec-id="sla-monitoring-description">
              Exames que ultrapassaram o prazo estabelecido pelo laboratório - contate o lab para providências
            </p>
          </CardHeader>
          <CardContent data-spec-id="sla-monitoring-content">
            {examsOverSLA.length > 0 ? (<div className="space-y-3" data-spec-id="sla-monitoring-list">
                {examsOverSLA.slice(0, 5).map((exam)=>{
        const lab = labs.find((l)=>l.id === exam.lab_id);
        const daysInLab = getDaysInLab(exam);
        const daysOverSLA = getDaysOverSLA(exam);
        return (<div key={exam.id} className="p-3 border rounded-lg bg-red-50 border-red-200" data-spec-id={`sla-monitoring-item-${exam.id}`}>
                      <div className="flex items-center justify-between" data-spec-id="sla-monitoring-item-content">
                        <div className="flex-1" data-spec-id="sla-monitoring-patient-info">
                          <div className="flex items-center space-x-2" data-spec-id="sla-monitoring-patient-header">
                            <h4 className="font-medium text-gray-900" data-spec-id="sla-monitoring-patient-name">
                              {getPatientName(exam.patient_id)}
                            </h4>
                            <AlertTriangle className="w-4 h-4 text-red-600" data-spec-id="sla-monitoring-urgent-icon"/>
                          </div>
                          <p className="text-sm text-gray-600" data-spec-id="sla-monitoring-exam-info">
                            Frasco: {exam.numero_frasco} • {getLabName(exam.lab_id)}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1" data-spec-id="sla-monitoring-dates">
                            <span data-spec-id="sla-monitoring-collection-date">
                              Recolhido: {formatDateBR(exam.data_recolhido_lab!)}
                            </span>
                            <span className="font-medium text-red-600" data-spec-id="sla-monitoring-sla-info">
                              SLA: {lab?.sla_dias} {lab?.sla_dias === 1 ? 'dia' : 'dias'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2" data-spec-id="sla-monitoring-badges">
                          <Badge variant="outline" className="border-red-600 text-red-600" data-spec-id="sla-monitoring-days-badge">
                            +{daysOverSLA} {daysOverSLA === 1 ? 'dia' : 'dias'}
                          </Badge>
                          {lab?.telefone_contato && (<Button variant="outline" size="sm" onClick={()=>{
            const phone = lab.telefone_contato?.replace(/\D/g, '');
            const message = `Olá! Sou da secretaria do Espaço Casal Monken. O exame da paciente ${getPatientName(exam.patient_id)} (frasco ${exam.numero_frasco}) foi recolhido em ${formatDateBR(exam.data_recolhido_lab!)} e já passou do prazo SLA de ${lab.sla_dias} ${lab.sla_dias === 1 ? 'dia' : 'dias'}. Poderiam nos informar a previsão de liberação?`;
            window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`);
        }} data-spec-id="sla-monitoring-contact-button">
                              <Phone className="w-4 h-4 mr-1" data-spec-id="sla-monitoring-contact-icon"/>
                              Contatar
                            </Button>)}
                          {onViewExam && (<Button variant="outline" size="sm" onClick={()=>onViewExam(exam.id)} data-spec-id="sla-monitoring-view-button">
                              <Eye className="w-4 h-4 mr-1" data-spec-id="sla-monitoring-view-icon"/>
                              Ver
                            </Button>)}
                        </div>
                      </div>
                    </div>);
    })}
                
                {examsOverSLA.length > 5 && (<div className="text-center pt-2" data-spec-id="sla-monitoring-more">
                    <p className="text-sm text-gray-500" data-spec-id="sla-monitoring-more-text">
                      E mais {examsOverSLA.length - 5} exames fora do prazo
                    </p>
                  </div>)}
              </div>) : (<div className="text-center py-6 text-gray-500" data-spec-id="no-sla-issues">
                <FlaskConical className="w-8 h-8 mx-auto mb-2 text-gray-400" data-spec-id="no-sla-issues-icon"/>
                <p className="text-sm" data-spec-id="no-sla-issues-text">
                  Todos os exames estão dentro do prazo SLA dos laboratórios
                </p>
                <p className="text-xs mt-1" data-spec-id="no-sla-issues-help">
                  Exames que ultrapassarem o SLA aparecerão aqui para acompanhamento
                </p>
              </div>)}
          </CardContent>
        </Card>)}

      {}
      {(user?.perfil === 'Medico' || user?.perfil === 'Administrador' || user?.perfil === 'Superusuario') && (<Card className={`border-l-4 ${examsAwaitingOpinion.length > 0 ? 'border-l-yellow-500' : 'border-l-gray-300'}`} data-spec-id="awaiting-opinion-card">
          <CardHeader data-spec-id="awaiting-opinion-header">
            <CardTitle className="flex items-center space-x-2 text-lg" data-spec-id="awaiting-opinion-title">
              <Stethoscope className="w-5 h-5 text-yellow-600" data-spec-id="awaiting-opinion-icon"/>
              <span data-spec-id="awaiting-opinion-title-text">Exames Aguardando Parecer Médico</span>
              <Badge className="bg-yellow-100 text-yellow-800" data-spec-id="awaiting-opinion-count">
                {examsAwaitingOpinion.length}
              </Badge>
            </CardTitle>
            <p className="text-sm text-gray-600" data-spec-id="awaiting-opinion-description">
              Resultados liberados pelo laboratório aguardando avaliação e parecer médico
            </p>
          </CardHeader>
          <CardContent data-spec-id="awaiting-opinion-content">
            {examsAwaitingOpinion.length > 0 ? (<div className="space-y-3" data-spec-id="awaiting-opinion-list">
                {examsAwaitingOpinion.slice(0, 5).map((exam)=>(<div key={exam.id} className={`p-3 border rounded-lg ${isWaitingTooLong(exam) ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`} data-spec-id={`awaiting-opinion-item-${exam.id}`}>
                    <div className="flex items-center justify-between" data-spec-id="awaiting-opinion-item-content">
                      <div className="flex-1" data-spec-id="awaiting-opinion-patient-info">
                        <div className="flex items-center space-x-2" data-spec-id="awaiting-opinion-patient-header">
                          <h4 className="font-medium text-gray-900" data-spec-id="awaiting-opinion-patient-name">
                            {getPatientName(exam.patient_id)}
                          </h4>
                          {isWaitingTooLong(exam) && (<AlertTriangle className="w-4 h-4 text-red-600" data-spec-id="awaiting-opinion-urgent-icon"/>)}
                        </div>
                        <p className="text-sm text-gray-600" data-spec-id="awaiting-opinion-exam-info">
                          Frasco: {exam.numero_frasco} • {getLabName(exam.lab_id)}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1" data-spec-id="awaiting-opinion-dates">
                          <span data-spec-id="awaiting-opinion-collection-date">
                            Coleta: {formatDateBR(exam.data_coleta)}
                          </span>
                          <span className="font-medium text-yellow-600" data-spec-id="awaiting-opinion-release-date">
                            Liberado: {formatDateBR(exam.data_resultado_liberado!)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2" data-spec-id="awaiting-opinion-badges">
                        <Badge variant="outline" className={isWaitingTooLong(exam) ? 'border-red-600 text-red-600' : 'border-yellow-600 text-yellow-600'} data-spec-id="awaiting-opinion-days-badge">
                          {getDaysWaiting(exam)} {getDaysWaiting(exam) === 1 ? 'dia' : 'dias'}
                        </Badge>
                        {onViewExam && (<Button variant="outline" size="sm" onClick={()=>onViewExam(exam.id)} data-spec-id="awaiting-opinion-view-button">
                            <FileText className="w-4 h-4 mr-1" data-spec-id="awaiting-opinion-view-icon"/>
                            Avaliar
                          </Button>)}
                      </div>
                    </div>
                  </div>))}
                
                {examsAwaitingOpinion.length > 5 && (<div className="text-center pt-2" data-spec-id="awaiting-opinion-more">
                    <p className="text-sm text-gray-500" data-spec-id="awaiting-opinion-more-text">
                      E mais {examsAwaitingOpinion.length - 5} exames aguardando parecer
                    </p>
                  </div>)}
              </div>) : (<div className="text-center py-6 text-gray-500" data-spec-id="no-awaiting-opinion">
                <Stethoscope className="w-8 h-8 mx-auto mb-2 text-gray-400" data-spec-id="no-awaiting-opinion-icon"/>
                <p className="text-sm" data-spec-id="no-awaiting-opinion-text">
                  Nenhum exame aguardando parecer médico no momento
                </p>
                <p className="text-xs mt-1" data-spec-id="no-awaiting-opinion-help">
                  Os exames aparecerão aqui após os resultados serem liberados pelo laboratório
                </p>
              </div>)}
          </CardContent>
        </Card>)}

      {}
      <Card data-spec-id="filters-card">
        <CardHeader data-spec-id="CvppW9ahhZDaxQAL">
          <CardTitle className="text-lg" data-spec-id="filters-title">Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent data-spec-id="ebdXAjyoZ5qnVUXX">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4" data-spec-id="filters-grid">
            <div className="relative" data-spec-id="search-container">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" data-spec-id="ILiAPUm0M6J0NGA0"/>
              <Input placeholder="Nome ou telefone..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="pl-10" data-spec-id="search-input"/>
            </div>

            <Select value={filterMedico} onValueChange={setFilterMedico} data-spec-id="medico-filter">
              <SelectTrigger data-spec-id="AH1oOGbR1kvk1oaI">
                <SelectValue placeholder="Filtrar por médico" data-spec-id="Kbula123ZImXgeDF"/>
              </SelectTrigger>
              <SelectContent data-spec-id="lquJNrUixNEr4IP6">
                <SelectItem value="todos" data-spec-id="0RQdtTzw4LUPqo7h">Todos os médicos</SelectItem>
                {users.filter((u)=>u.perfil === 'Medico').map((medico)=>(<SelectItem key={medico.id} value={medico.id} data-spec-id="0LuqEx0gBGiJgmGC">
                      {medico.nome}
                    </SelectItem>))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus} data-spec-id="status-filter">
              <SelectTrigger data-spec-id="aiMNw7C9jQ4ycrls">
                <SelectValue placeholder="Filtrar por status" data-spec-id="rvgeYeUJOMqBiAgq"/>
              </SelectTrigger>
              <SelectContent data-spec-id="X6fgjrE1JzfDhOEE">
                <SelectItem value="todos" data-spec-id="yn3UEw0kkm4LtFKv">Todos os status</SelectItem>
                {statusCounts.map(({ status })=>(<SelectItem key={status} value={status} data-spec-id="MLe3n4k7FKep78Of">
                    {status}
                  </SelectItem>))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value)=>setSortBy(value as any)} data-spec-id="sort-filter">
              <SelectTrigger data-spec-id="sort-trigger">
                <ArrowUpDown className="w-4 h-4 mr-2" data-spec-id="x2vGiguvUdhHEZ0Q"/>
                <SelectValue placeholder="Ordenar por" data-spec-id="NFenngI0qus5KecW"/>
              </SelectTrigger>
              <SelectContent data-spec-id="sort-content">
                <SelectItem value="name-asc" data-spec-id="sort-name-asc">Paciente A-Z</SelectItem>
                <SelectItem value="name-desc" data-spec-id="sort-name-desc">Paciente Z-A</SelectItem>
                <SelectItem value="date-desc" data-spec-id="sort-date-desc">Modificação (recente)</SelectItem>
                <SelectItem value="collection-desc" data-spec-id="sort-collection-desc">Coleta (recente)</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={()=>{
        setSearchTerm('');
        setFilterMedico('todos');
        setFilterStatus('todos');
        setSortBy('date-desc');
    }} data-spec-id="clear-filters">
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {}
      <Card data-spec-id="exams-list-card">
        <CardHeader data-spec-id="shhdoNyRZFW8XUmj">
          <CardTitle className="text-lg" data-spec-id="exams-list-title">
            Exames Recentes ({filteredAndSortedExams.length})
          </CardTitle>
        </CardHeader>
        <CardContent data-spec-id="kao1Hzb8dzoqvcwa">
          <div className="space-y-3" data-spec-id="exams-list">
            {filteredAndSortedExams.length === 0 ? (<div className="text-center py-8 text-gray-500" data-spec-id="no-exams">
                Nenhum exame encontrado com os filtros aplicados.
              </div>) : (filteredAndSortedExams.map((exam)=>(<div key={exam.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors" data-spec-id={`exam-item-${exam.id}`}>
                  <div className="flex-1" data-spec-id="exam-info">
                    <div className="flex items-center space-x-4" data-spec-id="29b1idyHf5Nf9H6e">
                      <div data-spec-id="SWCicZ6xqDEQxNlU">
                        <h4 className="font-medium text-gray-900" data-spec-id="patient-name">
                          {getPatientName(exam.patient_id)}
                        </h4>
                        <p className="text-sm text-gray-600" data-spec-id="exam-details">
                          Frasco: {exam.numero_frasco} • {getMedicoName(exam.medico_id)} • {getLabName(exam.lab_id)}
                        </p>
                        <p className="text-xs text-gray-500" data-spec-id="exam-date">
                          Coleta: {formatDateBR(exam.data_coleta)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2" data-spec-id="exam-status">
                    <Badge className={getStatusColor(exam.status)} data-spec-id="nbRfVCFSDstvYv9Y">
                      {exam.status}
                    </Badge>
                    {onViewExam && (<Button variant="outline" size="sm" onClick={()=>onViewExam(exam.id)} data-spec-id="view-exam-button">
                        <Eye className="w-4 h-4 mr-1" data-spec-id="QyD36pLFcF2YKror"/>
                        Ver
                      </Button>)}
                  </div>
                </div>)))}
          </div>
        </CardContent>
      </Card>
    </div>);
};
export default Dashboard;
