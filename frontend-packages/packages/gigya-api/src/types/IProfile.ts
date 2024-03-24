import { IEducation } from './IEducation';
import { Gender } from './Gender';
import { ILike } from './ILike';
import { IWork } from './IWork';
import { IPhone } from './IPhone';

/**
 * @public
 */
export interface IProfile {
  firstName?: string;
  lastName?: string;
  nickname?: string;
  address?: string;
  bio?: string;
  birthDay?: number;
  birthMonth?: number;
  birthYear?: number;
  city?: string;
  country?: string;
  education?: Array<IEducation>;
  email?: string;
  gender?: Gender;
  hometown?: string;
  industry?: string;
  interestedIn?: string;
  languages?: string;
  locale?: string;
  name?: string;
  phones?: { default?: string } | Array<IPhone>;
  photoURL?: string;
  politicalView?: string;
  professionalHeadline?: string;
  profileURL?: string;
  relationshipStatus?: string;
  religion?: string;
  specialities?: string;
  state?: string;
  timezone?: string;
  thumbnailURL?: string;
  company?: string;
  username?: string;
  work?: Array<IWork>;
  zip?: string;
  likes?: Array<ILike>;
}
