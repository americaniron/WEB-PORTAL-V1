export interface User {
  id: number;
  email: string;
  role: 'admin' | 'user' | 'employee';
  token?: string;
}

export interface Quote {
  id: string;
  customer_id: number;
  client_name: string;
  client_email: string;
  quote_details: {
    items: Array<{ description: string; quantity: number; price: number }>;
  };
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  sent_at?: string;
  created_at: string;
}

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  source: string;
  is_newsletter_subscriber: boolean;
  created_at: string;
}

export interface MarketingCampaign {
  id: number;
  name: string;
  subject: string;
  status: 'draft' | 'ready' | 'sending' | 'sent' | 'paused';
  created_at: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  description: string;
  model_number?: string;
  serial_number?: string;
  part_number?: string;
  price?: number; 
  cost?: number; 
  quantity: number;
  type: 'equipment' | 'part';
}

export interface Project {
  id: number;
  name: string;
  client_name: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold';
  budget: number;
  start_date: string;
  end_date?: string;
  created_at: string;
}

export interface TimeEntry {
  id: number;
  project_id: number;
  user_id: number;
  date: string;
  hours: number;
  description: string;
  is_billable: boolean;
  created_at: string;
}

export interface QuoteItem {
  part_number: string;
  description: string;
  status: string;
  quantity: number;
  unit_weight: number;
  price: number;
}

export interface DetailedQuote {
  id: string;
  customer_id: number;
  bill_to: {
      name: string;
      address: string[];
      attn: string;
      phone: string;
  };
  ship_to: {
      name: string;
      address: string[];
      attn: string;
      phone: string;
  };
  items: QuoteItem[];
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  created_at: string;
  valid_until: string;
  logistics_rate: number;
  commercial_terms: string;
  doc_ref: string;
}

export interface Address {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

export interface Payment {
    id: string;
    customer_id: number;
    date: string;
    amount: number;
    method: 'Credit Card' | 'Bank Transfer' | 'Check';
    invoice_id?: string;
}

export interface RecurringInvoice {
    id: string;
    customer_id: number;
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    items: Array<{ description: string; quantity: number; price: number }>;
    next_generation_date: string;
    last_generation_date?: string;
    status: 'active' | 'paused';
}

export interface AuditLog {
    id: number;
    customer_id: number;
    user_email: string;
    action: string;
    details: string;
    created_at: string;
}

export interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    billing_address: Address;
    shipping_address: Address;
    internal_notes: string;
    created_at: string;
    total_billed?: number;
    total_paid?: number;
}

export interface SystemHealth {
  status: 'operational' | 'degraded' | 'outage';
  latency: number;
  services: {
    inventory: boolean;
    billing: boolean;
    auth: boolean;
    ai: boolean;
  };
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: string;
}