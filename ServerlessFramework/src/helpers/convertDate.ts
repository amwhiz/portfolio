import { findAndConvertDate, hubspotFormatDate } from './dates';

// Convert USA format and wati date format.
export const convertHubspotDate = (date: string): string => {
  if (!date) return null;
  const convertedDate = findAndConvertDate(date);
  const dates = isNaN(convertedDate.getTime()) ? date : convertedDate;
  return hubspotFormatDate(dates);
};

export const convertNormalDate = (date: string): string | Date => {
  if (!date) return null;
  const convertedDate = findAndConvertDate(date);
  return isNaN(convertedDate.getTime()) ? date : convertedDate;
};
