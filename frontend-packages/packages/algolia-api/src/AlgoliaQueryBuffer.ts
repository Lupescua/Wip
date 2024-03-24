import { IRequestResult } from '@salling-group/request-handlers';
import {
  forkJoin,
  from,
  Notification,
  Observable,
  of,
  SchedulerLike,
  Subject
} from 'rxjs';
import {
  bufferTime,
  concatMap,
  dematerialize,
  filter,
  first,
  map,
  materialize,
  mergeMap,
  share,
  shareReplay,
  take
} from 'rxjs/operators';
import { IAlgoliaSearchResult } from '.';
import { IAlgoliaRequest } from './AlgoliaApi';
import { IBatchedAlgoliaSearchResult } from './types/Result';

/**
 * @internal
 */
export type AlgoliaQueryBufferResult<TData> = IRequestResult<IAlgoliaSearchResult<TData>>;

/**
 * @internal
 */
export type AlgoliaQueryBufferRequest<TData> = (
  requests: IAlgoliaRequest[]
) => Observable<IRequestResult<IBatchedAlgoliaSearchResult<TData>>>;

/**
 * @internal
 */
export interface IAlgoliaQueryBufferConfiguration {
  bufferTimeSpan: number;
  maxBufferSize: number;
}

/**
 * This class implements a strategy for buffering single queries and combining them
 * into a multi query to reduce the amount of subsequent https requests.
 *
 * @internal
 */
export class AlgoliaQueryBuffer {
  private _subject: Subject<IAlgoliaRequest>;
  private _requestBuffer: Observable<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response: Notification<AlgoliaQueryBufferResult<any>>;
    request: IAlgoliaRequest;
    error?: unknown;
  }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public constructor(
    configuration: IAlgoliaQueryBufferConfiguration,
    onRequest: AlgoliaQueryBufferRequest<unknown>,
    scheduler?: SchedulerLike
  ) {
    this._subject = new Subject<IAlgoliaRequest>();

    this._requestBuffer = this._subject.pipe(
      bufferTime(
        configuration.bufferTimeSpan,
        undefined,
        configuration.maxBufferSize,
        scheduler
      ),
      filter((requests) => !!requests.length),
      mergeMap((requests) => {
        const bufferedRequest = onRequest(requests).pipe(shareReplay(1));
        return from(requests).pipe(
          concatMap((request, i) =>
            forkJoin({
              response: bufferedRequest.pipe(
                map((res) => ({
                  statusCode: res.statusCode,
                  data: res.data.results[i]
                })),
                materialize(),
                first()
              ),
              request: of(request)
            })
          )
        );
      }),
      share()
    );

    this._requestBuffer.subscribe({ error: () => {} });
  }

  /**
   * Push to the current buffer.
   * @param request - the request definition.
   * @returns an Observable that emits the result for this request.
   */
  public push<TData>(
    request: IAlgoliaRequest
  ): Observable<AlgoliaQueryBufferResult<TData>> {
    const result = this._requestBuffer.pipe(
      filter((res) => res.request === request),
      take(1),
      map((res) => res.response),
      dematerialize()
    );
    this._subject.next(request);

    return result;
  }
}
