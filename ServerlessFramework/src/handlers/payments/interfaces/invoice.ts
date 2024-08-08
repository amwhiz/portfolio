import { ProductVariantCurrencyEnum } from 'src/entities/enums/productVariant';

export interface BillingTransactionInvoice {
  total_amount: number;
  start_date: string; // Date type or string formatted as date
  end_date: string; // Date type or string formatted as date
  invoice: string;
  billing: BillingDetail[];
  receiver: string;
  agent_name: string;
  address: string;
  stage: string; // Assuming stage is a string
  hub_id: string;
  vat_no: string;
  type: string;
  currency: ProductVariantCurrencyEnum;
  payment_link?: string;
}

interface BillingDetail {
  date: string; // Date type or string formatted as date
  total_amount: number;
  agents: Agent[];
}

interface Agent {
  name: string;
  count?: number;
  amount: number;
}
