import { Observable } from 'rxjs';
import { ajax as rxAjax, AjaxRequest, AjaxResponse } from 'rxjs/ajax';
import xhr2 from 'xhr2';
import qs from 'qs';

/* istanbul ignore next */
const XHR2: XMLHttpRequest | typeof xhr2 =
  typeof XMLHttpRequest !== 'undefined' ? XMLHttpRequest : xhr2;

export function ajax(options: AjaxRequest): Observable<AjaxResponse> {
  return rxAjax({ createXHR: () => new XHR2(), ...options });
}

export function constructUrl(url: string, query?: object): string {
  const [base, queryParams] = url.split(/\?(.+)/);
  const existingQuery = qs.parse(queryParams || '');

  const newQuery = { ...existingQuery, ...query };
  const queryString = qs.stringify(newQuery, { arrayFormat: 'comma' });

  return `${base}${queryString.length > 0 ? '?' : ''}${queryString}`;
}

export function parseHeaders(headersString: string): Record<string, string> | undefined {
  if (!headersString.trim()) return undefined;
  return headersString
    .trim()
    .split('\r\n')
    .reduce((headerObject, previousValue) => {
      const [name, value] = previousValue.split(': ');
      return { ...headerObject, [name]: value };
    }, {});
}
