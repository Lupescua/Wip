import {
  IRequest,
  IRequestHandler,
  IRequestResult
} from '@salling-group/request-handlers';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { serializeQueryParameters } from './utils/utils';

import { IAlgoliaSearchQuery, TMultipleSearchStrategy } from './types/Search';
import { IAlgoliaSearchResult, IBatchedAlgoliaSearchResult } from './types/Result';

/**
 * @public
 */
export interface IAlgoliaApi {
  query<TData>(
    index: string,
    query: IAlgoliaSearchQuery
  ): Observable<IRequestResult<IAlgoliaSearchResult<TData>>>;
  queryMultiple<TData>(
    requests: IAlgoliaRequest[]
  ): Observable<IRequestResult<IBatchedAlgoliaSearchResult<TData>>>;
  browse<TData>(
    request: IAlgoliaRequest
  ): Observable<IRequestResult<IAlgoliaSearchResult<TData>>>;
}

/**
 * @public
 */
export interface IAlgoliaConfig {
  applicationId: string;
  apiKey: string;
  baseURL: string;
}

/**
 * @public
 */
export interface IAlgoliaRequest {
  indexName: string;
  params: IAlgoliaSearchQuery;
}

/**
 * @public
 */
export class AlgoliaApi implements IAlgoliaApi {
  private _requestHandler: IRequestHandler;
  private _config: IAlgoliaConfig;

  private _header: Record<string, string>;

  public constructor(requestHandler: IRequestHandler, config: IAlgoliaConfig) {
    this._requestHandler = requestHandler;
    this._config = config;
    this._header = {
      'X-Algolia-Application-Id': this._config.applicationId,
      'X-Algolia-API-Key': this._config.apiKey
    };
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
    const observable: Observable<
      IRequestResult<IAlgoliaSearchResult<TData>>
    > = this.queryMultiple<TData>([{ indexName: index, params: query }]).pipe(
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
    const url = this._config.baseURL + '1/indexes/*/queries';

    // The Multiple Queries endpoint expects a URL encoded string for params, as a difference to the single query search, which expects a JSON object.
    // For the weird format see https://www.algolia.com/doc/rest-api/search/#search-multiple-indices
    const encodedRequests = requests.map((request) => {
      return {
        indexName: request.indexName,
        params: serializeQueryParameters(request.params)
      };
    });

    const request: IRequest = {
      url: url,
      method: 'POST',
      data: { requests: encodedRequests, strategy },
      headers: this._header
    };

    return this._requestHandler.request(request);
  }

  public browse<TData>(
    request: IAlgoliaRequest
  ): Observable<IRequestResult<IAlgoliaSearchResult<TData>>> {
    const url = this._config.baseURL + `1/indexes/${request.indexName}/browse`;
    return this._requestHandler.request({
      method: 'GET',
      url,
      headers: this._header,
      query: request.params
    });
  }
}
