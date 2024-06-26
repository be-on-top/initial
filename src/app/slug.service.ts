import { Injectable } from '@angular/core';
import { Firestore, collection, doc, DocumentReference, getDoc, getDocs } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SlugService {

  constructor(private firestore: Firestore) { }

  // Méthode pour récupérer la dénomination à partir de l'ID du document
  // getDenominationFromId(id: string): Observable<string | null> {
  //   const sigleRef: DocumentReference = doc(this.firestore, 'sigles', id);

  //   return new Observable<string | null>(observer => {
  //     getDoc(sigleRef).then(docSnapshot => {
  //       if (docSnapshot.exists()) {
  //         const data = docSnapshot.data();
  //         const denomination = data['denomination'];
  //         observer.next(denomination);
  //       } else {
  //         observer.next(null);
  //         console.log(`No such document with ID ${id}`);
  //       }
  //     }).catch(error => {
  //       observer.error(error);
  //     });
  //   });
  // }

  // Méthode pour générer un slug à partir d'une dénomination
  generateSlug(denomination: string): string {
    const accentsMap = new Map([
      ['á', 'a'], ['à', 'a'], ['â', 'a'], ['ä', 'a'], ['ã', 'a'], ['å', 'a'],
      ['é', 'e'], ['è', 'e'], ['ê', 'e'], ['ë', 'e'],
      ['í', 'i'], ['ì', 'i'], ['î', 'i'], ['ï', 'i'],
      ['ó', 'o'], ['ò', 'o'], ['ô', 'o'], ['ö', 'o'], ['õ', 'o'],
      ['ú', 'u'], ['ù', 'u'], ['û', 'u'], ['ü', 'u'],
      ['ý', 'y'], ['ÿ', 'y'],
      ['ç', 'c'], ['ñ', 'n']
    ]);

    let slug = denomination
      .toLowerCase()
      .split('')
      .map(char => accentsMap.get(char) || char)
      .join('')
      .replace(/[^a-z0-9_]+/g, '_');

    return slug;
  }
  
}
