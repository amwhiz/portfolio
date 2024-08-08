import { SchemaDefinition } from '@aw/objectmapper/interfaces/interface';

export const defaultJsonSchema: SchemaDefinition = {
  target: '',
  required: true,
  targetType: 'string',
};

export type BuildJsonSchema = { [k: string]: SchemaDefinition };

export const buildJsonSchema = (object: object = {}): BuildJsonSchema => {
  const buildedJsonSchema: BuildJsonSchema = {};
  const keys = Object.keys(object);
  keys.forEach((key) => {
    buildedJsonSchema[key] = {
      ...defaultJsonSchema,
      target: object[key],
    };
  });
  return buildedJsonSchema;
};
