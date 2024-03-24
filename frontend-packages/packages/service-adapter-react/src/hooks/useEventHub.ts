import {
  EventHub,
  ScopedActionEventHub,
  ServiceEventKeys
} from '@salling-group/core-service';
import { useLayoutEffect } from 'react';

/**
 * @public
 */
export type EventWithName<TService, TMessage> = TMessage & {
  eventName: ServiceEventKeys<TService>;
};

/**
 * @public
 */
export type UseEventHandler<TService, TMessage> =
  | ((event: EventWithName<TService, TMessage>) => void)
  | UseServiceEvents<TService, TMessage>;

/**
 * @public
 */
export type UseServiceEvents<TService, TMessage> = {
  [TKey in ServiceEventKeys<TService>]?: (event: TMessage) => void;
};

/**
 * @public
 */
export function useEventHub<
  TScope,
  TMessage extends { eventName: string | number | symbol }
>(
  eventHub: ScopedActionEventHub<TScope> | EventHub<TMessage>,
  handler: UseEventHandler<TScope, TMessage>,
  deps: React.DependencyList = []
): void {
  useLayoutEffect(() => {
    function eventHandler(event: TMessage): void {
      if (typeof handler === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return handler(event as any);
      }

      if (event.eventName in handler) {
        handler[event.eventName as keyof typeof handler]!(event);
      }
    }

    const subscription = eventHub.subscribe(eventHandler as () => void);
    return () => subscription.unsubscribe();
  }, deps);
}
