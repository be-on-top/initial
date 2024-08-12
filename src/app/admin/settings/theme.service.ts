import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { NetworkService } from 'src/app/network.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private defaultPrimaryColor = '#007bff'; // Couleur primaire par défaut
  private primaryColor: string = this.defaultPrimaryColor; // Variable privée pour stocker la couleur actuelle

  // pour détecter online et offline
  offline?: boolean

  constructor(private firestore: Firestore, private networkService: NetworkService) {
    // Si on passe par networkService pour une détection plus rapide
    this.offline = !navigator.onLine

    this.loadTheme();  // Chargement du thème au moment de l'initialisation
  }

  // Setter pour définir une nouvelle couleur primaire
  setPrimaryColor(color: string): void {
    this.primaryColor = color;  // Met à jour la variable de couleur
    this.applyTheme();          // Applique la nouvelle couleur
    this.saveTheme();           // Sauvegarde dans localStorage et Firestore
  }

  // Getter pour récupérer la couleur primaire actuelle
  getPrimaryColor(): string {
    return this.primaryColor; // Retourne la couleur actuelle
  }

  // Réinitialise le thème à la couleur par défaut
  resetTheme(): void {
    this.primaryColor = this.defaultPrimaryColor; // Réinitialise à la couleur par défaut
    this.applyTheme();                            // Applique la couleur par défaut
    this.saveTheme();                             // Sauvegarde la couleur par défaut
  }

  // Applique la couleur actuelle au thème
  private applyTheme(): void {
    document.documentElement.style.setProperty('--primary-color', this.primaryColor); // Met à jour le CSS
  }

  // Sauvegarde la couleur dans le localStorage et Firestore
  private saveTheme(): void {
    localStorage.setItem('primaryColor', this.primaryColor); // Sauvegarde dans localStorage

    const themeDoc = doc(this.firestore, 'settings/colors'); // Référence au document Firestore
    setDoc(themeDoc, { primaryColor: this.primaryColor });   // Sauvegarde dans Firestore
  }

  // private loadTheme(): void {
  //   // Charger la couleur primaire sauvegardée
  //   const savedPrimaryColor = localStorage.getItem('primaryColor');

  //   if (savedPrimaryColor) {
  //     this.primaryColor = savedPrimaryColor;
  //   }

  //   this.applyTheme();
  // }

  // Charge le thème depuis Firestore ou utilise la couleur par défaut
  private async loadTheme(): Promise<void> {
    if (this.offline) {
      alert("offline depuis theme service")
      const savedPrimaryColor = localStorage.getItem('primaryColor');
      if (savedPrimaryColor) {
        this.primaryColor = savedPrimaryColor;
      }
    } else {
      const themeDoc = doc(this.firestore, 'settings/colors'); // Référence au document Firestore
      const themeSnap = await getDoc(themeDoc);                // Récupération du document
  
      // Si le document existe, on charge la couleur, sinon on utilise la couleur par défaut
      this.primaryColor = themeSnap.exists() ? themeSnap.data()['primaryColor'] || this.defaultPrimaryColor : this.defaultPrimaryColor;
    }
    this.applyTheme();  // Applique la couleur chargée
  }
}
