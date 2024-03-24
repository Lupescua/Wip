import { render } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';
import { Service, ServiceCollection } from '@salling-group/core-service';
import React, { createElement, Profiler, ReactElement } from 'react';
import { Observable } from 'rxjs';
import { createServiceHook, useService } from '../useService';

class TestService extends Service<{ id: string }> {
  public constructor(initial: { id: string }) {
    super(initial);
  }

  public get objectGetter(): Observable<{ id: string }> {
    return this.selector((s) => s);
  }
  public get getterOne(): Observable<string> {
    return this.selector((s) => s.id);
  }
  public methodOne(id: string): void {
    this.setState({ id });
  }
}

describe('useService', () => {
  let service: TestService;
  beforeEach(() => {
    service = new TestService({ id: 'ID' });
  });

  it('returns all public service members', () => {
    const renderer = renderHook(() => useService(service));
    const current = renderer.result.current;

    expect(current.getterOne).toBe('ID');
    expect(current.eventHub).toBe(service.eventHub);
    expect(current.getValue).not.toBeUndefined();
    expect(current.methodOne).not.toBeUndefined();
  });

  it('reacts lazily on observable emissions', () => {
    const renderer = renderHook(() => useService(service));

    const update = (id: string): void => {
      act(() => {
        service.methodOne(id);
      });
    };

    update('ID_1');
    update('ID_2');

    const initialId = renderer.result.current.getterOne;

    update('ID_3');
    update('ID_4');

    expect(renderer.result.all.length).toBe(3);
    expect(initialId).toBe('ID_2');
    expect(renderer.result.current.getterOne).toBe('ID_4');
  });

  it('should not trigger an update on the initial subscription', () => {
    const onRenderMock = jest.fn();

    render(
      createElement(
        (): ReactElement => {
          const { objectGetter } = useService(service);
          return createElement(
            Profiler,
            { id: 'test', onRender: onRenderMock },
            objectGetter.id
          );
        }
      )
    );

    expect(onRenderMock.mock.calls[0][1]).toBe('mount');
    expect(onRenderMock.mock.calls[1]).toBeUndefined();
  });
});

describe('createServiceHook', () => {
  it('returns a valid service hook', () => {
    const collection = new ServiceCollection({
      test: new TestService({ id: 'ID' })
    });

    const context = React.createContext(collection);
    const useHook = createServiceHook('test', context);

    const renderer = renderHook(() => useHook());
    expect(Object.keys(renderer.result.current)).toEqual([
      'objectGetter',
      'getterOne',
      'methodOne',
      'eventHub',
      'getPredictedValue',
      'getValue',
      'resetState'
    ]);
  });
});
