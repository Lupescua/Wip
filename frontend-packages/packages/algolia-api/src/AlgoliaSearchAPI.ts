import { IPagedCollection, ISearchAPI } from '@salling-group/core';
import { Observable, of } from 'rxjs';
import { map, pluck, switchMap, take } from 'rxjs/operators';
import { IAlgoliaApi } from './AlgoliaApi';
import { IAlgoliaFacet } from './types/Facet';
import { IAlgoliaSearchResult } from './types/Result';
import { IAlgoliaSearchQuery } from './types/Search';
import {
  arrayToFilter,
  makeFilterString,
  removeFacetFromFilterString,
  makeFilterWithNumericRange
} from './utils/utils';
import { parse } from 'qs';

/**
 * @public
 */
export interface IAlgoliaSearchConfig<TSorting extends string | number> {
  fullDocumentFields: string[];
  partialDocumentFields: string[];
  defaultIndex: string;
  objectIdKey: string;
  sortings?: Record<TSorting, string>;
  userToken?: Observable<string>;
  getRankingInfo?: boolean;
  transformDocumentResult?: <THit>(searchResult: IAlgoliaSearchResult<THit>) => THit[];
}

/**
 * @public
 */
export interface IPagedCollectionWithCursor<TDocument, TPage, TFacet, TSorting>
  extends IPagedCollection<TDocument, TPage, TFacet, TSorting> {
  cursor?: string;
}

/**
 * @public
 */
export class AlgoliaSearchAPI<
  TDocumentId,
  TDocumentFull,
  TDocumentPartial,
  TSorting extends string | number
> implements
    ISearchAPI<
      TDocumentId,
      TDocumentFull,
      TDocumentPartial,
      IAlgoliaFacet,
      TSorting,
      number
    > {
  protected algoliaAPI: IAlgoliaApi;
  protected config: IAlgoliaSearchConfig<TSorting>;

  public constructor(algoliaAPI: IAlgoliaApi, config: IAlgoliaSearchConfig<TSorting>) {
    this.algoliaAPI = algoliaAPI;
    this.config = config;
  }

  private get _userToken(): Observable<string> {
    return this.config.userToken ?? of('');
  }

  private get _getRankingInfo(): boolean {
    return this.config.getRankingInfo ?? false;
  }

  public search(
    query: string,
    filters?: string,
    page: number = 0,
    limit: number = 50,
    sorting?: TSorting,
    facets: string[] = [],
    analyticsTags: string[] = [],
    distinct?: boolean | number,
    facetingAfterDistinct?: boolean,
    staticFilters?: string
  ): Observable<
    IPagedCollectionWithCursor<TDocumentPartial, number, IAlgoliaFacet, TSorting>
  > {
    const searchObject: Observable<IAlgoliaSearchQuery> = this._userToken.pipe(
      take(1),
      map((userId) => ({
        query,
        attributesToRetrieve: this.config.partialDocumentFields,
        filters,
        distinct,
        facetingAfterDistinct,
        page,
        hitsPerPage: limit,
        facets,
        clickAnalytics: true,
        analyticsTags,
        userToken: userId,
        getRankingInfo: this._getRankingInfo
      }))
    );

    const index =
      (sorting && this.config.sortings && this.config.sortings[sorting]) ||
      this.config.defaultIndex;

    return searchObject.pipe(
      switchMap((payload) =>
        this.searchAlgolia<TDocumentPartial>(index, payload, staticFilters)
      )
    );
  }

  public searchByIds(
    ids: TDocumentId[],
    filters?: string,
    page: number = 0,
    limit: number = 50,
    sorting?: TSorting,
    facets: string[] = [],
    analyticsTags: string[] = [],
    distinct?: boolean | number
  ): Observable<IPagedCollection<TDocumentPartial, number, IAlgoliaFacet, TSorting>> {
    const idsFilter = arrayToFilter(ids, 'OR', this.config.objectIdKey);
    const algoliaFilters = arrayToFilter([idsFilter, filters].filter(Boolean), 'AND');

    const searchObject: Observable<IAlgoliaSearchQuery> = this._userToken.pipe(
      take(1),
      map((userId) => ({
        attributesToRetrieve: this.config.partialDocumentFields,
        filters: algoliaFilters,
        distinct: distinct,
        page: page,
        hitsPerPage: limit,
        facets,
        clickAnalytics: true,
        analyticsTags,
        userToken: userId,
        getRankingInfo: this._getRankingInfo
      }))
    );

    const index =
      (sorting && this.config.sortings && this.config.sortings[sorting]) ||
      this.config.defaultIndex;

    return searchObject.pipe(
      switchMap((payload) => this.searchAlgolia<TDocumentPartial>(index, payload))
    );
  }

  public findByIds(
    ids: TDocumentId[]
  ): Observable<
    IPagedCollectionWithCursor<TDocumentPartial, number, IAlgoliaFacet, TSorting>
  > {
    const idsFilter = arrayToFilter(ids, 'OR', this.config.objectIdKey);
    const searchObject: IAlgoliaSearchQuery = {
      filters: idsFilter,
      attributesToRetrieve: this.config.partialDocumentFields,
      getRankingInfo: this._getRankingInfo
    };

    return this.searchAlgolia(this.config.defaultIndex, searchObject);
  }

  public findByIdsFull(
    ids: TDocumentId[]
  ): Observable<
    IPagedCollectionWithCursor<TDocumentFull, number, IAlgoliaFacet, TSorting>
  > {
    const idsFilter = arrayToFilter(ids, 'OR', this.config.objectIdKey);
    const searchObject: IAlgoliaSearchQuery = {
      filters: idsFilter,
      attributesToRetrieve: this.config.fullDocumentFields,
      getRankingInfo: this._getRankingInfo
    };

    return this.searchAlgolia(this.config.defaultIndex, searchObject);
  }

  public findByIdFull(
    id: TDocumentId
  ): Observable<
    IPagedCollectionWithCursor<TDocumentFull, number, IAlgoliaFacet, TSorting>
  > {
    const searchObject: IAlgoliaSearchQuery = {
      filters: this.config.objectIdKey + ':' + id,
      attributesToRetrieve: this.config.fullDocumentFields,
      getRankingInfo: this._getRankingInfo
    };
    return this.searchAlgolia(this.config.defaultIndex, searchObject);
  }

  protected searchAlgolia<TDocument>(
    index: string,
    searchObject: IAlgoliaSearchQuery,
    staticFilters?: string
  ): Observable<
    IPagedCollectionWithCursor<TDocument, number, IAlgoliaFacet, TSorting> & {
      cursor?: string;
    }
  > {
    const { filters, facets } = searchObject;
    // We are only interested in creating extra queries for the facets that are being used, creating extra requests for facets that are not being filtered on won't alter the result
    const facetsThatAreBeingFilteredOn =
      facets?.filter((facet) => filters?.includes(facet)) ?? [];
    if (!facetsThatAreBeingFilteredOn || !filters)
      return this.algoliaAPI
        .query<TDocument>(index, searchObject)
        .pipe(pluck('data'), map(this.algoliaResultToPagedCollection));

    // create static filter string that is being used for system filters that should always be applied.
    const staticFilterString = staticFilters ? ` AND ${staticFilters}` : '';
    // fire all the requests and combine the facet values
    return this.algoliaAPI
      .queryMultiple<TDocument>([
        {
          indexName: index,
          params: {
            ...searchObject,
            filters: `${searchObject.filters}${staticFilterString}`
          }
        },
        ...facetsThatAreBeingFilteredOn.map((facet) => {
          return {
            indexName: index,
            params: {
              ...searchObject,
              filters: `${removeFacetFromFilterString(
                filters,
                facet
              )}${staticFilterString}`,
              facets: [facet],
              hitsPerPage: 0,
              analytics: false,
              clickAnalytics: false,
              attributesToRetrieve: [],
              page: 0
            }
          };
        })
      ])
      .pipe(
        pluck('data', 'results'),
        map((results) => {
          const [baseRequestResult, ...facetRequestsResults] = results;

          const facets = facetRequestsResults.reduce(
            (acc, cur) => ({ ...acc, ...cur.facets }),
            {}
          );

          const facetStats = facetRequestsResults.reduce((acc, cur) => {
            //Extend facet stats with the selected numeric range coming from base request
            if (cur.facets_stats && baseRequestResult.facets_stats) {
              const facetName = Object.keys(cur.facets_stats)[0];
              //check if the numeric range have change
              const mustSetMin =
                cur.facets_stats[facetName] &&
                baseRequestResult.facets_stats[facetName] &&
                cur.facets_stats[facetName].min !==
                  baseRequestResult.facets_stats[facetName].min;

              const mustSetMax =
                cur.facets_stats[facetName] &&
                baseRequestResult.facets_stats[facetName] &&
                cur.facets_stats[facetName].max !==
                  baseRequestResult.facets_stats[facetName].max;

              if (mustSetMin || mustSetMax) {
                cur.facets_stats[facetName].setMin =
                  baseRequestResult.facets_stats[facetName].min;
                cur.facets_stats[facetName].setMax =
                  baseRequestResult.facets_stats[facetName].max;
              }
            }

            return { ...acc, ...cur.facets_stats };
          }, {});

          return {
            ...baseRequestResult,
            // Let the subsequent requests override the original facets
            facets: { ...baseRequestResult?.facets, ...facets },
            facets_stats: { ...baseRequestResult?.facets_stats, ...facetStats }
          };
        }),
        map(this.algoliaResultToPagedCollection)
      );
  }

  protected algoliaResultToPagedCollection = <TDocument>(
    algoliaResult: IAlgoliaSearchResult<TDocument>
  ): IPagedCollectionWithCursor<TDocument, number, IAlgoliaFacet, TSorting> => {
    const calculateNextPage = (fetchedPage: number[]): number | undefined => {
      const pages = fetchedPage.sort((a, b) => a - b);
      const lastFetchedPage = pages[fetchedPage.length - 1];
      return lastFetchedPage < algoliaResult.nbPages - 1
        ? lastFetchedPage + 1
        : undefined;
    };

    const calculatePrevPage = (fetchedPage: number[]): number | undefined => {
      const pages = fetchedPage.sort((a, b) => a - b);
      const firstFetchedPage = pages[0];
      return firstFetchedPage > 0 ? firstFetchedPage - 1 : undefined;
    };

    const facets = this._algoliaResponseFacetToAlgoliaFacetArray(algoliaResult);

    const documents = this.config.transformDocumentResult
      ? this.config.transformDocumentResult(algoliaResult)
      : algoliaResult.hits;

    return {
      facets,
      sortings: Object.keys(this.config.sortings ?? {}) as TSorting[],
      activeSorting: Object.entries(this.config.sortings ?? {}).find(
        ([key, value]) => value === algoliaResult.index
      )?.[0] as TSorting | undefined,
      documents,
      calculateNextPage,
      calculatePrevPage,
      page: algoliaResult.page,
      numberOfHits: algoliaResult.nbHits,
      numberOfPages: algoliaResult.nbPages,
      query: algoliaResult.query,
      hitsPerPage: algoliaResult.hitsPerPage,
      cursor: algoliaResult.cursor,
      id: algoliaResult.queryID,
      abTestID: algoliaResult.abTestID,
      abTestVariantID: algoliaResult.abTestVariantID
    };
  };

  // TODO: This method should be refactored, as code complexity is unacceptable
  private _algoliaResponseFacetToAlgoliaFacetArray<TDocument>(
    searchResult: IAlgoliaSearchResult<TDocument>
  ): IAlgoliaFacet[] {
    if (!searchResult.facets) return [];

    const selectedFilters = (parse(searchResult.params).filters as string) ?? '';

    // Create the initial facet object containing name and values
    // Later the filterString will be generated based on all facets
    const facets = Object.entries(searchResult.facets).map(([facetName, facetValues]) => {
      const values = Object.entries(facetValues).map(([key, count]) => ({
        id: `${facetName}.${key}`,
        name: key,
        filterString: '',
        count,
        selected: selectedFilters.includes(`"${facetName}":"${key}"`)
      }));

      const hasFacetStats = Object.keys(searchResult.facets_stats ?? {}).includes(
        facetName
      );

      if (hasFacetStats) {
        const selectedNumericRange =
          searchResult.facets_stats![facetName].setMin !== undefined &&
          searchResult.facets_stats![facetName].setMax !== undefined &&
          !values.some((value) => value.selected);

        return {
          id: facetName,
          name: facetName,
          values,
          selected: values.some((value) => value.selected) || selectedNumericRange,
          //include facet stats into the facets
          numericRange: {
            ...searchResult.facets_stats![facetName],
            selected: selectedNumericRange
          }
        };
      }

      //if the facet is not numeric avoid include the numericRange property
      return {
        id: facetName,
        name: facetName,
        values,
        selected: values.some((value) => value.selected)
      };
    }) as IAlgoliaFacet[];

    // Iterate the facet array to generate the complete filterString
    const withFilterStrings = facets.map((f) => ({
      ...f,
      values: [
        ...f.values.map((v) => ({
          ...v,
          filterString: makeFilterString(facets, { [v.id]: !v.selected })
        }))
      ]
    }));

    const withNumericFilters = withFilterStrings.map((f) => {
      // We are only interested in the facets that have numericRange in order to add the filterString function
      if (f.numericRange) {
        return {
          ...f,
          numericRange: {
            ...f.numericRange,
            filterString: (min: number, max: number) =>
              makeFilterWithNumericRange(min, max, withFilterStrings, f.name)
          }
        };
      }
      return {
        ...f
      };
    });

    return withNumericFilters;
  }
}
