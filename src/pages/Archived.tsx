import { RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const archived = [
  { id: "TKT-089", sender: "Carlos Mendes", subject: "Consulta finalizada", date: "01/03/2025", status: "Resolvido" },
  { id: "TKT-076", sender: "ONG Vida Nova", subject: "Doação concluída", date: "25/02/2025", status: "Resolvido" },
  { id: "TKT-062", sender: "Ana Luiza", subject: "Feedback positivo", date: "18/02/2025", status: "Fechado" },
];

export default function Archived() {
  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-muted-foreground">Arquivados</h1>
        <p className="text-sm text-muted-foreground">Tickets finalizados</p>
      </div>

      <div className="border border-border rounded-lg overflow-hidden opacity-80">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>ID</TableHead>
              <TableHead>Remetente</TableHead>
              <TableHead>Assunto</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {archived.map((t) => (
              <TableRow key={t.id} className="hover:bg-accent/50 transition-colors">
                <TableCell className="font-mono text-xs">{t.id}</TableCell>
                <TableCell className="font-medium text-sm">{t.sender}</TableCell>
                <TableCell className="text-sm">{t.subject}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{t.date}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{t.status}</Badge>
                </TableCell>
                <TableCell>
                  <button className="text-muted-foreground hover:text-foreground" title="Restaurar">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
