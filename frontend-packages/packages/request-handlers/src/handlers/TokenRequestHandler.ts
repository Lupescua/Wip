import { from, NEVER, Observable, throwError } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';
import { IRequest, IRequestError, IRequestResult } from '../IRequestHandler';
import { ITokenSource, TokenSignals } from '../ITokenSource';
import { RequestHandler } from './RequestHandler';

/**
 * @public
 */
export interface ITokenRequestHandlerConfig<TToken> {
  token: ITokenSource<TToken>;
  applyToken: (request: IRequest, token: TToken) => IRequest;
}
/**
 * @public
 */
export class TokenRequestHandler<TToken> extends RequestHandler {
  private _config: ITokenRequestHandlerConfig<TToken>;

  public constructor(config: ITokenRequestHandlerConfig<TToken>) {
    super();
    this._config = config;
  }

  public request<TData>(request: IRequest): Observable<IRequestResult<TData>> {
    return from(this._config.token.get()).pipe(
      switchMap((token) => {
        if (token === TokenSignals.EMPTY)
          return throwError({
            status: 401,
            response: 'No token available'
          } as IRequestError<unknown>);

        if (token === TokenSignals.WAIT) return NEVER;

        return super.request<TData>(this._config.applyToken(request, token)).pipe(
          catchError((err: IRequestError<unknown>) => {
            if (err.status === 401) {
              this._config.token.invalidate(err);
              return NEVER;
            }
            // Catch request error here
            return throwError(err);
          })
        );
      }),
      catchError((err: IRequestError<unknown>) => {
        // Catch final error here, both from request and token
        return throwError(err);
      }),
      take(1)
    );
  }
}
