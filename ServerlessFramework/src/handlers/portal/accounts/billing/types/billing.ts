import { BillingTransactions } from 'src/entities/billingTransaction';

export type Agents = {
  name: string;
  sim_quantity: number;
  amount: number;
};

export type Invoice = {
  date: string;
  totalAmount: number;
  agents: Agents[];
};

export type BillingResponse = {
  startDate: string;
  endDate: string;
  totalAmount: number;
  billing: Invoice[];
};

export type AgentInvoiceResponse = {
  payments: BillingTransactions[];
  billings: BillingResponse;
};

export type AgentSale = {
  soldSimsCount: number;
  soldSimsAmount: number;
  date: string;
};
