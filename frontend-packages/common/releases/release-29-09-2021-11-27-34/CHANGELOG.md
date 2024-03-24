# Change Log - release-29-09-2021-11-27-34

This log was last generated on Wed, 29 Sep 2021 11:28:56 GMT and should not be manually modified.

## basket-api
## 0.1.0
Wed, 29 Sep 2021 11:28:42 GMT

### Minor changes

- add item status
- voucher error response added
- Remove duplicateBasketFromOrder
- Add deleteBasket method
- Cleanup: Remove auth logic, simplify tests and add create endpoint
- Add error codes and update error type guard
- added property to interface
- added sorting by favourites list
- Add edit order
- Add `createBasket()`
- Add `getSuggestedMergeOperation()`
- Add `getIndex()`,`rename()`

### Patches

- Retry getBasket on error
- Remove manual content type headers
- Added sales price to ILineItem
- Fix lint enable/disable commands
- Expose orderId in external data
- Update rush-project.json
- Adjust types
- Use 'carts' as resource on removeAllFromBasket

_Version update only_

## basket-service
## 0.1.0
Wed, 29 Sep 2021 11:28:42 GMT

### Minor changes

- add item is in assortment 
- Remove duplicateBasketFromOrder
- tests
- added method to check if item is in specific list
- added "totalItemsCount" which sums the total number of items in all shoppings lists
- Expose orderId of the basket
- Add plus membership flag to cart creation
- Undo changes
- Add errorhandling to `ensureCart()`
- Add `suggestedMergeOperation`
- Include deposit on basket prediction
- Add `fetchItems()` to ShoppingListService

### Patches

- Add addListItems method to service
- Change grouped line items getter to return a sorted array instead of a record to get sold out as the first category
- Change addRecipe action to not update state because response can't be trusted at the moment
- Move activeListId to state and set activeListId on create
- Persist basket id to active token when editing order
- Make disableBasket not set state
- Adjust tests
- Keep line items when updating shopping list name
- Fix shopping list concurrency key
- Update basket predicter: prefer param sales price and not the line item sales price
- Add skipConfirm to ISuggestedMergeOperation

_Version update only_

## checkout-service
## 0.1.0
Wed, 29 Sep 2021 11:28:42 GMT

### Minor changes

- Implement first version of CheckoutService
- Expose allCompleted and activePanel
- Added enabled state to CheckoutService

### Patches

- Update rush-project.json

_Version update only_

## core-service
## 0.1.0
Wed, 29 Sep 2021 11:28:42 GMT

### Minor changes

- Add new ActionEventHub
- Add resetState to abstract Service
- Add `ActionHandler`
- Add `dispatchEvent()` operator
- Add `dispose()` to ActionExecution
- Add `ActionStatus.SKIP`
- Add limitByGroup concurrency operator
- Initial release
- Add `takeHeadAndTail()` operator
- Add `dispatchActionEvent()` operator
- Remove the emission timeout from `ActionExecution.shared`
- Add `State` with support for optimistic updates
- Add ServiceDescriptor and adjust Service

### Patches

- Fix setState return type inferrence 
- Fix state replay
- Improve core service tests and remove service test adapter
- Rename and improve Action decorator
- Update rush-project.json
- Remove ServiceFactory
- Fix an issue where errors are caught and lost in `optimisticNext()`
- Add parameter `config?: IOptimisticUpdateConfig` to `Service.setState()`
- Reduce the amount of emits from `State`
- Improve the handling and clean up of reducers
- Fix event hub type
- Adjust `headAndTail` key selection typings
- Add helper function `Service.setState()`

## country-informations
## 0.0.1
Wed, 29 Sep 2021 11:28:42 GMT

### Patches

- Rename "CountryInformation" to "countryInformation"
- Update rush-project.json

### Updates

- added package

## delivery-api
## 0.1.0
Wed, 29 Sep 2021 11:28:42 GMT

### Minor changes

- Add b2g contract query parameter to fetch dates and fetch slots
- Change some requests from auth to anon, and add error utilities
- Add DO_NOT_DELIVER error code 
- Initial release
- Add refreshSlot()

### Patches

- Updated errors codes
- Remove manual content type headers
- Update rush-project.json

_Version update only_

## delivery-service
## 0.1.0
Wed, 29 Sep 2021 11:28:42 GMT

### Minor changes

- Change how delivery slots are stored in state and add a direct reference to basket service
- Support whitelisted delivery slots
- changed observable name
- Initial release

### Patches

- Add support for b2g contract in fetch dates and fetch slots
- Fix truthy bug on lastValidation
- Fix test
- Handle expired delivery
- Update rush-project.json
- Add time limit on expiration notifier emits

_Version update only_

## gigya-service
## 0.1.0
Wed, 29 Sep 2021 11:28:42 GMT

### Minor changes

- add getter for accountCheck
- update tests
- add required consents to constructor
- add hasSubscription
- Add support for organizations 
- Add data.terms to updateRegistration
- Implement base functionality (login, get account, logout)
- Implemented "profile" and "setAccountInfo"
- added recentlyRegistered getter
- Add resetPassword
- Add registration methods

### Patches

- isLoggedIn now acts on isValid
- Fix test after changes in gigya api
- Add missing datafields subscriptions and data
- Fix missing profile data
- Added organization token invalidation to logout and small fixes
- Add updateRegistration, getSchema, preferenceSchema
- Dont consider using registered if account is pending
- Update rush-project.json

_Version update only_

## hierarchy-service
## 0.1.0
Wed, 29 Sep 2021 11:28:42 GMT

### Minor changes

- added helper func
- Added extractKey and extractParentKey from config as public functions
- Expose element getter
- Add Hierarchy Service

### Patches

- Add `getAllPaths()`

_Version update only_

## key-value-service
## 0.1.0
Wed, 29 Sep 2021 11:28:42 GMT

### Minor changes

- Implement service

### Patches

- Update rush-project.json

_Version update only_

## layout-service
## 0.1.0
Wed, 29 Sep 2021 11:28:42 GMT

### Minor changes

- Implement first version of layout service
- Add getPayload to ILayoutService
- Add payload to elements

### Patches

- added a getElement service to LayoutService which combines isOpen and getPayload with a new getter for the index of the element
- Update rush-project.json

_Version update only_

## magnolia-api
## 0.1.0
Wed, 29 Sep 2021 11:28:42 GMT

### Minor changes

- added types
- added type
- Add Magnolia API

### Patches

- Modify response parsing to not add contentNodes to the nodes array
- export of isRenderableNode
- Add magnolia endpoints
- Add `getAllPaths()`

_Version update only_

## magnolia-service
## 0.1.0
Wed, 29 Sep 2021 11:28:42 GMT

### Minor changes

- Add pageNav methods
- add magnolia service package
- extended function
- added removeRootFolderFromPath

### Patches

- Renamed getPageById to getPageByPath. Added rootFolder as a constructor parameter.

_Version update only_

## order-api
## 0.1.0
Wed, 29 Sep 2021 11:28:42 GMT

### Minor changes

- added B2B fields to OrderApi.createOrder
- gs
- Add order-api
- Extend OrderTypes
- Extend order API and service with finalize order
- Add missing types in parts subpart
- Add Pagination info to order-api
- Add `updateOrderAddress()` endpoint

### Patches

- Type payment backend type
- Modify type to be possible undefined
- Fix types
- Remove manual content type headers
- Extend external data
- Update rush-project.json

_Version update only_

## order-service
## 0.1.0
Wed, 29 Sep 2021 11:28:42 GMT

### Minor changes

- Add addOrderToBasket
- Expose editingOrder to emit currently active edit order
- added getCutOffByOrderId and activeCutOff
- added B2B fields to OrderApi.createOrder
- Add edit endpoint to order api
- Clean up access of record
- Update Tests with new data types
- Extend order API and service with finalize order
- Clean up test data in tests
- Add order service
- Add pagination to fetchOrders

### Patches

- Fix test after changing order api type
- Add retry to order finalize
- Use emittable type to enable eventHub typings
- Update rush-project.json

_Version update only_

## react-ui-library
## 1.0.0
Wed, 29 Sep 2021 11:28:42 GMT

### Breaking changes

- added exports to the Tooltip component

### Minor changes

- add authentication form
- updated AuthenticationForms
- small changes to basket ui components
- add CheckoutPanel component
- focus search field with search icon
- focus search field in mobile
- add new login form
- add RecipeIndexFilters component
- Add NutritionList component
- add RecipeQuickFilters component
- add RecipeIngredientsTabStepper component
- add RecipeTips component
- update SubstituteForm
- add CompleteRegistrationForm
- add voucher and voucherContainer components
- add signup form
- Add Anchor and Icon components
- Add DayCard, DayCardCarousel and DayCardCarouselMobile components
- Add IconButton component in UI LIB
- Update BorderContainer and SelectionTab. Add Ingredient and IngredientPanel. Other minor adjustments
- Add OverlayDialogue
- add fontColor to <CallToAction>
- Add Popup component
- Add ProductCarousel
- Adjust recipe components to have "Recipe Universe" variants
- Reduce responsibility of Anchor component
- Add Search input field component
- Add SelectionTabs component
- Add ShoppingListForm
- Add ShoppingList layout component
- Add ShoppingListFilter
- Add ShoppingListProductCard and ShoppingListProductCardStepper
- Add Timeslot component
- Add error message to ZipcodeInput
- Add Timeslot selection dialogue components
- Add new components for new categorial PLP design
- Add callback function on overlay components for when a click occours outside of the overlay
- Add TailwindCSS support, Theme plus theme constants and styleguide demo components
- Add theme, globalstyles and font exports to root index
- Modify TopNavigation component to take arbitrary react node as authLink prop instead of explicit props
- Add useBreakpoints custom hook
- Refactor popup to follow Popper documentation recommendations
- Refactor ShoppinglistsOverview to fix stickyness and change design
- Refactor tooltip component to use the Popup component
- Intoruce expand transition
- Implement ImageCloudinary
- Cleanup useLoginForm
- Improve useLoginForm
- New responsive image component
- Add error notification to CheckoutPanel
- css changes to action card
- small css change to product card
- fixed button alignment on shopping list drawer
- added padding
- added ChangePasswordForm
- change zindex of stepper
- added curatedInstructions component
- added eco leaves component
- small css fixes
- Added Empty MiniBasket component
- Add Transition component
- added NotificationBanner component
- hide tip title if no tips
- small changes to nav component
- added ItemList component
- added main nav component
- small changes to basket UI components
- moved shopping list not logged in ui component
- css changes to MainNavigation
- Added Notification component
- moved Overlay component
- more space for product info
- added recipe card component
- add recipe index header
- change to magnolia ui component
- fixed fraction return
- indentation to sidebarMenuAccordion
- added selectOrganisation ui component
- added shopping list card and card base components
- added ShoppingListCardAction component
- added ShoppingListInfo component
- added ShoppingListOverview component
- fic for mobile sticky header
- added shopping list in mobile header
- small changes to overview
- css fix for notification
- moved Split View Panel component
- moved SplitViewPanelHeader component
- exported needed interfaces
- fixed tooltip overflow
- added prop to Tooltip
- added new variant to button
- added home-delivery-dictionary package to react-ui-library package
- added <Whisk> and <LightBulb> icons
- Added story to <HighlightedText>
- Added Text component
- added "slide-left" transition and renamed the transition named "slide" to "slide-right"
- added <Badge>
- changed icon buttons of <MobileHeader> to a slot based approach
- renamed <BurgerMenuList> to <CategoryNavigation> and made changes to the component
- Added cursor: pointer; to <Checkbox>
- Added exporting of "OnChangeMethod" from <TextFieldWithSuggestions>
- Changed <ReadOnlySection> to accept a JSX.element as a child
- Make "value" of <SelectField" controlled by its parent
- Added company part of <UserInformationForm>
- Add error messages to manual address fields of <UserInformationForm>
- Add errorMessage to <TextFieldWithSuggestions>
- Added CustomerInformationForm component and changes to associated components
- Add DeliveryInformationForm component
- added <FoetexAccountTransactionsTable>
- Add <NavigationDrawer> and related sub components
- Added <OrderSummaryAccordion>
- changed <OrderSummaryAccordion> implementation
- Added <Stepper>
- Add ProgressStepper component
- Added ReadOnlySection component
- Added SelectField component
- Added the SpecificationTable component
- Added <Spinner> component
- Added SubstituteForm component
- Added the TextFieldWithSuggestions component
- Added <Video> component and centered Play and Pause icons in their <svg>
- Changed position and style of TextFieldWithSuggestions dropdown
- removed usage of Swipers default navigation
- fixed <Whisk> using invalid jsx property
- Adjust negative margins on <RecipeIndexHeader>
- Changed header height to based on css variable
- make <ContentCard> fit full height
- Updated <Accordion> to use <Transition>
- Added default margins to TextType.headline 1-6
- Added a link variant of <Button>
- Reduced <Carousel> thumb image padding
- removed redundant styles from DesktopHeader
- Added value length of maxLenght to TextField component
- Added loading state to <TextField>
- Added cursor-pointer to <RadioButtonGroup>
- implemented fixed right-button on mobile in <ProgressStepper>
- removed unused classes
- Added the LoginForm component
- added "host" as a prop top <ImageCloudinary>
- added <BurgerMenuButton>
- added <BurgerMenuItem>
- added <BurgerMenuItem>
- Added <BurgerMenuPanel> and small style changes
- changed "menu" in <MobileHeader" to slot
- Centered <Icon> in <Notification> and cleaned up <Notification>
- moved carousel navigation button up
- Added the Accordion component
- Add BasketLineItem component
- Added the Button component
- Added ConsentBox component
- add LoadingAnimation component
- Added PlusPricePromo component
- add ProductLabelList component
- Added ProductLabel component
- Added RadioButtonGroup component
- added RichText component
- Added the TextField component
- reset <AddToBasket> value input blur
- styling improvements of <ProductCard> and related components
- Added <PageWithLeftSidebar>
- Added "extendClass" to <ContentContainer>
- Functionality to remove "underline" styling on <Anchor>
- Added <ContentContainer> and new types to <Text> 
- added <B2BUserInformationForm> and <B2BOrderInformationForm>
- Added shadow to <NavigationDrawer>
- fixed <AddToBasket> opening in front of other elements
- fixed carousel thumb overflow
- fixed text position of <CategoryHeader> on mobile
- removed truncation from <ReadOnlySection>
- fixed <Button> padding of <ShoppingListForm> being overruled by default padding of <Button>
- changed styling of <OverlayContentDialogue>
- Styling changes to mobile version of <BorderContainer>
- Add DialogueText to UI
- Add resetPassword to AuthenticationForm
- Add Fraction UI Component
- Add corp icon
- Added Skeleton loader for PC and PDP
- Add Recipe Page UI
- Add Recipe Skeletons
- Add RestrictionPopup
- Make Generic Carousel
- Refactor ProductCard components and update props
- Make OverlayDialogue more generic
- Move AddToListButton
- Moved component Checkbox
- Moved ComparisonPrice
- Move Dot component
- Move ProductDetailInfo
- Move ProductDetailPrice
- Move component ProductTag
- Move EcoToggle
- Move RecipeDetailPageHeader
- Move RecipeGreenInformation
- Move and refactor RecipeInstructions
- Move UI StepIconTextGroup renamed to Card
- Make PDP
- Update ComparisonPrice to match new version
- Refactor Popup component to be declerative and add a usePopup hook to handle logic
- add h-full to <CallToAction>
- Fixed <ProductCard> product labels height 
- added min-height to body of <OverlayContentDialogue>
- Add RecipeCardGrid
- Add the AddToBasket component
- add sidebar accordion
- Add EndlessScroll component
- Add MiniOrderSummary component
- Move NumberInputField
- Add Full summary elements
- Add OrderListCard
- Add Order Summary Table
- Disable zipcode input in edit mode
- Add andType Product Card
- Added <BorderContainer>
- Add <NotificationTopBar>
- Enable multisection support in searchbar suggestions

### Patches

- Update authentication forms
- Add a label to OrderSummaryAccordion
- Add CallToAction Component
- Add ContentCard component
- Modify useCarousel to handle grouped slides
- Add missing export
- Change Zendesk widget z-index to always overlap app
- Change deliveryInofmrationForm typing on zipcode, remove dirty from form and minor styling adjustments
- Add DotStepper and useCarousel 
- Minor modifications on shoppinglist components 
- Add Footer component
- Add a "offer" variant to mainNavigationList 
- Add OverlayContentDialogue
- Add RecipeAddToBasketProductCard 
- Add loading states to the recipeAddToBasketDialogue
- Add RecipeAddToBasketDialogue
- Add RecipeProductReplacementCard 
- Add shoppinglist related icons
- Add missing exports to root index file
- Add extend class to Accordion
- Remove autofocus on suggestion select in searchinputfield
- Update ZipcodePrompt arrow position on mobile
- Add flag to Popup to dissable react portal behaviour
- Let notification take a reactnode as content
- useCarousel returns swiper instance, ProductCarousel disables autospin upon interaction
- Revert style change to Image component
- Fix category navigation carousel bug
- add GradientScroll component and export useInView
- Modify product card image sizes to fit max size that grid can give it
- Fix scrolling on mobile devices in GradientScroll component
- Make search recommendations scrollable when overflowing
- Add a text to organization picker if no organizations are available and visual fixes
- Fix max height of CallToAction
- Add SplitviewSafety and ProductCardGrid components
- Minor change to ShoppingListProductCard styling
- Refactor SelectionTabs to take a varient prop and add Recipe variant
- Add custom scrollbar to all elements and remove horizontal padding on SplitViewPanel content
- Change OverlayContentDialogue optional sub header
- Add folder prop to ImageCloudinary
- Type change
- Extend class on Navigation component
- Fix ios window height issue
- Fix flex issue on header
- Small fixes to zendesk widget
- Improve Image component
- Fixed min heights on product sliders
- Minor adjustments to mobile design of checkout panels
- Fix key issues
- Only apply custom scroll bars on inner views
- Run tests on build
- Use cssMode for swiper
- Update logo
- Sticky shopping list filter and hover effects
- Adjust product card image
- Fix video width
- Changed ShoppingListFilterOption enum
- made <BreadCrumb> take in an anchorComponent as an argument
- added <DotStepper> to <ProductDetailPage> and removed Swipers native pagination
- changes to z-index on dialog related components
- make <NumberInputField> ignore non-number values
- Made <Checkbox> work with initial "true" value
- Added additionalSuggestionsSlot to <SearchInputField>
- removed <main> from <ProductDetailPage>
- Fix wrong max height calc
- Added warningSlot to <OrderSummaryAccordion>
- add react-autosuggestion to SearchInputField
- Change ActionCard width on desktop
- Change name ultraFreshTitle to nextDeliveryDateTxt
- Add backInStockSoon to OOS
- Add OutOfStockLabel
- Aligned promo
- Small style fixes to recipe page components
- Update dialogue components
- Update addToShoppingList styling
- Add zIndex to overlayDialogue
- Remove unnecessary props
- Update EcoToggle and RecipeInstructions
- Refactor RecipeTips
- Minor update in Recipe card and index filters
- Minor style update to recipe components
- Align product cards title and description
- Align UltraFresh icon and text
- Small fixes to images on site
- Fix ordercard cut on mobile
- Fix Out of Stock alignment pdp
- Remove promoMax tooltip
- Minor style bugs for ecoToggle and instructions
- Make basket item column gap smaller to fit content
- Style fix to the ShoppingListCardAction
- Fix bottom border issue on SearchInputField 
- Move search input field transition into styled component from tailwind
- Make Breadcrumb elements capitalized
- Make Animations smooth
- Align actionSlot according to design
- Better Alignment of shelflife and ProductLabelList in PDP
- Fix Price alignment in ProductCard on desktop
- Add dynamic titles for edit order
- Disable previous/next step button(s) in the Stepper when on the first or the last page.
- Add mobile design for notification top bar
- make icon in orderlistcard dynamic
- Remove console log
- Fix aspect ratio and alignment of Product Labels on PDP
- Add vertical support to ProductCarousel 
- Add `e.preventDefault()` to the root element in the AddToBasket component
- Add netlify build cache
- Update rush-project.json
- Update rush-project.json
- Remove float-right from TopNavigation
- Remove transition from navigation

### Updates

- add VoucherInput component
- Fixed test cases related to mocking of Twitter icon

## recipe-api
## 0.1.0
Wed, 29 Sep 2021 11:28:42 GMT

### Minor changes

- Add recipe api

### Patches

- Change ingredient ID type to number or string instead of just sting
- Clarify return type

_Version update only_

## recipe-service
## 0.1.0
Wed, 29 Sep 2021 11:28:42 GMT

### Minor changes

- Add Recipe Service

### Patches

- Fix bug in fetchScaledProductsForRecipe and the activeRecipe getter
- Minor fixes
- Add an optional keepSelections prop to fetch method
- Refactor based on experiences gained while implementing recipe add to basket
- Fix scaled product null exception

_Version update only_

## recommendation-service
## 0.1.0
Wed, 29 Sep 2021 11:28:42 GMT

### Minor changes

- Seperate fetch and get
- added package

### Patches

- Changes for union document

_Version update only_

## request-handlers
## 0.1.0
Wed, 29 Sep 2021 11:28:42 GMT

### Minor changes

- Cancel requests on auth fail
- Make tokens and token request handler fully generic
- Make request handlers more generic
- ReadonlyToken and LocalStorageToken added
- Expose redonly field on RefreshableToken
- Add retry option to RefreshableToken

### Patches

- Change LocalStorageToken to use defer in getter
- Fix eslint warning
- Handle undefined tokens and fix multi emitting tokens
- Stringify arrays as comma seperated
- Bump @types/qs
- Add DataType to control encoding of request
- Add Body in request
- Update rush-project.json
- Add PATCH to allowed request methods
- Remove 403 http status check

## salesforce-contact-service
## 0.1.0
Wed, 29 Sep 2021 11:28:42 GMT

### Minor changes

- Added fields to the Contact type of SalesForceAPI

### Patches

- use Action decorator
- Fix typo in API
- Update rush-project.json

_Version update only_

## service-adapter-react
## 0.1.0
Wed, 29 Sep 2021 11:28:42 GMT

### Minor changes

- Implement useLoading
- Add dependency array to useObservable
- Initial release
- Implement context factory
- Add state hook for lazy evaluation
- Add context hooks

### Patches

- Add dep array to useEventHub
- Expose useLoading
- Update rush-project.json
- Fix generic type inference
- Add the property "instances" to the service context

_Version update only_

## sg-recommendation-api
## 1.0.0
Wed, 29 Sep 2021 11:28:42 GMT

### Breaking changes

- fixed wrong URLs and typings

### Minor changes

- added skus
- changes to response types
- added package

### Patches

- Add order substitutions

_Version update only_

## suggestion-service
## 0.1.0
Wed, 29 Sep 2021 11:28:42 GMT

### Minor changes

- Implement first version of suggestion service

### Patches

- Fix test
- Fixed the type of ISuggestionService
- Update rush-project.json

_Version update only_

## system-notification-service
## 0.1.0
Wed, 29 Sep 2021 11:28:42 GMT

### Minor changes

- added helper method

_Version update only_

## tracking-hd
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

_Version update only_

## tracking-service
## 0.1.0
Wed, 29 Sep 2021 11:28:42 GMT

### Minor changes

- Allow partial ITracker
- Add tracking service

_Version update only_

## wallet-api
## 0.1.0
Wed, 29 Sep 2021 11:28:42 GMT

### Minor changes

- Add package and initial implementation

### Patches

- Changed typing of balance response
- renamed the type IHistoryItem to ITransaction

_Version update only_

## wallet-service
## 0.0.1
Wed, 29 Sep 2021 11:28:42 GMT

### Patches

- Fix balance 0 issue
- Changed based on type changes of WalletApi
- Fix race-condition when getBalance and getHistory were called the same time
- Added package and initial implementation

_Version update only_

## web
## 1.0.0
Wed, 29 Sep 2021 11:28:42 GMT

### Breaking changes

- PDP in app
- Change prices and props and update Algolia API
- Rename Product Browser Service to Document Browser Servic

### Minor changes

- use voucher code in mini basket
- add new AuthenticationContainer
- added full basket to app
- add deposit message to order confirmation
- add focus prop to SearchBar
- update call of register in signup
- add item isInAssortment label
- add Preferences page
- add refund info dialogue
- add padding for login container
- add sg brand logos to authentication container
- add seo tags
- added VoucherContainer
- Add "add order items to shopping list" button to checkout confirmation page
- Add Delivery information panel to checkout
- Add hide delivery price feature toggle
- Add individual shoppinglists and product card functionality within the shopping lists
- Add recipe detail side panel 
- Add utilities to handeling Magnolia Switchablelink
- Add navigation to CMS pages, stickiness to sidebar navigation and routing when pressing inspiration navigation
- add fontColor to <CallToActionDelegator>
- Add ProductCarouselDelegator
- Add Recipe Universe pages
- Add strong types to internal routes and add search bar to header
- Add TailwindCSS to web app (draft)
- Add core timeslot selection functionality (Part 1)
- Bypass payment when payment type is Account receivable
- Add new categorial PLP design to both offers page and normal category navigation
- Add delivery error handleling and tests
- Add globalstyles, theme, fonts, base layout and navigation
- Add login as an organization
- Modify TopNavigation component to take arbitrary react 
- Setup gateway company auth 
- Add dynatrace tracking
- Add facets
- Add Gigya proxy to avoid cors
- Add CartUpsellPopupDelegator
- Implement auth flow
- Add BasketService and BasketAPI
- Hookup checkout service
- Implement payment
- Add RecipeCardDelegator
- Initialize GaTracker
- Add siteSettingsService
- css changes for action card delegator
- fix for disabled oos add to basket
- removed padding from product card
- Add CarouselSingleImageDelegator
- added ChangePasswordFormContainer
- change zindex of cookie logo
- create shopping list from popup
- created delivery page
- added test for delivery page container
- added test for delivery summary panel
- added delivery slot timeout notification container
- disable signup if organization is required
- added functionality to edit shopping list
- add NotificationBanner to web
- added main nav to app
- added two new magnolia page delegators
- added mini basket
- added test file for MiniBasketContainer
- fixed sections layout in my profile for mobile
- added Magnolia pages under Inspiration
- close wishlist dialogue after routing
- fixed link for products in shopping list
- added product recommendations
- add recipe index page delegator
- fixed item count recipe add to basket
- remove item from list in popup
- added search sidebar
- added tests
- added shopping list overview container
- show check icon when item is in list
- show shooping lists in overview
- css fix for carousel shadows
- add substitution panel
- add underline to terms and conditions link
- added hook for fetching categories
- Add VideoDelegator
- added zendesk widget
- Added cookie consent popup
- Extended primary search to get recipes
- add tobacco and alcohol age restriciton image to checkout page
- wrapped "shopping-list" and "cart" icons of MobileHeader in a <Badge> indicating how many items are either in the shopping-list or basket
- added <CategoryNavigation>
- Added <CustomerInformationPanel> and related components
- Moved value getter and setter out of <DawaInputField> to be able to set initial value from parent
- Added company part of <UserInformationForm>
- Made <DeliveryInformationPanel> show spinner in <DawaInput> when it's validating
- Validate postal code in <DeliveryInformationPanel>
- close <BurgerMenuContainer> when navigating to active route
- Added DawaInputField component
- Fixed empty ultra fresh dialogs
- fixed ESLint warnings
- fixed unused dependency lint error
- Changed header height to based on css variable
- make <ContentCard> fill full height and added missing image dimensions
- Added default margins to TextType.headline 1-6
- Changed existing "inverted" variants of <Button> to use new syntax
- improved how height of <header> is determined
- add inspiration sub pages
- Added <main> to body of <Layout>
- Added Yup as a dependency to make the web-app ready to use the LoginForm component
- fixed wrong facets when linked to recipe search pages
- open external magnolia links in same browser tap
- Added base magnolia types
- added <CarouselRecipeCardDelegator>
- Added <AccordionDelegator>
- added <AnchorDelegator>
- added <ButtonDelegator>
- added <GridContainerColumns1Delegator>
- added <GridContainerColumns2Delegator>
- added <GridContainerColumns3Delegator>
- Add GridContainerColumns4Delegator
- added <FaqLinkDelegator>
- Added <FlexboxDelegator>
- added <IconLinkDelegator>
- added <ImageCollection>
- Added <ImageDelegator> and MagnoliaUtil.getSourceUrl
- Added <LineBreakDelegator>
- added <ProductListingThemeDelegator>
- added <RecipeEditorialPageDelegator>
- Added <RichTextDelegator>
- added manoliaUtil, <Spacer> and <TextDelegator>
- Add fallback route, <FallbackComponent> and <EditorialPageDelegator>
- fixed error when rendering empty magnolia pages
- Added <MagnoliaArea>
- Added MagnoliaComponentDelegator
- Added <MagnoliaComponentDelegator>
- added footer
- added <HomePageDelegator>
- moved <Head> in <HomePageDelegator>
- added magnolia path alias
- Added <BurgerMenuContainer>
- add offers and inspiration to <BurgerMenuContainer>
- changed <MobileHeader> to use the new burgerMenuSlot
- Remove extendClass on <Notification>
- add no-index <meta>
- added page loading indicator
- persist search when navigating products
- fixed overflow based on ui-library component change
- Implement "Min profil" page
- Added <MyProfileNavigation> and aligned styling on profile related components
- Moved "Form" and "ReadOnly" out of DeliveryInformationPanel and UserInformationPanel
- hardcoded anchor to recipes into mobile top navigation
- added recomendationsApi
- added B2B fields to userOptionsService
- Show error in <B2BOrderInformationPanel> when zip codes doesn't align
- change cookie-consent buttons z-index
- fixed <PreferencesContainer> overflowing
- added <UpsellDialog>
- Initial implementation of FoetexAccountContainer
- Add CardDelegator for contact page
- Add resetPassword in login flow
- Make NAD work with picked delivery date
- Add EditOrderDialogue and orderAgain
- Added plus label to basketItem and cleanup in PromoSlot
- Added Skeleton loader for PC and PDP
- Add Recipe Page to web
- Add recipe page popup
- Add Recipe Skeletons
- Add addToShoppingList btn to productCard and pdp
- Add ReplaceItemDialogue
- Add DialogueText to new OverlayDialogue
- Tested recipe detail page
- added h-full to <CallToActionDelegator>
- Add Category Page
- Add Product Browser Service to web app
- Add recipe-api
- Add Recipe List Page
- Add Types for full and partial Product
- add sidebar navigation on category pages
- Refactor Algolia API design
- Add edit order top bar
- Update Tests with new data
- Add hierarhcy service to app
- Hook up order service to order confirmation page
- Add Order Confirmation Page
- add Full order summary page
- add order history page
- Add Orders API and service
- Add pagination to orders page
- Add Notification to payment page when in edit order mod
- Disable zipcode input in edit mode
- Add Product List Page
- Add Recipe Service
- Add Contat Service
- Show confirmation pop up when exiting edit order mode through header
- Implement new searchbar changes
- Implement Algolia tracker in application
- Implement Tracking
- Add tracking interface
- Implement tracking service
- Add AddToBasketContainer
- Add global basket dialogue
- Add build cache
- Add basket merge operations
- Register ShoppingListService
- Add SSG basics

### Patches

- Complete registration
- Make profile inputs full width mobile
- Add action buttons to order cards in My orders
- Changes reflecting updates to Gigya service regarding organizations
- Add Algolia search analytic tags 
- Add b2g contract parameter to delivery fetches when env variable is set
- Add CallToActionDelegator
- Add CallToActionDelegator
- Add ContentCardCarouselDelegator
- Add ContentCardDelegator
- Add Customer service dialogue to checkout flow
- Add error handeling to shoppinglist 
- Add foetex plus membership id when creating basket
- Add Footer delegator component
- Add ManagedCampaignDelegator and CampaignCallToActionDelegator
- Add missing tests to ShoppingListContainer and ShoppingListProductCardContainer
- Add offers page
- Add Product detail page delegator
- Add RecipeAddToBasketDialogue
- ProductCarouselSkeleton type alignment with new carouselconfig interface
- Change Accordion delegator to be multiple accordions instead of a single one. -to match the data we receive from magnolia
- Update dialogues to close when outside the dialogue is clicked
- Blur search input after submit
- Control header visibility with CSS to avoid header switch on hydration
- Insert ZipcodePopup into header to avoid position glitch on scroll
- Replace OOS products in curated product carousel with substitution products
- Remove border on CallToActionDelegator buttons
- Fix a concurrency issue when adding recipe to basket
- Fix delivery message update bug in checkout flow. Add delivery message to summary
- Add GridContainerColumns2Delegator and FlexBoxDelegator to magnolia component mapping
- Fix image delegator not rendering images
- Adjust minibasket price positioning and add fade effect before price summary
- Fix PLP grid bug
- Fix recipe add to basket dialogue such that it does not occasionally deselect all ingredients upon opening
- Fix recipe ingredient selections when switching to green alternative
- Fix replacement ingredient not being persisted when updating personcount
- Fix scrolling in minibasket on mobile
- Make searchbar show recommendations on first input 
- Fix searches with special characters
- Fix shoppinglist favorite icon not being updated
- Font performance fix and mobile header to push down content to not cover it
- Fix magnolia component image scale issue
- Make OOS product group always be on top in basket
- Make PLP shrink when minibasket is opened.
- handle shoppinglistsOverview not logged in buttons
- Remove useBreakpoints hook, and replace use with the same but imported from UI Lib
- Only show dibs payment window if payment type is dibs
- Add RecipeService to service context
- Adjust components that use popup to use new popup interface
- Minor changes to accommodate changes to shoppinglistsOverview
- Remove wrapping on basket total price in header
- Adjust mini basket to fit changes to SplitViewPanel
- Setup CoBrowseIO 
- Show "Page Not Found" when no product is found on PDP
- Add favicon, preloads and preconnects
- Clear basket if cartIdToken is removed
- Add bundle analyzer
- Implement change order
- Add checkout error handling
- Reset services and tokens on logout
- Add document sorting
- Fetch shopping lists on startup
- Hookup order service with delivery service
- Only apply same day delivery for change order
- Allow same day slots if change order is same day
- Cleanup payment to avoid multiple event listeners
- Make facets and sorting sticky
- Fix foetex konto page history and balance
- Fix null exception
- Fix magnolia carousels
- Map magnolia spa routes to internal routes
- Fix ios window height issue
- Handle null exception
- Fix null exception in order
- Fix search encoding filters
- Add foetex memberhip id to merge, accept upper case magnolia routes and add missing gigya consent
- Make styled components SSR compatible
- Run tw jit on ui lib
- Fix wrongly configured tests
- Fix delivery issues
- Small fixes to zendesk widget and header basket button
- Relocate apis, tokens, request handlers and services
- Include gigya dependencies
- Improve footer and image delegator
- Using new tokens, changed interface for basket api and service
- Avoid falsy casting
- Dont lazyload call to action
- Applying new basket errors codes and fixing minor checkout issues
- Import LayoutService
- Implement lazy hydration on heavy magnolia components
- Change logic of basket to delivery page validaton
- hookup terms state and prepare validators
- Setup getUserId in trackingService factory 
- Configure refresh token retry
- fetch basket on startup
- Add strict oos check to curated product carousel
- Update DT script
- Validate delivery address to selected delivery slot
- Implement user profile validator
- Minor fixes
- Fix wrong magnolia path
- Disable auto popup of zipcode prompt
- Add filter functionality of shopping lists in <ShoppingListContainer>
- Made breadcrumbs use SPA routing rather than hard routing
- Made <DawaInputField> lookup specific addresses with floor and door values
- Rename "CountryInformation" to "countryInformation"
- Utilize the new getElement function of LayoutService and utilize the new index value from the getElement service to give the latest opened dialog on top of other dialoges with z-index
- fixed test warnings
- Fixed error in react-ui-library cause by wrong folder name
- on orders - hide "Rediger ordre" when order.status equals cancelled
- Added notification to list items on the "ordre" page when an item is in edit mode
- Added <MyFoetedPageContainer>
- Use the updated SearchInputField and show suggestions from Algolia
- In <ShoppingListContainer> - fixed the filter "Ikke i kurven" to how show all products of the shopping list
- added B2B checkout panels
- feature toggle <VoucherContainer>
- Feature toggle wallet
- Added transaction to the foetex-konto page
- "Add path to plus price promo"
- Add backInStockSoon to OOS
- Align Promo and OOS
- Add order substitutions
- Made title optional in OverlayDialogue
- ConfirmDialogue to clear basket dialogue
- Make all ultraFresh product inStock
- Small fixes to images on site
- Fix ordercard cut on mobile
- Fix Out of Stock alignment pdp
- Add promoMax
- Small fixes in productUtils
- Normal price on plus products
- Make replace btn in basket smaller to fit on mobile
- Skeletons only if products are undefined
- In case productNotifactions are undefined
- Add AddToShoppinglistPopup
- Feature toggle delivery address
- Make part of notificationTxt in basket conditional
- Ensure cookie consent is tracked even on throttled connection
- Use enum of BasketType
- Add facets to algolia api
- Align action buttons on PDP
- Change basket button title depending on edit/normal basket
- Do not show a promo item on product cards when the product is sold ou
- Add Brand to fields to retrieve for partial product
- Fix default page
- Include edit type as active
- Add tracking to cat PLP
- Add TagManager to document head
- Made promotions popup work in basket
- Implement recipe tracking
- use compareNormalPrice when product has quantity discount
- Fix product comparison prices function mapper
- Fix GA tracking images path
- Remove address from tracking deliveryType
- Fix tracker totals
- Fix bug where product recommendation carousel is displayed without products
- Improve recommendation api 
- Add Promotions Popup (MultiPromoDialogue)
- Change delivery string  for tracking
- Hide plus prices when disabled by settings
- show require login dialoge when add to basket if enabled
- Make route tracking happen on routeStart event
- Update rush-project.json
- Update rush-project.json
- Fix ssg issue in useCategoryNavigationItems
- Change run condition for stock checks
- Fix yup dependency
- Add basket token swap

### Updates

- use normal price in shopping list product
- change prop for Consent Box
- Changed <ReadOnlySection> to accept a JSX.element as a child
- Cleaned mismatching dependencies between 'web' and 'react-ui-library'
- Added language selection
- Use language based texts

_Version update only_

