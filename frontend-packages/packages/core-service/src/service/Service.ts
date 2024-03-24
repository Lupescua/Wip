/* eslint-disable @typescript-eslint/no-explicit-any */
import { isObservable, Observable } from 'rxjs';
import { distinctUntilChanged, map, take, tap } from 'rxjs/operators';
import { ActionEventHub, ScopedActionEventHub } from '../event/ActionEventHub';
import { IOptimisticUpdateConfig, OptimisticSource, State, StateReducer } from './State';

/**
 * @public
 */
export type SetStateAction<TState> = (
  current: TState
) => Observable<TState> | Partial<TState>;

/**
 * @public
 */
export type Selector<R, A extends unknown[] = []> = A extends []
  ? Observable<R>
  : Observable<(...args: A) => R>;

/**
 * @public
 */
export abstract class Service<TState> {
  private _initialState: TState;
  private _state: State<TState>;
  private _eventHub: ScopedActionEventHub<this>;

  protected constructor(initialState: TState) {
    this._initialState = initialState;
    this._state = new State(initialState);
    this._eventHub = new ActionEventHub();
  }

  public static setState<TState>(service: Service<TState>, state: TState): void {
    service.setState({ ...state });
  }

  /**
   * Get raw state. Not optimistic state.
   */
  public static getState<TState>(service: Service<TState>): Observable<TState> {
    return service._state._state.asObservable();
  }

  /**
   * Action events. See {@link ScopedActionEventHub}.
   */
  public get eventHub(): ScopedActionEventHub<this> {
    return this._eventHub;
  }

  /**
   * Observable state.
   */
  protected get state(): Observable<TState> {
    return this._state.asObservable();
  }

  /**
   * @returns the predicted value of the state at this point in time.
   */
  public getPredictedValue(): TState {
    return this._state.getPredictedValue();
  }

  /**
   * @returns the concrete value of the state at this point in time.
   */
  public getValue(): TState {
    return this._state.getValue();
  }

  /**
   * Reset the state to its initial value.
   */
  public resetState(): void {
    this._state.next(this._initialState);
  }

  /**
   * Select a subset of a value.
   * The selector can be parameterized by defining 1\<= parameters following the required paramter.
   *
   * @example
   *
   * ```ts
   * // yields an Observable<T> where T is the value
   * this.selector((source) => source.property)
   *
   * // yields an Observable<(param1: string) => T>
   * this.selector((source, param1: string) => source.properties[param1])
   * ```
   *
   * @param selector - a filter function that is applied to source emissions.
   * @param source - an Observable from which the selector is created. Defaults to the service state.
   *
   * @returns an Observable that will emit either the selected value or a function.
   */
  protected selector<
    TResult,
    TArgs extends unknown[],
    TSource extends Observable<any> = Observable<TState>
  >(
    selector: (
      source: TSource extends Observable<infer U> ? U : never,
      ...args: TArgs
    ) => TResult,
    source: TSource = this.state as never
  ): Selector<TResult, TArgs> {
    if (selector.length > 1) {
      return source.pipe(
        distinctUntilChanged(),
        map((value) => selector.bind(this, value))
      ) as Selector<TResult, TArgs>;
    }

    return source.pipe(
      map((value) => selector(value, ...([] as never))),
      distinctUntilChanged()
    ) as Selector<TResult, TArgs>;
  }

  /**
   * Predict and update the state.
   *
   * @param predictedReducer - a reducer function to predict the next value of the state.
   * @param source - an Observable that emits the actual value of the next state.
   * @param config - a configuration for the optimistic update.
   *
   * @returns an Observable that will emit the state when updated.
   */
  protected setState<TValue extends TState>(
    predictedReducer: StateReducer<TValue>,
    source: OptimisticSource<TValue>,
    config?: IOptimisticUpdateConfig
  ): Observable<TValue>;
  protected setState<TValue extends SetStateAction<TState>>(
    value: TValue
  ): TValue extends (current: infer U) => infer R ? R : never;
  protected setState(value: Partial<TState>): void;
  /**
   * Update the state.
   */
  protected setState(
    value: StateReducer<TState> | SetStateAction<TState> | Partial<TState>,
    source?: OptimisticSource<TState>,
    config?: IOptimisticUpdateConfig
  ): ReturnType<SetStateAction<TState>> | void {
    if (typeof value !== 'function') {
      return this._state.next({
        ...this._state.getValue(),
        ...value
      });
    }

    if (source) {
      return this._state.optimisticNext(value as StateReducer<TState>, source, config);
    }

    const nextValue = value(this._state.getValue());

    if (!isObservable<TState>(nextValue)) {
      this._state.next(nextValue as TState);
      return nextValue;
    }

    return nextValue.pipe(
      take(1),
      tap((next) => this._state.next(next))
    );
  }
}
