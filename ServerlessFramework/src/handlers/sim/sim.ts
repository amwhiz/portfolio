import { Connection, EntityManager, EntityRepository, IDatabaseDriver, QueryOrder, wrap } from '@mikro-orm/core';
import { SqlEntityManager, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { ormInstance } from 'src/configurations/mikroOrm';
import {
  Sim,
  SimPlan,
  LineItem,
  Order,
  Checkout,
  ProductsVariant,
  SimActivity,
  Product,
  Customer,
  Address,
  CommissionConfiguration,
  Commissions,
} from 'src/entities';
import { BillingTransactions } from 'src/entities/billingTransaction';
import { Configuration } from 'src/entities/configuration';
import { CustomerReferral } from 'src/entities/customerReferral';
import { EcommerceProductsVariant } from 'src/entities/eCommerceProductVariant';
import { SourceEnum } from 'src/entities/enums/customer';
import { ProductSlugEnum } from 'src/entities/enums/product';
import { ProductVariantCurrencyEnum, ProductVariantSkuEnum } from 'src/entities/enums/productVariant';
import { SimStatusEnum } from 'src/entities/enums/sim';
import { WorkflowEnum } from 'src/enums/workflows';

export default class SimService {
  private EntityManager: SqlEntityManager<PostgreSqlDriver> & EntityManager<IDatabaseDriver<Connection>>;
  private simEntity: EntityRepository<Sim>;
  private simPlanEntity: EntityRepository<SimPlan>;
  private simActivityEntity: EntityRepository<SimActivity>;
  private lineItemEntity: EntityRepository<LineItem>;
  private orderEntity: EntityRepository<Order>;
  private checkoutEntity: EntityRepository<Checkout>;
  private customerEntity: EntityRepository<Customer>;
  private addressEntity: EntityRepository<Address>;
  private configureEntity: EntityRepository<Configuration>;
  private productVariantEntity: EntityRepository<ProductsVariant>;
  private ecommerceVariantEntity: EntityRepository<EcommerceProductsVariant>;
  private commissionEntity: EntityRepository<Commissions>;
  private commissionConfigurationEntity: EntityRepository<CommissionConfiguration>;
  private billingTransactionEntity: EntityRepository<BillingTransactions>;
  private customerReferralEntity: EntityRepository<CustomerReferral>;
  private productEntity: EntityRepository<Product>;
  private initOrm = ormInstance;

  async ormInit(): Promise<void> {
    const orm = await this.initOrm.initialize();
    this.EntityManager = orm.em;
    this.simEntity = this.EntityManager.getRepository(Sim);
    this.simActivityEntity = this.EntityManager.getRepository(SimActivity);
    this.orderEntity = this.EntityManager.getRepository(Order);
    this.lineItemEntity = this.EntityManager.getRepository(LineItem);
    this.checkoutEntity = this.EntityManager.getRepository(Checkout);
    this.productVariantEntity = this.EntityManager.getRepository(ProductsVariant);
    this.ecommerceVariantEntity = this.EntityManager.getRepository(EcommerceProductsVariant);
    this.simPlanEntity = this.EntityManager.getRepository(SimPlan);
    this.customerEntity = this.EntityManager.getRepository(Customer);
    this.addressEntity = this.EntityManager.getRepository(Address);
    this.configureEntity = this.EntityManager.getRepository(Configuration);
    this.billingTransactionEntity = this.EntityManager.getRepository(BillingTransactions);
    this.commissionEntity = this.EntityManager.getRepository(Commissions);
    this.commissionConfigurationEntity = this.EntityManager.getRepository(CommissionConfiguration);
    this.customerReferralEntity = this.EntityManager.getRepository(CustomerReferral);
    this.productEntity = this.EntityManager.getRepository(Product);
    await this.delay(2000);
  }

  async closeConnection(): Promise<void> {
    await this.delay(1000);
    await this.initOrm.closeConnection();
  }

  // Customer
  async createCustomer(customerPayload: Partial<Customer>): Promise<Customer> {
    const customer = await this.customerEntity.upsert(customerPayload);
    await this.EntityManager.flush();
    return customer;
  }

  async getCustomerByEmail(email: string): Promise<Customer> {
    return await this.customerEntity.findOne({ email: email }, { populate: true });
  }

  async getCustomerByUniqueColumn(referralCode: string): Promise<Customer> {
    return await this.customerEntity.findOne({ referralCode: referralCode }, { populate: true });
  }

  // Address
  async createAddress(addressPayload: Partial<Address>): Promise<Address> {
    const address = await this.addressEntity.create(addressPayload);
    await this.EntityManager.flush();
    return address;
  }

  async getAddressByCustomer(customer: Customer): Promise<Address> {
    const address = await this.addressEntity.findOne(
      {
        customerId: customer?.id,
      },
      {
        orderBy: {
          createdAt: QueryOrder.DESC,
        },
      }
    );
    return address;
  }

  // Checkout
  async createCheckout(checkoutPayload: Partial<Checkout>): Promise<Checkout> {
    const checkout = await this.checkoutEntity.create(checkoutPayload);
    await this.EntityManager.flush();
    return checkout;
  }

  async getCheckoutById(checkoutId: number, populate: boolean = false): Promise<Checkout> {
    return await this.checkoutEntity.findOne(
      { id: checkoutId },
      {
        populate,
      }
    );
  }

  async getCheckoutByUniqueColumn(customerId: Customer): Promise<Checkout> {
    return await this.checkoutEntity.findOne(
      { customerId: customerId },
      {
        populate: true,
      }
    );
  }

  async getCheckoutBySource(customerId: Customer, source: SourceEnum): Promise<Checkout> {
    return await this.checkoutEntity.findOne(
      { customerId: customerId, source },
      {
        populate: true,
        orderBy: {
          createdAt: QueryOrder.desc,
        },
      }
    );
  }

  async updateCheckoutById(checkout: Checkout, updateCheckout: Partial<Checkout>): Promise<Checkout> {
    wrap(checkout).assign(updateCheckout);
    await this.EntityManager.flush();
    return { ...(checkout ?? {}), ...(updateCheckout ?? {}) } as Checkout;
  }

  // Product Variants
  async getProductVariantsByIds(variantsIds: number[], populate: boolean = true): Promise<ProductsVariant[]> {
    return await this.productVariantEntity.find(
      {
        id: { $in: variantsIds },
      },
      {
        populate,
      }
    );
  }

  async getProductVariantsBasedCurrency(populate: boolean = true, currency: ProductVariantCurrencyEnum): Promise<ProductsVariant[]> {
    return await this.productVariantEntity.find(
      {
        currency,
      },
      {
        populate,
        orderBy: {
          createdAt: QueryOrder.ASC,
        },
      }
    );
  }

  async getProductVariantBySku(variantsSku: ProductVariantSkuEnum): Promise<ProductsVariant> {
    return await this.productVariantEntity.findOne({ sku: variantsSku }, { populate: true });
  }

  async getProductVariantsBySku(variantsSku: ProductVariantSkuEnum[]): Promise<ProductsVariant[]> {
    return await this.productVariantEntity.find(
      {
        sku: {
          $in: variantsSku,
        },
      },
      { populate: true }
    );
  }

  //eCommerce Product Variants
  async getVariantsByIds(variantsIds: number[], populate: boolean = true): Promise<EcommerceProductsVariant[]> {
    return await this.ecommerceVariantEntity.find(
      {
        id: { $in: variantsIds },
      },
      {
        populate,
      }
    );
  }

  async getVariantsBySku(variantsSku: ProductVariantSkuEnum[], country: string): Promise<EcommerceProductsVariant[]> {
    return await this.ecommerceVariantEntity.find(
      {
        sku: {
          $in: variantsSku,
        },
        country: country,
      },
      { populate: true }
    );
  }

  async getVariantBySku(variantSku: ProductVariantSkuEnum, country: string): Promise<EcommerceProductsVariant> {
    return await this.ecommerceVariantEntity.findOne(
      {
        sku: variantSku,
        country: country,
      },
      {
        populate: true,
      }
    );
  }

  async getPlanProductVariants(country: string): Promise<EcommerceProductsVariant[]> {
    const productDocument = await this.productEntity.find({
      slug: {
        $in: [ProductSlugEnum.UnlimitedPlans] as ProductSlugEnum[],
      },
    });

    const productVariantDocuments = await this.ecommerceVariantEntity.find({
      productId: {
        $in: productDocument,
      },
      country: country,
    });

    return productVariantDocuments;
  }

  // Order
  async createOrder(orderPayload: Partial<Order>): Promise<Order> {
    const order = await this.orderEntity.create(orderPayload);
    await this.EntityManager.flush();
    return order;
  }

  async getOrderById(orderPayload: Partial<Order>): Promise<Order> {
    const order = await this.orderEntity.findOne({ id: orderPayload?.id });
    return order;
  }

  async getOrderBySimId(simId: Partial<Sim>): Promise<Order[]> {
    const order = await this.orderEntity.find({ simId: simId });
    return order;
  }

  async updateOrder(order: Order, orderPayload: Partial<Order>): Promise<void> {
    wrap(order).assign(orderPayload);
    await this.EntityManager.flush();
  }

  // lineItem
  async createLineItem(lineItemPayload: Partial<LineItem>): Promise<LineItem> {
    const lineItem = await this.lineItemEntity.create(lineItemPayload);
    await this.EntityManager.flush();
    return lineItem;
  }

  async getLineItemByOrderId(order: Partial<Order>): Promise<LineItem[]> {
    return await this.lineItemEntity.find(
      { orderId: order?.id },
      {
        populate: true,
      }
    );
  }

  // Sim
  async createSim(simPayload: Partial<Sim>): Promise<Sim> {
    const sim = await this.simEntity.create(simPayload);
    await this.EntityManager.flush();
    return sim;
  }

  async getSimById(id: number): Promise<Sim> {
    return await this.simEntity.findOne({ id }, { populate: true });
  }

  async getSimByMobileNumber(mobileNumber: string): Promise<Sim> {
    return await this.simEntity.findOne({ mobileNo: mobileNumber }, { populate: true });
  }

  async getSimBySerialNumber(serialNumber: string): Promise<Sim> {
    return await this.simEntity.findOne({ serialNumber: serialNumber }, { populate: true });
  }

  async getSimByOutBoundId(outBoundId: string): Promise<Sim> {
    return await this.simEntity.findOne({ outBoundOrderId: outBoundId }, { populate: true });
  }

  async updateSim(id: number, simPayload: Partial<Sim>): Promise<void> {
    const sim = await this.getSimById(id);
    wrap(sim).assign(simPayload);
    await this.EntityManager.flush();
  }

  async getSimByCustomer(customer: Customer, onlyActivatedSim: boolean = false): Promise<Sim[]> {
    return await this.simEntity.find({
      status: { $in: onlyActivatedSim ? [SimStatusEnum.Active, SimStatusEnum.PreActive] : [] },
      customerId: customer,
    });
  }

  async getNotActiveSimsByCustomer(customer: Customer): Promise<Sim[]> {
    return await this.simEntity.find({
      status: SimStatusEnum.NotActive,
      customerId: customer,
    });
  }

  async getSimsByCustomer(customer: Customer, limit?: number, offset?: number): Promise<Sim[]> {
    return await this.simEntity.find(
      {
        customerId: customer,
        flowName: WorkflowEnum.shopify,
      },
      {
        fields: ['status', 'mobileNo', 'simName'],
        limit: limit,
        offset: offset,
        orderBy: { createdAt: 'DESC' },
      }
    );
  }

  // Sim Activity
  async createSimActivity(simActivityPayload: Partial<SimActivity>): Promise<SimActivity> {
    const simActivity = await this.simActivityEntity.create(simActivityPayload);
    await this.EntityManager.flush();
    return simActivity;
  }

  async updateSimActivity(simActivity: SimActivity, SimActivityPayload: Partial<SimActivity>): Promise<void> {
    wrap(simActivity).assign(SimActivityPayload);
    await this.EntityManager.flush();
  }

  async getSimActivityById(id?: number, sim?: Partial<Sim>, productVariant?: Partial<ProductsVariant>): Promise<SimActivity> {
    const query: { id?: number; simId?: number; productVariantId?: number } = {};
    if (id) query['id'] = id;
    if (sim) query['simId'] = sim?.id;
    if (productVariant) query['productVariantId'] = productVariant.id;
    return await this.simActivityEntity.findOne(query, { populate: true });
  }

  // Sim Plan
  async crateSimPlan(simPlanPayload: Partial<SimPlan>): Promise<SimPlan> {
    const simPlan = this.simPlanEntity.create(simPlanPayload);
    await this.EntityManager.flush();
    return simPlan;
  }

  async updateSimPlan(simPlan: Partial<SimPlan>, simPlanPayload: Partial<SimPlan>): Promise<void> {
    wrap(simPlan).assign(simPlanPayload);
    await this.EntityManager.flush();
  }

  async getSimPlan(sim: Partial<Sim>, product: Partial<Product>, productVariant: Partial<ProductsVariant>): Promise<SimPlan> {
    return await this.simPlanEntity.findOne(
      {
        simId: sim?.id,
        productId: product?.id,
        productVariantId: productVariant?.id,
      },
      {
        populate: true,
      }
    );
  }

  async getSimPlanByVariant(sim: Partial<Sim>, product: Partial<Product>, productVariant: Partial<EcommerceProductsVariant>): Promise<SimPlan> {
    return await this.simPlanEntity.findOne(
      {
        simId: sim?.id,
        productId: product?.id,
        ecommerceVariantId: productVariant?.id,
      },
      {
        populate: true,
      }
    );
  }

  async getSimPlanBySimId(sim: Partial<Sim>): Promise<SimPlan[]> {
    return await this.simPlanEntity.find(
      {
        simId: sim?.id,
      },
      {
        populate: true,
        orderBy: {
          createdAt: QueryOrder.DESC,
        },
      }
    );
  }

  async getPlans(productVariants: EcommerceProductsVariant[], sims: Sim[]): Promise<SimPlan[]> {
    return await this.simPlanEntity.find(
      {
        $and: [
          {
            simId: sims,
          },
          {
            productId: productVariants.map((res) => res.productId),
          },
        ],
      },
      {
        orderBy: {
          createdAt: QueryOrder.DESC,
        },
        populate: true,
      }
    );
  }

  // Get Configurations
  async getConfigurations(): Promise<Configuration[]> {
    return await this.configureEntity.find({});
  }

  async updateConfiguration(configuration: Partial<Configuration>, updateConfiguration: Partial<Configuration>): Promise<void> {
    wrap(configuration).assign(updateConfiguration);
    await this.EntityManager.flush();
  }

  // Billing Transaction
  async createBillingTransaction(billingTransactions: Partial<BillingTransactions>): Promise<BillingTransactions> {
    const billingTransactionDocument = await this.billingTransactionEntity.upsert(billingTransactions);
    await this.EntityManager.flush();
    return billingTransactionDocument;
  }

  async getBillingTransactionByInvoiceId(invoiceId: string): Promise<Partial<BillingTransactions>> {
    const billingTransactionDocument = await this.billingTransactionEntity.findOne(
      {
        invoice: invoiceId,
      },
      {
        populate: true,
      }
    );
    return billingTransactionDocument;
  }

  // Commission
  async createCommission(commission: Partial<Commissions>): Promise<Commissions> {
    const commissionDocument = await this.commissionEntity.create(commission);
    await this.EntityManager.flush();
    return commissionDocument;
  }

  async getCommissionByAccountIds(accountIds: number[], fromDate: string, toDate: string): Promise<Commissions[]> {
    return await this.commissionEntity.find(
      {
        $and: [
          {
            createdAt: {
              $gte: toDate,
              $lte: fromDate,
            },
          },
          {
            agencyId: {
              $in: accountIds,
            },
          },
        ],
      },
      { populate: true }
    );
  }

  // Commission Configuration
  async getCommissionConfigByProductVariant(productVariant: ProductsVariant): Promise<CommissionConfiguration> {
    return await this.commissionConfigurationEntity.findOne({
      productVariantId: productVariant,
    });
  }

  // Customer Referral
  async createCustomerReferral(customerReferral: Partial<CustomerReferral>): Promise<CustomerReferral> {
    const referralDocument = await this.customerReferralEntity?.create(customerReferral);
    await this.EntityManager?.flush();
    return referralDocument;
  }

  async findReferralByUniqueColumn(id: number): Promise<CustomerReferral[]> {
    return await this.customerReferralEntity?.find(
      {
        referralCustomerId: id,
        isTopupDone: false,
      },
      {
        populate: true,
      }
    );
  }

  async findCustomerReferralById(id: number): Promise<CustomerReferral> {
    return await this.customerReferralEntity.findOne({ id }, { populate: true });
  }

  async getCustomerReferralCount(id: number): Promise<number> {
    return await this.customerReferralEntity?.count({
      referralCustomerId: id,
      isTopupDone: false,
    });
  }

  async updateCustomerReferral(referral: CustomerReferral, referralPayload: Partial<CustomerReferral>): Promise<void> {
    wrap(referral).assign(referralPayload);
    await this.EntityManager.flush();
  }

  // close connection delay
  async delay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
