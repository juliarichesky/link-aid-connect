import { X, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamPanelProps {
  open: boolean;
  onClose: () => void;
}

const teammates = [
  { name: "Ana Costa", role: "Gestora", online: true },
  { name: "Carlos Silva", role: "Atendente", online: true },
  { name: "Maria Santos", role: "Triagem", online: true },
  { name: "João Lima", role: "Atendente", online: false },
  { name: "Paula Rocha", role: "Coordenadora", online: false },
];

const groups = ["Triagem", "Gestão", "Atendimento"];

export function TeamPanel({ open, onClose }: TeamPanelProps) {
  if (!open) return null;

  return (
    <aside className="w-64 border-l border-border bg-card h-screen sticky top-0 flex flex-col animate-slide-in-right">
      <div className="flex items-center justify-between px-4 h-14 border-b border-border">
        <h3 className="font-display font-semibold text-sm">Equipe</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-6">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3 font-medium">
            Online ({teammates.filter((t) => t.online).length})
          </p>
          <div className="space-y-2">
            {teammates.map((t) => (
              <div key={t.name} className="flex items-center gap-2">
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
                <div>
                  <p className="text-xs font-medium leading-none">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3 font-medium">
            Grupos
          </p>
          <div className="space-y-1">
            {groups.map((g) => (
              <button
                key={g}
                className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
              >
                # {g}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
