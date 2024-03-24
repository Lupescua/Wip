/* eslint-disable @typescript-eslint/no-explicit-any */
import { defer, Observable, throwError } from 'rxjs';
import { AjaxError } from 'rxjs/ajax';
import { ajax, constructUrl, parseHeaders } from '../utils/ajax';
import { catchError, map, take } from 'rxjs/operators';
import {
  DataType,
  IRequest,
  IRequestError,
  IRequestHandler,
  IRequestResult
} from '../IRequestHandler';

const dataEncoders: Record<DataType, (input: any) => any> = {
  [DataType.PLAIN]: (input) => input,
  [DataType.JSON]: (input) => JSON.stringify(input)
};

const dataContentTypeHeaders: Record<DataType, string | undefined> = {
  [DataType.PLAIN]: undefined,
  [DataType.JSON]: 'application/json; charset=utf-8'
};

/**
 * @public
 */
export class RequestHandler implements IRequestHandler {
  public request<TData>({
    url,
    query,
    method,
    headers,
    data,
    responseType = 'json',
    dataType = DataType.JSON
  }: IRequest): Observable<IRequestResult<TData>> {
    const contentTypeHeader =
      data && dataContentTypeHeaders[dataType]
        ? { 'content-type': dataContentTypeHeaders[dataType] }
        : undefined;
    return defer(() =>
      ajax({
        url: constructUrl(url, query),
        method: method,
        headers: (contentTypeHeader || headers) && { ...contentTypeHeader, ...headers },
        body: dataEncoders[dataType](data),
        responseType
      }).pipe(
        map((response) => ({
          data: response.response,
          headers: parseHeaders(response.xhr.getAllResponseHeaders()),
          statusCode: response.status
        })),
        catchError((err: AjaxError) => {
          return throwError({
            response: err.response,
            status: err.status
          } as IRequestError<unknown>);
        }),
        take(1)
      )
    );
  }
}
