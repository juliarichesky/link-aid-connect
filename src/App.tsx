import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TicketsProvider } from "@/contexts/TicketsContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import TicketDetail from "./pages/TicketDetail";
import CreateTicket from "./pages/CreateTicket";
import Contacts from "./pages/Contacts";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Dentists from "./pages/Dentists";
import Financial from "./pages/Financial";
import History from "./pages/History";
import DentistComms from "./pages/DentistComms";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TicketsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/tickets" element={<Tickets />} />
                <Route path="/tickets/new" element={<CreateTicket />} />
                <Route path="/tickets/:id" element={<TicketDetail />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/history" element={<History />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/dentists" element={<Dentists />} />
                <Route path="/financial" element={<Financial />} />
                <Route path="/dentist-comms" element={<DentistComms />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </BrowserRouter>
        </TicketsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
