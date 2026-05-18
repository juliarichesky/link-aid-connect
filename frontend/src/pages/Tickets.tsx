import { useState } from "react";
import { Search, Plus, Archive, MessageCircle, Instagram, Mail, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/classnames";
import { useNavigate } from "react-router-dom";
import { useTickets, type Priority, type Ticket } from "@/contexts/TicketsContext";
import { CANAL_LABELS, PRIORIDADE_LABELS, TIPO_CONTATO_LABELS } from "@/lib/linkaidMappings";
import { toast } from "sonner";

const channelIcon: Record<string, React.ElementType> = {
  [CANAL_LABELS.WHATSAPP]: MessageCircle,
  [CANAL_LABELS.INSTAGRAM]: Instagram,
  [CANAL_LABELS.EMAIL]: Mail,
  [CANAL_LABELS.MANUAL]: MoreHorizontal,
};

const channelColors: Record<string, string> = {
  [CANAL_LABELS.WHATSAPP]: "text-green-500",
  [CANAL_LABELS.INSTAGRAM]: "text-pink-500",
  [CANAL_LABELS.EMAIL]: "text-blue-500",
  [CANAL_LABELS.MANUAL]: "text-muted-foreground",
};

const priorityClasses: Record<Priority, string> = {
  [PRIORIDADE_LABELS.CRITICA]: "bg-status-critical text-status-critical-foreground",
  [PRIORIDADE_LABELS.ALTA]: "bg-status-high text-status-high-foreground",
  [PRIORIDADE_LABELS.MEDIA]: "bg-status-medium text-status-medium-foreground",
  [PRIORIDADE_LABELS.BAIXA]: "bg-status-low text-status-low-foreground",
};

const typeColors: Record<string, string> = {
  [TIPO_CONTATO_LABELS.BENEFICIARIO]: "bg-warning/15 text-warning",
  [TIPO_CONTATO_LABELS.DOADOR]: "bg-primary/15 text-primary",
  [TIPO_CONTATO_LABELS.VOLUNTARIO]: "bg-success/15 text-success",
  [TIPO_CONTATO_LABELS.PARCEIRO]: "bg-info/15 text-info",
};

const ITEMS_PER_PAGE = 10;
const FILTER_SELECT_CLASS = "w-56";

type StatusFilterOptionValue = "em-triagem" | "aguardando-atendimento" | "em-andamento" | "finalizados";
type StatusFilterValue = "all" | StatusFilterOptionValue;

type StatusFilterOption = {
  value: StatusFilterOptionValue;
  label: string;
  statuses: string[];
};

const STATUS_FILTER_OPTIONS: StatusFilterOption[] = [
  {
    value: "em-triagem",
    label: "Em triagem",
    statuses: ["Novo", "Aguardando triagem", "Em triagem"],
  },
  {
    value: "aguardando-atendimento",
    label: "Aguardando Atendimento",
    statuses: ["Aberto", "Aguardando", "Aguardando cliente", "Aguardando Atendimento"],
  },
  {
    value: "em-andamento",
    label: "Em andamento",
    statuses: ["Em atendimento", "Em andamento"],
  },
  {
    value: "finalizados",
    label: "Finalizados",
    statuses: ["Resolvido", "Arquivado", "Cancelado", "Fechado", "Finalizados"],
  },
];

const FINALIZED_STATUS_FILTER = "finalizados";

type ChannelFilterOptionValue = "whatsapp" | "instagram" | "email" | "outros";
type ChannelFilterValue = "all" | ChannelFilterOptionValue;

type ChannelFilterOption = {
  value: ChannelFilterOptionValue;
  label: string;
  channels: string[];
};

const CHANNEL_FILTER_OPTIONS: ChannelFilterOption[] = [
  {
    value: "whatsapp",
    label: "WhatsApp",
    channels: [
      CANAL_LABELS.WHATSAPP,
      CANAL_LABELS.WATSON_SANDBOX,
      "WATSON_SANDBOX",
      "Twilio",
      "Twilio Sandbox",
      "Twilio WhatsApp",
      "TWILIO_WATSON",
    ],
  },
  {
    value: "instagram",
    label: "Instagram",
    channels: [CANAL_LABELS.INSTAGRAM],
  },
  {
    value: "email",
    label: "Email",
    channels: [CANAL_LABELS.EMAIL, "Email"],
  },
  {
    value: "outros",
    label: "Outros",
    channels: [CANAL_LABELS.MANUAL, "Manual", "Cadastro manual", "Outro", "Outros"],
  },
];

type ClassificationFilterOptionValue = "saude" | "parceria" | "voluntariado" | "doacao" | "geral";
type ClassificationFilterValue = "all" | ClassificationFilterOptionValue;

type ClassificationFilterOption = {
  value: ClassificationFilterOptionValue;
  label: string;
  classifications: string[];
};

const CLASSIFICATION_FILTER_OPTIONS: ClassificationFilterOption[] = [
  {
    value: "saude",
    label: "Saúde",
    classifications: ["Saúde", "Emergência", "Agendamento"],
  },
  {
    value: "parceria",
    label: "Parceria",
    classifications: ["Parceria"],
  },
  {
    value: "voluntariado",
    label: "Voluntariado",
    classifications: ["Voluntariado", "Voluntariado odontológico"],
  },
  {
    value: "doacao",
    label: "Doação",
    classifications: ["Doação"],
  },
  {
    value: "geral",
    label: "Geral",
    classifications: ["Geral", "Social", "Feedback"],
  },
];

const SPECIFIC_CLASSIFICATION_FILTERS = CLASSIFICATION_FILTER_OPTIONS.filter(
  (option) => option.value !== "geral",
);

const normalizeForFilter = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const ticketChannelLabel = (channel: string) => {
  const normalizedChannel = normalizeForFilter(channel);
  if (
    normalizedChannel.includes("whatsapp") ||
    normalizedChannel.includes("twilio") ||
    normalizedChannel.includes("watson")
  ) {
    return CANAL_LABELS.WHATSAPP;
  }
  if (normalizedChannel === "email") {
    return CANAL_LABELS.EMAIL;
  }
  return channel;
};

const matchesChannelOption = (channel: string, option: ChannelFilterOption) => {
  const normalizedChannel = normalizeForFilter(ticketChannelLabel(channel));
  return option.channels.some((candidate) => normalizeForFilter(ticketChannelLabel(candidate)) === normalizedChannel);
};

const ticketDateStamp = (ticket: Ticket) => {
  const protocolDate = (ticket.protocol || ticket.id).match(/TKT-(\d{8})/)?.[1];
  if (protocolDate) return protocolDate;

  const openedDate = ticket.openedAt.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (openedDate) {
    const [, day, month, year] = openedDate;
    return `${year}${month}${day}`;
  }

  const today = new Date();
  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("");
};

const ticketSequence = (ticket: Ticket) => {
  const rawProtocol = ticket.protocol || ticket.id;
  const standardSequence = rawProtocol.match(/^TKT-\d{8}-(\d+)$/)?.[1];
  if (standardSequence) return standardSequence.padStart(3, "0");

  const generatedSequence = rawProtocol.match(/^TKT-\d{8}-\d{4}-(\d+)$/)?.[1];
  if (generatedSequence) return generatedSequence.padStart(3, "0");

  const simpleSequence = rawProtocol.match(/^TKT-(\d+)$/)?.[1];
  if (simpleSequence) return simpleSequence.padStart(3, "0");

  const numericId = ticket.id.match(/\d+$/)?.[0];
  return (numericId || "0").padStart(3, "0");
};

const ticketDisplayProtocol = (ticket: Ticket) =>
  `TKT-${ticketDateStamp(ticket)}-${ticketSequence(ticket)}`;

const ticketMatchesClassificationFilter = (ticket: Ticket, option: ClassificationFilterOption): boolean => {
  if (option.value === "geral") {
    return !SPECIFIC_CLASSIFICATION_FILTERS.some((specificOption) =>
      ticketMatchesClassificationFilter(ticket, specificOption),
    );
  }

  if (option.classifications.includes(ticket.classification)) return true;

  const subject = normalizeForFilter(ticket.subject);
  if (option.value === "voluntariado") {
    return ticket.type === TIPO_CONTATO_LABELS.VOLUNTARIO ||
      subject.includes("voluntariado") ||
      subject.includes("dentista voluntario");
  }
  if (option.value === "doacao") {
    return ticket.type === TIPO_CONTATO_LABELS.DOADOR ||
      subject.includes("doacao") ||
      subject.includes("doar");
  }
  if (option.value === "parceria") {
    return ticket.type === TIPO_CONTATO_LABELS.PARCEIRO ||
      subject.includes("parceria") ||
      subject.includes("convenio");
  }
  if (option.value === "saude") {
    return subject.includes("triagem") ||
      subject.includes("odontolog") ||
      subject.includes("tratamento") ||
      subject.includes("agendamento") ||
      subject.includes("dor de dente");
  }

  return false;
};

export default function Tickets() {
  const { tickets, archiveTicket } = useTickets();
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<ChannelFilterValue>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [classificationFilter, setClassificationFilter] = useState<ClassificationFilterValue>("all");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const filtered = tickets.filter((t) => {
    const selectedChannel = CHANNEL_FILTER_OPTIONS.find((option) => option.value === channelFilter);
    const selectedStatus = STATUS_FILTER_OPTIONS.find((option) => option.value === statusFilter);
    const selectedClassification = CLASSIFICATION_FILTER_OPTIONS.find((option) => option.value === classificationFilter);
    const isFinalized = STATUS_FILTER_OPTIONS
      .find((option) => option.value === FINALIZED_STATUS_FILTER)
      ?.statuses.includes(t.status);

    if (isFinalized && statusFilter !== FINALIZED_STATUS_FILTER) return false;

    const ticketCode = ticketDisplayProtocol(t);
    const matchSearch = t.sender.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase()) || ticketCode.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || Boolean(selectedStatus?.statuses.includes(t.status));
    const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
    const matchClassification = classificationFilter === "all" ||
      Boolean(selectedClassification && ticketMatchesClassificationFilter(t, selectedClassification));
    const matchChannel = channelFilter === "all" || Boolean(selectedChannel && matchesChannelOption(t.channel, selectedChannel));
    return matchSearch && matchStatus && matchPriority && matchClassification && matchChannel;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleChannelFilterChange = (value: ChannelFilterValue) => {
    setChannelFilter(value);
    setPage(1);
  };

  const handleArchive = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await archiveTicket(id);
      toast.success("Ticket arquivado e movido para Histórico");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao arquivar ticket");
    }
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">
            Tickets
          </h1>
          <p className="text-sm text-muted-foreground">Visão geral de atendimentos</p>
        </div>
        <Button onClick={() => navigate("/tickets/new")} className="shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Criar Ticket
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome, assunto ou ID..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <Select value={channelFilter} onValueChange={(v) => handleChannelFilterChange(v as ChannelFilterValue)}>
          <SelectTrigger className={FILTER_SELECT_CLASS}><SelectValue placeholder="Canais" /></SelectTrigger>
          <SelectContent>
            {CHANNEL_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={classificationFilter} onValueChange={(v) => { setClassificationFilter(v as ClassificationFilterValue); setPage(1); }}>
          <SelectTrigger className={FILTER_SELECT_CLASS}><SelectValue placeholder="Classificação" /></SelectTrigger>
          <SelectContent>
            {CLASSIFICATION_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setPage(1); }}>
          <SelectTrigger className={FILTER_SELECT_CLASS}><SelectValue placeholder="Prioridade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Crítica">Crítica</SelectItem>
            <SelectItem value="Alta">Alta</SelectItem>
            <SelectItem value="Média">Média</SelectItem>
            <SelectItem value="Baixa">Baixa</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as StatusFilterValue); setPage(1); }}>
          <SelectTrigger className={FILTER_SELECT_CLASS}><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            {STATUS_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(statusFilter !== "all" || priorityFilter !== "all" || classificationFilter !== "all" || channelFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter("all");
              setPriorityFilter("all");
              setClassificationFilter("all");
              setChannelFilter("all");
              setPage(1);
            }}
          >
            Limpar filtros
          </Button>
        )}
      </div>

      <div className="border border-border rounded-lg shadow-sm max-h-[calc(100vh-18rem)] overflow-auto [&>div]:overflow-visible">
        <Table className="min-w-[1380px] table-fixed">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[160px]">ID</TableHead>
              <TableHead className="w-[64px]">Canal</TableHead>
              <TableHead className="w-[180px]">Remetente</TableHead>
              <TableHead className="w-[132px]">Tipo</TableHead>
              <TableHead className="w-[220px]">Assunto (IA)</TableHead>
              <TableHead className="w-[132px]">Classificação</TableHead>
              <TableHead className="w-[112px]">Prioridade</TableHead>
              <TableHead className="w-[152px]">Status</TableHead>
              <TableHead className="w-[156px]">Responsável</TableHead>
              <TableHead className="w-[140px]">Atualização</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((t) => {
              const channelLabel = ticketChannelLabel(t.channel);
              const ChIcon = channelIcon[channelLabel] || MoreHorizontal;
              const chColor = channelColors[channelLabel] || "text-muted-foreground";
              return (
                <TableRow
                  key={t.id}
                  className="cursor-pointer hover:bg-accent/60 transition-colors"
                  onClick={() => {
                    navigate(`/tickets/${t.id}`, { state: { backUrl: "/tickets" } });
                  }}
                >
                  <TableCell className="font-mono text-xs whitespace-nowrap">{ticketDisplayProtocol(t)}</TableCell>
                  <TableCell title={channelLabel} aria-label={channelLabel}><ChIcon className={cn("w-4 h-4", chColor)} /></TableCell>
                  <TableCell className="font-medium text-sm truncate" title={t.sender}>{t.sender}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px] min-w-[80px] flex items-center justify-center text-center", typeColors[t.type] || "")}>{t.type}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="block max-w-[188px] truncate" title={t.subject}>{t.subject}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs min-w-[80px] flex items-center justify-center text-center">{t.classification}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className={cn("inline-flex items-center justify-center text-xs font-medium px-2.5 py-0.5 rounded-full min-w-[72px]", priorityClasses[t.priority])}>
                      {t.priority}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm truncate" title={t.status}>{t.status}</TableCell>
                  <TableCell className="text-sm truncate" title={t.responsible}>{t.responsible}</TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{t.updated}</TableCell>
                  <TableCell>
                    <button className="text-muted-foreground hover:text-foreground transition-colors" onClick={(e) => handleArchive(e, t.id)}>
                      <Archive className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">Nenhum ticket encontrado</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage(Math.max(1, page - 1)); }} />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink href="#" isActive={page === i + 1} onClick={(e) => { e.preventDefault(); setPage(i + 1); }}>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage(Math.min(totalPages, page + 1)); }} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
