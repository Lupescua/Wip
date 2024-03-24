import {
  BehaviorSubject,
  defer,
  from,
  merge,
  NEVER,
  Observable,
  of,
  throwError
} from 'rxjs';
import { AjaxError, AjaxRequest, AjaxResponse } from 'rxjs/ajax';
import {
  catchError,
  distinctUntilChanged,
  map,
  shareReplay,
  switchMap,
  tap,
  retry
} from 'rxjs/operators';
import { ajax } from '../utils/ajax';
import { ITokenSource, OptionalToken, TokenSignals } from '../ITokenSource';

/**
 * @public
 */
export interface IRefreshableTokenConfig<TToken, TRefreshToken> {
  refreshToken: ITokenSource<TRefreshToken>;
  refreshRequest: (refreshToken: OptionalToken<TRefreshToken>) => AjaxRequest;
  mapAccessToken: (response: AjaxResponse) => OptionalToken<TToken>;
  retryCount?: number;
}

/**
 * @public
 */
export class RefreshableToken<TToken, TRefreshToken> implements ITokenSource<TToken> {
  private _config: IRefreshableTokenConfig<TToken, TRefreshToken>;
  private _token$: BehaviorSubject<OptionalToken<TToken>>;
  private _tokenValidator$: Observable<OptionalToken<TToken>>;

  public constructor(config: IRefreshableTokenConfig<TToken, TRefreshToken>) {
    this._config = config;
    this._token$ = new BehaviorSubject<OptionalToken<TToken>>(TokenSignals.EMPTY);
    this._tokenValidator$ = this._createValidator();
  }

  public readonly(): Observable<TToken | TokenSignals.EMPTY> {
    return this._token$.pipe(
      switchMap((token) => {
        if (token === TokenSignals.WAIT) return NEVER;
        return of(token);
      })
    );
  }

  public get(): Observable<OptionalToken<TToken>> {
    return this._tokenValidator$;
  }

  public set(token: OptionalToken<TToken>): void {
    this._token$.next(token);
  }

  public invalidate(err: unknown): void {
    this.set(TokenSignals.EMPTY);
  }

  private _createValidator(): Observable<OptionalToken<TToken>> {
    return this._token$.pipe(
      distinctUntilChanged(),
      switchMap((token) => {
        if (!token) {
          // Call authenticator
          return defer(() =>
            merge(
              of(TokenSignals.WAIT),
              from(this._config.refreshToken.get()).pipe(
                map(this._config.refreshRequest),
                switchMap(ajax),
                retry(this._config.retryCount ?? 0),
                map(this._config.mapAccessToken),
                tap((token) => this.set(token)),
                catchError((err: AjaxError) => {
                  // invalidate refresh token as auth failed
                  this._config.refreshToken.invalidate(err);
                  return throwError(err);
                })
              )
            )
          );
        }
        return of(token);
      }),
      shareReplay(1)
    );
  }
}
