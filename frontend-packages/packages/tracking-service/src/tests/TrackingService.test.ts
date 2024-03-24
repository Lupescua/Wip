import { rxSandbox, RxSandboxInstance } from 'rx-sandbox';
import { defer, of } from 'rxjs';
import { ImmediateScheduler } from '../ImmediateScheduler';
import { ITracker, TrackingService } from '../TrackingService';

export interface ITrackerSystem {
  productAdded: {
    productId: string;
    amount: number;
  };
  productViewed: {
    productId: string;
    position: number;
  };
  notNeeded: {};
}

describe('Tracking Service', () => {
  let scheduler: RxSandboxInstance;
  let trackingService: TrackingService<ITrackerSystem>;

  const testTracker: ITracker<ITrackerSystem> = {
    productAdded: jest.fn(() => defer(() => of<void>())),
    productViewed: jest.fn(() => defer(() => of<void>()))
  };

  beforeEach(() => {
    scheduler = rxSandbox.create(true);

    trackingService = new TrackingService<ITrackerSystem>([testTracker]);
    jest.resetAllMocks();
  });

  it('should call tracking actions in order', () => {
    const { cold, getMessages, e } = scheduler;

    testTracker.productAdded = jest.fn(() => cold<void>('--a|'));
    testTracker.productViewed = jest.fn(() => cold<void>('----b|'));

    trackingService.track('productAdded', {
      amount: 2,
      productId: '1234'
    });
    trackingService.track('productViewed', {
      position: 1,
      productId: '1234'
    });

    const result = getMessages(trackingService.queue);

    expect(result).toEqual(e('--a----b'));
    expect(testTracker.productAdded).toBeCalledTimes(1);
    expect(testTracker.productAdded).toHaveBeenCalledWith({
      amount: 2,
      productId: '1234'
    });
    expect(testTracker.productViewed).toBeCalledTimes(1);
    expect(testTracker.productViewed).toHaveBeenCalledWith({
      position: 1,
      productId: '1234'
    });
  });

  it('should call actions on tracker if a tracking scheduler is given', () => {
    const { cold, getMessages, e } = scheduler;

    trackingService = new TrackingService<ITrackerSystem>([
      new ImmediateScheduler(testTracker)
    ]);

    testTracker.productViewed = jest.fn(() => cold<void>('----b|'));

    trackingService.track('productViewed', {
      position: 1,
      productId: '1234'
    });

    const result = getMessages(trackingService.queue);

    expect(result).toEqual(e('----b'));
    expect(testTracker.productViewed).toBeCalledTimes(1);
    expect(testTracker.productViewed).toHaveBeenCalledWith({
      position: 1,
      productId: '1234'
    });
  });

  it("doesn't break if tracker does not contain method", () => {
    trackingService.track('notNeeded', {});
  });
});
