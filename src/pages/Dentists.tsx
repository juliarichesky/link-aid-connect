import { Phone, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const dentists = [
  { name: "Dra. Fernanda Costa", specialty: "Ortodontia", status: "Ativo", totalSlots: 10, openSlots: 3 },
  { name: "Dr. Ricardo Souza", specialty: "Endodontia", status: "Ativo", totalSlots: 8, openSlots: 0 },
  { name: "Dra. Julia Mendes", specialty: "Odontopediatria", status: "Inativo", totalSlots: 6, openSlots: 6 },
  { name: "Dr. Marcos Lima", specialty: "Implantodontia", status: "Ativo", totalSlots: 12, openSlots: 5 },
  { name: "Dra. Ana Ribeiro", specialty: "Periodontia", status: "Ativo", totalSlots: 8, openSlots: 2 },
];

export default function Dentists() {
  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold">Dentistas</h1>
        <p className="text-sm text-muted-foreground">Gestão de voluntariado odontológico</p>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Nome</TableHead>
              <TableHead>Especialidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Vagas Totais</TableHead>
              <TableHead className="text-center">Vagas Abertas</TableHead>
              <TableHead className="w-24">Contato</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dentists.map((d) => (
              <TableRow key={d.name} className="hover:bg-accent/50 transition-colors">
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell className="text-sm">{d.specialty}</TableCell>
                <TableCell>
                  <Badge variant={d.status === "Ativo" ? "default" : "secondary"}>
                    {d.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">{d.totalSlots}</TableCell>
                <TableCell className="text-center font-medium">
                  <span className={d.openSlots === 0 ? "text-destructive" : "text-success"}>
                    {d.openSlots}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <button className="text-muted-foreground hover:text-foreground">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="text-muted-foreground hover:text-foreground">
                      <Mail className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
