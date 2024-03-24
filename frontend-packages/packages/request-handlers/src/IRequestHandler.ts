import { Observable } from 'rxjs';

/**
 * @public
 */
export interface IRequestResult<TData> {
  statusCode: number;
  headers?: Record<string, string>;
  data: TData;
}

/**
 * @public
 */
export interface IRequestError<TError> {
  status: number;
  response: TError;
}

/**
 * @public
 */
export enum DataType {
  /* If keyValue pair is provided, browser will automatically make it formData */
  PLAIN = 'plain',
  /* Will JSON.stringify object and add application/json to request header */
  JSON = 'json'
}

/**
 * @public
 */
export interface IRequest<TData = unknown> {
  url: string;
  method: 'PUT' | 'POST' | 'GET' | 'DELETE' | 'PATCH';
  data?: TData;
  /* @defaultValue `DataType.JSON` */
  dataType?: DataType;
  headers?: Record<string, string>;
  query?: object;
  responseType?: XMLHttpRequestResponseType;
}

/**
 * @public
 */
export interface IRequestHandler {
  request<TData>(request: IRequest): Observable<IRequestResult<TData>>;
}
