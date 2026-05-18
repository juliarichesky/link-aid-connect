import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TicketsProvider } from "@/contexts/TicketsContext";
import { AuthProvider, useAuth, Role } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import TicketDetail from "./pages/TicketDetail";
import CreateTicket from "./pages/CreateTicket";
import Contacts from "./pages/Contacts";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Financial from "./pages/Financial";
import History from "./pages/History";
import DentistComms from "./pages/DentistComms";
import NewDentist from "./pages/NewDentist";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Routes allowed for "colaborador" role
const COLAB_ALLOWED = [
  "/tickets",
  "/history",
  "/contacts",
  "/dentists",
  "/dentist-comms",
];

function isColabAllowed(pathname: string) {
  if (pathname === "/tickets/new") return true;
  if (pathname.startsWith("/tickets/")) return true;
  return COLAB_ALLOWED.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: Role[] }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/tickets" replace />;
  if (user.role === "colaborador" && !isColabAllowed(location.pathname))
    return <Navigate to="/tickets" replace />;
  return <>{children}</>;
}

function RedirectDentistComms() {
  const location = useLocation();
  return <Navigate to={{ pathname: "/dentists", search: location.search }} replace />;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route
      path="/*"
      element={
        <ProtectedRoute>
          <AppLayout>
            <Routes>
              <Route path="/" element={<ProtectedRoute roles={["admin"]}><Dashboard /></ProtectedRoute>} />
              <Route path="/tickets" element={<Tickets />} />
              <Route path="/tickets/new" element={<CreateTicket />} />
              <Route path="/tickets/:id" element={<TicketDetail />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/reports" element={<ProtectedRoute roles={["admin"]}><Reports /></ProtectedRoute>} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<ProtectedRoute roles={["admin"]}><Settings /></ProtectedRoute>} />
              <Route path="/dentists" element={<DentistComms />} />
              <Route path="/dentists/new" element={<NewDentist />} />
              <Route path="/financial" element={<ProtectedRoute roles={["admin"]}><Financial /></ProtectedRoute>} />
              <Route path="/dentist-comms" element={<RedirectDentistComms />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </ProtectedRoute>
      }
    />
  </Routes>
);

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <TicketsProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TicketsProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
