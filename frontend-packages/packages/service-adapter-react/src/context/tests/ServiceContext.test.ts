import { renderHook } from '@testing-library/react-hooks';
import {
  Action,
  IEmitableObservable,
  Service,
  ServiceCollection
} from '@salling-group/core-service';
import { Observable, of } from 'rxjs';
import { createServiceContext, ServiceContextApi } from '../ServiceContext';

interface ITestState {
  id: string;
}

interface IGenericState<A, B, C> {
  a: A;
  b: B;
  c: C;
}

class TestService extends Service<ITestState> {
  public constructor(initial: ITestState) {
    super(initial);
  }
}

class GenericService<A, B, C> extends Service<IGenericState<A, B, C>> {
  public constructor(initial: IGenericState<A, B, C>) {
    super(initial);
  }

  public get getter(): Observable<B> {
    return this.selector((s) => s.b);
  }

  @Action()
  public action(): IEmitableObservable<string> {
    return of('');
  }
}

describe('ServiceContext', () => {
  let context: ServiceContextApi<{
    Test: TestService;
    GenericService: GenericService<string, boolean, string[]>;
  }>;
  let staticProps: unknown;
  beforeEach(() => {
    context = createServiceContext(({ staticProps }) => ({
      Test: new TestService(staticProps.Test),
      GenericService: new GenericService<string, boolean, string[]>(
        staticProps.GenericService
      )
    }));
    staticProps = {
      GenericService: {
        a: '',
        b: false,
        c: []
      }
    };
  });
  it('should throw when attempting to access an uninitialized property on the context', () => {
    try {
      expect(context.useGenericService()).toThrow(
        'useServiceContext must be applied before accessing service hooks'
      );
      // eslint-disable-next-line no-empty
    } catch (error) {}
  });
  it('returns the expected context hooks', () => {
    const renderer = renderHook(() => context.useServiceContext(staticProps));

    expect(renderer.result.current.context).toBeDefined();
    expect(
      renderer.result.current.serviceCollection instanceof ServiceCollection
    ).toBeTruthy();
    expect(context.useTestService).toEqual(expect.any(Function));
    expect(context.useGenericService).toEqual(expect.any(Function));
    expect(Reflect.get(context, 'doNotExist')).toBeUndefined();
  });
});
