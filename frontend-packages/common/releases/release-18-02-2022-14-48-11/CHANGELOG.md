# Change Log - release-18-02-2022-14-48-11

This log was last generated on Fri, 18 Feb 2022 14:49:31 GMT and should not be manually modified.

## app
## 2.1.0
Fri, 18 Feb 2022 14:49:22 GMT

### Minor changes

- Setup codepush
- fixed duplicate footer links
- send in SalesforceContactService with deliveryService
- Default zipcode to delivery adress stored on user contact data
- Added global basket errors
- Added titles to screens and header to PDP
- Support changes in DeliveryApi
- Added customer support service and authenticatedGateway for version two URL
- Added shadows to headers
- Add tag press handler in recipe detail screen
- Add app tracking transparency

### Patches

- Fixed sorting not visibel on search result page
- Add tracking events
- add error handling to dawa address input calls
- Fixed authentication dialogs not closing
- Fix crashing on recipe detail page
- Added error handling to popular suggestions on search screen
- Fixed crash on RDP
- Initially expand product information accordion on PDP
- Add route guard for ProfileTabStack

_Version update only_

## delivery-api
## 0.4.0
Fri, 18 Feb 2022 14:49:22 GMT

### Minor changes

- Added sold_out and tag to result of delivery-slots endpoint. Added tag to result of available-dates endpoint

## delivery-service
## 0.4.0
Fri, 18 Feb 2022 14:49:22 GMT

### Minor changes

- prefill zip code from contactService if exists
- Accept address observable in constructor to prefill zipcode if no delivery is already selected
- Support changes in DeliveryApi

_Version update only_

## react-native-ui-library
## 1.1.0
Fri, 18 Feb 2022 14:49:22 GMT

### Minor changes

- Added "header" to theme zIndexes and added shadows to header components

### Patches

- Add boolean casting inside JSX in CuratedInstructions
- Changed fractions to be rounded in quarter decimals
- Fix NotificationBanner content being too wide

## react-ui-library
## 2.7.0
Fri, 18 Feb 2022 14:49:22 GMT

### Minor changes

- Updated OrderSummaryTable to handle product changes in orders

### Patches

- Changed fractions to be rounded in quarter decimals
- Fixed styles in DayCard and DayCardCarousel to handle cheap tag being cut off

## suggestion-service
## 0.1.2
Fri, 18 Feb 2022 14:49:22 GMT

### Patches

- Catch errors thrown by the getSuggestions constructor param

## web
## 2.11.0
Fri, 18 Feb 2022 14:49:22 GMT

### Minor changes

- add new feature toggle to disable zip code edit
- send in SalesforceContactService with deliveryService
- Defaults the zipcode to the delivery address stored on user
- Support changes in DeliveryApi
- Added customer support service and authenticatedGateway for version two URL

### Patches

- Fixed eslint warnings - imports never used
- Aligned props names with the updated OrderSummaryTable

_Version update only_

