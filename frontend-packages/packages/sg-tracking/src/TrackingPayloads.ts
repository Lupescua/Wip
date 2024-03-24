/**
 * This product type is the input type (the data at tracking time)
 * Its tracking agnostic, meaning it's not related to GA or other trackers,
 * but simply just a representation of what product data is passed along on tracking time.
 * @public
 */
export interface ITrackingProduct {
  id: string;
  priceIncludingVat: number; // Could change from buying time to fetching from id
  positionZeroIndexed?: number; // Position will change when fethcing from id. Starts from 0.
  inStock?: number; // Could change from buying time to fetching from id
  quantity?: number; // Quantity is not known other places
  index?: string; // Which algolia index is used
  itemType?: 'product' | 'recipe' | 'job';
  promotionName?: string;
  cogsPromotionCampaign?: string;
  cogsPromotionType?: string;
  deliveryType?: DeliveryTypes;
  coupon?: string;
  offerType?: 'membership' | 'personalized' | 'punch_card' | 'comeback_voucher';
}

/**
 * Defines the search engine query and additional data
 * @public
 */
export interface ITrackingSearch {
  searchId: string;
  searchTerm?: string;
  searchVariant?: IAlgoliaVariant;
}

/**
 * This variant type defines the Algolia variant configuration.
 * @public
 */
export interface IAlgoliaVariant {
  abTestID: number;
  abTestVariantID: number;
}

/**
 * @public
 */
export type PageTypes =
  | 'PDP'
  | 'RDP' // Recipe Detail Page
  | 'SEARCH'
  | 'CATEGORY'
  | 'OFFER'
  | 'BASKET'
  | 'MINI_BASKET'
  | 'FRONTPAGE'
  | 'RECIPES'
  | 'RECIPE_SEARCH'
  | 'SHOPPING_LIST'
  | 'MULTI_PROMO'
  | 'UPSELL'
  | 'CONTENT_PAGE'
  | 'SUBSTITUTION'
  | 'WISHLIST'
  | 'PROFILE'
  | 'CHECKOUT'
  | 'ORDER_CONFIRMATION'
  | 'NOT_FOUND'
  | 'UPSELL'
  | 'NULL_PAGE'
  | 'GUIDE_PAGE'
  | 'INSPIRATION'
  | '404_PAGE'
  | 'LOGIN '
  | 'CAMPAIGN_PAGE'
  | 'LEAFLET_PAGE'
  | 'INFO_PAGE';

/**
 * @public
 */
export type DeliveryTypes = 'pickup' | 'delivery' | 'click_and_collect';

/**
 * @public
 */
export type PaymentTypes = 'ONLINE' | 'PAY_AT_TILL' | 'INVOICE' | 'BUSINESS_CARD';

/**
 * @public
 */
export type CheckoutSteps =
  | 'USER_INFO'
  | 'DELIVERY_METHOD'
  | 'PAYMENT_METHOD'
  | 'PAYMENT'
  | 'PURCHASE';

/**
 * @public
 */
export type CheckoutStepsTogo =
  | CheckoutSteps
  | 'PACKAGING'
  | 'DELIVERY_PLACE'
  | 'DELIVERY_TIME';

/**
 *  1. USER_INFO,  2. DELIVERY_METHOD, 3. SUBSTITUTION, 4. OVERVIEW 5. PAYMENT 6. PURCHASE
 * @public
 */
export type CheckoutStepsHD =
  | CheckoutSteps
  | 'SUBSTITUTION'
  | 'OVERVIEW'
  | 'B2B_USER'
  | 'B2B_ORDER_INFORMATION';

/**
 * TODO: remove this when new checkout flow is implemented in HD
 * @public
 */
export type OldCheckoutStepsHD =
  | 'upsellDialogue'
  | 'delivery'
  | 'replacement'
  | 'user'
  | 'b2bUser'
  | 'b2bOrderInformation'
  | 'terms';

/**
 * @public
 */
export type OrderTypes = 'new' | 'change' | 'cancellation';

/**
 * @public
 */
export type SearchAreas =
  | 'visual_search'
  | 'search_result_page'
  | 'visual_search_recipe'
  | 'search_result_page_recipe';

/**
 * @public
 */

export type SignUpAreas = 'my_account' | 'mini_basket' | 'checkout' | 'page_type';
/**
 * @public
 */
export interface IInitializePayload {
  location?: string;
}

/**
 * @public
 */
export interface IPageViewedPayload {
  path: string;
  format: string;
  variant?: string;
  layout?: string;
  pageType?: PageTypes;
}

/**
 * @public
 */
export interface IScreenViewedPayload {
  path: string;
}

/**
 * @public
 */
export interface IOutboundLinkClickedPayload {
  url: string;
}

/**
 * @public
 */
export interface ISignUpCompletedPayload {
  area?: SignUpAreas;
}

/**
 * @public
 */
export interface IPlpViewedPayload<TProductExtension = {}> {
  personalization: boolean;
  products: Array<ITrackingProduct & TProductExtension>;
  page: PageTypes;
  sorting: string;
  listName?: string;
  search?: ITrackingSearch;
  recommendation?: IRecommendationPayload;
}

/**
 * @public
 */
export interface IProductClickedPayload<TProductExtension = {}> {
  page: PageTypes;
  product: ITrackingProduct & TProductExtension;
  listName?: string;
  sorting?: string;
  search?: ITrackingSearch;
  recommendation?: IRecommendationPayload;
}

/**
 * @public
 */
export interface IPdpViewedPayload<TProductExtension = {}> {
  product: ITrackingProduct & TProductExtension;
  index?: string;
  listName?: string;
  recommendation?: IRecommendationPayload;
  search?: ITrackingSearch;
}

/**
 * @public
 */
export interface IFilter {
  key: string;
  value: string;
}

/**
 * @public
 */
export interface IFilterPayload {
  page: PageTypes;
  filters: IFilter[];
  indexName?: string;
}

/**
 * @public
 */
export interface IFilterClickedPayload extends IFilterPayload {
  action: 'Added' | 'Removed';
}

/**
 * @public
 */
export interface IBasketPayload<TProductExtension = {}> {
  page: PageTypes;
  products: Array<ITrackingProduct & TProductExtension>;
  listName?: string;
  sorting?: string;
  search?: ITrackingSearch;
  tag?: string;
  recommendation?: IRecommendationPayload;
}

/**
 * @public
 */
export interface ICheckoutPayload<TCheckoutSteps extends string, TProductExtension = {}> {
  stepNumber: number;
  stepName?: TCheckoutSteps;
  products: Array<ITrackingProduct & TProductExtension>;
}

/**
 * @public
 */
export interface ICookieConsentGivenPayload {
  functional: boolean;
  statistic: boolean;
  marketing: boolean;
}

/**
 * @public
 */
export interface IOrderPayload<TProductExtension = {}> {
  deliveryType?: DeliveryTypes;
  paymentMethod: PaymentTypes;
  orderType: OrderTypes;
  orderId: string;
  pickingCostsIncVat: number;
  shippingCostsIncVat: number;
  productTotalIncVat: number;
  services?: string;
  basketType: 'click_and_collect' | 'delivery' | 'pickup' | 'mixed';
  products: Array<ITrackingProduct & TProductExtension>;
  search?: ITrackingSearch;
}

/**
 * @public
 */
export interface IProductSubstitutedPayload {
  reason: string;
  substitutionObjectId: string;
  replacementObjectId?: string;
}

/**
 * @public
 */
export interface IRecommendationViewedPayload {
  // TODO: Improve description to understand its coming from the ml team itself
  apiEndpoint: string;
  engine: string;
  page: PageTypes;
}

/**
 * @public
 */
export interface IRecommendationClickedPayload {
  apiEndpoint: string;
  page: PageTypes;
  engine: string;
  objectId: string;
}

/**
 * @public
 */
export interface IHomeDeliveryTrackingRecipe {
  name: string;
  id: string;
  category?: string;
  positionZeroIndexed?: number;
  prepTime: string;
  priceRange: string;
  greenRanking: number;
}

/**
 * @public
 */
export interface IRecipePlpViewedPayload<TRecipeExtension = {}> {
  recipes: Array<IHomeDeliveryTrackingRecipe & TRecipeExtension>;
  page: PageTypes;
}

/**
 * @public
 */
export interface IRecipeClickedPayload<TRecipeExtension = {}> {
  recipe: IHomeDeliveryTrackingRecipe & TRecipeExtension;
  page: PageTypes;
  listName?: string;
  sorting?: string;
  search?: ITrackingSearch;
}

/**
 * @public
 */
export interface IRecipePdpViewedPayload<TRecipeExtension = {}> {
  page: PageTypes;
  recipe: IHomeDeliveryTrackingRecipe & TRecipeExtension;
  listName?: string;
}

/**
 * @public
 */
export interface ICTABannerViewedPayload {
  ctaId: string;
}

/**
 * @public
 */
export interface ICTABannerClickedPayload {
  ctaId: string;
}

/**
 * @public
 */
export interface IDeliveryPayload {
  type: DeliveryTypes;
  name: string;
  date: Date;
  promotion?: string;
}

/**
 * @public
 */
export interface IFilterResetPayload {}

/**
 * @public
 */
export interface ISortingPayload {
  name: string;
}

/**
 * @public
 */
export interface IJobTrackingPayload {
  /**
   * @example preferably it will be the "datasourceId" property from the job's api
   */
  id: string;
  /**
   * @example format: "netto" or "sallinggroup"
   */
  format?: string;
  country?: string;
  region?: string;
  name?: string;
  categories?: string[];
  jobLevel?: string;
  index: number;
  listName?: string;
}

/**
 * @public
 */
export interface IJobViewedPayload<TRecipeExtension = {}> {
  job: IJobTrackingPayload & TRecipeExtension;
  listName?: string;
}

/**
 * @public
 */
export interface IJobListViewedPayload<TRecipeExtension = {}> {
  index?: number;
  listName?: string;
  jobs: Array<IJobTrackingPayload & TRecipeExtension>;
}

/**
 * @public
 */
export interface IJobAppliedPayload extends IJobTrackingPayload {}

/**
 * @public
 */
export interface IDonationAppliedPayload {
  donationType: string;
}

/**
 * @public
 */
export interface IJobClickedPayload<TRecipeExtension = {}> {
  job: IJobTrackingPayload & TRecipeExtension;
  listName?: string;
  sorting?: string;
}

/**
 * @public
 */
export interface ISearchPayload {
  searchTerm: string;
  searchArea: SearchAreas;
}

/**
 * @public
 */
export interface IVideoStartedPayload {
  currentTime?: string;
  duration?: string;
  percent?: string;
  provider?: string;
  title?: string;
  url?: string;
  visible?: boolean;
}

/**
 * @public
 */
export interface IShortcutActivatedPayload {
  type: 'search';
}

/**
 * @public
 */
export interface ITrackingIdPayload {
  trackingId: string;
}

/**
 * @public
 */
export interface IUserIdPayload {
  gigyaId: string;
}

/**
 * @public
 */
export interface IAnonymousIdPayload {
  anonymousId: string;
}

/**
 * @public
 */
export interface ILoginPayload {
  loginArea: string;
  customerType: 'b2b' | 'b2c';
}

/**
 * @public
 */
export interface IFlipbookViewPayload {
  name: string;
  page: string;
}

/**
 * @public
 */
export interface IAddedToWishlistPayload<TProductExtension = {}> {
  product: ITrackingProduct & TProductExtension;
  listName?: string;
  recommendation?: IRecommendationPayload;
}

/**
 * @public
 */
export interface ISplitTestVariantPayload {
  branch: string;
}

/**
 * @public
 */
export interface IRecommendationPayload {
  model: string;
  version: string;
  personalized: boolean;
  flags?: string[];
}

/**
 * @public
 */
export interface IPromotionViewedPayload {
  itemListName: string;
  searchTerm: string;
  creativeName: string;
  creativeSlot: string;
  promotionName: string;
}

/**
 * @public
 */
export interface IContentSelectedPayload {
  type: string;
  name: string;
  url: string;
}

/**
 * @public
 */
export interface ICartViewedPayload<TProductExtension = {}> {
  products: Array<ITrackingProduct & TProductExtension>;
  coupon?: string;
  totalPrice: number;
  basketType: 'click_and_collect' | 'delivery' | 'pickup' | 'mixed';
}

/**
 * @public
 */
export interface IBeginCheckoutPayload {
  products: ITrackingProduct[];
  basketType: string;
  coupon?: string;
  totalPriceIncludingVat: number;
}

/**
 * @public
 */
export interface IAddShippingInfoPayload extends IBeginCheckoutPayload {
  shippingTier: string; // selected delivery option.
}

/**
 * @public
 */
export interface IAddPaymentInfoPayload extends IBeginCheckoutPayload {
  paymentMethod: string; // selected payment method
}
