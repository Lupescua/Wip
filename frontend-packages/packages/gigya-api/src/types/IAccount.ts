import { IIdentity } from './IIdentity';
import { IProfile } from './IProfile';
import { ISubscription } from './ISubscription';

/**
 * @public
 */
export interface ILoginIDs {
  username: string;
  emails: Array<string>;
  unverifiedEmails: Array<string>;
}

/**
 * @public
 */
export interface IPassword {
  compoundHash: string;
  hash: string;
  hashSettings: IHashSettings;
}

/**
 * @public
 */
export interface IHashSettings {
  algorithm: string;
  rounds: number;
  salt: string;
  format: string;
  binaryFormat: string;
  url: string;
}

/**
 * @public
 */
export interface ILastLoginLocation {
  country?: string;
  state?: string;
  city?: string;
  coordinates?: ICoordinates;
}

/**
 * @public
 */
export interface ICoordinates {
  lat?: number;
  long?: number;
}

/**
 * @public
 */
export interface IAccount {
  UID: string;
  UIDSignature: string;
  signatureTimestamp: number;
  loginProvider: string;
  isRegistered: boolean;
  isActive: boolean;
  profile: IProfile;
  data: object;
  subscriptions: ISubscription;
  iRank: number;
  loginIDs: ILoginIDs;
  password: IPassword;
  socialProviders: string;
  identities: Array<IIdentity>;
  isVerified: boolean;
  verified: string;
  verifiedTimestamp: number;
  lastLogin: string;
  lastLoginTimestamp: number;
  lastUpdated: string;
  lastUpdatedTimestamp: number;
  created: string;
  createdTimestamp: number;
  regSource: string;
  lastLoginLocation?: ILastLoginLocation;
  registeredTimestamp: number;
}
