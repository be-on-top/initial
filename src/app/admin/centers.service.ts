import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CentersService {
  // private dataUrl = '/assets/postal_codes.json'; // Chemin vers le fichier JSON
  private dataUrl = "https://unpkg.com/codes-postaux@4.1.0/codes-postaux-full.json"

  constructor(private http: HttpClient) { }

  getCitiesByPostalCode(cp: string): Observable<string[]> {

    return this.http.get<{ [key: string]: string[] }>(this.dataUrl).pipe(
      map(data => data[cp] || [])
    );
  }


}
