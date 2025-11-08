import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import ExamDetails from '@/components/ExamDetails';
import ExamHistory from '@/components/ExamHistory';
import ExamRegistration from '@/components/ExamRegistration';
import LabManagement from '@/components/LabManagement';
import PatientManagement from '@/components/PatientManagement';
import ChangePassword from '@/components/ChangePassword';
import { Loader2 } from 'lucide-react';
const Index = ()=>{
    const { user, loading } = useAuth();
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
    useEffect(()=>{
        if (user && !loading) {
            console.log('👤 Usuário logado, redirecionando para dashboard');
            setCurrentPage('dashboard');
            setSelectedExamId(null);
        }
    }, [
        user,
        loading
    ]);
    console.log('🔄 Estado atual:', {
        user: user?.email,
        loading,
        currentPage
    });
    if (loading) {
        return (<div className="min-h-screen flex items-center justify-center" data-spec-id="app-loading">
        <div className="text-center" data-spec-id="ZyMIODpB7SImgeg9">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" data-spec-id="T7DDWq0uClUfgq0f"/>
          <p className="mt-2 text-gray-600" data-spec-id="qgxkWlYIlUxLqKan">Carregando aplicação...</p>
        </div>
      </div>);
    }
    if (!user) {
        return <LoginForm data-spec-id="L3tPAAfxy6RelTap"/>;
    }
    const handleViewExam = (examId: string)=>{
        setSelectedExamId(examId);
        setCurrentPage('exam-details');
    };
    const handleBackFromExam = ()=>{
        setSelectedExamId(null);
        setCurrentPage('dashboard');
    };
    const handleExamUpdated = ()=>{
        console.log('📝 Exame atualizado');
    };
    const renderCurrentPage = ()=>{
        if (currentPage === 'exam-details' && selectedExamId) {
            return (<ExamDetails examId={selectedExamId} onBack={handleBackFromExam} onExamUpdated={handleExamUpdated} data-spec-id="ex8LtW8upskAFc12"/>);
        }
        switch(currentPage){
            case 'dashboard':
                return <Dashboard onViewExam={handleViewExam} data-spec-id="hvArFzhCrJrwCAbL"/>;
            case 'history':
                return <ExamHistory onViewExam={handleViewExam} data-spec-id="history-component"/>;
            case 'patients':
                return <PatientManagement data-spec-id="patient-management-component"/>;
            case 'labs':
                return <LabManagement data-spec-id="lab-management-component"/>;
            case 'exams':
                return <ExamRegistration onSuccess={()=>setCurrentPage('dashboard')} data-spec-id="exam-registration-component"/>;
            case 'reports':
                return (<div className="text-center py-12" data-spec-id="reports-placeholder">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" data-spec-id="I7IyujoYriPfegeB">Relatórios</h2>
            <p className="text-gray-600" data-spec-id="66w8hieJX14h9U5p">Tela de relatórios em desenvolvimento...</p>
          </div>);
            case 'settings':
                return (<div className="text-center py-12" data-spec-id="settings-placeholder">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" data-spec-id="1F6skdRKM4llda4c">Configurações</h2>
            <p className="text-gray-600" data-spec-id="lx8g6cV8TjOEwS0N">Tela de configurações em desenvolvimento...</p>
          </div>);
            case 'change-password':
                return <ChangePassword data-spec-id="change-password-component"/>;
            default:
                return <Dashboard onViewExam={handleViewExam} data-spec-id="Jq0SV3lEMLMKDEOL"/>;
        }
    };
    return (<Layout currentPage={currentPage} onNavigate={setCurrentPage} data-spec-id="main-layout">
      {renderCurrentPage()}
    </Layout>);
};
export default Index;
