import { Observable } from 'rxjs';

/**
 * @public
 */
export interface IPagedCollection<TDocument, TPage, TFacet, TSorting> {
  query: string;
  facets: TFacet[];
  sortings: TSorting[];
  activeSorting?: TSorting;
  documents: TDocument[];
  calculateNextPage: (FetchedPages: TPage[]) => TPage | undefined;
  calculatePrevPage: (FetchedPages: TPage[]) => TPage | undefined;
  page: TPage;
  numberOfHits: number;
  numberOfPages: number;
  hitsPerPage: number;
  id?: string;
  abTestID?: number;
  abTestVariantID?: number;
}

/**
 * @public
 */
export interface ISearchAPI<
  TDocumentId,
  TDocumentFull,
  TDocumentPartial,
  TFacet,
  TSorting,
  TPage
> {
  /**
   * Searches for documents in a collection that match the given query and filters. The search can be paginated, limited, and sorted using the optional page, limit, and sorting parameters.
   *
   * Facets can be included in the search results by providing a list of facet names in the 'facets' parameter.
   * @param distinct - Enables de-duplication or grouping of results..
   * @param facetingAfterDistinct - If set to true, facets will be calculated after de-duplication.
   * @param staticFilters - Allows the application of permanent filters to the search, which are applied before any user-specified filters.
   * These filters can be used to limit the search results, for example for only showing a certain brand on a product list page while still allowing user to do further filtering.
   */
  search(
    query: string,
    filters?: string,
    page?: TPage,
    limit?: number,
    sorting?: TSorting,
    facets?: string[],
    analyticsTags?: string[],
    distinct?: boolean | number,
    facetingAfterDistinct?: boolean,
    staticFilters?: string
  ): Observable<IPagedCollection<TDocumentPartial, TPage, TFacet, TSorting>>;
  searchByIds(
    ids: TDocumentId[],
    filters?: string,
    page?: TPage,
    limit?: number,
    sorting?: TSorting,
    facets?: string[],
    analyticsTags?: string[],
    distinct?: boolean | number,
    facetingAfterDistinct?: boolean
  ): Observable<IPagedCollection<TDocumentPartial, TPage, TFacet, TSorting>>;
  findByIds(
    ids: TDocumentId[]
  ): Observable<IPagedCollection<TDocumentPartial, TPage, TFacet, TSorting>>;
  findByIdsFull(
    ids: TDocumentId[]
  ): Observable<IPagedCollection<TDocumentFull, TPage, TFacet, TSorting>>;
  findByIdFull(
    id: TDocumentId
  ): Observable<IPagedCollection<TDocumentFull, TPage, TFacet, TSorting>>;
}
