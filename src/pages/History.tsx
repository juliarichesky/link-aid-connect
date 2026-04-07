import { useState } from "react";
import { Search, ArrowLeft, Clock, User, FileText, ChevronRight, Stethoscope } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { useTickets } from "@/contexts/TicketsContext";

interface HistoryTicket {
  id: string;
  sender: string;
  cpf: string;
  subject: string;
  date: string;
  openedAt: string;
  channel: string;
  dentist: string;
  status: string;
  priority: string;
  classification: string;
  description: string;
  responsible: string;
  phone: string;
  email: string;
  location: string;
  procedureDescription?: string;
  medications?: string;
  surgeryHistory?: string;
  timeline: { date: string; action: string; user: string }[];
  relatedTickets: { id: string; subject: string; date: string; status: string }[];
}

const staticHistoryTickets: HistoryTicket[] = [
  { id: "TKT-089", sender: "Carlos Mendes", cpf: "111.222.333-44", subject: "Consulta finalizada", date: "01/03/2025", openedAt: "01/03/2025 08:30", channel: "WhatsApp", dentist: "Dra. Fernanda Costa", status: "Resolvido", priority: "Média", classification: "Saúde", description: "Paciente solicitou informações sobre tratamento ortodôntico e foi atendido com sucesso.", responsible: "Carlos Silva", phone: "(11) 91111-2222", email: "carlos.m@email.com", location: "São Paulo, SP", procedureDescription: "Avaliação ortodôntica completa com radiografia panorâmica.", medications: "Amoxicilina 500mg 8/8h por 7 dias", surgeryHistory: "Extração de terceiros molares em 2023", timeline: [{ date: "01/03/2025 08:30", action: "Ticket criado via WhatsApp", user: "Sistema" }, { date: "01/03/2025 09:00", action: "Atribuído a Carlos Silva", user: "Ana Costa" }, { date: "01/03/2025 10:15", action: "Resposta enviada ao paciente", user: "Carlos Silva" }, { date: "01/03/2025 14:00", action: "Paciente confirmou resolução", user: "Sistema" }, { date: "01/03/2025 14:05", action: "Ticket finalizado", user: "Carlos Silva" }], relatedTickets: [{ id: "TKT-027", subject: "Consulta odontológica", date: "15/01/2025", status: "Resolvido" }, { id: "TKT-015", subject: "Agendamento inicial", date: "10/12/2024", status: "Resolvido" }] },
  { id: "TKT-076", sender: "ONG Vida Nova", cpf: "12.345.678/0001-00", subject: "Doação concluída", date: "25/02/2025", openedAt: "25/02/2025 10:00", channel: "E-mail", dentist: "-", status: "Resolvido", priority: "Baixa", classification: "Doação", description: "Doação mensal processada com sucesso.", responsible: "Paula Rocha", phone: "(21) 3333-4444", email: "contato@vidanova.org", location: "Rio de Janeiro, RJ", timeline: [{ date: "25/02/2025 10:00", action: "Ticket criado via E-mail", user: "Sistema" }, { date: "25/02/2025 10:30", action: "Doação confirmada", user: "Paula Rocha" }], relatedTickets: [] },
  { id: "TKT-062", sender: "Ana Luiza", cpf: "222.333.444-55", subject: "Feedback positivo", date: "18/02/2025", openedAt: "18/02/2025 14:20", channel: "Instagram", dentist: "Dr. Ricardo Souza", status: "Fechado", priority: "Baixa", classification: "Feedback", description: "Paciente agradeceu atendimento odontológico e elogiou equipe.", responsible: "Maria Santos", phone: "(11) 92222-3333", email: "ana.luiza@email.com", location: "São Paulo, SP", timeline: [{ date: "18/02/2025 14:20", action: "Mensagem recebida via Instagram", user: "Sistema" }, { date: "18/02/2025 15:00", action: "Feedback registrado", user: "Maria Santos" }, { date: "18/02/2025 15:05", action: "Ticket fechado", user: "Maria Santos" }], relatedTickets: [{ id: "TKT-040", subject: "Tratamento canal", date: "05/01/2025", status: "Resolvido" }] },
  { id: "TKT-055", sender: "João Santos", cpf: "333.444.555-66", subject: "Tratamento concluído", date: "10/02/2025", openedAt: "10/02/2025 09:00", channel: "WhatsApp", dentist: "Dr. Marcos Lima", status: "Resolvido", priority: "Alta", classification: "Saúde", description: "Tratamento de implante finalizado.", responsible: "Carlos Silva", phone: "(31) 93333-4444", email: "joao.s@email.com", location: "Belo Horizonte, MG", procedureDescription: "Implante dentário completo - dente 36.", medications: "Ibuprofeno 600mg, Amoxicilina 875mg", surgeryHistory: "Implante dentário realizado em 10/02/2025", timeline: [{ date: "10/02/2025 09:00", action: "Ticket criado", user: "Sistema" }, { date: "10/02/2025 16:00", action: "Tratamento concluído", user: "Dr. Marcos Lima" }], relatedTickets: [{ id: "TKT-030", subject: "Implante dental - início", date: "20/12/2024", status: "Resolvido" }] },
  { id: "TKT-048", sender: "Lucia Ferreira", cpf: "444.555.666-77", subject: "Atendimento encerrado", date: "03/02/2025", openedAt: "03/02/2025 11:30", channel: "WhatsApp", dentist: "Dra. Ana Ribeiro", status: "Fechado", priority: "Média", classification: "Saúde", description: "Tratamento gengival finalizado com sucesso.", responsible: "João Lima", phone: "(85) 94444-5555", email: "lucia.f@email.com", location: "Fortaleza, CE", procedureDescription: "Tratamento periodontal - raspagem subgengival.", medications: "Clorexidina 0,12% bochecho 2x/dia", timeline: [{ date: "03/02/2025 11:30", action: "Ticket criado", user: "Sistema" }, { date: "03/02/2025 17:00", action: "Ticket fechado", user: "João Lima" }], relatedTickets: [] },
  { id: "TKT-041", sender: "Pedro Almeida", cpf: "555.666.777-88", subject: "Doação processada", date: "28/01/2025", openedAt: "28/01/2025 08:00", channel: "E-mail", dentist: "-", status: "Resolvido", priority: "Baixa", classification: "Doação", description: "Doação eventual registrada.", responsible: "Ana Costa", phone: "(31) 95555-6666", email: "pedro.a@email.com", location: "Belo Horizonte, MG", timeline: [{ date: "28/01/2025 08:00", action: "Ticket criado", user: "Sistema" }], relatedTickets: [{ id: "TKT-004", subject: "Urgência odontológica", date: "05/04/2025", status: "Novo" }] },
  { id: "TKT-034", sender: "Fundação ABC", cpf: "98.765.432/0001-00", subject: "Parceria encerrada", date: "20/01/2025", openedAt: "20/01/2025 09:00", channel: "E-mail", dentist: "-", status: "Fechado", priority: "Média", classification: "Parceria", description: "Contrato de parceria finalizado.", responsible: "Paula Rocha", phone: "(71) 3222-1111", email: "contato@fundacaoabc.org", location: "Salvador, BA", timeline: [{ date: "20/01/2025 09:00", action: "Ticket criado", user: "Sistema" }, { date: "20/01/2025 16:00", action: "Ticket fechado", user: "Paula Rocha" }], relatedTickets: [{ id: "TKT-005", subject: "Doação mensal", date: "05/04/2025", status: "Aberto" }] },
  { id: "TKT-027", sender: "Maria Oliveira", cpf: "123.456.789-00", subject: "Consulta odontológica", date: "15/01/2025", openedAt: "15/01/2025 07:45", channel: "WhatsApp", dentist: "Dra. Fernanda Costa", status: "Resolvido", priority: "Alta", classification: "Saúde", description: "Consulta de retorno ortodôntico.", responsible: "Carlos Silva", phone: "(11) 99999-0000", email: "maria@email.com", location: "São Paulo, SP", procedureDescription: "Ajuste de aparelho ortodôntico fixo.", medications: "Paracetamol 750mg se dor", timeline: [{ date: "15/01/2025 07:45", action: "Ticket criado", user: "Sistema" }, { date: "15/01/2025 08:00", action: "Atribuído", user: "Ana Costa" }, { date: "15/01/2025 12:00", action: "Consulta realizada", user: "Dra. Fernanda Costa" }, { date: "15/01/2025 12:30", action: "Ticket resolvido", user: "Carlos Silva" }], relatedTickets: [{ id: "TKT-089", subject: "Consulta finalizada", date: "01/03/2025", status: "Resolvido" }, { id: "TKT-001", subject: "Dúvida sobre tratamento", date: "05/04/2025", status: "Aberto" }] },
];

const ITEMS_PER_PAGE = 10;

export default function History() {
  const { tickets: globalTickets } = useTickets();
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const [dentistFilter, setDentistFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<HistoryTicket | null>(null);

  // Merge resolved tickets from global state into history
  const resolvedFromGlobal: HistoryTicket[] = globalTickets
    .filter((t) => t.status === "Resolvido")
    .map((t) => ({
      id: t.id,
      sender: t.sender,
      cpf: t.cpf,
      subject: t.subject,
      date: t.openedAt.split(" ")[0],
      openedAt: t.openedAt,
      channel: t.channel,
      dentist: "-",
      status: "Resolvido",
      priority: t.priority,
      classification: t.classification,
      description: t.subject,
      responsible: t.responsible,
      phone: t.phone,
      email: t.email,
      location: t.location,
      procedureDescription: t.procedureDescription,
      medications: t.medications,
      surgeryHistory: t.surgeryHistory,
      timeline: [
        { date: t.openedAt, action: "Ticket criado", user: "Sistema" },
        { date: "Agora", action: "Ticket resolvido", user: t.responsible },
      ],
      relatedTickets: [],
    }));

  // Deduplicate by id
  const existingIds = new Set(staticHistoryTickets.map((t) => t.id));
  const merged = [...staticHistoryTickets, ...resolvedFromGlobal.filter((t) => !existingIds.has(t.id))];

  const filtered = merged.filter((t) => {
    const matchSearch = t.sender.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase());
    const matchChannel = channelFilter === "all" || t.channel === channelFilter;
    const matchDentist = dentistFilter === "all" || t.dentist === dentistFilter;
    return matchSearch && matchChannel && matchDentist;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const dentists = [...new Set(merged.map((t) => t.dentist).filter((d) => d !== "-"))];

  if (selected) {
    return (
      <div className="p-6 space-y-5 animate-fade-in">
        <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para Histórico
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-xl font-display font-bold">{selected.id}</h1>
          <Badge variant="secondary">{selected.status}</Badge>
          <Badge variant="outline">{selected.priority}</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dados do Formulário Original + Dados Pessoais */}
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4" /> Dados do Remetente</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {selected.sender.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold">{selected.sender}</p>
                  <p className="text-xs text-muted-foreground">{selected.classification}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div><p className="text-xs text-muted-foreground">CPF/CNPJ</p><p className="font-medium">{selected.cpf}</p></div>
                <div><p className="text-xs text-muted-foreground">Telefone</p><p className="font-medium">{selected.phone}</p></div>
                <div><p className="text-xs text-muted-foreground">E-mail</p><p className="font-medium">{selected.email}</p></div>
                <div><p className="text-xs text-muted-foreground">Localização</p><p className="font-medium">{selected.location}</p></div>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div><p className="text-xs text-muted-foreground">Canal</p><p className="font-medium">{selected.channel}</p></div>
                <div><p className="text-xs text-muted-foreground">Abertura</p><p className="font-medium">{selected.openedAt}</p></div>
                <div><p className="text-xs text-muted-foreground">Responsável</p><p className="font-medium">{selected.responsible}</p></div>
                <div><p className="text-xs text-muted-foreground">Dentista</p><p className="font-medium">{selected.dentist}</p></div>
              </div>
              <Separator />
              <div><p className="text-xs text-muted-foreground">Assunto</p><p className="text-sm font-medium">{selected.subject}</p></div>
              <div><p className="text-xs text-muted-foreground">Descrição</p><p className="text-sm">{selected.description}</p></div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-5">
            {/* Clinical Details */}
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium flex items-center gap-2"><Stethoscope className="w-4 h-4" /> Histórico Clínico</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Descrição do Procedimento</Label>
                  <p className="text-sm mt-1">{selected.procedureDescription || <span className="text-muted-foreground italic">Não informado</span>}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-xs text-muted-foreground">Medicamentos Prescritos</Label>
                  <p className="text-sm mt-1">{selected.medications || <span className="text-muted-foreground italic">Não informado</span>}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-xs text-muted-foreground">Histórico de Cirurgias / Intervenções</Label>
                  <p className="text-sm mt-1">{selected.surgeryHistory || <span className="text-muted-foreground italic">Não informado</span>}</p>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium flex items-center gap-2"><Clock className="w-4 h-4" /> Linha do Tempo</CardTitle></CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border" />
                  <div className="space-y-4">
                    {selected.timeline.map((t, i) => (
                      <div key={i} className="flex items-start gap-3 relative">
                        <div className={`w-4 h-4 rounded-full shrink-0 z-10 ${i === selected.timeline.length - 1 ? "bg-success" : "bg-primary"} flex items-center justify-center`}>
                          <div className="w-1.5 h-1.5 rounded-full bg-background" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{t.action}</p>
                          <p className="text-xs text-muted-foreground">{t.date} · {t.user}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Visão 360° - Related Tickets */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Visão 360° do Paciente — Todos os Atendimentos ({selected.relatedTickets.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selected.relatedTickets.length > 0 ? (
                  <div className="space-y-2">
                    {selected.relatedTickets.map((rt) => {
                      const fullTicket = merged.find((h) => h.id === rt.id);
                      return (
                        <button
                          key={rt.id}
                          className="w-full flex items-center justify-between px-3 py-2.5 bg-muted/50 hover:bg-accent rounded-md transition-colors text-left"
                          onClick={() => fullTicket && setSelected(fullTicket)}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="font-mono text-xs text-muted-foreground">{rt.id}</span>
                            <span className="text-sm truncate">{rt.subject}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-muted-foreground">{rt.date}</span>
                            <Badge variant="secondary" className="text-[10px]">{rt.status}</Badge>
                            <ChevronRight className="w-3 h-3 text-muted-foreground" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhum atendimento anterior vinculado</p>
                )}
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
        <h1 className="text-2xl font-display font-bold">Histórico</h1>
        <p className="text-sm text-muted-foreground">Tickets finalizados e arquivados</p>
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
            <SelectItem value="Outro">Outros</SelectItem>
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
              <TableRow key={t.id} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => setSelected(t)}>
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
