import { Service } from '../Service';
import { ServiceCollection } from '../ServiceCollection';

class TestService extends Service<{ id: string }> {
  public constructor(initialState: { id: string }) {
    super(initialState);
  }
}

describe('ServiceCollection', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let serviceCollection: ServiceCollection<{ test: TestService }>;

  beforeEach(() => {
    serviceCollection = new ServiceCollection({
      test: new TestService({ id: 'ID' })
    });
  });

  describe('getService', () => {
    it('returns the service instance if instantiated', () => {
      const service = serviceCollection.getService('test');

      const isInstanceOf = service instanceof TestService;
      const isSameInstance = service === serviceCollection.getService('test');

      expect(isInstanceOf).toBe(true);
      expect(isSameInstance).toBe(true);
    });

    it('throws if the service is not instantiated', () => {
      serviceCollection = new ServiceCollection({});
      try {
        expect(serviceCollection.getService('DOES_NOT_EXIST' as never)).toThrowError();
        // eslint-disable-next-line no-empty
      } catch (error) {}
    });
  });
});
