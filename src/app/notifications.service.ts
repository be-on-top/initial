// notification.service.ts

import { Injectable } from '@angular/core';
import { getMessaging, getToken, onMessage, MessagePayload, Messaging } from '@angular/fire/messaging';
import { Firestore, collection, setDoc, doc } from '@angular/fire/firestore';
import { catchError, from, map, Observable, of } from 'rxjs';
// import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private messagingFirebase: Messaging;

  constructor(private firestore: Firestore) {
    this.messagingFirebase = getMessaging(); // AngularFire gère l'init
  }

  receiveMessage(): Observable<MessagePayload> {
    return new Observable((observer) => {
      onMessage(this.messagingFirebase, (payload: MessagePayload) => {
        observer.next(payload);
      });
    });
  }

  async requestPermissionAndRegisterToken(userId: string): Promise<string> {
    try {
      const permission = await Notification.requestPermission();
      localStorage.setItem('notification-permission', permission);

      if (permission !== 'granted') {
        throw new Error('Permission not granted');
      }

      const token = await getToken(this.messagingFirebase, {
        vapidKey: 'BIh4nZeNhn8JfEciZJvgFL96Qd7uVzfZTmaoUp2RFb65SA2Lk2jvujAtmEkttGR5OtyTRIj2_FS49k5mPLl6HsM', // ← à sécuriser côté backend
      });

      new Notification('Coucou ! Votre inscription aux notifications est bien prise en compte !');

      this.registerToken(token, userId);

      return token;
    } catch (error) {
      console.error('Erreur de permission/FCM :', error);
      throw error;
    }
  }

  private registerToken(newToken: string, userId: string): void {
    const $tokensRef = collection(this.firestore, 'tokens');
    const userTokenNotification = { key: newToken };

    setDoc(doc($tokensRef, userId), userTokenNotification);
  }

// isServiceWorkerReady$(): Observable<boolean> {
//   return new Observable(observer => {
//     if (!('serviceWorker' in navigator)) {
//       observer.next(false);
//       observer.complete();
//       return;
//     }

//     navigator.serviceWorker.ready
//       .then(() => {
//         observer.next(true);
//         observer.complete();
//       })
//       .catch((err) => {
//         console.warn('Erreur Service Worker ready :', err);
//         observer.next(false);
//         observer.complete();
//       });
//   });
// }

isServiceWorkerReady$(): Observable<boolean> {
  if (!('serviceWorker' in navigator)) {
    return of(false);
  }

  return from(navigator.serviceWorker.ready).pipe(
    map(() => true),
    catchError((err) => {
      console.warn('Erreur Service Worker ready :', err);
      return of(false);
    })
  );
}



}
