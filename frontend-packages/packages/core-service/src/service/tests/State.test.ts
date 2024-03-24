import { rxSandbox, RxSandboxInstance } from 'rx-sandbox';
import { State, StateReducer } from '../State';

interface IState {
  idA: string;
  idB: string;
  idC: string;
}

describe('State', () => {
  let state: State<IState>;
  let scheduler: RxSandboxInstance;
  let createReducer: (value: Partial<IState>) => StateReducer<IState>;
  beforeEach(() => {
    state = new State<IState>({ idA: '', idB: '', idC: '' }, true);
    scheduler = rxSandbox.create(false);
    createReducer = (value: Partial<IState>) => {
      return (state) => ({ ...state, ...value });
    };
  });

  describe('asObservable', () => {
    it('should return an observable state', () => {
      const { getMessages, e, flush } = scheduler;

      const messages = getMessages(state.asObservable());
      flush();

      expect(messages).toEqual(
        e('a', {
          a: {
            idA: '',
            idB: '',
            idC: ''
          }
        })
      );
    });
  });

  describe('getPredictedValue', () => {
    it('should return the current value of the accumulated state', () => {
      expect(state.getPredictedValue()).toEqual({ idA: '', idB: '', idC: '' });
    });
  });

  describe('getValue', () => {
    it('should return current value of the state', () => {
      expect(state.getValue()).toEqual({ idA: '', idB: '', idC: '' });
    });
  });

  describe('next', () => {
    it('should set the state', () => {
      const { flush } = scheduler;

      state.next({ idA: 'A', idB: 'B', idC: 'C' });
      flush();

      expect(state.getValue()).toEqual({ idA: 'A', idB: 'B', idC: 'C' });
    });
  });

  describe('optimisticNext', () => {
    it('should accumulate the predicted state', () => {
      const { cold, e, getMessages, flush } = scheduler;
      const reducerA = createReducer({ idA: 'A' });
      const reducerB = createReducer({ idB: 'B' });
      const reducerC = createReducer({ idC: 'C' });

      const sourceA = cold('---a|', { a: reducerA });
      const sourceB = cold('--a|', { a: reducerB });
      const sourceC = cold('-#|', { a: reducerC });

      state.optimisticNext(reducerA, sourceA);
      state.optimisticNext(reducerB, sourceB);
      state.optimisticNext(reducerC, sourceC);

      const messages = getMessages(state);
      flush();

      rxSandbox.marbleAssert(messages).to.equal(
        e('abcd', {
          // All prediction accumulated
          // C(B(A(state)))
          a: {
            idA: 'A',
            idB: 'B',
            idC: 'C'
          },
          // C was removed
          // B(A(state))
          b: {
            idA: 'A',
            idB: 'B',
            idC: ''
          },
          // B was applied to the state
          // A(state)
          c: {
            idA: 'A',
            idB: 'B',
            idC: ''
          },
          // A was applied to the state
          d: {
            idA: 'A',
            idB: 'B',
            idC: ''
          }
        })
      );
    });

    it('should replace the active reducer when an update is pushed with same id', () => {
      const { cold, e, getMessages, flush } = scheduler;

      const reducerA1 = createReducer({ idA: 'A1' });
      const reducerA2 = createReducer({ idA: 'A2' });

      const sourceA1 = cold('---a|', { a: reducerA1 });
      const sourceA2 = cold('--a|', { a: reducerA2 });

      state.optimisticNext(reducerA1, sourceA1, { id: 'A' });
      state.optimisticNext(reducerA2, sourceA2, { id: 'A' });

      const messages = getMessages(state);
      flush();

      rxSandbox.marbleAssert(messages).to.equal(
        e('a-b', {
          // All prediction accumulated
          a: {
            idA: 'A2',
            idB: '',
            idC: ''
          },
          b: {
            idA: 'A2',
            idB: '',
            idC: ''
          }
        })
      );
    });
  });
});
