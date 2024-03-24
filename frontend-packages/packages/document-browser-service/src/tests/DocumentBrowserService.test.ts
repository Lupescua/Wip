import { IPagedCollection, ISearchAPI } from '@salling-group/core';
import { getSelector } from '@salling-group/core-service';
import { of } from 'rxjs';
import { DocumentBrowserService } from '../DocumentBrowserService';
import {
  ContextType,
  IDocumentBrowserState,
  InsertPosition
} from '../types/IDocumentBrowserService';

describe('DocumentBrowserService', () => {
  let searchAPI: ISearchAPI<
    string,
    { objectID: string },
    { objectID: string },
    string,
    string,
    number
  >;
  let documentBrowserService: DocumentBrowserService<
    string,
    { objectID: string },
    { objectID: string },
    string,
    string,
    number
  >;
  let defaultResult: IPagedCollection<{ objectID: string }, number, string, string>;
  let initialState: IDocumentBrowserState<
    string,
    { objectID: string },
    { objectID: string },
    number,
    string,
    string
  >;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createContextMock = (key: string): any => ({
    key,
    query: '',
    filters: 'someFilter:A',
    documents: ['1', '2'],
    nextPage: 1,
    prevPage: undefined,
    numberOfHits: 4,
    numberOfPages: 2,
    hitsPerPage: 50,
    distinct: false,
    facetingAfterDistinct: false,
    facets: [],
    sortings: [],
    activeSorting: '',
    activeSearchKeys: []
  });

  beforeEach(() => {
    jest.resetAllMocks();

    searchAPI = {
      search: jest.fn(),
      searchByIds: jest.fn(),
      findByIds: jest.fn(),
      findByIdsFull: jest.fn(),
      findByIdFull: jest.fn()
    };

    initialState = {
      contexts: {
        'some Context': createContextMock('some Context')
      },
      documents: {}
    };

    documentBrowserService = new DocumentBrowserService(
      searchAPI,
      (e) => e.objectID,
      initialState
    );

    defaultResult = {
      facets: ['facet1'],
      query: 'a query',
      documents: [{ objectID: '1' }, { objectID: '2' }],
      page: 0,
      calculateNextPage: () => 1,
      calculatePrevPage: () => undefined,
      numberOfHits: 2,
      numberOfPages: 1,
      sortings: [],
      hitsPerPage: 50
    };
  });

  describe('getContext', () => {
    it('should return an observable that emits a context when context exists', () => {
      initialState = {
        contexts: {
          'some Context': {
            key: 'some Context',
            query: '',
            filters: '',
            documents: ['1', '2'],
            nextPage: undefined,
            prevPage: undefined,
            numberOfHits: 4,
            numberOfPages: 2,
            fetchedPages: [],
            facets: [],
            hitsPerPage: 50,
            sortings: [],
            activeSorting: '',
            activeSearchKeys: [],
            distinct: false,
            facetingAfterDistinct: false,
            type: ContextType.SEARCH
          }
        },
        documents: { 1: { objectID: '1' }, 2: { objectID: '2' } }
      };

      documentBrowserService = new DocumentBrowserService(
        searchAPI,
        (e) => e.objectID,
        initialState
      );

      const getContext = getSelector(documentBrowserService.getContext);
      const result = getContext('some Context');

      expect(result).toEqual({
        key: 'some Context',
        query: '',
        filters: '',
        documents: [{ objectID: '1' }, { objectID: '2' }],
        nextPage: undefined,
        prevPage: undefined,
        numberOfHits: 4,
        numberOfPages: 2,
        facets: [],
        fetchedPages: [],
        hitsPerPage: 50,
        sortings: [],
        activeSorting: '',
        distinct: false,
        facetingAfterDistinct: false,
        activeSearchKeys: [],
        type: ContextType.SEARCH
      });
    });

    it('should return an observable that emits undefined, when context does not exist', () => {
      const getContext = getSelector(documentBrowserService.getContext);
      const result = getContext('some non existent Context');

      expect(result).toBe(undefined);
    });

    it('it should not have a nextPage function if no next page', () => {
      searchAPI.search = jest.fn().mockImplementation(() => {
        return of({ ...defaultResult, calculateNextPage: () => undefined });
      });

      documentBrowserService.search({ query: 'some Query', contextKey: 'some Context' });

      const getContext = getSelector(documentBrowserService.getContext);
      const result = getContext('some Context');

      expect(result?.fetchNextPage).toBe(undefined);
    });

    it('should call the search of the searchAPI correctly when requesting the next page', () => {
      searchAPI.search = jest.fn().mockImplementation(() => {
        return of({ ...defaultResult, calculateNextPage: () => 4 });
      });

      documentBrowserService.search({ query: 'some Query', contextKey: 'some Context' });

      const getContext = getSelector(documentBrowserService.getContext);

      const result = getContext('some Context');

      documentBrowserService.search = jest.fn();

      result!.fetchNextPage!();

      expect(documentBrowserService.search).toHaveBeenCalledWith({
        query: 'a query',
        contextKey: 'some Context',
        mode: InsertPosition.APPEND_DOCUMENTS,
        filters: '',
        page: 4,
        hitsPerPage: 50,
        distinct: false,
        sorting: undefined,
        facetingAfterDistinct: false
      });
    });

    it('should call the search of the searchAPI correctly when requesting the previous page', () => {
      searchAPI.search = jest.fn().mockImplementation(() => {
        return of({ ...defaultResult, calculatePrevPage: () => 0 });
      });

      documentBrowserService.search({
        query: 'previous page Query',
        contextKey: 'some Context'
      });

      const getContext = getSelector(documentBrowserService.getContext);
      const result = getContext('some Context');

      documentBrowserService.search = jest.fn();

      result!.fetchPrevPage!();

      expect(documentBrowserService.search).toHaveBeenCalledWith({
        query: 'a query',
        contextKey: 'some Context',
        mode: InsertPosition.PREPEND_DOCUMENTS,
        filters: '',
        page: 0,
        hitsPerPage: 50,
        distinct: false,
        sorting: undefined,
        facetingAfterDistinct: false
      });
    });

    it('should call the search of the searchAPI correctly when requesting the previous page', () => {
      searchAPI.search = jest.fn().mockImplementation(() => {
        return of({ ...defaultResult, calculatePrevPage: () => 0 });
      });

      documentBrowserService.search({ query: 'some Query', contextKey: 'some Context' });

      const getContext = getSelector(documentBrowserService.getContext);
      const result = getContext('some Context');

      documentBrowserService.search = jest.fn();

      result!.fetchPrevPage!();

      expect(documentBrowserService.search).toHaveBeenCalledWith({
        query: 'a query',
        contextKey: 'some Context',
        mode: InsertPosition.PREPEND_DOCUMENTS,
        filters: '',
        page: 0,
        hitsPerPage: 50,
        distinct: false,
        sorting: undefined,
        facetingAfterDistinct: false
      });
    });
  });

  describe('getContexts', () => {
    it('should return an observable that emits an array of all contexts that successfully were found matching the given keys', () => {
      initialState = {
        contexts: {
          context1: createContextMock('context1'),
          context3: createContextMock('context3')
        },
        documents: { 1: { objectID: '1' }, 2: { objectID: '2' } }
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const createContextResponseMock = (key: string): any => ({
        key,
        query: '',
        filters: 'someFilter:A',
        documents: [{ objectID: '1' }, { objectID: '2' }],
        nextPage: 1,
        prevPage: undefined,
        numberOfHits: 4,
        numberOfPages: 2,
        facets: [],
        hitsPerPage: 50,
        sortings: [],
        activeSorting: '',
        activeSearchKeys: [],
        distinct: false,
        facetingAfterDistinct: false,
        fetchNextPage: expect.any(Function),
        fetchPrevPage: undefined
      });

      documentBrowserService = new DocumentBrowserService(
        searchAPI,
        (e) => e.objectID,
        initialState
      );

      const getContexts = getSelector(documentBrowserService.getContexts);
      const result = getContexts(['context1', 'context2', 'context3']);

      expect(result).toEqual([
        createContextResponseMock('context1'),
        createContextResponseMock('context3')
      ]);
    });

    it('should return an observable that emits an empty array of neither of the keys provided match a context', () => {
      initialState = {
        contexts: {
          context10: createContextMock('context10'),
          context20: createContextMock('context20')
        },
        documents: { 1: { objectID: '1' }, 2: { objectID: '2' } }
      };

      documentBrowserService = new DocumentBrowserService(
        searchAPI,
        (e) => e.objectID,
        initialState
      );

      const getContexts = getSelector(documentBrowserService.getContexts);
      const result = getContexts(['context1', 'context2', 'context3']);

      expect(result).toEqual([]);
    });
  });

  describe('getDocument', () => {
    it('should return an observable that emits a document when document exists', () => {
      initialState = {
        contexts: {},
        documents: { id1: { objectID: 'id1' }, id2: { objectID: 'id2' } }
      };

      documentBrowserService = new DocumentBrowserService(
        searchAPI,
        (e) => e.objectID,
        initialState
      );

      const getDocument = getSelector(documentBrowserService.getDocument);
      const result = getDocument('id1');

      expect(result).toEqual({ objectID: 'id1' });
    });

    it('should return an observable that emits undefined, when document does not exist', () => {
      const getDocument = getSelector(documentBrowserService.getDocument);
      const result = getDocument('id1');

      expect(result).toEqual(undefined);
    });
  });

  describe('getDocuments', () => {
    it('should return an observable that emits a list when called with a list of ids', () => {
      initialState = {
        contexts: {},
        documents: { id1: { objectID: 'id1' }, id2: { objectID: 'id2' } }
      };

      documentBrowserService = new DocumentBrowserService(
        searchAPI,
        (e) => e.objectID,
        initialState
      );

      const getDocuments = getSelector(documentBrowserService.getDocuments);
      const result = getDocuments(['id1', 'id2', 'id3']);

      expect(result).toEqual([{ objectID: 'id1' }, { objectID: 'id2' }, undefined]);
    });
  });

  describe('isSearchInContext', () => {
    it('should return an Observable that emits true when searchKey exist in context', () => {
      initialState = {
        contexts: {
          'some Context': {
            key: 'some Context',
            documents: ['1', '2'],
            activeSearchKeys: [JSON.stringify({ query: 'some_query', filters: '' })]
          } as any // eslint-disable-line @typescript-eslint/no-explicit-any
        },
        documents: { 1: { objectID: '1' }, 2: { objectID: '2' } }
      };

      documentBrowserService = new DocumentBrowserService(
        searchAPI,
        (e) => e.objectID,
        initialState
      );

      const isSearchInContext = getSelector(documentBrowserService.isSearchInContext);
      const result = isSearchInContext({
        contextKey: 'some Context',
        query: 'some_query'
      });

      expect(result).toBe(true);
    });

    it('should return an Observable that emits false when searchKey does not exist in context', () => {
      initialState = {
        contexts: {
          'some Context': {
            key: 'some Context',
            documents: ['1', '2'],
            activeSearchKeys: [JSON.stringify({ query: 'some_query', filters: '' })]
          } as any // eslint-disable-line @typescript-eslint/no-explicit-any
        },
        documents: { 1: { objectID: '1' }, 2: { objectID: '2' } }
      };

      documentBrowserService = new DocumentBrowserService(
        searchAPI,
        (e) => e.objectID,
        initialState
      );

      const isSearchInContext = getSelector(documentBrowserService.isSearchInContext);
      const result = isSearchInContext({
        contextKey: 'some Context',
        query: 'some_other_query'
      });

      expect(result).toBe(false);
    });
  });

  describe('search', () => {
    it('should call the search of the searchAPI and update the state correctly', () => {
      searchAPI.search = jest.fn().mockImplementation(() => {
        return of(defaultResult);
      });

      documentBrowserService.search({ query: 'some Query', contextKey: 'some Context' });

      expect(searchAPI.search).toHaveBeenCalledWith(
        'some Query',
        '',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        false,
        false,
        undefined
      );

      const value = documentBrowserService.getValue();

      expect(value).toMatchObject({
        contexts: {
          'some Context': {
            key: 'some Context',
            documents: ['1', '2'],
            nextPage: 1,
            prevPage: undefined,
            numberOfHits: 2,
            numberOfPages: 1,
            facets: ['facet1'],
            hitsPerPage: 50
          }
        },
        documents: { 1: { objectID: '1' }, 2: { objectID: '2' } }
      });
    });

    it('should clear document Ids to the given context when called multiple times', () => {
      const firstResult = { ...defaultResult };
      const secondResult = {
        ...defaultResult,
        documents: [{ objectID: '3' }, { objectID: '4' }]
      };
      let n = 0;
      searchAPI.search = jest.fn().mockImplementation(() => {
        if (n === 0) {
          n++;
          return of(firstResult);
        } else {
          return of(secondResult);
        }
      });

      documentBrowserService.search({ query: '', contextKey: 'some Context' });
      documentBrowserService.search({
        query: '',
        contextKey: 'some Context',
        mode: InsertPosition.CLEAR_DOCUMENTS
      });

      const value = documentBrowserService.getValue().contexts['some Context'];

      expect(value.documents).toStrictEqual(['3', '4']);
    });

    it('should append document Ids to the given context when called multiple times', () => {
      const firstResult = { ...defaultResult };
      const secondResult = {
        ...defaultResult,
        documents: [{ objectID: '3' }, { objectID: '4' }]
      };
      let n = 0;
      searchAPI.search = jest.fn().mockImplementation(() => {
        if (n === 0) {
          n++;
          return of(firstResult);
        } else {
          return of(secondResult);
        }
      });

      documentBrowserService.search({ query: '', contextKey: 'some Context' });
      documentBrowserService.search({
        query: '',
        contextKey: 'some Context',
        mode: InsertPosition.APPEND_DOCUMENTS
      });

      const value = documentBrowserService.getValue().contexts['some Context'];

      expect(value.documents).toStrictEqual(['1', '2', '3', '4']);
    });

    it('should prepend document Ids to the given context when called multiple times', () => {
      const firstResult = { ...defaultResult };
      const secondResult = {
        ...defaultResult,
        documents: [{ objectID: '3' }, { objectID: '4' }]
      };
      let n = 0;
      searchAPI.search = jest.fn().mockImplementation(() => {
        if (n === 0) {
          n++;
          return of(firstResult);
        } else {
          return of(secondResult);
        }
      });

      documentBrowserService.search({
        query: '',
        contextKey: 'some Context'
      });
      documentBrowserService.search({
        query: '',
        contextKey: 'some Context',
        mode: InsertPosition.PREPEND_DOCUMENTS
      });

      const value = documentBrowserService.getValue().contexts['some Context'];

      expect(value.documents).toStrictEqual(['3', '4', '1', '2']);
    });
  });

  describe('searchByIds', () => {
    it('should call the searchByIds method of the searchAPI and update the state correctly', () => {
      searchAPI.searchByIds = jest.fn().mockImplementation(() => {
        return of(defaultResult);
      });

      documentBrowserService.searchByIds({
        ids: ['1', '2'],
        contextKey: 'some Context'
      });

      expect(searchAPI.searchByIds).toHaveBeenCalledWith(
        ['1', '2'],
        '',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        false
      );

      const value = documentBrowserService.getValue();

      expect(value).toMatchObject({
        contexts: {
          'some Context': {
            key: 'some Context',
            documents: ['1', '2'],
            nextPage: 1,
            prevPage: undefined,
            numberOfHits: 2,
            numberOfPages: 1,
            facets: ['facet1'],
            hitsPerPage: 50
          }
        },
        documents: { 1: { objectID: '1' }, 2: { objectID: '2' } }
      });
    });

    it('should call the searchByIds of the searchAPI correctly when requesting the next page', () => {
      searchAPI.searchByIds = jest.fn().mockImplementation(() => {
        return of(defaultResult);
      });

      documentBrowserService.searchByIds({
        ids: ['1', '2'],
        contextKey: 'some Context'
      });

      const getContext = getSelector(documentBrowserService.getContext);
      const result = getContext('some Context');

      documentBrowserService.searchByIds = jest.fn();

      result!.fetchNextPage!();

      expect(documentBrowserService.searchByIds).toHaveBeenCalledWith({
        contextKey: 'some Context',
        distinct: false,
        facetingAfterDistinct: false,
        filters: '',
        hitsPerPage: 50,
        ids: ['1', '2'],
        mode: 0,
        page: 1,
        sorting: undefined
      });
    });
  });

  describe('findByIds', () => {
    it('should call the findByIds method of the searchAPI and update the state correctly', () => {
      searchAPI.findByIds = jest.fn().mockImplementation(() => {
        return of(defaultResult);
      });

      documentBrowserService.findByIds(['id1', 'id2']);

      expect(searchAPI.findByIds).toHaveBeenCalledWith(['id1', 'id2']);
      expect(documentBrowserService.getValue()).toEqual({
        contexts: initialState.contexts,
        documents: { 1: { objectID: '1' }, 2: { objectID: '2' } }
      });
    });
  });

  describe('findByIdsFull', () => {
    it('should call the findByIdsFull method of the searchAPI and update the state correctly', () => {
      searchAPI.findByIdsFull = jest.fn().mockImplementation(() => {
        return of(defaultResult);
      });

      documentBrowserService.findByIdsFull(['id1', 'id2']);

      expect(searchAPI.findByIdsFull).toHaveBeenCalledWith(['id1', 'id2']);
      expect(documentBrowserService.getValue()).toEqual({
        contexts: initialState.contexts,
        documents: { 1: { objectID: '1' }, 2: { objectID: '2' } }
      });
    });
  });

  describe('findByIdFull', () => {
    it('should call the findByIdFull method of the searchAPI and update the state correctly', () => {
      searchAPI.findByIdFull = jest.fn().mockImplementation(() => {
        return of(defaultResult);
      });

      documentBrowserService.findByIdFull('id1');

      expect(searchAPI.findByIdFull).toHaveBeenCalledWith('id1');
      expect(documentBrowserService.getValue()).toEqual({
        contexts: initialState.contexts,
        documents: { 1: { objectID: '1' }, 2: { objectID: '2' } }
      });
    });
  });
});
