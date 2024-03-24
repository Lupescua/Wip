import { rxSandbox, RxSandboxInstance } from 'rx-sandbox';
import { Queue } from '../Queue';

describe.only('Queue', () => {
  let scheduler: RxSandboxInstance;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let queue: Queue<any>;
  beforeEach(() => {
    scheduler = rxSandbox.create(true);
    queue = new Queue();
  });

  it('waits to emit all on subscription', () => {
    const { getMessages, e } = scheduler;

    queue.add('1');
    queue.add('2');
    queue.add('3');

    const action = getMessages(queue);

    expect(action).toEqual(e('(123)'));
  });

  it('emits all without waiting when already subscribed to', () => {
    const { getMessages, e } = scheduler;

    const action = getMessages(queue);
    queue.pauseEmission();
    queue.add('1');
    queue.add('2');
    queue.add('3');
    queue.startEmission();

    expect(action).toEqual(e('(123)'));
  });

  it('should not push events to the queue when closed', () => {
    const { getMessages, e } = scheduler;

    queue.close();
    const action = getMessages(queue);

    queue.add('1');
    queue.add('2');
    queue.add('3');

    expect(action).toEqual(e('()'));
  });

  it('should push events when queue is open', () => {
    const { getMessages, e } = scheduler;

    queue.close();

    const action = getMessages(queue);

    queue.add('1');
    queue.open();
    queue.add('2');

    expect(action).toEqual(e('(2)'));
  });

  it('should work as intended when using pauseEmissions and startEmissions', () => {
    const { getMessages, e } = scheduler;

    queue.pauseEmission();
    const action = getMessages(queue);

    queue.add('1');
    queue.add('2');
    queue.add('3');

    expect(action).toEqual(e('()'));

    queue.startEmission();

    expect(action).toEqual(e('(123)'));

    queue.add('4');
    expect(action).toEqual(e('(1234)'));

    queue.pauseEmission();
    queue.add('4');
    queue.add('4');
    queue.add('4');
    queue.add('4');

    expect(action).toEqual(e('(1234)'));

    queue.startEmission();
    expect(action).toEqual(e('(12344444)'));
  });
});
