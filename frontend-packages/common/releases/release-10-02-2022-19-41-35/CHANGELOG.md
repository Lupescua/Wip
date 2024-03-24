# Change Log - release-10-02-2022-19-41-35

This log was last generated on Thu, 10 Feb 2022 19:42:52 GMT and should not be manually modified.

## app
## 2.0.0
Thu, 10 Feb 2022 19:42:42 GMT

### Breaking changes

- Bump version

### Minor changes

- Add an exit button to the edit order dialogue
- Add CallToAction carousel to app
- Add CallToActionDelegator
- Add CategorialButtonDelegator to app
- Add ContainerDelegator
- Add ImageCollectionDelegator
- Add substitutions to basket
- Add Video delegator 
- Add error handeling to checkout
- Add Offers screen
- change bg color of SplashScreen
- add ContentCardDelegator to app
- disable lanscapemode for Android
- add link to Inspiration
- added containers for MyAccount screen
- added ProfileOverviewContainer
- add RecipeCardDelegator and Container
- add RecipeListScreen, RecipeTabStack, RecipeListHeader components
- add RecipeTagsContainer
- add RecipeDetailScreen, RecipeDetailContainer
- add RecipeIndexPageDelegator
- added CarouselSingleImageDelegator
- add missing Specification tables in product details
- add TextDelegator
- Combined edit order components
- Added EditOrderDialogue
- Made StatusBar notify the user when an order is being edited
- Added download/share functionality to orders of My Orders
- Added components for My Orders
- Added OrderListCardContainer
- Added OrderListContainer
- Added summary table and overview to cards of OrderList
- Added warning to OrderListCardContainer
- Added OrderRecipeList to OrderList
- Added RecipeAddToBasketDialogue and related subcomponents
- Removed scroll of tags on RDP
- Added CartUpsellPopupDelegator
- Added HomePageDelegator
- Added filtering to recipe search screen
- Simplify implementation of recipe tags related components
- Added CarouselRecipeCardDelegator
- Added IngredientPanel and IngredientLine
- Added NutritionPanel and ClimateFootPrint to recipe panels
- An order can now be added to a shoppinglist - updated the icon change when adding a product/products to a shoppinglist
- Added RecipePanelsContainer, InstructionPanel and RecipeTips.
- Added RecipeSearchScreen and recipe search suggestions
- Add icons to drawer categories 
- Add CarouselContentDelegator
- implement ProductRecommendationCarousel
- Add ListDelegator to App
- Add ArticleTextDelegator
- add PlusPricePromo to PromoContainer
- Add ProductRecommendationCarousel
- Add CategoryCarousel and SearchBar to HomePageDelegator
- Finalized RecipeDetailContainer
- Make headers control SafeAreaInsets
- Add Flashbanners
- Add GigyaSubscriptionContainer
- Add ProductCarouselDelegator
- Add DividerDelegator
- Add ImageDelegator
- Add MultiPromoDialogue
- Add RecipeInfo component and GreenRecipeDialogue

### Patches

- Add Magnolia Spacer utility component 
- Add tests to Video delegator
- Enhance Magnolia Spacer component 
- Fix magnolia paddings
- Fix statusbar color and disable ios darkmode
- Fixed magnolia homescreen path
- renamed font files in lowercase
- changes to ListDelegator based on prop change in List
- Utilize default styles added to headerSlot of Dialog
- Fixed recipe prices not updating in RecipeAddToBasketDialogue
-  Made recipe tags filter by facet instead of query
- Removed duplicate MagnoliaUtil
- Move RecipePanelsContainer inside of RecipeDetailContainer
- Add margin to empty ConfirmDialogue 
- fix animation bug in recipe modal
- Add missing SafeArea in DeliveryScreen
- Fix ArticleDelegator crash
- Fix nested magnolia navigation
- Remove merging of params in BottomTabBar
- Hide header when navigating to RecipeIndexPage
- Fix recipe index page header hiding on mount
- Fix inital search screen not getting mounted
- Update RN Mia package
- Fix updated RN Mia path in XCode #1155
- Replace webpack with Metro bundler

_Version update only_

## customer-support-api
## 0.1.0
Thu, 10 Feb 2022 19:42:42 GMT

### Minor changes

- Added customer support API and endpoint for getOrders

## customer-support-service
## 0.2.0
Thu, 10 Feb 2022 19:42:42 GMT

### Minor changes

- Added customer support service which includes getOrders and fetchOrders.

_Version update only_

## magnolia-api
## 0.4.0
Thu, 10 Feb 2022 19:42:42 GMT

### Minor changes

- Update getPagePreview generic typing
- Add getTemplateDefinitions
- Alter Flashbanner type

## magnolia-service
## 0.2.0
Thu, 10 Feb 2022 19:42:42 GMT

### Minor changes

- Add fetchPagePreview and getPagePreviewByPath

_Version update only_

## react-native-ui-library
## 1.0.0
Thu, 10 Feb 2022 19:42:42 GMT

### Breaking changes

- Changes to RecipeTags component

### Minor changes

- Add CallToAction component and add linear gradient option to Image
- Add fraction and ingredient components
- Add Video component
- Make enabeling changes for substitutions feature
- added new color var
- changed icon name
- added missing icon
- add RecipeCard component
- add RecipeDetailPageHeader
- changes to SearchInput and Header
- add RecipeInstructions UI component
- added AccountTransactionsTable
- Added DialogueText
- Added PingAnimation and EditOrderStatusBar
- Added renderItem function to List
- Add default styles to Modal headerSlot
- Added download icon
- Added style prop to Stepper
- Added MiniOrderSummary component
- Added warningSlot to OrderListCard
- Added OrderSummaryTable
- Made componets used in more generic or testable RecipeAddToBasketDialogue
- Added dividers between non-selected recipe tabs in SelectionTabs component
- Added Spinner
- Added RecipePersonStepper
- Added Stepper component
- Added recipe variant to selectedTabs and refactored the component
- Added BorderContainer
- Added NutritionList
- Add drawer icons
- Add EcoToggle component
- Add List component
- Add OrderListCard Component
- Add PlusPricePromo component
- Add RecipeAuthorInfo
- Add focus prop to SearchInputField
- Add NotificationBanner component
- Add light-cyan color
- Add RecipeAddToBasketProductCard 
- Add CuratedInstructions component
- Make CuratedInstructions props optional
- Add RecipeTags component

### Patches

- Add support for aspectRatio "none" on Image component
- Fix some "unit is required" styled component warnings
- Removed warnings
- Make LinkButton use TouchableOpacity
- Removed business logic from OrderListCard
- Fixed the text color of the inverted Button variant
- Small style changes in RecipeTags component
- Ingredient: Removed withoutCheckbox and aligned text. Checkbox: Added borderStyle to overwrite the default style. Bordercontainer: Added headerSlotTop to adjust headerSlot position
- Added unit to NutritionList to simplify the nutrient array from the app and missing onPress on LinkButton
- Added TextType body4 so we don't have to keep overwriting other types.
- Added id to QuickSearchOptions to handle RDP navigation in app
- Add testId to ContentCard
- fix animation bug in recipe modal
- Change styling in CuratedInstructions, RecipeTags and RecipePageHeader
- Remove height in RecipePageHeader
- Add role to checkbox
- Add prop to QuanititysStepper to be shown as always expanded
- Replace webpack with Metro bundler

## react-ui-library
## 2.6.0
Thu, 10 Feb 2022 19:42:42 GMT

### Minor changes

- Modified Daycard added "cheap". Modified DaycardCarousel moved arrows next to DayCards
- Added timeSlotPriceTag component to ui-library. Included component in TimeSlot.
- Added DigitField
- Add icons to burger menu categories

### Patches

- added css to timeslotprice in web
- Fix test in NotificationTopBar
- Removed it.only test from DigitField

## system-notification-service
## 0.1.7
Thu, 10 Feb 2022 19:42:42 GMT

_Version update only_

## web
## 2.10.0
Thu, 10 Feb 2022 19:42:42 GMT

### Minor changes

- Made DeliveryTimeSelectionContainer use the selected,disabled and tag instead of the old state props.
- Add magnolia preview page
- Add icons to burger menu categories

### Patches

- Change props interface for ITimeSlotContainer to follow correct naming convention
- Redirect all preview/* pages to preview/index page
- Update cs link in eyebrow to use env variable
- Improved code readability in `<OrderCard>`
- Fixed error handling in RecipeAddToBasketDialog

_Version update only_

