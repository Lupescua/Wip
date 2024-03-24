# Change Log - release-03-01-2022-15-36-37

This log was last generated on Mon, 03 Jan 2022 15:37:49 GMT and should not be manually modified.

## app
## 1.8.0
Mon, 03 Jan 2022 15:37:41 GMT

### Minor changes

- Add DeliveryInformationReadOnlyContainer to profile screen
- added UserInformationReadOnly container in app
- Added AddressConfirmationDialog
- Changed ProductCardContainers pressable element to TouchableWithoutFeedback
- Changed AddToBasketContainer to use the updated version of AddToBasket component named QuantityStepper
- Add DawaAndManualAddressForm and useDawaAndManualAddressForm
- Added functionality to delete products from basket
- Add AddToShoppingList modal
- Add useModalHeight hook
- Add ShoppingListsOverviewContainer 
- Add ShoppingListScreen 
- Add UserInformationFormContainer

### Patches

- Changes on the basis of Button component refactor

_Version update only_

## react-native-ui-library
## 0.14.0
Mon, 03 Jan 2022 15:37:41 GMT

### Minor changes

- small chages to ReadOnlySection component
- Added style prop to ManualAddressForm
- Renamed AddToBasket component to QuantityStepper and added a vertical layout to the component
- Added ManualAddressForm component
- Refactor of button component to use Gesture Library and simplify usage
- Add ShoppingListCard component
- Add SwipableDelete component
- Add withoutLabel to TextField and utilize this in ManualAddressForm
- Added UserInformationForm UI
- Add CheckoutPanel
- Add DeliveryInformationForm with stories and tests
- Add shopping list filter
- Add select field
- Add ShoppingListProductCard
- Add ShoppingListsOverview component
- Add ShoppingListsNotLoggedIn component

### Patches

- Change text type on ReadOnlySection
- Changed QuantityStepper to use translation instead of width for it's animation. This should improve it's performance by putting more load on the UI thread instead of JS thread
- Fix product imagedimensions in ShoppingListProductCard
- Remove onSubmit from useUserInformationForm
 Add isValid and onCancel to UserInformationForm
 Fix labels in country and country code fields in UserInformationForm

## web
## 2.9.1
Mon, 03 Jan 2022 15:37:41 GMT

### Patches

- Moved DawaUtil to the dawa-api package and utilize it from here

