import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, docData, docSnapshots, Firestore, getDocs, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { catchError, from, map, Observable, throwError } from 'rxjs';
import { Centers } from './centers';

// Définition de l'interface pour les villes
interface City {
  insee_code: string;
  city_code: string;
  zip_code: string;
  label: string;
  latitude: string;
  longitude: string;
  department_name: string;
  department_number: string;
  region_name: string;
  region_geojson_name: string;
}

@Injectable({
  providedIn: 'root'
})



export class CentersService {
  // private dataUrl = '/assets/postal_codes.json'; // Chemin vers le fichier JSON
  // private dataUrl = "https://unpkg.com/codes-postaux@4.1.0/codes-postaux-full.json"

  private dataUrl = '/assets/cities.json'


  constructor(private http: HttpClient, private firestore: Firestore) { }

  // getCitiesByPostalCode(cp: string): Observable<string[]> {

  //   return this.http.get<{ [key: string]: string[] }>(this.dataUrl).pipe(
  //     map(data => data[cp] || [])
  //   )

  // }

  // Si on utilise la source du gouvernement (cities.json)
  getCitiesByPostalCode(postalCode: string): Observable<City[]> {
    return this.http.get<{ cities: City[] }>(this.dataUrl).pipe(
      map(response => {
        // Filtrer les villes par code postal complet
        const matchedCities = response.cities.filter(city => city.zip_code === postalCode);
        return matchedCities;
      })
    )
  }



  // Récupère les villes par code postal partiel
  // getCitiesByPartialPostalCode(partialPostalCode: string): Observable<City[]> {
  //   return this.http.get<{ cities: City[] }>(this.dataUrl).pipe(
  //     map(response => {
  //       // Filtrer les villes par le code postal partiel
  //       const matchedCities = response.cities.filter(city => city.zip_code.startsWith(partialPostalCode));
  //       console.log(matchedCities); // trop nombreux résultats

  //       return matchedCities;
  //     })
  //   );
  // }
  //   getCitiesByPartialPostalCode(partialPostalCode: string): Observable<City[]> {
  //     return this.http.get<{ cities: City[] }>(this.dataUrl).pipe(
  //       map(response => {
  //         // Expression régulière pour correspondre exactement au préfixe avec une certaine longueur
  //         const regex = new RegExp(`^${partialPostalCode}\\d{0,2}$`); 

  //         const matchedCities = response.cities.filter(city => {
  //           const isMatch = regex.test(city.zip_code);
  //           const isValidLength = partialPostalCode.length >= 3;
  //           return isMatch && isValidLength;
  //         });

  //         console.log(matchedCities);
  //         return matchedCities;
  //       })
  //     );
  // }

  // fonctionne très bien mais est difficilement lisible (l'intention n'est pas lisible)
  // getCitiesByPartialPostalCode(partialPostalCode: string): Observable<City[]> {
  //   return this.http.get<{ cities: City[] }>(this.dataUrl).pipe(
  //     map(response => {
  //       // Filtrer les villes par le code postal partiel
  //       const matchedCities = response.cities.filter(city => {
  //         const isExactMatch = city.zip_code.indexOf(partialPostalCode) === 0;
  //         return isExactMatch && partialPostalCode.length >= 3;
  //       });

  //       // Filtrer les doublons
  //       const uniqueCities = matchedCities.filter((city, index, self) => 
  //         index === self.findIndex((c) => (
  //           c.zip_code === city.zip_code && c.label === city.label
  //         ))
  //       );

  //       console.log(uniqueCities); // Résultats filtrés et dédupliqués
  //       return uniqueCities;
  //     })
  //   );
  // }

  getCitiesByPartialPostalCode(partialPostalCode: string): Observable<City[]> {
    return this.http.get<{ cities: City[] }>(this.dataUrl).pipe(
      map(response => {
        const matchedCities = response.cities.filter(city => {
          // Utilisation de startsWith pour vérifier si le code postal commence par le code partiel
          const isExactMatch = city.zip_code.startsWith(partialPostalCode);
          // Limite la recherche aux codes postaux partiels de 3 caractères ou plus
          return isExactMatch && partialPostalCode.length >= 3;
        });

        // Filtrer les doublons par code postal et label
        const uniqueCities = matchedCities.filter((city, index, self) =>
          index === self.findIndex((c) => (
            c.zip_code === city.zip_code && c.label === city.label
          ))
        );

        console.log(uniqueCities); // Résultats filtrés et dédupliqués
        return uniqueCities;
      })
    )
    
  }


  getCenter(id: string) {
    let $centerRef = doc(this.firestore, "centers/" + id)
    return docData($centerRef, { idField: 'id' }) as Observable<Centers>

  }



  createCenter(center: Centers) {
    let newCenter = { 
      created: Date.now(), 
      status: true, 
      name: center.name, 
      address: center.address, 
      cp: center.cp, 
      city: center.city, 
      sigles: center.sigles // Utilisez directement center.sigles
    };
  
    // Enregistre dans Firestore avec une collection centers qui aura de multiples propriétés
    let $centersRef = collection(this.firestore, "centers");
  
    // Convertit la promesse addDoc en observable
    return from(addDoc($centersRef, newCenter)).pipe(
      map((docRef) => {
        return { id: docRef.id, ...newCenter }; // Retourne le nouveau centre avec son id
      }),
      catchError((error) => {
        console.error('Erreur lors de la création du centre:', error);
        return throwError(() => new Error('Erreur d\'enregistrement')); // Retourne une erreur observable
      })
    );
  }
  

  /**
     * Récupère les informations de localisation (latitude et longitude) pour un code postal donné.
     * 
     * @param postalCode Le code postal à rechercher.
     * @returns Un Observable contenant les informations de localisation ou null si aucune correspondance n'est trouvée.
     */
  getLocalisation(postalCode: string): Observable<{ latitude: string, longitude: string } | null> {
    return this.http.get<{ cities: City[] }>(this.dataUrl).pipe(
      map(response => {
        // Recherche la première ville qui correspond au code postal
        const city = response.cities.find(city => city.zip_code === postalCode);

        // Retourne les coordonnées de la ville trouvée ou null si aucune ville n'est trouvée
        return city ? { latitude: city.latitude, longitude: city.longitude } : null;
      })
    )

  }


  getCenters() {
    let $centersRef = collection(this.firestore, "centers");
    return collectionData($centersRef, { idField: "id" }) as Observable<Centers[]>
  }

  // deleteCenter(id: any) {
  //   let $centerRef = doc(this.firestore, "centers/" + id)
  //   deleteDoc($centerRef)

  // }
  deleteCenter(centerId: string): Promise<void> {
    const centerRef = doc(this.firestore, 'centers', centerId);
    return deleteDoc(centerRef); // Supprime le document et renvoie une promesse
  }
  

  async getDocsByParam(sigle: string): Promise<any[]> {
    console.log('Sigle recherché:', sigle); // Vérifie ce qui est passé comme sigle
    // Crée une référence à la collection et une requête avec le paramètre array-contains
    const myData = query(collection(this.firestore, 'centers'), where('sigles', 'array-contains', sigle));
    const querySnapshot = await getDocs(myData);
    console.log('querySnapshot',querySnapshot);
    
  
    // Initialise un tableau pour stocker les documents
    const results: any[] = [];
    
    // Itère sur les documents retournés par la requête
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() }); // Stocke chaque document dans le tableau
    });
  
    return results; // Retourne le tableau des résultats
  }


  // Méthode pour mettre à jour un centre existant
updateCenter(id: string, updatedCenter: Partial<Centers>) {
  
  // Référence au document Firestore correspondant à l'ID du centre à mettre à jour
  const docRef = doc(this.firestore, `centers/${id}`);
  
  // Exécute la mise à jour du document dans Firestore
  return from(updateDoc(docRef, updatedCenter)).pipe(
    
    // Retourne l'objet mis à jour avec son ID
    // Notez que `updatedCenter` contient les champs modifiés du centre,
    // combinés ici avec l'ID pour former un objet complet
    map(() => ({ id, ...updatedCenter })),  
    
    // Gestion des erreurs : en cas d'échec de la mise à jour, une erreur est capturée et retournée
    catchError((error) => {
      console.error('Erreur lors de la mise à jour du centre:', error);
      return throwError(() => new Error('Erreur lors de la mise à jour'));
    })
  );
}

  

}






