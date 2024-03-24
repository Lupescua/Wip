# Vue service adaper
This adapter makes it easier to consume services in Vue and Nuxt by exposing them on the Vue instance/Nuxt context and thought the useServices composeable. Observables from the services are converted to Vue Refs for native reactivity in Vue components. Currently supports both Nuxt2 and Nuxt3.

## Setup
Install the package using npm

```
npm i @salling-group/service-adapter-vue
```

If the project is running Vue <= 2.6 or Nuxt 2, the composition API package must also be installed. For Vue version 2.7 and above, Composition API is build into Vue and the package is therefore not needed.

To install the composition API, install either `@vue/composition-api` for Vue or `@nuxtjs/composition-api` for Nuxt.

> :information_source: Composition API package is not required for adapter versions before 2.0.0

```
npm i @vue/composition-api
```
or
```
npm i @nuxtjs/composition-api
```

Then create a service.ts/js file in the plugins folder, to install the services as a plugin.

If installing for Vue use the following approach
``` TypeScript
import { createServiceContainer } from '@salling-group/service-adapter-vue';
import { createApp } from 'vue';
import { App } from 'vue-demi';

// When installing as a Vue plugin, context will be undefined
// and app will be the Vue instance
function serviceFactory(context?: unknown, app?: App) {
  return {
    testService: new testService(app!)
  };
}

// Export useServices so it can be imported in components
export const { VueServicePlugin, useServices } = createServiceContainer(serviceFactory);

// Vue 2 approach
Vue.use(VueServicePlugin);

// Vue 3 approach
const app = createApp({});
app.use(VueServicePlugin);
```

If installing for Nuxt use the following approach
``` TypeScript
import { createServiceContainer } from '@salling-group/service-adapter-vue';
import { App } from 'vue-demi';
import { Context } from '@nuxt/types';

// When installing as a Nuxt plugin, app will be undefined
// and context will be the nuxt context
function serviceFactory(context?: Context, app?: App) {
  return {
    testService: new testService(context!)
  };
}

// Export useServices so it can be imported in components
export const { NuxtServicePlugin, useServices } = createServiceContainer(serviceFactory);

export default NuxtServicePlugin;
```

> :warning: Services MUST be installed, either as a Nuxt or Vue plugin. If services are not installed, `useServices` will return an empty object, and `$services` will be undefined.

## Using services

Services can be accessed both through the Vue app instance or Nuxt context (depending on how it was installed), and by importing the `useServices` function.

``` TypeScript
import { useServices } from './plugins/services';

// Vue
const { testService } = this.$services;

// Nuxt
const { testService } = context.$services;

// Universal
const { testService } = useServices();
```

> :information_source: When using services inside the setup function in composition API, the Vue instance is not available, so `useServices` function or Nuxt context must be used.

## Typing

When using `useServices`, types are infered automatically.

When using services through the Nuxt context and Vue instance, we have to augment the context/instance with the service types.

### Nuxt types

``` TypeScript
declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $services: GetServices<typeof serviceFactory>;
  }

  interface Context {
    $services: GetServices<typeof serviceFactory>;
  }
}
```

### Vue types

``` TypeScript
declare module 'vue' {
  export interface ComponentCustomProperties {
    $services: GetServices<typeof factory>;
  }
}
```
## Hooks

### useLoading

Used to check if an action is currently running.

``` TypeScript
import { useLoading } from '@salling-group/service-adapter-vue';
import { useServices } from './plugins/services';
import { Ref } from 'vue-demi';

const { testService } = useServices();

// testAction is the name of an action inside the testService
const isTestActionLoading: Ref<boolean> = useLoading(testService.eventHub, 'testAction');
```
### useObservable

Used to consume an observable as a Vue ref.

``` TypeScript
import { useObservable } from '@salling-group/service-adapter-vue';
import { useServices } from './plugins/services';
import { Ref } from 'vue-demi';
import { Observable, of } from 'rxjs';

const { testService } = useServices();

const observable: Observable<string> = of('Test observable')

const reactiveValue: Ref<string | undefined> = useObservable(observable);
```

### useEventHub

Used to add callbacks to service actions.

``` TypeScript
import { useServices } from './plugins/services';
import { useEventHub } from '@salling-group/service-adapter-vue';
import { IActionEventHubMessage } '@salling-group/core-service';

function TEST_ACTION_START(event: IActionEventHubMessage): void {
  console.log('Test action started');
}

function TEST_ACTION_ERROR(event: IActionEventHubMessage): void {
  console.log('Test action failed ;(');
}

function celebrate(event: IActionEventHubMessage): void {
  console.log('🎉');
}

const { testService } = useServices();

useEventHub(testService.eventHub, {
  TEST_ACTION_START,
  TEST_ACTION_SUCCESS: celebrate,
  TEST_ACTION_ERROR
});

testService.testAction();
```