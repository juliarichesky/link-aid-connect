import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type Period = "weekly" | "monthly" | "yearly";

const dataByPeriod: Record<Period, {
  channelData: { channel: string; count: number }[];
  classificationData: { name: string; value: number; color: string }[];
  kpis: { label: string; value: string }[];
}> = {
  weekly: {
    channelData: [
      { channel: "WhatsApp", count: 38 },
      { channel: "E-mail", count: 22 },
      { channel: "Instagram", count: 14 },
      { channel: "Outros", count: 6 },
    ],
    classificationData: [
      { name: "Saúde", value: 42, color: "hsl(214, 80%, 52%)" },
      { name: "Doação", value: 23, color: "hsl(142, 71%, 45%)" },
      { name: "Parceria", value: 20, color: "hsl(40, 96%, 53%)" },
      { name: "Social", value: 15, color: "hsl(0, 72%, 51%)" },
    ],
    kpis: [
      { label: "Tempo Médio de Resposta", value: "1h 48min" },
      { label: "Valor Total em Doações", value: "R$ 11.300" },
      { label: "Dentistas Inscritos", value: "8" },
      { label: "Em Atendimento", value: "5" },
    ],
  },
  monthly: {
    channelData: [
      { channel: "WhatsApp", count: 145 },
      { channel: "E-mail", count: 89 },
      { channel: "Instagram", count: 56 },
      { channel: "Outros", count: 23 },
    ],
    classificationData: [
      { name: "Saúde", value: 40, color: "hsl(214, 80%, 52%)" },
      { name: "Doação", value: 25, color: "hsl(142, 71%, 45%)" },
      { name: "Parceria", value: 20, color: "hsl(40, 96%, 53%)" },
      { name: "Social", value: 15, color: "hsl(0, 72%, 51%)" },
    ],
    kpis: [
      { label: "Tempo Médio de Resposta", value: "2h 15min" },
      { label: "Valor Total em Doações", value: "R$ 45.800" },
      { label: "Dentistas Inscritos", value: "34" },
      { label: "Em Atendimento", value: "12" },
    ],
  },
  yearly: {
    channelData: [
      { channel: "WhatsApp", count: 1742 },
      { channel: "E-mail", count: 1068 },
      { channel: "Instagram", count: 672 },
      { channel: "Outros", count: 276 },
    ],
    classificationData: [
      { name: "Saúde", value: 38, color: "hsl(214, 80%, 52%)" },
      { name: "Doação", value: 28, color: "hsl(142, 71%, 45%)" },
      { name: "Parceria", value: 21, color: "hsl(40, 96%, 53%)" },
      { name: "Social", value: 13, color: "hsl(0, 72%, 51%)" },
    ],
    kpis: [
      { label: "Tempo Médio de Resposta", value: "2h 32min" },
      { label: "Valor Total em Doações", value: "R$ 549.600" },
      { label: "Dentistas Inscritos", value: "112" },
      { label: "Em Atendimento", value: "27" },
    ],
  },
};

const periodLabels: Record<Period, string> = {
  weekly: "Semanal",
  monthly: "Mensal",
  yearly: "Anual",
};

export default function Reports() {
  const [period, setPeriod] = useState<Period>("monthly");

  const { channelData, classificationData, kpis } = useMemo(
    () => dataByPeriod[period],
    [period],
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Relatórios</h1>
          <p className="text-sm text-muted-foreground">
            Análise e métricas de atendimento — período {periodLabels[period].toLowerCase()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
              <SelectItem value="yearly">Anual</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Exportar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground">{k.label}</p>
              <p className="text-xl font-display font-bold mt-1">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Volume por Canal — {periodLabels[period]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={channelData}>
                <XAxis dataKey="channel" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="hsl(214, 80%, 52%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Distribuição por Classificação — {periodLabels[period]}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={classificationData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {classificationData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2">
              {classificationData.map((c) => (
                <div key={c.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                  <span className="text-[11px] text-muted-foreground">{c.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
