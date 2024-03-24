import { rxSandbox, RxSandboxInstance } from 'rx-sandbox';
import { BehaviorSubject } from 'rxjs';
import { TokenSignals } from '../../ITokenSource';
import { IStorageTokenConfig, StorageToken } from '../StorageToken';

describe('StorageToken', () => {
  let token: StorageToken<string>;
  let scheduler: RxSandboxInstance;
  let fakeStorage: BehaviorSubject<string | TokenSignals>;
  let config: IStorageTokenConfig<string>;

  beforeEach(() => {
    jest.resetAllMocks();
    scheduler = rxSandbox.create(true);
    fakeStorage = new BehaviorSubject<string | TokenSignals>(TokenSignals.EMPTY);
    config = {
      get: () => fakeStorage,
      set: jest.fn()
    };

    token = new StorageToken(config);
  });

  describe('get', () => {
    it('emits token from source', () => {
      const { getMessages, e } = scheduler;

      fakeStorage.next('tokenFromStorage');
      const result = getMessages(token.get());

      expect(result).toEqual(e('(ab)', { a: TokenSignals.EMPTY, b: 'tokenFromStorage' }));
    });
  });

  describe('set', () => {
    it('emits new token when set and persists it to storage handler', () => {
      const { getMessages, e } = scheduler;

      token.set('manual');
      const result = getMessages(token.get());

      expect(config.set).toHaveBeenCalledWith('manual');
      expect(result).toEqual(e('(ab)', { a: 'manual', b: TokenSignals.EMPTY }));
    });
  });

  describe('invalidate', () => {
    it('clears token', () => {
      const { getMessages } = scheduler;

      token.invalidate({});
      getMessages(token.get());

      expect(config.set).toHaveBeenCalledWith(TokenSignals.EMPTY);
    });
  });
});
