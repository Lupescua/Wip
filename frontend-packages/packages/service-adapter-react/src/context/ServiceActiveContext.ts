import { Context, createContext } from 'react';
import { Observable, of } from 'rxjs';

/**
 * @public
 */
export interface IServiceActiveContext {
  isActive: Observable<boolean>;
}

/**
 * @public
 */
export const ServiceActiveContext: Context<IServiceActiveContext> = createContext<IServiceActiveContext>(
  { isActive: of(true) }
);
