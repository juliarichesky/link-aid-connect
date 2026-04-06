import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const summary = [
  { label: "Receita", value: "R$ 78.500", icon: TrendingUp, color: "text-success" },
  { label: "Gastos", value: "R$ 32.700", icon: TrendingDown, color: "text-destructive" },
  { label: "Saldo", value: "R$ 45.800", icon: Wallet, color: "text-primary" },
];

const transactions = [
  { date: "05/04/2025", entity: "Pedro Almeida", description: "Doação mensal", value: "R$ 2.000", type: "Receita", status: "Confirmado" },
  { date: "04/04/2025", entity: "Fornecedor Dental", description: "Materiais odontológicos", value: "R$ 1.500", type: "Despesa", status: "Pago" },
  { date: "03/04/2025", entity: "Fundação ABC", description: "Patrocínio evento", value: "R$ 10.000", type: "Receita", status: "Pendente" },
  { date: "02/04/2025", entity: "Aluguel sala", description: "Aluguel mensal clínica", value: "R$ 3.200", type: "Despesa", status: "Pago" },
];

export default function Financial() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Financeiro</h1>
          <p className="text-sm text-muted-foreground">Gestão de recursos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" /> NF
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Extrato
          </Button>
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
                <TableHead>Valor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t, i) => (
                <TableRow key={i}>
                  <TableCell className="text-sm">{t.date}</TableCell>
                  <TableCell className="font-medium text-sm">{t.entity}</TableCell>
                  <TableCell className="text-sm">{t.description}</TableCell>
                  <TableCell className="font-medium text-sm">{t.value}</TableCell>
                  <TableCell>
                    <Badge variant={t.type === "Receita" ? "default" : "secondary"}>
                      {t.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{t.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
