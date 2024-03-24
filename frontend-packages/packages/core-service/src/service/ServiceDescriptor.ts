/* eslint-disable @typescript-eslint/no-explicit-any */
import { BehaviorSubject, combineLatest, from, isObservable, Observable, of } from 'rxjs';
import { map, mergeMap, multicast, refCount } from 'rxjs/operators';
import { Service } from './Service';

/**
 * @public
 */
export type InferService<TService> = {
  [TKey in keyof TService]: TService[TKey] extends Observable<infer U>
    ? U
    : TService[TKey];
};

/**
 * @public
 */
export const DESCRIPTOR: unique symbol = Symbol('ServiceDescriptor');

/**
 * @public
 */
export const MEMBERS: unique symbol = Symbol('ServiceMembers');

/**
 * @public
 */
export interface IPropertyDescriptor
  extends Required<Pick<PropertyDescriptor, 'get' | 'configurable'>> {
  isObservable: boolean;
  propertyKey: any;
  configurable: boolean;
  get: () => any;
}

/**
 * A BehaviorSubject for holding the current value of all observable members
 * on a service as an object. this.getValue() will provide the latest values.
 *
 * @internal
 */
class ServiceSubject<
  TMap extends PartialService<Observable<any>>
> extends BehaviorSubject<any> {
  // istanbul ignore next
  public constructor(memberMap: TMap) {
    super({});

    from([...memberMap])
      .pipe(
        mergeMap((key) => combineLatest([of(key), memberMap[key]])),
        map(([key, value]) => ({ ...this.getValue(), [key]: value })),
        multicast(this),
        refCount()
      )
      .subscribe();
  }
}

/**
 * Reflects a range of properties on a Service instance. Service values
 * can be accessed as they normally would through o[k].
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class PartialService<TValue> {
  public [MEMBERS]: Set<any> = new Set();

  public constructor(members: IPropertyDescriptor[]) {
    for (const member of members) {
      this[MEMBERS].add(member.propertyKey);
      Reflect.defineProperty(this, member.propertyKey, { ...member });
    }
  }

  /**
   * Provide member key extraction through [...this]
   */
  public *[Symbol.iterator](): Generator<
    Exclude<keyof this, typeof MEMBERS>,
    any,
    undefined
  > {
    for (const member of this[MEMBERS]) {
      yield member;
    }
  }

  [key: string]: TValue;
}

/**
 * Describes the prototype of a Service instance by collecting metadata about each member.
 * The ServiceDescriptor should be used in conjunction with framework adapters to receive
 * the necessary implementation details through a one time operation.
 *
 * @public
 */
export class ServiceDescriptor<TInstance extends Service<any>> {
  private readonly _serviceSubject: ServiceSubject<PartialService<Observable<any>>>;
  public readonly observables: PartialService<Observable<any>>;
  public readonly members: PartialService<unknown | ((...args: unknown[]) => unknown)>;

  private constructor(instance: TInstance) {
    const keys = ServiceDescriptor.getMemberKeys(instance, []);
    const descriptors = keys.map((key) => ServiceDescriptor.getMemberInfo(instance, key));
    const observables = descriptors.filter(({ isObservable }) => isObservable);
    const members = descriptors.filter(({ isObservable }) => !isObservable);

    this.observables = new PartialService(observables);
    this.members = new PartialService(members);
    this._serviceSubject = new ServiceSubject(this.observables);
  }

  /**
   * @returns - the current value of all observable service getters and fields.
   */
  public getCurrentValue(): InferService<TInstance> {
    return this._serviceSubject.getValue();
  }

  /**
   * Creates and attaches a service descriptor instance to a service.
   * Subsequent calls will return the descriptor attached to the service.
   */
  public static describe<TInstance extends Service<any>>(
    instance: TInstance
  ): ServiceDescriptor<TInstance> {
    if (Reflect.has(instance, DESCRIPTOR)) {
      return Reflect.get(instance, DESCRIPTOR);
    }

    const descriptor = new ServiceDescriptor(instance);
    Reflect.defineProperty(instance, DESCRIPTOR, {
      configurable: false,
      get: () => descriptor
    });

    return descriptor;
  }

  /**
   * Returns an extended property descriptor object that forwards
   * the actual instance property through a getter.
   */
  public static getMemberInfo<TInstance extends object>(
    instance: TInstance,
    key: keyof TInstance
  ): IPropertyDescriptor {
    const value = Reflect.get(instance, key);
    return {
      propertyKey: key,
      isObservable: isObservable(value),
      configurable: false,
      get: () => (typeof value === 'function' ? value.bind(instance) : value)
    };
  }

  /**
   * Recursively walk all prototypes on the instance and return all property keys.
   */
  public static getMemberKeys<R extends any[]>(obj: any, keys: any): R {
    const prototype = Reflect.getPrototypeOf(obj);
    if (!prototype || Object.is(prototype, Object.prototype)) return keys as R;

    return this.getMemberKeys(
      prototype,
      [...keys, ...Reflect.ownKeys(prototype)].filter(
        (key) => !['constructor', 'setState', 'selector', 'state'].includes(key)
      )
    );
  }
}
