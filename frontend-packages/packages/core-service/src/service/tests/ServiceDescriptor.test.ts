import { isObservable, Observable, of } from 'rxjs';
import { Service } from '../Service';
import { ServiceDescriptor } from '../ServiceDescriptor';

class TestService extends Service<{ id: string }> {
  public constructor(initialState: { id: string }) {
    super(initialState);
  }

  public get getterOne(): Observable<string> {
    return of('getterOne');
  }
}

describe('ServiceDescriptor', () => {
  let service: TestService;
  beforeEach(() => {
    service = new TestService({ id: 'ID' });
  });

  describe('observables', () => {
    it('defines all observable service members', () => {
      const descriptor = ServiceDescriptor.describe(service);
      const members = [...descriptor.observables];

      for (const member of members) {
        const value = descriptor.observables[member];
        expect(Reflect.has(service, member)).toBe(true);
        expect(isObservable(value)).toBe(true);
      }
    });
  });

  describe('members', () => {
    it('defines all non-observable service members', () => {
      const descriptor = ServiceDescriptor.describe(service);
      const members = [...descriptor.members];

      for (const member of members) {
        const value = descriptor.members[member];
        expect(Reflect.has(service, member)).toBe(true);
        expect(isObservable(value)).toBe(false);
      }
    });
  });

  describe('describe', () => {
    it("only instantiates once per service during the service's lifetime", () => {
      const descriptor = ServiceDescriptor.describe(service);
      const sameDescriptor = ServiceDescriptor.describe(service);

      expect(descriptor === sameDescriptor).toBeTruthy();
    });
  });

  describe('getCurrentValue', () => {
    it('returns current value of all service observables', () => {
      const descriptor = ServiceDescriptor.describe(service);

      expect(descriptor.getCurrentValue()).toEqual({
        getterOne: 'getterOne'
      });
    });
  });
});
