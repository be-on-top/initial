import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { addDoc, collection, doc, Firestore, setDoc } from '@angular/fire/firestore';
import { catchError, from, map, Observable, throwError } from 'rxjs';

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
  );
}




  createCenter(center: any) {
    let newCenter = { created: Date.now(), status: true, ...center };
    // enregistre dans Firestore avec un collection centers qui aura de multiples propriétés
    let $centersRef = collection(this.firestore, "centers");
    // addDoc($centersRef, newCenter)

    // Convert addDoc promise to observable
    return from(addDoc($centersRef, newCenter)).pipe(
      map((docRef) => {
        return { id: docRef.id, ...newCenter }; // Return the new center with its id
      }),
      catchError((error) => {
        console.error('Erreur lors de la création du centre:', error);
        return throwError(() => new Error('Erreur d\'enregistrement')); // Return an observable error
      })
    );
  }

  }




