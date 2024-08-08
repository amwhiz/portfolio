export const roundToTwoDigits = (value: number): number => {
  const amount = typeof value === 'string' ? +value : value;
  return parseFloat(amount.toFixed(2));
};
