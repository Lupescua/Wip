import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IAlgoliaApi } from './AlgoliaApi';
import { IIndex, ISuggestionAPI } from '@salling-group/core';
import { IAlgoliaSearchResult } from './types/Result';

/**
 * @public
 */
export interface IIndexWithQueryParams<TTypeEnum> extends IIndex<TTypeEnum> {
  filters?: string;
  distinct?: boolean | number;
  getRankingInfo?: boolean;
}

/**
 * @public
 */
export class AlgoliaSuggestionAPI implements ISuggestionAPI {
  private _algoliaAPI: IAlgoliaApi;

  public constructor(algoliaAPI: IAlgoliaApi) {
    this._algoliaAPI = algoliaAPI;
  }
  public getSuggestions<TSuggestion extends { type: TTypeEnum }, TTypeEnum>(
    term: string,
    indexes: Array<IIndexWithQueryParams<TTypeEnum>>
  ): Observable<TSuggestion[]> {
    const query$ = this._algoliaAPI.queryMultiple<TSuggestion>(
      indexes.map(
        ({
          indexName,
          hitsPerPage,
          filters,
          getRankingInfo = false,
          distinct = false
        }) => ({
          indexName,
          params: {
            query: term,
            hitsPerPage,
            filters: filters ?? '',
            attributesToRetrieve: ['*'],
            facets: ['*'],
            distinct,
            clickAnalytics: true,
            getRankingInfo
          }
        })
      )
    );

    return query$.pipe(
      map((response) => {
        const result = response.data.results;
        return result.reduce((accSuggestions, currentQuery, index) => {
          return [
            ...accSuggestions,
            ...currentQuery.hits.map((hit) => {
              if (currentQuery.userData)
                return {
                  ...hit,
                  type: indexes[index].type,
                  queryID: currentQuery.queryID,
                  userData: currentQuery.userData
                };

              return {
                ...hit,
                type: indexes[index].type,
                queryID: currentQuery.queryID
              };
            })
          ];
        }, [] as Array<TSuggestion>);
      })
    );
  }

  public getUnmodifiedSuggestions<TSuggestion extends { type: TTypeEnum }, TTypeEnum>(
    term: string,
    indexes: Array<IIndexWithQueryParams<TTypeEnum>>
  ): Observable<IAlgoliaSearchResult<TSuggestion>[]> {
    const query$ = this._algoliaAPI.queryMultiple<TSuggestion>(
      indexes.map(({ indexName, hitsPerPage, filters, distinct = false }) => ({
        indexName,
        params: {
          query: term,
          hitsPerPage,
          filters: filters ?? '',
          attributesToRetrieve: ['*'],
          facets: ['*'],
          distinct,
          clickAnalytics: true,
          getRankingInfo: true
        }
      }))
    );

    return query$.pipe(
      map((response) => {
        const result = response.data.results;
        return result;
      })
    );
  }
}
