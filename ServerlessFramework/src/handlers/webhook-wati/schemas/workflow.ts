import { ParentWorkflow } from 'src/enums/workflows';
import { getValues } from 'src/helpers/getValues';

export const workflowValidator = {
  type: 'object',
  properties: {
    parentFlowName: {
      type: 'string',
      enum: getValues(ParentWorkflow),
    },
  },
  required: ['parentFlowName'],
} as const;
