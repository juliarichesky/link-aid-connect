import { Search, ArrowLeft, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { useEffect, useState, useMemo } from "react";
import { useTickets, type Contact } from "@/contexts/TicketsContext";
import { TIPO_CONTATO_LABELS } from "@/lib/linkaidMappings";
import { maskCNPJ, maskCPF, maskPhone } from "@/lib/masks";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const typeColors: Record<string, string> = {
  Solicitante: "bg-warning/15 text-warning",
  Beneficiário: "bg-warning/15 text-warning",
  Doador: "bg-primary/15 text-primary",
  Dentista: "bg-success/15 text-success",
  Parceiro: "bg-info/15 text-info",
};

const ITEMS_PER_PAGE = 10;

const typeOptions = [
  TIPO_CONTATO_LABELS.SOLICITANTE,
  TIPO_CONTATO_LABELS.BENEFICIARIO,
  TIPO_CONTATO_LABELS.DOADOR,
  TIPO_CONTATO_LABELS.VOLUNTARIO,
  TIPO_CONTATO_LABELS.PARCEIRO,
];

interface DerivedContact {
  id?: number;
  name: string;
  type: string;
  location: string;
  phone: string;
  email: string;
  cpf: string;
  ticketCount: number;
  lastInteraction: string;
  observation?: string;
  linkedTickets: { id: string; protocol?: string; subject: string; date: string; status: string }[];
}

const contactKey = (contact: Pick<DerivedContact, "id" | "cpf" | "name">) => {
  if (contact.id) return `id:${contact.id}`;
  const document = contact.cpf?.replace(/\D/g, "");
  if (document) return `doc:${document}`;
  return `name:${contact.name}`;
};

const splitLocation = (location: string) => {
  const [city = "", uf = ""] = location.split(",").map((part) => part.trim());
  return { city, uf };
};

const maskDocument = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits.length > 11 ? maskCNPJ(value) : maskCPF(value);
};

export default function Contacts() {
  const { tickets, contacts, updateContact } = useTickets();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<DerivedContact | null>(null);
  const [page, setPage] = useState(1);
  const [detailSearch, setDetailSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    type: TIPO_CONTATO_LABELS.SOLICITANTE,
    cpf: "",
    phone: "",
    email: "",
    city: "",
    uf: "",
    observation: "",
  });

  // Build contacts from all tickets + manually added contacts
  const allContacts = useMemo(() => {
    const map = new Map<string, DerivedContact>();

    contacts.forEach((c) => {
      const key = contactKey(c);
      map.set(key, {
        id: c.id,
        name: c.name,
        type: c.type,
        location: c.location,
        phone: c.phone,
        email: c.email,
        cpf: c.cpf,
        ticketCount: 0,
        lastInteraction: "-",
        observation: c.observation,
        linkedTickets: [],
      });
    });

    tickets.forEach((t) => {
      const key = contactKey({ id: t.idContato, cpf: t.cpf, name: t.sender });
      if (!map.has(key)) {
        map.set(key, {
          id: t.idContato,
          name: t.sender,
          type: t.type,
          location: t.location,
          phone: t.phone,
          email: t.email,
          cpf: t.cpf,
          ticketCount: 0,
          lastInteraction: t.openedAt,
          linkedTickets: [],
        });
      }
      const c = map.get(key)!;
      c.ticketCount++;
      c.lastInteraction = c.lastInteraction === "-" ? t.openedAt : c.lastInteraction;
      c.linkedTickets.push({ id: t.id, protocol: t.protocol, subject: t.subject, date: t.openedAt, status: t.status });
    });

    return Array.from(map.values());
  }, [tickets, contacts]);

  const filtered = allContacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.type.toLowerCase().includes(search.toLowerCase()) || c.cpf.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => {
    if (!selected) return;
    const current = allContacts.find((contact) => contactKey(contact) === contactKey(selected));
    if (current && current !== selected) {
      setSelected(current);
    }
  }, [allContacts, selected]);

  useEffect(() => {
    if (!selected) return;
    const { city, uf } = splitLocation(selected.location);
    setContactForm({
      name: selected.name,
      type: selected.type || TIPO_CONTATO_LABELS.SOLICITANTE,
      cpf: selected.cpf === "-" ? "" : maskDocument(selected.cpf),
      phone: selected.phone ? maskPhone(selected.phone) : "",
      email: selected.email,
      city,
      uf,
      observation: selected.observation || "",
    });
  }, [selected]);

  const handleFormChange = (field: keyof typeof contactForm, value: string) => {
    setContactForm((current) => ({ ...current, [field]: value }));
  };

  const handleSaveContact = async () => {
    if (!selected) return;
    if (!contactForm.name.trim()) {
      toast.error("Informe o nome do contato");
      return;
    }

    const updatedContact: Contact = {
      id: selected.id,
      name: contactForm.name.trim(),
      type: contactForm.type,
      cpf: contactForm.cpf.trim() || "-",
      phone: contactForm.phone.trim(),
      email: contactForm.email.trim(),
      location: [contactForm.city.trim(), contactForm.uf.trim().toUpperCase().slice(0, 2)].filter(Boolean).join(", "),
      observation: contactForm.observation.trim(),
    };

    setSaving(true);
    try {
      const saved = await updateContact(updatedContact, selected);
      const nextSelected = {
        ...selected,
        ...(saved || updatedContact),
        ticketCount: selected.ticketCount,
        lastInteraction: selected.lastInteraction,
        linkedTickets: selected.linkedTickets,
      };
      setSelected(nextSelected);
      toast.success(selected.id ? "Contato atualizado no frontend e no banco de dados" : "Contato atualizado no frontend");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar contato");
    } finally {
      setSaving(false);
    }
  };

  if (selected) {
    const filteredTickets = selected.linkedTickets.filter((t) =>
      t.subject.toLowerCase().includes(detailSearch.toLowerCase()) || (t.protocol || t.id).toLowerCase().includes(detailSearch.toLowerCase())
    );

    return (
      <div className="p-6 space-y-5 animate-fade-in">
        <Button variant="ghost" size="sm" onClick={() => { setSelected(null); setDetailSearch(""); }}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para Contatos
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 shadow-sm">
            <CardHeader><CardTitle className="text-base">Informações Pessoais</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {contactForm.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold">{contactForm.name || "Contato"}</p>
                  <Badge variant="secondary" className={typeColors[contactForm.type]}>{contactForm.type}</Badge>
                </div>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="contact-name">Nome</Label>
                  <Input id="contact-name" value={contactForm.name} onChange={(e) => handleFormChange("name", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-type">Tipo</Label>
                  <Select value={contactForm.type} onValueChange={(value) => handleFormChange("type", value)}>
                    <SelectTrigger id="contact-type"><SelectValue placeholder="Tipo do contato" /></SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-document">CPF/CNPJ</Label>
                  <Input id="contact-document" value={contactForm.cpf} onChange={(e) => handleFormChange("cpf", maskDocument(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-phone">Telefone</Label>
                  <Input id="contact-phone" value={contactForm.phone} onChange={(e) => handleFormChange("phone", maskPhone(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-email">E-mail</Label>
                  <Input id="contact-email" type="email" value={contactForm.email} onChange={(e) => handleFormChange("email", e.target.value)} />
                </div>
                <div className="grid grid-cols-[1fr_72px] gap-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-city">Cidade</Label>
                    <Input id="contact-city" value={contactForm.city} onChange={(e) => handleFormChange("city", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-uf">UF</Label>
                    <Input id="contact-uf" value={contactForm.uf} onChange={(e) => handleFormChange("uf", e.target.value.toUpperCase().slice(0, 2))} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-observation">Observações</Label>
                  <Input id="contact-observation" value={contactForm.observation} onChange={(e) => handleFormChange("observation", e.target.value)} />
                </div>
                <Button className="w-full" onClick={handleSaveContact} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar alterações"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-5">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Tickets Vinculados ({selected.linkedTickets.length})</CardTitle>
                  <div className="relative w-48">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                    <Input placeholder="Buscar..." value={detailSearch} onChange={(e) => setDetailSearch(e.target.value)} className="h-7 text-xs pl-7" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>ID</TableHead>
                      <TableHead>Assunto</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.map((t) => (
                      <TableRow key={t.id} className="hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => navigate(`/tickets/${t.id}`)}>
                        <TableCell className="font-mono text-xs">{t.protocol || t.id}</TableCell>
                        <TableCell className="text-sm">{t.subject}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{t.date}</TableCell>
                        <TableCell><Badge variant="secondary">{t.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                    {filteredTickets.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="text-center py-4 text-muted-foreground text-sm">Nenhum ticket</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold">Contatos</h1>
        <p className="text-sm text-muted-foreground">Gestão de relacionamentos</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar contatos..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
      </div>

      <div className="border border-border rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>CPF/CNPJ</TableHead>
              <TableHead className="text-right">Tickets</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((c, i) => (
              <TableRow key={i} className="cursor-pointer hover:bg-accent/60 transition-colors" onClick={() => setSelected(c)}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell><Badge variant="secondary" className={typeColors[c.type]}>{c.type}</Badge></TableCell>
                <TableCell className="text-sm">{c.location}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.cpf}</TableCell>
                <TableCell className="text-right font-medium">{c.ticketCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage(Math.max(1, page - 1)); }} /></PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}><PaginationLink href="#" isActive={page === i + 1} onClick={(e) => { e.preventDefault(); setPage(i + 1); }}>{i + 1}</PaginationLink></PaginationItem>
            ))}
            <PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage(Math.min(totalPages, page + 1)); }} /></PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
