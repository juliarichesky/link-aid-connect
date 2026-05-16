import { useState, useRef, useEffect } from "react";
import { Bell, Moon, Sun, Users, Check, LogOut, User as UserIcon, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formName, setFormName] = useState(user?.name || "");
  const [formPhone, setFormPhone] = useState(user?.phone || "");
  const [formAvatar, setFormAvatar] = useState(user?.avatar || "");

  useEffect(() => {
    if (profileOpen) {
      setFormName(user?.name || "");
      setFormPhone(user?.phone || "");
      setFormAvatar(user?.avatar || "");
    }
  }, [profileOpen, user]);

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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFormAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    updateUser({
      name: formName.trim() || user?.name || "",
      phone: formPhone.trim(),
      avatar: formAvatar,
      initials: (formName.trim() || user?.name || "")
        .split(" ")
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase(),
    });
    setProfileOpen(false);
  };

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-end px-4 sm:px-6 sticky top-0 z-20">
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
            <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
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

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 ml-2 sm:ml-3 pl-2 sm:pl-3 border-l border-border hover:opacity-80 transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md py-1">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold overflow-hidden shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.initials || "?"
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.roleLabel}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{user?.name}</span>
                <span className="text-xs text-muted-foreground font-normal">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setProfileOpen(true)}>
              <UserIcon className="w-4 h-4 mr-2" /> Editar perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4 mr-2" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Profile dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
            <DialogDescription>Atualize sua foto e informações básicas.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-lg font-semibold overflow-hidden shrink-0">
                {formAvatar ? (
                  <img src={formAvatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.initials || "?"
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Camera className="w-4 h-4 mr-2" /> Alterar foto
                </Button>
                {formAvatar && (
                  <button
                    type="button"
                    onClick={() => setFormAvatar("")}
                    className="text-xs text-muted-foreground hover:text-destructive text-left"
                  >
                    Remover foto
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-name">Nome</Label>
              <Input id="profile-name" value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-email">E-mail</Label>
              <Input id="profile-email" value={user?.email || ""} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-phone">Telefone</Label>
              <Input
                id="profile-phone"
                placeholder="(00) 00000-0000"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setProfileOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveProfile}>Salvar alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
