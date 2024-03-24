/* eslint-disable @typescript-eslint/naming-convention */
import { rxSandbox, RxSandboxInstance } from 'rx-sandbox';
import { Observable, of } from 'rxjs';
import { GA4Tracker } from '../GA4Tracker';

describe('GA4Tracker', () => {
  let scheduler: RxSandboxInstance;
  let tracker: GA4Tracker;
  let pushEvent: (event: string, params: unknown) => Observable<void>;
  let setUserId: () => Observable<void>;

  beforeEach(() => {
    scheduler = rxSandbox.create(true);

    pushEvent = jest.fn(() => of());
    setUserId = jest.fn(() => of());

    tracker = new GA4Tracker({ setUserId, pushEvent });
  });

  describe('addedToBasket', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.addedToBasket({
        products: [
          {
            id: 'id',
            priceIncludingVat: 200,
            inStock: 1,
            positionZeroIndexed: 1,
            quantity: 2
          }
        ],
        page: 'CATEGORY',
        listName: 'some list name',
        sorting: 'some sorting',
        search: {
          searchId: 'some searchId'
        }
      });

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('add_to_cart', {
        ecommerce: {
          currency: 'DKK',
          item_list_name: 'CATEGORY > some list name',
          recommendation_model: '',
          recommendation_version: '',
          recommendation_personalized: '',
          recommendation_flags: '',
          items: [
            {
              item_id: 'id',
              price: 160,
              quantity: 2,
              cogs_promotion_campaign: '',
              cogs_promotion_type: '',
              index: 2,
              item_type: '',
              promotion_name: '',
              offer_type: '',
              coupon: '',
              delivery_type: ''
            }
          ],
          value: 320
        }
      });
    });
  });

  describe('checkout', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.checkout({
        stepName: 'delivery',
        stepNumber: 2,
        products: [
          {
            id: 'id',
            priceIncludingVat: 200,
            inStock: 1,
            positionZeroIndexed: 1,
            quantity: 2
          }
        ]
      });

      getMessages(action$);

      expect(pushEvent).not.toHaveBeenCalled();
    });
  });

  describe('ctaBannerClicked', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.ctaBannerClicked({
        ctaId: 'CUSTOM'
      });

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('select_cta', { cta_id: 'CUSTOM' });
    });
  });

  describe('ctaBannerViewed', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.ctaBannerViewed({
        ctaId: 'CUSTOM'
      });

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('view_cta', { cta_id: 'CUSTOM' });
    });
  });

  describe('outboundLinkClicked', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.outboundLinkClicked({
        url: 'www.externalurl.com'
      });

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('external_click', {
        url: 'www.externalurl.com'
      });
    });
  });

  describe('pageViewed', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.pageViewed({
        path: 'somePath',
        format: 'foetex',
        pageType: 'CATEGORY'
      });

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('page_view', {
        page_location: 'somePath',
        format: 'foetex',
        page_type: 'CATEGORY'
      });
    });
  });

  describe('screenViewed', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.screenViewed({
        path: 'someName'
      });

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('screen_view', {
        screen_name: 'someName'
      });
    });
  });

  describe('pdpViewed', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.pdpViewed({
        product: {
          id: 'id',
          priceIncludingVat: 200,
          inStock: 1,
          positionZeroIndexed: 1
        }
      });

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('view_item', {
        ecommerce: {
          currency: 'DKK',
          item_list_name: '',
          recommendation_model: '',
          recommendation_version: '',
          recommendation_flags: '',
          recommendation_personalized: '',
          items: [
            {
              item_id: 'id',
              price: 160,
              quantity: undefined,
              cogs_promotion_campaign: '',
              cogs_promotion_type: '',
              index: 2,
              item_type: '',
              promotion_name: '',
              coupon: '',
              delivery_type: '',
              offer_type: ''
            }
          ]
        }
      });
    });
  });

  describe('plpViewed', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.plpViewed({
        personalization: false,
        sorting: 'test_index',
        search: {
          searchId: 'asdfq',
          searchVariant: {
            abTestID: 1,
            abTestVariantID: 2
          }
        },
        page: 'CATEGORY',
        listName: 'some list name',
        products: [
          {
            id: 'id',
            priceIncludingVat: 250,
            inStock: 1,
            positionZeroIndexed: 0
          }
        ],
        recommendation: {
          model: 'model',
          version: 'version',
          flags: ['flag1', 'flag2'],
          personalized: true
        }
      });

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('view_item_list', {
        ecommerce: {
          item_list_name: 'CATEGORY > some list name',
          items: [
            {
              item_id: 'id',
              price: 200,
              quantity: undefined,
              cogs_promotion_campaign: '',
              cogs_promotion_type: '',
              index: 1,
              item_type: '',
              promotion_name: '',
              coupon: '',
              delivery_type: '',
              offer_type: ''
            }
          ],
          currency: 'DKK',
          recommendation_model: 'model',
          recommendation_version: 'version',
          recommendation_flags: ['flag1', 'flag2'],
          recommendation_personalized: true,
          search_term: '',
          search_variant: {
            abTestID: 1,
            abTestVariantID: 2
          }
        }
      });
    });
  });

  describe('productClicked', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.productClicked({
        sorting: '',
        page: 'FRONTPAGE',
        listName: 'some list name',
        product: {
          id: 'id',
          priceIncludingVat: 200,
          inStock: 1,
          positionZeroIndexed: 1
        }
      });

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('select_item', {
        ecommerce: {
          content_type: 'product',
          item_list_name: 'FRONTPAGE > some list name',
          recommendation_model: '',
          recommendation_version: '',
          recommendation_flags: '',
          recommendation_personalized: '',
          currency: 'DKK',
          search_term: '',
          items: [
            {
              item_id: 'id',
              price: 160,
              quantity: undefined,
              cogs_promotion_campaign: '',
              cogs_promotion_type: '',
              index: 2,
              item_type: '',
              promotion_name: '',
              coupon: '',
              delivery_type: '',
              offer_type: ''
            }
          ]
        }
      });
    });
  });

  describe('productSubstituted', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.productSubstituted({
        reason: 'OOS',
        replacementObjectId: '321',
        substitutionObjectId: '123'
      });

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('product_substitution', {
        action: 'OOS',
        category: 'Product substitution',
        label: '123|321'
      });
    });
  });

  describe('purchased', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.purchased({
        orderId: 'orderId',
        orderType: 'new',
        paymentMethod: 'ONLINE',
        shippingCostsIncVat: 125,
        pickingCostsIncVat: 10,
        productTotalIncVat: 400,
        basketType: 'mixed',
        products: [
          {
            id: 'id',
            deliveryType: 'delivery',
            priceIncludingVat: 200,
            inStock: 1,
            positionZeroIndexed: 1,
            quantity: 2
          }
        ]
      });

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('purchase', {
        ecommerce: {
          currency: 'DKK',
          items: [
            {
              item_id: 'id',
              price: 160,
              quantity: 2,
              cogs_promotion_campaign: '',
              cogs_promotion_type: '',
              index: 2,
              item_type: '',
              promotion_name: '',
              coupon: '',
              delivery_type: 'delivery',
              offer_type: ''
            }
          ],
          shipping: 108,
          transaction_id: 'orderId',
          value: 320,
          basket_type: 'mixed',
          services: ''
        }
      });
    });
  });

  describe('removedFromBasket', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.removedFromBasket({
        products: [
          {
            id: 'id',
            priceIncludingVat: 200,
            inStock: 1,
            positionZeroIndexed: 1,
            quantity: 2
          }
        ],
        page: 'CATEGORY',
        listName: 'some list name',
        sorting: 'some sorting',
        search: {
          searchId: 'some searchId'
        }
      });

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('remove_from_cart', {
        ecommerce: {
          currency: 'DKK',
          items: [
            {
              item_id: 'id',
              price: 160,
              quantity: 2,
              cogs_promotion_campaign: '',
              cogs_promotion_type: '',
              index: 2,
              item_type: '',
              promotion_name: '',
              offer_type: '',
              coupon: '',
              delivery_type: ''
            }
          ],
          value: 320
        }
      });
    });
  });

  describe('recipeClicked', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.recipeClicked({
        recipe: {
          name: 'Oatmeal',
          prepTime: '20-30',
          priceRange: '30-40',
          id: '123',
          greenRanking: 2,
          positionZeroIndexed: 2
        },
        page: 'CATEGORY',
        listName: 'some list name',
        sorting: 'some sorting'
      });

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('select_item', {
        content_type: 'recipe',
        item_list_id: '',
        item_list_name: 'some list name',
        items: [
          { item_category: undefined, item_id: '123', item_name: 'Oatmeal', price: 0 }
        ]
      });
    });
  });

  describe('recipePdpViewed', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.recipePdpViewed({
        recipe: {
          name: 'Oatmeal',
          prepTime: '20-30',
          priceRange: '30-40',
          id: '123',
          greenRanking: 2,
          positionZeroIndexed: 2
        },
        page: 'CATEGORY',
        listName: 'some list name'
      });

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('view_item', {
        items: [
          { item_category: undefined, item_id: '123', item_name: 'Oatmeal', price: 0 }
        ]
      });
    });
  });

  describe('recipePlpViewed', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.recipePlpViewed({
        recipes: [
          {
            name: 'Oatmeal',
            prepTime: '20-30',
            priceRange: '30-40',
            id: '123',
            greenRanking: 2,
            positionZeroIndexed: 2
          }
        ],
        page: 'CATEGORY'
      });

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('view_item_list', {
        item_list_name: 'CATEGORY',
        items: [
          { item_category: undefined, item_id: '123', item_name: 'Oatmeal', price: 0 }
        ]
      });
    });
  });

  describe('signUpCompleted', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.signUpCompleted({
        area: 'my_account'
      });

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('sign_up', {
        sign_up_area: 'my_account'
      });
    });
  });

  describe('jobViewed', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.jobViewed({
        listName: 'some list name',
        job: {
          index: 1,
          id: '123',
          name: 'Frontend developer...',
          listName: 'some list name',
          categories: ['digital'],
          country: 'DK',
          format: 'SallingGroup',
          jobLevel: 'employee',
          region: 'midtjylland'
        }
      });

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('view_item', {
        item_list_name: 'some list name',
        items: [
          {
            index: 1,
            item_id: '123',
            item_name: 'Frontend developer...',
            item_type: 'job',
            item_list_name: 'some list name',
            job_category: 'digital',
            job_country: 'DK',
            job_format: 'SallingGroup',
            job_level: 'employee',
            job_region: 'midtjylland'
          }
        ]
      });
    });
  });

  describe('jobListViewed', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.jobListViewed({
        index: 1,
        listName: 'some list name',
        jobs: [
          {
            index: 1,
            id: '123',
            name: 'Frontend developer...',
            listName: 'some list name',
            categories: ['digital'],
            country: 'DK',
            format: 'SallingGroup',
            jobLevel: 'employee',
            region: 'midtjylland'
          }
        ]
      });

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('view_item_list', {
        index: 1,
        item_list_name: 'some list name',
        items: [
          {
            index: 1,
            item_id: '123',
            item_name: 'Frontend developer...',
            item_type: 'job',
            item_list_name: 'some list name',
            job_category: 'digital',
            job_country: 'DK',
            job_format: 'SallingGroup',
            job_level: 'employee',
            job_region: 'midtjylland'
          }
        ]
      });
    });
  });

  describe('jobApplied', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.jobApplied({
        index: 1,
        id: '123',
        name: 'Frontend developer...',
        listName: 'some list name',
        categories: ['digital'],
        country: 'DK',
        format: 'SallingGroup',
        jobLevel: 'employee',
        region: 'midtjylland'
      });

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('apply_job', {
        items: [
          {
            job_id: '123',
            job_name: 'Frontend developer...',
            job_category: 'digital',
            job_country: 'DK',
            job_format: 'SallingGroup',
            job_level: 'employee',
            job_region: 'midtjylland'
          }
        ]
      });
    });
  });

  describe('jobClicked', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.jobClicked({
        listName: 'some list name',
        job: {
          index: 1,
          id: '123',
          name: 'Frontend developer...',
          listName: 'some list name',
          categories: ['digital'],
          country: 'DK',
          format: 'SallingGroup',
          jobLevel: 'employee',
          region: 'midtjylland'
        }
      });

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('select_item', {
        item_type: 'job',
        item_list_name: 'some list name',
        items: [
          {
            index: 1,
            item_id: '123',
            item_name: 'Frontend developer...',
            item_type: 'job',
            item_list_name: 'some list name',
            job_category: 'digital',
            job_country: 'DK',
            job_format: 'SallingGroup',
            job_level: 'employee',
            job_region: 'midtjylland'
          }
        ]
      });
    });
  });

  describe('donationApplied', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.donationApplied({
        donationType: 'ferdinand_sallings_mindefond'
      });

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('apply_donation', {
        donation_type: 'ferdinand_sallings_mindefond'
      });
    });
  });

  describe('addFilter', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.filtersClicked({
        action: 'Added',
        page: 'PDP',
        filters: [{ key: 'brand', value: 'Sony' }]
      });

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('add_filter', {
        filter_category: 'brand',
        filter_value: 'Sony'
      });
    });
  });

  describe('removeFilter', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.filtersClicked({
        action: 'Removed',
        page: 'PDP',
        filters: [{ key: 'brand', value: 'Sony' }]
      });

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('remove_filter', {
        filter_category: 'brand',
        filter_value: 'Sony'
      });
    });
  });

  describe('filtersReset', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.filtersReset();

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('reset_filter', {
        filter_value: 'reset'
      });
    });
  });

  describe('search', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.search({
        searchTerm: 'Sony',
        searchArea: 'visual_search'
      });

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('search', {
        search_term: 'Sony',
        search_area: 'visual_search'
      });
    });
  });

  describe('shortcutActivated', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.shortcutActivated({
        type: 'search'
      });

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('shortcut', {
        shortcut_type: 'search'
      });
    });
  });

  describe('videoStarted', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.videoStarted({
        currentTime: '0',
        duration: '1 minute',
        percent: '0%',
        provider: 'youtube',
        title: 'My video title',
        url: 'https://www.youtube.com/watch?v=123',
        visible: true
      });

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('video_start', {
        video_current_time: '0',
        video_duration: '1 minute',
        video_percent: '0%',
        video_provider: 'youtube',
        video_title: 'My video title',
        video_url: 'https://www.youtube.com/watch?v=123',
        visible: true
      });
    });
  });

  describe('addedToWishlist', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.addedToWishlist({
        product: {
          id: 'id',
          priceIncludingVat: 200,
          positionZeroIndexed: 1,
          quantity: 1
        },
        listName: 'some list name'
      });

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('add_to_wishlist', {
        ecommerce: {
          currency: 'DKK',
          item_list_name: 'some list name',
          recommendation_model: '',
          recommendation_version: '',
          recommendation_personalized: '',
          recommendation_flags: '',
          items: [
            {
              item_id: 'id',
              price: 160,
              quantity: 1,
              index: 1,
              promotion_name: '',
              cogs_promotion_campaign: '',
              cogs_promotion_type: ''
            }
          ],
          value: 160
        }
      });
    });
  });

  describe('changedSorting', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.changedSorting({ name: 'brand' });

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('change_sorting', {
        sorting_value: 'brand'
      });
    });
  });

  describe('splitTestVariant', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.splitTestVariant({
        branch: 'test-variant'
      });

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('server_variant: test-variant', {});
    });
  });

  describe('contentSelected', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.contentSelected({
        type: 'type',
        name: 'name',
        url: 'url'
      });

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('select_content', {
        content_type: 'type',
        content_name: 'name',
        content_url: 'url'
      });
    });
  });

  describe('clearEcommerceObject', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.clearEcommerceObject();

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('clear_ecommerce_object', {
        ecommerce: null
      });
    });
  });

  describe('login', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;
      const action$ = tracker.login({ loginArea: 'pdp', customerType: 'b2b' });

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('login', {
        login_area: 'pdp',
        customer_type: 'b2b'
      });
    });
  });

  describe('wishlistShared', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.wishlistShared();

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('share', { content_type: 'wishlist' });
    });
  });

  describe('promotionSelected', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;
      const action$ = tracker.promotionSelected({
        itemListName: 'listName',
        searchTerm: 'searchTerm',
        creativeName: 'creativeName',
        creativeSlot: 'creativeSlot',
        promotionName: '123'
      });

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('select_promotion', {
        ecommerce: {
          item_list_name: 'listName',
          search_term: 'searchTerm',
          creative_name: 'creativeName',
          creative_slot: 'creativeSlot',
          promotion_name: '123'
        }
      });
    });
  });

  describe('promotionViewed', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;
      const action$ = tracker.promotionViewed({
        itemListName: 'listName',
        searchTerm: 'searchTerm',
        creativeName: 'creativeName',
        creativeSlot: 'creativeSlot',
        promotionName: '123'
      });

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('view_promotion', {
        ecommerce: {
          item_list_name: 'listName',
          search_term: 'searchTerm',
          creative_name: 'creativeName',
          creative_slot: 'creativeSlot',
          promotion_name: '123'
        }
      });
    });
  });

  describe('cartViewed', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;
      const action$ = tracker.cartViewed({
        products: [
          {
            id: 'id',
            priceIncludingVat: 200,
            positionZeroIndexed: 1,
            quantity: 2
          }
        ],
        totalPrice: 100,
        basketType: 'mixed'
      });

      getMessages(action$);

      expect(pushEvent).toHaveBeenCalledWith('view_cart', {
        ecommerce: {
          coupon: '',
          currency: 'DKK',
          value: 80,
          basket_type: 'mixed',
          items: [
            {
              item_id: 'id',
              price: 160,
              quantity: 2,
              cogs_promotion_campaign: '',
              cogs_promotion_type: '',
              index: 2,
              item_type: '',
              promotion_name: '',
              coupon: '',
              delivery_type: '',
              offer_type: ''
            }
          ]
        }
      });
    });
  });
});
