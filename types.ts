export interface User {
  id: number;
  email: string;
  role: 'admin' | 'user' | 'employee';
  token?: string;
}

export interface Quote {
  id: number;
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
  price?: number; // For equipment
  cost?: number; // For parts
  quantity: number;
  type: 'equipment' | 'part';
}