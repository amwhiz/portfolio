import StringTemplateFormat from 'string-template';
import { replace } from 'lodash';

export const stringFormat = (content: string, parameters: object): string => {
  const stringWithSingleBraces = replace(content, /{{/g, '{');
  const finalString = replace(stringWithSingleBraces, /}}/g, '}');
  return StringTemplateFormat(finalString, parameters);
};
