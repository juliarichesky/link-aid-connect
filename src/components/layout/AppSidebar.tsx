import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Inbox,
  Archive,
  Users,
  BarChart3,
  Settings,
  MessageCircle,
  Instagram,
  Mail,
  MoreHorizontal,
  Stethoscope,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const mainMenu = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Tickets", url: "/tickets", icon: Inbox },
  { title: "Arquivados", url: "/archived", icon: Archive },
  { title: "Histórico", url: "/history", icon: History },
  { title: "Contatos", url: "/contacts", icon: Users },
  { title: "Relatórios", url: "/reports", icon: BarChart3 },
  { title: "Configurações", url: "/settings", icon: Settings },
];

const channels = [
  { title: "WhatsApp", icon: MessageCircle, count: 12, filter: "WhatsApp" },
  { title: "Instagram", icon: Instagram, count: 5, filter: "Instagram" },
  { title: "E-mail", icon: Mail, count: 8, filter: "E-mail" },
  { title: "Outros", icon: MoreHorizontal, count: 2, filter: "Outro" },
];

const extra = [
  { title: "Dentistas", url: "/dentists", icon: Stethoscope },
  { title: "Financeiro", url: "/financial", icon: DollarSign },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 h-screen sticky top-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-16 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-display font-bold text-sm shrink-0">
          LA
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-lg text-sidebar-primary-foreground">
            LinkAid
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 space-y-6">
        {/* Main */}
        <div className="space-y-1 px-2">
          {!collapsed && (
            <p className="text-[11px] uppercase tracking-wider text-sidebar-muted px-2 mb-2 font-medium">
              Menu Principal
            </p>
          )}
          {mainMenu.map((item) => (
            <Link
              key={item.url}
              to={item.url}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive(item.url)
                  ? "bg-sidebar-accent text-sidebar-primary-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                item.url === "/archived" && "opacity-60"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          ))}
        </div>

        {/* Channels */}
        <div className="space-y-1 px-2">
          {!collapsed && (
            <p className="text-[11px] uppercase tracking-wider text-sidebar-muted px-2 mb-2 font-medium">
              Canais
            </p>
          )}
          {channels.map((ch) => (
            <button
              key={ch.title}
              onClick={() => navigate(`/tickets?channel=${encodeURIComponent(ch.filter)}`)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm w-full text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors",
                location.pathname === "/tickets" && new URLSearchParams(location.search).get("channel") === ch.filter
                  ? "bg-sidebar-accent text-sidebar-primary-foreground font-medium"
                  : ""
              )}
            >
              <ch.icon className="w-4 h-4 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{ch.title}</span>
                  <span className="text-[11px] bg-sidebar-primary/20 text-sidebar-primary px-1.5 py-0.5 rounded-full font-medium">
                    {ch.count}
                  </span>
                </>
              )}
            </button>
          ))}
        </div>

        {/* Extra */}
        <div className="space-y-1 px-2">
          {!collapsed && (
            <p className="text-[11px] uppercase tracking-wider text-sidebar-muted px-2 mb-2 font-medium">
              Seções
            </p>
          )}
          {extra.map((item) => (
            <Link
              key={item.url}
              to={item.url}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive(item.url)
                  ? "bg-sidebar-accent text-sidebar-primary-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          ))}
        </div>
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-12 border-t border-sidebar-border text-sidebar-muted hover:text-sidebar-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
