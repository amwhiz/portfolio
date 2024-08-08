export interface CommissionResponse {
  data: {
    date: string;
    data: {
      agency: AgencyData[];
      userAgent: AgencyData[];
    }[];
  };
}

interface AgencyData {
  id: number;
  name: string;
  sims: CommissionData[];
}

interface CommissionData {
  amount: number;
  agencyCommission: number;
  partnerCommission: number;
  customerName: string;
  isRecharge: boolean;
  isUpgrade: boolean;
}
