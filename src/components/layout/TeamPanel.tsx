import { useState } from "react";
import { X, Circle, Send, Plus, Hash, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TeamPanelProps {
  open: boolean;
  onClose: () => void;
}

const teammates = [
  { id: 1, name: "Ana Costa", role: "Gestora", online: true },
  { id: 2, name: "Carlos Silva", role: "Atendente", online: true },
  { id: 3, name: "Maria Santos", role: "Triagem", online: true },
  { id: 4, name: "João Lima", role: "Atendente", online: false },
  { id: 5, name: "Paula Rocha", role: "Coordenadora", online: false },
];

const defaultGroups = [
  { id: 1, name: "Triagem" },
  { id: 2, name: "Gestão" },
  { id: 3, name: "Atendimento" },
];

interface Message {
  from: string;
  text: string;
  time: string;
}

const mockMessages: Record<string, Message[]> = {
  "Carlos Silva": [
    { from: "Carlos Silva", text: "Oi Ana, o ticket TKT-004 é urgente!", time: "14:20" },
    { from: "Você", text: "Entendi, vou priorizar agora.", time: "14:22" },
  ],
  "Maria Santos": [
    { from: "Maria Santos", text: "Triagem do lote de hoje está pronta.", time: "10:15" },
    { from: "Você", text: "Perfeito, obrigada!", time: "10:18" },
  ],
  "Triagem": [
    { from: "Maria Santos", text: "Equipe, temos 5 novos tickets para triagem.", time: "09:00" },
    { from: "Carlos Silva", text: "Já estou assumindo 2.", time: "09:05" },
    { from: "Você", text: "Fico com os outros 3.", time: "09:08" },
  ],
};

type ChatTarget = { type: "person"; name: string } | { type: "group"; name: string } | null;

export function TeamPanel({ open, onClose }: TeamPanelProps) {
  const [chatTarget, setChatTarget] = useState<ChatTarget>(null);
  const [message, setMessage] = useState("");
  const [groups, setGroups] = useState(defaultGroups);
  const [newGroupName, setNewGroupName] = useState("");
  const [showNewGroup, setShowNewGroup] = useState(false);

  if (!open) return null;

  const currentMessages = chatTarget ? (mockMessages[chatTarget.name] || []) : [];

  const handleSend = () => {
    if (!message.trim()) return;
    setMessage("");
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    setGroups([...groups, { id: groups.length + 1, name: newGroupName.trim() }]);
    setNewGroupName("");
    setShowNewGroup(false);
  };

  // Chat view
  if (chatTarget) {
    return (
      <aside className="w-80 border-l border-border bg-card h-screen sticky top-0 flex flex-col animate-slide-in-right">
        <div className="flex items-center gap-2 px-4 h-14 border-b border-border">
          <button onClick={() => setChatTarget(null)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {chatTarget.type === "group" ? (
              <Hash className="w-4 h-4 text-muted-foreground shrink-0" />
            ) : (
              <div className="relative shrink-0">
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  {chatTarget.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <Circle className={cn("w-2.5 h-2.5 absolute -bottom-0.5 -right-0.5 fill-current",
                  teammates.find((t) => t.name === chatTarget.name)?.online ? "text-success" : "text-muted-foreground/40"
                )} />
              </div>
            )}
            <p className="text-sm font-semibold truncate">{chatTarget.name}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
          {currentMessages.map((m, i) => (
            <div key={i} className={`flex ${m.from === "Você" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] px-3 py-2 rounded-lg text-xs ${
                m.from === "Você" ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted rounded-tl-none"
              }`}>
                {chatTarget.type === "group" && m.from !== "Você" && (
                  <p className="font-semibold mb-0.5 text-[10px] text-primary">{m.from}</p>
                )}
                <p>{m.text}</p>
                <p className={`text-[9px] mt-1 ${m.from === "Você" ? "opacity-70" : "text-muted-foreground"}`}>{m.time}</p>
              </div>
            </div>
          ))}
          {currentMessages.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">Nenhuma mensagem ainda</p>
          )}
        </div>

        <div className="border-t border-border p-2">
          <div className="flex gap-1.5">
            <Input
              placeholder="Mensagem..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="h-8 text-xs"
            />
            <Button size="icon" className="h-8 w-8 shrink-0" onClick={handleSend}>
              <Send className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </aside>
    );
  }

  // List view
  return (
    <aside className="w-64 border-l border-border bg-card h-screen sticky top-0 flex flex-col animate-slide-in-right">
      <div className="flex items-center justify-between px-4 h-14 border-b border-border">
        <h3 className="font-display font-semibold text-sm">Equipe</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-6">
        {/* Online/Offline */}
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3 font-medium">
            Membros ({teammates.length})
          </p>
          <div className="space-y-1">
            {teammates
              .sort((a, b) => (b.online ? 1 : 0) - (a.online ? 1 : 0))
              .map((t) => (
              <button
                key={t.id}
                className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-accent transition-colors"
                onClick={() => setChatTarget({ type: "person", name: t.name })}
              >
                <div className="relative">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <Circle
                    className={cn(
                      "w-2.5 h-2.5 absolute -bottom-0.5 -right-0.5 fill-current",
                      t.online ? "text-success" : "text-muted-foreground/40"
                    )}
                  />
                </div>
                <div className="text-left">
                  <p className="text-xs font-medium leading-none">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.role} · {t.online ? "Online" : "Offline"}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Groups */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Grupos
            </p>
            <button
              onClick={() => setShowNewGroup(!showNewGroup)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {showNewGroup && (
            <div className="flex gap-1 mb-2">
              <Input
                placeholder="Nome do grupo"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateGroup()}
                className="h-7 text-xs"
              />
              <Button size="sm" className="h-7 px-2 text-xs" onClick={handleCreateGroup}>OK</Button>
            </div>
          )}

          <div className="space-y-1">
            {groups.map((g) => (
              <button
                key={g.id}
                className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors flex items-center gap-2"
                onClick={() => setChatTarget({ type: "group", name: g.name })}
              >
                <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                {g.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
