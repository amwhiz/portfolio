export const commissionCalculation = (amount: number, percent: number): number => +((amount * percent) / 100).toFixed(2);
