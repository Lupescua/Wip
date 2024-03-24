import { IRequestHandler } from '@salling-group/request-handlers';
import { rxSandbox, RxSandboxInstance } from 'rx-sandbox';
import { of } from 'rxjs';
import {
  AlgoliaInsightsAPI,
  IAlgoliaInsightsAPI,
  IAlgoliaTrackingEvent
} from '../AlgoliaInsightsAPI';

describe('AlgoliaInsightsApi', () => {
  let algoliaInsightsApi: IAlgoliaInsightsAPI;
  let scheduler: RxSandboxInstance;
  let requestHandler: IRequestHandler;

  beforeEach(() => {
    scheduler = rxSandbox.create(true);
    jest.resetAllMocks();

    requestHandler = { request: jest.fn() };

    algoliaInsightsApi = new AlgoliaInsightsAPI(requestHandler, {
      applicationId: 'myApp',
      apiKey: 'key',
      baseURL: 'https://insights.algolia.io/1/events'
    });
  });

  describe('track', () => {
    const event: IAlgoliaTrackingEvent = {
      eventName: 'Product Clicked',
      eventType: 'click',
      index: '123',
      objectIDs: ['987'],
      positions: [12],
      queryID: 'preprod',
      userToken: 'long-string-with-numbers-8965'
    };

    it('should execute a single call when called correctly', () => {
      const { getMessages, e } = scheduler;

      requestHandler.request = jest
        .fn()
        .mockImplementation(() => of({ statusCode: 200, message: 'OK' }));

      const result$ = algoliaInsightsApi.track([event]);

      const result = getMessages(result$);

      expect(requestHandler.request).toHaveBeenCalledWith({
        headers: {
          'X-Algolia-API-Key': 'key',
          'X-Algolia-Application-Id': 'myApp'
        },
        method: 'POST',
        url: 'https://insights.algolia.io/1/events',
        data: {
          events: [event]
        }
      });

      expect(result).toEqual(e('(a|)', { a: { statusCode: 200, message: 'OK' } }));
    });
  });
});
