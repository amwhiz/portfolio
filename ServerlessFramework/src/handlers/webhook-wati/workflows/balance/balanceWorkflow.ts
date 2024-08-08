import SimService from '@handlers/sim/sim';
import { WorkflowBase } from '../pushToQueue';
import { KeyType } from '@aw/env';
import { SQSTypes } from 'src/constants/sqs';
import { Templates } from 'src/constants/templates';
import ValidatorBase from '@handlers/validator/validator';
import { ValidationRequestType } from '@handlers/validator/types/validator';
import { Sim } from 'src/entities';
import { SimStatusEnum } from 'src/entities/enums/sim';
import { BalanceNotificationType } from './types/balanceNotificationType';
import { ProductNameEnum } from 'src/entities/enums/product';
import { omit } from 'lodash';
import { dateType, formatDate } from 'src/helpers/dates';
import { Actions } from 'src/enums/actions';
import { roundToTwoDigits } from 'src/helpers/roundToTwoDigits';
import CdsClient from '@aw/cds';
import { MessageDataType } from '@aw/cds/types/getBalance';
import { ZONE } from 'src/entities/enums/account';
import { Countries } from 'src/constants/countries';
import { CurrencySymbol } from 'packages/aw-pg/enums/regionCurrency';

export class BalancePayload {
  email?: string;
  whatsappNumber?: string;
  selectedOption?: string | 'yes';
}

export class BalanceBuilder extends WorkflowBase {
  private simService: SimService;
  private cdsServices: CdsClient;
  private productPlans: string[] = Object.values(omit(ProductNameEnum, ['SimValidity', 'AirTime', 'DoorDelivery']));
  private productValidity: string = ProductNameEnum.SimValidity;
  private balancePayload: BalancePayload;

  constructor(balancePayload: BalancePayload) {
    super();
    this.balancePayload = balancePayload;
    this.simService = new SimService();
    this.cdsServices = new CdsClient();
  }

  private async getAirtimeBalance(mobileNo: string, email: string, sim: Sim): Promise<string> {
    const credentials = this.cdsServices.getCredentials();
    const subscriberInfo = await this.cdsServices.getBalance(true, { MobileNo: mobileNo, ...credentials }, email);
    const messageData = subscriberInfo.MessageData as MessageDataType;
    let leftAirtime: number = 0;
    const isInternational = sim?.customerId?.accountId?.zone === ZONE.International || (sim?.countryFrom && sim?.countryFrom !== Countries.Africa);

    if (messageData) {
      const leftAirtimeBalances = messageData?.balances?.filter((res) => res?.balanceName === 'General Cash');
      const amount = leftAirtimeBalances?.length ? leftAirtimeBalances?.reduce((total, balance) => total + balance.outstandingAmount, 0) : 0;
      if (isInternational) {
        //multiply the amount with 20 for currency conversion
        leftAirtime = amount;
      } else {
        leftAirtime = amount * 20;
      }
    }
    leftAirtime = roundToTwoDigits(leftAirtime);
    return isInternational ? `${CurrencySymbol.USD}${leftAirtime}` : `${CurrencySymbol.ZAR}${leftAirtime}`;
  }

  private async buildNotificationParams(sim: Sim): Promise<BalanceNotificationType> {
    const simPlans = await this.simService.getSimPlanBySimId(sim);

    const plan = simPlans.find((plan) => this.productPlans.includes(plan.productId.name) && plan.isActive);
    const validity = simPlans.filter((plan) => this.productValidity === plan.productId.name);

    const firstActivation = validity?.length === 1 ? validity[0] : validity?.find((plan) => plan.isActive);

    const isSimNotActive = [SimStatusEnum.NotActive, SimStatusEnum.Expired].includes(sim.status);
    const airtimeBalance = await this.getAirtimeBalance(sim?.mobileNo, this.balancePayload.email, sim);
    return {
      whatsappNumber: this.balancePayload.whatsappNumber,
      simStatus: sim?.status ?? SimStatusEnum.NotActive,
      mobileNo: isSimNotActive ? 'NA' : sim?.mobileNo,
      simValidity: isSimNotActive ? 'NA' : formatDate(dateType(firstActivation.expiryDate)),
      planExpireDate: isSimNotActive ? 'NA' : formatDate(dateType(plan.expiryDate)),
      leftAirtime: isSimNotActive ? 'NA' : airtimeBalance,
      startDate: isSimNotActive ? 'NA' : formatDate(dateType(plan?.startDate)),
      unlimitedPlan: isSimNotActive ? 'NA' : plan.productVariantId?.sku,
      action: Actions.Wati,
    };
  }

  async checkBalance(): Promise<void> {
    await this.simService.ormInit();

    this.balancePayload['selectedOption'] =
      `${this.balancePayload?.selectedOption}`.toLowerCase() === 'yes' ? '1' : this.balancePayload?.selectedOption;

    const customer = await this.simService.getCustomerByEmail(this.balancePayload?.email);
    const validator = new ValidatorBase(BalancePayload as ValidationRequestType);
    await validator.ormInit();
    const simNumbers = await validator.getSimNumberByCustomer(customer);
    const selectedSim = simNumbers[+this.balancePayload?.selectedOption - 1];
    const notification = await this.buildNotificationParams(selectedSim);

    await this.queueProcess(SQSTypes.notification, notification, Templates.balanceCheck);
    await this.simService.closeConnection();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async queueProcess(queueName: KeyType, notificationData: any = {}, templateName?: string): Promise<any> {
    const queue = await super.pushToQueue(queueName, {
      templateName,
      ...notificationData,
    });

    // Delay the execution 3 seconds, Otherwise notification receiving order might be changed.
    super.delay(3000);
    return queue;
  }
}
