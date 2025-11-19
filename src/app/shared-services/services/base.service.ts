import { Inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

export abstract class AppBaseService<T> {

  protected source: BehaviorSubject<T | undefined>;
  public current$: Observable<T | undefined>;
  protected subscriptions: Array<Subscription>;

  constructor(t: T) {
    this.subscriptions = [];
    this.source = new BehaviorSubject<T | undefined>(t);
    this.current$ = this.source.asObservable();
  }

  // ngOnDestroy(): void {
  //   if (this.subscriptions && this.subscriptions.length > 0) {
  //     this.subscriptions.forEach(subscription => {
  //       if (subscription) {
  //         subscription.unsubscribe();
  //       }
  //     });
  //   }
  // }

  public set(data?: T) {
    if (data) {
      this.source.next(data);
    } else {
      this.source.next(undefined);
      // console.error('A null object was passed to the ' + this.constructor.name);
    }
  }

  public hasValue() {

    if (Array.isArray(this.source.value)) {
      return this.source.value.length > 0 ? true : false;
    }
    if (this.source.value instanceof Object && this.source.value) {
      return true;
    } else {
      return false;
    }
  }

  public get value() {
    return this.source.value;
  }


}
