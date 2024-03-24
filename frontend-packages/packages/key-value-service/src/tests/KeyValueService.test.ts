import { rxSandbox, RxSandboxInstance } from 'rx-sandbox';
import { KeyValueService } from '../KeyValueService';

interface IRecordType {
  setting1: string;
  setting2: boolean;
  setting3: number;
}

describe('KeyValueService', () => {
  let service: KeyValueService<IRecordType>;
  let scheduler: RxSandboxInstance;

  beforeEach(() => {
    scheduler = rxSandbox.create(true);
    service = new KeyValueService<IRecordType>({
      initialState: {
        setting1: 'initial',
        setting2: false,
        setting3: 1
      }
    });
  });

  describe('get', () => {
    it('emits value from state', () => {
      const { getMessages, e } = scheduler;

      const result = getMessages(service.get('setting1'));

      expect(result).toEqual(e('a', { a: 'initial' }));
    });
  });

  describe('set', () => {
    it('sets value to state', () => {
      service.set('setting3', 3);

      expect(service.getValue()).toEqual({
        setting1: 'initial',
        setting2: false,
        setting3: 3
      });
    });
  });
});
