import { Connection, EntityManager, EntityRepository, IDatabaseDriver, QueryOrder } from '@mikro-orm/core';
import { ormInstance } from 'src/configurations/mikroOrm';
import { Sim, SimPlan, ProductsVariant, Product, Customer, Checkout } from 'src/entities';
import { ProductNameEnum, ProductSlugEnum } from 'src/entities/enums/product';
import { SimStatusEnum } from 'src/entities/enums/sim';
import { ValidationRequestType, ValidationResponseType } from './types/validator';
import { doorDeliveryDays, isFutureDate, isLessThanNDays, isPastDate } from 'src/helpers/dates';
import { ValidationTypes } from './enum/validation';
import { ResponseStatus } from './enum/response';
import { StatusCode } from '@aw/axios/enums/status-code';
import {
  generateConfirmationMessage,
  generateConfirmationMessageForSelectedOption,
  generateConfirmationMessageForSelectedOptionCheckout,
} from 'src/helpers/messages';
import { lowerCase } from 'src/helpers/nameConvention';
import CdsClient from '@aw/cds';
import { SimSubTypeEnum } from '@aw/cds/enums/validationSim';
import { PassWordCredentialsType } from '@aw/cds/types/auth';
import { SimActivationType, ValidationSimRequestType } from '@aw/cds/types/validationSim';
import { StatusEnum } from '@aw/cds/enums/activationSim';
import { WorkflowBase } from '@handlers/webhook-wati/workflows/pushToQueue';
import { ProductVariantSkuEnum } from 'src/entities/enums/productVariant';
import { PostgreSqlDriver, SqlEntityManager } from '@mikro-orm/postgresql';
import { ConfigurationService } from 'src/configurations/configService';
import { query } from '@handlers/sim/queries/query';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { Countries } from 'src/constants/countries';
import { ZONE } from 'src/entities/enums/account';
import { convertNormalDate } from 'src/helpers/convertDate';

export interface ExtendedProductsVariant {
  startDate: Date;
  checkoutId: Checkout;
}

export default class ValidatorBase extends WorkflowBase {
  private EntityManager: SqlEntityManager<PostgreSqlDriver> & EntityManager<IDatabaseDriver<Connection>>;
  private simEntity: EntityRepository<Sim>;
  private simPlanEntity: EntityRepository<SimPlan>;
  private productVariantEntity: EntityRepository<ProductsVariant>;
  private productEntity: EntityRepository<Product>;
  private customerEntity: EntityRepository<Customer>;
  private checkoutEntity: EntityRepository<Checkout>;
  private validatorPayload: ValidationRequestType;
  public iccids: string[] = [];
  private cdsServices: CdsClient;
  private initOrm = ormInstance;
  private configService: ConfigurationService;
  private customer: Customer;

  constructor(event?: ValidationRequestType) {
    super();
    if (event?.['email']) event['email'] = lowerCase(event?.['email']);
    this.validatorPayload = event;
    this.configService = ConfigurationService.getInstance();
  }

  async ormInit(): Promise<void> {
    const orm = await this.initOrm.initialize();
    this.EntityManager = orm.em;
    this.simEntity = this.EntityManager.getRepository(Sim);
    this.simPlanEntity = this.EntityManager.getRepository(SimPlan);
    this.productVariantEntity = this.EntityManager.getRepository(ProductsVariant);
    this.productEntity = this.EntityManager.getRepository(Product);
    this.customerEntity = this.EntityManager.getRepository(Customer);
    this.checkoutEntity = this.EntityManager.getRepository(Checkout);
  }

  async closeConnection(): Promise<void> {
    await this.initOrm.closeConnection();
  }

  async getCustomerByEmail(email: string): Promise<Customer> {
    return await this.customerEntity.findOne({ email: email });
  }

  private async getPlanProductVariants(): Promise<ProductsVariant[]> {
    const productDocument = await this.productEntity.find({
      slug: {
        $in: [ProductSlugEnum.UnlimitedPlans] as ProductSlugEnum[],
      },
    });

    const productVariantDocuments = await this.productVariantEntity.find({
      productId: {
        $in: productDocument,
      },
    });

    return productVariantDocuments;
  }

  private async getSimValidityProductVariants(): Promise<ProductsVariant> {
    const productDocument = await this.productEntity.findOne({
      slug: ProductSlugEnum.SimValidity,
    });

    const productVariantDocument = await this.productVariantEntity.findOne({
      productId: productDocument,
    });

    return productVariantDocument;
  }

  async getSimPlanBySim(sims: Sim): Promise<SimPlan | void> {
    try {
      return await this.simPlanEntity.findOne({
        $and: [
          {
            simId: sims,
          },
          {
            productVariantId: await this.getSimValidityProductVariants(),
          },
        ],
      });
    } catch (e) {
      return;
    }
  }

  async getSimPlanByCustomer(customer: Customer): Promise<SimPlan[]> {
    try {
      const sims = await this.simEntity.find({
        customerId: customer,
        status: SimStatusEnum.NotActive,
      });

      const productVariants = await this.getPlanProductVariants();

      const plans = await this.simPlanEntity.find(
        {
          $and: [
            {
              simId: sims,
            },
            {
              productId: productVariants.map((res) => res.productId),
            },
            // {
            //   startDate: {
            //     $gte: currentDateAtMidnight('Date'),
            //   },
            // }, //TODO ** Need clarification
          ],
        },
        {
          orderBy: {
            createdAt: -1,
          },
          populate: true,
        }
      );
      return plans;
    } catch (e) {
      return [];
    }
  }

  async getPlansByCheckout(customer: Customer, type: ValidationTypes): Promise<(Partial<ProductsVariant> & ExtendedProductsVariant)[]> {
    try {
      const notPaidCheckouts = await this.checkoutEntity.find({
        customerId: customer,
        isPaid: false,
      });

      const plans: (Partial<ProductsVariant> & ExtendedProductsVariant)[] = [];
      for await (const checkout of notPaidCheckouts) {
        // Extract product variant IDs from the checkout
        const productVariantIds = checkout.productsVariantId;
        const variants = await this.productVariantEntity.find(
          {
            id: {
              $in: productVariantIds,
            },
          },
          {
            populate: true,
          }
        );

        const plan = variants.find((variant) => variant.productId.name === ProductNameEnum.UnlimitedPlans);
        if (type === ValidationTypes.partnerFreeSim) {
          if (plan?.sku === ProductVariantSkuEnum['1GbFreeOffer']) {
            plans.push({ ...(plan ?? {}), startDate: <Date>convertNormalDate(checkout.planStartDate), checkoutId: checkout });
          }
        } else if (type === ValidationTypes.partnerBuySim) {
          plans.push({ ...(plan ?? {}), startDate: <Date>convertNormalDate(checkout.planStartDate), checkoutId: checkout });
        }
      }
      return plans;
    } catch (e) {
      return [];
    }
  }

  async getSimNumberByCustomer(customer: Customer): Promise<Sim[]> {
    const sims = await this.EntityManager.execute(query.getActiveSims, [customer.id]);
    const processedSims = [];
    for (const sim of sims) {
      const result = await this.simEntity.findOne({ id: sim.id }, { populate: true });
      processedSims.push(result);
    }
    return processedSims;
  }

  private validateDate(): ValidationResponseType {
    const isPast = isPastDate(this.validatorPayload.date);
    return {
      data: isPast ? ResponseStatus.Failure : ResponseStatus.Success,
      statusCode: isPast ? StatusCode.BadRequest : StatusCode.Success,
    };
  }

  private getSelectedOptionsNumber(): string | number {
    return `${this.validatorPayload?.selectedOption}`.toLowerCase() === 'yes' ? '1' : this.validatorPayload?.selectedOption;
  }

  private async checkSimExpired(): Promise<ValidationResponseType> {
    const customer = await this.getCustomerByEmail(this.validatorPayload.email);
    if (!customer?.email) return { data: ResponseStatus.NotFound, statusCode: StatusCode.BadRequest };

    const simNumbers = await this.getSimNumberByCustomer(customer);
    const simDocument = simNumbers[+this.getSelectedOptionsNumber() - 1];

    const simPlanDocument = (await this.getSimPlanBySim(simDocument)) as SimPlan;

    const isSimNotExpired = isFutureDate(simPlanDocument.expiryDate, this.validatorPayload.date);

    return {
      data: isSimNotExpired ? ResponseStatus.Failure : ResponseStatus.Success,
      statusCode: isSimNotExpired ? StatusCode.Precondition : StatusCode.Success,
    };
  }

  private async getSimNumbersByEmail(): Promise<ValidationResponseType> {
    const customer = await this.getCustomerByEmail(this.validatorPayload.email);
    if (!customer?.email) return { data: ResponseStatus.NotFound, statusCode: StatusCode.BadRequest };

    const simNumbers = await this.getSimNumberByCustomer(customer);

    if (!simNumbers?.length) return { data: ResponseStatus.NotActivated, statusCode: StatusCode.BadRequest };

    const confirmationMessage = generateConfirmationMessage(simNumbers, this.validatorPayload.type);

    return {
      data: confirmationMessage,
      statusCode: simNumbers.length === 1 ? StatusCode.Accepted : StatusCode.Success,
    };
  }

  private async getPlansByEmail(): Promise<ValidationResponseType> {
    const customer = await this.getCustomerByEmail(this.validatorPayload.email);
    if (!customer?.email) return { data: ResponseStatus.NotFound, statusCode: StatusCode.BadRequest };

    const plans = await this.getSimPlanByCustomer(customer);

    if (!plans?.length) return { data: ResponseStatus.NotFound, statusCode: StatusCode.BadRequest };

    const confirmationMessage = generateConfirmationMessageForSelectedOption(plans);

    return {
      data: confirmationMessage,
      statusCode: plans?.length === 1 ? StatusCode.Accepted : StatusCode.Success,
    };
  }

  private async hasCustomerBoughtFreeSims(): Promise<boolean> {
    const freeSimProductVariant = await this.productVariantEntity.findOne({
      sku: ProductVariantSkuEnum['1GbFreeOffer'],
    });

    const parameters = [this.validatorPayload?.email, this.validatorPayload?.whatsappNumber, freeSimProductVariant.id];
    const hasCustomerBought = await this.EntityManager.execute(query.checkPlanExistence, parameters);

    return hasCustomerBought?.length ? hasCustomerBought[0]['canbuyanotherfreesim'] : true;
  }

  //Check if the customer has already acquired a free SIM card.
  public async hasCustomerBoughtFreeSim(): Promise<ValidationResponseType> {
    // Verify whether the customer is part of the NTC team, and if they are, skip the process.
    const hasBoughtFreeSim: boolean = await this.hasCustomerBoughtFreeSims();

    const ntcTeamEmail = (await this.configService.getValue('ntcTeamEmail')) as string[];
    const ntcTeamWhatsapp = (await this.configService.getValue('ntcTeamWhatsapp')) as string[];
    const isNTCTeam = ntcTeamEmail?.includes(this.validatorPayload.email) || ntcTeamWhatsapp?.includes(this.validatorPayload.whatsappNumber);

    if (isNTCTeam || ['@amwhiz.com', 'nextsim.travel'].includes(this.validatorPayload?.email)) {
      return {
        data: ResponseStatus.Success,
        statusCode: StatusCode.Success,
      };
    }

    return {
      data: hasBoughtFreeSim ? ResponseStatus.Success : ResponseStatus.Failure,
      statusCode: hasBoughtFreeSim ? StatusCode.Success : StatusCode.BadRequest,
    };
  }

  private async validateSelectedNumbersCountByPartner(customer: Customer): Promise<ValidationResponseType> {
    const plansCheckout = await this.getPlansByCheckout(customer, this.validatorPayload?.type as ValidationTypes);
    if (!plansCheckout[+this.validatorPayload.selectedOption - 1]) {
      return {
        data: ResponseStatus.Failure,
        statusCode: StatusCode.BadRequest,
      };
    }
    return { data: ResponseStatus.Success, statusCode: StatusCode.Success };
  }

  private async validateSelectedNumbersCount(): Promise<ValidationResponseType> {
    const customer = await this.getCustomerByEmail(this.validatorPayload.email);
    if (!customer?.email) return { data: ResponseStatus.NotFound, statusCode: StatusCode.BadRequest };

    if ([ValidationTypes.partnerBuySim, ValidationTypes.partnerFreeSim].includes(this.validatorPayload?.type as ValidationTypes))
      return await this.validateSelectedNumbersCountByPartner(customer);

    if (this.validatorPayload.type === ValidationTypes.topup && this.validatorPayload.date) {
      if (this.validateDate().data === ResponseStatus.Failure)
        return {
          data: ResponseStatus.Failure,
          statusCode: StatusCode.BadRequest,
        };
      return await this.checkSimExpired();
    }

    if (this.validatorPayload.type === ValidationTypes.activation) {
      const plans = await this.getSimPlanByCustomer(customer);
      if (!plans?.length || !plans[+this.getSelectedOptionsNumber() - 1]) return { data: ResponseStatus.Failure, statusCode: StatusCode.BadRequest };
    } else if (this.validatorPayload.type !== ValidationTypes.activation) {
      const simNumbers = await this.getSimNumberByCustomer(customer);
      if (!simNumbers?.length || !simNumbers[+this.getSelectedOptionsNumber() - 1])
        return { data: ResponseStatus.Failure, statusCode: StatusCode.BadRequest };
    }

    return { data: ResponseStatus.Success, statusCode: StatusCode.Success };
  }

  async serialNumberValidate(): Promise<ValidationResponseType> {
    this.cdsServices = new CdsClient();
    if (this.iccids.includes(this.validatorPayload.serialNumber)) return { data: ResponseStatus.NoContent, statusCode: StatusCode.NoContent };
    const credentials: PassWordCredentialsType = this.cdsServices.getCredentials();
    const validateSim: ValidationSimRequestType = {
      SimNo: this.validatorPayload?.serialNumber,
      SimSubType: SimSubTypeEnum.Physical,
      ...credentials,
    };

    const validateSimAlreadyTaken = await this.cdsServices.validateSim(true, validateSim, this.validatorPayload?.email);
    const validateMessageData = validateSimAlreadyTaken.MessageData as SimActivationType[];
    if (validateSimAlreadyTaken)
      if (validateSimAlreadyTaken.Status === StatusEnum.Success && !validateMessageData?.length)
        return { data: ResponseStatus.Success, statusCode: StatusCode.Created };
    return { data: ResponseStatus.Success, statusCode: StatusCode.Success };
  }

  async getPlanByCustomer(type: ValidationTypes): Promise<ValidationResponseType> {
    const customer = await this.getCustomerByEmail(this.validatorPayload.email);
    if (!customer?.email) return { data: ResponseStatus.NotFound, statusCode: StatusCode.BadRequest };

    const plans = await this.getPlansByCheckout(customer, type);

    if (!plans?.length) return { data: ResponseStatus.NotFound, statusCode: StatusCode.BadRequest };

    const confirmationMessage = generateConfirmationMessageForSelectedOptionCheckout(plans);

    return {
      data: confirmationMessage,
      statusCode: plans?.length === 1 ? StatusCode.Accepted : StatusCode.Success,
    };
  }

  private async isSuspendedCustomer(): Promise<ValidationResponseType> {
    this.customer = await this.customerEntity.findOne({ email: this.validatorPayload.email }, { populate: true });
    if (this.customer?.is_misused) return { data: ReasonPhrases.FORBIDDEN, statusCode: StatusCodes.FORBIDDEN };
    return { data: ResponseStatus.Success, statusCode: StatusCode.Created };
  }

  private async getCustomerRegionStatusCode(): Promise<ValidationResponseType> {
    const sim = await this.simEntity.find(
      {
        customerId: this.customer,
      },
      {
        orderBy: {
          createdAt: QueryOrder.DESC,
        },
      }
    );

    const countryStatus = sim[0]?.customerId?.accountId?.zone === 0 || sim[0]?.countryFrom === Countries.Africa ? 200 : 201;
    const statusCode = sim?.length ? countryStatus : 200;
    return {
      data: ReasonPhrases.OK,
      statusCode: statusCode,
    };
  }

  private getPartnerRegionStatusCode(): ValidationResponseType {
    const countryStatus = this.customer?.accountId?.zone === ZONE.Domestic ? 200 : 201;
    return {
      data: ReasonPhrases.OK,
      statusCode: countryStatus,
    };
  }

  private doorDeliveryPlanStartDate(): ValidationResponseType {
    const isLesserThanTwoDays = isLessThanNDays(this.validatorPayload.planStartDate, doorDeliveryDays);

    return {
      data: isLesserThanTwoDays ? ReasonPhrases.OK : ReasonPhrases.BAD_REQUEST,
      statusCode: isLesserThanTwoDays ? StatusCodes.OK : StatusCodes.BAD_REQUEST,
    };
  }

  async customerValidate(): Promise<ValidationResponseType> {
    if (this.validatorPayload?.email) {
      const status = await this.isSuspendedCustomer();
      if (status?.statusCode === StatusCodes.FORBIDDEN) return status;
    }
    if (this.validatorPayload?.type === ValidationTypes.region && this.validatorPayload?.email) return await this.getCustomerRegionStatusCode();
    if (this.validatorPayload?.type === ValidationTypes.partnerRegion && this.validatorPayload?.email) return this.getPartnerRegionStatusCode();
    if (this.validatorPayload.serialNumber) return await this.serialNumberValidate();
    if (Number(this.validatorPayload.selectedOption) === 0) return { data: ResponseStatus.Failure, statusCode: StatusCode.BadRequest };
    if (this.validatorPayload.selectedOption && this.validatorPayload.type) return this.validateSelectedNumbersCount();
    if (this.validatorPayload?.date) return this.validateDate();

    if (this.validatorPayload.type && this.validatorPayload?.type === ValidationTypes.buy) return await this.hasCustomerBoughtFreeSim();
    if (this.validatorPayload.type && this.validatorPayload?.planStartDate && this.validatorPayload?.type === ValidationTypes.doorDelivery)
      return this.doorDeliveryPlanStartDate();

    if (this.validatorPayload?.type && this.validatorPayload?.type === ValidationTypes.partnerFreeSim)
      return await this.getPlanByCustomer(ValidationTypes.partnerFreeSim);
    if (this.validatorPayload?.type && this.validatorPayload?.type === ValidationTypes.partnerBuySim)
      return await this.getPlanByCustomer(ValidationTypes.partnerBuySim);
    if (this.validatorPayload?.type && this.validatorPayload?.type !== ValidationTypes.activation) return await this.getSimNumbersByEmail();
    else if (this.validatorPayload?.type && this.validatorPayload?.type === ValidationTypes.activation) return await this.getPlansByEmail();
    return { data: ResponseStatus.Success, statusCode: StatusCode.Success };
  }
}
