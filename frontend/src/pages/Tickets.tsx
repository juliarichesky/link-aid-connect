import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Archive,
  MessageCircle,
  Instagram,
  Mail,
  MoreHorizontal,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
} from "lucide-react";
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
import { ticketDisplayProtocol } from "@/lib/ticketDisplay";
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

const prioritySortValue: Record<Priority, number> = {
  [PRIORIDADE_LABELS.BAIXA]: 1,
  [PRIORIDADE_LABELS.MEDIA]: 2,
  [PRIORIDADE_LABELS.ALTA]: 3,
  [PRIORIDADE_LABELS.CRITICA]: 4,
};

const typeColors: Record<string, string> = {
  [TIPO_CONTATO_LABELS.SOLICITANTE]: "bg-warning/15 text-warning",
  [TIPO_CONTATO_LABELS.BENEFICIARIO]: "bg-warning/15 text-warning",
  [TIPO_CONTATO_LABELS.DOADOR]: "bg-primary/15 text-primary",
  [TIPO_CONTATO_LABELS.VOLUNTARIO]: "bg-success/15 text-success",
  [TIPO_CONTATO_LABELS.PARCEIRO]: "bg-info/15 text-info",
};

const ITEMS_PER_PAGE = 10;
const FILTER_SELECT_CLASS = "w-56";
const selectFilterValue = (value: string) => (value === "all" ? undefined : value);

type SortKey =
  | "id"
  | "channel"
  | "sender"
  | "type"
  | "subject"
  | "classification"
  | "priority"
  | "status"
  | "responsible"
  | "updated";
type SortDirection = "asc" | "desc";
type SortConfig = {
  key: SortKey;
  direction: SortDirection;
} | null;

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
    classifications: ["Saúde", "Agendamento"],
  },
  {
    value: "parceria",
    label: "Parceria",
    classifications: ["Parceria"],
  },
  {
    value: "voluntariado",
    label: "Voluntariado",
    classifications: ["Voluntariado"],
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

const ticketTypeLabel = (type: string) =>
  normalizeForFilter(type) === "dentista voluntario" ? TIPO_CONTATO_LABELS.VOLUNTARIO : type;

const ticketClassificationLabel = (classification: string) =>
  normalizeForFilter(classification) === "emergencia" ? "Saúde" :
  normalizeForFilter(classification) === "voluntariado odontologico" ? "Voluntariado" : classification;

const parseSortableDate = (value: string) => {
  const normalized = normalizeForFilter(value);
  if (!normalized) return 0;
  if (normalized.includes("agora")) return Number.MAX_SAFE_INTEGER;

  const minutesAgo = normalized.match(/^(\d+)\s*min/);
  if (minutesAgo) return Date.now() - Number(minutesAgo[1]) * 60_000;

  const hoursAgo = normalized.match(/^(\d+)\s*h/);
  if (hoursAgo) return Date.now() - Number(hoursAgo[1]) * 60 * 60_000;

  const brDate = value.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:,?\s+(\d{2}):(\d{2}))?/);
  if (brDate) {
    const [, day, month, year, hour = "0", minute = "0"] = brDate;
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)).getTime();
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const sortValueForTicket = (ticket: Ticket, key: SortKey) => {
  switch (key) {
    case "id":
      return ticketDisplayProtocol(ticket);
    case "channel":
      return ticketChannelLabel(ticket.channel);
    case "sender":
      return ticket.sender;
    case "type":
      return ticketTypeLabel(ticket.type);
    case "subject":
      return ticket.subject;
    case "classification":
      return ticketClassificationLabel(ticket.classification);
    case "priority":
      return prioritySortValue[ticket.priority] ?? 0;
    case "status":
      return ticket.status;
    case "responsible":
      return ticket.responsible;
    case "updated":
      return parseSortableDate(ticket.updated);
    default:
      return "";
  }
};

const compareSortValues = (left: string | number, right: string | number) => {
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return String(left).localeCompare(String(right), "pt-BR", {
    numeric: true,
    sensitivity: "base",
  });
};

type SortableHeaderProps = {
  label: string;
  column: SortKey;
  widthClass: string;
  sortConfig: SortConfig;
  onSort: (column: SortKey) => void;
};

const SortableHeader = ({ label, column, widthClass, sortConfig, onSort }: SortableHeaderProps) => {
  const isActive = sortConfig?.key === column;
  const Icon = isActive ? (sortConfig.direction === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  const ariaSort = isActive ? (sortConfig.direction === "asc" ? "ascending" : "descending") : "none";

  return (
    <TableHead className={cn(widthClass, "p-0 text-center")} aria-sort={ariaSort}>
      <button
        type="button"
        className="inline-flex h-10 w-full items-center justify-center gap-1.5 px-2 text-center text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={() => onSort(column)}
      >
        <span className="truncate">{label}</span>
        <Icon className={cn("h-3.5 w-3.5 shrink-0", isActive && "text-foreground")} />
      </button>
    </TableHead>
  );
};

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

const ticketMatchesClassificationFilter = (ticket: Ticket, option: ClassificationFilterOption): boolean => {
  if (option.value === "geral") {
    return !SPECIFIC_CLASSIFICATION_FILTERS.some((specificOption) =>
      ticketMatchesClassificationFilter(ticket, specificOption),
    );
  }

  if (option.classifications.includes(ticketClassificationLabel(ticket.classification))) return true;

  const subject = normalizeForFilter(ticket.subject);
  if (option.value === "voluntariado") {
    return ticketTypeLabel(ticket.type) === TIPO_CONTATO_LABELS.VOLUNTARIO ||
      subject.includes("voluntariado") ||
      subject.includes("dentista voluntario");
  }
  if (option.value === "doacao") {
    return ticketTypeLabel(ticket.type) === TIPO_CONTATO_LABELS.DOADOR ||
      subject.includes("doacao") ||
      subject.includes("doar");
  }
  if (option.value === "parceria") {
    return ticketTypeLabel(ticket.type) === TIPO_CONTATO_LABELS.PARCEIRO ||
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
  const { tickets, loading, archiveTicket } = useTickets();
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<ChannelFilterValue>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [classificationFilter, setClassificationFilter] = useState<ClassificationFilterValue>("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
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

  const sorted = useMemo(() => {
    if (!sortConfig) return filtered;

    return [...filtered].sort((left, right) => {
      const result = compareSortValues(
        sortValueForTicket(left, sortConfig.key),
        sortValueForTicket(right, sortConfig.key),
      );
      return sortConfig.direction === "asc" ? result : -result;
    });
  }, [filtered, sortConfig]);

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginated = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleChannelFilterChange = (value: ChannelFilterValue) => {
    setChannelFilter(value);
    setPage(1);
  };

  const handleSort = (column: SortKey) => {
    setSortConfig((current) => ({
      key: column,
      direction: current?.key === column && current.direction === "asc" ? "desc" : "asc",
    }));
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
        <Select value={selectFilterValue(channelFilter)} onValueChange={(v) => handleChannelFilterChange(v as ChannelFilterValue)}>
          <SelectTrigger className={FILTER_SELECT_CLASS}><SelectValue placeholder="Canais" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {CHANNEL_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectFilterValue(classificationFilter)} onValueChange={(v) => { setClassificationFilter(v as ClassificationFilterValue); setPage(1); }}>
          <SelectTrigger className={FILTER_SELECT_CLASS}><SelectValue placeholder="Classificação" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {CLASSIFICATION_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectFilterValue(priorityFilter)} onValueChange={(v) => { setPriorityFilter(v); setPage(1); }}>
          <SelectTrigger className={FILTER_SELECT_CLASS}><SelectValue placeholder="Prioridade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Crítica">Crítica</SelectItem>
            <SelectItem value="Alta">Alta</SelectItem>
            <SelectItem value="Média">Média</SelectItem>
            <SelectItem value="Baixa">Baixa</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectFilterValue(statusFilter)} onValueChange={(v) => { setStatusFilter(v as StatusFilterValue); setPage(1); }}>
          <SelectTrigger className={FILTER_SELECT_CLASS}><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
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
              <SortableHeader label="ID" column="id" widthClass="w-[160px]" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Canal" column="channel" widthClass="w-[84px]" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Remetente" column="sender" widthClass="w-[180px]" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Tipo" column="type" widthClass="w-[112px]" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Assunto (IA)" column="subject" widthClass="w-[220px]" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Classificação" column="classification" widthClass="w-[132px]" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Prioridade" column="priority" widthClass="w-[112px]" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Status" column="status" widthClass="w-[152px]" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Responsável" column="responsible" widthClass="w-[156px]" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Atualização" column="updated" widthClass="w-[140px]" sortConfig={sortConfig} onSort={handleSort} />
              <TableHead className="w-12 text-center"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((t) => {
              const channelLabel = ticketChannelLabel(t.channel);
              const ChIcon = channelIcon[channelLabel] || MoreHorizontal;
              const chColor = channelColors[channelLabel] || "text-muted-foreground";
              const typeLabel = ticketTypeLabel(t.type);
              const classificationLabel = ticketClassificationLabel(t.classification);
              return (
                <TableRow
                  key={t.id}
                  className="cursor-pointer hover:bg-accent/60 transition-colors"
                  onClick={() => {
                    navigate(`/tickets/${t.id}`, { state: { backUrl: "/tickets" } });
                  }}
                >
                  <TableCell className="font-mono text-xs whitespace-nowrap">{ticketDisplayProtocol(t)}</TableCell>
                  <TableCell className="text-center" title={channelLabel} aria-label={channelLabel}>
                    <ChIcon className={cn("mx-auto w-4 h-4", chColor)} />
                  </TableCell>
                  <TableCell className="font-medium text-xs truncate" title={t.sender}>{t.sender}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-xs min-w-[80px] flex items-center justify-center text-center font-medium", typeColors[typeLabel] || "")}>{typeLabel}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    <span className="block max-w-[188px] truncate" title={t.subject}>{t.subject}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs min-w-[80px] flex items-center justify-center text-center">{classificationLabel}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className={cn("inline-flex items-center justify-center text-xs font-medium px-2.5 py-0.5 rounded-full min-w-[72px]", priorityClasses[t.priority])}>
                      {t.priority}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs truncate" title={t.status}>{t.status}</TableCell>
                  <TableCell className="text-xs truncate" title={t.responsible}>{t.responsible}</TableCell>
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
                <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                  {loading ? "Carregando tickets..." : "Nenhum ticket encontrado"}
                </TableCell>
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
