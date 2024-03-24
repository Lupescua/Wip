import { Subject, Subscription } from 'rxjs';

/**
 * @public
 */
export class EventHub<TMessage> {
  private _subject: Subject<TMessage>;

  public constructor() {
    this._subject = new Subject<TMessage>();
  }

  public subscribe(subscriber: (value: TMessage) => void): Subscription {
    return this._subject.subscribe(subscriber);
  }

  public dispatch(event: TMessage): void {
    this._subject.next(event);
    this.handleDispatch(event);
  }

  protected handleDispatch(event: TMessage): void {}
}
