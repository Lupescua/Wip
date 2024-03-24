import { rxSandbox, RxSandboxInstance } from 'rx-sandbox';
import { defer, isObservable, of, throwError } from 'rxjs';
import { Service } from '../../service/Service';
import { Action, IEmitableObservable } from '../Action';
import { ActionHandler } from '../execution/ActionHandler';

const successfullApiCall = jest.fn();
const errorlApiCall = jest.fn();

class FakeServiceWithHub extends Service<{}> {
  public constructor(initialState: {}) {
    super({});
  }

  @Action()
  public goodAction(): IEmitableObservable<unknown> {
    return defer(() => successfullApiCall());
  }

  @Action()
  public badAction(): IEmitableObservable<unknown> {
    return defer(() => errorlApiCall());
  }
}

describe('@Action', () => {
  let service: FakeServiceWithHub;
  let recieveMessage: jest.Mock;
  let scheduler: RxSandboxInstance;
  let dispatchMock: jest.MockedFunction<ActionHandler<unknown>['dispatch']>;
  beforeEach(() => {
    scheduler = rxSandbox.create(true);

    jest.clearAllMocks();

    successfullApiCall.mockImplementation(() => of('im good'));
    errorlApiCall.mockImplementation(() => throwError('im bad'));

    const dispatch = ActionHandler.prototype.dispatch;
    dispatchMock = jest.fn(dispatch);
    ActionHandler.prototype.dispatch = dispatchMock;

    recieveMessage = jest.fn();
    service = new FakeServiceWithHub({});
    service.eventHub.subscribe((event) => recieveMessage(event));
  });

  it('should dispatch the action to the action handler', () => {
    service.goodAction();
    scheduler.flush();

    expect(isObservable(dispatchMock.mock.calls[0][0])).toBe(true);
    expect(dispatchMock.mock.calls[0][1]).toEqual({
      args: [],
      actionName: 'goodAction',
      instance: service
    });
  });

  it('shares result of source when subscribed multiple times', () => {
    service.goodAction().subscribe(); // observable subscribed 2 times: 1 here and 1 by decorator
    scheduler.flush();
    expect(successfullApiCall).toHaveBeenCalledTimes(1);
  });
});
