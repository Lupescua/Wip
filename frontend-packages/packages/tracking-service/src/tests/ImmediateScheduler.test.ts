import { defer, of } from 'rxjs';
import { ImmediateScheduler } from '../ImmediateScheduler';
import { ITracker } from '../TrackingService';

interface ITrackerSystem {
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

describe('Tracking schedulers', () => {
  const testTracker: ITracker<ITrackerSystem> = {
    productAdded: jest.fn(() => defer(() => of<void>())),
    productViewed: jest.fn(() => defer(() => of<void>()))
  };
  let defaultScheduler: ImmediateScheduler<ITrackerSystem>;

  beforeEach(() => {
    defaultScheduler = new ImmediateScheduler(testTracker);
    jest.resetAllMocks();
  });

  it('should call the correct tracking actions', () => {
    testTracker.productAdded = jest.fn();
    testTracker.productViewed = jest.fn();

    defaultScheduler.track('productAdded', {
      amount: 2,
      productId: '1234'
    });
    defaultScheduler.track('productViewed', {
      position: 1,
      productId: '1234'
    });

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

  it("doesn't break if tracker does not contain method", () => {
    defaultScheduler.track('notNeeded', {});
  });
});
