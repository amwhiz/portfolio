/* eslint-disable @typescript-eslint/no-explicit-any */
export const deleteProperties = (object: any, properties: string[]): object => {
  properties.forEach((key) => key in object && delete object[key]);
  return object;
};
