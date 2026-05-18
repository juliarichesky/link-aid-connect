import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Inbox,
  Users,
  BarChart3,
  Settings,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  History,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/classnames";
import { useState } from "react";
import { useAuth, Role } from "@/contexts/AuthContext";

type MenuItem = { title: string; url: string; icon: LucideIcon; roles?: Role[] };

const ToothIcon = (({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M8.5 3.5c1.2 0 2.1.5 3.5.5s2.3-.5 3.5-.5c2.5 0 4 2.1 4 5.1 0 2.8-1.1 5-2.1 7.2-.8 1.8-1.4 4.2-3.1 4.2-1.2 0-1.3-1.9-1.7-3.4-.2-.8-.4-1.6-.6-1.6s-.4.8-.6 1.6c-.4 1.5-.5 3.4-1.7 3.4-1.7 0-2.3-2.4-3.1-4.2-1-2.2-2.1-4.4-2.1-7.2 0-3 1.5-5.1 4-5.1Z" />
  </svg>
)) as LucideIcon;

const mainMenu: MenuItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, roles: ["admin"] },
  { title: "Tickets", url: "/tickets", icon: Inbox },
  { title: "Histórico", url: "/history", icon: History },
  { title: "Contatos", url: "/contacts", icon: Users },
  { title: "Relatórios", url: "/reports", icon: BarChart3, roles: ["admin"] },
  { title: "Configurações", url: "/settings", icon: Settings, roles: ["admin"] },
];

const extra: MenuItem[] = [
  { title: "Dentistas", url: "/dentists", icon: ToothIcon },
  { title: "Financeiro", url: "/financial", icon: DollarSign, roles: ["admin"] },
];

export function AppSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  const isActive = (path: string) =>
    location.pathname === path || (path !== "/" && location.pathname.startsWith(`${path}/`));
  const canSee = (item: MenuItem) =>
    !item.roles || (user && item.roles.includes(user.role));

  const visibleMain = mainMenu.filter(canSee);
  const visibleExtra = extra.filter(canSee);

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
          {visibleMain.map((item) => (
            <Link
              key={item.url}
              to={item.url}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive(item.url)
                  ? "bg-sidebar-accent text-sidebar-primary-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          ))}
        </div>

        {/* Extra */}
        {visibleExtra.length > 0 && (
          <div className="space-y-1 px-2">
            {!collapsed && (
              <p className="text-[11px] uppercase tracking-wider text-sidebar-muted px-2 mb-2 font-medium">
                Seções
              </p>
            )}
            {visibleExtra.map((item) => (
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
        )}
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
