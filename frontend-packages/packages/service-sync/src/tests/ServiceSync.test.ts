import { Service } from '@salling-group/core-service';
import { ITokenSource } from '@salling-group/request-handlers';
import { rxSandbox, RxSandboxInstance } from 'rx-sandbox';
import { BehaviorSubject, from, Observable, ObservableInput } from 'rxjs';
import { ServiceSync } from '../ServiceSync';

export interface IMockState {
  settingA: string;
  settingB: string;
}

class MockService extends Service<IMockState> {
  public constructor(initial: IMockState) {
    super(initial);
  }

  public get stateGetter(): Observable<IMockState> {
    return this.state;
  }

  public stateSetter(state: IMockState): void {
    return this.setState(state);
  }
}

function whitelistSettingA(state: IMockState): Partial<IMockState> {
  return {
    settingA: state.settingA
  };
}

class MockToken implements ITokenSource<string> {
  private _token: BehaviorSubject<string> = new BehaviorSubject('');

  public get(): ObservableInput<string> {
    return this._token.asObservable();
  }

  public set(token: string): void {
    this._token.next(token);
  }

  public invalidate(err: unknown): void {}
}

describe('ServiceSync', () => {
  let scheduler: RxSandboxInstance;
  let mockService: MockService;
  let token: ITokenSource<string>;

  beforeEach(() => {
    scheduler = rxSandbox.create(true);
    mockService = new MockService({
      settingA: 'SERVICE SETTINGA',
      settingB: 'SERVICE SETTINGB'
    });
    token = new MockToken();
  });

  describe('sync', () => {
    it('should set an Empty token with the initial state of service', () => {
      const { e, getMessages } = scheduler;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const service = ServiceSync.sync(mockService, token);

      const tokenState = getMessages(from(token.get()));
      expect(tokenState).toEqual(
        e('a', {
          a: '{"settingA":"SERVICE SETTINGA","settingB":"SERVICE SETTINGB"}'
        })
      );
    });

    it('should override the initial service state if token has a value.', () => {
      const { e, getMessages } = scheduler;

      token.set(
        JSON.stringify({ settingA: 'TOKEN SETTINGA', settingB: 'TOKEN SETTINGB' })
      );
      const service = ServiceSync.sync(mockService, token);

      const serviceState = getMessages(service.stateGetter);
      expect(serviceState).toEqual(
        e('a', { a: { settingA: 'TOKEN SETTINGA', settingB: 'TOKEN SETTINGB' } })
      );
    });

    it('should update token if service state is updated', async () => {
      const { e, getMessages } = scheduler;

      const service = ServiceSync.sync(mockService, token);

      service.stateSetter({ settingA: 'NEW SERVICE SETTING', settingB: '' });

      const tokenState = getMessages(from(token.get()));
      expect(tokenState).toEqual(
        e('a', { a: '{"settingA":"NEW SERVICE SETTING","settingB":""}' })
      );
    });

    describe('getStateToSynchronize', () => {
      it('is included to only return SettingA. Token should contain settingA', async () => {
        const { e, getMessages } = scheduler;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const service = ServiceSync.sync(mockService, token, whitelistSettingA);

        const tokenStateWithoutSettingB = getMessages(from(token.get()));
        expect(tokenStateWithoutSettingB).toEqual(
          e('a', {
            a: '{"settingA":"SERVICE SETTINGA"}'
          })
        );
      });

      it('is included to only return SettingA. Updating token should not override anything else than settingA', () => {
        const { e, getMessages } = scheduler;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const service = ServiceSync.sync(mockService, token, whitelistSettingA);

        token.set(JSON.stringify({ settingA: 'TOKEN SETTINGA' }));

        const serviceState = getMessages(service.stateGetter);
        expect(serviceState).toEqual(
          e('a', { a: { settingA: 'TOKEN SETTINGA', settingB: 'SERVICE SETTINGB' } })
        );
      });
    });
  });
});
