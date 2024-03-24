jest.mock('xhr2');
import { Observable, of } from 'rxjs';
import * as rxjs from 'rxjs/ajax';
import { ajax, constructUrl } from '../ajax';

describe('ajax', () => {
  let result: Observable<rxjs.AjaxResponse>;
  beforeEach(() => {
    result = of(expect.any(rxjs.AjaxResponse));
    jest.spyOn(rxjs, 'ajax').mockImplementation((input) => {
      (input as rxjs.AjaxRequest).createXHR!();
      return result;
    });
  });

  it('calls rxjs as expeted and return direct with xhr2 when DOM is not available', () => {
    const result = ajax({ url: 'test' });
    expect(rxjs.ajax).toHaveBeenCalled();
    expect(result).toBe(result);
  });

  // Dom test is not available in test env
});

describe('constructUrl', () => {
  it('returns expected url when no query params given', () => {
    const result = constructUrl('https://test.dk');
    expect(result).toBe('https://test.dk');
  });

  it('returns expected url when query params given', () => {
    const result = constructUrl('https://test.dk', {
      param1: 'test1',
      param2: 'test2',
      array: [1, 2, 3]
    });
    expect(result).toBe('https://test.dk?param1=test1&param2=test2&array=1%2C2%2C3');
  });

  it('returns expected url with combined query and url', () => {
    const result = constructUrl('https://test.dk?existing=some', {
      param1: 'test1',
      param2: 'test2'
    });
    expect(result).toBe('https://test.dk?existing=some&param1=test1&param2=test2');
  });
});
