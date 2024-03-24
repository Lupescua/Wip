# Change Log - release-22-11-2021-12-58-13

This log was last generated on Mon, 22 Nov 2021 12:59:15 GMT and should not be manually modified.

## app
## 1.5.0
Mon, 22 Nov 2021 12:59:12 GMT

### Minor changes

- Add SearchScreen aswell as header and suggestions to PLP
- Add search suggestion to PLP
- Setup appcenter SDK
- added ProductListContainer and ProductCardContainer
- Added `<AuthenticationDialog>`
Added `<AuthenticationContainer>`
Added `<LoginContainer>`
Implemented profile tab of `<BottomTapNavigation>`
- When not logged in, this tab will say `Log ind`. When the tab is pressed, `<AuthenticationDialog>` will open.
- When logged in, this tab will say `Profile` and clicking it will act as normal and navigate to the profile page.
Changed app to use it's own render function instead of the one of `testUtil`.
- This was required as there couldn't be `<NavigationContainer>` withon one another.
To test components, `testUtil` needed to provide `<NavigationContainer>`. However `app.tsx` also needs to provide `<NavigationContainer>` for the navigation to work in the app.

### Patches

- Bake env variables into .env in appcenter pre build
- Update @gorhom/bottom-sheet to 4.1.4

_Version update only_

## basket-api
## 0.2.1
Mon, 22 Nov 2021 12:59:12 GMT

_Version update only_

## basket-service
## 0.2.3
Mon, 22 Nov 2021 12:59:12 GMT

_Version update only_

## delivery-api
## 0.3.1
Mon, 22 Nov 2021 12:59:12 GMT

_Version update only_

## delivery-service
## 0.3.4
Mon, 22 Nov 2021 12:59:12 GMT

_Version update only_

## gigya-service
## 0.5.1
Mon, 22 Nov 2021 12:59:12 GMT

_Version update only_

## hierarchy-service
## 0.1.2
Mon, 22 Nov 2021 12:59:12 GMT

_Version update only_

## magnolia-api
## 0.2.2
Mon, 22 Nov 2021 12:59:12 GMT

_Version update only_

## magnolia-service
## 0.1.4
Mon, 22 Nov 2021 12:59:12 GMT

_Version update only_

## order-api
## 0.2.0
Mon, 22 Nov 2021 12:59:12 GMT

### Minor changes

- added downloadOrder function

_Version update only_

## order-service
## 0.2.0
Mon, 22 Nov 2021 12:59:12 GMT

### Minor changes

- added downloadOrder

_Version update only_

## react-native-ui-library
## 0.11.0
Mon, 22 Nov 2021 12:59:12 GMT

### Minor changes

- Add a withoutError prop to textfield 
- Add search screen UI components
- changed interface to ProductCard
- Add span type to Text component
- Added a hook named `useKeyboardHandlingBottomSheet`. This hook is used in `<Modal>` and it ensures `<Modal>` is pushed up when the keyboard appears and down when the keyboard disappears.
Fixed `<Transition>` to work when it's prop `show` is initially `true`
- Also added a story to show this
Added `changeEmail` button to `<AuthenticationForm>`
Added transitions to `<AuthenticationForm>`
Removed Images and Text from `<AuthenticationForm>`
- Add ForgotPasswordForm component 
- Add ProductDetailPage component

### Patches

- Fix Text component style bug
- Remove initial focus of email input in authentication dialog
- Fixed TextField disallowing stories to be ran
- Removed "keyboardBlurBehavior" from Modal component
- Change primary color from #1d2f54 to #184082
- Add ComparisonPrice component to ProductCard
- Update @gorhom/bottom-sheet to 4.1.4

## react-ui-library
## 2.5.0
Mon, 22 Nov 2021 12:59:12 GMT

### Minor changes

- added Icons and small change to Spinner

## recipe-api
## 0.1.2
Mon, 22 Nov 2021 12:59:12 GMT

_Version update only_

## recipe-service
## 0.1.5
Mon, 22 Nov 2021 12:59:12 GMT

_Version update only_

## recommendation-service
## 0.1.2
Mon, 22 Nov 2021 12:59:12 GMT

_Version update only_

## request-handlers
## 0.2.0
Mon, 22 Nov 2021 12:59:12 GMT

### Minor changes

- add responseType to calls

## sg-recommendation-api
## 1.0.2
Mon, 22 Nov 2021 12:59:12 GMT

_Version update only_

## system-notification-service
## 0.1.4
Mon, 22 Nov 2021 12:59:12 GMT

_Version update only_

## tracking-hd
## 1.0.3
Mon, 22 Nov 2021 12:59:12 GMT

_Version update only_

## wallet-api
## 0.1.2
Mon, 22 Nov 2021 12:59:12 GMT

_Version update only_

## wallet-service
## 0.0.3
Mon, 22 Nov 2021 12:59:12 GMT

_Version update only_

## web
## 2.7.0
Mon, 22 Nov 2021 12:59:12 GMT

### Minor changes

- added download order button on order list

_Version update only_

