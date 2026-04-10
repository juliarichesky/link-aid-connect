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
  dentistResponsible?: string;
  updated: string;
  openedAt: string;
  phone: string;
  email: string;
  location: string;
  type: string;
  cpf: string;
  procedureDescription?: string;
  medications?: string;
  surgeryHistory?: string;
  chatMessages?: { from: string; text: string; time: string }[];
}

export interface TeamMember {
  name: string;
  role: string;
}

export interface Dentist {
  id: number;
  name: string;
  specialty: string;
  status: string;
  totalSlots: number;
  openSlots: number;
  phone: string;
  email: string;
  crm: string;
  location: string;
  uf: string;
  country: string;
  schedule: { day: string; time: string }[];
}

const initialTeam: TeamMember[] = [
  { name: "Carlos Silva", role: "Coordenador" },
  { name: "Ana Costa", role: "Assistente Social" },
  { name: "Maria Santos", role: "Atendente" },
  { name: "João Lima", role: "Atendente" },
  { name: "Paula Rocha", role: "Financeiro" },
  { name: "Lucas Mendes", role: "Voluntário" },
  { name: "Beatriz Alves", role: "Gestora" },
];

const initialDentists: Dentist[] = [
  { id: 1, name: "Dra. Fernanda Costa", specialty: "Ortodontia", status: "Ativo", totalSlots: 10, openSlots: 3, phone: "(41) 97777-6666", email: "fernanda@dentist.com", crm: "CRO-PR 12345", location: "Curitiba", uf: "PR", country: "Brasil", schedule: [{ day: "Segunda", time: "08:00-12:00" }, { day: "Quarta", time: "14:00-18:00" }, { day: "Sexta", time: "08:00-12:00" }] },
  { id: 2, name: "Dr. Ricardo Souza", specialty: "Endodontia", status: "Ativo", totalSlots: 8, openSlots: 0, phone: "(11) 96666-5555", email: "ricardo@dentist.com", crm: "CRO-SP 67890", location: "São Paulo", uf: "SP", country: "Brasil", schedule: [{ day: "Terça", time: "09:00-13:00" }, { day: "Quinta", time: "09:00-13:00" }] },
  { id: 3, name: "Dra. Julia Mendes", specialty: "Odontopediatria", status: "Inativo", totalSlots: 6, openSlots: 6, phone: "(21) 95555-4444", email: "julia@dentist.com", crm: "CRO-RJ 11111", location: "Rio de Janeiro", uf: "RJ", country: "Brasil", schedule: [] },
  { id: 4, name: "Dr. Marcos Lima", specialty: "Implantodontia", status: "Ativo", totalSlots: 12, openSlots: 5, phone: "(31) 94444-3333", email: "marcos@dentist.com", crm: "CRO-MG 22222", location: "Belo Horizonte", uf: "MG", country: "Brasil", schedule: [{ day: "Segunda", time: "14:00-18:00" }, { day: "Quarta", time: "08:00-12:00" }, { day: "Sexta", time: "14:00-18:00" }] },
  { id: 5, name: "Dra. Ana Ribeiro", specialty: "Periodontia", status: "Ativo", totalSlots: 8, openSlots: 2, phone: "(85) 93333-2222", email: "ana.r@dentist.com", crm: "CRO-CE 33333", location: "Fortaleza", uf: "CE", country: "Brasil", schedule: [{ day: "Terça", time: "14:00-18:00" }, { day: "Quinta", time: "14:00-18:00" }] },
  { id: 6, name: "Dr. Paulo Nascimento", specialty: "Cirurgia", status: "Ativo", totalSlots: 10, openSlots: 4, phone: "(51) 92222-1111", email: "paulo.n@dentist.com", crm: "CRO-RS 44444", location: "Porto Alegre", uf: "RS", country: "Brasil", schedule: [{ day: "Segunda", time: "08:00-12:00" }, { day: "Quinta", time: "14:00-18:00" }] },
  { id: 7, name: "Dra. Carla Dias", specialty: "Prótese", status: "Ativo", totalSlots: 6, openSlots: 1, phone: "(62) 91111-0000", email: "carla.d@dentist.com", crm: "CRO-GO 55555", location: "Goiânia", uf: "GO", country: "Brasil", schedule: [{ day: "Quarta", time: "08:00-12:00" }] },
  { id: 8, name: "Dr. Fernando Tavares", specialty: "Ortodontia", status: "Inativo", totalSlots: 8, openSlots: 8, phone: "(71) 90000-9999", email: "fernando.t@dentist.com", crm: "CRO-BA 66666", location: "Salvador", uf: "BA", country: "Brasil", schedule: [] },
];

const initialTickets: Ticket[] = [
  { id: "TKT-001", channel: "WhatsApp", sender: "Maria Oliveira", subject: "Dúvida sobre tratamento", classification: "Saúde", priority: "Alta", status: "Novo", responsible: "Carlos Silva", dentistResponsible: "Dra. Fernanda Costa", updated: "10 min", openedAt: "05/04/2025 14:28", phone: "(11) 99999-0000", email: "maria@email.com", location: "São Paulo, SP", type: "Beneficiário", cpf: "123.456.789-00" },
  { id: "TKT-002", channel: "E-mail", sender: "Instituto Sorria", subject: "Proposta de parceria", classification: "Parceria", priority: "Média", status: "Aberto", responsible: "Ana Costa", updated: "25 min", openedAt: "05/04/2025 13:45", phone: "(21) 3333-4444", email: "contato@sorria.org", location: "Rio de Janeiro, RJ", type: "Parceiro", cpf: "12.345.678/0001-00" },
  { id: "TKT-003", channel: "Instagram", sender: "João Santos", subject: "Solicitação de agendamento", classification: "Agendamento", priority: "Baixa", status: "Aguardando", responsible: "Maria Santos", dentistResponsible: "Dr. Marcos Lima", updated: "1h", openedAt: "05/04/2025 12:30", phone: "(31) 93333-4444", email: "joao.s@email.com", location: "Belo Horizonte, MG", type: "Beneficiário", cpf: "333.444.555-66" },
  { id: "TKT-004", channel: "WhatsApp", sender: "Pedro Almeida", subject: "Urgência odontológica", classification: "Emergência", priority: "Crítica", status: "Novo", responsible: "Carlos Silva", updated: "5 min", openedAt: "05/04/2025 14:50", phone: "(31) 95555-6666", email: "pedro.a@email.com", location: "Belo Horizonte, MG", type: "Beneficiário", cpf: "555.666.777-88" },
  { id: "TKT-005", channel: "E-mail", sender: "Fundação ABC", subject: "Doação mensal", classification: "Doação", priority: "Média", status: "Aberto", responsible: "Paula Rocha", updated: "2h", openedAt: "05/04/2025 11:00", phone: "(71) 3222-1111", email: "contato@fundacaoabc.org", location: "Salvador, BA", type: "Doador", cpf: "98.765.432/0001-00" },
  { id: "TKT-006", channel: "WhatsApp", sender: "Lucia Ferreira", subject: "Feedback pós-atendimento", classification: "Feedback", priority: "Baixa", status: "Aberto", responsible: "João Lima", dentistResponsible: "Dra. Ana Ribeiro", updated: "3h", openedAt: "05/04/2025 10:15", phone: "(85) 94444-5555", email: "lucia.f@email.com", location: "Fortaleza, CE", type: "Beneficiário", cpf: "444.555.666-77" },
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
  teamMembers: TeamMember[];
  dentists: Dentist[];
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  addTicket: (ticket: Ticket) => void;
  archiveTicket: (id: string) => void;
  addChatMessage: (id: string, message: { from: string; text: string; time: string }) => void;
  addDentist: (dentist: Dentist) => void;
  updateDentist: (id: number, updates: Partial<Dentist>) => void;
}

const TicketsContext = createContext<TicketsContextType | undefined>(undefined);

export function TicketsProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [dentists, setDentists] = useState<Dentist[]>(initialDentists);

  const updateTicket = (id: string, updates: Partial<Ticket>) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const updated = { ...t, ...updates };
        if (updates.status === "Resolvido") {
          updated.updated = "agora";
        }
        return updated;
      })
    );
  };

  const addTicket = (ticket: Ticket) => {
    setTickets((prev) => [ticket, ...prev]);
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

  const addDentist = (dentist: Dentist) => {
    setDentists((prev) => [...prev, dentist]);
  };

  const updateDentist = (id: number, updates: Partial<Dentist>) => {
    setDentists((prev) => prev.map((d) => d.id === id ? { ...d, ...updates } : d));
  };

  return (
    <TicketsContext.Provider value={{ tickets, contacts, teamMembers: initialTeam, dentists, updateTicket, addTicket, archiveTicket, addChatMessage, addDentist, updateDentist }}>
      {children}
    </TicketsContext.Provider>
  );
}

export function useTickets() {
  const ctx = useContext(TicketsContext);
  if (!ctx) throw new Error("useTickets must be used within TicketsProvider");
  return ctx;
}
