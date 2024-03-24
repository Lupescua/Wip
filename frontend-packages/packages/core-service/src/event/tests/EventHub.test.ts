import { EventHub } from '../EventHub';

describe('ActionEmitter', () => {
  let eventHub: EventHub<string>;
  beforeEach(() => {
    eventHub = new EventHub();
  });

  it('subscribes and dispatches', () => {
    const messages: string[] = [];
    eventHub.subscribe((message) => messages.push(message));

    eventHub.dispatch('first');
    eventHub.dispatch('second');

    expect(messages).toEqual(['first', 'second']);
  });
});
