import {
  CheckoutSteps,
  CheckoutStepsTogo,
  IBasketPayload,
  ICheckoutPayload,
  ICookieConsentGivenPayload,
  ICTABannerClickedPayload,
  ICTABannerViewedPayload,
  IDeliveryPayload,
  IDonationAppliedPayload,
  IFilterClickedPayload,
  IFilterPayload,
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
  IRecommendationClickedPayload,
  IRecommendationViewedPayload,
  IFilterResetPayload,
  ISearchPayload,
  IShortcutActivatedPayload,
  ISignUpCompletedPayload,
  ISortingPayload,
  IVideoStartedPayload,
  OldCheckoutStepsHD,
  ITrackingIdPayload,
  IUserIdPayload,
  IAnonymousIdPayload,
  ILoginPayload,
  IFlipbookViewPayload,
  IAddedToWishlistPayload,
  IBeginCheckoutPayload,
  IAddShippingInfoPayload,
  IAddPaymentInfoPayload,
  ICartViewedPayload,
  IPromotionViewedPayload,
  IContentSelectedPayload
} from './TrackingPayloads';

/**
 * @public
 */
export interface IBaseTracking {
  clientReady: {};
  initialize: IInitializePayload;
  pageViewed: IPageViewedPayload;
  outboundLinkClicked: IOutboundLinkClickedPayload;
  cookieConsentGiven: ICookieConsentGivenPayload;
  ctaBannerViewed: ICTABannerViewedPayload;
  ctaBannerClicked: ICTABannerClickedPayload;
  search: ISearchPayload;
  signUpCompleted: ISignUpCompletedPayload;
  trackingId: ITrackingIdPayload;
  userId: IUserIdPayload;
  anonymousId: IAnonymousIdPayload;
  login: ILoginPayload;
  contentSelected: IContentSelectedPayload;
}

/**
 * @public
 */
export interface IEcomTracking<
  TCheckoutSteps extends string = CheckoutSteps,
  TProductExtension = {}
> {
  plpViewed: IPlpViewedPayload<TProductExtension>; // This has to be fired with empty product array if null result
  productClicked: IProductClickedPayload<TProductExtension>;
  pdpViewed: IPdpViewedPayload<TProductExtension>;
  addedToBasket: IBasketPayload<TProductExtension>;
  removedFromBasket: IBasketPayload<TProductExtension>;
  checkout: ICheckoutPayload<TCheckoutSteps, TProductExtension>;
  purchased: IOrderPayload<TProductExtension>;
  orderChanged: IOrderPayload<TProductExtension>;
  orderCancelled: IOrderPayload<TProductExtension>;
  deliveryViewed: IDeliveryPayload;
  deliverySelected: Array<IDeliveryPayload>;
  filtersViewed: IFilterPayload;
  filtersClicked: IFilterClickedPayload;
  filtersReset: IFilterResetPayload;
  sortingSelected: ISortingPayload;
  recommendationViewed: IRecommendationViewedPayload;
  recommendationClicked: IRecommendationClickedPayload;
  flipbookView: IFlipbookViewPayload;
  wishlistAdded: IAddedToWishlistPayload;
  changedSorting: ISortingPayload;
  signUpCompleted: ISignUpCompletedPayload;
  beginCheckout: IBeginCheckoutPayload;
  addShippingInfo: IAddShippingInfoPayload;
  addPaymentInfo: IAddPaymentInfoPayload;
  cartViewed: ICartViewedPayload;
  promotionViewed: IPromotionViewedPayload;
  promotionSelected: IPromotionViewedPayload;
  wishlistShared: {};
  clearEcommerceObject: {};
  addedToWishlist: IAddedToWishlistPayload;
}

/**
 * @public
 */
export interface ISubstitutionTracking {
  productSubstituted: IProductSubstitutedPayload;
}

/**
 * @public
 */
export interface IRecipeTracking<TRecipeExtension = {}> {
  recipePlpViewed: IRecipePlpViewedPayload<TRecipeExtension>;
  recipeClicked: IRecipeClickedPayload<TRecipeExtension>;
  recipePdpViewed: IRecipePdpViewedPayload<TRecipeExtension>;
}

/**
 * @public
 */
export type IToGoTracking = IBaseTracking & IEcomTracking<CheckoutStepsTogo>;

/**
 * @public
 */
export type IHomeDeliveryTracking = IBaseTracking &
  IEcomTracking<OldCheckoutStepsHD> & //  TODO: update OldCheckoutStepsHD to CheckoutStepsHD when implementing new checkout in HD
  ISubstitutionTracking &
  IRecipeTracking;

/**
 * @public
 */
export type INextTracking = IBaseTracking & IEcomTracking;

/**
 * Union of all tracking systems.
 * Used when designing for a generic tracking purpose
 * @public
 */
export type ITrackingSystems<
  TProductExtension = {},
  TRecipeExtension = {}
> = IBaseTracking &
  IEcomTracking<string, TProductExtension> &
  ISubstitutionTracking &
  IRecipeTracking<TRecipeExtension>;

/**
 * @public
 */
export interface IJobTracking {
  jobViewed: IJobViewedPayload;
  jobListViewed: IJobListViewedPayload;
  jobClicked: IJobClickedPayload;
  jobApplied: IJobAppliedPayload;
}

/**
 * @public
 */
export interface IVideoTracking {
  videoStarted: IVideoStartedPayload;
}

/**
 * @public
 */
export interface IShortcutTracking {
  shortcutActivated: IShortcutActivatedPayload;
}

/**
 * @public
 */
export interface IDonationTracking {
  donationApplied: IDonationAppliedPayload;
}
