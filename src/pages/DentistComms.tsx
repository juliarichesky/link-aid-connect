import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Phone, Mail, MessageCircle, MapPin, Send, ArrowLeft, Paperclip, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useTickets, type Dentist } from "@/contexts/TicketsContext";

interface ChatMessage {
  from: string;
  text: string;
  time: string;
}

export default function DentistComms() {
  const { dentists } = useTickets();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDentist, setSelectedDentist] = useState<Dentist | null>(null);
  const [messages, setMessages] = useState<Record<number, ChatMessage[]>>({});
  const [reply, setReply] = useState("");

  // Auto-select dentist from URL param
  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      const d = dentists.find((dt) => dt.id === Number(id));
      if (d) setSelectedDentist(d);
    }
  }, [searchParams, dentists]);

  const filtered = dentists.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSendMessage = () => {
    if (!reply.trim() || !selectedDentist) return;
    const now = new Date();
    const time = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const newMsg: ChatMessage = { from: "agent", text: reply, time };
    setMessages((prev) => ({
      ...prev,
      [selectedDentist.id]: [...(prev[selectedDentist.id] || []), newMsg],
    }));
    setReply("");
    toast.success("Mensagem enviada");
  };

  const formatPhone = (phone: string) => phone.replace(/\D/g, "");

  if (selectedDentist) {
    const dentistMessages = messages[selectedDentist.id] || [];
    return (
      <div className="h-[calc(100vh-3.5rem)] flex animate-fade-in">
        <div className="w-80 border-r border-border p-5 space-y-4 overflow-y-auto bg-card">
          <Button variant="ghost" size="sm" onClick={() => setSelectedDentist(null)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
          </Button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {selectedDentist.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <p className="font-semibold text-sm">{selectedDentist.name}</p>
              <p className="text-xs text-muted-foreground">{selectedDentist.specialty}</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <Badge variant={selectedDentist.status === "Ativo" ? "default" : "secondary"}>{selectedDentist.status}</Badge>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-3 h-3" /> <span className="text-xs">{selectedDentist.location}{selectedDentist.uf ? `, ${selectedDentist.uf}` : ""}</span>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <a href={`mailto:${selectedDentist.email}`}>
                    <Button variant="outline" size="icon" className="h-8 w-8"><Mail className="w-4 h-4 text-blue-500" /></Button>
                  </a>
                </TooltipTrigger>
                <TooltipContent>{selectedDentist.email}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a href={`tel:${selectedDentist.phone}`}>
                    <Button variant="outline" size="icon" className="h-8 w-8"><Phone className="w-4 h-4 text-muted-foreground" /></Button>
                  </a>
                </TooltipTrigger>
                <TooltipContent>{selectedDentist.phone}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a href={`https://wa.me/55${formatPhone(selectedDentist.phone)}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon" className="h-8 w-8"><MessageCircle className="w-4 h-4 text-green-500" /></Button>
                  </a>
                </TooltipTrigger>
                <TooltipContent>WhatsApp Direto</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
            {dentistMessages.length === 0 && (
              <div className="text-center text-muted-foreground py-16">
                <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Inicie uma conversa com {selectedDentist.name}</p>
              </div>
            )}
            {dentistMessages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "dentist" ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-md px-4 py-2.5 rounded-xl text-sm ${
                  m.from === "dentist"
                    ? "bg-muted text-foreground rounded-tl-none"
                    : "bg-primary text-primary-foreground rounded-tr-none"
                }`}>
                  <div className="flex items-center gap-1 mb-1">
                    <User className="w-3 h-3" />
                    <span className="text-[10px] font-medium uppercase opacity-70">
                      {m.from === "agent" ? "Você" : selectedDentist.name.split(" ")[0]}
                    </span>
                  </div>
                  <p>{m.text}</p>
                  <p className={`text-[10px] mt-1 ${m.from === "agent" ? "opacity-70" : "text-muted-foreground"}`}>{m.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border p-4 bg-card">
            <div className="flex items-end gap-2">
              <Button variant="ghost" size="icon" className="shrink-0"><Paperclip className="w-4 h-4" /></Button>
              <Textarea placeholder="Digite sua mensagem..." value={reply} onChange={(e) => setReply(e.target.value)} className="min-h-[44px] max-h-32 resize-none" rows={1} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} />
              <Button size="icon" className="shrink-0" onClick={handleSendMessage}><Send className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold">Comunicação com Dentistas</h1>
        <p className="text-sm text-muted-foreground">Chat direto e ações rápidas de contato</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou especialidade..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Filtrar status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Ativo">Ativo</SelectItem>
            <SelectItem value="Inativo">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border border-border rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Nome</TableHead>
              <TableHead>Especialidade</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((d) => (
              <TableRow key={d.id} className="hover:bg-accent/60 transition-colors cursor-pointer" onClick={() => setSelectedDentist(d)}>
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell className="text-sm">{d.specialty}</TableCell>
                <TableCell className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {d.location}{d.uf ? `, ${d.uf}` : ""}</TableCell>
                <TableCell><Badge variant={d.status === "Ativo" ? "default" : "secondary"}>{d.status}</Badge></TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setSelectedDentist(d)}>
                          <MessageCircle className="w-4 h-4 text-green-500" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Chat Direto</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a href={`mailto:${d.email}`}>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Mail className="w-4 h-4 text-blue-500" />
                          </Button>
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>E-mail</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a href={`tel:${d.phone}`}>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>Ligar</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum dentista encontrado</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
