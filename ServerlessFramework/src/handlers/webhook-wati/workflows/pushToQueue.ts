/* eslint-disable @typescript-eslint/no-explicit-any */
import { AwSQS } from '@aw/sqs';
import { QueueType } from '@aw/sqs/enums/queueType';
import { QueueConfigType } from '@aw/sqs/types/queueConfig';
import { KeyType, env } from '@aw/env';

export class WorkflowBase {
  private sqsClient: AwSQS;

  constructor() {
    this.sqsClient = new AwSQS();
  }

  async pushToQueue(queueName: KeyType, queueData: any): Promise<any> {
    const configType: QueueConfigType = {
      MessageDeduplicationId: queueName,
      MessageGroupId: queueName,
      Type: QueueType.FIFO,
      Url: <string>env(queueName),
    };
    return await this.sqsClient.push({ data: queueData }, configType);
  }

  async delay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
