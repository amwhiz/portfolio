import { FormTypes } from '../enums/forms';

export const FormValidator = {
  type: 'object',
  properties: {
    sims: {
      oneOf: [
        {
          type: 'object',
          properties: {
            destination: { type: 'string' },
            customerName: { type: 'string' },
            email: { type: 'string' },
            whatsappNumber: { type: 'string' },
            plan: { type: 'string' },
            airtime: { type: 'string' },
            validity: { type: 'string' },
            simType: { type: 'string' },
            planStartDate: { type: 'string' },
            serialNumber: { type: 'string' },
            deliveryType: { type: 'string' },
            collectionPoints: { type: 'string' },
            mobileNumber: { type: 'string' },
            address: { type: 'string' },
            amount: { type: 'number' },
          },
        },
        {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              destination: { type: 'string' },
              customerName: { type: 'string' },
              email: { type: 'string' },
              whatsappNumber: { type: 'string' },
              plan: { type: 'string' },
              airtime: { type: 'string' },
              validity: { type: 'string' },
              simType: { type: 'string' },
              planStartDate: { type: 'string' },
              serialNumber: { type: 'string' },
              deliveryType: { type: 'string' },
              collectionPoints: { type: 'string' },
              mobileNumber: { type: 'string' },
              address: { type: 'string' },
              amount: { type: 'number' },
            },
          },
        },
      ],
    },
    formType: { type: 'string', enum: Object.values(FormTypes) },
  },
  required: ['formType'],
} as const;

export const SerialValidate = {
  type: 'object',
  properties: {
    serialNumber: {
      type: 'string',
    },
    email: {
      type: 'string',
    },
  },
  required: ['serialNumber', 'email'],
} as const;
