import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTickets, type Priority } from "@/contexts/TicketsContext";
import { maskCPF, maskCNPJ, maskPhone } from "@/lib/masks";
import {
  CANAL_LABELS,
  DENTISTA_STATUS_LABELS,
  PRIORIDADE_LABELS,
  TIPO_CONTATO_LABELS,
} from "@/lib/linkaidMappings";
import { toast } from "sonner";

const channelMap: Record<string, string> = {
  whatsapp: CANAL_LABELS.WHATSAPP,
  instagram: CANAL_LABELS.INSTAGRAM,
  email: CANAL_LABELS.EMAIL,
  other: CANAL_LABELS.MANUAL,
};

const priorityMap: Record<string, Priority> = {
  critical: PRIORIDADE_LABELS.CRITICA,
  high: PRIORIDADE_LABELS.ALTA,
  medium: PRIORIDADE_LABELS.MEDIA,
  low: PRIORIDADE_LABELS.BAIXA,
};

const typeOptions = [
  { value: TIPO_CONTATO_LABELS.DOADOR, label: TIPO_CONTATO_LABELS.DOADOR },
  { value: TIPO_CONTATO_LABELS.VOLUNTARIO, label: TIPO_CONTATO_LABELS.VOLUNTARIO },
  { value: TIPO_CONTATO_LABELS.PARCEIRO, label: TIPO_CONTATO_LABELS.PARCEIRO },
  { value: TIPO_CONTATO_LABELS.SOLICITANTE, label: TIPO_CONTATO_LABELS.SOLICITANTE },
  { value: TIPO_CONTATO_LABELS.BENEFICIARIO, label: TIPO_CONTATO_LABELS.BENEFICIARIO },
];

export default function CreateTicket() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { tickets, teamMembers, dentists, addTicket, addDentist } = useTickets();
  const [tab, setTab] = useState(searchParams.get("tab") || "pf");

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t) setTab(t);
  }, [searchParams]);
  

  const [name, setName] = useState("");
  const [doc, setDoc] = useState("");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [subject, setSubject] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("");
  const [responsible, setResponsible] = useState("");
  const [ticketType, setTicketType] = useState<string>(TIPO_CONTATO_LABELS.SOLICITANTE);

  const [ndName, setNdName] = useState("");
  const [ndSpecialty, setNdSpecialty] = useState("");
  const [ndPhone, setNdPhone] = useState("");
  const [ndEmail, setNdEmail] = useState("");
  const [ndCrm, setNdCrm] = useState("");
  const [ndCity, setNdCity] = useState("");
  const [ndUf, setNdUf] = useState("");

  const handleCreateDentist = async () => {
    if (!ndName || !ndSpecialty) {
      toast.error("Preencha nome e especialidade do dentista");
      return;
    }
    const newId = dentists.length + 1;
    try {
      await addDentist({
        id: newId,
        name: ndName,
        specialty: ndSpecialty,
        status: DENTISTA_STATUS_LABELS.A,
        totalSlots: 0,
        openSlots: 0,
        phone: ndPhone,
        email: ndEmail,
        crm: ndCrm,
        location: ndCity,
        uf: ndUf.toUpperCase().slice(0, 2),
        country: "Brasil",
        schedule: [],
      });
      toast.success("Dentista cadastrado com sucesso!");
      setNdName(""); setNdSpecialty(""); setNdPhone(""); setNdEmail(""); setNdCrm(""); setNdCity(""); setNdUf("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao cadastrar dentista");
    }
  };

  const handleCreate = async () => {
    if (!name || !subject || !priority || !channel) {
      toast.error("Preencha os campos obrigatórios: Nome, Assunto, Canal e Prioridade");
      return;
    }

    const now = new Date();
    const dateStamp = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("");
    const newId = `TKT-${dateStamp}-${String(tickets.length + 1).padStart(3, "0")}`;
    const openedAt = `${now.toLocaleDateString("pt-BR")} ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;

    try {
      await addTicket({
      id: newId,
      channel: channelMap[channel] || channel,
      sender: name,
      subject,
      description: desc || subject,
      classification: "Geral",
      priority: priorityMap[priority] || PRIORIDADE_LABELS.MEDIA,
      status: "Novo",
      responsible: responsible || "Sem responsável",
      updated: "agora",
      openedAt,
      phone,
      email: "",
      location: city && state ? `${city}, ${state}` : "",
      type: ticketType,
      cpf: doc,
      });

      toast.success("Ticket criado com sucesso!");
      navigate("/tickets");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar ticket");
    }
  };

  // Dentist tab: direct registration form
  const renderDentistForm = () => (
    <Card className="shadow-sm">
      <CardHeader><CardTitle className="text-base">Cadastrar Novo Dentista Voluntário</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><Label>Nome Completo *</Label><Input placeholder="Nome completo do profissional" value={ndName} onChange={(e) => setNdName(e.target.value)} /></div>
          <div><Label>Especialidade *</Label><Input placeholder="Ex: Ortodontia, Endodontia" value={ndSpecialty} onChange={(e) => setNdSpecialty(e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><Label>Telefone</Label><Input placeholder="(00) 00000-0000" value={ndPhone} onChange={(e) => setNdPhone(maskPhone(e.target.value))} /></div>
          <div><Label>E-mail</Label><Input placeholder="email@exemplo.com" value={ndEmail} onChange={(e) => setNdEmail(e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><Label>CRO</Label><Input placeholder="CRO-XX 00000" value={ndCrm} onChange={(e) => setNdCrm(e.target.value)} /></div>
          <div><Label>Cidade</Label><Input placeholder="Cidade" value={ndCity} onChange={(e) => setNdCity(e.target.value)} /></div>
          <div><Label>UF</Label><Input placeholder="UF" value={ndUf} onChange={(e) => setNdUf(e.target.value.toUpperCase().slice(0, 2))} /></div>
        </div>
        <Button className="w-full" onClick={handleCreateDentist}>
          <Plus className="w-4 h-4 mr-1" /> Cadastrar Dentista
        </Button>
      </CardContent>
    </Card>
  );

  const renderForm = () => (
    <Card className="shadow-sm">
      <CardHeader><CardTitle className="text-base">Dados do {tab === "pf" ? "Paciente" : "Empresa"}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><Label>{tab === "pf" ? "Nome Completo" : "Razão Social"}</Label><Input placeholder={tab === "pf" ? "Nome completo do paciente" : "Razão social da empresa"} value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div>
            <Label>{tab === "pf" ? "CPF" : "CNPJ"}</Label>
            <Input placeholder={tab === "pf" ? "000.000.000-00" : "00.000.000/0000-00"} value={doc} onChange={(e) => setDoc(tab === "pf" ? maskCPF(e.target.value) : maskCNPJ(e.target.value))} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><Label>Telefone</Label><Input placeholder="(00) 00000-0000" value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} /></div>
          <div>
            <Label>Canal *</Label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger><SelectValue placeholder="Selecione o canal de entrada" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="email">E-mail</SelectItem>
                <SelectItem value="other">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><Label>Cidade</Label><Input placeholder="Cidade do remetente" value={city} onChange={(e) => setCity(e.target.value)} /></div>
          <div><Label>Estado</Label><Input placeholder="UF" value={state} onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))} /></div>
          <div>
            <Label>Tipo / Etiqueta</Label>
            <Select value={ticketType} onValueChange={setTicketType}>
              <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
              <SelectContent>
                {typeOptions.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div><Label>Assunto *</Label><Input placeholder="Assunto principal do ticket" value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
        <div><Label>Descrição</Label><Textarea placeholder="Descreva detalhadamente o atendimento..." rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Prioridade *</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger><SelectValue placeholder="Selecione a prioridade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Crítica</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Responsável (Atendimento)</Label>
            <Select value={responsible} onValueChange={setResponsible}>
              <SelectTrigger><SelectValue placeholder="Selecione o responsável" /></SelectTrigger>
              <SelectContent>
                {teamMembers.map((m) => (
                  <SelectItem key={m.name} value={m.name}>{m.name} — {m.role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button className="w-full mt-2" onClick={handleCreate}>Criar Ticket</Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5 animate-fade-in">
      <Button variant="ghost" size="sm" onClick={() => navigate("/tickets")}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
      </Button>

      <div>
        <h1 className="text-2xl font-display font-bold">Criar Ticket</h1>
        <p className="text-sm text-muted-foreground">Cadastro manual de atendimento</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => { setTab(v); setDoc(""); }}>
        <TabsList>
          <TabsTrigger value="pf">Pessoa Física</TabsTrigger>
          <TabsTrigger value="pj">Pessoa Jurídica</TabsTrigger>
          <TabsTrigger value="dentist">Dentista</TabsTrigger>
        </TabsList>
        <TabsContent value="pf">{renderForm()}</TabsContent>
        <TabsContent value="pj">{renderForm()}</TabsContent>
        <TabsContent value="dentist">{renderDentistForm()}</TabsContent>
      </Tabs>
    </div>
  );
}
