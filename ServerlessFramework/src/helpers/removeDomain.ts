export const removePaymentLinkDomain = (link: string): string => {
  if (!link) return null;
  const parsedUrl = new URL(link);
  const removingDomain = parsedUrl.origin;

  // Remove the leading "/"
  const path = link.replace(removingDomain, '').substring(1);
  return path;
};
