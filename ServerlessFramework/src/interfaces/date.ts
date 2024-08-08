export interface DateType {
  startDateEpochTime: number;
  currentEpochTime: number;
  startPlanDate: string;
  todayDate: string;
}

export interface scheduleDateType {
  newDateString?: string;
  scheduledTime?: number;
  formatExpression: string;
}
