# Change Log - release-08-12-2021-08-50-16

This log was last generated on Wed, 08 Dec 2021 08:51:54 GMT and should not be manually modified.

## app
## 1.6.0
Wed, 08 Dec 2021 08:51:45 GMT

### Minor changes

- Add delivery slot timeout warnings
- add optimisation to FlatList in the PLP
- Added VoucherContainer
- Added: Signup and CompleteRegistration to AuthenticationContainer. useKeyboard hook to get keyboardHeight
- Setup global login/logout effects and update App.test
- Add ForgotPassword dialog
- Add header to CategorialProductListScreens
- Add CategorySection and CategorialProductListContainer
- Implement ProductCarousel
- Add ProductDetailPage to app
- Use RichText component in html string in  AccordionItems, SignupContainer and CompleteRegistrationContainer

### Patches

- Add images to searchscreen category carousel 
- Reset scroll animation header when navigating. Add search screen tab icon
- use new version of Hierarchy service
- Remove close dialogue from CompleteRegistrationContainer as it closes on loggedIn
- Update DocumentBrowserService usages to adapt parameterized getters

_Version update only_

## basket-api
## 0.3.0
Wed, 08 Dec 2021 08:51:45 GMT

### Minor changes

- add var in ILineItem interface

### Patches

- Add response to get basket errorCode

## basket-service
## 0.3.0
Wed, 08 Dec 2021 08:51:45 GMT

### Minor changes

- add functions to check if items are restricted

### Patches

- ensureCart > remove response - only pass the payload

_Version update only_

## checkout-service
## 0.1.1
Wed, 08 Dec 2021 08:51:45 GMT

_Version update only_

## core-service
## 0.2.0
Wed, 08 Dec 2021 08:51:45 GMT

### Minor changes

- Add selector test utility
- Implement parameterized getters

## delivery-service
## 0.3.5
Wed, 08 Dec 2021 08:51:45 GMT

_Version update only_

## document-browser-service
## 0.1.0
Wed, 08 Dec 2021 08:51:45 GMT

### Minor changes

- Upgrade getter functions to parameterized getters

_Version update only_

## gigya-service
## 0.5.2
Wed, 08 Dec 2021 08:51:45 GMT

_Version update only_

## hierarchy-service
## 1.0.0
Wed, 08 Dec 2021 08:51:45 GMT

### Breaking changes

- Optimize service to have perfomant lookups and expose elements as tree nodes

_Version update only_

## key-value-service
## 0.1.1
Wed, 08 Dec 2021 08:51:45 GMT

_Version update only_

## layout-service
## 0.1.1
Wed, 08 Dec 2021 08:51:45 GMT

_Version update only_

## magnolia-service
## 0.1.5
Wed, 08 Dec 2021 08:51:45 GMT

_Version update only_

## order-api
## 0.2.1
Wed, 08 Dec 2021 08:51:45 GMT

_Version update only_

## order-service
## 0.2.1
Wed, 08 Dec 2021 08:51:45 GMT

_Version update only_

## react-native-ui-library
## 0.12.0
Wed, 08 Dec 2021 08:51:45 GMT

### Minor changes

- Add selection tabs component with the flat variant 
- Add timeslot component
- added BasketHeader UI component
- added BasketSummaryLineItem UI component
- added Daycard and DayCardCarousel components
- Added Voucher, VoucherInput and AppliedVouchers
- Add BasketLineItem component
- Add CategoryCard
- Add RichText component

### Patches

- add support for cloudinary folders in category carousel
- Fix scroll animation header not being clickable when scrolled
- Added SignupForm export and renamed prop. Added prop topInset to Modal. Removed CompleteRegistrationForms title -> added in App > AuthenticationDialogue
- Add status to ForgotPassword component
- Fix loading color in button
- Remove autoFocus from ForgotPassword form
- Fixed promo displaying empty text

## recipe-service
## 0.1.6
Wed, 08 Dec 2021 08:51:45 GMT

_Version update only_

## recommendation-service
## 0.1.3
Wed, 08 Dec 2021 08:51:45 GMT

### Patches

- Update to use the refactored document-browser-service getters

_Version update only_

## salesforce-contact-service
## 0.1.1
Wed, 08 Dec 2021 08:51:45 GMT

_Version update only_

## service-adapter-react
## 0.1.2
Wed, 08 Dec 2021 08:51:45 GMT

_Version update only_

## service-adapter-vue
## 0.1.0
Wed, 08 Dec 2021 08:51:45 GMT

### Minor changes

- Initial implementation

_Version update only_

## suggestion-service
## 0.1.1
Wed, 08 Dec 2021 08:51:45 GMT

_Version update only_

## system-notification-service
## 0.1.5
Wed, 08 Dec 2021 08:51:45 GMT

_Version update only_

## tracking-hd
## 2.0.0
Wed, 08 Dec 2021 08:51:45 GMT

### Breaking changes

- Add `addedToBasket` and `recipeClicked` to AlgoliaTracker. Updated related payload types

### Minor changes

- Added listName field to IPlpViewedPayload and additional PageTypes

### Patches

- Include upsell dialog as part of checkout tracking
- Add explicit return types to products 

_Version update only_

## tracking-service
## 0.1.1
Wed, 08 Dec 2021 08:51:45 GMT

_Version update only_

## wallet-service
## 0.0.4
Wed, 08 Dec 2021 08:51:45 GMT

_Version update only_

## web
## 2.8.0
Wed, 08 Dec 2021 08:51:45 GMT

### Minor changes

- Setup sitemap
- show information if items in basket have reached their quantity restrictions
- Pass search ids to tracking events

### Patches

- Fix offers page not showing all categories
- Include upsell dialog as part of checkout tracking
- use new version of Hierarchy service
- Fix a conditional returning numeric value
- Improved data parsed into click and basket related tracking request
- Update errorCode with missing response in VoucherContainer tests
- Fix wrong product tracking in categorial PLP
- Update DocumentBrowserService usages to adapt parameterized getters

_Version update only_

