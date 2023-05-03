import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
// import { environment } from './../../environments/environment';
import { MessagePayload } from './notification';
import { initializeApp, FirebaseOptions } from 'firebase/app'
import { getMessaging, isSupported, Messaging, onMessage, getToken } from '@angular/fire/messaging'
import { environment } from '../environments/environment';
// pour enregistrer les jetons utilisateurs en base 
import { Firestore, collection, addDoc} from '@angular/fire/firestore';
import { pipe } from "rxjs";


// setBackgroundMessageh

@Injectable({
  providedIn: 'root'
})

export class PushNotificationService {
  messagingFirebase: any;


  constructor(private firestore:Firestore) {
    this.messagingFirebase = getMessaging()
    initializeApp(environment.firebaseConfig)
  }

  requestPermission = () => {
    return new Promise(async (resolve, reject) => {
      const permis = await Notification.requestPermission()
      
      if (permis === "granted") {
        // getToken ne fonctionne plus comme ça aujoud'hui !!!
        // const tokenFirebase = await this.messagingFirebase.getToken();
        const tokenFirebase = await getToken(this.messagingFirebase, { vapidKey: "BOLK9wQoeo2ycP0yK1yTLQG8DlIYM1GnRLe09u3tdnCERUSOwW7iv_QV671oU8Xa4njllE64DbVvHPnrzsgRdpc" })
        resolve(tokenFirebase);
      } else {
        reject(new Error("No se otorgaron los permisos"))
      }
    })    
  }

  // onMessage ne fonctionne plus comme ça aujourd'hui !!! 
  // private messaginObservable = new Observable<MessagePayload>(observe => {
  //   this.messagingFirebase.onMessage((payload:any )=> {
  //     observe.next(payload)
  //   })
  // })
  private messaginObservable = new Observable<MessagePayload>(observe => {
    onMessage(this.messagingFirebase,(payload:any )=> {
      observe.next(payload)
    })
  })

  receiveMessage() {
    return this.messaginObservable;
  }


  // à supposer qu'on cherche à transmettre une liste de jetons pour des sujets spécifiques
  subscribeTokenToTopic(token:string, topic:string) {
    fetch('https://iid.googleapis.com/iid/v1/'+token+'/rel/topics/'+topic, {
      method: 'POST',
      headers: new Headers({
        // 'Authorization': 'key='+fcm_server_key
        'Authorization': 'key='+"509490429297"
      })
    }).then(response => {
      if (response.status < 200 || response.status >= 400) {
        throw 'Error subscribing to topic: '+response.status + ' - ' + response.text();
      }
      console.log('Subscribed to "'+topic+'"');
    }).catch(error => {
      console.error(error);
    })
  }

    // à supposer qu'on cherche à transmettre une liste de jetons pour campagnes générales
    subscribeToken(token:string) {
      fetch('https://iid.googleapis.com/iid/v1/'+token, {
        method: 'POST',
        headers: new Headers({
          // 'Authorization': 'key='+fcm_server_key
          'Authorization': 'key='+"509490429297"
        })
      }).then(response => {
        if (response.status < 200 || response.status >= 400) {
          throw 'Error subscribing to topic: '+response.status + ' - ' + response.text();
        }
        console.log('Subscribed to campaign notitification');
      }).catch(error => {
        console.error(error);
      })
    }

  registerToken(newToken:any){
     // enregistre dans Firestore d'autre part avec un collection trainers qui elle aura de multiples propriétés
     let $tokensRef = collection(this.firestore, "tokens")
     let userTokenNotification = {key:newToken}
     addDoc($tokensRef, userTokenNotification)
     this.subscribeToken(newToken)

  }

  

}

// import { Injectable } from '@angular/core';
// import { Messaging,  } from '@angular/fire/messaging';
// import { BehaviorSubject } from 'rxjs';


// @Injectable({
//   providedIn: 'root'
// })

// export class PushNotificationService {
//   currentMessage = new BehaviorSubject(null);
//   constructor(
//     // private angularFireMessaging: AngularFireMessaging
//     ) {
//     this.angularFireMessaging.onMessage(message=>console.log(message))
//   }

//   // requestPermission() {
//   //   this.angularFireMessaging.requestToken.subscribe(
//   //     (token: any) => {
//   //       console.log(token);
//   //     },
//   //     (err: any) => {
//   //       console.error('Unable to get permission to notify.', err);
//   //     }
//   //   );
//   // }
  
//   receiveMessage() {
//     onMessage(
//       (payload: null) => {
//         console.log("new message received. ", payload);
//         this.currentMessage.next(payload);
//       })
//   }
// }
