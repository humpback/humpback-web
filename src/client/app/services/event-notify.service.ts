import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

export enum EventType {
  UserInfoChanged,
  GroupInfoChanged,
  SidebarMini
}

@Injectable()
export class EventNotifyService {
  private _data = new Subject<Object>();
  private _dataStream$ = this._data.asObservable();

  private _subscriptions: Map<string, Array<Function>> = new Map<string, Array<Function>>();

  constructor() {
    this._dataStream$.subscribe((data) => this._onEvent(data));
  }

  notifyDataChanged(event: EventType, value: any) {
    let eventName = EventType[event];
    let current = this._data[eventName];
    if (current != value) {
      this._data[eventName] = value;
      this._data.next({
        event: eventName,
        data: this._data[eventName]
      })
    }
  }

  subscribe(event: EventType, callback: Function) {
    let eventName = EventType[event];
    let subscribers = this._subscriptions.get(eventName) || [];
    subscribers.push(callback);

    this._subscriptions.set(eventName, subscribers);
  }

  _onEvent(data: any) {
    let subscribers = this._subscriptions.get(data['event']) || [];

    subscribers.forEach((callback) => {
      callback.call(null, data['data']);
    });
  }
}