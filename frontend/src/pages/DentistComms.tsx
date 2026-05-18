import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ArrowUpDown,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Save,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTickets, type Dentist } from "@/contexts/TicketsContext";
import { cn } from "@/lib/classnames";
import { DENTISTA_STATUS_LABELS } from "@/lib/linkaidMappings";
import { maskPhone } from "@/lib/masks";
import { toast } from "sonner";

type SortKey = "name" | "specialty" | "location" | "status" | "openSlots" | "registrationDate";
type SortDirection = "asc" | "desc";
type SortConfig = {
  key: SortKey;
  direction: SortDirection;
} | null;

const dentistInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

const formatPhone = (phone: string) => phone.replace(/\D/g, "");

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

const locationLabel = (dentist: Dentist) =>
  [dentist.location, dentist.uf].filter(Boolean).join(", ");

const sortValueForDentist = (dentist: Dentist, key: SortKey) => {
  switch (key) {
    case "name":
      return dentist.name;
    case "specialty":
      return dentist.specialty;
    case "location":
      return locationLabel(dentist);
    case "status":
      return dentist.status;
    case "openSlots":
      return dentist.openSlots;
    case "registrationDate":
      return registrationTimestamp(dentist.registrationDate);
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
        className="inline-flex h-10 w-full items-center gap-1.5 px-4 text-left text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={() => onSort(column)}
      >
        <span className="truncate">{label}</span>
        <Icon className={cn("h-3.5 w-3.5 shrink-0", isActive && "text-foreground")} />
      </button>
    </TableHead>
  );
};

const formFromDentist = (dentist?: Dentist) => ({
  name: dentist?.name || "",
  specialty: dentist?.specialty || "",
  status: dentist?.status || DENTISTA_STATUS_LABELS.A,
  phone: dentist?.phone ? maskPhone(dentist.phone) : "",
  email: dentist?.email || "",
  crm: dentist?.crm || "",
  city: dentist?.location || "",
  uf: dentist?.uf || "",
});

export default function DentistComms() {
  const { dentists, loading, updateDentist } = useTickets();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [selectedDentist, setSelectedDentist] = useState<Dentist | null>(null);
  const [dentistForm, setDentistForm] = useState(() => formFromDentist());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) return;

    const dentist = dentists.find((item) => item.id === Number(id));
    if (dentist) setSelectedDentist(dentist);
  }, [searchParams, dentists]);

  useEffect(() => {
    if (!selectedDentist) return;
    const current = dentists.find((dentist) => dentist.id === selectedDentist.id);
    if (current && current !== selectedDentist) {
      setSelectedDentist(current);
    }
  }, [dentists, selectedDentist]);

  useEffect(() => {
    setDentistForm(formFromDentist(selectedDentist || undefined));
  }, [selectedDentist]);

  const filtered = dentists.filter((dentist) => {
    const normalizedSearch = search.toLowerCase();
    const matchSearch =
      dentist.name.toLowerCase().includes(normalizedSearch) ||
      dentist.specialty.toLowerCase().includes(normalizedSearch) ||
      dentist.crm.toLowerCase().includes(normalizedSearch);
    const matchStatus = statusFilter === "all" || dentist.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const sorted = useMemo(() => {
    if (!sortConfig) return filtered;

    return [...filtered].sort((left, right) => {
      const result = compareSortValues(
        sortValueForDentist(left, sortConfig.key),
        sortValueForDentist(right, sortConfig.key),
      );
      return sortConfig.direction === "asc" ? result : -result;
    });
  }, [filtered, sortConfig]);

  const handleSort = (column: SortKey) => {
    setSortConfig((current) => ({
      key: column,
      direction: current?.key === column && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleFormChange = (field: keyof typeof dentistForm, value: string) => {
    setDentistForm((current) => ({ ...current, [field]: value }));
  };

  const handleSaveDentist = async () => {
    if (!selectedDentist) return;
    if (!dentistForm.name.trim() || !dentistForm.specialty.trim() || !dentistForm.crm.trim()) {
      toast.error("Preencha nome, especialidade e CRO do dentista");
      return;
    }

    setSaving(true);
    try {
      await updateDentist(selectedDentist.id, {
        name: dentistForm.name.trim(),
        specialty: dentistForm.specialty.trim(),
        status: dentistForm.status,
        phone: dentistForm.phone.trim(),
        email: dentistForm.email.trim(),
        crm: dentistForm.crm.trim(),
        location: dentistForm.city.trim(),
        uf: dentistForm.uf.trim().toUpperCase().slice(0, 2),
      });
      toast.success("Dentista atualizado com sucesso");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar dentista");
    } finally {
      setSaving(false);
    }
  };

  if (selectedDentist) {
    return (
      <div className="p-6 space-y-5 animate-fade-in">
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={() => setSelectedDentist(null)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para Dentistas
          </Button>
          <Button size="sm" onClick={handleSaveDentist} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 shadow-sm">
            <CardHeader><CardTitle className="text-base">Resumo</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {dentistInitials(dentistForm.name || selectedDentist.name)}
                </div>
                <div>
                  <p className="font-semibold">{dentistForm.name || selectedDentist.name}</p>
                  <p className="text-xs text-muted-foreground">{dentistForm.specialty || selectedDentist.specialty}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <Badge variant={dentistForm.status === "Ativo" ? "default" : "secondary"}>
                  {dentistForm.status}
                </Badge>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span className="text-xs">
                    {[dentistForm.city, dentistForm.uf].filter(Boolean).join(", ") || "Localização não informada"}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Data de cadastro</p>
                  <p className="font-medium">{formatRegistrationDate(selectedDentist.registrationDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vagas abertas</p>
                  <p className={selectedDentist.openSlots === 0 ? "font-medium text-destructive" : "font-medium text-success"}>
                    {selectedDentist.openSlots}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a href={`mailto:${dentistForm.email || selectedDentist.email}`}>
                      <Button variant="outline" size="icon" className="h-8 w-8"><Mail className="w-4 h-4 text-blue-500" /></Button>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>{dentistForm.email || selectedDentist.email || "E-mail não informado"}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a href={`tel:${dentistForm.phone || selectedDentist.phone}`}>
                      <Button variant="outline" size="icon" className="h-8 w-8"><Phone className="w-4 h-4 text-muted-foreground" /></Button>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>{dentistForm.phone || selectedDentist.phone || "Telefone não informado"}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a href={`https://wa.me/55${formatPhone(dentistForm.phone || selectedDentist.phone)}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="icon" className="h-8 w-8"><MessageCircle className="w-4 h-4 text-green-500" /></Button>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>WhatsApp direto</TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader><CardTitle className="text-base">Dados Cadastrais</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Nome Completo *</Label><Input value={dentistForm.name} onChange={(e) => handleFormChange("name", e.target.value)} /></div>
                <div><Label>Especialidade *</Label><Input value={dentistForm.specialty} onChange={(e) => handleFormChange("specialty", e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>CRO *</Label><Input value={dentistForm.crm} onChange={(e) => handleFormChange("crm", e.target.value)} /></div>
                <div>
                  <Label>Status</Label>
                  <Select value={dentistForm.status} onValueChange={(value) => handleFormChange("status", value)}>
                    <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={DENTISTA_STATUS_LABELS.A}>Ativo</SelectItem>
                      <SelectItem value={DENTISTA_STATUS_LABELS.I}>Inativo</SelectItem>
                      <SelectItem value={DENTISTA_STATUS_LABELS.F}>Férias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Telefone</Label><Input value={dentistForm.phone} onChange={(e) => handleFormChange("phone", maskPhone(e.target.value))} /></div>
                <div><Label>E-mail</Label><Input type="email" value={dentistForm.email} onChange={(e) => handleFormChange("email", e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_96px] gap-4">
                <div><Label>Cidade</Label><Input value={dentistForm.city} onChange={(e) => handleFormChange("city", e.target.value)} /></div>
                <div><Label>UF</Label><Input value={dentistForm.uf} onChange={(e) => handleFormChange("uf", e.target.value.toUpperCase().slice(0, 2))} /></div>
              </div>
              <Button className="w-full" onClick={handleSaveDentist} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Salvando..." : "Salvar alterações"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Dentistas</h1>
          <p className="text-sm text-muted-foreground">Cadastro e gestão de dentistas voluntários</p>
        </div>
        <Button onClick={() => navigate("/dentists/new")}>
          <Plus className="w-4 h-4 mr-2" />
          Cadastrar Dentista
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome, especialidade ou CRO..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Ativo">Ativo</SelectItem>
            <SelectItem value="Inativo">Inativo</SelectItem>
            <SelectItem value="Férias">Férias</SelectItem>
          </SelectContent>
        </Select>
        {statusFilter !== "all" && (
          <Button variant="ghost" size="sm" onClick={() => setStatusFilter("all")}>Limpar filtro</Button>
        )}
      </div>

      <div className="border border-border rounded-lg overflow-auto shadow-sm">
        <Table className="min-w-[980px]">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <SortableHeader label="Nome" column="name" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Especialidade" column="specialty" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Localização" column="location" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Status" column="status" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Vagas" column="openSlots" className="text-center" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Data de cadastro" column="registrationDate" sortConfig={sortConfig} onSort={handleSort} />
              <TableHead className="text-center w-[152px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((dentist) => (
              <TableRow key={dentist.id} className="hover:bg-accent/60 transition-colors cursor-pointer" onClick={() => setSelectedDentist(dentist)}>
                <TableCell className="font-medium">{dentist.name}</TableCell>
                <TableCell className="text-sm">{dentist.specialty}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {locationLabel(dentist) || "-"}
                  </span>
                </TableCell>
                <TableCell><Badge variant={dentist.status === "Ativo" ? "default" : "secondary"}>{dentist.status}</Badge></TableCell>
                <TableCell className="text-center font-medium">
                  <span className={dentist.openSlots === 0 ? "text-destructive" : "text-success"}>{dentist.openSlots}</span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatRegistrationDate(dentist.registrationDate)}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a href={`mailto:${dentist.email}`}>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Mail className="w-4 h-4 text-blue-500" />
                          </Button>
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>E-mail</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a href={`tel:${dentist.phone}`}>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>Ligar</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a href={`https://wa.me/55${formatPhone(dentist.phone)}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <MessageCircle className="w-4 h-4 text-green-500" />
                          </Button>
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>WhatsApp direto</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {loading ? "Carregando dentistas..." : "Nenhum dentista encontrado"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
