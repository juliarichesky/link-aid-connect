import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Paperclip, Send, Bot, User, CalendarDays, PhoneOff } from "lucide-react";
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
import { useTickets, type Contact, type Ticket } from "@/contexts/TicketsContext";
import { TIPO_CONTATO_LABELS } from "@/lib/linkaidMappings";
import { maskCNPJ, maskCPF, maskPhone } from "@/lib/masks";
import { ticketDisplayProtocol } from "@/lib/ticketDisplay";
import { toast } from "sonner";

const typeColors: Record<string, string> = {
  Solicitante: "bg-warning/15 text-warning border-warning/30",
  Beneficiário: "bg-warning/15 text-warning border-warning/30",
  Doador: "bg-primary/15 text-primary border-primary/30",
  Dentista: "bg-success/15 text-success border-success/30",
  Parceiro: "bg-info/15 text-info border-info/30",
};

const contactTypeOptions = [
  TIPO_CONTATO_LABELS.SOLICITANTE,
  TIPO_CONTATO_LABELS.BENEFICIARIO,
  TIPO_CONTATO_LABELS.DOADOR,
  TIPO_CONTATO_LABELS.VOLUNTARIO,
  TIPO_CONTATO_LABELS.PARCEIRO,
];

const splitLocation = (location: string) => {
  const [city = "", uf = ""] = location.split(",").map((part) => part.trim());
  return { city, uf };
};

const maskDocument = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits.length > 11 ? maskCNPJ(value) : maskCPF(value);
};

const personalDataFromTicket = (ticket?: Ticket) => {
  const { city, uf } = splitLocation(ticket?.location || "");
  return {
    name: ticket?.sender || "",
    cpf: ticket?.cpf && ticket.cpf !== "-" ? maskDocument(ticket.cpf) : "",
    phone: ticket?.phone ? maskPhone(ticket.phone) : "",
    email: ticket?.email || "",
    type: ticket?.type || TIPO_CONTATO_LABELS.SOLICITANTE,
    city,
    uf,
  };
};

const contactFromTicket = (ticket: Ticket): Contact => ({
  id: ticket.idContato,
  name: ticket.sender,
  cpf: ticket.cpf,
  phone: ticket.phone,
  email: ticket.email,
  type: ticket.type,
  location: ticket.location,
});

type TicketDetailLocationState = {
  backUrl?: string;
};

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { tickets, teamMembers, loading, loadTicket, updateTicket, updateContact, addChatMessage, releasePhoneForTesting } = useTickets();
  const [reply, setReply] = useState("");
  const [loadingDetail, setLoadingDetail] = useState(() => Boolean(id && /^\d+$/.test(id)));
  const [releasingPhone, setReleasingPhone] = useState(false);

  const ticket = tickets.find((t) => t.id === id);
  const locationState = location.state as TicketDetailLocationState | null;
  const backUrl = locationState?.backUrl || "/tickets";

  const [priority, setPriority] = useState<string>(ticket?.priority || "Alta");
  const [status, setStatus] = useState(ticket?.status || "Aberto");
  const [responsible, setResponsible] = useState(ticket?.responsible || "");
  const [channel, setChannel] = useState(ticket?.channel || "WhatsApp");
  const [personalData, setPersonalData] = useState(() => personalDataFromTicket(ticket));
  const [personalDataDirty, setPersonalDataDirty] = useState(false);

  useEffect(() => {
    if (!id) return;

    let active = true;
    setLoadingDetail(true);
    loadTicket(id)
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Erro ao carregar ticket");
      })
      .finally(() => {
        if (active) setLoadingDetail(false);
      });

    return () => {
      active = false;
    };
  }, [id, loadTicket]);

  useEffect(() => {
    setPersonalData(personalDataFromTicket(undefined));
    setPersonalDataDirty(false);
  }, [id]);

  useEffect(() => {
    if (ticket) {
      setPriority(ticket.priority);
      setStatus(ticket.status);
      setResponsible(ticket.responsible);
      setChannel(ticket.channel);
      if (!personalDataDirty) {
        setPersonalData(personalDataFromTicket(ticket));
      }
    }
  }, [ticket, personalDataDirty]);

  useEffect(() => {
    if (!id || !/^\d+$/.test(id)) return;

    const intervalId = window.setInterval(() => {
      loadTicket(id).catch(() => {
        // A toast a cada polling deixaria a conversa barulhenta; o carregamento inicial ja mostra erro.
      });
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [id, loadTicket]);

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
      await loadTicket(id);
      setReply("");
      toast.success("Mensagem enviada");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar mensagem");
    }
  };

  const handleReleasePhoneForTesting = async () => {
    if (!id || releasingPhone) return;
    const confirmed = window.confirm(
      "Liberar este numero para novo teste? O ticket continua salvo, mas o telefone do contato sera trocado por um numero ficticio."
    );
    if (!confirmed) return;

    setReleasingPhone(true);
    try {
      const updated = await releasePhoneForTesting(id);
      const phoneSuffix = updated ? `: ${updated.phone}` : "";
      toast.success(`Numero liberado para novo teste${phoneSuffix}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao liberar numero para teste");
    } finally {
      setReleasingPhone(false);
    }
  };

  const handleSavePersonalData = async () => {
    if (!ticket) return;
    if (!ticket.idContato && /^\d+$/.test(ticket.id)) {
      toast.error("Ticket sem contato vinculado para atualizaÃ§Ã£o universal");
      return;
    }

    const normalizedName = personalData.name.trim();
    if (!normalizedName) {
      toast.error("Informe o nome do remetente");
      return;
    }

    const normalizedUf = personalData.uf.trim().toUpperCase().slice(0, 2);
    const updatedContact: Contact = {
      id: ticket.idContato,
      name: normalizedName,
      cpf: personalData.cpf.trim() || "-",
      phone: personalData.phone.trim(),
      email: personalData.email.trim(),
      type: personalData.type,
      location: [personalData.city.trim(), normalizedUf].filter(Boolean).join(", "),
    };

    try {
      const saved = await updateContact(updatedContact, contactFromTicket(ticket));
      setPersonalData(personalDataFromTicket({
        ...ticket,
        sender: saved?.name || updatedContact.name,
        cpf: saved?.cpf || updatedContact.cpf,
        phone: saved?.phone || updatedContact.phone,
        email: saved?.email || updatedContact.email,
        type: saved?.type || updatedContact.type,
        location: saved?.location || updatedContact.location,
      }));
      setPersonalDataDirty(false);
      toast.success("Dados do contato salvos universalmente");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar dados do contato");
    }
  };

  // Related tickets by same CPF
  const relatedTickets = ticket ? tickets.filter((t) => t.cpf === ticket.cpf && t.id !== ticket.id) : [];

  const allMessages = ticket?.chatMessages || [];
  const loadingMessages = loadingDetail && !ticket?.messagesLoaded;
  const aiSummary = ticket?.aiSummary || ticket?.description || "Nenhum resumo registrado para este ticket.";

  if (!ticket) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>{loadingDetail || loading ? "Carregando ticket..." : "Ticket não encontrado"}</p>
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
            <p className="font-mono font-semibold">{ticketDisplayProtocol(ticket)}</p>
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-center"
              onClick={handleReleasePhoneForTesting}
              disabled={releasingPhone}
            >
              <PhoneOff className="w-4 h-4 mr-2" />
              {releasingPhone ? "Liberando..." : "Liberar numero para teste"}
            </Button>
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
            <div><p className="text-xs text-muted-foreground">Resumo</p><p className="text-xs mt-1">{aiSummary}</p></div>
            {typeof ticket.aiConfidence === "number" && (
              <div><p className="text-xs text-muted-foreground">Confiança</p><p className="text-xs mt-1">{ticket.aiConfidence.toFixed(0)}%</p></div>
            )}
          </CardContent>
        </Card>

        {/* Management Fields */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Gerenciamento</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Prioridade</Label>
              <Select value={priority} onValueChange={(v) => { setPriority(v); handleSave("priority", v); }}>
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
                    <span className="font-mono font-medium">{ticketDisplayProtocol(h)}</span>
                    <span className="text-muted-foreground">{h.openedAt}</span>
                  </div>
                  <p>{h.subject}</p>
                  <div className="flex justify-end text-muted-foreground">
                    <Badge variant="secondary" className="text-[10px] h-4">{h.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="personal">
            <div className="space-y-3 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Nome</Label>
                  <Input
                    className="h-8 text-sm"
                    value={personalData.name}
                    onChange={(event) => {
                      setPersonalData((current) => ({ ...current, name: event.target.value }));
                      setPersonalDataDirty(true);
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs">CPF/CNPJ</Label>
                  <Input
                    className="h-8 text-sm"
                    value={personalData.cpf}
                    onChange={(event) => {
                      setPersonalData((current) => ({ ...current, cpf: maskDocument(event.target.value) }));
                      setPersonalDataDirty(true);
                    }}
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">E-mail</Label>
                <Input
                  className="h-8 text-sm"
                  type="email"
                  value={personalData.email}
                  onChange={(event) => {
                    setPersonalData((current) => ({ ...current, email: event.target.value }));
                    setPersonalDataDirty(true);
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Telefone</Label>
                  <Input
                    className="h-8 text-sm"
                    value={personalData.phone}
                    onChange={(event) => {
                      setPersonalData((current) => ({ ...current, phone: maskPhone(event.target.value) }));
                      setPersonalDataDirty(true);
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs">Tipo</Label>
                  <Select
                    value={personalData.type}
                    onValueChange={(value) => {
                      setPersonalData((current) => ({ ...current, type: value }));
                      setPersonalDataDirty(true);
                    }}
                  >
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {contactTypeOptions.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Cidade</Label>
                  <Input
                    className="h-8 text-sm"
                    value={personalData.city}
                    onChange={(event) => {
                      setPersonalData((current) => ({ ...current, city: event.target.value }));
                      setPersonalDataDirty(true);
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs">Estado</Label>
                  <Input
                    className="h-8 text-sm"
                    value={personalData.uf}
                    onChange={(event) => {
                      setPersonalData((current) => ({ ...current, uf: event.target.value.toUpperCase().slice(0, 2) }));
                      setPersonalDataDirty(true);
                    }}
                  />
                </div>
              </div>
              <Button size="sm" className="w-full" onClick={handleSavePersonalData}>Salvar Dados do Contato</Button>
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
          {loadingMessages ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              Carregando conversa...
            </div>
          ) : allMessages.length > 0 ? (
            allMessages.map((m, i) => (
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
                  <p className="whitespace-pre-line">{m.text}</p>
                  <p className={`text-[10px] mt-1 ${m.from === "agent" ? "opacity-70" : "text-muted-foreground"}`}>{m.time}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              Nenhuma mensagem registrada para este ticket.
            </div>
          )}
        </div>

        <div className="border-t border-border p-4 bg-card">
          <div className="flex items-end gap-2">
            <Button variant="ghost" size="icon" className="shrink-0"><Paperclip className="w-4 h-4" /></Button>
            <Textarea disabled={loadingMessages} placeholder="Digite sua resposta..." value={reply} onChange={(e) => setReply(e.target.value)} className="min-h-[44px] max-h-32 resize-none" rows={1} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }} />
            <Button size="icon" className="shrink-0" onClick={handleSendReply} disabled={loadingMessages || !reply.trim()}><Send className="w-4 h-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
