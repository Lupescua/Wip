import {
  IGA4CommerceEvent,
  IGA4Item,
  IGA4JobItem,
  IGA4Purchase,
  ActionFieldList
} from './ga4TrackerTypes';
import {
  ITrackingProduct,
  IHomeDeliveryTrackingRecipe,
  IOrderPayload,
  IJobTrackingPayload,
  IProductClickedPayload
} from './TrackingPayloads';
import { deductVAT } from './utils';

/**
 * @internal
 */
export function prepareGA4CommerceData(products: ITrackingProduct[]): IGA4CommerceEvent {
  return {
    currency: 'DKK',
    items: products.map(productToGA4Item),
    value: products.reduce(
      (a, b) => a + deductVAT(b.priceIncludingVat) * (b.quantity ?? 1),
      0
    )
  };
}

/**
 * @internal
 */
export function prepareGA4Purchase(payload: IOrderPayload): IGA4Purchase {
  return {
    currency: 'DKK',
    shipping: deductVAT(payload.pickingCostsIncVat + payload.shippingCostsIncVat),
    basket_type: payload.basketType,
    transaction_id: payload.orderId,
    value: deductVAT(payload.productTotalIncVat),
    services: payload.services || '',
    items: payload.products.map(productToGA4Item)
  };
}

/**
 * @internal
 */
/* eslint-disable @typescript-eslint/naming-convention */
export function productToGA4Item(product: ITrackingProduct): IGA4Item {
  return {
    item_id: product.id,
    quantity: product.quantity,
    price: deductVAT(product.priceIncludingVat),
    index: (product.positionZeroIndexed || 0) + 1,
    item_type: product.itemType || '',
    promotion_name: product.promotionName || '',
    cogs_promotion_campaign: product.cogsPromotionCampaign || '',
    cogs_promotion_type: product.cogsPromotionType || '',
    delivery_type: product.deliveryType || '',
    coupon: product.coupon || '',
    offer_type: product.offerType || ''
  };
}

/**
 * @internal
 */
export function recipeToGA4Item(recipe: IHomeDeliveryTrackingRecipe): IGA4Item {
  return {
    item_id: recipe.id,
    item_name: recipe.name,
    item_category: recipe.category,
    price: 0
  };
}

/**
 * @internal
 */
/* eslint-disable @typescript-eslint/naming-convention */
export function jobToGA4Item(job: IJobTrackingPayload): IGA4JobItem {
  return {
    index: job.index,
    item_id: job.id,
    item_name: job.name,
    item_type: 'job',
    item_list_name: job.listName,
    job_category: job.categories?.length ? job.categories.join(',') : undefined,
    job_country: job.country,
    job_format: job.format,
    job_level: job.jobLevel,
    job_region: job.region
  };
}

/**
 * @public
 */
export function createListName(
  payload: Pick<IProductClickedPayload, 'page' | 'listName'>
): ActionFieldList {
  return payload.listName
    ? (`${payload.page} > ${payload.listName}` as const)
    : payload.page;
}
