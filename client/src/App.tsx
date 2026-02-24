import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Trabalhistas from "./pages/Trabalhistas";
import Civeis from "./pages/Civeis";
import Tributario from "./pages/Tributario";
import Investidores from "./pages/Investidores";
import Documentos from "./pages/Documentos";
import Notificacoes from "./pages/Notificacoes";
import Timeline from "./pages/Timeline";
import Recados from "./pages/Recados";
import Emails from "./pages/Emails";
import PlanoAcao from "./pages/PlanoAcao";
import Login from "./pages/Login";
import { useAuth } from "./_core/hooks/useAuth";
import { Loader2 } from "lucide-react";

function AuthenticatedRouter() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/trabalhistas" component={Trabalhistas} />
        <Route path="/civeis" component={Civeis} />
        <Route path="/tributario" component={Tributario} />
        <Route path="/investidores" component={Investidores} />
        <Route path="/documentos" component={Documentos} />
        <Route path="/notificacoes" component={Notificacoes} />
        <Route path="/timeline" component={Timeline} />
        <Route path="/recados" component={Recados} />
        <Route path="/emails" component={Emails} />
        <Route path="/plano-acao" component={PlanoAcao} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function AppRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f0eb] via-[#ede8e2] to-[#e8e0d8]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#4a5a3a]" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route>
          <Login />
        </Route>
      </Switch>
    );
  }

  return <AuthenticatedRouter />;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <AppRouter />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
