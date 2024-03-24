# Change Log - release-20-12-2021-08-26-54

This log was last generated on Mon, 20 Dec 2021 08:28:12 GMT and should not be manually modified.

## app
## 1.7.0
Mon, 20 Dec 2021 08:28:02 GMT

### Minor changes

- Add facets to app
- Add product sorting
- added BasketContainer, BasketNotificationContainer and BasketSummaryContainer
- show SplashScreen on initialize
- Added BottomTabNavigation with pulse effect at basket icon when basket is updated
- Added categorial navigation to drawer
- Added sub categorial navigation to PLP
- Added menu btn to the tab bar and profil and logout btn to the navigation drawer
- Add AddToBasketContainer component
- Add BasketLineItem component
- Add recommended products in categorial PLP
- Add delivery slot dialogue
- Add app icons

### Patches

- Fix categorial reactivity
- Fix slighty wrong launch screen import
- Made changes according to  the refactored BottomNavigationTab
- Update DeliveryDaySelection test to find DayCard
- Fix various styling issues in app
- Add delivery info in header and basket

_Version update only_

## react-native-ui-library
## 0.13.0
Mon, 20 Dec 2021 08:28:02 GMT

### Minor changes

- Add facet related UI components
- added ProgressStepper UI Component
- Changes to SplashScreen component
- Removed pressable functionality from BottomNavigationTab and changed when it's pulse effect is triggered
- Add AddToBasket component
- Refactored LoadingAnimation component to use Reanimated2
- Added ReadOnlySection
- Refactored BottomNavigationTab
- Add zipcodeform

### Patches

- Make facet buttons handle presses undependently of where the button is pressed
- Refactor DayCard so the whole component is pressable and truly disabled when loading and disable state
- Add A11y labels on AddToBasket buttons 
- Add size prop to Promo component
- Fix various styling issues on components

## service-adapter-react
## 0.1.3
Mon, 20 Dec 2021 08:28:02 GMT

### Patches

- Improve useService initialization

## tracking-hd
## 2.1.0
Mon, 20 Dec 2021 08:28:02 GMT

### Minor changes

- Added "list" to GA PlpViewed tracking event

## web
## 2.9.0
Mon, 20 Dec 2021 08:28:02 GMT

### Minor changes

- Added list names to GA PlpViewed tracking events
- Add personalisation tracking configs to Algolia search queries

### Patches

- Handle mobilePay detached confirmation

_Version update only_

