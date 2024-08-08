export const getNames = (name: string): { firstName: string; lastName: string } => {
  const splittedNames = name?.split(' ');
  const lastName = splittedNames?.length === 1 ? '' : splittedNames?.pop();
  const firstName = splittedNames?.join(' ') ?? '';
  return { firstName, lastName };
};
