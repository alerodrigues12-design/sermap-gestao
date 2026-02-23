import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, FileText, Trash2, Download, Lock, Plus, Eye, EyeOff, KeyRound, AlertCircle, X, Maximize2, Printer, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
              <Button variant="outline" size="sm" onClick={() => window.open(viewingDoc.fileUrl, "_blank")} className="gap-2">
                <Download className="h-4 w-4" />
                Baixar Arquivo
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

  return (
    <div className="space-y-6">
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
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/emails'} className="text-muted-foreground gap-2">
            <Mail className="h-3.5 w-3.5" />
            E-mails Importantes
          </Button>
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

      {/* Documents Grid */}
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
                      <Lock className="h-2.5 w-2.5 mr-1" />
                      Confidencial
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
                        <Eye className="h-2.5 w-2.5 mr-1" />
                        Visualizar
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {doc.fileUrl && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => window.open(doc.fileUrl!, "_blank")}>
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => {
                      if (confirm("Tem certeza que deseja excluir este documento?")) {
                        deleteMutation.mutate({ id: doc.id });
                      }
                    }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
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
