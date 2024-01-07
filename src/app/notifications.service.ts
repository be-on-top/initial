// notification.service.ts

import { Injectable } from '@angular/core';
import { getMessaging, getToken, onMessage, MessagePayload } from '@angular/fire/messaging';
import { initializeApp } from 'firebase/app';
import { environment } from '../environments/environment';
import { Firestore, collection, setDoc, doc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private messagingFirebase: any;

  constructor(private firestore: Firestore) {
    this.messagingFirebase = getMessaging();
    initializeApp(environment.firebaseConfig);
  }

  private messagingObservable = new Observable<MessagePayload>((observer) => {
    onMessage(this.messagingFirebase, (payload: any) => {
      observer.next(payload);
    });
  });

  receiveMessage(): Observable<MessagePayload> {
    return this.messagingObservable;
  }

  requestPermissionAndRegisterToken(userId: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          // const token = await getToken(this.messagingFirebase, { vapidKey: "BOLK9wQoeo2ycP0yK1yTLQG8DlIYM1GnRLe09u3tdnCERUSOwW7iv_QV671oU8Xa4njllE64DbVvHPnrzsgRdpc" });
          const token = await getToken(this.messagingFirebase, { vapidKey: "BHjK2aDZ7AUCJ2hc7y_bNvXSk7XFrW23Uq2mfl28Rp2GijVJ" });
          const notification = new Notification("Coucou, vous avez déjà demandé à être notifié. Votre demande a été prise en compte !!!");

          this.registerToken(token, userId);

          resolve(token);
        } else {
          reject(new Error("Permission not granted"));
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  private registerToken(newToken: string, userId: string): void {
    console.log(`Enregistrement du token ${newToken} pour l'utilisateur ${userId}`);
    const $tokensRef = collection(this.firestore, "tokens");
    const userTokenNotification = { key: newToken };
    setDoc(doc($tokensRef, userId), userTokenNotification);
  }
}
