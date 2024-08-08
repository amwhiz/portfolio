import { ValidationTypes } from '@handlers/validator/enum/validation';
import { dateType, formatDate } from './dates';
import { ProductsVariant, Sim, SimPlan } from 'src/entities';
import { ExtendedProductsVariant } from '@handlers/validator/validator';

// Generate confirmation message for select mobile number option for activation.
export const generateConfirmationMessage = (activeMobileNumbers: Sim[], actionType: string): string => {
  const numberOfSims = activeMobileNumbers.length;
  if (numberOfSims === 1) {
    return `We found an active sim on this email with mobile number ${activeMobileNumbers[0].mobileNo}. Pls confirm do you want to ${actionType} for the same`;
  } else if (numberOfSims > 1) {
    let text = `We found ${numberOfSims} active sims on this email with mobile number as follows.\n\nPls confirm on what number you want to ${actionType}?\n\n`;

    activeMobileNumbers.forEach((number, index) => {
      text += `${index + 1}. ${number.mobileNo}\n`;
    });

    text += '\nRespond with number alone. Eg 1 for first number';
    return text;
  }
};

// Generate confirmation message for select plan option for activation.
export const generateConfirmationMessageForSelectedOption = (plans: SimPlan[]): string => {
  const activation = ValidationTypes.activation;
  const totalPlans = plans.length;
  if (totalPlans === 1) {
    const selectedPlan = plans[0];
    return `We found an active plan on this email: *${selectedPlan.productVariantId.name}* purchased on *${formatDate(
      dateType(selectedPlan.startDate)
    )}*. Pls confirm do you want to ${activation} for the same`;
  } else if (totalPlans > 1) {
    let text = `We found ${totalPlans} active plans on this email as follows.\n\nPls confirm on what plan you want to ${activation}?\n\n`;

    plans.forEach((doc, index) => {
      text += `${index + 1}. ${doc.productVariantId.name} purchased on ${formatDate(dateType(doc?.startDate))}\n`;
    });

    text += '\nRespond with number alone. Eg 1 for first plan';
    return text;
  }
};

// Generate confirmation message for select plan option for activation.
export const generateConfirmationMessageForSelectedOptionCheckout = (plans: (Partial<ProductsVariant> & ExtendedProductsVariant)[]): string => {
  const activation = ValidationTypes.activation;
  const totalPlans = plans.length;
  if (totalPlans === 1) {
    const selectedPlan = plans[0];
    return `We found an active plan on this email: *${selectedPlan.sku}* purchased on *${formatDate(
      dateType(selectedPlan.startDate)
    )}*. Pls confirm do you want to ${activation} for the same`;
  } else if (totalPlans > 1) {
    let text = `We found ${totalPlans} active plans on this email as follows.\n\nPls confirm on what plan you want to ${activation}?\n\n`;

    plans.forEach((doc, index) => {
      text += `${index + 1}. ${doc.sku} purchased on ${formatDate(dateType(doc?.startDate))}\n`;
    });

    text += '\nRespond with number alone. Eg 1 for first plan';
    return text;
  }
};
