import { Action, IEmitableObservable, Service } from '@salling-group/core-service';
import { Observable, of } from 'rxjs';

/**
 * @public
 */
export interface IGetElementResult<TElements, TConfig extends IElementConfig<TElements>> {
  isOpen: boolean;
  payload: TConfig['payload'];
  index: number;
}

/**
 * @public
 */
export type InferArgsFromPayload<P> = keyof P extends never ? [] : [payload: P];

/**
 * @public
 */
export interface ILayoutService<
  TElements extends Record<string, IElementConfig<TElements>>
> {
  getElement<K extends keyof TElements, P extends TElements[K]>(
    key: K
  ): Observable<IGetElementResult<TElements, P>>;
  open<K extends keyof TElements, P>(
    key: K,
    ...[payload]: InferArgsFromPayload<P>
  ): IEmitableObservable<ILayoutServiceState<TElements>>;
  close: (key: keyof TElements) => void;
  toggle<K extends keyof TElements, P>(
    key: K,
    ...args: InferArgsFromPayload<P>
  ): IEmitableObservable<ILayoutServiceState<TElements>>;
}

/**
 * @public
 */
export interface ILayoutServiceState<TElements> {
  elements: Record<keyof TElements, IElementConfig<TElements> & { show?: boolean }>;
}

/**
 * @public
 */
export interface ILayoutServiceConfig<TElements> {
  overrideState?: Partial<ILayoutServiceState<TElements>>;
  elements: TElements;
}

/**
 * @public
 */
export interface IElementConfig<TElements, TPayload = {}> {
  conflicts?: Array<keyof TElements>;
  payload?: TPayload;
}

/**
 * @public
 */
export class LayoutService<TElements extends Record<string, IElementConfig<TElements>>>
  extends Service<ILayoutServiceState<TElements>>
  implements ILayoutService<TElements> {
  public constructor({ elements, overrideState }: ILayoutServiceConfig<TElements>) {
    super({ elements, ...overrideState });
  }

  public getElement<K extends keyof TElements, P extends TElements[K]>(
    key: K
  ): Observable<IGetElementResult<TElements, P>> {
    return this.selector((state) => {
      return {
        isOpen: !!state.elements[key].show,
        payload: state.elements[key].payload,
        index: this._getElementIndex(state.elements, key)
      };
    });
  }

  @Action()
  public open<K extends keyof TElements, P extends TElements[K]['payload']>(
    key: K,
    ...[payload]: InferArgsFromPayload<P>
  ): IEmitableObservable<ILayoutServiceState<TElements>> {
    return this.setState((state) => {
      const existingElement = state.elements[key];

      const { elements } = state;
      delete elements[key]; // key must be deleted to be appended as last element in "updatedState"

      const updatedState = {
        ...state,
        elements: {
          ...Object.entries(elements).reduce(
            (allElements, [currentKey, currentElement]) => {
              if (existingElement.conflicts?.includes(currentKey)) {
                return {
                  ...allElements,
                  [currentKey]: { ...currentElement, show: false }
                };
              }
              return allElements;
            },
            elements
          ),
          [key]: {
            ...existingElement,
            show: true,
            payload
          }
        }
      };

      return of(updatedState);
    });
  }

  @Action()
  public close(
    key: keyof TElements
  ): IEmitableObservable<ILayoutServiceState<TElements>> {
    return this.setState((state) => {
      const existingElement = state.elements[key];

      const updatedState = {
        ...state,
        elements: {
          ...state.elements,
          [key]: { ...existingElement, show: false }
        }
      };

      return of(updatedState);
    });
  }

  public toggle<K extends keyof TElements, P extends TElements[K]['payload']>(
    key: keyof TElements,
    ...args: InferArgsFromPayload<P>
  ): IEmitableObservable<ILayoutServiceState<TElements>> {
    const state = this.getValue();
    const { show } = state.elements[key];
    return show ? this.close(key) : this.open(key, ...args);
  }

  private _getElementIndex(
    elements: ILayoutServiceState<TElements>['elements'],
    key: keyof TElements
  ): number {
    return Object.keys(elements).indexOf(key.toString());
  }
}
