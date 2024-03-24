import { Observable } from 'rxjs';
import { getCurrentScope, onScopeDispose, ref, Ref } from 'vue-demi';

/**
 * @public
 */
export function useObservable<TValue>(
  observable: Observable<TValue>
): Ref<TValue | undefined> {
  const value: Ref<TValue | undefined> = ref(undefined);

  const subscription = observable.subscribe((next) => (value.value = next));

  if (getCurrentScope()) {
    onScopeDispose(() => subscription.unsubscribe());
  }

  return value;
}
