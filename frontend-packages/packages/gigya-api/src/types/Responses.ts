import { IAccount } from './IAccount';
import { IEmails } from './IEmails';
import { IGroups } from './IGroups';
import { IPreference } from './IPreference';
import { ISessionInfo } from './ISessionInfo';
import { IPreferencesSchemaField } from './IPreferencesSchemaField';
import { OrganizationInfoStatus } from './OrganizationInfoStatus';

/**
 * @public
 */
export interface IBaseResponse {
  callId: string;
  errorCode: number; // 0 indicates success
  apiVersion: number;
  statusCode: number;
  statusReason: string;
  time: string;
}

/**
 * @public
 * Properties received based on the value of the request param named "include".
 */
export interface IInclude {
  emails?: IEmails;
  missingRequiredFields?: Array<string>;
  preferences?: { [key: string]: IPreference };
  groups?: IGroups;
  id_token?: string;
}

/**
 * @public
 */
export type ILoginResponse = IBaseResponse & IAccount & ISessionInfo & IInclude;

/**
 * @public
 */
export type ILogoutResponse = IBaseResponse & {
  connectedProviders: string;
  UID: string;
  logoutActiveSession: boolean;
  samlContext: string;
  connectedSamlSessions: string;
};

/**
 * @public
 */
export type IInitRegistrationResponse = IBaseResponse & {
  regToken: string;
};

/**
 * @public
 */
export type IRegisterResponse = IBaseResponse & IAccount & ISessionInfo & IInclude;

/**
 * @public
 */
export type IFinalizeRegistrationResponse = IBaseResponse &
  IAccount &
  ISessionInfo &
  IInclude;

/**
 * @public
 */
export type IIsAvailableLoginIDResponse = IBaseResponse & {
  isAvailable: boolean;
};

/**
 * @public
 */
export type IGetAccountInfoResponse = IBaseResponse &
  IAccount &
  Pick<IInclude, 'emails' | 'preferences' | 'groups'>;

/**
 * @public
 */
export type ISetAccountInfoResponse = IBaseResponse & {
  UID: string;
  validationErrors: {
    errorCode: number;
    message: string;
    fieldName: string;
  };
};

/**
 * @public
 */
export type IGetSchemaResponse = IBaseResponse & {
  preferencesSchema: {
    dynamicSchema: boolean;
    fields: { [key: string]: IPreferencesSchemaField };
  };
};

/**
 * @public
 */
export interface IGetOrganizationInfo {
  cvr: number[];
  ean: string[];
  city: string[];
  state: string[];
  country: string[];
  contract?: string[];
  doorcode?: string[];
  zip_code?: string[];
  substitutions?: string[];
  street_address?: string[];
}

/**
 * @public
 */
export interface IOrganizationInfo {
  orgId: string;
  orgName: string;
  bpid: string;
  description: string;
  source: string;
  type: string;
  status: OrganizationInfoStatus;
  memberLimit: number;
  info: IGetOrganizationInfo;
}

/**
 * @public
 */
export type IGetOrganizationInfoResponse = IBaseResponse & IOrganizationInfo;

/**
 * @public
 */
export interface IGetJWTResponse extends IBaseResponse {
  id_token: string;
  ignoredFields: string;
}
