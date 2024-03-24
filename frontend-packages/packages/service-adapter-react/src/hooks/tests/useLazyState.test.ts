import '@testing-library/jest-dom';
import { act, renderHook } from '@testing-library/react-hooks';
import { useLazyState } from '../useLazyState';

describe('useLazyState', () => {
  it('will only trigger updates on a state property after is has been consumed', async () => {
    const renderer = renderHook(() =>
      useLazyState({ prop1: 'UPDATE_1', prop2: 'NO_UPDATE_1' })
    );

    const actSetState: typeof renderer.result.current[1] = (key, value) => {
      act(() => renderer.result.current[1](key, value));
    };

    // Binds the property, so any changes to state.id will cause an update
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [{ prop1 }] = renderer.result.current;

    actSetState('prop2', 'NO_UPDATE_2');
    actSetState('prop2', 'NO_UPDATE_3');
    // Trigger update
    actSetState('prop1', 'UPDATE_2');
    actSetState('prop2', 'NO_UPDATE_4');
    actSetState('prop2', 'NO_UPDATE_5');
    // Trigger update
    actSetState('prop1', 'UPDATE_3');
    actSetState('prop2', 'NO_UPDATE_6');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [{ prop2 }] = renderer.result.current;

    // Trigger update
    actSetState('prop2', 'UPDATE_4');

    expect(renderer.result.current[0].prop1).toBe('UPDATE_3');
    expect(renderer.result.current[0].prop2).toBe('UPDATE_4');
    // Total hook updates (rerenders)
    expect(renderer.result.all.length).toBe(4);
  });

  it('includes the constants values in the result if provided', () => {
    const renderer = renderHook(() =>
      useLazyState({}, { constantValue: 'I_WONT_EVER_CHANGE' })
    );

    const [{ constantValue }] = renderer.result.current;
    expect(constantValue).toBe('I_WONT_EVER_CHANGE');
  });
});
