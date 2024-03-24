import { rxSandbox, RxSandboxInstance } from 'rx-sandbox';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ITokenSource } from '../../ITokenSource';
import { OneTimeToken } from '../OneTimeToken';
import * as utils from '../../utils/ajax';

describe('OneTimeToken', () => {
  let token: OneTimeToken<string, string>;
  let scheduler: RxSandboxInstance;
  let key: ITokenSource<string>;

  beforeEach(() => {
    jest.resetAllMocks();
    scheduler = rxSandbox.create(true);

    (jest.spyOn(utils, 'ajax') as jest.Mock).mockReturnValue(
      of({}).pipe(delay(1, scheduler.scheduler))
    );

    key = { get: () => of('code'), set: jest.fn(), invalidate: jest.fn() };

    token = new OneTimeToken({
      key,
      mapAccessToken: (r) => r.response.id_token,
      request: () => ({ url: 'good', method: '' })
    });
  });

  describe('get', () => {
    it('emits token when request completes', () => {
      const { getMessages, e } = scheduler;

      (jest.spyOn(utils, 'ajax') as jest.Mock).mockReturnValue(
        of({ response: { id_token: 'token' } }).pipe(delay(1, scheduler.scheduler))
      );

      const result = getMessages(token.get());

      expect(result).toEqual(e('-(a|)', { a: 'token' }));
    });
    it('emits error and invalidate key token if request fails', () => {
      const { getMessages, e } = scheduler;

      (jest.spyOn(utils, 'ajax') as jest.Mock).mockReturnValue(throwError('error'));

      const result = getMessages(token.get());

      expect(key.invalidate).toHaveBeenCalled();
      expect(result).toEqual(e('#', null, 'error'));
    });
  });
});
