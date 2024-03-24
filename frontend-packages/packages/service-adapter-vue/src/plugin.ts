import { InferService, Service, ServiceDescriptor } from '@salling-group/core-service';
import { App, Plugin, reactive, isVue2, install } from 'vue-demi';

/**
 * @public
 */
export type ServiceRecord = Record<string, Service<unknown>>;

/**
 * @public
 */
export type ServiceFactory<TResult extends ServiceRecord, TContext> = (
  context?: TContext,
  app?: App
) => TResult;

/**
 * @public
 */
export type ServiceContainer<T> = {
  [K in keyof T]: InferService<T[K]>;
};

/**
 * @public
 */
export type ServiceHooks<T> = {
  readonly [K in keyof T as `use${Capitalize<K & string>}`]: () => InferService<T[K]>;
};

/**
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InjectFunction = (key: string, value: any) => void;

/**
 * @public
 */
export interface IServiceContainer<TServices extends ServiceRecord, TContext> {
  useServices(): ServiceContainer<TServices>;
  NuxtServicePlugin: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: TContext,
    inject: InjectFunction
  ) => void;
  Nuxt3ServicePlugin: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nuxtApp: TContext & { provide: InjectFunction }
  ) => void;
  VueServicePlugin: Plugin;
}

/**
 * Utility type for service inferrence
 *
 * @example
 *
 * ```ts
 * import { GetServices } from "@salling-group/service-adapter-vue"
 *
 * declare module 'vue' {
 *   export interface ComponentCustomProperties {
 *     $services: GetServices<typeof factory>;
 *   }
 * }
 *
 * const facotry = (context, app) => ({
 *   testService: new TestService()
 * });
 * ```
 *
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GetServices<T> = T extends ServiceFactory<infer U, any>
  ? ServiceContainer<U>
  : never;

/**
 * Vue3 plugin for registering services.
 *
 * @example
 * Vue plugin example
 * ```ts
 * import { createServiceContainer } from "@salling-group/service-adapter-vue"
 *
 * export const { useServices, VueServicePlugin } = createServiceContainer((_, app) => ({
 *  testService: new TestService()
 * }));
 *
 * const app = createApp({})
 * app.use(VueServicePlugin);
 * ```
 *
 * @example
 * Nuxt plugin example
 * ```ts
 * import { createServiceContainer } from "@salling-group/service-adapter-vue"
 *
 * export const { useServices, NuxtServicePlugin } = createServiceContainer((context, _) => ({
 *  testService: new TestService()
 * }));
 *
 * export default NuxtServicePlugin;
 * ```
 *
 * @public
 */
export function createServiceContainer<TServices extends ServiceRecord, TContext>(
  factory: ServiceFactory<TServices, TContext>
): IServiceContainer<TServices, TContext> {
  install();
  const container = {} as ServiceContainer<TServices>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function setupServiceContainer(services: TServices): void {
    const serviceKeys = Object.keys(services) as (keyof TServices)[];

    for (const serviceName of serviceKeys) {
      const service = services[serviceName];
      const described = ServiceDescriptor.describe(service);
      const boundService: InferService<unknown> = reactive({
        ...described.getCurrentValue()
      });

      // Assign non observables
      for (const key of described.members) {
        Object.assign(boundService, { [key]: described.members[key] });
      }

      // Subscribe to service observables
      for (const key of described.observables) {
        described.observables[key].subscribe((value) => {
          Object.assign(boundService, { [key]: value });
        });
      }

      container[serviceName] = boundService as InferService<never>;
    }

    Object.freeze(container);
  }

  return {
    // Get services as a composeable (need to install as vue plugin or nuxt plugin first)
    useServices() {
      if (!Object.isFrozen(container)) {
        console.warn(
          'useServices was called before service adapter was installed. Services might not be available.'
        );
      }

      return container;
    },
    // Install as nuxt 2 plugin
    NuxtServicePlugin: (context, inject) => {
      // Make sure services are only setup once
      if (!Object.isFrozen(container)) {
        setupServiceContainer(factory(context, undefined));
      }

      inject('services', container);
    },
    Nuxt3ServicePlugin: (nuxtApp) => {
      // Make sure services are only setup once
      if (!Object.isFrozen(container)) {
        setupServiceContainer(factory(nuxtApp, undefined));
      }

      nuxtApp.provide('services', container);
    },
    // Install as vue plugin
    VueServicePlugin: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      install(vueInstance: any) {
        // Make sure services are only setup once
        if (!Object.isFrozen(container)) {
          setupServiceContainer(factory(undefined, vueInstance));
        }

        if (isVue2) {
          vueInstance.prototype.$services = container;
        } else {
          vueInstance.config.globalProperties.$services = container;
        }
      }
    }
  } as IServiceContainer<TServices, TContext>;
}
