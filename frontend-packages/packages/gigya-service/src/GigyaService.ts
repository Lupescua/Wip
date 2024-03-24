import { from, Observable, combineLatest, throwError, of } from 'rxjs';
import {
  catchError,
  concatMap,
  map,
  switchMap,
  tap,
  withLatestFrom,
  finalize,
  mapTo,
  take
} from 'rxjs/operators';
import { Action, IEmitableObservable, Service } from '@salling-group/core-service';
import {
  IGigyaApi,
  IPreference,
  ISetAccountInfoParams,
  IGetAccountInfoParams,
  IUpdateRegistrationParams,
  IProfile,
  ISubscription,
  IPreferencesSchemaField,
  IRegisterPreferences,
  IResetPasswordParams,
  IBaseResponse,
  GigyaErrorCode,
  IGetOrganizationInfoParams,
  IOrganization,
  IOrganizationInfo,
  isGigyaError,
  getGigyaErrorCode,
  ILoginResponse,
  IGetAccountInfoResponse,
  IGetRegistrationInfoParams,
  IGetJWTParams
} from '@salling-group/gigya-api';
import { initialState } from './initialState';
import { IRequestResult, ITokenSource } from '@salling-group/request-handlers';
import { flatten } from './utils/flatten';
import { validateUserConsents } from './utils/validators';
import { IAuthenticationService } from '@salling-group/core';

/**
 * @public
 */
export interface IGigyaService {
  isLoggedIn: Observable<boolean>;
  isValid: Observable<boolean | undefined>;
  hasToken: Observable<boolean>;
  name: Observable<string>;
  profile: Observable<IProfile | undefined>;
  uid: Observable<string | undefined>;
  accountCheck: Observable<IAccountCheck | undefined>;
  status: Observable<GigyaServiceStatus>;
  recentlyRegistered: Observable<boolean>;
  activeOrganization: Observable<IOrganizationInfo | undefined>;
  organizations: Observable<Array<IOrganization> | undefined>;
  clearAccountCheck(): void;
  preferenceSchema(key: string): Observable<IPreferencesSchemaField | undefined>;
  hasSubscription(key: string): Observable<boolean>;
  login({ loginID, password }: ILoginPayload): IEmitableObservable<IGigyaServiceState>;
  initRegistration(): IEmitableObservable<IGigyaServiceState>;
  checkLoginId({
    loginID
  }: ICheckLoginIdPayload): IEmitableObservable<IGigyaServiceState>;
  getAccountInfo(): IEmitableObservable<IGigyaServiceState>;
  getRegistrationInfo(): IEmitableObservable<IGigyaServiceState>;
  setAccountInfo(params: ISetAccountInfoParams): IEmitableObservable<IGigyaServiceState>;
  updateRegistration(
    params: IUpdateRegistrationPayload
  ): IEmitableObservable<IGigyaServiceState>;
  finalizeRegistration(): IEmitableObservable<IGigyaServiceState>;
  register(params: IRegisterPayload): IEmitableObservable<IGigyaServiceState>;
  getSchema(): IEmitableObservable<IGigyaServiceState>;
  logout(): IEmitableObservable<unknown>;
  getValue(): IGigyaServiceState;
  resetPassword(
    params: IResetPasswordParams
  ): IEmitableObservable<IRequestResult<IBaseResponse>>;
  setActiveOrganization(
    params: IGetOrganizationInfoParams
  ): IEmitableObservable<IGigyaServiceState>;
  getJWT(params: IGetJWTParams): IEmitableObservable<IRequestResult<IBaseResponse>>;
}

/**
 * @public
 */
export enum GigyaServiceStatus {
  INITIAL = 0,
  SIGNIN = 1,
  SIGNUP = 2,
  COMPLETE_SIGNUP = 3,
  SELECT_ORGANIZATION = 4,
  PASSWORD_CHANGE = 5
}

/**
 * @public
 */
export interface IGigyaValidationPolicy {
  requiredConsents: Record<string, boolean | number>;
}

/**
 * @public
 */
export interface ICheckLoginIdPayload {
  loginID: string;
}

/**
 * @public
 */
export interface IGigyaServiceState {
  id?: string;
  profile?: IProfile;
  regToken?: string;
  requirePasswordChange?: boolean;
  preferences?: Record<string, IPreference>;
  subscriptions?: Record<string, ISubscription>;
  isRegistered?: boolean;
  token?: string;
  accountCheck?: IAccountCheck;
  preferencesSchema?: Record<string, IPreferencesSchemaField>;
  registeredTimestamp?: number;
  organizations?: Array<IOrganization>;
  activeOrganization?: IOrganizationInfo;
}

/**
 * @public
 */
export interface ILoginPayload {
  loginID: string;
  password: string;
}

/**
 * @public
 */
export interface IAccountCheck {
  loginID?: string;
  isAvailable?: boolean;
  password?: string;
}

/**
 * @public
 */
export interface IRegisterPayload {
  password: string;
  terms: boolean;
  profile?: Partial<IProfile>;
  consents?: string[];
  preferences?: IRegisterPreferences;
  subscriptions?: Record<string, ISubscription>;
}

/**
 * @public
 */
export interface IUpdateRegistrationPayload extends IUpdateRegistrationParams {
  finalize?: boolean;
  profile?: Partial<IProfile>;
  consents?: string[];
  preferences?: IRegisterPreferences;
  subscriptions?: Record<string, ISubscription>;
}

/**
 * @public
 */
export class GigyaService
  extends Service<IGigyaServiceState>
  implements IGigyaService, IAuthenticationService<string> {
  private _api: IGigyaApi;
  private _gigyaToken: ITokenSource<string>;
  private _organizationIdToken: ITokenSource<string>;
  private _validationPolicy?: IGigyaValidationPolicy;
  private _organizationRequired: Observable<boolean>;

  public constructor(
    gigyaToken: ITokenSource<string>,
    organizationIdToken: ITokenSource<string>,
    api: IGigyaApi,
    organizationRequired: Observable<boolean>,
    overrideState?: Partial<IGigyaServiceState>,
    validationPolicy?: IGigyaValidationPolicy
  ) {
    super({ ...initialState, ...overrideState });
    this._api = api;
    this._gigyaToken = gigyaToken;
    this._validationPolicy = validationPolicy;
    this._organizationRequired = organizationRequired;
    this._organizationIdToken = organizationIdToken;
  }

  public get isLoggedIn(): Observable<boolean> {
    return combineLatest([this.isValid, from(this._gigyaToken.get())]).pipe(
      map(([isValid, token]) => !!isValid && !!token)
    );
  }

  public get isValid(): Observable<boolean | undefined> {
    return combineLatest([
      this._preferences,
      from(this._organizationIdToken.get()),
      this._organizationRequired
    ]).pipe(
      map(([userConsents, activeOrganizationToken, organizationRequired]) => {
        const consentsValid = validateUserConsents(
          this._validationPolicy?.requiredConsents,
          userConsents
        );
        const organizationValid = organizationRequired ? !!activeOrganizationToken : true;

        return organizationValid && consentsValid;
      })
    );
  }

  public get hasToken(): Observable<boolean> {
    return from(this._gigyaToken.get()).pipe(map((token) => !!token));
  }

  public get uid(): Observable<string | undefined> {
    return this.selector((state) => state.id);
  }

  public get name(): Observable<string> {
    return this.selector((state) => state.profile?.firstName ?? '');
  }

  public get profile(): Observable<IProfile | undefined> {
    return this.selector((state) => state.profile);
  }

  public get accountCheck(): Observable<IAccountCheck | undefined> {
    return this.selector((state) => state.accountCheck);
  }

  public get status(): Observable<GigyaServiceStatus> {
    return combineLatest([
      this.state,
      this._organizationRequired,
      this.hasToken,
      this.isValid,
      from(this._organizationIdToken.get())
    ]).pipe(
      map(([state, organizationRequired, hasAuthToken, isValid, hasOrgIdToken]) => {
        // If reg token is set but password is requested to be changed (one time password)
        if (state.regToken && state.requirePasswordChange)
          return GigyaServiceStatus.PASSWORD_CHANGE;

        // If reg token is avialable but not fully registered
        if (state.regToken && state.isRegistered === false)
          return GigyaServiceStatus.COMPLETE_SIGNUP;

        // If account check is in progress and account is available
        if (state.accountCheck && state.accountCheck.isAvailable)
          return GigyaServiceStatus.SIGNUP;

        // If logged in and organization is required but none is selected
        if (hasAuthToken && organizationRequired && !hasOrgIdToken)
          return GigyaServiceStatus.SELECT_ORGANIZATION;

        // If user is signed in but not valid, means consents or user info is missing
        if (hasAuthToken && isValid === false) return GigyaServiceStatus.COMPLETE_SIGNUP;

        // If account check is in progress and account is not avilable
        if (state.accountCheck && !state.accountCheck.isAvailable)
          return GigyaServiceStatus.SIGNIN;

        // Fallback is initial
        return GigyaServiceStatus.INITIAL;
      })
    );
  }

  public get recentlyRegistered(): Observable<boolean> {
    return this.selector((state) => {
      if (!state.isRegistered || !state.registeredTimestamp) {
        return false;
      }

      const twoHoursInMs = 2 * 60 * 60 * 1000;
      const twoHoursAgo = Date.now() - twoHoursInMs;
      return new Date(state.registeredTimestamp).getTime() > twoHoursAgo;
    });
  }

  public get organizations(): Observable<IOrganization[]> {
    return this.selector((state) => state.organizations ?? []);
  }

  public get activeOrganization(): Observable<IGigyaServiceState['activeOrganization']> {
    return this.selector((state) => state.activeOrganization);
  }

  private get _preferences(): Observable<IGigyaServiceState['preferences']> {
    return this.selector((state) => state.preferences);
  }

  public hasSubscription(key: string): Observable<boolean> {
    return this.selector(
      ({ subscriptions }) =>
        (subscriptions && subscriptions[key] && subscriptions[key].isSubscribed) ?? false
    );
  }

  public preferenceSchema(key: string): Observable<IPreferencesSchemaField | undefined> {
    return this.selector(
      ({ preferencesSchema }) => preferencesSchema && preferencesSchema[key]
    );
  }

  public clearAccountCheck(): void {
    this.setState((state) => ({ ...state, accountCheck: undefined }));
  }

  public clearActiveOrganization(): void {
    this.setState((state) => ({ ...state, activeOrganization: undefined }));
    this._persistOrgId('');
  }

  @Action()
  public initRegistration(): IEmitableObservable<IGigyaServiceState> {
    const initRegistration$ = this._api.initRegistration().pipe(
      map((r) => ({
        ...this.getValue(),
        regToken: r.data.regToken
      }))
    );
    return this.setState(() => initRegistration$);
  }

  @Action()
  public checkLoginId({
    loginID
  }: ICheckLoginIdPayload): IEmitableObservable<IGigyaServiceState> {
    const checkLoginIPayload$ = this._api.isAvailableLoginID({ loginID }).pipe(
      map((r) => ({
        ...this.getValue(),
        accountCheck: {
          loginID,
          isAvailable: r.data.isAvailable
        }
      }))
    );

    return this.setState(() => checkLoginIPayload$);
  }

  @Action()
  public login({
    loginID,
    password
  }: ILoginPayload): IEmitableObservable<IGigyaServiceState> {
    const login$ = this._api
      .login({
        loginID,
        password,
        include: ['preferences', 'groups', 'profile', 'subscriptions', 'data']
      })
      .pipe(
        map((r) => ({
          ...this.getValue(),
          profile: r.data.profile,
          id: r.data.UID,
          preferences: r.data.preferences,
          regToken: r.data.regToken,
          isRegistered:
            r.data.isRegistered &&
            r.data.errorCode !== GigyaErrorCode.ACCOUNT_PENDING_REGISTRATION,
          token: r.data.sessionInfo?.cookieValue,
          registeredTimestamp: r.data.registeredTimestamp,
          organizations: r.data.groups?.organizations ?? []
        })),
        catchError((err: unknown) => {
          // In case the user is required to change its password,
          // Gigya will for some reason throw a http error, even though login is actually alright
          // Due to this, we need to treat this as a non error, and hence don't rethrow
          if (
            isGigyaError(err) &&
            getGigyaErrorCode(err) === GigyaErrorCode.PENDING_PASSWORD_CHANGE
          )
            return of({
              ...this.getValue(),
              regToken: (err.response as Partial<ILoginResponse>).regToken,
              requirePasswordChange: true,
              accountCheck: {
                ...this.getValue().accountCheck,
                password
              }
            });

          return throwError(err);
        })
      );
    return this.setState(() => login$).pipe(tap((state) => this._persistToken(state)));
  }

  @Action()
  public register(params: IRegisterPayload): IEmitableObservable<IGigyaServiceState> {
    return this.setState((state) => {
      return this._api
        .register({
          regToken: state.regToken!,

          email: state.accountCheck?.loginID,
          password: params.password,
          data: { terms: params.terms },

          profile: params.profile,
          subscriptions: params.subscriptions,
          preferences: {
            ...(params.consents && this._consentsToPreferences(params.consents)),
            ...params.preferences
          },

          targetEnv: 'browser',
          lang: 'da'
        })
        .pipe(
          map((r) => ({
            ...this.getValue(),
            accountCheck: undefined,
            profile: r.data.profile,
            id: r.data.UID,
            regToken: r.data.regToken,
            preferences: flatten<IPreference>(r.data.preferences, 'isConsentGranted'),
            subscriptions: flatten<ISubscription>(r.data.subscriptions, 'isSubscribed'),
            isRegistered: r.data.isRegistered
          }))
        );
    });
  }

  @Action()
  public updateRegistration(
    params: IUpdateRegistrationPayload
  ): IEmitableObservable<IGigyaServiceState> {
    return this._api
      .updateRegistration({
        regToken: this.getValue().regToken!,
        profile: params.profile,
        subscriptions: params.subscriptions,
        data: { terms: true },
        preferences: {
          ...(params.consents && this._consentsToPreferences(params.consents)),
          ...params.preferences
        },
        password: params.password,
        newPassword: params.newPassword,
        lang: 'da'
      })
      .pipe(
        switchMap(() =>
          params.finalize ? this.finalizeRegistration() : this.getRegistrationInfo()
        )
      );
  }

  @Action()
  public finalizeRegistration(): IEmitableObservable<IGigyaServiceState> {
    const finalizeRegistration$ = ({
      regToken
    }: IGigyaServiceState): Observable<IGigyaServiceState> =>
      this._api
        .finalizeRegistration({ regToken: regToken!, include: ['subscriptions'] })
        .pipe(
          map((r) => ({
            ...this.getValue(),
            profile: r.data.profile,
            id: r.data.UID,
            preferences: flatten<IPreference>(r.data.preferences, 'isConsentGranted'),
            subscriptions: flatten<ISubscription>(r.data.subscriptions, 'isSubscribed'),
            isRegistered: r.data.isRegistered,
            token: r.data.sessionInfo!.cookieValue,
            regToken: undefined,
            registeredTimestamp: r.data.registeredTimestamp
          }))
        );
    return this.setState(finalizeRegistration$).pipe(
      tap((state) => this._persistToken(state))
    );
  }

  @Action()
  public getAccountInfo(): IEmitableObservable<IGigyaServiceState> {
    const params: IGetAccountInfoParams = {
      extraProfileFields: ['phones', 'address'],
      include: ['groups', 'profile', 'subscriptions', 'data', 'preferences']
    };
    const getInfo$ = this._api
      .getAccountInfo(params)
      .pipe(map((r) => this._mapAccountToState(r)));
    return this.setState(() => getInfo$);
  }

  @Action()
  public getRegistrationInfo(): IEmitableObservable<IGigyaServiceState> {
    const params: IGetRegistrationInfoParams = {
      regToken: this.getValue().regToken!,
      extraProfileFields: ['phones', 'address'],
      include: ['groups', 'profile', 'subscriptions', 'data', 'preferences']
    };
    const getInfo$ = this._api
      .getRegistrationInfo(params)
      .pipe(map((r) => this._mapAccountToState(r)));
    return this.setState(() => getInfo$);
  }

  @Action()
  public setAccountInfo(
    params: ISetAccountInfoParams
  ): IEmitableObservable<IGigyaServiceState> {
    return this._api.setAccountInfo(params).pipe(switchMap(() => this.getAccountInfo()));
  }

  @Action()
  public getSchema(): IEmitableObservable<IGigyaServiceState> {
    if (this.getValue().preferencesSchema) return this.state.pipe(take(1));

    const getSchema$ = this._api.getSchema().pipe(
      map((r) => ({
        ...this.getValue(),
        preferencesSchema: r.data.preferencesSchema.fields
      }))
    );
    return this.setState(() => getSchema$);
  }

  @Action()
  public logout(): IEmitableObservable<IGigyaServiceState> {
    return this._clearState().pipe(
      withLatestFrom(this.hasToken),
      concatMap(([state, hasToken]) => {
        if (hasToken) {
          return this._api.logout({ UID: '' }).pipe(mapTo(state));
        }
        return of(state);
      }),
      finalize(() => {
        // invalidate even if _api.logout throws an error
        this._gigyaToken.invalidate({});
        this._organizationIdToken.invalidate({});
      })
    );
  }

  @Action()
  public resetPassword(
    params: IResetPasswordParams
  ): IEmitableObservable<IRequestResult<IBaseResponse>> {
    return this._api.resetPassword(params);
  }

  @Action()
  public setActiveOrganization(
    params: IGetOrganizationInfoParams
  ): IEmitableObservable<IGigyaServiceState> {
    const getOrganizationInfo$ = this._api.getOrganizationInfo(params).pipe(
      concatMap((response) => {
        if (response.data.status !== 'APPROVED')
          return throwError({
            response: {
              errorCode: 'not-approved',
              status: response.data.status
            }
          });
        return of(response.data);
      }),
      map((organization) => ({
        ...this.getValue(),
        activeOrganization: organization
      }))
    );
    return this.setState(() => getOrganizationInfo$).pipe(
      tap(() => this._persistOrgId(params.orgId ?? params.bpid ?? ''))
    );
  }

  @Action()
  public getJWT(
    params: IGetJWTParams
  ): IEmitableObservable<IRequestResult<IBaseResponse>> {
    return this._api.getJWT(params);
  }

  private _mapAccountToState(
    r: IRequestResult<IGetAccountInfoResponse>
  ): IGigyaServiceState {
    return {
      ...this.getValue(),
      profile: r.data.profile,
      id: r.data.UID,
      // As this particular endpoint doesn't flatten the preferences, we need to do it
      preferences: flatten<IPreference>(r.data.preferences, 'isConsentGranted'),
      subscriptions: flatten<ISubscription>(r.data.subscriptions, 'isSubscribed'),
      isRegistered: r.data.isRegistered,
      registeredTimestamp: r.data.registeredTimestamp,
      organizations: r.data.groups?.organizations ?? [],
      requirePasswordChange: undefined
    };
  }

  private _persistToken({ token }: IGigyaServiceState): void {
    this._gigyaToken.set(token || '');
  }

  private _persistOrgId(orgId: string): void {
    this._organizationIdToken.set(orgId);
  }

  private _consentsToPreferences(consents: string[]): IRegisterPreferences {
    return consents.reduce<IRegisterPreferences>((acc, item) => {
      return {
        ...acc,
        [item]: { isConsentGranted: true }
      };
    }, {});
  }

  private _clearState(): Observable<IGigyaServiceState> {
    return this.setState((state) =>
      of({
        ...state,
        id: undefined,
        profile: undefined,
        regToken: undefined,
        preferences: undefined,
        subscriptions: undefined,
        isRegistered: undefined,
        token: undefined
      })
    );
  }
}
