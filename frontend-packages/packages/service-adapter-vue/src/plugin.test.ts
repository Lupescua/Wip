import { shallowMount, VueWrapper } from '@vue/test-utils';
import { Action, IEmitableObservable, Service } from '@salling-group/core-service';
import { Observable, of } from 'rxjs';
import { ComponentPublicInstance } from 'vue';
import { useEventHub } from './hooks/useEventHub';
import { createServiceContainer, GetServices, ServiceFactory } from './plugin';

declare module 'vue' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  export interface ComponentCustomProperties {
    $services: GetServices<typeof factory>;
  }
}

class TestService extends Service<{ id: string }> {
  public constructor() {
    super({ id: 'INITIAL' });
  }
  public get getter(): Observable<string> {
    return this.selector((s) => s.id);
  }

  @Action()
  public update(id: string): IEmitableObservable<{ id: string }> {
    return this.setState(() => of({ id }));
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const factory = () => ({
  testService: new TestService()
});

const { useServices, VueServicePlugin } = createServiceContainer(factory);

describe('Vue3ServiceContainer', () => {
  it('should update when changed', async () => {
    const wrapper: VueWrapper<ComponentPublicInstance> = shallowMount(
      {
        template: '<div>{{ services.testService.getter }}</div>',
        setup() {
          useEventHub(useServices().testService.eventHub, {
            UPDATE_START: console.log
          });

          return {
            services: useServices()
          };
        }
      },
      {
        global: {
          plugins: [VueServicePlugin]
        }
      }
    );

    const initialText = wrapper.text();
    wrapper.vm.$services.testService.update('UPDATED');
    await wrapper.vm.$nextTick();

    expect(initialText).toBe('INITIAL');
    expect(wrapper.text()).toBe('UPDATED');
  });
});

describe('NuxtServicePlugin', () => {
  it('calls nuxt inject as expected', () => {
    const inject = jest.fn();

    const factory: ServiceFactory<{ testService: TestService }, { store: {} }> = jest.fn(
      (context) => {
        return {
          testService: new TestService()
        };
      }
    );

    const { NuxtServicePlugin } = createServiceContainer(factory);

    NuxtServicePlugin({ store: {} }, inject);

    expect(factory).toHaveBeenCalledWith({ store: {} }, undefined);
    expect(inject).toHaveBeenCalledWith('services', expect.anything());
  });
});
