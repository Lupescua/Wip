import { rxSandbox, RxSandboxInstance } from 'rx-sandbox';
import { ReadonlyToken } from '../ReadonlyToken';

describe('ReadonlyToken', () => {
  let token: ReadonlyToken<string>;
  let scheduler: RxSandboxInstance;

  beforeEach(() => {
    jest.resetAllMocks();
    scheduler = rxSandbox.create(true);

    token = new ReadonlyToken('abc');
  });

  describe('get', () => {
    it('emits value and completes', () => {
      const { getMessages, e } = scheduler;

      const result = getMessages(token.get());

      expect(result).toEqual(e('(a|)', { a: 'abc' }));
    });
  });
});
