import { CRMWorkFlow } from 'src/enums/workflows';
import { LoggerService, logger as Logger } from '@aw/logger';
import { WorkflowBase } from '@handlers/webhook-wati/workflows/pushToQueue';
import { DispatchFlowsType } from './flowType/dispatchFlowType';
import { ICRMFlow } from './interfaces/types';

export default class CRMService extends WorkflowBase {
  private logger: typeof Logger;

  constructor() {
    super();
    this.logger = new LoggerService({ serviceName: CRMService.name });
  }

  public async dispatchWorkflows(event: ICRMFlow): Promise<void> {
    switch (event.flowName) {
      case CRMWorkFlow.Buy:
        return await DispatchFlowsType.buy(event);
      case CRMWorkFlow.Payment:
        return await DispatchFlowsType.payment(event);
      case CRMWorkFlow.Activation:
        return await DispatchFlowsType.activation(event);
      case CRMWorkFlow.Recharge:
        return await DispatchFlowsType.recharge(event);
      case CRMWorkFlow.Account:
        return await DispatchFlowsType.account(event);
      case CRMWorkFlow.Association:
        return await DispatchFlowsType.association(event);
      case CRMWorkFlow.Cds:
        return await DispatchFlowsType.cds(event);
      case CRMWorkFlow.parcelNinja:
        return await DispatchFlowsType.parcelNinja(event);
      case CRMWorkFlow.SimPurchase:
        return await DispatchFlowsType.simPurchase(event);
      case CRMWorkFlow.PartnerTerm:
        return await DispatchFlowsType.partnerTerm(event);
      case CRMWorkFlow.Commission:
        return await DispatchFlowsType.commission(event);
      default:
        this.logger.error(`Unknown workflow: ${event.flowName}`);
        break;
    }
  }
}
