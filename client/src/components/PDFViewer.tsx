import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Use local worker bundled with pdfjs-dist v5 (compatible with react-pdf v10)
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

// Helper: wrap CDN URLs through local proxy to avoid CORS issues
function toProxiedUrl(url: string): string {
  if (url.startsWith('https://files.manuscdn.com/')) {
    return `/api/pdf-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}

interface PDFViewerProps {
  url: string;
  title: string;
  downloadName?: string;
}

export default function PDFViewer({ url, title, downloadName }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loadError, setLoadError] = useState<string | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
    setLoadError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error('PDF load error:', error);
    setLoadError(error.message || 'Erro desconhecido');
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
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenExternal = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-4">
      {/* Header com Título */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex gap-2">
          <Button onClick={handleOpenExternal} variant="outline" size="sm" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Abrir em nova aba
          </Button>
          <Button onClick={handleDownload} variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
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
      <div className="border rounded-lg overflow-auto bg-muted/50 flex justify-center p-4" style={{ maxHeight: '650px' }}>
        {loadError ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
            <p className="text-red-500 font-medium">Não foi possível renderizar o PDF no navegador.</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Isso pode ocorrer por restrições de segurança. Use os botões abaixo para acessar o arquivo.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleOpenExternal} variant="default" size="sm" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Abrir em nova aba
              </Button>
              <Button onClick={handleDownload} variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        ) : (
          <Document
            file={toProxiedUrl(url)}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#c8956c] border-t-transparent" />
                  <p className="text-sm text-muted-foreground">Carregando PDF...</p>
                </div>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        )}
      </div>

      {/* Informações */}
      <p className="text-xs text-muted-foreground text-center">
        Use os botões acima para navegar entre páginas e ajustar o zoom
      </p>
    </div>
  );
}
