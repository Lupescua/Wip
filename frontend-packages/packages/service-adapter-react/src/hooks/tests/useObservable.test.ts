import { act, renderHook } from '@testing-library/react-hooks';
import { useState } from 'react';
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

    const result = renderHook(() => useObservable(observable$));
    act(flush);

    expect(result.result.current).toEqual('initial value');
  });

  it('subscribes to the observable and returns the emitted value', () => {
    const { hot, flush } = scheduler;

    const observable$ = hot('a^-b', { a: 'initial value', b: 'new value' });

    const result = renderHook(() => useObservable(observable$));
    act(flush);

    expect(result.result.current).toEqual('new value');
  });

  it('resubscribes to the observable if dep array changes', () => {
    const { hot, flush, s } = scheduler;
    const state = renderHook(() => useState('dep start'));
    const observable$ = hot('a^-b', { a: 'initial value', b: 'new value' });

    renderHook(() => useObservable(observable$, [state.result.current]));
    act(() => state.result.current[1]('dep new'));
    act(flush);

    expect(observable$.subscriptions[1]).toEqual(s('^-!'));
    expect(observable$.subscriptions[2]).toEqual(s('--^'));
  });
});
