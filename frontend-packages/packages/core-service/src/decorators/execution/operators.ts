import { EMPTY, from, ReplaySubject } from 'rxjs';
import {
  buffer,
  catchError,
  concatMap,
  debounceTime,
  groupBy,
  mergeMap,
  shareReplay,
  switchMap,
  toArray
} from 'rxjs/operators';
import { ActionExecution } from './ActionExecution';
import { ExecutionOperatorFunction } from './ActionHandler';

/**
 * @public
 */
export function takeAll<T>(): ExecutionOperatorFunction<T> {
  return (source) =>
    source.pipe(
      mergeMap((action) => {
        return action.pipe(catchError(() => EMPTY));
      })
    );
}

/**
 * @public
 */
export function takeLatest<T>(): ExecutionOperatorFunction<T> {
  return (source) =>
    source.pipe(
      switchMap((action) => {
        return action.pipe(catchError(() => EMPTY));
      })
    );
}

/**
 * Controls the execution of actions dispatched in rapid succession.
 * @public
 */
export function headAndTail<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  argSelector: (args: any[]) => any,
  debounceTimeMs: number = 1000
): () => ExecutionOperatorFunction<T> {
  return () => (source) => {
    const actionKey = (action: ActionExecution<T>): string =>
      String(argSelector(action.options.args));

    // shareReplay(1) is needed for notifying the buffer
    const shared = source.pipe(shareReplay(1));

    return source.pipe(
      // Buffer all actions until the "burst" window completes,
      // then process and execute actions from the buffer.
      buffer(shared.pipe(debounceTime(debounceTimeMs))),
      concatMap((actions) => {
        return from(actions).pipe(
          groupBy(
            (action) => actionKey(action),
            undefined,
            undefined,
            // A ReplaySubject is needed to allow groupBy to operate synchronously.
            () => new ReplaySubject<ActionExecution<T>>()
          ),
          concatMap((grp) => {
            // Always emit the first value as it might be a prerequsite
            // to subsequent emits, then skip everything except the last
            // action within the group.
            return grp.pipe(
              toArray(),
              concatMap((acts) => {
                acts.slice(1, -1).forEach((act) => act.skip());
                return [acts[0], acts[acts.length - 1]];
              })
            );
          })
        );
      }),
      concatMap((action) => {
        return action.pipe(catchError(() => EMPTY));
      })
    );
  };
}
