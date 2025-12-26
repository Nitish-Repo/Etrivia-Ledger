import { Injectable } from '@angular/core';
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
        unitPrice: 125.00,
        total: 5000.00
      },
      {
        description: 'UI/UX Design',
        quantity: 20,
        unitPrice: 100.00,
        total: 2000.00
      },
      {
        description: 'Consulting Services',
        quantity: 10,
        unitPrice: 150.00,
        total: 1500.00
      },
      {
        description: 'Project Management',
        quantity: 15,
        unitPrice: 110.00,
        total: 1650.00
      }
    ];

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxRate = 0.10; // 10% tax
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
