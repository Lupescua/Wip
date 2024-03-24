import { IRequestHandler, IRequestResult } from '@salling-group/request-handlers';
import { Observable } from 'rxjs';
import { IAlgoliaConfig } from './AlgoliaApi';

/**
 * @public
 */
export interface IAlgoliaInsightsAPI {
  track: (
    events: IAlgoliaTrackingEvent[]
  ) => Observable<IRequestResult<IAlgoliaTrackingResult>>;
}

/**
 * @public
 */
export interface IAlgoliaTrackingEvent {
  eventName: string;
  eventType: 'click' | 'conversion' | 'view';
  index: string;
  objectIDs?: string[];
  filters?: string[];
  positions?: number[];
  queryID?: string;
  userToken: string;
}

/**
 * @public
 */
export interface IAlgoliaTrackingResult {
  status: number;
  message: string;
}

/**
 * @public
 */
export class AlgoliaInsightsAPI implements IAlgoliaInsightsAPI {
  private _requestHandler: IRequestHandler;
  private _config: IAlgoliaConfig;
  private _header: Record<string, string>;

  public constructor(requestHandler: IRequestHandler, config: IAlgoliaConfig) {
    this._requestHandler = requestHandler;
    this._config = config;
    this._header = {
      'X-Algolia-Application-Id': this._config.applicationId,
      'X-Algolia-API-Key': this._config.apiKey
    };
  }

  public track(
    events: IAlgoliaTrackingEvent[]
  ): Observable<IRequestResult<IAlgoliaTrackingResult>> {
    const url = this._config.baseURL;

    return this._requestHandler.request({
      method: 'POST',
      url,
      headers: this._header,
      data: {
        events
      }
    });
  }
}
