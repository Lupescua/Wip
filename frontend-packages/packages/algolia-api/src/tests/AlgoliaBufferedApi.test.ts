import { IRequestHandler } from '@salling-group/request-handlers';
import { rxSandbox, RxSandboxInstance } from 'rx-sandbox';
import { concat, of, throwError } from 'rxjs';
import { AlgoliaApi } from '../AlgoliaApi';
import { AlgoliaBufferedApi } from '../AlgoliaBufferedApi';
import { IAlgoliaSearchResult } from '../types/Result';

describe('AlgoliaBufferedApi', () => {
  let algoliaApi: AlgoliaApi;
  let algoliaBufferedApi: AlgoliaBufferedApi;

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
    algoliaBufferedApi = new AlgoliaBufferedApi(
      algoliaApi,
      { bufferTimeSpan: 60, maxBufferSize: 10 },
      scheduler.scheduler
    );
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

      const result$ = algoliaBufferedApi.query('index1', { query: '' });
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

      rxSandbox
        .marbleAssert(result)
        .to.equal(e('...60...(a|)', { a: { statusCode: 200, data: searchResult } }));
    });

    it('should only send a single multi request when 2 or more queries are rapidly fired', () => {
      const { getMessages, e } = scheduler;

      const searchResultA = searchResult;
      const searchResultB = { ...searchResult, hits: ['B'] };

      requestHandler.request = jest
        .fn()
        .mockImplementation(() =>
          of({ statusCode: 200, data: { results: [searchResultA, searchResultB] } })
        );

      const result1$ = algoliaBufferedApi.query('index1', { query: 'A' });
      const result2$ = algoliaBufferedApi.query('index1', { query: 'B' });

      const results = getMessages(concat(result1$, result2$));

      expect(requestHandler.request).toHaveBeenCalledTimes(1);
      expect(requestHandler.request).toHaveBeenCalledWith({
        headers: {
          'X-Algolia-API-Key': 'key',
          'X-Algolia-Application-Id': 'myApp'
        },
        method: 'POST',
        url: 'https://myApp-dsn.algolia.net/1/indexes/*/queries',
        data: {
          requests: [
            { indexName: 'index1', params: 'query=A' },
            { indexName: 'index1', params: 'query=B' }
          ],
          strategy: 'none'
        }
      });
      rxSandbox.marbleAssert(results).to.equal(
        e('...60...(ab|)', {
          a: { statusCode: 200, data: searchResultA },
          b: { statusCode: 200, data: searchResultB }
        })
      );
    });

    it('should handle errors', () => {
      const { getMessages, e, flush, scheduler } = rxSandbox.create();
      algoliaBufferedApi = new AlgoliaBufferedApi(
        algoliaApi,
        {
          bufferTimeSpan: 60,
          maxBufferSize: 10
        },
        scheduler
      );

      requestHandler.request = jest
        .fn()
        .mockImplementation(() => throwError({ statusCode: 400, data: undefined }));

      const result1$ = algoliaBufferedApi.query('index1', { query: '' });
      const result2$ = algoliaBufferedApi.query('index1', { query: '' });

      const result1 = getMessages(result1$);
      const result2 = getMessages(result2$);

      flush();

      const errorMarble = e('...60...(#)', undefined, {
        data: undefined,
        statusCode: 400
      });

      rxSandbox.marbleAssert(result1).to.equal(errorMarble as never);
      rxSandbox.marbleAssert(result2).to.equal(errorMarble as never);
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

      const result$ = algoliaBufferedApi.queryMultiple([
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
        e('...60...(a|)', {
          a: { statusCode: 200, data: { results: [searchResult1, searchResult2] } }
        })
      );
    });

    it('should only send a single multi request when 2 or more queries are rapidly fired', () => {
      const { getMessages, e } = scheduler;

      requestHandler.request = jest.fn().mockImplementation(() =>
        of({
          statusCode: 200,
          data: {
            results: [searchResult1, searchResult2, searchResult2, searchResult1]
          }
        })
      );

      const result1$ = algoliaBufferedApi.queryMultiple([
        { indexName: 'index1', params: { query: '' } },
        { indexName: 'index1', params: { query: '' } }
      ]);
      const result2$ = algoliaBufferedApi.queryMultiple([
        { indexName: 'index2', params: { query: '' } },
        { indexName: 'index3', params: { query: '' } }
      ]);
      const results = getMessages(concat(result1$, result2$));

      expect(requestHandler.request).toHaveBeenCalledTimes(1);
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
            { indexName: 'index1', params: 'query=' },
            { indexName: 'index2', params: 'query=' },
            { indexName: 'index3', params: 'query=' }
          ],
          strategy: 'none'
        }
      });
      expect(results).toEqual(
        e('...60...(ab|)', {
          a: { statusCode: 200, data: { results: [searchResult1, searchResult2] } },
          b: { statusCode: 200, data: { results: [searchResult2, searchResult1] } }
        })
      );
    });
  });
});
