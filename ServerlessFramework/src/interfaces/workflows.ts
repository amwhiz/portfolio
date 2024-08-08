import { ParentWorkflow, WorkflowEnum } from 'src/enums/workflows';

export interface IWorkflow {
  flowName?: string | WorkflowEnum;
  parentFlowName: string | ParentWorkflow;
}
