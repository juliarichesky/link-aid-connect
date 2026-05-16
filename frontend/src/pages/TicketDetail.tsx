import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Paperclip, Send, Bot, User, CalendarDays, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useTickets } from "@/contexts/TicketsContext";
import { toast } from "sonner";

const defaultMessages = [
  { from: "client", text: "Olá, gostaria de saber sobre o tratamento odontológico gratuito.", time: "14:30" },
  { from: "ai", text: "Classificação automática: Saúde — Prioridade: Alta. Resumo: Beneficiário buscando informações sobre tratamento gratuito.", time: "14:30" },
  { from: "agent", text: "Olá Maria! Obrigado por entrar em contato. Vou verificar as vagas disponíveis para você.", time: "14:35" },
  { from: "client", text: "Muito obrigada! Preciso para meu filho de 8 anos.", time: "14:37" },
];

const typeColors: Record<string, string> = {
  Beneficiário: "bg-warning/15 text-warning border-warning/30",
  Doador: "bg-primary/15 text-primary border-primary/30",
  Voluntário: "bg-success/15 text-success border-success/30",
  Parceiro: "bg-info/15 text-info border-info/30",
};

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { tickets, teamMembers, dentists, updateTicket, addChatMessage } = useTickets();
  const [reply, setReply] = useState("");

  const ticket = tickets.find((t) => t.id === id);
  const backUrl = (location.state as any)?.backUrl || "/tickets";

  const [priority, setPriority] = useState(ticket?.priority || "Alta");
  const [status, setStatus] = useState(ticket?.status || "Aberto");
  const [responsible, setResponsible] = useState(ticket?.responsible || "");
  const [dentistResp, setDentistResp] = useState(ticket?.dentistResponsible || "");
  const [channel, setChannel] = useState(ticket?.channel || "WhatsApp");

  useEffect(() => {
    if (ticket) {
      setPriority(ticket.priority);
      setStatus(ticket.status);
      setResponsible(ticket.responsible);
      setDentistResp(ticket.dentistResponsible || "");
      setChannel(ticket.channel);
    }
  }, [ticket]);

  const handleSave = async (field: string, value: string) => {
    if (!id) return;
    try {
      await updateTicket(id, { [field]: value });
      if (field === "status" && value === "Resolvido") {
        toast.success("Ticket resolvido e movido para Histórico");
        setTimeout(() => navigate(backUrl), 500);
        return;
      }
      toast.success("Alteração salva com sucesso");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar alteração");
    }
  };

  const handleSendReply = async () => {
    if (!reply.trim() || !id) return;
    const now = new Date();
    const time = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    try {
      await addChatMessage(id, { from: "agent", text: reply, time });
      setReply("");
      toast.success("Mensagem enviada");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar mensagem");
    }
  };

  // Related tickets by same CPF
  const relatedTickets = ticket ? tickets.filter((t) => t.cpf === ticket.cpf && t.id !== ticket.id) : [];

  const allMessages = ticket?.chatMessages?.length ? ticket.chatMessages : defaultMessages;

  if (!ticket) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>Ticket não encontrado</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate(backUrl)}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] flex animate-fade-in">
      {/* Left Panel */}
      <div className="w-96 border-r border-border p-5 space-y-5 overflow-y-auto scrollbar-thin bg-card">
        <Button variant="ghost" size="sm" onClick={() => navigate(backUrl)} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Ticket</p>
            <p className="font-mono font-semibold">{ticket.protocol || id}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
              <CalendarDays className="w-3 h-3" /> Abertura
            </p>
            <p className="text-sm font-medium">{ticket.openedAt}</p>
          </div>
        </div>

        {/* Sender Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Remetente</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                {ticket.sender.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <p className="font-medium">{ticket.sender}</p>
                <p className="text-xs text-muted-foreground">{ticket.phone}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs pt-2">
              <div>
                <p className="text-muted-foreground">Tipo</p>
                <Badge variant="outline" className={`text-[10px] mt-0.5 ${typeColors[ticket.type] || ""}`}>{ticket.type}</Badge>
              </div>
              <div><p className="text-muted-foreground">Local</p><p className="font-medium">{ticket.location}</p></div>
            </div>
          </CardContent>
        </Card>

        {/* AI Panel */}
        <Card className="border-primary/20 bg-primary/5 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary" /> Inteligência IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><p className="text-xs text-muted-foreground">Classificação</p><Badge className="mt-1">{ticket.classification}</Badge></div>
            <div><p className="text-xs text-muted-foreground">Resumo</p><p className="text-xs mt-1">Beneficiária busca tratamento odontológico gratuito para filho de 8 anos.</p></div>
          </CardContent>
        </Card>

        {/* Management Fields */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Gerenciamento</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Prioridade</Label>
              <Select value={priority} onValueChange={(v) => { setPriority(v as any); handleSave("priority", v); }}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Crítica">Crítica</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={status} onValueChange={(v) => { setStatus(v); handleSave("status", v); }}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Novo">Novo</SelectItem>
                  <SelectItem value="Aberto">Aberto</SelectItem>
                  <SelectItem value="Aguardando">Aguardando</SelectItem>
                  <SelectItem value="Resolvido">Resolvido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Responsável pelo Atendimento</Label>
              <Select value={responsible} onValueChange={(v) => { setResponsible(v); handleSave("responsible", v); }}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {teamMembers.map((m) => (
                    <SelectItem key={m.name} value={m.name}>{m.name} — {m.role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs flex items-center gap-1"><Stethoscope className="w-3 h-3" /> Dentista Responsável</Label>
              <Select value={dentistResp || "none"} onValueChange={(v) => { const val = v === "none" ? "" : v; setDentistResp(val); handleSave("dentistResponsible", val); }}>
                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Nenhum" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {dentists.filter((d) => d.status === "Ativo").map((d) => (
                    <SelectItem key={d.id} value={d.name}>{d.name} — {d.specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Canal</Label>
              <Select value={channel} onValueChange={(v) => { setChannel(v); handleSave("channel", v); }}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="E-mail">E-mail</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs: History, Personal Data, Clinical */}
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="history" className="flex-1 text-xs">Histórico</TabsTrigger>
            <TabsTrigger value="personal" className="flex-1 text-xs">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="clinical" className="flex-1 text-xs">Clínico</TabsTrigger>
          </TabsList>
          <TabsContent value="history">
            <div className="space-y-2 mt-2">
              {relatedTickets.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">Nenhum ticket anterior para este CPF</p>
              )}
              {relatedTickets.map((h) => (
                <div key={h.id} className="text-xs px-3 py-2 bg-muted rounded-md space-y-1 cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate(`/tickets/${h.id}`, { state: { backUrl } })}>
                  <div className="flex justify-between">
                    <span className="font-mono font-medium">{h.protocol || h.id}</span>
                    <span className="text-muted-foreground">{h.openedAt}</span>
                  </div>
                  <p>{h.subject}</p>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{h.dentistResponsible || "-"}</span>
                    <Badge variant="secondary" className="text-[10px] h-4">{h.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="personal">
            <div className="space-y-3 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Nome</Label><Input className="h-8 text-sm" defaultValue={ticket.sender} /></div>
                <div><Label className="text-xs">CPF</Label><Input className="h-8 text-sm" defaultValue={ticket.cpf} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Telefone</Label><Input className="h-8 text-sm" defaultValue={ticket.phone} /></div>
                <div><Label className="text-xs">Tipo</Label><Input className="h-8 text-sm" defaultValue={ticket.type} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Cidade</Label><Input className="h-8 text-sm" defaultValue={ticket.location.split(", ")[0]} /></div>
                <div><Label className="text-xs">Estado</Label><Input className="h-8 text-sm" defaultValue={ticket.location.split(", ")[1]} /></div>
              </div>
              <Button size="sm" className="w-full" onClick={() => toast.success("Dados pessoais salvos com sucesso")}>Salvar Alterações</Button>
            </div>
          </TabsContent>
          <TabsContent value="clinical">
            <div className="space-y-3 mt-2">
              <div>
                <Label className="text-xs">Descrição do Procedimento</Label>
                <Textarea className="text-sm" rows={2} defaultValue={ticket.procedureDescription || ""} placeholder="Descreva o procedimento realizado..." onBlur={(e) => { if (id) { updateTicket(id, { procedureDescription: e.target.value }); toast.success("Procedimento salvo"); } }} />
              </div>
              <div>
                <Label className="text-xs">Medicamentos Prescritos</Label>
                <Textarea className="text-sm" rows={2} defaultValue={ticket.medications || ""} placeholder="Liste os medicamentos prescritos..." onBlur={(e) => { if (id) { updateTicket(id, { medications: e.target.value }); toast.success("Medicamentos salvos"); } }} />
              </div>
              <div>
                <Label className="text-xs">Histórico de Cirurgias / Intervenções</Label>
                <Textarea className="text-sm" rows={2} defaultValue={ticket.surgeryHistory || ""} placeholder="Registre cirurgias ou intervenções..." onBlur={(e) => { if (id) { updateTicket(id, { surgeryHistory: e.target.value }); toast.success("Histórico cirúrgico salvo"); } }} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Right — Chat */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
          {allMessages.map((m, i) => (
            <div key={i} className={`flex ${m.from === "client" ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-md px-4 py-2.5 rounded-xl text-sm ${
                m.from === "client" ? "bg-muted text-foreground rounded-tl-none"
                : m.from === "ai" ? "bg-primary/10 text-primary border border-primary/20 rounded-tr-none"
                : "bg-primary text-primary-foreground rounded-tr-none"
              }`}>
                {m.from === "ai" && (
                  <div className="flex items-center gap-1 mb-1">
                    <Bot className="w-3 h-3" /><span className="text-[10px] font-medium uppercase">IA</span>
                  </div>
                )}
                {m.from === "agent" && (
                  <div className="flex items-center gap-1 mb-1">
                    <User className="w-3 h-3" /><span className="text-[10px] font-medium uppercase opacity-70">Você</span>
                  </div>
                )}
                <p>{m.text}</p>
                <p className={`text-[10px] mt-1 ${m.from === "agent" ? "opacity-70" : "text-muted-foreground"}`}>{m.time}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border p-4 bg-card">
          <div className="flex items-end gap-2">
            <Button variant="ghost" size="icon" className="shrink-0"><Paperclip className="w-4 h-4" /></Button>
            <Textarea placeholder="Digite sua resposta..." value={reply} onChange={(e) => setReply(e.target.value)} className="min-h-[44px] max-h-32 resize-none" rows={1} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }} />
            <Button size="icon" className="shrink-0" onClick={handleSendReply}><Send className="w-4 h-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
