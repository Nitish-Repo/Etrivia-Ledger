import { Injectable } from '@angular/core';
import { AdditionalCharge, BusinessSettings, Customer, Sale, SaleItem } from '@app/features/models';
import { Invoice, InvoiceItem } from '@app/models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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
