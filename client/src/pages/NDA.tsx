import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText, Download, Printer } from "lucide-react";
import jsPDF from "jspdf";

interface NDAData {
  receptorNome: string;
  receptorCPFCNPJ: string;
  receptorEndereco: string;
  finalidade: string;
  prazo: string;
  multa: string;
  local: string;
  data: string;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "____ de ____________ de ______";
  const [year, month, day] = dateStr.split("-");
  const months = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
  ];
  return `${day} de ${months[parseInt(month) - 1]} de ${year}`;
}

export default function NDA() {
  const [form, setForm] = useState<NDAData>({
    receptorNome: "",
    receptorCPFCNPJ: "",
    receptorEndereco: "",
    finalidade: "avaliar uma possível parceria comercial",
    prazo: "3",
    multa: "50.000,00",
    local: "Feira de Santana",
    data: new Date().toISOString().split("T")[0],
  });

  const previewRef = useRef<HTMLDivElement>(null);

  const handleChange = (field: keyof NDAData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleDownloadPDF = async () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;

    const addText = (text: string, options: {
      fontSize?: number;
      bold?: boolean;
      align?: "left" | "center" | "right";
      indent?: number;
      color?: [number, number, number];
    } = {}) => {
      const { fontSize = 11, bold = false, align = "left", indent = 0, color = [0, 0, 0] } = options;
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setTextColor(...color);
      const x = margin + indent;
      const maxWidth = contentWidth - indent;
      const lines = doc.splitTextToSize(text, maxWidth);
      if (y + lines.length * (fontSize * 0.4) > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        y = 20;
      }
      doc.text(lines, x, y, { align: align === "center" ? "center" : "left", maxWidth });
      y += lines.length * (fontSize * 0.45) + 2;
    };

    const addSpace = (mm = 4) => { y += mm; };

    // Título
    addText("ACORDO DE CONFIDENCIALIDADE", { fontSize: 16, bold: true, align: "center" });
    addText("Acordo de Não Divulgação (NDA)", { fontSize: 12, align: "center", color: [100, 100, 100] });
    addSpace(6);

    // Linha separadora
    doc.setDrawColor(180, 180, 180);
    doc.line(margin, y, pageWidth - margin, y);
    addSpace(6);

    // Partes
    addText("ENTRE:", { bold: true });
    addSpace(2);
    addText("PARTE DIVULGADORA: SERMAP ENGENHARIA LTDA", { bold: true });
    addText("Pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 34.060.681/0001-03, com sede na Av. Deputado Luís Eduardo Magalhães, s/n, Quadra J, Lote 04B, Bairro Limoeiro, Feira de Santana/BA, CEP 44.097-324, doravante denominada DIVULGADORA.");
    addSpace(3);
    addText(`PARTE RECEPTORA: ${form.receptorNome || "[NOME COMPLETO]"}`, { bold: true });
    if (form.receptorCPFCNPJ) addText(`CPF/CNPJ: ${form.receptorCPFCNPJ}`);
    if (form.receptorEndereco) addText(`Endereço: ${form.receptorEndereco}`);
    addText("doravante denominado(a) RECEPTOR.");
    addSpace(3);
    addText("As partes acima celebram este Acordo de Confidencialidade (\"Acordo\") nos seguintes termos:");
    addSpace(4);

    // Cláusulas
    const clausulas = [
      {
        titulo: "1. INFORMAÇÃO CONFIDENCIAL",
        texto: "1.1. \"Informação Confidencial\" é toda informação revelada pela DIVULGADORA ao RECEPTOR, seja em formato escrito, oral ou eletrônico, que não seja de conhecimento público. Isso inclui, mas não se limita a: segredos comerciais, dados técnicos, financeiros, planos de negócios, informações de clientes e a própria existência deste Acordo."
      },
      {
        titulo: "2. OBRIGAÇÕES DO RECEPTOR",
        texto: `2.1. O RECEPTOR concorda em:\n\na) Manter a Informação Confidencial em estrito sigilo.\nb) Usar a Informação Confidencial apenas para a finalidade de: ${form.finalidade || "[FINALIDADE]"}.\nc) Não divulgar a Informação Confidencial a terceiros sem autorização prévia e por escrito da DIVULGADORA.\nd) Ao término da relação entre as partes, devolver ou destruir todo o material contendo a Informação Confidencial.`
      },
      {
        titulo: "3. PRAZO",
        texto: `3.1. A obrigação de sigilo permanecerá em vigor por ${form.prazo || "3"} (${form.prazo || "3"}) anos a partir da data de assinatura deste Acordo.`
      },
      {
        titulo: "4. PENALIDADES",
        texto: `4.1. A quebra deste Acordo sujeitará o RECEPTOR ao pagamento de multa no valor de R$ ${form.multa || "50.000,00"}, além da responsabilidade por perdas e danos.`
      },
      {
        titulo: "5. FORO",
        texto: `5.1. Fica eleito o foro de ${form.local || "Feira de Santana"} para resolver quaisquer disputas relacionadas a este Acordo.`
      }
    ];

    for (const clausula of clausulas) {
      addText(clausula.titulo, { bold: true, fontSize: 12 });
      addSpace(1);
      addText(clausula.texto);
      addSpace(4);
    }

    // Assinaturas
    doc.setDrawColor(180, 180, 180);
    doc.line(margin, y, pageWidth - margin, y);
    addSpace(6);
    addText(`${form.local || "Feira de Santana"}, ${formatDate(form.data)}.`);
    addSpace(10);

    // Linhas de assinatura
    const col1 = margin;
    const col2 = pageWidth / 2 + 5;
    const sigWidth = contentWidth / 2 - 10;

    doc.setDrawColor(0, 0, 0);
    doc.line(col1, y, col1 + sigWidth, y);
    doc.line(col2, y, col2 + sigWidth, y);
    addSpace(3);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("SERMAP ENGENHARIA LTDA", col1, y);
    doc.text(form.receptorNome || "[NOME DA PARTE RECEPTORA]", col2, y);
    addSpace(4);

    doc.setFont("helvetica", "normal");
    doc.text("(PARTE DIVULGADORA)", col1, y);
    doc.text("(PARTE RECEPTORA)", col2, y);

    doc.save(`NDA_SERMAP_${(form.receptorNome || "receptor").replace(/\s+/g, "_")}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Painel de formulário */}
      <div className="w-80 shrink-0">
        <Card className="sticky top-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-[#8B6914]" />
              Preencha os dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="receptorNome">Nome do Receptor</Label>
              <Input
                id="receptorNome"
                placeholder="Ex: João Silva"
                value={form.receptorNome}
                onChange={e => handleChange("receptorNome", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="receptorCPFCNPJ">CPF/CNPJ do Receptor</Label>
              <Input
                id="receptorCPFCNPJ"
                placeholder="Ex: 123.456.789-00"
                value={form.receptorCPFCNPJ}
                onChange={e => handleChange("receptorCPFCNPJ", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="receptorEndereco">Endereço do Receptor</Label>
              <Input
                id="receptorEndereco"
                placeholder="Ex: Rua das Flores, 123"
                value={form.receptorEndereco}
                onChange={e => handleChange("receptorEndereco", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="finalidade">Finalidade</Label>
              <Textarea
                id="finalidade"
                placeholder="Descreva a finalidade da divulgação"
                value={form.finalidade}
                onChange={e => handleChange("finalidade", e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prazo">Prazo de Sigilo (anos)</Label>
              <Input
                id="prazo"
                type="number"
                min="1"
                max="20"
                value={form.prazo}
                onChange={e => handleChange("prazo", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="multa">Multa por Violação (R$)</Label>
              <Input
                id="multa"
                placeholder="Ex: 50.000,00"
                value={form.multa}
                onChange={e => handleChange("multa", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="local">Local</Label>
              <Input
                id="local"
                placeholder="Ex: Feira de Santana"
                value={form.local}
                onChange={e => handleChange("local", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={form.data}
                onChange={e => handleChange("data", e.target.value)}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Button
                className="w-full bg-[#8B6914] hover:bg-[#7a5c10] text-white"
                onClick={handleDownloadPDF}
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar PDF
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visualização do documento */}
      <div className="flex-1 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Visualização do Documento</h2>
          <Button
            className="bg-[#8B6914] hover:bg-[#7a5c10] text-white"
            onClick={handleDownloadPDF}
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar PDF
          </Button>
        </div>

        <div
          ref={previewRef}
          className="bg-white text-gray-900 shadow-lg rounded-lg p-12 max-w-3xl mx-auto print:shadow-none print:rounded-none"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif", lineHeight: "1.7" }}
        >
          {/* Cabeçalho */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-wide uppercase mb-1">
              ACORDO DE CONFIDENCIALIDADE
            </h1>
            <p className="text-gray-500 text-sm">Acordo de Não Divulgação (NDA)</p>
          </div>

          <hr className="border-gray-300 mb-6" />

          {/* Partes */}
          <div className="mb-6">
            <p className="font-bold mb-3">ENTRE:</p>

            <p className="mb-1">
              <strong>PARTE DIVULGADORA: SERMAP ENGENHARIA LTDA</strong>
            </p>
            <p className="text-sm mb-4">
              Pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 34.060.681/0001-03,
              com sede na Av. Deputado Luís Eduardo Magalhães, s/n, Quadra J, Lote 04B, Bairro
              Limoeiro, Feira de Santana/BA, CEP 44.097-324, doravante denominada{" "}
              <strong>DIVULGADORA</strong>.
            </p>

            <p className="mb-1">
              <strong>
                PARTE RECEPTORA:{" "}
                {form.receptorNome ? (
                  <span className="text-[#8B6914]">{form.receptorNome}</span>
                ) : (
                  <span className="text-gray-400 italic">[NOME COMPLETO]</span>
                )}
              </strong>
            </p>
            {form.receptorCPFCNPJ && (
              <p className="text-sm">CPF/CNPJ: <span className="text-[#8B6914]">{form.receptorCPFCNPJ}</span></p>
            )}
            {form.receptorEndereco && (
              <p className="text-sm mb-1">Endereço: <span className="text-[#8B6914]">{form.receptorEndereco}</span></p>
            )}
            <p className="text-sm mb-4">doravante denominado(a) <strong>RECEPTOR</strong>.</p>

            <p className="text-sm">
              As partes acima celebram este Acordo de Confidencialidade ("Acordo") nos seguintes termos:
            </p>
          </div>

          {/* Cláusulas */}
          <div className="space-y-5 text-sm">
            <div>
              <h3 className="font-bold text-base mb-2">1. INFORMAÇÃO CONFIDENCIAL</h3>
              <p>
                1.1. "Informação Confidencial" é toda informação revelada pela DIVULGADORA ao RECEPTOR,
                seja em formato escrito, oral ou eletrônico, que não seja de conhecimento público. Isso
                inclui, mas não se limita a: segredos comerciais, dados técnicos, financeiros, planos de
                negócios, informações de clientes e a própria existência deste Acordo.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-base mb-2">2. OBRIGAÇÕES DO RECEPTOR</h3>
              <p className="mb-2">2.1. O RECEPTOR concorda em:</p>
              <ul className="space-y-1 ml-4">
                <li>a) Manter a Informação Confidencial em estrito sigilo.</li>
                <li>
                  b) Usar a Informação Confidencial apenas para a finalidade de:{" "}
                  <em className="text-[#8B6914]">{form.finalidade || "[FINALIDADE]"}</em>.
                </li>
                <li>
                  c) Não divulgar a Informação Confidencial a terceiros sem autorização prévia e por
                  escrito da DIVULGADORA.
                </li>
                <li>
                  d) Ao término da relação entre as partes, devolver ou destruir todo o material
                  contendo a Informação Confidencial.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-base mb-2">3. PRAZO</h3>
              <p>
                3.1. A obrigação de sigilo permanecerá em vigor por{" "}
                <strong className="text-[#8B6914]">{form.prazo || "3"}</strong> (
                {form.prazo || "3"}) anos a partir da data de assinatura deste Acordo.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-base mb-2">4. PENALIDADES</h3>
              <p>
                4.1. A quebra deste Acordo sujeitará o RECEPTOR ao pagamento de multa no valor de{" "}
                <strong className="text-[#8B6914]">R$ {form.multa || "50.000,00"}</strong>, além da
                responsabilidade por perdas e danos.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-base mb-2">5. FORO</h3>
              <p>
                5.1. Fica eleito o foro de{" "}
                <strong className="text-[#8B6914]">{form.local || "Feira de Santana"}</strong> para
                resolver quaisquer disputas relacionadas a este Acordo.
              </p>
            </div>
          </div>

          {/* Assinaturas */}
          <hr className="border-gray-300 my-8" />

          <p className="text-sm mb-10">
            Por estarem de acordo, as partes assinam o presente em duas vias de igual teor.
          </p>

          <p className="text-sm mb-12">
            {form.local || "Feira de Santana"}, {formatDate(form.data)}.
          </p>

          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <div className="border-t border-gray-800 pt-3">
                <p className="font-bold text-sm">SERMAP ENGENHARIA LTDA</p>
                <p className="text-xs text-gray-500">(PARTE DIVULGADORA)</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-gray-800 pt-3">
                <p className="font-bold text-sm">
                  {form.receptorNome ? (
                    <span className="text-[#8B6914]">{form.receptorNome}</span>
                  ) : (
                    <span className="text-gray-400 italic">[NOME DA PARTE RECEPTORA]</span>
                  )}
                </p>
                <p className="text-xs text-gray-500">(PARTE RECEPTORA)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
