/* eslint-disable @typescript-eslint/no-explicit-any */
import { Service } from './Service';

/**
 * @public
 */
export interface ICollection {
  [key: string]: Service<any>;
}

/**
 * @public
 */
export class ServiceCollection<TServices extends ICollection> {
  private _services: Map<string, Service<any>>;

  public constructor(services: TServices) {
    this._services = new Map(Object.entries(services));
  }

  public getService<TService extends Service<any>>(
    key: string & keyof TServices
  ): TService {
    if (!this._services.has(key)) {
      throw new Error(`No service instance found for ${key}`);
    }

    return this._services.get(key)! as TService;
  }
}
