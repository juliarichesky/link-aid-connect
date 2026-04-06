import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Paperclip, Send, Bot, User, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

const messages = [
  { from: "client", text: "Olá, gostaria de saber sobre o tratamento odontológico gratuito.", time: "14:30" },
  { from: "ai", text: "Classificação automática: Saúde — Prioridade: Alta. Resumo: Beneficiário buscando informações sobre tratamento gratuito.", time: "14:30" },
  { from: "agent", text: "Olá Maria! Obrigado por entrar em contato. Vou verificar as vagas disponíveis para você.", time: "14:35" },
  { from: "client", text: "Muito obrigada! Preciso para meu filho de 8 anos.", time: "14:37" },
];

const patientHistory = [
  { id: "TKT-098", date: "15/08/2024", subject: "Consulta odontológica", status: "Resolvido", dentist: "Dra. Fernanda Costa" },
  { id: "TKT-045", date: "10/03/2024", subject: "Agendamento tratamento", status: "Resolvido", dentist: "Dr. Marcos Lima" },
  { id: "TKT-012", date: "05/01/2024", subject: "Primeiro contato", status: "Fechado", dentist: "-" },
];

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reply, setReply] = useState("");
  const [priority, setPriority] = useState("Alta");
  const [status, setStatus] = useState("Aberto");
  const [responsible, setResponsible] = useState("carlos");
  const [channel, setChannel] = useState("whatsapp");

  return (
    <div className="h-[calc(100vh-3.5rem)] flex animate-fade-in">
      {/* Left Panel */}
      <div className="w-96 border-r border-border p-5 space-y-5 overflow-y-auto scrollbar-thin bg-card">
        <Button variant="ghost" size="sm" onClick={() => navigate("/tickets")} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Ticket</p>
            <p className="font-mono font-semibold">{id}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
              <CalendarDays className="w-3 h-3" /> Abertura
            </p>
            <p className="text-sm font-medium">05/04/2025 14:28</p>
          </div>
        </div>

        {/* Sender Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Remetente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                MO
              </div>
              <div>
                <p className="font-medium">Maria Oliveira</p>
                <p className="text-xs text-muted-foreground">+55 11 99999-0000</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs pt-2">
              <div><p className="text-muted-foreground">Tipo</p><p className="font-medium">Beneficiário</p></div>
              <div><p className="text-muted-foreground">Local</p><p className="font-medium">São Paulo, SP</p></div>
            </div>
          </CardContent>
        </Card>

        {/* AI Panel */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary" />
              Inteligência IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Classificação</p>
              <Badge className="mt-1">Saúde</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Resumo</p>
              <p className="text-xs mt-1">Beneficiária busca tratamento odontológico gratuito para filho de 8 anos.</p>
            </div>
          </CardContent>
        </Card>

        {/* Editable Fields */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Gerenciamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Prioridade</Label>
              <Select value={priority} onValueChange={setPriority}>
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
              <Select value={status} onValueChange={setStatus}>
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
              <Label className="text-xs">Responsável</Label>
              <Select value={responsible} onValueChange={setResponsible}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="carlos">Carlos Silva</SelectItem>
                  <SelectItem value="ana">Ana Costa</SelectItem>
                  <SelectItem value="maria">Maria Santos</SelectItem>
                  <SelectItem value="joao">João Lima</SelectItem>
                  <SelectItem value="paula">Paula Rocha</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Canal</Label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs: History & Personal Data */}
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="history" className="flex-1 text-xs">Histórico</TabsTrigger>
            <TabsTrigger value="personal" className="flex-1 text-xs">Dados Pessoais</TabsTrigger>
          </TabsList>
          <TabsContent value="history">
            <div className="space-y-2 mt-2">
              {patientHistory.map((h) => (
                <div key={h.id} className="text-xs px-3 py-2 bg-muted rounded-md space-y-1">
                  <div className="flex justify-between">
                    <span className="font-mono font-medium">{h.id}</span>
                    <span className="text-muted-foreground">{h.date}</span>
                  </div>
                  <p>{h.subject}</p>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{h.dentist}</span>
                    <Badge variant="secondary" className="text-[10px] h-4">{h.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="personal">
            <div className="space-y-3 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Nome</Label><Input className="h-8 text-sm" defaultValue="Maria Oliveira" /></div>
                <div><Label className="text-xs">CPF</Label><Input className="h-8 text-sm" defaultValue="123.456.789-00" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Telefone</Label><Input className="h-8 text-sm" defaultValue="(11) 99999-0000" /></div>
                <div><Label className="text-xs">Tipo</Label><Input className="h-8 text-sm" defaultValue="Beneficiário" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Cidade</Label><Input className="h-8 text-sm" defaultValue="São Paulo" /></div>
                <div><Label className="text-xs">Estado</Label><Input className="h-8 text-sm" defaultValue="SP" /></div>
              </div>
              <Button size="sm" className="w-full">Salvar Alterações</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Right — Chat */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
          {messages.map((m, i) => (
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
            <Textarea placeholder="Digite sua resposta..." value={reply} onChange={(e) => setReply(e.target.value)} className="min-h-[44px] max-h-32 resize-none" rows={1} />
            <Button size="icon" className="shrink-0"><Send className="w-4 h-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
