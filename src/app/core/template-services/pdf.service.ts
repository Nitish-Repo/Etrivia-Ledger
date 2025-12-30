import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

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

  // compute render scale capped to reasonable values
  private getRenderScale(requestedScale?: number): number {
    const requested = requestedScale ?? 2;
    const deviceDpr = Math.max(window.devicePixelRatio || 1, 1);
    return Math.min(requested, Math.max(1, deviceDpr), 2);
  }

  // apply A4 width styles to an element and return a restore function
  private async applyA4Width(element: HTMLElement, widthMm: number): Promise<() => void> {
    const originalStyle: Partial<CSSStyleDeclaration> = {};
    originalStyle.width = element.style.width;
    originalStyle.maxWidth = element.style.maxWidth;
    originalStyle.boxSizing = element.style.boxSizing;

    element.style.width = `${this.mmToPx(widthMm)}px`;
    element.style.maxWidth = `${this.mmToPx(widthMm)}px`;
    element.style.boxSizing = 'border-box';

    await new Promise(requestAnimationFrame);

    return () => {
      element.style.width = originalStyle.width ?? '';
      element.style.maxWidth = originalStyle.maxWidth ?? '';
      element.style.boxSizing = originalStyle.boxSizing ?? '';
    };
  }

  // Render element to canvas with html2canvas using supplied scale
  private async renderToCanvas(element: HTMLElement, renderScale: number): Promise<HTMLCanvasElement> {
    return await html2canvas(element, {
      scale: renderScale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
  }

  // Convert a rendered canvas into a jsPDF instance (multi-page slice)
  private canvasToPdf(canvas: HTMLCanvasElement, widthMm: number, heightMm: number, renderScale: number): jsPDF {
    const mmToPxScaled = (mm: number) => Math.round((mm * 96 * renderScale) / 25.4);
    const pxToMm = (px: number) => (px * 25.4) / (96 * renderScale);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidthMm = widthMm;
    const pageHeightMm = heightMm;

    const pageHeightPx = mmToPxScaled(pageHeightMm);
    let yOffset = 0;

    while (yOffset < canvas.height) {
      const sliceHeight = Math.min(pageHeightPx, canvas.height - yOffset);
      const tmp = document.createElement('canvas');
      tmp.width = canvas.width;
      tmp.height = sliceHeight;
      const ctx = tmp.getContext('2d')!;
      ctx.drawImage(canvas, 0, yOffset, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

      const imgData = tmp.toDataURL('image/jpeg', 0.8);

      if (yOffset > 0) pdf.addPage();

      const drawHeightMm = pxToMm(tmp.height) * (pageWidthMm / pxToMm(tmp.width));
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidthMm, drawHeightMm);

      yOffset += sliceHeight;
    }

    return pdf;
  }

  /**
   * Generates a PDF from an HTML element with multi-page support
   * @param element The HTML element to convert to PDF
   * @param filename The filename for the downloaded PDF
   * @param options Optional: { useA4, widthMm, heightMm, scale }
   */
  async generatePdf(element: HTMLElement, filename: string = 'invoice.pdf', options: PdfOptions = {}): Promise<void> {
    const widthMm = options.widthMm ?? this.A4_WIDTH;
    const heightMm = options.heightMm ?? this.A4_HEIGHT;
    const renderScale = this.getRenderScale(options.scale);

    const restore = options.useA4 ? await this.applyA4Width(element, widthMm) : () => {};

    try {
      const canvas = await this.renderToCanvas(element, renderScale);
      const pdf = this.canvasToPdf(canvas, widthMm, heightMm, renderScale);
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    } finally {
      restore();
    }
  }

  /**
   * Generates a PDF with better page break handling
   * @param element The HTML element to convert to PDF
   * @param filename The filename for the downloaded PDF
   */
  async generatePdfWithPageBreaks(element: HTMLElement, filename: string = 'invoice.pdf'): Promise<void> {
    try {
      const pages = element.querySelectorAll('.page-break');

      if (pages.length === 0) return this.generatePdf(element, filename);

      const pdf = new jsPDF('p', 'mm', 'a4');
      for (let i = 0; i < pages.length; i++) {
        const pageElement = pages[i] as HTMLElement;
        const canvas = await this.renderToCanvas(pageElement, 2);
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = this.A4_WIDTH;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, this.A4_HEIGHT));
      }

      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF with page breaks:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  /**
   * Render the element to an image data URL for preview or download.
   * Returns a base64 data URL (PNG or JPEG).
   */
  async generateImage(
    element: HTMLElement,
    options: { useA4?: boolean; widthMm?: number; scale?: number; format?: 'png' | 'jpeg'; quality?: number } = {}
  ): Promise<string> {
    const widthMm = options.widthMm ?? this.A4_WIDTH;
    const renderScale = this.getRenderScale(options.scale);
    const restore = options.useA4 ? await this.applyA4Width(element, widthMm) : () => {};

    try {
      const canvas = await this.renderToCanvas(element, renderScale);
      const format = options.format ?? 'png';
      if (format === 'png') return canvas.toDataURL('image/png');
      const quality = options.quality ?? 0.8;
      return canvas.toDataURL('image/jpeg', quality);
    } finally {
      restore();
    }
  }

  /**
   * Trigger download of a base64 image data URL.
   */
  downloadImage(dataUrl: string, filename: string = 'image.png'): void {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  /**
   * Save a data URL (base64) to app-scoped storage and open the share sheet.
   * Works on Android/iOS via Capacitor Filesystem + Share.
   */
  async saveAndShareDataUrl(dataUrl: string, filename: string): Promise<void> {
    try {
      const commaIdx = dataUrl.indexOf(',');
      const base64 = commaIdx >= 0 ? dataUrl.substring(commaIdx + 1) : dataUrl;

      await Filesystem.writeFile({
        path: filename,
        data: base64,
        directory: Directory.Documents,
        recursive: true
      });

      const uri = await Filesystem.getUri({ path: filename, directory: Directory.Documents });

      await Share.share({
        title: filename,
        text: filename,
        url: uri.uri,
        dialogTitle: 'Share file'
      });
    } catch (err) {
      console.error('saveAndShareDataUrl error:', err);
      throw err;
    }
  }

  /**
   * Generate PDF from element and save/share on device (uses app-scoped storage).
   */
  async savePdfFromElement(element: HTMLElement, filename: string = 'invoice.pdf', options: PdfOptions = {}): Promise<void> {
    const widthMm = options.widthMm ?? this.A4_WIDTH;
    const heightMm = options.heightMm ?? this.A4_HEIGHT;
    const renderScale = this.getRenderScale(options.scale);

    const restore = options.useA4 ? await this.applyA4Width(element, widthMm) : () => {};

    try {
      const canvas = await this.renderToCanvas(element, renderScale);
      const pdf = this.canvasToPdf(canvas, widthMm, heightMm, renderScale);
      const dataUri = pdf.output('datauristring');
      await this.saveAndShareDataUrl(dataUri, filename);
    } finally {
      restore();
    }
  }

  /**
   * Generate image from element and save/share on device.
   */
  async saveImageFromElement(element: HTMLElement, filename: string = 'invoice.jpg', options: { useA4?: boolean; widthMm?: number; scale?: number; format?: 'png' | 'jpeg'; quality?: number } = {}): Promise<void> {
    const dataUrl = await this.generateImage(element, { useA4: options.useA4, widthMm: options.widthMm, scale: options.scale, format: options.format ?? 'jpeg', quality: options.quality });
    await this.saveAndShareDataUrl(dataUrl, filename);
  }
}
