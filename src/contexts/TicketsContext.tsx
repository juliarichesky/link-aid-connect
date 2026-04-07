import { createContext, useContext, useState, ReactNode } from "react";

export type Priority = "Crítica" | "Alta" | "Média" | "Baixa";

export interface Ticket {
  id: string;
  channel: string;
  sender: string;
  subject: string;
  classification: string;
  priority: Priority;
  status: string;
  responsible: string;
  updated: string;
  openedAt: string;
  phone: string;
  email: string;
  location: string;
  type: string;
  cpf: string;
  // Clinical details (for history)
  procedureDescription?: string;
  medications?: string;
  surgeryHistory?: string;
  // Chat messages
  chatMessages?: { from: string; text: string; time: string }[];
}

const initialTickets: Ticket[] = [
  { id: "TKT-001", channel: "WhatsApp", sender: "Maria Oliveira", subject: "Dúvida sobre tratamento", classification: "Saúde", priority: "Alta", status: "Novo", responsible: "Carlos Silva", updated: "10 min", openedAt: "05/04/2025 14:28", phone: "(11) 99999-0000", email: "maria@email.com", location: "São Paulo, SP", type: "Beneficiário", cpf: "123.456.789-00" },
  { id: "TKT-002", channel: "E-mail", sender: "Instituto Sorria", subject: "Proposta de parceria", classification: "Parceria", priority: "Média", status: "Aberto", responsible: "Ana Costa", updated: "25 min", openedAt: "05/04/2025 13:45", phone: "(21) 3333-4444", email: "contato@sorria.org", location: "Rio de Janeiro, RJ", type: "Parceiro", cpf: "12.345.678/0001-00" },
  { id: "TKT-003", channel: "Instagram", sender: "João Santos", subject: "Solicitação de agendamento", classification: "Agendamento", priority: "Baixa", status: "Aguardando", responsible: "Maria Santos", updated: "1h", openedAt: "05/04/2025 12:30", phone: "(31) 93333-4444", email: "joao.s@email.com", location: "Belo Horizonte, MG", type: "Beneficiário", cpf: "333.444.555-66" },
  { id: "TKT-004", channel: "WhatsApp", sender: "Pedro Almeida", subject: "Urgência odontológica", classification: "Emergência", priority: "Crítica", status: "Novo", responsible: "Carlos Silva", updated: "5 min", openedAt: "05/04/2025 14:50", phone: "(31) 95555-6666", email: "pedro.a@email.com", location: "Belo Horizonte, MG", type: "Beneficiário", cpf: "555.666.777-88" },
  { id: "TKT-005", channel: "E-mail", sender: "Fundação ABC", subject: "Doação mensal", classification: "Doação", priority: "Média", status: "Aberto", responsible: "Paula Rocha", updated: "2h", openedAt: "05/04/2025 11:00", phone: "(71) 3222-1111", email: "contato@fundacaoabc.org", location: "Salvador, BA", type: "Doador", cpf: "98.765.432/0001-00" },
  { id: "TKT-006", channel: "WhatsApp", sender: "Lucia Ferreira", subject: "Feedback pós-atendimento", classification: "Feedback", priority: "Baixa", status: "Aberto", responsible: "João Lima", updated: "3h", openedAt: "05/04/2025 10:15", phone: "(85) 94444-5555", email: "lucia.f@email.com", location: "Fortaleza, CE", type: "Beneficiário", cpf: "444.555.666-77" },
  { id: "TKT-007", channel: "Outro", sender: "CREAS Regional", subject: "Encaminhamento social", classification: "Social", priority: "Alta", status: "Novo", responsible: "Ana Costa", updated: "15 min", openedAt: "05/04/2025 14:00", phone: "(62) 3111-0000", email: "creas@gov.br", location: "Goiânia, GO", type: "Parceiro", cpf: "-" },
  { id: "TKT-008", channel: "WhatsApp", sender: "Roberto Dias", subject: "Agendar retorno", classification: "Agendamento", priority: "Baixa", status: "Aguardando", responsible: "Maria Santos", updated: "4h", openedAt: "05/04/2025 09:00", phone: "(51) 92222-1111", email: "roberto.d@email.com", location: "Porto Alegre, RS", type: "Beneficiário", cpf: "666.777.888-99" },
  { id: "TKT-009", channel: "E-mail", sender: "Empresa XYZ", subject: "Patrocínio mensal", classification: "Doação", priority: "Média", status: "Aberto", responsible: "Paula Rocha", updated: "5h", openedAt: "05/04/2025 08:00", phone: "(11) 4444-5555", email: "contato@xyz.com", location: "São Paulo, SP", type: "Doador", cpf: "11.222.333/0001-44" },
  { id: "TKT-010", channel: "Instagram", sender: "Carla Nunes", subject: "Informação sobre voluntariado", classification: "Social", priority: "Baixa", status: "Novo", responsible: "Ana Costa", updated: "6h", openedAt: "05/04/2025 07:30", phone: "(21) 98888-7777", email: "carla.n@email.com", location: "Rio de Janeiro, RJ", type: "Voluntário", cpf: "777.888.999-00" },
  { id: "TKT-011", channel: "WhatsApp", sender: "Fernando Tavares", subject: "Dor de dente aguda", classification: "Emergência", priority: "Crítica", status: "Novo", responsible: "Carlos Silva", updated: "2 min", openedAt: "05/04/2025 14:55", phone: "(71) 91111-0000", email: "fernando.t@email.com", location: "Salvador, BA", type: "Beneficiário", cpf: "888.999.000-11" },
  { id: "TKT-012", channel: "E-mail", sender: "Prefeitura Municipal", subject: "Convênio público", classification: "Parceria", priority: "Alta", status: "Aberto", responsible: "Ana Costa", updated: "1h", openedAt: "05/04/2025 13:00", phone: "(31) 3333-2222", email: "prefeitura@gov.br", location: "Belo Horizonte, MG", type: "Parceiro", cpf: "18.720.000/0001-55" },
];

interface Contact {
  name: string;
  phone: string;
  email: string;
  cpf: string;
  location: string;
  type: string;
}

interface TicketsContextType {
  tickets: Ticket[];
  contacts: Contact[];
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  addTicket: (ticket: Ticket) => void;
  archiveTicket: (id: string) => void;
  addChatMessage: (id: string, message: { from: string; text: string; time: string }) => void;
}

const TicketsContext = createContext<TicketsContextType | undefined>(undefined);

export function TicketsProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [contacts, setContacts] = useState<Contact[]>([]);

  const updateTicket = (id: string, updates: Partial<Ticket>) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const updated = { ...t, ...updates };
        // If status changed to Resolvido, auto-mark
        if (updates.status === "Resolvido") {
          updated.updated = "agora";
        }
        return updated;
      })
    );
  };

  const addTicket = (ticket: Ticket) => {
    setTickets((prev) => [ticket, ...prev]);
    // Auto-add contact if not exists
    const exists = contacts.some((c) => c.cpf === ticket.cpf) || 
                   initialTickets.some((t) => t.cpf === ticket.cpf);
    if (!exists && ticket.cpf && ticket.cpf !== "-") {
      setContacts((prev) => [...prev, {
        name: ticket.sender,
        phone: ticket.phone,
        email: ticket.email,
        cpf: ticket.cpf,
        location: ticket.location,
        type: ticket.type,
      }]);
    }
  };

  const archiveTicket = (id: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: "Resolvido", updated: "agora" } : t
      )
    );
  };

  const addChatMessage = (id: string, message: { from: string; text: string; time: string }) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, chatMessages: [...(t.chatMessages || []), message] }
          : t
      )
    );
  };

  return (
    <TicketsContext.Provider value={{ tickets, contacts, updateTicket, addTicket, archiveTicket, addChatMessage }}>
      {children}
    </TicketsContext.Provider>
  );
}

export function useTickets() {
  const ctx = useContext(TicketsContext);
  if (!ctx) throw new Error("useTickets must be used within TicketsProvider");
  return ctx;
}
