import { rxSandbox, RxSandboxInstance } from 'rx-sandbox';
import { useObservable } from '../useObservable';

describe('useObservable', () => {
  let scheduler: RxSandboxInstance;

  beforeEach(() => {
    scheduler = rxSandbox.create();
  });

  it('subscribes and takes the original value as initial state', () => {
    const { hot, flush } = scheduler;

    const observable$ = hot('a^--', { a: 'initial value' });

    const result = useObservable(observable$);
    flush();

    expect(result.value).toEqual('initial value');
  });

  it('subscribes to the observable and returns the emitted value', () => {
    const { hot, flush } = scheduler;

    const observable$ = hot('a^-b', { a: 'initial value', b: 'new value' });

    const result = useObservable(observable$);
    flush();

    expect(result.value).toEqual('new value');
  });
});
