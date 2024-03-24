import { rxSandbox, RxSandboxInstance } from 'rx-sandbox';
import { ActionEventHub, ActionStatus } from '../ActionEventHub';

describe('eventHub', () => {
  let eventHub: ActionEventHub;
  let scheduler: RxSandboxInstance;
  beforeEach(() => {
    eventHub = new ActionEventHub();
    scheduler = rxSandbox.create(false);
  });

  describe('activeEvents', () => {
    it('should keep count of started event that has not yet completed', () => {
      const { getMessages, flush, e } = scheduler;

      const result = getMessages(eventHub.activeEvents);
      flush();

      eventHub.dispatch({
        eventName: 'A_START',
        status: ActionStatus.START,
        action: 'a',
        params: []
      });
      eventHub.dispatch({
        eventName: 'A_START',
        status: ActionStatus.START,
        action: 'a',
        params: []
      });

      eventHub.dispatch({
        eventName: 'B_START',
        status: ActionStatus.START,
        action: 'b',
        params: []
      });
      eventHub.dispatch({
        eventName: 'B_SUCCESS',
        status: ActionStatus.SUCCESS,
        action: 'b',
        params: []
      });

      eventHub.dispatch({
        eventName: 'A_SUCCESS',
        status: ActionStatus.SUCCESS,
        action: 'a',
        params: []
      });
      eventHub.dispatch({
        eventName: 'A_SUCCESS',
        status: ActionStatus.SUCCESS,
        action: 'a',
        params: []
      });

      flush();

      rxSandbox.marbleAssert(result).to.equal(
        e<Record<string, number>>('(zabcdef)', {
          z: {},
          a: { a: 1 },
          b: { a: 2 },
          c: { a: 2, b: 1 },
          d: { a: 2, b: 0 },
          e: { a: 1, b: 0 },
          f: { a: 0, b: 0 }
        })
      );
    });
  });

  describe('hasActiveEvent', () => {
    it('should return true if count is greater than 0', () => {
      const { getMessages, flush, e } = scheduler;

      eventHub.dispatch({
        eventName: 'A_START',
        status: ActionStatus.START,
        action: 'a',
        params: []
      });

      const result = getMessages(eventHub.hasActiveEvent('a'));
      flush();

      expect(result).toEqual(e('a', { a: true }));
    });

    it('should return false if count is 0', () => {
      const { getMessages, flush, e } = scheduler;

      eventHub.dispatch({
        eventName: 'A_START',
        status: ActionStatus.START,
        action: 'a',
        params: []
      });
      eventHub.dispatch({
        eventName: 'A_SUCCESS',
        status: ActionStatus.SUCCESS,
        action: 'a',
        params: []
      });

      const result = getMessages(eventHub.hasActiveEvent('a'));
      flush();

      expect(result).toEqual(e('a', { a: false }));
    });

    it('should return false if action does not exist', () => {
      const { getMessages, flush, e } = scheduler;

      const result = getMessages(eventHub.hasActiveEvent('missing'));
      flush();

      expect(result).toEqual(e('a', { a: false }));
    });
  });
});
