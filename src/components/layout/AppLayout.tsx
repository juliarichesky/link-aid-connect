import { useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { TeamPanel } from "./TeamPanel";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [teamOpen, setTeamOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader onToggleTeam={() => setTeamOpen(!teamOpen)} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <TeamPanel open={teamOpen} onClose={() => setTeamOpen(false)} />
    </div>
  );
}
