import { IProfile } from './IProfile';
import { LanguageCode } from './LanguageCode';
import { SessionExpiration } from './SessionExpiration';
import { TargetEnv } from './TargetEnv';

/**
 * @public
 */
export interface IDefaultGigyaParams {
  apiKey: string;
  httpStatusCodes: boolean;
}

/**
 * @public
 */
export interface ILoginParams {
  loginID: string;
  password: string;
  captchaToken?: string;
  captchaText?: string;
  actionAttributes?: { [key: string]: Array<string> };
  cid?: string;
  include?: Array<
    | 'identities-active'
    | 'identities-all'
    | 'loginIDs'
    | 'emails'
    | 'profile'
    | 'data'
    | 'missing-required-fields'
    | 'preferences'
    | 'subscriptions'
    | 'groups'
    | 'id_token'
  >;
  loginMode?: 'standard' | 'link' | 'reAuth';
  sessionExpiration?: SessionExpiration;
  targetEnv?: TargetEnv;
}

/**
 * @public
 */
export interface ILogoutParams {
  UID?: string;
  cid?: string;
}

/**
 * @public
 */
export interface IRegisterPreference {
  isConsentGranted: boolean;
}

/**
 * @public
 */
export interface IRegisterPreferences {
  [key: string]: IRegisterPreference;
}

/**
 * @public
 */
export interface IRegisterParams {
  password: string;
  regToken: string;
  targetEnv: TargetEnv;
  username?: string;
  email?: string;
  profile?: IProfile;
  captchaText?: string;
  captchaToken?: string;
  cid?: string;
  data?: object;
  subscriptions?: object;
  finalizeRegistration?: boolean;
  preferences: IRegisterPreferences;
  secretQuestion?: string;
  secretAnswer?: string;
  lang?: LanguageCode;
  include?: string;
  sessionExpiration?: SessionExpiration;
  siteUID?: string;
  regSource?: string;
}

/**
 * @public
 */
export interface IFinalizeRegistrationParams {
  regToken: string;
  include?: Array<
    | 'identities-active'
    | 'identities-all'
    | 'loginIDs'
    | 'emails'
    | 'profile'
    | 'data'
    | 'subscriptions'
    | 'irank'
  >;
  allowAccountsLinking?: boolean;
  targetEnv?: TargetEnv;
}

/**
 * @public
 */
export interface IIsAvailableLoginIDParams {
  loginID: string;
}

/**
 * @public
 */
export interface ISetAccountInfoParams {
  UID?: string;
  regToken?: string;
  addLoginEmails?: string;
  conflictHandling?: 'fail' | 'saveProfileAndFail';
  data?: object;
  subscriptions?: object;
  isActive?: boolean;
  isLockedOut?: boolean;
  isVerified?: boolean;
  newPassword?: string;
  password?: string;
  profile?: IProfile;
  removeLoginEmails?: string;
  requirePasswordChange?: boolean;
  secretAnswer?: string;
  secretQuestion?: string;
  securityOverride?: boolean;
  rba?: {
    riskPolicy: string;
    riskPolicyLocked: boolean;
  };
  username?: string;
  created?: string;
  regSource?: string;
  preferences?: object;
  lang?: LanguageCode;
}

/**
 * @public
 */
export interface IUpdateRegistrationParams
  extends Pick<
    ISetAccountInfoParams,
    | 'regToken'
    | 'subscriptions'
    | 'profile'
    | 'preferences'
    | 'lang'
    | 'data'
    | 'password'
    | 'newPassword'
  > {}

/**
 * @public
 */
export interface IGetAccountInfoParams {
  UID?: string;
  regToken?: string;
  include?: Array<
    | 'identities-active'
    | 'identities-all'
    | 'identities-global'
    | 'loginIDs'
    | 'emails'
    | 'profile'
    | 'data'
    | 'password'
    | 'lastLoginLocation'
    | 'regSource'
    | 'irank'
    | 'subscriptions'
    | 'preferences'
    | 'groups'
  >;
  extraProfileFields?: Array<string> | string;
}

/**
 * @public
 */
export type IGetRegistrationInfoParams = Omit<IGetAccountInfoParams, 'regToken'> &
  Required<Pick<IGetAccountInfoParams, 'regToken'>>;

/**
 * @public
 */
export interface IResetPasswordParams {
  loginID?: string;
  passwordResetToken?: string;
  newPassword?: string;
  secretAnswer?: string;
  securityFields?: string;
  email?: string;
  lang?: string;
  sendEmail?: boolean;
}

/**
 * @public
 */
export interface IGetOrganizationInfoParams {
  bpid?: string;
  orgId?: string;
}

/**
 * @public
 */
export interface IGetJWTParams {
  secret?: string;
  targetUID: string;
  login_token: string;
  userKey?: string;
  fields?: string;
  expiration?: number;
  format?: string;
  callback?: string;
  context?: string | object;
  ignoreInterruptions?: boolean;
  httpStatusCodes?: boolean;
}
