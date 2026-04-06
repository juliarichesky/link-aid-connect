import { useState } from "react";
import { Search, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const historyTickets = [
  { id: "TKT-089", sender: "Carlos Mendes", subject: "Consulta finalizada", date: "01/03/2025", channel: "WhatsApp", dentist: "Dra. Fernanda Costa", status: "Resolvido" },
  { id: "TKT-076", sender: "ONG Vida Nova", subject: "Doação concluída", date: "25/02/2025", channel: "E-mail", dentist: "-", status: "Resolvido" },
  { id: "TKT-062", sender: "Ana Luiza", subject: "Feedback positivo", date: "18/02/2025", channel: "Instagram", dentist: "Dr. Ricardo Souza", status: "Fechado" },
  { id: "TKT-055", sender: "João Santos", subject: "Tratamento concluído", date: "10/02/2025", channel: "WhatsApp", dentist: "Dr. Marcos Lima", status: "Resolvido" },
  { id: "TKT-048", sender: "Lucia Ferreira", subject: "Atendimento encerrado", date: "03/02/2025", channel: "WhatsApp", dentist: "Dra. Ana Ribeiro", status: "Fechado" },
  { id: "TKT-041", sender: "Pedro Almeida", subject: "Doação processada", date: "28/01/2025", channel: "E-mail", dentist: "-", status: "Resolvido" },
  { id: "TKT-034", sender: "Fundação ABC", subject: "Parceria encerrada", date: "20/01/2025", channel: "E-mail", dentist: "-", status: "Fechado" },
  { id: "TKT-027", sender: "Maria Oliveira", subject: "Consulta odontológica", date: "15/01/2025", channel: "WhatsApp", dentist: "Dra. Fernanda Costa", status: "Resolvido" },
];

const ITEMS_PER_PAGE = 5;

export default function History() {
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const [dentistFilter, setDentistFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = historyTickets.filter((t) => {
    const matchSearch = t.sender.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase());
    const matchChannel = channelFilter === "all" || t.channel === channelFilter;
    const matchDentist = dentistFilter === "all" || t.dentist === dentistFilter;
    return matchSearch && matchChannel && matchDentist;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const dentists = [...new Set(historyTickets.map((t) => t.dentist).filter((d) => d !== "-"))];

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold">Histórico</h1>
        <p className="text-sm text-muted-foreground">Tickets finalizados com filtros avançados</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar no histórico..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <Select value={channelFilter} onValueChange={(v) => { setChannelFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Canal" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Canais</SelectItem>
            <SelectItem value="WhatsApp">WhatsApp</SelectItem>
            <SelectItem value="Instagram">Instagram</SelectItem>
            <SelectItem value="E-mail">E-mail</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dentistFilter} onValueChange={(v) => { setDentistFilter(v); setPage(1); }}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Dentista" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Dentistas</SelectItem>
            {dentists.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>ID</TableHead>
              <TableHead>Remetente</TableHead>
              <TableHead>Assunto</TableHead>
              <TableHead>Canal</TableHead>
              <TableHead>Dentista</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((t) => (
              <TableRow key={t.id} className="hover:bg-accent/50 transition-colors">
                <TableCell className="font-mono text-xs">{t.id}</TableCell>
                <TableCell className="font-medium text-sm">{t.sender}</TableCell>
                <TableCell className="text-sm">{t.subject}</TableCell>
                <TableCell className="text-sm">{t.channel}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{t.dentist}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{t.date}</TableCell>
                <TableCell><Badge variant="secondary">{t.status}</Badge></TableCell>
              </TableRow>
            ))}
            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum resultado encontrado</TableCell>
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
