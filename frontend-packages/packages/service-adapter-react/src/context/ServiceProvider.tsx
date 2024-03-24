import { ICollection } from '@salling-group/core-service';
import React, { PropsWithChildren } from 'react';
import { ServiceContext } from './ServiceContext';

/**
 * @public
 */
export interface IServiceProviderProps<TServices extends ICollection> {
  serviceContext: ServiceContext<TServices>;
}

/**
 * @public
 */
export function ServiceProvider<TServices extends ICollection>({
  serviceContext,
  children
}: PropsWithChildren<IServiceProviderProps<TServices>>) {
  return (
    <serviceContext.context.Provider value={serviceContext.serviceCollection!}>
      {children}
    </serviceContext.context.Provider>
  );
}
