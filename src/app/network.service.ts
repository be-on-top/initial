import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  // BehaviorSubject est utilisé pour maintenir et émettre l'état de connexion (en ligne/hors ligne)
  // BehaviorSubject est un type spécial de Subject qui nécessite une valeur initiale et 
  // émet toujours la dernière valeur à ses abonnés dès qu'ils s'abonnent.
  private onlineStatus: BehaviorSubject<boolean>;

  constructor() {
    // Initialiser onlineStatus avec l'état actuel de la connexion réseau
    this.onlineStatus = new BehaviorSubject<boolean>(navigator.onLine);

    // Ajouter des écouteurs d'événements pour les changements de statut de connexion
    window.addEventListener('online', () => this.updateOnlineStatus(true));
    window.addEventListener('offline', () => this.updateOnlineStatus(false));
  }

  // Méthode privée pour mettre à jour le statut de connexion
  private updateOnlineStatus(status: boolean) {
    this.onlineStatus.next(status);
  }

  // Méthode pour obtenir un Observable de l'état de connexion
  // Cela permet aux composants de s'abonner aux changements de statut de connexion
  getOnlineStatus(): Observable<boolean> {
    return this.onlineStatus.asObservable();
  }


}
