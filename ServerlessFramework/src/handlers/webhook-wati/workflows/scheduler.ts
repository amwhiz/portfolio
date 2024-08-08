import SchedulerClient from '@aw/scheduler';
import { ScheduleType } from '@aw/scheduler/types/schedule';
import { convertTimeToDate, dateNow, getTime } from 'src/helpers/dates';
import { ScheduleTargetEnum } from '@aw/scheduler/enums/scheduleTarget';
import { WorkflowBase } from './pushToQueue';
import { KeyType } from '@aw/env';
import SimService from '@handlers/sim/sim';
import { SQSTypes } from 'src/constants/sqs';
import { LoggerService } from '@aw/logger';

export default class EventScheduler extends WorkflowBase {
  private simService: SimService;
  private logger = new LoggerService({ serviceName: EventScheduler.name });

  constructor() {
    super();
    this.simService = new SimService();
  }

  async createActivity<T>(schedule, payload: T, scheduleAt: string): Promise<void> {
    await this.simService.createSimActivity({
      isComplete: false,
      isScheduled: true,
      scheduledAt: convertTimeToDate(scheduleAt),
      productVariantId: payload?.['productVariantId']?.id,
      eCommerceproductVariantId: payload?.['variantId']?.id,
      scheduleId: schedule?.['id'],
      simId: payload?.['simId']?.id ?? payload?.['simId'],
    });
  }

  async updateActivity(activityId: number): Promise<void> {
    const activityDocument = await this.simService.getSimActivityById(activityId);
    await this.simService.updateSimActivity(activityDocument, {
      isComplete: true,
      completedAt: dateNow('Date') as Date,
    });
  }

  // scheduleAt use scheduleTime and scheduleTimeWithThirtyMinutes
  async createEvent<T extends object>(payload: T, name: string, scheduleAt: string): Promise<void> {
    await this.simService.ormInit();
    const schedulerClient = new SchedulerClient();

    const eventSchedulePayload: ScheduleType<T> = {
      name: `${name}-${getTime(dateNow('Date'))}`,
      ActionAfterCompletion: 'DELETE',
      scheduleExpressAt: scheduleAt,
      scheduleTargetType: ScheduleTargetEnum.LAMBDA,
      data: payload,
      description: name,
    };

    const event = await schedulerClient.scheduleEvent(eventSchedulePayload);
    await this.createActivity<T>(event, payload, scheduleAt);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async sendToQueue(payload: any): Promise<void> {
    try {
      await this.simService.ormInit();

      if (payload?.activityId) await this.updateActivity(payload?.activityId);

      if (payload?.isEcommerceRecharge) await this.queueProcess(SQSTypes.eCommerceRecharge, payload);
      else await this.queueProcess(SQSTypes.recharge, payload);
      await this.simService.closeConnection();
    } catch (e) {
      // eslint-disable-next-line no-console
      this.logger.error(e);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async queueProcess(queueName: KeyType, notificationData: any = {}, templateName?: string): Promise<any> {
    delete notificationData.body;

    const queue = await super.pushToQueue(queueName, {
      templateName,
      ...notificationData,
    });

    // Delay the execution 3 seconds, Otherwise notification receiving order might be changed.
    await super.delay(3000);
    return queue;
  }
}
