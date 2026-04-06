import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";

const contacts = [
  { name: "Maria Oliveira", type: "Beneficiário", location: "São Paulo, SP", lastInteraction: "Hoje", tickets: 3 },
  { name: "Instituto Sorria", type: "Parceria", location: "Rio de Janeiro, RJ", lastInteraction: "Ontem", tickets: 5 },
  { name: "Pedro Almeida", type: "Doador", location: "Belo Horizonte, MG", lastInteraction: "Há 2 dias", tickets: 2 },
  { name: "Dra. Fernanda Costa", type: "Voluntário", location: "Curitiba, PR", lastInteraction: "Há 1 semana", tickets: 8 },
  { name: "Fundação ABC", type: "Parceria", location: "Salvador, BA", lastInteraction: "Há 3 dias", tickets: 4 },
  { name: "Lucia Ferreira", type: "Beneficiário", location: "Fortaleza, CE", lastInteraction: "Hoje", tickets: 1 },
];

const typeColors: Record<string, string> = {
  Beneficiário: "bg-warning/15 text-warning",
  Doador: "bg-primary/15 text-primary",
  Voluntário: "bg-success/15 text-success",
  Parceria: "bg-info/15 text-info",
};

export default function Contacts() {
  const [search, setSearch] = useState("");

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold">Contatos</h1>
        <p className="text-sm text-muted-foreground">Gestão de relacionamentos (CRM)</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar contatos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Última Interação</TableHead>
              <TableHead className="text-right">Tickets</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.name} className="cursor-pointer hover:bg-accent/50 transition-colors">
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={typeColors[c.type]}>{c.type}</Badge>
                </TableCell>
                <TableCell className="text-sm">{c.location}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.lastInteraction}</TableCell>
                <TableCell className="text-right font-medium">{c.tickets}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
