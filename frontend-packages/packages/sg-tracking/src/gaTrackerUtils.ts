import { IPushable } from './GaTracker';
import {
  Dimensions,
  IAddedToBasketEvent,
  ICheckoutEvent,
  IGARecipe,
  IPdpViewedEvent,
  IPlpViewedEvent,
  IProductClickedEvent,
  IPurchasedEvent,
  IRecipeClickedEvent,
  IRecipePdpViewedEvent,
  IRecipePlpViewedEvent,
  IRemovedFromBasketEvent,
  ActionFieldList,
  IPreparePayload,
  IGAProduct,
  IGAProductPositioned,
  IGAProductInList,
  IGAProductInBasket
} from './gaTrackerTypes';
import {
  IBasketPayload,
  ICheckoutPayload,
  ITrackingProduct,
  IPdpViewedPayload,
  IPlpViewedPayload,
  IProductClickedPayload,
  IOrderPayload,
  IRecipePlpViewedPayload,
  IRecipePdpViewedPayload,
  IRecipeClickedPayload,
  IHomeDeliveryTrackingRecipe,
  PageTypes,
  IAlgoliaVariant
} from './TrackingPayloads';
import { deductVAT } from './utils';

const PRODUCTS_CHUNK_SIZE: number = 90;

/**
 * @internal
 */
export async function ensureTagManager(
  dataLayer: IPushable,
  attempts: number = 10,
  delay: number = 1000
): Promise<void> {
  while (attempts > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (dataLayer?.some((e: any) => e.event === 'gtm.load')) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
    attempts--;
  }

  return;
}

/**
 * @internal
 */
export function prepareAddToBasketData({
  payload,
  userId
}: IPreparePayload<IBasketPayload>): IAddedToBasketEvent[] {
  return splitEventResponse(
    payload.products,
    (productsChunk): IAddedToBasketEvent => {
      return {
        event: 'addToCart',
        custom_dimensions: {
          [Dimensions.USER_ID]: userId,
          [Dimensions.ALGOLIA_VARIANT]: formatAlgoliaVariant(
            payload.search?.searchVariant
          )
        },
        ecommerce: {
          currencyCode: 'DKK',
          add: {
            actionField: {
              list: createListName(payload)
            },
            products: productsChunk.map(mapToGAProductInBasket)
          }
        }
      };
    }
  );
}

/**
 * @internal
 */
export function prepareCheckoutData({
  payload,
  userId
}: IPreparePayload<ICheckoutPayload<string>>): ICheckoutEvent[] {
  return splitEventResponse(
    payload.products,
    (productsChunk): ICheckoutEvent => {
      return {
        event: 'checkout',
        custom_dimensions: {
          [Dimensions.USER_ID]: userId
        },
        ecommerce: {
          checkout: {
            actionField: {
              step: payload.stepNumber,
              option: payload.stepName ?? ''
            },
            products: productsChunk.map(mapToGAProductInBasket)
          }
        }
      };
    }
  );
}

/**
 * @internal
 */
export function preparePdpData({
  payload,
  userId
}: IPreparePayload<IPdpViewedPayload>): IPdpViewedEvent {
  return {
    event: 'product_view',
    custom_dimensions: {
      [Dimensions.USER_ID]: userId,
      [Dimensions.ALGOLIA_VARIANT]: formatAlgoliaVariant(payload.search?.searchVariant)
    },
    ecommerce: {
      detail: {
        products: [mapToGAProduct(payload.product)]
      }
    }
  };
}

/**
 * @internal
 */
export function preparePlpData({
  payload,
  userId
}: IPreparePayload<IPlpViewedPayload>): IPlpViewedEvent[] {
  const list = createListName(payload);
  return splitEventResponse(
    payload.products,
    (productsChunk): IPlpViewedEvent => {
      return {
        event: 'productListView',
        custom_dimensions: {
          [Dimensions.USER_ID]: userId,
          [Dimensions.PERSONALIZATION]: false,
          [Dimensions.ALGOLIA_VARIANT]: formatAlgoliaVariant(
            payload.search?.searchVariant
          )
        },
        algolia: {
          event: payload.search?.searchTerm
            ? `${payload.page}: ${payload.search.searchTerm}`
            : payload.page,
          user: userId,
          index: payload.sorting,
          query_id: payload.search?.searchId || ''
        },
        ecommerce: {
          impressions: productsChunk.map((product) => mapToGAProductInList(product, list))
        }
      };
    }
  );
}

/**
 * @internal
 */
export function prepareProductClickedData({
  payload,
  userId
}: IPreparePayload<IProductClickedPayload>): IProductClickedEvent {
  return {
    event: 'productClick',
    custom_dimensions: {
      [Dimensions.USER_ID]: userId,
      [Dimensions.ALGOLIA_VARIANT]: formatAlgoliaVariant(payload.search?.searchVariant)
    },
    ecommerce: {
      click: {
        actionField: {
          list: createListName(payload)
        },
        products: [mapToGAProductPositioned(payload.product)]
      }
    }
  };
}

/**
 * @internal
 */
export function preparePurchaseData({
  payload,
  userId
}: IPreparePayload<IOrderPayload>): IPurchasedEvent[] {
  const totalShipping = payload.shippingCostsIncVat + payload.pickingCostsIncVat;

  return splitEventResponse(
    payload.products,
    (productsChunk): IPurchasedEvent => {
      return {
        event: 'ecom_purchase',
        custom_dimensions: {
          [Dimensions.PAYMENT_METHOD]: payload.paymentMethod,
          [Dimensions.USER_ID]: userId,
          [Dimensions.ORDER_TYPE]: payload.orderType,
          [Dimensions.ALGOLIA_VARIANT]: formatAlgoliaVariant(
            payload.search?.searchVariant
          )
        },
        ecommerce: {
          currencyCode: 'DKK',
          purchase: {
            actionField: {
              action: 'purchase',
              id: payload.orderId,
              revenue: deductVAT(payload.productTotalIncVat),
              shipping: deductVAT(totalShipping)
            },
            products: productsChunk.map(mapToGAProductInBasket)
          }
        }
      };
    }
  );
}

/**
 * @internal
 */
export function prepareRemovedFromBasketData({
  payload,
  userId
}: IPreparePayload<IBasketPayload>): IRemovedFromBasketEvent[] {
  return splitEventResponse(
    payload.products,
    (productsChunk): IRemovedFromBasketEvent => {
      return {
        event: 'removeFromCart',
        custom_dimensions: {
          [Dimensions.USER_ID]: userId
        },
        ecommerce: {
          currencyCode: 'DKK',
          remove: {
            actionField: {
              list: createListName(payload)
            },
            products: productsChunk.map(mapToGAProductInBasket)
          }
        }
      };
    }
  );
}

/**
 * @internal
 */
export function prepareRecipeClickedData(
  payload: IRecipeClickedPayload,
  userId: string
): IRecipeClickedEvent {
  return {
    event: 'productClick',
    custom_dimensions: {
      dimension87: userId
    },
    ecommerce: {
      currencyCode: 'DKK',
      click: {
        actionField: {
          list: createListName(payload)
        },
        products: [formatRecipe(payload.recipe)]
      }
    }
  };
}

/**
 * @internal
 */
export function prepareRecipePdpViewedData(
  payload: IRecipePdpViewedPayload,
  userId: string
): IRecipePdpViewedEvent {
  return {
    event: 'product_view',
    custom_dimensions: {
      dimension87: userId
    },
    ecommerce: {
      click: {
        actionField: {
          list: createListName(payload)
        },
        products: [formatRecipe(payload.recipe)]
      }
    }
  };
}

/**
 * @internal
 */
export function prepareRecipePlpViewedData(
  payload: IRecipePlpViewedPayload,
  userId: string
): IRecipePlpViewedEvent {
  return {
    event: 'productListView',
    custom_dimensions: {
      [Dimensions.USER_ID]: userId
    },
    ecommerce: {
      currencyCode: 'DKK',
      impressions: payload.recipes.map((recipe) => formatRecipe(recipe, payload.page))
    }
  };
}

/**
 * @internal
 */
function mapToGAProduct(product: ITrackingProduct): IGAProduct {
  return {
    id: product.id,
    price: deductVAT(product.priceIncludingVat),
    quantity: product.quantity || 1
  };
}

/**
 * @internal
 */
function mapToGAProductPositioned(product: ITrackingProduct): IGAProductPositioned {
  return {
    ...mapToGAProduct(product),
    position: (product.positionZeroIndexed || 0) + 1
  };
}

/**
 * @internal
 */
function mapToGAProductInBasket(product: ITrackingProduct): IGAProductInBasket {
  return {
    ...mapToGAProductPositioned(product),
    [Dimensions.DELIVERY_TYPE]: product.deliveryType || ''
  };
}

/**
 * @internal
 */
function mapToGAProductInList(product: ITrackingProduct, list: string): IGAProductInList {
  return {
    ...mapToGAProductPositioned(product),
    list
  };
}

/**
 * @internal
 */
export function formatRecipe(
  recipe: IHomeDeliveryTrackingRecipe,
  page?: PageTypes
): IGARecipe {
  return {
    name: recipe.name,
    id: recipe.id,
    category: recipe.category,
    list: page,
    position: formatPosition(recipe.positionZeroIndexed),
    variant: {
      type: 'recipe',
      id: recipe.id,
      prep_time: recipe.prepTime,
      price_range: recipe.priceRange,
      green_rank: recipe.greenRanking
    }
  };
}

/**
 * @internal
 */
function formatPosition(positionZeroIndexed?: number): number {
  return positionZeroIndexed !== undefined && positionZeroIndexed > -1
    ? positionZeroIndexed + 1
    : 0;
}

/**
 * @internal
 */
function formatAlgoliaVariant(searchVariant?: IAlgoliaVariant): string {
  return searchVariant !== undefined
    ? `${searchVariant.abTestID}_${searchVariant.abTestVariantID}`
    : '';
}

/**
 * @internal
 */
function splitEventResponse<TArray, TData>(
  products: TArray[],
  eventDataFn: (products: TArray[]) => TData
): TData[] {
  const productsChunks = splitArray(products, PRODUCTS_CHUNK_SIZE);

  if (productsChunks.length < 1) {
    const emptyProductResponse = eventDataFn([]);
    return [emptyProductResponse];
  }

  return productsChunks.map((productsChunk) => {
    return eventDataFn(productsChunk);
  });
}

/**
 * @internal
 */
function splitArray<T>(array: T[], splits: number): T[][] {
  let result: T[][] = [];
  for (let i = 0; i < array.length; i += splits) {
    const chunk = array.slice(i, i + splits);

    result = [...result, chunk];
  }
  return result;
}

/**
 * @internal
 */
function createListName(
  payload: Pick<IProductClickedPayload, 'page' | 'listName'>
): ActionFieldList {
  return payload.listName
    ? (`${payload.page} > ${payload.listName}` as const)
    : payload.page;
}
