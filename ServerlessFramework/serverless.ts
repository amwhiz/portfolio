import type { AWS } from '@serverless/typescript';

import { validator } from '@handlers/validator/events';
import { workflowWebhook, workflowWorker, activationExecutiveWorker, rechargeExecutiveWorker, scheduleWebhook } from '@handlers/webhook-wati/events';
import { paymentWebhook, paymentWorker } from '@handlers/payments/events';
import { notification, emailNotification } from '@handlers/notifications/event';
import { crm } from '@handlers/crm/event';
import {
  gatewayAuthorizer,
  hubspotGatewayAuthorizer,
  hubspotRegisterWebhook,
  login,
  logout,
  me,
  register,
  resetPassword,
  updateAccount,
  updateAccountPlan,
} from '@handlers/portal/auth/event';
import { createRoleBasedEntities, getAgencies, getUserAgents } from '@handlers/portal/userManagement/event';
import {
  billingTransactionStatus,
  getPurchasedSimByCustomer,
  getSimPurchaseByAccount,
  saleWebhook,
  saleWorker,
  simPurchase,
  simPurchaseOrderStatusWebhook,
  simPurchaseOrderStatusWorker,
  saleValidate,
} from '@handlers/portal/sales/event';
import { shopifyWebhook, shopifyWorker } from '@handlers/shopify/event';
import { thirdPartyWebhook, thirdPartyWorker } from '@handlers/thirdParties/event';
import { getAgencyBilling } from '@handlers/portal/accounts/billing/event';
import { general } from '@handlers/portal/general/event';
import { commission } from '@handlers/portal/commission/event';
import { getAgencyCommission } from '@handlers/portal/accounts/commission/event';
import {
  eCommerceWebhook,
  eCommerceWorker,
  fetchCurrentUser,
  getSimsByCustomerEmail,
  simUsageWorker,
  updateSim,
  getCustomerReferral,
  activationWorker,
  eCommerceRechargeWorker,
} from '@handlers/eCommerce/event';

const serverlessConfiguration: AWS = {
  service: 'ntc-sa-service',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline', 'serverless-plugin-log-retention', 'serverless-api-gateway-caching'],
  provider: {
    name: 'aws',
    runtime: 'nodejs20.x',
    region: 'eu-north-1',
    stage: '${opt:stage, "dev"}',
    timeout: 30,
    versionFunctions: false,
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['lambda:InvokeFunction', 'lambda:InvokeAsync'],
        Resource: [
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-validator',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-workflowWebhook',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-workflowWorker',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-notification',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-activationExecutiveWorker',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-rechargeExecutiveWorker',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-scheduleWebhook',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-paymentWebhook',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-paymentWorker',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-crm',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-gatewayAuthorizer',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-hubspotRegisterWebhook',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-register',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-login',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-me',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-updateAccount',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-resetPassword',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-logout',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-hubspotGatewayAuthorizer',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-getAgencies',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-getUserAgents',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-createRoleBasedEntities',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-saleWebhook',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-saleWorker',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-shopifyWebhook',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-shopifyWorker',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-eCommerceWebhook',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-eCommerceWorker',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-fetchCurrentUser',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-activationWorker',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-eCommerceRechargeWorker',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-simUsageWorker',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-getSimsByCustomerEmail',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-updateSim',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-getCustomerReferral',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-thirdPartyWebhook',
          },
          {
            'Fn::Sub':
              'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-simPurchaseOrderStatusWebhook',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-simPurchaseOrderStatusWorker',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-getSimPurchaseByAccount',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-simPurchase',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-billingTransactionStatus',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-general',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-getPurchasedSimByCustomer',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-saleValidate',
          },
          {
            'Fn::Sub': 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${self:service}-${self:provider.stage}-commission',
          },
        ],
      },
      {
        Effect: 'Allow',
        Action: ['sqs:ReceivedMessage', 'sqs:SendMessage', 'sqs:GetQueueAttributes'],
        Resource: { 'Fn::GetAtt': ['workflowQueue', 'Arn'] },
      },
      {
        Effect: 'Allow',
        Action: ['sqs:ReceivedMessage', 'sqs:SendMessage', 'sqs:GetQueueAttributes'],
        Resource: { 'Fn::GetAtt': ['notificationQueue', 'Arn'] },
      },
      {
        Effect: 'Allow',
        Action: ['sqs:ReceivedMessage', 'sqs:SendMessage', 'sqs:GetQueueAttributes'],
        Resource: { 'Fn::GetAtt': ['activationExecutiveQueue', 'Arn'] },
      },
      {
        Effect: 'Allow',
        Action: ['sqs:ReceivedMessage', 'sqs:SendMessage', 'sqs:GetQueueAttributes'],
        Resource: { 'Fn::GetAtt': ['rechargeExecutiveQueue', 'Arn'] },
      },
      {
        Effect: 'Allow',
        Action: ['sqs:ReceivedMessage', 'sqs:SendMessage', 'sqs:GetQueueAttributes'],
        Resource: { 'Fn::GetAtt': ['paymentQueue', 'Arn'] },
      },
      {
        Effect: 'Allow',
        Action: ['sqs:ReceivedMessage', 'sqs:SendMessage', 'sqs:GetQueueAttributes'],
        Resource: { 'Fn::GetAtt': ['crmQueue', 'Arn'] },
      },
      {
        Effect: 'Allow',
        Action: ['sqs:ReceivedMessage', 'sqs:SendMessage', 'sqs:GetQueueAttributes'],
        Resource: { 'Fn::GetAtt': ['portalQueue', 'Arn'] },
      },
      {
        Effect: 'Allow',
        Action: ['sqs:ReceivedMessage', 'sqs:SendMessage', 'sqs:GetQueueAttributes'],
        Resource: { 'Fn::GetAtt': ['shopifyQueue', 'Arn'] },
      },
      {
        Effect: 'Allow',
        Action: ['sqs:ReceivedMessage', 'sqs:SendMessage', 'sqs:GetQueueAttributes'],
        Resource: { 'Fn::GetAtt': ['eCommerceQueue', 'Arn'] },
      },
      {
        Effect: 'Allow',
        Action: ['sqs:ReceivedMessage', 'sqs:SendMessage', 'sqs:GetQueueAttributes'],
        Resource: { 'Fn::GetAtt': ['eCommerceRechargeQueue', 'Arn'] },
      },
      {
        Effect: 'Allow',
        Action: ['sqs:ReceivedMessage', 'sqs:SendMessage', 'sqs:GetQueueAttributes'],
        Resource: { 'Fn::GetAtt': ['thirdPartyQueue', 'Arn'] },
      },
      {
        Effect: 'Allow',
        Action: ['sqs:ReceivedMessage', 'sqs:SendMessage', 'sqs:GetQueueAttributes'],
        Resource: { 'Fn::GetAtt': ['simPurchaseQueue', 'Arn'] },
      },
      {
        Effect: 'Allow',
        Action: ['sqs:ReceivedMessage', 'sqs:SendMessage', 'sqs:GetQueueAttributes'],
        Resource: { 'Fn::GetAtt': ['hubspotWorkflowQueue', 'Arn'] },
      },
      {
        Effect: 'Allow',
        Action: ['sqs:ReceivedMessage', 'sqs:SendMessage', 'sqs:GetQueueAttributes'],
        Resource: { 'Fn::GetAtt': ['invoiceQueue', 'Arn'] },
      },
      {
        Effect: 'Allow',
        Action: ['sqs:ReceivedMessage', 'sqs:SendMessage', 'sqs:GetQueueAttributes'],
        Resource: { 'Fn::GetAtt': ['billingInvoiceQueue', 'Arn'] },
      },
      {
        Effect: 'Allow',
        Action: ['sqs:ReceivedMessage', 'sqs:SendMessage', 'sqs:GetQueueAttributes'],
        Resource: { 'Fn::GetAtt': ['commissionQueue', 'Arn'] },
      },
    ],
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      DB_NAME: '${ssm:/ntc-sa/${self:provider.stage}/db_name}',
      DB_USER: '${ssm:/ntc-sa/${self:provider.stage}/db_user}',
      DB_PASSWORD: '${ssm:/ntc-sa/${self:provider.stage}/db_pwd}',
      DB_HOST: '${ssm:/ntc-sa/${self:provider.stage}/db_host}',
      PARCEL_NINJA_TOKEN: '${ssm:/ntc-sa/${self:provider.stage}/parcel_ninja_token}',
      HUBSPOT_PAT_TOKEN: '${ssm:/ntc-sa/${self:provider.stage}/hubspot_pat_token}',
      JWT_SECRET: '${ssm:/ntc-sa/${self:provider.stage}/jwt_secret}',
      HUBSPOT_SECRET: '${ssm:/ntc-sa/${self:provider.stage}/hubspot_secret}',
      ACCESS_KEY: '${ssm:/ntc-sa/access_key}',
      SECRET_ACCESS_KEY: '${ssm:/ntc-sa/secret_access_key}',
      PEACH_ENTITY_ID: '${ssm:/ntc-sa/${self:provider.stage}/peach_entity_id}',
      PEACH_CLIENT_ID: '${ssm:/ntc-sa/${self:provider.stage}/peach_client_id}',
      PEACH_CLIENT_SECRET_ID: '${ssm:/ntc-sa/${self:provider.stage}/peach_client_secret_id}',
      PEACH_MERCHANT_ID: '${ssm:/ntc-sa/${self:provider.stage}/peach_merchant_id}',
      WATI_ACCESS_TOKEN: '${ssm:/ntc-sa/${self:provider.stage}/wati_access_token}',
      CDS_AUTH_USERNAME: '${ssm:/ntc-sa/${self:provider.stage}/cds_auth_username}',
      CDS_AUTH_PASSWORD: '${ssm:/ntc-sa/${self:provider.stage}/cds_auth_pwd}',
      SIM_ACTIVATION_ENCRYPTION_KEY: '${ssm:/ntc-sa/${self:provider.stage}/cds_sim_activation_encrypt_key}',
      TARGET_ARN: '${ssm:/ntc-sa/${self:provider.stage}/target_arn}',
      EVENT_BRIDGE_ROLE_ARN: '${ssm:/ntc-sa/${self:provider.stage}/event_bridge_role_arn}',
      STAGE: '${self:provider.stage}',
      REGION: '${self:provider.region}',
      STRIPE_API_KEY: '${ssm:/ntc-sa/${self:provider.stage}/stripe_api_key}',
      STRIPE_ENDPOINT_SECRET: '${ssm:/ntc-sa/${self:provider.stage}/stripe_endpoint_secret}',
      ZEPTO_MAIL_AGENT_1_TOKEN: '${ssm:/ntc/${self:provider.stage}/zepto_mail1_token}',
      ZEPTO_MAIL_AGENT_2_TOKEN: '${ssm:/ntc/${self:provider.stage}/zepto_mail2_token}',
      WORKFLOWS_SQS_URL: { Ref: 'workflowQueue' },
      NOTIFICATION_SQS_URL: { Ref: 'notificationQueue' },
      EMAIL_NOTIFICATION_SQS_URL: { Ref: 'emailNotificationQueue' },
      ACTIVATION_EXECUTIVE_SQS_URL: { Ref: 'activationExecutiveQueue' },
      RECHARGE_EXECUTIVE_SQS_URL: { Ref: 'rechargeExecutiveQueue' },
      PAYMENT_SQS_URL: { Ref: 'paymentQueue' },
      CRM_SQS_URL: { Ref: 'crmQueue' },
      PLAN_UPDATE_SQS_URL: { Ref: 'accountPlanUpdateQueue' },
      HUBSPOT_SQS_URL: { Ref: 'hubspotWorkflowQueue' },
      PORTAL_SQS_URL: { Ref: 'portalQueue' },
      SHOPIFY_SQS_URL: { Ref: 'shopifyQueue' },
      ECOMMERCE_SQS_URL: { Ref: 'eCommerceQueue' },
      ECOMMERCE_RECHARGE_SQS_URL: { Ref: 'eCommerceRechargeQueue' },
      THIRD_PARTY_SQS_URL: { Ref: 'thirdPartyQueue' },
      SIM_PURCHASE_SQS_URL: { Ref: 'simPurchaseQueue' },
      INVOICE_SQS_URL: { Ref: 'invoiceQueue' },
      BILLING_INVOICE_SQS_URL: { Ref: 'billingInvoiceQueue' },
      COMMISSION_SQS_URL: { Ref: 'commissionQueue' },
    },
  },
  functions: {
    validator,
    workflowWebhook,
    workflowWorker,
    notification,
    emailNotification,
    activationExecutiveWorker,
    simUsageWorker,
    fetchCurrentUser,
    activationWorker,
    eCommerceRechargeWorker,
    updateSim,
    getCustomerReferral,
    getSimsByCustomerEmail,
    rechargeExecutiveWorker,
    scheduleWebhook,
    paymentWebhook,
    paymentWorker,
    crm,
    hubspotRegisterWebhook,
    register,
    login,
    me,
    updateAccount,
    updateAccountPlan,
    resetPassword,
    logout,
    gatewayAuthorizer,
    hubspotGatewayAuthorizer,
    getAgencies,
    getUserAgents,
    createRoleBasedEntities,
    saleWebhook,
    saleWorker,
    simPurchaseOrderStatusWebhook,
    simPurchaseOrderStatusWorker,
    getSimPurchaseByAccount,
    billingTransactionStatus,
    simPurchase,
    shopifyWebhook,
    shopifyWorker,
    thirdPartyWebhook,
    thirdPartyWorker,
    getAgencyBilling,
    getAgencyCommission,
    general,
    getPurchasedSimByCustomer,
    saleValidate,
    commission,
    eCommerceWebhook,
    eCommerceWorker,
  },
  resources: {
    Resources: {
      workflowQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: '${self:provider.stage}-workflow-sqs.fifo',
          FifoQueue: true,
          VisibilityTimeout: 120,
          MessageRetentionPeriod: 345600,
        },
      },
      hubspotWorkflowQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: '${self:provider.stage}-hubspot-workflow-sqs.fifo',
          FifoQueue: true,
          VisibilityTimeout: 120,
          MessageRetentionPeriod: 345600,
        },
      },
      accountPlanUpdateQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: '${self:provider.stage}-accountPlanUpdate-sqs.fifo',
          FifoQueue: true,
          VisibilityTimeout: 120,
          MessageRetentionPeriod: 345600,
        },
      },
      notificationQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: '${self:provider.stage}-notification-sqs.fifo',
          FifoQueue: true,
          VisibilityTimeout: 120,
          MessageRetentionPeriod: 345600,
        },
      },
      emailNotificationQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: '${self:provider.stage}-email-notification-sqs.fifo',
          FifoQueue: true,
          VisibilityTimeout: 120,
          MessageRetentionPeriod: 345600,
        },
      },
      activationExecutiveQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: '${self:provider.stage}-activationExecutive-sqs.fifo',
          FifoQueue: true,
          VisibilityTimeout: 120,
          MessageRetentionPeriod: 345600,
        },
      },
      rechargeExecutiveQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: '${self:provider.stage}-rechargeExecutive-sqs.fifo',
          FifoQueue: true,
          VisibilityTimeout: 120,
          MessageRetentionPeriod: 345600,
        },
      },
      paymentQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: '${self:provider.stage}-payment-sqs.fifo',
          FifoQueue: true,
          VisibilityTimeout: 120,
          MessageRetentionPeriod: 345600,
        },
      },
      crmQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: '${self:provider.stage}-crm-sqs.fifo',
          FifoQueue: true,
          VisibilityTimeout: 120,
          MessageRetentionPeriod: 345600,
        },
      },
      portalQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: '${self:provider.stage}-portal-sqs.fifo',
          FifoQueue: true,
          VisibilityTimeout: 120,
          MessageRetentionPeriod: 345600,
        },
      },
      shopifyQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: '${self:provider.stage}-shopify-sqs.fifo',
          FifoQueue: true,
          VisibilityTimeout: 120,
          MessageRetentionPeriod: 345600,
        },
      },
      eCommerceQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: '${self:provider.stage}-ecommerce-sqs.fifo',
          FifoQueue: true,
          VisibilityTimeout: 120,
          MessageRetentionPeriod: 345600,
        },
      },
      eCommerceRechargeQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: '${self:provider.stage}-ecommerce-recharge-sqs.fifo',
          FifoQueue: true,
          VisibilityTimeout: 120,
          MessageRetentionPeriod: 345600,
        },
      },
      thirdPartyQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: '${self:provider.stage}-third-party-sqs.fifo',
          FifoQueue: true,
          VisibilityTimeout: 120,
          MessageRetentionPeriod: 345600,
        },
      },
      simPurchaseQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: '${self:provider.stage}-sim-purchase-sqs.fifo',
          FifoQueue: true,
          VisibilityTimeout: 120,
          MessageRetentionPeriod: 345600,
        },
      },
      invoiceQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: '${self:provider.stage}-invoice-sqs.fifo',
          FifoQueue: true,
          VisibilityTimeout: 120,
          MessageRetentionPeriod: 345600,
        },
      },
      billingInvoiceQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: '${self:provider.stage}-billing-invoice-sqs.fifo',
          FifoQueue: true,
          VisibilityTimeout: 120,
          MessageRetentionPeriod: 345600,
        },
      },
      commissionQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: '${self:provider.stage}-commission-sqs.fifo',
          FifoQueue: true,
          VisibilityTimeout: 120,
          MessageRetentionPeriod: 345600,
        },
      },
      WatiLogsTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: '${self:provider.stage}-wati-logs',
          AttributeDefinitions: [
            {
              AttributeName: 'pk',
              AttributeType: 'S',
            },
            {
              AttributeName: 'sk',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'pk',
              KeyType: 'HASH',
            },
            {
              AttributeName: 'sk',
              KeyType: 'RANGE',
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        },
      },
      LogsTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: '${self:provider.stage}-logs',
          AttributeDefinitions: [
            {
              AttributeName: 'pk',
              AttributeType: 'S',
            },
            {
              AttributeName: 'sk',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'pk',
              KeyType: 'HASH',
            },
            {
              AttributeName: 'sk',
              KeyType: 'RANGE',
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        },
      },
      PgLogsTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: '${self:provider.stage}-pg-logs',
          AttributeDefinitions: [
            {
              AttributeName: 'pk',
              AttributeType: 'S',
            },
            {
              AttributeName: 'sk',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'pk',
              KeyType: 'HASH',
            },
            {
              AttributeName: 'sk',
              KeyType: 'RANGE',
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        },
      },
      CdsLogsTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: '${self:provider.stage}-cds-logs',
          AttributeDefinitions: [
            {
              AttributeName: 'pk',
              AttributeType: 'S',
            },
            {
              AttributeName: 'sk',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'pk',
              KeyType: 'HASH',
            },
            {
              AttributeName: 'sk',
              KeyType: 'RANGE',
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        },
      },
      ScheduleLogsTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: '${self:provider.stage}-schedule-logs',
          AttributeDefinitions: [
            {
              AttributeName: 'pk',
              AttributeType: 'S',
            },
            {
              AttributeName: 'sk',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'pk',
              KeyType: 'HASH',
            },
            {
              AttributeName: 'sk',
              KeyType: 'RANGE',
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        },
      },
      ShipmentLogsTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: '${self:provider.stage}-shipment-logs',
          AttributeDefinitions: [
            {
              AttributeName: 'pk',
              AttributeType: 'S',
            },
            {
              AttributeName: 'sk',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'pk',
              KeyType: 'HASH',
            },
            {
              AttributeName: 'sk',
              KeyType: 'RANGE',
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        },
      },
      MailLogsTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: '${self:provider.stage}-mail-logs',
          AttributeDefinitions: [
            {
              AttributeName: 'pk',
              AttributeType: 'S',
            },
            {
              AttributeName: 'sk',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'pk',
              KeyType: 'HASH',
            },
            {
              AttributeName: 'sk',
              KeyType: 'RANGE',
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        },
      },
    },
  },
  package: { individually: true },
  custom: {
    logRetentionInDays: 30,
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: [
        'aws-sdk',
        '@mikro-orm/entity-generator',
        '@mikro-orm/migrations',
        'oracledb',
        'sqlite3',
        'mysql',
        'better-sqlite3',
        'pg-query-stream',
        'tedious',
        'mysql2',
        '@mikro-orm/better-sqlite',
        '@mikro-orm/sqlite',
        '@mikro-orm/mariadb',
        '@mikro-orm/mysql',
        '@mikro-orm/mongodb',
        '@mikro-orm/seeder',
      ],
      target: 'node20',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

//eslint-disable-next-line no-undef
module.exports = serverlessConfiguration;
