import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
import { toast } from "sonner";

const channelMap: Record<string, string> = { whatsapp: "WhatsApp", instagram: "Instagram", email: "E-mail", other: "Outro" };
const priorityMap: Record<string, Priority> = { critical: "Crítica", high: "Alta", medium: "Média", low: "Baixa" };
const responsibleMap: Record<string, string> = { carlos: "Carlos Silva", ana: "Ana Costa", maria: "Maria Santos" };

export default function CreateTicket() {
  const navigate = useNavigate();
  const { tickets, addTicket } = useTickets();
  const [type, setType] = useState("pf");

  // PF fields
  const [pfName, setPfName] = useState("");
  const [pfCpf, setPfCpf] = useState("");
  const [pfPhone, setPfPhone] = useState("");
  const [pfChannel, setPfChannel] = useState("");
  const [pfCity, setPfCity] = useState("");
  const [pfState, setPfState] = useState("");
  const [pfSubject, setPfSubject] = useState("");
  const [pfDesc, setPfDesc] = useState("");
  const [pfPriority, setPfPriority] = useState("");
  const [pfResponsible, setPfResponsible] = useState("");

  // PJ fields
  const [pjName, setPjName] = useState("");
  const [pjCnpj, setPjCnpj] = useState("");
  const [pjPhone, setPjPhone] = useState("");
  const [pjChannel, setPjChannel] = useState("");
  const [pjCity, setPjCity] = useState("");
  const [pjState, setPjState] = useState("");
  const [pjSubject, setPjSubject] = useState("");
  const [pjDesc, setPjDesc] = useState("");
  const [pjPriority, setPjPriority] = useState("");
  const [pjResponsible, setPjResponsible] = useState("");

  const handleCreate = () => {
    const isPf = type === "pf";
    const name = isPf ? pfName : pjName;
    const doc = isPf ? pfCpf : pjCnpj;
    const phone = isPf ? pfPhone : pjPhone;
    const channel = isPf ? pfChannel : pjChannel;
    const subject = isPf ? pfSubject : pjSubject;
    const priority = isPf ? pfPriority : pjPriority;
    const responsible = isPf ? pfResponsible : pjResponsible;
    const city = isPf ? pfCity : pjCity;
    const state = isPf ? pfState : pjState;

    if (!name || !subject || !priority || !channel) {
      toast.error("Preencha os campos obrigatórios: Nome, Assunto, Canal e Prioridade");
      return;
    }

    const newId = `TKT-${String(tickets.length + 1).padStart(3, "0")}`;
    const now = new Date();
    const openedAt = `${now.toLocaleDateString("pt-BR")} ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;

    addTicket({
      id: newId,
      channel: channelMap[channel] || channel,
      sender: name,
      subject,
      classification: "Geral",
      priority: priorityMap[priority] || "Média",
      status: "Novo",
      responsible: responsibleMap[responsible] || "Sem responsável",
      updated: "agora",
      openedAt,
      phone,
      email: "",
      location: `${city}, ${state}`,
      type: isPf ? "Beneficiário" : "Parceiro",
      cpf: doc,
    });

    toast.success("Ticket criado com sucesso!");
    navigate("/tickets");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5 animate-fade-in">
      <Button variant="ghost" size="sm" onClick={() => navigate("/tickets")}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
      </Button>

      <div>
        <h1 className="text-2xl font-display font-bold">Criar Ticket</h1>
        <p className="text-sm text-muted-foreground">Cadastro manual de atendimento</p>
      </div>

      <Tabs value={type} onValueChange={setType}>
        <TabsList>
          <TabsTrigger value="pf">Pessoa Física</TabsTrigger>
          <TabsTrigger value="pj">Pessoa Jurídica</TabsTrigger>
        </TabsList>

        <TabsContent value="pf">
          <Card>
            <CardHeader><CardTitle className="text-base">Dados da Pessoa Física</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Nome</Label><Input placeholder="Nome completo" value={pfName} onChange={(e) => setPfName(e.target.value)} /></div>
                <div><Label>CPF</Label><Input placeholder="000.000.000-00" value={pfCpf} onChange={(e) => setPfCpf(maskCPF(e.target.value))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Telefone</Label><Input placeholder="(00) 00000-0000" value={pfPhone} onChange={(e) => setPfPhone(maskPhone(e.target.value))} /></div>
                <div>
                  <Label>Canal</Label>
                  <Select value={pfChannel} onValueChange={setPfChannel}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="other">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Cidade</Label><Input placeholder="Cidade" value={pfCity} onChange={(e) => setPfCity(e.target.value)} /></div>
                <div><Label>Estado</Label><Input placeholder="UF" value={pfState} onChange={(e) => setPfState(e.target.value.toUpperCase().slice(0, 2))} /></div>
              </div>
              <div><Label>Assunto</Label><Input placeholder="Assunto do ticket" value={pfSubject} onChange={(e) => setPfSubject(e.target.value)} /></div>
              <div><Label>Descrição</Label><Textarea placeholder="Descreva o atendimento..." rows={3} value={pfDesc} onChange={(e) => setPfDesc(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prioridade</Label>
                  <Select value={pfPriority} onValueChange={setPfPriority}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Crítica</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Responsável</Label>
                  <Select value={pfResponsible} onValueChange={setPfResponsible}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="carlos">Carlos Silva</SelectItem>
                      <SelectItem value="ana">Ana Costa</SelectItem>
                      <SelectItem value="maria">Maria Santos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full" onClick={handleCreate}>Criar Ticket</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pj">
          <Card>
            <CardHeader><CardTitle className="text-base">Dados da Pessoa Jurídica</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Nome da Empresa</Label><Input placeholder="Razão social" value={pjName} onChange={(e) => setPjName(e.target.value)} /></div>
                <div><Label>CNPJ</Label><Input placeholder="00.000.000/0000-00" value={pjCnpj} onChange={(e) => setPjCnpj(maskCNPJ(e.target.value))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Telefone</Label><Input placeholder="(00) 00000-0000" value={pjPhone} onChange={(e) => setPjPhone(maskPhone(e.target.value))} /></div>
                <div>
                  <Label>Canal</Label>
                  <Select value={pjChannel} onValueChange={setPjChannel}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="other">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Cidade</Label><Input placeholder="Cidade" value={pjCity} onChange={(e) => setPjCity(e.target.value)} /></div>
                <div><Label>Estado</Label><Input placeholder="UF" value={pjState} onChange={(e) => setPjState(e.target.value.toUpperCase().slice(0, 2))} /></div>
              </div>
              <div><Label>Assunto</Label><Input placeholder="Assunto do ticket" value={pjSubject} onChange={(e) => setPjSubject(e.target.value)} /></div>
              <div><Label>Descrição</Label><Textarea placeholder="Descreva o atendimento..." rows={3} value={pjDesc} onChange={(e) => setPjDesc(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prioridade</Label>
                  <Select value={pjPriority} onValueChange={setPjPriority}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Crítica</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Responsável</Label>
                  <Select value={pjResponsible} onValueChange={setPjResponsible}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="carlos">Carlos Silva</SelectItem>
                      <SelectItem value="ana">Ana Costa</SelectItem>
                      <SelectItem value="maria">Maria Santos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full" onClick={handleCreate}>Criar Ticket</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
