import { useState } from "react";
import { Phone, Mail, Search, ArrowLeft, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";

interface Dentist {
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
  tickets: { id: string; patient: string; subject: string; date: string; status: string }[];
}

const dentists: Dentist[] = [
  { id: 1, name: "Dra. Fernanda Costa", specialty: "Ortodontia", status: "Ativo", totalSlots: 10, openSlots: 3, phone: "(41) 97777-6666", email: "fernanda@dentist.com", crm: "CRO-PR 12345", location: "Curitiba", uf: "PR", country: "Brasil", schedule: [{ day: "Segunda", time: "08:00-12:00" }, { day: "Quarta", time: "14:00-18:00" }, { day: "Sexta", time: "08:00-12:00" }], tickets: [{ id: "TKT-001", patient: "Maria Oliveira", subject: "Tratamento ortodôntico", date: "05/04/2025", status: "Aberto" }, { id: "TKT-027", patient: "João Santos", subject: "Consulta", date: "15/01/2025", status: "Resolvido" }] },
  { id: 2, name: "Dr. Ricardo Souza", specialty: "Endodontia", status: "Ativo", totalSlots: 8, openSlots: 0, phone: "(11) 96666-5555", email: "ricardo@dentist.com", crm: "CRO-SP 67890", location: "São Paulo", uf: "SP", country: "Brasil", schedule: [{ day: "Terça", time: "09:00-13:00" }, { day: "Quinta", time: "09:00-13:00" }], tickets: [{ id: "TKT-062", patient: "Ana Luiza", subject: "Canal dentário", date: "18/02/2025", status: "Fechado" }] },
  { id: 3, name: "Dra. Julia Mendes", specialty: "Odontopediatria", status: "Inativo", totalSlots: 6, openSlots: 6, phone: "(21) 95555-4444", email: "julia@dentist.com", crm: "CRO-RJ 11111", location: "Rio de Janeiro", uf: "RJ", country: "Brasil", schedule: [], tickets: [] },
  { id: 4, name: "Dr. Marcos Lima", specialty: "Implantodontia", status: "Ativo", totalSlots: 12, openSlots: 5, phone: "(31) 94444-3333", email: "marcos@dentist.com", crm: "CRO-MG 22222", location: "Belo Horizonte", uf: "MG", country: "Brasil", schedule: [{ day: "Segunda", time: "14:00-18:00" }, { day: "Quarta", time: "08:00-12:00" }, { day: "Sexta", time: "14:00-18:00" }], tickets: [{ id: "TKT-055", patient: "João Santos", subject: "Implante", date: "10/02/2025", status: "Resolvido" }] },
  { id: 5, name: "Dra. Ana Ribeiro", specialty: "Periodontia", status: "Ativo", totalSlots: 8, openSlots: 2, phone: "(85) 93333-2222", email: "ana.r@dentist.com", crm: "CRO-CE 33333", location: "Fortaleza", uf: "CE", country: "Brasil", schedule: [{ day: "Terça", time: "14:00-18:00" }, { day: "Quinta", time: "14:00-18:00" }], tickets: [{ id: "TKT-048", patient: "Lucia Ferreira", subject: "Tratamento gengival", date: "03/02/2025", status: "Fechado" }] },
  { id: 6, name: "Dr. Paulo Nascimento", specialty: "Cirurgia", status: "Ativo", totalSlots: 10, openSlots: 4, phone: "(51) 92222-1111", email: "paulo.n@dentist.com", crm: "CRO-RS 44444", location: "Porto Alegre", uf: "RS", country: "Brasil", schedule: [{ day: "Segunda", time: "08:00-12:00" }, { day: "Quinta", time: "14:00-18:00" }], tickets: [] },
  { id: 7, name: "Dra. Carla Dias", specialty: "Prótese", status: "Ativo", totalSlots: 6, openSlots: 1, phone: "(62) 91111-0000", email: "carla.d@dentist.com", crm: "CRO-GO 55555", location: "Goiânia", uf: "GO", country: "Brasil", schedule: [{ day: "Quarta", time: "08:00-12:00" }], tickets: [] },
  { id: 8, name: "Dr. Fernando Tavares", specialty: "Ortodontia", status: "Inativo", totalSlots: 8, openSlots: 8, phone: "(71) 90000-9999", email: "fernando.t@dentist.com", crm: "CRO-BA 66666", location: "Salvador", uf: "BA", country: "Brasil", schedule: [], tickets: [] },
];

const ITEMS_PER_PAGE = 10;

export default function Dentists() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Dentist | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [ufFilter, setUfFilter] = useState("all");

  const ufs = [...new Set(dentists.map((d) => d.uf))].sort();

  const filtered = dentists.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase()) || d.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    const matchUf = ufFilter === "all" || d.uf === ufFilter;
    return matchSearch && matchStatus && matchUf;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  if (selected) {
    return (
      <div className="p-6 space-y-5 animate-fade-in">
        <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para Dentistas
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle className="text-base">Dados do Dentista</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {selected.name.split(" ").filter((_, i) => i === 0 || i === selected.name.split(" ").length - 1).map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="font-semibold">{selected.name}</p>
                  <p className="text-sm text-muted-foreground">{selected.specialty}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div><p className="text-xs text-muted-foreground">CRO</p><p className="font-medium">{selected.crm}</p></div>
                <div><p className="text-xs text-muted-foreground">Telefone</p><p className="font-medium">{selected.phone}</p></div>
                <div><p className="text-xs text-muted-foreground">E-mail</p><p className="font-medium">{selected.email}</p></div>
                <div><p className="text-xs text-muted-foreground">Localização</p><p className="font-medium flex items-center gap-1"><MapPin className="w-3 h-3" /> {selected.location}, {selected.uf} - {selected.country}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p><Badge variant={selected.status === "Ativo" ? "default" : "secondary"}>{selected.status}</Badge></div>
                <div className="flex justify-between">
                  <div><p className="text-xs text-muted-foreground">Vagas Totais</p><p className="font-medium">{selected.totalSlots}</p></div>
                  <div><p className="text-xs text-muted-foreground">Vagas Abertas</p><p className={`font-medium ${selected.openSlots === 0 ? "text-destructive" : "text-success"}`}>{selected.openSlots}</p></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-5">
            {selected.schedule.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-sm font-medium">Agenda</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {selected.schedule.map((s, i) => (
                      <div key={i} className="px-3 py-2 bg-muted rounded-md text-sm">
                        <p className="font-medium">{s.day}</p>
                        <p className="text-xs text-muted-foreground">{s.time}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Tickets sob Responsabilidade ({selected.tickets.length})</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>ID</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Assunto</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selected.tickets.map((t) => (
                      <TableRow key={t.id} className="hover:bg-accent/50">
                        <TableCell className="font-mono text-xs">{t.id}</TableCell>
                        <TableCell className="font-medium text-sm">{t.patient}</TableCell>
                        <TableCell className="text-sm">{t.subject}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{t.date}</TableCell>
                        <TableCell><Badge variant="secondary">{t.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                    {selected.tickets.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center py-4 text-muted-foreground text-sm">Nenhum ticket</TableCell></TableRow>
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
        <h1 className="text-2xl font-display font-bold">Dentistas</h1>
        <p className="text-sm text-muted-foreground">Gestão de voluntariado odontológico</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar dentistas..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Ativo">Ativo</SelectItem>
            <SelectItem value="Inativo">Inativo</SelectItem>
          </SelectContent>
        </Select>
        <Select value={ufFilter} onValueChange={(v) => { setUfFilter(v); setPage(1); }}>
          <SelectTrigger className="w-28"><SelectValue placeholder="UF" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos UFs</SelectItem>
            {ufs.map((u) => (<SelectItem key={u} value={u}>{u}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Nome</TableHead>
              <TableHead>Especialidade</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Vagas Totais</TableHead>
              <TableHead className="text-center">Vagas Abertas</TableHead>
              <TableHead className="w-24">Contato</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((d) => (
              <TableRow key={d.id} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => setSelected(d)}>
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell className="text-sm">{d.specialty}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{d.location}, {d.uf}</TableCell>
                <TableCell><Badge variant={d.status === "Ativo" ? "default" : "secondary"}>{d.status}</Badge></TableCell>
                <TableCell className="text-center">{d.totalSlots}</TableCell>
                <TableCell className="text-center font-medium">
                  <span className={d.openSlots === 0 ? "text-destructive" : "text-success"}>{d.openSlots}</span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <a href={`tel:${d.phone}`} className="text-muted-foreground hover:text-foreground"><Phone className="w-4 h-4" /></a>
                    <a href={`mailto:${d.email}`} className="text-muted-foreground hover:text-foreground"><Mail className="w-4 h-4" /></a>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paginated.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum dentista encontrado</TableCell></TableRow>
            )}
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
