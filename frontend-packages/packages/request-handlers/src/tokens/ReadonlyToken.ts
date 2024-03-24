import { Observable, of } from 'rxjs';
import { ITokenSource } from '../ITokenSource';

/**
 * @public
 */
export class ReadonlyToken<TToken> implements ITokenSource<TToken> {
  private _value: TToken;

  public constructor(value: TToken) {
    this._value = value;
  }

  public get(): Observable<TToken> {
    return of(this._value);
  }

  public set(): void {}

  public invalidate(): void {}
}
