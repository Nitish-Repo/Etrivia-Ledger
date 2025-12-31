import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

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

    const restore = options.useA4 ? await this.applyA4Width(element, widthMm) : () => { };

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
    const restore = options.useA4 ? await this.applyA4Width(element, widthMm) : () => { };

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
    const commaIdx = dataUrl.indexOf(',');
    const meta = commaIdx >= 0 ? dataUrl.substring(0, commaIdx) : '';
    const base64 = commaIdx >= 0 ? dataUrl.substring(commaIdx + 1) : dataUrl;

    // detect content type from data url meta
    const contentTypeMatch = /data:(.*);base64/.exec(meta);
    const contentType = contentTypeMatch ? contentTypeMatch[1] : 'application/octet-stream';
    // normalize to main mime type (strip parameters like ;filename=...)
    const mime = contentType.split(';')[0].trim();

    // Try writing to public Documents first; if permission denied on Android, fallback to app-scoped storage
    const candidateDirs = [Directory.Documents, Directory.Data];
    let lastErr: any = null;

    for (const dir of candidateDirs) {
      try {
        const writeResult = await Filesystem.writeFile({ path: filename, data: base64, directory: dir, recursive: true });
        const uri = await Filesystem.getUri({ path: filename, directory: dir });

        // On native platforms try to open file directly (if File Opener plugin is available)
        try {
          const platform = (window as any).Capacitor && (window as any).Capacitor.getPlatform ? (window as any).Capacitor.getPlatform() : 'web';
          if (platform !== 'web') {
            // Check common global exposures for file opener plugins
            const opener = (window as any).Capacitor?.Plugins?.FileOpener || (window as any).FileOpener || (window as any).cordova?.plugins?.fileOpener2 || null;
            if (opener && typeof opener.open === 'function') {
              try {
                // Some plugins accept an object with filePath and contentType, others accept (path, mimeType, success, error)
                if (opener.open.length === 1) {
                  await opener.open({ filePath: uri.uri, contentType: mime });
                } else {
                  // fallback for Cordova style
                  await new Promise((res, rej) => opener.open(uri.uri, mime, res, rej));
                }
                return;
              } catch (openerErr) {
                console.warn('FileOpener failed to open file:', openerErr);
              }
            }
          }
        } catch (e) {
          console.warn('Error attempting to open file with FileOpener:', e);
        }

        // If opener not available or on web, fallback to share sheet
        try {
          await Share.share({
            title: filename,
            text: filename,
            url: uri.uri,
            dialogTitle: 'Share file'
          });
          return;
        } catch (shareErr) {
          // if share failed, still consider write successful and return
          console.warn('Share failed:', shareErr);
          return;
        }
      } catch (err) {
        lastErr = err;
        console.warn(`writeFile to ${dir} failed:`, err);
        // Try next directory
      }
    }

    // If we reach here, all writes failed — give a helpful error message
    console.error('saveAndShareDataUrl error:', lastErr);

    // Provide guidance in error messages for Android storage permissions
    if (lastErr && typeof lastErr === 'object' && (lastErr.message?.includes('EACCES') || (lastErr as any).code === 'EACCES')) {
      throw new Error("Failed to write file to external storage (EACCES). On Android this often means your app lacks permission to write to shared storage.\nConsider writing to app-scoped storage (Directory.Data) which requires no runtime permission, or request WRITE_EXTERNAL_STORAGE / MANAGE_EXTERNAL_STORAGE where appropriate.");
    }

    throw lastErr;
  }

  /**
   * Generate PDF from element and save/share on device (uses app-scoped storage).
   */
  async savePdfFromElement(element: HTMLElement, filename: string = 'invoice.pdf', options: PdfOptions = {}): Promise<void> {
    const widthMm = options.widthMm ?? this.A4_WIDTH;
    const heightMm = options.heightMm ?? this.A4_HEIGHT;
    const renderScale = this.getRenderScale(options.scale);

    const restore = options.useA4 ? await this.applyA4Width(element, widthMm) : () => { };

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

  // ---- Offscreen / HTML string rendering helpers ----

  // Create a hidden iframe, write the provided HTML into it, wait for fonts and images to load
  private async createHiddenIframeWithHtml(html: string, widthPx?: number): Promise<{ iframe: HTMLIFrameElement; element: HTMLElement }> {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.top = '0';
    iframe.style.width = widthPx ? `${widthPx}px` : 'auto';
    iframe.style.height = '100%';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument!;
    doc.open();
    doc.write(html);
    doc.close();

    // wait for initial load
    await new Promise<void>((resolve) => {
      if (doc.readyState === 'complete') return resolve();
      iframe.onload = () => setTimeout(() => resolve(), 50);
      // in some cases load may not fire, fallback
      setTimeout(() => resolve(), 500);
    });

    // wait for fonts
    try {
      if (doc['fonts'] && typeof doc['fonts'].ready !== 'undefined') {
        await doc['fonts'].ready;
      }
    } catch (e) {
      // ignore font waiting errors
    }

    // wait for images
    const images = Array.from(doc.images || []);
    await Promise.all(images.map((img: HTMLImageElement) => {
      return img.complete ? Promise.resolve() : new Promise<void>((res) => { img.onload = img.onerror = () => res(); });
    }));

    return { iframe, element: doc.body };
  }

  /**
   * Generate a PDF from an HTML string using a hidden/offscreen iframe.
   */
  async generatePdfFromHtmlString(html: string, filename: string = 'invoice.pdf', options: PdfOptions = {}): Promise<void> {
    const widthMm = options.widthMm ?? this.A4_WIDTH;
    const heightMm = options.heightMm ?? this.A4_HEIGHT;
    const renderScale = this.getRenderScale(options.scale);

    // create iframe sized to A4 width in px if requested
    const widthPx = this.mmToPx(widthMm);
    const { iframe, element } = await this.createHiddenIframeWithHtml(html, widthPx);

    const restore = options.useA4 ? await this.applyA4Width(element, widthMm) : () => { };

    try {
      const canvas = await this.renderToCanvas(element, renderScale);
      const pdf = this.canvasToPdf(canvas, widthMm, heightMm, renderScale);
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF from HTML string:', error);
      throw new Error('Failed to generate PDF from HTML');
    } finally {
      restore();
      document.body.removeChild(iframe);
    }
  }

  /**
   * Save a PDF generated from an HTML string to device storage and open share sheet.
   */
  async savePdfFromHtmlString(html: string, filename: string = 'invoice.pdf', options: PdfOptions = {}): Promise<void> {
    const widthMm = options.widthMm ?? this.A4_WIDTH;
    const renderScale = this.getRenderScale(options.scale);

    const widthPx = this.mmToPx(widthMm);
    const { iframe, element } = await this.createHiddenIframeWithHtml(html, widthPx);

    const restore = options.useA4 ? await this.applyA4Width(element, widthMm) : () => { };

    try {
      const canvas = await this.renderToCanvas(element, renderScale);
      const pdf = this.canvasToPdf(canvas, widthMm, options.heightMm ?? this.A4_HEIGHT, renderScale);
      const dataUri = pdf.output('datauristring');
      await this.saveAndShareDataUrl(dataUri, filename);
    } finally {
      restore();
      document.body.removeChild(iframe);
    }
  }

  /**
   * Save a data URL and open the resulting file. (No share sheet)
   */
  async saveAndOpenDataUrl(dataUrl: string, filename: string): Promise<void> {
    const commaIdx = dataUrl.indexOf(',');
    const meta = commaIdx >= 0 ? dataUrl.substring(0, commaIdx) : '';
    const base64 = commaIdx >= 0 ? dataUrl.substring(commaIdx + 1) : dataUrl;
    const contentTypeMatch = /data:(.*);base64/.exec(meta);
    const contentType = contentTypeMatch ? contentTypeMatch[1] : 'application/octet-stream';
    const mime = contentType.split(';')[0].trim();

    const platform = (window as any).Capacitor && (window as any).Capacitor.getPlatform ? (window as any).Capacitor.getPlatform() : 'web';

    // PDF
    if (mime === 'application/pdf') {
      const uri = await this.savePdf(base64, filename);

      if (platform === 'web') {
        window.open(uri!, '_blank');
        setTimeout(() => URL.revokeObjectURL(uri!), 10000);
        return;
      }

      try {
        await this.openPdf(uri!);
      } catch (err) {
        console.warn('openPdf failed; falling back to share:', err);
        try {
          await this.sharePdf(uri!);
        } catch (shareErr) {
          console.warn('sharePdf fallback failed:', shareErr);
        }
      }

      return;
    }

    // Image
    if (mime.startsWith('image/')) {
      const uri = await this.savePng(base64, filename);

      if (platform === 'web') {
        window.open(uri!, '_blank');
        setTimeout(() => URL.revokeObjectURL(uri!), 10000);
        return;
      }

      try {
        await this.openPng(uri!);
      } catch (err) {
        console.warn('openPng failed; falling back to share:', err);
        try {
          await this.sharePng(uri!);
        } catch (shareErr) {
          console.warn('sharePng fallback failed:', shareErr);
        }
      }

      return;
    }

    // Generic fallback: write and try share
    try {
      await Filesystem.writeFile({ path: filename, data: base64, directory: Directory.Documents, recursive: true });
      const uri = (await Filesystem.getUri({ path: filename, directory: Directory.Documents })).uri;
      await Share.share({ title: filename, text: filename, url: uri, dialogTitle: 'Share file' });
    } catch (err) {
      console.error('saveAndOpenDataUrl fallback error:', err);
    }
  }

  /**
   * Generate PDF from HTML and save + open (no share)
   */
  async savePdfFromHtmlStringAndOpen(html: string, filename: string = 'invoice.pdf', options: PdfOptions = {}): Promise<void> {
    const widthMm = options.widthMm ?? this.A4_WIDTH;
    const heightMm = options.heightMm ?? this.A4_HEIGHT;
    const renderScale = this.getRenderScale(options.scale);

    const widthPx = this.mmToPx(widthMm);
    const { iframe, element } = await this.createHiddenIframeWithHtml(html, widthPx);

    const restore = options.useA4 ? await this.applyA4Width(element, widthMm) : () => { };

    try {
      const canvas = await this.renderToCanvas(element, renderScale);
      const pdf = this.canvasToPdf(canvas, widthMm, heightMm, renderScale);
      const dataUri = pdf.output('datauristring');
      await this.saveAndOpenDataUrl(dataUri, filename);
    } finally {
      restore();
      document.body.removeChild(iframe);
    }
  }

  async savePdfFromHtmlStringAndShare(
    html: string,
    filename = 'invoice.pdf',
    options: PdfOptions = {}
  ): Promise<void> {

    const widthPx = this.mmToPx(options.widthMm ?? this.A4_WIDTH);
    const { iframe, element } = await this.createHiddenIframeWithHtml(html, widthPx);

    try {
      const canvas = await this.renderToCanvas(element, this.getRenderScale(options.scale));
      const pdf = this.canvasToPdf(
        canvas,
        this.A4_WIDTH,
        this.A4_HEIGHT,
        this.getRenderScale(options.scale)
      );

      await this.saveAndSharePdfDataUrl(pdf.output('datauristring'), filename);
    } finally {
      document.body.removeChild(iframe);
    }
  }

  async saveAndSharePdfDataUrl(dataUrl: string, filename: string): Promise<void> {
    const base64 = dataUrl.split(',')[1];

    try {
      // SAVE PDF
      const uri = await this.savePdf(base64, filename);

      // SHARE PDF (uses your cross-platform helper)
      await this.sharePdf(uri);

    } catch (err) {
      console.error('saveAndSharePdfDataUrl failed', err);
    }
  }



  /**
   * Generate image from HTML and save + open (no share)
   */
  async saveImageFromHtmlStringAndOpen(html: string, filename: string = 'invoice.jpg', options: { useA4?: boolean; widthMm?: number; scale?: number; format?: 'png' | 'jpeg'; quality?: number } = {}): Promise<void> {
    const dataUrl = await this.generateImageFromHtmlString(html, { useA4: options.useA4, widthMm: options.widthMm, scale: options.scale, format: options.format ?? 'jpeg', quality: options.quality });
    await this.saveAndOpenDataUrl(dataUrl, filename);
  }

  /**
   * Generate an image from an HTML string (hidden iframe) and return as data URL.
   */
  async generateImageFromHtmlString(html: string, options: { useA4?: boolean; widthMm?: number; scale?: number; format?: 'png' | 'jpeg'; quality?: number } = {}): Promise<string> {
    const widthMm = options.widthMm ?? this.A4_WIDTH;
    const renderScale = this.getRenderScale(options.scale);

    const widthPx = this.mmToPx(widthMm);
    const { iframe, element } = await this.createHiddenIframeWithHtml(html, widthPx);

    const restore = options.useA4 ? await this.applyA4Width(element, widthMm) : () => { };

    try {
      const canvas = await this.renderToCanvas(element, renderScale);
      const format = options.format ?? 'png';
      if (format === 'png') return canvas.toDataURL('image/png');
      const quality = options.quality ?? 0.8;
      return canvas.toDataURL('image/jpeg', quality);
    } finally {
      restore();
      document.body.removeChild(iframe);
    }
  }

  /**
   * Save an image generated from an HTML string to device storage and open share sheet.
   */
  async saveImageFromHtmlString(html: string, filename: string = 'invoice.jpg', options: { useA4?: boolean; widthMm?: number; scale?: number; format?: 'png' | 'jpeg'; quality?: number } = {}): Promise<void> {
    const dataUrl = await this.generateImageFromHtmlString(html, { useA4: options.useA4, widthMm: options.widthMm, scale: options.scale, format: options.format ?? 'jpeg', quality: options.quality });
    await this.saveAndShareDataUrl(dataUrl, filename);
  }

  // Write a base64 payload to storage and return an access URI
  // - On web returns an object URL (use URL.revokeObjectURL when done)
  // - On native writes to Documents and returns the filesystem URI
  private async writeBase64ToFile(base64: string, fileName: string, mime: string): Promise<string> {
    if (Capacitor.getPlatform() === 'web') {
      const blob = this.base64ToBlob(base64, mime);
      return URL.createObjectURL(blob);
    }

    await Filesystem.writeFile({ path: fileName, data: base64, directory: Directory.Documents, recursive: true });
    return (await Filesystem.getUri({ path: fileName, directory: Directory.Documents })).uri;
  }

  async savePdf(base64Pdf: string, fileName: string): Promise<string> {
    // WEB: trigger download
    if (Capacitor.getPlatform() === 'web') {
      const blob = this.base64ToBlob(base64Pdf, 'application/pdf');
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();

      return url; // used later for open()
    }

    // ANDROID / IOS: save to filesystem
    await Filesystem.writeFile({
      path: fileName,
      data: base64Pdf,
      directory: Directory.Documents,
      recursive: true
    });

    return (await Filesystem.getUri({
      path: fileName,
      directory: Directory.Documents
    })).uri;
  }


  async savePng(base64Png: string, fileName: string): Promise<string> {
    const mime = fileName.toLowerCase().endsWith('.png')
      ? 'image/png'
      : 'image/jpeg';

    // WEB: trigger download
    if (Capacitor.getPlatform() === 'web') {
      const blob = this.base64ToBlob(base64Png, mime);
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();

      return url;
    }

    // ANDROID / IOS: save to filesystem
    await Filesystem.writeFile({
      path: fileName,
      data: base64Png,
      directory: Directory.Documents,
      recursive: true
    });

    return (await Filesystem.getUri({
      path: fileName,
      directory: Directory.Documents
    })).uri;
  }

  private async openFile(uri: string, mime: string): Promise<void> {
    if (Capacitor.getPlatform() === 'web') {
      const win = window.open(uri, '_blank');
      // revoke object URL after short delay to keep UX smooth
      setTimeout(() => {
        try { URL.revokeObjectURL(uri); } catch { /* ignore */ }
      }, 10000);
      if (win) win.focus();
      return;
    }

    await FileOpener.open({ filePath: uri, contentType: mime });
  }

  async openPdf(filePath: string) { return this.openFile(filePath, 'application/pdf'); }
  async openPng(filePath: string) { return this.openFile(filePath, 'image/png'); }

 private async shareFile(uri: string, fileName: string): Promise<void> {
  // WEB
  if (Capacitor.getPlatform() === 'web') {
    if (!(navigator as any).canShare) {
      window.open(uri, '_blank');
      return;
    }

    const blob = await fetch(uri).then(r => r.blob());
    const file = new File([blob], fileName, { type: blob.type });

    // IMPORTANT: check canShare with files
    if ((navigator as any).canShare({ files: [file] })) {
      await (navigator as any).share({ files: [file] });
      return;
    }

    window.open(uri, '_blank');
    return;
  }

  // ANDROID / IOS
  await Share.share({
    title: fileName,
    url: uri,
    dialogTitle: fileName
  });
}



  async sharePdf(filePath: string) { return this.shareFile(filePath, 'Share PDF'); }
  async sharePng(filePath: string) { return this.shareFile(filePath, 'Share Image'); }

  base64ToBlob(base64: string, type: string) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    return new Blob([new Uint8Array(byteNumbers)], { type });
  }

  // Helper for triggering a direct download (kept for explicit downloads)
  downloadOnWeb(blob: Blob, fileName: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }





}

