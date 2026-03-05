import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Download, AlertCircle, CheckCircle2, Lock, LockOpen } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import crypto from 'crypto';

const INVENTARIO_PASSWORD_HASH = '8d969eef6ecad3c29a3a873fba6ee2c47adef46db4d9c0db1da0720b5712384b'; // hash SHA-256 de 'docs26'

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export default function Inventario() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordSubmit = () => {
    const hash = hashPassword(passwordInput);
    if (hash === INVENTARIO_PASSWORD_HASH) {
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('Senha incorreta');
    }
  };

  const pdfUrl = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663297073580/JTtVxoStfcJLEYtl.pdf";

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-2xl">
            <CardHeader className="text-center space-y-2">
              <div className="flex justify-center mb-4">
                <Lock className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Inventário Protegido</CardTitle>
              <p className="text-sm text-muted-foreground">Este documento é restrito. Digite a senha para acessar.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Digite a senha"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                  className="text-center"
                />
                {passwordError && <p className="text-sm text-red-600 mt-2">{passwordError}</p>}
              </div>
              <Button onClick={handlePasswordSubmit} className="w-full" size="lg">
                Acessar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const sections = [
    {
      id: "historico",
      title: "Histórico Processual",
      icon: FileText,
      content: (
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold mb-2">Distribuição e Nomeação</h4>
            <p className="text-muted-foreground">Inventário distribuído em 17 de maio de 2024. Despacho inicial proferido em 11 de junho de 2024, nomeando a inventariante responsável pela administração do espólio.</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Publicação e Prazos</h4>
            <p className="text-muted-foreground">Publicação da nomeação em 10 de julho de 2024. Prazo de 5 dias para assinatura do termo (11 a 17 de julho). Termo de inventariança juntado aos autos em 30 de julho de 2024 (cumprimento tardio).</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Primeiras Declarações</h4>
            <p className="text-muted-foreground">Prazo iniciado em 18 de julho de 2024, com término em 14 de agosto de 2024. Protocoladas apenas em 27 de agosto de 2024 (após o prazo). Incluem indicação de herdeiros, bens do espólio, dívidas e direitos.</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Processo de Testamento</h4>
            <p className="text-muted-foreground">Ação autônoma de abertura e cumprimento de testamento ajuizada durante o inventário. Sentença proferida com trânsito em julgado em 10 de março de 2025. Inventário retomou curso normal após essa definição.</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Andamento Recente</h4>
            <p className="text-muted-foreground">Em 14 de maio de 2025, determinado prosseguimento do inventário com regularização de citações e publicação de edital. Despacho em 01 de outubro de 2025. Cumprimento de diligências registrado em 16 de dezembro de 2025. Certidão de atualização em 08 de janeiro de 2026.</p>
          </div>
        </div>
      )
    },
    {
      id: "sheila",
      title: "Situação de Sheila no Processo",
      icon: CheckCircle2,
      content: (
        <div className="space-y-4 text-sm">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <h4 className="font-semibold text-emerald-900 mb-2">Habilitação Processual</h4>
            <p className="text-emerald-800">Sheila requereu sua habilitação na qualidade de interessada/herdeira para integrar formalmente o polo processual.</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Questão Técnica Resolvida</h4>
            <p className="text-blue-800">Houve erro material no número do CPF informado, gerando inconsistência no cadastro do tribunal. Essa inconsistência foi corrigida para permitir a regular inclusão de Sheila nos autos.</p>
          </div>

          <p className="text-muted-foreground italic">A demora na habilitação decorreu de erro técnico/administrativo do sistema, não de inércia ou negligência da parte. O atraso é meramente processual e não impacta a validade da habilitação.</p>
        </div>
      )
    },
    {
      id: "atrasos",
      title: "Análise de Atrasos Processuais",
      icon: AlertCircle,
      content: (
        <div className="space-y-4 text-sm">
          <div className="space-y-3">
            <div className="border-l-4 border-l-amber-500 pl-4">
              <h4 className="font-semibold">Atraso na Assinatura do Termo</h4>
              <p className="text-muted-foreground">Prazo judicial ultrapassado. Termo juntado apenas após encerramento do prazo concedido.</p>
            </div>

            <div className="border-l-4 border-l-amber-500 pl-4">
              <h4 className="font-semibold">Atraso nas Primeiras Declarações</h4>
              <p className="text-muted-foreground">Protocoladas após término do prazo. Levou à manifestação de herdeiros requerendo providências processuais.</p>
            </div>

            <div className="border-l-4 border-l-amber-500 pl-4">
              <h4 className="font-semibold">Descumprimento Parcial de Determinações</h4>
              <p className="text-muted-foreground">Certidão cartorária registrou que a inventariante não cumpriu integralmente as determinações do despacho inicial.</p>
            </div>

            <div className="border-l-4 border-l-amber-500 pl-4">
              <h4 className="font-semibold">Demora em Diligências Posteriores</h4>
              <p className="text-muted-foreground">Algumas diligências determinadas judicialmente foram cumpridas apenas após período considerável de tempo.</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-amber-900"><strong>Fator Externo:</strong> Parte da demora pode ser atribuída ao processo autônomo de testamento, cuja decisão impactava a sucessão. Inventário retomou curso regular após trânsito em julgado em março de 2025.</p>
          </div>
        </div>
      )
    },
    {
      id: "pendencias",
      title: "Situação Atual e Pendências",
      icon: FileText,
      content: (
        <div className="space-y-4 text-sm">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">Etapas Ainda Pendentes</h4>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Consolidação e saneamento das primeiras declarações</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Regularização completa das citações de herdeiros ou interessados</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Publicação de edital para interessados não localizados</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Definição e regularização da situação fiscal do espólio (ITCMD)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Eventual homologação das primeiras declarações pelo juízo</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Elaboração do plano de partilha</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Manifestação das partes acerca da partilha</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Homologação judicial da partilha</span>
              </li>
            </ul>
          </div>

          <p className="text-muted-foreground italic">Somente após cumprimento dessas etapas será possível proferir sentença de partilha, encerrando o inventário.</p>
        </div>
      )
    },
    {
      id: "consequencias",
      title: "Impactos Jurídicos dos Atrasos",
      icon: AlertCircle,
      content: (
        <div className="space-y-4 text-sm">
          <p className="text-muted-foreground">A demora no andamento de um inventário gera diversos impactos jurídicos e patrimoniais:</p>
          
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">•</span>
              <span>Prolongamento da indisponibilidade dos bens do espólio</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">•</span>
              <span>Atraso na partilha e transferência patrimonial</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">•</span>
              <span>Aumento de custos processuais</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">•</span>
              <span>Incidência de encargos fiscais</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">•</span>
              <span>Intensificação de conflitos entre herdeiros</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">•</span>
              <span>Eventual deterioração ou desvalorização de bens</span>
            </li>
          </ul>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-red-900"><strong>Nota Importante:</strong> Atrasos reiterados no cumprimento de obrigações processuais podem justificar pedido de remoção do inventariante, especialmente quando demonstrada inércia incompatível com o exercício da função.</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif">Inventário Judicial</h1>
          <p className="text-muted-foreground mt-1">Processo nº 8012478-03.2024.8.05.0080 - Vara de Família e Sucessões</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsAuthenticated(false)} className="gap-2">
          <LockOpen className="h-4 w-4" />
          Sair
        </Button>
      </div>

      {/* Resumo Executivo */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
        <CardHeader>
          <CardTitle className="text-blue-900">Resumo Executivo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-blue-900">
          <p>O inventário teve início regular e permanece em tramitação.</p>
          <p>Foram identificados atrasos pontuais relacionados ao cumprimento de prazos e diligências, além de impacto decorrente da existência de ação judicial de cumprimento de testamento.</p>
          <p>Atualmente o processo encontra-se em fase intermediária, dependendo da regularização das etapas processuais e fiscais necessárias para avançar à partilha.</p>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Distribuição</p>
            <p className="text-lg font-bold mt-1">17 de maio de 2024</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Testamento</p>
            <p className="text-lg font-bold mt-1">Trânsito em julgado: 10/03/2025</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
            <Badge className="mt-2 bg-blue-600">Fase Intermediária</Badge>
          </CardContent>
        </Card>
      </div>

      {/* PDF Download */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-semibold text-sm">Processo Completo</p>
              <p className="text-xs text-muted-foreground">PDF com todos os autos e movimentações</p>
            </div>
          </div>
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Baixar PDF
            </Button>
          </a>
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedSection(section.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-base">{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Clique para visualizar detalhes</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedSection} onOpenChange={() => setSelectedSection(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {sections.find((s) => s.id === selectedSection)?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {sections.find((s) => s.id === selectedSection)?.content}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
