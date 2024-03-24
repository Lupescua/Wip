import { useRef, useReducer, useMemo } from 'react';

interface ILazyAction<TState> {
  type: keyof TState;
  payload: unknown;
}

type LazyReducer<TState> = (state: TState, action: ILazyAction<TState>) => TState;

/**
 * @public
 */
export type SetLazyStateAction<TState> = <TKey extends keyof TState>(
  key: TKey,
  value: TState[TKey]
) => void;

/**
 * @public
 */
export type LazyStateResult<
  TState extends Record<string, unknown>,
  TConstant
> = TConstant extends never ? TState : TState & TConstant;

/**
 * @internal
 */
function reducer<TState>(state: TState, action: ILazyAction<TState>): TState {
  return { ...state, [action.type]: action.payload };
}

/**
 * Creates a state object where only the properties actually used by the consumer are stateful.
 *
 * @remarks
 * It is important to note that spreading the state will result in eager evaluation.
 *
 * @param initialState - The initial state
 * @param staticValues - Non reactive properties to be included in the final output.
 * This has to be part of the output object, to maintain the lazy evaluation.
 * @returns a tuple [state, setState] with lazy state evaluation.
 *
 * @public
 */
export function useLazyState<TState extends Record<string, unknown>, TConstant>(
  initialState: TState,
  constants?: TConstant extends Record<string, unknown> ? TConstant : never
): [LazyStateResult<TState, TConstant>, SetLazyStateAction<TState>] {
  const staticValuesRef = useRef<TConstant>(constants ?? ({} as TConstant));
  const reactiveKeys = useRef<Set<string | number | symbol>>(new Set());
  const nonReactiveValues = useRef<Partial<TState>>(initialState);

  const [state, dispatch] = useReducer<LazyReducer<TState>>(reducer, initialState);

  const lazyState = useMemo(() => {
    return new Proxy(
      { ...state, ...staticValuesRef.current } as LazyStateResult<TState, TConstant>,
      {
        get(target: LazyStateResult<TState, TConstant>, propertyKey: string) {
          // Returns a non reactive value if provided as static values
          if (propertyKey in staticValuesRef.current) {
            return staticValuesRef.current[propertyKey as keyof TConstant];
          }
          // Return the value from the state, this is reactive
          if (reactiveKeys.current.has(propertyKey as string)) {
            return state[propertyKey];
          }
          // This is the first evaluation when requesting a reactive property.
          // This will register the property as reactive for the next evaluation.
          reactiveKeys.current.add(propertyKey as string);
          return nonReactiveValues.current[propertyKey];
        }
      }
    );
  }, [state]);

  function setState<TKey extends keyof TState>(
    key: TKey,
    value: TState[keyof TState]
  ): void {
    // This will only set the state if the value is already reactive.
    if (reactiveKeys.current.has(key)) {
      dispatch({ type: key, payload: value });
      return;
    }

    nonReactiveValues.current[key as keyof TState] = value;
  }

  return [lazyState, setState];
}
