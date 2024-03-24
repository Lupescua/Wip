import { rxSandbox, RxSandboxInstance } from 'rx-sandbox';
import { RequestHandler } from '../RequestHandler';
import { createMockedBearerAPI } from './mocks';
import * as utils from '../../utils/ajax';
import { merge } from 'rxjs';
import { DataType } from '../../IRequestHandler';

describe('RequestHandler', () => {
  let handler: RequestHandler;
  let scheduler: RxSandboxInstance;

  beforeEach(() => {
    scheduler = rxSandbox.create(true);
    jest.resetAllMocks();
    (jest.spyOn(utils, 'ajax') as jest.Mock).mockImplementation(
      createMockedBearerAPI(scheduler.scheduler)
    );

    handler = new RequestHandler();
  });

  describe('request', () => {
    it('executes requests in parallel with all parameters', () => {
      const { getMessages, e } = scheduler;

      const result$ = handler.request({
        method: 'POST',
        url: 'test1',
        data: { query: 'test 1' },
        query: { something: 'ok1' },
        headers: {
          test: 'test 1'
        },
        responseType: 'json'
      });
      const result2$ = handler.request({
        method: 'POST',
        url: 'test2',
        data: { query: 'test 2' },
        query: { something: 'ok2' },
        headers: {
          test: 'test 2'
        },
        responseType: 'json'
      });

      const combined = merge(result$, result2$);
      const result = getMessages(combined);

      expect(utils.ajax).toHaveBeenCalledTimes(2);
      expect(utils.ajax).toHaveBeenNthCalledWith(1, {
        headers: {
          'content-type': 'application/json; charset=utf-8',
          test: 'test 1'
        },
        method: 'POST',
        url: 'test1?something=ok1',
        body: '{"query":"test 1"}',
        responseType: 'json'
      });
      expect(utils.ajax).toHaveBeenNthCalledWith(2, {
        headers: {
          'content-type': 'application/json; charset=utf-8',
          test: 'test 2'
        },
        method: 'POST',
        url: 'test2?something=ok2',
        body: '{"query":"test 2"}',
        responseType: 'json'
      });
      expect(result).toEqual(
        e('-(ab|)', {
          a: {
            statusCode: 200,
            headers: { header1: 'headerdata1' },
            data: 'request to test1?something=ok1'
          },
          b: {
            statusCode: 200,
            headers: { header1: 'headerdata1' },
            data: 'request to test2?something=ok2'
          }
        })
      );
    });

    it('emits error if request fails', () => {
      const { getMessages, e } = scheduler;

      const result$ = handler.request({ method: 'POST', url: 'fail', headers: {} });

      const result = getMessages(result$);

      expect(utils.ajax).toHaveBeenCalledTimes(1);
      expect(result).toEqual(e('#', null, { status: 400, response: 'bad request' }));
    });

    it.each([[undefined], [DataType.JSON]])(
      'applies json encoding and header when dataType is either json or not provided',
      (dataType?: DataType) => {
        const { getMessages } = scheduler;

        const result$ = handler.request({
          method: 'POST',
          url: 'test1',
          data: { query: 'test 1' },
          query: { something: 'ok1' },
          headers: {
            test: 'test 1'
          },
          responseType: 'json',
          dataType
        });

        getMessages(result$);

        expect(utils.ajax).toHaveBeenCalledWith({
          headers: {
            'content-type': 'application/json; charset=utf-8',
            test: 'test 1'
          },
          method: 'POST',
          url: 'test1?something=ok1',
          body: '{"query":"test 1"}',
          responseType: 'json'
        });
      }
    );

    it('doesnt apply encoding and header when dataType is plain', () => {
      const { getMessages } = scheduler;

      const result$ = handler.request({
        method: 'POST',
        url: 'test1',
        data: 'Something',
        query: { something: 'ok1' },
        headers: {
          test: 'test 1'
        },
        responseType: 'json',
        dataType: DataType.PLAIN
      });

      getMessages(result$);

      expect(utils.ajax).toHaveBeenCalledWith({
        headers: {
          test: 'test 1'
        },
        method: 'POST',
        url: 'test1?something=ok1',
        body: 'Something',
        responseType: 'json'
      });
    });
  });
});
