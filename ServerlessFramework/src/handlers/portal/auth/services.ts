/* eslint-disable @typescript-eslint/no-explicit-any */
import { WorkflowBase } from '@handlers/webhook-wati/workflows/pushToQueue';
import { Auth } from './interfaces/auth';
import { Accounts } from 'src/entities/account';
import AccountService from '@handlers/account/account';
import * as bcrypt from 'bcryptjs';
import { generateRandPassword } from 'src/helpers/generateRandPassword';
import { SQSTypes } from 'src/constants/sqs';
import { getReferralCode } from 'src/helpers/getReferralCode';
import { CRMWorkFlow } from 'src/enums/workflows';
import { Actions } from 'src/enums/actions';
import { KeyType, env } from '@aw/env';
import { Templates } from 'src/constants/templates';
import { dateNow } from 'src/helpers/dates';
import { PlanType, Role } from 'src/entities/enums/account';
import { AccountRelationShip, AgencyRelationShip, PartnerRelationship } from './interfaces/account';
import { AppError } from '@libs/api-error';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { generateOTP } from 'src/helpers/generateOtp';
import { deleteProperties } from 'src/helpers/deleteProperties';
import { omitProperties, secureProperties } from '../constants/protectedProperties';
import { url } from '../constants/url';
import { RelationshipType } from 'src/entities/enums/accountRelationship';
import { CODDowngrade } from '../sales/partnerTerm/downgrade';

export class AuthService extends WorkflowBase implements Auth {
  private accountService: AccountService;
  private notificationSQS: KeyType = SQSTypes.emailNotification;
  private crmSQS: KeyType = SQSTypes.crm;
  private codDowngrade: CODDowngrade;

  constructor() {
    super();
    this.accountService = new AccountService();
  }

  private getRoleBasedName(role: Role, account: Accounts): string {
    const roleBasedUserName = {
      [Role['PARTNER']]: `Agency Name: ${account.name}`,
      [Role['AGENCY']]: `Agency Name: ${account.name}`,
      [Role['USER_AGENT']]: `Agent Name: ${account.name}`,
    };
    return roleBasedUserName[role];
  }

  /**
   * This function registers a create new accounts from hubspot, sending activation or password reset emails
   * based on whether the account already exists, and updates the account information accordingly.
   * @param account, email or hubspot id.
   * @returns void
   */
  async register(account: Accounts): Promise<void> {
    await this.accountService.ormInit();
    const notification = {
      account,
      action: Actions.Email,
      flowName: '',
    };
    notification['domain'] = env('stage') === 'dev' ? url.devPartnerDomain : url.prodPartnerDomain;

    const isAccountExists = await this.accountService.findAccountByUniqueColumn(account?.email);
    if (isAccountExists?.email) {
      // Account reset password mail
      await this.queueProcess(this.notificationSQS, { ...notification.account, ...notification }, 'resetPassword');
      if (account.previousPlan !== isAccountExists.currentPlan) {
        account.previousPlan = isAccountExists.currentPlan;
        account.lastPlanUpdatedAt = <Date>dateNow('Date');
      }

      account.password = isAccountExists.password;
      account.lastLoginDate = isAccountExists.lastLoginDate;
      account.createdAt = isAccountExists.createdAt;
      account.referralCode = isAccountExists.referralCode;
      account.isActive = true;
    } else {
      const randPassword = generateRandPassword();
      const hashPassword = await bcrypt.hash(randPassword, 10);

      account.password = hashPassword;
      account.referralCode = getReferralCode();
      const userPassword = randPassword;
      notification.account.referralCode = account.referralCode;
      const userName = this.getRoleBasedName(notification.account.role, account);

      // Account Activation mail
      await this.queueProcess(
        this.notificationSQS,
        { ...notification.account, ...notification, userName: userName, userPassword: userPassword },
        'accountActivation'
      );

      // CRM
      notification['flowName'] = CRMWorkFlow.Account;
      await this.queueProcess(this.crmSQS, notification);
    }

    await this.accountService.upsertAccount(account);
    await this.accountService.closeConnection();
  }

  async partnerRelationShip(account: Accounts): Promise<PartnerRelationship> {
    await this.accountService.ormInit();

    const agency = await this.accountService.findRelationShipAccountsByParentAccount(account);
    const agencyRelationShip: PartnerRelationship = {
      agencies: [],
    };

    for (let agencyIndex = 0; agencyIndex < agency?.length; agencyIndex++) {
      if (agency[agencyIndex].childAccountId?.role === Role.USER_AGENT) continue;
      const agencyRelationShipUserAgent = {
        ...deleteProperties(agency[agencyIndex].childAccountId, omitProperties),
        userAgents: [] as Partial<Accounts>[],
      };

      const userAgents = await this.accountService.findRelationShipAccountsByParentAccount(agency[agencyIndex].childAccountId);
      agencyRelationShipUserAgent.userAgents = userAgents.map((agents) => deleteProperties(agents?.childAccountId, omitProperties));
      agencyRelationShip.agencies.push(agencyRelationShipUserAgent);
    }

    return agencyRelationShip;
  }

  async agencyRelationShip(account: Accounts): Promise<AgencyRelationShip> {
    await this.accountService.ormInit();

    const userAgents = await this.accountService.findRelationShipAccountsByParentAccount(account);
    return { userAgents: userAgents.map((agents) => deleteProperties(agents.childAccountId, omitProperties)) };
  }

  private async userAgentRelationShip(account: Accounts): Promise<{ agent: Accounts[] }> {
    const userAgents = await this.accountService.findRelationShipAccountsByChildAccount(account);
    return {
      agent: userAgents
        .map((agents) => {
          if (agents.relationshipType === RelationshipType.AGENCY_TO_USER) {
            return deleteProperties(agents.childAccountId, omitProperties);
          }
        })
        ?.filter((notEmpty) => notEmpty) as Accounts[],
    };
  }

  /**
   * These functions handle the retrieval of partner, agency and userAgent relationships associated with a given account,
   * and the user's own account details, based on their role, by querying the database and organizing the retrieved data accordingly.
   * @param account, email or hubspot id.
   * @returns (PartnerRelationship & Accounts) | (AgencyRelationShip & Accounts)
   */
  async me(account: Partial<Accounts>): Promise<AccountRelationShip> {
    await this.accountService.ormInit();

    const accountDocument = await this.accountService.findAccountByUniqueColumn(account?.email);
    if (!accountDocument?.email) throw new AppError(ReasonPhrases.NOT_FOUND, StatusCodes.NOT_FOUND);

    const accountRelationShip: AccountRelationShip = {
      ...accountDocument,
    };

    if (account.role === Role.USER_AGENT) {
      const parentAccount = await this.userAgentRelationShip(accountDocument);
      accountRelationShip.currentPlan = parentAccount.agent[0]?.currentPlan;
      accountRelationShip.previousPlan = parentAccount.agent[0]?.previousPlan;
    }

    if (account.role === Role.PARTNER) {
      accountRelationShip['agencies'] = (await this.partnerRelationShip(accountDocument)).agencies;
    } else if (account.role === Role.AGENCY) {
      accountRelationShip['userAgents'] = (await this.agencyRelationShip(accountDocument)).userAgents;
    }

    await this.accountService.closeConnection();
    return deleteProperties(accountRelationShip, secureProperties);
  }

  /**
   * This function handles user login by verifying account credentials, checking account status,
   * and updating the last login date before returning the authenticated account document.
   * @param account, email and password
   * @returns account
   */
  async login(account: Partial<Accounts>): Promise<Partial<Accounts>> {
    await this.accountService.ormInit();
    const accountDocument = await this.accountService.findAccountByUniqueColumn(account?.email);

    if (!accountDocument?.email) throw new AppError(ReasonPhrases.NOT_FOUND, StatusCodes.NOT_FOUND);

    if (!accountDocument.isActive || accountDocument.isSuspended) throw new AppError(ReasonPhrases.FORBIDDEN, StatusCodes.FORBIDDEN);

    const isMatch = await bcrypt.compare(<string>account?.password, accountDocument?.password);
    if (!isMatch) throw new AppError(ReasonPhrases.UNAUTHORIZED, StatusCodes.UNAUTHORIZED);

    accountDocument.lastLoginDate = dateNow('Date') as Date;
    await this.accountService.upsertAccount(accountDocument);

    await this.accountService.closeConnection();

    return deleteProperties(accountDocument, secureProperties);
  }

  VerifyOtp(resetPwd: Partial<Accounts>, accountData: Accounts): string {
    const isOtpValid = +(resetPwd?.otp ?? '0') === accountData.otp;
    if (!isOtpValid) throw new AppError(ReasonPhrases.FORBIDDEN, StatusCodes.FORBIDDEN);
    return ReasonPhrases.OK;
  }

  /**
   * This asynchronous function handles the password reset process for an account.
   * It verifies the provided OTP, generates a new OTP if needed, sends an OTP email,
   * and updates the account password. If no OTP or new password is provided, it retrieves the account information for further processing.
   * @param account, email, otp and newPassword.
   * @returns OK message
   */
  async resetPassword(account: Partial<Accounts & { newPassword: string }>): Promise<string> {
    await this.accountService.ormInit();
    const accountDocument = await this.accountService.findAccountByUniqueColumn(account?.email);
    if (!accountDocument?.email) throw new AppError(ReasonPhrases.NOT_FOUND, StatusCodes.NOT_FOUND);
    const notification = {
      account: accountDocument,
      otp: 0,
    };

    if (account.email && !account?.otp && !account?.newPassword) {
      const otp = generateOTP() as unknown as number;
      notification.otp = otp;
      notification['action'] = Actions.Email;

      await this.accountService.upsertAccount({ ...accountDocument, otp });

      // Account OTP mail
      await this.queueProcess(this.notificationSQS, { ...notification.account, ...notification }, 'oneTimePassword');
      return ReasonPhrases.OK;
    }

    // Verify user entered one time password.
    if (account.email && account?.otp) return this.VerifyOtp(account, accountDocument);

    // Update new password
    if (account.email && account?.newPassword) {
      const hashPassword = await bcrypt.hash(account.newPassword, 10);
      await this.accountService.upsertAccount({ ...accountDocument, password: hashPassword });
    }
    await this.accountService.closeConnection();
    return ReasonPhrases.OK;
  }

  /**
   * This function updates an account's information,
   * including creating a new account if it doesn't exist, and returns the updated account document.
   * @param account
   * @returns accounts
   */
  async updateAccount(account: Partial<Accounts>): Promise<Partial<Accounts>> {
    await this.accountService.ormInit();
    const accountDocument = await this.accountService.findAccountByUniqueColumn(account?.email);

    if (!accountDocument?.email) throw new AppError(ReasonPhrases.NOT_FOUND, StatusCodes.NOT_FOUND);
    await this.accountService.upsertAccount({ ...accountDocument, ...account });

    await this.accountService.closeConnection();

    return deleteProperties(accountDocument, secureProperties);
  }

  /**
   * This function updates an account's information,
   * returns the updated account document.
   * @param account
   * @returns accounts
   */
  async updateAccountPlan(account: Partial<Accounts>): Promise<Partial<Accounts>> {
    await this.accountService.ormInit();
    const accountDocument = await this.accountService.findAccountByUniqueColumn(account?.email);

    if (!accountDocument?.email) throw new AppError(ReasonPhrases.NOT_FOUND, StatusCodes.NOT_FOUND);
    const updateParams = {
      currentPlan: account.currentPlan,
      previousPlan: accountDocument.currentPlan,
      lastPlanUpdatedAt: new Date(),
    };
    const updatedAccount = await this.accountService.upsertAccount({ ...accountDocument, ...updateParams });

    //Partner Term Downgrade to COD
    if (
      updatedAccount.currentPlan === PlanType.COD &&
      [PlanType.SEVEN, PlanType.FOURTEEN, PlanType.TWENTY_ONE].includes(updatedAccount.previousPlan)
    ) {
      const users = (await this.agencyRelationShip(accountDocument)).userAgents;
      this.codDowngrade = new CODDowngrade(updatedAccount);

      await this.codDowngrade.generateBilling(users);
    }

    await this.accountService.closeConnection();

    return deleteProperties(accountDocument, secureProperties);
  }

  /**
   * This asynchronous function logs out a user by updating their last logout date in the database and
   * closing the database connection.
   * @param account
   */
  async logout(account: Partial<Accounts>): Promise<void> {
    await this.accountService.ormInit();
    const accountDocument = await this.accountService.findAccountByUniqueColumn(account?.email);

    if (!accountDocument?.email) throw new AppError(ReasonPhrases.NOT_FOUND, StatusCodes.NOT_FOUND);

    await this.accountService.upsertAccount({ ...accountDocument, lastLogoutDate: <Date>dateNow('Date') });
    await this.accountService.closeConnection();
  }

  async queueProcess(queueType: KeyType, payload: object = {}, templateName?: keyof typeof Templates): Promise<void> {
    await super.pushToQueue(queueType, {
      ...payload,
      templateName,
    });
    await super.delay(2000);
  }
}
