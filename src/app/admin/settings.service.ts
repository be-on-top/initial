import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, docData, setDoc, addDoc, doc, where, getDocs, DocumentData } from '@angular/fire/firestore';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { Trade } from './trade';
import { query } from '@angular/animations';
import { Settings } from './settings';

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
    return collectionData(tradesRef, { idField: "id" }) as Observable<Trade[]>;
  }

  async addLevelCursors(cursors: any) {

    console.log(cursors);

    let $cursorsRef = collection(this.firestore, "cursors");
    await addDoc($cursorsRef, cursors).then((response) => {
      console.log(response.id);
    })

  }


  getLevelsCursors() {
    const cursorsRef = collection(this.firestore, "cursors");
    return collectionData(cursorsRef) as Observable<DocumentData>;
  }





}
