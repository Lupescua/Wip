import { rxSandbox, RxSandboxInstance } from 'rx-sandbox';
import { of } from 'rxjs';
import { IAlgoliaApi } from '../AlgoliaApi';
import { AlgoliaSuggestionAPI } from '../AlgoliaSuggestionAPI';

enum TestSuggestionKeysEnum {
  products,
  recipes
}

interface ITestSuggestionType {
  type: TestSuggestionKeysEnum;
  suggestionValue1: string;
  suggestionValue2: string;
}

describe('Algolia Search API', () => {
  let scheduler: RxSandboxInstance;
  let searchSuggestionAPI: AlgoliaSuggestionAPI;
  let algoliaAPI: IAlgoliaApi;

  beforeEach(() => {
    scheduler = rxSandbox.create(true);
    jest.resetAllMocks();

    algoliaAPI = { query: jest.fn(), queryMultiple: jest.fn(), browse: jest.fn() };
    algoliaAPI.queryMultiple = jest.fn().mockImplementation(() => {
      return of({
        statusCode: 200,
        data: {
          results: [
            {
              hits: [{ objectID: '1' }, { objectID: '2' }],
              nbHits: 2,
              page: 0,
              nbPages: 1,
              hitsPerPage: 50,
              exhaustiveNbHits: true,
              query: 'a query',
              params: '',
              queryID: 'query-1'
            },
            {
              hits: [{ objectID: '1' }, { objectID: '2' }],
              nbHits: 2,
              page: 0,
              nbPages: 1,
              hitsPerPage: 50,
              exhaustiveNbHits: true,
              query: 'a query',
              params: '',
              queryID: 'query-2'
            }
          ]
        }
      });
    });

    searchSuggestionAPI = new AlgoliaSuggestionAPI(algoliaAPI);
  });

  describe('getSuggestions', () => {
    it('should create a list of queries based on the "indexes" array and call queryMultiple with these', () => {
      searchSuggestionAPI.getSuggestions<ITestSuggestionType, TestSuggestionKeysEnum>(
        'some term',
        [
          {
            type: TestSuggestionKeysEnum.products,
            hitsPerPage: 7,
            indexName: 'products'
          },
          {
            type: TestSuggestionKeysEnum.recipes,
            hitsPerPage: 2,
            indexName: 'recipes'
          }
        ]
      );

      expect(algoliaAPI.queryMultiple).toHaveBeenCalledTimes(1);
      expect(algoliaAPI.queryMultiple).toHaveBeenCalledWith([
        {
          indexName: 'products',
          params: {
            attributesToRetrieve: ['*'],
            distinct: false,
            facets: ['*'],
            filters: '',
            hitsPerPage: 7,
            query: 'some term',
            clickAnalytics: true,
            getRankingInfo: false
          }
        },
        {
          indexName: 'recipes',
          params: {
            attributesToRetrieve: ['*'],
            distinct: false,
            facets: ['*'],
            filters: '',
            hitsPerPage: 2,
            query: 'some term',
            clickAnalytics: true,
            getRankingInfo: false
          }
        }
      ]);
    });

    it('should add queryID and add the type field to returned suggestions based on which query they are returned from', () => {
      const { getMessages, e } = scheduler;

      const result$ = searchSuggestionAPI.getSuggestions('some term', [
        {
          type: TestSuggestionKeysEnum.products,
          hitsPerPage: 7,
          indexName: 'products'
        },
        {
          type: TestSuggestionKeysEnum.recipes,
          hitsPerPage: 2,
          indexName: 'recipes'
        }
      ]);

      const result = getMessages(result$);

      expect(result).toEqual(
        e('(a|)', {
          a: [
            { objectID: '1', type: TestSuggestionKeysEnum.products, queryID: 'query-1' },
            { objectID: '2', type: TestSuggestionKeysEnum.products, queryID: 'query-1' },
            { objectID: '1', type: TestSuggestionKeysEnum.recipes, queryID: 'query-2' },
            { objectID: '2', type: TestSuggestionKeysEnum.recipes, queryID: 'query-2' }
          ]
        })
      );
    });
  });

  describe('getUnmodifiedSuggestions  ', () => {
    it('should create a list of queries based on the "indexes" array and call queryMultiple with these', () => {
      searchSuggestionAPI.getUnmodifiedSuggestions<
        ITestSuggestionType,
        TestSuggestionKeysEnum
      >('some term', [
        {
          type: TestSuggestionKeysEnum.products,
          hitsPerPage: 7,
          indexName: 'products'
        },
        {
          type: TestSuggestionKeysEnum.recipes,
          hitsPerPage: 2,
          indexName: 'recipes'
        }
      ]);

      expect(algoliaAPI.queryMultiple).toHaveBeenCalledTimes(1);
      expect(algoliaAPI.queryMultiple).toHaveBeenCalledWith([
        {
          indexName: 'products',
          params: {
            attributesToRetrieve: ['*'],
            distinct: false,
            facets: ['*'],
            filters: '',
            hitsPerPage: 7,
            query: 'some term',
            clickAnalytics: true,
            getRankingInfo: true
          }
        },
        {
          indexName: 'recipes',
          params: {
            attributesToRetrieve: ['*'],
            distinct: false,
            facets: ['*'],
            filters: '',
            hitsPerPage: 2,
            query: 'some term',
            clickAnalytics: true,
            getRankingInfo: true
          }
        }
      ]);
    });
  });
});
