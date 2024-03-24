import { act, renderHook } from '@testing-library/react-hooks';
import { Action, IEmitableObservable, Service } from '@salling-group/core-service';
import { rxSandbox, RxSandboxInstance } from 'rx-sandbox';
import { useLoading } from '../useLoading';

class TestService extends Service<{}> {
  private _scheduler: RxSandboxInstance;
  public constructor(scheduler: RxSandboxInstance) {
    super({});
    this._scheduler = scheduler;
  }

  @Action()
  public action(): IEmitableObservable<string> {
    return this._scheduler.cold('---|');
  }
}

describe('useLoading', () => {
  let service: TestService;
  let scheduler: RxSandboxInstance;
  beforeEach(() => {
    scheduler = rxSandbox.create(false);
    service = new TestService(scheduler);
  });

  it('should return the correct loading status', () => {
    const { flush, getMessages } = scheduler;
    const renderer = renderHook(() => useLoading(service.eventHub, 'action'));

    act(() => {
      getMessages(service.action());
    });

    act(() => {
      flush();
    });

    expect(renderer.result.all).toEqual([false, true, false]);
  });
});
