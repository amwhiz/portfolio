import { Accounts, ProductsVariant } from 'src/entities';

const propertiesCanSelect = Object.keys({ ...Accounts, ...ProductsVariant });

/* eslint-disable @typescript-eslint/no-explicit-any */
export const selectedProperties = (object: any, properties: typeof propertiesCanSelect): object => {
  const selectedObject: any = {};
  properties.forEach((key) => {
    if (key in object) {
      selectedObject[key] = object[key];
    }
  });
  return selectedObject;
};

export const selectedPropertiesByUserDefine = <T>(object: any, properties: (keyof T)[]): object => {
  const selectedObject: any = {};
  properties.map((key) => {
    if (key in object) {
      selectedObject[key] = object[key];
    }
  });
  return selectedObject;
};
