import {
  IGigyaApi,
  ILoginResponse,
  IGetSchemaResponse,
  IGetOrganizationInfoResponse,
  IOrganizationInfo
} from '@salling-group/gigya-api';
import { IRequestResult, ITokenSource } from '@salling-group/request-handlers';
import { of, throwError, EmptyError, BehaviorSubject } from 'rxjs';
import { GigyaService, GigyaServiceStatus, IGigyaService } from '../GigyaService';
import { rxSandbox, RxSandboxInstance } from 'rx-sandbox';
import * as validators from '../utils/validators';

describe('GigyaService', () => {
  let scheduler: RxSandboxInstance;
  let gigyaToken: ITokenSource<string>;
  let orgIdToken: ITokenSource<string>;
  let service: IGigyaService;
  let gigyaApi: IGigyaApi;
  let accountResult: IRequestResult<Partial<ILoginResponse>>;
  let schema: IRequestResult<Partial<IGetSchemaResponse>>;

  beforeEach(() => {
    scheduler = rxSandbox.create(true);
    jest.resetAllMocks();

    accountResult = {
      data: {
        UID: 'user-id',
        profile: {
          firstName: 'frederik',
          gender: 'u'
        },
        sessionInfo: {
          cookieValue: 'token',
          cookieName: 'name',
          sessionSecret: 'notused',
          sessionToken: 'notused'
        },
        regToken: 'regToken',
        preferences: {},
        isRegistered: true,
        registeredTimestamp: 0,
        groups: {
          organizations: [
            {
              orgName: 'org1 name',
              orgId: 'orgId',
              bpid: 'bpid1',
              roles: [],
              status: 'STATUS'
            }
          ]
        }
      },
      statusCode: 200
    };

    schema = {
      data: {
        preferencesSchema: {
          dynamicSchema: false,
          fields: {
            key1: {
              legalStatements: { da: { documentStoreType: 0, purpose: 'purpose' } }
            }
          }
        }
      },
      statusCode: 200
    };

    gigyaToken = {
      get: jest.fn(() => of('token')),
      set: jest.fn(),
      invalidate: jest.fn()
    };

    orgIdToken = {
      get: jest.fn(() => of('')),
      set: jest.fn(),
      invalidate: jest.fn()
    };

    gigyaApi = {
      finalizeRegistration: jest.fn(),
      getAccountInfo: jest.fn(),
      initRegistration: jest.fn(),
      isAvailableLoginID: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      setAccountInfo: jest.fn(),
      getSchema: jest.fn(),
      updateRegistration: jest.fn(),
      getRegistrationInfo: jest.fn(),
      resetPassword: jest.fn(),
      getOrganizationInfo: jest.fn(),
      getJWT: jest.fn()
    };

    service = new GigyaService(gigyaToken, orgIdToken, gigyaApi, of(false), undefined, {
      requiredConsents: {}
    });
  });

  describe('isLoggedIn', () => {
    it('emits true if token is truthy and user is valid', () => {
      const { getMessages, e } = scheduler;
      jest.spyOn(validators, 'validateUserConsents').mockReturnValue(true);
      (gigyaToken.get as jest.Mock).mockReturnValue(of('validtoken'));

      const result = getMessages(service.isLoggedIn);

      expect(result).toEqual(e('(a)', { a: true }));
    });
    it('emits false when token is falsy', () => {
      const { getMessages, e } = scheduler;
      (gigyaToken.get as jest.Mock).mockReturnValue(of(''));

      const result = getMessages(service.isLoggedIn);

      expect(result).toEqual(e('(a)', { a: false }));
    });
  });
  describe('isValid', () => {
    it('emits value of validateUserConsent', () => {
      const { getMessages, e } = scheduler;
      jest.spyOn(validators, 'validateUserConsents').mockReturnValue(true);

      const result = getMessages(service.isValid);

      expect(result).toEqual(e('(a)', { a: true }));
    });
    it('emits value of validateUserConsent even if policy is undefined', () => {
      const service = new GigyaService(gigyaToken, orgIdToken, gigyaApi, of(false));
      const { getMessages, e } = scheduler;
      jest.spyOn(validators, 'validateUserConsents').mockReturnValue(true);

      const result = getMessages(service.isValid);

      expect(result).toEqual(e('(a)', { a: true }));
    });
    it('emits false if organization is required but not set', () => {
      const service = new GigyaService(gigyaToken, orgIdToken, gigyaApi, of(true));
      const { getMessages, e } = scheduler;
      jest.spyOn(validators, 'validateUserConsents').mockReturnValue(true);

      const result = getMessages(service.isValid);

      expect(result).toEqual(e('(a)', { a: false }));
    });
    it('emits true if organization is required and an organization is set', () => {
      orgIdToken.get = jest.fn(() => of('orgId123'));
      const service = new GigyaService(gigyaToken, orgIdToken, gigyaApi, of(true));
      const { getMessages, e } = scheduler;
      jest.spyOn(validators, 'validateUserConsents').mockReturnValue(true);

      const result = getMessages(service.isValid);

      expect(result).toEqual(e('(a)', { a: true }));
    });
    it('reactively switches value when organization required changes', () => {
      const organizationRequired = new BehaviorSubject(false);
      const service = new GigyaService(
        gigyaToken,
        orgIdToken,
        gigyaApi,
        organizationRequired
      );
      const { getMessages, e } = scheduler;
      jest.spyOn(validators, 'validateUserConsents').mockReturnValue(true);

      const result = getMessages(service.isValid);
      organizationRequired.next(true);
      expect(result).toEqual(e('(ab)', { a: true, b: false }));
    });
  });
  describe('hasToken', () => {
    it('emits true if token is truthy', () => {
      const { getMessages, e } = scheduler;
      (gigyaToken.get as jest.Mock).mockReturnValue(of('validtoken'));

      const result = getMessages(service.hasToken);

      expect(result).toEqual(e('(a|)', { a: true }));
    });
    it('emits false when token is falsy', () => {
      const { getMessages, e } = scheduler;
      (gigyaToken.get as jest.Mock).mockReturnValue(of(''));

      const result = getMessages(service.hasToken);

      expect(result).toEqual(e('(a|)', { a: false }));
    });
  });
  describe('uid', () => {
    it('returns undefined when no user is set', () => {
      const { getMessages, e } = scheduler;
      const result = getMessages(service.uid);

      expect(result).toEqual(e('a', { a: undefined }));
    });
    it('returns correct id when user is set', () => {
      const service = new GigyaService(gigyaToken, orgIdToken, gigyaApi, of(false), {
        id: 'someid'
      });
      const { getMessages, e } = scheduler;
      const result = getMessages(service.uid);

      expect(result).toEqual(e('a', { a: 'someid' }));
    });
  });
  describe('name', () => {
    it('returns empty string when no user is set', () => {
      const { getMessages, e } = scheduler;
      const result = getMessages(service.name);

      expect(result).toEqual(e('a', { a: '' }));
    });
    it('returns name if state is set', () => {
      const service = new GigyaService(gigyaToken, orgIdToken, gigyaApi, of(false), {
        profile: { firstName: 'frederik', gender: 'u' }
      });
      const { getMessages, e } = scheduler;
      const result = getMessages(service.name);

      expect(result).toEqual(e('a', { a: 'frederik' }));
    });
  });

  describe('profile', () => {
    it('returns undefined when no profile is set', () => {
      const { getMessages, e } = scheduler;
      const result = getMessages(service.profile);

      expect(result).toEqual(e('a', { a: undefined }));
    });
    it('returns profile if state is set', () => {
      const service = new GigyaService(gigyaToken, orgIdToken, gigyaApi, of(false), {
        profile: { firstName: 'frederik', gender: 'u' }
      });
      const { getMessages, e } = scheduler;
      const result = getMessages(service.profile);

      expect(result).toEqual(
        e('a', {
          a: {
            firstName: 'frederik',
            gender: 'u'
          }
        })
      );
    });
  });

  describe('accountCheck', () => {
    it('returns undefined when no account set', () => {
      const { getMessages, e } = scheduler;
      const result = getMessages(service.accountCheck);

      expect(result).toEqual(e('a', { a: undefined }));
    });

    it('returns AccountCheck if state is set', () => {
      const service = new GigyaService(gigyaToken, orgIdToken, gigyaApi, of(false), {
        accountCheck: { loginID: 'xx@dk.com', isAvailable: true }
      });
      const { getMessages, e } = scheduler;
      const result = getMessages(service.accountCheck);

      expect(result).toEqual(e('a', { a: { loginID: 'xx@dk.com', isAvailable: true } }));
    });
  });

  describe('status', () => {
    it('emits PASSWORD_CHANGE if reg token is set and password change is requested', () => {
      const { getMessages, e } = scheduler;
      service = new GigyaService(
        gigyaToken,
        orgIdToken,
        gigyaApi,
        of(false),
        {
          regToken: '123',
          requirePasswordChange: true
        },
        { requiredConsents: {} }
      );

      const result = getMessages(service.status);

      expect(result).toEqual(e('a', { a: GigyaServiceStatus.PASSWORD_CHANGE }));
    });

    it('emits SIGNUP if account check is active and account is available', () => {
      const { getMessages, e } = scheduler;
      service = new GigyaService(
        gigyaToken,
        orgIdToken,
        gigyaApi,
        of(false),
        {
          accountCheck: {
            loginID: 'test',
            isAvailable: true
          }
        },
        { requiredConsents: {} }
      );

      const result = getMessages(service.status);

      expect(result).toEqual(e('a', { a: GigyaServiceStatus.SIGNUP }));
    });
    it('emits SIGNIN if account check is active but account is not available', () => {
      const { getMessages, e } = scheduler;
      service = new GigyaService(
        gigyaToken,
        orgIdToken,
        gigyaApi,
        of(false),
        {
          accountCheck: {
            loginID: 'test',
            isAvailable: false
          }
        },
        { requiredConsents: {} }
      );

      const result = getMessages(service.status);

      expect(result).toEqual(e('a', { a: GigyaServiceStatus.SIGNIN }));
    });
    it('emits COMPLETE_SIGNUP if reg token is set but not fully registered', () => {
      const { getMessages, e } = scheduler;
      service = new GigyaService(
        gigyaToken,
        orgIdToken,
        gigyaApi,
        of(false),
        {
          regToken: 'token',
          isRegistered: false
        },
        { requiredConsents: {} }
      );

      const result = getMessages(service.status);

      expect(result).toEqual(e('a', { a: GigyaServiceStatus.COMPLETE_SIGNUP }));
    });
    it('emits COMPLETE_SIGNUP if signed in but user not valid', () => {
      jest.spyOn(validators, 'validateUserConsents').mockReturnValue(false);
      const { getMessages, e } = scheduler;
      service = new GigyaService(
        gigyaToken,
        orgIdToken,
        gigyaApi,
        of(false),
        {
          token: '123',
          isRegistered: true
        },
        {
          requiredConsents: {}
        }
      );

      const result = getMessages(service.status);

      expect(result).toEqual(e('a', { a: GigyaServiceStatus.COMPLETE_SIGNUP }));
    });
    it('emits SELECT_ORGANIZATION if organization is required and no organization is set', () => {
      const { getMessages, e } = scheduler;
      service = new GigyaService(
        gigyaToken,
        orgIdToken,
        gigyaApi,
        of(true),
        {
          regToken: 'token',
          isRegistered: true,
          organizations: []
        },
        { requiredConsents: {} }
      );

      const result = getMessages(service.status);

      expect(result).toEqual(e('a', { a: GigyaServiceStatus.SELECT_ORGANIZATION }));
    });
    it('emits INITIAL if account check is not active and no other state is present', () => {
      const { getMessages, e } = scheduler;
      service = new GigyaService(gigyaToken, orgIdToken, gigyaApi, of(false), undefined, {
        requiredConsents: {}
      });

      const result = getMessages(service.status);

      expect(result).toEqual(e('a', { a: GigyaServiceStatus.INITIAL }));
    });
  });

  describe('recentlyRegistered', () => {
    it('emits false when state.isRegistered is false', () => {
      const { getMessages, e } = scheduler;
      service = new GigyaService(gigyaToken, orgIdToken, gigyaApi, of(false), {
        isRegistered: false
      });

      const result = getMessages(service.recentlyRegistered);

      expect(result).toEqual(e('a', { a: false }));
    });

    it('emits false when state.registeredTimestamp is undefined', () => {
      const { getMessages, e } = scheduler;
      service = new GigyaService(gigyaToken, orgIdToken, gigyaApi, of(false), {
        isRegistered: true,
        registeredTimestamp: undefined
      });

      const result = getMessages(service.recentlyRegistered);

      expect(result).toEqual(e('a', { a: false }));
    });

    it('emits false when state.registeredTimestamp is more than two hours ago', () => {
      const { getMessages, e } = scheduler;
      const moreThanTwoHoursInMs = 2 * 60 * 60 * 1000 + 1;
      const moreThanTwoHoursAgoInMs = Date.now() - moreThanTwoHoursInMs;
      service = new GigyaService(gigyaToken, orgIdToken, gigyaApi, of(false), {
        isRegistered: true,
        registeredTimestamp: moreThanTwoHoursAgoInMs
      });

      const result = getMessages(service.recentlyRegistered);

      expect(result).toEqual(e('a', { a: false }));
    });

    it('emits true when state.registeredTimestamp is less than two hours ago', () => {
      const { getMessages, e } = scheduler;
      const almostTwoHoursInMs = 2 * 60 * 59 * 1000;
      const almostTwoHoursAgoInMs = Date.now() - almostTwoHoursInMs;
      service = new GigyaService(gigyaToken, orgIdToken, gigyaApi, of(false), {
        isRegistered: true,
        registeredTimestamp: almostTwoHoursAgoInMs
      });

      const result = getMessages(service.recentlyRegistered);

      expect(result).toEqual(e('a', { a: true }));
    });
  });

  describe('organizations', () => {
    it('returns an empty array if no organizations has been set', () => {
      const { getMessages, e } = scheduler;
      const result = getMessages(service.organizations);

      expect(result).toEqual(e('a', { a: [] }));
    });

    it('returns an array of organizations if they´re set in state', () => {
      const organizations = [
        {
          orgId: 'orgId1',
          bpid: 'bpid1',
          roles: [],
          status: 'APPROVED',
          orgName: 'org1 name'
        },
        {
          orgId: 'orgId2',
          bpid: 'bpid2',
          roles: [],
          status: 'PENDING',
          orgName: 'org2 name'
        }
      ];

      const service = new GigyaService(gigyaToken, orgIdToken, gigyaApi, of(false), {
        organizations: organizations
      });
      const { getMessages, e } = scheduler;
      const result = getMessages(service.organizations);

      expect(result).toEqual(e('a', { a: organizations }));
    });
  });

  describe('activeOrganization', () => {
    it('returns undefined if no active organization has been set', () => {
      const { getMessages, e } = scheduler;
      const result = getMessages(service.activeOrganization);

      expect(result).toEqual(e('a', { a: undefined }));
    });

    it('returns an organizations if it´s set in state', () => {
      const activeOrg: IOrganizationInfo = {
        orgId: 'orgId',
        orgName: 'orgName',
        bpid: 'bpid',
        description: 'description',
        source: 'source',
        type: 'type',
        status: 'APPROVED',
        memberLimit: 10,
        info: {
          city: [],
          country: [],
          cvr: [],
          ean: [],
          state: []
        }
      };

      const service = new GigyaService(gigyaToken, orgIdToken, gigyaApi, of(false), {
        activeOrganization: activeOrg
      });
      const { getMessages, e } = scheduler;
      const result = getMessages(service.activeOrganization);

      expect(result).toEqual(e('a', { a: activeOrg }));
    });
  });

  describe('clearAccountCheck', () => {
    it('sets state as expected on successful request', () => {
      const service = new GigyaService(gigyaToken, orgIdToken, gigyaApi, of(false), {
        accountCheck: { loginID: 'xx@dk.com', isAvailable: true }
      });

      service.clearAccountCheck();

      const { getMessages, e } = scheduler;
      const result = getMessages(service.accountCheck);

      expect(result).toEqual(e('a', { a: undefined }));
    });
  });

  describe('preferencesSchema', () => {
    it('sets state as expected on successful request', () => {
      const service = new GigyaService(gigyaToken, orgIdToken, gigyaApi, of(false), {
        preferencesSchema: {
          key1: {
            legalStatements: {
              da: {
                documentStoreType: 0,
                purpose: 'purpose1'
              }
            }
          },
          key2: {
            legalStatements: {
              da: {
                documentStoreType: 0,
                purpose: 'purpose2'
              }
            }
          }
        }
      });

      const { getMessages, e } = scheduler;
      const result = getMessages(service.preferenceSchema('key1'));

      expect(result).toEqual(
        e('a', {
          a: {
            legalStatements: {
              da: {
                documentStoreType: 0,
                purpose: 'purpose1'
              }
            }
          }
        })
      );
    });
  });

  describe('hasSubscription', () => {
    it('returns false when user has no subscription with specified key', () => {
      const { getMessages, e } = scheduler;
      const result = getMessages(service.hasSubscription('dk.foetex.hd.email'));

      expect(result).toEqual(e('a', { a: false }));
    });

    it('returns true when user has a subscription with specified key', () => {
      const service = new GigyaService(gigyaToken, orgIdToken, gigyaApi, of(false), {
        subscriptions: { 'dk.foetex.hd.email': { isSubscribed: true, tags: [] } }
      });
      const { getMessages, e } = scheduler;
      const result = getMessages(service.hasSubscription('dk.foetex.hd.email'));

      expect(result).toEqual(e('a', { a: true }));
    });
  });

  describe('initRegistration', () => {
    it('sets state as expected on successful request', () => {
      const { flush } = scheduler;
      (gigyaApi.initRegistration as jest.Mock).mockReturnValue(
        of({ data: { regToken: 'token' } })
      );

      service.initRegistration();
      flush();

      expect(gigyaApi.initRegistration).toHaveBeenCalled();
      expect(service.getValue()).toEqual({
        regToken: 'token'
      });
    });
  });

  describe('checkLoginId', () => {
    it('sets state as expected on successful request', () => {
      const { flush } = scheduler;
      (gigyaApi.isAvailableLoginID as jest.Mock).mockReturnValue(
        of({ data: { isAvailable: true } })
      );

      service.checkLoginId({ loginID: 'frederik@gigya.com' });
      flush();

      expect(gigyaApi.isAvailableLoginID).toHaveBeenCalled();
      expect(service.getValue()).toEqual({
        accountCheck: {
          loginID: 'frederik@gigya.com',
          isAvailable: true
        }
      });
    });
    it('returns an error if something goes wrong with authentication', () => {
      const { flush, e, getMessages } = scheduler;
      (gigyaApi.isAvailableLoginID as jest.Mock).mockReturnValue(of({ data: undefined }));

      const result = getMessages(service.checkLoginId({ loginID: 'frederik@gigya.com' }));
      flush();

      expect(gigyaApi.isAvailableLoginID).toHaveBeenCalled();
      expect(result).toEqual(e('#', undefined, expect.anything()));
    });
  });

  describe('login', () => {
    it('sets state as expected on successful request', () => {
      const { flush } = scheduler;
      (gigyaApi.login as jest.Mock).mockReturnValue(of(accountResult));

      service.login({ loginID: 'email', password: 'password' });
      flush();

      expect(gigyaToken.set).toHaveBeenCalledWith('token');
      expect(gigyaApi.login).toHaveBeenCalledWith({
        loginID: 'email',
        password: 'password',
        include: ['preferences', 'groups', 'profile', 'subscriptions', 'data']
      });
      expect(service.getValue()).toEqual({
        id: 'user-id',
        preferences: {},
        profile: {
          firstName: 'frederik',
          gender: 'u'
        },
        regToken: 'regToken',
        isRegistered: true,
        token: 'token',
        registeredTimestamp: 0,
        organizations: [
          {
            orgName: 'org1 name',
            orgId: 'orgId',
            bpid: 'bpid1',
            roles: [],
            status: 'STATUS'
          }
        ]
      });
    });
  });

  describe('register', () => {
    it('sets state as expected on successful request', () => {
      const { flush } = scheduler;
      (gigyaApi.register as jest.Mock).mockReturnValue(of(accountResult));

      service.register({
        password: 'password',
        consents: ['hd.consent', 'profile.consent'],
        terms: true
      });

      flush();

      expect(gigyaApi.register).toHaveBeenCalledWith({
        data: { terms: true },
        email: undefined,
        lang: 'da',
        password: 'password',
        preferences: {
          'hd.consent': {
            isConsentGranted: true
          },
          'profile.consent': {
            isConsentGranted: true
          }
        },
        profile: undefined,
        regToken: undefined,
        subscriptions: undefined,
        targetEnv: 'browser'
      });
      expect(service.getValue()).toEqual({
        id: 'user-id',
        profile: {
          firstName: 'frederik',
          gender: 'u'
        },
        regToken: 'regToken',
        preferences: {},
        isRegistered: true
      });
    });
  });

  describe('getSchema', () => {
    it("doesn't call api if schema is already fetched", () => {
      const { flush } = scheduler;
      const service = new GigyaService(gigyaToken, orgIdToken, gigyaApi, of(false), {
        preferencesSchema: {}
      });

      service.getSchema();
      flush();

      expect(gigyaApi.getSchema).not.toHaveBeenCalled();
    });

    it('sets state as expected on successful request', () => {
      const { flush } = scheduler;
      (gigyaApi.getSchema as jest.Mock).mockReturnValue(of(schema));

      service.getSchema();

      flush();

      expect(gigyaApi.getSchema).toHaveBeenCalled();
      expect(service.getValue()).toEqual({
        accountCheck: undefined,
        id: undefined,
        preferences: undefined,
        profile: undefined,
        regToken: undefined,
        preferencesSchema: {
          key1: {
            legalStatements: { da: { documentStoreType: 0, purpose: 'purpose' } }
          }
        }
      });
    });
  });

  describe('finalizeRegistration', () => {
    it('sets state as expected on successful request', () => {
      const { flush } = scheduler;
      (gigyaApi.finalizeRegistration as jest.Mock).mockReturnValue(of(accountResult));

      service.finalizeRegistration();
      flush();

      expect(gigyaApi.finalizeRegistration).toHaveBeenCalled();
      expect(service.getValue()).toEqual({
        id: 'user-id',
        profile: {
          firstName: 'frederik',
          gender: 'u'
        },
        preferences: {},
        isRegistered: true,
        token: 'token',
        registeredTimestamp: 0
      });
    });
  });

  describe('getAccountInfo', () => {
    it('sets state as expected on successful request', () => {
      const { flush } = scheduler;
      (gigyaApi.getAccountInfo as jest.Mock).mockReturnValue(of(accountResult));

      service.getAccountInfo();
      flush();

      expect(gigyaApi.getAccountInfo).toHaveBeenCalled();
      expect(gigyaApi.getAccountInfo).toHaveBeenCalledWith({
        extraProfileFields: ['phones', 'address'],
        include: ['groups', 'profile', 'subscriptions', 'data', 'preferences']
      });
      expect(service.getValue()).toEqual({
        id: 'user-id',
        preferences: {},
        profile: {
          firstName: 'frederik',
          gender: 'u'
        },
        isRegistered: true,
        registeredTimestamp: 0,
        organizations: [
          {
            orgName: 'org1 name',
            orgId: 'orgId',
            bpid: 'bpid1',
            roles: [],
            status: 'STATUS'
          }
        ]
      });
    });
  });

  describe('getRegistrationInfo', () => {
    it('sets state as expected on successful request', () => {
      const service = new GigyaService(gigyaToken, orgIdToken, gigyaApi, of(false), {
        regToken: 'regToken'
      });

      const { flush } = scheduler;
      (gigyaApi.getRegistrationInfo as jest.Mock).mockReturnValue(of(accountResult));

      service.getRegistrationInfo();
      flush();

      expect(gigyaApi.getRegistrationInfo).toHaveBeenCalled();
      expect(gigyaApi.getRegistrationInfo).toHaveBeenCalledWith({
        extraProfileFields: ['phones', 'address'],
        include: ['groups', 'profile', 'subscriptions', 'data', 'preferences'],
        regToken: 'regToken'
      });
      expect(service.getValue()).toEqual({
        id: 'user-id',
        preferences: {},
        profile: {
          firstName: 'frederik',
          gender: 'u'
        },
        regToken: 'regToken',
        isRegistered: true,
        registeredTimestamp: 0,
        organizations: [
          {
            orgName: 'org1 name',
            orgId: 'orgId',
            bpid: 'bpid1',
            roles: [],
            status: 'STATUS'
          }
        ]
      });
    });
  });

  describe('setAccountInfo', () => {
    it('calls gigyaApi.setAccountInfo and calls getAccountInfo on successful response', () => {
      const { flush } = scheduler;
      const getAccountInfoSpy = spyOn(service, 'getAccountInfo');
      (gigyaApi.setAccountInfo as jest.Mock).mockReturnValue(
        of({ data: {}, statusCode: 200 })
      );

      service.setAccountInfo({
        profile: {
          firstName: 'Jens',
          lastName: 'Jensen'
        }
      });
      flush();

      expect(gigyaApi.setAccountInfo).toHaveBeenCalledTimes(1);
      expect(gigyaApi.setAccountInfo).toHaveBeenCalledWith({
        profile: {
          firstName: 'Jens',
          lastName: 'Jensen'
        }
      });
      expect(getAccountInfoSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateRegistration', () => {
    it('calls gigyaApi.updateRegistration and calls finalizeRegistration on successful response if it should finalize', () => {
      const { flush } = scheduler;
      (gigyaApi.updateRegistration as jest.Mock).mockReturnValue(
        of({ data: {}, statusCode: 200 })
      );

      service.updateRegistration({
        profile: {
          firstName: 'Jens'
        },
        finalize: true
      });

      flush();

      expect(gigyaApi.updateRegistration).toHaveBeenCalledWith({
        profile: {
          firstName: 'Jens'
        },
        lang: 'da',
        data: {
          terms: true
        },
        preferences: {},
        regToken: undefined
      });
      expect(gigyaApi.finalizeRegistration).toHaveBeenCalledTimes(1);
    });

    it('calls gigyaApi.updateRegistration and calls getRegistrationInfo on successful response if it should finalize', () => {
      const { flush } = scheduler;
      (gigyaApi.updateRegistration as jest.Mock).mockReturnValue(
        of({ data: {}, statusCode: 200 })
      );

      service.updateRegistration({
        profile: {
          firstName: 'Jens'
        }
      });

      flush();

      expect(gigyaApi.updateRegistration).toHaveBeenCalledWith({
        profile: {
          firstName: 'Jens'
        },
        data: {
          terms: true
        },
        lang: 'da',
        preferences: {},
        regToken: undefined
      });
      expect(gigyaApi.getRegistrationInfo).toHaveBeenCalledTimes(1);
    });
  });

  describe('logout', () => {
    it('clears state and invalidates token on successful request', () => {
      const { flush } = scheduler;
      (gigyaApi.logout as jest.Mock).mockReturnValue(of(''));

      service.logout();
      flush();

      expect(gigyaToken.invalidate).toHaveBeenCalled();
      expect(gigyaApi.logout).toHaveBeenCalled();
      expect(service.getValue()).toEqual({
        id: undefined,
        preferences: undefined,
        profile: undefined,
        regToken: undefined,
        organizations: undefined
      });
    });

    it('clears state and invalidates token on failed request', () => {
      const { flush } = scheduler;
      (gigyaApi.logout as jest.Mock).mockReturnValue(throwError(EmptyError));

      service.logout();
      flush();

      expect(gigyaToken.invalidate).toHaveBeenCalled();
      expect(gigyaApi.logout).toHaveBeenCalled();
      expect(service.getValue()).toEqual({
        id: undefined,
        preferences: undefined,
        profile: undefined,
        regToken: undefined
      });
    });
  });

  describe('resetPassword', () => {
    it('calls gigyaApi.resetPassword on successful response', () => {
      const { flush } = scheduler;

      (gigyaApi.resetPassword as jest.Mock).mockReturnValue(
        of({ data: {}, statusCode: 200 })
      );

      service.resetPassword({
        loginID: 'sallingtest@email.com'
      });
      flush();

      expect(gigyaApi.resetPassword).toHaveBeenCalledTimes(1);
      expect(gigyaApi.resetPassword).toHaveBeenCalledWith({
        loginID: 'sallingtest@email.com'
      });
    });
  });

  describe('setActiveOrganization', () => {
    it('sets state as expected on successful request', () => {
      const { flush } = scheduler;

      const getOrganizationInfoRes = {
        orgName: 'Clean cleaners associates',
        description: 'Everyday sober everyday cleaning',
        status: 'APPROVED',
        orgId: 'test_orgId1',
        bpid: 'bpId1',
        memberLimit: 10,
        info: {
          city: ['Home'],
          country: ['Away'],
          cvr: [234],
          ean: [],
          state: []
        }
      } as unknown as IGetOrganizationInfoResponse;

      (gigyaApi.getOrganizationInfo as jest.Mock).mockReturnValue(
        of({ data: getOrganizationInfoRes, statusCode: 200 })
      );

      service.setActiveOrganization({
        orgId: 'test_orgId1'
      });
      flush();

      expect(gigyaApi.getOrganizationInfo).toHaveBeenCalledTimes(1);
      expect(gigyaApi.getOrganizationInfo).toHaveBeenCalledWith({
        orgId: 'test_orgId1'
      });
      expect(service.getValue()).toEqual({
        activeOrganization: getOrganizationInfoRes
      });
    });

    it('persists the orgId by calling set method on token', () => {
      const { flush } = scheduler;

      (gigyaApi.getOrganizationInfo as jest.Mock).mockReturnValue(
        of({
          data: {
            status: 'APPROVED'
          },
          statusCode: 200
        })
      );

      service.setActiveOrganization({
        orgId: 'test_orgId1'
      });
      flush();

      expect(orgIdToken.set).toHaveBeenCalledTimes(1);
      expect(orgIdToken.set).toHaveBeenCalledWith('test_orgId1');
    });

    it('emits error if status is not approved', () => {
      const { getMessages, e } = scheduler;

      (gigyaApi.getOrganizationInfo as jest.Mock).mockReturnValue(
        of({
          data: {
            status: 'PENDING'
          },
          statusCode: 200
        })
      );

      const result = getMessages(
        service.setActiveOrganization({
          orgId: 'test_orgId1'
        })
      );

      expect(result).toEqual(e('#', undefined, expect.anything()));
      expect(orgIdToken.set).not.toHaveBeenCalled();
    });
  });

  describe('getJWT', () => {
    it('calls gigyaApi.getJWT on successful response', () => {
      const { flush } = scheduler;

      (gigyaApi.getJWT as jest.Mock).mockReturnValue(of({ data: {}, statusCode: 200 }));

      service.getJWT({
        targetUID: 'test_target_uid',
        login_token: 'test_login_token'
      });
      flush();

      expect(gigyaApi.getJWT).toHaveBeenCalledTimes(1);
      expect(gigyaApi.getJWT).toHaveBeenCalledWith({
        targetUID: 'test_target_uid',
        login_token: 'test_login_token'
      });
    });
  });
});
