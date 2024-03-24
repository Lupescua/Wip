import { BehaviorSubject, combineLatest, from, Observable } from 'rxjs';
import {
  defaultIfEmpty,
  filter,
  first,
  map,
  reduce,
  share,
  shareReplay,
  switchMap,
  tap
} from 'rxjs/operators';

/**
 * @public
 */
export type StateReducer<T> = (state: T) => T;
/**
 * @public
 */
export type StateAccept<T> = (state: T) => T;
/**
 * @public
 */
export type StateCancel = () => void;
/**
 * @public
 */
export type OptimisticSource<T> = Observable<StateReducer<T>>;

/**
 * @public
 */
export interface IOptimisticUpdateConfig {
  /**
   * When provided, all updates with the same id is replaced by the most recent.
   * This should be used on subsequent updates to automatically flush stale reducers.
   */
  id?: string;
}

/**
 * @interface
 */
class Reducer<T> {
  public isDisposed?: boolean;
  public readonly id: string;
  public readonly reducer: StateReducer<T>;
  public constructor(id: string, reducer: StateReducer<T>) {
    this.id = id;
    this.reducer = reducer;
  }
  public dispose(): void {
    this.isDisposed = true;
  }
}

/**
 * @internal
 */
class ReducerMap<T> extends BehaviorSubject<Reducer<T>[]> {
  private _reducers: Map<string, Reducer<T>> = new Map();
  private _count: number = 0;

  // istanbul ignore next
  public constructor() {
    super([]);
  }

  public set(reducer: StateReducer<T>, id?: string): Reducer<T> {
    const reducerId = id ?? Date.now() + String(++this._count);
    const reducerInstance = new Reducer(reducerId, reducer.bind(reducer));

    const activeReducer = this._reducers.get(reducerInstance.id);
    if (activeReducer) {
      activeReducer.dispose();
    }

    this._reducers.set(reducerInstance.id, reducerInstance);
    this._moveNext();

    return reducerInstance;
  }

  public delete(reducer: Reducer<T>): boolean {
    const didDelete = this._reducers.delete(reducer.id);
    this._moveNext();
    return didDelete;
  }

  private _moveNext(): void {
    this.next([...this._reducers.values()].filter((reducer) => !reducer.isDisposed));
  }
}

/**
 * @public
 */
export class State<T> extends Observable<T> {
  private _autoSubscribe?: boolean;
  private _reducers: ReducerMap<T>;
  public _state: BehaviorSubject<T>;
  private _accumulatedState: Observable<T>;
  private _predictedValue: T;
  public constructor(initialValue: T, autoSubscribe?: boolean) {
    super((subscriber) => {
      // Accumulates the predicted state with the actual state as a base: P1(P2(A))
      const subscription = this._accumulatedState.subscribe(subscriber);
      subscriber.add(subscription);
    });

    this._predictedValue = initialValue;

    this._reducers = new ReducerMap();
    this._state = new BehaviorSubject(initialValue);
    this._autoSubscribe = autoSubscribe;

    this._accumulatedState = combineLatest([this._state, this._reducers]).pipe(
      switchMap(([state, reducers]) =>
        from(reducers).pipe(
          filter((reducer) => !reducer.isDisposed),
          reduce((acc, fn) => ({ ...acc, ...fn.reducer({ ...acc }) }), state),
          // ensure emit if there is no reducers
          defaultIfEmpty(state)
        )
      ),
      // DO NOT REMOVE THIS - It prevents a massive amount of repetitive accumulations and emits.
      shareReplay(1),
      tap((value) => {
        this._predictedValue = value;
      })
    );
  }

  public asObservable(): Observable<T> {
    return from(this);
  }

  public getPredictedValue(): T {
    return { ...this._predictedValue };
  }

  public getValue(): T {
    return this._state.getValue();
  }

  public next(value: T): void {
    this._state.next(value);
  }

  public optimisticNext(
    predictedReducer: StateReducer<T>,
    source: OptimisticSource<T>,
    config?: IOptimisticUpdateConfig
  ): Observable<T> {
    const [apply, cancel] = this._pushReducer(predictedReducer, config);

    const execution$ = source.pipe(
      map((value) => value(this.getValue())),
      map((value) => apply(value)),
      // we're only interested in the error notification, not catching the error.
      tap({ error: () => cancel() }),
      first(),
      share()
    );

    if (this._autoSubscribe) execution$.subscribe();
    return execution$;
  }

  private _pushReducer(
    predictedReducer: StateReducer<T>,
    config?: IOptimisticUpdateConfig
  ): [StateAccept<T>, StateCancel] {
    const reducer = this._reducers.set(predictedReducer, config?.id);

    const cancel: StateCancel = () => {
      this._reducers.delete(reducer);
    };

    const apply: StateAccept<T> = (nextState) => {
      if (reducer.isDisposed) return nextState;

      reducer.dispose();
      this.next(nextState);
      return nextState;
    };

    return [apply, cancel];
  }
}
