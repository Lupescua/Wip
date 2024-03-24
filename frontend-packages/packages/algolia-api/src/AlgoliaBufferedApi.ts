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
import { IAlgoliaSearchQuery, IAlgoliaSearchResult } from '.';
import { IAlgoliaApi, IAlgoliaRequest } from './AlgoliaApi';
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
 * @public
 */
export interface IAlgoliaQueryBufferConfiguration {
  bufferTimeSpan: number;
  maxBufferSize: number;
}

/**
 * This class implements a strategy for buffering single queries and combining them
 * into a multi query to reduce the amount of subsequent https requests.
 *
 * It takes an algoliaApi as a parameter and at the same time it implements the IAlgoliaApi interface
 * effectivily making it act as a wrapper that adds buffer functionality to an algoliaApi.
 *
 * @public
 */
export class AlgoliaBufferedApi implements IAlgoliaApi {
  private _subject: Subject<IAlgoliaRequest>;
  private _algoliaApi: IAlgoliaApi;
  private _requestBuffer: Observable<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response: Notification<AlgoliaQueryBufferResult<any>>;
    request: IAlgoliaRequest;
    error?: unknown;
  }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public constructor(
    algoliaApi: IAlgoliaApi,
    configuration: IAlgoliaQueryBufferConfiguration,
    scheduler?: SchedulerLike
  ) {
    this._algoliaApi = algoliaApi;
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
        const bufferedRequest = this._algoliaApi
          .queryMultiple(requests)
          .pipe(shareReplay(1));
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

  public query<TData>(
    index: string,
    query: IAlgoliaSearchQuery
  ): Observable<IRequestResult<IAlgoliaSearchResult<TData>>> {
    return this._push<TData>({ indexName: index, params: query });
  }

  public queryMultiple<TData>(
    requests: IAlgoliaRequest[]
  ): Observable<IRequestResult<IBatchedAlgoliaSearchResult<TData>>> {
    return forkJoin(requests.map((req) => this._push<TData>(req))).pipe(
      filter((responses) => !!responses.length),
      map((responses) => {
        const results = responses.map((r) => r.data);
        // Status code and headers are the same on all the responses so we just use the values from first response
        const { statusCode, headers } = responses[0];
        return { statusCode, headers, data: { results } };
      })
    );
  }

  public browse<TData>(
    request: IAlgoliaRequest
  ): Observable<IRequestResult<IAlgoliaSearchResult<TData>>> {
    return this._algoliaApi.browse(request);
  }

  /**
   * Push to the current buffer.
   * @param request - the request definition.
   * @returns an Observable that emits the result for this request.
   */
  private _push<TData>(
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
