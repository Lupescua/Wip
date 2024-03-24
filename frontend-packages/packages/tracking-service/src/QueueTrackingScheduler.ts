import { Observable } from 'rxjs';
import { Queue } from './Queue';
import { ImmediateScheduler } from './ImmediateScheduler';
import { AnyRecord, ITracker } from './TrackingService';

/**
 * @public
 */
export interface IQueueTrackingSchedulerConfig<TSystem> {
  /** Controls how methodsToAffect works. Default - 'include' */
  listType?: 'include' | 'exclude';
  /** If omitted all methods will be affected. Can be controlled with listType */
  methodsToAffect?: Array<keyof TSystem>;
}

/**
 * Store tracking events untill the queue has been dequeued. After the queue has been dequeued
 * events are tracked directly.
 *
 * The queue can be closed which will delete all stored events and prevent any future events
 * from being tracked.
 *
 * @public
 */
export class QueueTrackingScheduler<
  TSystem extends AnyRecord
> extends ImmediateScheduler<TSystem> {
  protected readonly _queue: Queue<[keyof TSystem, TSystem[keyof TSystem]]> = new Queue();
  protected readonly _config: IQueueTrackingSchedulerConfig<TSystem>;

  public constructor(
    tracker: ITracker<TSystem>,
    config?: IQueueTrackingSchedulerConfig<TSystem>
  ) {
    super(tracker);

    this._config = { ...config, listType: config?.listType ?? 'include' };

    this._queue.pauseEmission();
    this._queue.subscribe((queueEntry) => {
      const [eventName, payload] = queueEntry;
      // Ensure tracking execution by subscribing to the returned observable
      super.track(eventName, payload)?.subscribe();
    });
  }

  /** Track all stored events */
  public dequeueEvents(): void {
    this._queue.startEmission();
  }

  /** Pause tracking, resume by calling dequeueEvents */
  public pauseEvents(): void {
    this._queue.pauseEmission();
  }

  /** Deletes all stored events and prevent future events from being stored */
  public closeQueue(): void {
    this._queue.close();
  }

  /** Reopen the queue if it has been closed */
  public openQueue(): void {
    this._queue.open();
  }

  /**
   * Stores events untill the queue has been dequeued. After the queue has been
   * dequeued events are tracked directly.
   *
   * If the queue is closed events will be silently ignored.
   */
  public track<TEventName extends keyof TSystem>(
    eventName: TEventName,
    payload: TSystem[TEventName]
  ): Observable<void> | undefined {
    // If no config specified queue all events
    if (!this._config.methodsToAffect) return this._addToQueue(eventName, payload);

    const isInList = this._config.methodsToAffect.includes(eventName);
    // "In list and type is include" OR "not in list and type is exclude"
    if (isInList === (this._config.listType === 'include'))
      return this._addToQueue(eventName, payload);

    return super.track(eventName, payload);
  }

  private _addToQueue(
    eventName: keyof TSystem,
    payload: TSystem[keyof TSystem]
  ): undefined {
    this._queue.add([eventName, payload]);
    return undefined;
  }
}
