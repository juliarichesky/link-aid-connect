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
import { cn } from "@/lib/utils";
import { useNavigate, useSearchParams } from "react-router-dom";

const channelIcon: Record<string, React.ElementType> = {
  WhatsApp: MessageCircle,
  Instagram: Instagram,
  "E-mail": Mail,
  Outro: MoreHorizontal,
};

type Priority = "Crítica" | "Alta" | "Média" | "Baixa";

const priorityClasses: Record<Priority, string> = {
  Crítica: "bg-status-critical text-status-critical-foreground",
  Alta: "bg-status-high text-status-high-foreground",
  Média: "bg-status-medium text-status-medium-foreground",
  Baixa: "bg-status-low text-status-low-foreground",
};

interface Ticket {
  id: string;
  channel: string;
  sender: string;
  subject: string;
  classification: string;
  priority: Priority;
  status: string;
  responsible: string;
  updated: string;
}

const tickets: Ticket[] = [
  { id: "TKT-001", channel: "WhatsApp", sender: "Maria Oliveira", subject: "Dúvida sobre tratamento", classification: "Saúde", priority: "Alta", status: "Novo", responsible: "Carlos Silva", updated: "10 min" },
  { id: "TKT-002", channel: "E-mail", sender: "Instituto Sorria", subject: "Proposta de parceria", classification: "Parceria", priority: "Média", status: "Aberto", responsible: "Ana Costa", updated: "25 min" },
  { id: "TKT-003", channel: "Instagram", sender: "João Santos", subject: "Solicitação de agendamento", classification: "Agendamento", priority: "Baixa", status: "Aguardando", responsible: "Maria Santos", updated: "1h" },
  { id: "TKT-004", channel: "WhatsApp", sender: "Pedro Almeida", subject: "Urgência odontológica", classification: "Emergência", priority: "Crítica", status: "Novo", responsible: "Carlos Silva", updated: "5 min" },
  { id: "TKT-005", channel: "E-mail", sender: "Fundação ABC", subject: "Doação mensal", classification: "Doação", priority: "Média", status: "Aberto", responsible: "Paula Rocha", updated: "2h" },
  { id: "TKT-006", channel: "WhatsApp", sender: "Lucia Ferreira", subject: "Feedback pós-atendimento", classification: "Feedback", priority: "Baixa", status: "Aberto", responsible: "João Lima", updated: "3h" },
  { id: "TKT-007", channel: "Outro", sender: "CREAS Regional", subject: "Encaminhamento social", classification: "Social", priority: "Alta", status: "Novo", responsible: "Ana Costa", updated: "15 min" },
  { id: "TKT-008", channel: "WhatsApp", sender: "Roberto Dias", subject: "Agendar retorno", classification: "Agendamento", priority: "Baixa", status: "Aguardando", responsible: "Maria Santos", updated: "4h" },
  { id: "TKT-009", channel: "E-mail", sender: "Empresa XYZ", subject: "Patrocínio mensal", classification: "Doação", priority: "Média", status: "Aberto", responsible: "Paula Rocha", updated: "5h" },
  { id: "TKT-010", channel: "Instagram", sender: "Carla Nunes", subject: "Informação sobre voluntariado", classification: "Social", priority: "Baixa", status: "Novo", responsible: "Ana Costa", updated: "6h" },
  { id: "TKT-011", channel: "WhatsApp", sender: "Fernando Tavares", subject: "Dor de dente aguda", classification: "Emergência", priority: "Crítica", status: "Novo", responsible: "Carlos Silva", updated: "2 min" },
  { id: "TKT-012", channel: "E-mail", sender: "Prefeitura Municipal", subject: "Convênio público", classification: "Parceria", priority: "Alta", status: "Aberto", responsible: "Ana Costa", updated: "1h" },
];

const ITEMS_PER_PAGE = 10;

export default function Tickets() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [classificationFilter, setClassificationFilter] = useState("all");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const channelFilter = searchParams.get("channel") || "all";
  const classifications = [...new Set(tickets.map((t) => t.classification))];

  const filtered = tickets.filter((t) => {
    const matchSearch = t.sender.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
    const matchClassification = classificationFilter === "all" || t.classification === classificationFilter;
    const matchChannel = channelFilter === "all" || t.channel === channelFilter;
    return matchSearch && matchStatus && matchPriority && matchClassification && matchChannel;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">
            Tickets {channelFilter !== "all" && <span className="text-primary">— {channelFilter}</span>}
          </h1>
          <p className="text-sm text-muted-foreground">Visão geral de atendimentos</p>
        </div>
        <Button onClick={() => navigate("/tickets/new")}>
          <Plus className="w-4 h-4 mr-2" />
          Criar Ticket
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar tickets..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Novo">Novo</SelectItem>
            <SelectItem value="Aberto">Aberto</SelectItem>
            <SelectItem value="Aguardando">Aguardando</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Prioridade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="Crítica">Crítica</SelectItem>
            <SelectItem value="Alta">Alta</SelectItem>
            <SelectItem value="Média">Média</SelectItem>
            <SelectItem value="Baixa">Baixa</SelectItem>
          </SelectContent>
        </Select>
        <Select value={classificationFilter} onValueChange={(v) => { setClassificationFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Classificação" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {classifications.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {channelFilter !== "all" && (
          <Button variant="ghost" size="sm" onClick={() => navigate("/tickets")}>
            Limpar filtro de canal
          </Button>
        )}
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-24">ID</TableHead>
              <TableHead className="w-12">Canal</TableHead>
              <TableHead>Remetente</TableHead>
              <TableHead>Assunto (IA)</TableHead>
              <TableHead>Classificação</TableHead>
              <TableHead className="w-24">Prioridade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead className="w-20">Atualiz.</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((t) => {
              const ChIcon = channelIcon[t.channel] || MoreHorizontal;
              return (
                <TableRow key={t.id} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate(`/tickets/${t.id}`)}>
                  <TableCell className="font-mono text-xs">{t.id}</TableCell>
                  <TableCell><ChIcon className="w-4 h-4 text-muted-foreground" /></TableCell>
                  <TableCell className="font-medium text-sm">{t.sender}</TableCell>
                  <TableCell className="text-sm">{t.subject}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{t.classification}</Badge></TableCell>
                  <TableCell>
                    <span className={cn("inline-flex items-center justify-center text-xs font-medium px-2.5 py-0.5 rounded-full min-w-[72px]", priorityClasses[t.priority])}>
                      {t.priority}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{t.status}</TableCell>
                  <TableCell className="text-sm">{t.responsible}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{t.updated}</TableCell>
                  <TableCell>
                    <button className="text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); }}>
                      <Archive className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">Nenhum ticket encontrado</TableCell>
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
