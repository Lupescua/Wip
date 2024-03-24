import { rxSandbox, RxSandboxInstance } from 'rx-sandbox';
import { LocalStorageToken } from '../LocalStorageToken';

describe('LocalStorageToken', () => {
  let token: LocalStorageToken;
  let scheduler: RxSandboxInstance;

  beforeEach(() => {
    jest.resetAllMocks();
    scheduler = rxSandbox.create(true);
  });

  describe('in browser', () => {
    beforeEach(() => {
      const ls = {
        getItem: jest.fn().mockReturnValue('initial'),
        setItem: jest.fn(),
        clear: jest.fn(),
        key: jest.fn(),
        length: 1,
        removeItem: jest.fn()
      };

      jest.spyOn(global, 'localStorage', 'get').mockImplementation(() => ls);
      token = new LocalStorageToken('key', scheduler.scheduler);
    });

    describe('get', () => {
      it('emits initial value and doesnt complete', () => {
        const { getMessages, e } = scheduler;

        const result = getMessages(token.get());

        expect(result).toEqual(e('(ab)', { a: '', b: 'initial' }));
      });
    });

    describe('set', () => {
      it('sets value to local storage', () => {
        token.set('test');
        expect(localStorage.setItem).toHaveBeenCalledWith('key', 'test');
      });
      it('removes item if value is empty', () => {
        token.set('');
        expect(localStorage.removeItem).toHaveBeenCalledWith('key');
      });
    });
  });

  describe('on server', () => {
    beforeEach(() => {
      // @ts-ignore
      delete global.window;
      token = new LocalStorageToken('key', scheduler.scheduler);
    });

    describe('get', () => {
      it('emits empty string', () => {
        const { getMessages, e } = scheduler;

        const result = getMessages(token.get());

        expect(result).toEqual(e('(ab|)', { a: '', b: '' }));
      });
    });
  });
});
