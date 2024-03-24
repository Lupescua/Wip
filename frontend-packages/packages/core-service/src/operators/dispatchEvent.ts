import { MonoTypeOperatorFunction } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActionStatus, ScopedActionEventHub } from '../event/ActionEventHub';

/**
 * @public
 */
export enum EventKind {
  START,
  ERROR,
  COMPLETE
}

const { COMPLETE, ERROR, START } = EventKind;

/**
 * @public
 */
export function dispatchEvent<T>(
  dispatch: (kind: EventKind, error?: unknown) => void
): MonoTypeOperatorFunction<T> {
  return (source) => {
    dispatch(START);
    return source.pipe(
      tap(
        () => {},
        (err) => {
          dispatch(ERROR, err);
        },
        () => {
          dispatch(COMPLETE);
        }
      )
    );
  };
}

/**
 * @public
 */
export function dispatchActionEvent<T, R>(
  eventHub: ScopedActionEventHub<R>,
  actionName: string
): MonoTypeOperatorFunction<T> {
  return dispatchEvent((kind, error) => {
    const status = {
      [EventKind.START]: ActionStatus.START,
      [EventKind.ERROR]: ActionStatus.ERROR,
      [EventKind.COMPLETE]: ActionStatus.SUCCESS
    }[kind];

    eventHub.dispatch({
      eventName: `${actionName}_${status}`.toUpperCase(),
      action: actionName,
      params: [],
      payload: error,
      status: status
    });
  });
}
