import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  linkAidApi,
  type ApiContatoResponse,
  type ApiContatoRequest,
  type ApiDentistaResponse,
  type ApiTicketRequest,
  type ApiTicketResponse,
  type ApiTicketUpdateRequest,
  type ApiUsuarioResponse,
} from "@/lib/linkaidApi";
import {
  canalCodigo,
  canalLabel,
  classificacaoCodigo,
  classificacaoLabel,
  dentistaStatusCodigo,
  dentistaStatusLabel,
  perfilLabel,
  prioridadeCodigo,
  PRIORIDADE_LABELS,
  prioridadeLabel,
  type PrioridadeLabel,
  statusTicketCodigo,
  statusTicketLabel,
  tipoContatoCodigo,
  tipoContatoRegistroLabel,
} from "@/lib/linkaidMappings";

export type Priority = PrioridadeLabel;

export interface Ticket {
  id: string;
  protocol?: string;
  idContato?: number;
  channel: string;
  sender: string;
  subject: string;
  description?: string;
  aiSummary?: string;
  aiConfidence?: number;
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
  messagesLoaded?: boolean;
  chatMessages?: { from: string; text: string; time: string }[];
}

export interface TeamMember {
  id?: number;
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
  { name: "Lucas Mendes", role: "Dentista voluntário" },
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
  { id: "TKT-001", channel: "WhatsApp", sender: "Maria Oliveira", subject: "Dúvida sobre tratamento", classification: "Saúde", priority: "Alta", status: "Novo", responsible: "Carlos Silva", dentistResponsible: "Dra. Fernanda Costa", updated: "10 min", openedAt: "05/04/2025 14:28", phone: "(11) 99999-0000", email: "maria@email.com", location: "São Paulo, SP", type: "Solicitante", cpf: "123.456.789-00" },
  { id: "TKT-002", channel: "E-mail", sender: "Instituto Sorria", subject: "Proposta de parceria", classification: "Parceria", priority: "Média", status: "Aberto", responsible: "Ana Costa", updated: "25 min", openedAt: "05/04/2025 13:45", phone: "(21) 3333-4444", email: "contato@sorria.org", location: "Rio de Janeiro, RJ", type: "Parceiro", cpf: "12.345.678/0001-00" },
  { id: "TKT-003", channel: "Instagram", sender: "João Santos", subject: "Solicitação de agendamento", classification: "Agendamento", priority: "Baixa", status: "Aguardando", responsible: "Maria Santos", dentistResponsible: "Dr. Marcos Lima", updated: "1h", openedAt: "05/04/2025 12:30", phone: "(31) 93333-4444", email: "joao.s@email.com", location: "Belo Horizonte, MG", type: "Solicitante", cpf: "333.444.555-66" },
  { id: "TKT-004", channel: "WhatsApp", sender: "Pedro Almeida", subject: "Urgência odontológica", classification: "Saúde", priority: "Crítica", status: "Novo", responsible: "Carlos Silva", updated: "5 min", openedAt: "05/04/2025 14:50", phone: "(31) 95555-6666", email: "pedro.a@email.com", location: "Belo Horizonte, MG", type: "Solicitante", cpf: "555.666.777-88" },
  { id: "TKT-005", channel: "E-mail", sender: "Fundação ABC", subject: "Doação mensal", classification: "Doação", priority: "Média", status: "Aberto", responsible: "Paula Rocha", updated: "2h", openedAt: "05/04/2025 11:00", phone: "(71) 3222-1111", email: "contato@fundacaoabc.org", location: "Salvador, BA", type: "Doador", cpf: "98.765.432/0001-00" },
  { id: "TKT-006", channel: "WhatsApp", sender: "Lucia Ferreira", subject: "Feedback pós-atendimento", classification: "Feedback", priority: "Baixa", status: "Aberto", responsible: "João Lima", dentistResponsible: "Dra. Ana Ribeiro", updated: "3h", openedAt: "05/04/2025 10:15", phone: "(85) 94444-5555", email: "lucia.f@email.com", location: "Fortaleza, CE", type: "Solicitante", cpf: "444.555.666-77" },
  { id: "TKT-007", channel: "Outro", sender: "CREAS Regional", subject: "Encaminhamento social", classification: "Social", priority: "Alta", status: "Novo", responsible: "Ana Costa", updated: "15 min", openedAt: "05/04/2025 14:00", phone: "(62) 3111-0000", email: "creas@gov.br", location: "Goiânia, GO", type: "Parceiro", cpf: "-" },
  { id: "TKT-008", channel: "WhatsApp", sender: "Roberto Dias", subject: "Agendar retorno", classification: "Agendamento", priority: "Baixa", status: "Aguardando", responsible: "Maria Santos", updated: "4h", openedAt: "05/04/2025 09:00", phone: "(51) 92222-1111", email: "roberto.d@email.com", location: "Porto Alegre, RS", type: "Solicitante", cpf: "666.777.888-99" },
  { id: "TKT-009", channel: "E-mail", sender: "Empresa XYZ", subject: "Patrocínio mensal", classification: "Doação", priority: "Média", status: "Aberto", responsible: "Paula Rocha", updated: "5h", openedAt: "05/04/2025 08:00", phone: "(11) 4444-5555", email: "contato@xyz.com", location: "São Paulo, SP", type: "Doador", cpf: "11.222.333/0001-44" },
  { id: "TKT-010", channel: "Instagram", sender: "Carla Nunes", subject: "Informação sobre voluntariado odontológico", classification: "Social", priority: "Baixa", status: "Novo", responsible: "Ana Costa", updated: "6h", openedAt: "05/04/2025 07:30", phone: "(21) 98888-7777", email: "carla.n@email.com", location: "Rio de Janeiro, RJ", type: "Dentista", cpf: "777.888.999-00" },
  { id: "TKT-011", channel: "WhatsApp", sender: "Fernando Tavares", subject: "Dor de dente aguda", classification: "Saúde", priority: "Crítica", status: "Novo", responsible: "Carlos Silva", updated: "2 min", openedAt: "05/04/2025 14:55", phone: "(71) 91111-0000", email: "fernando.t@email.com", location: "Salvador, BA", type: "Solicitante", cpf: "888.999.000-11" },
  { id: "TKT-012", channel: "E-mail", sender: "Prefeitura Municipal", subject: "Convênio público", classification: "Parceria", priority: "Alta", status: "Aberto", responsible: "Ana Costa", updated: "1h", openedAt: "05/04/2025 13:00", phone: "(31) 3333-2222", email: "prefeitura@gov.br", location: "Belo Horizonte, MG", type: "Parceiro", cpf: "18.720.000/0001-55" },
];

export interface Contact {
  id?: number;
  name: string;
  phone: string;
  email: string;
  cpf: string;
  location: string;
  type: string;
  observation?: string;
}

interface TicketsContextType {
  tickets: Ticket[];
  contacts: Contact[];
  teamMembers: TeamMember[];
  dentists: Dentist[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadTicket: (id: string) => Promise<Ticket | void>;
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<void>;
  updateContact: (contact: Contact, previousContact?: Contact) => Promise<Contact | void>;
  addTicket: (ticket: Ticket) => Promise<Ticket | void>;
  archiveTicket: (id: string) => Promise<void>;
  releasePhoneForTesting: (id: string) => Promise<Ticket | void>;
  addChatMessage: (id: string, message: { from: string; text: string; time: string }) => Promise<void>;
  addDentist: (dentist: Dentist) => Promise<Dentist | void>;
  updateDentist: (id: number, updates: Partial<Dentist>) => Promise<void>;
}

const isRemoteId = (id: string | number) => /^\d+$/.test(String(id));

const onlyDigits = (value?: string) => value?.replace(/\D/g, "") || undefined;

const fakePhoneForTesting = (id: string) => {
  const idSegment = onlyDigits(id)?.slice(-6).padStart(6, "0") || "000000";
  const timeSegment = String(Date.now()).slice(-6);
  const randomSegment = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  return `+55990${idSegment}${timeSegment}${randomSegment}`;
};

const splitLocation = (location?: string) => {
  const [city, uf] = (location || "").split(",").map((part) => part.trim());
  return { city: city || undefined, uf: uf || undefined };
};

const formatDateTime = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTime = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

const messageSenderFromApi = (tipoRemetente: string) => {
  const tipo = tipoRemetente.toUpperCase();
  if (tipo === "CONTATO") return "client";
  if (tipo === "IA") return "ai";
  return "agent";
};

const legacyAiReply = (ticket: ApiTicketResponse) => {
  const base = "Recebemos sua mensagem e abrimos uma triagem no LinkAid. Nossa equipe vai analisar e continuar o atendimento.";
  return ticket.protocolo ? `${base}\n\nProtocolo LinkAid: ${ticket.protocolo}` : base;
};

const apiMessageText = (ticket: ApiTicketResponse, mensagem: { tipoRemetente: string; mensagem: string }) => {
  const isLegacyAiSummary =
    mensagem.tipoRemetente.toUpperCase() === "IA" &&
    ticket.resumoIa?.trim() &&
    mensagem.mensagem.trim() === ticket.resumoIa.trim();

  return isLegacyAiSummary ? legacyAiReply(ticket) : mensagem.mensagem;
};

const apiTicketToTicket = (ticket: ApiTicketResponse, messagesLoaded = true): Ticket => {
  const contato = ticket.contato;
  const cidadeUf = [contato?.cidade, contato?.uf].filter(Boolean).join(", ");
  return {
    id: String(ticket.idTicket),
    protocol: ticket.protocolo,
    idContato: contato?.idContato,
    channel: canalLabel(ticket.canalCodigo) || ticket.canalNome || "",
    sender: contato?.nome || "Contato sem nome",
    subject: ticket.assunto,
    description: ticket.descricao,
    aiSummary: ticket.resumoIa,
    aiConfidence: ticket.confiancaIa,
    classification: classificacaoLabel(ticket.classificacaoCodigo) || ticket.classificacaoNome || "Geral",
    priority: (prioridadeLabel(ticket.prioridadeCodigo) || PRIORIDADE_LABELS.MEDIA) as Priority,
    status: statusTicketLabel(ticket.statusCodigo) || ticket.statusNome || "Novo",
    responsible: ticket.responsavel?.nome || "Sem responsável",
    dentistResponsible: ticket.dentistaResponsavel?.nome,
    updated: formatDateTime(ticket.dataAtualizacao) || "agora",
    openedAt: formatDateTime(ticket.dataAbertura),
    phone: contato?.telefone || "",
    email: contato?.email || "",
    location: cidadeUf,
    type: tipoContatoRegistroLabel(contato?.tipoContatoCodigo, contato?.tipoContatoNome) || "Solicitante",
    cpf: contato?.documento || "-",
    messagesLoaded,
    chatMessages: messagesLoaded ? (ticket.mensagens ?? []).map((mensagem) => ({
      from: messageSenderFromApi(mensagem.tipoRemetente),
      text: apiMessageText(ticket, mensagem),
      time: formatTime(mensagem.dataMensagem),
    })) : undefined,
  };
};

const apiContatoToContact = (contato: ApiContatoResponse): Contact => ({
  id: contato.idContato,
  name: contato.nome,
  phone: contato.telefone || "",
  email: contato.email || "",
  cpf: contato.documento || "-",
  location: [contato.cidade, contato.uf].filter(Boolean).join(", "),
  type: tipoContatoRegistroLabel(contato.tipoContatoCodigo, contato.tipoContatoNome) || "Solicitante",
  observation: contato.observacao || "",
});

const apiDentistaToDentist = (dentista: ApiDentistaResponse): Dentist => ({
  id: dentista.idDentista,
  name: dentista.nome,
  specialty: dentista.especialidade,
  status: dentistaStatusLabel(dentista.status) || dentista.status,
  totalSlots: 0,
  openSlots: 0,
  phone: dentista.telefone || "",
  email: dentista.email || "",
  crm: dentista.cro,
  location: dentista.cidade || "",
  uf: dentista.uf || "",
  country: "Brasil",
  schedule: [],
});

const apiUsuarioToTeamMember = (usuario: ApiUsuarioResponse): TeamMember => ({
  id: usuario.idUsuario,
  name: usuario.nome,
  role: perfilLabel(usuario.perfil) || usuario.perfil,
});

const TicketsContext = createContext<TicketsContextType | undefined>(undefined);

export function TicketsProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [dentists, setDentists] = useState<Dentist[]>(initialDentists);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeam);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) {
      setTickets(initialTickets);
      setContacts([]);
      setDentists(initialDentists);
      setTeamMembers(initialTeam);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [apiTickets, apiDentists, apiUsuarios, apiContatos] = await Promise.all([
        linkAidApi.listarTickets(token),
        linkAidApi.listarDentistas(token),
        linkAidApi.listarUsuarios(token),
        linkAidApi.listarContatos(token),
      ]);

      const listedTickets = apiTickets.map((ticket) => apiTicketToTicket(ticket, false));
      setTickets((previousTickets) =>
        listedTickets.map((ticket) => {
          const previous = previousTickets.find((item) => item.id === ticket.id);
          if (!previous?.messagesLoaded) return ticket;

          return {
            ...ticket,
            messagesLoaded: true,
            chatMessages: previous.chatMessages,
          };
        }),
      );
      setDentists(apiDentists.map(apiDentistaToDentist));
      setTeamMembers(apiUsuarios.map(apiUsuarioToTeamMember));
      setContacts(apiContatos.map(apiContatoToContact));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Falha ao carregar dados da API.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const upsertTicket = useCallback((ticket: Ticket) => {
    setTickets((prev) => {
      const exists = prev.some((item) => item.id === ticket.id);
      return exists
        ? prev.map((item) => (item.id === ticket.id ? ticket : item))
        : [ticket, ...prev];
    });
  }, []);

  const loadTicket = useCallback(async (id: string) => {
    if (!token || !isRemoteId(id)) return;

    try {
      const apiTicket = await linkAidApi.buscarTicket(token, id);
      const mapped = apiTicketToTicket(apiTicket, true);
      upsertTicket(mapped);
      return mapped;
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Falha ao carregar ticket.");
      throw loadError;
    }
  }, [token, upsertTicket]);

  const buildTicketRequest = (ticket: Ticket): ApiTicketRequest => {
    const { city, uf } = splitLocation(ticket.location);
    const responsavel = teamMembers.find((member) => member.name === ticket.responsible);
    const dentista = dentists.find((item) => item.name === ticket.dentistResponsible);

    return {
      idContato: ticket.idContato,
      nomeContato: ticket.sender,
      documentoContato: onlyDigits(ticket.cpf),
      emailContato: ticket.email || undefined,
      telefoneContato: onlyDigits(ticket.phone),
      tipoContatoCodigo: tipoContatoCodigo(ticket.type) || "SOLICITANTE",
      cidadeContato: city,
      ufContato: uf,
      canalCodigo: canalCodigo(ticket.channel) || "MANUAL",
      prioridadeCodigo: prioridadeCodigo(ticket.priority) || "MEDIA",
      classificacaoCodigo: classificacaoCodigo(ticket.classification) || "GERAL",
      idUsuarioResponsavel: responsavel?.id,
      idDentistaResponsavel: dentista?.id,
      assunto: ticket.subject,
      descricao: ticket.description || ticket.subject,
    };
  };

  const buildTicketUpdateRequest = (updates: Partial<Ticket>): ApiTicketUpdateRequest => {
    const body: ApiTicketUpdateRequest = {};
    if (updates.channel) body.canalCodigo = canalCodigo(updates.channel);
    if (updates.status) body.statusCodigo = statusTicketCodigo(updates.status);
    if (updates.priority) body.prioridadeCodigo = prioridadeCodigo(updates.priority);
    if (updates.classification) body.classificacaoCodigo = classificacaoCodigo(updates.classification);
    if (updates.responsible) {
      body.idUsuarioResponsavel = teamMembers.find((member) => member.name === updates.responsible)?.id;
    }
    if (updates.dentistResponsible) {
      body.idDentistaResponsavel = dentists.find((dentist) => dentist.name === updates.dentistResponsible)?.id;
    }
    if (updates.subject) body.assunto = updates.subject;
    if (updates.description) body.descricao = updates.description;
    return Object.fromEntries(Object.entries(body).filter(([, value]) => value !== undefined));
  };

  const buildDentistaRequest = (dentist: Dentist) => ({
    nome: dentist.name,
    cro: dentist.crm,
    especialidade: dentist.specialty,
    email: dentist.email || undefined,
    telefone: onlyDigits(dentist.phone),
    cidade: dentist.location || undefined,
    uf: dentist.uf || undefined,
    status: dentistaStatusCodigo(dentist.status) || "A",
  });

  const buildContactRequest = (contact: Contact): ApiContatoRequest => {
    const { city, uf } = splitLocation(contact.location);
    return {
      nome: contact.name,
      documento: onlyDigits(contact.cpf),
      email: contact.email || undefined,
      telefone: onlyDigits(contact.phone),
      tipoContatoCodigo: tipoContatoCodigo(contact.type) || "SOLICITANTE",
      cidade: city,
      uf,
      observacao: contact.observation || undefined,
    };
  };

  const sameContactIdentity = (contact: Contact, reference?: Contact) => {
    if (!reference) return false;
    if (contact.id && reference.id && contact.id === reference.id) return true;
    if (contact.cpf && contact.cpf !== "-" && reference.cpf && reference.cpf !== "-") {
      return onlyDigits(contact.cpf) === onlyDigits(reference.cpf);
    }
    return contact.name === reference.name;
  };

  const ticketBelongsToContact = (ticket: Ticket, contact: Contact, previousContact?: Contact) => {
    if (contact.id && ticket.idContato === contact.id) return true;
    if (previousContact?.id && ticket.idContato === previousContact.id) return true;

    const ticketDocument = onlyDigits(ticket.cpf);
    const currentDocument = onlyDigits(contact.cpf);
    const previousDocument = onlyDigits(previousContact?.cpf);
    if (ticketDocument && ticketDocument !== onlyDigits("-")) {
      return ticketDocument === currentDocument || ticketDocument === previousDocument;
    }

    return ticket.sender === previousContact?.name || ticket.sender === contact.name;
  };

  const applyContactLocally = (contact: Contact, previousContact?: Contact) => {
    setContacts((prev) => {
      const exists = prev.some((item) => sameContactIdentity(item, previousContact || contact));
      if (!exists) return [...prev, contact];

      return prev.map((item) =>
        sameContactIdentity(item, previousContact || contact) ? { ...item, ...contact } : item,
      );
    });
    setTickets((prev) =>
      prev.map((ticket) =>
        ticketBelongsToContact(ticket, contact, previousContact)
          ? {
              ...ticket,
              idContato: contact.id ?? ticket.idContato,
              sender: contact.name,
              type: contact.type,
              location: contact.location,
              phone: contact.phone,
              email: contact.email,
              cpf: contact.cpf,
            }
          : ticket,
      ),
    );
  };

  const updateTicket = async (id: string, updates: Partial<Ticket>) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const updated = { ...t, ...updates };
        if (updates.status === "Resolvido" || updates.status === "Arquivado") {
          updated.updated = "agora";
        }
        return updated;
      }),
    );

    if (!token || !isRemoteId(id)) return;

    const body = buildTicketUpdateRequest(updates);
    if (Object.keys(body).length === 0) return;

    try {
      const updated = await linkAidApi.atualizarTicket(token, id, body);
      const mapped = apiTicketToTicket(updated);
      upsertTicket(mapped);
      if (mapped.idContato) {
        setContacts((prev) =>
          prev.map((contact) =>
            contact.id === mapped.idContato ? { ...contact, name: mapped.sender } : contact
          )
        );
      }
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Falha ao atualizar ticket.");
      throw updateError;
    }
  };

  const updateContact = async (contact: Contact, previousContact?: Contact) => {
    if (token && contact.id) {
      try {
        const saved = await linkAidApi.atualizarContato(token, contact.id, buildContactRequest(contact));
        const mapped = apiContatoToContact(saved);
        applyContactLocally(mapped, previousContact || contact);
        return mapped;
      } catch (contactError) {
        setError(contactError instanceof Error ? contactError.message : "Falha ao atualizar contato.");
        throw contactError;
      }
    }

    applyContactLocally(contact, previousContact);
    return contact;
  };

  const addTicket = async (ticket: Ticket) => {
    if (token) {
      try {
        const created = await linkAidApi.criarTicket(token, buildTicketRequest(ticket));
        const mapped = apiTicketToTicket(created);
        upsertTicket(mapped);
        return mapped;
      } catch (createError) {
        setError(createError instanceof Error ? createError.message : "Falha ao criar ticket.");
        throw createError;
      }
    }

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
    return ticket;
  };

  const archiveTicket = async (id: string) => {
    if (token && isRemoteId(id)) {
      try {
        const updated = await linkAidApi.arquivarTicket(token, id);
        upsertTicket(apiTicketToTicket(updated));
        return;
      } catch (archiveError) {
        setError(archiveError instanceof Error ? archiveError.message : "Falha ao arquivar ticket.");
        throw archiveError;
      }
    }

    setTickets((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: "Resolvido", updated: "agora" } : t
      )
    );
  };

  const releasePhoneForTesting = async (id: string) => {
    if (token && isRemoteId(id)) {
      try {
        const updated = await linkAidApi.liberarTelefoneTeste(token, id);
        const mapped = apiTicketToTicket(updated);
        upsertTicket(mapped);
        setContacts((prev) =>
          prev.map((contact) =>
            contact.id === mapped.idContato ? { ...contact, phone: mapped.phone } : contact
          )
        );
        return mapped;
      } catch (releaseError) {
        setError(releaseError instanceof Error ? releaseError.message : "Falha ao liberar telefone para teste.");
        throw releaseError;
      }
    }

    const fakePhone = fakePhoneForTesting(id);
    let updatedTicket: Ticket | undefined;
    setTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.id !== id) return ticket;
        const nextTicket = { ...ticket, phone: fakePhone, updated: "agora" };
        updatedTicket = nextTicket;
        return nextTicket;
      })
    );
    return updatedTicket;
  };

  const addChatMessage = async (id: string, message: { from: string; text: string; time: string }) => {
    if (token && isRemoteId(id)) {
      try {
        const tipoRemetente = message.from === "client" ? "CONTATO" : message.from === "ai" ? "IA" : "ATENDENTE";
        const created = await linkAidApi.adicionarMensagem(token, id, message.text, tipoRemetente);
        message = {
          from: messageSenderFromApi(created.tipoRemetente),
          text: created.mensagem,
          time: formatTime(created.dataMensagem),
        };
      } catch (messageError) {
        setError(messageError instanceof Error ? messageError.message : "Falha ao adicionar mensagem.");
        throw messageError;
      }
    }

    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, messagesLoaded: true, chatMessages: [...(t.chatMessages || []), message] }
          : t
      )
    );
  };

  const addDentist = async (dentist: Dentist) => {
    if (token) {
      try {
        const created = await linkAidApi.criarDentista(token, buildDentistaRequest(dentist));
        const mapped = apiDentistaToDentist(created);
        setDentists((prev) => [...prev, mapped]);
        return mapped;
      } catch (dentistError) {
        setError(dentistError instanceof Error ? dentistError.message : "Falha ao cadastrar dentista.");
        throw dentistError;
      }
    }

    setDentists((prev) => [...prev, dentist]);
    return dentist;
  };

  const updateDentist = async (id: number, updates: Partial<Dentist>) => {
    const current = dentists.find((dentist) => dentist.id === id);
    const updated = current ? { ...current, ...updates } : undefined;
    setDentists((prev) => prev.map((d) => d.id === id ? { ...d, ...updates } : d));

    if (!token || !updated) return;

    try {
      const saved = await linkAidApi.atualizarDentista(token, id, buildDentistaRequest(updated));
      setDentists((prev) => prev.map((dentist) => dentist.id === id ? apiDentistaToDentist(saved) : dentist));
    } catch (dentistError) {
      setError(dentistError instanceof Error ? dentistError.message : "Falha ao atualizar dentista.");
      throw dentistError;
    }
  };

  return (
    <TicketsContext.Provider value={{ tickets, contacts, teamMembers, dentists, loading, error, refresh, loadTicket, updateTicket, updateContact, addTicket, archiveTicket, releasePhoneForTesting, addChatMessage, addDentist, updateDentist }}>
      {children}
    </TicketsContext.Provider>
  );
}

export function useTickets() {
  const ctx = useContext(TicketsContext);
  if (!ctx) throw new Error("useTickets must be used within TicketsProvider");
  return ctx;
}
