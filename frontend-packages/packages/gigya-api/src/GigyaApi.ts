import {
  DataType,
  IRequestHandler,
  IRequestResult
} from '@salling-group/request-handlers';
import { Observable } from 'rxjs';
import {
  IDefaultGigyaParams,
  IFinalizeRegistrationParams,
  IGetAccountInfoParams,
  IIsAvailableLoginIDParams,
  ILoginParams,
  ILogoutParams,
  IResetPasswordParams,
  IRegisterParams,
  ISetAccountInfoParams,
  IUpdateRegistrationParams,
  IGetOrganizationInfoParams,
  IGetRegistrationInfoParams,
  IGetJWTParams
} from './types/Params';
import {
  IBaseResponse,
  IFinalizeRegistrationResponse,
  IGetAccountInfoResponse,
  IGetJWTResponse,
  IGetOrganizationInfoResponse,
  IGetSchemaResponse,
  IInitRegistrationResponse,
  IIsAvailableLoginIDResponse,
  ILoginResponse,
  ILogoutResponse,
  IRegisterResponse,
  ISetAccountInfoResponse
} from './types/Responses';

/**
 * @public
 */
export type IResult<TData> = Observable<IRequestResult<TData>>;

/**
 * @public
 */
export interface IGigyaApiConfig {
  apiKey: string;
  baseUrl: string;
}

/**
 * @public
 */
export interface IGigyaApi {
  login(params: ILoginParams): IResult<ILoginResponse>;
  logout(params?: ILogoutParams): IResult<ILogoutResponse>;
  initRegistration(): IResult<IInitRegistrationResponse>;
  register(params: IRegisterParams): IResult<IRegisterResponse>;
  finalizeRegistration(
    params: IFinalizeRegistrationParams
  ): IResult<IFinalizeRegistrationResponse>;
  isAvailableLoginID(
    params: IIsAvailableLoginIDParams
  ): IResult<IIsAvailableLoginIDResponse>;
  setAccountInfo(params: ISetAccountInfoParams): IResult<IBaseResponse>;
  getAccountInfo(params?: IGetAccountInfoParams): IResult<IGetAccountInfoResponse>;
  updateRegistration(params?: IUpdateRegistrationParams): IResult<IBaseResponse>;
  getRegistrationInfo(
    params?: IGetRegistrationInfoParams
  ): IResult<IGetAccountInfoResponse>;
  getSchema(): IResult<IGetSchemaResponse>;
  resetPassword(params: IResetPasswordParams): IResult<IBaseResponse>;
  getOrganizationInfo(
    params: IGetOrganizationInfoParams
  ): IResult<IGetOrganizationInfoResponse>;
  getJWT(params: IGetJWTParams): IResult<IGetJWTResponse>;
}

/**
 * @public
 */
export class GigyaApi implements IGigyaApi {
  private _anonymousRequestHandler: IRequestHandler;
  private _authorizedRequestHandler: IRequestHandler;
  private _config: IGigyaApiConfig;

  public constructor(
    anonymouslyRequestHandler: IRequestHandler,
    authorizedRequestHandler: IRequestHandler,
    config: IGigyaApiConfig
  ) {
    this._anonymousRequestHandler = anonymouslyRequestHandler;
    this._authorizedRequestHandler = authorizedRequestHandler;
    this._config = config;
  }

  /**
   * {@link https://help.sap.com/viewer/8b8d6fffe113457094a17701f63e3d6a/LATEST/en-US/683844d3c4b54104b2201efffdf558e3.html}
   */
  public login(params: ILoginParams): IResult<ILoginResponse> {
    const paramsWithDefaults = this._addDefaultParamsTo(params);

    return this._anonymousRequestHandler.request<ILoginResponse>({
      url: `${this._baseUrl}/accounts.login`,
      method: 'POST',
      data: paramsWithDefaults,
      dataType: DataType.PLAIN
    });
  }

  /**
   * {@link https://help.sap.com/viewer/8b8d6fffe113457094a17701f63e3d6a/LATEST/en-US/41376ba570b21014bbc5a10ce4041860.html}
   */
  public logout(params?: ILogoutParams): IResult<ILogoutResponse> {
    const paramsWithDefaults = this._addDefaultParamsTo(params);

    return this._authorizedRequestHandler.request<ILogoutResponse>({
      url: `${this._baseUrl}/accounts.logout`,
      method: 'POST',
      data: paramsWithDefaults,
      dataType: DataType.PLAIN
    });
  }

  /**
   * {@link https://help.sap.com/viewer/8b8d6fffe113457094a17701f63e3d6a/LATEST/en-US/4136e1f370b21014bbc5a10ce4041860.html}
   */
  public initRegistration(): IResult<IInitRegistrationResponse> {
    const defaultParams = this._addDefaultParamsTo({});

    return this._anonymousRequestHandler.request<IInitRegistrationResponse>({
      url: `${this._baseUrl}/accounts.initRegistration`,
      method: 'POST',
      data: defaultParams,
      dataType: DataType.PLAIN
    });
  }

  /**
   * {@link https://help.sap.com/viewer/8b8d6fffe113457094a17701f63e3d6a/LATEST/en-US/1fe26c820cd145cd8c927a497c33d935.html}
   */
  public register(params: IRegisterParams): IResult<IRegisterResponse> {
    const defaultParams = this._addDefaultParamsTo(params);

    return this._anonymousRequestHandler.request<IRegisterResponse>({
      url: `${this._baseUrl}/accounts.register`,
      method: 'POST',
      data: this._jsonStringifyObject(defaultParams),
      dataType: DataType.PLAIN
    });
  }

  /**
   * {@link https://help.sap.com/viewer/8b8d6fffe113457094a17701f63e3d6a/LATEST/en-US/228cd8bc68dc477094b3e0e9fe108e23.html}
   */
  public finalizeRegistration(
    params: IFinalizeRegistrationParams
  ): IResult<IFinalizeRegistrationResponse> {
    const paramsWithDefaults = this._addDefaultParamsTo(params);

    return this._anonymousRequestHandler.request<IFinalizeRegistrationResponse>({
      url: `${this._baseUrl}/accounts.finalizeRegistration`,
      method: 'POST',
      query: paramsWithDefaults
    });
  }

  /**
   * {@link https://help.sap.com/viewer/8b8d6fffe113457094a17701f63e3d6a/LATEST/en-US/41370be670b21014bbc5a10ce4041860.html}
   */
  public isAvailableLoginID(
    params: IIsAvailableLoginIDParams
  ): IResult<IIsAvailableLoginIDResponse> {
    const paramsWithDefaults = this._addDefaultParamsTo(params);

    return this._anonymousRequestHandler.request<IIsAvailableLoginIDResponse>({
      url: `${this._baseUrl}/accounts.isAvailableLoginID`,
      method: 'GET',
      query: paramsWithDefaults
    });
  }

  /**
   * {@link https://help.sap.com/viewer/8b8d6fffe113457094a17701f63e3d6a/LATEST/en-US/41398a8670b21014bbc5a10ce4041860.html}
   */
  public setAccountInfo(params: ISetAccountInfoParams): IResult<IBaseResponse> {
    return this._authorizedRequestHandler.request<ISetAccountInfoResponse>({
      url: `${this._baseUrl}/accounts.setAccountInfo`,
      method: 'POST',
      query: this._addDefaultParamsTo({}),
      data: this._jsonStringifyObject(params),
      dataType: DataType.PLAIN
    });
  }

  /**
   * {@link https://help.sap.com/viewer/8b8d6fffe113457094a17701f63e3d6a/LATEST/en-US/41398a8670b21014bbc5a10ce4041860.html}
   * Same as setAccountInfo but using anon request handler so requires regToken to be set
   */
  public updateRegistration(params: IUpdateRegistrationParams): IResult<IBaseResponse> {
    return this._anonymousRequestHandler.request<ISetAccountInfoResponse>({
      url: `${this._baseUrl}/accounts.setAccountInfo`,
      method: 'POST',
      query: this._addDefaultParamsTo({}),
      data: this._jsonStringifyObject(params),
      dataType: DataType.PLAIN
    });
  }

  /**
   * {@link https://help.sap.com/viewer/8b8d6fffe113457094a17701f63e3d6a/LATEST/en-US/cab69a86edae49e2be93fd51b78fc35b.html}
   * Same as getAccountInfo but using anon request handler so requires regToken to be set
   */
  public getRegistrationInfo(
    params?: IGetRegistrationInfoParams
  ): IResult<IGetAccountInfoResponse> {
    const paramsWithDefaults = this._addDefaultParamsTo(params);

    return this._anonymousRequestHandler.request<IGetAccountInfoResponse>({
      url: `${this._baseUrl}/accounts.getAccountInfo`,
      method: 'GET',
      query: paramsWithDefaults
    });
  }

  /**
   * {@link https://help.sap.com/viewer/8b8d6fffe113457094a17701f63e3d6a/LATEST/en-US/cab69a86edae49e2be93fd51b78fc35b.html}
   */
  public getAccountInfo(
    params?: IGetAccountInfoParams
  ): IResult<IGetAccountInfoResponse> {
    const paramsWithDefaults = this._addDefaultParamsTo(params);

    return this._authorizedRequestHandler.request<IGetAccountInfoResponse>({
      url: `${this._baseUrl}/accounts.getAccountInfo`,
      method: 'GET',
      query: paramsWithDefaults
    });
  }

  /**
   * {@link https://help.sap.com/viewer/8b8d6fffe113457094a17701f63e3d6a/GIGYA/en-US/4135e80970b21014bbc5a10ce4041860.html?q=accounts.getSchema}
   */
  public getSchema(): IResult<IGetSchemaResponse> {
    const defaultParams = this._addDefaultParamsTo({});

    return this._anonymousRequestHandler.request<IGetSchemaResponse>({
      url: `${this._baseUrl}/accounts.getSchema`,
      method: 'GET',
      query: defaultParams
    });
  }

  /**
   * {@link https://help.sap.com/viewer/8b8d6fffe113457094a17701f63e3d6a/GIGYA/en-US/559574624b634e5a955e0f7eeba01c07.html}
   */
  public resetPassword(params: IResetPasswordParams): IResult<IBaseResponse> {
    return this._anonymousRequestHandler.request<IBaseResponse>({
      url: `${this._baseUrl}/accounts.resetPassword`,
      method: 'POST',
      query: this._addDefaultParamsTo({}),
      data: this._jsonStringifyObject(params),
      dataType: DataType.PLAIN
    });
  }

  /**
   * {@link https://help.sap.com/viewer/8b8d6fffe113457094a17701f63e3d6a/GIGYA/en-US/82a93f3c46114cf0834035a3d2e2af08.html}
   */
  public getOrganizationInfo(
    params: IGetOrganizationInfoParams
  ): IResult<IGetOrganizationInfoResponse> {
    return this._authorizedRequestHandler.request<IGetOrganizationInfoResponse>({
      url: `${this._baseUrl}/accounts.b2b.getOrganizationInfo`,
      method: 'POST',
      query: this._addDefaultParamsTo({}),
      data: this._jsonStringifyObject(params),
      dataType: DataType.PLAIN
    });
  }

  /**
   * {@link https://help.sap.com/docs/SAP_CUSTOMER_DATA_CLOUD/8b8d6fffe113457094a17701f63e3d6a/41353af770b21014bbc5a10ce4041860.html}
   */
  public getJWT(params: IGetJWTParams): IResult<IGetJWTResponse> {
    return this._authorizedRequestHandler.request<IGetJWTResponse>({
      url: `${this._baseUrl}/accounts.getJWT`,
      method: 'POST',
      query: this._addDefaultParamsTo({}),
      data: this._jsonStringifyObject(params),
      dataType: DataType.PLAIN
    });
  }

  private get _baseUrl(): string {
    return this._config.baseUrl;
  }

  private _addDefaultParamsTo<TParams>(params: TParams): IDefaultGigyaParams & TParams {
    return { ...params, apiKey: this._config.apiKey, httpStatusCodes: true };
  }

  private _jsonStringifyObject(obj: object): Record<string, unknown> {
    return Object.entries(obj).reduce((accumulator, [currentKey, currentValue]) => {
      if (typeof currentValue === 'object') {
        accumulator[currentKey] = JSON.stringify(currentValue);
      } else if (currentValue !== undefined) {
        accumulator[currentKey] = currentValue;
      }
      return accumulator;
    }, {} as Record<string, unknown>);
  }
}
