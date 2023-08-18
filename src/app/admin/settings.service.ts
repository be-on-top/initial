import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, docData, setDoc, addDoc, query, doc, where, getDocs, DocumentData, getDoc } from '@angular/fire/firestore';
// import { NgForm } from '@angular/forms';
import { Observable, map } from 'rxjs';
import { Trade } from './trade';
import { Settings } from './settings';
import { getMetadata } from '@angular/fire/storage';

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
  async updateTrade(trade: Trade, totalToRegister: number) {

    console.log(trade);
    console.log('trade.totalCP', trade.totalCP);

    trade.totalCP = totalToRegister


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
    const $settingsRef = collection(this.firestore, "settings");
    let $cursorsRef = doc($settingsRef, 'cursors');
    await setDoc($cursorsRef, cursors);
  }

  async addMaximums(maximums: any) {
    const $settingsRef = collection(this.firestore, "settings");
    const $maximumsDocRef = doc($settingsRef, 'maximums')
    await setDoc($maximumsDocRef, maximums)

  }

  // getLevelsCursors() {
  //   const cursorsRef = collection(this.firestore, "cursors")
  //   return collectionData(cursorsRef) as Observable<DocumentData>
  // }

  // si finalement, on enregistre les curseurs dans un doc dédié de la collection settings
  getLevelsCursors() {
    // const settinfsRef = collection(this.firestore, "settings")
    // Référence au document spécifique "maximums" dans la collection "settings"
    const cursorsDocRef = doc(this.firestore, 'settings/cursors')
    return docData(cursorsDocRef) as Observable<DocumentData>
  }

  // si finalement, on enregistre les maximums dan un doc dédié de la collection settings
  getMaximums(){
    // const settinfsRef = collection(this.firestore, "settings")
    const maximumsDocRef = doc(this.firestore, 'settings/maximums')
    return docData(maximumsDocRef) as Observable<DocumentData>
  }

  getSigle(id: string) {
    let $sigleRef = doc(this.firestore, "sigles/" + id)
    return docData($sigleRef, { idField: 'id' }) as Observable<Trade>
  }

  getTradeName(tradeId: string): Observable<string> {
    let $sigleRef = doc(this.firestore, "sigles/" + tradeId);
    return docData($sigleRef, { idField: 'id' }).pipe(map(trade => trade['denomination']));
  }

  getCPName(tradeId: string, cpId:number): Observable<string> {
    console.log(cpId)    
    let $sigleRef = doc(this.firestore, "sigles/" + tradeId)
    return docData($sigleRef, { idField: 'id' }).pipe(map(trade => trade['competences'][cpId]))
  }


}
