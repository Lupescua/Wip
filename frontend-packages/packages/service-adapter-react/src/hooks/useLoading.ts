import { OmitNoneEmittable, ScopedActionEventHub } from '@salling-group/core-service';
import { useObservable } from './useObservable';

/**
 * @public
 */
export function useLoading<TScope>(
  actionEventHub: ScopedActionEventHub<TScope>,
  key: keyof OmitNoneEmittable<TScope>
): boolean {
  return useObservable(actionEventHub.hasActiveEvent(key as string), [key]);
}
