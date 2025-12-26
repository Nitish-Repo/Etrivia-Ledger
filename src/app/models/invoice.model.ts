export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Company {
  name: string;
  address: Address;
  phone: string;
  email: string;
  taxId?: string;
}

export interface Customer {
  name: string;
  address: Address;
  phone: string;
  email: string;
}

export interface Invoice {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  company: Company;
  customer: Customer;
  items: InvoiceItem[];
  subtotal: string;
  tax: string;
  taxRate: string;
  total: string;
  notes?: string;
  terms?: string;
}

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  filename: string;
  thumbnailPath: string;
  category: string;
}
