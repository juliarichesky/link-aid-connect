import { Search, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { useState, useMemo } from "react";
import { useTickets } from "@/contexts/TicketsContext";
import { useNavigate } from "react-router-dom";

const typeColors: Record<string, string> = {
  Beneficiário: "bg-warning/15 text-warning",
  Doador: "bg-primary/15 text-primary",
  "Dentista voluntário": "bg-success/15 text-success",
  Parceiro: "bg-info/15 text-info",
};

const ITEMS_PER_PAGE = 10;

interface DerivedContact {
  name: string;
  type: string;
  location: string;
  phone: string;
  email: string;
  cpf: string;
  ticketCount: number;
  lastInteraction: string;
  linkedTickets: { id: string; protocol?: string; subject: string; date: string; status: string }[];
}

export default function Contacts() {
  const { tickets, contacts } = useTickets();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<DerivedContact | null>(null);
  const [page, setPage] = useState(1);
  const [detailSearch, setDetailSearch] = useState("");

  // Build contacts from all tickets + manually added contacts
  const allContacts = useMemo(() => {
    const map = new Map<string, DerivedContact>();

    tickets.forEach((t) => {
      const key = t.cpf && t.cpf !== "-" ? t.cpf : t.sender;
      if (!map.has(key)) {
        map.set(key, {
          name: t.sender,
          type: t.type,
          location: t.location,
          phone: t.phone,
          email: t.email,
          cpf: t.cpf,
          ticketCount: 0,
          lastInteraction: t.openedAt,
          linkedTickets: [],
        });
      }
      const c = map.get(key)!;
      c.ticketCount++;
      c.linkedTickets.push({ id: t.id, protocol: t.protocol, subject: t.subject, date: t.openedAt, status: t.status });
    });

    // Add manually created contacts that may not have tickets yet
    contacts.forEach((c) => {
      const key = c.cpf && c.cpf !== "-" ? c.cpf : c.name;
      if (!map.has(key)) {
        map.set(key, {
          name: c.name,
          type: c.type,
          location: c.location,
          phone: c.phone,
          email: c.email,
          cpf: c.cpf,
          ticketCount: 0,
          lastInteraction: "-",
          linkedTickets: [],
        });
      }
    });

    return Array.from(map.values());
  }, [tickets, contacts]);

  const filtered = allContacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.type.toLowerCase().includes(search.toLowerCase()) || c.cpf.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  if (selected) {
    const filteredTickets = selected.linkedTickets.filter((t) =>
      t.subject.toLowerCase().includes(detailSearch.toLowerCase()) || (t.protocol || t.id).toLowerCase().includes(detailSearch.toLowerCase())
    );

    return (
      <div className="p-6 space-y-5 animate-fade-in">
        <Button variant="ghost" size="sm" onClick={() => { setSelected(null); setDetailSearch(""); }}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para Contatos
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 shadow-sm">
            <CardHeader><CardTitle className="text-base">Informações Pessoais</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {selected.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold">{selected.name}</p>
                  <Badge variant="secondary" className={typeColors[selected.type]}>{selected.type}</Badge>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div><p className="text-xs text-muted-foreground">CPF/CNPJ</p><p className="font-medium">{selected.cpf}</p></div>
                <div><p className="text-xs text-muted-foreground">Telefone</p><p className="font-medium">{selected.phone}</p></div>
                <div><p className="text-xs text-muted-foreground">E-mail</p><p className="font-medium">{selected.email}</p></div>
                <div><p className="text-xs text-muted-foreground">Localização</p><p className="font-medium">{selected.location}</p></div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-5">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Tickets Vinculados ({selected.linkedTickets.length})</CardTitle>
                  <div className="relative w-48">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                    <Input placeholder="Buscar..." value={detailSearch} onChange={(e) => setDetailSearch(e.target.value)} className="h-7 text-xs pl-7" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>ID</TableHead>
                      <TableHead>Assunto</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.map((t) => (
                      <TableRow key={t.id} className="hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => navigate(`/tickets/${t.id}`)}>
                        <TableCell className="font-mono text-xs">{t.protocol || t.id}</TableCell>
                        <TableCell className="text-sm">{t.subject}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{t.date}</TableCell>
                        <TableCell><Badge variant="secondary">{t.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                    {filteredTickets.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="text-center py-4 text-muted-foreground text-sm">Nenhum ticket</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold">Contatos</h1>
        <p className="text-sm text-muted-foreground">Gestão de relacionamentos (CRM)</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar contatos..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
      </div>

      <div className="border border-border rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>CPF/CNPJ</TableHead>
              <TableHead className="text-right">Tickets</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((c, i) => (
              <TableRow key={i} className="cursor-pointer hover:bg-accent/60 transition-colors" onClick={() => setSelected(c)}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell><Badge variant="secondary" className={typeColors[c.type]}>{c.type}</Badge></TableCell>
                <TableCell className="text-sm">{c.location}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.cpf}</TableCell>
                <TableCell className="text-right font-medium">{c.ticketCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage(Math.max(1, page - 1)); }} /></PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}><PaginationLink href="#" isActive={page === i + 1} onClick={(e) => { e.preventDefault(); setPage(i + 1); }}>{i + 1}</PaginationLink></PaginationItem>
            ))}
            <PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage(Math.min(totalPages, page + 1)); }} /></PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
