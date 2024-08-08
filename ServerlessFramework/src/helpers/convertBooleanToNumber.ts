import { confirmation } from 'src/enums/confirmation';

export const convertBooleanToNumber = (selectedOptions: string | confirmation): number => confirmation?.[selectedOptions] || selectedOptions;
