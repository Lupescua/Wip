import {
  IAlgoliaTrackingEvent,
  IAlgoliaTrackingResult
} from '@salling-group/algolia-api';
import { IRequestResult } from '@salling-group/request-handlers';
import { rxSandbox, RxSandboxInstance } from 'rx-sandbox';
import { Observable, of } from 'rxjs';
import { AlgoliaTracker } from '..';

interface IAlgoliaDocumentExtension {
  objectId: string;
}

describe('AlgoliaTracker', () => {
  let scheduler: RxSandboxInstance;
  let tracker: AlgoliaTracker<IAlgoliaDocumentExtension, IAlgoliaDocumentExtension>;

  let getUserId: () => Observable<string>;
  let trackEvents: (
    events: IAlgoliaTrackingEvent[]
  ) => Observable<IRequestResult<IAlgoliaTrackingResult>>;

  beforeEach(() => {
    scheduler = rxSandbox.create(true);

    getUserId = jest.fn(() => of('userId'));
    trackEvents = jest.fn(() =>
      of({ statusCode: 200, data: { message: 'OK', status: 200 } })
    );

    tracker = new AlgoliaTracker({
      getUserId,
      trackEvents,
      getProductObjectId: ({ objectId }) => objectId
    });
  });

  describe('productClicked', () => {
    it('calls given endpoint with expected payload', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.productClicked({
        sorting: 'asdf',
        search: {
          searchId: 'qwerty'
        },
        page: 'FRONTPAGE',
        listName: 'some list name',
        product: {
          id: 'id',
          priceIncludingVat: 200,
          inStock: 1,
          positionZeroIndexed: 0,
          quantity: 2,
          objectId: 'obj1'
        }
      });

      getMessages(action$);

      expect(trackEvents).toHaveBeenCalledWith([
        {
          eventName: 'Product Clicked > FRONTPAGE',
          eventType: 'click',
          index: 'asdf',
          objectIDs: ['obj1'],
          positions: [1],
          queryID: 'qwerty',
          userToken: 'userId'
        }
      ]);
    });

    it('does not call given endpoint with unexpected payload', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.productClicked({
        sorting: '',
        page: 'FRONTPAGE',
        listName: 'some list name',
        product: {
          id: 'id',
          priceIncludingVat: 200,
          inStock: 1,
          positionZeroIndexed: 1,
          quantity: 2,
          objectId: 'obj1'
        }
      });

      getMessages(action$);

      expect(trackEvents).not.toHaveBeenCalled();
    });
  });

  describe('pdpViewed', () => {
    it('calls given endpoint with expected payload', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.pdpViewed({
        index: 'asdf',
        product: {
          id: 'id',
          priceIncludingVat: 200,
          inStock: 1,
          objectId: 'obj1'
        }
      });

      getMessages(action$);

      expect(trackEvents).toHaveBeenCalledWith([
        {
          eventName: 'Product Viewed > PDP',
          eventType: 'view',
          index: 'asdf',
          objectIDs: ['obj1'],
          userToken: 'userId'
        }
      ]);
    });

    it('does not call given endpoint with unexpected payload', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.pdpViewed({
        index: '',
        product: {
          id: 'id',
          priceIncludingVat: 200,
          inStock: 1,
          objectId: 'obj1'
        }
      });

      getMessages(action$);

      expect(trackEvents).not.toHaveBeenCalled();
    });
  });

  describe('addedToBasket', () => {
    it('calls given endpoint with expected payload', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.addedToBasket({
        sorting: 'asdf',
        search: {
          searchId: 'qwerty'
        },
        page: 'CATEGORY',
        products: [
          {
            id: 'id',
            priceIncludingVat: 200,
            inStock: 1,
            objectId: 'obj1'
          }
        ]
      });

      getMessages(action$);

      expect(trackEvents).toHaveBeenCalledWith([
        {
          eventName: 'Product Added To Basket > CATEGORY',
          eventType: 'conversion',
          index: 'asdf',
          objectIDs: ['obj1'],
          queryID: 'qwerty',
          userToken: 'userId'
        }
      ]);
    });

    it('does not call given endpoint with unexpected payload', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.addedToBasket({
        sorting: '',
        page: 'CATEGORY',
        products: [
          {
            id: 'id',
            priceIncludingVat: 200,
            inStock: 1,
            objectId: 'obj1'
          }
        ]
      });

      getMessages(action$);

      expect(trackEvents).not.toHaveBeenCalled();
    });
  });

  describe('filtersViewed', () => {
    it('calls given endpoint with expected payload', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.filtersViewed({
        indexName: 'asdf',
        page: 'SEARCH',
        filters: [{ key: 'inStock', value: '1' }]
      });

      getMessages(action$);

      expect(trackEvents).toHaveBeenCalledWith([
        {
          eventName: 'Filters Viewed > SEARCH',
          eventType: 'view',
          index: 'asdf',
          userToken: 'userId',
          filters: ['inStock:1']
        }
      ]);
    });

    it('does not call given endpoint with unexpected payload', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.filtersViewed({
        indexName: 'asdf',
        page: 'SEARCH',
        filters: []
      });

      getMessages(action$);

      expect(trackEvents).not.toHaveBeenCalled();
    });
  });

  describe('filtersClicked', () => {
    it('calls given endpoint with expected payload', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.filtersClicked({
        indexName: 'asdf',
        action: 'Added',
        page: 'SEARCH',
        filters: [{ key: 'brand', value: 'lego' }]
      });

      getMessages(action$);

      expect(trackEvents).toHaveBeenCalledWith([
        {
          eventName: 'Filters Clicked > SEARCH > Added',
          eventType: 'click',
          index: 'asdf',
          userToken: 'userId',
          filters: ['brand:lego']
        }
      ]);
    });

    it('does not call given endpoint with unexpected payload', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.filtersClicked({
        indexName: 'asdf',
        action: 'Added',
        page: 'SEARCH',
        filters: []
      });

      getMessages(action$);

      expect(trackEvents).not.toHaveBeenCalled();
    });
  });

  describe('recipeClicked', () => {
    it('calls given endpoint with expected payload', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.recipeClicked({
        recipe: {
          objectId: 'obj1',
          greenRanking: 1,
          id: 'id',
          name: 'name',
          prepTime: '1h',
          priceRange: '100-200'
        },
        page: 'FRONTPAGE',
        sorting: 'index'
      });

      getMessages(action$);

      expect(trackEvents).toHaveBeenCalledWith([
        {
          eventName: 'Recipe Clicked > FRONTPAGE',
          eventType: 'click',
          index: 'index',
          objectIDs: ['id'],
          userToken: 'userId'
        }
      ]);
    });

    it('does not call given endpoint with unexpected payload', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.recipeClicked({
        recipe: {
          objectId: 'obj1',
          greenRanking: 1,
          id: 'id',
          name: 'name',
          prepTime: '1h',
          priceRange: '100-200'
        },
        page: 'FRONTPAGE'
      });

      getMessages(action$);

      expect(trackEvents).not.toHaveBeenCalled();
    });
  });
});
