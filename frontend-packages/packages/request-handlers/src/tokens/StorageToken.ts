import { BehaviorSubject, from, Observable, ObservableInput } from 'rxjs';
import { multicast, refCount } from 'rxjs/operators';
import { ITokenSource, OptionalToken, TokenSignals } from '../ITokenSource';

/**
 * @public
 */
export interface IStorageTokenConfig<TToken> {
  get: () => ObservableInput<OptionalToken<TToken>>;
  set: (token: OptionalToken<TToken>) => void;
}

/**
 * @public
 */
export class StorageToken<TToken> implements ITokenSource<TToken> {
  private _config: IStorageTokenConfig<TToken>;
  private _tokenValidator$: Observable<OptionalToken<TToken>>;
  private _token$: BehaviorSubject<OptionalToken<TToken>>;

  public constructor(config: IStorageTokenConfig<TToken>) {
    this._config = config;
    this._token$ = new BehaviorSubject<OptionalToken<TToken>>(TokenSignals.EMPTY);
    this._tokenValidator$ = this._createValidator();
  }

  public get(): Observable<OptionalToken<TToken>> {
    return this._tokenValidator$;
  }

  public set(token: OptionalToken<TToken>): void {
    this._token$.next(token);
    this._config.set(token);
  }

  public invalidate(err: unknown): void {
    this.set(TokenSignals.EMPTY);
  }

  private _createValidator(): Observable<OptionalToken<TToken>> {
    return from(this._config.get()).pipe(multicast(this._token$), refCount());
  }
}
