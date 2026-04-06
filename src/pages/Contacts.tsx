import { Search, ArrowLeft, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useState } from "react";

interface Contact {
  id: number;
  name: string;
  type: string;
  location: string;
  lastInteraction: string;
  tickets: number;
  phone: string;
  email: string;
  cpf: string;
  healthHistory: string[];
  linkedTickets: { id: string; subject: string; date: string; status: string }[];
}

const contacts: Contact[] = [
  { id: 1, name: "Maria Oliveira", type: "Beneficiário", location: "São Paulo, SP", lastInteraction: "Hoje", tickets: 3, phone: "(11) 99999-0000", email: "maria@email.com", cpf: "123.456.789-00", healthHistory: ["Tratamento ortodôntico - Ago 2024", "Limpeza dental - Mar 2024"], linkedTickets: [{ id: "TKT-001", subject: "Dúvida sobre tratamento", date: "05/04/2025", status: "Aberto" }, { id: "TKT-098", subject: "Consulta finalizada", date: "15/08/2024", status: "Resolvido" }] },
  { id: 2, name: "Instituto Sorria", type: "Parceria", location: "Rio de Janeiro, RJ", lastInteraction: "Ontem", tickets: 5, phone: "(21) 3333-4444", email: "contato@sorria.org", cpf: "12.345.678/0001-00", healthHistory: [], linkedTickets: [{ id: "TKT-002", subject: "Proposta de parceria", date: "05/04/2025", status: "Aberto" }] },
  { id: 3, name: "Pedro Almeida", type: "Doador", location: "Belo Horizonte, MG", lastInteraction: "Há 2 dias", tickets: 2, phone: "(31) 98888-7777", email: "pedro@email.com", cpf: "987.654.321-00", healthHistory: [], linkedTickets: [{ id: "TKT-004", subject: "Urgência odontológica", date: "05/04/2025", status: "Novo" }] },
  { id: 4, name: "Dra. Fernanda Costa", type: "Voluntário", location: "Curitiba, PR", lastInteraction: "Há 1 semana", tickets: 8, phone: "(41) 97777-6666", email: "fernanda@dentist.com", cpf: "456.789.123-00", healthHistory: [], linkedTickets: [] },
  { id: 5, name: "Fundação ABC", type: "Parceria", location: "Salvador, BA", lastInteraction: "Há 3 dias", tickets: 4, phone: "(71) 3222-1111", email: "contato@fundacaoabc.org", cpf: "98.765.432/0001-00", healthHistory: [], linkedTickets: [{ id: "TKT-005", subject: "Doação mensal", date: "05/04/2025", status: "Aberto" }] },
  { id: 6, name: "Lucia Ferreira", type: "Beneficiário", location: "Fortaleza, CE", lastInteraction: "Hoje", tickets: 1, phone: "(85) 96666-5555", email: "lucia@email.com", cpf: "321.654.987-00", healthHistory: ["Extração dental - Jan 2025"], linkedTickets: [{ id: "TKT-006", subject: "Feedback pós-atendimento", date: "05/04/2025", status: "Aberto" }] },
];

const typeColors: Record<string, string> = {
  Beneficiário: "bg-warning/15 text-warning",
  Doador: "bg-primary/15 text-primary",
  Voluntário: "bg-success/15 text-success",
  Parceria: "bg-info/15 text-info",
};

const ITEMS_PER_PAGE = 5;

export default function Contacts() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Contact | null>(null);
  const [page, setPage] = useState(1);
  const [detailSearch, setDetailSearch] = useState("");

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.type.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  if (selected) {
    const filteredTickets = selected.linkedTickets.filter((t) =>
      t.subject.toLowerCase().includes(detailSearch.toLowerCase()) || t.id.toLowerCase().includes(detailSearch.toLowerCase())
    );

    return (
      <div className="p-6 space-y-5 animate-fade-in">
        <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para Contatos
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Info */}
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle className="text-base">Informações Pessoais</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {selected.name.split(" ").map((n) => n[0]).join("")}
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
                <div><p className="text-xs text-muted-foreground">Última Interação</p><p className="font-medium">{selected.lastInteraction}</p></div>
              </div>
            </CardContent>
          </Card>

          {/* Health History & Tickets */}
          <div className="lg:col-span-2 space-y-5">
            {selected.healthHistory.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-sm font-medium">Histórico de Saúde</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selected.healthHistory.map((h, i) => (
                      <div key={i} className="text-sm px-3 py-2 bg-muted rounded-md">{h}</div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
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
                      <TableRow key={t.id} className="hover:bg-accent/50">
                        <TableCell className="font-mono text-xs">{t.id}</TableCell>
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

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Última Interação</TableHead>
              <TableHead className="text-right">Tickets</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((c) => (
              <TableRow key={c.id} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => setSelected(c)}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell><Badge variant="secondary" className={typeColors[c.type]}>{c.type}</Badge></TableCell>
                <TableCell className="text-sm">{c.location}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.lastInteraction}</TableCell>
                <TableCell className="text-right font-medium">{c.tickets}</TableCell>
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
