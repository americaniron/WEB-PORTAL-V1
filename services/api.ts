
import { 
  Lead, Quote, MarketingCampaign, InventoryItem, User, 
  Project, TimeEntry, DetailedQuote, Customer, Payment, 
  RecurringInvoice, AuditLog, SystemHealth 
} from '../types';
import { GoogleGenAI } from "@google/genai";

// Infrastructure configuration
const NETWORK_LATENCY = 250; 
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Intelligent Engine Initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Operational State (Simulated Production Database)
let STORE: {
  leads: Lead[];
  inventory: InventoryItem[];
  customers: Customer[];
  audit: AuditLog[];
  quotes: Quote[];
  projects: Project[];
  timeEntries: TimeEntry[];
  marketing: MarketingCampaign[];
  payments: Payment[];
  recurring: RecurringInvoice[];
} = {
  leads: [],
  inventory: [
    { id: 1, name: 'CAT Excavator D6', description: 'Next Gen Hydraulic Excavator', model_number: 'D6-2024', serial_number: 'SN-CAT-102', price: 125000, quantity: 3, type: 'equipment' },
  ],
  customers: [
    {
      id: 1,
      name: 'AKT ENGG GENERAL TRADING LLC',
      email: 'deepthi.aneesh@aktengg.com',
      phone: '+971557058867',
      billing_address: { street: 'AL MULLA TOWER, OFFICE 304', city: 'SHARJA', state: 'SH', zip: '00000', country: 'UAE' },
      shipping_address: { street: 'AL MULLA TOWER, OFFICE 304', city: 'SHARJA', state: 'SH', zip: '00000', country: 'UAE' },
      internal_notes: 'Strategic account for Middle East operations.',
      created_at: '2022-08-15T09:00:00Z',
      total_billed: 10514.31,
      total_paid: 8000.00,
    }
  ],
  audit: [
    { id: 1, customer_id: 1, user_email: 'admin@americaniron.com', action: 'System', details: 'Production environment initialized.', created_at: new Date().toISOString() }
  ],
  quotes: [],
  projects: [],
  timeEntries: [],
  marketing: [],
  payments: [],
  recurring: []
};

export const api = {
  health: {
    check: async (): Promise<SystemHealth> => {
      await delay(50);
      return {
        status: 'operational',
        latency: Math.floor(Math.random() * 30) + 15,
        services: { inventory: true, billing: true, auth: true, ai: true }
      };
    }
  },

  ai: {
    analyze: async (context: string): Promise<string> => {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `You are the American Iron AI Intelligence module. Context: ${context}. Provide 3 precise business insights or risk assessments for the staff. Use an industrial, authoritative tone. No fluff.`,
          config: {
            systemInstruction: "Expert Logistics & Industrial Operations Advisor. Output should be formatted as a short bulletin.",
            temperature: 0.4
          }
        });
        return response.text || "Analysis Engine: No data insights found for current context.";
      } catch (err) {
        return "Critical: AI Intelligence Node Unresponsive.";
      }
    },
    parseImportData: async (content: string, entityType: string): Promise<any[]> => {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Parse the following legacy data into a structured JSON array for the entity: ${entityType}. 
          Return ONLY the JSON array. Data: ${content}`,
          config: {
            systemInstruction: `You are a data migration expert. Map input fields to internal keys. 
            Customers use: name, email, phone. 
            Inventory use: name, model_number, quantity, price, type (equipment/part).
            Payments use: amount, date, method, invoice_id.
            Handle messy text/PDF output format. If data is missing, omit the field.`,
            responseMimeType: "application/json"
          }
        });
        return JSON.parse(response.text || "[]");
      } catch (err) {
        console.error("AI Parsing Failure", err);
        return [];
      }
    }
  },

  auth: {
    login: async (email: string, password: string): Promise<User> => {
      await delay(NETWORK_LATENCY);
      if (email === 'admin@americaniron.com' && password === 'IronStrong!') {
        return { id: 1, email, role: 'admin', token: 'JWT_PROD_ACCESS_TOKEN' };
      }
      throw new Error('401: Invalid Security Credentials');
    }
  },

  leads: {
    getAll: async () => { await delay(NETWORK_LATENCY); return [...STORE.leads]; }
  },

  inventory: {
    getAll: async () => { await delay(NETWORK_LATENCY); return [...STORE.inventory]; },
    create: async (item: Omit<InventoryItem, 'id'>) => {
      await delay(400);
      const newItem = { ...item, id: Date.now() } as InventoryItem;
      STORE.inventory.push(newItem);
      return newItem;
    },
    bulkCreate: async (items: Omit<InventoryItem, 'id'>[]) => {
      await delay(800);
      const newItems = items.map(item => ({ ...item, id: Math.floor(Math.random() * 1000000) })) as InventoryItem[];
      STORE.inventory = [...STORE.inventory, ...newItems];
      STORE.audit.push({
        id: Date.now(),
        customer_id: 0,
        user_email: 'admin@americaniron.com',
        action: 'Bulk Ingest',
        details: `Imported ${items.length} inventory units into registry.`,
        created_at: new Date().toISOString()
      });
      return newItems;
    }
  },

  customers: {
    getAll: async () => { await delay(NETWORK_LATENCY); return [...STORE.customers]; },
    getById: async (id: number) => {
      await delay(NETWORK_LATENCY);
      const customer = STORE.customers.find(c => c.id === id);
      if (!customer) throw new Error('404: Account ID Not Recognized');
      return { 
        customer, 
        quotes: STORE.quotes.filter(q => q.customer_id === id), 
        payments: STORE.payments.filter(p => p.customer_id === id),
        recurring: STORE.recurring.filter(r => r.customer_id === id), 
        logs: STORE.audit.filter(a => a.customer_id === id).sort((a,b) => b.id - a.id)
      };
    },
    create: async (customer: Omit<Customer, 'id' | 'created_at'>) => {
      await delay(400);
      const newCustomer = { 
        ...customer, 
        id: Date.now(), 
        created_at: new Date().toISOString(),
        total_billed: 0,
        total_paid: 0 
      } as Customer;
      STORE.customers.push(newCustomer);
      return newCustomer;
    },
    bulkCreate: async (customers: Omit<Customer, 'id' | 'created_at'>[]) => {
      await delay(1000);
      const newOnes = customers.map(c => ({ 
        ...c, 
        id: Math.floor(Math.random() * 1000000), 
        created_at: new Date().toISOString(),
        total_billed: 0,
        total_paid: 0 
      })) as Customer[];
      STORE.customers = [...STORE.customers, ...newOnes];
      return newOnes;
    },
    createPayment: async (payment: Omit<Payment, 'id'>) => {
      await delay(400);
      const newPayment = { ...payment, id: `PAY-${Date.now()}` } as Payment;
      STORE.payments.push(newPayment);
      
      const custIdx = STORE.customers.findIndex(c => c.id === payment.customer_id);
      if (custIdx !== -1) {
        STORE.customers[custIdx].total_paid = (STORE.customers[custIdx].total_paid || 0) + payment.amount;
      }
      return newPayment;
    },
    bulkCreatePayments: async (payments: Omit<Payment, 'id'>[]) => {
      await delay(1200);
      const newPayments = payments.map(p => ({ ...p, id: `PAY-INGEST-${Math.random().toString(36).substring(7)}` })) as Payment[];
      STORE.payments = [...STORE.payments, ...newPayments];
      // Note: In real app, we would reconcile billing totals here
      return newPayments;
    }
  },

  quotes: {
    getAll: async () => { await delay(NETWORK_LATENCY); return [...STORE.quotes]; },
    getDetailedById: async (id: string): Promise<DetailedQuote> => {
      await delay(NETWORK_LATENCY);
      const quote = STORE.quotes.find(q => q.id === id);
      return {
        id: id,
        customer_id: quote?.customer_id || 1,
        bill_to: { name: quote?.client_name || 'UNKNOWN', address: [], attn: '', phone: '' },
        ship_to: { name: quote?.client_name || 'UNKNOWN', address: [], attn: '', phone: '' },
        items: [],
        status: quote?.status || 'draft',
        created_at: quote?.created_at || new Date().toISOString(),
        valid_until: '',
        logistics_rate: 0.85,
        commercial_terms: 'NET 30',
        doc_ref: ''
      };
    },
    create: async (quote: Omit<Quote, 'id' | 'created_at' | 'customer_id'>): Promise<Quote> => {
        await delay(600);
        const newQuote: Quote = {
          ...quote,
          id: `QT-${new Date().getFullYear()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          created_at: new Date().toISOString(),
          customer_id: 1, 
        };
        STORE.quotes = [newQuote, ...STORE.quotes];
        return newQuote;
    }
  },

  projects: {
    getAll: async () => { await delay(NETWORK_LATENCY); return [...STORE.projects]; }
  },

  timeTracking: {
    getAll: async () => { await delay(NETWORK_LATENCY); return [...STORE.timeEntries]; },
    // Fix: Added missing create method for time entries
    create: async (entry: Omit<TimeEntry, 'id' | 'created_at'>) => {
      await delay(400);
      const newEntry = { 
        ...entry, 
        id: Date.now(), 
        created_at: new Date().toISOString() 
      } as TimeEntry;
      STORE.timeEntries.push(newEntry);
      return newEntry;
    }
  },

  marketing: {
    getAll: async () => { await delay(NETWORK_LATENCY); return [...STORE.marketing]; }
  },

  utils: {
    sendEmail: async (to: string, subject: string, body: string) => {
      await delay(1000);
      return true;
    }
  }
};
