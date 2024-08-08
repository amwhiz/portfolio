import AccountService from '@handlers/account/account';
import { WorkflowBase } from '@handlers/webhook-wati/workflows/pushToQueue';
import { LoggerService } from '@aw/logger';
import { SQSTypes } from 'src/constants/sqs';
import { Accounts, Sim } from 'src/entities';
import { ProductVariantSkuEnum } from 'src/entities/enums/productVariant';
import { FormTypes } from './enums/forms';
import { IFormsWebhook, PortalSim } from './interfaces/sales';
import { DispatchForms } from './saleTypes/dispatchForms';
import { SimType } from 'src/entities/enums/common';
import { deleteProperties } from 'src/helpers/deleteProperties';
import { omitProperties } from '../constants/protectedProperties';
import { PlanType, Role } from 'src/entities/enums/account';
import { CODService } from './partnerTerm/cod';
import SimService from '@handlers/sim/sim';
import { AppError } from '@libs/api-error';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { selectedPropertiesByUserDefine } from 'src/helpers/selectedProperties';
import { lowerCase } from 'src/helpers/nameConvention';
import { DeliveryType } from './interfaces/buySim';
import { ValidationResponseType } from '@handlers/validator/types/validator';
import CdsClient from 'packages/aw-cds';
import { StatusEnum } from 'packages/aw-cds/enums/activationSim';
import { SimSubTypeEnum } from 'packages/aw-cds/enums/validationSim';
import { PassWordCredentialsType } from 'packages/aw-cds/types/auth';
import { ValidationSimRequestType, SimActivationType } from 'packages/aw-cds/types/validationSim';

export default class Sales extends WorkflowBase {
  private logger = new LoggerService({ serviceName: Sales.name });
  private accountService: AccountService;
  private simService: SimService;
  private cdsServices: CdsClient;
  public iccids: string[] = [];

  constructor() {
    super();

    this.accountService = new AccountService();
    this.simService = new SimService();
  }

  private async codInstantsPayment(accountDocument: Accounts, sim: IFormsWebhook): Promise<{ url: string; invoiceId: string }> {
    const codService = new CODService();
    return await codService.CodPartnerTerm(accountDocument, sim);
  }

  // isDirectCall param use to prevent the COD check from payment gateWay
  async queue(event: IFormsWebhook, account: Partial<Accounts>, isDirectCall: boolean = true): Promise<void | { url: string; invoiceId: string }> {
    await this.accountService.ormInit();
    const accountDocument = await this.accountService.findAccountByUniqueColumn(account?.email);

    if (accountDocument?.role === Role.USER_AGENT) {
      const getParentAccount = await this.accountService.findRelationShipAccountsByChildAccount(accountDocument);
      const parentAccount = getParentAccount?.length ? getParentAccount[0]?.parentAccountId : null;
      accountDocument.currentPlan = parentAccount?.currentPlan;
    }

    const isCODAccount = accountDocument?.currentPlan === PlanType.COD;
    const isBulkSim = event.formType === FormTypes.BulkSim;
    const isCompleteFreeSim =
      event?.sims?.['plan'] === ProductVariantSkuEnum['1GbFreeOffer'] &&
      !event?.sims?.['airtime'] &&
      event?.sims?.['validity'] === ProductVariantSkuEnum['30Days-Free'];
    const isFreeSim =
      event.formType === FormTypes.FreeSim ||
      (event?.sims?.['deliveryType'] === DeliveryType['Free Collection Points'] && event?.sims?.['plan'] === ProductVariantSkuEnum['1GbFreeOffer']) ||
      isCompleteFreeSim;

    // If account was COD Plan. Need to pay instants
    if (isCODAccount && !isFreeSim && isDirectCall) return await this.codInstantsPayment(accountDocument, event);

    if (isBulkSim) {
      for (let simIndex = 0; simIndex < (event.sims as PortalSim[]).length; simIndex++) {
        if ((event.sims as PortalSim)['email']) (event.sims[simIndex] as PortalSim)['email'] = lowerCase((event.sims[simIndex] as PortalSim)?.email);
        await super.pushToQueue(SQSTypes.portal, {
          sims: event.sims[simIndex],
          account: deleteProperties(accountDocument, omitProperties),
          formType: event?.formType,
        });
      }
    } else if (!isBulkSim) {
      if ((event.sims as PortalSim)['email']) (event.sims as PortalSim)['email'] = lowerCase((event.sims as PortalSim)?.email);
      await super.pushToQueue(SQSTypes.portal, {
        sims: event?.sims,
        account: deleteProperties(accountDocument, omitProperties),
        formType: event?.formType,
      });
    }
  }

  async dispatchForm(event: IFormsWebhook): Promise<void> {
    switch (event.formType) {
      case FormTypes.FreeSim:
        (event.sims as PortalSim).plan = ProductVariantSkuEnum['1GbFreeOffer'];
        (event.sims as PortalSim).validity = ProductVariantSkuEnum['30Days-Free'];
        return await DispatchForms.buySim(event);
      case FormTypes.BulkSim:
        return await DispatchForms.buySim(event);
      case FormTypes.ExpressSim:
        return await DispatchForms.buySim(event);
      case FormTypes.CompleteSim: {
        const isCompleteSim = (event?.sims as PortalSim)?.simType === SimType.eSIM || (event?.sims as PortalSim)?.serialNumber;
        if (isCompleteSim && !(event?.sims as PortalSim)?.deliveryType) return await DispatchForms.completeSim(event);
        else return await DispatchForms.buySim(event);
      }
      case FormTypes.TopUp:
        return await DispatchForms.rechargeSim(event);
      default:
        this.logger.error(`Unknown Form: ${event.formType}`);
        break;
    }
  }

  async simPurchasedByCustomer(customerEmail: string): Promise<Pick<Sim, 'serialNumber' | 'mobileNo'>[]> {
    await this.simService.ormInit();

    if (!customerEmail) throw new AppError(ReasonPhrases.BAD_REQUEST, StatusCodes.BAD_REQUEST);
    const customer = await this.simService.getCustomerByEmail(customerEmail);

    if (!customer?.email) throw new AppError(ReasonPhrases.NOT_FOUND, StatusCodes.NOT_FOUND);

    const activatedSims = await this.simService.getSimByCustomer(customer, true);
    return activatedSims.map((sim) => selectedPropertiesByUserDefine<Sim>(sim, ['serialNumber', 'mobileNo']));
  }

  async serialNumberValidate(validatorPayload: { serialNumber: string; email: string }): Promise<ValidationResponseType> {
    this.cdsServices = new CdsClient();
    if (this.iccids.includes(validatorPayload.serialNumber)) return { data: 'Success', statusCode: StatusCodes.OK };
    const credentials: PassWordCredentialsType = this.cdsServices.getCredentials();
    const validateSim: ValidationSimRequestType = {
      SimNo: validatorPayload?.serialNumber,
      SimSubType: SimSubTypeEnum.Physical,
      ...credentials,
    };

    const validateSimAlreadyTaken = await this.cdsServices.validateSim(true, validateSim, validatorPayload?.email);
    const validateMessageData = validateSimAlreadyTaken.MessageData as SimActivationType[];
    if (validateSimAlreadyTaken)
      if (validateSimAlreadyTaken.Status === StatusEnum.Success && !validateMessageData?.length)
        return { data: 'Failure', statusCode: StatusCodes.BAD_REQUEST };
    return { data: 'Success', statusCode: StatusCodes.OK };
  }
}
