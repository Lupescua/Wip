import { Service } from '@salling-group/core-service';
import { Observable } from 'rxjs';

/**
 * @public
 */
export interface IKeyValueServiceConfig<TRecord> {
  initialState: TRecord;
}

/**
 * @public
 */
export interface IKeyValueService<TRecord> {
  get<TKey extends keyof TRecord>(key: TKey): Observable<TRecord[TKey]>;
  set<TKey extends keyof TRecord>(key: TKey, value: TRecord[TKey]): void;
}

/**
 * @public
 */
export class KeyValueService<TRecord>
  extends Service<TRecord>
  implements IKeyValueService<TRecord> {
  public constructor(config: IKeyValueServiceConfig<TRecord>) {
    super(config.initialState);
  }

  public get<TKey extends keyof TRecord>(key: TKey): Observable<TRecord[TKey]> {
    return this.selector((state) => state[key]);
  }

  public set<TKey extends keyof TRecord>(key: TKey, value: TRecord[TKey]): void {
    this.setState((state) => ({ ...state, [key]: value }));
  }
}
