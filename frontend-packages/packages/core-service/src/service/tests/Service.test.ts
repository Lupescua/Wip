import { rxSandbox, RxSandboxInstance } from 'rx-sandbox';
import { Observable, of } from 'rxjs';
import { mapTo } from 'rxjs/operators';
import { Selector, Service, SetStateAction } from '../Service';

export interface IMockState {
  code: string;
  items: IMockItem[];
}

interface IMockItem {
  id: string;
  active: boolean;
}

class MockService extends Service<IMockState> {
  public constructor(initial: IMockState) {
    super(initial);
  }

  public get stateGetter(): Observable<IMockState> {
    return this.state;
  }

  public get activeItems(): Observable<IMockItem[]> {
    return this.selector((state) => state.items.filter((item) => item.active));
  }

  public get findBySelector(): Selector<IMockItem | undefined, [id: string]> {
    return this.selector(
      (items, id: string) => items.find((item) => item.id === id),
      this.activeItems
    );
  }

  public get selectorUsingSelector(): Selector<
    (IMockItem | undefined)[],
    [ids: string[]]
  > {
    return this.selector((items, ids) => ids.map((id) => items(id)), this.findBySelector);
  }

  public setStateFromObject(state: Partial<IMockState>): void {
    this.setState(state);
  }

  public setStateFromFn(
    state: SetStateAction<IMockState>
  ): Partial<IMockState> | Observable<Partial<IMockState>> {
    return this.setState(state);
  }

  public optimisticSetState(state: IMockState): Observable<IMockState> {
    return this.setState(
      (s) => ({ ...s, ...state }),
      of('B').pipe(mapTo((s) => ({ ...s, ...state })))
    );
  }
}

describe('Service', () => {
  let scheduler: RxSandboxInstance;
  let service: MockService;
  beforeEach(() => {
    scheduler = rxSandbox.create(true);
    service = new MockService({ items: [], code: 'start' });
  });

  describe('eventHub', () => {
    it('returns initialized eventHub', () => {
      expect(service.eventHub).not.toBeUndefined();
    });
  });

  describe('getState', () => {
    it('emits state', () => {
      const { getMessages, e } = scheduler;

      const result = getMessages(service.stateGetter);

      expect(result).toEqual(e('a', { a: { items: [], code: 'start' } }));
    });
  });

  describe('resetState', () => {
    it('sets state to initialState', () => {
      service.setStateFromObject({
        code: 'modified',
        items: [{ active: true, id: '123' }]
      });
      service.resetState();

      expect(service.getValue()).toEqual({ code: 'start', items: [] });
    });
  });

  describe('getPredictedValue', () => {
    it('should return the current value of the accumulated state', () => {
      expect(service.getPredictedValue()).toEqual({ items: [], code: 'start' });
    });
  });

  describe('getValue', () => {
    it('returns state', () => {
      const result = service.getValue();

      expect(result).toEqual({ items: [], code: 'start' });
    });
  });

  describe('selector', () => {
    it('emits mapped state', () => {
      const { getMessages, e } = scheduler;

      service.setStateFromObject({
        items: [
          { id: '1', active: true },
          { id: '2', active: false }
        ]
      });

      const result = getMessages(service.activeItems);

      expect(result).toEqual(e('a', { a: [{ id: '1', active: true }] }));
    });
    it('should emit the selector function when provided', () => {
      const mockFn = jest.fn((fn) => fn(['1']));
      service.selectorUsingSelector.subscribe(mockFn);

      service.setStateFromObject({
        items: [
          { id: '1', active: true },
          { id: '2', active: false }
        ]
      });

      expect(mockFn).toHaveReturnedWith([{ id: '1', active: true }]);
    });
  });

  describe('optimisticUpdate', () => {
    it('should set the state as expected', () => {
      const { getMessages } = scheduler;
      getMessages(service.optimisticSetState({ code: 'A', items: [] }));
      expect(service.getValue()).toEqual({ code: 'A', items: [] });
    });
  });

  describe('setState', () => {
    it('sets state correctly with object value', () => {
      const newState = { code: 'new' };

      service.setStateFromObject(newState);

      expect(service.getValue()).toEqual({ items: [], code: 'new' });
    });

    it('sets state correctly with state function', () => {
      const newState = { code: 'new' };

      service.setStateFromFn((state) => ({ ...state, ...newState }));

      expect(service.getValue()).toEqual({ items: [], code: 'new' });
    });

    it('sets state correctly with observable value', () => {
      const { getMessages } = scheduler;
      const newState = { code: 'new' };

      getMessages(
        service.setStateFromFn((state) =>
          of({ ...state, ...newState })
        ) as Observable<unknown>
      );

      expect(service.getValue()).toEqual({ items: [], code: 'new' });
    });
  });

  describe('constructor.setState', () => {
    it('should set the state correctly', () => {
      MockService.setState(service, { code: 'SET_STATE', items: [] });
      expect(service.getValue()).toEqual({ code: 'SET_STATE', items: [] });
    });
  });

  describe('constructor.getState', () => {
    it('should get state correctly', () => {
      const { getMessages, e } = scheduler;

      const result = getMessages(MockService.getState(service));

      expect(result).toEqual(e('a', { a: { items: [], code: 'start' } }));
    });
  });
});
