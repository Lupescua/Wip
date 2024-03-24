import { rxSandbox, RxSandboxInstance } from 'rx-sandbox';
import { Observable, of } from 'rxjs';
import { GaTracker, ITrackingProduct } from '../GaTracker';
import * as gaTrackerUtils from '../gaTrackerUtils';

describe('GaTracker', () => {
  let scheduler: RxSandboxInstance;
  let tracker: GaTracker;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let dataLayer: any[];
  let getProductsById: (param: string[]) => Observable<ITrackingProduct[]>;
  let getUserId: () => Observable<string>;

  beforeEach(() => {
    scheduler = rxSandbox.create(true);

    dataLayer = [{ event: 'gtm.load' }];
    dataLayer.push = jest.fn();

    getProductsById = jest.fn(() =>
      of([
        {
          id: 'id',
          name: 'name',
          description: 'description',
          priceIncVat: 1,
          brand: 'brand',
          category: 'cat1 > cat2',
          splatter: 'Dagens hug',
          stock: 1,
          images: ['img', 'img2'],
          isMultiBuy: false,
          price: 123,
          specifications: ''
        }
      ])
    );

    getUserId = jest.fn(() => of('userId'));

    jest
      .spyOn(gaTrackerUtils, 'ensureTagManager')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .mockImplementation(() => of([]) as any);

    tracker = new GaTracker(dataLayer, { getProductsById, getUserId });
    if (!expect.getState().currentTestName.includes('cookieConsentGiven')) {
      tracker
        .cookieConsentGiven({ functional: true, marketing: true, statistic: true })
        .subscribe();
    }
  });

  describe('initialize', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.initialize({});

      getMessages(action$);

      expect(dataLayer.push).toHaveBeenCalledWith({
        originalLocation: ''
      });
    });
  });

  describe('cookieConsentGiven', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.cookieConsentGiven({
        functional: true,
        marketing: true,
        statistic: true
      });

      getMessages(action$);

      expect(dataLayer.push).toHaveBeenCalledWith({
        event: 'gaGTMevent',
        eventAction: 'done',
        eventCategory: 'cookie-accept'
      });
    });
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
            quantity: 2,
            deliveryType: 'delivery'
          }
        ],
        page: 'CATEGORY',
        listName: 'some list name',
        sorting: 'some sorting',
        search: {
          searchId: 'some searchId',
          searchVariant: {
            abTestID: 987,
            abTestVariantID: 1
          }
        }
      });

      getMessages(action$);

      expect(dataLayer.push).toHaveBeenCalledWith({
        event: 'addToCart',
        custom_dimensions: {
          dimension10: '987_1',
          dimension87: 'userId'
        },
        ecommerce: {
          currencyCode: 'DKK',
          add: {
            actionField: {
              list: 'CATEGORY > some list name'
            },
            products: [
              {
                id: 'id',
                price: 160,
                quantity: 2,
                position: 2,
                dimension83: 'delivery'
              }
            ]
          }
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
            quantity: 2,
            deliveryType: 'delivery'
          }
        ]
      });

      getMessages(action$);

      expect(dataLayer.push).toHaveBeenCalledWith({
        event: 'checkout',
        custom_dimensions: {
          dimension87: 'userId'
        },
        ecommerce: {
          checkout: {
            actionField: {
              step: 2,
              option: 'delivery'
            },
            products: [
              {
                id: 'id',
                price: 160,
                quantity: 2,
                position: 2,
                dimension83: 'delivery'
              }
            ]
          }
        }
      });
    });
  });

  describe('ctaBannerClicked', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.ctaBannerClicked({
        ctaId: '12345678'
      });

      getMessages(action$);

      expect(dataLayer.push).toHaveBeenCalledWith({
        event: 'gaGTMevent',
        eventAction: 'click',
        eventCategory: `cta`,
        eventLabel: `12345678`
      });
    });
  });

  describe('ctaBannerViewed', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.ctaBannerViewed({
        ctaId: '12345678'
      });

      getMessages(action$);

      expect(dataLayer.push).toHaveBeenCalledWith({
        event: 'gaGTMevent',
        eventAction: 'view',
        eventCategory: `cta`,
        eventLabel: `12345678`
      });
    });
  });

  describe('outboundLinkClicked', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.outboundLinkClicked({
        url: 'www.externalurl.com'
      });

      getMessages(action$);

      expect(dataLayer.push).toHaveBeenCalledWith({
        event: 'externalClick',
        url: 'www.externalurl.com'
      });
    });
  });

  describe('pageViewed', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.pageViewed({
        path: 'somePath',
        variant: 'test-variant',
        format: 'foetex',
        layout: 'A'
      });

      getMessages(action$);

      expect(dataLayer.push).toHaveBeenCalledWith({
        event: 'createPageView',
        url: 'somePath',
        custom_dimensions: {
          dimension7: 'test-variant',
          dimension8: 'A',
          dimension9: 'foetex',
          dimension87: 'userId'
        }
      });
    });

    it('pushes expected payload to tracking layer with correct fallback for dimension7', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.pageViewed({
        path: 'somePath',
        format: 'foetex'
      });

      getMessages(action$);

      expect(dataLayer.push).toHaveBeenCalledWith({
        event: 'createPageView',
        url: 'somePath',
        custom_dimensions: {
          dimension7: 'original',
          dimension9: 'foetex',
          dimension87: 'userId'
        }
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

      expect(dataLayer.push).toHaveBeenCalledWith({
        event: 'product_view',
        custom_dimensions: {
          dimension10: '',
          dimension87: 'userId'
        },
        ecommerce: {
          detail: {
            products: [
              {
                id: 'id',
                price: 160,
                quantity: 1
              }
            ]
          }
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
            abTestID: 987,
            abTestVariantID: 1
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
        ]
      });

      getMessages(action$);

      expect(dataLayer.push).toHaveBeenCalledWith({
        event: 'productListView',
        custom_dimensions: {
          dimension10: '987_1',
          dimension19: false,
          dimension87: 'userId'
        },
        algolia: {
          event: 'CATEGORY',
          user: 'userId',
          index: 'test_index',
          query_id: 'asdfq'
        },
        ecommerce: {
          impressions: [
            {
              id: 'id',
              price: 200,
              quantity: 1,
              position: 1,
              list: 'CATEGORY > some list name'
            }
          ]
        }
      });
    });

    it('pushes expected payload to tracking layer with search variant IDs', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.plpViewed({
        personalization: false,
        sorting: 'test_index',
        search: {
          searchId: 'asdfq',
          searchVariant: {
            abTestID: 987,
            abTestVariantID: 1
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
        ]
      });

      getMessages(action$);

      expect(dataLayer.push).toHaveBeenCalledWith({
        event: 'productListView',
        custom_dimensions: {
          dimension10: '987_1',
          dimension19: false,
          dimension87: 'userId'
        },
        algolia: {
          event: 'CATEGORY',
          user: 'userId',
          index: 'test_index',
          query_id: 'asdfq'
        },
        ecommerce: {
          impressions: [
            {
              id: 'id',
              price: 200,
              quantity: 1,
              position: 1,
              list: 'CATEGORY > some list name'
            }
          ]
        }
      });
    });
  });

  describe('productClicked', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.productClicked({
        sorting: '',
        search: {
          searchId: 'asdfq',
          searchVariant: {
            abTestID: 987,
            abTestVariantID: 1
          }
        },
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

      expect(dataLayer.push).toHaveBeenCalledWith({
        event: 'productClick',
        custom_dimensions: {
          dimension10: '987_1',
          dimension87: 'userId'
        },
        ecommerce: {
          click: {
            actionField: {
              list: 'FRONTPAGE > some list name'
            },
            products: [
              {
                id: 'id',
                price: 160,
                position: 2,
                quantity: 1
              }
            ]
          }
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

      expect(dataLayer.push).toHaveBeenCalledWith({
        event: 'gaGTMevent',
        eventAction: 'OOS',
        eventCategory: 'Product substitution',
        eventLabel: `123|321`
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
        ],
        search: {
          searchId: 'asdfq',
          searchVariant: {
            abTestID: 987,
            abTestVariantID: 1
          }
        }
      });

      getMessages(action$);

      expect(dataLayer.push).toHaveBeenCalledWith({
        event: 'ecom_purchase',
        custom_dimensions: {
          dimension10: '987_1',
          dimension87: 'userId',
          dimension85: 'ONLINE',
          dimension102: 'new'
        },
        ecommerce: {
          currencyCode: 'DKK',
          purchase: {
            actionField: {
              action: 'purchase',
              id: 'orderId',
              revenue: 320,
              shipping: 108
            },
            products: [
              {
                id: 'id',
                price: 160,
                quantity: 2,
                position: 2,
                dimension83: 'delivery'
              }
            ]
          }
        }
      });
    });

    it('pushes expected payload to tracking layer with empty product array', () => {
      getProductsById = jest.fn(() => of([]));
      tracker = new GaTracker(dataLayer, { getProductsById, getUserId });
      tracker
        .cookieConsentGiven({ functional: true, marketing: true, statistic: true })
        .subscribe();
      const { getMessages } = scheduler;

      const action$ = tracker.purchased({
        orderId: 'orderId',
        orderType: 'cancellation',
        paymentMethod: 'ONLINE',
        shippingCostsIncVat: 125,
        pickingCostsIncVat: 10,
        productTotalIncVat: 400,
        products: [],
        basketType: 'mixed'
      });

      getMessages(action$);

      expect(dataLayer.push).toHaveBeenCalledWith({
        event: 'ecom_purchase',
        custom_dimensions: {
          dimension10: '',
          dimension87: 'userId',
          dimension85: 'ONLINE',
          dimension102: 'cancellation'
        },
        ecommerce: {
          currencyCode: 'DKK',
          purchase: {
            actionField: {
              action: 'purchase',
              id: 'orderId',
              revenue: 320,
              shipping: 108
            },
            products: []
          }
        }
      });
    });
  });

  describe('recommendationClicked', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.recommendationClicked({
        apiEndpoint: 'mostBought',
        engine: 'recommendation_engine',
        objectId: 'productId',
        page: 'CATEGORY'
      });

      getMessages(action$);

      expect(dataLayer.push).toHaveBeenCalledWith({
        event: 'gaGTMevent',
        eventAction: 'click',
        eventCategory: `personalization|CATEGORY|recommendation_engine`,
        eventLabel: `mostBought|productId`
      });
    });
  });

  describe('recommendationViewed', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.recommendationViewed({
        apiEndpoint: 'mostBought',
        engine: 'recommendation_engine',
        page: 'CATEGORY'
      });

      getMessages(action$);

      expect(dataLayer.push).toHaveBeenCalledWith({
        event: 'gaGTMevent',
        eventAction: 'view',
        eventCategory: `personalization|CATEGORY|recommendation_engine`,
        eventLabel: `mostBought`
      });
    });
  });

  describe('removedToBasket', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.removedFromBasket({
        products: [
          {
            id: 'id',
            priceIncludingVat: 200,
            inStock: 1,
            positionZeroIndexed: 1,
            quantity: 2,
            deliveryType: 'delivery'
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

      expect(dataLayer.push).toHaveBeenCalledWith({
        event: 'removeFromCart',
        custom_dimensions: {
          dimension87: 'userId'
        },
        ecommerce: {
          currencyCode: 'DKK',
          remove: {
            actionField: {
              list: 'CATEGORY > some list name'
            },
            products: [
              {
                id: 'id',
                price: 160,
                quantity: 2,
                position: 2,
                dimension83: 'delivery'
              }
            ]
          }
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

      expect(dataLayer.push).toHaveBeenCalledWith({
        event: 'productClick',
        custom_dimensions: {
          dimension87: 'userId'
        },
        ecommerce: {
          currencyCode: 'DKK',
          click: {
            actionField: {
              list: 'CATEGORY > some list name'
            },
            products: [
              {
                name: 'Oatmeal',
                id: '123',
                category: undefined,
                position: 3,
                variant: {
                  type: 'recipe',
                  id: '123',
                  prep_time: '20-30',
                  price_range: '30-40',
                  green_rank: 2
                }
              }
            ]
          }
        }
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

      expect(dataLayer.push).toHaveBeenCalledWith({
        event: 'product_view',
        custom_dimensions: {
          dimension87: 'userId'
        },
        ecommerce: {
          click: {
            actionField: {
              list: 'CATEGORY > some list name'
            },
            products: [
              {
                name: 'Oatmeal',
                id: '123',
                position: 3,
                variant: {
                  type: 'recipe',
                  id: '123',
                  prep_time: '20-30',
                  price_range: '30-40',
                  green_rank: 2
                }
              }
            ]
          }
        }
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

      expect(dataLayer.push).toHaveBeenCalledWith({
        event: 'productListView',
        custom_dimensions: {
          dimension87: 'userId'
        },
        ecommerce: {
          currencyCode: 'DKK',
          impressions: [
            {
              name: 'Oatmeal',
              id: '123',
              category: undefined,
              list: 'CATEGORY',
              position: 3,
              variant: {
                type: 'recipe',
                id: '123',
                prep_time: '20-30',
                price_range: '30-40',
                green_rank: 2
              }
            }
          ]
        }
      });
    });
  });

  describe('signUpCompleted', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.signUpCompleted({});

      getMessages(action$);

      expect(dataLayer.push).toHaveBeenCalledWith({
        event: 'gaGTMevent',
        eventCategory: 'Sign up flow',
        eventAction: 'Complete registration',
        eventLabel: 'userId',
        dimension87: 'userId'
      });
    });
  });

  describe('trackingId', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.trackingId({ trackingId: 'id' });

      getMessages(action$);

      expect(dataLayer.push).toHaveBeenCalledWith({
        tracking_id: 'id'
      });
    });
  });

  describe('userId', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.userId({ gigyaId: 'id' });

      getMessages(action$);

      expect(dataLayer.push).toHaveBeenCalledWith({
        user_id: 'id'
      });
    });
  });

  describe('anonymousId', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.anonymousId({ anonymousId: 'id' });

      getMessages(action$);

      expect(dataLayer.push).toHaveBeenCalledWith({
        anonymous_id: 'id'
      });
    });
  });

  describe('login', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.login({ customerType: 'b2b', loginArea: 'checkout' });

      getMessages(action$);

      expect(dataLayer.push).toHaveBeenCalledWith({
        event: 'login',
        customer_type: 'b2b',
        login_area: 'checkout'
      });
    });
  });

  describe('flipbookView', () => {
    it('pushes expected payload to tracking layer', () => {
      const { getMessages } = scheduler;

      const action$ = tracker.flipbookView({ name: 'newsletter', page: '1-2' });

      getMessages(action$);

      expect(dataLayer.push).toHaveBeenCalledWith({
        event: 'view_ipaper',
        ipaper_flipbook: 'newsletter',
        ipaper_page: '1-2'
      });
    });
  });
});
