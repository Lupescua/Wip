# Change Log - @salling-group/sg-tracking

This log was last generated on Wed, 31 Jan 2024 12:52:15 GMT and should not be manually modified.

## 8.3.0
Wed, 31 Jan 2024 12:52:15 GMT

### Minor changes

- Update purchase event

## 8.2.1
Fri, 19 Jan 2024 11:36:06 GMT

### Patches

- Update ga4 tracker to properly handle index of products

## 8.2.0
Wed, 17 Jan 2024 12:50:49 GMT

### Minor changes

- small tracking event fixes

## 8.1.1
Mon, 15 Jan 2024 10:00:18 GMT

### Patches

- Change index field mapping and wishlistShared payload

## 8.1.0
Wed, 10 Jan 2024 09:48:53 GMT

### Minor changes

- Add events to tracker

## 8.0.0
Tue, 09 Jan 2024 13:10:57 GMT

### Breaking changes

- Refactor plpViewed event

### Minor changes

- Update add/remove product events
- Update add_to_wishlist event
- Add checkout events
- Add contentSelected event
- Update productClicked event
- Add promotion events
- Add view_cart
- Update view_item event

## 7.5.0
Thu, 14 Dec 2023 13:57:09 GMT

### Minor changes

- Add split-test event
- Add clearEcommerceObject event
- Add page_type to page_view event
- Add login event
- Add wishlistShared event

### Patches

- Update pageTypes

## 7.4.2
Wed, 11 Oct 2023 11:32:40 GMT

### Patches

- extend payload for signup event in the tracking package

## 7.4.1
Wed, 04 Oct 2023 13:24:37 GMT

### Patches

- Add changedSorting to IEcomTracking

## 7.4.0
Wed, 04 Oct 2023 11:16:47 GMT

### Minor changes

- Added change_sorting to GA4 tracker

## 7.3.0
Wed, 27 Sep 2023 06:57:04 GMT

### Minor changes

- Add GA4 tracking event for add_to_wishlist

## 7.2.1
Wed, 17 May 2023 09:44:50 GMT

### Patches

- add event name to flipbook viewed event

## 7.2.0
Mon, 08 May 2023 08:17:30 GMT

### Minor changes

- Add flipbook tracking event

## 7.1.0
Thu, 23 Mar 2023 08:44:32 GMT

### Minor changes

- Add tracking events for customer IDs

## 7.0.0
Tue, 21 Feb 2023 11:26:10 GMT

### Breaking changes

- Change searchId to search in payload types

### Minor changes

- Add support for tracking with Algolia A/B testing IDs

## 6.4.3
Wed, 15 Feb 2023 10:00:05 GMT

_Version update only_

## 6.4.2
Thu, 19 Jan 2023 11:08:02 GMT

_Version update only_

## 6.4.1
Thu, 19 Jan 2023 06:58:58 GMT

### Patches

- add missing trackingsystem exports

## 6.4.0
Wed, 18 Jan 2023 09:35:36 GMT

### Minor changes

- added new GA4 tracking events

## 6.3.1
Wed, 04 Jan 2023 23:48:30 GMT

### Patches

- Rename event productViewed to pdpViewed

## 6.3.0
Thu, 01 Dec 2022 08:38:04 GMT

### Minor changes

- Support extensions types to product and recipe tracking payloads

### Patches

- Update pageViewed event with userId

## 6.2.0
Thu, 29 Sep 2022 11:13:41 GMT

### Minor changes

- Add tracking method to send event for cookie accept
- Add new product mapping util for basket and checkout events

### Patches

- Fix typo of perzonalisation -> personalisation

## 6.1.2
Mon, 19 Sep 2022 11:31:38 GMT

_Version update only_

## 6.1.1
Thu, 15 Sep 2022 08:13:58 GMT

_Version update only_

## 6.1.0
Tue, 06 Sep 2022 09:06:58 GMT

### Minor changes

- Update pageViewed event with format and rename custom dimensions to align with documentation

## 6.0.1
Fri, 26 Aug 2022 08:03:13 GMT

_Version update only_

## 6.0.0
Fri, 29 Jul 2022 09:40:04 GMT

### Breaking changes

- Unify tracking systems

## 5.2.4
Thu, 21 Jul 2022 08:06:09 GMT

_Version update only_

## 5.2.3
Tue, 21 Jun 2022 10:52:01 GMT

_Version update only_

## 5.2.2
Wed, 15 Jun 2022 14:17:20 GMT

_Version update only_

## 5.2.1
Mon, 13 Jun 2022 11:26:04 GMT

_Version update only_

## 5.2.0
Mon, 13 Jun 2022 08:48:30 GMT

### Minor changes

- Extend PaymentType to handle more values than just CreditCard

## 5.1.0
Wed, 08 Jun 2022 11:55:37 GMT

### Minor changes

- Update payload types for Algolia events
- Update AlgoliaTracker tests
- Add new public methods to AlgoliaTracker to support sending view (filters, product) and click (filters) events

## 5.0.3
Mon, 30 May 2022 07:52:50 GMT

_Version update only_

## 5.0.2
Thu, 19 May 2022 06:47:50 GMT

_Version update only_

## 5.0.1
Mon, 09 May 2022 11:41:11 GMT

_Version update only_

## 5.0.0
Thu, 05 May 2022 12:39:45 GMT

### Breaking changes

- Remove queue from AlgoliaTracker

## 4.1.3
Mon, 11 Apr 2022 12:50:00 GMT

_Version update only_

## 4.1.2
Wed, 06 Apr 2022 11:05:57 GMT

_Version update only_

## 4.1.1
Fri, 01 Apr 2022 12:23:26 GMT

### Patches

- Rename the types naming

## 4.1.0
Thu, 31 Mar 2022 13:33:27 GMT

### Minor changes

- Import SG tracking package

## 4.0.0
Thu, 24 Mar 2022 16:34:11 GMT

### Breaking changes

- renamed to hd-tracking

### Minor changes

- Add `ICTABannerViewedPayload` and `ICTABannerClickedPayload` interfaces. Update `IHomeDeliveryTracking` to use these in `ctaBannerViewed` and `ctaBannerClicked`. Implement the new events in `GA4Tracker` and `GATracker`

### Patches

- Modify payloads in `recommendationClicked` and `recommendationViewed` in `GA4Tracker`

## 3.1.2
Mon, 21 Mar 2022 13:34:39 GMT

_Version update only_

## 3.1.1
Fri, 25 Feb 2022 14:44:12 GMT

### Patches

- Fix GA4Tracker screen name parameter in screen view event

## 3.1.0
Wed, 23 Feb 2022 19:18:06 GMT

### Minor changes

- Change setUserId signature
- Add GA4 tracker

## 3.0.0
Mon, 10 Jan 2022 15:53:44 GMT

### Breaking changes

- Simplify types and reduce payloads

### Minor changes

- Add support for cookie consent toggle

## 2.1.0
Mon, 20 Dec 2021 08:28:02 GMT

### Minor changes

- Added "list" to GA PlpViewed tracking event

## 2.0.0
Wed, 08 Dec 2021 08:51:45 GMT

### Breaking changes

- Add `addedToBasket` and `recipeClicked` to AlgoliaTracker. Updated related payload types

### Minor changes

- Added listName field to IPlpViewedPayload and additional PageTypes

### Patches

- Include upsell dialog as part of checkout tracking
- Add explicit return types to products 

## 1.0.3
Mon, 22 Nov 2021 12:59:12 GMT

_Version update only_

## 1.0.2
Mon, 11 Oct 2021 14:18:34 GMT

### Patches

- Add possiblity to send empty product array in GaTracker

## 1.0.1
Tue, 05 Oct 2021 09:33:35 GMT

_Version update only_

## 1.0.0
Wed, 29 Sep 2021 11:28:42 GMT

### Breaking changes

- Initialize package and add GaTracker

### Minor changes

- updated checkout panel types
- Add recipe tracking 
- Add AlgoliaTracker and shared TrackerBase class
- Add tracking methods to GA

### Patches

- Implement true Queue in GaTracker
- Make GaTracker wait for cookie consent & gtm.load
- GaTracker productClick - Move action field into ecommerce section
- Fix GaTracker purchase totals
- Rename type 
- Change product event payloads and split event responses when having products

