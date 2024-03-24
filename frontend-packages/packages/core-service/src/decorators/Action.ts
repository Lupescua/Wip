/* eslint-disable @typescript-eslint/no-explicit-any */
import { Observable } from 'rxjs';
import { Service } from '../service/Service';
import { ActionHandler, IExecutionOperator } from './execution/ActionHandler';

/**
 * @public
 */
export type CanEmit<
  TMethod extends (...args: any[]) => IEmitableObservable<any>
> = Required<ReturnType<TMethod>> extends { __emitStatus: boolean } ? TMethod : never;

/**
 * @public
 */
export type IsEmitableMethod<TProperty> = TProperty extends (
  ...args: any[]
) => IEmitableObservable<any>
  ? CanEmit<TProperty>
  : never;

/**
 * @public
 */
export type NoneEmittableKeys<TService> = {
  [TKey in keyof TService]: IsEmitableMethod<TService[TKey]> extends never ? TKey : never;
}[keyof TService];

/**
 * @public
 */
export type OmitNoneEmittable<TService> = Pick<
  TService,
  Exclude<keyof TService, NoneEmittableKeys<TService>>
>;

/**
 * @public
 */
export type EventStatusKeys<TService, TStatus extends string> = {
  [TKey in keyof OmitNoneEmittable<TService>]: `${Uppercase<
    TKey extends string ? TKey : string
  >}_${Uppercase<TStatus>}`;
}[keyof OmitNoneEmittable<TService>];

/**
 * @public
 */
export type ServiceEventKeys<TService> =
  | EventStatusKeys<TService, 'success'>
  | EventStatusKeys<TService, 'error'>
  | EventStatusKeys<TService, 'start'>;

/**
 * @public
 */
export type ActionDecorator = <TState>(
  target: Service<TState>,
  propertyKey: string,
  descriptor: PropertyDescriptor
) => TypedPropertyDescriptor<(...args: any[]) => IEmitableObservable<any>>;

/**
 * @public
 */
export interface IEmitableObservable<TValue> extends Observable<TValue> {
  __emitStatus?: boolean;
}

/**
 * @public
 */
export function Action<T>(operator?: IExecutionOperator<T>): ActionDecorator {
  const handler = new ActionHandler<T>({
    operator
  });

  return <TState>(
    target: Service<TState>,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    // Instance name can be accessed by target.constructor.name
    const initialValue = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      const result = initialValue.apply(this, args);
      const service = this as Service<TState>;

      const shared = handler.dispatch(result, {
        actionName: propertyKey,
        instance: service,
        args
      });

      return shared;
    };

    return descriptor;
  };
}
