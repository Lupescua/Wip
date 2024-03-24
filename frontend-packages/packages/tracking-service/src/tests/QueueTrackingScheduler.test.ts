import { defer, of } from 'rxjs';
import { QueueTrackingScheduler } from '../QueueTrackingScheduler';
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

describe('QueueTrackingScheduler', () => {
  const testTracker: ITracker<ITrackerSystem> = {
    productAdded: jest.fn(() => defer(() => of<void>())),
    productViewed: jest.fn(() => defer(() => of<void>()))
  };
  let queueScheduler: QueueTrackingScheduler<ITrackerSystem>;

  beforeEach(() => {
    queueScheduler = new QueueTrackingScheduler(testTracker);
    jest.resetAllMocks();
  });

  it('should not call tracking events untill after dequeue has been called', () => {
    testTracker.productAdded = jest.fn();
    testTracker.productViewed = jest.fn();

    queueScheduler.track('productAdded', {
      amount: 2,
      productId: '1234'
    });
    queueScheduler.track('productViewed', {
      position: 1,
      productId: '1234'
    });

    expect(testTracker.productAdded).toBeCalledTimes(0);
    expect(testTracker.productViewed).toBeCalledTimes(0);

    queueScheduler.dequeueEvents();

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

  it('should not call tracking events if the scheduler has been clsoed', () => {
    testTracker.productAdded = jest.fn();
    testTracker.productViewed = jest.fn();

    queueScheduler.track('productAdded', {
      amount: 2,
      productId: '1234'
    });
    queueScheduler.track('productViewed', {
      position: 1,
      productId: '1234'
    });

    queueScheduler.closeQueue();

    expect(testTracker.productAdded).toBeCalledTimes(0);
    expect(testTracker.productViewed).toBeCalledTimes(0);

    queueScheduler.track('productViewed', {
      position: 1,
      productId: '1234'
    });
    queueScheduler.dequeueEvents();
    queueScheduler.track('productViewed', {
      position: 1,
      productId: '1234'
    });

    expect(testTracker.productAdded).toBeCalledTimes(0);
    expect(testTracker.productViewed).toBeCalledTimes(0);
  });

  it('should track events if the queue is opened again after being closed', () => {
    testTracker.productAdded = jest.fn();
    testTracker.productViewed = jest.fn();

    queueScheduler.track('productAdded', {
      amount: 2,
      productId: '1234'
    });
    queueScheduler.track('productViewed', {
      position: 1,
      productId: '1234'
    });

    queueScheduler.closeQueue();

    expect(testTracker.productAdded).toBeCalledTimes(0);
    expect(testTracker.productViewed).toBeCalledTimes(0);

    queueScheduler.openQueue();

    queueScheduler.track('productAdded', {
      amount: 4,
      productId: '4321'
    });
    queueScheduler.dequeueEvents();
    queueScheduler.track('productViewed', {
      position: 5,
      productId: '4321'
    });

    expect(testTracker.productAdded).toBeCalledTimes(1);
    expect(testTracker.productAdded).toHaveBeenCalledWith({
      amount: 4,
      productId: '4321'
    });
    expect(testTracker.productViewed).toBeCalledTimes(1);
    expect(testTracker.productViewed).toHaveBeenCalledWith({
      position: 5,
      productId: '4321'
    });
  });

  it('should track events directly if an include config is specified', () => {
    queueScheduler = new QueueTrackingScheduler(testTracker, {
      methodsToAffect: ['productAdded'],
      listType: 'include'
    });
    queueScheduler.track('productAdded', {
      amount: 42,
      productId: 'bananId'
    });
    queueScheduler.track('productAdded', {
      amount: 2,
      productId: 'tandpastaId'
    });
    queueScheduler.track('productViewed', {
      position: 1,
      productId: 'ostId'
    });

    expect(testTracker.productAdded).toBeCalledTimes(0);
    expect(testTracker.productViewed).toBeCalledTimes(1);
    expect(testTracker.productViewed).toHaveBeenCalledWith({
      position: 1,
      productId: 'ostId'
    });
  });

  it('should track events directly if an exclude config is specified', () => {
    queueScheduler = new QueueTrackingScheduler(testTracker, {
      methodsToAffect: ['productAdded'],
      listType: 'exclude'
    });
    queueScheduler.track('productAdded', {
      amount: 42,
      productId: 'bananId'
    });
    queueScheduler.track('productAdded', {
      amount: 2,
      productId: 'tandpastaId'
    });
    queueScheduler.track('productViewed', {
      position: 1,
      productId: 'ostId'
    });

    expect(testTracker.productAdded).toBeCalledTimes(2);
    expect(testTracker.productAdded).toHaveBeenNthCalledWith(1, {
      amount: 42,
      productId: 'bananId'
    });
    expect(testTracker.productAdded).toHaveBeenNthCalledWith(2, {
      amount: 2,
      productId: 'tandpastaId'
    });
    expect(testTracker.productViewed).toBeCalledTimes(0);
  });

  it("doesn't break if tracker does not contain method", () => {
    queueScheduler.track('notNeeded', {});
  });
});
