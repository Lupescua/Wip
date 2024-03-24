import { NEVER, Observable, of, Subject } from 'rxjs';
import { ignoreElements, switchMap, tap } from 'rxjs/operators';
import { ITracker } from '@salling-group/tracking-service';
import { ICookieConsentGivenPayload } from '.';
import { Queue } from './Queue';
import { ITrackingSystems } from './TrackingSystems';

/**
 * @public
 */
export abstract class CookieConsentTracker implements ITracker<ITrackingSystems> {
  protected readonly _queue: Queue<unknown>;
  protected readonly _cookieConsent: Subject<boolean>;

  public constructor(queue: Queue<unknown>, cookieConsent: Subject<boolean>) {
    this._queue = queue;
    this._cookieConsent = cookieConsent;
  }

  public cookieConsentGiven(payload: ICookieConsentGivenPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._cookieConsent.next(payload.statistic);
      }),
      ignoreElements()
    );
  }

  protected _dequeue(): Observable<boolean | void> {
    return this._cookieConsent.pipe(
      switchMap((granted) => {
        if (granted) {
          this._queue.open();
          return of(granted);
        }

        this._queue.close();
        return NEVER;
      })
    );
  }

  protected _push<TData = unknown>(data: TData): void {
    this._queue.add(data);
  }
}
