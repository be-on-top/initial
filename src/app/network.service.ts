import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  private onlineStatus: Subject<boolean>;

  constructor() {
    this.onlineStatus = new Subject<boolean>();
    this.onlineStatus.next(window.navigator.onLine);

    window.addEventListener('online', () => this.updateOnlineStatus());
    window.addEventListener('offline', () => this.updateOnlineStatus());
  }

  private updateOnlineStatus() {
    this.onlineStatus.next(window.navigator.onLine);
  }

  getOnlineStatus() {
    return this.onlineStatus.asObservable();
  }
}
