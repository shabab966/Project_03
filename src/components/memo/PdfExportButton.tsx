'use client';

import React, { useState } from 'react';
import { Download, Printer, Loader2 } from 'lucide-react';

interface PdfExportButtonProps {
  elementId: string;
  filename: string;
}

export default function PdfExportButton({ elementId, filename }: PdfExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handlePrintOrExport = async () => {
    setExporting(true);
    try {
      // Dynamic import of jspdf and html2canvas
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const element = document.getElementById(elementId);
      if (!element) {
        window.print();
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 mm width
      const pageHeight = 297; // A4 mm height
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${filename}.pdf`);
    } catch (err) {
      console.warn('Fallback to standard print dialog', err);
      window.print();
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex items-center space-x-2 no-print">
      <button
        onClick={handlePrintOrExport}
        disabled={exporting}
        className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition disabled:opacity-60"
        title="Export Official PDF of this memo"
      >
        {exporting ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Generating PDF...</span>
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5" />
            <span>Download Official PDF</span>
          </>
        )}
      </button>

      <button
        onClick={() => window.print()}
        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
        title="Print memo"
      >
        <Printer className="w-4 h-4" />
      </button>
    </div>
  );
}
