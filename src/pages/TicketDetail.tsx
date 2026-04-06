import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Paperclip, Send, Bot, User, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const messages = [
  { from: "client", text: "Olá, gostaria de saber sobre o tratamento odontológico gratuito.", time: "14:30" },
  { from: "ai", text: "Classificação automática: Saúde — Prioridade: Alta. Resumo: Beneficiário buscando informações sobre tratamento gratuito.", time: "14:30" },
  { from: "agent", text: "Olá Maria! Obrigado por entrar em contato. Vou verificar as vagas disponíveis para você.", time: "14:35" },
  { from: "client", text: "Muito obrigada! Preciso para meu filho de 8 anos.", time: "14:37" },
];

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reply, setReply] = useState("");

  return (
    <div className="h-[calc(100vh-3.5rem)] flex animate-fade-in">
      {/* Left Panel */}
      <div className="w-80 border-r border-border p-5 space-y-5 overflow-y-auto scrollbar-thin bg-card">
        <Button variant="ghost" size="sm" onClick={() => navigate("/tickets")} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </Button>

        <div>
          <p className="text-xs text-muted-foreground mb-1">Ticket</p>
          <p className="font-mono font-semibold">{id}</p>
        </div>

        {/* Sender Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              Remetente
              <button className="text-muted-foreground hover:text-foreground">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </CardTitle>
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
              <div>
                <p className="text-muted-foreground">Tipo</p>
                <p className="font-medium">Beneficiário</p>
              </div>
              <div>
                <p className="text-muted-foreground">Local</p>
                <p className="font-medium">São Paulo, SP</p>
              </div>
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
              <p className="text-xs mt-1">
                Beneficiária busca tratamento odontológico gratuito para filho de 8 anos.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Prioridade</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-status-high text-status-high-foreground">
              Alta
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium">Aberto</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Responsável</span>
            <span className="font-medium">Carlos Silva</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Canal</span>
            <span className="font-medium">WhatsApp</span>
          </div>
        </div>

        {/* History */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Histórico de Contatos</p>
          <div className="space-y-2">
            {["TKT-098 — Ago 2024", "TKT-045 — Mar 2024"].map((h) => (
              <div key={h} className="text-xs px-2 py-1.5 bg-muted rounded-md">{h}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Chat */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.from === "client" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-md px-4 py-2.5 rounded-xl text-sm ${
                  m.from === "client"
                    ? "bg-muted text-foreground rounded-tl-none"
                    : m.from === "ai"
                    ? "bg-primary/10 text-primary border border-primary/20 rounded-tr-none"
                    : "bg-primary text-primary-foreground rounded-tr-none"
                }`}
              >
                {m.from === "ai" && (
                  <div className="flex items-center gap-1 mb-1">
                    <Bot className="w-3 h-3" />
                    <span className="text-[10px] font-medium uppercase">IA</span>
                  </div>
                )}
                {m.from === "agent" && (
                  <div className="flex items-center gap-1 mb-1">
                    <User className="w-3 h-3" />
                    <span className="text-[10px] font-medium uppercase opacity-70">Você</span>
                  </div>
                )}
                <p>{m.text}</p>
                <p className={`text-[10px] mt-1 ${m.from === "agent" ? "opacity-70" : "text-muted-foreground"}`}>
                  {m.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-border p-4 bg-card">
          <div className="flex items-end gap-2">
            <Button variant="ghost" size="icon" className="shrink-0">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Textarea
              placeholder="Digite sua resposta..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="min-h-[44px] max-h-32 resize-none"
              rows={1}
            />
            <Button size="icon" className="shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
