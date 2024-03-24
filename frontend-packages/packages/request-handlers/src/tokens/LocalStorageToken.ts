import { asapScheduler, defer, fromEvent, of, scheduled, SchedulerLike } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
import { IStorageTokenConfig, StorageToken } from './StorageToken';

/**
 * @public
 */
export class LocalStorageToken extends StorageToken<string> {
  public constructor(key: string, scheduler: SchedulerLike = asapScheduler) {
    const config =
      typeof window !== 'undefined'
        ? getBrowserTokenConfig(key, scheduler)
        : getServerTokenConfig();
    super(config);
  }
}

function getBrowserTokenConfig(
  key: string,
  scheduler: SchedulerLike
): IStorageTokenConfig<string> {
  return {
    get: () =>
      defer(() =>
        scheduled(
          fromEvent<StorageEvent>(window, 'storage').pipe(
            startWith({ key, newValue: localStorage.getItem(key) }),
            filter((ev) => ev.key === key),
            map((event) => event.newValue ?? '')
          ),
          scheduler
        )
      ),
    set: (token) =>
      token ? localStorage.setItem(key, token) : localStorage.removeItem(key)
  };
}

function getServerTokenConfig(): IStorageTokenConfig<string> {
  return {
    get: () => of(''),
    set: () => {}
  };
}
