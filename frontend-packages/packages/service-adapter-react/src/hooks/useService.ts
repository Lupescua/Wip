/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  InferService,
  Service,
  ServiceCollection,
  ServiceDescriptor
} from '@salling-group/core-service';
import { useContext, useLayoutEffect, useMemo } from 'react';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, skipWhile } from 'rxjs/operators';
import { ServiceActiveContext } from '../context/ServiceActiveContext';
import { useLazyState } from './useLazyState';

/**
 * @public
 */
export interface IUseServiceHook<TService> {
  (): InferService<TService>;
}

/**
 * @internal
 */
function useDescribedService<TService extends Service<unknown>>(
  service: TService
): [InferService<TService>, ServiceDescriptor<TService>] {
  return useMemo(() => {
    const described = ServiceDescriptor.describe(service);
    return [described.getCurrentValue(), described];
  }, []);
}

/**
 * Service hook
 * @public
 */
export function useService<TService extends Service<unknown>>(
  service: TService
): InferService<TService> {
  const [initialValues, described] = useDescribedService(service);
  const { isActive } = useContext(ServiceActiveContext);

  const members = [...described.members].map((key) => [key, described.members[key]]);

  const [state, setState] = useLazyState<InferService<TService>, any>(
    initialValues,
    Object.fromEntries(members)
  );

  useLayoutEffect(() => {
    const observables = [...described.observables];

    const subscriptions = observables.map((key) => {
      const observable = described.observables[key];
      const initialValue = initialValues[key as keyof {}];

      return combineLatest([observable as Observable<any>, isActive])
        .pipe(
          skipWhile(([value]) => value === initialValue),
          filter(([, isActive]) => isActive),
          map(([value]) => value),
          distinctUntilChanged()
        )
        .subscribe((next) => {
          setState(key as keyof TService, next as any);
        });
    });

    return () => {
      subscriptions.map((subscription) => subscription.unsubscribe());
    };
  }, []);

  return state;
}

/**
 * Create service hook
 * @public
 */
export function createServiceHook<TKey extends string, TService extends Service<unknown>>(
  key: TKey,
  context: React.Context<ServiceCollection<any>>
): IUseServiceHook<TService> {
  const _useService = useService;
  return function useService(): InferService<TService> {
    const serviceContext = useContext(context);
    const service = serviceContext.getService(key);
    return _useService(service as TService);
  };
}
