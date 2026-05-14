import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Exam, User, Patient, Lab, ExamStatus } from '@/types/database';
import { Search, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { formatDateBR } from '@/lib/dateUtils';

interface ExamListProps {
    onViewExam?: (examId: string) => void;
}

const ExamList: React.FC<ExamListProps> = ({ onViewExam }) => {
    const { user } = useAuth();
    const [exams, setExams] = useState<Exam[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [labs, setLabs] = useState<Lab[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMedico, setFilterMedico] = useState('todos');
    const [filterStatus, setFilterStatus] = useState('todos');
    const [filterLab, setFilterLab] = useState('todos');
    const [daysWindow, setDaysWindow] = useState('90');

    useEffect(() => { loadData(); }, [user, daysWindow]);

    const loadData = async () => {
        setLoading(true);
        try {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - parseInt(daysWindow, 10));
            const cutoffISO = cutoff.toISOString().slice(0, 10);

            let examsQuery = supabase.from('exames').select('*')
                .neq('status', 'Próxima Consulta Comunicada ao Comercial')
                .gte('data_coleta', cutoffISO)
                .order('data_coleta', { ascending: false });
            if (user?.perfil === 'Medico') {
                examsQuery = examsQuery.eq('medico_id', user.id);
            }

            const [usersRes, patientsRes, labsRes, examsRes] = await Promise.all([
                supabase.from('users').select('*').eq('ativo', true),
                supabase.from('patients').select('*'),
                supabase.from('labs').select('*'),
                examsQuery,
            ]);
            if (usersRes.error) throw usersRes.error;
            if (patientsRes.error) throw patientsRes.error;
            if (labsRes.error) throw labsRes.error;
            if (examsRes.error) throw examsRes.error;
            setUsers(usersRes.data || []);
            setPatients(patientsRes.data || []);
            setLabs(labsRes.data || []);
            setExams(examsRes.data || []);
        } catch (error) {
            console.error('Erro ao carregar listagem:', error);
            toast.error('Erro ao carregar listagem de exames');
        } finally {
            setLoading(false);
        }
    };

    const getPatientName = (id: string) => patients.find(p => p.id === id)?.nome_completo || 'Paciente não encontrado';
    const getPatientPhone = (id: string) => patients.find(p => p.id === id)?.telefone || '';
    const getMedicoName = (id: string) => users.find(u => u.id === id)?.nome || 'Médico não encontrado';
    const getLabName = (id: string) => labs.find(l => l.id === id)?.nome || 'Lab não encontrado';

    const getStatusColor = (status: ExamStatus): string => {
        switch (status) {
            case 'Amostra Coletada': return 'bg-gray-100 text-gray-800';
            case 'Recolhido pelo Laboratório': return 'bg-blue-100 text-blue-800';
            case 'Resultado Liberado': return 'bg-yellow-100 text-yellow-800';
            case 'Parecer Médico Emitido': return 'bg-purple-100 text-purple-800';
            case 'Paciente Comunicada': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const activeStatuses: ExamStatus[] = [
        'Amostra Coletada',
        'Recolhido pelo Laboratório',
        'Resultado Liberado',
        'Parecer Médico Emitido',
        'Paciente Comunicada',
    ];

    const filtered = exams.filter(exam => {
        const name = getPatientName(exam.patient_id).toLowerCase();
        const phone = getPatientPhone(exam.patient_id);
        const matchesSearch = searchTerm === '' || name.includes(searchTerm.toLowerCase()) || phone.includes(searchTerm);
        const matchesMedico = filterMedico === 'todos' || exam.medico_id === filterMedico;
        const matchesStatus = filterStatus === 'todos' || exam.status === filterStatus;
        const matchesLab = filterLab === 'todos' || exam.lab_id === filterLab;
        return matchesSearch && matchesMedico && matchesStatus && matchesLab;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Carregando exames...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Listagem Geral de Exames</h2>
                <Button variant="outline" size="sm" onClick={loadData}>Atualizar</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filtros</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="relative md:col-span-2">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"/>
                            <Input
                                placeholder="Nome ou telefone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Select value={daysWindow} onValueChange={setDaysWindow}>
                            <SelectTrigger><SelectValue placeholder="Período"/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="30">Últimos 30 dias</SelectItem>
                                <SelectItem value="90">Últimos 90 dias</SelectItem>
                                <SelectItem value="180">Últimos 180 dias</SelectItem>
                                <SelectItem value="365">Último ano</SelectItem>
                                <SelectItem value="3650">Tudo</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filterMedico} onValueChange={setFilterMedico}>
                            <SelectTrigger><SelectValue placeholder="Médico"/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos os médicos</SelectItem>
                                {users.filter(u => u.perfil === 'Medico').map(m => (
                                    <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger><SelectValue placeholder="Status"/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos os status</SelectItem>
                                {activeStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={filterLab} onValueChange={setFilterLab}>
                            <SelectTrigger><SelectValue placeholder="Laboratório"/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos os laboratórios</SelectItem>
                                {labs.map(l => <SelectItem key={l.id} value={l.id}>{l.nome}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Button variant="outline" onClick={() => {
                            setSearchTerm('');
                            setFilterMedico('todos');
                            setFilterStatus('todos');
                            setFilterLab('todos');
                            setDaysWindow('90');
                        }}>
                            Limpar filtros
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Exames ({filtered.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {filtered.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                Nenhum exame encontrado com os filtros aplicados.
                            </div>
                        ) : filtered.map(exam => (
                            <div key={exam.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">{getPatientName(exam.patient_id)}</h4>
                                    <p className="text-sm text-gray-600">
                                        Frasco: {exam.numero_frasco} • {getMedicoName(exam.medico_id)} • {getLabName(exam.lab_id)}
                                    </p>
                                    <p className="text-xs text-gray-500">Coleta: {formatDateBR(exam.data_coleta)}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge className={getStatusColor(exam.status)}>{exam.status}</Badge>
                                    {onViewExam && (
                                        <Button variant="outline" size="sm" onClick={() => onViewExam(exam.id)}>
                                            <Eye className="w-4 h-4 mr-1"/>Ver
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ExamList;
