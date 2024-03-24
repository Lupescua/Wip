import { Observable } from 'rxjs';

/**
 * @public
 */
export interface IAuthenticationService<TUID = unknown> {
  isLoggedIn: Observable<boolean>;
  isValid: Observable<boolean | undefined>;
  name: Observable<string>;
  uid: Observable<TUID | undefined>;
}
