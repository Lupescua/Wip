import { rxSandbox, RxSandboxInstance } from 'rx-sandbox';
import { of } from 'rxjs';
import { IAlgoliaApi } from '../AlgoliaApi';
import { AlgoliaSearchAPI } from '../AlgoliaSearchAPI';
import { IPagedCollection } from '@salling-group/core';
import { IAlgoliaFacet } from '../types/Facet';
import { IAlgoliaSearchResult } from '../types/Result';

interface IDocumentMock {
  objectID: string;
}

describe('Algolia Search API', () => {
  let searchAPI: AlgoliaSearchAPI<string, IDocumentMock, IDocumentMock, string>;
  let algoliaAPI: IAlgoliaApi;
  let scheduler: RxSandboxInstance;

  let defaultResult: IPagedCollection<IDocumentMock, number, IAlgoliaFacet, string>;
  let mockResultData: IAlgoliaSearchResult<IDocumentMock>;

  beforeEach(() => {
    scheduler = rxSandbox.create(true);
    jest.resetAllMocks();

    algoliaAPI = {
      query: jest.fn(),
      queryMultiple: jest.fn(),
      browse: jest.fn()
    };
    const filterValue = encodeURIComponent(
      '("facet1":"value1" OR "facet1":"value2") AND ("facet2":"value1")'
    );
    mockResultData = {
      index: 'index',
      hits: [{ objectID: '1' }, { objectID: '2' }],
      nbHits: 2,
      page: 0,
      nbPages: 1,
      hitsPerPage: 50,
      exhaustiveNbHits: true,
      query: 'a query',
      params: `query=*&attributesToRetrieve=%5B%22objectID%22%2C%22mainGTIN%22%2C%22name%22%2C%22nameURL%22%2C%22images%22%2C%22compareUoM%22%2C%22comparePrice%22%2C%22compareNormalPrice%22%2C%22inStock%22%2C%22productUnit%22%2C%22normalPrice%22%2C%22salesPrice%22%2C%22salesUnit%22%2C%22salesUoM%22%2C%22plusDeposit%22%2C%22productUoM%22%2C%22subBranding%22%2C%22targetBrand%22%2C%22attributes%22%2C%22isOnOffer%22%2C%22promoMessage%22%2C%22multiPromo%22%2C%22promoSplashLabel%22%2C%22promoSplashStyle%22%2C%22productSpecification%22%2C%22salesRules%22%2C%22ATS%22%2C%22productNotification%22%2C%22productNotificationSubHeader%22%5D&filters=${filterValue}&page=0&hitsPerPage=50&facets=%5B%22*%22%5D`,
      facets: {
        facet1: {
          value1: 2,
          value2: 4
        },
        facet2: {
          value1: 2,
          value2: 4
        }
      }
    };

    searchAPI = new AlgoliaSearchAPI(algoliaAPI, {
      defaultIndex: 'product_index',
      partialDocumentFields: ['field', 'anotherField'],
      fullDocumentFields: ['*'],
      objectIdKey: 'someKey',
      sortings: { price_asc: 'PROD_HD_PRODUCTS_ASC' }
    });
    algoliaAPI.query = jest.fn().mockImplementation(() =>
      of({
        statusCode: 200,
        data: mockResultData
      })
    );
    algoliaAPI.queryMultiple = jest
      .fn()
      .mockImplementation(() =>
        of({ statusCode: 123, data: { results: [mockResultData] } })
      );
    defaultResult = {
      query: 'a query',
      page: 0,
      activeSorting: undefined,
      id: undefined,
      facets: [
        {
          id: 'facet1',
          name: 'facet1',
          selected: true,
          values: [
            {
              id: 'facet1.value1',
              count: 2,
              filterString: '("facet1":"value2") AND ("facet2":"value1")',
              name: 'value1',
              selected: true
            },
            {
              id: 'facet1.value2',
              count: 4,
              filterString: '("facet1":"value1") AND ("facet2":"value1")',
              name: 'value2',
              selected: true
            }
          ]
        },
        {
          id: 'facet2',
          name: 'facet2',
          selected: true,
          values: [
            {
              id: 'facet2.value1',
              count: 2,
              filterString: '("facet1":"value1" OR "facet1":"value2")',
              name: 'value1',
              selected: true
            },
            {
              id: 'facet2.value2',
              count: 4,
              filterString:
                '("facet1":"value1" OR "facet1":"value2") AND ("facet2":"value1" OR "facet2":"value2")',
              name: 'value2',
              selected: false
            }
          ]
        }
      ],
      sortings: ['price_asc'],
      documents: [{ objectID: '1' }, { objectID: '2' }],
      numberOfHits: 2,
      numberOfPages: 1,
      calculateNextPage: expect.any(Function),
      calculatePrevPage: expect.any(Function),
      hitsPerPage: 50
    };
  });

  describe('search', () => {
    it('should call algoliaAPi.queryMultiple with a request for each facet group that is being filtered on plus the original request', () => {
      const { getMessages, e } = scheduler;
      algoliaAPI.queryMultiple = jest.fn().mockImplementation(() =>
        of({
          statusCode: 123,
          data: {
            results: [
              {
                ...mockResultData,
                facets: { facet1: { value1: 0, value2: 0 }, facet2: { value1: 2 } }
              },
              {
                index: 'index',
                hits: [],
                nbHits: 6,
                page: 0,
                nbPages: 1,
                hitsPerPage: 0,
                query: 'MOCK_PARAMS1..',
                facets: {
                  facet1: {
                    value1: 1,
                    value2: 2
                  }
                }
              },
              {
                index: 'index',
                hits: [],
                nbHits: 6,
                page: 0,
                nbPages: 1,
                hitsPerPage: 0,
                query: 'MOCK_PARAMS2..',
                facets: {
                  facet2: {
                    value1: 2,
                    value2: 4
                  }
                }
              }
            ]
          }
        })
      );

      const result$ = searchAPI.search(
        'someString',
        '("facet1":"value1" OR "facet1":"value2") AND ("facet2":"value1")',
        1,
        2,
        'price_asc',
        ['facet1', 'facet2'],
        undefined,
        undefined,
        undefined,
        '"staticFacet":"staticFacetValue"'
      );
      const result = getMessages(result$);

      expect(algoliaAPI.queryMultiple).toHaveBeenCalledWith([
        {
          indexName: 'PROD_HD_PRODUCTS_ASC',
          params: expect.objectContaining({
            analyticsTags: [],
            attributesToRetrieve: ['field', 'anotherField'],
            clickAnalytics: true,
            facets: ['facet1', 'facet2'],
            filters:
              '("facet1":"value1" OR "facet1":"value2") AND ("facet2":"value1") AND "staticFacet":"staticFacetValue"',
            hitsPerPage: 2,
            page: 1,
            query: 'someString',
            userToken: '',
            getRankingInfo: false
          })
        },
        {
          indexName: 'PROD_HD_PRODUCTS_ASC',
          params: expect.objectContaining({
            analytics: false,
            clickAnalytics: false,
            facets: ['facet1'],
            filters: '("facet2":"value1") AND "staticFacet":"staticFacetValue"',
            hitsPerPage: 0,
            page: 0,
            getRankingInfo: false
          })
        },
        {
          indexName: 'PROD_HD_PRODUCTS_ASC',
          params: expect.objectContaining({
            analytics: false,
            clickAnalytics: false,
            facets: ['facet2'],
            filters:
              '("facet1":"value1" OR "facet1":"value2") AND "staticFacet":"staticFacetValue"',
            hitsPerPage: 0,
            page: 0,
            getRankingInfo: false
          })
        }
      ]);

      expect(result).toEqual(
        e('(a|)', {
          a: {
            activeSorting: undefined,
            calculateNextPage: expect.any(Function),
            calculatePrevPage: expect.any(Function),
            cursor: undefined,
            page: 0,
            documents: [
              {
                objectID: '1'
              },
              {
                objectID: '2'
              }
            ],
            facets: [
              {
                id: 'facet1',
                name: 'facet1',
                selected: true,
                values: [
                  {
                    count: 1,
                    filterString: '("facet1":"value2") AND ("facet2":"value1")',
                    id: 'facet1.value1',
                    name: 'value1',
                    selected: true
                  },
                  {
                    count: 2,
                    filterString: '("facet1":"value1") AND ("facet2":"value1")',
                    id: 'facet1.value2',
                    name: 'value2',
                    selected: true
                  }
                ]
              },
              {
                id: 'facet2',
                name: 'facet2',
                selected: true,
                values: [
                  {
                    count: 2,
                    filterString: '("facet1":"value1" OR "facet1":"value2")',
                    id: 'facet2.value1',
                    name: 'value1',
                    selected: true
                  },
                  {
                    count: 4,
                    filterString:
                      '("facet1":"value1" OR "facet1":"value2") AND ("facet2":"value1" OR "facet2":"value2")',
                    id: 'facet2.value2',
                    name: 'value2',
                    selected: false
                  }
                ]
              }
            ],
            hitsPerPage: 50,
            id: undefined,
            numberOfHits: 2,
            numberOfPages: 1,
            query: 'a query',
            sortings: ['price_asc']
          }
        })
      );
    });

    it('should include facets with numeric stats properties if facet stats are present in the response', () => {
      const { getMessages, e } = scheduler;

      algoliaAPI.queryMultiple = jest.fn().mockImplementation(() =>
        of({
          statusCode: 123,
          data: {
            results: [
              {
                ...mockResultData,
                facets: { facet1: { value1: 0, value2: 0 }, facet2: { value1: 2 } },
                facets_stats: {
                  facet2: {
                    min: 50,
                    max: 60
                  }
                }
              },
              {
                facets: {
                  facet1: {
                    value1: 1,
                    value2: 2
                  }
                }
              },
              {
                facets: {
                  facet2: {
                    value1: 2,
                    value2: 4
                  }
                },
                facets_stats: {
                  facet2: {
                    min: 10,
                    max: 100
                  }
                }
              }
            ]
          }
        })
      );

      const result$ = searchAPI.search(
        'someString',
        '("facet1":"value1" OR "facet1":"value2") AND ("facet2":"value1")',
        1,
        2,
        'price_asc',
        ['facet1', 'facet2']
      );

      const result = getMessages(result$);

      expect(algoliaAPI.queryMultiple).toHaveBeenCalledWith([
        {
          indexName: 'PROD_HD_PRODUCTS_ASC',
          params: expect.objectContaining({
            analyticsTags: [],
            attributesToRetrieve: ['field', 'anotherField'],
            clickAnalytics: true,
            facets: ['facet1', 'facet2'],
            filters: '("facet1":"value1" OR "facet1":"value2") AND ("facet2":"value1")',
            hitsPerPage: 2,
            page: 1,
            query: 'someString',
            userToken: '',
            getRankingInfo: false
          })
        },
        {
          indexName: 'PROD_HD_PRODUCTS_ASC',
          params: expect.objectContaining({
            analytics: false,
            clickAnalytics: false,
            facets: ['facet1'],
            filters: '("facet2":"value1")',
            hitsPerPage: 0,
            page: 0,
            getRankingInfo: false
          })
        },
        {
          indexName: 'PROD_HD_PRODUCTS_ASC',
          params: expect.objectContaining({
            analytics: false,
            clickAnalytics: false,
            facets: ['facet2'],
            filters: '("facet1":"value1" OR "facet1":"value2")',
            hitsPerPage: 0,
            page: 0,
            getRankingInfo: false
          })
        }
      ]);

      expect(result).toEqual(
        e('(a|)', {
          a: {
            activeSorting: undefined,
            calculateNextPage: expect.any(Function),
            calculatePrevPage: expect.any(Function),
            cursor: undefined,
            page: 0,
            documents: [
              {
                objectID: '1'
              },
              {
                objectID: '2'
              }
            ],
            facets: [
              {
                id: 'facet1',
                name: 'facet1',
                selected: true,
                numericRange: undefined,
                values: [
                  {
                    count: 1,
                    filterString: '("facet1":"value2") AND ("facet2":"value1")',
                    id: 'facet1.value1',
                    name: 'value1',
                    selected: true
                  },
                  {
                    count: 2,
                    filterString: '("facet1":"value1") AND ("facet2":"value1")',
                    id: 'facet1.value2',
                    name: 'value2',
                    selected: true
                  }
                ]
              },
              {
                id: 'facet2',
                name: 'facet2',
                selected: true,
                numericRange: {
                  selected: false,
                  filterString: expect.any(Function),
                  min: 10,
                  max: 100,
                  setMin: 50,
                  setMax: 60
                },
                values: [
                  {
                    count: 2,
                    filterString: '("facet1":"value1" OR "facet1":"value2")',
                    id: 'facet2.value1',
                    name: 'value1',
                    selected: true
                  },
                  {
                    count: 4,
                    filterString:
                      '("facet1":"value1" OR "facet1":"value2") AND ("facet2":"value1" OR "facet2":"value2")',
                    id: 'facet2.value2',
                    name: 'value2',
                    selected: false
                  }
                ]
              }
            ],

            hitsPerPage: 50,
            id: undefined,
            numberOfHits: 2,
            numberOfPages: 1,
            query: 'a query',
            sortings: ['price_asc']
          }
        })
      );
    });

    it('should call the algoliaAPi correctly with default parameters and return a paged Collection', () => {
      (defaultResult as IPagedCollection<IDocumentMock, number, IAlgoliaFacet, string> & {
        cursor: undefined;
      }).cursor = undefined;

      const { getMessages, e } = scheduler;

      const result$ = searchAPI.search('someString');

      const result = getMessages(result$);

      expect(algoliaAPI.query).toHaveBeenCalledWith('product_index', {
        query: 'someString',
        attributesToRetrieve: ['field', 'anotherField'],
        facetFilters: undefined,
        distinct: undefined,
        facetingAfterDistinct: undefined,
        facets: [],
        filters: undefined,
        page: 0,
        hitsPerPage: 50,
        clickAnalytics: true,
        analyticsTags: [],
        userToken: '',
        getRankingInfo: false
      });

      expect(result).toEqual(
        e('(a|)', {
          a: defaultResult
        })
      );
    });

    it('should calculate the next page base on history of fetched pages', async () => {
      mockResultData.nbPages = 2;

      const result$ = await searchAPI.search('someString', undefined, 0).toPromise();

      expect(result$.calculateNextPage([0])).toBe(1);
    });

    it('calculateNextPage should return undefined if there is no next page to fetch', async () => {
      const result$ = await searchAPI.search('someString', undefined, 0).toPromise();

      expect(result$.calculateNextPage([0])).toBe(undefined);
    });

    it('should calculate the prev page base on the history of fetched pages', async () => {
      mockResultData.nbPages = 2;

      const result$ = await searchAPI.search('someString', undefined, 0).toPromise();

      expect(result$.calculatePrevPage([1])).toBe(0);
    });

    it('calculePrevPage should return undefined if there is no prev page to fetch', async () => {
      const result$ = await searchAPI.search('someString', undefined, 0).toPromise();

      expect(result$.calculatePrevPage([0])).toBe(undefined);
    });

    it('should call the algoliaAPi correctly using the given parameters and return a paged Collection', () => {
      const { getMessages, e } = scheduler;

      algoliaAPI.queryMultiple = jest.fn().mockImplementation(() => {
        return of({
          statusCode: 200,
          data: {
            results: [
              {
                hits: [{ objectID: '1' }, { objectID: '2' }],
                nbHits: 4,
                page: 1,
                nbPages: 4,
                hitsPerPage: 2,
                exhaustiveNbHits: 1000,
                query: '',
                params: '',
                index: 'PROD_HD_PRODUCTS_ASC'
              }
            ]
          }
        });
      });

      const result$ = searchAPI.search('someString', 'someFacet', 1, 2, 'price_asc', [
        '*'
      ]);

      const result = getMessages(result$);

      expect(algoliaAPI.queryMultiple).toHaveBeenCalledWith([
        {
          indexName: 'PROD_HD_PRODUCTS_ASC',
          params: {
            analyticsTags: [],
            attributesToRetrieve: ['field', 'anotherField'],
            clickAnalytics: true,
            facets: ['*'],
            filters: 'someFacet',
            hitsPerPage: 2,
            page: 1,
            query: 'someString',
            userToken: '',
            distinct: undefined,
            facetingAfterDistinct: undefined,
            getRankingInfo: false
          }
        }
      ]);

      expect(result).toEqual(
        e('(a|)', {
          a: {
            facets: [],
            sortings: ['price_asc'],
            activeSorting: 'price_asc',
            documents: [{ objectID: '1' }, { objectID: '2' }],
            calculateNextPage: expect.any(Function),
            calculatePrevPage: expect.any(Function),
            numberOfHits: 4,
            numberOfPages: 4,
            id: undefined,
            page: 1,
            cursor: undefined,
            hitsPerPage: 2,
            query: ''
          }
        })
      );
    });

    it('Should add userToken when userToken of config is an Observable with a value', () => {
      searchAPI = new AlgoliaSearchAPI(algoliaAPI, {
        defaultIndex: 'product_index',
        partialDocumentFields: ['field', 'anotherField'],
        fullDocumentFields: ['*'],
        objectIdKey: 'someKey',
        userToken: of('Some user token')
      });
      const { getMessages } = scheduler;

      const result$ = searchAPI.search('someString');
      getMessages(result$);

      expect(algoliaAPI.query).toHaveBeenCalledWith(
        'product_index',
        expect.objectContaining({
          userToken: 'Some user token'
        })
      );
    });
  });

  describe('searchByIds', () => {
    it('should call the algoliaAPi correctly with a filter set and return a paged Collection', () => {
      const { getMessages, e } = scheduler;

      const result$ = searchAPI.searchByIds(['id1', 'id2']);
      const result = getMessages(result$);

      expect(algoliaAPI.queryMultiple).toHaveBeenCalledWith([
        {
          indexName: 'product_index',
          params: {
            attributesToRetrieve: ['field', 'anotherField'],
            filters: 'someKey:id1 OR someKey:id2',
            facetFilters: undefined,
            page: 0,
            hitsPerPage: 50,
            facets: [],
            clickAnalytics: true,
            analyticsTags: [],
            userToken: '',
            getRankingInfo: false
          }
        }
      ]);

      expect(result).toEqual(
        e('(a|)', {
          a: defaultResult
        })
      );
    });

    it('should call the algoliaAPi by combining the filter with ids correctly with a filter set and return a paged Collection', () => {
      const { getMessages, e } = scheduler;

      const result$ = searchAPI.searchByIds(['id1', 'id2'], 'testAttribute:true');
      const result = getMessages(result$);

      expect(algoliaAPI.queryMultiple).toHaveBeenCalledWith([
        {
          indexName: 'product_index',
          params: {
            attributesToRetrieve: ['field', 'anotherField'],
            filters: 'someKey:id1 OR someKey:id2 AND testAttribute:true',
            facetFilters: undefined,
            page: 0,
            hitsPerPage: 50,
            facets: [],
            clickAnalytics: true,
            analyticsTags: [],
            userToken: '',
            getRankingInfo: false
          }
        }
      ]);

      expect(result).toEqual(
        e('(a|)', {
          a: defaultResult
        })
      );
    });
  });

  describe('findByIds', () => {
    it('should call the algoliaAPi correctly with a filter set and return a paged Collection', () => {
      const { getMessages, e } = scheduler;

      const result$ = searchAPI.findByIds(['id1', 'id2']);

      const result = getMessages(result$);

      expect(algoliaAPI.queryMultiple).toHaveBeenCalledWith([
        {
          indexName: 'product_index',
          params: {
            attributesToRetrieve: ['field', 'anotherField'],
            filters: 'someKey:id1 OR someKey:id2',
            getRankingInfo: false
          }
        }
      ]);

      expect(result).toEqual(
        e('(a|)', {
          a: defaultResult
        })
      );
    });
  });

  describe('findByIdsFull', () => {
    it('should call the algoliaAPi correctly with a filter set and return a paged Collection of full documents', () => {
      const { getMessages, e } = scheduler;

      const result$ = searchAPI.findByIdsFull(['id1', 'id2']);

      const result = getMessages(result$);

      expect(algoliaAPI.queryMultiple).toHaveBeenCalledWith([
        {
          indexName: 'product_index',
          params: {
            attributesToRetrieve: ['*'],
            filters: 'someKey:id1 OR someKey:id2',
            getRankingInfo: false
          }
        }
      ]);

      expect(result).toEqual(
        e('(a|)', {
          a: defaultResult
        })
      );
    });
  });

  describe('findByIdFull', () => {
    it('should call the algoliaAPi correctly with a filter set and return a paged Collection of full documents', () => {
      const { getMessages, e } = scheduler;

      const result$ = searchAPI.findByIdFull('id1');

      const result = getMessages(result$);

      expect(algoliaAPI.queryMultiple).toHaveBeenCalledWith([
        {
          indexName: 'product_index',
          params: {
            attributesToRetrieve: ['*'],
            filters: 'someKey:id1',
            getRankingInfo: false
          }
        }
      ]);

      expect(result).toEqual(
        e('(a|)', {
          a: defaultResult
        })
      );
    });
  });
});
