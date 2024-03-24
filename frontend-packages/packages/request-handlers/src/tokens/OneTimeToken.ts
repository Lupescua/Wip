import { from, Observable, throwError } from 'rxjs';
import { AjaxError, AjaxRequest, AjaxResponse } from 'rxjs/ajax';
import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  share,
  switchMap,
  tap
} from 'rxjs/operators';
import { ITokenSource, OptionalToken } from '../ITokenSource';
import { ajax } from '../utils/ajax';

/**
 * @public
 */
export interface IOneTimeTokenConfig<TToken, TKey> {
  key: ITokenSource<TKey>;
  request: (refreshToken: OptionalToken<TKey>) => AjaxRequest;
  mapAccessToken: (response: AjaxResponse) => OptionalToken<TToken>;
}

/**
 * @public
 */
export class OneTimeToken<TToken, TKey> implements ITokenSource<TToken> {
  private _config: IOneTimeTokenConfig<TToken, TKey>;
  private _tokenValidator$: Observable<OptionalToken<TToken>>;

  public constructor(config: IOneTimeTokenConfig<TToken, TKey>) {
    this._config = config;
    this._tokenValidator$ = this._createValidator();
  }

  public get(): Observable<OptionalToken<TToken>> {
    return this._tokenValidator$;
  }

  public set(token: OptionalToken<TToken>): void {
    // Can't be set
  }

  public invalidate(err: unknown): void {
    // Invalidate through
    this._config.key.invalidate(err);
  }

  private _createValidator(): Observable<OptionalToken<TToken>> {
    return from(this._config.key.get()).pipe(
      distinctUntilChanged(),
      filter((token) => Boolean(token)),
      map(this._config.request),
      switchMap(ajax),
      map(this._config.mapAccessToken),
      tap((token) => this.set(token)),
      catchError((err: AjaxError) => {
        // invalidate refresh token as auth failed
        this._config.key.invalidate(err);
        return throwError(err);
      }),
      share()
    );
  }
}
