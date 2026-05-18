import { ArrowDown, ArrowLeft, ArrowUp, ArrowUpDown, Save, Search } from "lucide-react";
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
import { cn } from "@/lib/classnames";
import { EDITABLE_CONTACT_TYPE_LABELS, editableContactTypeLabel, TIPO_CONTATO_LABELS } from "@/lib/linkaidMappings";
import { maskCNPJ, maskCPF, maskPhone } from "@/lib/masks";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const typeColors: Record<string, string> = {
  [TIPO_CONTATO_LABELS.SOLICITANTE]: "bg-warning/15 text-warning",
  [TIPO_CONTATO_LABELS.BENEFICIARIO]: "bg-warning/15 text-warning",
  [TIPO_CONTATO_LABELS.DOADOR]: "bg-primary/15 text-primary",
  [TIPO_CONTATO_LABELS.VOLUNTARIO]: "bg-success/15 text-success",
  [TIPO_CONTATO_LABELS.PARCEIRO]: "bg-pink-500/15 text-pink-600",
};

const ITEMS_PER_PAGE = 10;

const typeOptions = [...EDITABLE_CONTACT_TYPE_LABELS];

type SortKey = "name" | "type" | "location" | "ticketCount" | "registrationDate";
type SortDirection = "asc" | "desc";
type SortConfig = {
  key: SortKey;
  direction: SortDirection;
} | null;

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
  registrationDate?: string;
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

const formatRegistrationDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const registrationTimestamp = (value?: string) => {
  if (!value) return 0;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const sortValueForContact = (contact: DerivedContact, key: SortKey) => {
  switch (key) {
    case "name":
      return contact.name;
    case "type":
      return contact.type;
    case "location":
      return contact.location;
    case "ticketCount":
      return contact.ticketCount;
    case "registrationDate":
      return registrationTimestamp(contact.registrationDate);
    default:
      return "";
  }
};

const compareSortValues = (left: string | number, right: string | number) => {
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return String(left).localeCompare(String(right), "pt-BR", {
    numeric: true,
    sensitivity: "base",
  });
};

type SortableHeaderProps = {
  label: string;
  column: SortKey;
  className?: string;
  sortConfig: SortConfig;
  onSort: (column: SortKey) => void;
};

const SortableHeader = ({ label, column, className, sortConfig, onSort }: SortableHeaderProps) => {
  const isActive = sortConfig?.key === column;
  const Icon = isActive ? (sortConfig.direction === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  const ariaSort = isActive ? (sortConfig.direction === "asc" ? "ascending" : "descending") : "none";

  return (
    <TableHead className={cn("p-0", className)} aria-sort={ariaSort}>
      <button
        type="button"
        className={cn(
          "inline-flex h-10 w-full items-center gap-1.5 px-4 text-left text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className?.includes("text-right") && "justify-end text-right",
        )}
        onClick={() => onSort(column)}
      >
        <span className="truncate">{label}</span>
        <Icon className={cn("h-3.5 w-3.5 shrink-0", isActive && "text-foreground")} />
      </button>
    </TableHead>
  );
};

const contactTypeBadgeClass = (type: string) =>
  cn("flex w-28 justify-center text-center font-medium", typeColors[type] || "");

export default function Contacts() {
  const { tickets, contacts, loading, updateContact } = useTickets();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<DerivedContact | null>(null);
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
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
        registrationDate: c.registrationDate,
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
          registrationDate: "",
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

  const sorted = useMemo(() => {
    if (!sortConfig) return filtered;

    return [...filtered].sort((left, right) => {
      const result = compareSortValues(
        sortValueForContact(left, sortConfig.key),
        sortValueForContact(right, sortConfig.key),
      );
      return sortConfig.direction === "asc" ? result : -result;
    });
  }, [filtered, sortConfig]);

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginated = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSort = (column: SortKey) => {
    setSortConfig((current) => ({
      key: column,
      direction: current?.key === column && current.direction === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  };

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
      type: editableContactTypeLabel(selected.type),
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

    const normalizedType = editableContactTypeLabel(contactForm.type);
    const updatedContact: Contact = {
      id: selected.id,
      name: contactForm.name.trim(),
      type: normalizedType,
      cpf: contactForm.cpf.trim() || "-",
      phone: contactForm.phone.trim(),
      email: contactForm.email.trim(),
      location: [contactForm.city.trim(), contactForm.uf.trim().toUpperCase().slice(0, 2)].filter(Boolean).join(", "),
      observation: contactForm.observation.trim(),
      registrationDate: selected.registrationDate,
    };

    setSaving(true);
    try {
      const saved = await updateContact(updatedContact, selected);
      const nextSelected = {
        ...selected,
        ...(saved || updatedContact),
        ticketCount: selected.ticketCount,
        lastInteraction: selected.lastInteraction,
        registrationDate: saved?.registrationDate || updatedContact.registrationDate,
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
                  <Badge variant="secondary" className={contactTypeBadgeClass(contactForm.type)}>{contactForm.type}</Badge>
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

      <div className="border border-border rounded-lg overflow-auto shadow-sm">
        <Table className="min-w-[980px]">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <SortableHeader label="Nome" column="name" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Tipo" column="type" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Localização" column="location" sortConfig={sortConfig} onSort={handleSort} />
              <TableHead>CPF/CNPJ</TableHead>
              <SortableHeader label="Tickets" column="ticketCount" className="text-right" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Data de cadastro" column="registrationDate" sortConfig={sortConfig} onSort={handleSort} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((c) => (
              <TableRow key={contactKey(c)} className="cursor-pointer hover:bg-accent/60 transition-colors" onClick={() => setSelected(c)}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell><Badge variant="secondary" className={contactTypeBadgeClass(c.type)}>{c.type}</Badge></TableCell>
                <TableCell className="text-sm">{c.location}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.cpf}</TableCell>
                <TableCell className="text-right font-medium">{c.ticketCount}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatRegistrationDate(c.registrationDate)}</TableCell>
              </TableRow>
            ))}
            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {loading ? "Carregando contatos..." : "Nenhum contato encontrado"}
                </TableCell>
              </TableRow>
            )}
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
