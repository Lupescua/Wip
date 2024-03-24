import { EMPTY, Observable } from 'rxjs';
import { ignoreElements, take, switchMap } from 'rxjs/operators';
import { ITracker } from '@salling-group/tracking-service';
import {
  IBasketPayload,
  IPdpViewedPayload,
  IProductClickedPayload,
  IRecipeClickedPayload,
  IFilterClickedPayload,
  IFilterPayload,
  ITrackingSystems,
  ITrackingProduct,
  IHomeDeliveryTrackingRecipe
} from '.';
import {
  IAlgoliaTrackingEvent,
  IAlgoliaTrackingResult
} from '@salling-group/algolia-api';
import { IRequestResult } from '@salling-group/request-handlers';

/**
 * @public
 */
export interface IAlgoliaTrackerConfig<TProductExtension = {}, TRecipeExtension = {}> {
  getUserId: (enableGuestId: boolean) => Observable<string>;
  trackEvents: (
    events: IAlgoliaTrackingEvent[]
  ) => Observable<IRequestResult<IAlgoliaTrackingResult>>;
  getProductObjectId?: (product: ITrackingProduct & TProductExtension) => string;
  getRecipeObjectId?: (recipe: IHomeDeliveryTrackingRecipe & TRecipeExtension) => string;
}

/**
 * @public
 */
export class AlgoliaTracker<TProductExtension = {}, TRecipeExtension = {}>
  implements ITracker<ITrackingSystems<TProductExtension, TRecipeExtension>> {
  private readonly _config: Required<
    IAlgoliaTrackerConfig<TProductExtension, TRecipeExtension>
  >;

  public constructor(config: IAlgoliaTrackerConfig<TProductExtension, TRecipeExtension>) {
    // Provide default selectors if no one provided
    const {
      getProductObjectId = (product) => product.id,
      getRecipeObjectId = (recipe) => recipe.id
    } = config;

    this._config = {
      ...config,
      getProductObjectId,
      getRecipeObjectId
    };
  }

  public productClicked(
    payload: IProductClickedPayload<TProductExtension>
  ): Observable<void> {
    return this._getUserId().pipe(
      switchMap((id: string) => {
        const productId = this._config.getProductObjectId(payload.product);
        if (!payload.sorting || !productId) return EMPTY;
        const position = payload.product.positionZeroIndexed
          ? payload.product.positionZeroIndexed + 1
          : 1;

        let algoliaEvent: IAlgoliaTrackingEvent = {
          eventName: this._createEventName('Product Clicked', payload),
          eventType: 'click',
          userToken: id,
          index: payload.sorting,
          objectIDs: [productId]
        };

        if (payload.search?.searchId) {
          algoliaEvent = {
            ...algoliaEvent,
            queryID: payload.search.searchId,
            positions: [position]
          };
        }

        return this._track(algoliaEvent);
      }),
      ignoreElements()
    );
  }

  public pdpViewed(payload: IPdpViewedPayload<TProductExtension>): Observable<void> {
    return this._getUserId().pipe(
      switchMap((id: string) => {
        const productId = this._config.getProductObjectId(payload.product);
        if (!payload.index || !productId) return EMPTY;
        const algoliaEvent: IAlgoliaTrackingEvent = {
          eventName: this._createEventName('Product Viewed', { page: 'PDP' }),
          eventType: 'view',
          userToken: id,
          index: payload.index,
          objectIDs: [productId]
        };

        return this._track(algoliaEvent);
      }),
      ignoreElements()
    );
  }

  public addedToBasket(payload: IBasketPayload<TProductExtension>): Observable<void> {
    return this._getUserId().pipe(
      switchMap((id: string) => {
        if (!payload.sorting || !payload.products.length) return EMPTY;
        const algoliaEvent: IAlgoliaTrackingEvent = {
          eventName: this._createEventName('Product Added To Basket', payload),
          eventType: 'conversion',
          userToken: id,
          index: payload.sorting,
          objectIDs: payload.products.map((product) =>
            this._config.getProductObjectId(product)
          )
        };

        if (payload.search?.searchId) algoliaEvent.queryID = payload.search?.searchId;

        return this._track(algoliaEvent);
      }),
      ignoreElements()
    );
  }

  public filtersViewed(payload: IFilterPayload): Observable<void> {
    return this._getUserId().pipe(
      switchMap((id: string) => {
        if (!payload.indexName || !payload.filters.length) return EMPTY;
        const algoliaEvent: IAlgoliaTrackingEvent = {
          eventName: this._createEventName('Filters Viewed', payload),
          eventType: 'view',
          userToken: id,
          index: payload.indexName,
          filters: payload.filters.map(({ key, value }) => `${key}:${value}`)
        };
        return this._track(algoliaEvent);
      }),
      ignoreElements()
    );
  }

  public filtersClicked(payload: IFilterClickedPayload): Observable<void> {
    return this._getUserId().pipe(
      switchMap((id: string) => {
        if (!payload.indexName || !payload.filters.length) return EMPTY;
        const algoliaEvent: IAlgoliaTrackingEvent = {
          eventName: `${this._createEventName('Filters Clicked', payload)} > ${
            payload.action
          }`,
          eventType: 'click',
          userToken: id,
          index: payload.indexName,
          filters: payload.filters.map(({ key, value }) => `${key}:${value}`)
        };
        return this._track(algoliaEvent);
      }),
      ignoreElements()
    );
  }

  public recipeClicked(
    payload: IRecipeClickedPayload<TRecipeExtension>
  ): Observable<void> {
    return this._getUserId().pipe(
      switchMap((id: string) => {
        const recipeId = this._config.getRecipeObjectId(payload.recipe);
        if (!payload.sorting || !recipeId) return EMPTY;

        const position = payload.recipe.positionZeroIndexed
          ? payload.recipe.positionZeroIndexed + 1
          : 1;

        let algoliaEvent: IAlgoliaTrackingEvent = {
          eventName: this._createEventName('Recipe Clicked', payload),
          eventType: 'click',
          userToken: id,
          index: payload.sorting,
          objectIDs: [recipeId]
        };

        if (payload.search?.searchId) {
          algoliaEvent = {
            ...algoliaEvent,
            queryID: payload.search?.searchId,
            positions: [position]
          };
        }

        return this._track(algoliaEvent);
      }),
      ignoreElements()
    );
  }

  private _getUserId(): Observable<string> {
    return this._config.getUserId(true).pipe(take(1));
  }

  private _createEventName(
    name: string,
    payload: Pick<IProductClickedPayload, 'page' | 'listName'>
  ): string {
    return `${name} > ${payload.page}`;
  }

  private _track(
    event: IAlgoliaTrackingEvent
  ): Observable<IRequestResult<IAlgoliaTrackingResult>> {
    return this._config.trackEvents([event]);
  }
}
