import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, FileText, Trash2, Download, Lock, Plus, Eye, EyeOff, KeyRound, AlertCircle, X, Maximize2, Printer, Mail, PenLine, CheckCircle2, Loader2, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";

export default function Documentos() {
  const { user } = useAuth();
  const [unlocked, setUnlocked] = useState(false);
  const [docPassword, setDocPassword] = useState("");
  const [showDocPassword, setShowDocPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<any>(null);

  const { data: documentos, isLoading, refetch } = trpc.documentos.list.useQuery(undefined, {
    enabled: unlocked,
  });
  const uploadMutation = trpc.documentos.upload.useMutation({
    onSuccess: () => {
      toast.success("Documento enviado com sucesso!");
      refetch();
      setDialogOpen(false);
      resetForm();
    },
    onError: (err) => {
      toast.error("Erro ao enviar documento: " + err.message);
    },
  });
  const deleteMutation = trpc.documentos.delete.useMutation({
    onSuccess: () => {
      toast.success("Documento removido.");
      refetch();
    },
  });
  const verifyPasswordMutation = trpc.documentos.verifyPassword.useMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState<"contrato" | "honorarios" | "procuracao" | "outros">("contrato");
  const [confidencial, setConfidencial] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ─── E-mails Importantes (integrado) ─────────────────────────────────────
  const [viewingEmail, setViewingEmail] = useState<any>(null);
  const [filtroRemetente, setFiltroRemetente] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string | undefined>();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [remetente, setRemetente] = useState("");
  const [destinatario, setDestinatario] = useState("");
  const [assunto, setAssunto] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [emailCategoria, setEmailCategoria] = useState<"proposta" | "contrato" | "comunicacao" | "importante" | "outros">("comunicacao");
  const [dataEmail, setDataEmail] = useState("");
  const [emailFile, setEmailFile] = useState<File | null>(null);
  const emailFileRef = useRef<HTMLInputElement>(null);

  const { data: emails, isLoading: emailsLoading, refetch: refetchEmails } = trpc.emails.list.useQuery(undefined, { enabled: unlocked });
  const createEmailMutation = trpc.emails.create.useMutation({
    onSuccess: () => { toast.success("E-mail adicionado!"); refetchEmails(); setEmailDialogOpen(false); resetEmailForm(); },
    onError: (err) => toast.error("Erro: " + err.message),
  });
  const uploadEmailMutation = trpc.emails.uploadWithFile.useMutation({
    onSuccess: () => { toast.success("E-mail com arquivo enviado!"); refetchEmails(); setEmailDialogOpen(false); resetEmailForm(); },
    onError: (err) => toast.error("Erro: " + err.message),
  });
  const deleteEmailMutation = trpc.emails.delete.useMutation({
    onSuccess: () => { toast.success("E-mail removido."); refetchEmails(); },
  });

  const resetEmailForm = () => {
    setRemetente(""); setDestinatario(""); setAssunto(""); setConteudo("");
    setEmailCategoria("comunicacao"); setDataEmail(""); setEmailFile(null);
    if (emailFileRef.current) emailFileRef.current.value = "";
  };

  const handleCreateEmail = async () => {
    if (!remetente || !destinatario || !assunto || !conteudo || !dataEmail) {
      toast.error("Preencha todos os campos obrigatórios."); return;
    }
    if (emailFile) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        await uploadEmailMutation.mutateAsync({ remetente, destinatario, assunto, conteudo, categoria: emailCategoria, dataEmail, fileBase64: base64, fileName: emailFile.name, mimeType: emailFile.type });
      };
      reader.readAsDataURL(emailFile);
    } else {
      await createEmailMutation.mutateAsync({ remetente, destinatario, assunto, conteudo, categoria: emailCategoria, dataEmail });
    }
  };

  const emailCategoriaLabels: Record<string, string> = { proposta: "Proposta", contrato: "Contrato", comunicacao: "Comunicação", importante: "Importante", outros: "Outros" };
  const emailCategoriaColors: Record<string, string> = { proposta: "bg-blue-50 text-blue-700 border-blue-200", contrato: "bg-emerald-50 text-emerald-700 border-emerald-200", comunicacao: "bg-purple-50 text-purple-700 border-purple-200", importante: "bg-red-50 text-red-700 border-red-200", outros: "bg-gray-50 text-gray-700 border-gray-200" };

  // Autentique
  const [autentiqueDialog, setAutentiqueDialog] = useState(false);
  const [autentiqueDoc, setAutentiqueDoc] = useState<any>(null);
  const [signatarios, setSignatarios] = useState([{ nome: "", email: "", acao: "SIGN" as const }]);
  const enviarAutentiqueMutation = trpc.governanca.enviarNdaAutentique.useMutation({
    onSuccess: () => {
      toast.success("Documento enviado para assinatura via Autentique! Os signatários receberão o link por e-mail.");
      setAutentiqueDialog(false);
      setSignatarios([{ nome: "", email: "", acao: "SIGN" }]);
    },
    onError: (err: any) => {
      toast.error("Erro ao enviar para Autentique: " + err.message);
    },
  });

  const resetForm = () => {
    setTitulo("");
    setDescricao("");
    setCategoria("contrato");
    setConfidencial(true);
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!file || !titulo) {
      toast.error("Preencha o título e selecione um arquivo.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 10MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      await uploadMutation.mutateAsync({
        titulo,
        descricao: descricao || undefined,
        categoria,
        confidencial,
        fileBase64: base64,
        fileName: file.name,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setVerifying(true);

    try {
      await verifyPasswordMutation.mutateAsync({ password: docPassword });
      setUnlocked(true);
      toast.success("Acesso liberado aos documentos confidenciais.");
    } catch (err: any) {
      setPasswordError("Senha incorreta. Tente novamente.");
    } finally {
      setVerifying(false);
    }
  };

  const handlePrint = useCallback((htmlContent: string, titulo: string) => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }, []);

  const isAdmin = user?.role === "admin";

  // Non-admin users see restricted message
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full text-center p-8">
          <Lock className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold font-serif">Acesso Restrito</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Esta seção contém documentos confidenciais e está disponível apenas para administradores autorizados.
          </p>
        </Card>
      </div>
    );
  }

  // Password gate for admin users
  if (!unlocked) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full shadow-lg border-0">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[#4a5a3a]/10 flex items-center justify-center mx-auto mb-4">
                <KeyRound className="h-8 w-8 text-[#4a5a3a]" />
              </div>
              <h2 className="text-xl font-semibold font-serif">Documentos Confidenciais</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Esta área requer uma senha adicional para acesso.
              </p>
            </div>

            <form onSubmit={handleVerifyPassword} className="space-y-4">
              {passwordError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {passwordError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="doc-password" className="text-sm font-medium">
                  Senha dos Documentos
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="doc-password"
                    type={showDocPassword ? "text" : "password"}
                    value={docPassword}
                    onChange={(e) => setDocPassword(e.target.value)}
                    placeholder="Digite a senha de acesso"
                    className="pl-10 pr-10 h-11"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowDocPassword(!showDocPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showDocPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={verifying}
                className="w-full h-11 bg-[#4a5a3a] hover:bg-[#3d4d2f]"
              >
                {verifying ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verificando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Acessar Documentos
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const categoriaLabels: Record<string, string> = {
    contrato: "Contrato",
    honorarios: "Honorários",
    procuracao: "Procuração",
    outros: "Outros",
  };

  const categoriaColors: Record<string, string> = {
    contrato: "bg-blue-50 text-blue-700 border-blue-200",
    honorarios: "bg-emerald-50 text-emerald-700 border-emerald-200",
    procuracao: "bg-purple-50 text-purple-700 border-purple-200",
    outros: "bg-gray-50 text-gray-700 border-gray-200",
  };

  // Viewing a document inline
  if (viewingDoc) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => setViewingDoc(null)} className="gap-2">
            <X className="h-4 w-4" />
            Voltar aos Documentos
          </Button>
          <div className="flex items-center gap-2">
            {viewingDoc.htmlContent && (
              <Button variant="outline" size="sm" onClick={() => handlePrint(viewingDoc.htmlContent, viewingDoc.titulo)} className="gap-2">
                <Printer className="h-4 w-4" />
                Imprimir / PDF
              </Button>
            )}
            {viewingDoc.fileUrl && (
              <Button variant="outline" size="sm" onClick={() => window.open(viewingDoc.fileUrl!, "_blank")} className="gap-2">
                <Download className="h-4 w-4" />
                Baixar Arquivo
              </Button>
            )}
            {(viewingDoc.fileUrl || viewingDoc.htmlContent) && (
              <Button
                size="sm"
                className="gap-2 bg-[#4a5a3a] hover:bg-[#3d4d2f]"
                onClick={() => {
                  setAutentiqueDoc(viewingDoc);
                  setSignatarios([{ nome: "", email: "", acao: "SIGN" }]);
                  setAutentiqueDialog(true);
                }}
              >
                <PenLine className="h-4 w-4" />
                Enviar para Assinatura
              </Button>
            )}
          </div>
        </div>

        <Card className="overflow-hidden shadow-lg">
          <div className="bg-[#4a5a3a] text-white px-6 py-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5" />
              <div>
                <h2 className="font-serif font-semibold">{viewingDoc.titulo}</h2>
                {viewingDoc.descricao && <p className="text-sm opacity-80 mt-0.5">{viewingDoc.descricao}</p>}
              </div>
            </div>
          </div>
          <CardContent className="p-0">
            {viewingDoc.htmlContent ? (
              <iframe
                srcDoc={viewingDoc.htmlContent}
                className="w-full border-0"
                style={{ minHeight: "80vh" }}
                title={viewingDoc.titulo}
                sandbox="allow-same-origin"
              />
            ) : viewingDoc.fileUrl ? (
              <div className="p-12 text-center">
                <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Este documento é um arquivo externo.</p>
                <Button className="mt-4 bg-[#4a5a3a] hover:bg-[#3d4d2f]" onClick={() => window.open(viewingDoc.fileUrl, "_blank")}>
                  <Download className="h-4 w-4 mr-2" />
                  Abrir Arquivo
                </Button>
              </div>
            ) : (
              <div className="p-12 text-center">
                <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum conteúdo disponível para visualização.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEnviarAutentique = () => {
    if (!autentiqueDoc) return;
    const signatariosValidos = signatarios.filter(s => s.nome && s.email);
    if (signatariosValidos.length === 0) {
      toast.error("Adicione pelo menos um signatário com nome e e-mail.");
      return;
    }
    enviarAutentiqueMutation.mutate({
      nomeDocumento: autentiqueDoc.titulo,
      pdfUrl: autentiqueDoc.fileUrl || "",
      signatarios: signatariosValidos,
      mensagem: `Por favor, assine o documento "${autentiqueDoc.titulo}" enviado pela SERMAP Engenharia / Hoffmann & Fioretto Consultoria.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Dialog Autentique */}
      <Dialog open={autentiqueDialog} onOpenChange={setAutentiqueDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2">
              <PenLine className="h-5 w-5 text-[#4a5a3a]" />
              Enviar para Assinatura Eletrônica
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-[#4a5a3a]/10 border border-[#4a5a3a]/20 rounded-lg">
              <p className="text-sm font-medium text-[#4a5a3a]">{autentiqueDoc?.titulo}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Será enviado via Autentique para assinatura eletrônica com validade jurídica (MP 2.200-2/2001)</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Signatários</Label>
                <Button variant="outline" size="sm" className="gap-1 h-7 text-xs" onClick={() => setSignatarios(s => [...s, { nome: "", email: "", acao: "SIGN" }])}>
                  <UserPlus className="h-3 w-3" />
                  Adicionar
                </Button>
              </div>
              {signatarios.map((sig, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-2 p-3 border border-border rounded-lg">
                  <div>
                    <Label className="text-xs text-muted-foreground">Nome</Label>
                    <Input
                      value={sig.nome}
                      onChange={e => setSignatarios(s => s.map((x, i) => i === idx ? { ...x, nome: e.target.value } : x))}
                      placeholder="Nome completo"
                      className="h-8 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">E-mail</Label>
                    <Input
                      type="email"
                      value={sig.email}
                      onChange={e => setSignatarios(s => s.map((x, i) => i === idx ? { ...x, email: e.target.value } : x))}
                      placeholder="email@exemplo.com"
                      className="h-8 text-sm mt-1"
                    />
                  </div>
                  {signatarios.length > 1 && (
                    <div className="col-span-2 flex justify-end">
                      <Button variant="ghost" size="sm" className="h-6 text-xs text-destructive" onClick={() => setSignatarios(s => s.filter((_, i) => i !== idx))}>
                        Remover
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              onClick={handleEnviarAutentique}
              disabled={enviarAutentiqueMutation.isPending}
              className="bg-[#4a5a3a] hover:bg-[#3d4d2f] gap-2"
            >
              {enviarAutentiqueMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Enviando...</>
              ) : (
                <><CheckCircle2 className="h-4 w-4" />Enviar para Assinatura</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif flex items-center gap-2">
            <Shield className="h-7 w-7 text-[#4a5a3a]" />
            Documentos Confidenciais
          </h1>
          <p className="text-muted-foreground mt-1">
            Área restrita para contratos, honorários e documentos sensíveis
          </p>
        </div>
        <div className="flex items-center gap-2">

          <Button variant="outline" size="sm" onClick={() => setUnlocked(false)} className="text-muted-foreground">
            <Lock className="h-3.5 w-3.5 mr-1.5" />
            Bloquear
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#4a5a3a] hover:bg-[#3d4d2f]">
                <Plus className="h-4 w-4 mr-2" />
                Enviar Documento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-serif">Enviar Novo Documento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Título *</Label>
                  <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Contrato de Honorários" />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Breve descrição do documento" />
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select value={categoria} onValueChange={(v: any) => setCategoria(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contrato">Contrato</SelectItem>
                      <SelectItem value="honorarios">Honorários</SelectItem>
                      <SelectItem value="procuracao">Procuração</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={confidencial} onCheckedChange={setConfidencial} />
                  <Label className="text-sm">Documento confidencial (visível apenas para admin)</Label>
                </div>
                <div>
                  <Label>Arquivo *</Label>
                  <Input ref={fileRef} type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} accept=".pdf,.doc,.docx,.jpg,.png" />
                  <p className="text-xs text-muted-foreground mt-1">Máximo 10MB. Formatos: PDF, DOC, DOCX, JPG, PNG</p>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button onClick={handleUpload} disabled={uploadMutation.isPending} className="bg-[#4a5a3a] hover:bg-[#3d4d2f]">
                  {uploadMutation.isPending ? "Enviando..." : "Enviar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3">
        <Lock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Área de Acesso Restrito</p>
          <p className="text-sm text-amber-700 mt-1">
            Os documentos marcados como confidenciais são visíveis apenas para administradores (Sheila e Ale). 
            Conselheiros com acesso ao site não conseguem visualizar esta seção.
          </p>
        </div>
      </div>

      {/* Tabs: Documentos + E-mails */}
      <Tabs defaultValue="documentos">
        <TabsList className="mb-4">
          <TabsTrigger value="documentos" className="gap-2"><FileText className="h-4 w-4" />Documentos</TabsTrigger>
          <TabsTrigger value="emails" className="gap-2"><Mail className="h-4 w-4" />E-mails Importantes</TabsTrigger>
        </TabsList>

        {/* ── Aba Documentos ── */}
        <TabsContent value="documentos">
          {(!documentos || documentos.length === 0) ? (
            <Card className="text-center p-12">
              <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium">Nenhum documento cadastrado</h3>
              <p className="text-sm text-muted-foreground mt-1">Clique em "Enviar Documento" para adicionar contratos e documentos.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documentos.map((doc) => (
                <Card key={doc.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group border-l-4"
                  style={{ borderLeftColor: doc.categoria === "contrato" ? "#3b82f6" : doc.categoria === "honorarios" ? "#10b981" : doc.categoria === "procuracao" ? "#8b5cf6" : "#6b7280" }}
                  onClick={() => setViewingDoc(doc)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#4a5a3a]/10 flex items-center justify-center shrink-0 mt-0.5">
                          <FileText className="h-5 w-5 text-[#4a5a3a]" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold group-hover:text-[#4a5a3a] transition-colors">{doc.titulo}</h4>
                          {doc.descricao && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{doc.descricao}</p>}
                        </div>
                      </div>
                      {doc.confidencial && (
                        <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-600 shrink-0 ml-2">
                          <Lock className="h-2.5 w-2.5 mr-1" />Confidencial
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] ${categoriaColors[doc.categoria ?? 'outros'] || ''}`}>
                          {categoriaLabels[doc.categoria ?? 'outros'] || doc.categoria}
                        </Badge>
                        {doc.htmlContent && (
                          <Badge variant="outline" className="text-[10px] border-[#4a5a3a]/30 text-[#4a5a3a]">
                            <Eye className="h-2.5 w-2.5 mr-1" />Visualizar
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {doc.fileUrl && (
                          <>
                            <Button variant="ghost" size="sm" className="h-8 px-2 gap-1 text-[10px] text-[#4a5a3a] hover:bg-[#4a5a3a]/10"
                              title="Enviar para assinatura via Autentique"
                              onClick={() => { setAutentiqueDoc(doc); setSignatarios([{ nome: "", email: "", acao: "SIGN" }]); setAutentiqueDialog(true); }}>
                              <PenLine className="h-3 w-3" />Assinar
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => window.open(doc.fileUrl!, "_blank")}>
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => { if (confirm("Excluir este documento?")) deleteMutation.mutate({ id: doc.id }); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Aba E-mails Importantes ── */}
        <TabsContent value="emails">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <p className="text-sm text-muted-foreground">Correspondência importante entre Alessandra e Sheila</p>
              <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#4a5a3a] hover:bg-[#3d4d2f]" size="sm">
                    <Plus className="h-4 w-4 mr-2" />Adicionar E-mail
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader><DialogTitle className="font-serif">Adicionar Novo E-mail</DialogTitle></DialogHeader>
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>Remetente *</Label><Input value={remetente} onChange={(e) => setRemetente(e.target.value)} placeholder="Ex: sheila@sermap.com" /></div>
                      <div><Label>Destinatário *</Label><Input value={destinatario} onChange={(e) => setDestinatario(e.target.value)} placeholder="Ex: ale@consultoria.com" /></div>
                    </div>
                    <div><Label>Assunto *</Label><Input value={assunto} onChange={(e) => setAssunto(e.target.value)} placeholder="Assunto do e-mail" /></div>
                    <div><Label>Data do E-mail *</Label><Input type="date" value={dataEmail} onChange={(e) => setDataEmail(e.target.value)} /></div>
                    <div>
                      <Label>Categoria</Label>
                      <Select value={emailCategoria} onValueChange={(v: any) => setEmailCategoria(v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="proposta">Proposta</SelectItem>
                          <SelectItem value="contrato">Contrato</SelectItem>
                          <SelectItem value="comunicacao">Comunicação</SelectItem>
                          <SelectItem value="importante">Importante</SelectItem>
                          <SelectItem value="outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>Conteúdo *</Label><Textarea value={conteudo} onChange={(e) => setConteudo(e.target.value)} placeholder="Corpo do e-mail" rows={6} /></div>
                    <div>
                      <Label>Arquivo (opcional)</Label>
                      <Input ref={emailFileRef} type="file" onChange={(e) => setEmailFile(e.target.files?.[0] || null)} accept=".pdf,.doc,.docx,.jpg,.png,.eml" />
                      <p className="text-xs text-muted-foreground mt-1">Máximo 10MB. Formatos: PDF, DOC, DOCX, JPG, PNG, EML</p>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                    <Button onClick={handleCreateEmail} disabled={createEmailMutation.isPending || uploadEmailMutation.isPending} className="bg-[#4a5a3a] hover:bg-[#3d4d2f]">
                      {createEmailMutation.isPending || uploadEmailMutation.isPending ? "Salvando..." : "Adicionar"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Filtrar por Remetente</Label>
                <Input placeholder="Nome ou e-mail" value={filtroRemetente} onChange={(e) => setFiltroRemetente(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm">Filtrar por Categoria</Label>
                <Select value={filtroCategoria || "all"} onValueChange={(v) => setFiltroCategoria(v === "all" ? undefined : v as any)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Todas as categorias" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    <SelectItem value="proposta">Proposta</SelectItem>
                    <SelectItem value="contrato">Contrato</SelectItem>
                    <SelectItem value="comunicacao">Comunicação</SelectItem>
                    <SelectItem value="importante">Importante</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Lista de e-mails */}
            {emailsLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />)}</div>
            ) : (() => {
              const filteredEmails = (emails || []).filter(e =>
                (!filtroRemetente || e.remetente.toLowerCase().includes(filtroRemetente.toLowerCase())) &&
                (!filtroCategoria || e.categoria === filtroCategoria)
              );
              return filteredEmails.length === 0 ? (
                <Card className="text-center p-12">
                  <Mail className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Nenhum e-mail cadastrado</h3>
                  <p className="text-sm text-muted-foreground mt-1">Clique em "Adicionar E-mail" para incluir correspondência importante.</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredEmails.map((email) => (
                    <Card key={email.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4"
                      style={{ borderLeftColor: email.categoria === "proposta" ? "#3b82f6" : email.categoria === "contrato" ? "#10b981" : email.categoria === "importante" ? "#ef4444" : email.categoria === "comunicacao" ? "#8b5cf6" : "#6b7280" }}
                      onClick={() => setViewingEmail(email)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-[#4a5a3a]/10 flex items-center justify-center shrink-0 mt-0.5">
                              <Mail className="h-5 w-5 text-[#4a5a3a]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold truncate hover:text-[#4a5a3a] transition-colors">{email.assunto}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5"><span className="font-medium">{email.remetente}</span> → {email.destinatario}</p>
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Calendar className="h-3 w-3" />{email.dataEmail}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="outline" className={`text-[10px] ${email.categoria ? emailCategoriaColors[email.categoria] : ''}`}>
                              {email.categoria ? emailCategoriaLabels[email.categoria] : email.categoria}
                            </Badge>
                            {email.arquivoUrl && (
                              <Badge variant="outline" className="text-[10px] border-[#4a5a3a]/30 text-[#4a5a3a]">
                                <Download className="h-2.5 w-2.5 mr-1" />Arquivo
                              </Badge>
                            )}
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={(e) => { e.stopPropagation(); if (confirm("Excluir este e-mail?")) deleteEmailMutation.mutate({ id: email.id }); }}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              );
            })()}

            {/* Visualizar e-mail */}
            {viewingEmail && (
              <Dialog open={!!viewingEmail} onOpenChange={(open) => !open && setViewingEmail(null)}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="font-serif flex items-center gap-2">
                      <Mail className="h-5 w-5 text-[#4a5a3a]" />{viewingEmail.assunto}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="text-muted-foreground">De: <span className="font-medium text-foreground">{viewingEmail.remetente}</span></span>
                      <span className="text-muted-foreground">Para: <span className="font-medium text-foreground">{viewingEmail.destinatario}</span></span>
                      <span className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{viewingEmail.dataEmail}</span>
                      <Badge variant="outline" className={`text-[10px] ${emailCategoriaColors[viewingEmail.categoria] || ''}`}>
                        {emailCategoriaLabels[viewingEmail.categoria] || viewingEmail.categoria}
                      </Badge>
                    </div>
                    <div className="border-t pt-4">
                      <div className="bg-muted/50 p-4 rounded-lg whitespace-pre-wrap text-sm leading-relaxed">{viewingEmail.conteudo}</div>
                    </div>
                    {viewingEmail.arquivoUrl && (
                      <div className="border-t pt-4">
                        <Button variant="outline" size="sm" onClick={() => window.open(viewingEmail.arquivoUrl, "_blank")} className="gap-2">
                          <Download className="h-4 w-4" />{viewingEmail.arquivoKey?.split("/").pop() || "Baixar Arquivo"}
                        </Button>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
