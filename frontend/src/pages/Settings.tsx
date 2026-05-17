import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Settings() {
  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="text-left">
        <h1 className="text-2xl font-display font-bold">Configurações</h1>
        <p className="text-sm text-muted-foreground">Gerencie usuários, integrações e automações</p>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="automation">Automação</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader className="text-left"><CardTitle className="text-base">Gestão de Usuários</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Nome</Label><Input placeholder="Nome do colaborador" /></div>
                <div><Label>E-mail</Label><Input placeholder="email@ong.org" /></div>
              </div>
              <div><Label>Permissão</Label><Input placeholder="Admin / Atendente / Gestor" /></div>
              <Button>Adicionar Usuário</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader className="text-left"><CardTitle className="text-base">Integrações API</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-left">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">WhatsApp Business API</p>
                  <p className="text-xs text-muted-foreground">Conecte ao número da ONG</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">Instagram Direct</p>
                  <p className="text-xs text-muted-foreground">Gerenciar mensagens do Instagram</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">E-mail SMTP</p>
                  <p className="text-xs text-muted-foreground">Integração com servidor de e-mail</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation">
          <Card>
            <CardHeader className="text-left"><CardTitle className="text-base">Regras de Automação</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-left">
              <div>
                <Label>Palavra-chave</Label>
                <Input placeholder="Ex: urgência, doação, dentista voluntário" />
              </div>
              <div>
                <Label>Ação automática</Label>
                <Input placeholder="Ex: Prioridade Alta + Notificar gestor" />
              </div>
              <Button>Criar Regra</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
