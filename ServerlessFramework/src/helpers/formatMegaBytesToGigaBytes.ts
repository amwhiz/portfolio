export const formatMegaBytesToGigBytes = (megabytes: number, decimals = 2): string => {
  if (!+megabytes) return '0 GB';

  const gigabytes = megabytes / 1024;

  return `${gigabytes.toFixed(decimals)} GB`;
};
