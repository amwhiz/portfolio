import { FormTypes } from '@handlers/portal/sales/enums/forms';
import { ActivationNotificationType } from '@handlers/webhook-wati/workflows/activation/enum/activationNotification';
import { DeviceType } from '@handlers/webhook-wati/workflows/enum/deviceType';
import { Templates } from 'src/constants/templates';
import { SimType } from 'src/entities/enums/common';

export const findNotificationType = (notificationType: string, simType: SimType, device: DeviceType, flowName: string): string => {
  if (notificationType === ActivationNotificationType.activation) {
    if (simType === SimType.eSIM) {
      if (flowName === FormTypes.CompleteSim) return Templates.completeSimActivation;
      else if (device === DeviceType.iPhone) return Templates.esimActivation;
      else return Templates.esimActivationAndroid;
    } else if (simType === SimType.pSIM) return Templates.psimActivation;
  }

  if (notificationType === ActivationNotificationType.instruction) {
    if (simType === SimType.eSIM && device === DeviceType.iPhone) {
      return Templates.esimIosActivationInstruction;
    } else if (simType === SimType.eSIM) {
      return Templates.esimAndroidActivationInstruction;
    } else if (simType === SimType.pSIM) {
      if (device === DeviceType.iPhone) return Templates.psimIosActivationInstruction;
      else if (device === DeviceType.oppo) return Templates.psimOppoActivationInstruction;
      else if (device === DeviceType.xiaomi) return Templates.psimXiaomiActivationInstruction;
      else return Templates.psimAndroidActivationInstruction;
    }
  }
};
