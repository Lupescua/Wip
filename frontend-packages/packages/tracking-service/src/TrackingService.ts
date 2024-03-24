import { Service } from '@salling-group/core-service';
import { EMPTY, Observable, Subject } from 'rxjs';
import { concatMap, share } from 'rxjs/operators';
import { ImmediateScheduler } from './ImmediateScheduler';
import { ITrackingScheduler } from './TrackingScheduler';

/**
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyRecord = Record<string, any>;

/**
 * @public
 */
export type ITracker<TSystem extends AnyRecord> = {
  [K in keyof TSystem]?: (payload: TSystem[K]) => Observable<void>;
};

/**
 * @public
 */
export class TrackingService<TTrackerSystem extends AnyRecord> extends Service<{}> {
  private _trackers: ITrackingScheduler<TTrackerSystem>[];
  private _subject: Subject<Observable<void>>;
  private _queue: Observable<void>;

  public get queue(): Observable<void> {
    return this._queue;
  }

  public constructor(
    trackers: Array<ITracker<TTrackerSystem> | ITrackingScheduler<TTrackerSystem>>
  ) {
    super({});
    this._trackers = trackers.map((tracker) =>
      isTrackingScheduler(tracker) ? tracker : new ImmediateScheduler(tracker)
    );
    this._subject = new Subject();

    this._queue = this._subject.pipe(
      concatMap((tracker) => tracker),
      share()
    );

    this._queue.subscribe();
  }

  public track<TEventName extends keyof TTrackerSystem>(
    key: TEventName,
    payload: TTrackerSystem[TEventName]
  ): void {
    this._trackers.forEach((tracker) => {
      this._subject.next(tracker.track(key, payload) ?? EMPTY);
    });
  }
}

function isTrackingScheduler<TTrackerSystem extends AnyRecord>(
  tracker: ITracker<TTrackerSystem> | ITrackingScheduler<TTrackerSystem>
): tracker is ITrackingScheduler<TTrackerSystem> {
  return (tracker as ITrackingScheduler<TTrackerSystem>).track !== undefined;
}
