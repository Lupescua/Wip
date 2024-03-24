import { rxSandbox, RxSandboxInstance } from 'rx-sandbox';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ITokenSource, TokenSignals } from '../../ITokenSource';
import { RefreshableToken } from '../RefreshableToken';
import * as utils from '../../utils/ajax';

/* For integration test see /handers/tests/integration.test.ts */

describe('RefreshableToken', () => {
  let token: RefreshableToken<string, string>;
  let scheduler: RxSandboxInstance;
  let refreshToken: ITokenSource<string>;

  beforeEach(() => {
    jest.resetAllMocks();
    scheduler = rxSandbox.create(true);

    (jest.spyOn(utils, 'ajax') as jest.Mock).mockReturnValue(
      of({}).pipe(delay(1, scheduler.scheduler))
    );

    refreshToken = { get: () => of('code'), set: jest.fn(), invalidate: jest.fn() };

    token = new RefreshableToken({
      refreshToken,
      mapAccessToken: (r) => r.response.access_token,
      refreshRequest: () => ({ url: 'good', method: '' })
    });
  });

  describe('readonly', () => {
    it('emits token if empty or has value', () => {
      const { getMessages, e } = scheduler;

      token.set('token');
      const result = getMessages(token.readonly());

      expect(result).toEqual(e('a', { a: 'token' }));
    });

    it('doesnt emit when signal is wait', () => {
      const { getMessages, e } = scheduler;

      token.set(TokenSignals.WAIT);
      const result = getMessages(token.readonly());

      expect(result).toEqual(e('...'));
    });
  });

  describe('get', () => {
    it('emits token when request completes', () => {
      const { getMessages, e } = scheduler;

      (jest.spyOn(utils, 'ajax') as jest.Mock).mockReturnValue(
        of({ response: { access_token: 'token' } }).pipe(delay(1, scheduler.scheduler))
      );

      const result = getMessages(token.get());

      expect(result).toEqual(e('ab', { a: TokenSignals.WAIT, b: 'token' }));
    });
    it('emits error and invalidate key token if request fails', () => {
      const { getMessages, e } = scheduler;

      (jest.spyOn(utils, 'ajax') as jest.Mock).mockReturnValue(throwError('error'));

      const result = getMessages(token.get());

      expect(refreshToken.invalidate).toHaveBeenCalled();
      expect(result).toEqual(e('(a#)', { a: TokenSignals.WAIT }, 'error'));
    });
    it('uses config to configure retry mechanism and does not emit before retry has been conducted', () => {
      const { getMessages, e } = scheduler;
      token = new RefreshableToken({
        refreshToken,
        mapAccessToken: (r) => r.response.access_token,
        refreshRequest: () => ({ url: 'good', method: '' }),
        retryCount: 3
      });

      (jest.spyOn(utils, 'ajax') as jest.Mock).mockReturnValue(throwError('error'));

      const result = getMessages(token.get());
      expect(utils.ajax).toHaveBeenCalledTimes(4);
      expect(result).toEqual(e('(a#)', { a: TokenSignals.WAIT }, 'error'));
    });
  });
});
