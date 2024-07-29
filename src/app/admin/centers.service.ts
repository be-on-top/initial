import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

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

  private dataUrl= '/assets/cities.json'


  constructor(private http: HttpClient) { }

  // getCitiesByPostalCode(cp: string): Observable<string[]> {

  //   return this.http.get<{ [key: string]: string[] }>(this.dataUrl).pipe(
  //     map(data => data[cp] || [])
  //   )

  // }

  // Si on utilise la source du gouvernement (cities.json)
   getCitiesByPostalCode(postalCode: string): Observable<City[]> {
    return this.http.get<{ cities: City[] }>(this.dataUrl).pipe(
      map(response => {
        // Filtrer les villes par code postal
        const matchedCities = response.cities.filter(city => city.zip_code === postalCode);
        return matchedCities;
      })
    )
  }



}
