import { rxSandbox } from 'rx-sandbox';
import { merge } from 'rxjs';
import { ActionEventHub, ActionStatus } from '../../event/ActionEventHub';
import { dispatchActionEvent } from '../dispatchEvent';

describe('dispatchActionEvent', () => {
  beforeEach(() => {});

  it('should dispatch the expected action events', () => {
    const { cold, flush, getMessages } = rxSandbox.create(false);

    const subscriberMock = jest.fn();
    const eventHub = new ActionEventHub();
    const A = cold('--a--|');
    const B = cold('--a--#');

    const eventSub = eventHub.subscribe(subscriberMock);
    getMessages(
      merge(
        A.pipe(dispatchActionEvent(eventHub, 'A')),
        B.pipe(dispatchActionEvent(eventHub, 'B'))
      )
    );
    flush();

    expect(subscriberMock).toHaveBeenNthCalledWith(1, {
      eventName: `A_START`,
      action: 'A',
      params: [],
      payload: undefined,
      status: ActionStatus.START
    });
    expect(subscriberMock).toHaveBeenNthCalledWith(2, {
      eventName: `B_START`,
      action: 'B',
      params: [],
      payload: undefined,
      status: ActionStatus.START
    });
    expect(subscriberMock).toHaveBeenNthCalledWith(3, {
      eventName: `A_SUCCESS`,
      action: 'A',
      params: [],
      payload: undefined,
      status: ActionStatus.SUCCESS
    });
    expect(subscriberMock).toHaveBeenNthCalledWith(4, {
      eventName: `B_ERROR`,
      action: 'B',
      params: [],
      payload: '#',
      status: ActionStatus.ERROR
    });

    eventSub.unsubscribe();
  });
});
