import { Subject, Subscription } from 'rxjs';

/**
 * @public
 */
export class Queue<T> extends Subject<T> {
  private _isActive: boolean = true;
  private _items: T[] = [];

  public add(item: T): void {
    if (!this._isActive) return;
    if (this.observers.length > 0) {
      this.next(item);
    } else {
      this._items.push(item);
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public subscribe(observer?: any): Subscription {
    const subscription = super.subscribe(observer);
    this._items.forEach((item) => this.next(item));
    this._items = [];
    return subscription;
  }

  public close(): void {
    this._items = [];
    this._isActive = false;
  }

  public open(): void {
    this._isActive = true;
  }
}
