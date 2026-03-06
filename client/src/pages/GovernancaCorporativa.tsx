import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  FileText,
  Calendar,
  ClipboardList,
  PenLine,
  Plus,
  Trash2,
  Send,
  ExternalLink,
  Video,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Download,
  Eye,
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

function statusDocBadge(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    rascunho: { label: "Rascunho", className: "bg-gray-100 text-gray-700" },
    em_aprovacao: { label: "Em Aprovação", className: "bg-yellow-100 text-yellow-800" },
    aprovado: { label: "Aprovado", className: "bg-green-100 text-green-800" },
    arquivado: { label: "Arquivado", className: "bg-slate-100 text-slate-600" },
  };
  const s = map[status] || { label: status, className: "bg-gray-100 text-gray-600" };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.className}`}>{s.label}</span>;
}

function statusReuniaBadge(status: string) {
  const map: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
    agendada: { label: "Agendada", icon: <Clock className="w-3 h-3" />, className: "bg-blue-100 text-blue-800" },
    em_andamento: { label: "Em Andamento", icon: <AlertCircle className="w-3 h-3" />, className: "bg-yellow-100 text-yellow-800" },
    concluida: { label: "Concluída", icon: <CheckCircle2 className="w-3 h-3" />, className: "bg-green-100 text-green-800" },
    cancelada: { label: "Cancelada", icon: <XCircle className="w-3 h-3" />, className: "bg-red-100 text-red-800" },
  };
  const s = map[status] || { label: status, icon: null, className: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${s.className}`}>
      {s.icon} {s.label}
    </span>
  );
}

function tipoDocLabel(tipo: string) {
  const map: Record<string, string> = {
    politica: "Política",
    procedimento: "Procedimento",
    norma: "Norma",
    resolucao: "Resolução",
    estatuto: "Estatuto",
    regimento: "Regimento",
    outro: "Outro",
  };
  return map[tipo] || tipo;
}

// ─── Aba Documentos ──────────────────────────────────────────────────────────

function AbaDocumentos() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();

  const { data: documentos = [], isLoading } = trpc.governanca.documentos.list.useQuery();

  const [showForm, setShowForm] = useState(false);
  const [showEnviarForm, setShowEnviarForm] = useState<number | null>(null);
  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    tipo: "politica" as const,
    status: "rascunho" as const,
    documentoUrl: "",
    responsavel: "Alessandra Hoffmann",
    dataCriacao: new Date().toISOString().split("T")[0],
  });
  const [signatarios, setSignatarios] = useState([{ nome: "", email: "", acao: "SIGN" as const }]);
  const [mensagemEnvio, setMensagemEnvio] = useState("");

  const createMutation = trpc.governanca.documentos.create.useMutation({
    onSuccess: () => {
      utils.governanca.documentos.list.invalidate();
      setShowForm(false);
      setForm({ titulo: "", descricao: "", tipo: "politica", status: "rascunho", documentoUrl: "", responsavel: "Alessandra Hoffmann", dataCriacao: new Date().toISOString().split("T")[0] });
      toast.success("Documento criado com sucesso!");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.governanca.documentos.delete.useMutation({
    onSuccess: () => {
      utils.governanca.documentos.list.invalidate();
      toast.success("Documento excluído.");
    },
    onError: (e) => toast.error(e.message),
  });

  const enviarMutation = trpc.governanca.documentos.enviarParaAssinatura.useMutation({
    onSuccess: (data) => {
      utils.governanca.documentos.list.invalidate();
      setShowEnviarForm(null);
      toast.success("Documento enviado para assinatura! Emails enviados aos signatários.");
    },
    onError: (e) => toast.error("Erro ao enviar: " + e.message),
  });

  const addSignatario = () => setSignatarios([...signatarios, { nome: "", email: "", acao: "SIGN" }]);
  const removeSignatario = (i: number) => setSignatarios(signatarios.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{documentos.length} documento(s) cadastrado(s)</p>
        {isAdmin && (
          <Button size="sm" onClick={() => setShowForm(true)} className="bg-emerald-700 hover:bg-emerald-800 text-white">
            <Plus className="w-4 h-4 mr-1" /> Novo Documento
          </Button>
        )}
      </div>

      {/* Formulário de criação */}
      {showForm && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-emerald-800">Novo Documento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Título *</Label>
                <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Ex: Política de Governança" />
              </div>
              <div>
                <Label>Tipo *</Label>
                <Select value={form.tipo} onValueChange={(v: any) => setForm({ ...form, tipo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["politica", "procedimento", "norma", "resolucao", "estatuto", "regimento", "outro"].map((t) => (
                      <SelectItem key={t} value={t}>{tipoDocLabel(t)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>URL do Documento (PDF)</Label>
                <Input value={form.documentoUrl} onChange={(e) => setForm({ ...form, documentoUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <Label>Responsável</Label>
                <Input value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white"
                onClick={() => createMutation.mutate({ ...form, versao: 1 })}
                disabled={!form.titulo || createMutation.isPending}>
                {createMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-400 text-center py-8">Carregando documentos...</p>
      ) : documentos.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum documento cadastrado ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documentos.map((doc) => (
            <Card key={doc.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900">{doc.titulo}</span>
                      {statusDocBadge(doc.status)}
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{tipoDocLabel(doc.tipo)}</span>
                      <span className="text-xs text-gray-400">v{doc.versao}</span>
                    </div>
                    {doc.descricao && <p className="text-sm text-gray-500 mt-1">{doc.descricao}</p>}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>Criado: {doc.dataCriacao}</span>
                      {doc.responsavel && <span>Resp: {doc.responsavel}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {doc.documentoUrl && (
                      <a href={doc.documentoUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="h-8 px-2">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </a>
                    )}
                    {isAdmin && doc.documentoUrl && (
                      <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 text-white px-2"
                        onClick={() => { setShowEnviarForm(doc.id); setSignatarios([{ nome: "", email: "", acao: "SIGN" }]); }}>
                        <Send className="w-3.5 h-3.5 mr-1" /> Assinar
                      </Button>
                    )}
                    {isAdmin && (
                      <Button variant="outline" size="sm" className="h-8 px-2 text-red-500 hover:text-red-700"
                        onClick={() => deleteMutation.mutate({ id: doc.id })}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Formulário de envio para assinatura */}
                {showEnviarForm === doc.id && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                    <p className="text-sm font-medium text-blue-800">Enviar para assinatura via Autentique</p>
                    {signatarios.map((sig, i) => (
                      <div key={i} className="grid grid-cols-3 gap-2 items-end">
                        <div>
                          <Label className="text-xs">Nome</Label>
                          <Input className="h-8 text-sm" value={sig.nome}
                            onChange={(e) => { const s = [...signatarios]; s[i].nome = e.target.value; setSignatarios(s); }} />
                        </div>
                        <div>
                          <Label className="text-xs">Email *</Label>
                          <Input className="h-8 text-sm" type="email" value={sig.email}
                            onChange={(e) => { const s = [...signatarios]; s[i].email = e.target.value; setSignatarios(s); }} />
                        </div>
                        <div className="flex gap-1">
                          <Select value={sig.acao} onValueChange={(v: any) => { const s = [...signatarios]; s[i].acao = v; setSignatarios(s); }}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SIGN">Assinar</SelectItem>
                              <SelectItem value="APPROVE">Aprovar</SelectItem>
                              <SelectItem value="SIGN_AS_A_WITNESS">Testemunha</SelectItem>
                            </SelectContent>
                          </Select>
                          {i > 0 && (
                            <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => removeSignatario(i)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addSignatario} className="text-xs">
                      <Plus className="w-3 h-3 mr-1" /> Adicionar signatário
                    </Button>
                    <div>
                      <Label className="text-xs">Mensagem (opcional)</Label>
                      <Textarea className="text-sm" rows={2} value={mensagemEnvio}
                        onChange={(e) => setMensagemEnvio(e.target.value)}
                        placeholder="Mensagem personalizada para os signatários..." />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => setShowEnviarForm(null)}>Cancelar</Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={enviarMutation.isPending || signatarios.some(s => !s.email)}
                        onClick={() => enviarMutation.mutate({
                          documentoId: doc.id,
                          signatarios: signatarios.filter(s => s.email),
                          mensagem: mensagemEnvio || undefined,
                        })}>
                        {enviarMutation.isPending ? "Enviando..." : <><Send className="w-3.5 h-3.5 mr-1" /> Enviar para Autentique</>}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Aba Reuniões ────────────────────────────────────────────────────────────

function AbaReunioes() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();

  const { data: reunioes = [], isLoading } = trpc.governanca.reunioes.list.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [selectedReuniao, setSelectedReuniao] = useState<number | null>(null);
  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    dataReuniao: "",
    horaReuniao: "10:00",
    local: "",
    linkGoogleMeet: "",
    responsavel: "Alessandra Hoffmann",
  });

  const createMutation = trpc.governanca.reunioes.create.useMutation({
    onSuccess: () => {
      utils.governanca.reunioes.list.invalidate();
      setShowForm(false);
      setForm({ titulo: "", descricao: "", dataReuniao: "", horaReuniao: "10:00", local: "", linkGoogleMeet: "", responsavel: "Alessandra Hoffmann" });
      toast.success("Reunião agendada com sucesso!");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.governanca.reunioes.update.useMutation({
    onSuccess: () => {
      utils.governanca.reunioes.list.invalidate();
      toast.success("Reunião atualizada!");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.governanca.reunioes.delete.useMutation({
    onSuccess: () => {
      utils.governanca.reunioes.list.invalidate();
      toast.success("Reunião excluída.");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{reunioes.length} reunião(ões) cadastrada(s)</p>
        {isAdmin && (
          <Button size="sm" onClick={() => setShowForm(true)} className="bg-emerald-700 hover:bg-emerald-800 text-white">
            <Plus className="w-4 h-4 mr-1" /> Agendar Reunião
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-emerald-800">Nova Reunião</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Título *</Label>
              <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Ex: Reunião de Governança - Março 2026" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Data *</Label>
                <Input type="date" value={form.dataReuniao} onChange={(e) => setForm({ ...form, dataReuniao: e.target.value })} />
              </div>
              <div>
                <Label>Horário *</Label>
                <Input type="time" value={form.horaReuniao} onChange={(e) => setForm({ ...form, horaReuniao: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Local</Label>
                <Input value={form.local} onChange={(e) => setForm({ ...form, local: e.target.value })} placeholder="Ex: Sede SERMAP / Online" />
              </div>
              <div>
                <Label>Link Google Meet</Label>
                <Input value={form.linkGoogleMeet} onChange={(e) => setForm({ ...form, linkGoogleMeet: e.target.value })} placeholder="https://meet.google.com/..." />
              </div>
            </div>
            <div>
              <Label>Descrição / Pauta</Label>
              <Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} rows={3} placeholder="Descreva a pauta da reunião..." />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white"
                onClick={() => createMutation.mutate(form)}
                disabled={!form.titulo || !form.dataReuniao || createMutation.isPending}>
                {createMutation.isPending ? "Salvando..." : "Agendar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-400 text-center py-8">Carregando reuniões...</p>
      ) : reunioes.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Nenhuma reunião agendada ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reunioes.map((r) => (
            <Card key={r.id} className={`hover:shadow-sm transition-shadow ${r.status === "concluida" ? "opacity-75" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900">{r.titulo}</span>
                      {statusReuniaBadge(r.status)}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {r.dataReuniao} às {r.horaReuniao}
                      </span>
                      {r.local && <span>{r.local}</span>}
                    </div>
                    {r.descricao && <p className="text-sm text-gray-500 mt-1">{r.descricao}</p>}
                    {r.linkGoogleMeet && (
                      <a href={r.linkGoogleMeet} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:text-blue-800">
                        <Video className="w-3.5 h-3.5" /> Entrar no Google Meet
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-2 shrink-0">
                      {r.status === "agendada" && (
                        <Button size="sm" variant="outline" className="h-8 text-xs"
                          onClick={() => updateMutation.mutate({ id: r.id, status: "concluida" })}>
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Concluir
                        </Button>
                      )}
                      <Button variant="outline" size="sm" className="h-8 px-2 text-red-500 hover:text-red-700"
                        onClick={() => deleteMutation.mutate({ id: r.id })}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Aba Atas ────────────────────────────────────────────────────────────────

function AbaAtas() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();

  const { data: reunioes = [] } = trpc.governanca.reunioes.list.useQuery();
  const [selectedReuniaoId, setSelectedReuniaoId] = useState<number | null>(null);
  const { data: atas = [], isLoading } = trpc.governanca.atas.list.useQuery(
    { reuniaoId: selectedReuniaoId ?? 0 },
    { enabled: selectedReuniaoId !== null }
  );

  const [showForm, setShowForm] = useState(false);
  const [showEnviarForm, setShowEnviarForm] = useState<{ ataUrl: string; titulo: string } | null>(null);
  const [form, setForm] = useState({
    titulo: "",
    conteudo: "",
    ataUrl: "",
    dataAta: new Date().toISOString().split("T")[0],
    responsavel: "Alessandra Hoffmann",
  });
  const [signatarios, setSignatarios] = useState([{ nome: "", email: "", acao: "SIGN" as const }]);

  const createMutation = trpc.governanca.atas.create.useMutation({
    onSuccess: () => {
      if (selectedReuniaoId) utils.governanca.atas.list.invalidate({ reuniaoId: selectedReuniaoId });
      setShowForm(false);
      setForm({ titulo: "", conteudo: "", ataUrl: "", dataAta: new Date().toISOString().split("T")[0], responsavel: "Alessandra Hoffmann" });
      toast.success("Ata registrada com sucesso!");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.governanca.atas.delete.useMutation({
    onSuccess: () => {
      if (selectedReuniaoId) utils.governanca.atas.list.invalidate({ reuniaoId: selectedReuniaoId });
      toast.success("Ata excluída.");
    },
    onError: (e) => toast.error(e.message),
  });

  const enviarAtaMutation = trpc.governanca.atas.enviarParaAssinatura.useMutation({
    onSuccess: (data) => {
      setShowEnviarForm(null);
      toast.success(`Ata enviada para assinatura! ${data.links?.length || 0} signatário(s) notificado(s).`);
    },
    onError: (e) => toast.error("Erro ao enviar: " + e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-48">
          <Select value={selectedReuniaoId?.toString() ?? ""} onValueChange={(v) => setSelectedReuniaoId(Number(v))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma reunião para ver as atas..." />
            </SelectTrigger>
            <SelectContent>
              {reunioes.map((r) => (
                <SelectItem key={r.id} value={r.id.toString()}>
                  {r.titulo} — {r.dataReuniao}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {isAdmin && selectedReuniaoId && (
          <Button size="sm" onClick={() => setShowForm(true)} className="bg-emerald-700 hover:bg-emerald-800 text-white">
            <Plus className="w-4 h-4 mr-1" /> Nova Ata
          </Button>
        )}
      </div>

      {showForm && selectedReuniaoId && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-emerald-800">Nova Ata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Título *</Label>
                <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Ex: Ata da Reunião de Março 2026" />
              </div>
              <div>
                <Label>Data da Ata *</Label>
                <Input type="date" value={form.dataAta} onChange={(e) => setForm({ ...form, dataAta: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Conteúdo / Deliberações</Label>
              <Textarea value={form.conteudo} onChange={(e) => setForm({ ...form, conteudo: e.target.value })} rows={5}
                placeholder="Registre as deliberações, decisões e encaminhamentos da reunião..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>URL do PDF da Ata (opcional)</Label>
                <Input value={form.ataUrl} onChange={(e) => setForm({ ...form, ataUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <Label>Responsável</Label>
                <Input value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white"
                onClick={() => createMutation.mutate({ ...form, reuniaoId: selectedReuniaoId })}
                disabled={!form.titulo || createMutation.isPending}>
                {createMutation.isPending ? "Salvando..." : "Salvar Ata"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedReuniaoId ? (
        <div className="text-center py-12 text-gray-400">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Selecione uma reunião para visualizar as atas.</p>
        </div>
      ) : isLoading ? (
        <p className="text-sm text-gray-400 text-center py-8">Carregando atas...</p>
      ) : atas.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Nenhuma ata registrada para esta reunião.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {atas.map((ata) => (
            <Card key={ata.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{ata.titulo}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Data: {ata.dataAta} · Resp: {ata.responsavel}</p>
                    {ata.conteudo && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-3">{ata.conteudo}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {ata.ataUrl && (
                      <a href={ata.ataUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="h-8 px-2">
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </a>
                    )}
                    {isAdmin && ata.ataUrl && (
                      <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 text-white px-2"
                        onClick={() => { setShowEnviarForm({ ataUrl: ata.ataUrl!, titulo: ata.titulo }); setSignatarios([{ nome: "", email: "", acao: "SIGN" }]); }}>
                        <PenLine className="w-3.5 h-3.5 mr-1" /> Assinar
                      </Button>
                    )}
                    {isAdmin && (
                      <Button variant="outline" size="sm" className="h-8 px-2 text-red-500 hover:text-red-700"
                        onClick={() => deleteMutation.mutate({ id: ata.id })}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                {showEnviarForm?.titulo === ata.titulo && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                    <p className="text-sm font-medium text-blue-800">Enviar ata para assinatura via Autentique</p>
                    {signatarios.map((sig, i) => (
                      <div key={i} className="grid grid-cols-3 gap-2 items-end">
                        <div>
                          <Label className="text-xs">Nome</Label>
                          <Input className="h-8 text-sm" value={sig.nome}
                            onChange={(e) => { const s = [...signatarios]; s[i].nome = e.target.value; setSignatarios(s); }} />
                        </div>
                        <div>
                          <Label className="text-xs">Email *</Label>
                          <Input className="h-8 text-sm" type="email" value={sig.email}
                            onChange={(e) => { const s = [...signatarios]; s[i].email = e.target.value; setSignatarios(s); }} />
                        </div>
                        <div className="flex gap-1">
                          <Select value={sig.acao} onValueChange={(v: any) => { const s = [...signatarios]; s[i].acao = v; setSignatarios(s); }}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SIGN">Assinar</SelectItem>
                              <SelectItem value="APPROVE">Aprovar</SelectItem>
                              <SelectItem value="SIGN_AS_A_WITNESS">Testemunha</SelectItem>
                            </SelectContent>
                          </Select>
                          {i > 0 && (
                            <Button variant="outline" size="sm" className="h-8 px-2"
                              onClick={() => setSignatarios(signatarios.filter((_, idx) => idx !== i))}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => setSignatarios([...signatarios, { nome: "", email: "", acao: "SIGN" }])} className="text-xs">
                      <Plus className="w-3 h-3 mr-1" /> Adicionar signatário
                    </Button>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => setShowEnviarForm(null)}>Cancelar</Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={enviarAtaMutation.isPending || signatarios.some(s => !s.email)}
                        onClick={() => enviarAtaMutation.mutate({
                          ataUrl: showEnviarForm.ataUrl,
                          tituloAta: showEnviarForm.titulo,
                          signatarios: signatarios.filter(s => s.email),
                        })}>
                        {enviarAtaMutation.isPending ? "Enviando..." : <><Send className="w-3.5 h-3.5 mr-1" /> Enviar para Autentique</>}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Aba Assinaturas ─────────────────────────────────────────────────────────

function AbaAssinaturas() {
  const { data: documentos = [] } = trpc.governanca.documentos.list.useQuery();
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const { data: assinaturas = [], isLoading } = trpc.governanca.assinaturas.list.useQuery(
    { documentoId: selectedDocId ?? 0 },
    { enabled: selectedDocId !== null }
  );

  const statusIcon = (status: string) => {
    if (status === "assinado") return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    if (status === "recusado") return <XCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-yellow-500" />;
  };

  const statusLabel = (status: string) => {
    if (status === "assinado") return <span className="text-xs text-green-700 font-medium">Assinado</span>;
    if (status === "recusado") return <span className="text-xs text-red-600 font-medium">Recusado</span>;
    return <span className="text-xs text-yellow-700 font-medium">Pendente</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex-1 min-w-48">
        <Select value={selectedDocId?.toString() ?? ""} onValueChange={(v) => setSelectedDocId(Number(v))}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um documento para ver as assinaturas..." />
          </SelectTrigger>
          <SelectContent>
            {documentos.map((d) => (
              <SelectItem key={d.id} value={d.id.toString()}>
                {d.titulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedDocId ? (
        <div className="text-center py-12 text-gray-400">
          <PenLine className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Selecione um documento para ver o status das assinaturas.</p>
        </div>
      ) : isLoading ? (
        <p className="text-sm text-gray-400 text-center py-8">Carregando assinaturas...</p>
      ) : assinaturas.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <PenLine className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Nenhuma assinatura registrada para este documento.</p>
          <p className="text-xs mt-1">Use o botão "Assinar" na aba Documentos para enviar via Autentique.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {assinaturas.map((ass) => (
            <Card key={ass.id}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {statusIcon(ass.status)}
                    <div>
                      <p className="font-medium text-sm text-gray-900">{ass.signatario}</p>
                      <p className="text-xs text-gray-500">{ass.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {statusLabel(ass.status)}
                    {ass.dataAssinatura && (
                      <span className="text-xs text-gray-400">{ass.dataAssinatura}</span>
                    )}
                    {ass.linkAutentique && (
                      <a href={ass.linkAutentique} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="h-7 text-xs px-2">
                          <ExternalLink className="w-3 h-3 mr-1" /> Link
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Página Principal ────────────────────────────────────────────────────────

export default function GovernancaCorporativa() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Governança Corporativa</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestão de documentos, reuniões, atas e assinaturas eletrônicas via Autentique
          </p>
        </div>
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
          SERMAP Engenharia
        </Badge>
      </div>

      {/* Aviso Autentique */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
        <PenLine className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <div className="text-sm text-blue-800">
          <strong>Integração Autentique ativa</strong> — Documentos, NDAs e atas podem ser enviados para assinatura eletrônica diretamente por esta plataforma.
          A conta vinculada é <strong>consultoria@hoffmannefioretto.com</strong>.
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="documentos">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="documentos" className="flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Documentos</span>
          </TabsTrigger>
          <TabsTrigger value="reunioes" className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Reuniões</span>
          </TabsTrigger>
          <TabsTrigger value="atas" className="flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4" />
            <span className="hidden sm:inline">Atas</span>
          </TabsTrigger>
          <TabsTrigger value="assinaturas" className="flex items-center gap-1.5">
            <PenLine className="w-4 h-4" />
            <span className="hidden sm:inline">Assinaturas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documentos" className="mt-4">
          <AbaDocumentos />
        </TabsContent>
        <TabsContent value="reunioes" className="mt-4">
          <AbaReunioes />
        </TabsContent>
        <TabsContent value="atas" className="mt-4">
          <AbaAtas />
        </TabsContent>
        <TabsContent value="assinaturas" className="mt-4">
          <AbaAssinaturas />
        </TabsContent>
      </Tabs>
    </div>
  );
}
