import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  // A4 dimensions in mm
  private readonly A4_WIDTH = 210;
  private readonly A4_HEIGHT = 297;

  /**
   * Generates a PDF from an HTML element with multi-page support
   * @param element The HTML element to convert to PDF
   * @param filename The filename for the downloaded PDF
   */
  async generatePdf(element: HTMLElement, filename: string = 'invoice.pdf'): Promise<void> {
    try {
      // Create canvas from HTML element
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions
      const imgWidth = this.A4_WIDTH;
      const pageHeight = this.A4_HEIGHT;
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
