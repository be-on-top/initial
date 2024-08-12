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
  offline?: boolean;

  constructor(private firestore: Firestore, private networkService: NetworkService) {
    // Si on passe par networkService pour une détection plus rapide
    this.offline = !navigator.onLine;

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

  // Applique la couleur actuelle au thème, en ajustant aussi la couleur du texte pour le contraste
  private applyTheme(): void {
    const textColor = this.getTextColorBasedOnBackground(this.primaryColor); // Détermine la couleur du texte
    document.documentElement.style.setProperty('--primary-color', this.primaryColor); // Met à jour le CSS
    document.documentElement.style.setProperty('--text-color', textColor); // Applique la couleur du texte
  }

  // Sauvegarde la couleur dans le localStorage et Firestore
  private saveTheme(): void {
    localStorage.setItem('primaryColor', this.primaryColor); // Sauvegarde dans localStorage

    const themeDoc = doc(this.firestore, 'settings/colors'); // Référence au document Firestore
    setDoc(themeDoc, { primaryColor: this.primaryColor });   // Sauvegarde dans Firestore
  }

  // Charge le thème depuis Firestore ou utilise la couleur par défaut
  private async loadTheme(): Promise<void> {
    if (this.offline) {
      alert("offline depuis theme service");
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

  // Calcule la luminance de la couleur pour déterminer le contraste
  private calculateLuminance(hexColor: string): number {
    const r = parseInt(hexColor.substr(1, 2), 16) / 255;
    const g = parseInt(hexColor.substr(3, 2), 16) / 255;
    const b = parseInt(hexColor.substr(5, 2), 16) / 255;

    const a = [r, g, b].map(v => {
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });

    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  // Détermine la couleur du texte en fonction de la luminosité de la couleur de fond
  private getTextColorBasedOnBackground(hexColor: string): string {
    const luminance = this.calculateLuminance(hexColor);
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }
}
