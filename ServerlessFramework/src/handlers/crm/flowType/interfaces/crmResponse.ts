import { IContact, IDeal, ISim } from './buy';

export interface ContactResponse extends IContact {
  id: string;
}

export interface DealResponse extends IDeal {
  id: string;
}

export interface SimResponse extends ISim {
  id: string;
}
