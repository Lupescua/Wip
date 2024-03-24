import {
  Action,
  ActionStatus,
  EventHub,
  IEmitableObservable,
  Service
} from '@salling-group/core-service';
import { rxSandbox, RxSandboxInstance } from 'rx-sandbox';
import { useEventHub } from '../useEventHub';

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

describe('useEventHub', () => {
  let service: TestService;
  let eventHub: EventHub<{ eventName: string }>;
  let scheduler: RxSandboxInstance;
  beforeEach(() => {
    scheduler = rxSandbox.create(false);
    service = new TestService(scheduler);
    eventHub = new EventHub();
  });

  it('should invoke the handler when receiving events', () => {
    const handlerMock = jest.fn();
    useEventHub(eventHub, handlerMock);

    eventHub.dispatch({ eventName: 'EVENT_NAME' });

    expect(handlerMock).toHaveBeenCalledWith({ eventName: 'EVENT_NAME' });
  });

  it('should invoke the handler when receiving scoped events', () => {
    const handlerMock = jest.fn();
    useEventHub(service.eventHub, { ACTION_START: handlerMock });

    service.eventHub.dispatch({
      action: 'ACTION',
      eventName: 'ACTION_START',
      status: ActionStatus.START,
      params: []
    });
    service.eventHub.dispatch({
      action: 'ACTION',
      eventName: 'ACTION_COMPLETE',
      status: ActionStatus.START,
      params: []
    });

    expect(handlerMock).toHaveBeenCalledWith({
      action: 'ACTION',
      eventName: 'ACTION_START',
      status: ActionStatus.START,
      params: []
    });
  });
});
