/* eslint-disable @typescript-eslint/naming-convention */
import { ITracker } from '@salling-group/tracking-service';
import { Observable, of } from 'rxjs';
import { ignoreElements, tap } from 'rxjs/operators';
import {
  jobToGA4Item,
  prepareGA4CommerceData,
  prepareGA4Purchase,
  productToGA4Item,
  recipeToGA4Item,
  createListName
} from './ga4TrackerUtils';
import {
  IBasketPayload,
  ICheckoutPayload,
  ICTABannerClickedPayload,
  ICTABannerViewedPayload,
  IDonationAppliedPayload,
  IInitializePayload,
  IJobAppliedPayload,
  IJobClickedPayload,
  IJobViewedPayload,
  IJobListViewedPayload,
  IOrderPayload,
  IOutboundLinkClickedPayload,
  IPageViewedPayload,
  IPdpViewedPayload,
  IPlpViewedPayload,
  IProductClickedPayload,
  IProductSubstitutedPayload,
  IRecipeClickedPayload,
  IRecipePdpViewedPayload,
  IRecipePlpViewedPayload,
  IFilterClickedPayload,
  IScreenViewedPayload,
  ISearchPayload,
  IShortcutActivatedPayload,
  ISignUpCompletedPayload,
  IVideoStartedPayload,
  IAddedToWishlistPayload,
  ISortingPayload,
  ISplitTestVariantPayload,
  ILoginPayload,
  IPromotionViewedPayload,
  IContentSelectedPayload,
  ICartViewedPayload,
  IBeginCheckoutPayload,
  IAddShippingInfoPayload,
  IAddPaymentInfoPayload
} from './TrackingPayloads';
import { ITrackingSystems } from './TrackingSystems';
import { deductVAT } from './utils';

/**
 * @public
 */
export interface IGA4TrackerConfig {
  pushEvent: (
    event: string,
    params: {
      [key: string]: unknown;
    }
  ) => Observable<void>;
  setUserId: (userId: string) => void;
}

/**
 * @public
 */
export class GA4Tracker implements ITracker<ITrackingSystems> {
  private readonly _config: IGA4TrackerConfig;

  public constructor(config: IGA4TrackerConfig) {
    this._config = config;
  }

  public initialize(payload: IInitializePayload): Observable<void> {
    return of();
  }

  public addedToBasket(payload: IBasketPayload): Observable<void> {
    return of([]).pipe(
      tap((data) => {
        this._config.pushEvent('add_to_cart', {
          ecommerce: {
            item_list_name: createListName(payload),
            recommendation_model: payload.recommendation?.model || '',
            recommendation_version: payload.recommendation?.version || '',
            recommendation_personalized: payload.recommendation?.personalized || '',
            recommendation_flags: payload.recommendation?.flags || '',
            ...prepareGA4CommerceData(payload.products)
          }
        });
      }),
      ignoreElements()
    );
  }

  public checkout(payload: ICheckoutPayload<string>): Observable<void> {
    return of([]).pipe(ignoreElements());
  }

  public ctaBannerClicked(payload: ICTABannerClickedPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('select_cta', {
          cta_id: payload.ctaId
        });
      }),
      ignoreElements()
    );
  }

  public ctaBannerViewed(payload: ICTABannerViewedPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('view_cta', {
          cta_id: payload.ctaId
        });
      }),
      ignoreElements()
    );
  }

  public outboundLinkClicked(payload: IOutboundLinkClickedPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('external_click', {
          url: payload.url
        });
      }),
      ignoreElements()
    );
  }

  public screenViewed(payload: IScreenViewedPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('screen_view', {
          screen_name: payload.path
        });
      }),
      ignoreElements()
    );
  }

  public pageViewed(payload: IPageViewedPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('page_view', {
          page_location: payload.path,
          format: payload.format,
          page_type: payload.pageType
        });
      }),
      ignoreElements()
    );
  }

  public pdpViewed(payload: IPdpViewedPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('view_item', {
          ecommerce: {
            item_list_name: payload.listName || '',
            currency: 'DKK',
            recommendation_model: payload.recommendation?.model || '',
            recommendation_version: payload.recommendation?.version || '',
            recommendation_personalized: payload.recommendation?.personalized || '',
            recommendation_flags: payload.recommendation?.flags || '',
            items: [productToGA4Item(payload.product)]
          }
        });
      }),
      ignoreElements()
    );
  }

  public plpViewed(payload: IPlpViewedPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('view_item_list', {
          ecommerce: {
            item_list_name: createListName(payload),
            currency: 'DKK',
            recommendation_model: payload.recommendation?.model || '',
            recommendation_version: payload.recommendation?.version || '',
            recommendation_personalized: payload.recommendation?.personalized || '',
            recommendation_flags: payload.recommendation?.flags || '',
            search_variant: payload.search?.searchVariant || '',
            search_term: payload.search?.searchTerm || '',
            items: payload.products.map(productToGA4Item)
          }
        });
      }),
      ignoreElements()
    );
  }

  public productClicked(payload: IProductClickedPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('select_item', {
          ecommerce: {
            content_type: 'product',
            item_list_name: createListName(payload),
            search_term: payload.search?.searchTerm || '',
            currency: 'DKK',
            recommendation_model: payload.recommendation?.model || '',
            recommendation_version: payload.recommendation?.version || '',
            recommendation_personalized: payload.recommendation?.personalized || '',
            recommendation_flags: payload.recommendation?.flags || '',
            items: [productToGA4Item(payload.product)]
          }
        });
      }),
      ignoreElements()
    );
  }

  public productSubstituted(payload: IProductSubstitutedPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        const { reason, replacementObjectId, substitutionObjectId } = payload;
        this._config.pushEvent('product_substitution', {
          action: reason,
          category: 'Product substitution',
          label: replacementObjectId
            ? `${substitutionObjectId}|${replacementObjectId}`
            : substitutionObjectId
        });
      }),
      ignoreElements()
    );
  }

  public purchased(payload: IOrderPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('purchase', {
          ecommerce: {
            ...prepareGA4Purchase(payload)
          }
        });
      }),
      ignoreElements()
    );
  }

  public removedFromBasket(payload: IBasketPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('remove_from_cart', {
          ecommerce: {
            ...prepareGA4CommerceData(payload.products)
          }
        });
      }),
      ignoreElements()
    );
  }

  public recipeClicked(payload: IRecipeClickedPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('select_item', {
          content_type: 'recipe',
          item_list_name: payload.listName,
          item_list_id: payload.search?.searchId || '',
          items: [recipeToGA4Item(payload.recipe)]
        });
      }),
      ignoreElements()
    );
  }

  public recipePdpViewed(payload: IRecipePdpViewedPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('view_item', {
          items: [recipeToGA4Item(payload.recipe)]
        });
      }),
      ignoreElements()
    );
  }

  public recipePlpViewed(payload: IRecipePlpViewedPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('view_item_list', {
          items: payload.recipes.map(recipeToGA4Item),
          item_list_name: payload.page
        });
      }),
      ignoreElements()
    );
  }

  public signUpCompleted(payload: ISignUpCompletedPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('sign_up', {
          sign_up_area: payload.area
        });
      }),
      ignoreElements()
    );
  }

  public jobViewed(payload: IJobViewedPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('view_item', {
          item_list_name: payload.listName,
          items: [jobToGA4Item(payload.job)]
        });
      }),
      ignoreElements()
    );
  }

  public jobListViewed(payload: IJobListViewedPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('view_item_list', {
          index: payload.index,
          item_list_name: payload.listName,
          items: payload.jobs.map(jobToGA4Item)
        });
      }),
      ignoreElements()
    );
  }

  public jobApplied(payload: IJobAppliedPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('apply_job', {
          items: [
            {
              job_name: payload.name,
              job_id: payload.id,
              job_format: payload.format,
              job_level: payload.jobLevel,
              job_country: payload.country,
              job_region: payload.region,
              job_category: payload.categories?.length
                ? payload.categories.join(',')
                : undefined
            }
          ]
        });
      }),
      ignoreElements()
    );
  }

  public jobClicked(payload: IJobClickedPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('select_item', {
          item_type: 'job',
          item_list_name: payload.listName,
          items: [jobToGA4Item(payload.job)]
        });
      }),
      ignoreElements()
    );
  }

  public donationApplied(payload: IDonationAppliedPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('apply_donation', {
          donation_type: payload.donationType
        });
      }),
      ignoreElements()
    );
  }

  public filtersClicked(payload: IFilterClickedPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        const eventName = payload.action === 'Added' ? 'add_filter' : 'remove_filter';
        payload.filters.forEach((filter) => {
          this._config.pushEvent(eventName, {
            filter_category: filter.key,
            filter_value: filter.value
          });
        });
      }),
      ignoreElements()
    );
  }

  public filtersReset(): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('reset_filter', {
          filter_value: 'reset'
        });
      }),
      ignoreElements()
    );
  }

  public search(payload: ISearchPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('search', {
          search_term: payload.searchTerm,
          search_area: payload.searchArea
        });
      }),
      ignoreElements()
    );
  }

  public shortcutActivated(payload: IShortcutActivatedPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('shortcut', {
          shortcut_type: payload.type
        });
      }),
      ignoreElements()
    );
  }

  public videoStarted(payload: IVideoStartedPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('video_start', {
          video_current_time: payload.currentTime,
          video_duration: payload.duration,
          video_percent: payload.percent,
          video_provider: payload.provider,
          video_title: payload.title,
          video_url: payload.url,
          visible: payload.visible
        });
      }),
      ignoreElements()
    );
  }

  public addedToWishlist(payload: IAddedToWishlistPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('add_to_wishlist', {
          ecommerce: {
            value: deductVAT(payload.product.priceIncludingVat),
            currency: 'DKK',
            item_list_name: payload.listName,
            recommendation_model: payload.recommendation?.model || '',
            recommendation_version: payload.recommendation?.version || '',
            recommendation_personalized: payload.recommendation?.personalized || '',
            recommendation_flags: payload.recommendation?.flags || '',
            items: [
              {
                item_id: payload.product.id,
                index: payload.product.positionZeroIndexed,
                price: deductVAT(payload.product.priceIncludingVat),
                quantity: 1,
                promotion_name: payload.product.promotionName || '',
                cogs_promotion_campaign: payload.product.cogsPromotionCampaign || '',
                cogs_promotion_type: payload.product.cogsPromotionType || ''
              }
            ]
          }
        });
      }),
      ignoreElements()
    );
  }

  public changedSorting(payload: ISortingPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('change_sorting', {
          sorting_value: payload.name
        });
      }),
      ignoreElements()
    );
  }

  public splitTestVariant(payload: ISplitTestVariantPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent(`server_variant: ${payload.branch}`, {});
      }),
      ignoreElements()
    );
  }

  public clearEcommerceObject(): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('clear_ecommerce_object', { ecommerce: null });
      }),
      ignoreElements()
    );
  }

  public login(payload: ILoginPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('login', {
          login_area: payload.loginArea,
          customer_type: payload.customerType
        });
      }),
      ignoreElements()
    );
  }

  public wishlistShared(): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('share', { content_type: 'wishlist' });
      }),
      ignoreElements()
    );
  }

  public promotionSelected(payload: IPromotionViewedPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('select_promotion', {
          ecommerce: {
            item_list_name: payload.itemListName,
            search_term: payload.searchTerm,
            creative_name: payload.creativeName,
            creative_slot: payload.creativeSlot,
            promotion_name: payload.promotionName
          }
        });
      }),
      ignoreElements()
    );
  }

  public promotionViewed(payload: IPromotionViewedPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('view_promotion', {
          ecommerce: {
            item_list_name: payload.itemListName,
            search_term: payload.searchTerm,
            creative_name: payload.creativeName,
            creative_slot: payload.creativeSlot,
            promotion_name: payload.promotionName
          }
        });
      }),
      ignoreElements()
    );
  }

  public contentSelected(payload: IContentSelectedPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('select_content', {
          content_type: payload.type,
          content_name: payload.name,
          content_url: payload.url
        });
      }),
      ignoreElements()
    );
  }

  public cartViewed(payload: ICartViewedPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('view_cart', {
          ecommerce: {
            currency: 'DKK',
            coupon: payload.coupon || '',
            value: deductVAT(payload.totalPrice),
            basket_type: payload.basketType,
            items: payload.products.map(productToGA4Item)
          }
        });
      }),
      ignoreElements()
    );
  }

  public beginCheckout(payload: IBeginCheckoutPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('begin_checkout', {
          ecommerce: {
            value: deductVAT(payload.totalPriceIncludingVat),
            currency: 'DKK',
            basket_type: payload.basketType,
            coupon: payload.coupon,
            items: payload.products.map(productToGA4Item)
          }
        });
      }),
      ignoreElements()
    );
  }

  public addShippingInfo(payload: IAddShippingInfoPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('add_shipping_info', {
          ecommerce: {
            value: deductVAT(payload.totalPriceIncludingVat),
            currency: 'DKK',
            basket_type: payload.basketType,
            coupon: payload.coupon,
            shipping_tier: payload.shippingTier,
            items: payload.products.map(productToGA4Item)
          }
        });
      }),
      ignoreElements()
    );
  }

  public addPaymentInfo(payload: IAddPaymentInfoPayload): Observable<void> {
    return of([]).pipe(
      tap(() => {
        this._config.pushEvent('add_payment_info', {
          ecommerce: {
            value: deductVAT(payload.totalPriceIncludingVat),
            currency: 'DKK',
            basket_type: payload.basketType,
            coupon: payload.coupon,
            payment_type: payload.paymentMethod,
            items: payload.products.map(productToGA4Item)
          }
        });
      }),
      ignoreElements()
    );
  }
}
