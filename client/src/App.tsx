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

function Router() {
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
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
