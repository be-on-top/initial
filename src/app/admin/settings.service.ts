import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, docData, setDoc, addDoc, doc, where, getDocs, DocumentData, getDoc } from '@angular/fire/firestore';
// import { NgForm } from '@angular/forms';
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


    // // les 2 méthodes fonctionnent très bien.
    let $settingsRef = collection(this.firestore, "sigles");
    // await addDoc($settingsRef, trade).then((response) => {
    //   console.log(response.id);
    // })

    await setDoc(doc($settingsRef, trade.sigle), trade)

    //   .catch((error) => {
    //     const errorCode = error.code;
    //     const errorMessage = error.message;
    //     // ..
    //   });

  }
  async updateTrade(trade: Trade, totalToRegister:number) {

    console.log(trade);
    console.log('trade.totalCP',trade.totalCP);
    
    trade.totalCP=totalToRegister


    // // les 2 méthodes fonctionnent très bien.
    let $settingsRef = collection(this.firestore, "sigles");
    // await addDoc($settingsRef, trade).then((response) => {
    //   console.log(response.id);
    // })

    await setDoc(doc($settingsRef, trade.sigle), trade)

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

  async getDurationsBySigle(sigle: string) {
    const sigleRef = doc(this.firestore, 'sigles', sigle);
    const sigleSnapshot = await getDoc(sigleRef);

    if (sigleSnapshot.exists()) {
      const sigleData = sigleSnapshot.data() as Trade;
      return sigleData['durations'];
    } else {
      throw new Error('Aucun document trouvé avec l\'ID spécifié');
    }
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

  getSigle(id:string){
      let $sigleRef = doc(this.firestore, "sigles/" + id)
      return docData($sigleRef, { idField: 'id' }) as Observable<Trade>;
  }



}
