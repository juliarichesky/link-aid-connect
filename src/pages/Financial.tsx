import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, TrendingUp, TrendingDown, Wallet, Search, CreditCard, Receipt, Clock, Plus } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { maskCurrency } from "@/lib/masks";

type Period = "weekly" | "monthly" | "yearly";

interface Transaction {
  id: string;
  date: string;
  entity: string;
  description: string;
  value: string;
  type: string;
  status: string;
  category: string;
  dentist: string;
  paymentMethod: string;
  receipt: string;
  responsible: string;
  history: { date: string; action: string; user: string }[];
}

const summaryByPeriod: Record<Period, { label: string; value: string; icon: React.ElementType; color: string }[]> = {
  weekly: [
    { label: "Receita", value: "R$ 18.500", icon: TrendingUp, color: "text-success" },
    { label: "Gastos", value: "R$ 7.200", icon: TrendingDown, color: "text-destructive" },
    { label: "Saldo Líquido", value: "R$ 11.300", icon: Wallet, color: "text-primary" },
  ],
  monthly: [
    { label: "Receita", value: "R$ 78.500", icon: TrendingUp, color: "text-success" },
    { label: "Gastos", value: "R$ 32.700", icon: TrendingDown, color: "text-destructive" },
    { label: "Saldo Líquido", value: "R$ 45.800", icon: Wallet, color: "text-primary" },
  ],
  yearly: [
    { label: "Receita", value: "R$ 942.000", icon: TrendingUp, color: "text-success" },
    { label: "Gastos", value: "R$ 392.400", icon: TrendingDown, color: "text-destructive" },
    { label: "Saldo Líquido", value: "R$ 549.600", icon: Wallet, color: "text-primary" },
  ],
};

const allTransactions: Transaction[] = [
  { id: "FIN-001", date: "05/04/2025", entity: "Pedro Almeida", description: "Doação mensal", value: "R$ 2.000,00", type: "Receita", status: "Confirmado", category: "Doação", dentist: "-", paymentMethod: "Pix", receipt: "NF-2025-001", responsible: "Ana Costa", history: [{ date: "05/04/2025 09:00", action: "Transação criada", user: "Sistema" }, { date: "05/04/2025 09:15", action: "Pagamento confirmado", user: "Ana Costa" }] },
  { id: "FIN-002", date: "04/04/2025", entity: "Fornecedor Dental", description: "Materiais odontológicos", value: "R$ 1.500,00", type: "Despesa", status: "Pago", category: "Material", dentist: "Dra. Fernanda Costa", paymentMethod: "Boleto", receipt: "NF-2025-002", responsible: "Paula Rocha", history: [{ date: "04/04/2025 10:00", action: "Transação criada", user: "Paula Rocha" }, { date: "04/04/2025 14:00", action: "Pagamento efetuado", user: "Ana Costa" }] },
  { id: "FIN-003", date: "03/04/2025", entity: "Fundação ABC", description: "Patrocínio evento", value: "R$ 10.000,00", type: "Receita", status: "Pendente", category: "Patrocínio", dentist: "-", paymentMethod: "Transferência", receipt: "-", responsible: "Ana Costa", history: [{ date: "03/04/2025 08:00", action: "Transação criada", user: "Sistema" }] },
  { id: "FIN-004", date: "02/04/2025", entity: "Aluguel sala", description: "Aluguel mensal clínica", value: "R$ 3.200,00", type: "Despesa", status: "Pago", category: "Infraestrutura", dentist: "-", paymentMethod: "Débito Automático", receipt: "NF-2025-004", responsible: "Sistema", history: [{ date: "02/04/2025 07:00", action: "Débito automático", user: "Sistema" }] },
  { id: "FIN-005", date: "01/04/2025", entity: "Maria Oliveira", description: "Doação eventual", value: "R$ 500,00", type: "Receita", status: "Confirmado", category: "Doação", dentist: "-", paymentMethod: "Pix", receipt: "NF-2025-005", responsible: "Sistema", history: [{ date: "01/04/2025 16:00", action: "Transação criada", user: "Sistema" }, { date: "01/04/2025 16:05", action: "Confirmação automática", user: "Sistema" }] },
  { id: "FIN-006", date: "30/03/2025", entity: "Lab Próteses", description: "Próteses dentárias", value: "R$ 4.800,00", type: "Despesa", status: "Pendente", category: "Material", dentist: "Dr. Marcos Lima", paymentMethod: "Boleto", receipt: "-", responsible: "Paula Rocha", history: [{ date: "30/03/2025 11:00", action: "Transação criada", user: "Paula Rocha" }] },
  { id: "FIN-007", date: "28/03/2025", entity: "Empresa XYZ", description: "Doação corporativa", value: "R$ 15.000,00", type: "Receita", status: "Confirmado", category: "Doação", dentist: "-", paymentMethod: "Transferência", receipt: "NF-2025-007", responsible: "Ana Costa", history: [{ date: "28/03/2025 09:00", action: "Transação criada", user: "Sistema" }] },
  { id: "FIN-008", date: "25/03/2025", entity: "Seguradora Dental", description: "Seguro equipamentos", value: "R$ 800,00", type: "Despesa", status: "Pago", category: "Seguro", dentist: "-", paymentMethod: "Boleto", receipt: "NF-2025-008", responsible: "Ana Costa", history: [{ date: "25/03/2025 10:00", action: "Pagamento efetuado", user: "Ana Costa" }] },
  { id: "FIN-009", date: "22/03/2025", entity: "João Santos", description: "Doação mensal", value: "R$ 1.000,00", type: "Receita", status: "Confirmado", category: "Doação", dentist: "-", paymentMethod: "Pix", receipt: "NF-2025-009", responsible: "Sistema", history: [] },
  { id: "FIN-010", date: "20/03/2025", entity: "Fornecedor Insumos", description: "Luvas e materiais", value: "R$ 2.300,00", type: "Despesa", status: "Pago", category: "Material", dentist: "Dra. Ana Ribeiro", paymentMethod: "Cartão", receipt: "NF-2025-010", responsible: "Paula Rocha", history: [] },
  { id: "FIN-011", date: "18/03/2025", entity: "Prefeitura Municipal", description: "Subvenção social", value: "R$ 25.000,00", type: "Receita", status: "Confirmado", category: "Subvenção", dentist: "-", paymentMethod: "Transferência", receipt: "NF-2025-011", responsible: "Ana Costa", history: [] },
  { id: "FIN-012", date: "15/03/2025", entity: "Manutenção Predial", description: "Reparos elétricos", value: "R$ 1.200,00", type: "Despesa", status: "Pago", category: "Infraestrutura", dentist: "-", paymentMethod: "Pix", receipt: "NF-2025-012", responsible: "Sistema", history: [] },
];

const ITEMS_PER_PAGE = 10;
const categoryOptions = ["Doação", "Material", "Patrocínio", "Infraestrutura", "Seguro", "Subvenção", "Aluguel", "Equipamento"];

export default function Financial() {
  const [period, setPeriod] = useState<Period>("monthly");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dentistFilter, setDentistFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(allTransactions);
  const [showNewTx, setShowNewTx] = useState(false);

  const [newType, setNewType] = useState("Receita");
  const [newValue, setNewValue] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newEntity, setNewEntity] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newResponsible, setNewResponsible] = useState("");
  const [newPaymentMethod, setNewPaymentMethod] = useState("");

  const summary = summaryByPeriod[period];
  const categories = [...new Set(transactions.map((t) => t.category))];
  const dentistsList = [...new Set(transactions.map((t) => t.dentist).filter((d) => d !== "-"))];

  const filtered = transactions.filter((t) => {
    const matchSearch = t.entity.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchCategory = categoryFilter === "all" || t.category === categoryFilter;
    const matchType = typeFilter === "all" || t.type === typeFilter;
    const matchDentist = dentistFilter === "all" || t.dentist === dentistFilter;
    return matchSearch && matchStatus && matchCategory && matchType && matchDentist;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleCreateTx = () => {
    if (!newValue || !newEntity || !newCategory) {
      toast.error("Preencha os campos obrigatórios: Entidade, Valor e Categoria");
      return;
    }
    const newTx: Transaction = {
      id: `FIN-${String(transactions.length + 1).padStart(3, "0")}`,
      date: newDate || new Date().toLocaleDateString("pt-BR"),
      entity: newEntity,
      description: newDescription,
      value: newValue,
      type: newType === "Receita" ? "Receita" : "Despesa",
      status: "Pendente",
      category: newCategory,
      dentist: "-",
      paymentMethod: newPaymentMethod || "Pix",
      receipt: "-",
      responsible: newResponsible || "Sistema",
      history: [{ date: `${newDate || new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`, action: "Transação criada", user: newResponsible || "Sistema" }],
    };
    setTransactions((prev) => [newTx, ...prev]);
    setShowNewTx(false);
    setNewType("Receita"); setNewValue(""); setNewDate(""); setNewCategory(""); setNewEntity(""); setNewDescription(""); setNewResponsible(""); setNewPaymentMethod("");
    toast.success("Transação registrada com sucesso");
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Financeiro</h1>
          <p className="text-sm text-muted-foreground">Gestão de recursos e declaração</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setShowNewTx(true)}>
            <Plus className="w-4 h-4 mr-2" /> Nova Transação
          </Button>
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
              <SelectItem value="yearly">Anual</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm"><FileText className="w-4 h-4 mr-2" /> NF</Button>
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> Extrato</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summary.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className={`w-5 h-5 ${s.color}`} />
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
              <p className="text-2xl font-display font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por entidade ou descrição..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Receita">Receita</SelectItem>
            <SelectItem value="Despesa">Despesa</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Confirmado">Confirmado</SelectItem>
            <SelectItem value="Pago">Pago</SelectItem>
            <SelectItem value="Pendente">Pendente</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            {categories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={dentistFilter} onValueChange={(v) => { setDentistFilter(v); setPage(1); }}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Dentista" /></SelectTrigger>
          <SelectContent>
            {dentistsList.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}
          </SelectContent>
        </Select>
        {(typeFilter !== "all" || statusFilter !== "all" || categoryFilter !== "all" || dentistFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setTypeFilter("all"); setStatusFilter("all"); setCategoryFilter("all"); setDentistFilter("all"); setPage(1);
            }}
          >
            Limpar filtros
          </Button>
        )}
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Data</TableHead>
              <TableHead>Doador/Fornecedor</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((t) => (
              <TableRow key={t.id} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => setSelectedTx(t)}>
                <TableCell className="text-sm">{t.date}</TableCell>
                <TableCell className="font-medium text-sm">{t.entity}</TableCell>
                <TableCell className="text-sm">{t.description}</TableCell>
                <TableCell><Badge variant="outline" className="text-xs min-w-[80px] flex items-center justify-center">{t.category}</Badge></TableCell>
                <TableCell className={`font-medium text-sm ${t.type === "Receita" ? "text-success" : "text-destructive"}`}>{t.type === "Despesa" ? `- ${t.value}` : t.value}</TableCell>
                <TableCell><Badge variant={t.type === "Receita" ? "default" : "secondary"} className="min-w-[72px] flex items-center justify-center">{t.type}</Badge></TableCell>
                <TableCell><Badge variant="outline" className={`text-xs min-w-[80px] flex items-center justify-center ${t.status === "Pendente" ? "border-warning text-warning" : ""}`}>{t.status}</Badge></TableCell>
              </TableRow>
            ))}
            {paginated.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhuma transação encontrada</TableCell></TableRow>
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

      {/* Transaction Detail Modal */}
      <Dialog open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" /> Detalhe da Transação
            </DialogTitle>
          </DialogHeader>
          {selectedTx && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">ID</p><p className="font-mono font-medium">{selectedTx.id}</p></div>
                <div><p className="text-xs text-muted-foreground">Data</p><p className="font-medium">{selectedTx.date}</p></div>
                <div><p className="text-xs text-muted-foreground">Entidade</p><p className="font-medium">{selectedTx.entity}</p></div>
                <div><p className="text-xs text-muted-foreground">Categoria</p><Badge variant="outline">{selectedTx.category}</Badge></div>
                <div><p className="text-xs text-muted-foreground">Valor</p><p className={`font-bold text-lg ${selectedTx.type === "Receita" ? "text-success" : "text-destructive"}`}>{selectedTx.value}</p></div>
                <div><p className="text-xs text-muted-foreground">Tipo</p><Badge variant={selectedTx.type === "Receita" ? "default" : "secondary"}>{selectedTx.type}</Badge></div>
                <div><p className="text-xs text-muted-foreground">Status</p><Badge variant="outline">{selectedTx.status}</Badge></div>
                <div><p className="text-xs text-muted-foreground">Método</p><p className="font-medium flex items-center gap-1"><CreditCard className="w-3 h-3" /> {selectedTx.paymentMethod}</p></div>
                <div><p className="text-xs text-muted-foreground">Comprovante / NF</p><p className="font-medium">{selectedTx.receipt}</p></div>
                <div><p className="text-xs text-muted-foreground">Responsável</p><p className="font-medium">{selectedTx.responsible}</p></div>
                <div><p className="text-xs text-muted-foreground">Dentista Vinculado</p><p className="font-medium">{selectedTx.dentist}</p></div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium flex items-center gap-1.5 mb-3"><Clock className="w-4 h-4 text-muted-foreground" /> Histórico de Alterações</p>
                {selectedTx.history.length > 0 ? (
                  <div className="space-y-2">
                    {selectedTx.history.map((h, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                        <div><p className="font-medium">{h.action}</p><p className="text-xs text-muted-foreground">{h.date} · {h.user}</p></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Sem alterações registradas</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Transaction Dialog */}
      <Dialog open={showNewTx} onOpenChange={setShowNewTx}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" /> Nova Transação
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Tipo *</Label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Receita">Entrada / Doação</SelectItem>
                    <SelectItem value="Despesa">Saída / Gasto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Valor (R$) *</Label>
                <Input className="h-9" placeholder="R$ 0,00" value={newValue} onChange={(e) => setNewValue(maskCurrency(e.target.value))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Data</Label>
                <Input className="h-9" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Categoria *</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Doador / Fornecedor *</Label>
              <Input className="h-9" placeholder="Nome da entidade ou pessoa" value={newEntity} onChange={(e) => setNewEntity(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Descrição detalhada</Label>
              <Textarea placeholder="Descreva a transação em detalhes..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Responsável</Label>
                <Select value={newResponsible} onValueChange={setNewResponsible}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Selecione o responsável" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ana Costa">Ana Costa</SelectItem>
                    <SelectItem value="Paula Rocha">Paula Rocha</SelectItem>
                    <SelectItem value="Carlos Silva">Carlos Silva</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Método de Pagamento</Label>
                <Select value={newPaymentMethod} onValueChange={setNewPaymentMethod}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Selecione o método" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pix">Pix</SelectItem>
                    <SelectItem value="Boleto">Boleto</SelectItem>
                    <SelectItem value="Transferência">Transferência</SelectItem>
                    <SelectItem value="Cartão">Cartão</SelectItem>
                    <SelectItem value="Débito Automático">Débito Automático</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full" onClick={handleCreateTx}>
              Registrar Transação
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
