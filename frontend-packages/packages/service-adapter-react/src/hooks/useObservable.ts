import { useState, useLayoutEffect, useContext } from 'react';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, take } from 'rxjs/operators';
import { ServiceActiveContext } from '../context/ServiceActiveContext';

/**
 * @public
 */
export function useObservable<TValue>(
  observable: Observable<TValue>,
  deps: React.DependencyList = []
): TValue {
  const [value, setValue] = useState(() => {
    let initialValue: TValue | undefined = undefined;

    observable.pipe(take(1)).subscribe((next) => {
      initialValue = next;
    });

    return (initialValue as unknown) as TValue;
  });
  const { isActive } = useContext(ServiceActiveContext);

  useLayoutEffect(() => {
    const subscription = combineLatest([observable, isActive])
      .pipe(
        filter(([, isActive]) => isActive),
        map(([value]) => value),
        distinctUntilChanged()
      )
      .subscribe((next) => setValue(next));

    return () => subscription.unsubscribe();
  }, deps);

  return value;
}
