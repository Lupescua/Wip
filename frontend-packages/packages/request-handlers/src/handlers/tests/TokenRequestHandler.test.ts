import { rxSandbox, RxSandboxInstance } from 'rx-sandbox';
import { createMockedBearerAPI } from './mocks';
import * as utils from '../../utils/ajax';
import { merge, of, throwError } from 'rxjs';
import { TokenRequestHandler } from '../TokenRequestHandler';
import { ITokenSource, TokenSignals } from '../../ITokenSource';

describe('RequestHandler', () => {
  let handler: TokenRequestHandler<string>;
  let scheduler: RxSandboxInstance;
  let token: ITokenSource<string>;

  beforeEach(() => {
    scheduler = rxSandbox.create(true);
    jest.resetAllMocks();
    (jest.spyOn(utils, 'ajax') as jest.Mock).mockImplementation(
      createMockedBearerAPI(scheduler.scheduler)
    );

    token = {
      get: jest.fn(() => of('test')),
      set: jest.fn(),
      invalidate: jest.fn()
    };

    handler = new TokenRequestHandler({
      token,
      applyToken: (request, token) => ({ ...request, query: { ...request.query, token } })
    });
  });

  describe('request', () => {
    it('executes requests in parallel with correct query token and emits responses', () => {
      const { getMessages, e } = scheduler;

      const result$ = handler.request({ method: 'POST', url: 'test' });
      const result2$ = handler.request({ method: 'POST', url: 'test2' });

      const combined = merge(result$, result2$);
      const result = getMessages(combined);

      expect(utils.ajax).toHaveBeenCalledTimes(2);
      expect(utils.ajax).toHaveBeenNthCalledWith(1, {
        method: 'POST',
        url: 'test?token=test',
        responseType: 'json'
      });
      expect(utils.ajax).toHaveBeenNthCalledWith(2, {
        method: 'POST',
        url: 'test2?token=test',
        responseType: 'json'
      });
      expect(result).toEqual(
        e('-(ab|)', {
          a: {
            statusCode: 200,
            headers: { header1: 'headerdata1' },
            data: 'request to test?token=test'
          },
          b: {
            statusCode: 200,
            headers: { header1: 'headerdata1' },
            data: 'request to test2?token=test'
          }
        })
      );
    });

    it.each([401])(
      "invalidates refresh token and doesn't emit if request error is %p",
      (errorCode) => {
        const { getMessages, e } = scheduler;
        (utils.ajax as jest.Mock).mockImplementation(() =>
          throwError({ status: errorCode, response: 'auth error' })
        );

        const result$ = handler.request({ method: 'POST', url: 'good', headers: {} });

        const result = getMessages(result$);

        expect(utils.ajax).toHaveBeenCalledTimes(1);
        expect(result).toEqual(e('---'));
      }
    );

    it('emits error and doesnt make request if token signal is empty', () => {
      const { getMessages, e } = scheduler;
      (token.get as jest.Mock).mockImplementation(() => of(TokenSignals.EMPTY));

      const result$ = handler.request({ method: 'POST', url: 'fail', headers: {} });

      const result = getMessages(result$);

      expect(utils.ajax).toHaveBeenCalledTimes(0);
      expect(result).toEqual(
        e('#', null, { status: 401, response: 'No token available' })
      );
    });

    it('doesnt emit and doesnt make request if token signal is wait', () => {
      const { getMessages, e } = scheduler;
      (token.get as jest.Mock).mockImplementation(() => of(TokenSignals.WAIT));

      const result$ = handler.request({ method: 'POST', url: 'fail', headers: {} });

      const result = getMessages(result$);

      expect(utils.ajax).toHaveBeenCalledTimes(0);
      expect(result).toEqual(e('---'));
    });

    it('emits error if request fails', () => {
      const { getMessages, e } = scheduler;

      const result$ = handler.request({ method: 'POST', url: 'fail', headers: {} });

      const result = getMessages(result$);

      expect(utils.ajax).toHaveBeenCalledTimes(1);
      expect(result).toEqual(e('#', null, { status: 400, response: 'bad request' }));
    });
  });
});
