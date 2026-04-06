import { useState } from "react";
import {
  Inbox,
  FolderOpen,
  Clock,
  CheckCircle,
  TrendingUp,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  stats: { label: string; value: number; icon: React.ElementType; trend: string; color: string }[];
  volume: { day: string; tickets: number }[];
}> = {
  weekly: {
    stats: [
      { label: "Novos", value: 24, icon: Inbox, trend: "+12%", color: "text-info" },
      { label: "Abertos", value: 48, icon: FolderOpen, trend: "+5%", color: "text-warning" },
      { label: "Aguardando", value: 15, icon: Clock, trend: "-3%", color: "text-muted-foreground" },
      { label: "Resolvidos", value: 132, icon: CheckCircle, trend: "+18%", color: "text-success" },
    ],
    volume: [
      { day: "Seg", tickets: 18 }, { day: "Ter", tickets: 25 }, { day: "Qua", tickets: 22 },
      { day: "Qui", tickets: 30 }, { day: "Sex", tickets: 28 }, { day: "Sáb", tickets: 10 }, { day: "Dom", tickets: 5 },
    ],
  },
  monthly: {
    stats: [
      { label: "Novos", value: 96, icon: Inbox, trend: "+8%", color: "text-info" },
      { label: "Abertos", value: 180, icon: FolderOpen, trend: "+3%", color: "text-warning" },
      { label: "Aguardando", value: 42, icon: Clock, trend: "-5%", color: "text-muted-foreground" },
      { label: "Resolvidos", value: 520, icon: CheckCircle, trend: "+22%", color: "text-success" },
    ],
    volume: [
      { day: "Sem 1", tickets: 80 }, { day: "Sem 2", tickets: 95 },
      { day: "Sem 3", tickets: 110 }, { day: "Sem 4", tickets: 135 },
    ],
  },
  yearly: {
    stats: [
      { label: "Novos", value: 1150, icon: Inbox, trend: "+15%", color: "text-info" },
      { label: "Abertos", value: 2200, icon: FolderOpen, trend: "+10%", color: "text-warning" },
      { label: "Aguardando", value: 340, icon: Clock, trend: "-8%", color: "text-muted-foreground" },
      { label: "Resolvidos", value: 6400, icon: CheckCircle, trend: "+25%", color: "text-success" },
    ],
    volume: [
      { day: "Jan", tickets: 320 }, { day: "Fev", tickets: 280 }, { day: "Mar", tickets: 350 },
      { day: "Abr", tickets: 400 }, { day: "Mai", tickets: 380 }, { day: "Jun", tickets: 450 },
      { day: "Jul", tickets: 420 }, { day: "Ago", tickets: 500 }, { day: "Set", tickets: 480 },
      { day: "Out", tickets: 520 }, { day: "Nov", tickets: 550 }, { day: "Dez", tickets: 490 },
    ],
  },
};

const contactTypes = [
  { name: "Doador", value: 35, color: "hsl(214, 80%, 52%)" },
  { name: "Voluntário", value: 28, color: "hsl(142, 71%, 45%)" },
  { name: "Beneficiário", value: 25, color: "hsl(40, 96%, 53%)" },
  { name: "Parceria", value: 12, color: "hsl(280, 60%, 55%)" },
];

const recentContacts = [
  { name: "Maria Oliveira", type: "Beneficiário", time: "há 10 min" },
  { name: "Instituto Sorria", type: "Parceria", time: "há 25 min" },
  { name: "Pedro Almeida", type: "Doador", time: "há 1h" },
  { name: "Dra. Fernanda", type: "Voluntário", time: "há 2h" },
];

const periodLabels: Record<Period, string> = {
  weekly: "Semanal",
  monthly: "Mensal",
  yearly: "Anual",
};

export default function Dashboard() {
  const [period, setPeriod] = useState<Period>("weekly");
  const data = dataByPeriod[period];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Visão geral do atendimento</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
              <SelectItem value="yearly">Anual</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Ticket Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-xs text-success font-medium flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> {stat.trend}
                </span>
              </div>
              <p className="text-2xl font-display font-bold">{stat.value.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Volume {periodLabels[period]}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.volume}>
                <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="tickets" fill="hsl(214, 80%, 52%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tipos de Contato</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={contactTypes} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {contactTypes.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2">
              {contactTypes.map((ct) => (
                <div key={ct.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: ct.color }} />
                  <span className="text-[11px] text-muted-foreground">{ct.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Contacts */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Últimos Contatos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentContacts.map((c) => (
              <div key={c.name} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                    {c.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.type}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{c.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
