import { ITrackingProduct } from './GaTracker';
import { PageTypes } from './TrackingPayloads';

/**
 * @internal
 */
export type AvailableCurrencies = 'DKK';

/**
 * @internal
 */
export type ActionFieldList = PageTypes | `${PageTypes} > ${string}`;

/**
 * @internal
 */
export enum Dimensions {
  VARIANT = 'dimension7',
  LAYOUT = 'dimension8',
  FORMAT = 'dimension9',
  ALGOLIA_VARIANT = 'dimension10',
  PERSONALIZATION = 'dimension19',
  SPLATTER = 'dimension20',
  RATING = 'dimension21',
  STOCK = 'dimension23',
  IMAGES = 'dimension24',
  HAS_VIDEO = 'dimension25',
  HAS_DESCR = 'dimension26',
  DESCR_LENGTH = 'dimension27',
  PRICE_CONTROL = 'dimension28',
  ACCESSORIES = 'dimension31',
  PRIVATE_LABEL = 'dimension32',
  SPECIFICATIONS = 'dimension33',
  IS_BUNDLE = 'dimension35',
  IS_MULTI_BUY = 'dimension41',
  MIN_QUANTITY = 'dimension61',
  DELIVERY_TYPE = 'dimension83',
  PAYMENT_METHOD = 'dimension85',
  USER_ID = 'dimension87',
  ORDER_TYPE = 'dimension102'
}

/**
 * @internal
 */
export interface IGAProduct {
  id: string;
  price: number;
  quantity: number;
}

/**
 * @internal
 */
export interface IGAProductPositioned extends IGAProduct {
  position: number;
}

/**
 * @internal
 */
export interface IGAProductInBasket extends IGAProductPositioned {
  [Dimensions.DELIVERY_TYPE]: string;
}

/**
 * @internal
 */
export interface IGAProductInList extends IGAProductPositioned {
  list: string;
}

/**
 * @internal
 */
export interface IPreparePayload<TPayload> {
  products: ITrackingProduct[];
  payload: TPayload;
  userId: string;
}

/**
 * @internal
 */
export interface IInitializeEvent {
  originalLocation: string;
}

/**
 * @internal
 */
export interface ITrackingIdEvent {
  tracking_id: string;
}

/**
 * @internal
 */
export interface IUserIdEvent {
  user_id: string;
}

/**
 * @internal
 */
export interface IAnonymousIdEvent {
  anonymous_id: string;
}

/**
 * @internal
 */
export interface ILoginEvent {
  event: 'login';
  login_area: string;
  customer_type: 'b2b' | 'b2c';
}

/**
 * @internal
 */
export interface ICookieAcceptEvent {
  event: 'gaGTMevent';
  eventAction: 'done';
  eventCategory: 'cookie-accept';
}

/**
 * @interal
 */
export interface IAddedToBasketEvent {
  event: 'addToCart';
  custom_dimensions: {
    [Dimensions.USER_ID]: string;
    [Dimensions.ALGOLIA_VARIANT]: string;
  };
  ecommerce: {
    currencyCode: AvailableCurrencies;
    add: {
      actionField: {
        list: ActionFieldList;
      };
      products: IGAProductInBasket[];
    };
  };
}

/**
 * @internal
 */
export interface ICheckoutEvent {
  event: 'checkout';
  custom_dimensions: {
    [Dimensions.USER_ID]: string;
  };
  ecommerce: {
    checkout: {
      actionField: {
        step: number;
        option: string;
      };
      products: IGAProductInBasket[];
    };
  };
}

/**
 * @internal
 */
export interface ICTABannerClickedEvent {
  event: 'gaGTMevent';
  eventAction: 'click';
  eventCategory: 'cta';
  eventLabel: string;
}

/**
 * @internal
 */
export interface ICTABannerViewedEvent {
  event: 'gaGTMevent';
  eventAction: 'view';
  eventCategory: 'cta';
  eventLabel: string;
}

/**
 * @internal
 */
export interface IOutboundLinkEvent {
  event: 'externalClick';
  url: string;
}

/**
 * @internal
 */
export interface IPageViewEvent {
  event: 'createPageView';
  url: string;
  custom_dimensions: {
    [Dimensions.VARIANT]: string;
    [Dimensions.FORMAT]: string;
    [Dimensions.LAYOUT]?: string;
    [Dimensions.USER_ID]?: string;
  };
}

/**
 * @internal
 */
export interface IPdpViewedEvent {
  event: 'product_view';
  custom_dimensions: {
    [Dimensions.USER_ID]: string;
    [Dimensions.ALGOLIA_VARIANT]: string;
  };
  ecommerce: {
    detail: {
      products: IGAProduct[];
    };
  };
}

/**
 * @internal
 */
export interface IPlpViewedEvent {
  event: 'productListView';
  custom_dimensions: {
    [Dimensions.USER_ID]: string;
    [Dimensions.PERSONALIZATION]: boolean;
    [Dimensions.ALGOLIA_VARIANT]: string;
  };
  algolia: {
    event: string;
    user: string;
    index: string;
    query_id: string;
  };
  ecommerce: {
    impressions: IGAProductInList[];
  };
}

/**
 * @internal
 */
export interface IProductClickedEvent {
  event: 'productClick';
  custom_dimensions: {
    [Dimensions.USER_ID]: string;
    [Dimensions.ALGOLIA_VARIANT]: string;
  };
  ecommerce: {
    click: {
      actionField: {
        list: ActionFieldList;
      };
      products: IGAProductPositioned[];
    };
  };
}

/**
 * @internal
 */
export interface IProductSubstitutedEvent {
  event: 'gaGTMevent';
  eventAction: string;
  eventCategory: 'Product substitution';
  eventLabel: string;
}

/**
 * @internal
 */
export interface IPurchasedEvent {
  event: 'ecom_purchase';
  custom_dimensions: {
    [Dimensions.PAYMENT_METHOD]: string;
    [Dimensions.USER_ID]: string;
    [Dimensions.ORDER_TYPE]: string;
    [Dimensions.ALGOLIA_VARIANT]: string;
  };
  ecommerce: {
    currencyCode: AvailableCurrencies;
    purchase: {
      actionField: {
        action: 'purchase';
        id: string;
        revenue: number;
        shipping: number;
      };
      products: IGAProductInBasket[];
    };
  };
}

/**
 * @internal
 */
export interface IRecommendationClickedEvent {
  event: 'gaGTMevent';
  eventAction: 'click';
  eventCategory: string;
  eventLabel: string;
}

/**
 * @internal
 */
export interface IRecommendationViewedEvent {
  event: 'gaGTMevent';
  eventAction: 'view';
  eventCategory: string;
  eventLabel: string;
}

/**
 * @internal
 */
export interface IRemovedFromBasketEvent {
  event: 'removeFromCart';
  custom_dimensions: {
    [Dimensions.USER_ID]: string;
  };
  ecommerce: {
    currencyCode: AvailableCurrencies;
    remove: {
      actionField: {
        list: ActionFieldList;
      };
      products: IGAProductInBasket[];
    };
  };
}

/**
 * @internal
 */
export interface ISignupCompletedEvent {
  event: 'gaGTMevent';
  eventCategory: 'Sign up flow';
  eventAction: 'Complete registration';
  eventLabel: string;
  [Dimensions.USER_ID]: string;
}

/**
 * @internal
 */
export interface IGARecipe {
  name: string;
  id: string;
  category?: string;
  list?: PageTypes;
  position?: number;
  variant: {
    type: 'recipe';
    id: string;
    prep_time: string;
    price_range: string;
    green_rank: number;
  };
}

/**
 * @internal
 */
export interface IRecipeClickedEvent {
  event: 'productClick';
  custom_dimensions: {
    [Dimensions.USER_ID]: string;
  };
  ecommerce: {
    currencyCode: AvailableCurrencies;
    click: {
      actionField: {
        list: ActionFieldList;
      };
      products: IGARecipe[];
    };
  };
}

/**
 * @internal
 */
export interface IRecipePdpViewedEvent {
  event: 'product_view';
  custom_dimensions: {
    [Dimensions.USER_ID]: string;
  };
  ecommerce: {
    click: {
      actionField: {
        list: ActionFieldList;
      };
      products: IGARecipe[];
    };
  };
}

/**
 * @internal
 */
export interface IRecipePlpViewedEvent {
  event: 'productListView';
  custom_dimensions: {
    [Dimensions.USER_ID]: string;
  };
  ecommerce: {
    currencyCode: AvailableCurrencies;
    impressions: IGARecipe[];
  };
}

export interface IFlipbookViewEvent {
  event: 'view_ipaper';
  ipaper_flipbook: string;
  ipaper_page: string;
}
