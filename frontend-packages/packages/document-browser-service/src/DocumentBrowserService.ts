import { IPagedCollection, ISearchAPI } from '@salling-group/core';
import {
  Action,
  IEmitableObservable,
  Selector,
  Service
} from '@salling-group/core-service';
import { map } from 'rxjs/operators';
import {
  ContextType,
  IBaseSearchPayload,
  ICreateContextPayload,
  IDocumentBrowserService,
  IDocumentBrowserState,
  InsertPosition,
  ISearchByIdsPayload,
  ISearchContextComputed,
  ISearchContextState,
  ISearchPayload,
  IUnionDocument,
  ObjectKey
} from './types/IDocumentBrowserService';

/**
 * @public
 * This service is used to fetch items from a datasource and save the items in session storage.
 */
export class DocumentBrowserService<
    TDocumentId extends ObjectKey,
    TDocumentFull,
    TDocumentPartial,
    TFacet,
    TSorting,
    TPage
  >
  extends Service<
    IDocumentBrowserState<
      TDocumentId,
      TDocumentFull,
      TDocumentPartial,
      TPage,
      TFacet,
      TSorting
    >
  >
  implements
    IDocumentBrowserService<
      TDocumentId,
      TDocumentFull,
      TDocumentPartial,
      TFacet,
      TSorting,
      TPage
    > {
  private _searchApi: ISearchAPI<
    TDocumentId,
    TDocumentFull,
    TDocumentPartial,
    TFacet,
    TSorting,
    TPage
  >;
  private _getIdFrom: (document: TDocumentFull | TDocumentPartial) => TDocumentId;

  /**
   * @param searchApi - the datasource used to fetch elements
   * @param getIdFrom - a function used to select document ID. Documents are identified with the created ID and the same ID is used to lookup up documents with `getDocument`.
   * @param overrideState - the initial service state.
   */
  public constructor(
    searchApi: ISearchAPI<
      TDocumentId,
      TDocumentFull,
      TDocumentPartial,
      TFacet,
      TSorting,
      TPage
    >,
    getIdFrom: (document: TDocumentFull | TDocumentPartial) => TDocumentId,
    overrideState?: Partial<
      IDocumentBrowserState<
        TDocumentId,
        TDocumentFull,
        TDocumentPartial,
        TPage,
        TFacet,
        TSorting
      >
    >
  ) {
    super({
      documents: {} as Record<
        TDocumentId,
        IUnionDocument<TDocumentPartial, TDocumentFull>
      >,
      contexts: {},
      ...overrideState
    });
    this._searchApi = searchApi;
    this._getIdFrom = getIdFrom;
  }

  /**
   * Finds a context already in state whose key matches the value of `key`.
   * The context should already have been fetched and added to state by a fetch function.
   * @returns an Observable that emits a lookup function, that will return the context from state identified by key.
   */
  public get getContext(): Selector<
    | ISearchContextComputed<
        IUnionDocument<TDocumentPartial, TDocumentFull>,
        TFacet,
        TSorting
      >
    | undefined,
    [key: string]
  > {
    return this.selector((state, key) => {
      if (!(key in state.contexts)) return undefined;

      const context = state.contexts[key];

      return {
        ...context,
        documents: context.documents.map((id) => state.documents[id]),
        fetchNextPage:
          context.nextPage !== undefined
            ? this._createSearchPageFunction(
                context,
                context.nextPage,
                InsertPosition.APPEND_DOCUMENTS
              )
            : undefined,
        fetchPrevPage:
          context.prevPage !== undefined
            ? this._createSearchPageFunction(
                context,
                context.prevPage,
                InsertPosition.PREPEND_DOCUMENTS
              )
            : undefined
      };
    });
  }

  /**
   * Finds a subset of contexts already in state whose key matches a value of `keys`.
   * The contexts should already have been fetched and added to state by a function.
   * @returns an Observable that emits a lookup function, that will return contexts from state identified by keys.
   */
  public get getContexts(): Selector<
    Array<
      ISearchContextComputed<
        IUnionDocument<TDocumentPartial, TDocumentFull>,
        TFacet,
        TSorting
      >
    >,
    [keys: string[]]
  > {
    return this.selector(
      (getContext, keys) =>
        keys
          .map((key) => getContext(key))
          .filter(
            (
              context
            ): context is ISearchContextComputed<
              IUnionDocument<TDocumentPartial, TDocumentFull>,
              TFacet,
              TSorting
            > => !!context
          ),
      this.getContext
    );
  }

  /**
   * Finds a document already in state whose id matches the value of `id`.
   * The document should already have been fetched and added to state by a fetch function.
   * @returns an Observable that emits a lookup function, that will return the document from state identified by id.
   */
  public get getDocument(): Selector<
    IUnionDocument<TDocumentPartial, TDocumentFull> | undefined,
    [id: TDocumentId]
  > {
    return this.selector((state, id) => state.documents[id]);
  }

  /**
   * Finds a subset of documents already in state whose id matches a value of `ids`.
   * The documents should already have been fetched and added to state by a fetch functions.
   * @returns an Observable that emits a lookup function, that will return documents from state identified by ids.
   */
  public get getDocuments(): Selector<
    (IUnionDocument<TDocumentPartial, TDocumentFull> | undefined)[],
    [ids: TDocumentId[]]
  > {
    return this.selector((state, ids) => {
      return ids.map((id) => state.documents[id]);
    });
  }

  /**
   * @returns an Observable that emits true if `search` has already been called with the same payload.
   */
  public get isSearchInContext(): Selector<
    boolean,
    [searchPayload: ISearchPayload<TPage, TSorting>]
  > {
    return this.selector((getContext, payload) => {
      const context = getContext(payload.contextKey);
      return !!context?.activeSearchKeys?.includes(this._createSearchKey(payload));
    }, this.getContext);
  }

  /**
   * Calls `searchApi.search` with payload. Creates a context from the response and merges and the returned documents into state.
   * Searches for documents in a collection that match the given query and filters. The search can be paginated, limited, and sorted using the optional page, limit, and sorting parameters.
   *
   * Facets can be included in the search results by providing a list of facet names in the 'facets' parameter.
   * @param distinct - Enables de-duplication or grouping of results..
   * @param facetingAfterDistinct - If set to true, facets will be calculated after de-duplication.
   * @param staticFilters - Allows the application of permanent filters to the search, which are applied before any user-specified filters.
   * These filters can be used to limit the search results, for example for only showing a certain brand on a product list page while still allowing user to do further filtering.
   */
  @Action()
  public search(
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
  > {
    const {
      query,
      contextKey,
      mode = InsertPosition.CLEAR_DOCUMENTS,
      filters = '',
      page,
      distinct = false,
      facetingAfterDistinct = false,
      hitsPerPage,
      sorting,
      includeFacets,
      analyticsTags,
      staticFilters
    } = payload;

    const search$ = this._searchApi
      .search(
        query,
        filters,
        page,
        hitsPerPage,
        sorting,
        includeFacets,
        analyticsTags,
        distinct,
        facetingAfterDistinct,
        staticFilters
      )
      .pipe(
        map((response) => {
          return this._pagedCollectionToPartialState(
            this.getValue(),
            response,
            contextKey,
            filters,
            distinct,
            facetingAfterDistinct,
            ContextType.SEARCH
          );
        })
      );

    return this.setState(() => {
      return search$.pipe(
        map((r) => {
          const searchKey = this._createSearchKey(payload);
          return this._normalizeState(
            this.getValue(),
            r.documents,
            mode,
            searchKey,
            r.context
          );
        })
      );
    });
  }

  /**
   * Calls searchApi to find partial documents related to `ids`. Merges the returned documents into state.
   */
  @Action()
  public searchByIds(
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
  > {
    const {
      ids,
      contextKey,
      mode = InsertPosition.CLEAR_DOCUMENTS,
      filters = '',
      page,
      distinct = false,
      facetingAfterDistinct = false,
      hitsPerPage,
      sorting,
      includeFacets,
      analyticsTags
    } = payload;

    const search$ = this._searchApi
      .searchByIds(
        ids,
        filters,
        page,
        hitsPerPage,
        sorting,
        includeFacets,
        analyticsTags,
        distinct
      )
      .pipe(
        map((response) => {
          return this._pagedCollectionToPartialState(
            this.getValue(),
            response,
            contextKey,
            filters,
            distinct,
            facetingAfterDistinct,
            ContextType.SEARCH_BY_IDS,
            ids
          );
        })
      );

    return this.setState(() => {
      return search$.pipe(
        map((r) => {
          return this._normalizeState(
            this.getValue(),
            r.documents,
            mode,
            undefined,
            r.context
          );
        })
      );
    });
  }

  @Action()
  public findByIds(
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
  > {
    return this.setState(() => {
      return this._searchApi
        .findByIds(ids)
        .pipe(
          map((response) => this._normalizeState(this.getValue(), response.documents))
        );
    });
  }

  /**
   * Calls searchApi to find documents related to `ids`. Merges the returned documents into state.
   */
  @Action()
  public findByIdsFull(
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
  > {
    return this.setState(() => {
      return this._searchApi
        .findByIdsFull(ids)
        .pipe(
          map((response) => this._normalizeState(this.getValue(), response.documents))
        );
    });
  }

  /**
   * Calls searchApi to find a document related to `id`. Merges the returned document into state.
   */
  @Action()
  public findByIdFull(
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
  > {
    return this.setState(() => {
      return this._searchApi
        .findByIdFull(id)
        .pipe(
          map((response) => this._normalizeState(this.getValue(), response.documents))
        );
    });
  }

  /**
   * Converts the result of `searchApi.search` into the format used in this service.
   * @param pagedCollection - the result of `searchApi.search`.
   * @param contextKey - the context key.
   * @param filters - filters used when calling `searchApi.search`.
   */
  private _pagedCollectionToPartialState(
    state: IDocumentBrowserState<
      TDocumentId,
      TDocumentFull,
      TDocumentPartial,
      TPage,
      TFacet,
      TSorting
    >,
    pagedCollection: IPagedCollection<
      IUnionDocument<TDocumentPartial, TDocumentFull>,
      TPage,
      TFacet,
      TSorting
    >,
    contextKey: string,
    filters: string,
    distinct: boolean | number,
    facetingAfterDistinct: boolean,
    type: ContextType,
    ids?: TDocumentId[]
  ): {
    documents: Array<IUnionDocument<TDocumentPartial, TDocumentFull>>;
    context: ISearchContextState<TDocumentId, TPage, TFacet, TSorting>;
  } {
    const existingContext = state.contexts[contextKey];
    const fetchedPages =
      existingContext &&
      existingContext.fetchedPages &&
      !existingContext.fetchedPages.includes(pagedCollection.page)
        ? [...existingContext.fetchedPages, pagedCollection.page]
        : [pagedCollection.page];
    return {
      documents: pagedCollection.documents,
      context: {
        ...pagedCollection,
        key: contextKey,
        fetchedPages,
        nextPage: pagedCollection.calculateNextPage(fetchedPages),
        prevPage: pagedCollection.calculatePrevPage(fetchedPages),
        documents: pagedCollection.documents.map(this._getIdFrom),
        filters,
        activeSorting: pagedCollection.activeSorting,
        activeSearchKeys: [],
        distinct,
        facetingAfterDistinct,
        type,
        ids
      }
    };
  }

  /**
   * @returns a callback function that searches for `page` in `context`.
   */
  private _createSearchPageFunction(
    context: ISearchContextState<TDocumentId, TPage, TFacet, TSorting>,
    page: TPage,
    mode: InsertPosition
  ): () => void {
    const sharedProps = {
      contextKey: context.key,
      mode,
      filters: context.filters,
      page,
      hitsPerPage: context.hitsPerPage,
      sorting: context.activeSorting,
      distinct: context.distinct,
      facetingAfterDistinct: context.facetingAfterDistinct
    };

    if (context.type === ContextType.SEARCH_BY_IDS) {
      return () =>
        this.searchByIds({
          ...sharedProps,
          ids: context.ids ?? []
        });
    }
    return () =>
      this.search({
        ...sharedProps,
        query: context.query
      });
  }

  /**
   * Merges `docs` and `context` into existing documents and contexts that already exist in `state`
   * @param state - current state
   * @param docs - new documents
   * @param context - new context
   * @returns an containing the combined documents and contexts
   */
  private _normalizeState(
    state: IDocumentBrowserState<
      TDocumentId,
      TDocumentFull,
      TDocumentPartial,
      TPage,
      TFacet,
      TSorting
    >,
    docs: Array<TDocumentPartial | TDocumentFull>,
    mode: InsertPosition = InsertPosition.CLEAR_DOCUMENTS,
    searchKey?: string,
    context?: ISearchContextState<TDocumentId, TPage, TFacet, TSorting>
  ): IDocumentBrowserState<
    TDocumentId,
    TDocumentFull,
    TDocumentPartial,
    TPage,
    TFacet,
    TSorting
  > {
    // create object which merges `docs` with existing documents that already exist in state. Overrides values of documents that already exist in state.
    const documents = docs.reduce((accumulator, nextDocument) => {
      const id = this._getIdFrom(nextDocument);
      return { ...accumulator, [id]: { ...state.documents[id], ...nextDocument } };
    }, state.documents);

    const newContext = context
      ? this._mergeWithExistingContext({
          context,
          mode,
          state,
          searchKey
        })
      : undefined;

    const contexts = {
      ...state.contexts,
      ...(newContext ? { [newContext.key]: newContext } : {})
    };

    return {
      documents,
      contexts
    };
  }

  /**
   * Merges `context` with existing context in `state` with same key, if such already exist.
   */
  private _mergeWithExistingContext({
    context,
    state,
    mode = InsertPosition.CLEAR_DOCUMENTS,
    searchKey
  }: ICreateContextPayload<
    TDocumentId,
    TDocumentFull,
    TDocumentPartial,
    TPage,
    TFacet,
    TSorting
  >): ISearchContextState<TDocumentId, TPage, TFacet, TSorting> | undefined {
    const existingContext = state.contexts[context.key];

    return {
      ...context,
      // Keep facets as paginated responses will include same facets, so no need to fetch them
      facets:
        mode === InsertPosition.CLEAR_DOCUMENTS ? context.facets : existingContext.facets,
      documents: this._handleInsertPosition<TDocumentId>(
        mode,
        context.documents ?? [],
        existingContext?.documents ?? []
      ),
      activeSearchKeys: this._handleInsertPosition<string>(
        mode,
        searchKey ? [searchKey] : [],
        existingContext?.activeSearchKeys ?? []
      )
    };
  }

  /**
   * Inserts newValues next to oldValues based on mode.
   * @param mode - the mode that decides where `newValues` are placed in relation to `oldValues`.
   * @returns the values merged into one array
   */
  private _handleInsertPosition<TValue>(
    mode: InsertPosition,
    newValues: TValue[],
    oldValues: TValue[]
  ): TValue[] {
    switch (mode) {
      case InsertPosition.CLEAR_DOCUMENTS:
        return newValues;
      case InsertPosition.APPEND_DOCUMENTS:
        return [...oldValues, ...newValues];
      case InsertPosition.PREPEND_DOCUMENTS:
        return [...newValues, ...oldValues];
    }
  }

  /**
   * Creates a unique key by JSON stringify some of `searchPayload`'s values
   */
  private _createSearchKey(searchPayload: IBaseSearchPayload<TPage, TSorting>): string {
    return JSON.stringify({
      ...searchPayload,
      filters: searchPayload.filters || '',
      mode: undefined,
      contextKey: undefined
    });
  }
}
