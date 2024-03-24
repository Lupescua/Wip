import { OmitNoneEmittable, ScopedActionEventHub } from '@salling-group/core-service';
import { Ref } from 'vue-demi';
import { useObservable } from './useObservable';

/**
 * @public
 */
export function useLoading<TScope>(
  actionEventHub: ScopedActionEventHub<TScope>,
  key: keyof OmitNoneEmittable<TScope>
): Ref<boolean> {
  const isLoading = useObservable(actionEventHub.hasActiveEvent(key as string));

  if (isLoading.value === undefined) {
    isLoading.value = false;
  }

  return isLoading as Ref<boolean>;
}
