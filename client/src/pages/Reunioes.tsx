import React, { useState, useEffect } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Calendar, Clock, MapPin, Users, Plus, ExternalLink, Mail, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Reuniao {
  id: number;
  titulo: string;
  descricao?: string;
  dataReuniao: string;
  horaInicio?: string;
  horaFim?: string;
  local?: string;
  jitsiLink: string;
  jitsiRoomId: string;
  status: "agendada" | "em_andamento" | "concluida" | "cancelada";
  participantes: Array<{
    nome: string;
    email: string;
    cargo?: string;
  }>;
  gravacaoUrl?: string;
  transcricao?: string;
  ataGerada?: any;
  ataHtml?: string;
  ataUrl?: string;
  emailsEnviados: string[];
  createdAt: string;
}

export default function Reunioes() {
  const [reunioes, setReunioes] = useState<Reuniao[]>([]);
  const [showNovaReuniao, setShowNovaReuniao] = useState(false);
  const [showDetalhes, setShowDetalhes] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    dataReuniao: "",
    horaInicio: "",
    local: "",
    participantes: [{ nome: "", email: "", cargo: "" }],
  });

  const listarQuery = trpc.reunioes.listar.useQuery();
  const criarMutation = trpc.reunioes.criar.useMutation();
  const iniciarMutation = trpc.reunioes.iniciar.useMutation();
  const finalizarMutation = trpc.reunioes.finalizar.useMutation();
  const deletarMutation = trpc.reunioes.deletar.useMutation();

  useEffect(() => {
    if (listarQuery.data) {
      setReunioes(listarQuery.data);
    }
  }, [listarQuery.data]);

  const handleCriarReuniao = async () => {
    try {
      await criarMutation.mutateAsync({
        titulo: formData.titulo,
        descricao: formData.descricao,
        dataReuniao: formData.dataReuniao,
        horaInicio: formData.horaInicio,
        local: formData.local,
        participantes: formData.participantes.filter((p) => p.email),
      });

      setFormData({
        titulo: "",
        descricao: "",
        dataReuniao: "",
        horaInicio: "",
        local: "",
        participantes: [{ nome: "", email: "", cargo: "" }],
      });
      setShowNovaReuniao(false);
      listarQuery.refetch();
    } catch (error) {
      alert("Erro ao criar reunião");
    }
  };

  const handleIniciarReuniao = async (id: number) => {
    try {
      const result = await iniciarMutation.mutateAsync({ id });
      window.open(result.jitsiLink, "_blank");
      listarQuery.refetch();
    } catch (error) {
      alert("Erro ao iniciar reunião");
    }
  };

  const handleFinalizarReuniao = async (id: number) => {
    const agora = new Date();
    const horaFim = `${String(agora.getHours()).padStart(2, "0")}:${String(agora.getMinutes()).padStart(2, "0")}`;

    try {
      await finalizarMutation.mutateAsync({
        id,
        horaFim,
      });
      listarQuery.refetch();
    } catch (error) {
      alert("Erro ao finalizar reunião");
    }
  };

  const handleDeletarReuniao = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar esta reunião?")) {
      try {
        await deletarMutation.mutateAsync({ id });
        listarQuery.refetch();
      } catch (error) {
        alert("Erro ao deletar reunião");
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: any }> = {
      agendada: { label: "Agendada", variant: "secondary" },
      em_andamento: { label: "Em Andamento", variant: "default" },
      concluida: { label: "Concluída", variant: "outline" },
      cancelada: { label: "Cancelada", variant: "destructive" },
    };
    const config = statusMap[status] || { label: status, variant: "secondary" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reuniões</h1>
        <Dialog open={showNovaReuniao} onOpenChange={setShowNovaReuniao}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Reunião
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Reunião</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título *</label>
                <Input
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ex: Reunião de Estratégia Tributária"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição da reunião"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Data *</label>
                  <Input
                    type="date"
                    value={formData.dataReuniao}
                    onChange={(e) => setFormData({ ...formData, dataReuniao: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Hora</label>
                  <Input
                    type="time"
                    value={formData.horaInicio}
                    onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Local</label>
                <Input
                  value={formData.local}
                  onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                  placeholder="Ex: Sala de Reuniões 1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Participantes</label>
                {formData.participantes.map((p, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-2 mb-2">
                    <Input
                      placeholder="Nome"
                      value={p.nome}
                      onChange={(e) => {
                        const newParticipantes = [...formData.participantes];
                        newParticipantes[idx].nome = e.target.value;
                        setFormData({ ...formData, participantes: newParticipantes });
                      }}
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={p.email}
                      onChange={(e) => {
                        const newParticipantes = [...formData.participantes];
                        newParticipantes[idx].email = e.target.value;
                        setFormData({ ...formData, participantes: newParticipantes });
                      }}
                    />
                    <Input
                      placeholder="Cargo"
                      value={p.cargo}
                      onChange={(e) => {
                        const newParticipantes = [...formData.participantes];
                        newParticipantes[idx].cargo = e.target.value;
                        setFormData({ ...formData, participantes: newParticipantes });
                      }}
                    />
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      participantes: [...formData.participantes, { nome: "", email: "", cargo: "" }],
                    })
                  }
                >
                  + Adicionar Participante
                </Button>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCriarReuniao} disabled={!formData.titulo || !formData.dataReuniao}>
                  Criar Reunião
                </Button>
                <Button variant="outline" onClick={() => setShowNovaReuniao(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Reuniões */}
      <div className="grid gap-4">
        {reunioes.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              Nenhuma reunião criada ainda
            </CardContent>
          </Card>
        ) : (
          reunioes.map((reuniao) => (
            <Card key={reuniao.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{reuniao.titulo}</CardTitle>
                    {reuniao.descricao && <p className="text-sm text-gray-600 mt-1">{reuniao.descricao}</p>}
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(reuniao.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{reuniao.dataReuniao}</span>
                  </div>
                  {reuniao.horaInicio && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>{reuniao.horaInicio}</span>
                    </div>
                  )}
                  {reuniao.local && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{reuniao.local}</span>
                    </div>
                  )}
                  {reuniao.participantes.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span>{reuniao.participantes.length} participantes</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {reuniao.status === "agendada" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleIniciarReuniao(reuniao.id)}
                        className="gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Iniciar Reunião
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowDetalhes(reuniao.id)}
                      >
                        Detalhes
                      </Button>
                    </>
                  )}

                  {reuniao.status === "em_andamento" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleFinalizarReuniao(reuniao.id)}
                        variant="destructive"
                      >
                        Finalizar Reunião
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(reuniao.jitsiLink, "_blank")}
                        className="gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Voltar para Reunião
                      </Button>
                    </>
                  )}

                  {reuniao.status === "concluida" && (
                    <>
                      {reuniao.ataHtml && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => {
                            const win = window.open();
                            if (win) win.document.write(reuniao.ataHtml || "");
                          }}
                        >
                          <FileText className="w-4 h-4" />
                          Ver Ata
                        </Button>
                      )}
                      {reuniao.emailsEnviados.length === 0 && (
                        <Button
                          size="sm"
                          className="gap-2"
                          onClick={() => setShowDetalhes(reuniao.id)}
                        >
                          <Mail className="w-4 h-4" />
                          Enviar Ata
                        </Button>
                      )}
                    </>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeletarReuniao(reuniao.id)}
                  >
                    Deletar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
