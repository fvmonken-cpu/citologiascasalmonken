import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Exam, User, Patient, Lab } from '@/types/database';
import { Search, History, Calendar, Stethoscope, FlaskConical, Phone, Eye, ArrowUpDown, Grid, List, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { formatDateBR, formatDateTimeBR } from '@/lib/dateUtils';
interface ExamHistoryProps {
    onViewExam?: (examId: string) => void;
}
const ExamHistory: React.FC<ExamHistoryProps> = ({ onViewExam })=>{
    const { user } = useAuth();
    const [exams, setExams] = useState<Exam[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [labs, setLabs] = useState<Lab[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMedico, setFilterMedico] = useState('todos');
    const [filterPeriod, setFilterPeriod] = useState('todos');
    const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'date-desc' | 'collection-desc'>('date-desc');
    const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
    useEffect(()=>{
        loadHistoryData();
    }, [
        user
    ]);
    const loadHistoryData = async ()=>{
        console.log('📚 Carregando histórico de exames...');
        setLoading(true);
        try {
            const { data: usersData, error: usersError } = await supabase.from('users').select('*').eq('ativo', true);
            if (usersError) throw usersError;
            const { data: patientsData, error: patientsError } = await supabase.from('patients').select('*');
            if (patientsError) throw patientsError;
            const { data: labsData, error: labsError } = await supabase.from('labs').select('*');
            if (labsError) throw labsError;
            let examsQuery = supabase.from('exames').select('*').eq('status', 'Próxima Consulta Comunicada ao Comercial').order('data_comercial_comunicado', {
                ascending: false
            });
            if (user?.perfil === 'Medico') {
                examsQuery = examsQuery.eq('medico_id', user.id);
            }
            const { data: examsData, error: examsError } = await examsQuery;
            if (examsError) throw examsError;
            const examIds = examsData?.map((exam)=>exam.id) || [];
            const { data: auditData, error: auditError } = await supabase.from('audit_logs').select('*').in('exam_id', examIds).order('created_at', {
                ascending: true
            });
            if (auditError) throw auditError;
            setUsers(usersData || []);
            setPatients(patientsData || []);
            setLabs(labsData || []);
            setExams(examsData || []);
            setAuditLogs(auditData || []);
            console.log('✅ Histórico carregado:', {
                users: usersData?.length,
                patients: patientsData?.length,
                labs: labsData?.length,
                exams: examsData?.length,
                auditLogs: auditData?.length
            });
        } catch (error) {
            console.error('❌ Erro ao carregar histórico:', error);
            toast.error('Erro ao carregar histórico de exames');
        } finally{
            setLoading(false);
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
    const getPatientPhone = (patientId: string): string =>{
        const patient = patients.find((p)=>p.id === patientId);
        return patient?.telefone || '';
    };
    const getInterpretationColor = (interpretation: string): string =>{
        switch(interpretation){
            case 'Normal':
                return 'bg-green-100 text-green-800';
            case 'Inconclusivo':
                return 'bg-yellow-100 text-yellow-800';
            case 'ASC-US':
            case 'ASC-H':
                return 'bg-orange-100 text-orange-800';
            case 'LSIL':
            case 'HSIL':
            case 'AGC':
            case 'Carcinoma':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    const formatReturnType = (type: string): string =>{
        switch(type){
            case '6m':
                return '6 meses';
            case '1a':
                return '1 ano';
            case '2a':
                return '2 anos';
            case 'Imediato':
                return 'Imediato';
            case 'Outro':
                return 'Outro';
            default:
                return type;
        }
    };
    const getExamAuditLogs = (examId: string)=>{
        return auditLogs.filter((log)=>log.exam_id === examId);
    };
    const getUserName = (userId: string): string =>{
        const user = users.find((u)=>u.id === userId);
        return user?.nome || 'Usuário não encontrado';
    };
    const filterByPeriod = (exam: Exam): boolean =>{
        if (filterPeriod === 'todos') return true;
        const communicationDate = new Date(exam.data_comercial_comunicado || exam.created_at);
        const now = new Date();
        const diffTime = now.getTime() - communicationDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        switch(filterPeriod){
            case '7d':
                return diffDays <= 7;
            case '30d':
                return diffDays <= 30;
            case '90d':
                return diffDays <= 90;
            case '1y':
                return diffDays <= 365;
            default:
                return true;
        }
    };
    const toggleCardExpansion = (examId: string)=>{
        console.log('🔄 Toggle expansion para exam:', examId);
        console.log('📋 Estado atual expandedCards:', Array.from(expandedCards));
        const newExpanded = new Set(expandedCards);
        if (newExpanded.has(examId)) {
            newExpanded.delete(examId);
            console.log('📉 Fechando card:', examId);
        } else {
            newExpanded.add(examId);
            console.log('📈 Abrindo card:', examId);
        }
        setExpandedCards(newExpanded);
        console.log('📋 Novo estado expandedCards:', Array.from(newExpanded));
    };
    const filteredAndSortedExams = exams.filter((exam)=>{
        const patientName = getPatientName(exam.patient_id).toLowerCase();
        const phone = getPatientPhone(exam.patient_id);
        const matchesSearch = searchTerm === '' || patientName.includes(searchTerm.toLowerCase()) || phone.includes(searchTerm) || exam.numero_frasco.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMedico = filterMedico === 'todos' || exam.medico_id === filterMedico;
        const matchesPeriod = filterByPeriod(exam);
        return matchesSearch && matchesMedico && matchesPeriod;
    }).sort((a, b)=>{
        switch(sortBy){
            case 'name-asc':
                return getPatientName(a.patient_id).localeCompare(getPatientName(b.patient_id));
            case 'name-desc':
                return getPatientName(b.patient_id).localeCompare(getPatientName(a.patient_id));
            case 'date-desc':
                return new Date(b.data_comercial_comunicado || b.updated_at || b.created_at).getTime() - new Date(a.data_comercial_comunicado || a.updated_at || a.created_at).getTime();
            case 'collection-desc':
                return new Date(b.data_coleta).getTime() - new Date(a.data_coleta).getTime();
            default:
                return 0;
        }
    });
    if (loading) {
        return (<div className="flex items-center justify-center py-12" data-spec-id="history-loading">
        <div className="text-center" data-spec-id="x8x8OCjV432T7t1z">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" data-spec-id="OqDqU0vYfZGKoQ0T"></div>
          <p className="mt-2 text-gray-600" data-spec-id="aW1y4zkfo1SkoXFz">Carregando histórico de exames...</p>
        </div>
      </div>);
    }
    return (<div className="space-y-6" data-spec-id="history-container">
      {}
      <div className="flex justify-between items-center" data-spec-id="history-header">
        <div className="flex items-center space-x-3" data-spec-id="b9hzujUK9QSCeLbX">
          <History className="w-6 h-6 text-gray-600" data-spec-id="4p10gDvQ1Zdp92Zl"/>
          <h2 className="text-2xl font-bold text-gray-900" data-spec-id="history-title">
            Histórico de Citologias
          </h2>
        </div>
        <div className="flex items-center space-x-2" data-spec-id="history-actions">
          <div className="flex items-center space-x-1" data-spec-id="view-mode-toggle">
            <Button variant={viewMode === 'cards' ? 'default' : 'outline'} size="sm" onClick={()=>setViewMode('cards')} data-spec-id="cards-view-button">
              <Grid className="w-4 h-4" data-spec-id="Org6UJtYPpMucUOg"/>
            </Button>
            <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={()=>setViewMode('list')} data-spec-id="list-view-button">
              <List className="w-4 h-4" data-spec-id="wOKQJnVwFgVzcSQQ"/>
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={loadHistoryData} data-spec-id="refresh-history-button">
            Atualizar
          </Button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" data-spec-id="history-stats">
        <Card data-spec-id="total-exams-card">
          <CardContent className="p-4 text-center" data-spec-id="rLMkBaNzqkeabbrT">
            <div className="text-2xl font-bold text-gray-900" data-spec-id="bpU3b5NOZIj8IddL">{exams.length}</div>
            <p className="text-sm text-gray-600" data-spec-id="jseC5UrcJlPVbbyu">Total de Exames</p>
          </CardContent>
        </Card>

        {}
        {(user?.perfil === 'Medico' || user?.perfil === 'Administrador' || user?.perfil === 'Superusuario') ? (<>
            <Card data-spec-id="normal-results-card">
              <CardContent className="p-4 text-center" data-spec-id="DaBSEzKDl6qJOhVF">
                <div className="text-2xl font-bold text-green-600" data-spec-id="8sXXfSeOMpZXsuMH">
                  {exams.filter((e)=>e.interpretacao_citologia === 'Normal').length}
                </div>
                <p className="text-sm text-gray-600" data-spec-id="Hadzgk6LbVybKXGE">Resultados Normais</p>
              </CardContent>
            </Card>

            <Card data-spec-id="altered-results-card">
              <CardContent className="p-4 text-center" data-spec-id="kHuhbBwFVL4MpiLt">
                <div className="text-2xl font-bold text-orange-600" data-spec-id="t6PuzQBdGvNFr1Mo">
                  {exams.filter((e)=>e.interpretacao_citologia && e.interpretacao_citologia !== 'Normal').length}
                </div>
                <p className="text-sm text-gray-600" data-spec-id="jlGWzoGHqtwizTck">Resultados Alterados</p>
              </CardContent>
            </Card>

            <Card data-spec-id="hpv-positive-card">
              <CardContent className="p-4 text-center" data-spec-id="kCIqDyhy5mqRIrSw">
                <div className="text-2xl font-bold text-red-600" data-spec-id="AkHxbywVe2oY7r7c">
                  {exams.filter((e)=>e.dna_hpv_resultado === 'Positiva').length}
                </div>
                <p className="text-sm text-gray-600" data-spec-id="fddTql0Unu6hqhzl">HPV Positivo</p>
              </CardContent>
            </Card>
          </>) : (<>
            <Card data-spec-id="citologia-performed-card">
              <CardContent className="p-4 text-center" data-spec-id="citologia-performed-content">
                <div className="text-2xl font-bold text-blue-600" data-spec-id="citologia-performed-count">
                  {exams.filter((e)=>e.citologia_realizada).length}
                </div>
                <p className="text-sm text-gray-600" data-spec-id="citologia-performed-label">Citologias Realizadas</p>
              </CardContent>
            </Card>

            <Card data-spec-id="dna-hpv-performed-card">
              <CardContent className="p-4 text-center" data-spec-id="dna-hpv-performed-content">
                <div className="text-2xl font-bold text-purple-600" data-spec-id="dna-hpv-performed-count">
                  {exams.filter((e)=>e.dna_hpv_solicitado).length}
                </div>
                <p className="text-sm text-gray-600" data-spec-id="dna-hpv-performed-label">DNA HPV Solicitados</p>
              </CardContent>
            </Card>

            <Card data-spec-id="biopsy-performed-card">
              <CardContent className="p-4 text-center" data-spec-id="biopsy-performed-content">
                <div className="text-2xl font-bold text-orange-600" data-spec-id="biopsy-performed-count">
                  {exams.filter((e)=>e.biopsia_solicitada).length}
                </div>
                <p className="text-sm text-gray-600" data-spec-id="biopsy-performed-label">Biópsias Solicitadas</p>
              </CardContent>
            </Card>
          </>)}
      </div>

      {}
      <Card data-spec-id="history-filters-card">
        <CardHeader data-spec-id="F4g77dUEeI69WD4E">
          <CardTitle className="text-lg" data-spec-id="filters-title">Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent data-spec-id="jjtbnzkjs58cHy1e">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4" data-spec-id="history-filters-grid">
            <div className="relative" data-spec-id="history-search-container">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" data-spec-id="xYopmADUVNKZjqkW"/>
              <Input placeholder="Nome, telefone ou frasco..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="pl-10" data-spec-id="history-search-input"/>
            </div>

            <Select value={filterMedico} onValueChange={setFilterMedico} data-spec-id="history-medico-filter">
              <SelectTrigger data-spec-id="G5eOFCtKoLI350DP">
                <SelectValue placeholder="Filtrar por médico" data-spec-id="9FZQm8ks7lnwhXnS"/>
              </SelectTrigger>
              <SelectContent data-spec-id="ESgRSKpFtI7r30LP">
                <SelectItem value="todos" data-spec-id="JY4xxXkpbDRmc1cm">Todos os médicos</SelectItem>
                {users.filter((u)=>u.perfil === 'Medico').map((medico)=>(<SelectItem key={medico.id} value={medico.id} data-spec-id="yNCRaLkQOJIpW8ry">
                      {medico.nome}
                    </SelectItem>))}
              </SelectContent>
            </Select>

            <Select value={filterPeriod} onValueChange={setFilterPeriod} data-spec-id="history-period-filter">
              <SelectTrigger data-spec-id="6fRifhXsQz8pNPa2">
                <SelectValue placeholder="Filtrar por período" data-spec-id="UwGPRrYwhpxSmwIM"/>
              </SelectTrigger>
              <SelectContent data-spec-id="jbBjR2RFTIyriDiv">
                <SelectItem value="todos" data-spec-id="9FzPEh67ex5gEFri">Todos os períodos</SelectItem>
                <SelectItem value="7d" data-spec-id="gLXlqmCvSHfpcRXH">Últimos 7 dias</SelectItem>
                <SelectItem value="30d" data-spec-id="1yesxTp0MY81qqy1">Últimos 30 dias</SelectItem>
                <SelectItem value="90d" data-spec-id="BNOacPZkmp4PJfSu">Últimos 3 meses</SelectItem>
                <SelectItem value="1y" data-spec-id="EzcYw8O8D6LuYoyY">Último ano</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value)=>setSortBy(value as any)} data-spec-id="history-sort-filter">
              <SelectTrigger data-spec-id="history-sort-trigger">
                <ArrowUpDown className="w-4 h-4 mr-2" data-spec-id="4ljMa5UIJnyo8B3v"/>
                <SelectValue placeholder="Ordenar por" data-spec-id="7z8SgWXyQ7fw4YPI"/>
              </SelectTrigger>
              <SelectContent data-spec-id="history-sort-content">
                <SelectItem value="name-asc" data-spec-id="history-sort-name-asc">Paciente A-Z</SelectItem>
                <SelectItem value="name-desc" data-spec-id="history-sort-name-desc">Paciente Z-A</SelectItem>
                <SelectItem value="date-desc" data-spec-id="history-sort-date-desc">Modificação (recente)</SelectItem>
                <SelectItem value="collection-desc" data-spec-id="history-sort-collection-desc">Coleta (recente)</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={()=>{
        setSearchTerm('');
        setFilterMedico('todos');
        setFilterPeriod('todos');
        setSortBy('date-desc');
    }} data-spec-id="clear-history-filters">
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {}
      <Card data-spec-id="history-exams-list-card">
        <CardHeader data-spec-id="DLDy3N08NSPgwx5G">
          <CardTitle className="text-lg" data-spec-id="history-exams-list-title">
            Exames Finalizados ({filteredAndSortedExams.length})
          </CardTitle>
        </CardHeader>
        <CardContent data-spec-id="28x1IBSVbe9ZVIkM">
          {viewMode === 'cards' ? (<div className="space-y-4" data-spec-id="history-exams-cards">
              {filteredAndSortedExams.length === 0 ? (<div className="text-center py-8 text-gray-500" data-spec-id="no-history-exams">
                  Nenhum exame encontrado no histórico com os filtros aplicados.
                </div>) : (filteredAndSortedExams.map((exam)=>(<div key={exam.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors" data-spec-id={`history-exam-item-${exam.id}`}>
                  <div className="flex items-center justify-between" data-spec-id="diRupXaqVoFkqHOZ">
                    <div className="flex-1 space-y-2" data-spec-id="history-exam-info">
                      <div className="flex items-center space-x-4" data-spec-id="hwJS8XcIyj49DMIV">
                        <div data-spec-id="XdtRHJQWDGpQTJ9X">
                          <h4 className="font-medium text-gray-900" data-spec-id="history-patient-name">
                            {getPatientName(exam.patient_id)}
                          </h4>
                          <p className="text-sm text-gray-600" data-spec-id="history-exam-details">
                            Frasco: {exam.numero_frasco} • {getMedicoName(exam.medico_id)} • {getLabName(exam.lab_id)}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500" data-spec-id="history-exam-dates">
                            <span className="flex items-center" data-spec-id="zF4IjVO8aSpdXc8f">
                              <Calendar className="w-3 h-3 mr-1" data-spec-id="GcX1VjtXM9V1LBhD"/>
                              Coleta: {formatDateBR(exam.data_coleta)}
                            </span>
                            <span data-spec-id="F43OpGY0YAB3nqVQ">
                              Finalizado: {exam.data_comercial_comunicado ? formatDateBR(exam.data_comercial_comunicado) : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {}
                      <div className="flex items-center space-x-2 flex-wrap" data-spec-id="history-exam-results">
                        {}
                        {user?.perfil === 'Secretaria' ? (<>
                            {exam.citologia_realizada && (<Badge className="bg-blue-100 text-blue-800 text-xs" data-spec-id="citologia-performed-badge">
                                Citologia Realizada
                              </Badge>)}
                            
                            {exam.dna_hpv_solicitado && (<Badge className="bg-purple-100 text-purple-800 text-xs" data-spec-id="dna-hpv-performed-badge">
                                DNA HPV Realizado
                              </Badge>)}

                            {exam.biopsia_solicitada && (<Badge className="bg-orange-100 text-orange-800 text-xs" data-spec-id="biopsy-performed-badge">
                                Biópsia Realizada
                              </Badge>)}
                          </>) : (<>
                            {exam.interpretacao_citologia && (<Badge className={`${getInterpretationColor(exam.interpretacao_citologia)} text-xs`} data-spec-id="5OwoS8muycBZEFPU">
                                Citologia: {exam.interpretacao_citologia}
                              </Badge>)}
                            
                            {exam.dna_hpv_resultado && exam.dna_hpv_resultado !== 'Nao_realizada' && (<Badge className={`${exam.dna_hpv_resultado === 'Positiva' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'} text-xs`} data-spec-id="6c43IhgEJbIWYmts">
                                HPV: {exam.dna_hpv_resultado}
                              </Badge>)}
                          </>)}

                        {exam.tipo_retorno && (<Badge variant="outline" className="text-xs" data-spec-id="UyxdqbPEkc1R2Dlk">
                            Retorno: {formatReturnType(exam.tipo_retorno)}
                          </Badge>)}

                        {exam.data_proxima_consulta && (<Badge variant="outline" className="text-xs" data-spec-id="ZVtBa7h9or73pnle">
                            Próxima: {formatDateBR(exam.data_proxima_consulta)}
                          </Badge>)}
                      </div>

                      {}
                      {exam.parecer_observacoes && (user?.perfil === 'Medico' || user?.perfil === 'Administrador' || user?.perfil === 'Superusuario') && (<div className="mt-2" data-spec-id="history-parecer-observations">
                          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded" data-spec-id="XETCqVsDoGOLfzB6">
                            <strong data-spec-id="nBdpYXQmRxgKImb9">Parecer:</strong> {exam.parecer_observacoes}
                          </p>
                        </div>)}

                      {}
                      <div className="mt-3 border-t pt-3" data-spec-id="history-audit-logs">
                        <div data-spec-id="xh0zTdaKbsZsSASK">
                          <Button variant="ghost" size="sm" className="flex items-center justify-between w-full p-0 h-auto" onClick={()=>{
            console.log('🔘 Botão clicado para exam:', exam.id);
            toggleCardExpansion(exam.id);
        }} data-spec-id="audit-logs-toggle">
                            <h5 className="text-sm font-medium text-gray-700" data-spec-id="audit-logs-title">
                              Histórico de Alterações ({getExamAuditLogs(exam.id).length})
                            </h5>
                            {expandedCards.has(exam.id) ? (<ChevronUp className="w-4 h-4" data-spec-id="75XWbCYqDMabLOkL"/>) : (<ChevronDown className="w-4 h-4" data-spec-id="h6qMGCspbyRssKok"/>)}
                          </Button>
                          
                          {expandedCards.has(exam.id) && (<div className="space-y-1 mt-2" data-spec-id="audit-logs-list">
                              {getExamAuditLogs(exam.id).map((log, index)=>(<div key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded" data-spec-id={`audit-log-${index}`}>
                                  <div className="flex justify-between items-start" data-spec-id="audit-log-header">
                                    <span className="font-medium text-blue-600" data-spec-id="audit-log-user">
                                      {getUserName(log.user_id)}
                                    </span>
                                    <span className="text-gray-500" data-spec-id="audit-log-date">
                                      {formatDateTimeBR(log.created_at)}
                                    </span>
                                  </div>
                                  <p className="mt-1" data-spec-id="audit-log-action">{log.action}</p>
                                  {log.justificativa && (<p className="text-gray-500 italic mt-1" data-spec-id="audit-log-justification">
                                      "{log.justificativa}"
                                    </p>)}
                                </div>))}
                            </div>)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2" data-spec-id="history-exam-actions">
                      {onViewExam && (<Button variant="outline" size="sm" onClick={()=>onViewExam(exam.id)} data-spec-id="view-history-exam-button">
                          <Eye className="w-4 h-4 mr-2" data-spec-id="dTJPlqKZ7zxt6MLU"/>
                          Ver Detalhes
                        </Button>)}
                    </div>
                  </div>
                </div>)))}
            </div>) : (<div className="space-y-2" data-spec-id="history-exams-list">
              {filteredAndSortedExams.length === 0 ? (<div className="text-center py-8 text-gray-500" data-spec-id="no-history-exams-list">
                  Nenhum exame encontrado no histórico com os filtros aplicados.
                </div>) : (<div className="divide-y divide-gray-200" data-spec-id="history-exams-table">
                  <div className="grid grid-cols-6 gap-4 p-3 font-medium text-sm text-gray-700 bg-gray-50 rounded-t-lg" data-spec-id="history-table-header">
                    <div data-spec-id="PDWcG82mW4IAZx0f">Paciente</div>
                    <div data-spec-id="w58tg9EINTaOo2L5">Frasco</div>
                    <div data-spec-id="89fmdPSPWIbaBSkj">Médico</div>
                    <div data-spec-id="moVNcCF954UiUS7Z">Coleta</div>
                    <div data-spec-id="gxM7Z0WkKbZxvxF2">Resultado</div>
                    <div data-spec-id="rHtbZfc7q7fHp4A2">Ações</div>
                  </div>
                  {filteredAndSortedExams.map((exam)=>(<div key={exam.id} className="grid grid-cols-6 gap-4 p-3 hover:bg-gray-50 transition-colors text-sm" data-spec-id={`history-exam-row-${exam.id}`}>
                      <div className="flex flex-col" data-spec-id="patient-cell">
                        <span className="font-medium text-gray-900" data-spec-id="N5zgGQYvRawnZs3N">{getPatientName(exam.patient_id)}</span>
                        {getPatientPhone(exam.patient_id) && (<span className="text-xs text-gray-500 flex items-center" data-spec-id="LqBEF3p2le7JxtsQ">
                            <Phone className="w-3 h-3 mr-1" data-spec-id="NuZekwG7oWNuIKEE"/>
                            {getPatientPhone(exam.patient_id)}
                          </span>)}
                      </div>
                      <div className="flex flex-col" data-spec-id="frasco-cell">
                        <span className="font-medium" data-spec-id="lbgCBwuBd6P2Fmxp">{exam.numero_frasco}</span>
                        <span className="text-xs text-gray-500" data-spec-id="m42tbW8mC6mNc4fQ">{getLabName(exam.lab_id)}</span>
                      </div>
                      <div data-spec-id="medico-cell">
                        <span className="text-gray-900" data-spec-id="8B5dUGputAvJTx2q">{getMedicoName(exam.medico_id)}</span>
                      </div>
                      <div data-spec-id="coleta-cell">
                        <span className="text-gray-900" data-spec-id="LHKbgOqNIOdHC7ZT">{formatDateBR(exam.data_coleta)}</span>
                      </div>
                      <div className="flex flex-col space-y-1" data-spec-id="resultado-cell">
                        {}
                        {user?.perfil === 'Secretaria' ? (<>
                            {exam.citologia_realizada && (<Badge className="bg-blue-100 text-blue-800 text-xs w-fit" data-spec-id="citologia-list-badge">
                                Citologia
                              </Badge>)}
                            {exam.dna_hpv_solicitado && (<Badge className="bg-purple-100 text-purple-800 text-xs w-fit" data-spec-id="dna-hpv-list-badge">
                                DNA HPV
                              </Badge>)}
                            {exam.biopsia_solicitada && (<Badge className="bg-orange-100 text-orange-800 text-xs w-fit" data-spec-id="biopsy-list-badge">
                                Biópsia
                              </Badge>)}
                          </>) : (<>
                            {exam.interpretacao_citologia && (<Badge className={`${getInterpretationColor(exam.interpretacao_citologia)} text-xs w-fit`} data-spec-id="5Kj3Rrx5LkgF8Sua">
                                {exam.interpretacao_citologia}
                              </Badge>)}
                            {exam.dna_hpv_resultado && exam.dna_hpv_resultado !== 'Nao_realizada' && (<Badge className={`${exam.dna_hpv_resultado === 'Positiva' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'} text-xs w-fit`} data-spec-id="BrU0ilp9RNekHlaD">
                                HPV: {exam.dna_hpv_resultado}
                              </Badge>)}
                          </>)}
                      </div>
                      <div data-spec-id="actions-cell">
                        {onViewExam && (<Button variant="outline" size="sm" onClick={()=>onViewExam(exam.id)} data-spec-id="view-list-exam-button">
                            <Eye className="w-4 h-4" data-spec-id="uriG6oN5JCSA8MB2"/>
                          </Button>)}
                      </div>
                    </div>))}
                </div>)}
            </div>)}
        </CardContent>
      </Card>
    </div>);
};
export default ExamHistory;
