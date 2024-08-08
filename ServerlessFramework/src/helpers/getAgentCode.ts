export const getAgentCode = (message: string): string => {
  if (!message) return null;
  const regex = /NEXT\w+/;
  const match = message.match(regex);
  return match?.length ? match[0] : null;
};
