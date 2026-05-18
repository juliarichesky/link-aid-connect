import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
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
import { useTickets } from "@/contexts/TicketsContext";
import { DENTISTA_STATUS_LABELS } from "@/lib/linkaidMappings";
import { maskPhone } from "@/lib/masks";
import { toast } from "sonner";

export default function NewDentist() {
  const navigate = useNavigate();
  const { dentists, loading, addDentist } = useTickets();
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [crm, setCrm] = useState("");
  const [city, setCity] = useState("");
  const [uf, setUf] = useState("");
  const [status, setStatus] = useState(DENTISTA_STATUS_LABELS.A);
  const [saving, setSaving] = useState(false);

  const handleCreateDentist = async () => {
    if (!name.trim() || !specialty.trim() || !crm.trim()) {
      toast.error("Preencha nome, especialidade e CRO do dentista");
      return;
    }

    const nextId = Math.max(0, ...dentists.map((dentist) => dentist.id)) + 1;
    setSaving(true);
    try {
      await addDentist({
        id: nextId,
        name: name.trim(),
        specialty: specialty.trim(),
        status,
        totalSlots: 0,
        openSlots: 0,
        phone,
        email: email.trim(),
        crm: crm.trim(),
        location: city.trim(),
        uf: uf.trim().toUpperCase().slice(0, 2),
        country: "Brasil",
        schedule: [],
        registrationDate: new Date().toISOString(),
      });
      toast.success("Dentista cadastrado com sucesso!");
      navigate("/dentists");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao cadastrar dentista");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5 animate-fade-in">
      <Button variant="ghost" size="sm" onClick={() => navigate("/dentists")}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
      </Button>

      <div>
        <h1 className="text-2xl font-display font-bold">Cadastrar Dentista</h1>
        <p className="text-sm text-muted-foreground">Cadastro manual de dentista voluntário</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader><CardTitle className="text-base">Dados do Dentista</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Nome Completo *</Label><Input placeholder="Nome completo do profissional" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><Label>Especialidade *</Label><Input placeholder="Ex: Ortodontia, Endodontia" value={specialty} onChange={(e) => setSpecialty(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>CRO *</Label><Input placeholder="CRO-XX 00000" value={crm} onChange={(e) => setCrm(e.target.value)} /></div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
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
            <div><Label>Telefone</Label><Input placeholder="(00) 00000-0000" value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} /></div>
            <div><Label>E-mail</Label><Input type="email" placeholder="email@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_96px] gap-4">
            <div><Label>Cidade</Label><Input placeholder="Cidade" value={city} onChange={(e) => setCity(e.target.value)} /></div>
            <div><Label>UF</Label><Input placeholder="UF" value={uf} onChange={(e) => setUf(e.target.value.toUpperCase().slice(0, 2))} /></div>
          </div>
          <Button className="w-full" onClick={handleCreateDentist} disabled={saving || loading}>
            <Plus className="w-4 h-4 mr-2" />
            {loading ? "Carregando dados..." : saving ? "Cadastrando..." : "Cadastrar Dentista"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
