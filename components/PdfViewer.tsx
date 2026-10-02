'use client';

import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, AlertCircle } from 'lucide-react';

interface PdfViewerProps {
  // Our own authenticated API route, not a Supabase URL — the PDF bytes are
  // fetched here and rendered entirely with our own canvas, so the browser's
  // native PDF toolbar (with its own Save/Print buttons) never appears, and
  // there is no separate link a viewer could copy out and reuse elsewhere.
  fileUrl: string;
  title: string;
}

export default function PdfViewer({ fileUrl, title }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.3);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

        const res = await fetch(fileUrl);
        if (!res.ok) throw new Error('Gagal memuat file.');
        const buffer = await res.arrayBuffer();
        if (cancelled) return;

        const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
        if (cancelled) return;

        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setPageNum(1);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load PDF:', err);
        if (!cancelled) {
          setError('Gagal memuat dokumen PDF.');
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fileUrl]);

  useEffect(() => {
    if (!pdfDoc) return;
    let cancelled = false;

    (async () => {
      const page = await pdfDoc.getPage(pageNum);
      if (cancelled) return;

      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');
      if (!canvas || !context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvas, canvasContext: context, viewport }).promise;
    })();

    return () => {
      cancelled = true;
    };
  }, [pdfDoc, pageNum, scale]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-sm border border-outline-variant/10 shadow-2xl min-h-[500px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-sm border border-outline-variant/10 shadow-2xl min-h-[500px] flex flex-col items-center justify-center text-center p-12 gap-3">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-on-surface-variant font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-sm border border-outline-variant/10 shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-outline-variant/10 bg-surface-container-low">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPageNum((p) => Math.max(1, p - 1))}
            disabled={pageNum <= 1}
            className="p-1.5 rounded-lg hover:bg-surface-container disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium text-on-surface-variant whitespace-nowrap">
            Halaman {pageNum} / {numPages}
          </span>
          <button
            onClick={() => setPageNum((p) => Math.min(numPages, p + 1))}
            disabled={pageNum >= numPages}
            className="p-1.5 rounded-lg hover:bg-surface-container disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setScale((s) => Math.max(0.6, s - 0.2))}
            className="p-1.5 rounded-lg hover:bg-surface-container transition-colors"
            title="Perkecil"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setScale((s) => Math.min(2.5, s + 0.2))}
            className="p-1.5 rounded-lg hover:bg-surface-container transition-colors"
            title="Perbesar"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="overflow-auto max-h-[80vh] flex justify-center bg-surface-container-low/50 p-4">
        <canvas ref={canvasRef} aria-label={title} />
      </div>
    </div>
  );
}
