//build full name using first and last names
export const getFullName = (firstName: string, lastName: string): string => (lastName ? `${firstName} ${lastName}` : firstName);
