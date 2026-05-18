import { useCallback, useEffect, useMemo, useState, type ElementType } from "react";
import {
  CheckCircle,
  Clock,
  Download,
  FolderOpen,
  Inbox,
  Stethoscope,
  Users,
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
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import {
  linkAidApi,
  type ApiContatoResponse,
  type ApiDashboardResponse,
} from "@/lib/linkaidApi";
import { tipoContatoRegistroLabel } from "@/lib/linkaidMappings";

type Period = "weekly" | "monthly" | "yearly";

type StatCard = {
  label: string;
  value: number | null;
  detail?: string;
  icon: ElementType;
  color: string;
};

type VolumeBucket = {
  label: string;
  contatos: number;
};

const periodLabels: Record<Period, string> = {
  weekly: "Semanal",
  monthly: "Mensal",
  yearly: "Anual",
};

const contactTypeColors = [
  "hsl(214, 80%, 52%)",
  "hsl(142, 71%, 45%)",
  "hsl(40, 96%, 53%)",
  "hsl(0, 72%, 51%)",
  "hsl(280, 60%, 55%)",
  "hsl(188, 78%, 41%)",
];

const toDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const weekOfMonth = (date: Date) => Math.ceil(date.getDate() / 7);

const formatRelativeDate = (value?: string) => {
  const date = toDate(value);
  if (!date) return "Sem data";

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) {
    return date.toLocaleDateString("pt-BR");
  }

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `há ${days}d`;

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const contactTimestamp = (contact: ApiContatoResponse) =>
  toDate(contact.dataCadastro)?.getTime() ?? 0;

const contactTypeName = (contact: ApiContatoResponse) =>
  tipoContatoRegistroLabel(contact.tipoContatoCodigo, contact.tipoContatoNome) || "Sem tipo";

const buildContactVolume = (contacts: ApiContatoResponse[], period: Period): VolumeBucket[] => {
  const today = startOfDay(new Date());

  if (period === "weekly") {
    return Array.from({ length: 7 }, (_, index) => {
      const day = addDays(today, index - 6);
      const contatos = contacts.filter((contact) => {
        const createdAt = toDate(contact.dataCadastro);
        return createdAt ? sameDay(createdAt, day) : false;
      }).length;

      return {
        label: day.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit" }),
        contatos,
      };
    });
  }

  if (period === "monthly") {
    const weeksInMonth = Math.ceil(new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() / 7);
    return Array.from({ length: weeksInMonth }, (_, index) => {
      const week = index + 1;
      const contatos = contacts.filter((contact) => {
        const createdAt = toDate(contact.dataCadastro);
        return createdAt
          ? createdAt.getFullYear() === today.getFullYear() &&
              createdAt.getMonth() === today.getMonth() &&
              weekOfMonth(createdAt) === week
          : false;
      }).length;

      return { label: `Sem ${week}`, contatos };
    });
  }

  return Array.from({ length: 12 }, (_, month) => {
    const label = new Date(today.getFullYear(), month, 1)
      .toLocaleDateString("pt-BR", { month: "short" })
      .replace(".", "");
    const contatos = contacts.filter((contact) => {
      const createdAt = toDate(contact.dataCadastro);
      return createdAt
        ? createdAt.getFullYear() === today.getFullYear() && createdAt.getMonth() === month
        : false;
    }).length;

    return { label, contatos };
  });
};

const escapeCsv = (value: string | number) => {
  const text = String(value).replace(/"/g, '""');
  return `"${text}"`;
};

export default function Dashboard() {
  const { token } = useAuth();
  const [period, setPeriod] = useState<Period>("weekly");
  const [dashboard, setDashboard] = useState<ApiDashboardResponse | null>(null);
  const [contacts, setContacts] = useState<ApiContatoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!token) {
      setDashboard(null);
      setContacts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [dashboardResponse, contactsResponse] = await Promise.all([
        linkAidApi.buscarDashboard(token),
        linkAidApi.listarContatos(token),
      ]);
      setDashboard(dashboardResponse);
      setContacts(contactsResponse);
    } catch (loadError) {
      setDashboard(null);
      setContacts([]);
      setError(loadError instanceof Error ? loadError.message : "Falha ao carregar dados reais do dashboard.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const stats = useMemo<StatCard[]>(() => {
    const resumo = dashboard?.resumo;
    return [
      { label: "Contatos", value: resumo?.totalContatos ?? null, icon: Users, color: "text-info" },
      { label: "Tickets", value: resumo?.totalTickets ?? null, icon: FolderOpen, color: "text-warning" },
      { label: "Novos", value: resumo?.ticketsNovos ?? null, icon: Inbox, color: "text-primary" },
      { label: "Em atendimento", value: resumo?.ticketsEmAtendimento ?? null, icon: Clock, color: "text-muted-foreground" },
      { label: "Resolvidos", value: resumo?.ticketsResolvidos ?? null, icon: CheckCircle, color: "text-success" },
      {
        label: "Dentistas ativos",
        value: resumo?.dentistasAtivos ?? null,
        detail: resumo ? `de ${resumo.totalDentistas} cadastrados` : undefined,
        icon: Stethoscope,
        color: "text-primary",
      },
    ];
  }, [dashboard]);

  const volumeData = useMemo(() => buildContactVolume(contacts, period), [contacts, period]);
  const hasVolume = volumeData.some((item) => item.contatos > 0);

  const contactTypes = useMemo(() => {
    const counts = new Map<string, number>();
    contacts.forEach((contact) => {
      const name = contactTypeName(contact);
      counts.set(name, (counts.get(name) || 0) + 1);
    });

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], index) => ({
        name,
        value,
        color: contactTypeColors[index % contactTypeColors.length],
      }));
  }, [contacts]);

  const recentContacts = useMemo(
    () =>
      [...contacts]
        .sort((a, b) => {
          const byDate = contactTimestamp(b) - contactTimestamp(a);
          return byDate || (b.idContato ?? 0) - (a.idContato ?? 0);
        })
        .slice(0, 5),
    [contacts],
  );

  const handleExport = () => {
    const resumo = dashboard?.resumo;
    const rows: (string | number)[][] = [
      ["Dashboard", periodLabels[period]],
      ["Total de contatos", resumo?.totalContatos ?? 0],
      ["Total de tickets", resumo?.totalTickets ?? 0],
      ["Tickets novos", resumo?.ticketsNovos ?? 0],
      ["Tickets em atendimento", resumo?.ticketsEmAtendimento ?? 0],
      ["Tickets resolvidos", resumo?.ticketsResolvidos ?? 0],
      ["Dentistas ativos", resumo?.dentistasAtivos ?? 0],
      [],
      ["Volume de contatos"],
      ["Periodo", "Contatos"],
      ...volumeData.map((item) => [item.label, item.contatos]),
      [],
      ["Tipos de contato"],
      ["Tipo", "Quantidade"],
      ...contactTypes.map((item) => [item.name, item.value]),
    ];

    const csv = rows.map((row) => row.map(escapeCsv).join(";")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dashboard-${period}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "Carregando dados reais..." : "Visão geral do atendimento"}
          </p>
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
          <Button variant="outline" size="sm" onClick={handleExport} disabled={loading || !!error}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-display font-bold">
                {loading ? "--" : (stat.value ?? 0).toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              {stat.detail && <p className="text-[11px] text-muted-foreground mt-1">{stat.detail}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Volume de contatos - {periodLabels[period]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={volumeData}>
                <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="contatos" fill="hsl(214, 80%, 52%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {loading && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Carregando volume de contatos...
              </p>
            )}
            {!loading && !hasVolume && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Nenhum contato cadastrado neste período.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tipos de contato</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {contactTypes.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={contactTypes} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                      {contactTypes.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 mt-2">
                  {contactTypes.map((ct) => (
                    <div key={ct.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: ct.color }} />
                      <span className="text-[11px] text-muted-foreground">
                        {ct.name} ({ct.value})
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-40 flex items-center justify-center text-sm text-muted-foreground text-center">
                {loading ? "Carregando tipos de contato..." : "Nenhum contato cadastrado."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Últimos contatos</CardTitle>
        </CardHeader>
        <CardContent>
          {recentContacts.length > 0 ? (
            <div className="space-y-3">
              {recentContacts.map((contact) => (
                <div key={contact.idContato ?? contact.nome} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                      {contact.nome.split(" ").map((name) => name[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{contact.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {contactTypeName(contact)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatRelativeDate(contact.dataCadastro)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              {loading ? "Carregando contatos..." : "Nenhum contato cadastrado."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
