import { ObservableInput } from 'rxjs';

/**
 * @public
 */
export enum TokenSignals {
  EMPTY = "",
  WAIT = "wait"
}

/**
 * @public
 */
export type OptionalToken<TToken> = TToken | TokenSignals;

/**
 * @public
 */
export interface ITokenSource<TToken> {
  get: () => ObservableInput<OptionalToken<TToken>>;
  set: (token: OptionalToken<TToken>) => void;
  invalidate: (err: unknown) => void;
}
