import { useState, useRef, useEffect } from "react";
import { Bell, Moon, Sun, Users, Check } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  onToggleTeam: () => void;
}

const notifications = [
  { id: 1, text: "Novo ticket TKT-004 — Urgência odontológica", time: "5 min", read: false },
  { id: 2, text: "Pedro Almeida confirmou doação de R$ 2.000", time: "15 min", read: false },
  { id: 3, text: "Dra. Fernanda atualizou vagas disponíveis", time: "1h", read: true },
  { id: 4, text: "Ticket TKT-002 movido para Aguardando", time: "2h", read: true },
  { id: 5, text: "Novo contato: CREAS Regional adicionado", time: "3h", read: true },
];

export function AppHeader({ onToggleTeam }: AppHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-end px-6 sticky top-0 z-20">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onToggleTeam} className="relative">
          <Users className="w-4 h-4" />
        </Button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <Button variant="ghost" size="icon" className="relative" onClick={() => setNotifOpen(!notifOpen)}>
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
            )}
          </Button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <p className="text-sm font-semibold">Notificações</p>
                <span className="text-xs text-muted-foreground">{unreadCount} não lidas</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-border last:border-0 hover:bg-accent/50 transition-colors cursor-pointer ${
                      !n.read ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.read && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                      <div className={!n.read ? "" : "ml-4"}>
                        <p className="text-sm leading-snug">{n.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-border">
                <button className="text-xs text-primary hover:underline flex items-center gap-1">
                  <Check className="w-3 h-3" /> Marcar todas como lidas
                </button>
              </div>
            </div>
          )}
        </div>

        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </Button>
        <div className="flex items-center gap-2 ml-3 pl-3 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
            AC
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-none">Ana Costa</p>
            <p className="text-xs text-muted-foreground">Gestora</p>
          </div>
        </div>
      </div>
    </header>
  );
}
