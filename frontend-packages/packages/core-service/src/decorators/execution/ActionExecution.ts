import { MonoTypeOperatorFunction, Observable, ReplaySubject, SchedulerLike } from 'rxjs';
import { multicast, refCount } from 'rxjs/operators';
import { ActionEventHub, ActionStatus } from '../../event/ActionEventHub';
import { dispatchEvent, EventKind } from '../../operators/dispatchEvent';
import { Service } from '../../service/Service';

/**
 * @public
 */
export interface IActionExecutionOptions {
  args: unknown[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  instance: Service<any>;
  actionName: string;
}

/**
 * Handles the individual execution of a provided source Observable
 * @public
 */
export class ActionExecution<T> extends Observable<T> {
  public readonly shared: Observable<T>;
  public readonly options: IActionExecutionOptions;

  private _replay: ReplaySubject<T>;

  public constructor(
    source: Observable<T>,
    options: IActionExecutionOptions,
    scheduler?: SchedulerLike
  ) {
    const replay = new ReplaySubject<T>();
    const sharedObservable = source.pipe(
      dispatchActionEvent(options),
      multicast(replay),
      refCount()
    );

    super((subscriber) => {
      subscriber.add(sharedObservable.subscribe(subscriber));

      return () => {
        // Complete the subject to avoid never ending subscriptions.
        replay.complete();
      };
    });
    this._replay = replay;

    // Expose the casted replay.
    this.shared = replay.asObservable();
    this.options = options;
  }

  public skip(): void {
    const { instance, args, actionName } = this.options;
    instance.eventHub.dispatch(
      ActionEventHub.createMessage(ActionStatus.SKIP, actionName, args)
    );
    this._replay.complete();
  }
}

function dispatchActionEvent<T>(
  options: IActionExecutionOptions
): MonoTypeOperatorFunction<T> {
  return dispatchEvent((kind: EventKind, error: unknown) => {
    const { actionName, args, instance } = options;

    const status = {
      [EventKind.START]: ActionStatus.START,
      [EventKind.ERROR]: ActionStatus.ERROR,
      [EventKind.COMPLETE]: ActionStatus.SUCCESS
    }[kind];

    instance.eventHub.dispatch(
      ActionEventHub.createMessage(status, actionName, args, error)
    );
  });
}
