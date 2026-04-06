import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CreateTicket() {
  const navigate = useNavigate();
  const [type, setType] = useState("pf");

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5 animate-fade-in">
      <Button variant="ghost" size="sm" onClick={() => navigate("/tickets")}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
      </Button>

      <div>
        <h1 className="text-2xl font-display font-bold">Criar Ticket</h1>
        <p className="text-sm text-muted-foreground">Cadastro manual de atendimento</p>
      </div>

      <Tabs value={type} onValueChange={setType}>
        <TabsList>
          <TabsTrigger value="pf">Pessoa Física</TabsTrigger>
          <TabsTrigger value="pj">Pessoa Jurídica</TabsTrigger>
        </TabsList>

        <TabsContent value="pf">
          <Card>
            <CardHeader><CardTitle className="text-base">Dados da Pessoa Física</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Nome</Label><Input placeholder="Nome completo" /></div>
                <div><Label>CPF</Label><Input placeholder="000.000.000-00" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Telefone</Label><Input placeholder="(00) 00000-0000" /></div>
                <div>
                  <Label>Canal</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="other">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Cidade</Label><Input placeholder="Cidade" /></div>
                <div><Label>Estado</Label><Input placeholder="UF" /></div>
              </div>
              <div><Label>Assunto</Label><Input placeholder="Assunto do ticket" /></div>
              <div><Label>Descrição</Label><Textarea placeholder="Descreva o atendimento..." rows={3} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prioridade</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Crítica</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Responsável</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="carlos">Carlos Silva</SelectItem>
                      <SelectItem value="ana">Ana Costa</SelectItem>
                      <SelectItem value="maria">Maria Santos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full">Criar Ticket</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pj">
          <Card>
            <CardHeader><CardTitle className="text-base">Dados da Pessoa Jurídica</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Nome da Empresa</Label><Input placeholder="Razão social" /></div>
                <div><Label>CNPJ</Label><Input placeholder="00.000.000/0000-00" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Telefone</Label><Input placeholder="(00) 00000-0000" /></div>
                <div>
                  <Label>Canal</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="other">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Cidade</Label><Input placeholder="Cidade" /></div>
                <div><Label>Estado</Label><Input placeholder="UF" /></div>
              </div>
              <div><Label>Assunto</Label><Input placeholder="Assunto do ticket" /></div>
              <div><Label>Descrição</Label><Textarea placeholder="Descreva o atendimento..." rows={3} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prioridade</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Crítica</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Responsável</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="carlos">Carlos Silva</SelectItem>
                      <SelectItem value="ana">Ana Costa</SelectItem>
                      <SelectItem value="maria">Maria Santos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full">Criar Ticket</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
