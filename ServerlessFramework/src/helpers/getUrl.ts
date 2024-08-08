import { APIGatewayProxyEvent } from 'aws-lambda';

export const getUrlFromRequest = (event: APIGatewayProxyEvent): string => {
  const protocol = 'https';
  const host = event?.headers?.Host;
  const path = event?.path;

  let queryString = '';
  if (event?.queryStringParameters) {
    const params = Object.keys(event?.queryStringParameters)
      .map((key) => `${key}=${event?.queryStringParameters?.[key]}`)
      .join('&');
    queryString = params ? `?${params}` : '';
  }

  return `${protocol}://${host}${path}${queryString}`;
};
