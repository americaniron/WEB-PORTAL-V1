import { Lead, Quote, MarketingCampaign, InventoryItem, User } from '../types';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Data
let MOCK_LEADS: Lead[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', phone: '555-0101', message: 'Interested in solar panel installation', source: 'website-contact', is_newsletter_subscriber: true, created_at: '2023-10-25T10:00:00Z' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', phone: '555-0102', message: 'Quote for HVAC repair', source: 'referral', is_newsletter_subscriber: false, created_at: '2023-10-26T14:30:00Z' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', phone: '555-0103', message: 'General inquiry about services', source: 'facebook', is_newsletter_subscriber: true, created_at: '2023-10-27T09:15:00Z' },
];

let MOCK_QUOTES: Quote[] = [
  { 
    id: 101, 
    client_name: 'Tech Solutions Inc', 
    client_email: 'contact@techsolutions.com', 
    quote_details: { items: [{ description: 'Server Maintenance', quantity: 1, price: 1500 }] }, 
    status: 'sent', 
    sent_at: '2023-10-20T11:00:00Z',
    created_at: '2023-10-20T09:00:00Z' 
  },
  { 
    id: 102, 
    client_name: 'Residential Home', 
    client_email: 'homeowner@email.com', 
    quote_details: { items: [{ description: 'Installation', quantity: 1, price: 500 }] }, 
    status: 'draft', 
    created_at: '2023-10-28T16:00:00Z' 
  },
];

let MOCK_CAMPAIGNS: MarketingCampaign[] = [
  { id: 1, name: 'Winter Sale', subject: 'Get 20% off this winter!', status: 'draft', created_at: '2023-11-01T10:00:00Z' },
  { id: 2, name: 'Newsletter Oct', subject: 'Monthly Updates', status: 'sent', created_at: '2023-10-01T10:00:00Z' },
];

let MOCK_INVENTORY: InventoryItem[] = [
  { id: 1, name: 'Excavator Model X', description: 'Heavy duty excavator', model_number: 'EX-2000', serial_number: 'SN-998877', price: 45000, quantity: 2, type: 'equipment' },
  { id: 2, name: 'Hydraulic Pump', description: 'Replacement pump for EX-2000', part_number: 'HP-55', cost: 1200, quantity: 15, type: 'part' },
];

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<User> => {
      await delay(800);
      // UPDATED CREDENTIALS
      if (email === 'admin@americaniron.com' && password === 'IronStrong!') {
        return { id: 1, email, role: 'admin', token: 'mock-jwt-token-123' };
      }
      throw new Error('Invalid credentials');
    }
  },
  leads: {
    getAll: async (): Promise<Lead[]> => {
      await delay(500);
      return [...MOCK_LEADS];
    }
  },
  quotes: {
    getAll: async (): Promise<Quote[]> => {
      await delay(500);
      return [...MOCK_QUOTES];
    },
    create: async (quote: Omit<Quote, 'id' | 'created_at'>): Promise<Quote> => {
      await delay(800);
      const newQuote: Quote = {
        ...quote,
        id: Math.floor(Math.random() * 10000),
        created_at: new Date().toISOString()
      };
      MOCK_QUOTES = [newQuote, ...MOCK_QUOTES];
      return newQuote;
    }
  },
  marketing: {
    getAll: async (): Promise<MarketingCampaign[]> => {
      await delay(500);
      return [...MOCK_CAMPAIGNS];
    },
    create: async (campaign: Omit<MarketingCampaign, 'id' | 'created_at'>): Promise<MarketingCampaign> => {
      await delay(600);
      const newCampaign: MarketingCampaign = {
        ...campaign,
        id: Math.floor(Math.random() * 10000),
        created_at: new Date().toISOString()
      };
      MOCK_CAMPAIGNS = [newCampaign, ...MOCK_CAMPAIGNS];
      return newCampaign;
    }
  },
  inventory: {
    getAll: async (): Promise<InventoryItem[]> => {
      await delay(500);
      return [...MOCK_INVENTORY];
    }
  }
};