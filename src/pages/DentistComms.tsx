import { useState } from "react";
import { Search, Phone, Mail, MessageCircle, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const dentists = [
  { id: 1, name: "Dra. Fernanda Costa", specialty: "Ortodontia", status: "Ativo", phone: "+5541977776666", email: "fernanda@dentist.com", location: "Curitiba, PR" },
  { id: 2, name: "Dr. Ricardo Souza", specialty: "Endodontia", status: "Ativo", phone: "+5511966665555", email: "ricardo@dentist.com", location: "São Paulo, SP" },
  { id: 3, name: "Dra. Julia Mendes", specialty: "Odontopediatria", status: "Inativo", phone: "+5521955554444", email: "julia@dentist.com", location: "Rio de Janeiro, RJ" },
  { id: 4, name: "Dr. Marcos Lima", specialty: "Implantodontia", status: "Ativo", phone: "+5531944443333", email: "marcos@dentist.com", location: "Belo Horizonte, MG" },
  { id: 5, name: "Dra. Ana Ribeiro", specialty: "Periodontia", status: "Ativo", phone: "+5585933332222", email: "ana.r@dentist.com", location: "Fortaleza, CE" },
  { id: 6, name: "Dr. Paulo Nascimento", specialty: "Cirurgia", status: "Ativo", phone: "+5551922221111", email: "paulo.n@dentist.com", location: "Porto Alegre, RS" },
  { id: 7, name: "Dra. Carla Dias", specialty: "Prótese", status: "Ativo", phone: "+5562911110000", email: "carla.d@dentist.com", location: "Goiânia, GO" },
  { id: 8, name: "Dr. Fernando Tavares", specialty: "Ortodontia", status: "Inativo", phone: "+5571900009999", email: "fernando.t@dentist.com", location: "Salvador, BA" },
];

export default function DentistComms() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = dentists.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold">Comunicação com Dentistas</h1>
        <p className="text-sm text-muted-foreground">Ações rápidas de contato com voluntários</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar dentistas..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Ativo">Ativo</SelectItem>
            <SelectItem value="Inativo">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Nome</TableHead>
              <TableHead>Especialidade</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((d) => (
              <TableRow key={d.id} className="hover:bg-accent/50 transition-colors">
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell className="text-sm">{d.specialty}</TableCell>
                <TableCell className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {d.location}</TableCell>
                <TableCell><Badge variant={d.status === "Ativo" ? "default" : "secondary"}>{d.status}</Badge></TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a href={`https://wa.me/${d.phone}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <MessageCircle className="w-4 h-4 text-success" />
                          </Button>
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>WhatsApp</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a href={`mailto:${d.email}`}>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Mail className="w-4 h-4 text-primary" />
                          </Button>
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>E-mail</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a href={`tel:${d.phone}`}>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>Ligar</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum dentista encontrado</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
