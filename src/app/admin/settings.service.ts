import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, docData, setDoc, addDoc, query, doc, where, getDocs, DocumentData, getDoc, updateDoc, documentId } from '@angular/fire/firestore';
// import { NgForm } from '@angular/forms';
import { Observable, from, map, of, tap } from 'rxjs';
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
import { Partner } from './partner';
import { orderBy } from 'firebase/firestore';

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

  // Méthode pour récupérer uniquement la propriété 'denomination' des métiers avec status=true
  // getTradeDenominationsWithStatusTrue(): Observable<string[]> {
  //   const tradesRef = collection(this.firestore, 'sigles');
  //   const statusQuery = query(tradesRef, where('status', '==', true));

  //   return from(getDocs(statusQuery)).pipe(
  //     map((querySnapshot) => {
  //       const denominations: string[] = [];
  //       querySnapshot.forEach((doc) => {
  //         denominations.push(doc.data()["denomination"]);
  //       });
  //       return denominations;
  //     })
  //   );
  // }

  // Méthode pour récupérer tous les métiers avec status=true
  getTradesWithStatusTrue(): Observable<Trade[]> {
    const tradesRef = collection(this.firestore, 'sigles');
    
    const statusQuery = query(tradesRef, where('status', '==', true));

    return from(getDocs(statusQuery)).pipe(
      map((querySnapshot) => {
        const trades: Trade[] = [];
        querySnapshot.forEach((doc) => {
          trades.push(doc.data() as Trade);
        });
        return trades.reverse();

      })
    );
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

  partners: any[] = []
  // async addPartners(partner: Partner) {
  //   this.partners=[partner, ...this.partners]
  //   const $settingsRef = collection(this.firestore, "settings");
  //   const $partnersDocRef = doc($settingsRef, 'partners')
  //   await setDoc($partnersDocRef, { partners: this.partners }, { merge: true });

  // }

  // Méthode pour ajouter des partenaires
  addPartners(partners: any[]): Observable<void> {
    const $settingsRef = collection(this.firestore, 'settings');
    const $partnersDocRef = doc($settingsRef, 'partners');
    return from(setDoc($partnersDocRef, { partners: partners }, { merge: true }));
  }

  // Méthode pour récupérer les partenaires
  fetchPartners(): Observable<Partner[]> {
    const $settingsRef = collection(this.firestore, 'settings');
    const $partnersDocRef = doc($settingsRef, 'partners');
    return from(getDoc($partnersDocRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return docSnap.data()['partners'] || [];
        } else {
          return [];
        }
      })
    );
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

  // // pour les cover images des métiers initiale qu'on peut conserver pour le cas de la home page en la renommant loadImage+Reduced
  loadImageReduced(tradeId: string) {
    const imageRef = ref(this.storage, 'images/trades/' + tradeId + '_resized.jpeg');
    return getDownloadURL(imageRef)
  }
  loadFullImage(tradeId: string) {
    const imageRef = ref(this.storage, 'images/trades/' + tradeId);
    return getDownloadURL(imageRef)
  }

  // pour les cover images des métiers si 2 versions attention !!!!
  loadImage(tradeId: string): Promise<{ originalUrl: string, resizedUrl: string }> {
    const originalImageRef = ref(this.storage, 'images/trades/' + tradeId + '.jpeg');
    const resizedImageRef = ref(this.storage, 'images/trades/' + tradeId + '_resized.jpeg');

    const originalImageUrl = getDownloadURL(originalImageRef);
    const resizedImageUrl = getDownloadURL(resizedImageRef);

    return Promise.all([originalImageUrl, resizedImageUrl]).then(([originalUrl, resizedUrl]) => {
      return { originalUrl, resizedUrl };
    });
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

  // updateTradeImage(tradeId: string, file: File): Promise<string> {
  //   const imageRef = ref(this.storage, 'images/trades/' + tradeId + '.jpeg');

  //   // Vérifie d'abord si l'objet existe
  //   return getMetadata(imageRef)
  //     .then((metadata) => {
  //       // L'ancienne image existe, on la supprime
  //       return deleteObject(imageRef);
  //     })
  //     .catch((error) => {
  //       // L'ancienne image n'existe pas ou une erreur s'est produite lors de la vérification, on gère l'erreur ici
  //     })
  //     .then(() => {
  //       // Télécharger la nouvelle image
  //       return uploadBytes(imageRef, file);
  //     })
  //     .then(() => {
  //       // Récupérer l'URL de la nouvelle image
  //       return getDownloadURL(imageRef);
  //     })
  //     .then((url) => {
  //       // Retourner l'URL de la nouvelle image
  //       return url;
  //     })
  //     .catch((error) => {
  //       console.error("Erreur lors de la mise à jour de l'image", error);
  //       throw error; // Propage l'erreur pour une gestion ultérieure dans le composant
  //     });
  // }

  async updateTradeImage(tradeId: string, file: File): Promise<string[]> {
    // Référence de l'image d'origine
    const originalImageRef = ref(this.storage, 'images/trades/' + tradeId + '.jpeg');
    // Référence de la version redimensionnée de l'image
    const resizedImageRef = ref(this.storage, 'images/trades/' + tradeId + '_resized.jpeg');

    try {
      // Obtenir la largeur de l'image
      const width = await this.getImageWidth(file);

      // Redimensionner l'image d'origine en divisant sa largeur par deux
      const resizedFile = await this.resizeImage(file, width / 2);

      // Enregistrer l'image d'origine
      await uploadBytes(originalImageRef, file);

      // Enregistrer la version redimensionnée de l'image
      await uploadBytes(resizedImageRef, resizedFile);

      // Récupérer les URLs des deux versions de l'image
      const originalImageUrl = await getDownloadURL(originalImageRef);
      const resizedImageUrl = await getDownloadURL(resizedImageRef);

      return [originalImageUrl, resizedImageUrl];
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'image", error);
      throw error;
    }
  }

  private async getImageWidth(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image.width);
      image.onerror = () => reject(new Error("Impossible de charger l'image"));
      image.src = URL.createObjectURL(file);
    });
  }


  private async resizeImage(file: File, newWidth: number): Promise<Blob> {
    // Utiliser l'API Canvas pour redimensionner l'image
    const image = new Image();
    image.src = URL.createObjectURL(file);
    await new Promise(resolve => { image.onload = resolve });

    const canvas = document.createElement('canvas');
    canvas.width = newWidth;
    canvas.height = image.height * (newWidth / image.width);

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Convertir le canvas en Blob avec le type MIME 'image/jpeg' et une qualité de 0.9
    return new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/jpeg', 0.9);
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





