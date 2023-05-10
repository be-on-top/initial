import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
// import { environment } from './../../environments/environment';
import { MessagePayload } from './notification';
import { initializeApp, FirebaseOptions } from 'firebase/app'
import { getMessaging, isSupported, Messaging, onMessage, getToken } from '@angular/fire/messaging'
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { environment } from '../environments/environment';
// pour enregistrer les jetons utilisateurs en base 
import { Firestore, collection, addDoc, setDoc, doc, getDoc, DocumentSnapshot} from '@angular/fire/firestore';
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


  // à supposer qu'on cherche à transmettre une liste de jetons pour des sujets spécifiques, j'ai crée un sujet prepa_cdes !!!!!!
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

  // l'enregistrement, si il ne se fait pas directement dans le doc de l'utilisateur doit pouvoir récupérer l'id de l'utilisateur authentifié
    registerToken(newToken:any, id:string){
     // enregistre dans Firestore d'autre part avec un collection trainers qui elle aura de multiples propriétés
     let $tokensRef = collection(this.firestore, "tokens")
     let userTokenNotification = {key:newToken}  
    setDoc(doc($tokensRef, id), userTokenNotification)
    //  this.subscribeToken(newToken)
  }

  // en cours...
  notifyStudent(uid: string) {
    alert("ok")
    if (Notification.permission === "granted") {
      const notification = new Notification("Coucou. Nous avons notifié les élèves concernés !");
      // let studentToken: DocumentSnapshot
      let studentToken: any
      let $tokensRef = collection(this.firestore, "tokens")
      getDoc(doc($tokensRef, uid)).then(value=>{
        studentToken=value
        console.log("studentToken", studentToken)
      })
      
      const payload = {
        notification: {
          title: 'Nouveau formateur affecté',
          body: 'Un nouveau formateur vous a été désigné pour votre suivi pédagogique',
          // icon: '/assets/icon.png',
          click_action: 'https://example.com',
        },
      };
      const options = {
        priority: 'high',
        timeToLive: 60 * 60 * 24, // 1 jour
      };

      getToken( this.messagingFirebase,  { vapidKey: "BOLK9wQoeo2ycP0yK1yTLQG8DlIYM1GnRLe09u3tdnCERUSOwW7iv_QV671oU8Xa4njllE64DbVvHPnrzsgRdpc" })
      // première méthode qui retourne un this.messagingFirebase.send n'est pas une fonction !!!!!! 
      .then((studentToken) => {
        return  this.messagingFirebase.send({ token: studentToken }, payload, options);
      })
      .then((response) => {
        console.log('Notification envoyée avec succès :', response);
      })
      .catch((error) => {
        console.error('Erreur lors de l\'envoi de la notification :', error);
      });

      
    }
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
