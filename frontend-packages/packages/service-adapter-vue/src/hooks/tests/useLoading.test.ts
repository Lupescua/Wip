import { Service, Action, IEmitableObservable } from '@salling-group/core-service';
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
    const isLoading = useLoading(service.eventHub, 'action');

    expect(isLoading.value).toBe(false);
    service.action();
    expect(isLoading.value).toBe(true);
    scheduler.advanceTo(3);
    expect(isLoading.value).toBe(false);
  });
});
