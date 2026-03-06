import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  url: string;
  title: string;
  downloadName?: string;
}

export default function PDFViewer({ url, title, downloadName }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const handlePrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages || 1));
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = downloadName || 'documento.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Header com Título */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Button
          onClick={handleDownload}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>

      {/* Controles de Navegação e Zoom */}
      <div className="flex items-center justify-between gap-2 p-3 bg-muted rounded-lg">
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePrevPage}
            disabled={pageNumber <= 1}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <span className="text-sm font-medium px-3 py-1 bg-background rounded">
            {pageNumber} / {numPages || '...'}
          </span>
          <Button
            onClick={handleNextPage}
            disabled={pageNumber >= (numPages || 1)}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium px-3 py-1 bg-background rounded">
            {Math.round(scale * 100)}%
          </span>
          <Button
            onClick={handleZoomIn}
            disabled={scale >= 2}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Visualizador PDF */}
      <div className="border rounded-lg overflow-auto bg-muted/50 flex justify-center p-4" style={{ maxHeight: '600px' }}>
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div className="text-center py-8">Carregando PDF...</div>}
          error={<div className="text-center py-8 text-red-500">Erro ao carregar PDF</div>}
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
          />
        </Document>
      </div>

      {/* Informações */}
      <p className="text-xs text-muted-foreground text-center">
        Use os botões acima para navegar entre páginas e ajustar o zoom
      </p>
    </div>
  );
}
