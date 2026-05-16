import { useState } from "react";
import { X, Circle, Send, Plus, Hash, ArrowLeft, Users, MessageSquare } from "lucide-react";
import { cn } from "@/lib/classnames";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface TeamPanelProps {
  open: boolean;
  onClose: () => void;
}

const teammates = [
  { id: 1, name: "Ana Costa", role: "Gestora", online: true, avatar: "AC" },
  { id: 2, name: "Carlos Silva", role: "Atendente", online: true, avatar: "CS" },
  { id: 3, name: "Maria Santos", role: "Triagem", online: true, avatar: "MS" },
  { id: 4, name: "João Lima", role: "Atendente", online: false, avatar: "JL" },
  { id: 5, name: "Paula Rocha", role: "Coordenadora", online: false, avatar: "PR" },
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
  avatar: string;
}

const mockMessages: Record<string, Message[]> = {
  "Carlos Silva": [
    { from: "Carlos Silva", text: "Oi Ana, o ticket TKT-004 é urgente!", time: "14:20", avatar: "CS" },
    { from: "Você", text: "Entendi, vou priorizar agora.", time: "14:22", avatar: "VC" },
    { from: "Carlos Silva", text: "Ótimo! O paciente está aguardando retorno.", time: "14:23", avatar: "CS" },
  ],
  "Maria Santos": [
    { from: "Maria Santos", text: "Triagem do lote de hoje está pronta.", time: "10:15", avatar: "MS" },
    { from: "Você", text: "Perfeito, obrigada!", time: "10:18", avatar: "VC" },
  ],
  "Triagem": [
    { from: "Maria Santos", text: "Equipe, temos 5 novos tickets para triagem.", time: "09:00", avatar: "MS" },
    { from: "Carlos Silva", text: "Já estou assumindo 2.", time: "09:05", avatar: "CS" },
    { from: "Você", text: "Fico com os outros 3.", time: "09:08", avatar: "VC" },
    { from: "Maria Santos", text: "Perfeito! Vamos manter o ritmo.", time: "09:10", avatar: "MS" },
  ],
  "Gestão": [
    { from: "Ana Costa", text: "Reunião de alinhamento às 15h.", time: "08:30", avatar: "AC" },
    { from: "Paula Rocha", text: "Confirmado!", time: "08:35", avatar: "PR" },
  ],
};

type ChatTarget = { type: "person"; name: string } | { type: "group"; name: string } | null;
type SidebarTab = "channels" | "dms";

export function TeamPanel({ open, onClose }: TeamPanelProps) {
  const [chatTarget, setChatTarget] = useState<ChatTarget>(null);
  const [message, setMessage] = useState("");
  const [groups, setGroups] = useState(defaultGroups);
  const [newGroupName, setNewGroupName] = useState("");
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("channels");

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

  const onlineTeammates = teammates.filter((t) => t.online);
  const offlineTeammates = teammates.filter((t) => !t.online);

  // Chat view — modern Slack-style
  if (chatTarget) {
    return (
      <aside className="w-80 border-l border-border bg-card h-screen sticky top-0 flex flex-col animate-slide-in-right">
        {/* Chat Header */}
        <div className="flex items-center gap-2 px-4 h-14 border-b border-border bg-muted/30">
          <button onClick={() => setChatTarget(null)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {chatTarget.type === "group" ? (
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                <Hash className="w-4 h-4 text-primary" />
              </div>
            ) : (
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                  {chatTarget.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <Circle className={cn("w-2.5 h-2.5 absolute -bottom-0.5 -right-0.5 fill-current stroke-card stroke-2",
                  teammates.find((t) => t.name === chatTarget.name)?.online ? "text-success" : "text-muted-foreground/40"
                )} />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{chatTarget.type === "group" ? `# ${chatTarget.name}` : chatTarget.name}</p>
              {chatTarget.type === "person" && (
                <p className="text-[10px] text-muted-foreground">
                  {teammates.find((t) => t.name === chatTarget.name)?.online ? "Online" : "Offline"}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin">
          {currentMessages.map((m, i) => {
            const isMe = m.from === "Você";
            return (
              <div key={i} className={cn("flex gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
                {!isMe && (
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold shrink-0 mt-0.5">
                    {m.avatar}
                  </div>
                )}
                <div className={cn("max-w-[80%] space-y-0.5", isMe ? "items-end" : "items-start")}>
                  {!isMe && (
                    <p className="text-[10px] font-semibold text-primary px-1">{m.from}</p>
                  )}
                  <div className={cn(
                    "px-3 py-2 rounded-xl text-xs leading-relaxed",
                    isMe
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted rounded-tl-sm"
                  )}>
                    {m.text}
                  </div>
                  <p className={cn("text-[9px] px-1", isMe ? "text-right text-muted-foreground" : "text-muted-foreground")}>
                    {m.time}
                  </p>
                </div>
              </div>
            );
          })}
          {currentMessages.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">Nenhuma mensagem ainda</p>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border p-2 bg-muted/20">
          <div className="flex gap-1.5">
            <Input
              placeholder="Escreva uma mensagem..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="h-9 text-xs bg-background"
            />
            <Button size="icon" className="h-9 w-9 shrink-0" onClick={handleSend}>
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </aside>
    );
  }

  // List view — Slack-style with sidebar tabs
  return (
    <aside className="w-72 border-l border-border bg-card h-screen sticky top-0 flex flex-col animate-slide-in-right">
      <div className="flex items-center justify-between px-4 h-14 border-b border-border">
        <h3 className="font-display font-semibold text-sm">Equipe</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tab switcher */}
      <div className="flex border-b border-border">
        <button
          className={cn("flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors",
            sidebarTab === "channels" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setSidebarTab("channels")}
        >
          <Hash className="w-3.5 h-3.5" /> Canais
        </button>
        <button
          className={cn("flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors",
            sidebarTab === "dms" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setSidebarTab("dms")}
        >
          <MessageSquare className="w-3.5 h-3.5" /> Mensagens
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-4">
        {sidebarTab === "channels" ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                Grupos ({groups.length})
              </p>
              <button onClick={() => setShowNewGroup(!showNewGroup)} className="text-muted-foreground hover:text-foreground">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {showNewGroup && (
              <div className="flex gap-1 mb-1">
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

            <div className="space-y-0.5">
              {groups.map((g) => (
                <button
                  key={g.id}
                  className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors flex items-center gap-2"
                  onClick={() => setChatTarget({ type: "group", name: g.name })}
                >
                  <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{g.name}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Online */}
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">
                Online ({onlineTeammates.length})
              </p>
              <div className="space-y-0.5">
                {onlineTeammates.map((t) => (
                  <button
                    key={t.id}
                    className="flex items-center gap-2.5 w-full px-2 py-2 rounded-md hover:bg-accent transition-colors"
                    onClick={() => setChatTarget({ type: "person", name: t.name })}
                  >
                    <div className="relative shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary">
                        {t.avatar}
                      </div>
                      <Circle className="w-2.5 h-2.5 absolute -bottom-0.5 -right-0.5 fill-current text-success stroke-card stroke-2" />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-xs font-medium leading-none truncate">{t.name}</p>
                      <p className="text-[10px] text-muted-foreground">{t.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Offline */}
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">
                Offline ({offlineTeammates.length})
              </p>
              <div className="space-y-0.5">
                {offlineTeammates.map((t) => (
                  <button
                    key={t.id}
                    className="flex items-center gap-2.5 w-full px-2 py-2 rounded-md hover:bg-accent transition-colors opacity-60"
                    onClick={() => setChatTarget({ type: "person", name: t.name })}
                  >
                    <div className="relative shrink-0">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold">
                        {t.avatar}
                      </div>
                      <Circle className="w-2.5 h-2.5 absolute -bottom-0.5 -right-0.5 fill-current text-muted-foreground/40 stroke-card stroke-2" />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-xs font-medium leading-none truncate">{t.name}</p>
                      <p className="text-[10px] text-muted-foreground">{t.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
