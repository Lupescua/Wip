import {
  ServiceEventKeys,
  ScopedActionEventHub,
  EventHub
} from '@salling-group/core-service';
import { getCurrentScope, onScopeDispose } from 'vue-demi';

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
 * Composition API hook for service events
 *
 * @example
 *
 * ```ts
 * import { useEventHub, useServices } from "@salling-group/service-adapter-vue"
 *
 * const Component = {
 *   setup(props, context) {
 *     const services = useServices();
 *
 *     useEventHub(services.testService.eventHub, {
 *       SERVICE_METHOD_START: (message) => {
 *         // do something...
 *       }
 *     })
 *   }
 * }
 * ```
 *
 * @public
 */
export function useEventHub<
  TScope,
  TMessage extends { eventName: string | number | symbol }
>(
  eventHub: ScopedActionEventHub<TScope> | EventHub<TMessage>,
  handler: UseEventHandler<TScope, TMessage>
): void {
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

  if (getCurrentScope()) {
    onScopeDispose(() => {
      subscription.unsubscribe();
    });
  }
}
