import { merge, of } from 'rxjs';
import * as utils from '../../utils/ajax';
import { rxSandbox, RxSandboxInstance } from 'rx-sandbox';
import { createMockedAuthAPI } from './mocks';
import { RefreshableToken } from '../../tokens/RefreshableToken';
import { ITokenSource, TokenSignals } from '../../ITokenSource';
import { TokenRequestHandler } from '../TokenRequestHandler';
import { OneTimeToken } from '../../tokens/OneTimeToken';

interface IGatewayAuth {
  accessToken: string;
  membershipNumber: string;
}

describe('Token vs request handler integration', () => {
  let handler: TokenRequestHandler<IGatewayAuth>;
  let scheduler: RxSandboxInstance;
  let gigyaKey: ITokenSource<string>;
  let idToken: ITokenSource<string>;
  let authToken: ITokenSource<IGatewayAuth>;

  beforeEach(() => {
    scheduler = rxSandbox.create(true);
    jest.resetAllMocks();
    (jest.spyOn(utils, 'ajax') as jest.Mock).mockImplementation(
      createMockedAuthAPI(scheduler.scheduler)
    );

    gigyaKey = {
      get: jest.fn(() => of('correctCode')),
      set: jest.fn(),
      invalidate: jest.fn()
    };

    idToken = new OneTimeToken({
      key: gigyaKey,
      request: (token) => ({
        method: 'GET',
        url: `gigya/accounts.getAccountInfo?apiKey=apiKey&login_token=${token}&include=id_token`
      }),
      mapAccessToken: (response) => response.response.id_token
    });

    authToken = new RefreshableToken<IGatewayAuth, string>({
      refreshToken: idToken,
      refreshRequest: (refreshToken) => ({
        url: `url?client_id=id&code=${refreshToken}&grant_type=access`,
        method: 'post'
      }),
      mapAccessToken: (response) => ({
        accessToken: response.response.access_token,
        membershipNumber: response.response.membershipNumber
      })
    });

    handler = new TokenRequestHandler({
      token: authToken,
      applyToken: (request, token) => ({
        ...request,
        headers: { ...request.headers, Authorization: `Bearer ${token.accessToken}` }
      })
    });
  });

  describe('request', () => {
    it('fetches auth token and calls all pending requests when no token is active', () => {
      const { getMessages, e } = scheduler;

      const result$ = handler.request({ method: 'POST', url: 'test' });
      const result2$ = handler.request({ method: 'POST', url: 'test2' });
      const result3$ = handler.request({
        method: 'POST',
        url: 'test3',
        data: { query: 'test' }
      });

      const combined = merge(
        gigyaKey.get(),
        idToken.get(),
        authToken.get(),
        result$,
        result2$,
        result3$
      );
      const result = getMessages(combined);

      expect(utils.ajax).toHaveBeenCalledTimes(5);
      expect(utils.ajax).toHaveBeenCalledWith({
        headers: {
          'content-type': 'application/json; charset=utf-8',
          Authorization: 'Bearer correct'
        },
        method: 'POST',
        url: 'test3',
        body: '{"query":"test"}',
        responseType: 'json'
      });
      expect(result).toEqual(
        e('(ak)bc(def)', {
          a: 'correctCode', // token is emitted from first key
          k: TokenSignals.WAIT,
          b: 'correctCode', // id token is fetched and emitted from one time token
          c: { accessToken: 'correct', membershipNumber: '123' }, // new token is fetched and requests are fired again
          d: {
            statusCode: 200,
            headers: { header1: 'headerdata1' },
            data: 'request to test'
          },
          e: {
            statusCode: 200,
            headers: { header1: 'headerdata1' },
            data: 'request to test2'
          },
          f: {
            statusCode: 200,
            headers: { header1: 'headerdata1' },
            data: 'request to test3'
          }
        })
      );
    });

    it('fetches auth token and calls all pending requests if a request(s) fails with 401', () => {
      const { getMessages, e } = scheduler;

      authToken.set({ accessToken: 'wrong', membershipNumber: '123' });
      const result$ = handler.request({ method: 'POST', url: 'test' });
      const result2$ = handler.request({ method: 'POST', url: 'test2' });
      const result3$ = handler.request({ method: 'POST', url: 'test3' });

      const combined = merge(
        gigyaKey.get(),
        idToken.get(),
        authToken.get(),
        result$,
        result2$,
        result3$
      );
      const result = getMessages(combined);

      expect(utils.ajax).toHaveBeenCalledTimes(6); // 1 failing (2 others cancelled), 1 one time, 1 refresh request, 3 retries
      expect(result).toEqual(
        e('(abk)ce(fgh)', {
          a: 'correctCode', // first key emits a correct code
          b: { accessToken: 'wrong', membershipNumber: '123' }, // authToken emits a wrong code
          k: TokenSignals.WAIT,
          c: 'correctCode',
          e: { accessToken: 'correct', membershipNumber: '123' }, // new token is fetched and requests are fired again
          f: {
            statusCode: 200,
            headers: { header1: 'headerdata1' },
            data: 'request to test'
          },
          g: {
            statusCode: 200,
            headers: { header1: 'headerdata1' },
            data: 'request to test2'
          },
          h: {
            statusCode: 200,
            headers: { header1: 'headerdata1' },
            data: 'request to test3'
          }
        })
      );
    });

    it('emits error if auth request fails', () => {
      const { getMessages, e } = scheduler;

      // Set wrong id token to disallow auth
      jest.spyOn(idToken, 'get').mockImplementation(() => of('wrongCode'));
      jest.spyOn(idToken, 'invalidate');
      jest.spyOn(gigyaKey, 'invalidate');

      const result$ = handler.request({ method: 'POST', url: 'test' });
      const result2$ = handler.request({ method: 'POST', url: 'test2' });
      const result3$ = handler.request({ method: 'POST', url: 'test3' });

      const combined = merge(authToken.get(), result$, result2$, result3$);
      const result = getMessages(combined);

      expect(gigyaKey.invalidate).toHaveBeenCalled(); // invalidates first key
      expect(idToken.invalidate).toHaveBeenCalled(); // invalidates refresh token as refresh call failed
      expect(utils.ajax).toHaveBeenCalledTimes(1); // doesn't retry auth call
      expect(result).toEqual(
        e('(a#)', { a: TokenSignals.WAIT }, { status: 401, response: 'unauthenticated' })
      );
    });

    it('emits error if request fails with non auth error', () => {
      const { getMessages, e } = scheduler;

      authToken.set({ accessToken: 'correct', membershipNumber: '123' });
      const request$ = handler.request({ method: 'POST', url: 'fail', headers: {} });

      const result = getMessages(request$);

      expect(utils.ajax).toHaveBeenCalledTimes(1); // doesn't retry auth call
      expect(result).toEqual(e('#', null, { status: 400, response: 'bad request' }));
    });
  });
});
