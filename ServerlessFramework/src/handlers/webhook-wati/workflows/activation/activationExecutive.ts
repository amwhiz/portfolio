import CdsClient from '@aw/cds';
import { SimActivationType, ValidationSimRequestType } from '@aw/cds/types/validationSim';
import { SimSubTypeEnum } from '@aw/cds/enums/validationSim';
import { ConnectionTypeEnum, StatusEnum } from '@aw/cds/enums/activationSim';
import { Activated, ActivationExecutiveRequest } from './interfaces/activation';
import { PassWordCredentialsType } from '@aw/cds/types/auth';
import { GetActivationPlanResponseType } from '@aw/cds/types/activationPlan';
import { DateType } from 'src/interfaces/date';
import { ActivationSimRequestType, ActivationSimResponseType } from '@aw/cds/types/activationSim';
import { SimType } from 'src/entities/enums/common';
import { WorkflowBase } from '../pushToQueue';
import { ActivationNotificationType } from './enum/activationNotification';
import { KeyType, env } from '@aw/env';
import { ActivationNotification } from './interfaces/notification';
import { getStartDate, getTime, dateNow, findAndConvertDate, dateType, formatDateActivation, convertDayjs } from 'src/helpers/dates';
import { ActivationPayload } from './activationWorkflow';
import { SimStatusEnum } from 'src/entities/enums/sim';
import { base64ToBuffer } from 'src/helpers/base64ToBuffer';
import AwsS3Clients from '@aw/s3';
import { MetaData } from '@aw/s3/constants/metaData';
import { createdObjectInfo } from '@aw/s3/types/updatedObject';
import { findNotificationType } from 'src/helpers/findNotificationType';
import { AppError } from '@libs/api-error';
import { SQSTypes } from 'src/constants/sqs';
import { ProductVariantNameEnum, ProductVariantSkuEnum } from 'src/entities/enums/productVariant';
import SimService from '@handlers/sim/sim';
import { Checkout, Sim, SimPlan } from 'src/entities';
import { Templates } from 'src/constants/templates';
import { Actions } from 'src/enums/actions';
import { LoggerService } from '@aw/logger';
import { activationType } from './types/activation';
import { ProductNameEnum } from 'src/entities/enums/product';
import { CRMWorkFlow } from 'src/enums/workflows';
import { FormTypes } from '@handlers/portal/sales/enums/forms';
import { DeviceType } from '../enum/deviceType';
import { Countries } from 'src/constants/countries';

export default class ActivationExecute extends WorkflowBase {
  private cdsServices: CdsClient;
  private activation: ActivationPayload = {};
  private S3Client: AwsS3Clients;
  private bucketName: string = env('bucketName') as string;
  private simService: SimService;
  private logger = new LoggerService({ serviceName: ActivationExecute.name });

  constructor() {
    super();
    this.cdsServices = new CdsClient();
    this.S3Client = new AwsS3Clients();
    this.simService = new SimService();
  }

  private simActivationBuild(
    activationPlan: GetActivationPlanResponseType,
    simNo: string,
    travelDate: string,
    email: string,
    credentials: PassWordCredentialsType
  ): ActivationSimRequestType {
    return {
      ...credentials,
      ProfileId: activationPlan?.profileId,
      Profile: activationPlan?.profile,
      ServiceTypeId: activationPlan?.serviceTypeId,
      ServiceType: activationPlan?.serviceType,
      ServiceId: activationPlan?.serviceId,
      Service: activationPlan?.service,
      Price: activationPlan?.price,
      SIMType: 'Others',
      SIMNo: simNo,
      EmailID: email,
      ValidityDays: activationPlan?.validityDays,
      OtherBenefits: activationPlan?.otherBenefits,
      AddtionalBenefit: activationPlan?.addtionalBenefit, // For now implementation. In future bijo update correction.
      ConnectionType: ConnectionTypeEnum.Individual,
      TravelDate: travelDate,
    };
  }

  private async uploadQR(qr: string): Promise<createdObjectInfo> {
    // eslint-disable-next-line no-undef, @typescript-eslint/no-unused-vars
    const imageBuffer: Buffer = base64ToBuffer(qr);
    const s3 = await this.S3Client.uploadFile(this.bucketName, imageBuffer, MetaData);
    return s3;
  }

  private parseQRCode(qrCode: string): string[] {
    return qrCode.split('$');
  }

  private async buildAndSendActivationNotification(
    notificationType: string,
    mobileNo: string,
    simType: SimType,
    validateSimResponse: SimActivationType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any
  ): Promise<ActivationNotification> {
    const params: ActivationNotification = {
      whatsappNumber: payload.whatsappNumber,
      mobileNo: mobileNo,
      action: Actions.Wati,
    };

    if (simType === SimType.eSIM) {
      const [smtpAddress, activationCode] = this.parseQRCode(<string>validateSimResponse.QRCode);
      params.smtps = smtpAddress;
      params.activationCode = activationCode;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const s3Response: createdObjectInfo = await this.uploadQR(<string>validateSimResponse.QR);

      params.qrImage = s3Response.url;

      params.device = payload.device;
    }

    const templateName = findNotificationType(notificationType, simType, payload.device, payload.checkoutId.flowName);

    await this.queueProcess(SQSTypes.notification, params, templateName);
    return params;
  }

  private async buildAndSendActivationMail(
    mobileNo: string,
    simType: SimType,
    validateSimResponse: SimActivationType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: ActivationExecutiveRequest,
    simPlans: SimPlan[],
    customer
  ): Promise<void> {
    let templateName: string = '';
    const simPlan = simPlans?.length ? simPlans[0] : [];
    let airtime: ProductVariantSkuEnum | string = simPlan?.['simId']?.['countryFrom'] === Countries.Africa ? 'R0' : '$0';
    let simValidity: ProductVariantSkuEnum | undefined;

    simPlans.forEach((plan) => {
      if (plan.productVariantId.name.includes(ProductVariantNameEnum.AirTime)) {
        airtime = plan.productVariantId.sku;
      } else if (plan.productVariantId.name.includes(ProductVariantNameEnum.SimValidity)) {
        simValidity = plan.productVariantId.sku;
      }
    });
    const params = {
      email: payload.email,
      action: Actions.Email,
      name: customer.firstName,
      mobileNo: mobileNo,
      plan: payload.plan,
      airtime: airtime,
      simValidity: simValidity,
      planStartDate: formatDateActivation(convertDayjs(payload.planStartDate)),
    };
    if (simType === SimType.eSIM) {
      const [smtpAddress, activationCode] = this.parseQRCode(<string>validateSimResponse.QRCode);
      const qrCodeSplit = validateSimResponse.QR.split(',');
      const qrCode = qrCodeSplit?.length ? qrCodeSplit[1] : '';

      params['smtpAddress'] = smtpAddress;
      params['activationCode'] = activationCode;
      params['inlineImages'] = qrCode;
      templateName = Templates.esimActivationMail;
    } else {
      templateName = Templates.psimActivationMail;
    }
    await this.queueProcess(SQSTypes.emailNotification, params, templateName);
  }

  private getDate(planStartDate: string | Date): DateType {
    const today = dateNow('Date');
    return {
      startDateEpochTime: getTime(planStartDate),
      currentEpochTime: getTime(today),
      startPlanDate: getStartDate(planStartDate),
      todayDate: getStartDate(today),
    };
  }

  private async updateSimActivity(selectedPlan: ActivationExecutiveRequest): Promise<void> {
    const productVariant = await this.simService.getProductVariantBySku(this.activation.plan as ProductVariantSkuEnum);
    const simActivity = await this.simService.getSimActivityById(undefined, selectedPlan?.simPlanPlan?.simId, productVariant);
    if (!simActivity) return;
    await this.simService.updateSimActivity(simActivity, {
      isComplete: true,
      completedAt: dateNow('Date') as Date,
    });
  }

  private async updateSim(updateSim: Activated): Promise<void> {
    await this.simService.updateSim(<number>this.activation?.simId?.id, updateSim);

    const simPlan = (await this.simService.getSimPlanBySimId(<Sim>this.activation?.simId)).find(
      (variant) => variant.productId.name === ProductNameEnum.UnlimitedPlans
    );
    const updateSimPlanProp = {
      isActive: true,
    };

    await this.simService.updateSimPlan(<SimPlan>simPlan, updateSimPlanProp);
  }

  // Global Activation
  private async GlobalActivation(activation: activationType): Promise<ActivationSimResponseType> {
    const doActivationPayload = this.simActivationBuild(activation.plan, activation.simNo, activation.date, activation.email, activation.credentials);
    const doActivate = await this.cdsServices.activateSim(true, doActivationPayload, activation?.email);
    return doActivate;
  }

  async doActivation(payload: ActivationExecutiveRequest): Promise<void> {
    await this.simService.ormInit();
    try {
      const selectedPlan: SimPlan | undefined = payload?.simPlanPlan;
      this.activation = {
        simId: selectedPlan?.simId,
        plan: payload?.plan,
        checkoutId: payload?.checkoutId,
      };

      const customer = this.activation?.simId?.customerId;

      const date = this.getDate(<Date>selectedPlan?.startDate);

      const travelDate = formatDateActivation(dateType(findAndConvertDate(date.startPlanDate)));
      const simType: SimType | undefined = payload?.simType;

      const credentials: PassWordCredentialsType = this.cdsServices.getCredentials();

      const validateSim: ValidationSimRequestType = {
        SimNo: <string>payload?.serialNumber || '',
        SimSubType: simType === SimType.pSIM ? SimSubTypeEnum.Physical : SimSubTypeEnum.eSIM,
        ...credentials,
      };

      const validateSimAlreadyTaken = await this.cdsServices.validateSim(true, validateSim, <string>customer?.email);
      const validateMessageData = validateSimAlreadyTaken.MessageData as SimActivationType[];
      if (validateSimAlreadyTaken.Status !== StatusEnum.Success && !validateMessageData?.length) {
        return await this.queueProcess(
          SQSTypes.notification,
          {
            action: Actions.Wati,
            whatsappNumber: payload.whatsappNumber,
          },
          Templates.sendSerialNumberError
        );
      }
      const simValidateMessageData = validateSimAlreadyTaken.MessageData[0] as SimActivationType;
      const productVariant = await this.simService.getProductVariantBySku(this.activation.plan as ProductVariantSkuEnum);
      this.activation.productVariant = productVariant;
      // If data only update the region id.
      const getPlanId = productVariant?.planId;
      if (!getPlanId) {
        return await this.queueProcess(
          SQSTypes.notification,
          {
            action: Actions.Wati,
            whatsappNumber: payload.whatsappNumber,
            buttons: ['Chat to support'],
          },
          Templates.sendCommonError
        );
      }

      const currentPlan = await this.cdsServices.getActivationPlans(true, payload?.email, getPlanId);
      if (!currentPlan?.length) {
        return await this.queueProcess(
          SQSTypes.notification,
          {
            action: Actions.Wati,
            whatsappNumber: payload.whatsappNumber,
            buttons: ['Chat to support'],
          },
          Templates.sendCommonError
        );
      }

      const activationPayload = {
        plan: currentPlan[0],
        simNo: simValidateMessageData?.SimNo,
        date: travelDate,
        email: payload.email,
        credentials,
        customer,
      };

      const doActivate: ActivationSimResponseType = await this.GlobalActivation(<activationType>activationPayload);

      if (doActivate.Status !== StatusEnum.Success) {
        return await this.queueProcess(
          SQSTypes.notification,
          {
            action: Actions.Wati,
            whatsappNumber: payload.whatsappNumber,
            buttons: ['Chat to support'],
          },
          Templates.sendCommonError
        );
      }

      const mobileNoRegex: RegExpMatchArray | null = doActivate.MessageData.match(/New Mobile No : (\d+)/);
      const mobileNo: string | null = mobileNoRegex?.length ? mobileNoRegex[1] : null;
      const notification: ActivationNotification = await this.buildAndSendActivationNotification(
        ActivationNotificationType.activation,
        <string>mobileNo,
        <SimType>simType,
        simValidateMessageData,
        payload
      ); // Activation

      await super.delay(2000);

      await this.buildAndSendActivationNotification(
        ActivationNotificationType.instruction,
        <string>mobileNo,
        <SimType>simType,
        simValidateMessageData,
        payload
      ); // Instruction

      if (payload?.checkoutId?.flowName === FormTypes.CompleteSim) {
        payload.device = DeviceType.iPhone;
        await this.buildAndSendActivationNotification(
          ActivationNotificationType.instruction,
          <string>mobileNo,
          <SimType>simType,
          simValidateMessageData,
          payload
        ); // Instruction
        payload.device = null;
      }

      const simPlans = await this.simService.getSimPlanBySimId(this.activation.simId);
      await this.buildAndSendActivationMail(mobileNo, simType, simValidateMessageData, payload, simPlans, customer);

      const qr = simValidateMessageData?.['QRCode']?.split('$');

      const simActivated = {
        qrCode: simValidateMessageData?.['QR'],
        smtps: qr?.length ? qr[0] : null,
        activationCode: qr?.length ? qr[1] : null,
        mobileNo: mobileNo,
        status: SimStatusEnum.Active,
        activatedAt: dateNow('Date') as Date,
        qrImageUrl: notification?.qrImage,
        serialNumber: simValidateMessageData?.SimNo,
        contactId: this.activation?.checkoutId?.contactId,
        dealId: this.activation?.checkoutId?.dealId,
        simId: this.activation?.checkoutId?.simId,
      } as Sim;

      await this.updateSim(<Activated>simActivated);
      await this.updateSimActivity(payload);

      await this.queueProcess(SQSTypes.crm, {
        checkoutId: this.activation?.checkoutId?.id as unknown as Checkout,
        flowName: CRMWorkFlow.Activation,
        simId: this.activation?.simId?.id,
      });

      await this.simService.closeConnection();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      this.logger.error(e);
      await this.simService.closeConnection();
      throw new AppError(e?.message, 400);
    }
  }

  private async queueProcess(queueName: KeyType, notificationData: Partial<ActivationExecutiveRequest> = {}, templateName?: string): Promise<void> {
    await super.pushToQueue(queueName, {
      templateName,
      ...notificationData,
    });

    // Delay the execution 3 seconds, Otherwise notification receiving order might be changed.
    super.delay(3000);
  }
}
