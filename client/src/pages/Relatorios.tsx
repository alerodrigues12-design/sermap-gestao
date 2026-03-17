import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, BarChart3, TrendingDown } from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CORES = {
  verde: "#4a5a3a",
  laranja: "#E8650A",
  vermelho: "#C0392B",
  verdeclaro: "#A5D6A7",
  cinza: "#2C2C2C",
};

const dadosBarras = [
  {
    frente: "Tributário",
    atual: 4284477.30,
    proposta: 413899.85,
  },
  {
    frente: "Trabalhista",
    atual: 2041128.75,
    proposta: 1020564.38,
  },
  {
    frente: "Bancário",
    atual: 607786.48,
    proposta: 60778.65,
  },
];

const dadosPizza = [
  { name: "Tributário (61,8%)", value: 4284477.30 },
  { name: "Trabalhista (29,4%)", value: 2041128.75 },
  { name: "Bancário (8,8%)", value: 607786.48 },
];

const dadosLinhas = [
  { frente: "Tributário", atual: 4284477.30, proposta: 413899.85 },
  { frente: "Trabalhista", atual: 2041128.75, proposta: 1020564.38 },
  { frente: "Bancário", atual: 607786.48, proposta: 60778.65 },
];

const dadosEconomia = [
  { name: "Tributário (74,4%)", value: 3870577.45 },
  { name: "Trabalhista (50,0%)", value: 1020564.37 },
  { name: "Bancário (90,0%)", value: 547007.83 },
];

const coresPizza = [CORES.verde, CORES.laranja, "#FF6B6B"];
const coresEconomia = [CORES.verde, CORES.laranja, CORES.verdeclaro];

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
}

function CustomTooltip(props: any) {
  const { active, payload } = props;
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
        <p className="text-sm font-semibold text-slate-900">
          {payload[0].payload.frente || payload[0].payload.name}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatarMoeda(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function Relatorios() {
  const urlDebitos = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663297073580/QRocqBLPZQCEIOMt.pdf";
  const urlProposta = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663297073580/tCSIJkGThwnnfRdg.pdf";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Relatórios de Débitos e Liquidação
          </h1>
          <p className="text-lg text-slate-600">
            Dashboard interativo com análise completa do passivo e proposta de liquidação estratégica.
          </p>
        </div>

        {/* Resumo Executivo - Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="pt-6">
              <p className="text-red-700 font-medium text-sm mb-1">Passivo Total Atual</p>
              <p className="text-3xl font-bold text-red-900">R$ 7,5M</p>
              <p className="text-xs text-red-600 mt-2">49 processos + PGFN</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-6">
              <p className="text-green-700 font-medium text-sm mb-1">Proposta de Liquidação</p>
              <p className="text-3xl font-bold text-green-900">R$ 1,7M</p>
              <p className="text-xs text-green-600 mt-2">Cenário favorável</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="pt-6">
              <p className="text-orange-700 font-medium text-sm mb-1">Economia Estimada</p>
              <p className="text-3xl font-bold text-orange-900">R$ 5,2M</p>
              <p className="text-xs text-orange-600 mt-2">~75% de redução</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Barras */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Passivo Atual vs Proposta</CardTitle>
              <CardDescription>Comparação por frente de atuação</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosBarras}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="frente" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="atual" fill={CORES.vermelho} name="Passivo Atual" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="proposta" fill={CORES.verdeclaro} name="Proposta" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pizza - Composição do Passivo */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Composição do Passivo Atual</CardTitle>
              <CardDescription>Distribuição por frente (R$ 7,5M)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosPizza}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosPizza.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={coresPizza[index]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatarMoeda(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Linhas */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Trajetória de Redução</CardTitle>
              <CardDescription>Passivo atual vs proposta por frente</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosLinhas}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="frente" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="atual"
                    stroke={CORES.vermelho}
                    strokeWidth={3}
                    name="Passivo Atual"
                    dot={{ fill: CORES.vermelho, r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="proposta"
                    stroke={CORES.verdeclaro}
                    strokeWidth={3}
                    name="Proposta"
                    dot={{ fill: CORES.verdeclaro, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pizza - Economia por Frente */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Distribuição da Economia</CardTitle>
              <CardDescription>Economia estimada (R$ 5,2M)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosEconomia}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosEconomia.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={coresEconomia[index]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatarMoeda(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tabela Resumida */}
        <Card className="shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Resumo por Frente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-300 bg-slate-100">
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Frente</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-900">Passivo Atual</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-900">Proposta</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-900">Economia</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-900">Redução %</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">Tributário</td>
                    <td className="text-right py-3 px-4 text-red-600 font-semibold">R$ 4.284.477</td>
                    <td className="text-right py-3 px-4 text-green-600 font-semibold">R$ 413.900</td>
                    <td className="text-right py-3 px-4 text-orange-600 font-semibold">R$ 3.870.577</td>
                    <td className="text-right py-3 px-4 font-bold text-orange-700">~85%</td>
                  </tr>
                  <tr className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">Trabalhista</td>
                    <td className="text-right py-3 px-4 text-red-600 font-semibold">R$ 2.041.129</td>
                    <td className="text-right py-3 px-4 text-green-600 font-semibold">R$ 1.020.564</td>
                    <td className="text-right py-3 px-4 text-orange-600 font-semibold">R$ 1.020.564</td>
                    <td className="text-right py-3 px-4 font-bold text-orange-700">~50%</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">Bancário</td>
                    <td className="text-right py-3 px-4 text-red-600 font-semibold">R$ 607.786</td>
                    <td className="text-right py-3 px-4 text-green-600 font-semibold">R$ 60.779</td>
                    <td className="text-right py-3 px-4 text-orange-600 font-semibold">R$ 547.008</td>
                    <td className="text-right py-3 px-4 font-bold text-orange-700">~90%</td>
                  </tr>
                  <tr className="border-t-2 border-slate-400 bg-slate-100">
                    <td className="py-3 px-4 font-bold text-slate-900">TOTAL</td>
                    <td className="text-right py-3 px-4 text-red-700 font-bold">R$ 6.933.393</td>
                    <td className="text-right py-3 px-4 text-green-700 font-bold">R$ 1.495.243</td>
                    <td className="text-right py-3 px-4 text-orange-700 font-bold">R$ 5.438.150</td>
                    <td className="text-right py-3 px-4 font-bold text-orange-800">~78%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Downloads */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-2 border-blue-200 bg-blue-50 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <div>
                  <CardTitle>Relatório Consolidado de Débitos</CardTitle>
                  <CardDescription>Mapeamento completo do passivo</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 mb-4">
                Documento detalhado com todos os 49 processos judiciais (22 trabalhistas, 26 cíveis) e passivo tributário PGFN. 
                Inclui números, status, risco e observações por processo.
              </p>
              <Button
                onClick={() => window.open(urlDebitos, "_blank")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-green-50 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-green-600" />
                <div>
                  <CardTitle>Proposta de Liquidação Bilíngue</CardTitle>
                  <CardDescription>Estratégia com dashboard visual</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 mb-4">
                Documento bilíngue (Português + English) com gráficos interativos, cenários de negociação e próximos passos 
                para tributário, trabalhista e bancário. Pronto para apresentação aos fundos.
              </p>
              <Button
                onClick={() => window.open(urlProposta, "_blank")}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Notas */}
        <Card className="bg-amber-50 border-2 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-900">Informações Importantes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-amber-800">
              <li className="flex gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>Os valores apresentados são estimativas baseadas nas condições de mercado de março/2026.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>A Proposta de Liquidação é bilíngue para apresentação aos fundos internacionais.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>Os resultados efetivos dependerão do andamento das teses judiciais e negociações com credores.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>Estes documentos são de uso exclusivo da administração da SERMAP e não devem ser compartilhados com terceiros.</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
