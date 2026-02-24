import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InnovationAwardService {

  private storageKey = 'innovation-award-2026';

  shouldDisplay(): boolean {

    const alreadySeen = localStorage.getItem(this.storageKey);
    const now = new Date();
    const endDate = new Date('2026-06-01');

    return !alreadySeen && now < endDate;
  }

  markAsSeen(): void {
    localStorage.setItem(this.storageKey, 'true');
  }

}