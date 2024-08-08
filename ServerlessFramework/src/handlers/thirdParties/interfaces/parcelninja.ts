export interface IOutbound {
  id: number;
  clientId: string;
  createDate: string;
  type: {
    id: number;
    description: string;
  };
  status: {
    code: number;
    timeStamp: string;
    description: string;
  };
  deliveryInfo: {
    customer: string;
    contactNo: string;
    addressLine1: string;
    addressLine2: string;
    suburb: string;
    postalCode: string;
    email: string;
    dispatchDate: string;
    trackingNo: string;
    trackingUrl: string;
    courierName: string;
    totes: string[];
    courierBillingInfo: {
      service: {
        code: string;
        description: string;
        workingDays: number;
      };
      shippingWeight: number;
      boxList: [
        {
          name: string;
          weight: number;
          quantity: number;
        },
      ];
      dispatchDate: string;
      deliveryStartDate: string;
      deliveryEndDate: string;
      cost: number;
    };
    status: {
      code: number;
      timeStamp: string;
      description: string;
    };
  };
  items: {
    id: number;
    itemNo: string;
    name: string;
    qty: number;
    SerialNumbers: string[];
    status: {
      code: number;
      timeStamp: string;
      description: string;
    };
  }[];
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IParcelNinjaWebhook {
  id: number | any;
  clientId: string | null;
  type: {
    id: number | string | null;
    description: string | null;
  };
  timestamp: string;
  events: [
    {
      code: number;
      timestamp: string | null;
      description: string | null;
    },
  ];
  deliveryInfo: {
    trackingURL: string | null;
    waybillNumber: string;
  };
}
