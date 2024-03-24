/* eslint-disable @typescript-eslint/no-explicit-any */
import { InferService, Service, ServiceCollection } from '@salling-group/core-service';
import React, { useMemo } from 'react';
import { createServiceHook } from '../hooks/useService';

/**
 * @public
 */
export type ServiceHookName<TKey> = TKey extends `${string}Service`
  ? `use${Capitalize<string & TKey>}`
  : `use${Capitalize<string & TKey>}Service`;

/**
 * @public
 */
export interface IServiceRecord {
  [key: string]: Service<any>;
}

/**
 * @public
 */
export type MappedServiceRecord<T extends IServiceRecord> = {
  [K in keyof T]: Service<any>;
};

/**
 * @public
 */
export interface IServiceFactoryFunction<
  R extends IServiceRecord,
  T extends MappedServiceRecord<R>
> {
  (context: IServiceFactoryContext<any>): T;
}

/**
 * @public
 */
export interface IServiceFactoryContext<P> {
  staticProps: P;
}

/**
 * @public
 */
export type ServiceContextApi<T extends IServiceRecord> = {
  [K in keyof T as ServiceHookName<K>]: () => InferService<T[K]>;
} & {
  useServiceContext: <R>(staticProps: R) => ServiceContext<T>;
  instances: T;
};

/**
 * @public
 */
export class ServiceContext<T extends IServiceRecord> {
  public context: React.Context<ServiceCollection<T>>;
  public serviceCollection?: ServiceCollection<T> | undefined;
  public constructor() {
    this.context = React.createContext<ServiceCollection<T>>({} as never);
  }
}

/**
 * @internal
 */
function getServiceHookName<TKey extends string | symbol | number>(
  key: TKey
): ServiceHookName<TKey> {
  const pre = 'use';
  const post = String(key).endsWith('Service') ? '' : 'Service';
  const capitalized = (key as string)[0].toUpperCase() + (key as string).slice(1);

  return (pre + capitalized + post) as ServiceHookName<TKey>;
}

/**
 * @public
 */
export function createServiceContext<
  R extends IServiceRecord,
  T extends MappedServiceRecord<R>
>(serviceFactory: IServiceFactoryFunction<R, T>): ServiceContextApi<T> {
  // React will ask for the $$typeof property immediatly, it will cause the proxy to throw when not defined.
  const contextApi: ServiceContextApi<T> = Object.create({ $$typeof: undefined });
  const serviceContext = new ServiceContext();

  contextApi.useServiceContext = function useServiceContext<R>(
    staticProps: R
  ): ServiceContext<T> {
    return useMemo(() => {
      const services = serviceFactory({ staticProps });
      Object.keys(services).forEach((key) => {
        Reflect.set(
          contextApi,
          getServiceHookName(key),
          createServiceHook(key as string, serviceContext.context)
        );
      });
      serviceContext.serviceCollection = new ServiceCollection(services);
      contextApi.instances = { ...services };
      return serviceContext;
    }, []);
  };

  return new Proxy(contextApi, {
    get(target: ServiceContextApi<T>, propertyKey: keyof ServiceContextApi<T>) {
      if (propertyKey in target) return target[propertyKey];
      if (!serviceContext.serviceCollection) {
        throw new Error(
          'useServiceContext must be applied before accessing service hooks'
        );
      }
      return target[propertyKey];
    }
  });
}
