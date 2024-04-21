import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, docData, setDoc, addDoc, query, doc, where, getDocs, DocumentData, getDoc, updateDoc } from '@angular/fire/firestore';
// import { NgForm } from '@angular/forms';
import { Observable, map, of, tap } from 'rxjs';
import { Trade } from './trade';
import { Settings } from './settings';
// à externaliser vers un service
import {
  deleteObject,
  getDownloadURL,
  ref,
  Storage,
  uploadBytes,
  getMetadata
} from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {


  constructor(private firestore: Firestore, private storage: Storage) {    
  }

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

    console.log('trade récupéré dans updateTrade du service', trade);
    console.log('trade.totalCP', trade.totalCP);

    trade.totalCP = totalToRegister

    let $settingsRef = collection(this.firestore, "sigles");

    await setDoc(doc($settingsRef, trade.sigle), trade)

    //   .catch((error) => {
    //     const errorCode = error.code;
    //     const errorMessage = error.message;
    //     // ..
    //   });

  }

  async updateDescription(trade: Partial<Trade>, tradeId: string) {

    let $settingsRef = collection(this.firestore, "sigles");
    let updateData: Partial<Trade> = {};

    if (trade.description !== undefined) {
      updateData.description = trade.description;
    }


    // ...

    await updateDoc(doc($settingsRef, tradeId), updateData);
  }



  // getTrades() {
  //   const tradesRef = collection(this.firestore, "sigles");
  //   return collectionData(tradesRef, { idField: "id" }) as Observable<Trade[]>;
  // }

  getTrades() {
    const tradesRef = collection(this.firestore, 'sigles');
    const trades$ = collectionData(tradesRef, { idField: 'id' }) as Observable<Trade[]>;

    trades$.subscribe({
      next: (trades) => {
        trades.forEach((trade) => {
          this.saveToIndexedDB(trade.sigle, trade); // Enregistrer chaque sigle dans IndexedDB
        });
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des sigles :', error);
      }
    });

    return trades$; // Retourner l'observable des sigles
  }


  getCompetences(tradeId: string): Observable<string[]> {
    const sigle = tradeId.replace('quizz_', ''); // Pour obtenir la clé correcte dans la collection sigles
    const sigleRef = doc(this.firestore, 'sigles', sigle);

    return docData(sigleRef).pipe(
      // Mappez le résultat pour obtenir directement le tableau de compétences
      // Assurez-vous d'ajuster cette partie en fonction de la structure réelle de vos données
      // Si vos compétences sont stockées différemment, ajustez le map en conséquence.
      map((data: any) => (data && data['competences']) ? data['competences'] : [])
    );
  }

  getDenomination(quizzKey: string): Observable<string | null> {
    console.log('Entrée dans getDenomination avec quizzKey :', quizzKey);

    if (!quizzKey) {
      // Gérer le cas où quizzKey est undefined
      return of(null);
    }

    // const sigle = quizzKey.replace('quizz_', '');
    const sigleRef = doc(this.firestore, 'sigles', quizzKey);

    return docData(sigleRef).pipe(
      tap(data => console.log('data de sigles', data)),  // Ajoutez cette ligne pour afficher les données dans la console
      map((data: any) => (data && data['denomination']) ? data['denomination'] : null)
    );
  }





  // getCPName(tradeId: string, cpId: number): Observable<string> {
  //   console.log(cpId)
  //   let $sigleRef = doc(this.firestore, "sigles/" + tradeId)
  //   return docData($sigleRef, { idField: 'id' }).pipe(map(trade => trade['competences'][cpId]))
  // }

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
  getMaximums() {
    // const settinfsRef = collection(this.firestore, "settings")
    const maximumsDocRef = doc(this.firestore, 'settings/maximums')
    return docData(maximumsDocRef) as Observable<DocumentData>
  }

  getSigle(id: string) {

    

      let sigleRef = doc(this.firestore, "sigles/" + id)
      return docData(sigleRef, { idField: 'id' }) as Observable<Trade>

  


    // const sigleData$ = docData(sigleRef, { idField: 'id' }) as Observable<Trade>;
    // Sauvegarder les données localement une fois qu'elles sont récupérées
    // sigleData$.subscribe((data) => {     
    //   this.saveToIndexedDB(id, data);
    // });
    // return sigleData$.pipe(
    //   tap(data => {
    //     this.saveToIndexedDB(id, data); // Sauvegarder le sigle dans IndexedDB
    //   })
    // );
    // return sigleData$;

   
    

  }

  getTradeName(tradeId: string): Observable<string> {
    let $sigleRef = doc(this.firestore, "sigles/" + tradeId);
    return docData($sigleRef, { idField: 'id' }).pipe(map(trade => trade['denomination']));
  }



  getCPName(tradeId: string, cpId: number): Observable<string> {
    console.log(cpId)
    let $sigleRef = doc(this.firestore, "sigles/" + tradeId)
    return docData($sigleRef, { idField: 'id' }).pipe(map(trade => trade['competences'][cpId]))
  }

  // pour les cover images des métiers
  loadImage(tradeId: string) {
    const imageRef = ref(this.storage, 'images/trades/' + tradeId + '.jpeg');
    return getDownloadURL(imageRef)
  }




  // updateTradeImage(tradeId: string, file: File): Promise<string> {
  //   const imageRef = ref(this.storage, 'images/trades/' + tradeId + '.jpeg');

  //   return deleteObject(imageRef) // Supprime l'ancienne image
  //     .then(() => {
  //       return uploadBytes(imageRef, file); // Télécharge la nouvelle image
  //     })
  //     .then(() => {
  //       return getDownloadURL(imageRef); // Récupère l'URL de la nouvelle image
  //     })
  //     .then((url) => {
  //       // Retourne l'URL de la nouvelle image
  //       return url;
  //     })
  //     .catch((error) => {
  //       console.error("Erreur lors de la mise à jour de l'image", error);
  //       throw error; // Propage l'erreur pour une gestion ultérieure dans le composant
  //     });
  // }

  updateTradeImage(tradeId: string, file: File): Promise<string> {
    const imageRef = ref(this.storage, 'images/trades/' + tradeId + '.jpeg');

    // Vérifie d'abord si l'objet existe
    return getMetadata(imageRef)
      .then((metadata) => {
        // L'ancienne image existe, on la supprime
        return deleteObject(imageRef);
      })
      .catch((error) => {
        // L'ancienne image n'existe pas ou une erreur s'est produite lors de la vérification, on gère l'erreur ici
      })
      .then(() => {
        // Télécharger la nouvelle image
        return uploadBytes(imageRef, file);
      })
      .then(() => {
        // Récupérer l'URL de la nouvelle image
        return getDownloadURL(imageRef);
      })
      .then((url) => {
        // Retourner l'URL de la nouvelle image
        return url;
      })
      .catch((error) => {
        console.error("Erreur lors de la mise à jour de l'image", error);
        throw error; // Propage l'erreur pour une gestion ultérieure dans le composant
      });
  }


  getSigleIds() {
    const siglesCollection = collection(this.firestore, "sigles");

    return getDocs(siglesCollection).then((querySnapshot) => {
      const sigleIds: any = [];
      querySnapshot.forEach((doc) => {
        sigleIds.push(doc.id)
      });
      return sigleIds;
    }).catch((error) => {
      console.error('Erreur lors de la récupération des IDs de documents :', error);
      throw error;
    });
  }


  private async saveToIndexedDB(key: string, data: any): Promise<void> {
    try {
      // Vérifier si indexedDB est pris en charge dans le navigateur
      if (!window.indexedDB) {
        throw new Error('IndexedDB non pris en charge dans ce navigateur');
      }

      // Ouvrir ou créer la base de données IndexedDB
      const dbRequest = window.indexedDB.open('my-database', 2); // Spécifier une version supérieure

      dbRequest.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result; // Accéder à result sur event.target
        db.createObjectStore('sigles', { keyPath: 'id' }); // Créer l'objet store 'sigles'
      };

      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        dbRequest.onsuccess = (event) => {
          const dbResult = (event.target as IDBOpenDBRequest).result; // Accéder à result sur event.target
          if (dbResult) {
            resolve(dbResult);
          } else {
            reject(new Error('Erreur lors de l\'ouverture de la base de données : dbResult est null'));
          }
        };
        dbRequest.onerror = () => reject(dbRequest.error);
      });

      // Ouvrir un objet de transaction en écriture avec l'objet store 'sigles'
      const transaction = db.transaction(['sigles'], 'readwrite');
      const store = transaction.objectStore('sigles');

      // Ajouter les données à l'objet store sans fournir de clé
      // await store.add(data); // Pas besoin de fournir une clé
      store.put(data); // Utiliser put() pour ajouter ou mettre à jour les données

      // Gérer l'événement oncomplete pour fermer la transaction
      transaction.oncomplete = () => {
        // db.close();
        console.log('Transaction terminée avec succès, base de données fermée.');
      };

      console.log('Sigle sauvegardé localement avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du sigle localement :', error);
    }
  }



  async saveAllTradesToIndexedDB() {

    try {
      const trades = await this.getTrades().toPromise(); // Récupérer tous les sigles

      // Vérifier si indexedDB est pris en charge dans le navigateur
      if (!window.indexedDB) {
        throw new Error('IndexedDB non pris en charge dans ce navigateur');
      }

      // Ouvrir la base de données IndexedDB
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const dbRequest = window.indexedDB.open('my-fullTradesDataBase', 2); // Spécifier une version supérieure
        dbRequest.onsuccess = (event) => {
          const dbResult = (event.target as IDBOpenDBRequest).result;
          resolve(dbResult);
        };
        dbRequest.onerror = () => reject(dbRequest.error);
      });

      // Ouvrir un objet de transaction en écriture
      const transaction = db.transaction('sigles', 'readwrite');
      const store = transaction.objectStore('sigles');

      // Ajouter chaque sigle à l'objet store
      trades?.forEach(async (trade: any) => {
        await store.add(trade); // Ajouter le sigle
      });

      // Gérer l'événement oncomplete pour fermer la transaction
      transaction.oncomplete = () => {
        db.close();
        console.log('Tous les sigles ont été sauvegardés localement avec succès !');
      };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des sigles localement :', error);
    }
  }






}





