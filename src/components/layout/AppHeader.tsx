import { Bell, Moon, Sun, Users } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  onToggleTeam: () => void;
}

export function AppHeader({ onToggleTeam }: AppHeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          Plataforma de Atendimento
        </h2>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onToggleTeam} className="relative">
          <Users className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
        </Button>
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
