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
import { useTickets, type Priority } from "@/contexts/TicketsContext";
import { toast } from "sonner";

const channelIcon: Record<string, React.ElementType> = {
  WhatsApp: MessageCircle,
  Instagram: Instagram,
  "E-mail": Mail,
  Outro: MoreHorizontal,
};

const channelColors: Record<string, string> = {
  WhatsApp: "text-green-500",
  Instagram: "text-pink-500",
  "E-mail": "text-blue-500",
  Outro: "text-muted-foreground",
};

const priorityClasses: Record<Priority, string> = {
  Crítica: "bg-status-critical text-status-critical-foreground",
  Alta: "bg-status-high text-status-high-foreground",
  Média: "bg-status-medium text-status-medium-foreground",
  Baixa: "bg-status-low text-status-low-foreground",
};

const typeColors: Record<string, string> = {
  Beneficiário: "bg-warning/15 text-warning",
  Doador: "bg-primary/15 text-primary",
  Voluntário: "bg-success/15 text-success",
  Parceiro: "bg-info/15 text-info",
};

const ITEMS_PER_PAGE = 10;

export default function Tickets() {
  const { tickets, archiveTicket } = useTickets();
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
    if (t.status === "Resolvido") return false;
    const matchSearch = t.sender.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
    const matchClassification = classificationFilter === "all" || t.classification === classificationFilter;
    const matchChannel = channelFilter === "all" || t.channel === channelFilter;
    return matchSearch && matchStatus && matchPriority && matchClassification && matchChannel;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleArchive = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    archiveTicket(id);
    toast.success("Ticket arquivado e movido para Histórico");
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">
            Tickets {channelFilter !== "all" && <span className="text-primary">— {channelFilter}</span>}
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
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Filtrar por status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="Novo">Novo</SelectItem>
            <SelectItem value="Aberto">Aberto</SelectItem>
            <SelectItem value="Aguardando">Aguardando</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Filtrar por prioridade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Prioridades</SelectItem>
            <SelectItem value="Crítica">Crítica</SelectItem>
            <SelectItem value="Alta">Alta</SelectItem>
            <SelectItem value="Média">Média</SelectItem>
            <SelectItem value="Baixa">Baixa</SelectItem>
          </SelectContent>
        </Select>
        <Select value={classificationFilter} onValueChange={(v) => { setClassificationFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Filtrar por classificação" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Classificações</SelectItem>
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

      <div className="border border-border rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-24">ID</TableHead>
              <TableHead className="w-12">Canal</TableHead>
              <TableHead>Remetente</TableHead>
              <TableHead>Assunto (IA)</TableHead>
              <TableHead>Tipo</TableHead>
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
              const chColor = channelColors[t.channel] || "text-muted-foreground";
              return (
                <TableRow
                  key={t.id}
                  className="cursor-pointer hover:bg-accent/60 transition-colors"
                  onClick={() => {
                    const backUrl = channelFilter !== "all" ? `/tickets?channel=${encodeURIComponent(channelFilter)}` : "/tickets";
                    navigate(`/tickets/${t.id}`, { state: { backUrl } });
                  }}
                >
                  <TableCell className="font-mono text-xs">{t.id}</TableCell>
                  <TableCell><ChIcon className={cn("w-4 h-4", chColor)} /></TableCell>
                  <TableCell className="font-medium text-sm">{t.sender}</TableCell>
                  <TableCell className="text-sm">{t.subject}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px] min-w-[80px] flex items-center justify-center text-center", typeColors[t.type] || "")}>{t.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs min-w-[80px] flex items-center justify-center text-center">{t.classification}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className={cn("inline-flex items-center justify-center text-xs font-medium px-2.5 py-0.5 rounded-full min-w-[72px]", priorityClasses[t.priority])}>
                      {t.priority}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{t.status}</TableCell>
                  <TableCell className="text-sm">{t.responsible}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{t.updated}</TableCell>
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
