import { of } from 'rxjs';
import {
  IRequestResult,
  IRequestHandler,
  DataType
} from '@salling-group/request-handlers';
import { rxSandbox, RxSandboxInstance } from 'rx-sandbox';
import { GigyaApi } from './GigyaApi';
import { ILoginResponse } from './types/Responses';
import {
  IDefaultGigyaParams,
  IFinalizeRegistrationParams,
  IGetAccountInfoParams,
  IIsAvailableLoginIDParams,
  ILoginParams,
  ILogoutParams,
  IRegisterParams,
  ISetAccountInfoParams,
  IUpdateRegistrationParams,
  IResetPasswordParams,
  IGetOrganizationInfoParams,
  IGetRegistrationInfoParams,
  IGetJWTParams
} from './types/Params';

describe('GigyaApi', () => {
  let scheduler: RxSandboxInstance;
  let anonymousHandler: IRequestHandler;
  let authorizedHandler: IRequestHandler;
  let gigyaApi: GigyaApi;

  const apiKey = 'apiKey';
  const defaultGigyaParams: Readonly<IDefaultGigyaParams> = {
    apiKey,
    httpStatusCodes: true
  };
  const responseMock: Readonly<IRequestResult<Partial<ILoginResponse>>> = {
    statusCode: 200,
    data: {
      statusCode: 200
    }
  };

  beforeEach(() => {
    scheduler = rxSandbox.create(true);
    anonymousHandler = {
      request: jest.fn()
    };
    authorizedHandler = {
      request: jest.fn()
    };
    gigyaApi = new GigyaApi(anonymousHandler, authorizedHandler, {
      apiKey,
      baseUrl: 'https://accounts.eu1.gigya.com'
    });

    jest.resetAllMocks();
  });

  describe('common', () => {
    it('should use the apiKey from the constructor and httpStatusCodes as true in query object', () => {
      const api = new GigyaApi(anonymousHandler, authorizedHandler, {
        apiKey: 'some api key',
        baseUrl: 'https://accounts.eu1.gigya.com'
      });
      api.initRegistration();

      expect(anonymousHandler.request).toHaveBeenCalledWith({
        method: 'POST',
        url: `https://accounts.eu1.gigya.com/accounts.initRegistration`,
        data: {
          apiKey: 'some api key',
          httpStatusCodes: true
        },
        dataType: DataType.PLAIN
      });
    });
  });

  describe('login', () => {
    it('should request accounts.login using anonymouslyHandler with given params', () => {
      const { getMessages, e } = scheduler;
      anonymousHandler.request = jest.fn().mockImplementation(() => of(responseMock));
      const params: ILoginParams = {
        loginID: 'employee@salling.dk',
        password: 'secret',
        loginMode: 'link',
        include: ['id_token', 'profile', 'emails', 'data'],
        sessionExpiration: 1,
        actionAttributes: {
          key1: ['value1', 'value2'],
          key2: ['value1']
        },
        captchaText: 'captchaText',
        captchaToken: 'captchaToken',
        cid: 'cid-123',
        targetEnv: 'mobile'
      };

      const request$ = gigyaApi.login(params);
      const result = getMessages(request$);

      expect(authorizedHandler.request).toHaveBeenCalledTimes(0);
      expect(anonymousHandler.request).toHaveBeenCalledTimes(1);
      expect(anonymousHandler.request).toHaveBeenLastCalledWith({
        method: 'POST',
        url: `https://accounts.eu1.gigya.com/accounts.login`,
        data: {
          ...defaultGigyaParams,
          ...params,
          include: ['id_token', 'profile', 'emails', 'data']
        },
        dataType: DataType.PLAIN
      });
      expect(result).toEqual(e('(a|)', { a: responseMock }));
    });
  });

  describe('logout', () => {
    it('should request accounts.logout using authorizedHandler with given params', () => {
      const { getMessages, e } = scheduler;
      authorizedHandler.request = jest.fn().mockImplementation(() => of(responseMock));
      const params: ILogoutParams = {
        UID: 'uid-123',
        cid: 'cid-123'
      };

      const request$ = gigyaApi.logout(params);
      const result = getMessages(request$);

      expect(anonymousHandler.request).toHaveBeenCalledTimes(0);
      expect(authorizedHandler.request).toHaveBeenCalledTimes(1);
      expect(authorizedHandler.request).toHaveBeenLastCalledWith({
        method: 'POST',
        url: `https://accounts.eu1.gigya.com/accounts.logout`,
        data: {
          ...defaultGigyaParams,
          ...params
        },
        dataType: DataType.PLAIN
      });
      expect(result).toEqual(e('(a|)', { a: responseMock }));
    });
  });

  describe('initRegistration', () => {
    it('should request accounts.initRegistration using anonymouslyHandler with given params', () => {
      const { getMessages, e } = scheduler;
      anonymousHandler.request = jest.fn().mockImplementation(() => of(responseMock));

      const request$ = gigyaApi.initRegistration();
      const result = getMessages(request$);

      expect(authorizedHandler.request).toHaveBeenCalledTimes(0);
      expect(anonymousHandler.request).toHaveBeenCalledTimes(1);
      expect(anonymousHandler.request).toHaveBeenLastCalledWith({
        method: 'POST',
        url: `https://accounts.eu1.gigya.com/accounts.initRegistration`,
        data: { ...defaultGigyaParams },
        dataType: DataType.PLAIN
      });
      expect(result).toEqual(e('(a|)', { a: responseMock }));
    });
  });

  describe('getSchema', () => {
    it('should request accounts.getSchema using anonymouslyHandler', () => {
      const { getMessages, e } = scheduler;
      anonymousHandler.request = jest.fn().mockImplementation(() => of(responseMock));

      const request$ = gigyaApi.getSchema();
      const result = getMessages(request$);

      expect(authorizedHandler.request).toHaveBeenCalledTimes(0);
      expect(anonymousHandler.request).toHaveBeenCalledTimes(1);
      expect(anonymousHandler.request).toHaveBeenLastCalledWith({
        method: 'GET',
        url: `https://accounts.eu1.gigya.com/accounts.getSchema`,
        query: { ...defaultGigyaParams }
      });
      expect(result).toEqual(e('(a|)', { a: responseMock }));
    });
  });

  describe('register', () => {
    it('should request accounts.register using anonymouslyHandler with given params', () => {
      const { getMessages, e } = scheduler;
      anonymousHandler.request = jest.fn().mockImplementation(() => of(responseMock));
      const params: IRegisterParams = {
        password: 'secret',
        regToken: 'regToken',
        username: 'username',
        email: 'employee@salling.dk',
        cid: 'cid-123',
        captchaToken: 'captchaToken',
        captchaText: 'captchaText',
        targetEnv: 'browser',
        data: { some: 'data' },
        finalizeRegistration: true,
        include: 'identities-active, emails',
        lang: 'da',
        profile: {
          gender: 'u',
          birthYear: 2012
        },
        regSource: 'regSource',
        secretQuestion: 'Knock konck',
        secretAnswer: `Who's there`,
        sessionExpiration: 1,
        siteUID: 'siteUID',
        preferences: { somePreferenceId: { isConsentGranted: true } },
        subscriptions: {
          someSubscriptionID: {
            isSubscribed: true,
            lastUpdatedSubscriptionState: 'lastUpdatedSubscriptionState',
            tags: ['tag1', 'tag2'],
            doubleOptIn: {
              confirmTime: 'confirmTime',
              emailSentTime: 'emailSentTime',
              status: 'NotConfirmed'
            }
          }
        }
      };

      const request$ = gigyaApi.register(params);
      const result = getMessages(request$);

      expect(authorizedHandler.request).toHaveBeenCalledTimes(0);
      expect(anonymousHandler.request).toHaveBeenCalledTimes(1);
      expect(anonymousHandler.request).toHaveBeenLastCalledWith({
        method: 'POST',
        url: `https://accounts.eu1.gigya.com/accounts.register`,
        data: {
          apiKey: 'apiKey',
          captchaText: 'captchaText',
          captchaToken: 'captchaToken',
          cid: 'cid-123',
          data: '{"some":"data"}',
          email: 'employee@salling.dk',
          finalizeRegistration: true,
          httpStatusCodes: true,
          include: 'identities-active, emails',
          lang: 'da',
          password: 'secret',
          preferences: '{"somePreferenceId":{"isConsentGranted":true}}',
          profile: '{"gender":"u","birthYear":2012}',
          regSource: 'regSource',
          regToken: 'regToken',
          secretAnswer: "Who's there",
          secretQuestion: 'Knock konck',
          sessionExpiration: 1,
          siteUID: 'siteUID',
          subscriptions:
            '{"someSubscriptionID":{"isSubscribed":true,"lastUpdatedSubscriptionState":"lastUpdatedSubscriptionState","tags":["tag1","tag2"],"doubleOptIn":{"confirmTime":"confirmTime","emailSentTime":"emailSentTime","status":"NotConfirmed"}}}',
          targetEnv: 'browser',
          username: 'username'
        },
        dataType: DataType.PLAIN
      });
      expect(result).toEqual(e('(a|)', { a: responseMock }));
    });
  });

  describe('finalizeRegistration', () => {
    it('should request accounts.finalizeRegistration using anonymouslyHandler with given params', () => {
      const { getMessages, e } = scheduler;
      anonymousHandler.request = jest.fn().mockImplementation(() => of(responseMock));
      const params: IFinalizeRegistrationParams = {
        regToken: 'regToken',
        allowAccountsLinking: true,
        include: ['loginIDs', 'emails'],
        targetEnv: 'mobile'
      };

      const request$ = gigyaApi.finalizeRegistration(params);
      const result = getMessages(request$);

      expect(authorizedHandler.request).toHaveBeenCalledTimes(0);
      expect(anonymousHandler.request).toHaveBeenCalledTimes(1);
      expect(anonymousHandler.request).toHaveBeenLastCalledWith({
        method: 'POST',
        url: `https://accounts.eu1.gigya.com/accounts.finalizeRegistration`,
        query: { ...defaultGigyaParams, ...params }
      });
      expect(result).toEqual(e('(a|)', { a: responseMock }));
    });
  });

  describe('isAvailableLoginID', () => {
    it('should request accounts.isAvailableLoginID using anonymouslyHandler with given params', () => {
      const { getMessages, e } = scheduler;
      anonymousHandler.request = jest.fn().mockImplementation(() => of(responseMock));
      const params: IIsAvailableLoginIDParams = {
        loginID: 'employee@salling.dk'
      };

      const request$ = gigyaApi.isAvailableLoginID(params);
      const result = getMessages(request$);

      expect(authorizedHandler.request).toHaveBeenCalledTimes(0);
      expect(anonymousHandler.request).toHaveBeenCalledTimes(1);
      expect(anonymousHandler.request).toHaveBeenLastCalledWith({
        method: 'GET',
        url: `https://accounts.eu1.gigya.com/accounts.isAvailableLoginID`,
        query: { ...defaultGigyaParams, ...params }
      });
      expect(result).toEqual(e('(a|)', { a: responseMock }));
    });
  });

  describe('setAccountInfo', () => {
    it('should request accounts.setAccountInfo using authorizedHandler with given params', () => {
      const { getMessages, e } = scheduler;
      authorizedHandler.request = jest.fn().mockImplementation(() => of(responseMock));
      const params: ISetAccountInfoParams = {
        UID: 'UID-123',
        addLoginEmails: 'addLoginEmails',
        conflictHandling: 'saveProfileAndFail',
        created: 'created',
        data: { some: 'data' },
        isActive: true
      };

      const request$ = gigyaApi.setAccountInfo(params);
      const result = getMessages(request$);

      expect(anonymousHandler.request).toHaveBeenCalledTimes(0);
      expect(authorizedHandler.request).toHaveBeenCalledTimes(1);
      expect(authorizedHandler.request).toHaveBeenLastCalledWith({
        method: 'POST',
        url: `https://accounts.eu1.gigya.com/accounts.setAccountInfo`,
        query: defaultGigyaParams,
        data: {
          UID: 'UID-123',
          addLoginEmails: 'addLoginEmails',
          conflictHandling: 'saveProfileAndFail',
          created: 'created',
          data: '{"some":"data"}',
          isActive: true
        },
        dataType: DataType.PLAIN
      });
      expect(result).toEqual(e('(a|)', { a: responseMock }));
    });
  });

  describe('updateRegistration', () => {
    it('should request accounts.setAccountInfo using anonymousHandler with given params', () => {
      const { getMessages, e } = scheduler;
      anonymousHandler.request = jest.fn().mockImplementation(() => of(responseMock));
      const params: IUpdateRegistrationParams = {
        profile: {
          firstName: 'name'
        }
      };

      const request$ = gigyaApi.updateRegistration(params);
      const result = getMessages(request$);

      expect(anonymousHandler.request).toHaveBeenCalledTimes(1);
      expect(authorizedHandler.request).toHaveBeenCalledTimes(0);
      expect(anonymousHandler.request).toHaveBeenLastCalledWith({
        method: 'POST',
        url: `https://accounts.eu1.gigya.com/accounts.setAccountInfo`,
        query: defaultGigyaParams,
        data: {
          profile: '{"firstName":"name"}'
        },
        dataType: DataType.PLAIN
      });
      expect(result).toEqual(e('(a|)', { a: responseMock }));
    });
  });

  describe('getRegistrationInfo', () => {
    it('should request accounts.getAccountInfo using anonymousHandler with regToken', () => {
      const { getMessages, e } = scheduler;
      anonymousHandler.request = jest.fn().mockImplementation(() => of(responseMock));
      const params: IGetRegistrationInfoParams = {
        UID: 'UID-123',
        extraProfileFields: 'extraProfileFields',
        include: ['irank', 'preferences'],
        regToken: 'regToken'
      };

      const request$ = gigyaApi.getRegistrationInfo(params);
      const result = getMessages(request$);

      expect(authorizedHandler.request).toHaveBeenCalledTimes(0);
      expect(anonymousHandler.request).toHaveBeenCalledTimes(1);
      expect(anonymousHandler.request).toHaveBeenLastCalledWith({
        method: 'GET',
        url: `https://accounts.eu1.gigya.com/accounts.getAccountInfo`,
        query: { ...defaultGigyaParams, ...params }
      });
      expect(result).toEqual(e('(a|)', { a: responseMock }));
    });
  });

  describe('getAccountInfo', () => {
    it('should request accounts.getAccountInfo using authorizedHandler with given params', () => {
      const { getMessages, e } = scheduler;
      authorizedHandler.request = jest.fn().mockImplementation(() => of(responseMock));
      const params: IGetAccountInfoParams = {
        UID: 'UID-123',
        extraProfileFields: 'extraProfileFields',
        include: ['irank', 'preferences'],
        regToken: 'regToken'
      };

      const request$ = gigyaApi.getAccountInfo(params);
      const result = getMessages(request$);

      expect(anonymousHandler.request).toHaveBeenCalledTimes(0);
      expect(authorizedHandler.request).toHaveBeenCalledTimes(1);
      expect(authorizedHandler.request).toHaveBeenLastCalledWith({
        method: 'GET',
        url: `https://accounts.eu1.gigya.com/accounts.getAccountInfo`,
        query: { ...defaultGigyaParams, ...params }
      });
      expect(result).toEqual(e('(a|)', { a: responseMock }));
    });
  });

  describe('resetPassword', () => {
    it('should request accounts.resetPassword using anonymousHandler with given params', () => {
      const { getMessages, e } = scheduler;
      anonymousHandler.request = jest.fn().mockImplementation(() => of(responseMock));
      const params: IResetPasswordParams = {
        loginID: 'sallingtest@email.com'
      };

      const request$ = gigyaApi.resetPassword(params);
      const result = getMessages(request$);

      expect(anonymousHandler.request).toHaveBeenCalledTimes(1);
      expect(authorizedHandler.request).toHaveBeenCalledTimes(0);
      expect(anonymousHandler.request).toHaveBeenLastCalledWith({
        method: 'POST',
        url: `https://accounts.eu1.gigya.com/accounts.resetPassword`,
        query: defaultGigyaParams,
        data: {
          loginID: 'sallingtest@email.com'
        },
        dataType: DataType.PLAIN
      });
      expect(result).toEqual(e('(a|)', { a: responseMock }));
    });
  });

  describe('getOrganizationInfo', () => {
    it('should request accounts.b2b.getOrganizationInfo using authorizedHandler with given params', () => {
      const { getMessages, e } = scheduler;
      authorizedHandler.request = jest.fn().mockImplementation(() => of(responseMock));
      const params: IGetOrganizationInfoParams = {
        orgId: 'test_org_id'
      };

      const request$ = gigyaApi.getOrganizationInfo(params);
      const result = getMessages(request$);

      expect(anonymousHandler.request).toHaveBeenCalledTimes(0);
      expect(authorizedHandler.request).toHaveBeenCalledTimes(1);
      expect(authorizedHandler.request).toHaveBeenLastCalledWith({
        method: 'POST',
        url: `https://accounts.eu1.gigya.com/accounts.b2b.getOrganizationInfo`,
        query: { ...defaultGigyaParams },
        data: { ...params },
        dataType: DataType.PLAIN
      });
      expect(result).toEqual(e('(a|)', { a: responseMock }));
    });
  });

  describe('getJWT', () => {
    it('should request accounts.getJWT using authorizedHandler with given params', () => {
      const { getMessages, e } = scheduler;
      authorizedHandler.request = jest.fn().mockImplementation(() => of(responseMock));
      const params: IGetJWTParams = {
        targetUID: 'test_target_uid',
        login_token: 'test_login_token'
      };

      const request$ = gigyaApi.getJWT(params);
      const result = getMessages(request$);

      expect(anonymousHandler.request).toHaveBeenCalledTimes(0);
      expect(authorizedHandler.request).toHaveBeenCalledTimes(1);
      expect(authorizedHandler.request).toHaveBeenLastCalledWith({
        method: 'POST',
        url: `https://accounts.eu1.gigya.com/accounts.getJWT`,
        query: { ...defaultGigyaParams },
        data: { ...params },
        dataType: DataType.PLAIN
      });
      expect(result).toEqual(e('(a|)', { a: responseMock }));
    });
  });
});
