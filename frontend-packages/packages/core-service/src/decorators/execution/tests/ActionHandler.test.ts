/* eslint-disable @typescript-eslint/no-explicit-any */
import { rxSandbox, RxSandboxInstance } from 'rx-sandbox';
import { defer, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { ActionEventHub, ActionStatus } from '../../../event/ActionEventHub';
import { ActionHandler } from '../ActionHandler';
import { takeAll, headAndTail, takeLatest } from '../operators';

describe('ActionHandler', () => {
  let scheduler: RxSandboxInstance;
  let dispatchMock: jest.Mock;
  let handler: ActionHandler<string>;
  let service: { eventHub: { dispatch: jest.Mock } } & any;
  beforeEach(() => {
    scheduler = rxSandbox.create(false);
    dispatchMock = jest.fn();
    service = {
      eventHub: {
        dispatch: dispatchMock
      }
    };

    handler = new ActionHandler<string>();
  });

  describe('execution', () => {
    describe('takeAll', () => {
      it('should execute all actions received', () => {
        const { getMessages, e, flush, cold } = rxSandbox.create(false);
        handler = new ActionHandler<string>({ operator: takeAll });

        const A = cold('--a|');
        const B = cold('---b|');
        const C = cold('-c|');
        const D = cold('-#');

        const messages = getMessages(handler.execution);

        handler.dispatch(A, { actionName: 'A', args: [], instance: service });
        handler.dispatch(B, { actionName: 'B', args: [], instance: service });
        handler.dispatch(C, { actionName: 'C', args: [], instance: service });
        flush();

        handler.dispatch(D, { actionName: 'D', args: [], instance: service });
        flush();

        rxSandbox.marbleAssert(messages).to.equal(e('-cab------'));
      });
    });

    describe('takeLatest', () => {
      it('should execute the latest action received', () => {
        const { getMessages, e, flush, cold } = rxSandbox.create(false);
        handler = new ActionHandler<string>({ operator: takeLatest });

        const A = cold('--a|');
        const B = cold('---b|');
        const C = cold('-c|');
        const D = cold('-#');

        const messages = getMessages(handler.execution);

        handler.dispatch(A, { actionName: 'A', args: [], instance: service });
        handler.dispatch(B, { actionName: 'B', args: [], instance: service });
        handler.dispatch(C, { actionName: 'C', args: [], instance: service });
        flush();

        handler.dispatch(D, { actionName: 'D', args: [], instance: service });
        flush();

        rxSandbox.marbleAssert(messages).to.equal(e('-c------'));
      });
    });

    describe('headAndTail', () => {
      it('should execute the immediate action and then the latest action', () => {
        const testScheduler = new TestScheduler((actual, expected) => {
          expect(actual).toEqual(expected);
        });
        testScheduler.run((helpers) => {
          const { cold, expectObservable } = helpers;

          handler = new ActionHandler<string>({
            operator: headAndTail(([arg]) => arg, 300)
          });

          // dispatch an action to the handler
          const counts: Record<string, number> = {};
          const dispatch = (marble: string, arg: string): Observable<string> => {
            counts[arg] = counts[arg] ?? 1;
            const id = arg + counts[arg]++;
            const $ = cold(marble, { a: id });
            return handler.dispatch($, {
              actionName: arg,
              args: [arg],
              instance: service
            });
          };

          // dispatch an action after the time passes to simulate
          // the real world usage with different timings.
          const executionMarble =
            '50ms a 100ms b 100ms c 100ms d 400ms e 200ms f 100ms g 100ms h';
          // the actions being dispatched.
          // format: [runtimeMarble, id]
          const dispatches = {
            a: ['220ms a|', 'A'],
            b: ['200ms a|', 'A'],
            c: ['200ms a|', 'A'],
            d: ['200ms a|', 'A'],
            //
            e: ['900ms a|', 'B'],
            //
            f: ['200ms a|', 'C'],
            g: ['200ms a|', 'C'],
            h: ['100ms a|', 'C']
          };
          // the expected executions, the passed time is the sum of
          // the dispatch delay and the action runtime.
          const expectedExecution = '873ms a 200ms b 1282ms c 200ms d 100ms e';

          const execution = cold(executionMarble, dispatches).pipe(
            mergeMap(([marble, id]) => dispatch(marble, id))
          );

          expectObservable(execution).toBe(expectedExecution, {
            a: 'A1',
            b: 'A4',
            c: 'B1',
            d: 'C1',
            e: 'C3'
          });
        });
      });
      it('should dispose skipped actions', () => {
        const testScheduler = new TestScheduler((actual, expected) => {
          expect(actual).toEqual(expected);
        });
        testScheduler.run((helpers) => {
          const { cold, flush } = helpers;

          handler = new ActionHandler<string>({
            operator: headAndTail(([arg]) => arg, 10)
          });

          const source = cold('2ms (a|)');

          handler.dispatch(source, {
            actionName: 'A',
            args: [],
            instance: service
          });
          handler.dispatch(source, {
            actionName: 'B',
            args: [],
            instance: service
          });
          handler.dispatch(source, {
            actionName: 'A',
            args: [],
            instance: service
          });

          flush();

          expect(dispatchMock.mock.calls).toEqual([
            [ActionEventHub.createMessage(ActionStatus.START, 'A')],
            [ActionEventHub.createMessage(ActionStatus.START, 'B')],
            [ActionEventHub.createMessage(ActionStatus.START, 'A')],
            [ActionEventHub.createMessage(ActionStatus.SKIP, 'B')],
            [ActionEventHub.createMessage(ActionStatus.SUCCESS, 'A')],
            [ActionEventHub.createMessage(ActionStatus.SUCCESS, 'A')]
          ]);
        });
      });
    });

    it('should dispatch action events for executing actions', () => {
      const { flush, cold } = scheduler;

      const A = cold('---(a|)');
      const B = cold('---#');

      handler.dispatch(A, { actionName: 'A', args: [], instance: service });
      handler.dispatch(B, { actionName: 'B', args: [], instance: service });

      flush();

      expect(dispatchMock.mock.calls).toEqual([
        [
          {
            eventName: 'A_START',
            action: 'A',
            params: [],
            payload: undefined,
            status: ActionStatus.START
          }
        ],
        [
          {
            eventName: 'B_START',
            action: 'B',
            params: [],
            payload: undefined,
            status: ActionStatus.START
          }
        ],
        [
          {
            eventName: 'A_SUCCESS',
            action: 'A',
            params: [],
            payload: undefined,
            status: ActionStatus.SUCCESS
          }
        ],
        [
          {
            eventName: 'B_ERROR',
            action: 'B',
            params: [],
            payload: '#',
            status: ActionStatus.ERROR
          }
        ]
      ]);
    });
  });

  describe('dispatch', () => {
    it('should return a shared observable', () => {
      const { getMessages, flush, e, cold } = scheduler;

      const execMock = jest.fn(() => cold('---a|'));
      const A = defer(execMock);

      handler.execution.subscribe();
      const sharedA = handler.dispatch(A, {
        actionName: 'A',
        args: [],
        instance: service
      });

      sharedA.subscribe();
      sharedA.subscribe();

      const messages = getMessages(sharedA);

      flush();

      expect(messages).toEqual(e('---a|'));
      expect(execMock).toHaveBeenCalledTimes(1);
    });
  });
});
