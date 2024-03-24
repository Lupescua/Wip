import { IRequestHandler } from '@salling-group/request-handlers';
import { rxSandbox, RxSandboxInstance } from 'rx-sandbox';
import { of } from 'rxjs';
import { AlgoliaApi } from '../AlgoliaApi';
import { IAlgoliaSearchResult } from '../types/Result';

describe('AlgoliaApi', () => {
  let algoliaApi: AlgoliaApi;
  let scheduler: RxSandboxInstance;
  let requestHandler: IRequestHandler;

  beforeEach(() => {
    scheduler = rxSandbox.create(true);
    jest.resetAllMocks();

    requestHandler = { request: jest.fn() };

    algoliaApi = new AlgoliaApi(requestHandler, {
      applicationId: 'myApp',
      apiKey: 'key',
      baseURL: 'https://myApp-dsn.algolia.net/'
    });
  });

  describe('query', () => {
    const searchResult: IAlgoliaSearchResult<string> = {
      hits: ['', ''],
      nbHits: 100,
      hitsPerPage: 2,
      page: 0,
      nbPages: 50,
      exhaustiveNbHits: true,
      query: '',
      params: 'query=',
      index: 'index1'
    };

    it('should execute a single search when called correctly', () => {
      const { getMessages, e } = scheduler;

      requestHandler.request = jest
        .fn()
        .mockImplementation(() =>
          of({ statusCode: 200, data: { results: [searchResult] } })
        );

      const result$ = algoliaApi.query('index1', { query: '' });

      const result = getMessages(result$);

      expect(requestHandler.request).toHaveBeenCalledWith({
        headers: {
          'X-Algolia-API-Key': 'key',
          'X-Algolia-Application-Id': 'myApp'
        },
        method: 'POST',
        url: 'https://myApp-dsn.algolia.net/1/indexes/*/queries',
        data: {
          requests: [{ indexName: 'index1', params: 'query=' }],
          strategy: 'none'
        }
      });

      expect(result).toEqual(e('(a|)', { a: { statusCode: 200, data: searchResult } }));
    });

    it('should emit an error if results contains more than one search result', () => {
      const { getMessages, e } = scheduler;

      const searchResult: IAlgoliaSearchResult<string> = {
        hits: ['', ''],
        nbHits: 100,
        hitsPerPage: 2,
        page: 0,
        nbPages: 50,
        exhaustiveNbHits: true,
        query: '',
        params: 'query=',
        index: 'index1'
      };

      requestHandler.request = jest
        .fn()
        .mockImplementation(() =>
          of({ statusCode: 200, data: { results: [searchResult, searchResult] } })
        );
      const result$ = algoliaApi.query('index1', { query: '' });

      const result = getMessages(result$);

      expect(result).toEqual(e('#', null, Error('Expected exactly 1 response')));
    });
  });

  describe('queryMultiple', () => {
    const searchResult1: IAlgoliaSearchResult<string> = {
      hits: ['', ''],
      nbHits: 100,
      hitsPerPage: 2,
      page: 0,
      nbPages: 50,
      exhaustiveNbHits: true,
      query: '',
      params: 'query=',
      index: 'index1'
    };
    const searchResult2: IAlgoliaSearchResult<string> = {
      hits: ['', '', ''],
      nbHits: 50,
      hitsPerPage: 3,
      page: 0,
      nbPages: 27,
      exhaustiveNbHits: true,
      query: '',
      params: 'query=',
      index: 'index1'
    };

    it('should execute multiple searches in one request', () => {
      const { getMessages, e } = scheduler;

      requestHandler.request = jest
        .fn()
        .mockImplementation(() =>
          of({ statusCode: 200, data: { results: [searchResult1, searchResult2] } })
        );

      const result$ = algoliaApi.queryMultiple([
        { indexName: 'index1', params: { query: '' } },
        { indexName: 'index2', params: { query: '' } }
      ]);

      const result = getMessages(result$);

      expect(requestHandler.request).toHaveBeenCalledWith({
        headers: {
          'X-Algolia-API-Key': 'key',
          'X-Algolia-Application-Id': 'myApp'
        },
        method: 'POST',
        url: 'https://myApp-dsn.algolia.net/1/indexes/*/queries',
        data: {
          requests: [
            { indexName: 'index1', params: 'query=' },
            { indexName: 'index2', params: 'query=' }
          ],
          strategy: 'none'
        }
      });

      expect(result).toEqual(
        e('(a|)', {
          a: { statusCode: 200, data: { results: [searchResult1, searchResult2] } }
        })
      );
    });

    it('should call search multiple endpoint with different strategy', () => {
      const { getMessages } = scheduler;

      requestHandler.request = jest
        .fn()
        .mockImplementation(() =>
          of({ statusCode: 200, data: { results: [searchResult1, searchResult2] } })
        );

      const result$ = algoliaApi.queryMultiple(
        [
          { indexName: 'index1', params: { query: '' } },
          { indexName: 'index2', params: { query: '' } }
        ],
        'stopIfEnoughMatches'
      );

      getMessages(result$);

      expect(requestHandler.request).toHaveBeenCalledWith({
        headers: {
          'X-Algolia-API-Key': 'key',
          'X-Algolia-Application-Id': 'myApp'
        },
        method: 'POST',
        url: 'https://myApp-dsn.algolia.net/1/indexes/*/queries',
        data: {
          requests: [
            { indexName: 'index1', params: 'query=' },
            { indexName: 'index2', params: 'query=' }
          ],
          strategy: 'stopIfEnoughMatches'
        }
      });
    });
  });
});
