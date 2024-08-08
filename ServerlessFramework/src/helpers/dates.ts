import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';

dayjs.extend(customParseFormat);
dayjs.extend(utc);

export const hubspotFormatDate = (date: string | Date): string => dayjs(date).format('YYYY-MM-DD');

export const formatDate = (date: dayjs.Dayjs): string => date.format('DD/MM/YYYY');

export const formatDateActivation = (date: dayjs.Dayjs): string => date.format('YYYY-MM-DD');

export const formatDateAndTime = (date: dayjs.Dayjs): string => date.format('YYYY-MM-DDTHH:mm:ss');

export const getStartDate = (date: string | Date): string => {
  let parsedDate = dayjs(date);
  const dateNote = dayjs();

  const givenDate = parsedDate.startOf('day');
  const todayDate = dateNote.startOf('day');
  // Check if the start date is not today.
  const isPresentDate = givenDate.isSame(todayDate);
  // Subtract one day if the plan start date is future date.
  if (!isPresentDate) parsedDate = parsedDate.subtract(1, 'day');
  return formatDate(parsedDate);
};

export const getTime = (date: string | Date): number => dayjs(date).unix();

export const addDayAndFormat = (date: string | Date, additionalDays: number, format: 'string' | 'date'): Date | string => {
  let parsedDate = dayjs(date).utc();

  parsedDate = parsedDate.add(additionalDays, 'day').utc();

  return format === 'date' ? parsedDate.toDate() : formatDate(parsedDate);
};

export const subtractDayAndFormat = (date: string | Date, additionalDays: number, format: 'string' | 'date'): Date | string => {
  let parsedDate = dayjs(date).utc();

  parsedDate = parsedDate.subtract(additionalDays, 'day').utc();

  return format === 'date' ? parsedDate.toDate() : formatDate(parsedDate);
};

export const minusOneDay = (date: string | Date, format: 'string' | 'date'): Date | string => {
  const parsedDate = dayjs(date);
  const minusDate = parsedDate.subtract(1, 'day');
  return format === 'date' ? minusDate.toDate() : formatDate(minusDate);
};

export const fiveMinutesExpire = (): number => {
  const currentTime = dayjs();
  const futureTime = currentTime.add(5, 'minutes');
  return futureTime.valueOf(); // Returns the timestamp in milliseconds
};

// now()
export const dateNow = (type: 'Date' | 'string' = 'string'): string | Date => (type === 'Date' ? dayjs().utc().toDate() : formatDate(dayjs()));

export const doorDeliveryDays = 2;

// Door delivery
export const isLessThanNDays = (date: string, noOfDays: number): boolean => {
  const givenDate = dayjs(date, 'DD/MM/YYYY', true);
  const compareDate = dayjs();
  const addNDaysToCompare = compareDate.add(noOfDays, 'day');
  return givenDate.isAfter(addNDaysToCompare, 'day');
};

// today midnight date
export const currentDateAtMidnight = (type: 'Date' | 'string' = 'string'): string | Date =>
  type === 'Date' ? dayjs().startOf('day').toDate() : formatDate(dayjs());

// Is Past date
export const isPastDate = (dateToCheck: Date | string): boolean => {
  const date = dayjs(dateToCheck, 'DD/MM/YYYY', true);
  const currentDate = dayjs(dateNow(), 'DD/MM/YYYY', true);
  return date.isBefore(currentDate);
};

// Is Future date
export const isFutureDate = (expireDate: Date, dateToCompare: Date | string): boolean => {
  const date = dayjs(expireDate);
  const comparingDate = dayjs(dateToCompare, 'DD/MM/YYYY', true);
  return comparingDate.isAfter(date);
};

// Date type
export const dateType = (date: Date | string): dayjs.Dayjs => dayjs(date);

// Convert Dayjs
export const convertDayjs = (date: Date | string): dayjs.Dayjs => dayjs(date, 'DD/MM/YYYY', true);

// Schedule Time 30 minutes add
export const scheduleTimeWithThirtyMin = (date: Date | string): string => {
  const added = dateType(date).add(30, 'minute');
  return formatDateAndTime(added);
};

// Schedule Time add
export const customScheduleTime = (date: Date | string, addCount: number, scheduleType: 'minute' | 'hour'): string => {
  const added = dateType(date).add(addCount, scheduleType);
  return formatDateAndTime(added);
};

export const scheduleTime = (date: Date | string): string => formatDateAndTime(dateType(date));

// Convert time to date
export const convertTimeToDate = (date: string): Date => dayjs(date).toDate();

// Find date and convert into date
export const findAndConvertDate = (date: string): Date => dayjs(date, 'DD/MM/YYYY', true).utc().toDate();

// Check date values or same
export const checkIsSameDate = (date: string): boolean => date === dateNow('string');

// Is Sim expire date
export const isSimPasteDate = (dateToCheck: Date | string): boolean => {
  const date = dayjs(dateToCheck);
  const currentDate = addDayAndFormat(dateNow(), 30, 'date');
  return date.isBefore(currentDate);
};

// Returns UTC start of the day in ISO string format for the given date.
export const getUtcDayStart = (date: string): string => dayjs.utc(date).startOf('day').toISOString();

// Returns UTC end of the day in ISO string format for the given date.
export const getUtcDayEnd = (date: string): string => dayjs.utc(date).endOf('day').toISOString();

//current date in format(YYYY-MM-DD)
export const getCurrentDate = (): string => dayjs().format('YYYY-MM-DD');

// Calculate the difference in days from today
export const differenceInDays = (date: string): number => dayjs(date).diff(dayjs().startOf('day'), 'day');
