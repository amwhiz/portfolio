/* eslint-disable @typescript-eslint/no-explicit-any */
import { validateProperties } from 'src/constants/validateProperties';
import { getAgentCode } from './getAgentCode';

export const transformBody = <T>(body: any): T => {
  if (Array.isArray(body)) {
    // If body is an array, process each element recursively
    body.forEach((item, index) => {
      body[index] = transformBody(item);
    });
  } else if (typeof body === 'object' && body !== null) objectBody(body);
  return body;
};

const objectBody = (body: any): any => {
  // If body is an object, process each property recursively
  for (const prop in body) {
    body[prop] = transformBody(body[prop]);
    if (validateProperties.includes(prop)) {
      // Check if property value is empty string, starts with '@', or is 'Not Required'
      if (
        body[prop] === '' ||
        (typeof body[prop] === 'string' && body[prop].startsWith('@')) ||
        body[prop]?.toLowerCase() === 'Not Required'?.toLowerCase()
      ) {
        // Remove the property from the body
        delete body[prop];
      }
      // Lowercase the email property if it exists
      if (prop.toLowerCase() === 'email' && typeof body[prop] === 'string') {
        body[prop] = body[prop].toLowerCase();
      }

      if (prop.toLowerCase() === 'agentcode' && typeof body[prop] === 'string') {
        body['referralCode'] = getAgentCode(body[prop]);
      }
    }
  }
};
