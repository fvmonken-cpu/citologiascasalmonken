import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, Users, FileText, BarChart3, UserPlus, FilePlus, Settings, Activity, FlaskConical, KeyRound, Microscope } from 'lucide-react';
import { toast } from 'sonner';
interface LayoutProps {
    children: React.ReactNode;
    currentPage?: string;
    onNavigate?: (page: string) => void;
}
const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate })=>{
    const { user, logout } = useAuth();
    const getProfileColor = (perfil: string)=>{
        switch(perfil){
            case 'Medico':
                return 'bg-green-100 text-green-800';
            case 'Secretaria':
                return 'bg-blue-100 text-blue-800';
            case 'Administrador':
                return 'bg-purple-100 text-purple-800';
            case 'Superusuario':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    const navigationItems = [
        {
            key: 'dashboard',
            label: 'Dashboard',
            icon: Activity,
            permission: 'all'
        },
        {
            key: 'patients',
            label: 'Pacientes',
            icon: Users,
            permission: 'all'
        },
        {
            key: 'exams',
            label: 'Novo Exame',
            icon: FilePlus,
            permission: 'all'
        },
        {
            key: 'history',
            label: 'Histórico',
            icon: FileText,
            permission: 'all'
        },
        {
            key: 'labs',
            label: 'Laboratórios',
            icon: FlaskConical,
            permission: 'secretary_admin'
        },
        {
            key: 'reports',
            label: 'Relatórios',
            icon: BarChart3,
            permission: 'admin'
        },
        {
            key: 'users',
            label: 'Usuários',
            icon: UserPlus,
            permission: 'admin'
        },
        {
            key: 'settings',
            label: 'Configurações',
            icon: Settings,
            permission: 'admin'
        },
        {
            key: 'change-password',
            label: 'Alterar Senha',
            icon: KeyRound,
            permission: 'all'
        }
    ];
    const canAccess = (permission: string)=>{
        if (permission === 'all') return true;
        if (permission === 'admin') {
            return user?.perfil === 'Administrador' || user?.perfil === 'Superusuario';
        }
        if (permission === 'secretary_admin') {
            return user?.perfil === 'Secretaria' || user?.perfil === 'Administrador' || user?.perfil === 'Superusuario';
        }
        return false;
    };
    const handleLogout = ()=>{
        console.log('🚪 Iniciando logout...');
        logout();
    };
    const handleNavigation = (page: string)=>{
        console.log(`🧭 Navegando para: ${page}`);
        if (onNavigate) {
            onNavigate(page);
        }
    };
    return (<div className="min-h-screen" data-spec-id="layout-container">
      {}
      {}
      <header className="hidden md:block bg-white shadow-sm border-b" data-spec-id="desktop-header">
        <div className="px-4 sm:px-6 lg:px-8" data-spec-id="desktop-header-container">
          <div className="flex justify-between items-center h-16" data-spec-id="desktop-header-content">
            <div className="flex items-center space-x-4" data-spec-id="header-left">
              <img src="https://cdn-pinspec-public.pinspec.ai/assets/TyEPnly8Vve4mhijRj0lR.png" alt="Espaço Casal Monken Logo" className="h-8 w-auto object-contain" data-spec-id="header-logo"/>
              <div className="flex flex-col" data-spec-id="header-titles">
                <h1 className="text-xl font-semibold text-gray-900" data-spec-id="app-title">
                  Citologia Oncótica
                </h1>
                <span className="text-sm text-gray-500" data-spec-id="clinic-name">
                  Sistema de Gestão de Exames
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4" data-spec-id="header-right">
              <div className="flex items-center space-x-2" data-spec-id="user-info">
                <span className="text-sm text-gray-700" data-spec-id="user-name">
                  {user?.nome}
                </span>
                <Badge className={getProfileColor(user?.perfil || '')} data-spec-id="user-badge">
                  {user?.perfil}
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} data-spec-id="logout-button" className="text-gray-600 hover:text-gray-800">
                <LogOut className="w-4 h-4 mr-2" data-spec-id="WNnvX5SNKat1OpvW"/>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {}
      <header className="md:hidden bg-white shadow-sm border-b" data-spec-id="mobile-header">
        <div className="px-3 py-2" data-spec-id="mobile-header-container">
          <div className="flex items-center justify-between" data-spec-id="mobile-header-content">
            <div className="flex items-center space-x-2" data-spec-id="mobile-header-left">
              <img src="https://cdn-pinspec-public.pinspec.ai/assets/TyEPnly8Vve4mhijRj0lR.png" alt="Logo" className="h-6 w-auto object-contain" data-spec-id="mobile-header-logo"/>
              <div className="flex flex-col" data-spec-id="mobile-header-titles">
                <h1 className="text-sm font-semibold text-gray-900" data-spec-id="mobile-app-title">
                  Citologia Oncótica
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2" data-spec-id="mobile-header-right">
              <div className="text-right" data-spec-id="mobile-user-info">
                <div className="text-xs text-gray-700 font-medium" data-spec-id="mobile-user-name">
                  {user?.nome?.split(' ')[0]} {}
                </div>
                <Badge className={`text-xs ${getProfileColor(user?.perfil || '')}`} data-spec-id="mobile-user-badge">
                  {user?.perfil}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} data-spec-id="mobile-logout-button" className="p-1">
                <LogOut className="w-4 h-4 text-gray-600" data-spec-id="mobile-logout-icon"/>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row" data-spec-id="layout-content">
        {}
        {}
        <nav className="md:hidden bg-white border-b" data-spec-id="mobile-nav-container">
          <div className="px-2 py-3" data-spec-id="mobile-nav-wrapper">
            <div className="grid grid-cols-4 gap-2" data-spec-id="mobile-nav">
              {navigationItems.filter((item)=>canAccess(item.permission) && item.key !== 'change-password').slice(0, 4).map((item)=>{
        const Icon = item.icon;
        const isActive = currentPage === item.key;
        return (<Button key={item.key} variant={isActive ? "default" : "ghost"} size="sm" className={`flex flex-col h-14 p-2 ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700'}`} onClick={()=>handleNavigation(item.key)} data-spec-id={`mobile-nav-${item.key}`}>
                    <Icon className="w-4 h-4" data-spec-id="mobile-nav-icon"/>
                    <span className="text-xs mt-1 leading-tight" data-spec-id="mobile-nav-label">
                      {item.label}
                    </span>
                  </Button>);
    })}
            </div>
          </div>
        </nav>

        {}
        <aside className="hidden md:block w-64 bg-white shadow-sm min-h-screen" data-spec-id="desktop-sidebar">
          <div className="p-4 border-b border-gray-200" data-spec-id="sidebar-header">
            <div className="flex flex-col items-center space-y-3" data-spec-id="sidebar-branding">
              <img src="https://cdn-pinspec-public.pinspec.ai/assets/TyEPnly8Vve4mhijRj0lR.png" alt="Espaço Casal Monken Logo" className="h-16 w-auto object-contain" data-spec-id="sidebar-logo"/>
              <div className="text-center" data-spec-id="sidebar-titles">
                <h2 className="text-sm font-semibold text-gray-800" data-spec-id="sidebar-clinic-name">
                  Espaço Casal Monken
                </h2>
                <p className="text-xs text-gray-500" data-spec-id="sidebar-specialty">
                  Ginecologia e Obstetrícia
                </p>
              </div>
            </div>
          </div>
          <nav className="p-4 space-y-2" data-spec-id="sidebar-nav">
            {navigationItems.filter((item)=>canAccess(item.permission)).map((item)=>{
        const Icon = item.icon;
        const isActive = currentPage === item.key;
        return (<Button key={item.key} variant={isActive ? "default" : "ghost"} className={`w-full justify-start ${isActive ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-700 hover:bg-gray-100'}`} onClick={()=>handleNavigation(item.key)} data-spec-id={`nav-${item.key}`}>
                    <Icon className="w-4 h-4 mr-2" data-spec-id="NvApHsC6wAnIxOr5"/>
                    {item.label}
                  </Button>);
    })}
            
            {}
            <hr className="my-4 border-gray-200" data-spec-id="sidebar-separator"/>
            
            {}
            <Button variant="ghost" className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700" onClick={handleLogout} data-spec-id="sidebar-logout-button">
              <LogOut className="w-4 h-4 mr-2" data-spec-id="sidebar-logout-icon"/>
              Sair
            </Button>
          </nav>
        </aside>

        {}
        <main className="flex-1 p-2 md:p-6" data-spec-id="main-content">
          {children}
        </main>
      </div>
    </div>);
};
export default Layout;
