import { PartialObserver, Subject, Subscription } from 'rxjs';

/**
 * Extends Subject meaning it is an Observable and an Observer.
 *
 * Can be either open or closed which dictates whether or not items
 * can be added.
 *
 * If there are no observers subscribed items will be stored in a queue and
 * emitted when an observer subscribes. Futheremore this behaviour can be
 * forced by calling pauseEmissions. If paused all items will be stored
 * regardless of subscibers. Calling startEmissions will then emit all events
 * to all subscribers.
 *
 * Stored items will be emitted in the same order that they were added.
 *
 * @public
 */
export class Queue<T> extends Subject<T> {
  private _isOpen: boolean = true;
  private _isPaused: boolean = false;
  private _items: T[] = [];

  /** Adds an item to the Queue if it is open, if not item is ignored. */
  public add(item: T): void {
    if (!this._isOpen) return;
    if (this.observers.length > 0 && !this._isPaused) {
      this.next(item);
    } else {
      this._items.push(item);
    }
  }

  public subscribe(
    // eslint-disable-next-line @rushstack/no-new-null
    observerOrNext?: PartialObserver<T> | ((value: T) => void) | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @rushstack/no-new-null
    error?: ((error: any) => void) | null,
    // eslint-disable-next-line @rushstack/no-new-null
    complete?: (() => void) | null
  ): Subscription {
    const observer: PartialObserver<T> =
      typeof observerOrNext === 'function'
        ? {
            next: observerOrNext ?? (() => {}),
            error: error ?? undefined,
            complete: complete ?? undefined
          }
        : observerOrNext ?? { next: () => {} };
    const subscription = super.subscribe(observer);
    if (!this._isPaused) this._emptyQueue();
    return subscription;
  }

  /** When closed nothing can be added to the Queue. Close also clears any stored items */
  public close(): void {
    this._items = [];
    this._isOpen = false;
  }

  /** Open up for items to be added to the Queue */
  public open(): void {
    this._isOpen = true;
  }

  /** Start emission of items. If any observers are subscribed all stored item will be emitted */
  public startEmission(): void {
    this._isPaused = false;
    if (this.observers.length > 0) this._emptyQueue();
  }

  /** Pause emission of items. All items will be stored and only emitted once the Queue is started again with startEmission */
  public pauseEmission(): void {
    this._isPaused = true;
  }

  private _emptyQueue(): void {
    this._items.forEach((item) => this.next(item));
    this._items = [];
  }
}
