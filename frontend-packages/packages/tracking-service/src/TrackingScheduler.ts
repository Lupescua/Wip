import { Observable } from 'rxjs';
import { AnyRecord } from './TrackingService';

/**
 * Arbitrary tracking scheduler
 * @public
 */
export interface ITrackingScheduler<TSystem extends AnyRecord> {
  /**
   * @param key - Event name of the event to track
   * @param payload -  Tracking payload
   */
  track<TEventName extends keyof TSystem>(
    key: TEventName,
    payload: TSystem[TEventName]
  ): Observable<void> | undefined;
}
