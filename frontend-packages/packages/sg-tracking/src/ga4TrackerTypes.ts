/* eslint-disable @typescript-eslint/naming-convention */

import { DeliveryTypes, PageTypes } from './TrackingPayloads';

/**
 * @internal
 */
export type IGA4Events =
  | IGA4CommerceEvent
  | IGA4Purchase
  | IGA4ViewRecipeList
  | IGA4ViewItem
  | IGA4ClickRecipe
  | IGA4ProductSubstitution
  | IGA4ClickProduct
  | IGA4ScreenView
  | IGA4ExternalClick
  | IGA4AppOpen;

/**
 * @internal
 */
export interface IGA4CommerceEvent {
  currency: string;
  items: IGA4Item[];
  value: number;
}

/**
 * @internal
 */
export interface IGA4Purchase {
  items: IGA4Item[];
  currency: 'DKK';
  shipping: number;
  transaction_id: string;
  value: number;
  basket_type: string;
  services: string;
}

/**
 * @internal
 */
export interface IGA4ViewRecipeList {
  items: IGA4Item[];
  item_list_name: string;
}

/**
 * @internal
 */
export interface IGA4ViewItem {
  items: IGA4Item[];
}

/**
 * @internal
 */
export interface IGA4ClickRecipe {
  content_type: 'recipe';
  item_list_name?: string;
  item_list_id?: string;
  items: IGA4Item[];
}

/**
 * @internal
 */
export interface IGA4ClickProduct {
  content_type: 'product';
  item_list_name?: string;
  item_list_id?: string;
  items: IGA4Item[];
}

/**
 * @internal
 */
export interface IGA4ProductSubstitution {
  action: string;
  category: 'Product substitution';
  label: string;
}

/**
 * @internal
 */
export interface IGA4ScreenView {
  firebase_screen: string;
}

/**
 * @internal
 */
export interface IGA4ExternalClick {
  url: string;
}

/**
 * @internal
 */
export interface IGA4AppOpen {}

/**
 * @internal
 */
export interface IGA4Item {
  item_brand?: string;
  item_category?: string;
  item_category2?: string;
  item_category3?: string;
  item_category4?: string;
  item_category5?: string;
  item_id: string;
  item_list_id?: string;
  item_list_name?: string;
  item_name?: string;
  item_variant?: string;
  price: number;
  quantity?: number;
  index?: number | string;
  delivery_type?: DeliveryTypes | '';
  item_type?: 'product' | 'recipe' | 'job' | '';
  offer_type?: 'membership' | 'personalized' | 'punch_card' | 'comeback_voucher' | '';
  promotion_name?: string;
  cogs_promotion_campaign?: string;
  cogs_promotion_type?: string;
  coupon?: string;
}

export interface IGA4JobItem {
  index: number;
  item_id: string;
  item_type: string;
  item_name?: string;
  item_list_name?: string;
  job_category?: string;
  job_country?: string;
  job_format?: string;
  job_level?: string;
  job_region?: string;
}

export type ActionFieldList = PageTypes | `${PageTypes} > ${string}`;
