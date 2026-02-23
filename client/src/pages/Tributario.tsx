import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Landmark, AlertTriangle, Calculator, Info } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function Tributario() {
  const { data: passivo, isLoading: loadingPassivo } = trpc.tributario.passivo.useQuery();
  const { data: simulacoes, isLoading: loadingSimulacoes } = trpc.tributario.simulacoes.useQuery();

  if (loadingPassivo || loadingSimulacoes) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const totalPassivo = (passivo || []).reduce((sum, p) => sum + parseFloat(p.valorTotal || "0"), 0);

  const composicaoData = (passivo || []).flatMap((p) => [
    { name: `Principal (${p.tipo})`, value: parseFloat(p.valorPrincipal || "0"), color: "#4a5a3a" },
    { name: `Multa (${p.tipo})`, value: parseFloat(p.valorMulta || "0"), color: "#c8956c" },
    { name: `Juros (${p.tipo})`, value: parseFloat(p.valorJuros || "0"), color: "#d4553a" },
    { name: `Encargo (${p.tipo})`, value: parseFloat(p.valorEncargo || "0"), color: "#8b7355" },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-serif">Passivo Tributário Federal</h1>
        <p className="text-muted-foreground mt-1">Detalhamento das inscrições em Dívida Ativa da União (PGFN)</p>
      </div>

      {/* Total Banner */}
      <Card className="bg-gradient-to-r from-[#d4553a] to-[#b8432e] text-white border-0">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-white/70 uppercase tracking-wider">Passivo Total Consolidado</p>
              <p className="text-3xl md:text-4xl font-bold mt-1">R$ 4.284.477,30</p>
              <p className="text-sm text-white/60 mt-2">PGFN (IRPJ + CSLL) + Previdenciárias + Não Tributárias</p>
            </div>
            <Landmark className="h-12 w-12 text-white/30" />
          </div>
        </CardContent>
      </Card>

      {/* Composição do Passivo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Composição do Passivo Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-[#d4553a]/10 border border-[#d4553a]/20">
              <p className="text-xs text-muted-foreground uppercase mb-1">PGFN (IRPJ + CSLL)</p>
              <p className="text-xl font-bold text-[#d4553a]">R$ 3.827.799,69</p>
              <p className="text-xs text-muted-foreground mt-1">89,3% do total</p>
            </div>
            <div className="p-4 rounded-lg bg-[#c8956c]/10 border border-[#c8956c]/20">
              <p className="text-xs text-muted-foreground uppercase mb-1">Previdenciárias</p>
              <p className="text-xl font-bold text-[#c8956c]">R$ 398.621,04</p>
              <p className="text-xs text-muted-foreground mt-1">9,3% do total</p>
            </div>
            <div className="p-4 rounded-lg bg-[#4a5a3a]/10 border border-[#4a5a3a]/20">
              <p className="text-xs text-muted-foreground uppercase mb-1">Não Tributárias</p>
              <p className="text-xl font-bold text-[#4a5a3a]">R$ 58.056,57</p>
              <p className="text-xs text-muted-foreground mt-1">1,4% do total</p>
            </div>
            <div className="p-4 rounded-lg bg-muted border border-border">
              <p className="text-xs text-muted-foreground uppercase mb-1">Total Consolidado</p>
              <p className="text-xl font-bold">R$ 4.284.477,30</p>
              <p className="text-xs text-muted-foreground mt-1">100% do passivo</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inscrições PGFN */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-[#d4553a]" />
          Inscrições em Dívida Ativa (PGFN)
        </h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(passivo || []).map((p) => (
          <Card key={p.id} className="overflow-hidden">
            <CardHeader className="bg-muted/50 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-serif">{p.tipo}</CardTitle>
                <Badge variant="destructive" className="text-[10px]">{p.situacao}</Badge>
              </div>
              <p className="text-xs text-muted-foreground font-mono">Inscrição: {p.inscricao}</p>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Valor Total Consolidado</p>
                <p className="text-2xl font-bold text-[#d4553a]">{formatCurrency(parseFloat(p.valorTotal || "0"))}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#4a5a3a]/5">
                  <p className="text-[10px] text-muted-foreground uppercase">Principal</p>
                  <p className="text-sm font-semibold">{formatCurrency(parseFloat(p.valorPrincipal || "0"))}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#c8956c]/10">
                  <p className="text-[10px] text-muted-foreground uppercase">Multa</p>
                  <p className="text-sm font-semibold">{formatCurrency(parseFloat(p.valorMulta || "0"))}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#d4553a]/10">
                  <p className="text-[10px] text-muted-foreground uppercase">Juros</p>
                  <p className="text-sm font-semibold">{formatCurrency(parseFloat(p.valorJuros || "0"))}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-[10px] text-muted-foreground uppercase">Encargo Legal</p>
                  <p className="text-sm font-semibold">{formatCurrency(parseFloat(p.valorEncargo || "0"))}</p>
                </div>
              </div>
              <div className="text-xs space-y-1 text-muted-foreground">
                <p><strong>Receita:</strong> {p.receita}</p>
                <p><strong>Data Inscrição:</strong> {p.dataInscricao}</p>
                <p><strong>Processo Judicial:</strong> <span className="font-mono">{p.processoJudicial}</span></p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Composição do Passivo Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-serif">Composição do Passivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={composicaoData} cx="50%" cy="50%" outerRadius={90} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {composicaoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Simulações de Transação */}
      <div>
        <h2 className="text-xl font-bold font-serif mb-4 flex items-center gap-2">
          <Calculator className="h-5 w-5 text-[#c8956c]" />
          Simulações de Transação Tributária
        </h2>
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 mb-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Situação Atual</p>
            <p className="text-sm text-amber-700 mt-1">
              As simulações abaixo foram realizadas com base no Edital PGDAU N 11/2025, prorrogado pelo Edital PGDAU N 01/2026. 
              No momento, a adesão é <strong>inviável</strong> em razão da situação financeira atual da empresa. 
              A estratégia adotada é a gestão do passivo com proteção patrimonial, avaliando acordos individuais conforme oportunidades surgirem.
            </p>
          </div>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {(simulacoes || []).map((sim) => (
            <AccordionItem key={sim.id} value={`sim-${sim.id}`} className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center gap-3 text-left">
                  <div className={`h-3 w-3 rounded-full ${sim.viavel ? "bg-green-500" : "bg-amber-500"}`} />
                  <div>
                    <p className="text-sm font-medium">{sim.nome}</p>
                    <p className="text-xs text-muted-foreground">{sim.modalidade}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-[10px] text-muted-foreground uppercase">Total sem Desconto</p>
                      <p className="text-sm font-semibold">{formatCurrency(parseFloat(sim.totalSemDesconto || "0"))}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50">
                      <p className="text-[10px] text-green-700 uppercase">Desconto</p>
                      <p className="text-sm font-semibold text-green-700">{formatCurrency(parseFloat(sim.desconto || "0"))}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#4a5a3a]/5">
                      <p className="text-[10px] text-muted-foreground uppercase">Total a Pagar</p>
                      <p className="text-sm font-bold text-[#4a5a3a]">{formatCurrency(parseFloat(sim.totalAPagar || "0"))}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-[10px] text-muted-foreground uppercase">Prestações</p>
                      <p className="text-sm font-semibold">{sim.prestacoes}x</p>
                    </div>
                  </div>
                  {(sim.qtdEntrada ?? 0) > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg border">
                        <p className="text-[10px] text-muted-foreground uppercase">Entrada</p>
                        <p className="text-sm font-semibold">{sim.qtdEntrada}x de {formatCurrency(parseFloat(sim.valorEntrada || "0"))}</p>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <p className="text-[10px] text-muted-foreground uppercase">Parcelas</p>
                        <p className="text-sm font-semibold">{sim.qtdParcelas}x de {formatCurrency(parseFloat(sim.valorParcela || "0"))}</p>
                      </div>
                    </div>
                  )}
                  {(sim.qtdEntrada ?? 0) === 0 && (
                    <div className="p-3 rounded-lg border">
                      <p className="text-[10px] text-muted-foreground uppercase">Parcelas</p>
                      <p className="text-sm font-semibold">{sim.qtdParcelas}x de {formatCurrency(parseFloat(sim.valorParcela || "0"))}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Adesão até: <strong>{sim.dataAdesao}</strong></span>
                    <Badge variant={sim.viavel ? "default" : "secondary"} className={`text-[10px] ${!sim.viavel ? "bg-amber-100 text-amber-700" : ""}`}>
                      {sim.viavel ? "Viável" : "Inviável no momento"}
                    </Badge>
                  </div>
                  {sim.observacoes && (
                    <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">{sim.observacoes}</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
