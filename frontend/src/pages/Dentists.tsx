import { useState } from "react";
import { Phone, Mail, Search, ArrowLeft, MapPin, Plus, MessageCircle, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useTickets, type Dentist } from "@/contexts/TicketsContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { maskPhone } from "@/lib/masks";

const ITEMS_PER_PAGE = 10;

export default function Dentists() {
  const { dentists, tickets, updateDentist } = useTickets();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Dentist | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [ufFilter, setUfFilter] = useState("all");

  // Editable state
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Dentist>>({});

  const ufs = [...new Set(dentists.map((d) => d.uf).filter(Boolean))].sort();

  const filtered = dentists.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase()) || d.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    const matchUf = ufFilter === "all" || d.uf === ufFilter;
    return matchSearch && matchStatus && matchUf;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const getDentistTickets = (dentistName: string) =>
    tickets.filter((t) => t.dentistResponsible === dentistName);

  const startEdit = () => {
    if (!selected) return;
    setEditData({ name: selected.name, specialty: selected.specialty, phone: selected.phone, email: selected.email, crm: selected.crm, location: selected.location, uf: selected.uf, status: selected.status, totalSlots: selected.totalSlots, openSlots: selected.openSlots });
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!selected) return;
    try {
      await updateDentist(selected.id, editData);
      setSelected({ ...selected, ...editData } as Dentist);
      setEditing(false);
      toast.success("Dados do dentista atualizados");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar dentista");
    }
  };

  if (selected) {
    const assignedTickets = getDentistTickets(selected.name);

    return (
      <div className="p-6 space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => { setSelected(null); setEditing(false); }}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para Dentistas
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/dentist-comms?id=${selected.id}`)}>
              <MessageCircle className="w-4 h-4 mr-1" /> Chat Direto
            </Button>
            {editing ? (
              <Button size="sm" onClick={saveEdit}><Save className="w-4 h-4 mr-1" /> Salvar</Button>
            ) : (
              <Button variant="outline" size="sm" onClick={startEdit}>Editar</Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 shadow-sm">
            <CardHeader><CardTitle className="text-base">Dados do Dentista</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {selected.name.split(" ").filter((_, i) => i === 0 || i === selected.name.split(" ").length - 1).map((n) => n[0]).join("")}
                </div>
                <div>
                  {editing ? (
                    <Input value={editData.name || ""} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="h-8 font-semibold" />
                  ) : (
                    <p className="font-semibold">{selected.name}</p>
                  )}
                  {editing ? (
                    <Input value={editData.specialty || ""} onChange={(e) => setEditData({ ...editData, specialty: e.target.value })} className="h-7 text-sm mt-1" />
                  ) : (
                    <p className="text-sm text-muted-foreground">{selected.specialty}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">CRO</Label>
                  {editing ? <Input value={editData.crm || ""} onChange={(e) => setEditData({ ...editData, crm: e.target.value })} className="h-8" /> : <p className="font-medium">{selected.crm}</p>}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Telefone</Label>
                  {editing ? <Input value={editData.phone || ""} onChange={(e) => setEditData({ ...editData, phone: maskPhone(e.target.value) })} className="h-8" /> : <p className="font-medium">{selected.phone}</p>}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">E-mail</Label>
                  {editing ? <Input value={editData.email || ""} onChange={(e) => setEditData({ ...editData, email: e.target.value })} className="h-8" /> : <p className="font-medium">{selected.email}</p>}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Localização</Label>
                  {editing ? (
                    <div className="flex gap-2">
                      <Input value={editData.location || ""} onChange={(e) => setEditData({ ...editData, location: e.target.value })} className="h-8" placeholder="Cidade" />
                      <Input value={editData.uf || ""} onChange={(e) => setEditData({ ...editData, uf: e.target.value.toUpperCase().slice(0, 2) })} className="h-8 w-16" placeholder="UF" />
                    </div>
                  ) : (
                    <p className="font-medium flex items-center gap-1"><MapPin className="w-3 h-3" /> {selected.location}{selected.uf ? `, ${selected.uf}` : ""} - {selected.country}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  {editing ? (
                    <Select value={editData.status} onValueChange={(v) => setEditData({ ...editData, status: v })}>
                      <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={selected.status === "Ativo" ? "default" : "secondary"}>{selected.status}</Badge>
                  )}
                </div>
                <div className="flex justify-between">
                  <div>
                    <Label className="text-xs text-muted-foreground">Vagas Totais</Label>
                    {editing ? <Input type="number" value={editData.totalSlots ?? 0} onChange={(e) => setEditData({ ...editData, totalSlots: Number(e.target.value) })} className="h-8 w-20" /> : <p className="font-medium">{selected.totalSlots}</p>}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Vagas Abertas</Label>
                    {editing ? <Input type="number" value={editData.openSlots ?? 0} onChange={(e) => setEditData({ ...editData, openSlots: Number(e.target.value) })} className="h-8 w-20" /> : <p className={`font-medium ${selected.openSlots === 0 ? "text-destructive" : "text-success"}`}>{selected.openSlots}</p>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-5">
            {selected.schedule.length > 0 && (
              <Card className="shadow-sm">
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

            <Card className="shadow-sm">
              <CardHeader><CardTitle className="text-sm font-medium">Tickets sob Responsabilidade ({assignedTickets.length})</CardTitle></CardHeader>
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
                    {assignedTickets.map((t) => (
                      <TableRow key={t.id} className="hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => navigate(`/tickets/${t.id}`)}>
                        <TableCell className="font-mono text-xs">{t.protocol || t.id}</TableCell>
                        <TableCell className="font-medium text-sm">{t.sender}</TableCell>
                        <TableCell className="text-sm">{t.subject}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{t.openedAt}</TableCell>
                        <TableCell><Badge variant="secondary">{t.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                    {assignedTickets.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center py-4 text-muted-foreground text-sm">Nenhum ticket atribuído</TableCell></TableRow>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Dentistas</h1>
          <p className="text-sm text-muted-foreground">Gestão de voluntariado odontológico</p>
        </div>
        <Button onClick={() => navigate("/tickets/new?tab=dentist")} variant="outline" className="shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Adicionar Dentista
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome, especialidade ou cidade..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Ativo">Ativo</SelectItem>
            <SelectItem value="Inativo">Inativo</SelectItem>
          </SelectContent>
        </Select>
        <Select value={ufFilter} onValueChange={(v) => { setUfFilter(v); setPage(1); }}>
          <SelectTrigger className="w-28"><SelectValue placeholder="UF" /></SelectTrigger>
          <SelectContent>
            {ufs.map((u) => (<SelectItem key={u} value={u}>{u}</SelectItem>))}
          </SelectContent>
        </Select>
        {(statusFilter !== "all" || ufFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setStatusFilter("all"); setUfFilter("all"); setPage(1); }}
          >
            Limpar filtros
          </Button>
        )}
      </div>

      <div className="border border-border rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Nome</TableHead>
              <TableHead>Especialidade</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Tickets</TableHead>
              <TableHead className="text-center">Vagas</TableHead>
              <TableHead className="w-32">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((d) => (
              <TableRow key={d.id} className="cursor-pointer hover:bg-accent/60 transition-colors" onClick={() => setSelected(d)}>
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell className="text-sm">{d.specialty}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{d.location}{d.uf ? `, ${d.uf}` : ""}</TableCell>
                <TableCell><Badge variant={d.status === "Ativo" ? "default" : "secondary"}>{d.status}</Badge></TableCell>
                <TableCell className="text-center font-medium">{getDentistTickets(d.name).length}</TableCell>
                <TableCell className="text-center font-medium">
                  <span className={d.openSlots === 0 ? "text-destructive" : "text-success"}>{d.openSlots}</span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => navigate(`/dentist-comms?id=${d.id}`)}>
                      <MessageCircle className="w-3.5 h-3.5 text-green-500" />
                    </Button>
                    <a href={`tel:${d.phone}`} className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center"><Phone className="w-4 h-4" /></a>
                    <a href={`mailto:${d.email}`} className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center"><Mail className="w-4 h-4" /></a>
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
