import { useState } from "react";
import { Search, Plus, Archive, MessageCircle, Instagram, Mail, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

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
];

export default function Tickets() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = tickets.filter(
    (t) =>
      t.sender.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Tickets</h1>
          <p className="text-sm text-muted-foreground">Visão geral de atendimentos</p>
        </div>
        <Button onClick={() => navigate("/tickets/new")}>
          <Plus className="w-4 h-4 mr-2" />
          Criar Ticket
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="new">Novo</SelectItem>
            <SelectItem value="open">Aberto</SelectItem>
            <SelectItem value="waiting">Aguardando</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="critical">Crítica</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="medium">Média</SelectItem>
            <SelectItem value="low">Baixa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
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
            {filtered.map((t) => {
              const ChIcon = channelIcon[t.channel] || MoreHorizontal;
              return (
                <TableRow
                  key={t.id}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => navigate(`/tickets/${t.id}`)}
                >
                  <TableCell className="font-mono text-xs">{t.id}</TableCell>
                  <TableCell>
                    <ChIcon className="w-4 h-4 text-muted-foreground" />
                  </TableCell>
                  <TableCell className="font-medium text-sm">{t.sender}</TableCell>
                  <TableCell className="text-sm">{t.subject}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">{t.classification}</Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center justify-center text-xs font-medium px-2.5 py-0.5 rounded-full min-w-[72px]",
                        priorityClasses[t.priority]
                      )}
                    >
                      {t.priority}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{t.status}</TableCell>
                  <TableCell className="text-sm">{t.responsible}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{t.updated}</TableCell>
                  <TableCell>
                    <button
                      className="text-muted-foreground hover:text-foreground"
                      onClick={(e) => { e.stopPropagation(); }}
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
