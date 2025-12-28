import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export type PdfOptions = {
  useA4?: boolean;
  widthMm?: number;
  heightMm?: number;
  scale?: number;
};

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  // A4 dimensions in mm
  private readonly A4_WIDTH = 210;
  private readonly A4_HEIGHT = 297;

  // convert mm -> css px (assumes 96dpi)
  private mmToPx(mm: number): number {
    return Math.round((mm * 96) / 25.4);
  }

  /**
   * Generates a PDF from an HTML element with multi-page support
   * @param element The HTML element to convert to PDF
   * @param filename The filename for the downloaded PDF
   * @param options Optional: { useA4, widthMm, heightMm, scale }
   */
  async generatePdf(element: HTMLElement, filename: string = 'invoice.pdf', options: PdfOptions = {}): Promise<void> {
    const scale = options.scale ?? 2;
    const widthMm = options.widthMm ?? this.A4_WIDTH;
    const heightMm = options.heightMm ?? this.A4_HEIGHT;

    // Optionally force element to A4 width for consistent layout during render
    const appliedA4 = !!options.useA4;
    const originalStyle: Partial<CSSStyleDeclaration> = {};

    if (appliedA4) {
      originalStyle.width = element.style.width;
      originalStyle.maxWidth = element.style.maxWidth;
      originalStyle.boxSizing = element.style.boxSizing;

      const px = `${this.mmToPx(widthMm)}px`;
      element.style.width = px;
      element.style.maxWidth = px;
      element.style.boxSizing = 'border-box';

      // ensure layout flush
      await new Promise(requestAnimationFrame);
    }

    try {
      // Create canvas from HTML element
      const canvas = await html2canvas(element, {
        scale,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');

      // Calculate dimensions (jsPDF expects mm units)
      const imgWidth = widthMm;
      const pageHeight = heightMm;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content exceeds one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    } finally {
      // restore original styles
      if (appliedA4) {
        element.style.width = originalStyle.width ?? '';
        element.style.maxWidth = originalStyle.maxWidth ?? '';
        element.style.boxSizing = originalStyle.boxSizing ?? '';
      }
    }
  }

  /**
   * Generates a PDF with better page break handling
   * @param element The HTML element to convert to PDF
   * @param filename The filename for the downloaded PDF
   */
  async generatePdfWithPageBreaks(element: HTMLElement, filename: string = 'invoice.pdf'): Promise<void> {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageHeight = this.A4_HEIGHT;
      const pageWidth = this.A4_WIDTH;

      // Get all page-break elements or use single page
      const pages = element.querySelectorAll('.page-break');
      
      if (pages.length === 0) {
        // No page breaks defined, use simple approach
        return this.generatePdf(element, filename);
      }

      // Handle multiple pages with page-break classes
      for (let i = 0; i < pages.length; i++) {
        const pageElement = pages[i] as HTMLElement;
        
        const canvas = await html2canvas(pageElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pageHeight));
      }

      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF with page breaks:', error);
      throw new Error('Failed to generate PDF');
    }
  }
}
