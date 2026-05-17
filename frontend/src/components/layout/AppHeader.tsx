import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bell, Moon, Sun, Users, Check, LogOut, User as UserIcon, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { linkAidApi, type ApiNotificacaoResponse } from "@/lib/linkaidApi";
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

const NOTIFICATIONS_STORAGE_PREFIX = "linkaid-read-notifications";

const getNotificationsStorageKey = (email?: string) =>
  `${NOTIFICATIONS_STORAGE_PREFIX}:${email || "anonymous"}`;

const readStoredNotificationIds = (storageKey: string): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
};

const formatNotificationTime = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(Math.floor(diffMs / 60000), 0);
  if (diffMinutes < 1) return "agora";
  if (diffMinutes < 60) return `${diffMinutes} min`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
};

export function AppHeader({ onToggleTeam }: AppHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, token, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<ApiNotificacaoResponse[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formName, setFormName] = useState(user?.name || "");
  const [formPhone, setFormPhone] = useState(user?.phone || "");
  const [formAvatar, setFormAvatar] = useState(user?.avatar || "");
  const notificationsStorageKey = useMemo(() => getNotificationsStorageKey(user?.email), [user?.email]);

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

  useEffect(() => {
    setReadNotificationIds(readStoredNotificationIds(notificationsStorageKey));
  }, [notificationsStorageKey]);

  const saveReadNotificationIds = useCallback(
    (ids: string[]) => {
      const uniqueIds = Array.from(new Set(ids)).slice(-200);
      setReadNotificationIds(uniqueIds);
      if (typeof window !== "undefined") {
        localStorage.setItem(notificationsStorageKey, JSON.stringify(uniqueIds));
      }
    },
    [notificationsStorageKey],
  );

  const fetchNotifications = useCallback(async () => {
    if (!token) {
      setNotifications([]);
      setNotificationsError(null);
      return;
    }

    setNotificationsLoading(true);
    try {
      const response = await linkAidApi.listarNotificacoes(token);
      setNotifications(response);
      setNotificationsError(null);
    } catch (error) {
      setNotificationsError(error instanceof Error ? error.message : "Nao foi possivel carregar notificacoes.");
    } finally {
      setNotificationsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchNotifications();
    if (!token) return undefined;

    const intervalId = window.setInterval(() => {
      void fetchNotifications();
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, [fetchNotifications, token]);

  useEffect(() => {
    if (notifOpen) {
      void fetchNotifications();
    }
  }, [fetchNotifications, notifOpen]);

  const readNotificationSet = useMemo(() => new Set(readNotificationIds), [readNotificationIds]);
  const unreadCount = notifications.filter((n) => !readNotificationSet.has(n.id)).length;

  const markNotificationAsRead = useCallback(
    (id: string) => {
      if (readNotificationSet.has(id)) return;
      saveReadNotificationIds([...readNotificationIds, id]);
    },
    [readNotificationIds, readNotificationSet, saveReadNotificationIds],
  );

  const handleNotificationClick = (notification: ApiNotificacaoResponse) => {
    markNotificationAsRead(notification.id);
    setNotifOpen(false);
    if (notification.idTicket) {
      navigate(`/tickets/${notification.idTicket}`);
    }
  };

  const handleMarkAllNotificationsRead = () => {
    saveReadNotificationIds([
      ...readNotificationIds,
      ...notifications.map((notification) => notification.id),
    ]);
  };

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
                <span className="text-xs text-muted-foreground">
                  {notificationsLoading ? "Atualizando..." : `${unreadCount} não lidas`}
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notificationsError && (
                  <div className="px-4 py-4 text-sm text-muted-foreground">
                    <p>{notificationsError}</p>
                    <button
                      type="button"
                      className="mt-2 text-xs text-primary hover:underline"
                      onClick={() => void fetchNotifications()}
                    >
                      Tentar novamente
                    </button>
                  </div>
                )}
                {!notificationsError && notificationsLoading && notifications.length === 0 && (
                  <div className="px-4 py-4 text-sm text-muted-foreground">Carregando notificações...</div>
                )}
                {!notificationsError && !notificationsLoading && notifications.length === 0 && (
                  <div className="px-4 py-4 text-sm text-muted-foreground">Nenhuma notificação agora.</div>
                )}
                {!notificationsError && notifications.map((n) => {
                  const read = readNotificationSet.has(n.id);
                  return (
                    <button
                      key={n.id}
                      type="button"
                      className={`w-full text-left px-4 py-3 border-b border-border last:border-0 hover:bg-accent/50 transition-colors ${
                        !read ? "bg-primary/5" : ""
                      }`}
                      onClick={() => handleNotificationClick(n)}
                    >
                      <div className="flex items-start gap-2">
                        {!read && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                        <div className={!read ? "" : "ml-4"}>
                          <p className="text-sm font-medium leading-snug">{n.titulo}</p>
                          <p className="text-sm leading-snug text-muted-foreground">{n.descricao}</p>
                          <p className="text-xs text-muted-foreground mt-1">{formatNotificationTime(n.dataEvento)}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="px-4 py-2 border-t border-border">
                <button
                  type="button"
                  className="text-xs text-primary hover:underline flex items-center gap-1 disabled:pointer-events-none disabled:opacity-50"
                  onClick={handleMarkAllNotificationsRead}
                  disabled={notifications.length === 0 || unreadCount === 0}
                >
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
