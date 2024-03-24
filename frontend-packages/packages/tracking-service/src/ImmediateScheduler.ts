import { Observable } from 'rxjs';
import { ITrackingScheduler } from './TrackingScheduler';
import { AnyRecord, ITracker } from './TrackingService';

/**
 * Default tracking scheduler. Does not apply any scheduling logic to the given tracker.
 * @public
 */
export class ImmediateScheduler<TSystem extends AnyRecord>
  implements ITrackingScheduler<TSystem> {
  protected _tracker: ITracker<TSystem>;
  public constructor(tracker: ITracker<TSystem>) {
    this._tracker = tracker;
  }

  public track<T extends keyof TSystem>(
    key: T,
    payload: TSystem[T]
  ): Observable<void> | undefined {
    const trackEvent = this._tracker[key];
    if (trackEvent) return trackEvent.apply(this._tracker, [payload]);
  }
}
