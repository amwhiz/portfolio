export type ValidationResponseType = {
  data: string;
  statusCode: number;
};

export type ValidationRequestType = {
  date?: string;
  serialNumber?: string;
  email?: string;
  type?: string;
  simType?: string;
  whatsappNumber?: string;
  selectedOption?: number | string;
  planStartDate?: string;
};
