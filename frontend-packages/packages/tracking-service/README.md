# Tracking Service 
## Tracking Schedulers

Tracking schedulers decouples **how** events are being tracked from **when** events are being tracked.
Schedulers takes care of the **when** and the individual tracker implementation takes care of the **how**

### How to make Schedulers

A tracking scheduler is a class that implements `ITrackingScheduler`. This can be done by extending the scheduler `ImmediateScheduler<TSystem>`. To track an event the scheduler calls `super.track(eventName, payload);`. The concept being that the individual scheduler implementation decides when `super.track` is called and thereby it controls **when** events are being tracked. 

See `QueueTrackingScheduler` for an example of a scheduler implementation.

Note that it's not necessary to extend the immediateScheduler to implement the `ITrackingScheduler`, an alternative is to implement the ITrackingScheduler interface and manually map the track method to the correct tracker method. This allows for more flexibility when needed. 

#### Requirements for coding schedulers

 - When calling `super.track(eventName, payload);` it is important to ensure that the returned value is subscribed to. As some track methods can rely on being subscribed to.
   - Simple solution: `super.track(eventName, payload)?.subscribe();`

### How to use Schedulers

When instantiating the TrackingService you can both provide trackers with or without schedulers. Not adding a scheduler will mean that either the tracker itself handles the timing of events, or the events are fired immediately as they are triggered in the application. 

To add a scheduler to a tracker you have to instantiate the scheduler with the tracker as a constructor parameter. 

#### Example:
```ts
const gaTracker: ITracker<IHomeDeliveryTracking> = new GaTracker(window.dataLayer, {
  getProductsById,
  getUserId
});

const ScheduledGaTracker = new QueueTrackingScheduler(gaTracker)

return new TrackingService([ScheduledGaTracker]);
```