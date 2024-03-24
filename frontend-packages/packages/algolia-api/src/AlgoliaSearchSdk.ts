import { IRequestResult } from '@salling-group/request-handlers';
import { from, Observable, throwError } from 'rxjs';
import { IAlgoliaApi, IAlgoliaRequest } from './AlgoliaApi';
import { IAlgoliaSearchResult, IBatchedAlgoliaSearchResult } from './types/Result';
import { IAlgoliaSearchQuery, TMultipleSearchStrategy } from './types/Search';
import algoliaSearch, { SearchClient } from 'algoliasearch';
import { catchError, map, mapTo } from 'rxjs/operators';

/**
 * @public
 */
export interface IAlgoliaSearchSdkConfig {
  applicationId: string;
  apiKey: string;
}

/**
 * @public
 */
export class AlgoliaSearchSdk implements IAlgoliaApi {
  private _client: SearchClient;

  public constructor(config: IAlgoliaSearchSdkConfig) {
    this._client = algoliaSearch(config.applicationId, config.apiKey);
  }

  /**
   * Search the index with the given query.
   * @param index - The that should be used for the query.
   * @param query - The query to use for the search.
   * @returns an Observable that emits a Search Result.
   */
  public query<TData>(
    index: string,
    query: IAlgoliaSearchQuery
  ): Observable<IRequestResult<IAlgoliaSearchResult<TData>>> {
    const observable: Observable<IRequestResult<IAlgoliaSearchResult<TData>>> =
      this.queryMultiple<TData>([{ indexName: index, params: query }]).pipe(
        map((response) => {
          if (response.data.results.length !== 1) {
            throw new Error('Expected exactly 1 response');
          }
          return {
            data: response.data.results[0]!,
            statusCode: response.statusCode
          };
        })
      );
    return observable;
  }

  /**
   * Execute multiple queries in one request.
   * @param requests - the search requests to execute. The queries will be executed in the same order as passed in.
   * @returns an Observable that emits a collection of search results in the same order as in requests.
   */
  public queryMultiple<TData>(
    requests: IAlgoliaRequest[],
    strategy: TMultipleSearchStrategy = 'none'
  ): Observable<IRequestResult<IBatchedAlgoliaSearchResult<TData>>> {
    const request = this._client.multipleQueries<TData>(requests, {
      strategy
    });

    return from(request).pipe(
      map((result) => {
        const data: IBatchedAlgoliaSearchResult<TData> = {
          ...result,
          results: result.results.map((result) => ({
            ...result,
            // Apparantly algolia sdk has index as optional in their return type,
            // but we force it in ours, so we need to handle the case here.
            // We could also consider casting
            index: result.index ?? ''
          }))
        };

        return { statusCode: 200, data };
      }),
      catchError((err) => throwError({ status: err?.status, data: err?.message }))
    );
  }

  public browse<TData>(
    request: IAlgoliaRequest
  ): Observable<IRequestResult<IAlgoliaSearchResult<TData>>> {
    const index = this._client.initIndex(request.indexName);

    let hits: TData[] = [];

    return from(
      index.browseObjects<TData>({
        ...request.params,
        batch: (batch) => {
          hits = hits.concat(batch);
        }
      })
    ).pipe(
      mapTo({
        statusCode: 200,
        data: {
          hits,
          nbHits: hits.length,
          page: 1,
          nbPages: 1,
          hitsPerPage: hits.length,
          exhaustiveNbHits: true,
          query: request.params.query ?? '',
          index: request.indexName,
          params: ''
        }
      })
    );
  }
}
