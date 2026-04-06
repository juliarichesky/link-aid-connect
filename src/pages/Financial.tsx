import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, TrendingUp, TrendingDown, Wallet } from "lucide-react";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type Period = "weekly" | "monthly" | "yearly";

const summaryByPeriod: Record<Period, { label: string; value: string; icon: React.ElementType; color: string }[]> = {
  weekly: [
    { label: "Receita", value: "R$ 18.500", icon: TrendingUp, color: "text-success" },
    { label: "Gastos", value: "R$ 7.200", icon: TrendingDown, color: "text-destructive" },
    { label: "Saldo", value: "R$ 11.300", icon: Wallet, color: "text-primary" },
  ],
  monthly: [
    { label: "Receita", value: "R$ 78.500", icon: TrendingUp, color: "text-success" },
    { label: "Gastos", value: "R$ 32.700", icon: TrendingDown, color: "text-destructive" },
    { label: "Saldo", value: "R$ 45.800", icon: Wallet, color: "text-primary" },
  ],
  yearly: [
    { label: "Receita", value: "R$ 942.000", icon: TrendingUp, color: "text-success" },
    { label: "Gastos", value: "R$ 392.400", icon: TrendingDown, color: "text-destructive" },
    { label: "Saldo", value: "R$ 549.600", icon: Wallet, color: "text-primary" },
  ],
};

const transactions = [
  { date: "05/04/2025", entity: "Pedro Almeida", description: "Doação mensal", value: "R$ 2.000", type: "Receita", status: "Confirmado", category: "Doação", dentist: "-" },
  { date: "04/04/2025", entity: "Fornecedor Dental", description: "Materiais odontológicos", value: "R$ 1.500", type: "Despesa", status: "Pago", category: "Material", dentist: "Dra. Fernanda Costa" },
  { date: "03/04/2025", entity: "Fundação ABC", description: "Patrocínio evento", value: "R$ 10.000", type: "Receita", status: "Pendente", category: "Patrocínio", dentist: "-" },
  { date: "02/04/2025", entity: "Aluguel sala", description: "Aluguel mensal clínica", value: "R$ 3.200", type: "Despesa", status: "Pago", category: "Infraestrutura", dentist: "-" },
  { date: "01/04/2025", entity: "Maria Oliveira", description: "Doação eventual", value: "R$ 500", type: "Receita", status: "Confirmado", category: "Doação", dentist: "-" },
  { date: "30/03/2025", entity: "Lab Próteses", description: "Próteses dentárias", value: "R$ 4.800", type: "Despesa", status: "Pendente", category: "Material", dentist: "Dr. Marcos Lima" },
];

const ITEMS_PER_PAGE = 5;

export default function Financial() {
  const [period, setPeriod] = useState<Period>("monthly");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dentistFilter, setDentistFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const summary = summaryByPeriod[period];
  const categories = [...new Set(transactions.map((t) => t.category))];
  const dentistsList = [...new Set(transactions.map((t) => t.dentist).filter((d) => d !== "-"))];

  const filtered = transactions.filter((t) => {
    const matchSearch = t.entity.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchCategory = categoryFilter === "all" || t.category === categoryFilter;
    const matchDentist = dentistFilter === "all" || t.dentist === dentistFilter;
    return matchSearch && matchStatus && matchCategory && matchDentist;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Financeiro</h1>
          <p className="text-sm text-muted-foreground">Gestão de recursos</p>
        </div>
        <div className="flex gap-2">
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

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar transações..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Confirmado">Confirmado</SelectItem>
            <SelectItem value="Pago">Pago</SelectItem>
            <SelectItem value="Pendente">Pendente</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={dentistFilter} onValueChange={(v) => { setDentistFilter(v); setPage(1); }}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Dentista" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {dentistsList.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
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
              {paginated.map((t, i) => (
                <TableRow key={i}>
                  <TableCell className="text-sm">{t.date}</TableCell>
                  <TableCell className="font-medium text-sm">{t.entity}</TableCell>
                  <TableCell className="text-sm">{t.description}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{t.category}</Badge></TableCell>
                  <TableCell className="font-medium text-sm">{t.value}</TableCell>
                  <TableCell><Badge variant={t.type === "Receita" ? "default" : "secondary"}>{t.type}</Badge></TableCell>
                  <TableCell className="text-sm">{t.status}</TableCell>
                </TableRow>
              ))}
              {paginated.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhuma transação encontrada</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
