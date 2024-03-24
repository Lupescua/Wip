import { ITracker } from '@salling-group/tracking-service';
import { combineLatest, from, forkJoin, Observable, of, Subject } from 'rxjs';
import {
  concatMapTo,
  ignoreElements,
  map,
  mergeMap,
  switchMap,
  take,
  tap
} from 'rxjs/operators';
import {
  IRecipeClickedPayload,
  IRecipePdpViewedPayload,
  IRecipePlpViewedPayload
} from '.';
import { CookieConsentTracker } from './CookieConsentTracker';
import {
  Dimensions,
  IAddedToBasketEvent,
  ICheckoutEvent,
  ICookieAcceptEvent,
  ICTABannerClickedEvent,
  ICTABannerViewedEvent,
  IInitializeEvent,
  IOutboundLinkEvent,
  IPageViewEvent,
  IPdpViewedEvent,
  IPlpViewedEvent,
  IProductClickedEvent,
  IProductSubstitutedEvent,
  IPurchasedEvent,
  IRecipeClickedEvent,
  IRecipePdpViewedEvent,
  IRecipePlpViewedEvent,
  IRecommendationClickedEvent,
  IRecommendationViewedEvent,
  IRemovedFromBasketEvent,
  ISignupCompletedEvent,
  IAnonymousIdEvent,
  ITrackingIdEvent,
  IUserIdEvent,
  ILoginEvent,
  IFlipbookViewEvent
} from './gaTrackerTypes';
import {
  ensureTagManager,
  prepareAddToBasketData,
  prepareCheckoutData,
  preparePdpData,
  preparePlpData,
  prepareProductClickedData,
  preparePurchaseData,
  prepareRecipeClickedData,
  prepareRecipePdpViewedData,
  prepareRecipePlpViewedData,
  prepareRemovedFromBasketData
} from './gaTrackerUtils';
import { Queue } from './Queue';
import {
  IBasketPayload,
  ICheckoutPayload,
  ICookieConsentGivenPayload,
  ICTABannerClickedPayload,
  ICTABannerViewedPayload,
  IInitializePayload,
  IOrderPayload,
  IOutboundLinkClickedPayload,
  IPageViewedPayload,
  IPdpViewedPayload,
  IPlpViewedPayload,
  IProductClickedPayload,
  IProductSubstitutedPayload,
  IRecommendationClickedPayload,
  IRecommendationViewedPayload,
  ISignUpCompletedPayload,
  IAnonymousIdPayload,
  ITrackingIdPayload,
  IUserIdPayload,
  ILoginPayload,
  IFlipbookViewPayload
} from './TrackingPayloads';
import { ITrackingSystems } from './TrackingSystems';

/**
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IPushable {
  push: (data: unknown) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  some: (predicate: (value: any, index: number, array: any[]) => unknown) => boolean;
}

/**
 * @public
 * This is the type returned by the getProductsById
 * used to enrich the sparesome product data gathered on tracking time
 * Note: Currently it's not used, as no enriching is needed
 */
export interface ITrackingProduct {}

/**
 * @public
 */
export interface IGaTrackerConfig {
  getUserId: () => Observable<string>;
  getProductsById: (ids: string[]) => Observable<ITrackingProduct[]>;
}

/**
 * @public
 */
export class GaTracker
  extends CookieConsentTracker
  implements ITracker<ITrackingSystems> {
  private readonly _dataLayer: IPushable;
  private readonly _config: IGaTrackerConfig;

  public constructor(dataLayer: IPushable, config: IGaTrackerConfig) {
    super(new Queue(), new Subject());
    this._dataLayer = dataLayer;
    this._config = config;

    this._dequeue()
      .pipe(concatMapTo(this._queue))
      .subscribe((data) => this._dataLayer.push(data));
  }

  public initialize(payload: IInitializePayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._push<IInitializeEvent>({
          originalLocation: payload.location ?? ''
        });
      }),
      ignoreElements()
    );
  }

  public cookieConsentGiven(payload: ICookieConsentGivenPayload): Observable<void> {
    const consent$ = super.cookieConsentGiven(payload);
    return forkJoin([
      of([]).pipe(
        tap(() => {
          this._push<ICookieAcceptEvent>({
            event: 'gaGTMevent',
            eventAction: 'done',
            eventCategory: 'cookie-accept'
          });
        }),
        ignoreElements()
      ),
      consent$
    ]).pipe(ignoreElements());
  }

  public addedToBasket(payload: IBasketPayload): Observable<void> {
    const productIds = payload.products.map((p) => p.id);
    return combineLatest([this._getProductsById(productIds), this._getUserId()]).pipe(
      mergeMap(([products, userId]) =>
        prepareAddToBasketData({ products, payload, userId })
      ),
      tap((data) => {
        this._push<IAddedToBasketEvent>(data);
      }),
      ignoreElements()
    );
  }

  public checkout(payload: ICheckoutPayload<string>): Observable<void> {
    const productIds = payload.products.map((p) => p.id);
    return combineLatest([this._getProductsById(productIds), this._getUserId()]).pipe(
      mergeMap(([products, userId]) =>
        prepareCheckoutData({ products, payload, userId })
      ),
      tap((data) => {
        this._push<ICheckoutEvent>(data);
      }),
      ignoreElements()
    );
  }

  public ctaBannerClicked(payload: ICTABannerClickedPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._push<ICTABannerClickedEvent>({
          event: 'gaGTMevent',
          eventAction: 'click',
          eventCategory: `cta`,
          eventLabel: payload.ctaId
        });
      }),
      ignoreElements()
    );
  }

  public ctaBannerViewed(payload: ICTABannerViewedPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._push<ICTABannerViewedEvent>({
          event: 'gaGTMevent',
          eventAction: 'view',
          eventCategory: `cta`,
          eventLabel: payload.ctaId
        });
      }),
      ignoreElements()
    );
  }

  public outboundLinkClicked(payload: IOutboundLinkClickedPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._push<IOutboundLinkEvent>({
          event: 'externalClick',
          url: payload.url
        });
      }),
      ignoreElements()
    );
  }

  public pageViewed(payload: IPageViewedPayload): Observable<void> {
    return this._getUserId().pipe(
      tap((userId) => {
        this._push<IPageViewEvent>({
          event: 'createPageView',
          url: payload.path,
          custom_dimensions: {
            [Dimensions.VARIANT]: payload.variant ?? 'original',
            [Dimensions.LAYOUT]: payload.layout,
            [Dimensions.FORMAT]: payload.format,
            [Dimensions.USER_ID]: userId
          }
        });
      }),
      ignoreElements()
    );
  }

  public pdpViewed(payload: IPdpViewedPayload): Observable<void> {
    const productIds = [payload.product.id];
    return combineLatest([this._getProductsById(productIds), this._getUserId()]).pipe(
      map(([products, userId]) => preparePdpData({ products, payload, userId })),
      tap((data) => {
        this._push<IPdpViewedEvent>(data);
      }),
      ignoreElements()
    );
  }

  public plpViewed(payload: IPlpViewedPayload): Observable<void> {
    const productIds = payload.products.map((p) => p.id);
    return combineLatest([this._getProductsById(productIds), this._getUserId()]).pipe(
      mergeMap(([products, userId]) => preparePlpData({ products, payload, userId })),
      tap((data) => {
        this._push<IPlpViewedEvent>(data);
      }),
      ignoreElements()
    );
  }

  public productClicked(payload: IProductClickedPayload): Observable<void> {
    const productIds = [payload.product.id];
    return combineLatest([this._getProductsById(productIds), this._getUserId()]).pipe(
      map(([products, userId]) =>
        prepareProductClickedData({ products, payload, userId })
      ),
      tap((data) => {
        this._push<IProductClickedEvent>(data);
      }),
      ignoreElements()
    );
  }

  public productSubstituted(payload: IProductSubstitutedPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        const { reason, replacementObjectId, substitutionObjectId } = payload;

        this._push<IProductSubstitutedEvent>({
          event: 'gaGTMevent',
          eventAction: reason,
          eventCategory: 'Product substitution',
          eventLabel: replacementObjectId
            ? `${substitutionObjectId}|${replacementObjectId}`
            : substitutionObjectId
        });
      }),
      ignoreElements()
    );
  }

  public purchased(payload: IOrderPayload): Observable<void> {
    const productIds = payload.products.map((p) => p.id);
    return combineLatest([this._getProductsById(productIds), this._getUserId()]).pipe(
      mergeMap(([products, userId]) =>
        preparePurchaseData({ products, payload, userId })
      ),
      tap((data) => {
        this._push<IPurchasedEvent>(data);
      }),
      ignoreElements()
    );
  }

  public recommendationClicked(payload: IRecommendationClickedPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._push<IRecommendationClickedEvent>({
          event: 'gaGTMevent',
          eventAction: 'click',
          eventCategory: `personalization|${payload.page}|${payload.engine}`,
          eventLabel: `${payload.apiEndpoint}|${payload.objectId}`
        });
      }),
      ignoreElements()
    );
  }

  public recommendationViewed(payload: IRecommendationViewedPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._push<IRecommendationViewedEvent>({
          event: 'gaGTMevent',
          eventAction: 'view',
          eventCategory: `personalization|${payload.page}|${payload.engine}`,
          eventLabel: payload.apiEndpoint
        });
      }),
      ignoreElements()
    );
  }

  public removedFromBasket(payload: IBasketPayload): Observable<void> {
    const productIds = payload.products.map((p) => p.id);
    return combineLatest([this._getProductsById(productIds), this._getUserId()]).pipe(
      mergeMap(([products, userId]) =>
        prepareRemovedFromBasketData({ products, payload, userId })
      ),
      tap((data) => {
        this._push<IRemovedFromBasketEvent>(data);
      }),
      ignoreElements()
    );
  }

  public recipeClicked(payload: IRecipeClickedPayload): Observable<void> {
    return this._getUserId().pipe(
      map((userId) => prepareRecipeClickedData(payload, userId)),
      tap((data) => {
        this._push<IRecipeClickedEvent>(data);
      }),
      ignoreElements()
    );
  }

  public recipePdpViewed(payload: IRecipePdpViewedPayload): Observable<void> {
    return this._getUserId().pipe(
      map((userId) => prepareRecipePdpViewedData(payload, userId)),
      tap((data) => {
        this._push<IRecipePdpViewedEvent>(data);
      }),
      ignoreElements()
    );
  }

  public recipePlpViewed(payload: IRecipePlpViewedPayload): Observable<void> {
    return this._getUserId().pipe(
      map((userId) => prepareRecipePlpViewedData(payload, userId)),
      tap((data) => {
        this._push<IRecipePlpViewedEvent>(data);
      }),
      ignoreElements()
    );
  }

  public signUpCompleted(payload: ISignUpCompletedPayload): Observable<void> {
    return this._getUserId().pipe(
      tap((userId) => {
        this._push<ISignupCompletedEvent>({
          event: 'gaGTMevent',
          eventCategory: 'Sign up flow',
          eventAction: 'Complete registration',
          eventLabel: userId,
          [Dimensions.USER_ID]: userId
        });
      }),
      ignoreElements()
    );
  }

  public trackingId(payload: ITrackingIdPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._push<ITrackingIdEvent>({
          tracking_id: payload.trackingId ?? ''
        });
      }),
      ignoreElements()
    );
  }

  public userId(payload: IUserIdPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._push<IUserIdEvent>({
          user_id: payload.gigyaId ?? ''
        });
      }),
      ignoreElements()
    );
  }

  public anonymousId(payload: IAnonymousIdPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._push<IAnonymousIdEvent>({
          anonymous_id: payload.anonymousId ?? ''
        });
      }),
      ignoreElements()
    );
  }

  public login(payload: ILoginPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._push<ILoginEvent>({
          event: 'login',
          login_area: payload.loginArea,
          customer_type: payload.customerType
        });
      }),
      ignoreElements()
    );
  }

  public flipbookView(payload: IFlipbookViewPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._push<IFlipbookViewEvent>({
          event: 'view_ipaper',
          ipaper_flipbook: payload.name,
          ipaper_page: payload.page
        });
      }),
      ignoreElements()
    );
  }

  protected _dequeue(): Observable<void> {
    return super
      ._dequeue()
      .pipe(switchMap(() => from(ensureTagManager(this._dataLayer, 10, 1000))));
  }

  private _getProductsById(ids: string[]): Observable<ITrackingProduct[]> {
    return this._config.getProductsById(ids).pipe(take(1));
  }

  private _getUserId(): Observable<string> {
    return this._config.getUserId().pipe(take(1));
  }
}
