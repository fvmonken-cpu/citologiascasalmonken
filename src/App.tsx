import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import InstallPrompt from "@/components/InstallPrompt";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import "./App.css";
const queryClient = new QueryClient();
const App = ()=>(<QueryClientProvider client={queryClient} data-spec-id="pBzaC8ICygXnT8fk">
    <AuthProvider data-spec-id="j3hCZG7FMoq3MLp8">
      <TooltipProvider data-spec-id="DVYqCtR8VcIwokin">
        <Toaster data-spec-id="oRYEhD7BXEfTLlZV"/>
        <BrowserRouter data-spec-id="T75jR3OfqQdFFJda">
          <Routes data-spec-id="3sHtfxUtOqNETfL9">
            <Route path="/specai-page/Index" element={<Index data-spec-id="j3IZrqRGaMYqOJsm"/>} data-spec-id="L3Odjc3DubYoRiQR"/>
            <Route path="/specai-page/NotFound" element={<NotFound data-spec-id="PaRApXuZY0mLIjuj"/>} data-spec-id="5wRjMXKrRCAtaTUJ"/>

            <Route path="/" element={<Index data-dora-id="1" data-spec-id="EHTyselsphErRdf0"/>} data-spec-id="7QSMHl1r42XAgaNk"/>
            {}
            <Route path="*" element={<NotFound data-spec-id="VNvcO19HuDp2h6wo"/>} data-spec-id="A5Aa8LYUNRZO1BdJ"/>
          </Routes>
        </BrowserRouter>
        
        {}
        <InstallPrompt data-spec-id="pwa-install-prompt"/>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>);
export default App;
