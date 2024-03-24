/* eslint-disable @typescript-eslint/no-explicit-any */
import { IRequestResult } from '@salling-group/request-handlers';
import { rxSandbox, RxSandboxInstance } from 'rx-sandbox';
import { Observable, of } from 'rxjs';
import { IAlgoliaApi } from '..';
import { AlgoliaBrowseAPI } from '../AlgoliaBrowseAPI';

describe('AlgoliaBrowseAPI', () => {
  let browseAPI: AlgoliaBrowseAPI<
    string,
    { objectID: string },
    { objectID: string },
    string
  >;
  let algoliaAPI: IAlgoliaApi;
  let scheduler: RxSandboxInstance;

  beforeEach(() => {
    scheduler = rxSandbox.create(true);
    jest.resetAllMocks();

    algoliaAPI = { query: jest.fn(), queryMultiple: jest.fn(), browse: jest.fn() };

    browseAPI = new AlgoliaBrowseAPI(algoliaAPI, {
      defaultIndex: 'product_index',
      partialDocumentFields: ['field', 'anotherField'],
      fullDocumentFields: ['*'],
      objectIdKey: 'someKey',
      sortings: { price_asc: 'PROD_HD_PRODUCTS_ASC' }
    });

    const pagedResponse = (
      cursor: string | undefined,
      id: string
    ): (() => Observable<IRequestResult<any>>) => {
      return () => {
        return of({
          statusCode: 200,
          data: {
            hits: [{ objectID: id }],
            nbHits: 2,
            cursor,
            nbPages: 3,
            hitsPerPage: 50,
            exhaustiveNbHits: true,
            query: 'a query',
            params: `query=*`,
            facets: {}
          }
        });
      };
    };

    algoliaAPI.browse = jest
      .fn()
      .mockImplementationOnce(pagedResponse('abc', '1'))
      .mockImplementationOnce(pagedResponse('abcd', '2'))
      .mockImplementationOnce(pagedResponse(undefined, '3'));
  });

  describe('getAllPaths', () => {
    it('should call the endpoint for N pages', () => {
      const { getMessages, e } = scheduler;

      const result = getMessages(browseAPI.getAllPaths((doc) => doc.objectID));

      expect(algoliaAPI.browse).toHaveBeenCalledTimes(4);
      rxSandbox.marbleAssert(result).to.equal(e('(abc|)', { a: '1', b: '2', c: '3' }));
    });
  });
});
