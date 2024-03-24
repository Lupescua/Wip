import { Observable } from 'rxjs';

/**
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSelector<T, A extends any[]>(
  selector: Observable<(...args: A) => T>
): (...args: A) => T {
  const mockFn = jest.fn();
  return (...args: A) => {
    mockFn.mockImplementation((fn) => fn(...args));
    selector.subscribe(mockFn);
    return mockFn.mock.results[mockFn.mock.results.length - 1].value;
  };
}
