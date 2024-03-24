import { LayoutService } from '../LayoutService';
import { rxSandbox } from 'rx-sandbox';

interface IElements {
  drawer1: {};
  drawer2: {};
  dialog1: {};
  dialog2: {};
  dialog3: {
    payload: {
      error: string;
    };
  };
}

describe(LayoutService.name, () => {
  let service: LayoutService<{ [K in keyof IElements]: IElements[K] }>;

  beforeEach(() => {
    service = new LayoutService<{ [K in keyof IElements]: IElements[K] }>({
      elements: {
        drawer1: {
          conflicts: ['dialog2', 'drawer2']
        },
        drawer2: {},
        dialog1: {},
        dialog2: {},
        dialog3: {
          payload: { error: '' }
        }
      }
    });
  });

  describe('getElement', () => {
    it('should return an observable emitting the properties for the selected key', () => {
      const { getMessages, e } = rxSandbox.create(true);

      service.open('dialog3', { error: 'error' });

      const messages = getMessages(service.getElement('dialog3'));

      expect(messages).toEqual(
        e('a', {
          a: {
            isOpen: true,
            payload: { error: 'error' },
            index: 4
          }
        })
      );
    });

    it('should return an observable emitting properties where "isOpen" is false when "show" is false for the selected key', () => {
      const { getMessages, e } = rxSandbox.create(true);

      const messages = getMessages(service.getElement('dialog2'));

      expect(messages).toEqual(
        e('a', {
          a: {
            isOpen: false,
            index: 3
          }
        })
      );
    });

    it('should return an observable emitting properties where "isOpen" is true when "show" is true for the selected key', () => {
      const { getMessages, e } = rxSandbox.create(true);

      service.open('dialog2');

      const messages = getMessages(service.getElement('dialog2'));

      expect(messages).toEqual(
        e('a', {
          a: {
            isOpen: true,
            index: 4
          }
        })
      );
    });
  });

  describe('open', () => {
    it('sets state to true for selected element', () => {
      service.open('dialog1');
      service.open('drawer2');

      expect(service.getValue()).toEqual({
        elements: {
          drawer1: { conflicts: ['dialog2', 'drawer2'] },
          drawer2: { show: true },
          dialog1: { show: true },
          dialog2: {},
          dialog3: { payload: { error: '' } }
        }
      });
    });
    it('sets conflicting elements to false if any', () => {
      service.open('dialog2');
      service.open('drawer2');

      service.open('drawer1');

      expect(service.getValue()).toEqual({
        elements: {
          drawer1: { show: true, conflicts: ['dialog2', 'drawer2'] },
          drawer2: { show: false },
          dialog1: {},
          dialog2: { show: false },
          dialog3: { payload: { error: '' } }
        }
      });
    });
    it('should accept and persist a payload', () => {
      service.open('dialog3', { error: 'payload error' });

      expect(service.getValue()).toMatchObject({
        elements: {
          dialog3: { show: true, payload: { error: 'payload error' } }
        }
      });
    });
  });
  it('should append the opened key as last element', () => {
    service.open('dialog1');

    const elements = service.getValue().elements;
    const elementKeys = Object.keys(elements);

    expect(elementKeys[0]).toEqual('drawer1');
    expect(elementKeys[1]).toEqual('drawer2');
    expect(elementKeys[2]).toEqual('dialog2');
    expect(elementKeys[3]).toEqual('dialog3');
    expect(elementKeys[4]).toEqual('dialog1');
  });

  describe('close', () => {
    it('sets state to false for selected element', () => {
      service.open('dialog1');
      service.close('dialog1');

      expect(service.getValue()).toEqual({
        elements: {
          dialog1: { show: false },

          drawer1: { conflicts: ['dialog2', 'drawer2'] },
          drawer2: {},
          dialog2: {},
          dialog3: { payload: { error: '' } }
        }
      });
    });
  });

  describe('toggle', () => {
    it('sets state to false if current value is true', () => {
      service.open('dialog1');
      service.toggle('dialog1');

      expect(service.getValue()).toEqual({
        elements: {
          dialog1: { show: false },

          drawer1: { conflicts: ['dialog2', 'drawer2'] },
          drawer2: {},
          dialog2: {},
          dialog3: { payload: { error: '' } }
        }
      });
    });
    it('sets state to true if current value is false', () => {
      service.toggle('dialog1');

      expect(service.getValue()).toEqual({
        elements: {
          dialog1: { show: true },

          drawer1: { conflicts: ['dialog2', 'drawer2'] },
          drawer2: {},
          dialog2: {},
          dialog3: { payload: { error: '' } }
        }
      });
    });
  });
});
