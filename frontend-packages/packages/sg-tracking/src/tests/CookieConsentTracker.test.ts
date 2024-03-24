import { rxSandbox, RxSandboxInstance } from 'rx-sandbox';
import { Subject } from 'rxjs';
import { concatMapTo } from 'rxjs/operators';
import { CookieConsentTracker } from '../CookieConsentTracker';
import { Queue } from '../Queue';

class Tracker extends CookieConsentTracker {
  public constructor(subscriber: (data: unknown) => void) {
    super(new Queue(), new Subject());
    this._dequeue().pipe(concatMapTo(this._queue)).subscribe(subscriber);
  }
  public push(data: unknown): void {
    this._push(data);
  }
}

describe('CookieConsentTracker', () => {
  let tracker: Tracker;
  let scheduler: RxSandboxInstance;
  let subscriberMock: (data: unknown) => void;

  beforeEach(() => {
    subscriberMock = jest.fn();
    tracker = new Tracker(subscriberMock);
    scheduler = rxSandbox.create(true);
  });

  it('should open the queue when consent is given', () => {
    const { getMessages } = scheduler;

    getMessages(
      tracker.cookieConsentGiven({ statistic: true, marketing: true, functional: true })
    );

    tracker.push('EVENT');
    expect(subscriberMock).toHaveBeenCalledWith('EVENT');
  });

  it('should close the queue when no consent is given', () => {
    const { getMessages } = scheduler;

    getMessages(
      tracker.cookieConsentGiven({ statistic: false, marketing: false, functional: true })
    );

    tracker.push('EVENT');
    expect(subscriberMock).not.toHaveBeenCalled();
  });
});
