import { IEducation } from './IEducation';
import { Gender } from './Gender';
import { ILike } from './ILike';
import { IPhone } from './IPhone';
import { IWork } from './IWork';

/**
 * @public
 */
export interface IIdentity {
  provider?: string;
  providerUID?: string;
  providerUIDSig?: string;
  mappedProviderUIDs?: Array<{
    providerUID: string;
    apiKey: string;
  }>;
  isLoginIdentity?: boolean;
  nickname?: string;
  allowsLogin: boolean;
  lastLoginTime: string;
  photoURL?: string;
  thumbnailURL?: string;
  firstName?: string;
  lastName?: string;
  gender: Gender;
  birthDay?: number;
  birthMonth?: number;
  birthYear?: number;
  email?: string;
  country?: string;
  state?: string;
  city?: string;
  zip?: string;
  profileURL?: string;
  languages?: string;
  address?: string;
  phones?: Array<IPhone>;
  education?: Array<IEducation>;
  honors?: string;
  professionalHeadline?: string;
  bio?: string;
  industry?: string;
  specialties?: string;
  religion?: string;
  politicalView?: string;
  interestedIn?: Array<string>;
  relationshipStatus?: string;
  hometown?: string;
  likes?: Array<ILike>;
  favorites?: object;
  followersCount?: number;
  followingCount?: number;
  username?: string;
  locale?: string;
  verified?: boolean;
  timezone?: string;
  missingPermissions?: string;
  samlData?: object;
  work?: Array<IWork>;
}
