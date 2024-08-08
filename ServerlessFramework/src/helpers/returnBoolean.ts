export type SelectedOptions = 'yes' | 'no' | 'Yes' | 'No';

export const returnBoolean = (value: SelectedOptions): boolean => value?.toLowerCase() === 'yes';

export const returnYesOrNo = (value: boolean): SelectedOptions => (value ? 'Yes' : 'No');
