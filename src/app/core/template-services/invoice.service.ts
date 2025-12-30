import { inject, Injectable } from '@angular/core';
import { AdditionalCharge, BusinessSettings, Customer, Sale, SaleItem } from '@app/features/models';
import { BusinessSettingsService } from '@app/features/services/business-settings';
import { SaleAdditionalChargeService } from '@app/features/services/sale-additional-charge.service';
import { SaleItemService } from '@app/features/services/sale-item.service';
import { SaleService } from '@app/features/services/sale.service';
import { Invoice, InvoiceItem } from '@app/models/invoice.model';
import { forkJoin, firstValueFrom } from 'rxjs';
import { TemplateService } from './template.service';
import { CustomerService } from '@app/features/services/customer.service';
import { PdfService } from './pdf.service';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private saleService = inject(SaleService);
  private saleItemService = inject(SaleItemService);
  private saleAdditionalChargeService = inject(SaleAdditionalChargeService);
  private businessService = inject(BusinessSettingsService);
  private customerService = inject(CustomerService);
  private templateService = inject(TemplateService);
  private pdfService = inject(PdfService);



  /**
   * Generate a PNG preview (data URL) for a sale's invoice using the configured template.
   * Returns a promise resolving to a base64 data URL (jpeg/png).
   */
  async getPngPreview(sale: Sale, options: { format?: 'png' | 'jpeg'; quality?: number; scale?: number } = { format: 'jpeg', quality: 0.85, scale: 2 }): Promise<string> {
    // load all required data
    const results = await firstValueFrom(forkJoin([
      this.saleService.getSaleById(sale.saleId!),
      this.saleItemService.getSaleItemsBySaleId(sale.saleId!),
      this.saleAdditionalChargeService.getAdditionalChargeBySaleId(sale.saleId!),
      this.businessService.getBusinessSettings(),
      this.customerService.getCustomerById(sale.customerId)
    ]));

    const [saleRec, saleItems, saleAdditionalCharges, businessSetting, customer] = results as [Sale, SaleItem[], any, BusinessSettings, any];

    // determine template id (fallback to undefined)
    const templateMetadata = await firstValueFrom(this.templateService.getTemplateMetadataWithFallback(businessSetting?.templateId));

    const invoice = this.generateInvoiceFromSale(saleRec, saleItems, saleAdditionalCharges || [], businessSetting ?? undefined, customer ?? undefined);

    // render template html
    const html = await firstValueFrom(this.templateService.getAndRenderTemplate(templateMetadata.filename, invoice));

    // generate image from html string via PdfService
    const dataUrl = await this.pdfService.generateImageFromHtmlString(html, {
      useA4: true,
      format: options.format ?? 'jpeg',
      quality: options.quality ?? 0.85,
      scale: options.scale ?? 2
    });

    return dataUrl;
  }

  async generatePdfandSave(sale: Sale, options: { useA4?: boolean; scale?: number } = { useA4: true, scale: 2 }): Promise<void> {
    const { html, invoice, template } = await this.renderInvoiceHtml(sale);
    const filename = `invoice-${invoice.invoiceNumber}-${template.templateId}.pdf`;

    if ((window as any).Capacitor && (window as any).Capacitor.getPlatform && (window as any).Capacitor.getPlatform() !== 'web') {
      // native
      await this.pdfService.savePdfFromHtmlString(html, filename, { useA4: options.useA4, scale: options.scale });
      return;
    }

    // web
    await this.pdfService.generatePdfFromHtmlString(html, filename, { useA4: options.useA4, scale: options.scale });
  }

  async generateImageandSave(sale: Sale, options: { format?: 'png' | 'jpeg'; quality?: number; scale?: number } = { format: 'jpeg', quality: 0.85, scale: 2 }): Promise<void> {
    const { html, invoice, template } = await this.renderInvoiceHtml(sale);
    const filename = `invoice-${invoice.invoiceNumber}-${template.templateId}.jpg`;

    if ((window as any).Capacitor && (window as any).Capacitor.getPlatform && (window as any).Capacitor.getPlatform() !== 'web') {
      // native: save image (share)
      await this.pdfService.saveImageFromHtmlString(html, filename, { useA4: true, format: options.format ?? 'jpeg', quality: options.quality, scale: options.scale });
      return;
    }

    // web: generate data url and trigger download
    const dataUrl = await this.pdfService.generateImageFromHtmlString(html, { useA4: true, format: options.format ?? 'jpeg', quality: options.quality, scale: options.scale });
    this.pdfService.downloadImage(dataUrl, filename);
  }

  async savePdfandShare(sale: Sale): Promise<void> {
    const { html, invoice, template } = await this.renderInvoiceHtml(sale);
    const filename = `invoice-${invoice.invoiceNumber}-${template.templateId}.pdf`;

    // native: save to storage and open share sheet
    if ((window as any).Capacitor && (window as any).Capacitor.getPlatform && (window as any).Capacitor.getPlatform() !== 'web') {
      await this.pdfService.savePdfFromHtmlString(html, filename, { useA4: true, scale: 2 });
      return;
    }

    // web: try Web Share API with an image preview first
    if ((navigator as any).canShare && (navigator as any).canShare({ files: [] })) {
      try {
        const imgData = await this.pdfService.generateImageFromHtmlString(html, { useA4: true, format: 'jpeg', quality: 0.85, scale: 2 });
        const blob = this.dataUrlToBlob(imgData);
        const file = new File([blob], filename.replace(/\.pdf$/, '.jpg'), { type: blob.type });
        await (navigator as any).share({ files: [file], title: 'Invoice', text: 'Invoice attached' });
        return;
      } catch (err) {
        console.warn('Web share failed, falling back to download', err);
      }
    }

    // fallback: trigger PDF download
    await this.pdfService.generatePdfFromHtmlString(html, filename, { useA4: true, scale: 2 });
  }

  // helper to render HTML and invoice object for a sale
  private async renderInvoiceHtml(sale: Sale): Promise<{ html: string; invoice: Invoice; template: any }> {
    const results = await firstValueFrom(forkJoin([
      this.saleService.getSaleById(sale.saleId!),
      this.saleItemService.getSaleItemsBySaleId(sale.saleId!),
      this.saleAdditionalChargeService.getAdditionalChargeBySaleId(sale.saleId!),
      this.businessService.getBusinessSettings(),
      this.customerService.getCustomerById(sale.customerId)
    ]));

    const [saleRec, saleItems, saleAdditionalCharges, businessSetting, customer] = results as [Sale, SaleItem[], any, BusinessSettings, any];

    const templateMetadata = await firstValueFrom(this.templateService.getTemplateMetadataWithFallback(businessSetting?.templateId));

    const invoice = this.generateInvoiceFromSale(saleRec, saleItems, saleAdditionalCharges || [], businessSetting ?? undefined, customer ?? undefined);

    const html = await firstValueFrom(this.templateService.getAndRenderTemplate(templateMetadata.filename, invoice));

    return { html, invoice, template: templateMetadata };
  }

  private dataUrlToBlob(dataUrl: string): Blob {
    const parts = dataUrl.split(',');
    const meta = parts[0];
    const base64 = parts[1];
    const contentTypeMatch = /data:(.*);base64/.exec(meta);
    const contentType = contentTypeMatch ? contentTypeMatch[1] : 'application/octet-stream';
    const byteChars = atob(base64);
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }

  







  /**
   * Generates mock invoice data with formatted values
   */
  generateMockInvoice(): Invoice {
    const items: InvoiceItem[] = [
      {
        description: 'Web Development Services',
        quantity: 40,
        unitPrice: 125.0,
        total: 5000.0
      },
      {
        description: 'UI/UX Design',
        quantity: 20,
        unitPrice: 100.0,
        total: 2000.0
      },
      {
        description: 'Consulting Services',
        quantity: 10,
        unitPrice: 150.0,
        total: 1500.0
      },
      {
        description: 'Project Management',
        quantity: 15,
        unitPrice: 110.0,
        total: 1650.0
      }
    ];

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxRate = 0.1; // 10% tax
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    // Format dates
    const invoiceDate = this.formatDate(new Date());
    const dueDate = this.formatDate(this.addDays(new Date(), 30));

    return {
      invoiceNumber: 'INV-2025-001234',
      invoiceDate,
      dueDate,
      company: {
        name: 'Acme Corporation',
        address: {
          street: '123 Business Park Drive',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          country: 'USA'
        },
        phone: '+1 (555) 123-4567',
        email: 'billing@acmecorp.com',
        taxId: 'TAX-123456789'
      },
      customer: {
        name: 'Tech Innovations LLC',
        address: {
          street: '456 Innovation Avenue',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        phone: '+1 (555) 987-6543',
        email: 'accounts@techinnovations.com'
      },
      items: items.map(item => ({
        ...item,
        unitPrice: item.unitPrice,
        total: item.total
      })),
      subtotal: this.formatCurrency(subtotal),
      tax: this.formatCurrency(tax),
      taxRate: this.formatPercentage(taxRate),
      total: this.formatCurrency(total),
      notes: 'Thank you for your business! Payment is due within 30 days.',
      terms: 'Payment terms: Net 30. Late payments subject to 1.5% monthly interest charge.'
    };
  }

  /**
   * Build an Invoice from a Sale record and its items
   */
  generateInvoiceFromSale(sale: Sale, saleItems: SaleItem[], additionalCharges: AdditionalCharge[] = [], businessSettings?: BusinessSettings, customerParam?: Customer): Invoice {
    // Map sale items
    const items: InvoiceItem[] = saleItems.map(si => ({
      description: si.productName,
      quantity: si.quantity,
      unitPrice: si.pricePerUnit,
      total: si.totalAmount
    }));

    // Totals
    const subtotalNum = items.reduce((s, it) => s + (it.total || 0), 0);
    const taxNum = (sale.taxableAmount || 0) + (sale.cgst || 0) + (sale.sgst || 0) + (sale.igst || 0) + (sale.cess || 0) - (sale.taxableAmount || 0);
    const totalNum = sale.grandTotal ?? sale.totalAmount ?? subtotalNum;

    // Dates
    const invoiceDate = sale.invoiceDate ? this.formatDate(new Date(sale.invoiceDate)) : this.formatDate(new Date());
    const dueDate = (() => {
      try {
        const d = new Date(sale.invoiceDate || new Date());
        d.setDate(d.getDate() + 30);
        return this.formatDate(d);
      } catch {
        return this.formatDate(this.addDays(new Date(), 30));
      }
    })();

    const company = businessSettings ? {
      name: businessSettings.businessName || '',
      address: {
        street: businessSettings.address || '',
        city: businessSettings.city || '',
        state: businessSettings.state || '',
        zipCode: businessSettings.pincode || '',
        country: ''
      },
      phone: businessSettings.phone || '',
      email: businessSettings.email || '',
      taxId: businessSettings.gstin || undefined
    } : {
      name: '',
      address: { street: '', city: '', state: '', zipCode: '', country: '' },
      phone: '',
      email: ''
    };

    const invoiceCustomer = customerParamToUse(customerParam) || {
      name: sale.customerName || '',
      address: { street: '', city: '', state: '', zipCode: '', country: '' },
      phone: '',
      email: ''
    };

    function customerParamToUse(cust?: any) {
      if (!cust) return null;
      return {
        name: cust.customerName || cust.name || '',
        address: {
          street: cust.billingAddress || cust.address || '',
          city: cust.city || '',
          state: cust.state || '',
          zipCode: cust.pincode || '',
          country: cust.country || ''
        },
        phone: cust.phone || '',
        email: cust.email || ''
      } as import('@app/models/invoice.model').Customer;
    }

    return {
      invoiceNumber: sale.invoiceNumber || 'INV-0000',
      invoiceDate,
      dueDate,
      company,
      customer: invoiceCustomer,
      items,
      subtotal: this.formatCurrency(subtotalNum),
      tax: this.formatCurrency(sale.cgst + sale.sgst + sale.igst + sale.cess || 0),
      taxRate: this.formatPercentage((businessSettings?.defaultGstRate ?? 0) / 100),
      total: this.formatCurrency(totalNum || 0),
      notes: sale.notes || '',
      terms: ''
    };
  }

  /**
   * Formats a number as currency (USD)
   */
  private formatCurrency(amount: number): string {
    // Format currency in Indian Rupees by default
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  /**
   * Formats a decimal as percentage
   */
  private formatPercentage(rate: number): string {
    return `${(rate * 100).toFixed(0)}%`;
  }

  /**
   * Formats a date as MM/DD/YYYY
   */
  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  }

  /**
   * Adds days to a date
   */
  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}
