import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X, Smartphone } from 'lucide-react';
interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
    }>;
}
const InstallPrompt: React.FC = ()=>{
    const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    useEffect(()=>{
        console.log('📱 Install Prompt: Verificando suporte PWA...');
        if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
            console.log('✅ Install Prompt: App já está instalado');
            setIsInstalled(true);
            return;
        }
        const handleBeforeInstallPrompt = (event: Event)=>{
            console.log('🚀 Install Prompt: Evento beforeinstallprompt capturado');
            event.preventDefault();
            setInstallPrompt(event as BeforeInstallPromptEvent);
            setTimeout(()=>{
                setShowPrompt(true);
            }, 3000);
        };
        const handleAppInstalled = ()=>{
            console.log('✅ Install Prompt: App foi instalado');
            setIsInstalled(true);
            setShowPrompt(false);
            setInstallPrompt(null);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);
        return ()=>{
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);
    const handleInstall = async ()=>{
        if (!installPrompt) return;
        console.log('📲 Install Prompt: Iniciando instalação...');
        try {
            await installPrompt.prompt();
            const choiceResult = await installPrompt.userChoice;
            console.log('👤 Install Prompt: Escolha do usuário:', choiceResult.outcome);
            if (choiceResult.outcome === 'accepted') {
                console.log('✅ Install Prompt: Instalação aceita');
                setShowPrompt(false);
            } else {
                console.log('❌ Install Prompt: Instalação recusada');
            }
            setInstallPrompt(null);
        } catch (error) {
            console.error('❌ Install Prompt: Erro na instalação:', error);
        }
    };
    const handleDismiss = ()=>{
        console.log('🔕 Install Prompt: Prompt ignorado pelo usuário');
        setShowPrompt(false);
        sessionStorage.setItem('installPromptDismissed', 'true');
    };
    if (isInstalled || !showPrompt || !installPrompt) {
        return null;
    }
    if (sessionStorage.getItem('installPromptDismissed')) {
        return null;
    }
    return (<div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50" data-spec-id="install-prompt-container">
      <Card className="border-2 border-blue-200 shadow-lg bg-gradient-to-r from-blue-50 to-white" data-spec-id="install-prompt-card">
        <CardContent className="p-4" data-spec-id="install-prompt-content">
          <div className="flex items-start gap-3" data-spec-id="install-prompt-layout">
            <div className="bg-blue-100 p-2 rounded-full" data-spec-id="install-prompt-icon-container">
              <Smartphone className="w-6 h-6 text-blue-600" data-spec-id="install-prompt-icon"/>
            </div>
            
            <div className="flex-1" data-spec-id="install-prompt-text">
              <h3 className="font-semibold text-gray-900 mb-1" data-spec-id="install-prompt-title">
                Instalar App no seu Dispositivo
              </h3>
              <p className="text-sm text-gray-600 mb-3" data-spec-id="install-prompt-description">
                Instale o app para acesso rápido, funcionamento offline e melhor experiência móvel.
              </p>
              
              <div className="flex gap-2" data-spec-id="install-prompt-buttons">
                <Button onClick={handleInstall} size="sm" className="bg-blue-600 hover:bg-blue-700" data-spec-id="install-button">
                  <Download className="w-4 h-4 mr-2" data-spec-id="install-button-icon"/>
                  Instalar
                </Button>
                
                <Button onClick={handleDismiss} size="sm" variant="outline" className="text-gray-600" data-spec-id="dismiss-button">
                  Agora Não
                </Button>
              </div>
            </div>
            
            <Button onClick={handleDismiss} size="sm" variant="ghost" className="p-1 h-auto text-gray-400 hover:text-gray-600" data-spec-id="close-button">
              <X className="w-4 h-4" data-spec-id="close-button-icon"/>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>);
};
export default InstallPrompt;
