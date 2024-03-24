import { BehaviorSubject, Observable } from 'rxjs';
import { map, pluck } from 'rxjs/operators';
import { EventHub } from './EventHub';

/**
 * @public
 */
export interface IActionEventHubMessage {
  eventName: string;
  status: ActionStatus;
  action: string;
  params: unknown[];
  payload?: unknown;
}

/**
 * @public
 */
export enum ActionStatus {
  START = 'START',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  SKIP = 'SKIP'
}

/**
 * @public
 */
export class ActionEventHub extends EventHub<IActionEventHubMessage> {
  private _activeEvents: BehaviorSubject<Record<string, number>>;

  /* istanbul ignore next */
  public constructor() {
    super();
    this._activeEvents = new BehaviorSubject({});
  }

  public static createMessage(
    status: ActionStatus,
    action: string,
    params?: unknown[],
    payload?: unknown
  ): IActionEventHubMessage {
    return {
      eventName: `${action}_${status}`.toUpperCase(),
      action: action,
      status,
      params: params ?? [],
      payload
    };
  }

  public get activeEvents(): Observable<Record<string, number>> {
    return this._activeEvents.asObservable();
  }

  public hasActiveEvent(action: string): Observable<boolean> {
    return this.activeEvents.pipe(
      pluck(action),
      map((value) => !!value)
    );
  }

  protected handleDispatch(event: IActionEventHubMessage): void {
    const current = this._activeEvents.getValue();
    this._activeEvents.next({
      ...current,
      [event.action]: Math.max(
        0,
        (current[event.action] ?? 0) + (event.status === ActionStatus.START ? 1 : -1)
      )
    });
  }
}

/**
 * @public
 */
export class ScopedActionEventHub<TScope> extends ActionEventHub {
  private _scope?: TScope;
}
