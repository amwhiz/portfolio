import { Observable } from 'rxjs/Observable';
import { OnDestroy } from '@angular/core';
import { PartialObserver } from 'rxjs/Observer';
import { Subscription } from 'rxjs/Subscription';
// declare const _: LoDashStatic;
import * as _ from 'lodash';
import { LoDashStatic } from 'lodash';

// Base class for all components - good place for common data or non-static utility methods that most components are likely
// to need but make more sense as a base component rather than a service or pipe or whatever.
export abstract class BaseComponent implements OnDestroy {

  // Lodash
  public _: LoDashStatic = _;

  // Convenient way to ensure a subscription gets cleaned up when the component is destroyed - instead of calling
  // observable.subscribe(), call this.subscribe(observable, next, error, complete) and it will get unsubscribed
  // when the component is destroyed.
  protected subscriptions: Subscription[] = [];

  public stopEvent(event: Event) {
    if (!(event instanceof Event)) {
      /* tslint:disable */
      console.log(`${event} is not a Event`);
      /* tslint:enable */
    }
    if (event) {
      event.stopPropagation();
    }
  }

  // This method can be used when you want to handle the subscription to the observable yourself but want to have

  public preventEvent(event: Event) {
    if (!(event instanceof Event)) {
      /* tslint:disable */
      console.log(`${event} is not a Event`);
      /* tslint:enable */
    }
    if (event) {
      event.preventDefault();
    }
  }

  public eventStopAndPrevent(event: Event) {
    this.stopEvent(event);
    this.preventEvent(event);
  }

  ngOnDestroy() {
    // This component has been destroyed, unsubscribe from all the subscriptions we know about for cleanup.
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  protected subscribe<T>(observable: Observable<T>,
                         observerOrNext?: PartialObserver<T> | ((value: T) => void),
                         error?: (error: any) => void,
                         complete?: () => void): Subscription {
    if (observable) {
      let subscription;
      if (error) {
        subscription = observable.subscribe(observerOrNext as ((value: T) => void), error, complete);
      } else {
        subscription = observable.subscribe(observerOrNext as PartialObserver<T>);
      }
      this.subscriptions.push(subscription);
      return subscription;
    }
    return null;
  }

  // the base class handle the cleanup.  Pass it the subscription that should be removed OnDestroy.
  protected cleanupSubscriptionOnDestroy(subscription: Subscription) {
    if (subscription && subscription.unsubscribe) {
      this.subscriptions.push(subscription);
    }
  }
}
