import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Trash2, Download, Plus, Eye, EyeOff, Lock, AlertCircle, X, Maximize2, Printer, Calendar, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Emails() {
  const { user } = useAuth();
  const [viewingEmail, setViewingEmail] = useState<any>(null);
  const [filtroRemetente, setFiltroRemetente] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string | undefined>();

  const { data: emails, isLoading, refetch } = trpc.emails.list.useQuery();
  const createMutation = trpc.emails.create.useMutation({
    onSuccess: () => {
      toast.success("E-mail adicionado com sucesso!");
      refetch();
      setDialogOpen(false);
      resetForm();
    },
    onError: (err) => {
      toast.error("Erro ao adicionar e-mail: " + err.message);
    },
  });
  const uploadMutation = trpc.emails.uploadWithFile.useMutation({
    onSuccess: () => {
      toast.success("E-mail com arquivo enviado com sucesso!");
      refetch();
      setDialogOpen(false);
      resetForm();
    },
    onError: (err) => {
      toast.error("Erro ao enviar e-mail: " + err.message);
    },
  });
  const deleteMutation = trpc.emails.delete.useMutation({
    onSuccess: () => {
      toast.success("E-mail removido.");
      refetch();
    },
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [remetente, setRemetente] = useState("");
  const [destinatario, setDestinatario] = useState("");
  const [assunto, setAssunto] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [categoria, setCategoria] = useState<"proposta" | "contrato" | "comunicacao" | "importante" | "outros">("comunicacao");
  const [dataEmail, setDataEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setRemetente("");
    setDestinatario("");
    setAssunto("");
    setConteudo("");
    setCategoria("comunicacao");
    setDataEmail("");
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleCreate = async () => {
    if (!remetente || !destinatario || !assunto || !conteudo || !dataEmail) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        await uploadMutation.mutateAsync({
          remetente,
          destinatario,
          assunto,
          conteudo,
          categoria,
          dataEmail,
          fileBase64: base64,
          fileName: file.name,
          mimeType: file.type,
        });
      };
      reader.readAsDataURL(file);
    } else {
      await createMutation.mutateAsync({
        remetente,
        destinatario,
        assunto,
        conteudo,
        categoria,
        dataEmail,
      });
    }
  };

  const isAdmin = user?.role === "admin";

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full text-center p-8">
          <Lock className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold font-serif">Acesso Restrito</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Esta seção contém e-mails confidenciais e está disponível apenas para administradores autorizados.
          </p>
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
    proposta: "Proposta",
    contrato: "Contrato",
    comunicacao: "Comunicação",
    importante: "Importante",
    outros: "Outros",
  };

  const categoriaColors: Record<string, string> = {
    proposta: "bg-blue-50 text-blue-700 border-blue-200",
    contrato: "bg-emerald-50 text-emerald-700 border-emerald-200",
    comunicacao: "bg-purple-50 text-purple-700 border-purple-200",
    importante: "bg-red-50 text-red-700 border-red-200",
    outros: "bg-gray-50 text-gray-700 border-gray-200",
  };

  // Viewing an email
  if (viewingEmail) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => setViewingEmail(null)} className="gap-2">
            <X className="h-4 w-4" />
            Voltar aos E-mails
          </Button>
          <div className="flex items-center gap-2">
            {viewingEmail.arquivoUrl && (
              <Button variant="outline" size="sm" onClick={() => window.open(viewingEmail.arquivoUrl, "_blank")} className="gap-2">
                <Download className="h-4 w-4" />
                Baixar Arquivo
              </Button>
            )}
          </div>
        </div>

        <Card className="overflow-hidden shadow-lg">
          <div className="bg-[#4a5a3a] text-white px-6 py-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5" />
              <div>
                <h2 className="font-serif font-semibold">{viewingEmail.assunto}</h2>
                <p className="text-sm opacity-80 mt-0.5">De: {viewingEmail.remetente} → Para: {viewingEmail.destinatario}</p>
              </div>
            </div>
          </div>
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {viewingEmail.dataEmail}
              </div>
              <Badge variant="outline" className={`${categoriaColors[viewingEmail.categoria] || ''}`}>
                {categoriaLabels[viewingEmail.categoria] || viewingEmail.categoria}
              </Badge>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Conteúdo:</p>
              <div className="bg-muted/50 p-4 rounded-lg whitespace-pre-wrap text-sm leading-relaxed">
                {viewingEmail.conteudo}
              </div>
            </div>
            {viewingEmail.arquivoUrl && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Arquivo Anexado:</p>
                <Button variant="outline" size="sm" onClick={() => window.open(viewingEmail.arquivoUrl, "_blank")} className="gap-2">
                  <Download className="h-4 w-4" />
                  {viewingEmail.arquivoKey?.split("/").pop() || "Baixar Arquivo"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter emails
  let filteredEmails = emails || [];
  if (filtroRemetente) {
    filteredEmails = filteredEmails.filter(e => e.remetente.toLowerCase().includes(filtroRemetente.toLowerCase()));
  }
  if (filtroCategoria) {
    filteredEmails = filteredEmails.filter(e => e.categoria === filtroCategoria);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif flex items-center gap-2">
            <Mail className="h-7 w-7 text-[#4a5a3a]" />
            E-mails Importantes
          </h1>
          <p className="text-muted-foreground mt-1">
            Correspondência importante entre Alessandra e Sheila
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#4a5a3a] hover:bg-[#3d4d2f]">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar E-mail
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-serif">Adicionar Novo E-mail</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Remetente *</Label>
                  <Input value={remetente} onChange={(e) => setRemetente(e.target.value)} placeholder="Ex: sheila@sermap.com" />
                </div>
                <div>
                  <Label>Destinatário *</Label>
                  <Input value={destinatario} onChange={(e) => setDestinatario(e.target.value)} placeholder="Ex: ale@consultoria.com" />
                </div>
              </div>
              <div>
                <Label>Assunto *</Label>
                <Input value={assunto} onChange={(e) => setAssunto(e.target.value)} placeholder="Assunto do e-mail" />
              </div>
              <div>
                <Label>Data do E-mail *</Label>
                <Input type="date" value={dataEmail} onChange={(e) => setDataEmail(e.target.value)} />
              </div>
              <div>
                <Label>Categoria</Label>
                <Select value={categoria} onValueChange={(v: any) => setCategoria(v)}>
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
              <div>
                <Label>Conteúdo *</Label>
                <Textarea value={conteudo} onChange={(e) => setConteudo(e.target.value)} placeholder="Corpo do e-mail" rows={6} />
              </div>
              <div>
                <Label>Arquivo (opcional)</Label>
                <Input ref={fileRef} type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} accept=".pdf,.doc,.docx,.jpg,.png,.eml" />
                <p className="text-xs text-muted-foreground mt-1">Máximo 10MB. Formatos: PDF, DOC, DOCX, JPG, PNG, EML</p>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleCreate} disabled={createMutation.isPending || uploadMutation.isPending} className="bg-[#4a5a3a] hover:bg-[#3d4d2f]">
                {createMutation.isPending || uploadMutation.isPending ? "Salvando..." : "Adicionar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3">
        <Lock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Área de Acesso Restrito</p>
          <p className="text-sm text-amber-700 mt-1">
            Os e-mails armazenados aqui são visíveis apenas para administradores (Sheila e Ale). 
            Conselheiros com acesso ao site não conseguem visualizar esta seção.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label className="text-sm">Filtrar por Remetente</Label>
          <Input 
            placeholder="Nome ou e-mail" 
            value={filtroRemetente} 
            onChange={(e) => setFiltroRemetente(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm">Filtrar por Categoria</Label>
          <Select value={filtroCategoria || "all"} onValueChange={(v) => setFiltroCategoria(v === "all" ? undefined : v as any)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
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

      {/* Emails List */}
      {(!filteredEmails || filteredEmails.length === 0) ? (
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
                      <p className="text-xs text-muted-foreground mt-0.5">
                        <span className="font-medium">{email.remetente}</span> → {email.destinatario}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{email.dataEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className={`text-[10px] ${email.categoria ? categoriaColors[email.categoria] : ''}`}>
                      {email.categoria ? categoriaLabels[email.categoria] : email.categoria}
                    </Badge>
                    {email.arquivoUrl && (
                      <Badge variant="outline" className="text-[10px] border-[#4a5a3a]/30 text-[#4a5a3a]">
                        <Download className="h-2.5 w-2.5 mr-1" />
                        Arquivo
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Tem certeza que deseja excluir este e-mail?")) {
                        deleteMutation.mutate({ id: email.id });
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
