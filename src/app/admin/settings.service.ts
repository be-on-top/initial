import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, docData, setDoc, addDoc, doc } from '@angular/fire/firestore';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { Trade } from './trade';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor(private firestore: Firestore) { }

  async addTrade(trade: Trade) {

    console.log(trade);
    

    // // les 2 méthodes fonctionnent très bien. mais je ne sais si vaut mieux pas le add avec un id aléatoire...
    let $settingsRef = collection(this.firestore, "sigles");
    await addDoc($settingsRef, trade).then((response) => {
      console.log(response.id);
    })

    //   // await setDoc(doc($settingsRef, trade.sigle), trade)

    //   .catch((error) => {
    //     const errorCode = error.code;
    //     const errorMessage = error.message;
    //     // ..
    //   });

  }

  
  getTrades() {
    const tradesRef = collection(this.firestore, "sigles");
    return collectionData(tradesRef, {idField:"id"}) as Observable<Trade[]>;
  }

}
