import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TextToSpeechService {

  private apiUrl = 'https://texttospeech.googleapis.com/v1/text:synthesize';
  private apiKey = 'AIzaSyC1JZ5h0pXszJkM-1PbUZXiXI6z436rOLI';  // Remplace par ta clé API ici
  // private apiUrl = 'https://us-central1-be-on-top-beta.cloudfunctions.net/synthesizeSpeech';




  constructor(private http: HttpClient) {}

  public synthesizeSpeech(text: string): Observable<any> {
    const body = {
      input: { text },
      // voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
      "voice": {
        "languageCode": "fr-FR",
        "name": "fr-FR-Wavenet-D"
        
      },
      "audioConfig": {
        "audioEncoding": "MP3",
        "speakingRate": 0.9,  // Légèrement plus lent
        "pitch": 4.0  // Un peu plus aigu
      },

    };

    // avec cloud functions, plus besoin de passer apiKey
    return this.http.post<any>(`${this.apiUrl}?key=${this.apiKey}`, body); // PAS de headers Authorization !
    // return this.http.post<any>(this.apiUrl, body);
  }
}
