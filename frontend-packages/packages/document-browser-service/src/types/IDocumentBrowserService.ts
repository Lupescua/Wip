import { IEmitableObservable, Selector } from '@salling-group/core-service';

/**
 * @public
 */
export type ObjectKey = string | number | symbol;

/**
 * @public
 */
export enum ContextType {
  SEARCH,
  SEARCH_BY_IDS
}

/**
 * @public
 */
export interface ISearchContextState<TDocumentId, TPage, TFacet, TSorting> {
  key: string;
  query: string;
  id?: string;
  filters: string;
  facets: TFacet[];
  /**
   * Array of document id's
   */
  documents: TDocumentId[];
  fetchedPages: TPage[];
  nextPage: TPage | undefined;
  prevPage: TPage | undefined;
  numberOfHits: number;
  numberOfPages: number;
  hitsPerPage: number;
  sortings: TSorting[] | undefined;
  activeSorting: TSorting | undefined;
  activeSearchKeys: string[];
  distinct: boolean | number;
  facetingAfterDistinct: boolean;
  ids?: TDocumentId[];
  type: ContextType;
  abTestID?: number;
  abTestVariantID?: number;
}

/**
 * @public
 */
export interface ISearchContextComputed<TDocument, TFacet, TSorting> {
  key: string;
  query: string;
  id?: string;
  abTestID?: number;
  abTestVariantID?: number;
  filters: string;
  facets: TFacet[];
  documents: TDocument[];
  fetchNextPage?: () => void;
  fetchPrevPage?: () => void;
  numberOfHits: number;
  numberOfPages: number;
  hitsPerPage: number;
  sortings: TSorting[] | undefined;
  activeSorting: TSorting | undefined;
  activeSearchKeys?: Array<string>;
}

/**
 * @public
 */
export type IUnionDocument<TPartial, TFull> = TPartial & Partial<TFull>;

/**
 * @public
 */
export interface IDocumentBrowserState<
  TDocumentId extends ObjectKey,
  TDocumentFull,
  TDocumentPartial,
  TPage,
  TFacet,
  TSorting
> {
  documents: Record<TDocumentId, IUnionDocument<TDocumentPartial, TDocumentFull>>;
  contexts: Record<string, ISearchContextState<TDocumentId, TPage, TFacet, TSorting>>;
}

/**
 * @public
 */
export enum InsertPosition {
  APPEND_DOCUMENTS,
  PREPEND_DOCUMENTS,
  CLEAR_DOCUMENTS
}

/**
 * @public
 */
export interface ISearchPayload<TPage, TSorting>
  extends IBaseSearchPayload<TPage, TSorting> {
  query: string;
}

/**
 * @public
 */
export interface ISearchByIdsPayload<TDocumentId, TPage, TSorting>
  extends IBaseSearchPayload<TPage, TSorting> {
  ids: TDocumentId[];
}

/**
 * @public
 */
export interface IBaseSearchPayload<TPage, TSorting> {
  contextKey: string;
  mode?: InsertPosition;
  distinct?: boolean | number;
  facetingAfterDistinct?: boolean;
  filters?: string;
  hitsPerPage?: number;
  page?: TPage;
  sorting?: TSorting;
  includeFacets?: string[];
  analyticsTags?: string[];
  staticFilters?: string;
}

/**
 * @public
 */
export interface IDocumentBrowserService<
  TDocumentId extends ObjectKey,
  TDocumentFull,
  TDocumentPartial,
  TFacet,
  TSorting,
  TPage
> {
  readonly getContext: Selector<
    | ISearchContextComputed<
        IUnionDocument<TDocumentPartial, TDocumentFull>,
        TFacet,
        TSorting
      >
    | undefined,
    [key: string]
  >;

  readonly getContexts: Selector<
    Array<
      ISearchContextComputed<
        IUnionDocument<TDocumentPartial, TDocumentFull>,
        TFacet,
        TSorting
      >
    >,
    [keys: string[]]
  >;

  readonly getDocument: Selector<
    IUnionDocument<TDocumentPartial, TDocumentFull> | undefined,
    [id: TDocumentId]
  >;

  readonly getDocuments: Selector<
    (IUnionDocument<TDocumentPartial, TDocumentFull> | undefined)[],
    [ids: TDocumentId[]]
  >;

  readonly isSearchInContext: Selector<
    boolean,
    [searchPayload: ISearchPayload<TPage, TSorting>]
  >;

  search(
    payload: ISearchPayload<TPage, TSorting>
  ): IEmitableObservable<
    IDocumentBrowserState<
      TDocumentId,
      TDocumentFull,
      TDocumentPartial,
      TPage,
      TFacet,
      TSorting
    >
  >;
  searchByIds(
    payload: ISearchByIdsPayload<TDocumentId, TPage, TSorting>
  ): IEmitableObservable<
    IDocumentBrowserState<
      TDocumentId,
      TDocumentFull,
      TDocumentPartial,
      TPage,
      TFacet,
      TSorting
    >
  >;
  findByIds(
    ids: TDocumentId[]
  ): IEmitableObservable<
    IDocumentBrowserState<
      TDocumentId,
      TDocumentFull,
      TDocumentPartial,
      TPage,
      TFacet,
      TSorting
    >
  >;
  findByIdsFull(
    ids: TDocumentId[]
  ): IEmitableObservable<
    IDocumentBrowserState<
      TDocumentId,
      TDocumentFull,
      TDocumentPartial,
      TPage,
      TFacet,
      TSorting
    >
  >;
  findByIdFull(
    id: TDocumentId
  ): IEmitableObservable<
    IDocumentBrowserState<
      TDocumentId,
      TDocumentFull,
      TDocumentPartial,
      TPage,
      TFacet,
      TSorting
    >
  >;
}

/**
 * @internal
 */
export interface ICreateContextPayload<
  TDocumentId extends ObjectKey,
  TDocumentFull,
  TDocumentPartial,
  TPage,
  TFacet,
  TSorting
> {
  context: ISearchContextState<TDocumentId, TPage, TFacet, TSorting>;
  state: IDocumentBrowserState<
    TDocumentId,
    TDocumentFull,
    TDocumentPartial,
    TPage,
    TFacet,
    TSorting
  >;
  mode: InsertPosition;
  searchKey?: string;
}
