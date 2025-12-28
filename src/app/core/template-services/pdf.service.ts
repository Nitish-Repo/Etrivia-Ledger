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
    const requestedScale = options.scale ?? 2;
    const widthMm = options.widthMm ?? this.A4_WIDTH;
    const heightMm = options.heightMm ?? this.A4_HEIGHT;

    // Cap scale to avoid huge canvases on high-DPR devices
    const deviceDpr = Math.max(window.devicePixelRatio || 1, 1);
    const renderScale = Math.min(requestedScale, Math.max(1, deviceDpr), 2);

    const appliedA4 = !!options.useA4;
    const originalStyle: Partial<CSSStyleDeclaration> = {};

    if (appliedA4) {
      originalStyle.width = element.style.width;
      originalStyle.maxWidth = element.style.maxWidth;
      originalStyle.boxSizing = element.style.boxSizing;
      element.style.width = `${this.mmToPx(widthMm)}px`;
      element.style.maxWidth = `${this.mmToPx(widthMm)}px`;
      element.style.boxSizing = 'border-box';
      await new Promise(requestAnimationFrame);
    }

    try {
      // render at capped scale
      const canvas = await html2canvas(element, {
        scale: renderScale,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // helpers converting mm <-> px at renderScale (CSS px ~96dpi)
      const mmToPxScaled = (mm: number) => Math.round((mm * 96 * renderScale) / 25.4);
      const pxToMm = (px: number) => (px * 25.4) / (96 * renderScale);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidthMm = widthMm;
      const pageHeightMm = heightMm;

      // slice canvas into page-sized strips (px) to avoid huge single-image pages and cropping
      const pageHeightPx = mmToPxScaled(pageHeightMm);
      let yOffset = 0;

      while (yOffset < canvas.height) {
        const sliceHeight = Math.min(pageHeightPx, canvas.height - yOffset);
        const tmp = document.createElement('canvas');
        tmp.width = canvas.width;
        tmp.height = sliceHeight;
        const ctx = tmp.getContext('2d')!;
        ctx.drawImage(canvas, 0, yOffset, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

        // use JPEG with quality to reduce size (text renders fine in high quality)
        const imgData = tmp.toDataURL('image/jpeg', 0.8);

        if (yOffset > 0) pdf.addPage();

        // compute height to draw in mm preserving aspect ratio
        const drawHeightMm = pxToMm(tmp.height) * (pageWidthMm / pxToMm(tmp.width));
        pdf.addImage(imgData, 'JPEG', 0, 0, pageWidthMm, drawHeightMm);

        yOffset += sliceHeight;
      }

      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    } finally {
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
