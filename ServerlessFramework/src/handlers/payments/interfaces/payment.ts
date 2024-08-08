import { ProductsVariant } from 'src/entities';
import { SimTypesEnum } from 'src/entities/enums/common';

export interface PaymentDetails {
  simType: SimTypesEnum;
  completedAt: Date;
  totalPrice: number;
  whatsappNumber: string;
  email: string;
  variants: ProductsVariant[];
  planStartDate: string;
  serialNumber: string;
  simId: number;
  airtime: string;
  validity: string;
  plan: string;
  device: string;
  isDoorDelivery: boolean;
}
