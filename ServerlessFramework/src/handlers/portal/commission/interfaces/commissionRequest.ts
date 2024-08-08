import { Accounts, Checkout, Order, Sim } from 'src/entities';

export interface CommissionRequest {
  accountId: Accounts; // Sim purchased account
  orderId: Order; // Order created by sim purchased
  simId: Sim; // Sim created by sim purchased
  checkoutId?: Checkout; // Checkout
}
