import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Exam, User, Patient, Lab, ExamStatus, CitologiaInterpretation, DnaHpvResult, BiopsiaInterpretation, ReturnType, ContactMethod } from '@/types/database';
import { Calendar, ChevronRight, Clock, User as UserIcon, Stethoscope, FlaskConical, FileText, MessageSquare, ArrowLeft, History, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatDateBR, formatDateTimeBR, calculateNextConsultationDate, calculateNextConsultationDateForDB } from '@/lib/dateUtils';
interface ExamDetailsProps {
    examId: string;
    onBack: () => void;
    onExamUpdated?: () => void;
}
const ExamDetails: React.FC<ExamDetailsProps> = ({ examId, onBack, onExamUpdated })=>{
    const { user } = useAuth();
    const [exam, setExam] = useState<Exam | null>(null);
    const [patient, setPatient] = useState<Patient | null>(null);
    const [medico, setMedico] = useState<User | null>(null);
    const [lab, setLab] = useState<Lab | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [savingParecer, setSavingParecer] = useState(false);
    const [showAdvanceConfirmDialog, setShowAdvanceConfirmDialog] = useState(false);
    const [showEditParecerDialog, setShowEditParecerDialog] = useState(false);
    const [editJustificativa, setEditJustificativa] = useState('');
    const [secretariaName, setSecretariaName] = useState('');
    const [justificativa, setJustificativa] = useState('');
    const [showJustificativa, setShowJustificativa] = useState(false);
    const [observacaoEtapa, setObservacaoEtapa] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [interpretacao, setInterpretacao] = useState<CitologiaInterpretation>('Normal');
    const [dnaHpvResultado, setDnaHpvResultado] = useState<DnaHpvResult>('Nao_realizada');
    const [interpretacaoBiopsia, setInterpretacaoBiopsia] = useState<BiopsiaInterpretation>('Nao_realizado');
    const [parecerObservacoes, setParecerObservacoes] = useState('');
    const [dataProximaConsulta, setDataProximaConsulta] = useState('');
    const [tipoRetorno, setTipoRetorno] = useState<ReturnType>('1a');
    const [meioContato, setMeioContato] = useState<ContactMethod>('WhatsApp');
    useEffect(()=>{
        loadExamDetails();
    }, [
        examId
    ]);
    const loadExamDetails = async ()=>{
        console.log('📋 Carregando detalhes do exame:', examId);
        setLoading(true);
        try {
            const { data: examData, error: examError } = await supabase.from('exames').select('*').eq('id', examId).single();
            if (examError) throw examError;
            const { data: patientData, error: patientError } = await supabase.from('patients').select('*').eq('id', examData.patient_id).single();
            if (patientError) throw patientError;
            const { data: medicoData, error: medicoError } = await supabase.from('users').select('*').eq('id', examData.medico_id).single();
            if (medicoError) throw medicoError;
            const { data: labData, error: labError } = await supabase.from('labs').select('*').eq('id', examData.lab_id).single();
            if (labError) throw labError;
            setExam(examData);
            setPatient(patientData);
            setMedico(medicoData);
            if (user?.perfil === 'Secretaria') {
                setSecretariaName(user.nome);
            }
            setLab(labData);
            if (examData.interpretacao_citologia) {
                setInterpretacao(examData.interpretacao_citologia);
            }
            if (examData.dna_hpv_resultado) {
                setDnaHpvResultado(examData.dna_hpv_resultado);
            }
            if (examData.interpretacao_biopsia) {
                setInterpretacaoBiopsia(examData.interpretacao_biopsia);
            }
            if (!examData.citologia_realizada && examData.interpretacao_citologia) {
                setInterpretacao('Normal');
            }
            if (!examData.dna_hpv_solicitado) {
                setDnaHpvResultado('Nao_realizada');
            }
            if (!examData.biopsia_solicitada) {
                setInterpretacaoBiopsia('Nao_realizado');
            }
            if (examData.parecer_observacoes) {
                setParecerObservacoes(examData.parecer_observacoes);
            }
            if (examData.data_proxima_consulta) {
                setDataProximaConsulta(examData.data_proxima_consulta);
            }
            if (examData.tipo_retorno) {
                setTipoRetorno(examData.tipo_retorno);
            }
            if (examData.meio_contato) {
                setMeioContato(examData.meio_contato);
            }
            console.log('✅ Detalhes carregados com sucesso');
            await loadAuditLogs(examId);
        } catch (error) {
            console.error('❌ Erro ao carregar detalhes:', error);
            toast.error('Erro ao carregar detalhes do exame');
        } finally{
            setLoading(false);
        }
    };
    const loadAuditLogs = async (examId: string)=>{
        try {
            const { data: logsData, error: logsError } = await supabase.from('audit_logs').select('*').eq('exam_id', examId).order('created_at', {
                ascending: true
            });
            if (logsError) throw logsError;
            const { data: usersData, error: usersError } = await supabase.from('users').select('id, nome').eq('ativo', true);
            if (usersError) throw usersError;
            setAuditLogs(logsData || []);
            setUsers(usersData || []);
            console.log('📜 Logs de auditoria carregados:', logsData?.length);
        } catch (error) {
            console.error('❌ Erro ao carregar logs de auditoria:', error);
        }
    };
    const getResponsibleUser = (status: ExamStatus): string =>{
        const log = auditLogs.find((log)=>log.action.includes(`→ ${status}`) || (status === 'Amostra Coletada' && log.action.includes('criado')));
        if (log) {
            const user = users.find((u)=>u.id === log.user_id);
            return user ? user.nome : 'Usuário não encontrado';
        }
        return 'Sistema';
    };
    const getStatusObservation = (status: ExamStatus): string =>{
        const log = auditLogs.find((log)=>log.action.includes(`→ ${status}`) || (status === 'Amostra Coletada' && log.action.includes('criado')));
        if (log) {
            const observationMatch = log.action.match(/- Observação: (.+)$/);
            if (observationMatch) {
                return observationMatch[1];
            }
            if (log.justificativa && !log.action.includes('Observação:')) {
                return log.justificativa;
            }
        }
        return '';
    };
    const saveParecer = async ()=>{
        if (!exam || !user) return;
        console.log('💾 Salvando parecer médico...');
        setSavingParecer(true);
        try {
            const updates: any = {
                interpretacao_citologia: exam.citologia_realizada ? interpretacao : null,
                dna_hpv_resultado: exam.dna_hpv_solicitado ? dnaHpvResultado : 'Nao_realizada',
                interpretacao_biopsia: exam.biopsia_solicitada ? interpretacaoBiopsia : 'Nao_realizado',
                parecer_observacoes: parecerObservacoes,
                tipo_retorno: tipoRetorno,
                data_proxima_consulta: calculateNextConsultationDateForDB(exam.data_coleta, tipoRetorno),
                updated_at: new Date().toISOString()
            };
            const { error: updateError } = await supabase.from('exames').update(updates).eq('id', exam.id);
            if (updateError) throw updateError;
            const { error: logError } = await supabase.from('audit_logs').insert({
                user_id: user.id,
                exam_id: exam.id,
                action: `Parecer médico atualizado: Citologia: ${exam.citologia_realizada ? interpretacao : 'Não realizada'} | DNA HPV: ${exam.dna_hpv_solicitado ? dnaHpvResultado : 'Não realizada'} | Biópsia: ${exam.biopsia_solicitada ? interpretacaoBiopsia : 'Não realizada'} | Retorno: ${tipoRetorno}`,
                old_values: {
                    interpretacao_citologia: exam.interpretacao_citologia,
                    dna_hpv_resultado: exam.dna_hpv_resultado,
                    interpretacao_biopsia: exam.interpretacao_biopsia,
                    parecer_observacoes: exam.parecer_observacoes,
                    tipo_retorno: exam.tipo_retorno,
                    data_proxima_consulta: exam.data_proxima_consulta
                },
                new_values: {
                    interpretacao_citologia: exam.citologia_realizada ? interpretacao : null,
                    dna_hpv_resultado: exam.dna_hpv_solicitado ? dnaHpvResultado : 'Nao_realizada',
                    interpretacao_biopsia: exam.biopsia_solicitada ? interpretacaoBiopsia : 'Nao_realizado',
                    parecer_observacoes: parecerObservacoes,
                    tipo_retorno: tipoRetorno,
                    data_proxima_consulta: calculateNextConsultationDateForDB(exam.data_coleta, tipoRetorno)
                },
                justificativa: 'Parecer médico salvo'
            });
            if (logError) throw logError;
            toast.success('Parecer médico salvo com sucesso!');
            await loadExamDetails();
            setShowAdvanceConfirmDialog(true);
        } catch (error) {
            console.error('❌ Erro ao salvar parecer:', error);
            toast.error('Erro ao salvar parecer médico');
        } finally{
            setSavingParecer(false);
        }
    };
    const advanceToParecerEmitido = async ()=>{
        if (!exam || !user) return;
        setUpdating(true);
        try {
            const updates: any = {
                status: 'Parecer Médico Emitido',
                data_parecer_emitido: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            const { error: updateError } = await supabase.from('exames').update(updates).eq('id', exam.id);
            if (updateError) throw updateError;
            const { error: logError } = await supabase.from('audit_logs').insert({
                user_id: user.id,
                exam_id: exam.id,
                action: `Status alterado: ${exam.status} → Parecer Médico Emitido`,
                old_values: {
                    status: exam.status
                },
                new_values: {
                    status: 'Parecer Médico Emitido'
                }
            });
            if (logError) throw logError;
            toast.success('Exame avançado para "Parecer Médico Emitido"!');
            await loadExamDetails();
            setShowAdvanceConfirmDialog(false);
        } catch (error) {
            console.error('❌ Erro ao avançar status:', error);
            toast.error('Erro ao avançar status do exame');
        } finally{
            setUpdating(false);
        }
    };
    const editParecer = async ()=>{
        if (!exam || !user || !editJustificativa.trim()) return;
        setSavingParecer(true);
        try {
            const updates: any = {
                interpretacao_citologia: exam.citologia_realizada ? interpretacao : null,
                dna_hpv_resultado: exam.dna_hpv_solicitado ? dnaHpvResultado : 'Nao_realizada',
                interpretacao_biopsia: exam.biopsia_solicitada ? interpretacaoBiopsia : 'Nao_realizado',
                parecer_observacoes: parecerObservacoes,
                tipo_retorno: tipoRetorno,
                data_proxima_consulta: calculateNextConsultationDateForDB(exam.data_coleta, tipoRetorno),
                updated_at: new Date().toISOString()
            };
            const { error: updateError } = await supabase.from('exames').update(updates).eq('id', exam.id);
            if (updateError) throw updateError;
            const { error: logError } = await supabase.from('audit_logs').insert({
                user_id: user.id,
                exam_id: exam.id,
                action: `Parecer médico editado: Citologia: ${exam.citologia_realizada ? interpretacao : 'Não realizada'} | DNA HPV: ${exam.dna_hpv_solicitado ? dnaHpvResultado : 'Não realizada'} | Biópsia: ${exam.biopsia_solicitada ? interpretacaoBiopsia : 'Não realizada'} | Retorno: ${tipoRetorno}`,
                old_values: {
                    interpretacao_citologia: exam.interpretacao_citologia,
                    dna_hpv_resultado: exam.dna_hpv_resultado,
                    interpretacao_biopsia: exam.interpretacao_biopsia,
                    parecer_observacoes: exam.parecer_observacoes,
                    tipo_retorno: exam.tipo_retorno,
                    data_proxima_consulta: exam.data_proxima_consulta
                },
                new_values: {
                    interpretacao_citologia: exam.citologia_realizada ? interpretacao : null,
                    dna_hpv_resultado: exam.dna_hpv_solicitado ? dnaHpvResultado : 'Nao_realizada',
                    interpretacao_biopsia: exam.biopsia_solicitada ? interpretacaoBiopsia : 'Nao_realizado',
                    parecer_observacoes: parecerObservacoes,
                    tipo_retorno: tipoRetorno,
                    data_proxima_consulta: calculateNextConsultationDateForDB(exam.data_coleta, tipoRetorno)
                },
                justificativa: editJustificativa
            });
            if (logError) throw logError;
            toast.success('Parecer médico editado com sucesso!');
            await loadExamDetails();
            setShowEditParecerDialog(false);
            setEditJustificativa('');
        } catch (error) {
            console.error('❌ Erro ao editar parecer:', error);
            toast.error('Erro ao editar parecer médico');
        } finally{
            setSavingParecer(false);
        }
    };
    const getApproximateNextConsultationDate = (): string =>{
        if (!exam || !tipoRetorno) return '';
        return calculateNextConsultationDate(exam.data_coleta, tipoRetorno);
    };
    const getStatusList = (): ExamStatus[] =>{
        const baseStatuses: ExamStatus[] = [
            'Amostra Coletada',
            'Recolhido pelo Laboratório',
            'Resultado Liberado',
            'Parecer Médico Emitido',
            'Paciente Comunicada'
        ];
        if (exam?.tipo_retorno && exam.tipo_retorno !== 'Imediato') {
            baseStatuses.push('Próxima Consulta Comunicada ao Comercial');
        }
        return baseStatuses;
    };
    const getCurrentStatusIndex = (): number =>{
        if (!exam) return 0;
        return getStatusList().indexOf(exam.status);
    };
    const getNextStatus = (): ExamStatus | null =>{
        const currentIndex = getCurrentStatusIndex();
        const statusList = getStatusList();
        return currentIndex < statusList.length - 1 ? statusList[currentIndex + 1] : null;
    };
    const canAdvanceStatus = (): boolean =>{
        if (!exam || !user) {
            console.log('🚫 canAdvanceStatus: exam ou user não encontrado', {
                exam: !!exam,
                user: !!user
            });
            return false;
        }
        const nextStatus = getNextStatus();
        if (!nextStatus) {
            console.log('🚫 canAdvanceStatus: nextStatus não encontrado');
            return false;
        }
        console.log('🔍 canAdvanceStatus DEBUG:', {
            userPerfil: user.perfil,
            nextStatus,
            examStatus: exam.status
        });
        let canAdvance = false;
        switch(nextStatus){
            case 'Recolhido pelo Laboratório':
                canAdvance = user.perfil === 'Secretaria' || user.perfil === 'Administrador' || user.perfil === 'Superusuario';
                break;
            case 'Resultado Liberado':
                canAdvance = user.perfil === 'Secretaria' || user.perfil === 'Administrador' || user.perfil === 'Superusuario';
                break;
            case 'Parecer Médico Emitido':
                canAdvance = (user.perfil === 'Medico' && exam.medico_id === user.id) || user.perfil === 'Administrador' || user.perfil === 'Superusuario';
                break;
            case 'Paciente Comunicada':
                canAdvance = user.perfil === 'Secretaria' || user.perfil === 'Administrador' || user.perfil === 'Superusuario';
                break;
            case 'Próxima Consulta Comunicada ao Comercial':
                canAdvance = user.perfil === 'Secretaria' || user.perfil === 'Administrador' || user.perfil === 'Superusuario';
                break;
            default:
                canAdvance = false;
        }
        console.log('✅ canAdvanceStatus resultado:', canAdvance);
        return canAdvance;
    };
    const canEditParecer = (): boolean =>{
        if (!exam || !user) return false;
        return (user.perfil === 'Medico' && exam.medico_id === user.id) || user.perfil === 'Administrador' || user.perfil === 'Superusuario';
    };
    const hasParecerBeenEdited = (): boolean =>{
        return auditLogs.some((log)=>log.action.includes('Parecer médico editado'));
    };
    const getParecerEditLogs = ()=>{
        return auditLogs.filter((log)=>log.action.includes('Parecer médico editado'));
    };
    const generateWhatsAppMessage = (): string =>{
        if (!patient || !medico) return '';
        const message = `Olá, ${patient.nome_completo}!
Sou ${secretariaName || 'da equipe'}, do Espaço Casal Monken.
Esta é uma mensagem automática para avisar que o seu exame foi avaliado pelo(a) Dr(a). ${medico.nome}.

Por sigilo e segurança, não enviamos o resultado completo por este canal.
Se desejar receber o arquivo em PDF, basta responder SIM e nossa equipe fará o envio manualmente.

Estamos à disposição com carinho.`;
        return encodeURIComponent(message);
    };
    const openWhatsApp = ()=>{
        if (!patient?.telefone) {
            toast.error('Paciente não possui telefone cadastrado');
            return;
        }
        const phoneNumber = patient.telefone.replace(/\D/g, '');
        const message = generateWhatsAppMessage();
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
        window.open(whatsappUrl, '_blank');
    };
    const needsJustification = (currentStatus: ExamStatus, targetStatus: ExamStatus): boolean =>{
        const statusList = getStatusList();
        const currentIndex = statusList.indexOf(currentStatus);
        const targetIndex = statusList.indexOf(targetStatus);
        return targetIndex < currentIndex;
    };
    const advanceStatus = async ()=>{
        if (!exam || !user) return;
        const nextStatus = getNextStatus();
        if (!nextStatus) return;
        console.log(`🔄 Avançando status de "${exam.status}" para "${nextStatus}"`);
        setUpdating(true);
        try {
            const updates: any = {
                status: nextStatus,
                updated_at: new Date().toISOString()
            };
            const now = new Date().toISOString();
            switch(nextStatus){
                case 'Recolhido pelo Laboratório':
                    updates.data_recolhido_lab = now;
                    break;
                case 'Resultado Liberado':
                    updates.data_resultado_liberado = now;
                    break;
                case 'Parecer Médico Emitido':
                    updates.data_parecer_emitido = now;
                    updates.interpretacao_citologia = interpretacao;
                    updates.dna_hpv_resultado = dnaHpvResultado;
                    updates.parecer_observacoes = parecerObservacoes;
                    updates.tipo_retorno = tipoRetorno;
                    break;
                case 'Paciente Comunicada':
                    updates.data_paciente_comunicada = now;
                    updates.meio_contato = meioContato;
                    if (exam.tipo_retorno === 'Imediato') {
                        updates.status = 'Próxima Consulta Comunicada ao Comercial';
                        updates.data_comercial_comunicado = now;
                    }
                    break;
                case 'Próxima Consulta Comunicada ao Comercial':
                    updates.data_comercial_comunicado = now;
                    break;
            }
            const { error: updateError } = await supabase.from('exames').update(updates).eq('id', exam.id);
            if (updateError) throw updateError;
            const { error: logError } = await supabase.from('audit_logs').insert({
                user_id: user.id,
                exam_id: exam.id,
                action: `Status alterado: ${exam.status} → ${nextStatus}${observacaoEtapa ? ` - Observação: ${observacaoEtapa}` : ''}`,
                old_values: {
                    status: exam.status
                },
                new_values: {
                    status: nextStatus
                },
                justificativa: justificativa || observacaoEtapa || null
            });
            if (logError) throw logError;
            if (nextStatus === 'Paciente Comunicada' && exam.tipo_retorno === 'Imediato') {
                toast.success('Exame concluído e movido para o histórico!');
            } else if (nextStatus === 'Próxima Consulta Comunicada ao Comercial') {
                toast.success('Exame concluído e movido para o histórico!');
            } else {
                toast.success(`Status avançado para: ${nextStatus}`);
            }
            await loadExamDetails();
            if (onExamUpdated) onExamUpdated();
            setJustificativa('');
            setShowJustificativa(false);
            setObservacaoEtapa('');
            setDialogOpen(false);
        } catch (error) {
            console.error('❌ Erro ao avançar status:', error);
            toast.error('Erro ao avançar status do exame');
        } finally{
            setUpdating(false);
        }
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
    if (loading) {
        return (<div className="flex items-center justify-center py-12" data-spec-id="exam-details-loading">
        <div className="text-center" data-spec-id="2wPDkbRnHIcglt2M">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" data-spec-id="Y9OJSIlVJWud8rvp"></div>
          <p className="mt-2 text-gray-600" data-spec-id="07NkKfSQ9CwC9n9e">Carregando detalhes do exame...</p>
        </div>
      </div>);
    }
    if (!exam || !patient || !medico || !lab) {
        return (<div className="text-center py-12" data-spec-id="exam-details-error">
        <p className="text-gray-600" data-spec-id="VWzF1Z8sCUSNr1DB">Exame não encontrado</p>
        <Button onClick={onBack} className="mt-4" data-spec-id="back-button-error">
          Voltar
        </Button>
      </div>);
    }
    const nextStatus = getNextStatus();
    const statusList = getStatusList();
    const currentIndex = getCurrentStatusIndex();
    return (<div className="space-y-6" data-spec-id="exam-details-container">
      {}
      <div className="flex items-center justify-between" data-spec-id="exam-details-header">
        <div className="flex items-center space-x-4" data-spec-id="QNJGot0pRUC3SRQ5">
          <Button variant="outline" onClick={onBack} data-spec-id="back-button">
            <ArrowLeft className="w-4 h-4 mr-2" data-spec-id="IjIVTbJxVuFnvBHP"/>
            Voltar
          </Button>
          <div data-spec-id="Cfc1j6qmdwpfijE0">
            <h2 className="text-2xl font-bold text-gray-900" data-spec-id="exam-title">
              Exame - {exam.numero_frasco}
            </h2>
            <p className="text-gray-600" data-spec-id="patient-name">
              {patient.nome_completo}
            </p>
          </div>
        </div>
        
        <Badge className={`${getStatusColor(exam.status)} text-sm px-3 py-1`} data-spec-id="current-status">
          {exam.status}
        </Badge>
      </div>

      {}
      <Card data-spec-id="exam-info-card">
        <CardHeader data-spec-id="nf5PXLGSK7O4Q7eK">
          <CardTitle className="flex items-center" data-spec-id="exam-info-title">
            <FileText className="w-5 h-5 mr-2" data-spec-id="EwyjeOhYqVBHJegD"/>
            Informações do Exame
          </CardTitle>
        </CardHeader>
        <CardContent data-spec-id="vmmJ9cghbSuyoNlB">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-spec-id="exam-info-grid">
            <div data-spec-id="patient-info">
              <label className="text-sm font-medium text-gray-500" data-spec-id="KYOskivo3g91bNhF">Paciente</label>
              <p className="text-gray-900" data-spec-id="QWMuICaGZgkRyzhj">{patient.nome_completo}</p>
              <p className="text-sm text-gray-600" data-spec-id="cWFec1GZr695Yy1W">
                Nascimento: {formatDateBR(patient.data_nascimento)}
              </p>
              {patient.telefone && (<p className="text-sm text-gray-600" data-spec-id="ZdI4B1fAYu24sJzP">Tel: {patient.telefone}</p>)}
            </div>
            
            <div data-spec-id="medico-info">
              <label className="text-sm font-medium text-gray-500" data-spec-id="NdCoVsowHfGzMQZ7">Médico Responsável</label>
              <p className="text-gray-900 flex items-center" data-spec-id="wr1O0ORgUWXvKZau">
                <Stethoscope className="w-4 h-4 mr-1" data-spec-id="Ogf2esxqcszR7bdB"/>
                {medico.nome}
              </p>
            </div>
            
            <div data-spec-id="lab-info">
              <label className="text-sm font-medium text-gray-500" data-spec-id="NECwbjXBnFxhdWP6">Laboratório</label>
              <p className="text-gray-900 flex items-center" data-spec-id="4QMkhk7hbeIdnCf8">
                <FlaskConical className="w-4 h-4 mr-1" data-spec-id="2qhmtKKEv4CL7yHS"/>
                {lab.nome}
              </p>
              {lab.sla_dias && (<p className="text-sm text-gray-600" data-spec-id="EdXoUyekIkb2gRvI">SLA: {lab.sla_dias} dias</p>)}
            </div>
            
            <div data-spec-id="collection-info">
              <label className="text-sm font-medium text-gray-500" data-spec-id="a88ksW92Ui2JRQGp">Data de Coleta</label>
              <p className="text-gray-900 flex items-center" data-spec-id="xdX40JpuGnyGNGhh">
                <Calendar className="w-4 h-4 mr-1" data-spec-id="UtJUIRWXr2riJ2Qz"/>
                {formatDateBR(exam.data_coleta)}
              </p>
            </div>
            
            <div data-spec-id="exam-types">
              <label className="text-sm font-medium text-gray-500" data-spec-id="LQB18uMNdRcmOtT5">Exames Solicitados</label>
              <div className="space-y-1" data-spec-id="O5SlIDwiuT1t3VCh">
                {exam.citologia_realizada && (<Badge variant="secondary" data-spec-id="8vWIsHJj6IKJfftB">Citologia</Badge>)}
                {exam.dna_hpv_solicitado && (<Badge variant="secondary" data-spec-id="wyKTFnqTP4bnmjUx">DNA HPV</Badge>)}
              </div>
            </div>
            
            {exam.observacoes_iniciais && (<div className="md:col-span-2 lg:col-span-3" data-spec-id="initial-observations">
                <label className="text-sm font-medium text-gray-500" data-spec-id="5ROmdtGs8gKRk9Qz">Observações Iniciais</label>
                <p className="text-gray-900" data-spec-id="fazVNuXntJFPVdHn">{exam.observacoes_iniciais}</p>
              </div>)}
          </div>
        </CardContent>
      </Card>

      {}
      <Card data-spec-id="status-timeline-card">
        <CardHeader data-spec-id="at2KAW1cRWdqLiKX">
          <CardTitle className="flex items-center" data-spec-id="timeline-title">
            <Clock className="w-5 h-5 mr-2" data-spec-id="3R3yewl9zqSwtyhD"/>
            Cronologia do Exame
          </CardTitle>
        </CardHeader>
        <CardContent data-spec-id="Ukag2Py9qgJoBIY8">
          <div className="space-y-4" data-spec-id="timeline-steps">
            {statusList.map((status, index)=>{
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const isNext = index === currentIndex + 1;
        let statusDate = null;
        switch(status){
            case 'Amostra Coletada':
                statusDate = exam.data_amostra_coletada;
                break;
            case 'Recolhido pelo Laboratório':
                statusDate = exam.data_recolhido_lab;
                break;
            case 'Resultado Liberado':
                statusDate = exam.data_resultado_liberado;
                break;
            case 'Parecer Médico Emitido':
                statusDate = exam.data_parecer_emitido;
                break;
            case 'Paciente Comunicada':
                statusDate = exam.data_paciente_comunicada;
                break;
            case 'Próxima Consulta Comunicada ao Comercial':
                statusDate = exam.data_comercial_comunicado;
                break;
        }
        return (<div key={status} className={`flex items-center space-x-4 p-3 rounded-lg ${isCurrent ? 'bg-blue-50 border border-blue-200' : isCompleted ? 'bg-green-50' : 'bg-gray-50'}`} data-spec-id={`timeline-step-${index}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${isCurrent ? 'bg-blue-600 text-white' : isCompleted ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`} data-spec-id="qSbfTN955QyYoQ0K">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1" data-spec-id="NMmiin9HxesDTbI5">
                    <p className={`font-medium ${isCurrent ? 'text-blue-900' : isCompleted ? 'text-green-900' : 'text-gray-600'}`} data-spec-id="dLp3XFtVTZAtb327">
                      {status}
                    </p>
                    {statusDate && (<div className="text-sm text-gray-500" data-spec-id="A2EiM4woB2uptHJQ">
                        <p className="font-medium" data-spec-id="HHZI6xZ2DEsEra12">
                          {formatDateTimeBR(statusDate)}
                        </p>
                        {isCompleted && (<>
                            <p className="text-blue-600" data-spec-id="vX6kimxLo4fluYcv">
                              Responsável: {getResponsibleUser(status)}
                            </p>
                            {getStatusObservation(status) && (<p className="text-gray-600 italic mt-1" data-spec-id="DQ7pWi6zoJcKp8m5">
                                "{getStatusObservation(status)}"
                              </p>)}
                            {}
                            {auditLogs.filter((log)=>log.action.includes(`→ ${status}`) || (status === 'Amostra Coletada' && log.action.includes('criado'))).map((log, logIndex)=>(<div key={logIndex} className="mt-2 p-2 bg-gray-100 rounded text-xs" data-spec-id={`timeline-audit-log-${logIndex}`}>
                                <div className="flex justify-between items-start" data-spec-id="timeline-log-header">
                                  <span className="font-medium text-blue-600" data-spec-id="timeline-log-user">
                                    {users.find((u)=>u.id === log.user_id)?.nome || 'Sistema'}
                                  </span>
                                  <span className="text-gray-500" data-spec-id="timeline-log-date">
                                    {formatDateTimeBR(log.created_at)}
                                  </span>
                                </div>
                                <p className="mt-1 text-gray-700" data-spec-id="timeline-log-action">{log.action}</p>
                                {log.justificativa && (<p className="text-gray-500 italic mt-1" data-spec-id="timeline-log-justification">
                                    Observação: "{log.justificativa}"
                                  </p>)}
                              </div>))}
                          </>)}
                      </div>)}
                  </div>
                  
                  {isCurrent && canAdvanceStatus() && (<div className="flex items-center space-x-2" data-spec-id="diBuiRpS0HUA2hnV">
                      <ChevronRight className="w-4 h-4 text-blue-600" data-spec-id="Yt9wGoDG6dEuosny"/>
                    </div>)}
                </div>);
    })}
          </div>
        </CardContent>
      </Card>

      {}
      {exam.status === 'Resultado Liberado' && canEditParecer() && (<Card data-spec-id="medical-opinion-card">
          <CardHeader data-spec-id="gg6TDBc4oPwlogdX">
            <CardTitle className="flex items-center" data-spec-id="medical-opinion-title">
              <Stethoscope className="w-5 h-5 mr-2" data-spec-id="9D60PMCKtIvyaoQh"/>
              Parecer Médico
            </CardTitle>
          </CardHeader>
          <CardContent data-spec-id="KaDYaUYFat0RztZL">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-spec-id="medical-opinion-form">
              <div data-spec-id="citologia-interpretation">
                <label className="text-sm font-medium text-gray-700" data-spec-id="6gwPs7o1kgOFnQUW">Interpretação da Citologia</label>
                <Select value={exam.citologia_realizada ? interpretacao : 'Normal'} onValueChange={(value)=>setInterpretacao(value as CitologiaInterpretation)} disabled={!exam.citologia_realizada} data-spec-id="cof0jZGuLsIG1lQ4">
                  <SelectTrigger data-spec-id="G1DPEQzuRfflE1od">
                    <SelectValue data-spec-id="CsadgK9jhEJFTo4F"/>
                  </SelectTrigger>
                  <SelectContent data-spec-id="yWAfE1uYJUHjAyo9">
                    <SelectItem value="Normal" data-spec-id="ZRk3hnp2L6oRNfd9">Normal</SelectItem>
                    <SelectItem value="Inconclusivo" data-spec-id="trUnTfbhGRM1oR2k">Inconclusivo</SelectItem>
                    <SelectItem value="ASC-US" data-spec-id="bgMnbeMo8fNhGnuI">ASC-US</SelectItem>
                    <SelectItem value="ASC-H" data-spec-id="NKjxoqPVE5WOg6gw">ASC-H</SelectItem>
                    <SelectItem value="LSIL" data-spec-id="rLpqGvd5fsl2TVKL">LSIL</SelectItem>
                    <SelectItem value="HSIL" data-spec-id="78rN0ijS7lFDhTWH">HSIL</SelectItem>
                    <SelectItem value="AGC" data-spec-id="7zKgJfqTbb5gEAUF">AGC</SelectItem>
                    <SelectItem value="Carcinoma" data-spec-id="RS3XUcOR9SLUt7vA">Carcinoma</SelectItem>
                  </SelectContent>
                </Select>
                {!exam.citologia_realizada && (<p className="text-xs text-gray-500 mt-1" data-spec-id="dqKL0ck6LafMuSGj">Citologia não foi realizada</p>)}
              </div>

              <div data-spec-id="dna-hpv-result">
                <label className="text-sm font-medium text-gray-700" data-spec-id="GrEQf2ZhjfmaRE9T">Resultado DNA HPV</label>
                <Select value={exam.dna_hpv_solicitado ? dnaHpvResultado : 'Nao_realizada'} onValueChange={(value)=>setDnaHpvResultado(value as DnaHpvResult)} disabled={!exam.dna_hpv_solicitado} data-spec-id="Yduu9LazjnMDY7MV">
                  <SelectTrigger data-spec-id="1iLbYTynHiWExAvK">
                    <SelectValue data-spec-id="tn9XE15hpqTXFoYb"/>
                  </SelectTrigger>
                  <SelectContent data-spec-id="lC1P9RMxsjR7D18d">
                    <SelectItem value="Nao_realizada" data-spec-id="baZzpewRHKPrmVCy">Não Realizada</SelectItem>
                    <SelectItem value="Negativa" data-spec-id="mQLqugSldWDYhZX2">Negativa</SelectItem>
                    <SelectItem value="Positiva" data-spec-id="1n6BdpVlpwhU4yup">Positiva</SelectItem>
                  </SelectContent>
                </Select>
                {!exam.dna_hpv_solicitado && (<p className="text-xs text-gray-500 mt-1" data-spec-id="z1on8Lgi93bFp0Zt">DNA HPV não foi solicitado</p>)}
              </div>

              <div data-spec-id="biopsia-interpretation">
                <label className="text-sm font-medium text-gray-700" data-spec-id="AmXO4hyCJ1KyZxZI">Interpretação da Biópsia</label>
                <Select value={exam.biopsia_solicitada ? interpretacaoBiopsia : 'Nao_realizado'} onValueChange={(value)=>setInterpretacaoBiopsia(value as BiopsiaInterpretation)} disabled={!exam.biopsia_solicitada} data-spec-id="biopsia-interpretation-select">
                  <SelectTrigger data-spec-id="biopsia-select-trigger">
                    <SelectValue data-spec-id="xmu7fIceffJYkVl0"/>
                  </SelectTrigger>
                  <SelectContent data-spec-id="biopsia-select-content">
                    <SelectItem value="Nao_realizado" data-spec-id="biopsia-nao-realizado">Não Realizado</SelectItem>
                    <SelectItem value="Normal" data-spec-id="biopsia-normal">Normal</SelectItem>
                    <SelectItem value="Alterado" data-spec-id="biopsia-alterado">Alterado</SelectItem>
                  </SelectContent>
                </Select>
                {!exam.biopsia_solicitada && (<p className="text-xs text-gray-500 mt-1" data-spec-id="JEmBHU4aJ4Yzz4g6">Biópsia não foi solicitada</p>)}
              </div>

              <div className="md:col-span-2" data-spec-id="parecer-observations">
                <label className="text-sm font-medium text-gray-700" data-spec-id="RfnyVA1k2wXdJItE">Observações do Parecer</label>
                <Textarea value={parecerObservacoes} onChange={(e)=>setParecerObservacoes(e.target.value)} placeholder="Digite as observações médicas..." rows={3} data-spec-id="3Ka4JEf7P7lO5jm6"/>
              </div>

              <div data-spec-id="return-type">
                <label className="text-sm font-medium text-gray-700" data-spec-id="rxeBCBUrnOSy924K">Prazo para Retorno</label>
                <Select value={tipoRetorno} onValueChange={(value)=>setTipoRetorno(value as ReturnType)} data-spec-id="8EeLeVAaPHxmIVVA">
                  <SelectTrigger data-spec-id="m35zeFdHmLWmGopN">
                    <SelectValue placeholder="Selecione o prazo" data-spec-id="hcJEoS1rAeiCEhDo"/>
                  </SelectTrigger>
                  <SelectContent data-spec-id="VjcCmeqKVihv0vmH">
                    <SelectItem value="Imediato" data-spec-id="u8tQeqiNrlp4Iwfu">Imediato</SelectItem>
                    <SelectItem value="6m" data-spec-id="dUqUc8o1yIdJAEVu">6 meses</SelectItem>
                    <SelectItem value="1a" data-spec-id="DYyG7xirVn29tANT">1 ano</SelectItem>
                    <SelectItem value="2a" data-spec-id="8dY4FSVDTqn9UO5M">2 anos</SelectItem>
                    <SelectItem value="Outro" data-spec-id="PV42tQfEdoJVe1Fk">Outro</SelectItem>
                  </SelectContent>
                </Select>
                {tipoRetorno && (<div className={`mt-2 p-2 rounded text-sm ${tipoRetorno === 'Imediato' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`} data-spec-id="consultation-date-info">
                    <strong data-spec-id="VEblKfUkVKgn0WsN">Para a Secretária:</strong><br data-spec-id="siPKBB64fOxDDA2L"/>
                    {getApproximateNextConsultationDate()}
                  </div>)}
              </div>

              <div className="md:col-span-2 flex justify-end" data-spec-id="parecer-actions">
                <Button onClick={saveParecer} disabled={savingParecer} className="bg-green-600 hover:bg-green-700" data-spec-id="save-parecer-button">
                  {savingParecer ? 'Salvando...' : 'Salvar Parecer'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>)}

      {}
      {(exam.status === 'Próxima Consulta Comunicada ao Comercial' || exam.status === 'Parecer Médico Emitido') && (<Card data-spec-id="parecer-medical-view-card">
          <CardHeader data-spec-id="parecer-medical-header">
            <CardTitle className="flex items-center justify-between" data-spec-id="parecer-medical-title">
              <div className="flex items-center" data-spec-id="parecer-title-content">
                <Stethoscope className="w-5 h-5 mr-2" data-spec-id="parecer-icon"/>
                <div className="flex items-center" data-spec-id="parecer-title-with-edit-indicator">
                  {exam.status === 'Próxima Consulta Comunicada ao Comercial' ? 'Parecer Médico Final' : 'Parecer Médico Emitido'}
                  {hasParecerBeenEdited() && (<Badge className="ml-2 bg-orange-100 text-orange-800" data-spec-id="parecer-edited-badge">
                      Editado
                    </Badge>)}
                </div>
              </div>
              {exam.status === 'Parecer Médico Emitido' && canEditParecer() && (<Button variant="outline" size="sm" onClick={()=>setShowEditParecerDialog(true)} data-spec-id="edit-parecer-button">
                  Editar Parecer
                </Button>)}
            </CardTitle>
            {hasParecerBeenEdited() && (<div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg" data-spec-id="parecer-edit-alert">
                <h4 className="text-sm font-medium text-orange-800 mb-2" data-spec-id="edit-alert-title">
                  ATENÇÃO: Este parecer foi editado após a emissão
                </h4>
                <div className="space-y-2" data-spec-id="edit-logs-list">
                  {getParecerEditLogs().map((log, index)=>(<div key={index} className="text-sm text-orange-700 bg-orange-100 p-2 rounded" data-spec-id={`edit-log-${index}`}>
                      <div className="flex justify-between items-start" data-spec-id="edit-log-header">
                        <span className="font-medium" data-spec-id="edit-log-user">
                          {users.find((u)=>u.id === log.user_id)?.nome || 'Usuário não encontrado'}
                        </span>
                        <span className="text-xs" data-spec-id="edit-log-date">
                          {formatDateTimeBR(log.created_at)}
                        </span>
                      </div>
                      <p className="text-xs mt-1" data-spec-id="edit-log-action">{log.action}</p>
                      {log.justificativa && (<p className="text-xs italic mt-1 border-l-2 border-orange-300 pl-2" data-spec-id="edit-log-justification">
                          Justificativa: "{log.justificativa}"
                        </p>)}
                    </div>))}
                </div>
              </div>)}
          </CardHeader>
          <CardContent data-spec-id="parecer-medical-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-spec-id="parecer-info-grid">
              {}
              {(user?.perfil === 'Medico' || user?.perfil === 'Administrador' || user?.perfil === 'Superusuario') ? (<>
                  <div data-spec-id="parecer-interpretacao">
                    <label className="text-sm font-medium text-gray-700" data-spec-id="interpretacao-label">Interpretação da Citologia</label>
                    <p className="text-gray-900 font-medium" data-spec-id="interpretacao-value">{exam.interpretacao_citologia || 'Não informado'}</p>
                  </div>
                  
                  <div data-spec-id="parecer-dna-hpv">
                    <label className="text-sm font-medium text-gray-700" data-spec-id="dna-hpv-label">Resultado DNA HPV</label>
                    <p className="text-gray-900 font-medium" data-spec-id="dna-hpv-value">
                      {exam.dna_hpv_resultado === 'Nao_realizada' ? 'Não Realizada' : exam.dna_hpv_resultado}
                    </p>
                  </div>
                  
                  <div data-spec-id="parecer-biopsia">
                    <label className="text-sm font-medium text-gray-700" data-spec-id="wxfWdRnuaEvFp15X">Resultado da Biópsia</label>
                    <p className="text-gray-900 font-medium" data-spec-id="ySxUwG2nYfwy9k7F">
                      {exam.interpretacao_biopsia === 'Nao_realizado' ? 'Não Realizada' : exam.interpretacao_biopsia}
                    </p>
                  </div>
                </>) : (<>
                  <div data-spec-id="parecer-exams-performed">
                    <label className="text-sm font-medium text-gray-700" data-spec-id="exams-performed-label">Exames Realizados</label>
                    <div className="flex flex-wrap gap-2 mt-1" data-spec-id="exams-performed-badges">
                      {exam.citologia_realizada && (<Badge className="bg-blue-100 text-blue-800" data-spec-id="citologia-performed-details-badge">
                          Citologia Realizada
                        </Badge>)}
                      {exam.dna_hpv_solicitado && (<Badge className="bg-purple-100 text-purple-800" data-spec-id="dna-hpv-performed-details-badge">
                          DNA HPV Realizado
                        </Badge>)}
                      {exam.biopsia_solicitada && (<Badge className="bg-orange-100 text-orange-800" data-spec-id="biopsy-performed-details-badge">
                          Biópsia Realizada
                        </Badge>)}
                    </div>
                  </div>
                  
                  <div data-spec-id="parecer-status-info">
                    <label className="text-sm font-medium text-gray-700" data-spec-id="status-info-label">Status do Parecer</label>
                    <div className="mt-1" data-spec-id="status-info-content">
                      <Badge className="bg-green-100 text-green-800" data-spec-id="medical-opinion-status-badge">
                        Parecer Médico Emitido
                      </Badge>
                    </div>
                  </div>
                </>)}
              
              <div data-spec-id="parecer-retorno">
                <label className="text-sm font-medium text-gray-700" data-spec-id="retorno-label">Prazo para Retorno</label>
                <p className="text-gray-900 font-medium" data-spec-id="retorno-value">{exam.tipo_retorno || 'Não informado'}</p>
                {exam.tipo_retorno && (<p className={`text-sm mt-1 ${exam.tipo_retorno === 'Imediato' ? 'text-red-600 font-semibold' : 'text-blue-600'}`} data-spec-id="consultation-info">
                    {getApproximateNextConsultationDate()}
                  </p>)}
              </div>

              {exam.status === 'Próxima Consulta Comunicada ao Comercial' && exam.meio_contato && (<div data-spec-id="communication-method">
                  <label className="text-sm font-medium text-gray-700" data-spec-id="communication-method-label">Meio de Comunicação</label>
                  <p className="text-gray-900 font-medium" data-spec-id="communication-method-value">{exam.meio_contato}</p>
                  {exam.data_paciente_comunicada && (<p className="text-sm text-gray-600" data-spec-id="communication-date">
                      Comunicada em: {formatDateTimeBR(exam.data_paciente_comunicada)}
                    </p>)}
                </div>)}
              
              {exam.parecer_observacoes && (user?.perfil === 'Medico' || user?.perfil === 'Administrador' || user?.perfil === 'Superusuario') && (<div className="md:col-span-2" data-spec-id="parecer-observacoes-view">
                  <label className="text-sm font-medium text-gray-700" data-spec-id="observacoes-label">Observações do Parecer</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg mt-1" data-spec-id="observacoes-value">
                    {exam.parecer_observacoes}
                  </p>
                </div>)}

              {}
              {exam.data_proxima_consulta && exam.tipo_retorno && exam.tipo_retorno !== 'Imediato' && (<div className="md:col-span-2" data-spec-id="next-consultation-info">
                  <label className="text-sm font-medium text-gray-700" data-spec-id="next-consultation-label">
                    Próxima Consulta Prevista
                  </label>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-1" data-spec-id="next-consultation-content">
                    <div className="flex items-center space-x-2" data-spec-id="next-consultation-header">
                      <Calendar className="w-5 h-5 text-blue-600" data-spec-id="next-consultation-icon"/>
                      <span className="font-semibold text-blue-900" data-spec-id="next-consultation-date">
                        {formatDateBR(exam.data_proxima_consulta)}
                      </span>
                      <span className="text-blue-700" data-spec-id="next-consultation-type">
                        ({exam.tipo_retorno === '6m' ? '6 meses' : exam.tipo_retorno === '1a' ? '1 ano' : exam.tipo_retorno === '2a' ? '2 anos' : exam.tipo_retorno})
                      </span>
                    </div>
                    <p className="text-sm text-blue-700 mt-2" data-spec-id="next-consultation-note">
                      Data calculada automaticamente com base na coleta ({formatDateBR(exam.data_coleta)}) e prazo de retorno definido pelo médico.
                    </p>
                    {(user?.perfil === 'Secretaria' || user?.perfil === 'Administrador' || user?.perfil === 'Superusuario') && (<p className="text-sm text-orange-700 font-medium mt-2 bg-orange-100 px-2 py-1 rounded" data-spec-id="secretary-reminder">
                        📝 Lembre-se de comunicar esta data à paciente e ao comercial.
                      </p>)}
                  </div>
                </div>)}
            </div>
          </CardContent>
        </Card>)}



      {}
      {(user?.perfil === 'Secretaria' || user?.perfil === 'Administrador' || user?.perfil === 'Superusuario') && exam.data_proxima_consulta && exam.tipo_retorno && exam.tipo_retorno !== 'Imediato' && (exam.status === 'Parecer Médico Emitido' || exam.status === 'Paciente Comunicada' || exam.status === 'Próxima Consulta Comunicada ao Comercial') && (<Card data-spec-id="secretary-consultation-schedule-card">
          <CardHeader data-spec-id="secretary-consultation-header">
            <CardTitle className="flex items-center" data-spec-id="secretary-consultation-title">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" data-spec-id="secretary-consultation-icon"/>
              Próxima Consulta - Agenda da Secretária
            </CardTitle>
          </CardHeader>
          <CardContent data-spec-id="secretary-consultation-content">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4" data-spec-id="secretary-consultation-info">
              <div className="flex items-center space-x-3 mb-3" data-spec-id="secretary-consultation-date-info">
                <div className="flex items-center space-x-2" data-spec-id="secretary-next-consultation-header">
                  <Calendar className="w-5 h-5 text-blue-600" data-spec-id="secretary-next-consultation-icon"/>
                  <span className="font-semibold text-blue-900 text-lg" data-spec-id="secretary-next-consultation-date">
                    {formatDateBR(exam.data_proxima_consulta)}
                  </span>
                  <Badge className="bg-blue-100 text-blue-800" data-spec-id="secretary-consultation-period-badge">
                    {exam.tipo_retorno === '6m' ? '6 meses' : exam.tipo_retorno === '1a' ? '1 ano' : exam.tipo_retorno === '2a' ? '2 anos' : exam.tipo_retorno}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-blue-700" data-spec-id="secretary-consultation-details">
                <p data-spec-id="secretary-consultation-calculation-note">
                  <strong data-spec-id="VFrBS18Y9Quuln9V">Paciente:</strong> {patient?.nome_completo}
                </p>
                <p data-spec-id="secretary-consultation-calculation-info">
                  <strong data-spec-id="rSWELRggaujxNkUe">Coleta realizada em:</strong> {formatDateBR(exam.data_coleta)}
                </p>
                <p data-spec-id="secretary-consultation-medical-recommendation">
                  <strong data-spec-id="JVbsLWNWCQJ4j0oz">Prazo definido pelo médico:</strong> {exam.tipo_retorno === '6m' ? '6 meses' : exam.tipo_retorno === '1a' ? '1 ano' : exam.tipo_retorno === '2a' ? '2 anos' : exam.tipo_retorno}
                </p>
              </div>
              
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg" data-spec-id="secretary-action-reminder">
                <div className="flex items-start space-x-2" data-spec-id="secretary-reminder-content">
                  <div className="text-orange-600 mt-0.5" data-spec-id="secretary-reminder-icon">📝</div>
                  <div data-spec-id="secretary-reminder-text">
                    <p className="text-sm font-medium text-orange-800" data-spec-id="secretary-reminder-title">
                      Ações Necessárias:
                    </p>
                    <ul className="text-sm text-orange-700 mt-1 space-y-1" data-spec-id="secretary-reminder-list">
                      <li data-spec-id="secretary-reminder-patient">• Comunicar esta data à paciente</li>
                      <li data-spec-id="secretary-reminder-commercial">• Informar ao setor comercial para agendamento</li>
                      <li data-spec-id="secretary-reminder-follow-up">• Fazer follow-up próximo à data</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>)}

      {}
      {exam.status === 'Parecer Médico Emitido' && (<Card data-spec-id="patient-communication-card">
          <CardHeader data-spec-id="fnYbxn8CFl3y3mxO">
            <CardTitle className="flex items-center" data-spec-id="communication-title">
              <MessageSquare className="w-5 h-5 mr-2" data-spec-id="AghaExkOdyE8eeTx"/>
              Comunicação com Paciente
            </CardTitle>
          </CardHeader>
          <CardContent data-spec-id="BrTYLm3iGb7PE21d">
            <div className="space-y-4" data-spec-id="communication-form">
              <div data-spec-id="contact-method">
                <label className="text-sm font-medium text-gray-700" data-spec-id="rJWJRbR2aHUyF9Sr">Meio de Contato</label>
                <Select value={meioContato} onValueChange={(value)=>setMeioContato(value as ContactMethod)} data-spec-id="laUE2CS90Uedbnn2">
                  <SelectTrigger data-spec-id="Rb0Xisi1Eg9DFjxU">
                    <SelectValue data-spec-id="0FHRXC7K1HAIOQot"/>
                  </SelectTrigger>
                  <SelectContent data-spec-id="hMLhJvsIyz6LbpEX">
                    <SelectItem value="WhatsApp" data-spec-id="dBzNp7bQ2FjSdIuv">WhatsApp</SelectItem>
                    <SelectItem value="Telefone" data-spec-id="wcQJIhkhkK1ktm8Y">Telefone</SelectItem>
                    <SelectItem value="Email" data-spec-id="GsIgOBnxrwjhkAu8">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {}
              {meioContato === 'WhatsApp' && (<div className="space-y-3" data-spec-id="whatsapp-section">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4" data-spec-id="whatsapp-preview">
                    <h4 className="text-sm font-medium text-green-800 mb-2" data-spec-id="whatsapp-preview-title">
                      Prévia da Mensagem WhatsApp
                    </h4>
                    <div className="text-sm text-green-700 bg-white p-3 rounded border" data-spec-id="whatsapp-message-preview">
                      <p data-spec-id="zgICotfg7MBZD7rZ">Olá, <strong data-spec-id="KeU6cvElPnMhbK2T">{patient?.nome_completo}</strong>!</p>
                      <p data-spec-id="3TLWF57bQOAQIN3g">Sou <strong data-spec-id="nUXzSdlYGfGea4Ax">{secretariaName || 'da equipe'}</strong>, do Espaço Casal Monken.</p>
                      <p data-spec-id="QOmUfS3hvrgR5u4o">Esta é uma mensagem automática para avisar que o seu exame foi avaliado pelo(a) Dr(a). <strong data-spec-id="soXIG5LwfFEKoTQH">{medico?.nome}</strong>.</p>
                      <br data-spec-id="OCyg1artkA26OgIt"/>
                      <p data-spec-id="IPKvE8VqNPlGwhat">Por sigilo e segurança, não enviamos o resultado completo por este canal.</p>
                      <p data-spec-id="56t8g0XQwLnQeYhI">Se desejar receber o arquivo em PDF, basta responder SIM e nossa equipe fará o envio manualmente.</p>
                      <br data-spec-id="22mHrLxGhPSek1Z0"/>
                      <p data-spec-id="5pdZ5cAd9EgAHFq7">Estamos à disposição com carinho.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between" data-spec-id="whatsapp-actions">
                    <div className="flex items-center space-x-2" data-spec-id="whatsapp-info">
                      <MessageCircle className="w-4 h-4 text-green-600" data-spec-id="whatsapp-icon"/>
                      <span className="text-sm text-gray-600" data-spec-id="whatsapp-phone">
                        {patient?.telefone ? `Tel: ${patient.telefone}` : 'Paciente sem telefone cadastrado'}
                      </span>
                    </div>
                    
                    <Button onClick={openWhatsApp} disabled={!patient?.telefone} className="bg-green-600 hover:bg-green-700 text-white" data-spec-id="whatsapp-send-button">
                      <MessageCircle className="w-4 h-4 mr-2" data-spec-id="whatsapp-button-icon"/>
                      Enviar via WhatsApp
                    </Button>
                  </div>
                </div>)}
            </div>
          </CardContent>
        </Card>)}

      {}
      {canAdvanceStatus() && nextStatus && (<Card data-spec-id="actions-card">
          <CardContent className="pt-6" data-spec-id="mZTOL01ZChZOt7WJ">
            <div className="flex items-center justify-between" data-spec-id="actions-container">
              <div data-spec-id="ZnkfRJlCPIAr943W">
                <h3 className="font-medium text-gray-900" data-spec-id="next-action-title">
                  Próxima Ação
                </h3>
                <p className="text-sm text-gray-600" data-spec-id="next-action-description">
                  Avançar para: {nextStatus}
                </p>
              </div>
              
              <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen} data-spec-id="06lK2o8nlsbaWHVc">
                <AlertDialogTrigger asChild data-spec-id="f6Rrnyd2jpG6BEg4">
                  <Button disabled={updating} className="bg-blue-600 hover:bg-blue-700" data-spec-id="advance-status-button" onClick={()=>{
        console.log('🔵 Botão clicado! Abrindo dialog...');
        setDialogOpen(true);
    }}>
                    {updating ? 'Atualizando...' : `Avançar para ${nextStatus}`}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent data-spec-id="advance-confirmation-dialog">
                  <AlertDialogHeader data-spec-id="DRb60q8n5A1NYwV7">
                    <AlertDialogTitle data-spec-id="luqfzpavU5G92TDj">Confirmar Avanço de Status</AlertDialogTitle>
                    <AlertDialogDescription data-spec-id="TZvTcSyNVx0HWaUw">
                      Tem certeza que deseja avançar o status do exame para "{nextStatus}"?
                      {((nextStatus === 'Paciente Comunicada' && exam?.tipo_retorno === 'Imediato') || nextStatus === 'Próxima Consulta Comunicada ao Comercial') && (<span className="text-orange-600 font-medium" data-spec-id="r3aa8pIAGf7Ybw4d">
                          <br data-spec-id="zveHOCB33XFwdbFT"/>ATENÇÃO: Este exame será movido para o histórico após esta ação.
                        </span>)}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  
                  <div className="space-y-4" data-spec-id="lhJRZIHmva8agA5c">
                    <div className="space-y-2" data-spec-id="observacao-etapa-field">
                      <label className="text-sm font-medium text-gray-700" data-spec-id="iPkGCuVu4KKRAFaX">
                        Observação da Etapa (opcional)
                      </label>
                      <Textarea value={observacaoEtapa} onChange={(e)=>setObservacaoEtapa(e.target.value)} placeholder="Digite alguma observação sobre esta etapa..." rows={3} data-spec-id="pg5pUlYc9WwykB0l"/>
                    </div>
                    
                    {needsJustification(exam.status, nextStatus) && (<div className="space-y-2" data-spec-id="fFEgtAjzdT3fdckj">
                        <label className="text-sm font-medium text-gray-700" data-spec-id="VIVcpDb14Y7ziY5i">
                          Justificativa (obrigatória para reversão)
                        </label>
                        <Textarea value={justificativa} onChange={(e)=>setJustificativa(e.target.value)} placeholder="Digite a justificativa para esta alteração..." rows={3} data-spec-id="pzwcQIqyqa2cru6C"/>
                      </div>)}
                  </div>
                  
                  <AlertDialogFooter data-spec-id="LCQKsHRhh9T5FBj9">
                    <AlertDialogCancel data-spec-id="lOm3OSzFk2mG2jXm">Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={()=>{
        console.log('🟢 Botão Confirmar clicado!');
        advanceStatus();
    }} disabled={needsJustification(exam.status, nextStatus) && !justificativa.trim()} data-spec-id="tcyXMJ7XnN4DgcTc">
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>)}

      {}
      <Dialog open={showAdvanceConfirmDialog} onOpenChange={setShowAdvanceConfirmDialog} data-spec-id="J4TbKdbbiZyHrSyP">
        <DialogContent data-spec-id="advance-after-save-dialog">
          <DialogHeader data-spec-id="advance-after-save-header">
            <DialogTitle data-spec-id="advance-dialog-title">Parecer Médico Salvo</DialogTitle>
            <DialogDescription data-spec-id="advance-dialog-description">
              Seu parecer médico foi salvo com sucesso! Deseja também avançar o exame para a etapa "Parecer Médico Emitido"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter data-spec-id="advance-dialog-footer">
            <Button variant="outline" onClick={()=>setShowAdvanceConfirmDialog(false)} data-spec-id="advance-dialog-cancel">
              Não, apenas salvar
            </Button>
            <Button onClick={advanceToParecerEmitido} disabled={updating} className="bg-blue-600 hover:bg-blue-700" data-spec-id="advance-dialog-confirm">
              {updating ? 'Avançando...' : 'Sim, avançar etapa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={showEditParecerDialog} onOpenChange={setShowEditParecerDialog} data-spec-id="VCP3oyrJXVXmMvDT">
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-spec-id="edit-parecer-dialog">
          <DialogHeader data-spec-id="edit-parecer-dialog-header">
            <DialogTitle data-spec-id="edit-parecer-dialog-title">Editar Parecer Médico</DialogTitle>
            <DialogDescription data-spec-id="edit-parecer-dialog-description">
              Para editar um parecer já emitido, é necessário informar uma justificativa. Todas as alterações serão registradas no log de auditoria.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4" data-spec-id="edit-parecer-form">
            <div className="space-y-2" data-spec-id="edit-justificativa-field">
              <label className="text-sm font-medium text-gray-700" data-spec-id="edit-justificativa-label">
                Justificativa para Edição (obrigatório)
              </label>
              <Textarea value={editJustificativa} onChange={(e)=>setEditJustificativa(e.target.value)} placeholder="Digite a justificativa para editar este parecer..." rows={3} data-spec-id="edit-justificativa-input"/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-spec-id="edit-parecer-fields">
              <div data-spec-id="edit-citologia-interpretation">
                <label className="text-sm font-medium text-gray-700" data-spec-id="edit-citologia-label">Interpretação da Citologia</label>
                <Select value={interpretacao} onValueChange={(value)=>setInterpretacao(value as CitologiaInterpretation)} data-spec-id="edit-citologia-select">
                  <SelectTrigger data-spec-id="edit-citologia-trigger">
                    <SelectValue data-spec-id="edit-citologia-value"/>
                  </SelectTrigger>
                  <SelectContent data-spec-id="edit-citologia-content">
                    <SelectItem value="Normal" data-spec-id="edit-citologia-normal">Normal</SelectItem>
                    <SelectItem value="Inconclusivo" data-spec-id="edit-citologia-inconclusivo">Inconclusivo</SelectItem>
                    <SelectItem value="ASC-US" data-spec-id="edit-citologia-ascus">ASC-US</SelectItem>
                    <SelectItem value="ASC-H" data-spec-id="edit-citologia-asch">ASC-H</SelectItem>
                    <SelectItem value="LSIL" data-spec-id="edit-citologia-lsil">LSIL</SelectItem>
                    <SelectItem value="HSIL" data-spec-id="edit-citologia-hsil">HSIL</SelectItem>
                    <SelectItem value="AGC" data-spec-id="edit-citologia-agc">AGC</SelectItem>
                    <SelectItem value="Carcinoma" data-spec-id="edit-citologia-carcinoma">Carcinoma</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div data-spec-id="edit-dna-hpv-result">
                <label className="text-sm font-medium text-gray-700" data-spec-id="edit-dna-hpv-label">Resultado DNA HPV</label>
                <Select value={dnaHpvResultado} onValueChange={(value)=>setDnaHpvResultado(value as DnaHpvResult)} data-spec-id="edit-dna-hpv-select">
                  <SelectTrigger data-spec-id="edit-dna-hpv-trigger">
                    <SelectValue data-spec-id="edit-dna-hpv-value"/>
                  </SelectTrigger>
                  <SelectContent data-spec-id="edit-dna-hpv-content">
                    <SelectItem value="Nao_realizada" data-spec-id="edit-dna-hpv-nao">Não Realizada</SelectItem>
                    <SelectItem value="Negativa" data-spec-id="edit-dna-hpv-negativa">Negativa</SelectItem>
                    <SelectItem value="Positiva" data-spec-id="edit-dna-hpv-positiva">Positiva</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div data-spec-id="edit-return-type">
                <label className="text-sm font-medium text-gray-700" data-spec-id="edit-return-label">Prazo para Retorno</label>
                <Select value={tipoRetorno} onValueChange={(value)=>setTipoRetorno(value as ReturnType)} data-spec-id="edit-return-select">
                  <SelectTrigger data-spec-id="edit-return-trigger">
                    <SelectValue placeholder="Selecione o prazo" data-spec-id="edit-return-value"/>
                  </SelectTrigger>
                  <SelectContent data-spec-id="edit-return-content">
                    <SelectItem value="Imediato" data-spec-id="edit-return-imediato">Imediato</SelectItem>
                    <SelectItem value="6m" data-spec-id="edit-return-6m">6 meses</SelectItem>
                    <SelectItem value="1a" data-spec-id="edit-return-1a">1 ano</SelectItem>
                    <SelectItem value="2a" data-spec-id="edit-return-2a">2 anos</SelectItem>
                    <SelectItem value="Outro" data-spec-id="edit-return-outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2" data-spec-id="edit-parecer-observations">
                <label className="text-sm font-medium text-gray-700" data-spec-id="edit-observations-label">Observações do Parecer</label>
                <Textarea value={parecerObservacoes} onChange={(e)=>setParecerObservacoes(e.target.value)} placeholder="Digite as observações médicas..." rows={3} data-spec-id="edit-observations-input"/>
              </div>
            </div>
          </div>
          
          <DialogFooter data-spec-id="edit-parecer-dialog-footer">
            <Button variant="outline" onClick={()=>{
        setShowEditParecerDialog(false);
        setEditJustificativa('');
    }} data-spec-id="edit-parecer-dialog-cancel">
              Cancelar
            </Button>
            <Button onClick={editParecer} disabled={savingParecer || !editJustificativa.trim()} className="bg-green-600 hover:bg-green-700" data-spec-id="edit-parecer-dialog-save">
              {savingParecer ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>);
};
export default ExamDetails;
